// OZPaintLayer.ts — raw transcription of Ozone `OZPaintLayer`.
//
// Provenance (Ozone framework, x86_64 slice):
//   usesTexture(OZMaterialPaintLayer*)                                        @0x622030
//   usesColorType(OZMaterialPaintLayer*)                                      @0x622040
//   usesSurfaceType(OZMaterialPaintLayer*)                                    @0x622050
//   usesTextureDepth(OZMaterialPaintLayer*)                                   @0x622060
//   shouldShowChannel(unsigned int, OZMaterialPaintLayer*)                    @0x622070
//   appendLayersToLayeredMaterial(OZMaterialPaintLayer*,
//                                 OZMaterialLayerBase::LayeredMaterialInfo&)  @0x622100
//                                                                (ICF-folded — 0-line otool disasm)
//
// Vtable @0x8850a0 (installed ptr = table+0x10 = 0x8850b0). Raw slots (from
// `raw-port/army/tools/vtable.py Ozone OZPaintLayer`):
//   table+0x00  (rebase 0) — RTTI offset placeholder
//   table+0x08  (bind)     — typeinfo
//   table+0x10 → 0x622030  OZPaintLayer::usesTexture                    [installed *0x00]
//   table+0x18 → 0x622040  OZPaintLayer::usesColorType                  [installed *0x08]
//   table+0x20 → 0x622050  OZPaintLayer::usesSurfaceType                [installed *0x10]
//   table+0x28 → 0x622060  OZPaintLayer::usesTextureDepth               [installed *0x18]
//   table+0x30 → 0x622070  OZPaintLayer::shouldShowChannel              [installed *0x20]
//   table+0x38 → 0x622100  OZPaintLayer::appendLayersToLayeredMaterial  [installed *0x28]
//
// shouldShowChannel dispatch (jump table @0x6220d0, base 0x6220d0, 12 signed-i32 entries,
// covering channel-ids 0x68..0x73 after `leal -0x68(%rsi),%ecx; cmpl $0xb,%ecx; ja default`):
//   ch=0x68 → 0x62208e  return true       (movb $0x1,%al @0x62207c preserved through jmp)
//   ch=0x69 → 0x62208e  return true
//   ch=0x6a → 0x62208e  return true
//   ch=0x6b → 0x6220b5  tail call this->usesTextureDepth(paintLayer)  [installed *0x18]
//   ch=0x6c → 0x6220a4  return false      (xorl %eax,%eax)
//   ch=0x6d → 0x6220a4  return false
//   ch=0x6e → 0x6220a4  return false
//   ch=0x6f → 0x6220a4  return false
//   ch=0x70 → 0x6220a4  return false
//   ch=0x71 → 0x6220a8  tail call this->usesSurfaceType(paintLayer)  [installed *0x10]
//   ch=0x72 → 0x6220a4  return false
//   ch=0x73 → 0x6220c2  tail call this->usesColorType(paintLayer)    [installed *0x08]
//
// Default path @0x622090..0x6220a7:
//   cmpl $0xc8, %esi
//   jne  0x6220a4          # if channelId != 0xC8: return false
//   movq (%rdi),%rax       # this->vptr
//   movq (%rax),%rax       # vptr[0] = usesTexture
//   movq %rdx,%rsi
//   popq %rbp / jmpq *%rax # tail call usesTexture(paintLayer)  [installed *0x00]
//
// The tail-calls all do `movq %rdx, %rsi` (shuffling `paintLayer` from rdx into rsi) so the
// callee is invoked as `(this, paintLayer)`.
//
// Callee/const citations (via raw-port/army/tools/vtable.py Ozone OZPaintLayer):
//   this-vtable *0x00 → usesTexture       (self, @0x622030)
//   this-vtable *0x08 → usesColorType     (self, @0x622040)
//   this-vtable *0x10 → usesSurfaceType   (self, @0x622050)
//   this-vtable *0x18 → usesTextureDepth  (self, @0x622060)
//
// FRONTIERS (undecoded — kept as throwing stubs):
//   • OZPaintLayer::appendLayersToLayeredMaterial @Ozone 0x622100 — ICF-folded 0-line
//     disasm. Kept as throw-stub citing addr.
//
// Field layout consumed:
//   OZPaintLayer @ +0x00  →  vptr (installed = 0x8850b0)
//
// No writable state on OZPaintLayer itself in these six methods; it is a policy object
// dispatching virtual calls based on channel id. OZPaintLayer is the base class from
// which OZCarPaintLayer (and others) derive; the derived classes override to return
// false for usesTexture/usesColorType.

/**
 * OZMaterialPaintLayer — undecoded frontier. Passed by pointer to every method here but
 * only read via `movq %rdx, %rsi` (forwarding to inner virtual calls). No fields of
 * OZMaterialPaintLayer are dereferenced in OZPaintLayer itself.
 */
export interface OZMaterialPaintLayerLike {
  /** Opaque — no fields consumed in OZPaintLayer. */
  readonly __brand: "OZMaterialPaintLayer";
}

/**
 * OZMaterialLayerBase::LayeredMaterialInfo — undecoded frontier, referenced only as an
 * out-reference argument to `appendLayersToLayeredMaterial` (which is ICF-folded here).
 */
export interface LayeredMaterialInfoLike {
  /** Opaque — body not extractable. */
  readonly __brand: "LayeredMaterialInfo";
}

/**
 * OZPaintLayer — Ozone base material-layer policy: describes which channels of an
 * `OZMaterialPaintLayer` are visible in the default paint material, and how paint layers
 * get appended into a layered material for rendering. Subclasses (e.g. OZCarPaintLayer)
 * override the virtual surface to specialize per material variant.
 */
export class OZPaintLayer {
  /** Installed vtable pointer (Ozone @0x8850b0). Base = 0x8850a0. */
  static readonly INSTALLED_VPTR = 0x8850b0;
  /** vtable base (Ozone @0x8850a0). Consumers who need slot indexing start here. */
  static readonly VTABLE_BASE = 0x8850a0;

  /** vptr — set by the ctor to INSTALLED_VPTR. (No ctor in the brief; noted for symmetry.) */
  vptr: number = OZPaintLayer.INSTALLED_VPTR;

  /**
   * usesTexture — Ozone @0x622030. Virtual slot *0x00 on installed vtable.
   *
   * Body verbatim:
   *   pushq %rbp / movq %rsp,%rbp
   *   movb $0x1, %al                 # rax low byte = 1
   *   popq %rbp / retq               # return true
   */
  usesTexture(_paintLayer: OZMaterialPaintLayerLike): boolean {
    return true; // @0x622034 movb $0x1,%al
  }

  /**
   * usesColorType — Ozone @0x622040. Virtual slot *0x08 on installed vtable.
   *
   * Body verbatim (identical to usesTexture):
   *   pushq %rbp / movq %rsp,%rbp
   *   movb $0x1, %al
   *   popq %rbp / retq               # return true
   */
  usesColorType(_paintLayer: OZMaterialPaintLayerLike): boolean {
    return true; // @0x622044 movb $0x1,%al
  }

  /**
   * usesSurfaceType — Ozone @0x622050. Virtual slot *0x10 on installed vtable.
   *
   * Body verbatim:
   *   pushq %rbp / movq %rsp,%rbp
   *   xorl %eax, %eax                # rax = 0
   *   popq %rbp / retq               # return false
   */
  usesSurfaceType(_paintLayer: OZMaterialPaintLayerLike): boolean {
    return false; // @0x622054 xorl %eax,%eax
  }

  /**
   * usesTextureDepth — Ozone @0x622060. Virtual slot *0x18 on installed vtable.
   *
   * Body verbatim (identical to usesSurfaceType):
   *   pushq %rbp / movq %rsp,%rbp
   *   xorl %eax, %eax
   *   popq %rbp / retq               # return false
   */
  usesTextureDepth(_paintLayer: OZMaterialPaintLayerLike): boolean {
    return false; // @0x622064 xorl %eax,%eax
  }

  /**
   * shouldShowChannel — Ozone @0x622070. Virtual slot *0x20 on installed vtable.
   *
   * Preamble @0x622070..0x62207a:
   *   leal -0x68(%rsi), %ecx         # ecx = channelId - 0x68
   *   cmpl $0xb, %ecx
   *   ja   0x622090                  # if (unsigned)(channelId-0x68) > 0xb: goto default
   *
   * In-range dispatch @0x62207c..0x62208c:
   *   movb $0x1, %al                 # pre-seed al=1 (used only by cases 0x68/0x69/0x6a)
   *   leaq 0x4b(%rip), %rsi          # rsi = 0x6220d0 (jump table base)
   *   movslq (%rsi,%rcx,4), %rcx     # rcx = i32 offset for entry ecx
   *   addq %rsi, %rcx
   *   jmpq *%rcx                     # indirect jump to computed target
   *
   * Jump-table entries at 0x6220d0 (raw i32 offsets, resolved via file-offset
   * 0x4000+0x6220d0 on the x86_64 slice):
   *   [0]=0x62208e  [1]=0x62208e  [2]=0x62208e  [3]=0x6220b5
   *   [4]=0x6220a4  [5]=0x6220a4  [6]=0x6220a4  [7]=0x6220a4
   *   [8]=0x6220a4  [9]=0x6220a8  [10]=0x6220a4 [11]=0x6220c2
   *
   * Targets:
   *   0x62208e  popq %rbp / retq                                 → return al  (= 1 = true)
   *   0x6220a4  xorl %eax,%eax / popq %rbp / retq                → return 0 (false)
   *   0x6220a8  movq (%rdi),%rax / movq 0x10(%rax),%rax /
   *             movq %rdx,%rsi / popq %rbp / jmpq *%rax          → tail-call vtable[*0x10]
   *                                                                 = usesSurfaceType
   *   0x6220b5  movq (%rdi),%rax / movq 0x18(%rax),%rax / ...   → tail-call vtable[*0x18]
   *                                                                 = usesTextureDepth
   *   0x6220c2  movq (%rdi),%rax / movq 0x08(%rax),%rax / ...   → tail-call vtable[*0x08]
   *                                                                 = usesColorType
   *
   * Default path @0x622090..0x6220cd:
   *   cmpl $0xc8, %esi ; jne 0x6220a4                            → if != 0xC8: return false
   *   movq (%rdi),%rax / movq (%rax),%rax / movq %rdx,%rsi /
   *     popq %rbp / jmpq *%rax                                    → tail-call vtable[*0x00]
   *                                                                 = usesTexture
   *
   * The tail-calls funnel `paintLayer` (rdx) into `rsi` — the callee is invoked as
   * `(this, paintLayer)`. We call the virtual methods on `this` here (matching the
   * installed vtable dispatch) so a subclass override is respected at runtime.
   */
  shouldShowChannel(
    channelId: number,
    paintLayer: OZMaterialPaintLayerLike,
  ): boolean {
    // @0x622074 leal -0x68(%rsi),%ecx ; @0x622077 cmpl $0xb,%ecx ; ja 0x622090
    const idx = ((channelId | 0) - 0x68) >>> 0;
    if (idx > 0xb) {
      // @0x622090 default path
      if ((channelId | 0) === 0xc8) {
        // @0x622098..0x6220a2 tail-call vtable[*0x00] = usesTexture
        return this.usesTexture(paintLayer);
      }
      // @0x6220a4 xorl %eax,%eax ; retq
      return false;
    }

    switch (channelId | 0) {
      // @0x62208e popq/retq — al was pre-seeded to 1 at @0x62207c
      case 0x68:
      case 0x69:
      case 0x6a:
        return true;

      // @0x6220b5 tail-call vtable[*0x18] = usesTextureDepth
      case 0x6b:
        return this.usesTextureDepth(paintLayer);

      // @0x6220a4 xorl %eax,%eax ; retq
      case 0x6c:
      case 0x6d:
      case 0x6e:
      case 0x6f:
      case 0x70:
      case 0x72:
        return false;

      // @0x6220a8 tail-call vtable[*0x10] = usesSurfaceType
      case 0x71:
        return this.usesSurfaceType(paintLayer);

      // @0x6220c2 tail-call vtable[*0x08] = usesColorType
      case 0x73:
        return this.usesColorType(paintLayer);

      default:
        // Unreachable — `idx <= 0xb` above bounds channelId to [0x68..0x73] and every
        // value in that range is explicitly handled by the jump table.
        return false; // @0x6220a4
    }
  }

  /**
   * appendLayersToLayeredMaterial — Ozone @0x622100. Virtual slot *0x28 on installed vtable.
   *
   * `disasm.sh` reported the body as ICF-folded / linear-swept-into-neighbor: `otool -tV`
   * produced no label at 0x622100 (the "too-long body / 0-line" branch). Per the porting
   * spec, ICF-folded / label-absent bodies are a hard stop — DO NOT GUESS. Any invocation
   * must surface the frontier so the demand signal is explicit.
   */
  appendLayersToLayeredMaterial(
    _paintLayer: OZMaterialPaintLayerLike,
    _info: LayeredMaterialInfoLike,
  ): void {
    // raise frontier @0x622100 (ICF-folded / 0-line otool disasm — body not extractable)
    throw new Error(
      "OZPaintLayer::appendLayersToLayeredMaterial frontier @Ozone 0x622100 (ICF-folded / 0-line otool disasm — body not extractable without per-symbol objdump)",
    );
  }
}
