// raw-port of ProChannel C++ class OZHermiteInterpolator.
// A subclass of OZBezierInterpolator that overrides two data slots on the
// object it inherits: (1) the vtable pointer at offset 0x00, and (2) the
// `handleScale` double at offset 0x08 — set to exactly 1/3 (matching the
// classical Hermite-to-Bezier tangent scale where each Bezier control point
// sits (t2 - t0)/3 from the endpoint along its tangent).
//
// All five method addresses are ctor/dtor thunks. There are NO other
// members: the class carries no additional storage beyond its parent.
//
// SOURCE: ProChannel.framework (x86_64 slice). Every asm block below is
// verbatim from `otool -tV -arch x86_64`.

import { OZBezierInterpolator } from "./OZBezierInterpolator.js";

/**
 * OZHermiteInterpolator — ProChannel.
 *
 * The parent OZBezierInterpolator installs `handleScale = 1.0`
 * (@ProChannel 0x4045e). The Hermite subclass overrides that member to 1/3
 * (@ProChannel 0x445be — `movabsq $0x3fd5555555555555, %rax` = IEEE-754
 * double 0.3333333333333333, decoded exactly by `python3 -c "import struct;
 * print(struct.unpack('>d', bytes.fromhex('3fd5555555555555'))[0])"` -> 1/3).
 * All actual interpolation logic is inherited from OZBezierInterpolator; the
 * subclass is a data-only override.
 */
export class OZHermiteInterpolator extends OZBezierInterpolator {
  /**
   * Overrides the parent's `handleScale` (which is 1.0 at
   * @ProChannel 0x4045e). Value @0x445be is
   *   movabsq $0x3fd5555555555555, %rax     ; = 1/3 exactly (IEEE-754)
   *   movq    %rax, 0x8(%rbx)               ; this[0x08] = 1/3
   */
  readonly handleScale: number = 1 / 3;

  /**
   * OZHermiteInterpolator::OZHermiteInterpolator()  [C2 base ctor]  @0x445a6
   *
   * Asm (@0x445a6..0x445d2):
   *   callq    __ZN20OZBezierInterpolatorC2Ev   ; parent base-ctor
   *   leaq     0x91da5(%rip), %rax              ; load OZHermiteInterpolator vtable ptr
   *   movq     %rax, (%rbx)                     ; this[0x00] = &vtable
   *   movabsq  $0x3fd5555555555555, %rax        ; 1/3
   *   movq     %rax, 0x8(%rbx)                  ; this[0x08] = 1/3
   *
   * OZHermiteInterpolator::OZHermiteInterpolator()  [C1 complete ctor]  @0x445d4
   *
   * Asm (@0x445d4..0x44600): IDENTICAL to C2 except the vtable RIP-relative
   * offset differs (0x91d77 vs 0x91da5) because the load address differs by
   * 0x2e bytes — this is a compiler-emitted alias, not a semantic
   * difference. Both write the SAME final vtable pointer to this[0x00] and
   * the SAME 1/3 to this[0x08]. Both delegate to
   * __ZN20OZBezierInterpolatorC2Ev.
   *
   * In TS these merge into a single constructor. There is nothing to do
   * here at runtime beyond letting the parent ctor run and letting the
   * class-field initializer above install `handleScale = 1/3`. Method
   * dispatch takes the place of the vtable install.
   */
  constructor() {
    super();
    // handleScale is set via the readonly class-field initializer above,
    // exactly mirroring the movabsq at @0x445be / @0x445ec.
  }

  /**
   * OZHermiteInterpolator::~OZHermiteInterpolator()  [D2 base dtor]  @0x44602
   *
   * Asm (@0x44602..0x44607):
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   jmp   __ZN20OZBezierInterpolatorD2Ev    ; tail call to parent D2 dtor
   *
   * OZHermiteInterpolator::~OZHermiteInterpolator()  [D1 complete dtor]  @0x4460c
   *
   * Asm (@0x4460c..0x44611): byte-identical to D2 above (same tail-jmp to
   * OZBezierInterpolatorD2Ev). Another compiler-emitted alias.
   *
   * OZHermiteInterpolator::~OZHermiteInterpolator()  [D0 deleting dtor]  @0x44616
   *
   * Asm (@0x44616..0x4462d):
   *   callq __ZN20OZBezierInterpolatorD2Ev    ; run parent base-dtor
   *   movq  %rbx, %rdi                        ; rdi = this
   *   jmp   __ZdlPv                           ; tail call to operator delete(void*)
   *
   * In TS/JS there is nothing to do — no `delete` operator, no vtable
   * dispatch to a dtor, and the parent has no destructible resources
   * (OZBezierInterpolator has none either). This dispose() method exists
   * only so callers translated from the C++ dtor sites remain callable; it
   * intentionally performs no work, mirroring the fact that
   * OZBezierInterpolator::~OZBezierInterpolator() is a trivial tail-jmp
   * chain with no field cleanup.
   *
   * The D0 "deleting dtor" variant additionally calls operator delete —
   * that has no meaningful analog in TS (GC handles memory), so it is a
   * no-op here too.
   */
  dispose(): void {
    // No-op. Faithful to @0x44602/@0x4460c which do nothing but tail-call
    // the (also-empty) parent D2 dtor. The @0x44616 deleting variant
    // additionally invokes operator delete — irrelevant in a GC runtime.
  }
}
