// FFAssetUser — Flexo base/mixin for objects that "use" (reference-count) an FFAsset.
// A tiny holder that (a) retains an ObjC FFAsset* on construction and pings its
// `incrementUse` selector, then (b) mirrors that on destruction with `decrementUse`
// followed by `objc_release`. Nothing more. It exists so that any class deriving
// from FFAssetUser (renderers, importers, …) participates in FFAsset's own
// higher-level use-count bookkeeping in addition to plain ObjC ARC.
//
// Faithful transcription of Flexo class FFAssetUser (3 exported methods: one ctor
// symbol + two dtor symbols D1/D2 that share an identical body — the standard
// C++ Itanium ABI complete/base-object destructor pair).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFAssetUser.FFAssetUser.s   (ctor  @0x36c6e0)
//   raw-port/re/disasm/Flexo.FFAssetUser.~FFAssetUser.s  (dtors @0x36c760 / @0x36c720)
// Framework: Final Cut Pro / Flexo.framework
//
// DECODE — struct layout (recovered from the ctor + dtor accesses; every field
// read/written is at offset +0x00 and nowhere else):
//   +0x00  FFAsset*  asset   // ObjC id of the retained FFAsset. Zeroed at the top
//                            // of the ctor via `movq $0x0, (%rdi)` @0x36c6e9, then
//                            // overwritten with the objc_retain result via
//                            // `movq %rax, (%rbx)` @0x36c6f9. The dtor reads it
//                            // via `movq (%rdi), %rdi` @0x36c769 (D1) / @0x36c729
//                            // (D2) both as the receiver of `[asset decrementUse]`
//                            // AND, right after, as the argument to `objc_release`
//                            // (`movq (%rbx), %rdi` @0x36c779 / @0x36c739).
// sizeof(FFAssetUser) = 8 bytes (single pointer field; no vtable — ctor never
// installs one, and neither dtor rewrites +0x00 to anything other than the retained
// FFAsset*, so FFAssetUser is a non-polymorphic base/mixin, not a class with virtuals).
//
// Selrefs (resolved via dyld_info -fixups on the RIP-relative loads):
//   `incrementUse`  — selref slot Flexo 0x1BC8530 -> "incrementUse" @Flexo 0x179B5A1
//                     (loaded by ctor @0x36c6fc:  movq 0x185be2d(%rip), %rsi)
//   `decrementUse`  — selref slot Flexo 0x1BC8538 -> "decrementUse" @Flexo 0x1777FB4
//                     (loaded by dtor @0x36c76c (D1) / @0x36c72c (D2):
//                                              movq 0x185bdc5(%rip), %rsi)
// Runtime imports used (RIP-relative stub jmpq/callq resolved from otool -tV):
//   _objc_retain          @0x36c6f3 (call)   — bumps the ObjC refcount of `asset`.
//   _objc_release         @0x36c77c (D1 call) / @0x36c73c (D2 call).
//   _objc_msgSend         @0x36c70c (ctor tail jmpq) — sends `incrementUse`.
//   _objc_msgSend         @0x36c773 (D1 call) / @0x36c733 (D2 call) — sends `decrementUse`.
// The dtor's landing pad @0x36c789 (D1) / @0x36c749 (D2) rolls into
// ___clang_call_terminate — the standard C++ noexcept trampoline, meaning both
// ~FFAssetUser bodies are noexcept and any exception escaping the msgSend/release
// pair aborts. That's inherent to the C++ dtor contract and needs no TS mirror.

// FFAsset is an ObjC class defined elsewhere in Flexo. Its `incrementUse` and
// `decrementUse` selectors are private to the ObjC side and are not decoded here;
// we model FFAsset as an opaque handle whose only interface visible to this class
// is those two selectors + participation in objc_retain/objc_release.
export type FFAsset = object;

/**
 * ObjC `-[FFAsset incrementUse]`. Not part of this class's decoded surface — the
 * selector fires from the ctor tail (@0x36c70c) but the method body lives in the
 * FFAsset ObjC implementation, which has not been transcribed to TS. Any real
 * runtime that instantiates FFAssetUser must provide the FFAsset side.
 */
function FFAsset_incrementUse(_asset: FFAsset): void {
  throw new Error(
    "FFAssetUser: -[FFAsset incrementUse] not yet transcribed " +
      "@Flexo 0x36c70c (selref @Flexo 0x1BC8530)"
  );
}

/**
 * ObjC `-[FFAsset decrementUse]`. Symmetric to `incrementUse`; fires from the
 * dtor (@0x36c773 in D1 / @0x36c733 in D2). Body lives on the FFAsset ObjC side
 * and is not decoded here.
 */
function FFAsset_decrementUse(_asset: FFAsset): void {
  throw new Error(
    "FFAssetUser: -[FFAsset decrementUse] not yet transcribed " +
      "@Flexo 0x36c773 (selref @Flexo 0x1BC8538)"
  );
}

/**
 * `_objc_retain(asset)`. Runtime stub called by the ctor @0x36c6f3. In the ObjC
 * ARC model this bumps `asset`'s reference count and returns the same pointer
 * (the assembly relies on `%rax == %rsi` after the call: it stores `%rax` into
 * `(%rbx)` and then uses `%rax` as the msgSend receiver). Modeled as identity
 * here — a JS `object` reference has no separate ObjC refcount to bump — but
 * marked as a decode gap so any host wiring FFAssetUser to real ObjC objects
 * can slot in a proper retain hook.
 */
function objc_retain(asset: FFAsset): FFAsset {
  throw new Error(
    "FFAssetUser: _objc_retain runtime hook not yet transcribed " +
      "@Flexo 0x36c6f3 (imported stub via GOT)"
  );
}

/**
 * `_objc_release(asset)`. Runtime stub called by the dtor @0x36c77c (D1) /
 * @0x36c73c (D2). Symmetric partner of `objc_retain`.
 */
function objc_release(_asset: FFAsset): void {
  throw new Error(
    "FFAssetUser: _objc_release runtime hook not yet transcribed " +
      "@Flexo 0x36c77c (imported stub via GOT)"
  );
}

/**
 * FFAssetUser — see file header for the full struct layout & decode notes.
 * A base/mixin holding a use-counted, retained FFAsset*.
 */
export class FFAssetUser {
  /**
   * `FFAsset*` at struct offset +0x00. Retained via `objc_retain` in the ctor;
   * paired with `objc_release` in the dtor. The ctor first zeros this slot
   * (`movq $0x0, (%rdi)` @0x36c6e9) before storing the retained pointer — a
   * detail we preserve by initializing to `null` on the TS side even though the
   * ctor immediately overwrites it. Kept `public` because FFAssetUser is a base
   * class and its subclasses (undecoded so far) will read this slot directly.
   */
  public asset: FFAsset | null;

  /**
   * `FFAssetUser::FFAssetUser(FFAsset* asset)` @Flexo 0x36c6e0.
   *
   * Disasm mirror (raw-port/re/disasm/Flexo.FFAssetUser.FFAssetUser.s):
   *   0x36c6e9  movq $0x0, (%rdi)                 // this->asset = nullptr
   *   0x36c6f3  callq _objc_retain (rsi=asset)    // rax = objc_retain(asset)
   *   0x36c6f9  movq %rax, (%rbx)                 // this->asset = rax
   *   0x36c6fc  movq selref["incrementUse"], %rsi
   *   0x36c70c  jmpq *_objc_msgSend               // TAIL CALL: [rax incrementUse]
   *
   * The `jmpq` (not `callq`) at 0x36c70c is a tail call: control transfers to
   * `objc_msgSend(retained_asset, @selector(incrementUse))` and never returns
   * to this function — the retained pointer is `%rax` (also stored at +0x00),
   * which lands as `%rdi` (self) into msgSend. Semantically identical to a
   * normal call followed by return, so we express it as a plain statement.
   */
  constructor(asset: FFAsset) {
    // @0x36c6e9 — zero the slot before the retain (matches the ctor's exact
    // instruction order; visible in the assembly and preserved here even
    // though it's immediately overwritten).
    this.asset = null;
    // @0x36c6f3 — retain the incoming FFAsset*.
    const retained: FFAsset = objc_retain(asset);
    // @0x36c6f9 — store the retained pointer at +0x00.
    this.asset = retained;
    // @0x36c70c — tail-jmp equivalent: send `incrementUse` to the retained
    // asset. `objc_msgSend`'s receiver (%rdi) is `%rax` from `objc_retain`,
    // i.e. `retained`, not `this`. That's the FFAsset getting bumped, not
    // FFAssetUser.
    FFAsset_incrementUse(retained);
  }

  /**
   * `FFAssetUser::~FFAssetUser()` — both D1 (complete-object) @Flexo 0x36c760
   * and D2 (base-object) @Flexo 0x36c720. The two symbols exist to satisfy the
   * Itanium C++ ABI (`__ZN11FFAssetUserD1Ev` vs `__ZN11FFAssetUserD2Ev`) but
   * are BYTE-FOR-BYTE IDENTICAL bodies (compare @0x36c720-@0x36c748 to
   * @0x36c760-@0x36c788 — same 4 instructions of prologue, same
   * `[asset decrementUse]` + `objc_release(asset)` pair, same epilogue and
   * same `___clang_call_terminate` landing pad). This is expected for a class
   * with no virtual bases: D1 and D2 collapse to the same body.
   *
   * Disasm mirror (raw-port/re/disasm/Flexo.FFAssetUser.~FFAssetUser.s, D1):
   *   0x36c769  movq (%rdi), %rdi                 // arg = this->asset
   *   0x36c76c  movq selref["decrementUse"], %rsi
   *   0x36c773  callq *_objc_msgSend              // [asset decrementUse]
   *   0x36c779  movq (%rbx), %rdi                 // arg = this->asset (reload)
   *   0x36c77c  callq *_objc_release              // objc_release(asset)
   *
   * Note the RELOAD @0x36c779: even though `%rdi` was overwritten by msgSend's
   * ABI, the compiler didn't spill — it re-reads `this->asset` from +0x00 via
   * the preserved `%rbx = this`. So we call `decrementUse` on the exact same
   * pointer we then release, sourced from the field, not from a local.
   *
   * TypeScript has no C++ destructor hook, so this is a plain method. Callers
   * (or a future generated subclass wrapper) invoke it in place of the
   * implicit dtor.
   */
  destroy(): void {
    // @0x36c769 — load this->asset as the msgSend receiver.
    const a: FFAsset | null = this.asset;
    if (a === null) {
      // The native code does not null-check — it would crash on a nil field.
      // But a nil field is only reachable if a subclass or a stack-scanned
      // partial construction hits ~this before the ctor's store @0x36c6f9,
      // which the compiler proves impossible. We mirror "would crash" as a
      // throw so silent no-ops are not introduced.
      throw new Error(
        "FFAssetUser::~FFAssetUser: this.asset is null " +
          "(unreachable in Flexo per ctor @0x36c6e9/@0x36c6f9; native code deref-crashes)"
      );
    }
    // @0x36c773 — [asset decrementUse].
    FFAsset_decrementUse(a);
    // @0x36c779 — reload this->asset (compiler chose reload over spill).
    const a2: FFAsset | null = this.asset;
    if (a2 === null) {
      // Same reasoning as above; kept as a THROW to preserve exact semantics
      // rather than silently swallow.
      throw new Error(
        "FFAssetUser::~FFAssetUser: this.asset became null between decrementUse and release " +
          "(unreachable per single-threaded dtor invariant @Flexo 0x36c779)"
      );
    }
    // @0x36c77c — objc_release(asset).
    objc_release(a2);
    // The native dtor's `___clang_call_terminate` landing pad (@0x36c789 for D1,
    // @0x36c749 for D2) is C++ noexcept enforcement — if a JS `throw` escapes
    // either FFAsset selector or objc_release, it corresponds to the terminate
    // path. We don't wrap in try/catch: rethrowing is the faithful mirror.
  }
}
