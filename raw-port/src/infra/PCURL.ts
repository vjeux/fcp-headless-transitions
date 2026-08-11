// PCURL — ProCore RAII wrapper around a CoreFoundation `__CFURL *`
// handle. Ports ONLY the copy constructor C2 (base-object) variant at
// @ProCore 0x70b6; the class body (default ctor, dtor, accessors) is
// tracked by separate ledger entries and will be added here as its
// units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN5PCURLC2ERKS_.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from this ctor body alone)
// -----------------------------------------------------------------------------
// PCURL {
//   +0x00  url : CFURLRef              (a `__CFURL *` — the only slot
//                                        this ctor writes. The default
//                                        state initialised here is NULL
//                                        @0x70bf, then overwritten with
//                                        a fresh retain @0x70e7 iff the
//                                        source URL is non-null.)
// }
// sizeof(PCURL) = 8 (just the pointer). This matches the sibling
// PCCFRef<CF*> RAII wrappers in this directory — PCURL is a
// domain-specific CFURLRef box.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES + GLOBALS (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _CFURLGetString — CoreFoundation.framework — TRUE out-of-scope
//     extern. Called @0x70ce via ProCore stub 0xde12c. Returns the
//     `CFStringRef` textual representation of the source URL (borrowed,
//     not retained).
//   * _CFURLCreateWithString — CoreFoundation.framework — TRUE
//     out-of-scope extern. Called @0x70e2 via ProCore stub 0xde120.
//     Parses the string back into a fresh CFURLRef (returns a +1 ref,
//     hence this ctor "owns" its retain like the source did).
//   * _kCFAllocatorDefault — CoreFoundation.framework — TRUE out-of-scope
//     extern GLOBAL. Read via a two-hop indirection: RIP-relative load
//     @0x70d3 yields the address of the extern-name-slot in ProCore's
//     lazy-binding table, then `movq (%rcx), %rdi` @0x70da dereferences
//     that slot to fetch the *value* of the `CFAllocatorRef` global.
//     Passed as the allocator arg (arg 1) to _CFURLCreateWithString.
//
// -----------------------------------------------------------------------------
// Symbol ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN5PCURLC2ERKS_
//       — PCURL::PCURL(PCURL const&)  [C2 base-object variant] @ProCore 0x70b6
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN5PCURLC2ERKS_.s)
// -----------------------------------------------------------------------------
//   0x70b6  pushq  %rbp
//   0x70b7  movq   %rsp, %rbp
//   0x70ba  pushq  %rbx
//   0x70bb  pushq  %rax                          ; 8-byte stack slot for
//                                                ; 16-byte alignment
//                                                ; (paired with popq at
//                                                ; 0x70ea via addq $0x8).
//   0x70bc  movq   %rdi, %rbx                    ; %rbx = this (dst PCURL*)
//   0x70bf  movq   $0x0, (%rdi)                  ; this->url = NULL
//                                                ; (default-init before
//                                                ; the ownership handoff
//                                                ; below — guarantees the
//                                                ; NULL-source branch
//                                                ; leaves a well-formed
//                                                ; object.)
//   0x70c6  movq   (%rsi), %rdi                  ; %rdi = src.url
//                                                ; (source PCURL's slot;
//                                                ; %rsi is arg 2 = the
//                                                ; `PCURL const&` src.)
//   0x70c9  testq  %rdi, %rdi                    ; src.url == NULL ?
//   0x70cc  je     0x70ea                        ; yes -> skip clone,
//                                                ; leave this->url = NULL.
//   0x70ce  callq  _CFURLGetString               ; %rax = borrowed CFStringRef
//                                                ; of src.url's text.
//   0x70d3  movq   _kCFAllocatorDefault_slot(%rip), %rcx
//                                                ; %rcx = address of the
//                                                ; ProCore lazy-binding
//                                                ; slot for the CF
//                                                ; allocator symbol.
//   0x70da  movq   (%rcx), %rdi                  ; %rdi = *slot =
//                                                ; kCFAllocatorDefault
//                                                ; (a CFAllocatorRef —
//                                                ; opaque handle).
//   0x70dd  movq   %rax, %rsi                    ; %rsi = the URL text
//                                                ; from CFURLGetString.
//   0x70e0  xorl   %edx, %edx                    ; %rdx = NULL (baseURL —
//                                                ; the third arg to
//                                                ; _CFURLCreateWithString;
//                                                ; NULL means "the string
//                                                ; is already absolute").
//   0x70e2  callq  _CFURLCreateWithString        ; %rax = fresh CFURLRef,
//                                                ; retain-count +1.
//   0x70e7  movq   %rax, (%rbx)                  ; this->url = new url
//   0x70ea  addq   $0x8, %rsp                    ; discard the alignment
//                                                ; slot pushed at 0x70bb.
//   0x70ee  popq   %rbx
//   0x70ef  popq   %rbp
//   0x70f0  retq
//   0x70f1  nop                                  ; trailing alignment nop

// ═════════════════════════════════════════════════════════════════════════
// Opaque CoreFoundation surrogates.
// The real CoreFoundation `__CFURL *` / `__CFString *` / `CFAllocatorRef`
// are private struct pointers; the port never needs to inspect their
// bytes — only to pass them through CF boundary stubs. We therefore
// model each as an opaque branded handle. This mirrors the twin
// PCCFRef_CFString / PCCFRef_CFData / PCCFRef_CFArray ports next door.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque CoreFoundation URL handle (a `__CFURL *`). */
export interface CFURLRef {
  readonly __cf_url_brand: unique symbol;
}

/** Opaque CoreFoundation string handle (a `__CFString *`). Returned by
 *  `_CFURLGetString` as a BORROWED reference — not retained by us. */
export interface CFStringRef {
  readonly __cf_string_brand: unique symbol;
}

/** Opaque CoreFoundation allocator handle (a `__CFAllocator *`).
 *  Passed to `_CFURLCreateWithString` unchanged. */
export interface CFAllocatorRef {
  readonly __cf_allocator_brand: unique symbol;
}

/**
 * `_kCFAllocatorDefault` — CoreFoundation.framework extern global (read
 * via ProCore lazy-binding slot @0x70d3 -> deref @0x70da). TRUE
 * out-of-scope extern. In the native binary this is the default CF
 * allocator singleton; the JS surrogate has no CF runtime, so we return
 * a shared branded sentinel that the frontier CF calls simply pass
 * through. Documented so a future parity harness can hook the boundary.
 */
const kCFAllocatorDefault: CFAllocatorRef = {} as CFAllocatorRef;

/**
 * `CFStringRef _CFURLGetString(CFURLRef url)` — CoreFoundation.framework
 * extern (called via ProCore stub 0xde12c from PCURL(PCURL const&)
 * @0x70ce). TRUE out-of-scope extern. Returns a BORROWED CFStringRef —
 * ownership stays with the source CFURL.
 *
 * The JS surrogate has no CF runtime — this throws so a caller wiring
 * a real CF harness discovers the boundary loudly. Matches the
 * "throw on undecoded extern" policy already used by PCString.ts for
 * `_CFBundleCopyLocalizedString`.
 */
function CFURLGetString(_url: CFURLRef): CFStringRef {
  throw new Error(
    '_CFURLGetString @ProCore 0x70ce (stub 0xde12c) — CoreFoundation ' +
    'extern (value-producing, TRUE out-of-scope boundary). Called from ' +
    'PCURL::PCURL(PCURL const&) [C2 @0x70b6] to serialise the source URL ' +
    'for the CFURLCreateWithString reparse. Not yet transcribed; wire a ' +
    'real CoreFoundation runtime here if a parity harness needs the ' +
    'actual URL text.',
  );
}

/**
 * `CFURLRef _CFURLCreateWithString(CFAllocatorRef allocator, CFStringRef
 * URLString, CFURLRef baseURL)` — CoreFoundation.framework extern
 * (called via ProCore stub 0xde120 from PCURL(PCURL const&) @0x70e2).
 * TRUE out-of-scope extern. Returns a fresh CFURLRef with retain-count
 * +1 (caller owns the retain — that's why PCURL's copy ctor stores it
 * directly without an extra CFRetain).
 *
 * Same "throw on undecoded extern" policy as CFURLGetString above.
 */
function CFURLCreateWithString(
  _allocator: CFAllocatorRef,
  _urlString: CFStringRef,
  _baseURL: CFURLRef | null,
): CFURLRef {
  throw new Error(
    '_CFURLCreateWithString @ProCore 0x70e2 (stub 0xde120) — ' +
    'CoreFoundation extern (value-producing, TRUE out-of-scope boundary). ' +
    'Called from PCURL::PCURL(PCURL const&) [C2 @0x70b6] to reparse the ' +
    'source URL text into a fresh retained CFURL. Not yet transcribed; ' +
    'wire a real CoreFoundation runtime here if a parity harness needs ' +
    'the actual URL clone.',
  );
}

/**
 * `CFTypeRef _CFRetain(CFTypeRef cf)` — CoreFoundation.framework extern,
 * reached through the ProCore symbol stub 0xde018 (called from
 * `PCURL::PCURL(__CFURL const*)` [C1] @0x7007).
 *
 * LIFETIME primitive, so per the RESOLVED CFRetain/CFRelease ruling the
 * faithful boundary model is the IDENTITY, not a throw: JS GC owns the
 * surrogate, there is no native refcount for a fake retain to corrupt, and
 * the real call returns its argument unchanged. Landed precedent:
 * `infra/PCCFRef_CFArray.ts` / `infra/PCCFRef_CFData.ts` ship
 * `CFRelease` as a no-op and `channels/DisablePrioritizedWritesRAII.ts`
 * ships `objc_retain` as `return lock`.
 *
 * Note the split this file already makes correctly one screen up:
 * `CFURLGetString` and `CFURLCreateWithString` are VALUE-PRODUCING — JS
 * cannot fabricate a CFURL — so those must throw. This one must not.
 *
 * It also matters for a reason independent of the ruling: `movq %rbx,(%r14)`
 * @0x700c is the JOIN POINT of both paths, so the machine performs that
 * store for NULL and non-NULL alike. A throw here would unwind at 0x7007 and
 * delete the only real-work instruction this constructor has, for every
 * non-NULL argument — i.e. exactly the inputs it exists for.
 */
function CFRetain(cf: CFURLRef): CFURLRef {
  return cf; // @0x7007 stub 0xde018 — TS-side identity.
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCURL` — ProCore RAII wrapper around a CFURLRef. Owns exactly one
 * CoreFoundation retain on its `url` slot; copy-construction produces a
 * new independent retain by roundtripping through the URL string.
 *
 * Only the copy constructor (C2 base-object variant) is ported here.
 */
export class PCURL {
  /** +0x00 — the wrapped CFURLRef (may be NULL). Set to NULL first, then
   *  overwritten with a fresh retained clone if the source URL was
   *  non-null. */
  url: CFURLRef | null = null;

  /**
   * `PCURL::PCURL(PCURL const&)` [C2 base-object] — @ProCore 0x70b6
   * (__ZN5PCURLC2ERKS_).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Semantics: given a source PCURL,
   *   1. `this->url = NULL`     (guarantees a well-formed dst on the
   *                              NULL-source branch).
   *   2. If `src.url == NULL` -> return (leave this->url NULL).
   *   3. Else: get the borrowed CFStringRef of src.url via
   *      `_CFURLGetString`; recreate a fresh CFURLRef from that string
   *      with `kCFAllocatorDefault` and NULL baseURL via
   *      `_CFURLCreateWithString`; store the returned +1 retain in
   *      `this->url`.
   *
   * The returned URL is a semantic clone (same absolute-URL string) with
   * its own retain — the source's retain is untouched.
   *
   * Note: this is the C2 (base-object) flavour. Clang emits a separate
   * C1 (complete-object) symbol; when PCURL has no virtual bases the two
   * bodies are typically identical, but C1 is a distinct ledger entry
   * and is not modelled here.
   *
   * @param src  the PCURL to clone from.
   */
  copyConstructBase(src: PCURL): void {
    // @0x70b6..0x70bb — prologue + 8-byte alignment slot.
    // @0x70bc — %rbx = this (already implicit in JS).
    // @0x70bf — this->url = NULL (initial default before the ownership
    //           handoff below; leaves the object well-formed on the
    //           NULL-source branch).
    this.url = null;
    // @0x70c6 — %rdi = src.url.
    const srcUrl = src.url;
    // @0x70c9..0x70cc — testq/je: NULL-check on src.
    if (srcUrl === null) {
      // @0x70ea..0x70f0 — epilogue: leave this->url = NULL and return.
      return;
    }
    // @0x70ce — %rax = _CFURLGetString(src.url).
    const urlString = CFURLGetString(srcUrl);
    // @0x70d3 — %rcx = &_kCFAllocatorDefault_slot; @0x70da — deref.
    const allocator = kCFAllocatorDefault;
    // @0x70dd — arg 2 = the URL string.
    // @0x70e0 — arg 3 = NULL (baseURL — absolute).
    // @0x70e2 — %rax = _CFURLCreateWithString(alloc, urlString, NULL).
    const clone = CFURLCreateWithString(allocator, urlString, null);
    // @0x70e7 — this->url = clone (takes the +1 retain).
    this.url = clone;
    // @0x70ea..0x70f0 — epilogue.
  }

  /**
   * `PCURL::PCURL(__CFURL const*)` [C1 complete-object] — @ProCore 0x6ff2
   * (__ZN5PCURLC1EPK7__CFURL).
   *
   * The adopting constructor: take an owning retain on the caller's CFURL (if
   * any) and store it in the +0x00 slot.
   *
   * Full transcription — every instruction, in order:
   *
   *   0x6ff2  pushq %rbp                ; frame setup (no TS counterpart)
   *   0x6ff3  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
   *   0x6ff6  pushq %r14                ; callee-saved spill (no TS counterpart)
   *   0x6ff8  pushq %rbx                ; callee-saved spill (no TS counterpart)
   *   0x6ff9  movq  %rsi, %rbx          ; rbx = url (the argument)
   *   0x6ffc  movq  %rdi, %r14          ; r14 = this
   *   0x6fff  testq %rsi, %rsi          ; url == NULL ?
   *   0x7002  je    0x700c              ;   NULL -> skip the retain
   *   0x7004  movq  %rbx, %rdi          ; arg1 = url
   *   0x7007  callq _CFRetain           ; stub 0xde018 — take the owning retain
   *   0x700c  movq  %rbx, (%r14)        ; this->url = url   (BOTH paths)
   *   0x700f  popq  %rbx                ; epilogue
   *   0x7010  popq  %r14
   *   0x7012  popq  %rbp
   *   0x7013  retq
   *
   * SEMANTICS: the retain is CONDITIONAL (only for a non-NULL argument) but the
   * store is UNCONDITIONAL — 0x700c is the join point of both paths, so a NULL
   * argument still writes NULL into the slot. Unlike the copy ctor @0x70b6
   * above, this one does NOT roundtrip through `_CFURLGetString` /
   * `_CFURLCreateWithString`: it adopts the CALLER'S url object itself and just
   * bumps its refcount, so the wrapper and the caller share one CFURL.
   *
   * The `testq %rsi,%rsi ; je` @0x6fff is a NULL test on ZF, not an ordered
   * compare. Nothing else is touched — no other field is written, and the
   * `this->url = NULL` pre-store the copy ctor does @0x70bf has no counterpart
   * here (the single store covers every path).
   *
   * C1 ONLY: this is the complete-object flavour. The base-object C2 symbol is
   * a separate ledger unit and is not modelled here.
   *
   * FRONTIER CALLEE: `_CFRetain` (ProCore stub 0xde018) — the only call in the
   * body; an out-of-scope CoreFoundation LIFETIME primitive, so it is modelled
   * as the identity per the RESOLVED CFRetain/CFRelease ruling (see the stub
   * above), which is what keeps the @0x700c store on both paths. No in-scope
   * callee, no indirect and no virtual dispatch.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProCore.__ZN5PCURLC1EPK7__CFURL.s (16 lines)
   *
   * ORACLE — raw-port/re/oracle/PCURL_ctorFromCFURL_oracle.py
   *   (+ PCURL_ctorFromCFURL_driver.mts;
   *    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCURL_ctorFromCFURL_oracle.py)
   * The C1 symbol is exported, so it is called live on a 32-byte 0xCD-poisoned
   * arena. Measured: a NULL argument stores 0x0 and a non-NULL one stores the
   * CFURLRef itself, with the 24 bytes past the field untouched in both cases,
   * and CFGetRetainCount moving 5 -> 6 exactly once (the conditional retain
   * @0x7007). The shipped port agrees on both paths. Negative control — the
   * pre-fix model in which `_CFRetain` throws — DIVERGES: the store never
   * happens for a non-NULL argument, because the unwind at 0x7007 skips
   * 0x700c. That is the defect review found, reproduced by execution.
   *
   * @param url  the CFURLRef to adopt (may be NULL).
   */
  constructFromCFURL(url: CFURLRef | null): void {
    // @0x6fff-0x7002  testq %rsi,%rsi ; je 0x700c — skip the retain on NULL.
    if (url !== null) {
      // @0x7004/@0x7007  movq %rbx,%rdi ; callq _CFRetain — the owning retain.
      CFRetain(url);
    }
    // @0x700c  movq %rbx,(%r14) — the store is on BOTH paths, NULL included.
    this.url = url;
  }
}
