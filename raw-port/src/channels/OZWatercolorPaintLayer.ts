// OZWatercolorPaintLayer — watercolor variant of OZMaterialPaintLayer (Ozone.framework).
// Class enumerates 1 exporting method in raw-port/army/ledger/Ozone.ledger.json:
//   shouldShowChannel(uint32 channelId, OZMaterialPaintLayer*)  @0x622170
//
// Decode evidence:
//   raw-port/re/disasm/OZWatercolorPaintLayer.shouldShowChannel.s   (34 lines)
//
// vtable @0x885778 (installed ptr 0x885788). Resolved via
// `raw-port/army/tools/resolve.py Ozone vtable OZWatercolorPaintLayer 0x00 0x10 0x18`:
//   *0x00 -> 0x622030  OZPaintLayer::usesTexture(OZMaterialPaintLayer*)
//   *0x10 -> 0x622050  OZPaintLayer::usesSurfaceType(OZMaterialPaintLayer*)
//   *0x18 -> 0x622060  OZPaintLayer::usesTextureDepth(OZMaterialPaintLayer*)
// The three vtable methods are ICF-folded into OZPaintLayer:: variants — so OZWatercolorPaintLayer
// inherits them unchanged from its base OZPaintLayer, and this file cites the addresses without
// re-porting them (they belong in OZPaintLayer.ts if/when that class is claimed).

// ────────────────────────────────────────────────────────────────────────────────────────
// OZWatercolorPaintLayer::shouldShowChannel(uint32 channelId, OZMaterialPaintLayer* m)
//   @Ozone 0x622170
// ────────────────────────────────────────────────────────────────────────────────────────
// Full disassembly (34 lines):
//   0x622170  push %rbp ; mov %rsp,%rbp
//   0x622174  xor  %eax,%eax                      ; result = false (default)
//   0x622176  cmp  $0x6a,%esi ; jg 0x622187        ; channelId > 106 ? -> late branch
//   0x62217b  add  $-0x68,%esi                    ; channelId -= 104
//   0x62217e  cmp  $0x3,%esi ; jae 0x622185        ; if (channelId-104) >= 3 -> return 0
//   0x622183  mov  $0x1,%al                       ; else return 1  (channels 104..106 -> true)
//   0x622185  pop  %rbp ; ret
//
//   0x622187  cmp  $0x6b,%esi ; je 0x6221a5        ; channelId == 107 -> vtbl[0x18]
//   0x62218c  cmp  $0x73,%esi ; je 0x6221b2        ; channelId == 115 -> vtbl[0x10]
//   0x622191  cmp  $0xc8,%esi ; jne 0x622185       ; channelId != 200 -> return 0
//                                                    channelId == 200 -> vtbl[0x00]
//
// The three vtbl-jumps at the tail are TAIL-calls: they replace %rsi = %rdx (m) so the callee
// signature matches f(this, OZMaterialPaintLayer*). Each returns bool (%al -> %eax). No frame
// setup: `pop %rbp ; jmpq *%rax`.
//
// Semantics: OZWatercolorPaintLayer decides whether a given channel-id should render, based on
// what the material's paint layer says about texture/depth/surface usage. The direct-return set
// {104, 105, 106} corresponds to always-on channels for watercolor; channels {107, 115, 200}
// delegate to base-class virtuals; every other channel is off.
//
// Channel-id encoding note: 0x68..0x6a (104..106), 0x6b (107), 0x73 (115), 0xc8 (200) are
// OZ*Channel* enum values in Ozone — a full enumeration lives in re/OZChannelIds.md when
// available. The exact enum names are not required here because the branching is bit-identical
// to the assembly numeric compares.

/** OZWatercolorPaintLayer::shouldShowChannel — virtual override at vtable slot dependent on
 *  OZPaintLayer's layout. Ported from @Ozone 0x622170.
 *
 *  @param this            the layer instance (opaque handle; passed through to base virtuals).
 *  @param channelId       Ozone channel enum id (u32).
 *  @param material        OZMaterialPaintLayer* (m in the asm's rdx).
 *  @param vtbl            resolved virtual-dispatch surface exposing usesTexture / usesSurfaceType /
 *                         usesTextureDepth — the three base-class virtuals the asm tail-calls.
 *  @returns true iff the channel should be rendered.
 */
export interface OZWatercolorPaintLayerVirtuals {
  /** vtable *0x00 -> OZPaintLayer::usesTexture(OZMaterialPaintLayer*)  @Ozone 0x622030 */
  usesTexture(m: unknown): boolean;
  /** vtable *0x10 -> OZPaintLayer::usesSurfaceType(OZMaterialPaintLayer*)  @Ozone 0x622050 */
  usesSurfaceType(m: unknown): boolean;
  /** vtable *0x18 -> OZPaintLayer::usesTextureDepth(OZMaterialPaintLayer*)  @Ozone 0x622060 */
  usesTextureDepth(m: unknown): boolean;
}

export function shouldShowChannel(
  vtbl: OZWatercolorPaintLayerVirtuals,
  channelId: number,
  material: unknown,
): boolean {
  // Ensure u32 semantics for the comparisons (mirrors `esi` = 32-bit unsigned).
  const cid = channelId >>> 0;              // @0x622176: cmpl $0x6a, %esi  (u32-cmp)

  // @0x622176: cmpl $0x6a,%esi ; jg 0x622187  — SIGNED compare (jg), but the values 106/107/115/
  // 200 all fit in the low 8 bits so signedness is irrelevant for the branch under any legal
  // channel id (all positive, well below 0x7fffffff).
  if (cid <= 0x6a) {                        // channelId <= 106
    // @0x62217b..0x622181: (cid - 104) < 3 ? true : false. Unsigned by structure (jae).
    const delta = (cid - 0x68) >>> 0;       // @0x62217b: addl $-0x68, %esi
    // @0x62217e: cmpl $0x3,%esi ; jae 0x622185  -> return 0 if delta >= 3
    if (delta < 3) return true;             // @0x622183: movb $0x1, %al
    return false;                           // @0x622185: pop; ret  (al still 0)
  }

  // cid > 106
  if (cid === 0x6b) {                       // 107
    // @0x62218a: je 0x6221a5 -> tail-call vtbl[0x18] with (this, m)
    return vtbl.usesTextureDepth(material); // @0x6221ac..0x6221b0
  }
  if (cid === 0x73) {                       // 115
    // @0x62218f: je 0x6221b2 -> tail-call vtbl[0x10] with (this, m)
    return vtbl.usesSurfaceType(material);  // @0x6221b9..0x6221bd
  }
  if (cid === 0xc8) {                       // 200
    // @0x622191..0x622197: jne 0x622185 rules out non-200. Fall-through path stores the vtable's
    // *first* slot into %rax and tail-jmp's it.
    return vtbl.usesTexture(material);      // @0x6221a2..0x6221a3
  }

  // @0x622197: jne 0x622185 -> return 0 (al was zeroed at 0x622174 and never touched).
  return false;
}
