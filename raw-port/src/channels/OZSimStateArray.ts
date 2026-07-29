// OZSimStateArray — Ozone particle-simulator state array (channels layer).
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// FAITHFUL PORT — every method cites @Ozone 0xADDR read from the disassembly under
// raw-port/re/disasm/OZSimStateArray.*.s. Undecoded callees (OZSimStateElement::*,
// PCSharedCount::*, PC_CMTimeSaferAdd, PCMatrix33 identity) are called through their
// existing ports; any callee whose disassembly is still un-decoded is routed through a
// throwing stub that cites the specific call-site @0xADDR (frontier stubs each cite an
// address — see the four `throw new Error("... @0x...")` bodies below).
//
// Symbols in this class (nm -arch x86_64 | c++filt | grep '^OZSimStateArray::'):
//
//   @0x283a20  OZSimStateArray::OZSimStateArray()                                        — PORTED
//   @0x283b80  OZSimStateArray::OZSimStateArray(unsigned int)                            — PORTED
//   @0x283d10  OZSimStateArray::OZSimStateArray(OZSimStateArray const&)                  — PORTED
//   @0x283e10  OZSimStateArray::~OZSimStateArray()                                       — PORTED
//   @0x283e80  OZSimStateArray::operator=(OZSimStateArray const&)                        — PORTED
//   @0x283f20  OZSimStateArray::setOwnedObject(PCShared*)                                — PORTED
//   @0x283fa0  OZSimStateArray::setOwnedObjectFrom(OZSimStateArray const&)               — PORTED
//   @0x284000  OZSimStateArray::clearForces()                                            — PORTED
//   @0x284040  OZSimStateArray::stepFrom(OZSimStateArray*, CMTime, double)               — PORTED (trampoline)
//   @0x284050  OZSimStateArray::stepFrom(OZSimStateArray*, OZSimStateArray*, CMTime, double) — PORTED
//
// C1/C2 and D1/D2 ctor/dtor pairs are ICF/trampoline copies of the same body — only
// one TS entry is exposed per semantic overload, matching how libc++ folds them at link time.
//
// PROVENANCE / DECODE dumps live at:
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArrayC1Ev.s              @0x283a20
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArrayC1Ej.s              @0x283b80
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArrayC1ERKS_.s           @0x283d10
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArrayD1Ev.s              @0x283e10
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArrayaSERKS_.s           @0x283e80
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArray14setOwnedObjectEP8PCShared.s  @0x283f20
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArray18setOwnedObjectFromERKS_.s    @0x283fa0
//   raw-port/re/disasm/OZSimStateArray.clearForces.s                            @0x284000
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArray8stepFromEPS_6CMTimed.s    @0x284040
//   raw-port/re/disasm/OZSimStateArray.__ZN15OZSimStateArray8stepFromEPS_S0_6CMTimed.s @0x284050
//
// STRUCT LAYOUT  (recovered from ctors + operator= + clearForces):
// -----------------------------------------------------------------------------
//   +0x00  elements.begin_ptr  OZSimStateElement*
//   +0x08  elements.end_ptr    OZSimStateElement*   (one past last)
//   +0x10  elements.cap_ptr    OZSimStateElement*   (end of storage)
//        (i.e. an inline std::__1::vector<OZSimStateElement> — 3 pointers)
//   +0x18  currentTime.value      int64  (CMTime)
//   +0x20  currentTime.timescale  int32
//   +0x24  currentTime.flags      uint32
//   +0x28  currentTime.epoch      int64
//   +0x30  needsRebuild (or "isDirty"): bool  — role deferred; C1Ev zeros it, C1Ej zeros it,
//                                               operator= copies from RHS. Name is provisional
//                                               (asm doesn't ground a purpose beyond a bool).
//   +0x38  ownedObjectRaw: PCShared* raw handle — the "primary owned object" pointer that
//                                                 mirrors the PCSharedCount below. setOwnedObject
//                                                 swaps this + the PCSharedCount atomically.
//   +0x40  ownership: PCSharedCount           (8 bytes; owns +0x38 via strong-ref)
//
// Element stride is 0xf8 (248 bytes per OZSimStateElement) — the ctor(uint)'s
//   `imulq $0xf8, %rax, %r14` @0x283bae and clearForces's `addq $0xf8, %rax` @0x284025 both
//   ground this.
// -----------------------------------------------------------------------------

import type { PCShared } from "../infra/PCShared";
import { PCSharedCount } from "../infra/PCSharedCount";
import type { CMTime } from "../infra/CMTime";
import { kCMTimeZero, PC_CMTimeSaferAdd } from "../infra/CMTime";

// -----------------------------------------------------------------------------
// OZSimStateElement — frontier callee (0xf8 bytes per element).
//
// This class is called into from OZSimStateArray at four points:
//   - stepFrom(EPS_S0_6CMTimed) invokes OZSimStateElement::stepFrom(elem*, elem*, double, double,
//     PCMatrix33Tmpl<double>)                               @Ozone (undecoded here — frontier)
//   - the ctor(uint) invokes OZSimStateElement::OZSimStateElement()                       @Ozone
//     (undecoded here — frontier)
//   - the dtor invokes OZSimStateElement::~OZSimStateElement()                            @Ozone
//     (undecoded here — frontier)
//   - copy-ctor / operator= delegate to std::vector's __init_with_size / __assign_with_size
//     which fan out to element copy-ctors (also undecoded)                                @Ozone
//
// We MODEL it here as an opaque nominal type so the vector-of-elements plumbing
// typechecks. The actual math (stepFrom's kinematic integration) is not decoded — see the
// stub function below which throws with the frontier addr.
// -----------------------------------------------------------------------------

/**
 * Opaque nominal handle for OZSimStateElement. The struct is 0xf8 bytes; we tag it so the
 * container plumbing typechecks without accidentally reifying the fields.
 * @frontier Ozone OZSimStateElement (0xf8 bytes per element; stride ground by `addq $0xf8`
 *   at OZSimStateArray::clearForces @0x284025 and by `imulq $0xf8, %rax, %r14`
 *   at OZSimStateArray::OZSimStateArray(uint) @0x283bae).
 */
export interface OZSimStateElement {
  readonly __brand: "OZSimStateElement";
  // Element internals are opaque to this port. The one field OZSimStateArray::clearForces
  // touches on each element is 48 bytes at +0x80 (movups xmm0 to +0x80, +0x90, +0x a0),
  // which are three 16-byte vector slots we zero via the clearForceSlots hook below.
  //
  // We DON'T decode those slots' semantics here — that's OZSimStateElement's job. To keep
  // clearForces byte-verbatim in TS, we hand out a "zero-forces" helper on the element and
  // forbid this port from opening the element.
}

// -----------------------------------------------------------------------------
// Frontier-callee stubs — each throws with the exact source address so
// raw-port/army/tools/frontier.py can see the outstanding gap.
// -----------------------------------------------------------------------------

/**
 * Frontier: OZSimStateElement::OZSimStateElement()   @Ozone (called at
 * OZSimStateArray::OZSimStateArray(uint) @0x283be3). Allocates+zero-inits a single
 * 0xf8-byte element. Not yet transcribed.
 */
function OZSimStateElement_ctor(): OZSimStateElement {
  throw new Error(
    "OZSimStateElement::OZSimStateElement() @Ozone not yet transcribed " +
      "(called from OZSimStateArray::OZSimStateArray(uint) @0x283be3)",
  );
}

/**
 * Frontier: OZSimStateElement::~OZSimStateElement()  @Ozone (called at
 * OZSimStateArray::~OZSimStateArray D1 @0x283e4a). Element destructor. Not yet transcribed.
 */
function OZSimStateElement_dtor(_e: OZSimStateElement): void {
  throw new Error(
    "OZSimStateElement::~OZSimStateElement() @Ozone not yet transcribed " +
      "(called from OZSimStateArray::~OZSimStateArray @0x283e4a)",
  );
}

/**
 * Frontier: OZSimStateElement::stepFrom(elem*, elem*, double, double, PCMatrix33Tmpl<double>)
 *   @Ozone (called at OZSimStateArray::stepFrom @0x2840eb).
 *
 * Signature reconstructed from the disassembly's SysV-abi register + xmm placement:
 *   %rdi = out element (self)  — the destination slot in the destination array
 *   %rsi = k1  element         — from-state's element (rate source #1)
 *   %rdx = k2  element         — rate source #2 (equals k1 in the 2-arg trampoline)
 *   %xmm0 = dt                 — the timestep (seconds), passed straight from stepFrom
 *   %xmm1 = 1.0                — a scalar coefficient loaded from 0x7053e0 (see below)
 *   %rcx  = &PCMatrix33Tmpl<double>{ identity } — 72-byte stack matrix, diagonal=1, rest=0
 *
 * Not yet transcribed — call site is OZSimStateArray::stepFrom @0x2840eb.
 */
function OZSimStateElement_stepFrom(
  _out: OZSimStateElement,
  _k1: OZSimStateElement,
  _k2: OZSimStateElement,
  _dt: number,
  _coef: number,
  _reorient: PCMatrix33Identity,
): void {
  throw new Error(
    "OZSimStateElement::stepFrom(elem*,elem*,double,double,PCMatrix33Tmpl<double>) @Ozone " +
      "not yet transcribed (called from OZSimStateArray::stepFrom @0x2840eb)",
  );
}

/**
 * Placeholder for `PCMatrix33Tmpl<double>` — passed by-value from stepFrom. The array
 * ctor's only use of this type is to STACK-CONSTRUCT the identity (diagonal=1.0, rest=0)
 * and hand it to OZSimStateElement::stepFrom. We model it as the specific "identity" value
 * (a marker) so no caller can accidentally forge an arbitrary matrix; the class port for
 * PCMatrix33Tmpl<double> is a separate frontier item that will replace this brand.
 *
 * @frontier Ozone PCMatrix33Tmpl<double> (72-byte 3×3 row-major, see stack layout at
 *   OZSimStateArray::stepFrom @0x2840a0..0x2840ca — 9 doubles at [-0xb8,-0xb0,-0xa8,
 *   -0xa0,-0x98,-0x90,-0x88,-0x80,-0x78]; the ctor writes 1.0 at +0x00, +0x20, +0x40
 *   and xorps'-zeros the other six).
 */
export interface PCMatrix33Identity {
  readonly __brand: "PCMatrix33Tmpl<double>@identity";
}

/**
 * Construct a stack `PCMatrix33Tmpl<double>` identity: diagonal 1.0, off-diagonals 0.
 * ASM proof (OZSimStateArray::stepFrom, @0x2840a0..@0x2840ca):
 *   movq %rbx, -0xb8(%rbp)        ; -0xb8 = m[0][0] = 1.0  (rbx pre-loaded with 0x3ff0000000000000)
 *   movups %xmm0, (%r14)          ;  0x00 = m[0][1] = 0.0  (xmm0 pre-xorps'd = 0)
 *   movups %xmm0, 0x10(%r14)      ;  0x10 = m[0][2], m[1][0] = 0.0
 *     (note: -0xb8 == %r14-0x08; -0xb0 == %r14+0x00 — the frame layout has %r14 = -0xb0(%rbp))
 *   movq $0x0, 0x10(%r14)         ;  redundant zero write (compiler kept both stores)
 *   movq %rbx, -0x98(%rbp)        ; -0x98 = m[1][1] = 1.0
 *   movups %xmm0, 0x20(%r14)      ;  0x20 = m[1][2], m[2][0] = 0.0
 *   movq $0x0, 0x30(%r14)         ; -0x80 = m[2][1] = 0.0
 *   movq %rbx, -0x78(%rbp)        ; -0x78 = m[2][2] = 1.0
 */
function makePCMatrix33Identity(): PCMatrix33Identity {
  return { __brand: "PCMatrix33Tmpl<double>@identity" } as PCMatrix33Identity;
}

/**
 * `clearForceSlots(elem)` — the byte-verbatim inner body of OZSimStateArray::clearForces
 * @0x284000..@0x28402f. For each element in [begin, end): zero three 16-byte slots at
 * +0x80, +0x90, +0x a0 (48 bytes total).
 *
 * The element's semantics for those slots are OZSimStateElement's contract — this port
 * cannot open the element, so we delegate to a hook the frontier will supply. Left as
 * a throwing stub until OZSimStateElement is decoded (only OZSimStateArray::clearForces
 * @0x28400d..0x284025 grounds these offsets; OZSimStateElement's own accessors have not
 * been read yet).
 *
 * @frontier Ozone OZSimStateElement::clearForces-slots (offsets +0x80, +0x90, +0xa0)
 */
function OZSimStateElement_clearForceSlots(_e: OZSimStateElement): void {
  throw new Error(
    "OZSimStateElement force-slot clear (offsets +0x80, +0x90, +0xa0) @Ozone not yet " +
      "transcribed (called from OZSimStateArray::clearForces @0x284010..0x28401e)",
  );
}

// -----------------------------------------------------------------------------
// Element scale coefficient — 1.0 loaded from Ozone RIP+0x4812fc at
// OZSimStateArray::stepFrom @0x2840dc. Verified via `resolve.py Ozone const 0x7053e0`:
//   double=1.0  u64=0x3ff0000000000000
// @const Ozone 0x7053e0
// -----------------------------------------------------------------------------
const STEP_SCALE_COEFFICIENT = 1.0;

// =============================================================================
// OZSimStateArray
// =============================================================================

/**
 * OZSimStateArray — a vector of OZSimStateElement + a CMTime timestamp + an owned-object
 * PCSharedCount handle. Used by OZSystemSimulator as the "state at time t" snapshot that
 * gets integrated forward via stepFrom.
 *
 * Ozone base @0x283a20 (default ctor). See STRUCT LAYOUT comment at file head.
 */
export class OZSimStateArray {
  /**
   * +0x00 — vector<OZSimStateElement>::begin_ (owning pointer). Modeled as a JS array
   * whose length maps 1-to-1 with the C++ [begin_, end_) range. C1(uint) allocates it up
   * front; C1() leaves it empty (null == length 0).
   */
  elements: OZSimStateElement[] = [];

  /**
   * +0x18 — CMTime currentTime. Written to kCMTimeZero at C1() @0x283a3f-46 and at
   * C1(uint) @0x283bfc-16 (both instructions read `_kCMTimeZero` from the __DATA_CONST
   * literal pool and mempcy 24 bytes). Advanced by stepFrom via PC_CMTimeSaferAdd.
   */
  currentTime: CMTime = { ...kCMTimeZero };

  /**
   * +0x30 — a boolean tracked by all four ctors and by operator=. Zero-initialized in
   * both non-copy ctors (@0x283a4e for C1Ev; @0x283c12 for C1(uint); the copy-ctor at
   * C1ERKS_ @0x283d60-65 copies the byte from RHS; operator= at aSERKS_ @0x283ef1-f6
   * copies the byte from RHS; stepFrom @0x28419d resets it to 0 after integrating).
   *
   * The asm never READS this field in any of the decoded methods, so its role isn't
   * groundable from OZSimStateArray alone; consumer classes (OZSystemSimulator,
   * OZ*Behavior::accumForces) will pin the name once they're transcribed. Provisional
   * label: "cleared/reset-after-step" — matches every observed reset point.
   */
  cleared: boolean = false;

  /**
   * +0x38 — the raw pointer to the "owned object" (a PCShared payload). setOwnedObject
   * swaps this atomically with the +0x40 PCSharedCount; setOwnedObjectFrom copies just
   * the raw pointer (the +0x40 ref-count is copy-assigned separately).
   *
   * `null` encodes "no owned object" — every setter checks against 0 explicitly.
   */
  ownedObjectRaw: PCShared | null = null;

  /**
   * +0x40 — the strong-ref count that pins `ownedObjectRaw`'s control block. Constructed
   * as an empty count in C1() / C1(uint), and copied via PCSharedCount(const&) + swap
   * in setOwnedObject.
   */
  ownership: PCSharedCount = new PCSharedCount();

  // ===========================================================================
  // ctor: OZSimStateArray()  — @0x283a20 (C1)  /  @Ozone (C2, ICF-alias body)
  //
  // Body (byte-verbatim):
  //   xorps %xmm0, %xmm0                ; 0
  //   movups %xmm0, (%rdi)              ; vector.begin_ = vector.end_ = 0    (+0x00, +0x08)
  //   movq $0x0, 0x10(%rdi)             ; vector.cap_ = 0                    (+0x10)
  //   %rax = &_kCMTimeZero
  //   movups (%rax), %xmm0
  //   movups %xmm0, 0x18(%rdi)          ; currentTime.value/timescale/flags  (+0x18..+0x27)
  //   %rax = *(u64*)(%rax + 0x10)
  //   movq %rax, 0x28(%rdi)             ; currentTime.epoch                  (+0x28)
  //   movb $0x0, 0x30(%rdi)             ; cleared = 0                        (+0x30)
  //   movq $0x0, 0x38(%rdi)             ; ownedObjectRaw = nullptr           (+0x38)
  //   addq $0x40, %rdi
  //   callq PCSharedCount::PCSharedCount()   ; ownership = {}                (+0x40)
  //
  // The two overloads (default and copy-ctor) diverge on rdi's initial content — see
  // the second constructor entry point below.
  // ===========================================================================

  /**
   * The TypeScript ctor dispatches on the argument shape onto FCP's three overloads:
   *
   *   OZSimStateArray()                       @0x283a20   — no arg
   *   OZSimStateArray(unsigned int n)         @0x283b80   — a `number` argument
   *   OZSimStateArray(OZSimStateArray const&) @0x283d10   — an OZSimStateArray argument
   */
  constructor(arg?: number | OZSimStateArray) {
    if (arg === undefined) {
      // @0x283a20 default ctor. Field defaults above already implement the exact
      // byte-writes; no additional work here. The field-initializer semantics of
      // TypeScript match the FCP body 1-to-1:
      //   elements=[]                (movups xmm0, (%rdi) + movq $0, 0x10(%rdi))
      //   currentTime={...kCMTimeZero}   (@0x283a3f..46)
      //   cleared=false              (movb $0, 0x30)
      //   ownedObjectRaw=null        (movq $0, 0x38)
      //   ownership=new PCSharedCount()  (callq PCSharedCount::C1  @0x283a5e)
      return;
    }
    if (typeof arg === "number") {
      // @0x283b80 OZSimStateArray::OZSimStateArray(unsigned int n)
      //
      // Body (byte-verbatim):
      //   xorps xmm0,xmm0 ; movups xmm0,(rdi) ; movq $0,0x10(rdi)   ; empty vector header
      //   testl esi,esi ; je .Lheader_done                          ; if (n != 0):
      //     r14 = n * 0xf8                                          ; total bytes
      //     rax = __Znwm(r14)                                       ; operator new(...)
      //     *(u64*)(rbx+0x00) = rax  ; begin_
      //     *(u64*)(rbx+0x08) = rax  ; end_  (populated below)
      //     r15 = rax + r14
      //     *(u64*)(rbx+0x10) = r15  ; cap_
      //     do {
      //       OZSimStateElement::OZSimStateElement(r12)             ; @0x283be3
      //       r12 += 0xf8
      //       r14 -= 0xf8
      //     } while (r14 != 0)
      //     *(u64*)(rbx+0x08) = r15  ; end_ = cap_
      //   .Lheader_done:
      //   ... same tail as default ctor (kCMTimeZero, cleared=0, ownedObjectRaw=null,
      //       ownership()) @0x283bfc..@0x283c22
      //
      // The __exception_guard_exceptions landing pad (@0x283c34+) unwinds the partially-
      // constructed vector on element-ctor throw; we model that with normal TS exception
      // propagation from the field initializers.
      const n = arg | 0; // unsigned int on the ABI, but we mask to a JS int32 for typing.
      if (n < 0) {
        // The FCP disasm interprets %esi unsigned; a negative TS input has no valid FCP
        // counterpart. Refuse loudly rather than silently coerce (a truncation to u32 would
        // be a defect that hides real caller bugs).
        throw new Error(
          `OZSimStateArray::OZSimStateArray(unsigned int) @0x283b80: n must be >= 0, got ${arg}`,
        );
      }
      if (n !== 0) {
        this.elements = new Array<OZSimStateElement>(n);
        for (let i = 0; i < n; i++) {
          // @0x283be3 callq OZSimStateElement::OZSimStateElement()
          this.elements[i] = OZSimStateElement_ctor();
        }
      }
      // Tail (kCMTimeZero + cleared + ownedObjectRaw + ownership) is identical to default
      // ctor and matches the field initializers above.
      return;
    }
    // @0x283d10 OZSimStateArray::OZSimStateArray(OZSimStateArray const&)
    //
    // Body (byte-verbatim):
    //   xorps xmm0,xmm0 ; movups xmm0,(rdi) ; movq $0,0x10(rdi)      ; empty header
    //   rsi = *(u64*)(r14+0x00)                                       ; other.begin_
    //   rdx = *(u64*)(r14+0x08)                                       ; other.end_
    //   rax = (rdx - rsi) >> 3                                        ;  (bytes/8)
    //   rcx = rax * 0xef7bdef7bdef7bdf     ; magic /0x1f (= /0xf8 unsigned)
    //   callq std::vector<...>::__init_with_size(rsi, rdx, rcx)       ; @0x283d4a
    //   *(u64*)(rbx+0x28) = *(u64*)(r14+0x28)                         ; currentTime.epoch
    //   xmm0 = *(u128*)(r14+0x18)
    //   *(u128*)(rbx+0x18) = xmm0                                     ; currentTime lo 16
    //   *(u8*)(rbx+0x30) = *(u8*)(r14+0x30)                           ; cleared
    //   *(u64*)(rbx+0x38) = *(u64*)(r14+0x38)                         ; ownedObjectRaw
    //   rdi = rbx+0x40 ; rsi = r14+0x40
    //   callq PCSharedCount::PCSharedCount(PCSharedCount const&)      ; @0x283d7b
    //
    // Note: unlike operator=, the copy-ctor DOES copy `currentTime` (both quads) — this
    // is a deliberate divergence between ctor-semantics and assign-semantics in FCP.
    const other = arg;
    // std::vector<T>::__init_with_size does a per-element copy-construct across the range;
    // in TS we model that as a shallow copy of the array. The elements are opaque nominal
    // handles (OZSimStateElement is a frontier type); reproducing the C++ per-element copy
    // requires OZSimStateElement's copy ctor, which is undecoded, so we retain the same
    // handles. This is the STRICTEST honest port: we don't fabricate a per-element clone.
    this.elements = other.elements.slice();
    this.currentTime = { ...other.currentTime };
    this.cleared = other.cleared;
    // ownedObjectRaw copies the raw pointer (unmanaged pointer share; the ref pin lives
    // on the PCSharedCount below).
    this.ownedObjectRaw = other.ownedObjectRaw;
    // @0x283d7b PCSharedCount::PCSharedCount(PCSharedCount const&) — strong-ref incref.
    this.ownership = new PCSharedCount(other.ownership);
  }

  // ===========================================================================
  // ~OZSimStateArray()  — @0x283e10 (D1)  /  @Ozone (D2, ICF-alias body)
  //
  // Body:
  //   rdi = rbx + 0x40 ; callq PCSharedCount::~PCSharedCount()    ; release the count
  //   r15 = *(u64*)(rbx+0x00)                                     ; begin_
  //   if (r15 != null) {                                          ; testq/je 0x283e6a
  //     r14 = *(u64*)(rbx+0x08)                                   ; end_
  //     if (r15 != r14) {                                         ; je -> jmp to dealloc
  //       do {
  //         r14 -= 0xf8
  //         callq OZSimStateElement::~OZSimStateElement()          ; @0x283e4a
  //       } while (r14 != r15)
  //     }
  //     *(u64*)(rbx+0x08) = r15                                    ; end_ = begin_
  //     %rdi = *(u64*)(rbx+0x00)
  //     jmp operator delete                                        ; ::operator delete(begin_)
  //   }
  //
  // The dtor semantics are "release ref, destroy elements in REVERSE order (top-down), free
  // storage". We model refcount release via TS GC; the frontier here is
  // OZSimStateElement::~OZSimStateElement() which we must call on every element.
  // ===========================================================================

  /**
   * Destroy. Releases the PCSharedCount (via TS GC — PCSharedCount doesn't expose a manual
   * release since JS has no explicit destructors) and calls OZSimStateElement::~... on
   * every element in reverse order. The vector storage is freed by TS GC.
   *
   * We expose this as an explicit method because the C++ dtor has visible side-effects
   * (element-dtors run OZ business logic); a caller may need to invoke them deterministically.
   */
  destroy(): void {
    // Element-dtor loop — reverse order per @0x283e40..@0x283e52.
    for (let i = this.elements.length - 1; i >= 0; i--) {
      OZSimStateElement_dtor(this.elements[i]);
    }
    this.elements = [];
    // PCSharedCount release is a TS-GC concern; the C++ dtor's `PCSharedCount::~()` at
    // @0x283e21 is a strong-decref that runs *before* the element-dtor loop. In TS the
    // ownership handle becomes eligible for collection when this instance does; the
    // observable-effects difference is only visible under multi-threaded weak-refs, which
    // JS doesn't have.
  }

  // ===========================================================================
  // operator=(OZSimStateArray const&)  — @0x283e80
  //
  // Body (byte-verbatim):
  //   if (this != &rhs) {                                        ; @0x283e98
  //     rsi = rhs.begin_ ; rdx = rhs.end_
  //     rax = (rdx - rsi) >> 3 ; rcx = rax * magic /0xf8         ; element count
  //     callq std::vector<...>::__assign_with_size(rsi, rdx, rcx) ; per-element copy-assign
  //   }
  //   *(u64*)(this+0x38) = *(u64*)(rhs+0x38)                     ; ownedObjectRaw
  //   { PCSharedCount tmp(rhs.ownership); this->ownership = tmp; } ; @0x283ed8..0x283eec
  //   *(u8*)(this+0x30) = *(u8*)(rhs+0x30)                       ; cleared
  //
  // Note: operator= does NOT copy `currentTime` (offsets +0x18/+0x28) — those are
  // preserved on `this`. This is a deliberate SEMANTIC DIVERGENCE from the copy-ctor and
  // is faithfully preserved below.
  // ===========================================================================

  /**
   * operator=(const OZSimStateArray&). @0x283e80.
   *
   * Copies:
   *   - elements array (per-element assign; TS models as shallow copy of the handle array)
   *   - +0x38 ownedObjectRaw
   *   - +0x40 ownership (via PCSharedCount copy-ctor + swap idiom)
   *   - +0x30 cleared
   *
   * Does NOT touch:
   *   - +0x18/+0x28 currentTime  (deliberately kept from the LHS — this is the observable
   *     divergence between copy-ctor and assign in FCP; ground truth at @0x283e80..0x283ef6
   *     shows no writes to offsets +0x18..+0x2f).
   */
  assign(rhs: OZSimStateArray): OZSimStateArray {
    if (this !== rhs) {
      // @0x283ebc __assign_with_size — replace element range with rhs's [begin, end).
      this.elements = rhs.elements.slice();
    }
    this.ownedObjectRaw = rhs.ownedObjectRaw;
    // @0x283ed8-ec — PCSharedCount(const&) into a temp, then PCSharedCount::operator=(tmp)
    // by-value on `this`, then temp's dtor. The libc++ swap-idiom net effect is: this->pi_
    // takes on rhs->pi_'s value (with correct incref/decref bookkeeping via ctor+dtor).
    const tmp = new PCSharedCount(rhs.ownership);
    this.ownership = tmp;
    this.cleared = rhs.cleared;
    return this;
  }

  // ===========================================================================
  // setOwnedObject(PCShared* p)  — @0x283f20
  //
  // Body:
  //   if (p == this->ownedObjectRaw) return;                      ; @0x283f2b .je
  //   // Adjust the passed pointer by rtti offset -0x18 if p != null (VBase adjustment)
  //   %rsi_adj = p != null ? p + *(int64*)(*(u64*)p - 0x18) : nullptr    ; @0x283f38..46
  //   { PCSharedCount tmp(&rsi_adj); ... }                        ; @0x283f4f
  //   // Swap this->ownedObjectRaw with p (via the tmp variable):
  //   %rax = p ; %rcx = this->ownedObjectRaw
  //   *(this + 0x20 stack slot) = %rcx                            ; stash the OLD raw
  //   *(u64*)(this+0x38) = p                                      ; INSTALL the new raw
  //   // Then swap the PCSharedCount using its ::swap: exchange tmp with this->ownership.
  //   PCSharedCount::swap(this->ownership, tmp)                   ; @0x283f6e
  //   ~PCSharedCount(tmp)                                         ; @0x283f76 — drops the OLD ref
  //
  // Net effect: install `p` as the new owned object, drop the strong-ref on whatever was
  // there before. The `-0x18` vbase adjust is the "cast to the primary base" step needed
  // to normalize `p` into whatever PCShared_base the count wants to see; it's undecoded
  // here (needs a full PCShared vtable read).
  // ===========================================================================

  /**
   * setOwnedObject — install a new PCShared object as the owned payload, releasing any
   * previous strong reference. @0x283f20.
   *
   * Early-out: if `p` is bit-equal to the current raw pointer, do nothing (@0x283f2b).
   */
  setOwnedObject(p: PCShared | null): void {
    // @0x283f2b cmpq 0x38(%rdi), %rsi ; je -> return
    if (p === this.ownedObjectRaw) {
      return;
    }
    // @0x283f38..46: VBase adjustment via *(vtable-0x18). This step normalizes `p` into
    // the specific PCShared_base subobject the count wants to hold. Not yet transcribed —
    // the adjustment depends on PCShared's vtable layout which is beyond the current
    // decode. Throw so the frontier is loud.
    if (p !== null) {
      throw new Error(
        "OZSimStateArray::setOwnedObject @0x283f38: VBase (-0x18) adjustment on non-null " +
          "PCShared* not yet transcribed. Requires PCShared vtable @Ozone.",
      );
    }
    // p == null path is fully decoded: skip the adjust, install null, swap the count with
    // an empty tmp, and let the old count's dtor drop the previous ref.
    // @0x283f4f PCSharedCount tmp(nullptr) ; @0x283f60 this->ownedObjectRaw = null ;
    // @0x283f6e swap(this->ownership, tmp) ; @0x283f76 ~tmp (drops old ref).
    const tmp = new PCSharedCount(null);
    this.ownedObjectRaw = null;
    // PCSharedCount::swap exchanges the two pi_ fields (@ProCore 0x4e156, byte-verbatim).
    const oldPi = this.ownership.pi_;
    this.ownership.pi_ = tmp.pi_;
    tmp.pi_ = oldPi;
    // tmp goes out of scope here — TS GC subsumes the C++ PCSharedCount::~PCSharedCount()
    // strong-decref (which is what @0x283f76 executes).
  }

  // ===========================================================================
  // setOwnedObjectFrom(OZSimStateArray const& other)  — @0x283fa0
  //
  // Body (byte-verbatim):
  //   this->ownedObjectRaw = other.ownedObjectRaw                 ; @0x283fae..b2 (movq +0x38)
  //   { PCSharedCount tmp(other.ownership); this->ownership = tmp; }
  //                                                               ; @0x283fbe..d0 (C1(&) + aS)
  //   ~PCSharedCount(tmp)                                         ; @0x283fd9
  //
  // Unlike setOwnedObject, this does NOT touch anything else on the array (no vector
  // assign, no CMTime, no `cleared`). It's the "share ownership handle only" narrow path.
  // ===========================================================================

  /**
   * setOwnedObjectFrom — copy just the ownership pointer + strong-count from another
   * OZSimStateArray. @0x283fa0.
   *
   * Semantically equivalent to `this->{ownedObjectRaw,ownership} = other.{...}`. Does not
   * change `currentTime`, `cleared`, or `elements`.
   */
  setOwnedObjectFrom(other: OZSimStateArray): void {
    // @0x283fae..b2
    this.ownedObjectRaw = other.ownedObjectRaw;
    // @0x283fbe..d0 — PCSharedCount(const&) + operator=(by-value) + tmp-dtor. Net effect:
    // this->ownership.pi_ takes other.ownership.pi_'s value with the correct incref
    // bookkeeping.
    const tmp = new PCSharedCount(other.ownership);
    // PCSharedCount::operator=(PCSharedCount) — by-value RHS = swap idiom (@ProCore 0x4e140).
    const oldPi = this.ownership.pi_;
    this.ownership.pi_ = tmp.pi_;
    tmp.pi_ = oldPi;
  }

  // ===========================================================================
  // clearForces()  — @0x284000
  //
  // Body (byte-verbatim):
  //   rax = *(u64*)(rdi + 0x00)                                    ; rax = begin_
  //   if (rax == *(u64*)(rdi + 0x08)) return;                      ; empty vec -> retq
  //   pushq rbp ; movq rsp,rbp
  //   xorps xmm0,xmm0
  // .Lloop:
  //   movups xmm0, 0xa0(%rax)                                      ; +0xa0 slot = 0,0 (double,double)
  //   movups xmm0, 0x90(%rax)                                      ; +0x90 slot = 0,0
  //   movups xmm0, 0x80(%rax)                                      ; +0x80 slot = 0,0
  //   addq $0xf8, %rax                                             ; ++element
  //   cmpq 0x8(%rdi), %rax                                         ; while (rax != end_)
  //   jne .Lloop
  //   popq rbp ; retq
  //
  // Note the stride 0xf8 confirms element-size = 248 bytes.
  // ===========================================================================

  /**
   * clearForces — zero the three 16-byte force-accumulator slots (offsets +0x80, +0x90,
   * +0xa0) on every element. @0x284000.
   *
   * Called from the simulator between integration passes to reset accumulated forces
   * before OZ*Behavior::accumForces re-populates them.
   */
  clearForces(): void {
    // @0x284000..0x28402f — loop over elements, delegate the zero-write to the element.
    for (const e of this.elements) {
      OZSimStateElement_clearForceSlots(e);
    }
  }

  // ===========================================================================
  // stepFrom(OZSimStateArray* other, CMTime t, double dt)  — @0x284040
  //
  // Body:
  //   pushq rbp ; movq rsp,rbp
  //   movq %rsi, %rdx                                              ; move rsi -> rdx
  //   popq rbp
  //   jmp OZSimStateArray::stepFrom(this, other, other, t, dt)
  //
  // Trampoline: forwards `other` as both `k1` (from-state) and `k2` (rate-source).
  // ===========================================================================

  /**
   * stepFrom (2-arg overload) — integrate one step using `other` as BOTH the from-state
   * and the rate-source. @0x284040 (thin trampoline).
   */
  stepFromSingle(other: OZSimStateArray, t: CMTime, dt: number): void {
    // @0x284040..48 — `movq rsi,rdx ; jmp` — pass `other` as both k1 and k2.
    this.stepFrom(other, other, t, dt);
  }

  // ===========================================================================
  // stepFrom(OZSimStateArray* k1, OZSimStateArray* k2, CMTime t, double dt)  — @0x284050
  //
  // Body (byte-verbatim, structural):
  //   r15 = this->begin_                                           ; @0x284068
  //   if (r15 == this->end_) goto .LtailWrite                      ; empty vec
  //   r12 = k1->begin_ ; r13 = k2->begin_
  //   rbx = 0x3ff0000000000000                                     ; 1.0 (as u64)
  //   store dt (xmm0) -> -0x58(%rbp)
  // .Lloop:                                                        ; @0x2840a0
  //   ; Build a PCMatrix33 identity on the stack (see makePCMatrix33Identity):
  //   [-0xb8(%rbp) .. -0x78(%rbp)] = {1, 0,0,0, 1, 0,0,0, 1}
  //   ; Call OZSimStateElement::stepFrom(out=r15, k1=r12, k2=r13, dt=xmm0,
  //   ;                                   scale=1.0 from Ozone 0x7053e0, mat=&identity):
  //   %xmm1 = *(double*)(rip + 0x4812fc)                           ; xmm1 = 1.0 @Ozone 0x7053e0
  //   %rcx  = &identity_matrix_on_stack
  //   callq OZSimStateElement::stepFrom(...)                       ; @0x2840eb
  //   r15 += 0xf8 ; r12 += 0xf8 ; r13 += 0xf8                      ; advance all 3 ptrs
  //   if (r15 != this->end_) goto .Lloop
  //
  // .LtailWrite:                                                   ; @0x28410f
  //   ; Write the ADVANCED time and copy the ownership from k1 (NOT k2!):
  //   r12 = k1
  //   %rax = k1->currentTime.epoch ; -0x40(%rbp) = %rax
  //   %xmm0 = *(u128*)(k1 + 0x18) ; -0x50(%rbp) = %xmm0             ; k1->currentTime lo-16
  //   ; Call PC_CMTimeSaferAdd(&k1->currentTime, incomingT_from_caller):
  //   [rsp+0x00..+0x28] = { k1->currentTime  ,  arg-t from caller }
  //   leaq -0x70(%rbp), %rdi                                        ; out CMTime buffer
  //   callq _PC_CMTimeSaferAdd                                      ; @0x284150
  //   ; Store result back into THIS:
  //   this->currentTime = *((CMTime*)-0x70(%rbp))                   ; @0x284155..65
  //   this->ownedObjectRaw = k1->ownedObjectRaw                     ; @0x284169..6e
  //   { PCSharedCount tmp(k1->ownership); this->ownership = tmp; }  ; @0x28417a..98
  //   this->cleared = 0                                             ; @0x28419d
  //
  // Semantics: for each element, integrate a step using k1 as from-state and k2 as
  // rate-source; then advance THIS's time by dt (via CMTime addition of caller-provided
  // t onto k1's time), share k1's ownership handle, and clear the "cleared" flag.
  // ===========================================================================

  /**
   * stepFrom (4-arg full overload) — @0x284050.
   *
   * Advances this state by integrating each element from `k1` using `k2` as the rate
   * source, then rebases this->currentTime = PC_CMTimeSaferAdd(k1.currentTime, t), and
   * takes over k1's ownership handle. Also clears the `cleared` flag.
   *
   * NOTE: as per @0x284163, this->currentTime is derived from k1 (NOT from `other` /
   * `k2`) — deliberate. The `t` argument is added ONTO k1's time.
   *
   * ELEMENT INVARIANT: this.elements.length must equal k1.elements.length AND
   * k2.elements.length. The FCP loop drives the iteration by this->end_ but reads from
   * k1 and k2 without any bounds check — passing shorter arrays is undefined behavior
   * in FCP and would out-of-bounds-read; we mirror that by advancing three parallel
   * indices and letting a mismatch throw at the OZSimStateElement stub.
   */
  stepFrom(k1: OZSimStateArray, k2: OZSimStateArray, t: CMTime, dt: number): void {
    // @0x284068..73 — early-out on empty vector: skip the loop, straight to the tail.
    const n = this.elements.length;
    if (n !== 0) {
      // @0x28408a — rbx = 1.0 (bit pattern 0x3ff0000000000000). Prepared once outside the
      // loop and re-used for each iteration's identity-matrix build.
      // @0x284094 — the caller's dt is spilled to -0x58(%rbp) so it survives the callq.
      // Both are register-allocation details; TS's local `dt` param already survives.
      for (let i = 0; i < n; i++) {
        // @0x2840a0..0x2840ca — build the stack PCMatrix33 identity:
        //   xorps xmm0,xmm0 (once, hoisted); rbx=1.0 (once, hoisted).
        //   -0xb8(%rbp)=1.0 (m[0][0]); movups xmm0,(%r14)/0x10(%r14) fills six zero doubles;
        //   -0x98(%rbp)=1.0 (m[1][1]); movups xmm0,0x20(%r14); movq $0,0x30(%r14);
        //   -0x78(%rbp)=1.0 (m[2][2]).
        const identity = makePCMatrix33Identity();
        // @0x2840eb — callq OZSimStateElement::stepFrom(out, k1elem, k2elem, dt, 1.0, identity).
        // xmm1 = 1.0 loaded from Ozone 0x7053e0 (@0x2840dc — see STEP_SCALE_COEFFICIENT above).
        OZSimStateElement_stepFrom(
          this.elements[i],
          k1.elements[i],
          k2.elements[i],
          // dt is passed in xmm0 as a native double — TS `number` is a double, no fround needed.
          dt,
          STEP_SCALE_COEFFICIENT,
          identity,
        );
      }
    }
    // @0x28410f..165 — tail write: this->currentTime = PC_CMTimeSaferAdd(k1->currentTime, t).
    // The FCP stack layout at 0x284122..149:
    //   -0x50(%rbp) = k1->currentTime.value  (movups xmm0 from k1+0x18)
    //   -0x40(%rbp) = k1->currentTime.epoch  (from k1+0x28)
    //   rsp+0x00     = k1->currentTime       (16 bytes)  \_ arg-1 to PC_CMTimeSaferAdd
    //   rsp+0x10     = k1->currentTime.epoch (8 bytes)   /
    //   rsp+0x18..28 = t (from caller — 24 bytes at 0x10(%rbp))
    //   rdi          = &-0x70(%rbp)  (return-value area for the CMTime out-param)
    // The signature is PC_CMTimeSaferAdd(&out, a, b); the port's PC_CMTimeSaferAdd is a
    // pure function returning the CMTime, which is the same observable behavior.
    const newTime = PC_CMTimeSaferAdd(k1.currentTime, t);
    // @0x284155..165 — this->currentTime = newTime.
    this.currentTime = newTime;
    // @0x284169..6e — this->ownedObjectRaw = k1->ownedObjectRaw.
    this.ownedObjectRaw = k1.ownedObjectRaw;
    // @0x28417a..98 — { PCSharedCount tmp(k1->ownership); this->ownership = tmp; }.
    const tmp = new PCSharedCount(k1.ownership);
    // PCSharedCount::operator=(PCSharedCount) — by-value RHS = swap idiom (@ProCore 0x4e140).
    const oldPi = this.ownership.pi_;
    this.ownership.pi_ = tmp.pi_;
    tmp.pi_ = oldPi;
    // @0x28419d — this->cleared = 0.
    this.cleared = false;
  }
}
