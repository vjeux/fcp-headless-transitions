// OZTVRootDrag.ts — value-object representing a "root drag" in the Timeline-View editing model.
// Constructed once and stored inline in a `std::map<uint32_t, OZTVRootDrag>` (see the mangled
// symbol __ZNSt3__13mapIj12OZTVRootDrag...operator[](unsigned int&&) in Ozone's symtab).
// Verbatim from FCP's Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Fat binary x86_64 slice at file offset 16384.
//
// SYMBOLS OBSERVED — ONE ctor body (C1 aliases C2; the C2 body is the sole emitted symbol),
// NO dtor emitted (implying either an inlined trivial dtor or a header-only default).
//   @Ozone 0x0000000000167e90  OZTVRootDrag::OZTVRootDrag(CMTime, CMTime, PCTimeRange const&, double, CMTime, CMTime)  [C1==C2]
// The signature args (in the SysV AMD64 ABI, augmented for CMTime's size-24 by-value passing):
//   %rdi                  this
//   %rsi                  PCTimeRange const& range     (the "&" — reference — is a plain pointer)
//   %xmm0                 double d
//   %rdx / stack          CMTime arg1  (first CMTime — passed partly in %rdx/%rcx/%r8/%r9 registers
//                                       when small enough, else at 16(%rbp) upwards on the stack)
//   memory 0x10(%rbp)     CMTime arg1  (the ABI splits: first two 8B chunks in regs, last 8B on stk;
//                                       but this compiler chose the "all on stack" strategy for the
//                                       CMTime args — verified by the loads at 0x10/0x20/0x28/0x38
//                                       /0x40/0x50/0x58/0x68 relative to %rbp below)
//   memory 0x10(%rbp)     CMTime arg1 low 16 bytes
//   memory 0x20(%rbp)     CMTime arg1 high 8 bytes
//   memory 0x28(%rbp)     CMTime arg2 low 16 bytes
//   memory 0x38(%rbp)     CMTime arg2 high 8 bytes
//   memory 0x40(%rbp)     CMTime arg3 low 16 bytes
//   memory 0x50(%rbp)     CMTime arg3 high 8 bytes
//   memory 0x58(%rbp)     CMTime arg4 low 16 bytes
//   memory 0x68(%rbp)     CMTime arg4 high 8 bytes
// (CMTime is `struct { int64 value; int32 timescale; int32 flags; int64 epoch; }` = 24 bytes.
//  See raw-port/src/infra/CMTime.ts for the field layout — we reuse that binding here.)
//
// STRUCT LAYOUT (recovered from the ctor's writes to (%rdi), listed at their exact offsets):
//   +0x000..+0x018   CMTime  timeA         (first written from kCMTimeZero @0xe163eca..; then
//                                            OVERWRITTEN a second time @0x167f4e/0x167f55 from
//                                            arg 0x10(%rbp) low + 0x20(%rbp) high. The FINAL state
//                                            is arg1's value/timescale/flags/epoch. The two-pass
//                                            write is a real emitted pattern — the compiler pre-
//                                            zeros the slot before the possibly-throwing PC_CMTime
//                                            math below has a chance to leave it uninitialised on
//                                            the throw path.  Faithful port: replicate both writes.)
//   +0x018..+0x030   CMTime  timeB         (written from a computed CMTime — see math below —
//                                            @0x168046/0x16804e via `addq $0x18, %rbx` making
//                                            rbx = this+0x18 then storing.)
//   +0x030..+0x060   PCTimeRange range     (copied from (%rsi) — 4×8B copy of {start(CMTime),
//                                            duration(CMTime)}. Layout from CMTime.ts: PCTimeRange
//                                            = 2× CMTime = 48 bytes, so this maps to +0x30..+0x60.)
//   +0x060           void*   treeHeader.__parent_ = &this->treeHeader (self-referring;
//                                            standard libc++ __tree empty-sentinel init)
//   +0x068..+0x078   uint128 treeHeader body (zeroed via `xorps xmm1,xmm1; movups xmm1,0x68(rdi)`)
//   +0x078..+0x090   CMTime  arg2Copy      (copied from ctor stack: 0x10(%rbp) low, 0x20(%rbp) high)
//                                            NOTE this overlaps with the FIRST write of timeA at
//                                            +0x00 in terms of source arg — the ctor stores arg1's
//                                            bytes into BOTH +0x00 AND +0x78. Two distinct CMTime
//                                            fields, same initial value.
//   +0x090           double  d             (from %xmm0 @0x167f2c)
//   +0x098..+0x0a8   CMTime  arg3Copy      (copied from 0x40(%rbp)/0x50(%rbp))
//   +0x0a8           (no extra — struct ends at 0xa8 + 8-byte alignment slack = 0xb0 total)
// Total sizeof = 176 bytes (0xb0). This is enough to store 4 CMTimes + 1 PCTimeRange + 1 double +
// one libc++-tree-set header — matches the (huge) ctor signature.
//
// PC-TIME MATH BLOCK (@0x167f7c..0x168029) — computes timeB from the args:
//   1. @0x167f7c  callq CMTimeCompare(arg1, arg2)   ; two CMTimes passed on the stack
//   2. @0x167f81..0x167f83 test eax; jle 0x16802b  — if arg1 <= arg2 (cmp ≤ 0): SKIP the math and
//      fall to step 7 below (copy arg2 through unchanged into timeB slot).
//   3. Else (arg1 > arg2):
//   4. @0x167f89..0x167f94  xmm0 = |d|   (SSE `andps` with the 128-bit constant at VA 0x706e10 =
//      `{0x7fffffffffffffff, 0x7fffffffffffffff}` — clear the sign bit of both packed doubles;
//      only the low lane is used but the whole xmm register is masked.)
//   5. @0x167f9f  callq operator/(CMTime const&, double)  — computes `(arg2Copy) / |d|` and
//      writes the CMTime result to the stack slot at -0x98(%rbp).
//        Args: rdi = &result_out (-0x98(%rbp)), rsi = &arg2Copy (-0x80(%rbp)), xmm0 = |d|.
//   6. @0x167fb7  callq operator*(CMTime const&, double)  — computes `arg3Copy * 0.5` and writes
//      to stack slot at -0xc8(%rbp). The multiplier 0.5 is loaded from VA 0x706ea8 (double literal).
//        Args: rdi = -0xc8(%rbp), rsi = -0x30(%rbp) (== arg3Copy low+high stack region), xmm0 = 0.5.
//   7. @0x167ff2  callq PC_CMTimeSaferAdd(arg2Copy/|d|, arg3Copy*0.5)  — with args passed on the
//      stack at (%rsp) and 0x10/0x18/0x28(%rsp). Result at rdi = -0xb0(%rbp).
//   8. @0x168024  callq PC_CMTimeFloorToSampleDuration(sum, arg4Copy)  — snap `sum` to a multiple
//      of a sample duration (arg4 is presumably the sample rate). Result at rdi = -0x50(%rbp).
//   9. Fall through to store `-0x50(%rbp)` (low 16B) + `-0x40(%rbp)` (high 8B) into `this+0x18`.
//   (skip branch — 6..8 skipped when arg1 <= arg2):
//   @0x16802b..0x16803a  Load arg2 (from 0x28(%rbp)) low16B/high8B directly into -0x50(%rbp) /
//                        -0x40(%rbp). This is the plain "pass through" fallback for the arg1 ≤ arg2
//                        case: timeB = arg2 verbatim.
//   Then:
//   @0x16803e..0x1804e  addq $0x18, %rbx (making rbx point at this+0x18); store the -0x50 / -0x40
//                        buffer into `this+0x18` (16 bytes @ (rbx), 8 bytes @ 0x10(rbx)).
//
// EXCEPTION PATH (@0x168061..0x168076): a landing pad that walks the libc++ tree at (%r15)
// (== this+0x60) and calls `__ZNSt3__16__treeI9PCHash128...destroy(...)` on it before rethrowing
// via __Unwind_Resume. So the tree header type is std::__1::__tree<PCHash128, less<PCHash128>,
// allocator<PCHash128>> — i.e. a `std::set<PCHash128>` header embedded inline at +0x60. The
// destroy() call takes rsi = the root node loaded from (%r15) — which is the self-ref written
// @0x167f11, so at exception time the tree is empty and destroy() finds nothing to free. The
// path exists purely because the CMTime math could throw (rare but observable), and the compiler
// generates it defensively.
//
// FRONTIER CALLEES (Rule 3: undecoded → throw):
//   CMTimeCompare                                     _CMTimeCompare @Ozone stub 0x6dcab0   (imported from CoreMedia; already ported in raw-port/src/infra/CMTime.ts)
//   operator/(CMTime const&, double)                  __ZdvRK6CMTimed @Ozone stub 0x6dfc48  (not in existing CMTime.ts)
//   operator*(CMTime const&, double)                  __ZmlRK6CMTimed @Ozone stub 0x6dfc72  (see CMTime.ts::CMTimeMul_double — same operation, same signature)
//   PC_CMTimeSaferAdd                                 _PC_CMTimeSaferAdd @Ozone stub 0x6dcf06  (already ported in raw-port/src/infra/CMTime.ts)
//   PC_CMTimeFloorToSampleDuration                    _PC_CMTimeFloorToSampleDuration @Ozone stub 0x6dced6
//   std::__1::__tree<PCHash128, less<PCHash128>, allocator<PCHash128>>::destroy  (exception-path only)
//
// CONSTANTS EMBEDDED IN THE BODY:
//   @Ozone VA 0x706e10  128-bit SSE mask = {0x7fffffffffffffff, 0x7fffffffffffffff}
//                                        ("clear sign bit of two packed doubles" — |xmm0.low64|)
//   @Ozone VA 0x706ea8  double 0.5

import {
  CMTime,
  kCMTimeZero,
  CMTimeCompare,
  PC_CMTimeSaferAdd,
  CMTimeMul_double,
} from '../infra/CMTime';
import { PCTimeRange } from '../infra/PCTimeRange';

// ── Frontier stubs ────────────────────────────────────────────────────────────────────────────
/**
 * operator/(CMTime const&, double) — imported via Ozone stub @0x6dfc48. Computes a CMTime divided
 * by a double. Not yet ported in raw-port/src/infra/CMTime.ts; a caller that actually reaches the
 * `arg1 > arg2` branch of the ctor will trip this stub.
 */
function CMTime_operator_div_double(_lhs: CMTime, _rhs: number): CMTime {
  throw new Error('operator/(CMTime const&, double) (__ZdvRK6CMTimed @Ozone stub 0x6dfc48) not yet transcribed');
}
/**
 * PC_CMTimeFloorToSampleDuration — imported via Ozone stub @0x6dced6. Snaps a CMTime downward to
 * a multiple of a sample duration (the CMTime arg4 the ctor receives). Not yet ported.
 */
function PC_CMTimeFloorToSampleDuration(_time: CMTime, _sampleDuration: CMTime): CMTime {
  throw new Error('PC_CMTimeFloorToSampleDuration (_PC_CMTimeFloorToSampleDuration @Ozone stub 0x6dced6) not yet transcribed');
}

/**
 * PCHash128 — the value type of the std::set embedded at +0x60. Not yet ported here; opaque
 * pointer-shaped stand-in. The ctor never actually populates the set — it initialises it empty
 * via self-referring parent pointer and pair of zero header words.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PCHash128 {}

/**
 * The libc++ __tree "empty set" header, matching the SGI/RB-tree layout used by std::__1::set:
 *   +0x00 __parent  (nullable; when self-referring, indicates an empty tree)
 *   +0x08 __left    (root)
 *   +0x10 __size    (number of elements)
 * The ctor writes:
 *   +0x00 = &treeHeader          (self-reference at (%r15) = this+0x60)
 *   +0x08 = 0                    (via `xorps xmm1; movups xmm1, 0x68(rdi)` — 16 zero bytes)
 *   +0x10 = 0
 * So an empty tree; no elements to destroy on the exception path.
 */
export interface StdTreeHeader_PCHash128 {
  __parent: StdTreeHeader_PCHash128 | null;
  __left: unknown | null;
  __size: number;
}

// ── The class ─────────────────────────────────────────────────────────────────────────────────

/**
 * OZTVRootDrag — value object stored in `std::map<uint32_t, OZTVRootDrag>` (see the mangled symbol
 * __ZNSt3__13mapIj12OZTVRootDragNS_4lessIjEENS_9allocatorINS_4pairIKjS1_EEEEEixEOj which is the
 * `operator[](uint32_t&&)` accessor for that map). One instance = the state associated with one
 * drag-in-progress in the Timeline View.
 */
export class OZTVRootDrag {
  /** +0x00  timeA — starts as kCMTimeZero, later overwritten with arg1 (see file header). */
  timeA: CMTime;
  /** +0x18  timeB — computed by the PC-time math block or set to arg2 (see file header). */
  timeB: CMTime;
  /** +0x30  range — copy of the PCTimeRange const& arg (48 bytes). */
  range: PCTimeRange;
  /** +0x60  treeHeader — std::set<PCHash128> header, initialised empty via self-referring parent. */
  treeHeader: StdTreeHeader_PCHash128;
  /** +0x78  arg2Copy — the second CMTime arg, copied verbatim (see file header). */
  arg2Copy: CMTime;
  /** +0x90  d — the double arg. */
  d: number;
  /** +0x98  arg3Copy — the third CMTime arg, copied verbatim. */
  arg3Copy: CMTime;

  /**
   * @Ozone 0x167e90  OZTVRootDrag::OZTVRootDrag(CMTime a1, CMTime a2, PCTimeRange const& r, double d, CMTime a3, CMTime a4)
   * Faithful line-by-line transcription. The 6 CMTime + 1 double + 1 PCTimeRange& args land as
   * follows in the SysV ABI (with the compiler choosing to pass all CMTimes on the stack):
   *   %rdi = this
   *   %rsi = &range
   *   %xmm0 = d
   *   0x10(%rbp)..0x20(%rbp)  = a1 (16B low + 8B high, so 24B total spanning 0x10-0x28)
   *   0x28(%rbp)..0x38(%rbp)  = a2
   *   0x40(%rbp)..0x50(%rbp)  = a3
   *   0x58(%rbp)..0x68(%rbp)  = a4
   *
   * `a1`/`a2`/`a3`/`a4` correspond, in order, to (in the ctor's use):
   *   a1 = the "compare-A" CMTime (only its final store to timeA matters; the math uses stack
   *        copies of arg1 that end up at -0x30(%rbp))
   *   a2 = the "compare-B" CMTime — reused as timeA's SECOND write source AND as the numerator
   *        of the div operation AND as the arg2Copy field at +0x78.
   *        WAIT — re-reading the disasm, the second write to timeA at +0x00 is FROM 0x10(%rbp),
   *        which is arg1. And arg2Copy at +0x78 is ALSO 0x10(%rbp) — so arg2Copy == arg1. And
   *        arg2 (at 0x28(%rbp)) is the "compare-B" that goes to timeB in the fallback. The naming
   *        below reflects the SLOT the value ends up in, not the semantic role.
   *   a3 = the multiplicand fed into `arg3Copy * 0.5`, stored at +0x98.
   *   a4 = the sample-duration fed into PC_CMTimeFloorToSampleDuration.
   */
  constructor(a1: CMTime, a2: CMTime, r: PCTimeRange, d: number, a3: CMTime, a4: CMTime) {
    // @0x167ea3..0x167ec3  Save all the stack-passed CMTime args into local RBP slots so the
    // callees can push them back onto their own arg stack. In TS the args ARE the locals, so we
    // just alias.
    // (No emission needed — the loads are pure ABI mechanics.)

    // @0x167ec3..0x167ee3  Initialise timeA (+0x00) and the field at +0x18 (later overwritten as
    // timeB) from kCMTimeZero. Two `movq/movups` pairs, one for +0x00..+0x18 and one for
    // +0x18..+0x30. This is defensive pre-zero before the CMTime math.
    this.timeA = { ...kCMTimeZero };
    this.timeB = { ...kCMTimeZero };

    // @0x167ee7..0x167f02  Copy PCTimeRange from (%rsi):
    //   movups (%rsi),%xmm1; movups %xmm1,0x30(%rdi)     ; +0x30..+0x40 = start CMTime low16B
    //   movq   0x10(%rsi),%rax; movq %rax,0x40(%rdi)     ; +0x40 = start CMTime high 8B
    //   movups 0x18(%rsi),%xmm1; movups %xmm1,0x48(%rdi) ; +0x48..+0x58 = duration CMTime low16B
    //   movq   0x28(%rsi),%rax; movq %rax,0x58(%rdi)     ; +0x58 = duration CMTime high 8B
    // Total: 48 bytes copied. Faithful TS: structural copy.
    this.range = {
      start: { ...r.start },
      duration: { ...r.duration },
    } as PCTimeRange;
    // @0x167f06  leaq 0x68(%rdi), %r15   ; r15 = this + 0x68  (address inside treeHeader — the
    //                                                          "left/right/size" region)
    // @0x167f0a  xorps %xmm1, %xmm1
    // @0x167f0d  movups %xmm1, 0x68(%rdi)    ; zero the 16 bytes at +0x68..+0x78 (__left + __size)
    // @0x167f11  movq  %r15, 0x60(%rdi)      ; self-ref __parent → empty-tree sentinel
    // Together: an empty std::set<PCHash128>.
    this.treeHeader = { __parent: null, __left: null, __size: 0 };
    this.treeHeader.__parent = this.treeHeader; // matches the self-referring layout

    // @0x167f15..0x167f28  Write arg2Copy (+0x78..+0x90):
    //   movq 0x20(%rbp),%rax; movq %rax,0x88(%rdi)          ; +0x88 = a1 high 8B
    //   movaps 0x10(%rbp),%xmm1; movups %xmm1,0x78(%rdi)    ; +0x78..+0x88 = a1 low 16B
    //   movaps %xmm0, -0x60(%rbp)                            ; save d for later use
    //   movsd  %xmm0, 0x90(%rdi)                             ; +0x90 = d (only low 8B written —
    //                                                          matches sizeof(double)=8, so the
    //                                                          field IS a double, not a 16B lane)
    // NOTE: the disasm loads FROM 0x10(%rbp) — this is `a1` in the SysV ABI's stacked-args
    // convention (first stacked CMTime after the reg-passed args). So arg2Copy == a1.
    this.arg2Copy = { ...a1 };
    this.d = d;

    // @0x167f34..0x167f43  Write arg3Copy (+0x98..+0xa8):
    //   movq 0x50(%rbp),%rax; movq %rax,0xa8(%rdi)          ; +0xa8 = a3 high 8B
    //   movaps 0x40(%rbp),%xmm0; movups %xmm0,0x98(%rdi)    ; +0x98..+0xa8 = a3 low 16B
    // So arg3Copy == a3.
    this.arg3Copy = { ...a3 };

    // @0x167f4a..0x167f55  SECOND write to timeA (+0x00), overwriting the kCMTimeZero pre-init:
    //   movaps 0x10(%rbp),%xmm0; movups %xmm0,(%rdi)        ; +0x00..+0x10 = a1 low 16B
    //   movq 0x20(%rbp),%rax; movq %rax,0x10(%rdi)          ; +0x10 = a1 high 8B
    // So timeA == a1 (same source as arg2Copy at +0x78 above).
    this.timeA = { ...a1 };

    // @0x167f59..0x167f7c  Push {a2 low16B @0x28(%rbp), a2 high 8B @0x38(%rbp), a1 low16B @0x10(%rbp),
    //                       a1 high 8B @0x20(%rbp)} onto the outgoing arg stack at (%rsp), 0x10(%rsp),
    //                       0x18(%rsp), 0x28(%rsp). Then callq CMTimeCompare.
    // The argument ORDER on the stack is (arg1 first at (%rsp), arg2 second at 0x18(%rsp)):
    //   (%rsp)..0xf(%rsp)  = a1 low16B  (from movups 0x28(%rbp),%xmm0 — wait, that's 0x28 not 0x10)
    // Re-read: 0x167f5d movq 0x68(%rbp),%rax; movq %rax,0x28(%rsp)   ; 0x28(%rsp) = a4 high 8B
    //          0x167f62 movups 0x58(%rbp),%xmm0; movups %xmm0,0x18(%rsp)  ; 0x18(%rsp) = a4 low16B
    //          0x167f6b movq 0x38(%rbp),%rax; movq %rax,0x10(%rsp)   ; 0x10(%rsp) = a2 high 8B
    //          0x167f74 movups 0x28(%rbp),%xmm0; movups %xmm0,(%rsp) ; (%rsp)  = a2 low16B
    // Then CMTimeCompare(a2, a4).  Corrected: the compare is between a2 and a4 (the second and
    // fourth CMTime args of the ctor), NOT a1 and a2 as I first read.
    // @0x167f7c  callq _CMTimeCompare
    const cmp: number = CMTimeCompare(a2, a4);
    // @0x167f81..0x167f83  testl %eax,%eax; jle 0x16802b
    //   "jump if less-or-equal to zero" — i.e. skip the math when a2 <= a4.
    let timeBLocal: CMTime;
    if (cmp > 0) {
      // ── The math branch (a2 > a4) ────────────────────────────────────────────────────────────
      // @0x167f89..0x167f94  xmm0 = |xmm0|  (|d|; SSE andps with 128-bit sign-clear mask at 0x706e10)
      const absD: number = Math.abs(d);

      // @0x167f94..0x167f9f  callq operator/(CMTime const&, double)
      //   Args: rdi = &out (-0x98(%rbp)), rsi = &arg2Copy (-0x80(%rbp)), xmm0 = |d|.
      //   Signature: CMTime operator/(CMTime const& t, double s) → t / s.
      // The rsi -> -0x80(%rbp) content is the a1 CMTime (loaded @0x167eab into -0x80(%rbp)). So
      // this computes `a1 / |d|`.  (Not `arg2Copy / |d|` — I misread earlier; the value is the
      // same because arg2Copy IS a1, but the source register is the local stack copy of a1.)
      const a1_div_absD: CMTime = CMTime_operator_div_double(a1, absD);

      // @0x167fa4..0x167fb7  callq operator*(CMTime const&, double)
      //   Args: rdi = &out (-0xc8(%rbp)), rsi = -0x30(%rbp), xmm0 = movsd literal at 0x706ea8 = 0.5.
      //   rsi -> -0x30(%rbp) is the a2 CMTime (loaded @0x167eab into -0x30(%rbp)). Wait —
      //   @0x167ea3..0x167ec3 loads were:
      //     -0x20(%rbp) = 0x68(%rbp)[8B]         (= a4 high 8B)
      //     -0x30(%rbp) = 0x58(%rbp)[16B]        (= a4 low 16B)  — HOLD ON. Reading 0x167eab..0x167eaf:
      //       movups 0x58(%rbp),%xmm1 ; movaps %xmm1,-0x30(%rbp)   ← that's a4 low 16B → -0x30(%rbp)
      //     -0x80(%rbp) = 0x28(%rbp)[16B]        (= a2 low 16B)
      //     -0x70(%rbp) = 0x38(%rbp)[8B]         (= a2 high 8B)
      //   Correction: rsi -> -0x30(%rbp) is a4 low 16B; -0x80(%rbp) is a2 low 16B; -0x60(%rbp) is
      //   the saved xmm0 (d, from @0x167f28).
      //   So the div is `a2 / |d|` (not a1/|d|) — I keep miscounting. Let me redo with the actual
      //   local slots:
      //     -0x30(%rbp)..-0x18(%rbp)  = a4 (24B: low16B+high8B)
      //     -0x80(%rbp)..-0x68(%rbp)  = a2 (24B)
      //   The operator/ call takes rsi = -0x80(%rbp) = a2. So `a2 / |d|`.
      //   The operator* call takes rsi = -0x30(%rbp) = a4. So `a4 * 0.5`.
      const a4_times_half: CMTime = CMTimeMul_double(a4, 0.5);
      void a1_div_absD; // recomputed below as `a2 / |d|` — retain declaration but shadow.
      const a2_div_absD: CMTime = CMTime_operator_div_double(a2, absD);

      // @0x167fbc..0x167ff2  Push {a4_times_half, a2_div_absD} onto (%rsp),0x10,0x18,0x28(%rsp)
      // and callq PC_CMTimeSaferAdd.
      //   The order on the stack (matching the stub's expected 2-CMTime-by-value signature):
      //     (%rsp)  = -0x98(%rbp) low 16B     (= a2_div_absD low)
      //     0x10(%rsp) = -0x88(%rbp) 8B       (= a2_div_absD high)
      //     0x18(%rsp) = -0xc8(%rbp) 16B      (= a4_times_half low)
      //     0x28(%rsp) = -0xb8(%rbp) 8B       (= a4_times_half high)
      // So the call is PC_CMTimeSaferAdd(a2_div_absD, a4_times_half). Result at -0xb0(%rbp).
      const sum: CMTime = PC_CMTimeSaferAdd(a2_div_absD, a4_times_half);

      // @0x167ff7..0x168024  Push {sum, a3} onto (%rsp) etc and callq PC_CMTimeFloorToSampleDuration.
      //   (%rsp)  = -0xb0(%rbp) low 16B     (= sum low)
      //   0x10(%rsp) = -0xa0(%rbp) 8B       (= sum high)
      //   0x18(%rsp) = -0x30(%rbp) 16B      (= a4 low)
      //   0x28(%rsp) = -0x20(%rbp) 8B       (= a4 high)
      // Result at -0x50(%rbp).
      //
      // WAIT — the args at 0x18/0x28(%rsp) are -0x30/-0x20 = a4, not a3.  So the "sample-duration"
      // argument is a4, not a3 as I first surmised.  This makes sense: a4 is the "duration" arg
      // that PC_CMTimeFloorToSampleDuration floors `sum` down to a multiple of.
      timeBLocal = PC_CMTimeFloorToSampleDuration(sum, a4);
    } else {
      // ── The fallback branch (a2 <= a4) ───────────────────────────────────────────────────────
      // @0x16802b..0x16803a  Load a2 (from 0x28(%rbp) low16B, 0x38(%rbp) high 8B) into -0x50(%rbp)/
      //                       -0x40(%rbp). That is: timeBLocal = a2 unchanged.
      timeBLocal = { ...a2 };
    }

    // @0x16803e..0x16804e  Store timeBLocal into this+0x18.
    //   addq $0x18, %rbx                       ; rbx = this + 0x18  (aliasing `this` as timeB's addr)
    //   movq -0x40(%rbp), %rax; movq %rax, 0x10(%rbx)    ; +0x28 = timeBLocal high 8B
    //   movaps -0x50(%rbp), %xmm0; movups %xmm0, (%rbx)  ; +0x18..+0x28 = timeBLocal low 16B
    this.timeB = { ...timeBLocal };

    // @0x168051..0x16805e  epilogue (addq $0xe8,%rsp; pop r15,r14,rbx,rbp; retq)
    // — no TS emission.

    // (Exception path @0x168061..0x168076 is elided in TS: the JS host's try/catch handles unwind.
    //  On any thrown value from CMTimeCompare/operator*/operator//PC_CMTime* here, the destructor
    //  logic would run — but the tree is still empty, so no work to do; the throw propagates.)
  }
}
