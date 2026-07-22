# Disc Warp

- **PAE class:** `Disc Warp`
- **Plugin UUID:** `182BAC6C-B38A-4B1D-9269-8190FD1E5C42`
- **Node names in corpus:** Controller (107), Disc Warp (100), Main OSC (8)
- **Corpus usage:** 215 files, 215 instances

## What it does

Disc Warp wraps the image around a disc/tube: pixels within a Radius of the Center are bent onto a circular surface, producing a bulging cylindrical/spherical warp inside the disc and leaving the outside untouched. It is used for lens-like, orb, and tunnel transition looks.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Disc Warp". The exact mapping (cylinder vs sphere) is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the disc (X,Y) in normalized frame coordinates, (0.5,0.5) = frame center. |
| Radius | float (pixels) | 150 | 61.58 .. 605 | Radius of the warped disc in pixels (default 150). Pixels inside this radius are warped; outside is unaffected. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the warped result over the original, 0-1 continuous. NOT a boolean (only 1 sampled in corpus). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcDiscWarp`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcDiscWarp` → [`HgcDiscWarp.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcDiscWarp.metal)

```metal
//Metal1.0     
//LEN=000000041b
[[ visible ]] FragmentOut HgcDiscWarp_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[1].xy + hg_Params[1].zw;
    r1.xy = float2(dot(r0.xy, r0.xy));
    r2.xy = rsqrt(r1.xx);
    r2.xy = select(r2.xy, c0.xx, r1.xy < 0.00000f);
    r2.xy = select(c0.xx, r2.xy, -r1.xy < 0.00000f);
    r0.xy = r0.xy*r2.xy;
    r2.xy = r1.xy*r2.xy;
    r2.xy = r2.xy*hg_Params[0].xx;
    r1.xy = 1.00000f / r2.xx;
    r1.xy = r2.xy - r1.xy;
    r2.xy = r2.xy - c0.yy;
    r2.xy = select(r1.xy, c0.xx, r2.xy < 0.00000f);
    r2.xy = r2.xy*hg_Params[0].yy;
    r0.xy = r0.xy*r2.xy;
    r0.xy = r0.xy*hg_Params[2].xy + hg_Params[2].zw;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEDiscWarp canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEDiscWarp`

```asm
00000000000a0210	mov	w3, #0x2
00000000000a0214	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a0218	ldr	x2, [x24]
00000000000a021c	mov	x0, x22
00000000000a0220	bl	"_objc_msgSend$getRenderMode:"
00000000000a0224	cbz	w0, 0xa0354
00000000000a0228	mov	x0, x21
00000000000a022c	bl	_objc_msgSend$imageType
00000000000a0230	cmp	x0, #0x3
00000000000a0234	b.ne	0xa0354
00000000000a0238	cbz	x21, 0xa024c
00000000000a023c	add	x8, sp, #0x10
00000000000a0240	mov	x0, x21
00000000000a0244	bl	_objc_msgSend$heliumRef
00000000000a0248	b	0xa0250
00000000000a024c	str	xzr, [sp, #0x10]
00000000000a0250	mov	w8, #0x1
00000000000a0254	strb	w8, [sp, #0xf]
00000000000a0258	cbz	w25, 0xa0270
00000000000a025c	ldr	x4, [x24]
00000000000a0260	add	x2, sp, #0xf
00000000000a0264	mov	x0, x19
00000000000a0268	mov	w3, #0x3
00000000000a026c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000a0270	mov	w0, #0x2b0
00000000000a0274	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a0278	mov	x24, x0
00000000000a027c	bl	__ZN9HDiscWarpC2Ev
00000000000a0280	ldr	x2, [sp, #0x10]
00000000000a0284	ldr	x8, [x24]
00000000000a0288	ldr	x8, [x8, #0x78]
00000000000a028c	mov	x0, x24
00000000000a0290	mov	w1, #0x0
00000000000a0294	blr	x8
00000000000a0298	ldr	d0, [sp, #0x18]
00000000000a029c	fcvt	s0, d0
00000000000a02a0	mov	x0, x24
00000000000a02a4	bl	__ZN7HSphere9SetRadiusEf
00000000000a02a8	add	x1, sp, #0x20
00000000000a02ac	mov	x0, x24
00000000000a02b0	bl	__ZN7HSphere16SetOutputToImageERK14PCMatrix44TmplIdE
00000000000a02b4	add	x1, sp, #0xa0
00000000000a02b8	mov	x0, x24
00000000000a02bc	bl	__ZN7HSphere15SetImageToInputERK14PCMatrix44TmplIdE
00000000000a02c0	cmp	w23, #0x0
00000000000a02c4	mov	w8, #0x42c00000
00000000000a02c8	fmov	s0, w8
00000000000a02cc	movi.2d	v1, #0000000000000000
00000000000a02d0	fcsel	s0, s0, s1, ne
00000000000a02d4	mov	x0, x24
00000000000a02d8	bl	__ZN9HDiscWarp10SetPaddingEf
00000000000a02dc	str	x24, [sp]
00000000000a02e0	ldr	x8, [x24]
00000000000a02e4	ldr	x8, [x8, #0x10]
00000000000a02e8	mov	x0, x24
00000000000a02ec	blr	x8
00000000000a02f0	ldrb	w8, [sp, #0xf]
00000000000a02f4	cmp	w8, #0x1
00000000000a02f8	b.ne	0xa0310
00000000000a02fc	mov	x2, sp
00000000000a0300	mov	x0, x22
00000000000a0304	mov	x3, x21
00000000000a0308	mov	x4, x20
00000000000a030c	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000a0310	mov	x2, sp
00000000000a0314	mov	x0, x20
00000000000a0318	bl	"_objc_msgSend$setHeliumRef:"
00000000000a031c	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (bool)

```
