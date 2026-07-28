// OZHackedPMRAutoTimer.ts — Ozone's "Hacked PMR Auto Timer" — a compact
// unique_ptr<FFPMRFunnelAutoTimer>-shaped RAII wrapper. Constructing an
// instance does NOT actually build the underlying FFPMRFunnelAutoTimer — the
// four constructor arguments (three CFString category labels + one double
// interval) are accepted for ABI compatibility with the "real" (non-hacked)
// PMRAutoTimer but IGNORED at runtime; the sole owned pointer at offset +0x00
// is null-initialised. Destroying an instance runs the owned timer's D1 and
// frees it via `operator delete` if (and only if) that pointer was set to
// non-null between construction and destruction — a pattern consistent with
// PMR (Performance Measurement / Reporting) being conditionally compiled off
// in this build (hence "Hacked"), where the wrapper stays present so calling
// code and vtables keep their shape but no measurement work is done.
//
// Transcribed from FCP Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Disassembly saved at:
//   raw-port/re/disasm/OZHackedPMRAutoTimer.OZHackedPMRAutoTimer.s      (C1 @0x61bef0)
//   raw-port/re/disasm/OZHackedPMRAutoTimer.~OZHackedPMRAutoTimer.s     (D1 @0x61bf30)
// C2 @0x61bee0 and D2 @0x61bf00 were extracted via
//   `llvm-objdump --arch=x86_64 -d --disassemble-symbols=<mangled>` and are
// bit-identical to C1/D1 respectively (the demangler pair is just Itanium's
// standard base/complete-object split with the same instruction stream).
//
// ─── C2 @Ozone 0x61bee0 / C1 @Ozone 0x61bef0 ────────────────────────────────
//   Signature: OZHackedPMRAutoTimer::OZHackedPMRAutoTimer(
//                CFStringRef category,     // %rsi
//                CFStringRef subcategory,  // %rdx
//                CFStringRef label,        // %rcx
//                double interval)          // %xmm0
//   Body (identical for both C1 and C2):
//     __ZN20OZHackedPMRAutoTimerC2EPK10__CFStringS2_S2_d:
//       0x61bee0  pushq %rbp / movq %rsp,%rbp
//       0x61bee4  movq  $0x0, (%rdi)      ; this->owned = nullptr
//       0x61beeb  popq  %rbp
//       0x61beec  retq
//
//   Semantics: the four constructor arguments are ACCEPTED for ABI shape but
//   never referenced. The single observable side effect is setting the owned
//   pointer at `this+0x00` to null. No timer is created; no allocation runs;
//   no CF retain/release fires. The "Hacked" name is literal: the class body
//   was patched out at build time.
//
// ─── D2 @Ozone 0x61bf00 / D1 @Ozone 0x61bf30 ────────────────────────────────
//   Signature: OZHackedPMRAutoTimer::~OZHackedPMRAutoTimer()
//   Body (identical for both D1 and D2):
//     __ZN20OZHackedPMRAutoTimerD2Ev:
//       0x61bf00  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//       0x61bf06  movq  (%rdi), %rbx                    ; rbx = this->owned
//       0x61bf09  testq %rbx, %rbx                      ; if owned == null:
//       0x61bf0c  je    0x61bf24                        ;   skip destroy+free
//       0x61bf0e  movq  %rbx, %rdi                      ; else:
//       0x61bf11  callq __ZN20FFPMRFunnelAutoTimerD1Ev  ;   owned->~D1()
//       0x61bf16  movq  %rbx, %rdi
//       0x61bf1f  jmp   __ZdlPv                          ;   operator delete(owned) [tail]
//       0x61bf24  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
//
//   Semantics: standard "conditionally destroy + free the owned pointer if
//   non-null" pattern. Since the constructor unconditionally sets the owned
//   field to null and the class exposes no public method to write it, this
//   branch appears never to fire in the "Hacked" build — but the disasm
//   still emits it verbatim (the C++ source was untouched; only the ctor's
//   body was hollowed), so we mirror the full conditional here.
//
// STRUCT LAYOUT (recovered from C1/C2 + D1/D2):
//   OZHackedPMRAutoTimer {
//     +0x00  FFPMRFunnelAutoTimer* owned   // null-initialised by ctor;
//                                          // freed via delete on dtor if !=null.
//   }
//
// FRONTIER CALLEES (undecoded — throwing / noop stubs cite them):
//   __ZN20FFPMRFunnelAutoTimerD1Ev   FFPMRFunnelAutoTimer::~FFPMRFunnelAutoTimer()  @0x61bf11 callq
//   __ZdlPv                          ::operator delete(void*)                       @0x61bf1f jmp
//
// The wrapper itself is fully decoded: null-init ctor + conditional destroy-
// and-free dtor. No floating-point ops (the `interval` double is dropped on
// the ABI boundary before it ever reaches an instruction).

/** Opaque brand for `FFPMRFunnelAutoTimer*`. The full class is a Ozone
 * frontier callee (see @0x61bf11) — not yet transcribed. The wrapper here
 * only ever touches the pointer bit-pattern (null / non-null test + free). */
export type FFPMRFunnelAutoTimerPtr = {
  readonly __brand: "FFPMRFunnelAutoTimer";
};

/** Opaque brand for `CFStringRef`. Both C1 and C2 accept three of these but
 * NEVER dereference them, so the wrapper needs no CoreFoundation surface. */
export type CFStringRef = { readonly __brand: "CFStringRef" };

/**
 * Frontier: `FFPMRFunnelAutoTimer::~FFPMRFunnelAutoTimer()` — called from
 * D1/D2 @Ozone 0x61bf11 when the owned pointer is non-null. Not yet
 * transcribed; every OZHackedPMRAutoTimer lifetime cross-references this if
 * the owned field is ever assigned a non-null value (which the ctor does
 * not do, but external code could).
 */
function FFPMRFunnelAutoTimer_D1(_self: FFPMRFunnelAutoTimerPtr): void {
  // @Ozone 0x61bf11 callq __ZN20FFPMRFunnelAutoTimerD1Ev
  throw new Error(
    "FFPMRFunnelAutoTimer::~FFPMRFunnelAutoTimer() not yet transcribed " +
      "(frontier callee @Ozone 0x61bf11 in OZHackedPMRAutoTimer::~D1/D2)",
  );
}

/**
 * Frontier: `::operator delete(void*)` reached via tail-jump at @Ozone
 * 0x61bf1f. In TS the GC subsumes it; documented so the address chain
 * remains traceable.
 */
function cxx_operator_delete(_p: FFPMRFunnelAutoTimerPtr): void {
  // @Ozone 0x61bf1f jmp __ZdlPv
  // GC subsumes operator delete — noop here.
}

/**
 * `OZHackedPMRAutoTimer` — Ozone's null-body PMR (Performance Measurement /
 * Reporting) timer wrapper.
 *
 * @Ozone symbols owned by this class:
 *   C2 @0x61bee0
 *   C1 @0x61bef0
 *   D2 @0x61bf00
 *   D1 @0x61bf30
 *
 * Observable field (recovered from C1/C2 + D1/D2):
 *   owned — a nullable `FFPMRFunnelAutoTimer*` at struct offset +0x00. The
 *   constructor unconditionally sets it to null; the destructor destroys +
 *   frees it iff it is non-null. The four constructor arguments (three
 *   CFString category labels + one double `interval`) are accepted for ABI
 *   compatibility and IGNORED at runtime.
 */
export class OZHackedPMRAutoTimer {
  /** @Ozone struct offset +0x00 — unique_ptr-shaped owned timer, null by
   * construction and never written by any method emitted for this class. */
  owned: FFPMRFunnelAutoTimerPtr | null;

  /**
   * OZHackedPMRAutoTimer::OZHackedPMRAutoTimer(
   *   __CFString const* category, __CFString const* subcategory,
   *   __CFString const* label, double interval)
   * C1 @Ozone 0x61bef0 / C2 @Ozone 0x61bee0.
   *
   * Both symbols share the same body (Itanium base/complete-object split):
   *   0x61bee4 / 0x61bef4  movq $0x0, (%rdi)   ; this->owned = nullptr
   *
   * All four arguments are ACCEPTED for ABI shape and IGNORED at runtime.
   * The "Hacked" naming is literal — the ctor body was patched out at build
   * time to skip creating the underlying FFPMRFunnelAutoTimer.
   */
  constructor(
    _category: CFStringRef | null,
    _subcategory: CFStringRef | null,
    _label: CFStringRef | null,
    _interval: number,
  ) {
    // @Ozone 0x61bee4 (C2) / 0x61bef4 (C1): movq $0x0, (%rdi)
    this.owned = null;
  }

  /**
   * OZHackedPMRAutoTimer::~OZHackedPMRAutoTimer()
   * D1 @Ozone 0x61bf30 / D2 @Ozone 0x61bf00.
   *
   * Both symbols share the same body:
   *   0x61bf06/0x61bf36  movq  (%rdi), %rbx           ; rbx = this->owned
   *   0x61bf09/0x61bf39  testq %rbx, %rbx             ; if owned == null:
   *   0x61bf0c/0x61bf3c  je    <exit>                 ;   fast-exit
   *   0x61bf11/0x61bf41  callq __ZN20FFPMRFunnelAutoTimerD1Ev  ; owned->~D1()
   *   0x61bf1f/0x61bf4f  jmp   __ZdlPv                          ; operator delete(owned)
   *
   * We mirror the full conditional even though the ctor never sets `owned`
   * to non-null: the disasm emits it, so the port emits it.
   */
  destroy(): void {
    // @Ozone 0x61bf06 (D2) / 0x61bf36 (D1): load this->owned into rbx.
    const owned = this.owned;
    // @Ozone 0x61bf09..0x61bf0c (D2) / 0x61bf39..0x61bf3c (D1):
    //   testq rbx,rbx ; je <exit>
    if (owned === null) {
      // @Ozone 0x61bf24 (D2) / 0x61bf54 (D1): epilogue, no destroy+free.
      return;
    }
    // @Ozone 0x61bf11 (D2) / 0x61bf41 (D1): callq FFPMRFunnelAutoTimer::~D1
    FFPMRFunnelAutoTimer_D1(owned);
    // @Ozone 0x61bf1f (D2) / 0x61bf4f (D1): jmp __ZdlPv — TAIL CALL.
    cxx_operator_delete(owned);
    this.owned = null;
  }
}
