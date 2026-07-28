// LightingStyleLight — Ozone (Ozone.framework) leaf class, transcribed
// as a single-method surface: only the C1 destructor is exported by the
// framework (`__ZN18LightingStyleLightD1Ev` @0x001c4010). No other
// method of this class is visible in the Ozone symbol table, so this
// file models exactly one method plus the two struct offsets it reads.
//
// Framework: Ozone
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework).
//   VAs are unadjusted VM addresses from `otool -tV` (x86_64 slice).
//
// Symbols transcribed:
//   0x001c4010  LightingStyleLight::~LightingStyleLight()  [D1]
//
// STRUCT LAYOUT — recovered from the dtor's two field accesses:
//   +0x00..+0x37  (opaque — the dtor does not touch this range; layout of
//                  earlier fields is inferred to exist by C++ ABI padding)
//   +0x38  CGColorSpaceRef  colorSpace   (optional — the dtor tests it
//                                          against nullptr @0x1c4029 and
//                                          only releases it when non-null.
//                                          Released via
//                                          `PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)`
//                                          @Ozone U-extern
//                                          __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_)
//   +0x40..+0x7f  (opaque)
//   +0x80  PCString         name         (destroyed via `PCString::~PCString()`
//                                          @Ozone U-extern __ZN8PCStringD1Ev
//                                          called with `this + 0x80` in %rdi
//                                          @0x1c4019-0x1c4020)
//
// sizeof: at least 0x88 (0x80 + sizeof(PCString) = 0x80 + at least 8).
// The dtor does not tell us the FULL size — there is no
// `operator delete` in the D1 form; the D0 form (delete-form dtor) is
// not exported.

// ─────────────────────────────────────────────────────────────────────────
// Frontier stubs (undecoded external callees — each throws citing addr).
// ─────────────────────────────────────────────────────────────────────────

/**
 * `PCString::~PCString()` @Ozone U-extern `__ZN8PCStringD1Ev` — the
 * PCString destructor. Called from LightingStyleLight::~LightingStyleLight
 * @0x1c4020 with `this + 0x80` (the `name` field).
 *
 * NOT yet transcribed here (raw-port/src/infra/PCString.ts exists but
 * this file does not depend on its full surface). Modelled as a
 * throwing stub referencing the exact call site.
 */
function PCString__dtor(_thisPlus0x80: object): void {
  throw new Error(
    "PCString::~PCString() @Ozone U-extern __ZN8PCStringD1Ev " +
      "(not yet transcribed on this class's frontier) — invoked by " +
      "LightingStyleLight::~LightingStyleLight @Ozone 0x1c4020 with this+0x80",
  );
}

/**
 * `PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)` @Ozone U-extern
 * `__ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_` — the templated
 * PCCFRefTraits release helper specialized for `CGColorSpace*`. Called
 * from LightingStyleLight::~LightingStyleLight @0x1c402e with the raw
 * `CGColorSpaceRef` held at `this + 0x38` (only on the non-null branch,
 * guarded by `testq/je` @0x1c4029-0x1c402c). NOT yet transcribed.
 */
function PCCFRefTraits_CGColorSpace__release(_cs: object): void {
  throw new Error(
    "PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*) @Ozone U-extern " +
      "__ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_ " +
      "(not yet transcribed) — invoked by LightingStyleLight::~LightingStyleLight @Ozone 0x1c402e",
  );
}

/**
 * `__clang_call_terminate` @Ozone U-extern ___clang_call_terminate — the
 * clang-generated helper that lands during an already-in-flight
 * unwind's cleanup, if the cleanup itself throws. Called on the
 * exception-unwind path @0x1c403d. NOT yet transcribed.
 */
function clang_call_terminate(_p: object): never {
  throw new Error(
    "__clang_call_terminate @Ozone U-extern ___clang_call_terminate " +
      "(not yet transcribed) — invoked by LightingStyleLight::~LightingStyleLight " +
      "exception-unwind cleanup @Ozone 0x1c403d",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `LightingStyleLight` — a lighting-style leaf holding at least a
 * PCString `name` (@+0x80) and an optional CGColorSpaceRef `colorSpace`
 * (@+0x38). Only its D1 destructor is exported by Ozone, so no other
 * behaviour is described here; the JS-side prototype exists only to
 * host `destruct_D1` and the two struct-offset accessors.
 *
 * Full sizeof cannot be recovered from the dtor alone (no
 * `operator delete` in D1); the ctor(s) that would tell us are not
 * emitted by the framework we have.
 */
export class LightingStyleLight {
  /** `colorSpace` @C++ offset +0x38 — CGColorSpaceRef, optional. */
  colorSpace: object | null = null;

  /** `name` @C++ offset +0x80 — PCString by value. Placeholder object. */
  namePCString: object = {};

  /**
   * `LightingStyleLight::~LightingStyleLight()` @Ozone 0x001c4010 [D1].
   *
   * Faithful transcription of the 15-body-line asm block:
   *   1. Frame setup + spill @0x1c4010-0x1c4016 (rbx ← this).
   *   2. `rdi = this + 0x80` @0x1c4019.
   *   3. @0x1c4020 `callq PCString::~PCString()` on the `name` field.
   *   4. `rdi = *(this + 0x38)` @0x1c4025 — load the CGColorSpaceRef.
   *   5. `testq %rdi, %rdi` @0x1c4029; `je 0x1c4033` @0x1c402c —
   *      skip the release on nullptr.
   *   6. @0x1c402e `callq PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)`.
   *   7. Frame teardown + retq @0x1c4033-0x1c4039.
   *   Exception-unwind path @0x1c403a-0x1c403d: `__clang_call_terminate`
   *   (dtor-in-flight-throw guard).
   *
   * Modelled as a method that chains through the two frontier stubs in
   * the SAME order the asm calls them, honoring the nullptr guard.
   */
  destruct_D1(): void {
    // Step 3 — @0x1c4020: PCString dtor on (this + 0x80).
    PCString__dtor(this.namePCString);
    // Steps 5-6 — @0x1c4029..@0x1c402e: nullptr-guarded CGColorSpace release.
    if (this.colorSpace !== null) {
      PCCFRefTraits_CGColorSpace__release(this.colorSpace);
    }
    // Steps 7 — retq. No explicit action; JS returns void.
  }
}
