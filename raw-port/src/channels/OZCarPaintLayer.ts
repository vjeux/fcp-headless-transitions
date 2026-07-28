// OZCarPaintLayer.ts — raw transcription of Ozone `OZCarPaintLayer`.
//
// Provenance (Ozone framework, x86_64 slice):
//   usesTexture(OZMaterialPaintLayer*)                                    @0x6221c0
//   usesColorType(OZMaterialPaintLayer*)                                  @0x6221d0
//   shouldShowChannel(unsigned int, OZMaterialPaintLayer*)                @0x6221e0
//   appendLayersToLayeredMaterial(OZMaterialPaintLayer*,
//                                 OZMaterialLayerBase::LayeredMaterialInfo&) @0x6222f0
//                                                                (ICF-folded — 0-line otool disasm)
//
// Vtable @0x8857d0 (installed ptr = table+0x10 = 0x8857e0). Raw slots (via direct
// __DATA_CONST read at file-offset 0x4000+addr):
//   table+0x00  (rebase 0) — RTTI offset placeholder
//   table+0x08  (bind)     — typeinfo (weak)
//   table+0x10 → 0x6221c0  OZCarPaintLayer::usesTexture                    [installed *0x00]
//   table+0x18 → 0x6221d0  OZCarPaintLayer::usesColorType                  [installed *0x08]
//   table+0x20 → 0x622050  OZPaintLayer::usesSurfaceType   (inherited)     [installed *0x10]
//   table+0x28 → 0x622060  OZPaintLayer::usesTextureDepth  (inherited)     [installed *0x18]
//   table+0x30 → 0x6221e0  OZCarPaintLayer::shouldShowChannel              [installed *0x20]
//   table+0x38 → 0x6222f0  OZCarPaintLayer::appendLayersToLayeredMaterial  [installed *0x28]
//
// shouldShowChannel dispatch (jump table @0x622294, base 0x622294, 23 signed-i32 entries,
// covering channel-ids 0x68..0x7e after `addl $-0x68, %esi; cmpl $0x16, %esi; ja default`):
//   ch=0x68 → 0x622244  return true                    (movb $0x1,%al; & 1)
//   ch=0x69 → 0x622221  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) != 9
//   ch=0x6a → 0x622221  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) != 9
//   ch=0x6b → 0x62221d  return false                    (xor %eax,%eax fall-through)
//   ch=0x6c → 0x62221d  return false
//   ch=0x6d → 0x62221d  return false
//   ch=0x6e → 0x62221d  return false
//   ch=0x6f → 0x62221d  return false
//   ch=0x70 → 0x622244  return true
//   ch=0x71 → 0x62224a  tail call this->usesColorType(paintLayer)  [installed *0x8]
//   ch=0x72 → 0x62221d  return false
//   ch=0x73 → 0x62227f  tail call this->usesSurfaceType(paintLayer) [installed *0x10 -> 0x622050]
//   ch=0x74 → 0x6221fe  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) == 9
//   ch=0x75 → 0x6221fe  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) == 9
//   ch=0x76 → 0x6221fe  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) == 9
//   ch=0x77 → 0x6221fe  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) == 9
//   ch=0x78 → 0x62221d  return false
//   ch=0x79 → 0x6221fe  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) == 9
//   ch=0x7a → 0x62221d  return false
//   ch=0x7b → 0x6221fe  return getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) == 9
//   ch=0x7c → 0x62221d  return false
//   ch=0x7d → 0x62221d  return false
//   ch=0x7e → 0x622257  v = getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0);
//                       if (v >= 8) return false; else return ((0xe8 >> v) & 1) != 0
//                       0xe8 = 0b11101000, so true for v ∈ {3, 5, 6, 7}
//
// Semantically pl+0x1a28 is an OZChannel* (the "paint style" channel) whose integer value
// (0..N) is compared against materialType enumerators. `getValueAsInt` is the third arg is
// a `double tolerance` (xorps %xmm0,%xmm0 == 0.0).
//
// The `movq (%rdi),%rax` in cases 0x71/0x73 reads `this->vptr` (installed at 0x8857e0), then
// `+0x8`/`+0x10` selects usesColorType / usesSurfaceType respectively. The x86 tail-call
// `jmpq *%rax` (with `movq %rdx, %rsi` shuffling paintLayer into rsi) means the callee is
// invoked with `(this, paintLayer)`.
//
// Callee/const citations (via raw-port/army/tools/resolve.py Ozone):
//   sym  0x6dfa80 stub  __ZNK9OZChannel13getValueAsIntERK6CMTimed
//                       — OZChannel::getValueAsInt(const CMTime&, double) const
//   const 0x622205 RIP+0x202304  →  _kCMTimeZero (literal-pool symbol pointer)
//                                    (const-mode returned float garbage because this is a
//                                    dylib-import pointer, not an immediate double)
//   this-vtable *0x08 → usesColorType (self)
//   this-vtable *0x10 → OZPaintLayer::usesSurfaceType (frontier)
//
// FRONTIERS (undecoded — kept as throwing stubs):
//   • OZChannel::getValueAsInt — inherited channel accessor, no in-port implementation.
//   • OZPaintLayer::usesSurfaceType @Ozone 0x622050 — base-class virtual.
//   • OZCarPaintLayer::appendLayersToLayeredMaterial @Ozone 0x6222f0 — ICF-folded 0-line
//     disasm; the huge (~1770-line) shader-uniform-population body linear-swept in from a
//     neighboring symbol is NOT this method's actual code. Kept as throw-stub citing addr.
//   • CMTime constant kCMTimeZero — referenced via literal-pool symbol pointer @0x202304
//     RIP-relative from 0x62220b (and mirror copies at 0x62222f/0x622265). Represented as
//     a symbolic import here; the runtime call would resolve via dylib bind.
//
// Field layout consumed:
//   OZMaterialPaintLayer @ +0x1a28  →  OZChannel  (paint-style enum channel)
//   OZCarPaintLayer @ +0x00        →  vptr (installed = 0x8857e0)
//
// No writable state on OZCarPaintLayer itself in these four methods; it is a policy
// object dispatching virtual calls based on channel id.

/**
 * OZChannel — undecoded frontier. Method surface used here:
 *   getValueAsInt(time: CMTime, tolerance: number): int32
 *
 * Referenced from OZCarPaintLayer::shouldShowChannel @Ozone 0x622212/0x622235/0x62226b
 * (all `callq 0x6dfa80` — symbol stub __ZNK9OZChannel13getValueAsIntERK6CMTimed).
 */
export interface OZChannelLike {
  getValueAsInt(time: unknown, tolerance: number): number;
}

/**
 * OZMaterialPaintLayer — undecoded frontier. Fields consumed here:
 *   +0x1a28: OZChannel  ("paint style" enum channel)
 *
 * shouldShowChannel dereferences this offset directly (`addq $0x1a28, %rdx` @0x6221fe).
 */
export interface OZMaterialPaintLayerLike {
  /** OZChannel at +0x1a28 — paint-style enum channel. */
  paintStyleChannel_at_0x1a28: OZChannelLike;
}

/**
 * CMTime kCMTimeZero — symbol-imported constant, referenced via literal-pool pointer
 * @Ozone 0x202304 (RIP-relative from 0x62220b/etc). Placeholder for the frontier binding.
 */
export const kCMTimeZero_Ref: unique symbol = Symbol("kCMTimeZero");

/**
 * OZPaintLayer::usesSurfaceType — undecoded frontier @Ozone 0x622050. Inherited base-class
 * virtual reached only via `shouldShowChannel(ch=0x73)` (tail call through installed *0x10).
 * Any invocation is intentional and must surface the frontier.
 */
export function OZPaintLayer_usesSurfaceType(
  _self: OZCarPaintLayer,
  _paintLayer: OZMaterialPaintLayerLike,
): boolean {
  throw new Error(
    "OZPaintLayer::usesSurfaceType frontier @Ozone 0x622050 (referenced from OZCarPaintLayer::shouldShowChannel case 0x73 @0x62227f)",
  );
}

/**
 * OZCarPaintLayer — Ozone material-layer policy: describes which channels of an
 * `OZMaterialPaintLayer` are visible in the car-paint material variant, and how car-paint
 * layers get appended into a `LiLayeredMaterial` for rendering. Only the virtual dispatch
 * surface is transcribed here; the actual paint-layer render code lives elsewhere.
 */
export class OZCarPaintLayer {
  /** Installed vtable pointer (Ozone @0x8857e0). Base = 0x8857d0. */
  static readonly INSTALLED_VPTR = 0x8857e0;
  /** vtable base (Ozone @0x8857d0). Consumers who need slot indexing start here. */
  static readonly VTABLE_BASE = 0x8857d0;

  /** vptr — set by the ctor to INSTALLED_VPTR. (No ctor in the brief; noted for symmetry.) */
  vptr: number = OZCarPaintLayer.INSTALLED_VPTR;

  /**
   * usesTexture — Ozone @0x6221c0. Virtual slot *0x00 on installed vtable.
   *
   * Body verbatim:
   *   pushq %rbp / movq %rsp,%rbp
   *   xorl %eax, %eax                # rax = 0
   *   popq %rbp / retq               # return false
   */
  usesTexture(_paintLayer: OZMaterialPaintLayerLike): boolean {
    return false; // @0x6221c4 xorl %eax,%eax
  }

  /**
   * usesColorType — Ozone @0x6221d0. Virtual slot *0x08 on installed vtable.
   *
   * Identical body to usesTexture: `xorl %eax,%eax; retq` → always false.
   */
  usesColorType(_paintLayer: OZMaterialPaintLayerLike): boolean {
    return false; // @0x6221d4 xorl %eax,%eax
  }

  /**
   * shouldShowChannel — Ozone @0x6221e0. Virtual slot *0x20 on installed vtable.
   *
   * Preamble @0x6221e0..0x6221ec:
   *   xorl %eax, %eax                # default result = 0
   *   addl $-0x68, %esi              # rebase channelId by -0x68
   *   cmpl $0x16, %esi
   *   ja   0x62221d                  # if (channelId-0x68) > 0x16: return false
   *
   * Dispatch @0x6221ee..0x6221fc via `leaq 0x9f(%rip),%rcx; movslq (%rcx,%rsi,4),%rsi;
   * addq %rcx,%rsi; jmpq *%rsi`. Table @0x622294 (23 * i32 offsets, base=0x622294).
   * See top-of-file table for per-case decoded targets.
   */
  shouldShowChannel(
    channelId: number,
    paintLayer: OZMaterialPaintLayerLike,
  ): boolean {
    // @0x6221e6 addl $-0x68,%esi ; @0x6221e9 cmpl $0x16,%esi ; ja 0x62221d
    const idx = (channelId | 0) - 0x68;
    if (idx < 0 || idx > 0x16) {
      return false; // @0x62221d default: andb $0x1,%al with al=0
    }

    switch (channelId) {
      // @0x622244 movb $0x1,%al ; retq — literal true
      case 0x68:
      case 0x70:
        return true;

      // @0x622221 getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) ; setne %al  → != 9
      case 0x69:
      case 0x6a: {
        const v = paintLayer.paintStyleChannel_at_0x1a28.getValueAsInt(
          kCMTimeZero_Ref,
          0.0,
        ); // @0x622235 callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
        return v !== 9; // @0x62223a cmpl $0x9,%eax ; setne %al
      }

      // @0x62221d fall-through — return false
      case 0x6b:
      case 0x6c:
      case 0x6d:
      case 0x6e:
      case 0x6f:
      case 0x72:
      case 0x78:
      case 0x7a:
      case 0x7c:
      case 0x7d:
        return false;

      // @0x62224a tail-call installed *0x8 → usesColorType(paintLayer)
      case 0x71:
        return this.usesColorType(paintLayer);

      // @0x62227f tail-call installed *0x10 → OZPaintLayer::usesSurfaceType(paintLayer)
      case 0x73:
        return OZPaintLayer_usesSurfaceType(this, paintLayer);

      // @0x6221fe getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0) ; sete %al  → == 9
      case 0x74:
      case 0x75:
      case 0x76:
      case 0x77:
      case 0x79:
      case 0x7b: {
        const v = paintLayer.paintStyleChannel_at_0x1a28.getValueAsInt(
          kCMTimeZero_Ref,
          0.0,
        ); // @0x622212 callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
        return v === 9; // @0x622217 cmpl $0x9,%eax ; sete %al
      }

      // @0x622257 v = getValueAsInt(pl+0x1a28, kCMTimeZero, 0.0);
      //           if (v >= 8) → jmp 0x62228c (return false);
      //           else return ((0xe8 >> v) & 1) != 0
      //   @0x622277 movb $-0x18,%al  (0xe8 = 0b11101000)
      //   @0x622279 shrb %cl,%al ; andb $0x1,%al
      case 0x7e: {
        const v = paintLayer.paintStyleChannel_at_0x1a28.getValueAsInt(
          kCMTimeZero_Ref,
          0.0,
        ); // @0x62226b callq
        if ((v >>> 0) >= 8) return false; // @0x622270 cmpl $0x8,%eax ; jae 0x62228c
        return (((0xe8 >>> v) & 0x1) | 0) !== 0;
      }

      default:
        // Unreachable — the `cmpl $0x16` guard above bounds idx to [0,0x16]
        // and every value in that range is explicitly handled by the jump table.
        return false; // @0x62221d
    }
  }

  /**
   * appendLayersToLayeredMaterial — Ozone @0x6222f0. Virtual slot *0x28 on installed vtable.
   *
   * `disasm.sh` reported a 0-line body: `otool -tV` produced no label at 0x6222f0. Per the
   * porting spec, ICF-folded / label-absent bodies are a hard stop — DO NOT GUESS. The
   * ~1770-line spill visible in the raw `.s` file is a linear-decoded neighbor symbol, not
   * this method. Any invocation must surface the frontier so the demand signal is explicit.
   */
  appendLayersToLayeredMaterial(
    _paintLayer: OZMaterialPaintLayerLike,
    _info: unknown, // OZMaterialLayerBase::LayeredMaterialInfo&
  ): void {
    throw new Error(
      "OZCarPaintLayer::appendLayersToLayeredMaterial frontier @Ozone 0x6222f0 (ICF-folded / 0-line otool disasm — body not extractable without per-symbol objdump)",
    );
  }
}
