// HGRenderCinema — Helium framework
//
// A Helium render-graph node that owns an HGCinematic worker at +0x198
// and forwards setters to it after a dynamic_cast<HGCinematic*> guard.
// Its fxType (+0x1a0) selects a "single-input" vs "two-input" GetOutput
// dispatch.
//
// State layout (recovered from ctor @0xf32e0):
//   +0x000  vtable (from HGNode base)
//   +0x198  HGCinematic* cinematic  (allocated size 0x1d0 @0xf3324/@0xf3352)
//   +0x1a0  int fxType              (stored @0xf330a; used at @0xf36f2 in GetOutput)
//
// Framework: Helium (/Applications/Final Cut Pro.app/.../Helium.framework)
// Mangled ctor (C2): __ZN14HGRenderCinemaC2ENS_6FXTypeE   @0xf32e0
// Mangled ctor (C1): __ZN14HGRenderCinemaC1ENS_6FXTypeE   @0xf3440  (tail-jmps to C2)
// Mangled dtor (D2): __ZN14HGRenderCinemaD2Ev             @0xf37c0
// Mangled dtor (D0): __ZN14HGRenderCinemaD0Ev             @0xf3800

// --- forward types & un-decoded external callees ---

/** HGNode base class — opaque. Only its vtable ptr at +0x0 and ~HGNode/HGNode ctor are touched. */
export interface HGNode {
  __vtable: unknown;
}

/** HGCinematic worker owned by HGRenderCinema at +0x198.
 *  Size 0x1d0 (from @0xf3324 `mov $0x1d0, %edi` + `HGObject::operator new(0x1d0)`).
 *  Its vtable slot +0x18 is the standard dtor thunk (called from @0xf334d/@0xf381f).
 *  Its vtable slot +0x78 is the per-input render dispatch (called from
 *  @0xf36ef and @0xf3720 in GetOutput). */
export interface HGCinematic {
  __vtable: {
    /** vtable +0x18: dtor thunk */
    slot_0x18: (self: HGCinematic) => void;
    /** vtable +0x78: per-input render entry (self, inputIndex, input) */
    slot_0x78: (self: HGCinematic, inputIndex: number, input: unknown) => void;
  };
}

/** HGRenderer — pipeline scheduler. Only GetInput is called. */
export interface HGRenderer { __opaque: true; }

/** __CFString — CoreFoundation string, opaque here (only passed through to setTransferFunction). */
export interface __CFString { __opaque: true; }

/** CN framework types (Apple Cinematic) — opaque; only passed through. */
export interface CNRenderingSessionAttributes { __opaque: true; }
export interface CNRenderingSessionFrameAttributes { __opaque: true; }

/** HGNode::HGNode() ctor — base subobject setup. Not yet transcribed. (called from @0xf32f0) */
function HGNode_ctor(_self: HGRenderCinema): void {
  throw new Error("HGNode::HGNode() @0x?? (call site @0xf32f0) not yet transcribed");
}

/** HGNode::~HGNode() — base subobject teardown. Not yet transcribed. (called from @0xf3421 in ctor cleanup, and D0 @0xf3828) */
function HGNode_dtor(_self: HGRenderCinema): void {
  throw new Error("HGNode::~HGNode() @0x?? (call sites @0xf3421, @0xf3828) not yet transcribed");
}

/** HGCinematic::HGCinematic() ctor — worker default ctor. Not yet transcribed. (called @0xf3334, @0xf3362) */
function HGCinematic_ctor(_self: HGCinematic): void {
  throw new Error("HGCinematic::HGCinematic() @0x?? (call sites @0xf3334, @0xf3362) not yet transcribed");
}

/** HGCinematic::setAperture(float) — real setter on the worker. Not yet transcribed. (tail-called from SetAperture @0xf3561 and SetFXParameter@type=0 @0xf349d) */
function HGCinematic_setAperture(_self: HGCinematic, _v: number): void {
  throw new Error("HGCinematic::setAperture(float) @0x?? (call sites @0xf3561, @0xf349d) not yet transcribed");
}

/** HGCinematic::setFocusDistance(float). Not yet transcribed. (@0xf35c1, @0xf34da) */
function HGCinematic_setFocusDistance(_self: HGCinematic, _v: number): void {
  throw new Error("HGCinematic::setFocusDistance(float) @0x?? (call sites @0xf35c1, @0xf34da) not yet transcribed");
}

/** HGCinematic::SetRenderQuality(int). Not yet transcribed. (@0xf3629) */
function HGCinematic_SetRenderQuality(_self: HGCinematic, _q: number): void {
  throw new Error("HGCinematic::SetRenderQuality(int) @0x?? (call site @0xf3629) not yet transcribed");
}

/** HGCinematic::setTransferFunction(__CFString const*). Not yet transcribed. (@0xf368b) */
function HGCinematic_setTransferFunction(_self: HGCinematic, _s: __CFString): void {
  throw new Error("HGCinematic::setTransferFunction(__CFString const*) @0x?? (call site @0xf368b) not yet transcribed");
}

/** HGCinematic::SetCinematicInfo(CNRenderingSessionAttributes*, CNRenderingSessionFrameAttributes*). Not yet transcribed. (@0xf37a0) */
function HGCinematic_SetCinematicInfo(_self: HGCinematic, _a: CNRenderingSessionAttributes, _b: CNRenderingSessionFrameAttributes): void {
  throw new Error("HGCinematic::SetCinematicInfo @0x?? (call site @0xf37a0) not yet transcribed");
}

/** HGCinematic::ClearCachePipelines() — static-style call (no dynamic_cast on this-side). Not yet transcribed. (tail-called @0xf3755) */
function HGCinematic_ClearCachePipelines(): void {
  throw new Error("HGCinematic::ClearCachePipelines() @0x?? (call site @0xf3755) not yet transcribed");
}

/** HGRenderer::GetInput(HGNode*, int) — same signature as in HGInterlaceHandler_InterlaceFields.
 *  Called from GetOutput @0xf36df (idx=0) and @0xf370d (idx=1). Not yet transcribed. */
function HGRenderer_GetInput(_r: HGRenderer, _node: HGRenderCinema, _idx: number): unknown {
  throw new Error("HGRenderer::GetInput(HGNode*, int) @0x?? (call sites @0xf36df, @0xf370d) not yet transcribed");
}

/** HGObject::operator new(unsigned long). Not yet transcribed. (@0xf3329, @0xf3357) */
function HGObject_operator_new(_size: number): HGCinematic {
  throw new Error("HGObject::operator new(unsigned long) @0x?? (call sites @0xf3329, @0xf3357) not yet transcribed");
}

/** HGObject::operator delete(void*). Not yet transcribed. (tail-called from D0 @0xf3836, and used in ctor cleanup @0xf3400) */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error("HGObject::operator delete(void*) @0x?? (call sites @0xf3400, @0xf3836) not yet transcribed");
}

/** HGLogger::warning(const char*, ...) — variadic logger. Not yet transcribed. First call site @0xf356f (SetAperture warning path). */
function HGLogger_warning(_fmt: string): void {
  throw new Error("HGLogger::warning(const char*, ...) not yet transcribed (first call site @0xf356f in HGRenderCinema::SetAperture)");
}

/** HGLogger::error(const char*, ...) — variadic logger. Not yet transcribed. First call site @0xf331f (ctor error log). */
function HGLogger_error(_fmt: string): void {
  throw new Error("HGLogger::error(const char*, ...) not yet transcribed (first call site @0xf331f in HGRenderCinema ctor; also @0xf34ed in SetFXParameter)");
}

/**
 * dynamic_cast<HGCinematic*>(HGNode* src)
 *
 * Every setter in this class uses the Itanium ABI
 *   __dynamic_cast(src, srcType=HGNode, dstType=HGCinematic, hint=0)
 * The runtime returns non-null if `src` is (or contains) an HGCinematic
 * subobject, else null. For HGRenderCinema this always succeeds because
 * `cinematic` was constructed as `HGCinematic` directly (@0xf3334/@0xf3362).
 * We model the runtime cast as identity + null-guard on the pointer we
 * stored, so a null cinematic is still rejected (matching the je-fallthrough
 * to the logger path in each setter).
 *
 * Not fully transcribed — call sites: @0xf3549, @0xf35a9, @0xf3614, @0xf3486,
 * @0xf34c3, @0xf3675, @0xf3789.
 */
function dynamic_cast_HGCinematic(src: HGCinematic | null): HGCinematic | null {
  // Runtime dynamic_cast @0x3c5018 not yet transcribed; for HGRenderCinema the
  // stored pointer is already an HGCinematic (ctor allocates one), so the
  // cast is guaranteed to return `src` unchanged. Any null is preserved.
  return src;
}

/**
 * HGRenderCinema::FXType — enum passed to the constructor. From the ctor
 * disasm @0xf3311 the value is stored raw into +0x1a0 as a 32-bit int and
 * then tested for zero. From SetFXParameter @0xf3458–@0xf345f the "FX
 * Parameter" enum has values 0 (aperture) and 1 (focus distance); any
 * other value logs an error. These are separate enums but share the same
 * integer discriminator style.
 */
export enum HGRenderCinemaFXType {
  /** Value 0 — takes the second (else) branch in ctor @0xf3352. Two-input GetOutput. */
  Kind_0 = 0,
  /** Any non-zero value logs "Render FX Type not specified" then follows the
   *  same allocation path as Kind_0 (just after the error log). @0xf3316–@0xf3352. */
  Kind_NonZero = 1,
}

/** HGRenderCinema::ParamType — SetFXParameter selector, per @0xf3458–@0xf345f. */
export enum HGRenderCinemaParamType {
  /** 0 -> setAperture branch */
  Aperture = 0,
  /** 1 -> setFocusDistance branch */
  FocusDistance = 1,
}

// --- the ported class ---

/**
 * HGRenderCinema
 *
 * Ported addresses (all Helium):
 *   ctor (C2)              @0xf32e0
 *   ctor (C1)              @0xf3440  (tail-jmps to C2)
 *   dtor (D0)              @0xf3800
 *   SetAperture            @0xf3520
 *   SetDisplayMode         @0xf36b0  (no-op)
 *   SetFXParameter         @0xf3450
 *   SetCinematicInfo       @0xf3760
 *   SetFocusDistance       @0xf3580
 *   SetRenderQuality       @0xf35f0
 *   ClearCachePipeline     @0xf3750  (tail-jmps to HGCinematic::ClearCachePipelines)
 *   SetRenderDisparity     @0xf35e0  (no-op)
 *   SetTransferFunction    @0xf3650
 *   SetSingleChannelDepthConversion @0xf3740 (no-op)
 *   GetOutput              @0xf36c0
 */
export class HGRenderCinema implements HGNode {
  /** +0x000 vtable pointer, set in ctor @0xf32f5/@0xf32fc. Opaque here. */
  public __vtable: unknown = null;

  /** +0x198 owned HGCinematic (nullable during ctor error paths, always non-null on success). */
  public cinematic: HGCinematic | null = null;

  /** +0x1a0 fxType, stored raw from the ctor argument @0xf330a `movl %r14d, 0x1a0(%rbx)`. */
  public fxType: number = 0;

  /**
   * Constructor(HGRenderCinema::FXType fxType) — @0xf32e0
   *
   * Instruction transcription (main successful path):
   *   @0xf32f0  call HGNode::HGNode()                             — base ctor
   *   @0xf32f5  lea  0x91eedc(%rip), %rax                          — vtable literal
   *   @0xf32fc  mov  %rax, (%rbx)                                  — this->__vtable = ...
   *   @0xf32ff  movq $0, 0x198(%rbx)                               — this->cinematic = nullptr
   *   @0xf330a  movl %r14d, 0x1a0(%rbx)                            — this->fxType = fxType
   *   @0xf3311  test %r14d, %r14d
   *   @0xf3314  je   @0xf3352   ; fxType == 0 -> jump to normal path
   *   ; fxType != 0 -> log an error first, then follow the same alloc pattern
   *   @0xf3316  lea  "HGRenderCinema : Render FX Type not specified in initialization of node."
   *   @0xf331f  call HGLogger::error
   *   @0xf3324  mov  $0x1d0, %edi
   *   @0xf3329  call HGObject::operator new(0x1d0)     ; allocate 0x1d0
   *   @0xf3334  call HGCinematic::HGCinematic()        ; construct in place
   *   @0xf3339  mov  0x198(%rbx), %rdi                 ; existing cinematic (should be null)
   *   @0xf3340  cmp  %r14, %rdi                        ; if same, skip dtor
   *   @0xf3343  je   ...                               ; (branch skipped for null case)
   *   @0xf3345  test %rdi, %rdi                        ; if existing is null, skip dtor
   *   @0xf3348  je   @0xf337e
   *   @0xf334a  mov  (%rdi), %rax                      ; else call existing.vtable[+0x18](existing)
   *   @0xf334d  call *0x18(%rax)
   *   @0xf3350  jmp  @0xf337e
   *   @0xf337e  mov  %r14, 0x198(%rbx)                 ; this->cinematic = new one
   *   ; ret
   *   ; NORMAL PATH (fxType == 0, @0xf3352):
   *   @0xf3352  mov  $0x1d0, %edi
   *   @0xf3357  call HGObject::operator new(0x1d0)
   *   @0xf3362  call HGCinematic::HGCinematic()
   *   @0xf3367..@0xf337e : same swap-and-delete as above (existing at +0x198 is null,
   *                        so the dtor branch is skipped)
   *   @0xf337e  mov  %r14, 0x198(%rbx)                 ; this->cinematic = new one
   *
   * Both branches end up at the same store; the only difference is the error log.
   */
  constructor(fxType: HGRenderCinemaFXType) {
    HGNode_ctor(this);
    this.__vtable = "HGRenderCinema::vtable @rip+0x91eedc (from @0xf32f5)";
    this.cinematic = null;                    // @0xf32ff
    this.fxType = (fxType | 0);                // @0xf330a (32-bit int store)

    // fxType != 0 path logs an error first (@0xf3316–@0xf331f).
    if (this.fxType !== 0) {
      HGLogger_error("HGRenderCinema : Render FX Type not specified in initialization of node.");
    }

    // Both paths then allocate + ctor a fresh HGCinematic and install it at +0x198.
    // The swap-and-delete for a pre-existing +0x198 is dead code here (we just
    // wrote null above @0xf32ff), but we transcribe it faithfully anyway.
    const fresh = HGObject_operator_new(0x1d0);
    HGCinematic_ctor(fresh);

    const existing = this.cinematic as HGCinematic | null;
    if (existing !== fresh) {
      if (existing !== null) {
        existing.__vtable.slot_0x18(existing);   // @0xf334d / @0xf337b: existing->vtable[+0x18](existing)
      }
    }
    this.cinematic = fresh;                    // @0xf337e
  }

  /**
   * Deleting destructor (D0) — @0xf3800
   *
   * Instruction transcription:
   *   @0xf3809  lea  0x91e9c8(%rip), %rax
   *   @0xf3810  mov  %rax, (%rdi)                     ; reset this->__vtable
   *   @0xf3813  mov  0x198(%rdi), %rdi                ; rdi = cinematic
   *   @0xf381a  test %rdi, %rdi
   *   @0xf381d  je   @0xf3825
   *   @0xf381f  mov  (%rdi), %rax
   *   @0xf3822  call *0x18(%rax)                      ; cinematic->vtable[+0x18](cinematic)
   *   @0xf3825  mov  %rbx, %rdi
   *   @0xf3828  call HGNode::~HGNode()                ; base dtor
   *   @0xf3836  jmp  __ZN8HGObjectdlEPv               ; ::operator delete(this)  (tail)
   */
  destructor_D0(): void {
    this.__vtable = "HGRenderCinema::vtable-in-D0 @rip+0x91e9c8 (from @0xf3809)";
    const c = this.cinematic;
    if (c !== null) {
      c.__vtable.slot_0x18(c);
    }
    HGNode_dtor(this);
    HGObject_operator_delete(this);
  }

  /**
   * SetAperture(float v) — @0xf3520
   *
   * Instruction transcription:
   *   @0xf3520  mov   0x198(%rdi), %rdi              ; rdi = this->cinematic
   *   @0xf3527  test  %rdi, %rdi
   *   @0xf352a  je    @0xf3566                       ; null -> warning path
   *   @0xf3534  lea   HGNode typeinfo               ; srcType
   *   @0xf353b  lea   HGCinematic typeinfo          ; dstType
   *   @0xf3542  xor   %ecx, %ecx                    ; hint = 0
   *   @0xf3549  call  __dynamic_cast
   *   @0xf3553  test  %rax, %rax
   *   @0xf355c  je    @0xf3566                       ; cast failed -> warning
   *   @0xf3561  jmp   HGCinematic::setAperture(f)   ; tail-call
   *   @0xf3566  lea   "HGRenderCinema : Aperture not set."
   *   @0xf356f  jmp   HGLogger::warning
   */
  SetAperture(v: number): void {
    const c = this.cinematic;
    if (c === null) { HGLogger_warning("HGRenderCinema : Aperture not set."); return; }
    const casted = dynamic_cast_HGCinematic(c);
    if (casted === null) { HGLogger_warning("HGRenderCinema : Aperture not set."); return; }
    HGCinematic_setAperture(casted, Math.fround(v));
  }

  /**
   * SetFocusDistance(float v) — @0xf3580
   *
   * Instruction transcription: identical structure to SetAperture but the
   * tail-call is HGCinematic::setFocusDistance (@0xf35c1) and the warning
   * string is "HGRenderCinema : Focus distance not set." (@0xf35c6).
   */
  SetFocusDistance(v: number): void {
    const c = this.cinematic;
    if (c === null) { HGLogger_warning("HGRenderCinema : Focus distance not set."); return; }
    const casted = dynamic_cast_HGCinematic(c);
    if (casted === null) { HGLogger_warning("HGRenderCinema : Focus distance not set."); return; }
    HGCinematic_setFocusDistance(casted, Math.fround(v));
  }

  /**
   * SetRenderQuality(int q) — @0xf35f0
   *
   * Same dynamic_cast + warn-or-tail-call pattern (int arg saved in ebx across
   * the cast @0xf3602 / restored @0xf3621).
   * Warning string @0xf362e: "HGRenderCinema : Render quality not set."
   */
  SetRenderQuality(q: number): void {
    const c = this.cinematic;
    if (c === null) { HGLogger_warning("HGRenderCinema : Render quality not set."); return; }
    const casted = dynamic_cast_HGCinematic(c);
    if (casted === null) { HGLogger_warning("HGRenderCinema : Render quality not set."); return; }
    HGCinematic_SetRenderQuality(casted, q | 0);
  }

  /**
   * SetTransferFunction(__CFString const* s) — @0xf3650
   *
   * Same pattern; ptr arg saved in rbx (@0xf3662 / @0xf3682).
   * Warning string @0xf3690: "HGRenderCinema : Transfer function not set."
   */
  SetTransferFunction(s: __CFString): void {
    const c = this.cinematic;
    if (c === null) { HGLogger_warning("HGRenderCinema : Transfer function not set."); return; }
    const casted = dynamic_cast_HGCinematic(c);
    if (casted === null) { HGLogger_warning("HGRenderCinema : Transfer function not set."); return; }
    HGCinematic_setTransferFunction(casted, s);
  }

  /**
   * SetCinematicInfo(CNRenderingSessionAttributes*, CNRenderingSessionFrameAttributes*) — @0xf3760
   *
   * Same pattern with two saved ptr args (r14=first @0xf3776, rbx=second @0xf3773).
   * Warning string @0xf37a5: "HGRenderCinema : SetCinematicInfo not set"
   */
  SetCinematicInfo(a: CNRenderingSessionAttributes, b: CNRenderingSessionFrameAttributes): void {
    const c = this.cinematic;
    if (c === null) { HGLogger_warning("HGRenderCinema : SetCinematicInfo not set"); return; }
    const casted = dynamic_cast_HGCinematic(c);
    if (casted === null) { HGLogger_warning("HGRenderCinema : SetCinematicInfo not set"); return; }
    HGCinematic_SetCinematicInfo(casted, a, b);
  }

  /**
   * SetFXParameter(ParamType type, float value) — @0xf3450
   *
   * Instruction transcription (dispatch table):
   *   @0xf3458  cmp  $0x1, %esi
   *   @0xf345b  je   @0xf34a2                              ; type == 1 -> FocusDistance path
   *   @0xf345d  test %esi, %esi
   *   @0xf345f  jne  @0xf34df                              ; type != 0 && != 1 -> error path
   *   ; APERTURE PATH (type == 0), @0xf3461–@0xf349d:
   *   ; identical to SetAperture (dynamic_cast + tail-jmp HGCinematic::setAperture)
   *   ; FOCUS DISTANCE PATH (type == 1), @0xf34a2–@0xf34da:
   *   ; identical to SetFocusDistance (dynamic_cast + tail-jmp HGCinematic::setFocusDistance)
   *   ; ERROR PATH @0xf34df: logs
   *   ;   "HGRenderCinema : Valid FX Parameter type not provided while setting parameter value."
   *   ;   via HGLogger::error
   *
   * The warning strings on failing dynamic_cast paths differ:
   *   @0xf34f2 -> "HGRenderCinema : Aperture not set."       (type == 0)
   *   @0xf3505 -> "HGRenderCinema : Focus distance not set." (type == 1)
   */
  SetFXParameter(type: HGRenderCinemaParamType, value: number): void {
    if (type === 1) {
      // FOCUS DISTANCE path (@0xf34a2)
      const c = this.cinematic;
      if (c === null) { HGLogger_warning("HGRenderCinema : Focus distance not set."); return; }
      const casted = dynamic_cast_HGCinematic(c);
      if (casted === null) { HGLogger_warning("HGRenderCinema : Focus distance not set."); return; }
      HGCinematic_setFocusDistance(casted, Math.fround(value));
      return;
    }
    if (type !== 0) {
      // ERROR path (@0xf34df)
      HGLogger_error("HGRenderCinema : Valid FX Parameter type not provided while setting parameter value.");
      return;
    }
    // APERTURE path (type == 0) @0xf3461
    const c = this.cinematic;
    if (c === null) { HGLogger_warning("HGRenderCinema : Aperture not set."); return; }
    const casted = dynamic_cast_HGCinematic(c);
    if (casted === null) { HGLogger_warning("HGRenderCinema : Aperture not set."); return; }
    HGCinematic_setAperture(casted, Math.fround(value));
  }

  /**
   * SetDisplayMode(int) — @0xf36b0
   *
   * Instruction transcription: `push rbp; mov rbp,rsp; pop rbp; ret`.
   * A REAL no-op — the argument is ignored. Kept as a distinct method to
   * preserve the FCP class boundary (this WAS a method with an int arg,
   * even if the body is empty).
   */
  SetDisplayMode(_mode: number): void {
    // no-op (@0xf36b0)
  }

  /**
   * SetRenderDisparity() — @0xf35e0
   *
   * Instruction transcription: `push rbp; mov rbp,rsp; pop rbp; ret`.
   * Real no-op.
   */
  SetRenderDisparity(): void {
    // no-op (@0xf35e0)
  }

  /**
   * SetSingleChannelDepthConversion() — @0xf3740
   *
   * Instruction transcription: `push rbp; mov rbp,rsp; pop rbp; ret`.
   * Real no-op.
   */
  SetSingleChannelDepthConversion(): void {
    // no-op (@0xf3740)
  }

  /**
   * ClearCachePipeline() — @0xf3750
   *
   * Instruction transcription:
   *   @0xf3750..@0xf3754  standard prologue/epilogue
   *   @0xf3755  jmp  HGCinematic::ClearCachePipelines()
   *
   * Tail-jmp to the WORKER-CLASS-LEVEL (static) function on HGCinematic;
   * NO dynamic_cast, NO instance receiver — it's called with whatever %rdi
   * was on entry (which is `this`, but HGCinematic::ClearCachePipelines
   * takes no arguments in its mangling). We model as a static call.
   */
  ClearCachePipeline(): void {
    HGCinematic_ClearCachePipelines();
  }

  /**
   * GetOutput(HGRenderer* renderer) — @0xf36c0
   *
   * Instruction transcription:
   *   @0xf36d0  mov   0x198(%rdi), %r15                    ; r15 = this->cinematic
   *   @0xf36df  call  HGRenderer::GetInput(renderer, this, 0)
   *   @0xf36e4  mov   (%r15), %rcx                          ; rcx = cinematic->__vtable
   *   @0xf36ea  xor   %esi, %esi                            ; inputIndex = 0
   *   @0xf36ec  mov   %rax, %rdx                            ; input0
   *   @0xf36ef  call  *0x78(%rcx)                           ; cinematic->vtable[+0x78](cinematic, 0, input0)
   *   @0xf36f2  cmpl  $0x0, 0x1a0(%rbx)
   *   @0xf36f9  jne   @0xf3723                              ; fxType != 0 -> skip second input
   *   ; fxType == 0: fetch and dispatch input 1 as well
   *   @0xf36fb  mov   0x198(%rbx), %r15                     ; reload r15 = cinematic
   *   @0xf370d  call  HGRenderer::GetInput(renderer, this, 1)
   *   @0xf3712  mov   (%r15), %rcx
   *   @0xf3718  mov   $0x1, %esi                            ; inputIndex = 1
   *   @0xf371d  mov   %rax, %rdx
   *   @0xf3720  call  *0x78(%rcx)
   *   @0xf3723  mov   0x198(%rbx), %rax                     ; return this->cinematic
   *
   * i.e.
   *   worker = this->cinematic;
   *   worker.vtable_0x78(worker, 0, renderer.GetInput(this, 0));
   *   if (this->fxType == 0)
   *     worker.vtable_0x78(worker, 1, renderer.GetInput(this, 1));
   *   return this->cinematic;
   *
   * NOTE: r15 is reloaded from +0x198 at @0xf36fb before the second call — the
   * same defensive reload pattern as HGInterlaceHandler_InterlaceFields.
   */
  GetOutput(renderer: HGRenderer): HGCinematic {
    if (this.cinematic === null) {
      throw new Error("HGRenderCinema::GetOutput @0xf36c0: cinematic at +0x198 is null (ctor invariant violated)");
    }
    const worker0 = this.cinematic;
    const input0 = HGRenderer_GetInput(renderer, this, 0);
    worker0.__vtable.slot_0x78(worker0, 0, input0);

    if (this.fxType === 0) {
      // reload (defensive) @0xf36fb
      if (this.cinematic === null) {
        throw new Error("HGRenderCinema::GetOutput @0xf36fb: cinematic became null between input dispatches (invariant violated)");
      }
      const worker1 = this.cinematic;
      const input1 = HGRenderer_GetInput(renderer, this, 1);
      worker1.__vtable.slot_0x78(worker1, 1, input1);
    }

    // reload @0xf3723 — return this->cinematic
    if (this.cinematic === null) {
      throw new Error("HGRenderCinema::GetOutput @0xf3723: cinematic became null before return (invariant violated)");
    }
    return this.cinematic;
  }
}
