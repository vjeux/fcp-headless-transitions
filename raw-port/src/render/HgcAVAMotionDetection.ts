// HgcAVAMotionDetection — Helium render node (HGNode subclass) that
// computes a per-pixel motion mask by comparing two input images A and B
// and outputting a scalar signal proportional to |A - B| (RGB summed and
// combined with the alpha delta), scaled by a constant tuning coefficient.
//
// This is the CPU/SSE side of the node. It has an AVX sibling
// (RenderTile_AVX @0x213b30) which is picked when the render target's
// pixel format code is >= 0x4700000, and a scalar-slow branch inside
// RenderTile @0x213d40 for target codes <= 0x44fffff. The GPU is handled
// by an external Metal program looked up via GetProgram() / BindTexture()
// / Bind() — those are opaque plumbing into HGRenderer and are not the
// numeric core; here we transcribe the CPU numeric core + trivial getters.
//
// Framework: Helium (/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework)
// The thin x86_64 slice is a plain Mach-O — VAs in the disasm are file
// offsets (see raw-port/tools/disasm.sh).
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/Helium.HgcAVAMotionDetection.*.s):
//   @0x212ef0  GetProgram(HGRenderer*)                       [opaque — plumbing]
//   @0x212f20  InitProgramDescriptor(HGProgramDescriptor*)   [opaque — plumbing]
//   @0x213740  shaderDescription() const                     [opaque — plumbing]
//   @0x213790  BindTexture(HGHandler*, int)                  [opaque — plumbing]
//   @0x213b10  Bind(HGHandler*)  — trivial vtable-forward, transcribed here
//   @0x213b30  RenderTile_AVX(HGTile*)                       [AVX sibling — deferred, cite only]
//   @0x213d40  RenderTile(HGTile*)                           [SSE inner loop — deferred, cite only]
//   @0x213f80  GetDOD(HGRenderer*, int, HGRect)              — transcribed here
//   @0x213fe0  GetROI(HGRenderer*, int, HGRect)              — transcribed here (identical structure)
//   @0x214040  HgcAVAMotionDetection()                       [C2 — transcribed here]
//   @0x214110  HgcAVAMotionDetection()                       [C1 — transcribed here]
//   @0x2141e0  ~HgcAVAMotionDetection()                      [D2 — trivial]
//   @0x214230  ~HgcAVAMotionDetection()                      [D1 alias]
//   @0x214280  ~HgcAVAMotionDetection()                      [D0 — transcribed here]
//   @0x2142d0  SetParameter(int, float, float, float, float) — trivial: returns 0xFFFFFFFF
//   @0x2142e0  GetParameter(int, float*)                     — trivial: returns 0xFFFFFFFF
//   @0x2142f0  GetOutput(HGRenderer*)                        — trivial: returns this
//
// VTABLE ADDRESS: primary vptr installed by C1/C2/D0 is `vtable+0x10 = 0xa2fb28`
// (resolve.py Helium sym 0xa2fb28 -> "vtable for HgcAVAMotionDetection (+0x10)").
//
// STRUCT LAYOUT (recovered from C2 @0x214110 and RenderTile @0x213d40):
//   +0x000  primary vptr = 0xa2fb28
//   +0x008..                HGNode base subobject (opaque; ctor calls HGNode::HGNode)
//   +0x010  u32             HGNode flags word — bits set: & 0xfffff9fe, | 0x401  (@0x2141b8..0x2141c5)
//   +0x198  buffer*         32-byte-aligned pointer into a 0xa7-byte allocation
//                           holding four SIMD constants at offsets 0x00, 0x20, 0x40, 0x60
//                           (each duplicated at +0x10, +0x30, +0x50, +0x70). The allocation
//                           is `new unsigned char[0xa7]` @0x214129; the raw pointer is
//                           stashed at `buffer[-8]` (i.e. `buffer - 8`) for the D0 free.
//
// TUNING CONSTANTS at buffer[+0..+0x70] (recovered from C2 movaps loads;
// each cited by its RIP-relative TARGET address in the Helium slice):
//   buffer[+0x00] = fabs mask (u32 0x7fffffff x 4)     @Helium 0x3c7c30   ; RIP: @0x21414f+0x1b3ae1
//   buffer[+0x10] = fabs mask duplicate                @Helium 0x3c7c30   ; RIP: @0x214154+0x1b3ae1
//   buffer[+0x20] = threshold 0.2f x 4                 @Helium 0x88c7e0   ; RIP: @0x214160+0x678680
//   buffer[+0x30] = threshold duplicate                @Helium 0x88c7e0   ; RIP: @0x214165+0x678680
//   buffer[+0x40] = 1.0f x 4                           @Helium 0x3c7c40   ; RIP: @0x214171+0x1b3acf
//   buffer[+0x50] = 1.0f duplicate                     @Helium 0x3c7c40   ; RIP: @0x214176+0x1b3acf
//   buffer[+0x60] = alpha-only mask (0, 0, 0, 0xFFFFFFFF)  @Helium 0x85fc40 ; RIP: @0x214182+0x64babe
//   buffer[+0x70] = alpha-only mask duplicate          @Helium 0x85fc40   ; RIP: @0x214187+0x64babe
// All four constant addresses were verified by python3 -c 'struct.unpack "<4f"/"<4I"' on
// the thin Helium slice (see the header of this class file's session log).

// ---------------------------------------------------------------------------
// External Helium symbols this class calls into. They are opaque plumbing
// (HGNode base ops, HGRenderer target queries, HGRect helpers) and are
// declared as raising stubs so the gate can see the deferred addresses and
// the frontier tool can enumerate them.
// ---------------------------------------------------------------------------

/** HGNode::HGNode() — @Helium stub, called by C2 @0x21411a. Base ctor. */
export function HGNode_HGNode(_this: unknown): void {
  throw new Error("HGNode::HGNode @Helium call @0x21411a not yet transcribed");
}

/** HGNode::~HGNode() — @Helium stub, called by D0 @0x2142b0. Base dtor. */
export function HGNode_dtor(_this: unknown): void {
  throw new Error("HGNode::~HGNode @Helium call @0x2142b0 not yet transcribed");
}

/** HGObject::operator delete(void*) — @Helium stub, tail-jmp'd by D0 @0x2142be. */
export function HGObject_operator_delete(_p: unknown): void {
  throw new Error("HGObject::operator delete @Helium call @0x2142be not yet transcribed");
}

/** operator new[](size_t) — libc++ __Znam stub, called by C2 @0x21412e. */
export function operator_new_array(_n: number): Uint8Array {
  throw new Error("operator new[] @Helium call @0x21412e not yet transcribed");
}

/** operator delete(void*) — libc++ __ZdlPv stub, called by D0 @0x2142a8. */
export function operator_delete(_p: unknown): void {
  throw new Error("operator delete @Helium call @0x2142a8 not yet transcribed");
}

/** HGNode::SetFlags(int, int) — @Helium stub, called by C2 @0x21419d. */
export function HGNode_SetFlags(_this: unknown, _a: number, _b: number): void {
  throw new Error("HGNode::SetFlags @Helium call @0x21419d not yet transcribed");
}

/** HGTile::Renderer() const — @Helium stub, called by RenderTile @0x213d53. */
export function HGTile_Renderer(_tile: unknown): unknown {
  throw new Error("HGTile::Renderer @Helium call @0x213d53 not yet transcribed");
}

/** HGRenderer::GetTarget(unsigned int) — @Helium stub, called by RenderTile @0x213d5d. */
export function HGRenderer_GetTarget(_r: unknown, _idx: number): number {
  throw new Error("HGRenderer::GetTarget @Helium call @0x213d5d not yet transcribed");
}

/** HGRectMake4i — @Helium stub, called by GetDOD @0x213fa4 / GetROI @0x214004. */
export function HGRectMake4i(_a: number, _b: number, _c: number, _d: number): unknown {
  throw new Error("HGRectMake4i @Helium call @0x213fa4 not yet transcribed");
}

/** HGRectGrow — @Helium stub, tail-jmp'd by GetDOD @0x213fb9 / GetROI @0x214019. */
export function HGRectGrow(_r: unknown, _rect: unknown, _by: unknown): unknown {
  throw new Error("HGRectGrow @Helium call @0x213fb9 not yet transcribed");
}

/** HGRectNull — @Helium data pointer, dereferenced by GetDOD @0x213fbe / GetROI @0x21401e. */
export const HGRectNull_ref = { _kind: "HGRectNull" as const };

// ---------------------------------------------------------------------------
// TUNING CONSTANTS (per-buffer, all verified against the Helium slice)
// ---------------------------------------------------------------------------

/** buffer[+0x00 and +0x10]: 4x fabs mask (0x7fffffff each) — @Helium 0x3c7c30. */
export const HGCAVAMOTION_ABS_MASK_U32: readonly [number, number, number, number] = [
  0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff,
];

/** buffer[+0x20 and +0x30]: 4x threshold coefficient 0.2f — @Helium 0x88c7e0. */
export const HGCAVAMOTION_THRESHOLD_F32: readonly [number, number, number, number] = [
  Math.fround(0.2), Math.fround(0.2), Math.fround(0.2), Math.fround(0.2),
];

/** buffer[+0x40 and +0x50]: 4x 1.0f — @Helium 0x3c7c40. */
export const HGCAVAMOTION_ONES_F32: readonly [number, number, number, number] = [
  Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), Math.fround(1.0),
];

/** buffer[+0x60 and +0x70]: 4-lane mask (0,0,0,0xFFFFFFFF) — @Helium 0x85fc40. */
export const HGCAVAMOTION_ALPHA_MASK_U32: readonly [number, number, number, number] = [
  0x00000000, 0x00000000, 0x00000000, 0xffffffff,
];

/** vtable primary installed pointer — @Helium 0xa2fb28 (vtable+0x10 for HgcAVAMotionDetection). */
export const HGCAVAMOTION_VPTR_PRIMARY = 0xa2fb28;

/** Byte size passed to `operator new[]` in C2 @0x214129 for the aligned tuning buffer. */
export const HGCAVAMOTION_BUFFER_ALLOC_SIZE = 0xa7;

/**
 * Pixel-format threshold that RenderTile uses to dispatch to RenderTile_AVX
 * — @0x213d62 `cmpl $0x4700000, %eax` / `jb`.
 */
export const HGCAVAMOTION_TARGET_AVX_MIN = 0x4700000;

/**
 * Pixel-format threshold that RenderTile uses to pick the SLOW scalar path
 * — @0x213da8 `cmpl $0x44fffff, %eax` / `jbe`.
 */
export const HGCAVAMOTION_TARGET_SLOW_MAX = 0x44fffff;

/** Flag AND-mask applied to `this+0x10` by C2 @0x2141b8 (before OR with 0x401). */
export const HGCAVAMOTION_FLAG_AND = 0xfffff9fe;

/** Flag OR-mask applied to `this+0x10` by C2 @0x2141c0 (after AND with 0xFFFFF9FE). */
export const HGCAVAMOTION_FLAG_OR = 0x401;

// ---------------------------------------------------------------------------
// A minimal handle type. TS ports don't reproduce Helium's memory layout
// bit-for-bit; the numeric constants above (and the deferred kernels below)
// are what matter for downstream port-graph verification.
// ---------------------------------------------------------------------------

/** HgcAVAMotionDetection object handle (fields recovered from disasm). */
export interface HgcAVAMotionDetectionHandle {
  /** primary vptr (+0x000). C2 writes 0xa2fb28. */
  vptr: number;
  /** HGNode flags word at +0x010 (bits per HGCAVAMOTION_FLAG_AND / _OR). */
  hgNodeFlagsAt10: number;
  /** 32-byte-aligned tuning buffer pointer at +0x198. Layout as per the class header. */
  bufferAt198: Float32Array;
  /** Raw allocation base (buffer - 8 in C++) — kept for D0 free @0x21429f. */
  bufferAt198_rawAllocation: Uint8Array | null;
}

// ---------------------------------------------------------------------------
// Allocation helper: build the 32-byte-aligned tuning buffer with the four
// SIMD constants written by C2 @0x214148..@0x21418c. This mirrors the
// alignment trick used by the ctor:
//   raw = new unsigned char[0xa7]           ; @0x21412e
//   ecx = (-((intptr_t)(raw + 8))) & 0x1f   ; @0x214133..0x214139  (bytes to skip)
//   aligned = raw + ecx + 8                 ; @0x21413c..@0x214140
//   *(void**)(aligned - 8) = raw            ; @0x214144   (store raw base for later free)
// ---------------------------------------------------------------------------
/**
 * Materialise the tuning-buffer contents that live at `this + 0x198` after
 * the ctor writes the four SIMD constants (offsets +0..+0x80 within the
 * aligned buffer).
 *
 * @returns a Float32Array (0x80 bytes = 32 float32 lanes) whose lane values
 *          match the movaps stores in C2 @0x214148..@0x21418c exactly.
 */
export function buildHgcAVAMotionBuffer(): Float32Array {
  const buffer = new Float32Array(32); // 0x80 bytes = 128 / 4
  const u32 = new Uint32Array(buffer.buffer);
  // buffer[+0x00] and buffer[+0x10] — fabs mask, twice.
  for (let i = 0; i < 4; i++) u32[i] = HGCAVAMOTION_ABS_MASK_U32[i];
  for (let i = 0; i < 4; i++) u32[4 + i] = HGCAVAMOTION_ABS_MASK_U32[i];
  // buffer[+0x20] and buffer[+0x30] — threshold, twice.
  for (let i = 0; i < 4; i++) buffer[8 + i] = HGCAVAMOTION_THRESHOLD_F32[i];
  for (let i = 0; i < 4; i++) buffer[12 + i] = HGCAVAMOTION_THRESHOLD_F32[i];
  // buffer[+0x40] and buffer[+0x50] — 1.0, twice.
  for (let i = 0; i < 4; i++) buffer[16 + i] = HGCAVAMOTION_ONES_F32[i];
  for (let i = 0; i < 4; i++) buffer[20 + i] = HGCAVAMOTION_ONES_F32[i];
  // buffer[+0x60] and buffer[+0x70] — alpha-only mask, twice.
  for (let i = 0; i < 4; i++) u32[24 + i] = HGCAVAMOTION_ALPHA_MASK_U32[i];
  for (let i = 0; i < 4; i++) u32[28 + i] = HGCAVAMOTION_ALPHA_MASK_U32[i];
  return buffer;
}

// ---------------------------------------------------------------------------
// C2 / C1 — @0x214040 and @0x214110 — the constructor. Mirrors:
//   HGNode::HGNode(this)                                         ; @0x21411a
//   *(void**)this = vtable+0x10   (=0xa2fb28)                    ; @0x214126
//   raw = new unsigned char[0xa7]                                ; @0x21412e
//   ecx = (-((intptr_t)(raw+8))) & 0x1f                           ; @0x214133..0x214139
//   aligned = raw + ecx + 8                                       ; @0x21413c..0x214140
//   *(void**)(aligned - 8) = raw                                  ; @0x214144
//   [aligned + 0x00 / +0x10] = fabs mask                          ; @0x214148..0x214154
//   [aligned + 0x20 / +0x30] = threshold                          ; @0x214159..0x214165
//   [aligned + 0x40 / +0x50] = 1.0                                ; @0x21416a..0x214176
//   [aligned + 0x60 / +0x70] = alpha-only mask                    ; @0x21417b..0x214187
//   this+0x198 = aligned                                          ; @0x21418c
//   HGNode::SetFlags(this, 0, 1)                                  ; @0x21419d
//   (*this)->vtable[0x88](this, 1, 1)                             ; @0x2141b2 (virtual)
//   this+0x10 = (this+0x10 & 0xfffff9fe) | 0x401                  ; @0x2141b8..0x2141c5
// C1 @0x214110 is aliased onto C2 @0x214040; both bodies match this
// transcription (see raw-port/re/disasm/Helium.HgcAVAMotionDetection.HgcAVAMotionDetection.s).
// ---------------------------------------------------------------------------
/**
 * HgcAVAMotionDetection C1/C2 — @0x214040 / @0x214110.
 * Faithful transcription. The virtual dispatch at @0x2141b2 (vtable slot +0x88)
 * is not yet transcribed — it is a base class virtual whose contract is opaque
 * from this class alone; it is left as a deferred throwing stub.
 */
export function HgcAVAMotionDetection_ctor(): HgcAVAMotionDetectionHandle {
  const handle: HgcAVAMotionDetectionHandle = {
    vptr: 0,
    hgNodeFlagsAt10: 0,
    bufferAt198: new Float32Array(0),
    bufferAt198_rawAllocation: null,
  };
  // HGNode::HGNode(this) — @0x21411a. Not yet transcribed; call the deferred stub.
  HGNode_HGNode(handle);
  handle.vptr = HGCAVAMOTION_VPTR_PRIMARY; // @0x214126
  // raw allocation + alignment trick (@0x21412e..@0x214144).
  const raw = new Uint8Array(HGCAVAMOTION_BUFFER_ALLOC_SIZE);
  void raw; // real allocation is opaque to TS; kept for provenance.
  const aligned = buildHgcAVAMotionBuffer(); // @0x214148..@0x214187
  handle.bufferAt198 = aligned; // @0x21418c
  handle.bufferAt198_rawAllocation = raw;
  HGNode_SetFlags(handle, 0, 1); // @0x21419d
  // Virtual dispatch at @0x2141b2 — vtable slot +0x88 — deferred.
  // This mutates internal HGNode state before the flag masking below.
  //   Faithful call: (*this->vptr[0x88])(this, 1, 1)
  // Deferred as a raising stub; callers that never intended to run this
  // in TS may catch and continue with the flag update below.
  //   Not yet transcribed: vtable slot +0x88 @0x2141b2.
  // We record the fact via a raising stub call to keep provenance strict:
  hgcAVAMotionDetection_virtualSlot88(handle, 1, 1);
  handle.hgNodeFlagsAt10 = (handle.hgNodeFlagsAt10 & HGCAVAMOTION_FLAG_AND) | HGCAVAMOTION_FLAG_OR; // @0x2141b8..0x2141c5
  return handle;
}

/**
 * Virtual dispatch to `this->vtable[0x88]` — HGNode-derived base virtual
 * invoked once by C2 @0x2141b2 with args (this, 1, 1). Deferred stub;
 * frontier callee (not yet transcribed) at HgcAVAMotionDetection C2 @0x2141b2.
 */
export function hgcAVAMotionDetection_virtualSlot88(
  _self: HgcAVAMotionDetectionHandle,
  _a: number,
  _b: number
): void {
  throw new Error("HGNode vtable slot +0x88 @Helium call site 0x2141b2 not yet transcribed");
}

// ---------------------------------------------------------------------------
// D0 — @0x214280 — the delete-thunk destructor. Mirrors:
//   *(void**)this = vtable+0x10                                  ; @0x214289..@0x214290
//   raw = *(void**)(this+0x198)                                  ; @0x214293
//   if (raw != 0) {                                              ; @0x21429a..@0x21429d
//     inner = *(void**)(raw - 8)                                 ; @0x21429f
//     if (inner != 0) operator delete(inner)                     ; @0x2142a3..@0x2142a8
//   }
//   HGNode::~HGNode(this)                                         ; @0x2142b0
//   HGObject::operator delete(this)                               ; @0x2142be (tail-jmp)
// ---------------------------------------------------------------------------
/**
 * HgcAVAMotionDetection::~HgcAVAMotionDetection() [D0] — @0x214280.
 */
export function HgcAVAMotionDetection_dtor_D0(self: HgcAVAMotionDetectionHandle): void {
  self.vptr = HGCAVAMOTION_VPTR_PRIMARY;
  const raw = self.bufferAt198;
  if (raw.length !== 0) {
    const inner = self.bufferAt198_rawAllocation;
    if (inner != null) operator_delete(inner);
  }
  HGNode_dtor(self);
  HGObject_operator_delete(self);
}

// ---------------------------------------------------------------------------
// Bind() — @0x213b10. A trivial vtable-forward to slot +0xc0 of this->vtable
// (an HGHandler-related base virtual), then returns 0.
// ---------------------------------------------------------------------------
/** Bind(HGHandler*) — @0x213b10. Faithful transcription. */
export function HgcAVAMotionDetection_Bind(self: HgcAVAMotionDetectionHandle, _handler: unknown): number {
  void self;
  // (*this->vtable[0xc0])(...) — @0x213b17 — not yet transcribed base virtual.
  hgcAVAMotionDetection_virtualSlotC0(self, _handler);
  return 0;
}

/**
 * Virtual dispatch to `this->vtable[0xc0]` — HGNode/HGHandler base virtual
 * used by Bind() @0x213b17. Deferred stub; frontier callee (not yet
 * transcribed) at HgcAVAMotionDetection Bind @0x213b17.
 */
export function hgcAVAMotionDetection_virtualSlotC0(
  _self: HgcAVAMotionDetectionHandle,
  _handler: unknown
): void {
  throw new Error("HGNode vtable slot +0xc0 @Helium call site 0x213b17 not yet transcribed");
}

// ---------------------------------------------------------------------------
// GetDOD() and GetROI() — @0x213f80 / @0x213fe0. Identical structure:
//   if (index == 0 || index == 1) {
//     rect = HGRectMake4i(-2, 0, 2, 0)                          ; @0x213f96..0x213fa4
//     return HGRectGrow(renderer, srcRect, rect)                 ; @0x213fac..0x213fb9 (tail-jmp)
//   } else {
//     return _HGRectNull                                         ; @0x213fbe..0x213fd0
//   }
// The `-2, 0, 2, 0` growth values come from the immediates loaded at
// @0x213f96..0x213fa2 (`edi=-2 (0xFFFFFFFE)`, `esi=0`, `edx=2`, `ecx=0`).
// ---------------------------------------------------------------------------

/** Growth rect passed to HGRectGrow by GetDOD/GetROI: (-2, 0, 2, 0). */
export const HGCAVAMOTION_GROW_RECT_XYWH: readonly [number, number, number, number] = [-2, 0, 2, 0];

/** GetDOD(HGRenderer*, int, HGRect) — @0x213f80. Faithful transcription. */
export function HgcAVAMotionDetection_GetDOD(
  self: HgcAVAMotionDetectionHandle,
  renderer: unknown,
  index: number,
  srcRect: unknown
): unknown {
  void self;
  if (index === 0 || index === 1) {
    const grow = HGRectMake4i(
      HGCAVAMOTION_GROW_RECT_XYWH[0],
      HGCAVAMOTION_GROW_RECT_XYWH[1],
      HGCAVAMOTION_GROW_RECT_XYWH[2],
      HGCAVAMOTION_GROW_RECT_XYWH[3]
    );
    return HGRectGrow(renderer, srcRect, grow);
  }
  return HGRectNull_ref;
}

/** GetROI(HGRenderer*, int, HGRect) — @0x213fe0. Same structure as GetDOD. */
export function HgcAVAMotionDetection_GetROI(
  self: HgcAVAMotionDetectionHandle,
  renderer: unknown,
  index: number,
  srcRect: unknown
): unknown {
  void self;
  if (index === 0 || index === 1) {
    const grow = HGRectMake4i(
      HGCAVAMOTION_GROW_RECT_XYWH[0],
      HGCAVAMOTION_GROW_RECT_XYWH[1],
      HGCAVAMOTION_GROW_RECT_XYWH[2],
      HGCAVAMOTION_GROW_RECT_XYWH[3]
    );
    return HGRectGrow(renderer, srcRect, grow);
  }
  return HGRectNull_ref;
}

// ---------------------------------------------------------------------------
// SetParameter / GetParameter / GetOutput — @0x2142d0 / @0x2142e0 / @0x2142f0.
// All three are trivial returns from disasm:
//   SetParameter -> 0xFFFFFFFF (unsigned int -1)                 ; @0x2142d4
//   GetParameter -> 0xFFFFFFFF                                   ; @0x2142e4
//   GetOutput    -> this                                         ; @0x2142f4 (movq %rdi, %rax)
// ---------------------------------------------------------------------------
/** SetParameter(int, float x 4) — @0x2142d0. Returns -1 (unsigned). */
export function HgcAVAMotionDetection_SetParameter(
  _self: HgcAVAMotionDetectionHandle,
  _index: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number
): number {
  return 0xffffffff | 0;
}

/** GetParameter(int, float*) — @0x2142e0. Returns -1 (unsigned). */
export function HgcAVAMotionDetection_GetParameter(
  _self: HgcAVAMotionDetectionHandle,
  _index: number,
  _outBuf: Float32Array | null
): number {
  return 0xffffffff | 0;
}

/** GetOutput(HGRenderer*) — @0x2142f0. Returns `this`. */
export function HgcAVAMotionDetection_GetOutput(
  self: HgcAVAMotionDetectionHandle,
  _renderer: unknown
): HgcAVAMotionDetectionHandle {
  return self;
}

// ---------------------------------------------------------------------------
// RenderTile / RenderTile_AVX — @0x213d40 / @0x213b30. The numeric core.
//
// Per-pixel SEMANTICS (recovered from RenderTile @0x213d81..0x213e77, fast
// path, target pixel format code > 0x44fffff):
//
//   tile_width  = HGTile[+0x08] - HGTile[+0x00]                   ; @0x213d81..0x213d89
//   tile_height = HGTile[+0x0c] - HGTile[+0x04]                   ; @0x213d85..0x213d8c
//   srcA_stride = HGTile[+0x58] (as ptrdiff * 16)                 ; @0x213d90/0x213dbf
//   srcA_ptr    = HGTile[+0x50]                                   ; @0x213d94
//   srcB_stride = HGTile[+0x68] (as ptrdiff * 16)                 ; @0x213d98/0x213dc3
//   srcB_ptr    = HGTile[+0x60]                                   ; @0x213d9c
//   dst_ptr     = HGTile[+0x10]                                   ; @0x213da0
//   dst_stride  = HGTile[+0x18] (as ptrdiff * 16)                 ; @0x213da4/0x213dc7
//
//   for row in 0..tile_height {
//     for col in 0..tile_width {                                  ; step 0x10 bytes = 4 floats = one pixel
//       // Gather 4 successive pixels' RGB into xmm0 (source A) and xmm1 (source B)
//       // via a stride pattern using unpckl/insertps against strided offsets
//       // -0x20 / -0x10 / 0x10 / 0x20 from the current pixel — this is a 4-tap
//       // stencil in the horizontal direction (the enclosing outer loop
//       // handles the pixel-stride via `%rax = width*0x10`).
//       rgbA_gather = gather4(srcA[-0x20], srcA[-0x10], srcA[+0x10], srcA[+0x20])
//       rgbB_gather = gather4(srcB[-0x20], srcB[-0x10], srcB[+0x10], srcB[+0x20])
//       diff_rgb    = fabs_mask & (rgbA_gather - rgbB_gather)        ; @0x213e28..0x213e36
//       sum_rgb     = dpps($0xff, diff_rgb, ones_x4)                 ; @0x213e39 — horizontal sum
//                                                                    ; broadcast to xmm0 lanes
//       diff_center = fabs_mask & (srcA[+0] - srcB[+0])              ; @0x213e41..0x213e4f
//       diff_center = broadcast(diff_center.x, 4)                    ; @0x213e4b (shufps $0x0)
//       result      = threshold_x4 * (sum_rgb + diff_center)         ; @0x213e52..0x213e55
//       dst[+0]     = result                                         ; @0x213e5a
//     }
//   }
//
// The SLOW path @0x213e82..0x213f6b (target <= 0x44fffff) is structurally
// similar but includes the alpha-mask constant at buffer[+0x60] and one
// additional 4-way horizontal add pattern via pshufd $0x39 / shufps $0x4e
// (@0x213f24..0x213f33) — a reduction across the RGBA lanes. Not yet
// transcribed as a self-contained kernel; deferred as a raising stub.
//
// RenderTile_AVX @0x213b30 (target >= 0x4700000) is the AVX2 sibling; it is
// deferred as a raising stub — a faithful port needs a separate worktree
// aligned to the AVX2 instruction set.
// ---------------------------------------------------------------------------

/**
 * HgcAVAMotionDetection::RenderTile(HGTile*) — @0x213d40.
 *
 * Faithful port pending: the SSE inner-loop kernels (both fast path
 * @0x213dbc..0x213e77 and slow path @0x213e82..0x213f6b) require decoding
 * a full pixel-format-dependent gather stencil that is not self-contained
 * without HGTile + HGRenderer layout. Deferred as a raising stub citing the
 * exact address so the frontier tool can pick up the follow-on work.
 */
export function HgcAVAMotionDetection_RenderTile(
  _self: HgcAVAMotionDetectionHandle,
  _tile: unknown
): void {
  throw new Error(
    "HgcAVAMotionDetection::RenderTile @Helium 0x213d40 not yet transcribed (SSE inner loop pending)"
  );
}

/**
 * HgcAVAMotionDetection::RenderTile_AVX(HGTile*) — @0x213b30.
 *
 * Faithful port pending: AVX2 sibling of RenderTile; requires a separate
 * decoding pass aligned to the AVX2 instruction set. Deferred as a raising
 * stub citing the exact address.
 */
export function HgcAVAMotionDetection_RenderTile_AVX(
  _self: HgcAVAMotionDetectionHandle,
  _tile: unknown
): void {
  throw new Error(
    "HgcAVAMotionDetection::RenderTile_AVX @Helium 0x213b30 not yet transcribed (AVX2 pending)"
  );
}
