# Noir

- **PAE class:** `Noir`
- **Plugin UUID:** `CFA2D547-3560-437A-A7E3-15228E78DD29`
- **Node names in corpus:** Noir (9)
- **Corpus usage:** 9 files, 9 instances

## What it does

Noir is a preset film-noir color grade that converts the image to a high-contrast, moody black-and-white (or near-monochrome) look. It is a one-knob stylize preset with only a Mix control exposed.

> **Note.** Not implemented; description is the standard Apple Motion "Noir" preset look. As a canned grade it exposes no creative parameters beyond Mix. (unverified) exact tone curve.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the noir grade over the original, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This is one of Final Cut Pro's built-in **Photos-style colour presets**. It is NOT a `· KF` template: it is a real `PAENoir` class that subclasses `PAEPhotosFilters` and applies a baked **3-D colour LUT** (cube file) through the shared base renderer. The code below is **verbatim** from the user's licensed FCP install; nothing is paraphrased.

**Preset selector.** `-[PAENoir initWithAPIManager:]` stores preset id **2** (`0x2`) into the instance; `PAEPhotosFilters` uses it to pick which LUT to load (`lutBitmapForFilter:` / `LUTFromCache:atPath:`).

### Subclass initialiser — `-[PAENoir initWithAPIManager:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py --method initWithAPIManager PAENoir`

```asm
000000000011da98	sub	sp, sp, #0x20
000000000011da9c	stp	x29, x30, [sp, #0x10]
000000000011daa0	add	x29, sp, #0x10
000000000011daa4	adrp	x8, 695 ; 0x3d4000
000000000011daa8	ldr	x8, [x8, #0xfc0] ; Objc class ref: bad class ref
000000000011daac	stp	x0, x8, [sp]
000000000011dab0	adrp	x8, 831 ; 0x45c000
000000000011dab4	ldr	x1, [x8, #0x278]
000000000011dab8	mov	x0, sp
000000000011dabc	bl	0x252308 ; Objc message: _objc_msgSendSuper2
000000000011dac0	cbz	x0, 0x11dad8
000000000011dac4	adrp	x8, 833 ; 0x45e000
000000000011dac8	add	x8, x8, #0xc0c
000000000011dacc	ldrsw	x8, [x8]
000000000011dad0	mov	w9, #0x2
000000000011dad4	str	w9, [x0, x8]
000000000011dad8	ldp	x29, x30, [sp, #0x10]
000000000011dadc	add	sp, sp, #0x20
000000000011dae0	ret
```

### Shared base renderer — `-[PAEPhotosFilters canThrowRenderOutput:withInput:withInfo:]`
The per-pixel work: builds/loads the LUT bitmap and applies it via the Helium `HGApply3DLUT` primitive (with an `HGColorMatrix` for the working-space transform). Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPhotosFilters`

```asm
00000000000b0f38	mov	w3, #0x1
00000000000b0f3c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000b0f40	cbz	x23, 0xb0f54
00000000000b0f44	add	x8, sp, #0x30
00000000000b0f48	mov	x0, x23
00000000000b0f4c	bl	_objc_msgSend$heliumRef
00000000000b0f50	b	0xb0f58
00000000000b0f54	str	xzr, [sp, #0x30]
00000000000b0f58	mov	w8, #0x20
00000000000b0f5c	str	w8, [sp, #0x2c]
00000000000b0f60	str	xzr, [sp, #0x20]
00000000000b0f64	ldr	w2, [sp, #0x3c]
00000000000b0f68	cmp	w2, #0x1d
00000000000b0f6c	b.ne	0xb0fb8
00000000000b0f70	ldp	q0, q1, [x20]
00000000000b0f74	ldr	q2, [x20, #0x20]
00000000000b0f78	stp	q0, q1, [sp, #0x40]
00000000000b0f7c	str	q2, [sp, #0x60]
00000000000b0f80	ldr	x7, [x20]
00000000000b0f84	add	x2, sp, #0x20
00000000000b0f88	add	x5, sp, #0x40
00000000000b0f8c	mov	x0, x19
00000000000b0f90	mov	x3, #0x0
00000000000b0f94	mov	x4, #0x0
00000000000b0f98	mov	w6, #0x2
00000000000b0f9c	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
00000000000b0fa0	ldr	x0, [sp, #0x20]
00000000000b0fa4	bl	_objc_msgSend$height
00000000000b0fa8	mov	x19, #0x0
00000000000b0fac	str	w0, [sp, #0x2c]
00000000000b0fb0	mov	w24, #0x1b
00000000000b0fb4	b	0xb0fd0
00000000000b0fb8	add	x8, sp, #0x40
00000000000b0fbc	add	x3, sp, #0x2c
00000000000b0fc0	mov	x0, x19
00000000000b0fc4	bl	"_objc_msgSend$lutBitmapForFilter:lutDimensions:"
00000000000b0fc8	ldr	x19, [sp, #0x40]
00000000000b0fcc	mov	w24, #0x18
00000000000b0fd0	mov	w0, #0x210
00000000000b0fd4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b0fd8	mov	x20, x0
00000000000b0fdc	ldrsw	x1, [sp, #0x2c]
00000000000b0fe0	strb	wzr, [sp]
00000000000b0fe4	fmov	s0, #1.00000000
00000000000b0fe8	movi.2d	v1, #0000000000000000
00000000000b0fec	movi.2d	v2, #0000000000000000
00000000000b0ff0	fmov	s3, #1.00000000
00000000000b0ff4	movi.2d	v4, #0000000000000000
00000000000b0ff8	movi.2d	v5, #0000000000000000
00000000000b0ffc	mov	x2, x24
00000000000b1000	mov	w3, #0x1
00000000000b1004	mov	w4, #0x0
00000000000b1008	mov	w5, #0x1
00000000000b100c	mov	w6, #0x1
00000000000b1010	mov	w7, #0x1
00000000000b1014	bl	0x250ff4 ; symbol stub for: __ZN12HGApply3DLUTC1Em8HGFormatffffffbNS_29hgApply3DLUTInterpolationTypeEbbbb
00000000000b1018	ldr	w8, [sp, #0x3c]
00000000000b101c	cmp	w8, #0x1d
00000000000b1020	b.ne	0xb10b8
00000000000b1024	movi.2d	v0, #0000000000000000
00000000000b1028	stp	q0, q0, [sp, #0x40]
00000000000b102c	stp	q0, q0, [sp, #0x60]
00000000000b1030	mov	w8, #0x3f800000
00000000000b1034	str	w8, [sp, #0x48]
00000000000b1038	str	w8, [sp, #0x54]
00000000000b103c	str	w8, [sp, #0x60]
00000000000b1040	str	w8, [sp, #0x7c]
00000000000b1044	mov	w0, #0x1f0
00000000000b1048	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b104c	mov	x24, x0
00000000000b1050	bl	0x2510fc ; symbol stub for: __ZN13HGColorMatrixC1Ev
00000000000b1054	ldr	x0, [sp, #0x20]
00000000000b1058	bl	_objc_msgSend$heliumNode
00000000000b105c	mov	x2, x0
00000000000b1060	ldr	x8, [x24]
00000000000b1064	ldr	x8, [x8, #0x78]
00000000000b1068	mov	x0, x24
00000000000b106c	mov	w1, #0x0
00000000000b1070	blr	x8
00000000000b1074	add	x1, sp, #0x40
00000000000b1078	mov	x0, x24
00000000000b107c	mov	w2, #0x0
00000000000b1080	bl	0x2510cc ; symbol stub for: __ZN13HGColorMatrix10LoadMatrixEPK19__simd128_float32_tb
00000000000b1084	ldr	x8, [x20]
00000000000b1088	ldr	x8, [x8, #0x78]
00000000000b108c	mov	x0, x20
00000000000b1090	mov	w1, #0x1
00000000000b1094	mov	x2, x24
00000000000b1098	blr	x8
00000000000b109c	ldr	x0, [sp, #0x20]
00000000000b10a0	bl	0x252344 ; symbol stub for: _objc_release
00000000000b10a4	ldr	x8, [x24]
00000000000b10a8	ldr	x8, [x8, #0x18]
00000000000b10ac	mov	x0, x24
00000000000b10b0	blr	x8
00000000000b10b4	b	0xb10c4
00000000000b10b8	mov	x0, x20
00000000000b10bc	mov	x1, x19
00000000000b10c0	bl	0x250fe8 ; symbol stub for: __ZN12HGApply3DLUT12SetLUTBitmapEP8HGBitmap
00000000000b10c4	ldr	w8, [sp, #0x3c]
00000000000b10c8	cmp	w8, #0x20
00000000000b10cc	b.eq	0xb10d8
00000000000b10d0	cmp	w8, #0x1e
00000000000b10d4	b.ne	0xb1124
00000000000b10d8	ldr	x2, [sp, #0x30]
00000000000b10dc	ldr	x8, [x20]
00000000000b10e0	ldr	x8, [x8, #0x78]
00000000000b10e4	mov	x0, x20
00000000000b10e8	mov	w1, #0x0
00000000000b10ec	blr	x8
00000000000b10f0	ldr	x0, [sp, #0x30]
00000000000b10f4	cmp	x0, x20
00000000000b10f8	b.eq	0xb12a4
00000000000b10fc	cbz	x0, 0xb110c
00000000000b1100	ldr	x8, [x0]
00000000000b1104	ldr	x8, [x8, #0x18]
00000000000b1108	blr	x8
00000000000b110c	str	x20, [sp, #0x30]
00000000000b1110	ldr	x8, [x20]
00000000000b1114	ldr	x8, [x8, #0x10]
00000000000b1118	mov	x0, x20
00000000000b111c	blr	x8
00000000000b1120	b	0xb12a4
00000000000b1124	mov	x0, x23
00000000000b1128	bl	_objc_msgSend$colorSpace
00000000000b112c	mov	x23, x0
00000000000b1130	ldr	w8, [sp, #0x3c]
00000000000b1134	cmp	w8, #0xf
00000000000b1138	b.gt	0xb1148
00000000000b113c	add	x8, sp, #0x18
00000000000b1140	bl	0x2513b4 ; symbol stub for: __ZN17PCColorSpaceCache4sRGBEv
00000000000b1144	b	0xb115c
00000000000b1148	adrp	x8, 727 ; 0x388000
00000000000b114c	ldr	x8, [x8, #0x1c0] ; literal pool symbol address: _kCGColorSpaceDisplayP3
00000000000b1150	ldr	x1, [x8]
00000000000b1154	add	x0, sp, #0x18
00000000000b1158	bl	0x2514a4 ; symbol stub for: __ZN18PCColorSpaceHandleC1EPK10__CFString
00000000000b115c	cbz	x20, 0xb1170
00000000000b1160	ldr	x8, [x20]
00000000000b1164	ldr	x8, [x8, #0x10]
00000000000b1168	mov	x0, x20
00000000000b116c	blr	x8
00000000000b1170	add	x0, sp, #0x18
00000000000b1174	bl	0x251d98 ; symbol stub for: __ZNK18PCColorSpaceHandle15getCGColorSpaceEv
00000000000b1178	mov	x24, x0
00000000000b117c	add	x8, sp, #0x10
00000000000b1180	add	x0, sp, #0x30
00000000000b1184	mov	x1, x23
00000000000b1188	mov	w2, #0x1
00000000000b118c	mov	x3, x24
00000000000b1190	mov	w4, #0x0
00000000000b1194	bl	0x250da8 ; symbol stub for: __Z19FxApplyColorConformRK5HGRefI6HGNodeEP12CGColorSpacebS5_b
00000000000b1198	ldr	x2, [sp, #0x10]
00000000000b119c	ldr	x8, [x20]
00000000000b11a0	ldr	x8, [x8, #0x78]
00000000000b11a4	mov	x0, x20
00000000000b11a8	mov	w1, #0x0
00000000000b11ac	blr	x8
00000000000b11b0	ldr	x0, [sp, #0x10]
00000000000b11b4	cmp	x0, x20
00000000000b11b8	b.eq	0xb11e0
00000000000b11bc	cbz	x0, 0xb11cc
00000000000b11c0	ldr	x8, [x0]
00000000000b11c4	ldr	x8, [x8, #0x18]
00000000000b11c8	blr	x8
00000000000b11cc	str	x20, [sp, #0x10]
00000000000b11d0	ldr	x8, [x20]
00000000000b11d4	ldr	x8, [x8, #0x10]
00000000000b11d8	mov	x0, x20
00000000000b11dc	blr	x8
00000000000b11e0	add	x8, sp, #0x40
00000000000b11e4	add	x0, sp, #0x10
00000000000b11e8	mov	x1, x24
00000000000b11ec	mov	w2, #0x0
00000000000b11f0	mov	x3, x23
00000000000b11f4	mov	w4, #0x1
00000000000b11f8	bl	0x250da8 ; symbol stub for: __Z19FxApplyColorConformRK5HGRefI6HGNodeEP12CGColorSpacebS5_b
00000000000b11fc	ldr	x8, [sp, #0x10]
00000000000b1200	ldr	x0, [sp, #0x40]
00000000000b1204	cmp	x8, x0
00000000000b1208	b.eq	0xb122c
00000000000b120c	cbz	x8, 0xb1224
00000000000b1210	ldr	x9, [x8]
00000000000b1214	ldr	x9, [x9, #0x18]
00000000000b1218	mov	x0, x8
00000000000b121c	blr	x9
00000000000b1220	ldr	x0, [sp, #0x40]
00000000000b1224	str	x0, [sp, #0x10]
00000000000b1228	b	0xb1240
00000000000b122c	cbz	x8, 0xb1268
00000000000b1230	ldr	x8, [x0]
00000000000b1234	ldr	x8, [x8, #0x18]
00000000000b1238	blr	x8
00000000000b123c	ldr	x0, [sp, #0x10]
00000000000b1240	ldr	x8, [sp, #0x30]
00000000000b1244	cmp	x8, x0
00000000000b1248	b.eq	0xb1254
00000000000b124c	cbnz	x8, 0xb1270
00000000000b1250	b	0xb1284
00000000000b1254	cbz	x0, 0xb128c
00000000000b1258	ldr	x8, [x0]
00000000000b125c	ldr	x8, [x8, #0x18]
00000000000b1260	blr	x8
00000000000b1264	b	0xb128c
00000000000b1268	ldr	x8, [sp, #0x30]
00000000000b126c	cbz	x8, 0xb128c
00000000000b1270	ldr	x9, [x8]
00000000000b1274	ldr	x9, [x9, #0x18]
00000000000b1278	mov	x0, x8
00000000000b127c	blr	x9
00000000000b1280	ldr	x0, [sp, #0x10]
00000000000b1284	str	x0, [sp, #0x30]
00000000000b1288	str	xzr, [sp, #0x10]
00000000000b128c	ldr	x8, [x20]
00000000000b1290	ldr	x8, [x8, #0x18]
00000000000b1294	mov	x0, x20
00000000000b1298	blr	x8
00000000000b129c	add	x0, sp, #0x18
00000000000b12a0	bl	__ZN7PCCFRefIP12CGColorSpaceED2Ev
00000000000b12a4	add	x2, sp, #0x30
00000000000b12a8	mov	x0, x22
00000000000b12ac	bl	"_objc_msgSend$setHeliumRef:"
00000000000b12b0	ldr	x8, [x20]
```

**How to extract the actual colour table:** the LUT cube is loaded by `-[PAEPhotosFilters lutBitmapForFilter:lutDimensions:]` from a bundled resource; dump it by breakpointing that method, or read the `.cube`/`.scube` resources in the Filters bundle. `HGApply3DLUT` then does a straight trilinear 3-D texture lookup.
