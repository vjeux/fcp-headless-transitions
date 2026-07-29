// HGGradeDeltaE — Helium filter-graph node that grades an image based on Delta-E color
// distance from a reference. Public API on the C++ side is HGNode-subclass:
//   - ctor (C1/C2) install vtable and default strength+mode
//   - SetParameter(index, p0, p1, p2, p3) accepts two parameter indexes (0=strength, 1=mode)
//   - GetOutput(HGRenderer*) allocates an HgcGradeDeltaE shader-facade child at this+0x1a0
//     and dispatches its SetParameter with mode-specific coefficients, then wires the
//     upstream renderer input into it and returns the child.
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly captured at:
//   raw-port/re/disasm/Helium.HGGradeDeltaE.HGGradeDeltaE.s   (17 lines, C1 body)
//   raw-port/re/disasm/Helium.HGGradeDeltaE.~HGGradeDeltaE.s  (23 lines, D0 deleting dtor)
//   raw-port/re/disasm/Helium.HGGradeDeltaE.SetParameter.s    (27 lines)
//   raw-port/re/disasm/Helium.HGGradeDeltaE.GetOutput.s       (91 lines)
//
// Seven exported symbols owned by this class (all @Helium):
//   0x0da240  C1                                             (co-located with C2 — same body)
//   0x0da280  C2  HGGradeDeltaE::HGGradeDeltaE()             — DECODED here
//   0x0da2c0  D2  HGGradeDeltaE::~HGGradeDeltaE()            — throw-stub (17-line base dtor)
//   0x0da300  D1  HGGradeDeltaE::~HGGradeDeltaE()            — throw-stub
//   0x0da340  D0  HGGradeDeltaE::~HGGradeDeltaE()            — DECODED (deleting dtor)
//   0x0da390  SetParameter(int, float, float, float, float)  — DECODED
//   0x0da3e0  GetOutput(HGRenderer*)                         — DECODED
//
// Vtable resolved via `resolve.py Helium vtable HGGradeDeltaE` @0xa0c900 (installed +0xa0c910):
//   *0x00/0x08 -> ~HGGradeDeltaE   (D1 @0xda300, D0 @0xda340)
//   *0x10      -> HGObject::Retain
//   *0x18      -> HGObject::Release
//   *0x60      -> HGGradeDeltaE::SetParameter @0xda390
//   *0x78      -> HGNode::SetInput            @0x11c5f0
//
// Class layout (recovered from C2 stores + SetParameter accessors + GetOutput):
//   this+0x000  vtable pointer                     @Helium 0xa0c910 (RIP install @0xda28e-0xda295)
//   this+0x008..0x190  HGNode base subobject (see HGNode::HGNode() @0xda289 callee)
//   this+0x198  float  strength                    (SetParameter idx 1; default 1.0e-6f)
//   this+0x19c  int32  mode                        (SetParameter idx 0; range 0..2; default 1)
//   this+0x1a0  HgcGradeDeltaE*  activeChild       (owned; nulled in C2, replaced by GetOutput,
//                                                   Released by *0x18 in D0 and in GetOutput
//                                                   swap-in dance)
//
// The ctor's `movabsq $0x1358637bd, %rax; movq %rax, 0x198(%rbx)` is a single 8-byte immediate
// that writes both fields at once:
//   low32  0x0358637bd -> float  1.0e-6f   at this+0x198  (default strength)
//   high32 0x00000001  -> int32  1         at this+0x19c  (default mode)
// Verified below the class body.

// ────────────────────────────────────────────────────────────────────────────────────────
// Public state model (mirrors the C++ layout — three cited fields).
// ────────────────────────────────────────────────────────────────────────────────────────

/** Owned Metal-facade child; forward-decl since HgcGradeDeltaE is not yet ported (frontier). */
export interface HgcGradeDeltaEChild {
  /** vtable *0x18 — HGObject::Release; called on the previous child during GetOutput swap-in. */
  release(): void;
  /** vtable *0x60 — HgcGradeDeltaE::SetParameter @Helium 0x2eb6b0. */
  setParameter(index: number, p0: number, p1: number, p2: number, p3: number): number;
  /** vtable *0x78 — inherited HGNode::SetInput(int, HGNode*) @Helium 0x11c5f0. */
  setInput(index: number, upstream: unknown): void;
}

export interface HGGradeDeltaEState {
  /** this+0x198 float32 — SetParameter idx 1 (strength). Default 1.0e-6f. */
  strength: number;
  /** this+0x19c int32   — SetParameter idx 0 (mode). Default 1. Valid range 0..2. */
  mode: number;
  /** this+0x1a0 HgcGradeDeltaE* — owned child, initially null. */
  activeChild: HgcGradeDeltaEChild | null;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// HGGradeDeltaE::HGGradeDeltaE()  @Helium 0x0da280   (C2 base ctor; C1 @0x0da240 shares body)
//
// Full disasm (17 lines):
//   0x0da280  push %rbp; mov %rsp, %rbp
//   0x0da284  push %rbx; push %rax
//   0x0da286  mov  %rdi, %rbx                       ; rbx = this
//   0x0da289  call HGNode::HGNode()                 ; base ctor
//   0x0da28e  lea  0x93267b(%rip), %rax             ; rax = HGGradeDeltaE vtable+0x10 = 0xa0c910
//   0x0da295  mov  %rax, (%rbx)                     ; this->vtable = installed ptr
//   0x0da298  movabsq $0x1358637bd, %rax            ; combined default: (0x00000001<<32) | 0x0358637bd
//   0x0da2a2  mov  %rax, 0x198(%rbx)                ; this->strength = 1.0e-6f; this->mode = 1
//   0x0da2a9  movq $0x0, 0x1a0(%rbx)                ; this->activeChild = nullptr
//   0x0da2b4  add  $0x8, %rsp; pop %rbx; pop %rbp; ret
//
// See DEFAULT_STRENGTH / DEFAULT_MODE below for the bit-exact float decode of 0x0358637bd
// and the int32 decode of 0x00000001 respectively.
// ────────────────────────────────────────────────────────────────────────────────────────

/**
 * DEFAULT_STRENGTH — this+0x198 float32 default.
 *
 * Recovered as the low 32 bits of the ctor's movabsq immediate 0x1358637bd
 * (@0x0da298 -> stored at this+0x198 with the high 32 bits going to this+0x19c).
 * u32 = 0x0358637bd  ->  IEEE-754 float32 = 9.999999974752427e-07.
 * That value is the single-precision representation of 1.0e-6f (the same bits `1e-6f`
 * produces after rounding to float32). Written verbatim with the exact bit pattern.
 */
export const DEFAULT_STRENGTH: number = Math.fround(1.0e-6);

/**
 * DEFAULT_MODE — this+0x19c int32 default. High 32 bits of the ctor's 0x1358637bd = 0x00000001 = 1.
 */
export const DEFAULT_MODE: number = 1;

/**
 * HGGradeDeltaE::HGGradeDeltaE() @Helium 0x0da280 (C2) / @0x0da240 (C1).
 * Constructs the JS state mirror. Vtable install (@0x0da28e-0x0da295) and HGNode base
 * ctor (@0x0da289) are throw-stubs at the framework boundary — the C++ HGNode graph
 * scaffolding is not yet transcribed.
 */
export function newHGGradeDeltaE(): HGGradeDeltaEState {
  return {
    strength: DEFAULT_STRENGTH,
    mode: DEFAULT_MODE,
    activeChild: null,
  };
}

// ────────────────────────────────────────────────────────────────────────────────────────
// HGGradeDeltaE::SetParameter(int index, float p0, float p1, float p2, float p3)  @Helium 0x0da390
//
// Full disasm (27 lines):
//   0x0da390  push %rbp; mov %rsp, %rbp
//   0x0da394  cmp  $0x1, %esi                       ; if (index == 1) -> case_mode
//   0x0da397  je   0x0da3bc
//   0x0da399  mov  $-1, %eax                        ; default return = -1 (unsupported)
//   0x0da39e  test %esi, %esi                       ; if (index != 0)
//   0x0da3a0  jne  0x0da3d8                         ;   -> return -1
//   0x0da3a2  cvttss2si %xmm0, %rcx                 ; case_strength: rcx = (int)p0
//     (WAIT — actually the disasm shows this is the case_mode path via fall-through vs case 1.
//      re-read: index==1 -> jumps to 0xda3bc (float-store path); index==0 -> falls into
//      the int-cast+range-check path. So idx 0 is the *enum* setter and idx 1 is the *float*
//      setter, which is opposite of the layout comment above. Reconcile against the
//      +0x198 float / +0x19c int layout:
//         0xda3bc: `movss 0x198(%rdi), %xmm1; ucomiss %xmm0, %xmm1; ... movss %xmm0, 0x198(%rdi)`
//                  -> the float lives at 0x198, and idx==1 writes it.
//         0xda3a2: `cvttss2si %xmm0, %rcx; cmp $0x2, %ecx; ja 0xda3d8; cmp %ecx, 0x19c(%rdi); je ...
//                  movl %ecx, 0x19c(%rdi)` -> the int32 lives at 0x19c, and idx==0 writes it.
//      So the correct assignment is:
//         index 0 -> mode      at this+0x19c  (int32, valid range 0..2 via `cmp $0x2, %ecx; ja`)
//         index 1 -> strength  at this+0x198  (float32, no range check — any float accepted)
//      This is the swap between what the ctor's magic packed u64 suggested — the LOW half
//      of the u64 lands at this+0x198 which is the float. So default STRENGTH IS the low
//      float 1.0e-6f, and default MODE IS the high int32 1. Same defaults; the parameter
//      indices are just wired differently from the OFFSET order.
//    )
//   0x0da3a7  cmp  $0x2, %ecx                       ; if ((int)p0 > 2)  -> range fail
//   0x0da3aa  ja   0x0da3d8                         ;   -> return -1
//   0x0da3ac  cmp  %ecx, 0x19c(%rdi)                ; if (this->mode == (int)p0)
//   0x0da3b2  je   0x0da3da                         ;   -> return 0 (no-op)
//   0x0da3b4  mov  %ecx, 0x19c(%rdi)                ; this->mode = (int)p0
//   0x0da3ba  jmp  0x0da3d3                         ; return 1
//   0x0da3bc  movss 0x198(%rdi), %xmm1              ; case_strength: xmm1 = this->strength
//   0x0da3c4  ucomiss %xmm0, %xmm1                  ; flags = xmm1 - xmm0
//   0x0da3c7  jne  0x0da3cb                         ; if (!=) -> store
//   0x0da3c9  jnp  0x0da3da                         ; if (==-and-ordered) -> return 0 (no-op)
//   0x0da3cb  movss %xmm0, 0x198(%rdi)              ; this->strength = p0
//   0x0da3d3  mov  $0x1, %eax                       ; return 1
//   0x0da3d8  pop %rbp; ret                         ; return %eax (either 1 or -1)
//   0x0da3da  xor %eax, %eax                        ; return 0
//   0x0da3dc  pop %rbp; ret
//
// The ucomiss+jne+jnp idiom is the standard f32-equality with NaN handling:
//   - `jne` fires on inequality OR unordered (NaN)
//   - `jnp` fires only when ordered
//   - Combined: equal-AND-ordered => return 0 (no-op); any other case => store and return 1.
// Any NaN (old or new) forces the store path.
//
// Return semantics: 1 = value changed (dirty), 0 = same value (no-op), -1 = unsupported index
// (index >= 2, or index == 0 with p0 out of [0,2] range).
// ────────────────────────────────────────────────────────────────────────────────────────

export function SetParameter(
  state: HGGradeDeltaEState,
  index: number,
  p0: number,
  _p1: number,
  _p2: number,
  _p3: number,
): number {
  if (index === 1) {
    // case_strength: this+0x198 float, no range check, ordered-equal is a no-op.
    const old = Math.fround(state.strength);                       // @0x0da3bc
    const nw = Math.fround(p0);
    if (!Number.isNaN(old) && !Number.isNaN(nw) && old === nw) {
      return 0;                                                     // @0x0da3da
    }
    state.strength = nw;                                            // @0x0da3cb
    return 1;                                                       // @0x0da3d3
  }
  if (index !== 0) return -1;                                       // @0x0da399..0x0da3a0

  // case_mode: cvttss2si is float32 -> int32 truncation. The trunc must saturate to
  // INT_MIN on non-representable inputs (NaN, +Inf, values beyond +/- 2^31 – 1). x86_64
  // returns 0x80000000 (INT_MIN) in that case. The range check `cmp $2 / ja` is UNSIGNED
  // above (`ja`), so any negative int (including INT_MIN) fails the check and returns -1.
  const p0f = Math.fround(p0);                                      // @0x0da3a2 (source)
  let ic: number;
  if (Number.isNaN(p0f) || p0f >= 2147483648 || p0f < -2147483648) {
    // cvttss2si out-of-range -> 0x80000000
    ic = -0x80000000;                                               // = INT_MIN
  } else {
    ic = p0f < 0 ? Math.ceil(p0f) : Math.floor(p0f);                // truncation toward zero
  }
  // `cmp $0x2, %ecx; ja 0xda3d8` — unsigned "above 2" => return -1. This catches negatives
  // (huge as unsigned) and values > 2.
  const asU32 = ic >>> 0;                                           // reinterpret as u32
  if (asU32 > 2) return -1;                                         // @0x0da3a7..0x0da3aa
  if ((state.mode | 0) === ic) return 0;                            // @0x0da3ac..0x0da3b2, then 0xda3da
  state.mode = ic | 0;                                              // @0x0da3b4
  return 1;                                                         // @0x0da3ba -> 0xda3d3
}

// ────────────────────────────────────────────────────────────────────────────────────────
// HGGradeDeltaE::GetOutput(HGRenderer*)  @Helium 0x0da3e0
//
// Full disasm (91 lines). Control flow:
//   1. Allocate 0x1a0 bytes via HGObject::operator new(0x1a0) into r15.       @0x0da3f0-3fa
//   2. Construct as HgcGradeDeltaE (child kernel) via HgcGradeDeltaE::C1 @0x2eb3b0. @0x0da400
//   3. Swap the new child into this+0x1a0 with the standard "release old, install new" dance:
//        rdi = this->activeChild (old); if (rdi == r15) skip release path (@0xda40f -> 0xda425)
//        else if (rdi) call (*rdi->vtbl[0x18])(rdi)          ; release old              @0xda419
//        this->activeChild = r15                                                      @0xda41c
//   4. Read mode from this+0x19c into eax                                             @0xda433
//        eax == 0: no-op branch — set (xmm1,xmm2,xmm3) := (strength, strength, strength)
//                                (i.e. broadcast p0 to all four SetParameter args)   @0xda4a1-4bb
//        eax == 1: set (xmm1,xmm2,xmm3) := (0.5f, 1.0f, 3.0f)                        @0xda473-495
//        eax == 2: set (xmm1,xmm2,xmm3) := (1.0f, 9.0f, 14.0f)                       @0xda447-469
//        else   : jump past SetParameter dispatch (@0xda4c1) — no-op call.           @0xda445 jne
//   5. If a mode dispatch was taken: call (*child->vtbl[0x60])(child, 0, xmm0=strength,
//        xmm1, xmm2, xmm3)  ->  HgcGradeDeltaE::SetParameter                          @0xda4be
//   6. Fetch upstream tile: renderer->GetInput(this, 0) via HGRenderer::GetInput
//        (renderer, this, 0)                                                          @0xda4c9
//   7. Call (*child->vtbl[0x78])(child, 0, upstream)  ->  HGNode::SetInput            @0xda4dd
//   8. Return this->activeChild                                                        @0xda4e0
//
// Mode-specific coefficients — resolved directly from /tmp/Helium.x86_64 (VA = offset):
//     @0x3C7CC0 float32 = 1.0     (case 2 xmm1; case 1 xmm2)
//     @0x3C7CC8 float32 = 0.5     (case 1 xmm1)
//     @0x3CA2F0 float32 = 3.0     (case 1 xmm3)
//     @0x3CEBBC float32 = 9.0     (case 2 xmm2)
//     @0x3CEBC0 float32 = 14.0    (case 2 xmm3)
//   ImageOffsetTable:
//     case 1 (mode==1, default): (strength, 0.5f, 1.0f, 3.0f)
//     case 2 (mode==2):          (strength, 1.0f, 9.0f, 14.0f)
//     case 0 (mode==0):          (strength, strength, strength, strength)   [broadcast]
//   These are the ΔE coefficient sets — likely one of {ΔE76, ΔE94, ΔE2000} thresholds and
//   knee shapes, plus a "raw" mode. HgcGradeDeltaE (the Metal shader) consumes them
//   verbatim via its SetParameter — we do not interpret them here.
// ────────────────────────────────────────────────────────────────────────────────────────

/** Constants read from the framework binary; every citation is @VA in /tmp/Helium.x86_64. */
export const K_ONE_F32:    number = Math.fround(1.0);   // @Helium 0x3C7CC0
export const K_HALF_F32:   number = Math.fround(0.5);   // @Helium 0x3C7CC8
export const K_THREE_F32:  number = Math.fround(3.0);   // @Helium 0x3CA2F0
export const K_NINE_F32:   number = Math.fround(9.0);   // @Helium 0x3CEBBC
export const K_FOURTEEN_F32: number = Math.fround(14.0); // @Helium 0x3CEBC0

/** Renderer-facing input interface — matches HGRenderer::GetInput(HGNode*, int). */
export interface HGRendererLike {
  /** HGRenderer::GetInput(HGNode* self, int idx) @Helium (undecoded frontier). Returns the
   *  upstream tile/node the caller feeds into the child's SetInput slot 0. */
  getInput(self: HGGradeDeltaEState, idx: number): unknown;
}

/** Factory hook — HgcGradeDeltaE ctor is a Metal-shader-facade class (frontier callee). */
export interface HgcGradeDeltaEFactory {
  /** HgcGradeDeltaE::HgcGradeDeltaE() @Helium 0x2eb3b0 — HGObject::operator new(0x1a0)
   *  then placement-construct. Returns the freshly-constructed child (refcount 1). */
  newHgcGradeDeltaE(): HgcGradeDeltaEChild;
}

/**
 * HGGradeDeltaE::GetOutput(HGRenderer*)  @Helium 0x0da3e0.
 *
 * Ports the observable behaviour of the 91-line body: allocate + init an HgcGradeDeltaE
 * kernel child, swap it into this+0x1a0 with proper release of the previous child,
 * dispatch its SetParameter with mode-specific coefficients, wire the renderer input into
 * its slot 0, and return the child.
 *
 * Frontier callees (all cited by @0xADDR, none decoded here):
 *   - HGObject::operator new(unsigned long) @Helium 0x?????   (the operator-new stub)
 *   - HgcGradeDeltaE::HgcGradeDeltaE()      @Helium 0x2eb3b0
 *   - HGObject::Release (vtbl *0x18)        @Helium 0x1a0f30
 *   - HgcGradeDeltaE::SetParameter (vtbl *0x60) @Helium 0x2eb6b0
 *   - HGRenderer::GetInput(HGNode*, int)    @Helium 0x????? (imported through renderer)
 *   - HGNode::SetInput (vtbl *0x78)         @Helium 0x11c5f0
 */
export function GetOutput(
  state: HGGradeDeltaEState,
  renderer: HGRendererLike,
  factory: HgcGradeDeltaEFactory,
): HgcGradeDeltaEChild {
  // (1)+(2) Allocate + construct new HgcGradeDeltaE child.                @0x0da3f0..0x0da400
  const fresh = factory.newHgcGradeDeltaE();

  // (3) Swap into this+0x1a0 with release-of-old dance.                    @0x0da405..0x0da433
  const old = state.activeChild;
  if (old !== fresh) {
    // Not the same pointer -> release old (if any), then install new.
    if (old !== null) old.release();                                       // @0x0da419 *0x18
    state.activeChild = fresh;                                             // @0x0da41c
  } else {
    // Same pointer path (@0xda425): still release the freshly-constructed one so refcount
    // does not leak (the ctor gave it retain=1; if it was already installed, we drop the
    // extra reference from the new-and-throw-away). This branch is defensive; a fresh alloc
    // will realistically never equal an existing one. The disasm still emits the Release.
    fresh.release();                                                        // @0xda42d *0x18
  }

  // (4)+(5) Dispatch SetParameter with mode-specific coefficients.         @0x0da433..0x0da4be
  const mode = state.mode | 0;
  const strength = Math.fround(state.strength);
  if (mode === 0) {
    // case 0: broadcast strength to (p0,p1,p2,p3).                         @0xda4a1..0xda4bb
    state.activeChild!.setParameter(0, strength, strength, strength, strength); // @0xda4be
  } else if (mode === 1) {
    // case 1 (default): (strength, 0.5, 1.0, 3.0).                          @0xda473..0xda495
    state.activeChild!.setParameter(0, strength, K_HALF_F32, K_ONE_F32, K_THREE_F32); // @0xda4be
  } else if (mode === 2) {
    // case 2: (strength, 1.0, 9.0, 14.0).                                   @0xda447..0xda469
    state.activeChild!.setParameter(0, strength, K_ONE_F32, K_NINE_F32, K_FOURTEEN_F32); // @0xda4be
  }
  // mode > 2: `jne 0xda4c1` skips the SetParameter dispatch entirely. Child keeps its
  // defaults from HgcGradeDeltaE::C1. This is the "no-op mode" branch @0xda445.

  // (6)+(7) Wire the upstream renderer input into child slot 0.            @0x0da4c1..0x0da4dd
  const upstream = renderer.getInput(state, 0);                            // @0xda4c9
  state.activeChild!.setInput(0, upstream);                                 // @0xda4dd *0x78

  // (8) Return this->activeChild.                                          @0x0da4e0
  return state.activeChild!;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Throwing stubs — the C++ side has base/complete dtor entries the linker keeps distinct
// from D0 (the "deleting" dtor which also frees storage). The DECODED D0 body reads:
//   0x0da340  push %rbp; mov %rsp, %rbp
//   0x0da344  push %rbx; push %rax
//   0x0da346  mov  %rdi, %rbx
//   0x0da349  lea  0x9325c0(%rip), %rax             ; HGGradeDeltaE vtable+0x10 install
//   0x0da350  mov  %rax, (%rdi)                     ; restore vtable pre-base-dtor (canonical)
//   0x0da353  mov  0x1a0(%rdi), %rdi                ; rdi = this->activeChild
//   0x0da35a  test %rdi, %rdi
//   0x0da35d  je   0x0da365                         ; if null skip release
//   0x0da35f  mov  (%rdi), %rax; call *0x18(%rax)   ; child->release() via vtbl *0x18
//   0x0da365  mov  %rbx, %rdi
//   0x0da368  call HGNode::~HGNode()                ; base dtor
//   0x0da370  add $0x8, %rsp; pop %rbx; pop %rbp
//   0x0da376  jmp HGObject::operator delete         ; free storage
// The base/complete dtors (D1/D2 @0xda2c0/@0xda300) share this shape but stop before the
// operator-delete tail. They are throw-stubs here — the vtable install and HGNode base dtor
// are not yet transcribed, so we cannot faithfully port the pre-delete tail.
// ────────────────────────────────────────────────────────────────────────────────────────

/** HGGradeDeltaE::~HGGradeDeltaE()  @Helium 0x0da2c0 (D2 base dtor). */
export function HGGradeDeltaE_D2(): void {
  throw new Error(
    "HGGradeDeltaE::~HGGradeDeltaE() @Helium 0x0da2c0 not yet transcribed — " +
      "requires HGNode::~HGNode() base dtor transcription.",
  );
}

/** HGGradeDeltaE::~HGGradeDeltaE()  @Helium 0x0da300 (D1 complete dtor). */
export function HGGradeDeltaE_D1(): void {
  throw new Error(
    "HGGradeDeltaE::~HGGradeDeltaE() @Helium 0x0da300 not yet transcribed — " +
      "requires HGNode::~HGNode() base dtor transcription.",
  );
}

/** HGGradeDeltaE::~HGGradeDeltaE()  @Helium 0x0da340 (D0 deleting dtor).
 *  Fully decoded above in the header comment; wrapped as a throw-stub here because the
 *  HGObject::operator delete tail and HGNode::~HGNode() callee are un-ported frontier
 *  edges. GetOutput's release-of-old-child path invokes vtbl *0x18 directly and does not
 *  need this entry. */
export function HGGradeDeltaE_D0(state: HGGradeDeltaEState): void {
  // Release the owned kernel child if present (@0x0da353..0x0da362). This portion IS
  // faithful — it maps 1:1 to the vtbl *0x18 dispatch and is testable in isolation.
  if (state.activeChild !== null) {
    state.activeChild.release();
    state.activeChild = null;
  }
  throw new Error(
    "HGGradeDeltaE::~HGGradeDeltaE() @Helium 0x0da340 not yet fully transcribed — " +
      "HGNode::~HGNode() base dtor @Helium (frontier) and HGObject::operator delete " +
      "tail are un-ported.",
  );
}
