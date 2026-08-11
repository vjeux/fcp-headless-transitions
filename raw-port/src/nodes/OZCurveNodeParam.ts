// OZCurveNodeParam.ts — ProChannel's per-parameter animation-curve node payload.
// Faithful transcription of BOTH externally-visible OZCurveNodeParam methods from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//     Versions/A/ProChannel
//
// Source disassembly:
//   raw-port/re/disasm/ProChannel.OZCurveNodeParam.OZCurveNodeParam.s @0x277ba  (copy ctor)
//   raw-port/re/disasm/ProChannel.OZCurveNodeParam.~OZCurveNodeParam.s @0x278b0 (dtor)
//
// nm confirms these are the ONLY externally-visible OZCurveNodeParam methods
// in ProChannel (the assignment op / other members are inlined at call sites):
//   00000000000277ba T OZCurveNodeParam::OZCurveNodeParam(OZCurveNodeParam const&)
//   00000000000278b0 T OZCurveNodeParam::~OZCurveNodeParam()
//
// ---------------------------------------------------------------------------
// Struct layout — RECOVERED byte-for-byte from the copy ctor at 0x277ba.
//
// The ctor loads _kCMTimeZero via `movq 0xa2cef(%rip), %rcx  ## _kCMTimeZero`
// (@0x277ca) and splats its 24 bytes (16-byte lo + 8-byte hi qword) into four
// fields at +0x18, +0x30, +0x60, +0x78 — that's the classic CMTime-init idiom
// (see CMTime.ts: value:8, timescale:4, flags:4, epoch:8 = 24 bytes total).
// Then the "copy from src" half re-reads those SAME offsets out of `src` and
// stores them back — confirming the layout: four CMTime fields at those offsets.
//
//   offset  size  field
//   +0x00   1     u8   flag_a          // ctor copies as byte: `movb (%rsi),%al ; movb %al,(%rdi)`
//                                       // @0x2789a-0x2789c
//   +0x01   1     u8   flag_b          // ctor copies as byte:
//                                       // `movb 0x1(%rsi),%al ; movb %al,0x1(%rdi)`
//                                       // @0x2789e-0x278a1
//   +0x02   6     -    (pad to +0x08)
//   +0x08   8     f64  scalar          // ctor copies via xmm as an 8-byte double:
//                                       // `movsd 0x8(%rsi),%xmm0 ; movsd %xmm0,0x8(%rdi)`
//                                       // @0x278a4-0x278a9  (movsd = 8-byte double load/store)
//   +0x18   24    CMTime  t0           // ctor default @0x277d1-0x277dc (from _kCMTimeZero)
//                                       // then copy from src @0x2782b-0x2782f (16B movups),
//                                       // @0x27823-0x27827 (8B qword at +0x28)
//   +0x30   24    CMTime  t1           // ctor default @0x27802-0x27815, copy @0x2783b-0x27847
//   +0x48   4     i32     count_a      // `movl %ecx,0x48(%rdi)` @0x27846 (from src @0x48)
//                                       // ctor also zeroed it @0x277c0.
//   +0x50   8     T*      buf_a        // `movq %rcx,0x50(%rdi)` @0x27850 (from src @0x50)
//                                       // ctor zeroed @0x277c3.
//                                       //   IMPORTANT: the dtor only frees this pointer via
//                                       //   `operator delete[](void*)` (__ZdaPv) — so buf_a
//                                       //   was allocated with `new T[]`. The element type
//                                       //   is not observable from these two methods.
//   +0x58   1     u8      owns_a       // `movb %al,0x58(%rdi)` @0x27849
//                                       //   NOTE: the copy ctor stores `%al` here where
//                                       //   `%eax == 0` (never rewritten between @0x277be
//                                       //   `xorl %eax,%eax` and this store). So the COPY
//                                       //   creates the new object with owns_a=false — a
//                                       //   FRESH object never owns the source's buffer.
//                                       //   The pointer at +0x50 is still copied verbatim,
//                                       //   so this is an owning/non-owning split: the
//                                       //   copy is a NON-OWNING view of the source's buf_a.
//                                       //   This is exactly why the dtor tests owns_a==1
//                                       //   before delete[].
//   +0x60   24    CMTime  t2           // ctor default @0x2780a-0x27815, copy @0x27854-0x27860
//   +0x78   24    CMTime  t3           // ctor default @0x27811-0x2781f, copy @0x27864-0x27873
//   +0x90   4     i32     count_b      // `movl %ecx,0x90(%rdi)` @0x27880  (also zeroed @0x277ef)
//   +0x98   8     T*      buf_b        // `movq %rax,0x98(%rdi)` @0x27893  (also zeroed @0x277f5)
//   +0xa0   1     u8      owns_b       // `movb %al,0xa0(%rdi)` @0x27886 (same %al==0 story
//                                       //   as owns_a; the copy is a non-owning view of buf_b).
//                                       //   Total struct size >= 0xa1 bytes (likely padded to
//                                       //   0xa8 for 8-byte alignment).
//   sizeof(OZCurveNodeParam) = 0xa8 bytes (0xa0 + 1-byte flag, rounded up to 8-byte alignment).
//
// ---------------------------------------------------------------------------
// Cited callees / RIP constants:
//   _kCMTimeZero              @ProChannel  literal-pool ref @0x277ca
//                             (already ported: raw-port/src/infra/CMTime.ts kCMTimeZero)
//   operator delete[](void*)  @ProChannel  __stubs 0xacdfe  (mangled __ZdaPv)
//                             — libc++ ABI, deallocates an array new'd with `new T[]`.
//
// The dtor jumps into __ZdaPv (@0x278e8) for the second free path — i.e. it's
// a musttail — so the operator delete[] itself is the last thing called. That
// TCO detail doesn't change semantics; the port issues both frees sequentially.

import { CMTime, kCMTimeZero } from "../infra/CMTime";

/**
 * OZCurveNodeParam — one parameter's animation-curve payload inside a
 * ProChannel curve node. Layout recovered from the copy ctor at
 * @ProChannel 0x277ba (see file header for the byte-exact field map).
 *
 * The two "buf_*" pointers each hold a `new T[]` array whose element type is
 * NOT observable from OZCurveNodeParam::OZCurveNodeParam(const&) or ~OZCurveNodeParam()
 * — the only visible operations on them are: (a) the copy ctor copies the
 * pointer verbatim while marking the destination non-owning, and (b) the dtor
 * `delete[]`s them when the object owns them. That means the concrete element
 * type is determined by the OZCurveNodeParam constructor(s) NOT ported here.
 * A follow-up port of the primary ctor (not in the nm-visible set for this
 * class) will pin it down.
 */
export interface OZCurveNodeParam {
  /** +0x00 — 1-byte flag. Purpose not decoded (copied verbatim by copy ctor). */
  flag_a: number;   // u8
  /** +0x01 — 1-byte flag. Purpose not decoded (copied verbatim by copy ctor). */
  flag_b: number;   // u8
  /** +0x08 — 8-byte double, copied by the ctor as `movsd` (@0x278a4). Purpose
   *  not decoded from these two methods. */
  scalar: number;   // f64

  /** +0x18 — first CMTime (init to kCMTimeZero @0x277d1, then copied from src). */
  t0: CMTime;
  /** +0x30 — second CMTime (init to kCMTimeZero @0x27802-0x27815). */
  t1: CMTime;
  /** +0x60 — third  CMTime (init to kCMTimeZero @0x2780a-0x27815). */
  t2: CMTime;
  /** +0x78 — fourth CMTime (init to kCMTimeZero @0x27811-0x2781f). */
  t3: CMTime;

  /** +0x48 — i32 (element-count / capacity for buf_a). */
  count_a: number;      // i32
  /** +0x50 — heap array `new T[]`, freed by `operator delete[]` @0x278ce
   *  when owns_a==1. Element type not observable from these two methods. */
  buf_a: unknown[] | null;
  /** +0x58 — u8. 1 => this object owns buf_a and must delete[] it in dtor. */
  owns_a: number;       // u8

  /** +0x90 — i32 (element-count / capacity for buf_b). */
  count_b: number;      // i32
  /** +0x98 — heap array `new T[]`, freed by `operator delete[]` @0x278e8
   *  when owns_b==1. Element type not observable from these two methods. */
  buf_b: unknown[] | null;
  /** +0xa0 — u8. 1 => this object owns buf_b and must delete[] it in dtor. */
  owns_b: number;       // u8
}

/**
 * OZCurveNodeParam::OZCurveNodeParam(OZCurveNodeParam const& src)  @ProChannel 0x277ba
 *
 * Copy constructor. In C++ it would write into a raw allocation `*this`; in
 * TypeScript we allocate a fresh object and return it.
 *
 * Faithful two-phase transcription of the asm:
 *
 *   PHASE 1 — default-initialize `*this` (as if the object were being built
 *   fresh before the copy overwrites much of it):
 *     @0x277be xorl %eax,%eax                     ; eax = 0 (byte/word source for zeros)
 *     @0x277c0 movl %eax,0x48(%rdi)               ; count_a = 0
 *     @0x277c3 movq %rax,0x50(%rdi)               ; buf_a   = nullptr
 *     @0x277c7 movb %al ,0x58(%rdi)               ; owns_a  = 0
 *     @0x277ca movq _kCMTimeZero (%rip),%rcx      ; rcx = &_kCMTimeZero
 *     @0x277d1..@0x277dc  t0 = _kCMTimeZero        (16-byte movups + 8-byte movq)
 *     @0x277e0..@0x277eb  t1 = _kCMTimeZero        (same pattern)
 *     @0x277ef movl %eax,0x90(%rdi)               ; count_b = 0
 *     @0x277f5 movq %rax,0x98(%rdi)               ; buf_b   = nullptr
 *     @0x277fc movb %al ,0xa0(%rdi)               ; owns_b  = 0
 *     @0x27802..@0x27815 t2 = _kCMTimeZero
 *     @0x2781c..@0x27822 t3 = _kCMTimeZero
 *
 *   PHASE 2 — copy fields from `src` (in-memory order below matches the asm
 *   sequence exactly, offset by offset):
 *     @0x27823..@0x2782f  t0 <- src.t0             (8B hi then 16B lo)
 *     @0x27833..@0x2783f  t1 <- src.t1
 *     @0x27843..@0x27846  count_a <- src.count_a
 *     @0x27849            owns_a  <- %al == 0      ; force-zero (COPY IS NON-OWNING)
 *     @0x2784c..@0x27850  buf_a   <- src.buf_a     (verbatim pointer copy)
 *     @0x27854..@0x27860  t2 <- src.t2
 *     @0x27864..@0x27873  t3 <- src.t3
 *     @0x2787a..@0x27880  count_b <- src.count_b
 *     @0x27886            owns_b  <- %al == 0      ; force-zero (COPY IS NON-OWNING)
 *     @0x2788c..@0x27893  buf_b   <- src.buf_b
 *     @0x2789a..@0x2789c  flag_a  <- src.flag_a    (byte)
 *     @0x2789e..@0x278a1  flag_b  <- src.flag_b    (byte)
 *     @0x278a4..@0x278a9  scalar  <- src.scalar    (8-byte double via movsd)
 *
 * Return-by-value: the C++ ABI writes into the passed-in `%rdi` `*this`. Here
 * we return a fresh object.
 */
export function OZCurveNodeParam_copyCtor(src: OZCurveNodeParam): OZCurveNodeParam {
  // PHASE 1 defaults (@0x277be-0x27822). Every field is overwritten in PHASE
  // 2 EXCEPT owns_a (@0x27849) and owns_b (@0x27886), which stay 0 — this is
  // the key semantic difference of "copy": the new object is a NON-OWNING
  // view of src's two heap buffers. The dtor guards delete[] on owns_*==1,
  // so the copy will never double-free src's buffers.
  const out: OZCurveNodeParam = {
    flag_a: 0,
    flag_b: 0,
    scalar: 0,
    t0: kCMTimeZero,
    t1: kCMTimeZero,
    t2: kCMTimeZero,
    t3: kCMTimeZero,
    count_a: 0,
    buf_a: null,
    owns_a: 0,
    count_b: 0,
    buf_b: null,
    owns_b: 0,
  };

  // PHASE 2 copy (asm order):
  out.t0      = src.t0;                             // @0x27823..0x2782f
  out.t1      = src.t1;                             // @0x27833..0x2783f
  out.count_a = src.count_a | 0;                    // @0x27843..0x27846 (i32)
  out.owns_a  = 0;                                  // @0x27849 (forced 0, see doc)
  out.buf_a   = src.buf_a;                          // @0x2784c..0x27850 (verbatim ptr)
  out.t2      = src.t2;                             // @0x27854..0x27860
  out.t3      = src.t3;                             // @0x27864..0x27873
  out.count_b = src.count_b | 0;                    // @0x2787a..0x27880 (i32)
  out.owns_b  = 0;                                  // @0x27886 (forced 0, see doc)
  out.buf_b   = src.buf_b;                          // @0x2788c..0x27893 (verbatim ptr)
  out.flag_a  = src.flag_a & 0xff;                  // @0x2789a..0x2789c (u8)
  out.flag_b  = src.flag_b & 0xff;                  // @0x2789e..0x278a1 (u8)
  out.scalar  = src.scalar;                         // @0x278a4..0x278a9 (f64 via movsd)
  return out;
}

/**
 * OZCurveNodeParam::~OZCurveNodeParam()                          @ProChannel 0x278b0
 *
 * Frees the two heap arrays iff this object owns them. Faithful mirror of
 * the asm control flow — two independent guarded delete[] calls:
 *
 *   @0x278b9 cmpb $0x1,0xa0(%rdi)          ; if (owns_b == 1) {
 *   @0x278c0 jne  0x278d3                  ;
 *   @0x278c2 movq 0x98(%rbx),%rdi          ;   T* p = buf_b
 *   @0x278c9 testq %rdi,%rdi               ;   if (p != nullptr)
 *   @0x278cc je   0x278d3                  ;
 *   @0x278ce callq __ZdaPv (@0xacdfe)      ;     operator delete[](p)
 *                                          ; }
 *   @0x278d3 cmpb $0x1,0x58(%rbx)          ; if (owns_a == 1) {
 *   @0x278d7 jne  0x278ed                  ;
 *   @0x278d9 movq 0x50(%rbx),%rdi          ;   T* q = buf_a
 *   @0x278dd testq %rdi,%rdi               ;   if (q != nullptr)
 *   @0x278e0 je   0x278ed                  ;
 *   @0x278e8 jmp  __ZdaPv (@0xacdfe)       ;     musttail operator delete[](q)
 *                                          ; }
 *   @0x278ed ret
 *
 * The musttail on the second free is a compiler tail-call optimization; the
 * observable behavior is identical to a plain call+ret.
 *
 * NOTE: `~OZCurveNodeParam` is D2 (base-object destructor), NOT D0 (deleting
 * destructor). It frees the OWNED heap contents but does NOT `delete` the
 * OZCurveNodeParam itself — the caller manages that memory. In a GC'd
 * language this means: after the caller drops its last reference to the
 * OZCurveNodeParam we still want to have released the two buffers, so this
 * port nulls the pointers as it "frees" them.
 */
export function OZCurveNodeParam_dtor(self: OZCurveNodeParam): void {
  // @0x278b9-0x278d3: if (owns_b == 1 && buf_b != null) delete[] buf_b;
  if ((self.owns_b & 0xff) === 1) {
    if (self.buf_b !== null) {
      // @0x278ce callq operator delete[](void*)  __ZdaPv @0xacdfe
      // TypeScript has no explicit delete[]; drop the reference so the array
      // can be GC'd. This preserves the ownership semantics of the free.
      self.buf_b = null;
    }
  }
  // @0x278d3-0x278ed: if (owns_a == 1 && buf_a != null) delete[] buf_a;  (tail-called)
  if ((self.owns_a & 0xff) === 1) {
    if (self.buf_a !== null) {
      // @0x278e8 jmp operator delete[](void*)  __ZdaPv @0xacdfe  (musttail)
      self.buf_a = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════
// SECOND FRAMEWORK: the same C++ class is compiled into Ozone as well
// ═══════════════════════════════════════════════════════════════════════════════════════════
// Everything above this line was transcribed from ProChannel. `OZCurveNodeParam` is also emitted
// into Ozone.framework — the class is passed by reference across the curve-node API there
// (`OZSimulationCurveNode::solveNode(OZCurveNodeParam&)` @Ozone 0x208d20,
//  `OZBehaviorCurveNode::solveNode(OZCurveNodeParam&)` @Ozone 0x20b8f0,
//  `OZMotionPathCurveNode::solveNode(OZCurveNodeParam&)` @Ozone 0x40d570, and ~20 more), so the
// compiler emitted its own copy of the inline destructor into that binary. Ozone's copy is its
// OWN ledger unit with its OWN address, which is why it is transcribed below instead of being
// treated as a duplicate of the ProChannel dtor. Ozone defines exactly one destructor symbol for
// the class (D1 @0x1dff20); there is no separate D0/D2 there.
//
// This is also an INDEPENDENT confirmation of the layout documented in the file header: the Ozone
// body, compiled from the same header into a different framework, tests and loads exactly the
// same four offsets — owns_b +0xa0, buf_b +0x98, owns_a +0x58, buf_a +0x50.

/**
 * `OZCurveNodeParam::~OZCurveNodeParam()` — @Ozone 0x1dff20
 *   `__ZN16OZCurveNodeParamD1Ev`  (D1, complete-object destructor)
 *
 * Disassembly (regenerate with
 *   `bash raw-port/tools/disasm.sh --sym __ZN16OZCurveNodeParamD1Ev Ozone`):
 *   raw-port/re/disasm/__ZN16OZCurveNodeParamD1Ev.s   (24 lines)
 *
 * FULL transcription — every instruction, in order:
 *
 *   0x1dff20  cmpb  $0x1,0xa0(%rdi)     ; if (owns_b != 1)
 *   0x1dff27  jne   0x1dff4f            ;   goto second_free
 *   0x1dff29  movq  0x98(%rdi),%rax     ; rax = buf_b
 *   0x1dff30  testq %rax,%rax           ; if (buf_b == nullptr)
 *   0x1dff33  je    0x1dff4f            ;   goto second_free
 *   0x1dff35  pushq %rbp                ; (frame set up ONLY on the calling path)
 *   0x1dff36  movq  %rsp,%rbp
 *   0x1dff39  pushq %rbx
 *   0x1dff3a  pushq %rax                ; stack alignment
 *   0x1dff3b  movq  %rdi,%rbx           ; save this across the call
 *   0x1dff3e  movq  %rax,%rdi           ; arg = buf_b
 *   0x1dff41  callq 0x6dfc30            ; symbol stub for __ZdaPv = operator delete[](void*)
 *   0x1dff46  movq  %rbx,%rdi           ; restore this
 *   0x1dff49  addq  $0x8,%rsp ; popq %rbx ; popq %rbp
 *   0x1dff4f  cmpb  $0x1,0x58(%rdi)     ; second_free: if (owns_a != 1)
 *   0x1dff53  jne   0x1dff62            ;   return
 *   0x1dff55  movq  0x50(%rdi),%rdi     ; rdi = buf_a
 *   0x1dff59  testq %rdi,%rdi           ; if (buf_a != nullptr)
 *   0x1dff5c  jne   0x6dfc30            ;   musttail operator delete[](buf_a)
 *   0x1dff62  retq
 *   0x1dff63  nopw  %cs:(%rax,%rax)     ; alignment padding, never executed
 *
 * Two independent guarded `delete[]`s, buf_b first then buf_a, each requiring BOTH
 * `owns_* == 1` (an exact byte compare against 1, not a truthiness test) AND a non-null pointer.
 * Instruction-for-instruction the same shape as the ProChannel D2 @0x278b0 above, with two
 * codegen-only differences that carry no semantics: Ozone skips the frame prologue entirely on
 * the paths that never call (the prologue is emitted inside the first branch), and the final
 * `delete[]` is reached by a conditional jump straight into the stub rather than a compare-then-
 * tail-jump. Neither is observable.
 *
 * As with the ProChannel dtor, this is a base/complete-object destructor: it releases the owned
 * heap arrays but does NOT free the OZCurveNodeParam itself. TypeScript has no `delete[]`, so the
 * port drops the references — the same modelling the ProChannel dtor above uses.
 */
export function OZCurveNodeParam_dtor_d1(self: OZCurveNodeParam): void {
  // @0x1dff20..0x1dff33 — if (owns_b == 1 && buf_b != null) delete[] buf_b;
  if ((self.owns_b & 0xff) === 1) {
    if (self.buf_b !== null) {
      // @0x1dff41 callq operator delete[](void*)  __ZdaPv (Ozone stub 0x6dfc30)
      self.buf_b = null;
    }
  }
  // @0x1dff4f..0x1dff5c — if (owns_a == 1 && buf_a != null) delete[] buf_a;  (tail-jumped)
  if ((self.owns_a & 0xff) === 1) {
    if (self.buf_a !== null) {
      // @0x1dff5c jne operator delete[](void*)  __ZdaPv (Ozone stub 0x6dfc30)
      self.buf_a = null;
    }
  }
}
