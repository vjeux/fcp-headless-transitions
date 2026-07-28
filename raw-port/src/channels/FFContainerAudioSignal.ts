// FFContainerAudioSignal — Flexo audio-signal container base. Extends
// FFAudioSignal (see raw-port/src/channels/FFAudioSignal.ts) by carrying an
// owned std::vector<FFAudioSignal*> of child signals and a construction-time
// switch that either DEEP-COPIES the caller's vector (via
// FFAudioSignal::copyList) or ADOPTS the caller's raw pointers verbatim
// (raw memcpy of begin..end into a freshly-allocated backing store).
//
// Faithful transcription of Flexo class FFContainerAudioSignal (6 exported
// methods; 4 unique bodies — the two ~FFContainerAudioSignal() entries at
// 0x1258360 and 0x14910d0/0x14910e0 are the C2/D2 body, the C1/D1 thunk that
// alias the same code, and the deleting-destructor D0 which is a `ud2` stub).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh + awk-slice of
// /tmp/Flexo_tV.txt — the fat-binary x86_64 slice at file offset 0x4000):
//   raw-port/re/disasm/Flexo.FFContainerAudioSignal.ctor.s           (@0x1258210, 83 lines)
//   raw-port/re/disasm/Flexo.FFContainerAudioSignal.deleteSignals.s  (@0x1258310, 27 lines)
//   raw-port/re/disasm/Flexo.FFContainerAudioSignal.dtor.s           (@0x1258360, 39 lines)
//   raw-port/re/disasm/Flexo.FFContainerAudioSignal.copySignals.s    (@0x12583d0, 117 lines)
//   raw-port/re/disasm/Flexo.FFContainerAudioSignal.D0.s             (@0x14910e0, 5 lines — `ud2`)
// Framework: Final Cut Pro / Flexo.framework
//
// DECODE — struct layout (recovered from ctor field writes + vtable dump
//   `python3 raw-port/army/tools/resolve.py Flexo vtable FFContainerAudioSignal`):
//   +0x00  vtable*        vtbl        // installed at ctor @0x125822c/@0x1258233:
//                                     //   `leaq 0x6c96cd(%rip), %rax; movq %rax, (%rdi)`
//                                     //   → 0x1921900 = FFContainerAudioSignal vtable
//                                     //   installed-ptr slot.
//   +0x08  FFAudioSignal shape        // period (+0x08) / phase (+0x10) / repeat (+0x18)
//                                     //   inherited from FFAudioSignal; the ctor zeros
//                                     //   period+phase via `movups %xmm0, 0x8(%rdi)`
//                                     //   @0x1258224 and zeroes repeat with
//                                     //   `movb $0x0, 0x18(%rdi)` @0x1258228.
//   +0x20  FFAudioSignal**  begin     // std::vector<FFAudioSignal*> — first triple.
//   +0x28  FFAudioSignal**  end       //   Written by the two construction paths:
//   +0x30  FFAudioSignal**  cap       //   ownership==0 → copyList clones each element
//                                     //     (calls into FFAudioSignal::copyList @0x1258295);
//                                     //   ownership!=0 → raw memcpy of caller's begin..end
//                                     //     (see @0x125824a..@0x1258287 for the __Znwm +
//                                     //     memcpy + begin/end/cap store trio).
//
// VTABLE (from `resolve.py Flexo vtable FFContainerAudioSignal` — installed
// ptr 0x1921900, in-object slot at +0x00):
//   *0x00 -> 0x14910d0  ~FFContainerAudioSignal (D1 thunk / same body as D2)
//   *0x08 -> 0x14910e0  ~FFContainerAudioSignal (D0 deleting; body @0x14910e0 = ud2)
//   *0x10 -> 0x1361     unresolved (typically the "copySignal()" clone slot on
//                       FFAudioSignal — the container base itself has no clone
//                       body; concrete subclasses at *0x48/*0x80/*0xb8/*0xf0
//                       provide FFSerial/FFParallel/FFScaled/FFSingleTone
//                       copySignal overrides).
//   *0x18 -> 0x12592b0  FFAudioSignal::isIndefiniteSignal() const (returns false)
//   *0x20 -> 0x1361     unresolved (processSamples base slot on FFAudioSignal —
//                       overridden per-subclass at *0x58/*0x90/*0xc8/*0x100).
//   *0x30 -> 0x1921a08  typeinfo for FFSerialAudioSignal (first known subclass)
//   *0x68 -> 0x1921a38  typeinfo for FFParallelAudioSignal
//   *0xa0 -> 0x1921a50  typeinfo for FFScaledAudioSignal
//   *0xd8 -> 0x1921a68  typeinfo for FFSingleToneAudioSignal
// So FFContainerAudioSignal is the direct base of the FF*AudioSignal
// arithmetic-composition family. It has no float math of its own; it only
// owns the child-signal list and delegates render/copy to subclass vtable
// slots.
//
// Numeric contract:
//   No float arithmetic in any of the transcribed bodies. All ops are 64-bit
//   pointer/int moves + memcpy + operator new / delete. Reproducing bit-for-
//   bit is trivial; the semantic surface is the ownership branch (deep-copy
//   via FFAudioSignal.copyList vs raw ADOPT via memcpy).

import { FFAudioSignal } from "./FFAudioSignal";

/**
 * Enum matching the mangled `27FFAudioSignalInputOwnership` ctor param.
 * Ctor test @0x125823a is `testl %edx, %edx; je 0x1258292` — the JE branch
 * (edx == 0) takes the DEEP-COPY (copyList) path; the fall-through (edx != 0)
 * takes the ADOPT-RAW path. The C++ enum name isn't stored in symbol tables
 * but the values are 0 = copy, nonzero = adopt/take.
 */
export enum FFAudioSignalInputOwnership {
  /**
   * ownership == 0 branch — ctor @0x1258292 falls through to
   * `callq __ZN13FFAudioSignal8copyListERKNSt3__16vectorIPS_...` @0x1258295,
   * which deep-clones every input via vtable slot +0x10 into `this->begin..end`.
   */
  DeepCopy = 0,
  /**
   * ownership != 0 branch — ctor @0x125823e..@0x1258287 raw-memcpys the
   * caller's vector's begin..end into a fresh `operator new(size)` buffer
   * (__Znwm @0x125825f + memcpy @0x1258282).
   */
  Adopt = 1,
}

/**
 * FFContainerAudioSignal — Flexo container audio signal (base of
 * FFSerialAudioSignal / FFParallelAudioSignal / FFScaledAudioSignal /
 * FFSingleToneAudioSignal per the vtable dump above).
 *
 * The base class owns a std::vector<FFAudioSignal*> (`signals`) plus the
 * three inherited FFAudioSignal fields (period, phase, repeat — all
 * zero-initialised by the ctor). It does not implement its own render
 * primitive; virtual dispatch flows through the subclass vtable slot for
 * `processSamples` and `copySignal`.
 */
export class FFContainerAudioSignal extends FFAudioSignal {
  /**
   * Backing storage for the std::vector<FFAudioSignal*> at +0x20/+0x28/+0x30.
   * In C++ the triple is (begin, end, cap); in the port a plain JS array
   * models the same "owned array of child signals". Every mutation site in
   * the transcribed methods below is annotated with its @0xADDR.
   */
  signals: FFAudioSignal[] = [];

  /**
   * `FFContainerAudioSignal::FFContainerAudioSignal(std::vector<FFAudioSignal*> const&, FFAudioSignalInputOwnership)`
   *   @0x1258210
   *   (__ZN22FFContainerAudioSignalC2ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership).
   *
   * Prologue @0x1258210..0x125821d saves callee-saved regs and spills rdi/
   * rsi into rbx/r12 registers for reuse across the copy paths.
   *
   * Body:
   *   @0x1258221  xorps %xmm0, %xmm0                ; zero SIMD zero-value
   *   @0x1258224  movups %xmm0, 0x8(%rdi)           ; period=0, phase=0
   *   @0x1258228  movb  $0x0, 0x18(%rdi)            ; repeat=0
   *   @0x125822c  leaq  0x6c96cd(%rip), %rax        ; rip-relative +0x125822c+7+0x6c96cd
   *                                                 ; = 0x1921900 (vtable installed ptr)
   *   @0x1258233  movq  %rax, (%rdi)                ; vtbl = &FFContainerAudioSignal::vtbl+16
   *   @0x1258236  leaq  0x20(%rdi), %r15            ; r15 = &this->signals (begin slot)
   *   @0x125823a  testl %edx, %edx                  ; ownership == 0 ?
   *   @0x125823c  je    0x1258292                   ; if 0 → DeepCopy branch
   *
   *   (ADOPT branch — ownership != 0)
   *   @0x125823e  movups %xmm0, (%r15)              ; begin=NULL, end=NULL
   *   @0x1258242  movq   $0x0, 0x10(%r15)           ; cap=NULL (empty vector state)
   *   @0x125824a  movq  (%rsi), %r12                ; r12 = caller.begin
   *   @0x125824d  movq  0x8(%rsi), %r13              ; r13 = caller.end
   *   @0x1258251  subq  %r12, %r13                  ; r13 = size-in-bytes = end - begin
   *   @0x1258254  je    0x12582bf                   ; size==0 → done (return)
   *   @0x1258256  js    0x12582ed                   ; size<0  → throw_length_error
   *   @0x125825c  movq  %r13, %rdi
   *   @0x125825f  callq __Znwm                      ; buf = operator new(sizeBytes)
   *   @0x1258264  movq  %rax, %r14
   *   @0x1258267  movq  %rax, 0x20(%rbx)            ; this.begin = buf
   *   @0x125826b  movq  %rax, 0x28(%rbx)            ; this.end   = buf  (will fix below)
   *   @0x125826f  movq  %rax, %r15
   *   @0x1258272  addq  %r13, %r15                  ; r15 = buf + sizeBytes
   *   @0x1258275  movq  %r15, 0x30(%rbx)            ; this.cap   = buf + sizeBytes
   *   @0x1258279  callq _memcpy(buf, caller.begin, sizeBytes)
   *   @0x1258287  movq  %r15, 0x28(%rbx)            ; this.end   = buf + sizeBytes
   *   (There is a post-memcpy loop @0x12582b0..0x12582eb that walks the
   *    freshly-adopted pointer array and, for every NON-NULL entry, invokes
   *    `*(*ptr + 8)(ptr)` — which on the FFAudioSignal vtable resolves to
   *    the copy-signal slot at +0x08. But that path is only reached via the
   *    unwind cleanup landing pad; on the normal fall-through the function
   *    returns after storing this.end. Do not model that side-effect in the
   *    happy path — see the JS branch structure below.)
   *
   *   (DEEPCOPY branch — ownership == 0)
   *   @0x1258292  movq  %r15, %rdi                  ; rdi = &this.signals
   *   @0x1258295  callq FFAudioSignal::copyList(vector<FFAudioSignal*> const&)
   *                                                 ; NOT: writes to this.signals directly.
   *                                                 ; Real signature per its own decode
   *                                                 ; (raw-port/src/channels/FFAudioSignal.ts)
   *                                                 ; is (dst_vec*, src_vec&) — the CALLER
   *                                                 ; owns dst_vec (here: this->signals) and
   *                                                 ; copyList populates it via per-element
   *                                                 ; vtable-slot-+0x10 clones.
   *
   * Post-branch @0x125829a..0x12582bf: reload begin/end and check invariants
   * (a no-op walk for cleanup purposes on the DEEPCOPY normal path);
   * epilogue @0x12582bf..0x12582cd pops the frame.
   *
   * FFAudioSignal::copyList @0x1257fa0 is not yet transcribed (its landed stub raises
   * with a citation to @0x1257fa0). That means when ownership == DeepCopy
   * the ctor can only surface the correct FRONTIER — it re-raises copyList's
   * decode-pending error.
   *
   * IMPORTANT: this constructor is C2 (subobject-init variant); the C1
   * (complete-object) variant is a thunk that jumps to the same body. The
   * class does not carry a distinct C1 in this framework's symbol table
   * (only C2 is exported).
   */
  constructor(
    input: readonly FFAudioSignal[],
    ownership: FFAudioSignalInputOwnership,
  ) {
    super();
    // @0x1258224 — period, phase zeroed by base ctor's field defaults.
    // @0x1258228 — repeat zeroed by base ctor's field default.
    // @0x1258233 — vtbl install; in the TS port the JS class identity
    // stands in for the raw vtable-pointer field (see FFAudioSignal DECODE).
    if (ownership !== FFAudioSignalInputOwnership.DeepCopy) {
      // @0x125823e..@0x1258287 — ADOPT branch. Raw-take the caller's list.
      // In C++ this is a memcpy of the raw FFAudioSignal* pointer array;
      // in the port we splat the same references (JS array holds references
      // by identity, matching the C++ raw-pointer semantics).
      this.signals = input.slice();
    } else {
      // @0x125823c/@0x1258292/@0x1258295 — DEEPCOPY branch.
      // Delegates to FFAudioSignal::copyList which per-element clones via
      // each child's vtable slot +0x10. That callee is not yet transcribed
      // (raise cites @0x1257fa0); the branch is preserved verbatim.
      this.signals = FFAudioSignal.copyList(input as FFAudioSignal[]);
    }
  }

  /**
   * `FFContainerAudioSignal::deleteSignals()` @0x1258310
   *   (__ZN22FFContainerAudioSignal13deleteSignalsEv).
   *
   * Walks the owned signals vector and invokes each non-null child's
   * vtable-slot-+0x08 (the deleting-destructor D0 for FFAudioSignal, i.e.
   * `delete child;`). The vector layout itself (the begin/end/cap triple
   * at +0x20/+0x28/+0x30) is NOT deallocated here; the dtor does that.
   *
   * Instructions:
   *   @0x1258317  movq 0x20(%rdi), %r14      ; r14 = signals.begin
   *   @0x125831b  movq 0x28(%rdi), %rax      ; rax = signals.end
   *   @0x125831f  cmpq %rax, %r14
   *   @0x1258322  je   0x125834d              ; empty → epilogue
   *   (loop @0x1258339..0x125834b:)
   *   @0x1258339  movq (%r14), %rdi           ; rdi = child ptr
   *   @0x125833c  testq %rdi, %rdi            ; child != NULL ?
   *   @0x125833f  je   0x1258330              ; NULL → advance
   *   @0x1258341  movq (%rdi), %rax           ; rax = child->vtbl
   *   @0x1258344  callq *0x8(%rax)            ; child->vtbl[+0x08]() —
   *                                           ;   deleting destructor slot
   *   @0x1258347  movq 0x28(%rbx), %rax       ; reload signals.end (may have
   *                                           ;   moved if child dtor
   *                                           ;   mutated the container —
   *                                           ;   defensive re-read)
   *   @0x1258330  addq $0x8, %r14             ; ++it
   *   @0x1258334  cmpq %rax, %r14
   *   @0x1258337  je   0x125834d              ; end reached → epilogue
   *   epilogue @0x125834d..0x1258351.
   *
   * In TS the "deleting destructor" of a signal is a no-op (GC owns the
   * lifetime) — we mirror the loop shape but drop each reference by
   * clearing the array in place. Downstream code that relies on JS GC
   * finalizers is not modelled here; the semantic content of the FCP call
   * is "release each child".
   */
  deleteSignals(): void {
    // @0x1258317..0x1258351 — walk children; each non-null child's
    // vtable+0x08 (deleting dtor) is invoked. Under JS GC we drop refs.
    // The loop is preserved as an explicit iteration to keep the shape
    // one-to-one with the disasm even though the body reduces to nothing.
    for (let i = 0; i < this.signals.length; i++) {
      const child = this.signals[i];
      if (child === null || child === undefined) {
        // @0x125833c/@0x125833f — testq %rdi,%rdi; je (skip NULL entries)
        continue;
      }
      // @0x1258341/@0x1258344 — child->vtbl[+0x08]() (deleting destructor).
      // JS: GC drops when the array reference goes; nothing to do here.
      // We do NOT clear per-slot here — the epilogue leaves begin/end
      // untouched (deleteSignals only frees the children, not the vector).
    }
    // Note: the disasm does NOT null out entries nor reset end; it just
    // walks. The caller (usually the dtor) is responsible for freeing the
    // vector storage next. We preserve that invariant.
  }

  /**
   * `FFContainerAudioSignal::~FFContainerAudioSignal()` @0x1258360
   *   (__ZN22FFContainerAudioSignalD2Ev).
   *
   * The D2 (subobject) destructor body — also aliased at 0x14910d0 as the
   * non-deleting D1 destructor entry per the vtable dump. Structure:
   *   (1) restore the FFContainerAudioSignal vtable slot on `this` (in case
   *       a subclass dtor previously overwrote it during virtual-chain
   *       teardown) — @0x125836a `leaq 0x6c958f(%rip), %rax`; @0x1258371
   *       `movq %rax, (%rdi)` — same +0x6c958f offset math resolves to
   *       0x1921900 (the same vtable installed-ptr slot as ctor).
   *   (2) run the deleteSignals loop inline (identical shape to
   *       deleteSignals() @0x1258310) @0x1258374..0x12583c4.
   *   (3) if this.begin != NULL, call `operator delete(this.begin)`
   *       (__ZdlPv @0x1497404) via a tail-jump @0x1258386..0x1258391 —
   *       which frees the vector's backing storage.
   *
   * Instructions summary (39 lines):
   *   @0x125836a  leaq 0x6c958f(%rip), %rax    ; vtable install ptr
   *   @0x1258371  movq %rax, (%rdi)            ; restore this.vtbl
   *   @0x1258374..0x12583c4  <inline deleteSignals loop>
   *   @0x12583bd  movq 0x20(%rbx), %r14        ; r14 = signals.begin
   *   @0x12583c1  testq %r14, %r14             ; begin != NULL ?
   *   @0x12583c4  jne  0x1258386               ; free path
   *   @0x1258386  movq %r14, 0x28(%rbx)        ; this.end = begin (empty)
   *   @0x125838a  movq %r14, %rdi              ; rdi = begin
   *   @0x125838d..0x1258391  epilogue + tail-jump to operator delete
   *
   * The D0 (deleting) destructor at 0x14910e0 is exactly:
   *   pushq %rbp; movq %rsp, %rbp; ud2
   * It cannot be reached at runtime — a `ud2` traps. Meaning: the compiler
   * knows this class is never deleted via a base pointer to
   * FFContainerAudioSignal itself (only via subclass vtables). We surface
   * the same "unreachable" contract in the TS port.
   */
  destroy(): void {
    // @0x1258374..0x12583c4 — inline deleteSignals equivalent. JS GC drops
    // refs when we clear the array; we mirror the loop for provenance.
    this.deleteSignals();
    // @0x12583c1/@0x1258391 — if begin != NULL, `operator delete(begin)`.
    // In TS the "vector backing store" is the JS array itself; clearing
    // it releases the child references and drops the (implicit) buffer.
    this.signals = [];
  }

  /**
   * `FFContainerAudioSignal::~FFContainerAudioSignal()` @0x14910d0
   *   (__ZN22FFContainerAudioSignalD1Ev — deleting-thunk alias of D2 body).
   *
   * Not a distinct function body in the disassembly — the D1 entry at
   * 0x14910d0 is the same 5 instructions as the tiny `ud2`-terminated D0
   * stub at 0x14910e0 in the transcribed slice. In practice this address
   * is the D1 thunk that shares the D2 body via ICF; either way TS
   * doesn't need a separate entry point (JS uses one class-level dtor).
   *
   * See destroy() above for the shared body.
   *
   *   @0x14910e0  pushq %rbp
   *   @0x14910e1  movq  %rsp, %rbp
   *   @0x14910e4  ud2               ; trap — unreachable
   */
  destroyDeleting(): never {
    // @0x14910e4 — ud2. The compiler emitted a trap-only D0 because this
    // base class is never deleted through a FFContainerAudioSignal*
    // pointer directly (subclass vtables always resolve first). Raise to
    // preserve the semantic — the address is decoded, the intent is to
    // never reach here.
    throw new Error(
      "FFContainerAudioSignal::~FFContainerAudioSignal (D0 deleting) @0x14910e0 is `ud2` — unreachable trap; deletion must go through a concrete subclass vtable slot (FFSerial/FFParallel/FFScaled/FFSingleTone) — see resolve.py Flexo vtable FFContainerAudioSignal for the *0x38/*0x70/*0xa8/*0xe0 slots",
    );
  }

  /**
   * `FFContainerAudioSignal::copySignals() const` @0x12583d0
   *   (__ZNK22FFContainerAudioSignal11copySignalsEv).
   *
   * Signature (SysV):
   *   %rdi = out — a caller-supplied std::vector<FFAudioSignal*>* to be
   *                filled with clones of `this->signals`. The caller
   *                allocated the storage; this function initialises it.
   *   %rsi = this
   *
   * Prologue @0x12583d0..0x12583eb:
   *   @0x12583e1  xorps %xmm0, %xmm0
   *   @0x12583e4  movups %xmm0, (%rdi)            ; out.begin = out.end = NULL
   *   @0x12583eb  movq  $0x0, 0x10(%rdi)          ; out.cap = NULL
   *   @0x12583e7  movq  %rdi, -0x30(%rbp)         ; spill out*
   *   @0x12583f3  movq  0x20(%rsi), %r15          ; r15 = this.signals.begin
   *   @0x12583f7  movq  %rsi, -0x48(%rbp)         ; spill this*
   *   @0x12583fb  cmpq  0x28(%rsi), %r15
   *   @0x12583ff  je    0x1258506                 ; empty → out stays empty
   *
   * Main loop @0x125843c..0x1258501 (walks `it = this.signals.begin`,
   * incrementing by 8 bytes = 1 pointer, until it == this.signals.end):
   *   @0x1258440  movq (%r15), %rdi              ; rdi = *it (child*)
   *   @0x1258443  movq (%rdi), %rax              ; rax = child->vtbl
   *   @0x1258446  callq *0x10(%rax)              ; clone = child->vtbl[+0x10]()
   *                                              ; +0x10 is the "copySignal"
   *                                              ; virtual slot on FFAudioSignal
   *                                              ; (per resolve.py vtable dump of
   *                                              ; the subclasses at *0x48/*0x80/
   *                                              ; *0xb8/*0xf0).
   *   @0x1258449  movq %rax, %r13                ; r13 = clone
   *   @0x125844c..0x1258457 — grow-or-append the out-vector.
   *   Fast path (out has spare cap @0x1258410..0x1258418):
   *     movq %r13, (%r12)  ; *out.end = clone
   *     addq $0x8, %r12    ; ++out.end
   *   Slow path @0x1258459..0x12584fd — a hand-inlined std::vector::push_back
   *   grow. Computes:
   *     size    = (out.end - out.begin) >> 3
   *     newCap  = max(size + 1, min(2*size, 0x1fff...ffff)) with overflow
   *              clamp @0x1258488/0x125848b/0x125848f/0x125849c/0x12584a0.
   *     buf     = operator new(newCap * 8)   @0x12584b1
   *     *(buf + size*8) = clone              @0x12584be
   *     newEnd  = buf + (size+1)*8           @0x12584c2/@0x12584c6
   *     memcpy(buf, out.begin, size*8)       @0x12584df
   *     out.begin = buf, out.end = newEnd, out.cap = buf + newCap*8
   *     operator delete(old_begin) if non-NULL @0x12584f5/@0x12584f8
   *   Length-error / bad-array-new-length throws @0x125851e/@0x125852c.
   *
   * The FFAudioSignal-side "copySignal" vtable slot at +0x10 has no
   * concrete resolution on the base class (see the FFAudioSignal.ts port —
   * copyList's slot decode is still pending). The four known concrete
   * subclasses (FFSerial/FFParallel/FFScaled/FFSingleTone) each override
   * the slot; this function relies on that virtual dispatch.
   *
   * Because our TS port for FFAudioSignal does not yet expose a virtual
   * `copySignal()` method (that's part of the pending vtable decode), we
   * preserve the RAW SEMANTIC — "clone every child via its own
   * copySignal virtual" — but must raise on the concrete call, citing the
   * decoded address of the call site (@0x1258446 for the vtable dispatch).
   * The size / growth arithmetic is fully decoded and reproduced above in
   * the doc-comment; the port would re-emit that arithmetic once the
   * per-child clone is available.
   */
  copySignals(): FFAudioSignal[] {
    // @0x12583e4/@0x12583eb — out vector initialised empty.
    const out: FFAudioSignal[] = [];
    // @0x12583fb/@0x12583ff — empty-source short-circuit.
    if (this.signals.length === 0) {
      return out;
    }
    // @0x1258440..0x1258501 — per-child clone via vtable slot +0x10 on
    // FFAudioSignal (see the vtable dump above). No concrete FFAudioSignal
    // subclass yet exposes a TS copySignal binding — surface the frontier
    // by raising with the exact call-site citation.
    throw new Error(
      "FFContainerAudioSignal::copySignals() @0x12583d0 pending — per-child clone at @0x1258446 requires FFAudioSignal.copySignal() vtable slot +0x10; concrete implementations are FFSerial::copySignal @0x12586c0, FFParallel::copySignal @0x1258aa0, FFScaled::copySignal @0x1258e40, FFSingleTone::copySignal @0x1258f20 (see resolve.py Flexo vtable FFContainerAudioSignal)",
    );
  }
}
