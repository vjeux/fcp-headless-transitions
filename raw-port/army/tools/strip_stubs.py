#!/usr/bin/env python3
"""strip_stubs.py — delete methods/functions whose ENTIRE body is an incompleteness throw-stub,
plus their leading JSDoc/line comments, so the placeholders don't confuse the engine.

WHAT IT DELETES (all three must hold for a definition):
  1. It is a function/method definition: `export function NAME(...)`, a top-level `function NAME(...)`,
     or a class method `NAME(...) {` / `static NAME(...) {` / `get NAME()` etc.
  2. Its body — the statements between the top-level { } — is ONLY a `throw new Error(...)` (possibly
     spanning several lines), with no other executable statement.
  3. The throw message carries an INCOMPLETENESS phrase (not yet transcribed / unimplemented /
     frontier callee / undecoded / pending transcription / not yet decoded|ported|materialized|wired).
  Its immediately-preceding comment block (contiguous // lines or a /** ... */ JSDoc) is removed too.

WHAT IT KEEPS (never deleted):
  - ud2-trap ports: the throw message says "ud2 trap" / "must not be invoked" — a FAITHFUL port of a
    real trap, not a placeholder. (No incompleteness phrase => kept.)
  - runtime guards inside real bodies: "called before ctor", "index out of range", etc. (No
    incompleteness phrase, and the body has other statements => kept.)
  - any function with real work before/after the throw (body is not throw-only => kept).
  - throwing helper stubs referenced by KEPT code? -> see --check-refs: by default we DO delete them,
    but we warn if a deleted symbol is still imported/called elsewhere (that call was itself a stub or
    will now fail to compile — the gate/tsgo will catch it; strip is meant to run on a from-scratch
    regen, not to silently break live imports).

USAGE:
  strip_stubs.py [paths...]                dry-run over given files (default: all raw-port/src/*.ts)
  strip_stubs.py --apply [paths...]        actually rewrite the files
  strip_stubs.py --check-refs [--apply]    also report deleted symbols still referenced elsewhere
Report lists every deletion with file:line and the symbol removed. Exit 0.
"""
import sys, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
SRC  = os.path.join(ROOT, "src")

INCOMPLETE = re.compile(
    r'not yet (?:transcribed|ported|decoded|implemented|materialized|wired|transcri)'
    r'|not (?:transcribed|decoded)'
    r'|pending transcription'
    r'|deferred stub'
    r'|un-?transcribed'
    r'|\bundecoded\b'
    r'|\bunimplemented\b'
    r'|\bunimpl\b'
    r'|frontier callee'
    r'|stub not', re.I)
# a definition header we recognize (captures the name). Covers export/free function + class methods.
DEF = re.compile(
    r'^(?P<indent>[ \t]*)'
    r'(?P<head>'
      r'(?:export\s+)?(?:async\s+)?function\s+(?P<fname>\w+)\s*'          # function NAME
      r'|(?:public\s+|private\s+|protected\s+|static\s+|readonly\s+|override\s+)*'
      r'(?:get\s+|set\s+)?(?P<mname>\w+)\s*'                              # class method NAME
    r')\(', re.M
)

# ─────────────────────────────────────────────────────────────────────────────
# BATCH brace-context scan (one linear pass for a whole file).
#
# WHY: `_structural_depth` and `_enclosing_brace_is_class` each re-walk the file
# FROM CHARACTER 0 to the position asked about. Called once per method def — as
# mark_stub_bodies does — that is quadratic in file size. Measured over
# raw-port/src: 18,942 defs across 27.7M chars cost 0.73 BILLION char-steps,
# a 27x amplification over a single linear pass, and 95 of mark_ported's 142
# seconds. `_scan_brace_context` answers every position in ONE pass.
#
# It is deliberately a SEPARATE function rather than a rewrite of the two
# originals: they are used elsewhere and their behaviour is the reference this
# is tested against (verifier/test_brace_context.py asserts the two agree on
# every def in every file of the corpus).
# ─────────────────────────────────────────────────────────────────────────────
def _scan_brace_context(text, positions):
    """[(depth, enclosing_brace_is_class)] for each pos in `positions` (any order).

    Semantics are IDENTICAL to calling `_structural_depth(text, pos)` and
    `_enclosing_brace_is_class(text, pos)` for each pos — including the quirk
    that a string or comment straddling `pos` is skipped whole (harmless: depth
    never changes inside one), and that `depth` is a counter which may go
    negative on unbalanced input while the brace STACK only pops when non-empty.
    """
    order = sorted(range(len(positions)), key=lambda k: positions[k])
    out = [None] * len(positions)
    k = 0                      # next index into `order` awaiting an answer
    depth = 0; stack = []      # counter and open-brace positions, as the originals keep them
    class_cache = {}           # open_pos -> bool, so one class body is judged once, not once per method

    def _is_class_open(open_pos):
        v = class_cache.get(open_pos)
        if v is None:
            v = _brace_opens_class(text, open_pos)
            class_cache[open_pos] = v
        return v

    i = 0; n = len(text)
    while k < len(order):
        # answer every position we have already passed
        while k < len(order) and positions[order[k]] <= i:
            idx = order[k]
            out[idx] = (depth, _is_class_open(stack[-1]) if stack else False)
            k += 1
        if k >= len(order) or i >= n:
            break
        c = text[i]
        if c == '"' or c == "'" or c == '`':
            q = c; i += 1
            while i < n and text[i] != q:
                if text[i] == '\\': i += 1
                i += 1
            i += 1
        elif c == '/' and i+1 < n and text[i+1] == '/':
            while i < n and text[i] != '\n': i += 1
        elif c == '/' and i+1 < n and text[i+1] == '*':
            i += 2
            while i+1 < n and not (text[i]=='*' and text[i+1]=='/'): i += 1
            i += 2
        elif c == '{':
            depth += 1; stack.append(i); i += 1
        elif c == '}':
            depth -= 1
            if stack: stack.pop()
            i += 1
        else:
            i += 1
    # positions at or past EOF
    while k < len(order):
        idx = order[k]
        out[idx] = (depth, _is_class_open(stack[-1]) if stack else False)
        k += 1
    return out


def _brace_opens_class(text, open_pos):
    """Was the `{` at open_pos opened by a class body (vs an object literal / Proxy handler)?

    A DELIBERATE SECOND COPY of the judgement in `_enclosing_brace_is_class`, which still
    carries its own inline version. (An earlier note here claimed the two SHARE one copy; they
    do not, and describing the tree wrongly is how the next person "tidies up" the thing that
    makes the test work.) The duplication is the point: `verifier/test_brace_context.py`
    compares the batch scanner against the per-def originals, so folding them onto one
    implementation would make the is-class half of that comparison tautological. Keep them
    separate, and let LAYER 2d catch any drift.
    """
    pre = text[max(0, open_pos-800):open_pos]
    pre = re.sub(r'/\*.*?\*/', ' ', pre, flags=re.S)
    pre = re.sub(r'//[^\n]*', ' ', pre)
    pre = pre.rstrip()
    if re.search(r'\bclass\s+\w+[^{};()=,]*$', pre):
        return True
    if re.search(r'\b(?:extends|implements)\s+[\w.,<>\s]+$', pre):
        return True
    return False


def _match_brace(text, open_idx):
    """Return index just past the matching } for the { at open_idx, honoring strings/comments."""
    depth = 0; i = open_idx; n = len(text)
    while i < n:
        c = text[i]
        if c == '"' or c == "'" or c == '`':
            q = c; i += 1
            while i < n and text[i] != q:
                if text[i] == '\\': i += 1
                i += 1
        elif c == '/' and i+1 < n and text[i+1] == '/':
            while i < n and text[i] != '\n': i += 1
        elif c == '/' and i+1 < n and text[i+1] == '*':
            i += 2
            while i+1 < n and not (text[i]=='*' and text[i+1]=='/'): i += 1
            i += 1
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return i+1
        i += 1
    return -1

def _body_is_incomplete_throw(body):
    """body = text between the outer { }. True iff its only statement(s) are a throw new Error(...)
    whose message has an incompleteness phrase, and nothing else executable."""
    # strip comments
    b = re.sub(r'/\*.*?\*/', '', body, flags=re.S)
    b = re.sub(r'//[^\n]*', '', b)
    b = b.strip()
    if not b.startswith('throw'):
        return False
    # must be a single throw statement covering the whole body (no trailing statements)
    # find the end of the throw statement (its terminating ; at depth 0)
    if not INCOMPLETE.search(body):
        return False
    # ensure nothing after the throw's closing ); besides whitespace
    # crude: the body, comments stripped, must match `throw ... ;` with nothing after
    m = re.match(r'throw\b.*?;\s*$', b, flags=re.S)
    return bool(m)

def _preceding_comment_start(text, def_start):
    """Walk backwards from a definition's line start over a contiguous comment block (// lines or a
    /** */ JSDoc) and blank lines, return the index where the comment block begins."""
    # index of line start for def_start
    ls = text.rfind('\n', 0, def_start) + 1
    i = ls
    # collect preceding lines
    while True:
        prev_end = i - 1                    # the '\n' before line i
        if prev_end < 0: break
        prev_ls = text.rfind('\n', 0, prev_end) + 1
        line = text[prev_ls:prev_end].strip() if prev_end>prev_ls else text[prev_ls:i-1].strip()
        line = text[prev_ls:i-1].strip()
        if line.endswith('*/') or line.startswith('/**') or line.startswith('*') \
           or line.startswith('//') or line.startswith('/*') or line == '':
            i = prev_ls
            # if we hit the opening of a block comment, keep going until we consumed it, then stop climbing past code
            continue
        break
    # trim leading blank lines back down (keep one separating blank)
    return i

def _structural_depth(text, pos):
    """Brace-nesting depth at `pos`, honoring strings and comments. A top-level function is at depth
    0; a direct class member is at depth 1. Anything deeper (a method inside an object literal, a
    Proxy handler, an IIFE, a callback) is at depth >=2 and MUST NOT be deleted structurally — doing
    so leaves the enclosing expression malformed (the HGPrefilterUtils new Proxy({get(){throw}}) bug)."""
    depth = 0; i = 0; n = len(text)
    while i < pos and i < n:
        c = text[i]
        if c == '"' or c == "'" or c == '`':
            q = c; i += 1
            while i < n and text[i] != q:
                if text[i] == '\\': i += 1
                i += 1
        elif c == '/' and i+1 < n and text[i+1] == '/':
            while i < n and text[i] != '\n': i += 1
        elif c == '/' and i+1 < n and text[i+1] == '*':
            i += 2
            while i+1 < n and not (text[i]=='*' and text[i+1]=='/'): i += 1
            i += 1
        elif c == '{': depth += 1
        elif c == '}': depth -= 1
        i += 1
    return depth

def _enclosing_brace_is_class(text, pos):
    """True iff the innermost unclosed `{` before `pos` was opened by a `class ... {` (or object/
    interface is excluded). Distinguishes a real class member from a method-shaped entry inside an
    object literal / Proxy handler (`new Proxy({}, { get(){...} })`), which is depth-1 too but must
    NOT be deleted structurally."""
    depth = 0; i = 0; n = len(text); stack = []  # stack of '{' positions at each open
    while i < pos and i < n:
        c = text[i]
        if c == '"' or c == "'" or c == '`':
            q = c; i += 1
            while i < n and text[i] != q:
                if text[i] == '\\': i += 1
                i += 1
        elif c == '/' and i+1 < n and text[i+1] == '/':
            while i < n and text[i] != '\n': i += 1
        elif c == '/' and i+1 < n and text[i+1] == '*':
            i += 2
            while i+1 < n and not (text[i]=='*' and text[i+1]=='/'): i += 1
            i += 1
        elif c == '{':
            stack.append(i); i += 1; continue
        elif c == '}':
            if stack: stack.pop()
            i += 1; continue
        i += 1
    if not stack:
        return False
    open_pos = stack[-1]
    # Look at the code IMMEDIATELY before the opening brace (comments/whitespace stripped). A class
    # body's `{` is preceded by the class header (`class N`, `extends X`, `implements Y`). An object
    # literal / Proxy handler `{` is preceded by `(` `,` `=` `return` `:` `=>` `[`. Prose regexes on
    # a raw window are unreliable (the word "class" appears in comments), so we strip comments first
    # and inspect only the last ~120 code chars.
    pre = text[max(0, open_pos-800):open_pos]
    pre = re.sub(r'/\*.*?\*/', ' ', pre, flags=re.S)
    pre = re.sub(r'//[^\n]*', ' ', pre)
    pre = pre.rstrip()
    # class body: the header just before `{` matches `class Name ...` / `extends ...` / `implements ...`
    if re.search(r'\bclass\s+\w+[^{};()=,]*$', pre):
        return True
    if re.search(r'\b(?:extends|implements)\s+[\w.,<>\s]+$', pre):
        return True
    return False

def process(path, apply=False):
    text = open(path, encoding='utf-8', errors='replace').read()
    deletions = []   # (name, line, start, end_incl_comment)
    # scan line by line for definition headers
    for m in DEF.finditer(text):
        name = m.group('fname') or m.group('mname')
        if not name or name in ('if','for','while','switch','catch','return','function','constructor'):
            continue
        is_function_kw = bool(m.group('fname'))
        # STRUCTURAL GUARD: only delete a top-level function (depth 0) or a DIRECT CLASS member
        # (depth 1 AND the enclosing brace is a `class {`). A def at depth >=2, or a depth-1 method
        # inside an object literal / Proxy handler / IIFE, corrupts the enclosing expression if
        # removed (the HGPrefilterUtils/FFPendingShutdowns `new Proxy({get(){throw}})` bug).
        depth = _structural_depth(text, m.start())
        if is_function_kw:
            if depth != 0: continue
        else:
            if depth != 1 or not _enclosing_brace_is_class(text, m.start()): continue
        # find the { that opens this def's body: the first { after the ) of the signature
        paren = text.find('(', m.start())
        # match the signature parens to find where args end
        pdepth=0; j=paren; sigend=-1
        while j < len(text):
            if text[j]=='(': pdepth+=1
            elif text[j]==')':
                pdepth-=1
                if pdepth==0: sigend=j; break
            j+=1
        if sigend<0: continue
        brace = text.find('{', sigend)
        if brace<0: continue
        # the { must be reasonably close (a return-type annotation between ) and { is fine, but a
        # newline+another def means this isn't a body)
        between = text[sigend+1:brace]
        if '{' in between or ';' in between: continue
        end = _match_brace(text, brace)
        if end<0: continue
        body = text[brace+1:end-1]
        if not _body_is_incomplete_throw(body): continue
        cstart = _preceding_comment_start(text, m.start())
        deletions.append((name, text[:m.start()].count('\n')+1, cstart, end))
    if not deletions:
        return 0, []
    # apply deletions from the end backwards
    if apply:
        newtext = text
        for name,line,cs,ce in sorted(deletions, key=lambda d:d[2], reverse=True):
            # also consume a trailing newline
            ce2 = ce
            while ce2 < len(newtext) and newtext[ce2] in ' \t': ce2+=1
            if ce2 < len(newtext) and newtext[ce2]=='\n': ce2+=1
            newtext = newtext[:cs] + newtext[ce2:]
        # collapse 3+ blank lines to 1
        newtext = re.sub(r'\n{3,}', '\n\n', newtext)
        open(path,'w',encoding='utf-8').write(newtext)
    return len(deletions), [(n,l) for n,l,_,_ in deletions]

def main():
    args = sys.argv[1:]
    apply = '--apply' in args
    check_refs = '--check-refs' in args
    paths = [a for a in args if not a.startswith('--')]
    if not paths:
        paths = glob.glob(os.path.join(SRC, '**', '*.ts'), recursive=True)
    total=0; files_changed=0; removed_syms=[]
    for p in sorted(paths):
        n, syms = process(p, apply=apply)
        if n:
            files_changed += 1; total += n
            rel = os.path.relpath(p, ROOT)
            for name,line in syms:
                removed_syms.append(name)
                print(f"  {'DEL' if apply else 'would-del'} {rel}:{line}  {name}()")
    print(f"\n{'DELETED' if apply else 'DRY-RUN: would delete'} {total} throw-only stub defs across {files_changed} files"
          f"{' (run with --apply to write)' if not apply else ''}")
    if check_refs and removed_syms:
        # warn if a removed symbol name is still called elsewhere
        allsrc = "\n".join(open(p,errors='replace').read() for p in glob.glob(os.path.join(SRC,'**','*.ts'),recursive=True))
        for sym in sorted(set(removed_syms)):
            calls = len(re.findall(r'\b'+re.escape(sym)+r'\s*\(', allsrc))
            if calls>0:
                print(f"  WARN: {sym} still referenced {calls}x after strip (import/call will break — expected on a live tree)")
    return 0

if __name__ == '__main__':
    sys.exit(main())
