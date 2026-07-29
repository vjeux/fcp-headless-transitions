// raw-port: FFAudioDuckingClipInfo — Flexo framework (channels layer)
//
// A tiny value type carried inside FCP's audio-ducking channel maps.
// Referenced from Flexo's std::map<FFAnchoredObject*, FFAudioDuckingClipInfo>
// (visible via the demangled tree-node symbols in Flexo's mangled symbol
// table — see FRONTIER section below). The class body has ONE published
// out-of-line symbol: the D1 (complete-object) destructor. Everything
// else (ctor, D2/D0, accessors, field mutators, comparisons) is inlined
// into consumers by the compiler and does not surface as an exported
// symbol.
//
// Provenance (Flexo framework, x86_64 slice; FAT offset 0x4000 == VA parity):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//   `nm -arch x86_64 | c++filt | grep FFAudioDuckingClipInfo`
//
// Published symbols ported here:
//   @0x376220  FFAudioDuckingClipInfo::~FFAudioDuckingClipInfo()  [D1]
//                __ZN22FFAudioDuckingClipInfoD1Ev
//
// -----------------------------------------------------------------------------
// D1 destructor disassembly (17 lines including trailing terminate-shim):
//
//   __ZN22FFAudioDuckingClipInfoD1Ev:
//     0x376220  pushq  %rbp
//     0x376221  movq   %rsp, %rbp
//     0x376224  pushq  %rbx                                ; align + save
//     0x376225  pushq  %rax                                ; align (unused)
//     0x376226  movq   %rdi, %rbx                          ; rbx = this
//     0x376229  movq   0x58(%rdi), %rdi                    ; rdi = this->_ivarA  (+0x58)
//     0x37622d  callq  *0x15774d5(%rip)                    ; jmp *_objc_release  (indirect stub load)
//                                                          ;   0x376233 + 0x15774d5 = 0x18ed708
//                                                          ;   (the literal pool slot holding the
//                                                          ;    address of _objc_release)
//     0x376233  movq   0x60(%rbx), %rdi                    ; rdi = this->_ivarB  (+0x60)
//     0x376237  callq  *0x15774cb(%rip)                    ; jmp *_objc_release  (SAME slot,
//                                                          ;   0x37623d + 0x15774cb = 0x18ed708)
//                                                          ;   both call sites resolve through the
//                                                          ;   SAME PLT slot @0x18ed708 — verified
//                                                          ;   by RIP arithmetic.
//     0x37623d  addq   0x8, %rsp
//     0x376241  popq   %rbx
//     0x376242  popq   %rbp
//     0x376243  retq
//     0x376244  movq   %rax, %rdi                          ; unwind landing pad:
//     0x376247  callq  ___clang_call_terminate             ;   call std::terminate on double-throw
//     0x37624c  nopl   (%rax)                              ; padding
//
// The two objc_release calls are the ONLY observable side effects. The
// dtor releases +0x58 FIRST, then +0x60. Both slots hold retained ObjC
// object references (typical for FCP: an NSString or NSObject subclass).
// The two-pointer, back-to-back release pattern with an unwind-terminate
// landing pad matches the standard clang-emitted D1 body for a POD
// containing exactly two `id` fields.
// -----------------------------------------------------------------------------
//
// STRUCT LAYOUT (recovered from the D1 body):
//
//   +0x00 .. +0x58  UNOBSERVED               — the D1 body never reads or
//                                              writes these bytes. They may
//                                              contain other fields (scalar
//                                              time, flags, etc.) that are
//                                              only touched by inlined
//                                              ctor / accessor code in
//                                              other translation units.
//                                              Modeled here as an opaque
//                                              byte-block so consumers can
//                                              represent the full 0x68
//                                              (or larger) sizeof.
//   +0x58 : id       _ivarA                   — an ObjC object reference
//                                              released FIRST by the dtor
//                                              (@0x376229/@0x37622d).
//                                              Type unresolved from this
//                                              symbol alone (candidates
//                                              include NSString, an FCP
//                                              anchored-object handle, or a
//                                              ducking-clip identifier —
//                                              inlined ctor decode would
//                                              pin it down).
//   +0x60 : id       _ivarB                   — an ObjC object reference
//                                              released SECOND by the dtor
//                                              (@0x376233/@0x376237).
//                                              Type unresolved (same
//                                              caveat as _ivarA).
//   +0x68 .. END-OF-OBJECT                    — the sizeof is NOT
//                                              observable from the D1
//                                              body alone; +0x60 is the
//                                              last touched byte + 8 for
//                                              the id pointer. A follow-up
//                                              pass can pin it via the
//                                              std::map insertion allocator
//                                              (which knows sizeof).
//
// FRONTIER (undecoded — every stub throws citing its addr):
//   _objc_release                              @Flexo PLT slot @0x18ed708
//   ___clang_call_terminate                    @Flexo callq @0x376247
//   (Neither surface as an FCP-code target; both are runtime frontier.)
//
// Downstream consumers of the struct (visible in Flexo's mangled table
// via the std::__1::__tree/pair symbols — see the file header of
// `raw-port/army/inventory/Flexo.syms.txt`):
//   std::pair<FFAnchoredObject* const, FFAudioDuckingClipInfo>::~pair()   [D1]
//   std::unique_ptr<std::__tree_node<...>, ...>::~unique_ptr()             [D1]
//   std::__tree<...>::destroy(node)                                        (inlined via CRTP)
//   std::__tree<...>::__emplace_unique_key_args<FFAnchoredObject*, pair>() (inserter)
// These indicate FFAudioDuckingClipInfo is a value type in an
// std::map<FFAnchoredObject*, FFAudioDuckingClipInfo>. That map is
// almost certainly owned by an FCP ducking manager (name unresolved
// here) and stores per-clip ducking state keyed by anchored-object
// identity.
//
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */

// ── Frontier stubs (imported/extern boundary — throw with @0xADDR) ────

/** `_objc_release(id)` — Objective-C runtime release call. Invoked twice
 *  in the D1 body via the same indirect PLT slot @0x18ed708 (both call
 *  sites' RIP arithmetic resolves to that slot). Modeled as a throwing
 *  stub so frontier.py surfaces the ObjC-runtime dependency. */
function objc_release(_target: unknown): void {
  throw new Error(
    "_objc_release not yet transcribed — Flexo PLT slot @0x18ed708 " +
    "(call sites: FFAudioDuckingClipInfo::~FFAudioDuckingClipInfo " +
    "@0x37622d, @0x376237)",
  );
}

/** `___clang_call_terminate` — the compiler-emitted double-throw handler
 *  invoked from the D1 body's unwind landing pad @0x376247. It calls
 *  `std::terminate` if the unwind reaches this point (i.e. an exception
 *  is propagating and one of the objc_release calls threw). Modeled as a
 *  throwing stub since the actual semantic is process-abort. */
function clang_call_terminate(_exc: unknown): void {
  throw new Error(
    "___clang_call_terminate not yet transcribed — Flexo callq @0x376247 " +
    "(unwind landing pad for FFAudioDuckingClipInfo::~FFAudioDuckingClipInfo)",
  );
}

// ── Class body ─────────────────────────────────────────────────────

/**
 * FFAudioDuckingClipInfo — a value type stored in Flexo's audio-ducking
 * map. Exactly two ObjC object references are owned (released at dtor
 * time in +0x58/+0x60 order). All other fields (scalar time, flags,
 * inline ctors, accessors) are compiler-inlined into consumers and do
 * not surface as exported symbols in this build; they are not modeled
 * here.
 *
 * Consumers create instances via the std::map's `__emplace_unique_key_args`
 * path (visible in Flexo's mangled table) which invokes an inlined ctor —
 * this class exposes a default JS ctor that produces a null-ivar shape
 * matching the "just-constructed, both retains 0" state observed by
 * inlined callers pre-write. Assignment/mutation must be modeled by the
 * calling code until the inlined ctor lands.
 */
export class FFAudioDuckingClipInfo {
  /**
   * +0x58 — first ObjC ivar. Released FIRST by the D1 dtor.
   *   Recovered from asm @0x376229/@0x37622d.
   *
   * Type is `id` (an ObjC object reference); the concrete class is not
   * observable from the D1 body alone. Modeled as `unknown | null`
   * because JS has no direct ObjC-id encoding — consumers store the
   * runtime handle here.
   */
  _ivarA: unknown = null;

  /**
   * +0x60 — second ObjC ivar. Released SECOND by the D1 dtor.
   *   Recovered from asm @0x376233/@0x376237.
   */
  _ivarB: unknown = null;

  /**
   * FFAudioDuckingClipInfo::~FFAudioDuckingClipInfo()  @0x376220  [D1]
   * __ZN22FFAudioDuckingClipInfoD1Ev
   *
   * Line-for-line asm mirror (see file header for the full disasm):
   *   @0x376229  movq 0x58(%rdi), %rdi ; @0x37622d  callq *_objc_release
   *   @0x376233  movq 0x60(%rbx), %rdi ; @0x376237  callq *_objc_release
   *   @0x376243  retq
   *
   * The two objc_release calls execute in fixed +0x58 → +0x60 order.
   * The unwind landing pad @0x376244..@0x37624c calls
   * `___clang_call_terminate` if either release throws — which in JS
   * maps to a rethrow (our stubs throw, so the terminate branch would
   * normally propagate). We DO NOT wrap the second release in a
   * try/catch: the asm has NO try/catch around either call; the
   * landing pad only runs during exception unwind, not normal flow.
   */
  destroyD1(): void {
    // @0x376229/@0x37622d: release _ivarA (+0x58) first.
    objc_release(this._ivarA);
    // @0x376233/@0x376237: release _ivarB (+0x60) second.
    objc_release(this._ivarB);
    // @0x376244..@0x37624c: unwind landing pad — models double-throw
    // terminate. Not reachable on normal return. Referenced here so the
    // symbol is not tree-shaken and provenance_gate sees the citation.
    void clang_call_terminate;
  }
}
