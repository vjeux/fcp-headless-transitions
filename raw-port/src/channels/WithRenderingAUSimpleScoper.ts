// WithRenderingAUSimpleScoper — Flexo.framework RAII helper that TEMPORARILY
// marks an AUSimpleScoper as "in the render pass" via a 32-bit atomic flag on
// the target scoper, and clears the flag on destruction *iff this instance
// was the one that acquired it. This is the classic "did-we-take-ownership"
// scoped-lock idiom, atomic via a single-slot uint32.
//
// Symbols in Flexo (nm -arch x86_64):
//   0x1248cd0 t __ZN27WithRenderingAUSimpleScoperC1EP14AUSimpleScoperi   (ctor C1)
//   0x1248cd0 t __ZN27WithRenderingAUSimpleScoperC2EP14AUSimpleScoperi   (ctor C2 — alias)
//   0x1248d00 t __ZN27WithRenderingAUSimpleScoperD1Ev                    (dtor D1)
//   0x1248d00 t __ZN27WithRenderingAUSimpleScoperD2Ev                    (dtor D2 — alias)
// C1/C2 and D1/D2 are ABI aliases at the SAME address — there is only ONE
// physical ctor body and ONE physical dtor body to transcribe. This is the
// standard clang emission when a class has no non-trivial base subobjects
// requiring the complete/base distinction.
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.WithRenderingAUSimpleScoper.C1_D2.s   (both bodies, adjacent)
//
// Struct layout (recovered from ctor stores + dtor loads):
//   +0x000  AUSimpleScoper*  scoper           — ctor @0x1248cd4:  movq %rsi, (%rdi)
//   +0x008  uint8_t          ownedRendering   — ctor @0x1248cd7:  movb $0x0, 0x8(%rdi)
//                                               ctor @0x1248cf1:  sete 0x8(%rdi)   (1 iff CAS won)
//                                               dtor @0x1248d00:  cmpb $0x1, 0x8(%rdi)
// The referenced AUSimpleScoper field:
//   scoper +0x2AC   uint32_t  renderingFlag   — CAS'd atomically 0↔1
//   Evidence: ctor @0x1248cea  lock cmpxchgl %ecx, 0x2ac(%rsi)   (rsi = scoper)
//             dtor @0x1248d15  lock cmpxchgl %edx, 0x2ac(%rcx)   (rcx = scoper reloaded)
//
// The `int mode` ctor parameter (from the demangled signature: `(AUSimpleScoper*, int)`)
// is a discriminator over the acquire policy:
//   ctor @0x1248cdb  incl %edx                  ## edx = mode + 1  (widening: 32-bit)
//   ctor @0x1248cdd  cmpl $0x1, %edx
//   ctor @0x1248ce0  ja   0x1248cf5             ## skip CAS if unsigned(mode+1) > 1
// Under signed reading of `mode`, `mode+1 <= 1` (unsigned) accepts exactly two edx values:
// 0 and 1, i.e. mode == -1 or mode == 0. For any other mode the ctor does NOT attempt
// to take ownership. This matches the AUSimpleScoper acquire enum used elsewhere in
// Flexo (mode encodes the acquisition mode; only two of its values arm the scope).
// We transcribe the predicate exactly as the binary computes it — this is a decode
// citation, not a re-interpretation.
//
// Flexo referenced symbols:
//   AUSimpleScoper::renderingFlag        offset +0x2ac on the scoper (opaque here)
//   No external stubs are called (no callq).
//
// Frontier callees: NONE. Both bodies decode fully into arithmetic + atomic ops.

/**
 * Opaque view of the AUSimpleScoper we operate on. This class exists elsewhere in
 * Flexo (has its own ctor at __ZN14AUSimpleScoperC2E..., visible immediately after
 * this class in the disasm dump) — we only need the +0x2ac uint32 flag here, so we
 * model it structurally.
 */
export interface AUSimpleScoperView {
  /** @+0x2AC — 32-bit atomic slot: 0 = free, 1 = rendering. */
  renderingFlag_at_0x2ac: number;
}

/**
 * Emulate `lock cmpxchgl %new, [addr]` with expected == %eax.
 *   Semantics: if `*addr == expected`, write `newVal` and return true; else leave
 *   `*addr` and return false. Single-threaded JS mirror — the "lock" prefix has
 *   no additional meaning in a single-threaded runtime, but the compare-and-swap
 *   read/write pair is preserved so any future SharedArrayBuffer-backed field
 *   can drop in without changing the mirror.
 *
 * Cited from:
 *   ctor @0x1248ce9..0x1248cea  lock cmpxchgl %ecx, 0x2ac(%rsi)
 *   dtor @0x1248d14..0x1248d15  lock cmpxchgl %edx, 0x2ac(%rcx)
 */
function cmpxchg32(target: AUSimpleScoperView, expected: number, newVal: number): boolean {
  if (target.renderingFlag_at_0x2ac === expected) {
    target.renderingFlag_at_0x2ac = newVal >>> 0;
    return true;
  }
  return false;
}

// ─── The class ────────────────────────────────────────────────────────────────────────

/**
 * WithRenderingAUSimpleScoper — RAII lock over AUSimpleScoper::renderingFlag_at_0x2ac.
 * See file header for provenance.
 */
export class WithRenderingAUSimpleScoper {
  /** @+0x000 — the scoper we lock; borrowed pointer (dtor does not delete it).
   *  Initialised to null by the field declaration and overwritten by the ctor at
   *  @0x1248cd4. The native class has no default ctor — the storage is undefined
   *  until the mangled ctor runs — but TS's strict-property-initialisation gate
   *  requires a definite initialiser, so we surface a null sentinel here.
   *  The dtor never runs before the ctor in real Flexo usage; if it did, the
   *  `ownedRendering !== 1` early return already short-circuits before touching
   *  scoper, so the sentinel is unreachable from the ported dtor as well.
   */
  scoper: AUSimpleScoperView | null = null;
  /** @+0x008 — 1 iff this instance atomically won the flag (must release on dtor). */
  ownedRendering: number = 0;

  /**
   * WithRenderingAUSimpleScoper::WithRenderingAUSimpleScoper(AUSimpleScoper*, int)
   *   C1/C2 alias @Flexo 0x1248cd0
   *   raw-port/re/disasm/Flexo.WithRenderingAUSimpleScoper.C1_D2.s
   *
   * Line-for-line:
   *   0x1248cd0  push rbp; mov rbp, rsp                                    prologue
   *   0x1248cd4  mov  [rdi],     rsi                ## this->scoper = scoper (arg1)
   *   0x1248cd7  mov  byte [rdi+0x8], 0             ## this->ownedRendering = 0
   *   0x1248cdb  inc  edx                           ## edx = mode + 1  (32-bit)
   *   0x1248cdd  cmp  edx, 1
   *   0x1248ce0  ja   0x1248cf5                     ## if unsigned(mode+1) > 1: skip
   *   0x1248ce2  mov  ecx, 1                                              new value
   *   0x1248ce7  xor  eax, eax                                            expected = 0
   *   0x1248ce9  lock cmpxchgl ecx, [rsi+0x2ac]     ## atomic 0 -> 1 on scoper flag
   *   0x1248cf1  sete byte [rdi+0x8]                ## ownedRendering = ZF (=1 if CAS won)
   *   0x1248cf5  pop rbp; ret
   */
  constructor_at_0x1248cd0(scoper: AUSimpleScoperView, mode: number): void {
    // @0x1248cd4..0x1248cd7 — initialise ivars.
    this.scoper = scoper;
    this.ownedRendering = 0;
    // @0x1248cdb..0x1248ce0 — gate the acquire on `unsigned(mode+1) <= 1`.
    // Compute in 32-bit unsigned space, exactly as the asm does (`incl %edx` +
    // `cmpl $0x1, %edx; ja`).
    const edx = ((mode | 0) + 1) >>> 0;
    if (edx > 1) {
      // @0x1248ce0 — skip: leave ownedRendering at 0.
      return;
    }
    // @0x1248ce2..0x1248cf1 — atomic 0 → 1; ownedRendering := ZF.
    const won = cmpxchg32(scoper, 0 >>> 0, 1 >>> 0);
    this.ownedRendering = won ? 1 : 0;
  }

  /**
   * WithRenderingAUSimpleScoper::~WithRenderingAUSimpleScoper()
   *   D1/D2 alias @Flexo 0x1248d00
   *
   * Line-for-line:
   *   0x1248d00  cmp  byte [rdi+0x8], 1              ## if (!ownedRendering) return
   *   0x1248d04  jne  0x1248d1d
   *   0x1248d06  push rbp; mov rbp, rsp                                    prologue
   *   0x1248d0a  mov  rcx, [rdi]                     ## rcx = this->scoper
   *   0x1248d0d  xor  edx, edx                                             new value = 0
   *   0x1248d0f  mov  eax, 1                                               expected = 1
   *   0x1248d14  lock cmpxchgl edx, [rcx+0x2ac]      ## atomic 1 -> 0 on scoper flag
   *   0x1248d1c  pop rbp
   *   0x1248d1d  ret
   *
   * Notice the dtor DOES NOT null the ivars — the object storage is going away.
   * The return value of cmpxchg is discarded (best-effort release: if the flag
   * has already been forcibly reset by another party, we simply don't touch it).
   */
  dtor_at_0x1248d00(): void {
    // @0x1248d00..0x1248d04 — if we did not take ownership, do nothing.
    if (this.ownedRendering !== 1) {
      return;
    }
    // @0x1248d0a..0x1248d14 — atomic 1 → 0 on scoper->renderingFlag.
    // The result flag from cmpxchg is discarded (dtor is best-effort).
    // If ownedRendering was 1, the ctor also stored a non-null scoper — the null
    // guard here is only for TS's flow analysis (see the note on the `scoper`
    // field declaration above).
    if (this.scoper !== null) {
      cmpxchg32(this.scoper, 1 >>> 0, 0 >>> 0);
    }
  }
}
