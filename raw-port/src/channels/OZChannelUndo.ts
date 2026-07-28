/**
 * OZChannelUndo — Ozone undo-record for a single channel edit. Holds a strong
 * reference to a source channel plus the "shadow" replacement channel that
 * `Swap()` swings into place under the ObjectManipulator when the user
 * invokes undo/redo. Base class of `OZMarkersUndo`, `OZOSCUndo`,
 * `OZSceneRangeUndo` (see vtable-neighbour dump @Ozone 0x83d528).
 *
 * Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
 *
 * STRUCT LAYOUT (recovered from C2 @0xffe30 + D2 @0xffeb0):
 *   +0x00  vptr        // install of &vtable[+0x10] = 0x83d538 @0xffe30 (RIP+0x73d6f4)
 *                      //   vtable[0]  = D1 @0xfff00
 *                      //   vtable[8]  = D0 @0xfff50
 *                      //   vtable[10] = Swap() @0xfffa0
 *   +0x08  OZChannelRef* refToSource
 *                      // = source.getRef(false)   @0xffe4c
 *                      // Destroyed by the dtors via `OZChannelRef::~OZChannelRef()`
 *                      //   @Ozone stub 0x6dd71c then `operator delete` @0x6dfc36.
 *   +0x10  OZChannelBase* shadowChannel
 *                      // = source.vtable[0xf8](&source)   @0xffe5b
 *                      //   i.e. a fresh copy/clone of the channel produced by
 *                      //   source's vtable-slot 0xf8. Destroyed by the dtors
 *                      //   via shadow.vtable[0x8](shadow)  @0xfff39/@0xffeed.
 *
 * @classAddr Ozone
 *   0xffe30  OZChannelUndo::OZChannelUndo(OZChannelBase const&)  [C2]
 *   0xffe70  OZChannelUndo::OZChannelUndo(OZChannelBase const&)  [C1 — identical body, distinct symbol]
 *   0xffeb0  OZChannelUndo::~OZChannelUndo()                     [D2 — base, non-deleting]
 *   0xfff00  OZChannelUndo::~OZChannelUndo()                     [D1 — complete-object, non-deleting]
 *   0xfff50  OZChannelUndo::~OZChannelUndo()                     [D0 — deleting]
 *   0xfffa0  OZChannelUndo::Swap()
 *
 * @vtable Ozone 0x83d528 (installed ptr 0x83d538) — 3 slots + typeinfo:
 *   *0x00 -> 0xfff00  D1
 *   *0x08 -> 0xfff50  D0
 *   *0x10 -> 0xfffa0  Swap
 */

import { OZChannelBase } from "./OZChannelBase.js";

// ── Frontier stubs — undecoded external callees ──────────────────────────

/** `OZChannelBase::getRef(bool)` @Ozone stub 0x6df56a — mangled
 *  `__ZNK13OZChannelBase6getRefEb`. Called @0xffe4c with `esi=0` (false) to
 *  obtain a fresh `OZChannelRef*` for the source channel. Undecoded here. */
function OZChannelBase_getRef_stub(_ch: OZChannelBase, _b: boolean): unknown {
  throw new Error(
    "OZChannelBase::getRef(bool) @Ozone 0x6df56a (stub) not yet transcribed",
  );
}

/** Virtual slot 0xf8 on `OZChannelBase` — dispatched @0xffe5b as
 *  `callq *0xf8(%rax)` on the source channel with `rdi = &source`. Returns
 *  the shadow-channel pointer stored at `this+0x10`. The concrete method
 *  varies per subclass (OZChannel, OZChannelFolder, ...) — undecoded. */
function OZChannelBase_vslot_f8_stub(_ch: OZChannelBase): unknown {
  throw new Error(
    "OZChannelBase::vtable[0xf8](this) @Ozone (dispatch @0xffe5b, per-subclass) not yet transcribed",
  );
}

/** `OZChannelRef::~OZChannelRef()` @Ozone stub 0x6dd71c — mangled
 *  `__ZN12OZChannelRefD1Ev`. Called @0xffed0/@0xfff20/@0xfff70. Undecoded. */
function OZChannelRef_dtor_stub(_r: unknown): void {
  throw new Error(
    "OZChannelRef::~OZChannelRef() @Ozone 0x6dd71c (stub) not yet transcribed",
  );
}

/** `operator delete(void*)` @Ozone stub 0x6dfc36 — mangled `_ZdlPv`. Called
 *  @0xffed8/@0xfff28/@0xfff78 (frees the OZChannelRef allocation) and
 *  @0xfff93 (frees `this` on the D0 tail). Undecoded. */
function operator_delete_stub(_p: unknown): void {
  throw new Error("operator delete(void*) @Ozone 0x6dfc36 (stub) not yet transcribed");
}

/** Virtual slot 0x8 on the shadow channel — dispatched @0xffeed/@0xfff39/
 *  @0xfff89 as `callq *0x8(%rax)` on `this->shadowChannel`. Slot 0x8 of a
 *  standard C++ vtable is the deleting destructor (D0); the surrounding
 *  disasm confirms this: it is called on `+0x10` only after the ref-owned
 *  block is disposed, and the pointer is never freed again. Per-subclass. */
function shadow_vslot_8_dtor_stub(_ch: unknown): void {
  throw new Error(
    "shadowChannel->vtable[0x8](this) @Ozone (per-subclass deleting dtor) not yet transcribed",
  );
}

/** `OZChannelUndo::Swap()` @Ozone 0xfffa0 — undo/redo swap. Transcribed only
 *  as a documented stub: the body (255 lines of disasm at
 *  raw-port/re/disasm/OZChannelUndo.Swap.s) is a chain of `___dynamic_cast`s
 *  + `OZDocument::postNotification(unsigned int)` calls plus vtable
 *  dispatches on OZChannelBase (slots 0xe8, 0xf8, 0x100, 0x160, 0x168,
 *  0x1a8) and OZObjectManipulator. Every callee is a frontier Ozone class
 *  not yet ported — OZApplication, OZDocument, OZScene, OZRenderManager,
 *  OZChannelRef, OZObjectManipulator, OZ3DExtrusionProperties,
 *  OZMaterialLayersFolder, OZChannelObjectRoot, OZChanFootageRef,
 *  OZChanFootageRefWithPicker, OZChanAudioTrackRefWithPicker, OZAudioTrack,
 *  OZAudioBehavior, OZChannelVaryingFolder, OZChannelEnumDimension, OZGroup,
 *  etc. — see the .s file for the exact address of every branch. */
function Swap_body_stub(_this: OZChannelUndo): void {
  throw new Error(
    "OZChannelUndo::Swap() @Ozone 0xfffa0 not yet transcribed — see raw-port/re/disasm/OZChannelUndo.Swap.s; body depends on ~20 frontier Ozone classes",
  );
}

// ── The class ────────────────────────────────────────────────────────────

/**
 * OZChannelUndo — see the file-level doc block for full provenance.
 */
export class OZChannelUndo {
  /**
   * +0x00 vptr — installed to `Ozone 0x83d538` @0xffe3d..@0xffe44 by
   *   `leaq 0x73d6f4(%rip), %rax ; movq %rax, (%rdi)`. Every dtor reinstalls
   *   the same address (@0xffec1 in D2, @0xfff11 in D1, @0xfff61 in D0).
   */
  private readonly _vptr: number = 0x83d538;

  /** +0x08  OZChannelRef* obtained from `source.getRef(false)` @0xffe4c. */
  private _refToSource: unknown = null;

  /** +0x10  Shadow channel returned by `source.vtable[0xf8](this)` @0xffe5b. */
  private _shadowChannel: unknown = null;

  /**
   * `OZChannelUndo::OZChannelUndo(OZChannelBase const&)` @0xffe30 (C2).
   * The C1 variant @0xffe70 is byte-for-byte identical (different mangled
   * name only), so we transcribe once.
   *
   *   0xffe30  prologue; r14 = this, rbx = &source
   *   0xffe3d  leaq 0x73d6f4(%rip), %rax    ; = 0x83d538 (installed vtable ptr)
   *   0xffe44  mov  [rdi], rax               ; +0x00 = vptr
   *   0xffe47  mov  rdi, rsi                 ; rdi = &source
   *   0xffe4a  xor  esi, esi                 ; second arg = false
   *   0xffe4c  callq OZChannelBase::getRef(false)   ; returns OZChannelRef*
   *   0xffe51  mov  [r14+0x8], rax           ; +0x08 = ref
   *   0xffe55  mov  rax, [rbx]               ; rax = source vptr
   *   0xffe58  mov  rdi, rbx                 ; rdi = &source
   *   0xffe5b  callq *0xf8(%rax)             ; vtable-slot 0xf8 on source
   *   0xffe61  mov  [r14+0x10], rax          ; +0x10 = shadow
   *   epilogue; ret
   */
  constructor(source: OZChannelBase) {
    // @0xffe3d..@0xffe44: vptr install (captured by the `_vptr` initializer).
    // @0xffe4c
    this._refToSource = OZChannelBase_getRef_stub(source, false);
    // @0xffe5b: source.vtable[0xf8](&source)
    this._shadowChannel = OZChannelBase_vslot_f8_stub(source);
  }

  /**
   * `OZChannelUndo::~OZChannelUndo()` @0xffeb0 (D2 — base, non-deleting).
   *
   *   0xffeb0  prologue; rbx = this
   *   0xffeba  leaq 0x73d677(%rip), %rax     ; = 0x83d538 (reinstall vptr)
   *   0xffec1  mov  [rdi], rax
   *   0xffec4  r14 = [rdi+0x8]               ; refToSource
   *   0xffec8  test r14,r14 ; je 0xffedd     ; skip if nullptr
   *   0xffecd  callq OZChannelRef::~OZChannelRef(r14)   ; @stub 0x6dd71c
   *   0xffed5  callq operator delete(r14)               ; @stub 0x6dfc36
   *   0xffedd  rdi = [rbx+0x10]              ; shadowChannel
   *   0xffee1  test rdi,rdi ; je 0xffef0
   *   0xffee6  rax = [rdi]                   ; shadow vptr
   *   0xffee9  epilogue-tail ; jmpq *0x8(%rax) ; vtable[8] = deleting dtor
   *   0xffef0  epilogue ; ret                ; nothing to free at +0x10
   */
  dispose_D2(): void {
    // @0xffeba/@0xffec1: reinstall vptr (`_vptr` is already `0x83d538`).
    if (this._refToSource !== null) {
      // @0xffecd
      OZChannelRef_dtor_stub(this._refToSource);
      // @0xffed5
      operator_delete_stub(this._refToSource);
      this._refToSource = null;
    }
    if (this._shadowChannel !== null) {
      // @0xffeed: tail-jmp to shadow->vtable[0x8] (deleting dtor).
      shadow_vslot_8_dtor_stub(this._shadowChannel);
      this._shadowChannel = null;
    }
    // @0xffef4: ret.
  }

  /**
   * `OZChannelUndo::~OZChannelUndo()` @0xfff00 (D1 — complete-object,
   * non-deleting). Byte-for-byte identical to D2 except the RIP-relative
   * offset in the vptr load differs (0x73d627 vs 0x73d677) — both resolve
   * to the same absolute 0x83d538. Every subsequent instruction matches D2.
   *
   *   0xfff00  prologue
   *   0xfff0a  leaq 0x73d627(%rip), %rax     ; = 0x83d538
   *   0xfff11  mov  [rdi], rax
   *   0xfff14  r14 = [rdi+0x8] ; test/je 0xfff2d
   *   0xfff1d  callq OZChannelRef::~OZChannelRef(r14)
   *   0xfff25  callq operator delete(r14)
   *   0xfff2d  rdi = [rbx+0x10] ; test/je 0xfff40
   *   0xfff36  rax = [rdi] ; epilogue-tail ; jmpq *0x8(%rax)
   *   0xfff40  epilogue ; ret
   */
  dispose(): void {
    if (this._refToSource !== null) {
      OZChannelRef_dtor_stub(this._refToSource);
      operator_delete_stub(this._refToSource);
      this._refToSource = null;
    }
    if (this._shadowChannel !== null) {
      shadow_vslot_8_dtor_stub(this._shadowChannel);
      this._shadowChannel = null;
    }
  }

  /**
   * `OZChannelUndo::~OZChannelUndo()` @0xfff50 (D0 — deleting dtor).
   * Same body as D1/D2 but the tail on the shadow branch is a plain call
   * (not a tail-jmp) and, after both fields are cleaned, `this` itself is
   * freed via `operator delete(this)` @0xfff93.
   *
   *   0xfff50  prologue; rbx = this
   *   0xfff5a  leaq 0x73d5d7(%rip), %rax     ; = 0x83d538
   *   0xfff61  mov  [rdi], rax
   *   0xfff64  r14 = [rdi+0x8] ; test/je 0xfff7d
   *   0xfff6d  callq OZChannelRef::~OZChannelRef(r14)
   *   0xfff75  callq operator delete(r14)
   *   0xfff7d  rdi = [rbx+0x10] ; test/je 0xfff8c
   *   0xfff86  rax = [rdi] ; callq *0x8(%rax)        ; NB: call, not jmp
   *   0xfff8c  rdi = rbx ; epilogue
   *   0xfff93  jmp operator delete(this)             ; @stub 0x6dfc36
   */
  dispose_and_delete(): void {
    if (this._refToSource !== null) {
      OZChannelRef_dtor_stub(this._refToSource);
      operator_delete_stub(this._refToSource);
      this._refToSource = null;
    }
    if (this._shadowChannel !== null) {
      // @0xfff89: call (not tail-jmp) — same effect on _shadowChannel.
      shadow_vslot_8_dtor_stub(this._shadowChannel);
      this._shadowChannel = null;
    }
    // @0xfff93: free `this` — a no-op in JS's GC world, but the call site
    //   is faithfully named.
    operator_delete_stub(this);
  }

  /**
   * `OZChannelUndo::Swap()` @Ozone 0xfffa0 — undo/redo entry point.
   *
   * See the `Swap_body_stub` docstring above for the full frontier list.
   * We call the stub so that any attempt to actually undo/redo through this
   * port surfaces a loud, addressed error rather than a silent no-op.
   * The exhaustive disasm lives at raw-port/re/disasm/OZChannelUndo.Swap.s
   * (255 lines, all addresses in 0xfffa0..0x100380).
   */
  Swap(): void {
    Swap_body_stub(this);
  }
}
