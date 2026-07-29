// HGDenoisePDE — Helium.framework filter node for PDE-based image denoise.
// Filter-graph facade with a single scalar parameter (index 0), a stored render-child at
// this+0x198, and two child transform-nodes at this+0x1b8 / this+0x1c0. This file transcribes:
//   - SetParameter (index 0 is the only supported parameter; all others return -1)   @Helium 0x1c3210
//   - GetOutput layout observations  @Helium 0x1c3250
// Ctor/dtors are throw-stubs citing their @0xADDR.
//
// Decode evidence:
//   raw-port/re/disasm/Helium.HGDenoisePDE.SetParameter.s
//   raw-port/re/disasm/Helium.HGDenoisePDE.GetOutput.s
// RIP constants resolved directly from /tmp/Helium.x86_64 (VA==offset in thin fat-slice):
//   @0x3CA2EC float32 = 4.0                     (used in GetOutput's *0x60 dispatch)
// Member layout (recovered from SetParameter + GetOutput):
//   this+0x198 : HGNode*  inputChild        (asks HGRenderer::GetInput(this, 0) into this)
//   this+0x1b8 : HGNode*  transformChild0   (its *0x60 slot invoked with (0, 4.0f, 4.0f, 0, 0))
//   this+0x1c0 : HGNode*  transformChild1   (its *0x60 slot invoked with (0, k, k, k, k) where k=denoiseAmount)
//   this+0x1c8 : float    denoiseAmount    (SetParameter index 0)

// ────────────────────────────────────────────────────────────────────────────────────────
// Public state model
// ────────────────────────────────────────────────────────────────────────────────────────
export interface HGDenoisePDEState {
  /** this+0x1c8 float — denoise amount, only parameter accepted by SetParameter. */
  denoiseAmount: number;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// HGDenoisePDE::SetParameter(int index, float p0, float p1, float p2, float p3)
// @Helium 0x1c3210. Full body (19 lines, no callees except HGNode::ClearBits):
//   0x1c3210  mov  $-1, %eax               ; default return
//   0x1c3215  test %esi, %esi              ; if (index != 0)
//   0x1c3217  je   0x1c321a
//   0x1c3219  ret                          ; return -1  (only index 0 is supported)
//   0x1c321a  movss 0x1c8(%rdi), %xmm1     ; xmm1 = this->denoiseAmount (current)
//   0x1c3222  ucomiss %xmm0, %xmm1         ; flags <- xmm1 - xmm0
//   0x1c3225  jne  0x1c3229                ; if != -> jump to store
//   0x1c3227  jnp  0x1c3241                ; if ordered-equal -> ret 0
//   0x1c3229  push %rbp; mov %rsp, %rbp
//   0x1c322d  movss %xmm0, 0x1c8(%rdi)     ; this->denoiseAmount = p0
//   0x1c3235  call HGNode::ClearBits       ; ClearBits (dirty the graph)
//   0x1c323a  mov $1, %eax
//   0x1c323f  pop %rbp; ret                ; return 1
//   0x1c3241  xor %eax, %eax; ret          ; return 0
//
// The ucomiss+jne+jnp idiom is the standard f32-equality check with NaN-handling:
//   - jne fires on inequality OR unordered (NaN).
//   - jnp fires only on ordered.
//   Together: "if (xmm1 == xmm0 AND both are ordered) fall to ret 0; else store new value."
// So NaN old-value OR NaN p0 -> takes the store branch (dirty + ClearBits + return 1).
// Returns:  1  = new value stored (dirty),
//           0  = same value, no-op,
//          -1  = unsupported index.
// ────────────────────────────────────────────────────────────────────────────────────────
export function SetParameter(
  state: HGDenoisePDEState,
  index: number,
  p0: number,
  _p1: number,
  _p2: number,
  _p3: number,
): number {
  if (index !== 0) return -1;                                      // @0x1c3210..0x1c3219
  const old = Math.fround(state.denoiseAmount);                    // @0x1c321a
  const nw = Math.fround(p0);
  // ucomiss+jne/jnp: equal-and-ordered => no-op; anything else => store.
  if (!Number.isNaN(old) && !Number.isNaN(nw) && old === nw) {
    return 0;                                                       // @0x1c3241
  }
  state.denoiseAmount = nw;                                         // @0x1c322d
  // HGNode::ClearBits() would run here (@0x1c3235); it dirties the parent graph so the next
  // GetOutput retriggers Metal encode. The state model above doesn't track dirtiness — a
  // full port needs the HGNode graph model.
  return 1;                                                         // @0x1c323a
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs.
// ────────────────────────────────────────────────────────────────────────────────────────

/** HGDenoisePDE::HGDenoisePDE(bool)  @Helium 0x1c2e60 (C2 base ctor). */
export function HGDenoisePDE_C2(): void {
  throw new Error(
    "HGDenoisePDE::HGDenoisePDE(bool) @Helium 0x1c2e60 not yet transcribed.",
  );
}

/** HGDenoisePDE::HGDenoisePDE(bool)  @Helium 0x1c3080 (C1 complete ctor). */
export function HGDenoisePDE_C1(): void {
  throw new Error(
    "HGDenoisePDE::HGDenoisePDE(bool) @Helium 0x1c3080 not yet transcribed.",
  );
}

/** HGDenoisePDE::~HGDenoisePDE()  @Helium 0x1c3090 (D2 base dtor). */
export function HGDenoisePDE_D2(): void {
  throw new Error(
    "HGDenoisePDE::~HGDenoisePDE() @Helium 0x1c3090 not yet transcribed.",
  );
}

/** HGDenoisePDE::~HGDenoisePDE()  @Helium 0x1c3110 (D1 complete dtor). */
export function HGDenoisePDE_D1(): void {
  throw new Error(
    "HGDenoisePDE::~HGDenoisePDE() @Helium 0x1c3110 not yet transcribed.",
  );
}

/** HGDenoisePDE::~HGDenoisePDE()  @Helium 0x1c3190 (D0 deleting dtor). */
export function HGDenoisePDE_D0(): void {
  throw new Error(
    "HGDenoisePDE::~HGDenoisePDE() @Helium 0x1c3190 not yet transcribed.",
  );
}

/** HGDenoisePDE::GetOutput(HGRenderer*)  @Helium 0x1c3250.
 *  Full disasm (38 lines) is a two-hop dispatch chain that ends at this+0x1c0:
 *    r14  = this+0x198 (input child)
 *    HGRenderer::GetInput(renderer, this, 0) -> tmp
 *    (*(r14->vtbl+0x78))(r14, 0, tmp)                    ; feed input into input-child slot 0
 *    (*(this+0x1b8->vtbl+0x60))(this+0x1b8, 0, 4.0f, 4.0f, 0.0f, 0.0f)   ; @0x3CA2EC = 4.0f
 *    (*(this+0x1c0->vtbl+0x60))(this+0x1c0, 0, k, k, k, k)                ; k = this->denoiseAmount
 *    return this+0x1c0
 *  vtable slots +0x60 / +0x78 are undecoded; the ports for the child node types
 *  (HGXForm / HGTransform / similar) are throw-stubs too. Full functional path
 *  is not yet transcribed @Helium 0x1c3250. */
export function GetOutput(): void {
  throw new Error(
    "HGDenoisePDE::GetOutput(HGRenderer*) @Helium 0x1c3250 not yet transcribed — " +
      "requires HGRenderer::GetInput and child vtable slots +0x60/+0x78.",
  );
}
