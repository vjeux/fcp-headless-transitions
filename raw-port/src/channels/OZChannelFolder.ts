// OZChannelFolder — a <parameter> that CONTAINS child parameters/channels. Extends OZChannelBase.
// Faithful port. Decode: OZChannelFolder::parseElement @ ProChannel 0x666c0.
//   - base OZChannelBase::parseElement (@0x666d2)
//   - child <parameter> (element tag 0x6e/0x6f): read id(0x6f) + factoryID(0x71) ->
//     OZFactories::lookupFactory (creates the correct channel subtype: OZChannel / nested
//     OZChannelFolder / OZChannelGradient / OZChannelBlindData / OZChannelText / ...), then
//     name(0x6e), flags(0x70 u64)->setFlags, default(0x73 dbl)->setDefaultValue,
//     value(0x72 dbl)->setInitialValue; push_back into this folder (@0x66819).
//     OZChannelBlindData gets setData; OZChannel gets setInitialValue/setDefaultValue.
// This IS the .motr <parameter id=N name=.. value=.. default=..> reader — the whole animatable
// data tree (transforms, colors, drop-zone media refs, etc.) is nested OZChannelFolders + leaf
// OZChannels.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZChannelBase } from "./OZChannelBase.js";
import { OZChannel } from "./OZChannel.js";

export class OZChannelFolder extends OZChannelBase {
  children: OZChannelBase[] = [];

  push_back(c: OZChannelBase): void { this.children.push(c); }

  /**
   * getDescendant — faithful transcription of OZChannelFolder::getDescendant(uint) @ProChannel
   * 0x65d68: read the children vector at this+0x70 (begin=+0x0, end=+0x8); if the container is null
   * return null; linear-scan [begin,end), returning the FIRST child whose id (child+0x18) equals the
   * requested id, else null. Direct children only — no recursion, no flag test.
   */
  getDescendant(id: number): OZChannelBase | undefined {
    return this.children.find(c => c.id === id);
  }

  /**
   * `OZChannelFolder::hasDescendant(OZChannelBase const*)` @ProChannel 0x67974
   * (__ZN15OZChannelFolder13hasDescendantEPK13OZChannelBase).
   *
   * Faithful line-for-line transcription of the disassembly at
   *   raw-port/re/disasm/ProChannel.__ZN15OZChannelFolder13hasDescendantEPK13OZChannelBase.s
   *
   * Recursive membership test: returns true iff `target` is `this` or a
   * descendant of `this` via the folder's child list. The disasm walks
   * the children vector at `this+0x70` (begin=+0x0, end=+0x8) — the
   * SAME layout used by getDescendant and getChannelByRef in this file
   * (see the "children" field which models the vector). For each child:
   *
   *   1. Direct-hit test: if the child pointer equals the target pointer,
   *      return true (@0x679a1..0x679ab).
   *   2. Folder test: read the child's flag byte at offset +0x39 and
   *      test bit 0x10. If unset, this child is NOT a folder (a leaf
   *      OZChannel), skip to the next iteration @0x679d3. If set, the
   *      child IS a folder — the disasm confirms this via
   *      dynamic_cast<OZChannelFolder*>(child) @0x679bd-0x679bf (libc++
   *      abi runtime, TRUE out-of-scope extern @0xacea0), then recurses
   *      @0x679ca via a direct self-call to hasDescendant.
   *   3. Recursion return: if the recursive call returned true (`al !=
   *      0` @0x679cf), bubble the true out @0x679d1; otherwise continue
   *      the loop.
   *
   * Termination:
   *   - Empty container (children pointer null @0x67986, or begin==end
   *     @0x67992): return false @0x679dc.
   *   - Loop exhausts without a hit: `r14 = 0` @0x679dc → return false.
   *
   * Empty-list convention: at @0x67982 the disasm reads a POINTER to the
   * container header via `movq 0x70(%rdi), %rax` then null-checks it
   * (@0x67986 `testq %rax, %rax; je 0x679dc`). This models a vector
   * whose begin/end pointers are held indirectly. In this TS port the
   * children field is an inline array (never null), so the null check
   * degenerates to the empty-length test that is already implicit in
   * the JS iteration below — both branches converge on returning false
   * for an empty container.
   *
   * -----------------------------------------------------------------------
   * FRONTIER CALLEES
   * -----------------------------------------------------------------------
   *   * `___dynamic_cast` (libc++abi symbol stub @ProChannel 0xacea0)
   *     — TRUE out-of-scope extern (C++ RTTI runtime). Modelled as
   *     `child instanceof OZChannelFolder`, which is the direct TS
   *     equivalent: both operations answer "is this object a
   *     (subclass-of-)OZChannelFolder?" and both return null/false when
   *     it is not. Called @0x679bf; parameters passed are the child
   *     `rdi`, typeinfo for OZChannelBase `rsi`, typeinfo for
   *     OZChannelFolder `rdx`, and hint = 0 `rcx` (the standard
   *     downcast-through-most-derived idiom).
   *
   *   * `__ZN15OZChannelFolder13hasDescendantEPK13OZChannelBase` (self)
   *     — direct recursion @0x679ca (`callq __ZN15O..hasDescendant..`).
   *     Modelled as a plain `.hasDescendant(target)` call on the child.
   *
   * -----------------------------------------------------------------------
   * FULL DISASM (with per-line semantics)
   * -----------------------------------------------------------------------
   *   0x67974..0x67981  prologue + save clobbers (rbp/r15/r14/r13/r12/rbx);
   *                     `pushq %rax` = align stack for the recursive call.
   *   0x67982  movq   0x70(%rdi), %rax           ; rax = &children_hdr
   *   0x67986  testq  %rax, %rax                 ; empty container?
   *   0x67989  je     0x679dc                    ; -> return false
   *   0x6798b  movq   (%rax), %r13               ; r13 = begin ptr
   *   0x6798e  movq   0x8(%rax), %r15            ; r15 = end   ptr
   *   0x67992  cmpq   %r15, %r13                 ; empty range?
   *   0x67995  je     0x679dc                    ; -> return false
   *   0x67997  movq   %rsi, %rbx                 ; rbx = target (arg 2)
   *   0x6799a  leaq   __ZTI15OZChannelFolder, %r12  ; keep folder typeinfo alive
   *   loop:
   *   0x679a1  movq   (%r13), %rdi               ; rdi = *r13 = child*
   *   0x679a5  movb   $0x1, %r14b                ; presume "found"
   *   0x679a8  cmpq   %rbx, %rdi                 ; child == target?
   *   0x679ab  je     0x679df                    ; -> return true
   *   0x679ad  testb  $0x10, 0x39(%rdi)          ; child->flags[0x39] & 0x10 (is-folder bit)
   *   0x679b1  je     0x679d3                    ; leaf → continue
   *   0x679b3  leaq   __ZTI13OZChannelBase, %rsi ; RTTI src
   *   0x679ba  movq   %r12, %rdx                 ; RTTI dst = OZChannelFolder
   *   0x679bd  xorl   %ecx, %ecx                 ; hint = 0
   *   0x679bf  callq  0xacea0                    ; ___dynamic_cast
   *   0x679c4  movq   %rax, %rdi                 ; rdi = child-as-folder
   *   0x679c7  movq   %rbx, %rsi                 ; rsi = target
   *   0x679ca  callq  ..hasDescendant..          ; recurse
   *   0x679cf  testb  %al, %al                   ; result?
   *   0x679d1  jne    0x679df                    ; true → return true
   *   0x679d3  addq   $0x8, %r13                 ; ++it
   *   0x679d7  cmpq   %r15, %r13                 ; it == end?
   *   0x679da  jne    0x679a1                    ; no, loop
   *   0x679dc  xorl   %r14d, %r14d               ; r14b = 0 (false)
   *   0x679df  movl   %r14d, %eax                ; return r14b (bool)
   *   0x679e2..retq   epilogue
   *
   * Numeric widths: the return is `bool` (movb-sized `r14b`); we return
   * a JS boolean. No floats, no int64 — pure pointer/flag logic.
   */
  hasDescendant(target: OZChannelBase | null | undefined): boolean {
    // @0x67982..0x67986 — children header pointer null-check.
    // @0x6798b..0x67995 — empty [begin,end) range check.
    // Modelled together as: if children is empty, fall through to `return false`.
    if (this.children.length === 0) {
      // @0x679dc: xorl %r14d,%r14d; @0x679df: movl %r14d,%eax → return 0 (false).
      return false;
    }
    // @0x67997..0x6799a — target/typeinfo hoisted into regs (no observable effect in TS).
    // Loop @0x679a1..0x679da:
    for (const child of this.children) {
      // @0x679a1: rdi = *it (child pointer)
      // @0x679a8..0x679ab: cmpq %rbx,%rdi; je 0x679df → direct hit.
      if (child === target) {
        // @0x679a5 pre-set r14b=1; falls through to @0x679df → return true.
        return true;
      }
      // @0x679ad: testb $0x10, 0x39(%rdi) — is-folder flag bit 0x10 at offset 0x39.
      // @0x679b1: je 0x679d3 — leaf skips the recursion entirely.
      // @0x679bd..0x679c4: ___dynamic_cast<OZChannelFolder*>(child).
      // Both the flag-test AND the dynamic_cast succeed exactly when
      // `child` is (a subclass of) OZChannelFolder — the flag is a
      // fast-path pre-filter; the dynamic_cast is the authoritative
      // downcast. In TS `instanceof` gives us the same answer directly.
      if (child instanceof OZChannelFolder) {
        // @0x679ca: recurse @ hasDescendant.
        // @0x679cf..0x679d1: testb %al,%al; jne 0x679df → propagate true.
        if (child.hasDescendant(target)) {
          return true;
        }
      }
      // @0x679d3..0x679da: ++it, loop.
    }
    // @0x679dc: fall through — no child matched, return false.
    return false;
  }

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZChannelBase::parseElement @0x666d2
    if (e.tagName !== "parameter") return; // only <parameter> children are folder entries
    // factoryID selects the channel subtype (OZFactories::lookupFactory @0x6675b). Absent/0 =>
    // a plain scalar OZChannel (the overwhelmingly common case in transitions). Nested parameters
    // that themselves contain <parameter> children are folders.
    const factoryID = s.getAttributeAsUInt32(e, 0x71) ?? 0;
    const hasChildParams = e.children.some(c => c.tagName === "parameter");
    let node: OZChannelBase;
    if (hasChildParams) {
      const f = new OZChannelFolder();
      node = f;
    } else {
      const ch = new OZChannel();
      const v = s.getAttributeAsDouble(e, 0x72); if (v !== undefined) ch.setInitialValue(v);   // 0x6696c
      const d = s.getAttributeAsDouble(e, 0x73); if (d !== undefined) ch.setDefaultValue(d);    // 0x6687e
      node = ch;
    }
    node.factoryID = factoryID;
    const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) node.id = id;              // 0x666f7
    const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) node.name = nm;            // 0x6679f
    const fl = s.getAttributeAsUInt32(e, 0x70); if (fl !== undefined) node.flags = BigInt(fl);   // 0x6683a (u64)
    // Recurse into child <parameter>/<curve> elements.
    for (const c of e.children) node.parseElement(s, c);
    this.push_back(node);                                                                        // 0x66819
  }
}

// --- Channel-tree builder (module function) -------------------------------------------------
// Build the channel tree for a <parameter> PCStreamElement. Returns an OZChannelFolder when the
// element has child <parameter>s, else a leaf OZChannel. Mirrors OZChannelFolder::parseElement
// (@0x666xx): id(0x6f)/name(0x6e)/factoryID(0x71)/flags(0x70 u64)/value(0x72->setInitialValue)/
// default(0x73->setDefaultValue); recurse child <parameter>; attach <curve> to leaves.
import { OZCurve, OZKeypoint } from "./OZCurve.js";

export function buildChannelTree(s: PCSerializerReadStream, e: PCStreamElement): OZChannelBase {
  const hasChildParams = e.children.some(c => c.tagName === "parameter");
  const node: OZChannelBase = hasChildParams ? new OZChannelFolder() : new OZChannel();
  const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) node.id = id;
  const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) node.name = nm;
  const fid = s.getAttributeAsUInt32(e, 0x71); if (fid !== undefined) node.factoryID = fid;
  const fl = s.getAttributeAsUInt32(e, 0x70); if (fl !== undefined) node.flags = BigInt(fl >>> 0);
  if (node instanceof OZChannel) {
    const val = s.getAttributeAsDouble(e, 0x72); if (val !== undefined) node.setInitialValue(val);
    const def = s.getAttributeAsDouble(e, 0x73); if (def !== undefined) node.setDefaultValue(def);
  }
  for (const c of e.children) {
    if (c.tagName === "parameter") {
      const child = buildChannelTree(s, c);
      if (node instanceof OZChannelFolder) node.push_back(child);
    } else if (c.tagName === "curve" && node instanceof OZChannel) {
      const cv = new OZCurve();
      for (const g of c.children) cv.parseElement(s, g);
      // curve attrs on the <curve> element itself:
      const t = s.getAttributeAsUInt32(c, 0x4); if (t !== undefined) cv.type = t;
      const re = s.getAttributeAsUInt32(c, 0x7); if (re !== undefined) cv.retimingExtrapolation = re;
      node.curve = cv;
    }
  }
  return node;
}

// --- OZChannelRef::getChannel(OZChannelBase*) — faithful transcription of ProChannel @0x4af40 ---
// The ref holds a path string (in the binary via SSO: bit0 of the ref's first byte selects inline@+1
// vs heap@+0x10; here `path` IS that string). Walk:
//   r14 = path pointer.
//   if path[0]=='.'(0x2e): cur = base; r14 += 1, and if path[1]=='/'(0x2f) r14 += 1 more (skip "./").
//   else: cur = null (the FIRST numeric segment is then matched against base's OWN id, not a child).
//   loop: parse one decimal integer segment id (r13 = r13*10 + (ch-'0')) until '\0' or '/';
//         r12 = (stop char == '/')  [1 => another segment follows]
//         if cur != null: require cur is an OZChannelFolder (flag 0x10 at +0x39 then dynamic_cast);
//                         cur = cur.getDescendant(id); if null -> return null.
//         else (cur == null): if base.id != id -> return null; else cur = base.
//         advance past the '/' (r14 += r12); if not at end, loop.
//   return cur.
// Purely NUMERIC ids resolved via getDescendant — no name matching.
export function getChannelByRef(path: string, base: OZChannelBase): OZChannelBase | undefined {
  if (base === undefined || base === null) return undefined; // testq %rsi,%rsi; je -> return null
  let i = 0;
  let cur: OZChannelBase | undefined;
  if (path.charCodeAt(0) === 0x2e /* '.' */) {
    cur = base;                                  // rax = rbx (base)
    i = 1;                                       // r14 += 1 (skip '.')
    if (path.charCodeAt(1) === 0x2f /* '/' */) i = 2; // cmove: also skip '/'
  } else {
    cur = undefined;                             // rax = 0
  }
  for (;;) {
    // parse a decimal integer segment id
    let id = 0;
    let ch = path.charCodeAt(i);
    while (!Number.isNaN(ch) && ch !== 0x2f /* '/' */) {
      id = id * 10 + (ch - 0x30);                // r13 = r13*10 + (ch-'0')
      i++;
      ch = path.charCodeAt(i);
    }
    const sepFollows = ch === 0x2f;              // r12b = (cl == '/')
    if (cur !== undefined) {
      if (!(cur instanceof OZChannelFolder)) return undefined; // flag 0x10 / dynamic_cast<Folder> fails
      cur = cur.getDescendant(id);               // getDescendant(id)
      if (cur === undefined) return undefined;
    } else {
      if (base.id !== id) return undefined;       // cmpl %r13d, base->0x18 ; jne -> null
      cur = base;
    }
    if (sepFollows) i++;                          // r14 += r12 (skip '/')
    if (Number.isNaN(path.charCodeAt(i))) break;  // *r14 == 0 (end) -> done
  }
  return cur;
}
