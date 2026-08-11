// DepthBufferManager.ts — raw transcription of the Helium class `DepthBufferManager`.
//
// ONE symbol is transcribed in this file — `hasDepthBuffer()`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add one without its own disassembly and
// address citations. The siblings, listed for orientation only (from
// `grep DepthBufferManager raw-port/army/inventory/Helium.syms.txt`):
//   0xe0000  DepthBufferManager::DepthBufferManager(HGRenderer*)   [C2]
//   0xe0020  DepthBufferManager::init(HGRenderer*)
//   0xe0030  DepthBufferManager::~DepthBufferManager()             [D2]
//   0xe00b0  DepthBufferManager::getDepthBuffer()
//   0xe00d0  DepthBufferManager::uninit()
//   0xe0120  DepthBufferManager::push()
//   0xe0250  DepthBufferManager::pop()
//   0xe02b0  DepthBufferManager::enableDepth()
//   0xe02d0  DepthBufferManager::enableDepth(bool, bool, unsigned, bool)
//   0xe02e0  DepthBufferManager::disableDepth()
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0xe0090  DepthBufferManager::hasDepthBuffer()
//               __ZN18DepthBufferManager14hasDepthBufferEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN18DepthBufferManager14hasDepthBufferEv Helium`):
//   raw-port/re/disasm/Helium.__ZN18DepthBufferManager14hasDepthBufferEv.s (8 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0xe0090  pushq  %rbp                 ; frame setup (no TS counterpart)
//   0xe0091  movq   %rsp, %rbp           ; frame setup (no TS counterpart)
//   0xe0094  movq   0x10(%rdi), %rax     ; rax = *(this + 0x10)
//   0xe0098  cmpq   0x18(%rdi), %rax     ; AT&T dst-src: flags on
//                                        ;   *(this+0x10) - *(this+0x18)
//   0xe009c  setne  %al                  ; al = (ZF == 0) = (the two differ)
//   0xe009f  popq   %rbp                 ; frame teardown (no TS counterpart)
//   0xe00a0  retq                        ; return %al (bool)
//   0xe00a1  nopw   %cs:(%rax,%rax)      ; alignment padding, not executed
//
// The entire computation is one comparison of two adjacent 8-byte slots. There is no branch, no
// call, no store, no dereference of either slot, and no other member is touched. `depgraph.py deps
// __ZN18DepthBufferManager14hasDepthBufferEv` lists nothing: zero in-scope callees, zero externs,
// zero indirect or virtual dispatch.
//
// ---------------------------------------------------------------------------
// LAYOUT — recovered from the ctor and corroborated by getDepthBuffer
// ---------------------------------------------------------------------------
// The C2 constructor @0xe0000 (`raw-port/re/disasm/
// Helium.__ZN18DepthBufferManagerC2EP10HGRenderer.s`) writes the whole object:
//
//   0xe0004  leaq   0x92d9dd(%rip), %rax
//   0xe000b  movq   %rax, (%rdi)          ; +0x00  vptr
//   0xe000e  xorps  %xmm0, %xmm0
//   0xe0011  movups %xmm0, 0x10(%rdi)     ; zero +0x10..+0x1f
//   0xe0015  movups %xmm0, 0x19(%rdi)     ; zero +0x19..+0x28  (OVERLAPS the store above)
//   0xe0019  movq   %rsi, 0x8(%rdi)       ; +0x08  HGRenderer* (the ctor argument)
//
// The two overlapping 16-byte stores are the compiler zeroing the 24-byte span +0x10..+0x27 with
// two aligned `movups` — 0x10..0x1f and 0x19..0x28 union to exactly that region plus one trailing
// byte. Twenty-four bytes zeroed as a unit at a single offset is the libc++ `std::vector` layout:
//
//   struct DepthBufferManager {
//     +0x00  vptr
//     +0x08  HGRenderer*                  ; written by the ctor and again by init @0xe0024
//     +0x10  __begin_   \
//     +0x18  __end_      >  std::vector<HGDepthBuffer*>, 24 bytes
//     +0x20  __end_cap_ /
//   };
//
// `getDepthBuffer()` @0xe00b0 confirms it and fixes the element type:
//
//   0xe00b0  movq  0x18(%rdi), %rax       ; rax = __end_
//   0xe00b4  cmpq  %rax, 0x10(%rdi)       ; __begin_ - __end_
//   0xe00b8  je    0xe00c4                ; equal (empty) -> return NULL
//   0xe00be  movq  -0x8(%rax), %rax       ; rax = *(__end_ - 8)  — the LAST element
//   0xe00c3  retq
//   0xe00c4  xorl  %eax, %eax ; retq      ; empty -> NULL
//
// i.e. `back()` on a vector whose elements are 8 bytes wide — pointers. So the manager owns a STACK
// of depth buffers (`push` @0xe0120 / `pop` @0xe0250 are its other operations), `hasDepthBuffer()`
// asks whether that stack is non-empty, and `getDepthBuffer()` hands back its top.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live Helium function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/DepthBufferManager_hasDepthBuffer_oracle.py, under
// `arch -x86_64 /usr/bin/python3` because this port is transcribed from the x86_64 slice. The
// symbol is `T` (exported), so it is reached with dlsym; the harness self-checks BEFORE believing
// any number — dlsym must land exactly on `slide + 0xe0090` and the bytes there must read
// `55 48 89 e5 48 8b 47 10`, the prologue of the body transcribed above. Measured run:
//
//   SELF-CHECK PASS   (slide 0x10b6c9000, dlsym == slide + 0xe0090, prologue bytes match)
//   (1) relation      64/64  the live return equals `begin != end` on every ordered pair drawn
//                            from {0, 1, 8, 2^32-1, 2^32, 2^47-8, 2^63, -8}
//   (2) offsets       75/75  the answer is unchanged while +0x00, +0x08, +0x20, +0x28 and +0x30
//                            are each set to 0, 1 and -8 across five begin/end shapes — so the
//                            two slots really are +0x10 and +0x18 and not a neighbour
//   (3) read-only     64/64  the 0xEE-poisoned 0x40-byte arena is byte-identical after every
//                            call, so the body reads two slots and stores nothing
//
//   negative controls, all killed: `==` instead of `!=` 64/64; "non-empty means begin != 0" 14/64;
//   "non-empty means end != 0" 14/64; always-true 8/64; always-false 56/64.
//
// Note what the corpus deliberately includes: pairs that are both non-zero and EQUAL, which is the
// only shape that separates the real relation from "either pointer is set" — the two controls that
// score 14/64 are killed exclusively by those.

/**
 * `DepthBufferManager` — Helium's per-renderer stack of depth buffers.
 *
 * Only the members `hasDepthBuffer` reads are modelled. The vptr at +0x00 and the `HGRenderer*` at
 * +0x08 are recorded in the layout comment above but are not fields here: this method never touches
 * them, and inventing state a transcribed body does not use is how two models of one class start to
 * drift.
 *
 * @Helium 0xe0090
 */
export class DepthBufferManager {
  /**
   * +0x10 — `std::vector<HGDepthBuffer*>`, the stack of depth buffers.
   *
   * Modelled as a TS array, which is this repo's landed convention for a libc++ vector
   * (`render/HGBilateralFilterInterp.ts` models its four `std::vector<HGNode*>` members the same
   * way, documenting the begin/end/end_cap triple in the header and holding a TS array in the
   * class). The three pointer slots the machine actually addresses are +0x10 `__begin_`, +0x18
   * `__end_` and +0x20 `__end_cap_`; the ctor @0xe0011/@0xe0015 zeroes all 24 bytes, which is an
   * empty vector, and matches `[]` here.
   *
   * The element type is a POINTER, fixed by `getDepthBuffer()` @0xe00be reading `*(__end_ - 8)`.
   * The pointee class is not decoded by this unit, so the element type is left opaque rather than
   * guessed.
   */
  depthBufferStackAt10: unknown[] = [];

  /**
   * `DepthBufferManager::hasDepthBuffer()` — @Helium 0xe0090
   *   (__ZN18DepthBufferManager14hasDepthBufferEv).
   *
   * Faithful transcription of the eight-line body quoted in the file header: whether the depth
   * buffer stack is non-empty.
   *
   * @returns the boolean in %al.
   */
  hasDepthBuffer(): boolean {
    // @0xe0094  movq 0x10(%rdi), %rax    — rax = __begin_
    // @0xe0098  cmpq 0x18(%rdi), %rax    — AT&T dst-src, so the flags are set on
    //                                      __begin_ - __end_, i.e. ZF iff they are equal.
    // @0xe009c  setne %al                — al = (__begin_ != __end_)
    //
    // Over the array model those two pointers are equal exactly when the vector is empty — that is
    // the libc++ invariant, not an assumption: `__end_` is one past the last element, so the two
    // coincide only at size 0, which is also the state the ctor's 24-byte zeroing leaves. The
    // comparison is therefore written as `length !== 0` and not as a convenience emptiness helper;
    // `!isEmpty()` and `length > 0` would read the same but this is the one that says "the two
    // slots the instruction compares are different".
    return this.depthBufferStackAt10.length !== 0;
    // @0xe00a0  retq — returns %al.
  }
}
