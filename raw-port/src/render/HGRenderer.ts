// raw-port/src/render/HGRenderer.ts
//
// FCP `HGRenderer` — Helium's render-graph *facade* / execution context. Every
// HGNode.GetOutput / GetDOD / GetROI / GetProgram / Render... call is dispatched
// through this class; the entire compositor pipeline (Metal/AVX/CPU/GPU) plugs
// into a concrete subclass (`HGRendererCPU`, `HGRendererMetal`, ...) whose vtable
// installs the target-specific renderers. Almost every downstream HGNode/Hgc*
// class references `HGRenderer*` as its execution context, so decoding this
// base is the highest-leverage single unlock in the tree.
//
// Symbols decoded here (Helium, x86_64 slice; file offset 0x4000; VAs below are
// unadjusted VM addresses from `otool -tV`). Full ledger addresses are also
// listed in raw-port/army/ledger/Helium.ledger.json under the "HGRenderer" key.
//
//   0x000e9990  HGRenderer::label() const                              (FULL)
//   0x000e9af0  HGRenderer::debugDescription() const                   (FULL)
//   0x000e9b10  HGRenderer::IsCPU() const              [returns true]  (FULL)
//   0x000e9b20  HGRenderer::RenderFullROI_Default() const  [true]      (FULL)
//   0x000ea390  HGRenderer::GetParameter(HGRendererParameter)  (jump-table decoded)
//   0x000ea5a0  HGRenderer::GetTarget(unsigned int)            (FULL structural)
//   0x000ea5e0  HGRenderer::GetLastError()                     (FULL)
//   0x000ec280  HGRenderer::GetOutputFormat(HGNode*)   (structural; throws for HGFormatUtils calls)
//   0x000ed770  HGRenderer::GetDOD(HGNode*)            (cached-path FULL; cold-path stub @0xADDR)
//   0x000f1ff0  HGRenderer::GetOutput(HGNode*)         (cached-path FULL; cold-path stub @0xADDR)
//   0x000f2be0  HGRenderer::GetLimits(unsigned int)            (FULL)
//   0x000f2d40  HGRenderer::GetROI(HGNode*)            (cached-path FULL)
//   0x000f2d80  HGRenderer::GetFlags(HGNode*, int)             (FULL)
//   0x000f2dd0  HGRenderer::GetInput(HGNode*, int)             (FULL — tail-jmp to GetOutput)
//   0x000ef3e0  HGRenderer::SetOwningRenderQueue(HGRenderQueue*)       (FULL)
//
// STRUCT LAYOUT (recovered from accessor asm — every offset cited @0xADDR
// on the field it belongs to):
//   HGRenderer {
//     +0x000  vptr
//     +0x008..0x23c ...HGObject/base fields, ExternalResource, DepthManager, etc.
//     +0x120  pthread_rwlock_t             [RenderCheckPoint @0xea603 leaq]
//     +0x240  u32   pixelFormat            [GetOutputFormat @0xec295; GetParameter #1 @0xea3b7]
//     +0x244  u32   param_244              [GetParameter #10 @0xea401]
//     +0x248  u32   param_248              [GetParameter #0  @0xea3af]
//     +0x24c  u32   width                  [GetParameter #17 @0xea442; #23 @0xea478 imul]
//     +0x250  u32   height                 [GetParameter #11 @0xea409; #23 @0xea472 imul]
//     +0x254  u32   param_254              [GetParameter #14 @0xea426]
//     +0x258  u32   param_258              [GetParameter #18 @0xea44a]
//     +0x25c  u32   param_25c              [GetParameter #19 @0xea452]
//     +0x260  u32   param_260              [GetParameter #29 @0xea491]
//     +0x264  u32   param_264              [GetParameter #28 @0xea489]
//     +0x268  u32   param_268              [GetParameter #6  @0xea3e1]
//     +0x26c  u32   param_26c              [GetParameter #15 @0xea42e]
//     +0x274  u32   param_274              [GetParameter #27 @0xea481]
//     +0x27c  u32   param_27c              [GetParameter #9  @0xea3f9;
//                                           RenderCheckPoint result @0xea61c]
//     +0x280  u32   param_280              [GetParameter #3  @0xea3c7;
//                                           RenderCheckPoint gate @0xea5fa]
//     +0x284  u32   param_284              [GetParameter #20 @0xea45a]
//     +0x288  u32   param_288              [GetParameter #21 @0xea462]
//     +0x28c  u32   param_28c              [GetParameter #31 @0xea4a1]
//     +0x294  u32   param_294              [GetParameter #30 @0xea499]
//     +0x298  u32   param_298              [GetParameter #2  @0xea3bf]
//     +0x29c  u32   param_29c              [GetParameter #8  @0xea3f1]
//     +0x2a0  u32   param_2a0              [GetParameter #16 @0xea436]
//     +0x2a4  u32   param_2a4              [GetParameter #33 @0xea4b1]
//     +0x2a8  u32   param_2a8              [GetParameter #7  @0xea3e9]
//     +0x2ac  u32   param_2ac              [GetParameter #12 @0xea411]
//     +0x2b0  u32   param_2b0              [GetParameter #22 @0xea46a]
//     +0x330  HGLimits* limits_60000       [GetTarget @0xea5bd; GetLimits @0xf2bff; GetParameter #4 @0xea3cf; #13 @0xea419]
//     +0x338  HGLimits* limits_50000       [GetTarget @0xea5b6; GetLimits @0xf2bf4]
//     +0x340  u32   param_340              [GetParameter #32 @0xea4a9]
//     +0x3f8  u32   rendererNumber         [label @0xe99ca — used in "Renderer #%u"]
//     +0x418  u32   lastError              [GetLastError @0xea5e4]
//     +0x430  u32   float_env              [GetParameter #34 @0xea4b9 — cmp with 0x9fc0 / 0x1f80]
//   }
//
// VTABLE SLOT MAP (inferred from the calls made through *(this+N) — every
// slot cited @0xADDR of the call-site that reveals it):
//   *0x28  = subclass "labelImpl()"     [debugDescription @0xe9afc]
//   *0x30  = subclass "renderNodeName"  [GetOutput dead-log @0xf20fd]
//   *0xb0  = "onOutputPromoted(HGNode*)"[GetOutput @0xf219b]
//   *0x128 = subclass "packFormat(HGFormat)" [GetOutputFormat @0xec29e]
//   *0x130 = "IsCPU()" virtual          [label @0xe99f6]
//   *0x158 = node "hasCompatibleOutput" [GetOutput @0xf203b / @0xf2053 — on HGNode]
//   *0x160 = node "adoptCollapsedInput" [GetOutput @0xf208d — on HGNode]
//   *0x178 = node "computeDodForInput"  [GetDOD @0xed807 / @0xed85f — on HGNode]
//
// TARGET-ID BITFIELD SEMANTICS (decoded from GetTarget @0xea5a0 + downstream
// comparisons against 0x60b10, 0x4700000, 0x60000, 0x50000):
//
//   Selector arg (input to GetTarget):
//     0        → return *g_target                 ; process-wide "current default"
//     0x60000  → return HGLimits[+0x330]->target  ; GPU / Metal family
//     0x50000  → return HGLimits[+0x338]->target  ; CPU / secondary family
//     other    → 0
//
//   Returned target-id (u32 read from HGLimits+0):
//     bits 20..23 (mask 0x00f00000) = major backend class
//                                      0x0 = null/CPU fallback
//                                      0x4 = software/AVX  (0x4700000 constant)
//                                      0x6 = GPU/Metal      (0x60000/0x60b10)
//     bits 16..19 (mask 0x000f0000) = variant/major-family
//                                      0x0 = base target for this backend
//                                      0xb = Metal device variant
//     bits 8..15  (mask 0x0000ff00) = capability level
//     bits 0..7   (mask 0x000000ff) = minor id
//
//   Concrete tags observed in downstream stubs:
//     0x60b10   Metal GPU device variant b (post-Apple-Silicon-M2 lineage)
//     0x60000   Metal generic base
//     0x4700000 software/AVX-capable CPU renderer
//     0x50000   secondary CPU family (used by tile/software backends)
//
// DECODE-DON'T-FIT: every field, offset, virtual slot, and constant above is
// decoded from the exact address cited. Un-decoded methods below raise a
// citing error so downstream files see a loud gap, not a silent zero.
// Per PORTING_SPEC.md Rules 2, 3, 6.

import type { HGNode } from "./HGNode";

// ---------------------------------------------------------------------------
// Opaque handles for cross-module references. These are branded types so a
// downstream module can hold an `HGRendererPtr` without importing the whole
// class. Ports of the actual concrete renderer subclasses (HGRendererCPU/Metal)
// will land later and provide the real backing object.
// ---------------------------------------------------------------------------

/** Handle to `HGLimits*` — the framework's per-target limits POD.
 *
 *  Only the leading u32 has a decoded reader on this file: GetTarget @0xea5d3
 *  loads `*(u32*)HGLimits+0`, which is the target-id tag itself. Downstream
 *  call-sites (HgcBT2100_HLG_OETF, HGLensDistort_distort_kernel, ...) compare
 *  it against constants like 0x60b10 (Metal fragment 1.0) or 0x4700000
 *  (software/AVX). Additional HGLimits fields (texturerect, tile sizes, ...)
 *  will be pinned when their reader methods are ported.
 *
 *  Kept as a nominal-branded object so downstream code can hold an
 *  `HGLimitsPtr` opaquely, but the `target` field is real (decoded from
 *  @0xea5d3). */
export interface HGLimitsPtr {
  readonly __brand: "HGLimits";
  /** @Helium HGLimits +0x00 — u32 target-id tag (loaded by GetTarget
   *  @0xea5d3 `movl (%rax),%eax`, also by GetParameter #4 @0xea3cf). */
  target: number;
}

/** Module-scope Helium `static int g_target` at 0x0000000000addd58
 *  (nm: `__ZL8g_target`), zero-initialized. Read by
 *  `HGRenderer::GetTarget(0)` @0xea5c8/@0xea5cf.
 *
 *  Exposed as a mutable module-scope holder so the (not-yet-transcribed)
 *  Helium module-ctor that installs the process-wide default target can
 *  update it without breaking the GetTarget port. Concrete FCP renders
 *  observe this as 0 until the ctor runs. */
export const HGRenderer_g_target: { value: number } = { value: 0 };

/** Opaque handle to `HGRect` — a 16-byte {x,y,w,h} u32 quad in the C++ ABI
 *  (per GetROI @0xf2d6a — `leaq 0xa8(%rax),%rcx / addq $0xb0,%rax`). */
export type HGRect = { x: number; y: number; w: number; h: number };

/** HGFormat is a u32 in the C++ ABI (per GetOutputFormat @0xec295). */
export type HGFormat = number;

// ---------------------------------------------------------------------------
// HGRendererParameter enum (partial). Values recovered from the jump-table
// dispatch in GetParameter @0xea3a0 — each name annotates the offset that
// index reads. The upper bound is 0x2e per the `cmpl $0x2e,%esi` at @0xea394
// (47 entries). Names are inferred from the offset each entry reads; concrete
// enum symbol names are not in the Helium demangled symbols.
// ---------------------------------------------------------------------------
export const HGRendererParameter = {
  /** @0xea3af — returns *(u32*)(this+0x248) */
  Kind: 0,
  /** @0xea3b7 — returns *(u32*)(this+0x240) — output pixel format */
  PixelFormat: 1,
  /** @0xea3bf — returns *(u32*)(this+0x298) */
  Param2: 2,
  /** @0xea3c7 — returns *(u32*)(this+0x280) */
  Param3: 3,
  /** @0xea3cf — returns *((HGLimits**)(this+0x330))->target */
  Target60000: 4,
  /** @0xea3da — returns hard-coded 0x2000 (TileSize?) */
  TileSizeConst: 5,
  /** @0xea3e1 — returns *(u32*)(this+0x268) */
  Param6: 6,
  /** @0xea3e9 — returns *(u32*)(this+0x2a8) */
  Param7: 7,
  /** @0xea3f1 — returns *(u32*)(this+0x29c) */
  Param8: 8,
  /** @0xea3f9 — returns *(u32*)(this+0x27c) */
  Param9: 9,
  /** @0xea401 — returns *(u32*)(this+0x244) */
  Param10: 10,
  /** @0xea409 — returns *(u32*)(this+0x250) — height */
  Height: 11,
  /** @0xea411 — returns *(u32*)(this+0x2ac) */
  Param12: 12,
  /** @0xea419 — tail-jmp HGLimits::texturerect on *(this+0x330) */
  TextureRect: 13,
  /** @0xea426 — returns *(u32*)(this+0x254) */
  Param14: 14,
  /** @0xea42e — returns *(u32*)(this+0x26c) */
  Param15: 15,
  /** @0xea436 — returns *(u32*)(this+0x2a0) */
  Param16: 16,
  /** @0xea442 — returns *(u32*)(this+0x24c) — width */
  Width: 17,
  /** @0xea44a — returns *(u32*)(this+0x258) */
  Param18: 18,
  /** @0xea452 — returns *(u32*)(this+0x25c) */
  Param19: 19,
  /** @0xea45a — returns *(u32*)(this+0x284) */
  Param20: 20,
  /** @0xea462 — returns *(u32*)(this+0x288) */
  Param21: 21,
  /** @0xea46a — returns *(u32*)(this+0x2b0) */
  Param22: 22,
  /** @0xea472/@0xea478 — returns u32(height * width) via imull */
  PixelCount: 23,
  /** @0xea481 — returns *(u32*)(this+0x274) */
  Param27: 27,
  /** @0xea489 — returns *(u32*)(this+0x264) */
  Param28: 28,
  /** @0xea491 — returns *(u32*)(this+0x260) */
  Param29: 29,
  /** @0xea499 — returns *(u32*)(this+0x294) */
  Param30: 30,
  /** @0xea4a1 — returns *(u32*)(this+0x28c) */
  Param31: 31,
  /** @0xea4a9 — returns *(u32*)(this+0x340) */
  Param32: 32,
  /** @0xea4b1 — returns *(u32*)(this+0x2a4) */
  Param33: 33,
  /** @0xea4b9..@0xea4d5 — float-env decoder on *(u32*)(this+0x430):
   *      0x1f80  → 0
   *      0x9fc0  → 2   (FTZ|DAZ mxcsr)
   *      other   → 3
   */
  FloatEnv: 34,
} as const;

export type HGRendererParameterKind =
  (typeof HGRendererParameter)[keyof typeof HGRendererParameter];

/**
 * `_pthread_rwlock_rdlock(pthread_rwlock_t*)` — libSystem (POSIX threads),
 * reached through the Helium stub at 0x3c5588; called @0xea60d by
 * `HGRenderer::RenderCheckPoint()`.
 *
 * Out-of-scope extern modeled as a documented boundary stub, the same way
 * `HGLogger.ts` models `_pthread_mutex_lock`: the single-threaded JS runtime
 * has no thread to suspend, so the call is a no-op that exists to keep the
 * instruction's provenance visible. A future multi-threaded port must
 * replace it with a real reader-writer lock.
 */
function pthread_rwlock_rdlock(_rwlock: unknown): void {
  // @0xea60d  callq _pthread_rwlock_rdlock  (stub 0x3c5588) — boundary no-op.
}

/**
 * `_pthread_rwlock_unlock(pthread_rwlock_t*)` — libSystem (POSIX threads),
 * reached through the Helium stub at 0x3c558e; called @0xea615 by
 * `HGRenderer::RenderCheckPoint()`. Boundary stub, as above.
 */
function pthread_rwlock_unlock(_rwlock: unknown): void {
  // @0xea615  callq _pthread_rwlock_unlock  (stub 0x3c558e) — boundary no-op.
}

/**
 * Live HGRenderer state modeled with the field offsets recovered above.
 * Only the fields actually read by ported methods are declared here; the
 * others exist in the C++ object but have no readers in the ported surface
 * yet. A downstream concrete renderer (`HGRendererCPU`, `HGRendererMetal`)
 * will fill these in when it constructs.
 */
export class HGRenderer {
  // --- observed fields ---
  /** @+0x240 — pixel format for this renderer's output. */
  pixelFormat: HGFormat = 0;
  /** @+0x3f8 — u32 numeric id printed by label() ("Renderer #N"). */
  rendererNumber = 0;
  /** @+0x418 — u32 last error code returned by GetLastError(). */
  lastError = 0;
  /** @+0x430 — u32 mxcsr-like float-env word classified by GetParameter #34. */
  floatEnvRaw = 0x1f80;
  /**
   * @+0x448 — opaque `void*` external-resource pointer written verbatim by
   * `HGRenderer::SetExternalResource(void*)` (@Helium 0xef404 `movq %rsi,
   * 0x448(%rdi)`). The renderer treats it as an untyped handle; no ported
   * method reads it yet, so it is modeled as an opaque value (null default).
   */
  externalResource448: unknown = null;

  /**
   * @+0x440 — opaque `HGRenderQueue*` back-pointer to the render queue that
   * owns this renderer, written verbatim by
   * `HGRenderer::SetOwningRenderQueue(HGRenderQueue*)`
   * (@Helium 0xef3e4 `movq %rsi, 0x440(%rdi)`). Distinct from the
   * external-resource slot at +0x448. `HGRenderQueue` is not yet ported, and
   * no ported method reads this field, so it is modeled as an opaque value
   * (null default) exactly like `externalResource448`.
   */
  owningRenderQueue440: unknown = null;

  /**
   * @+0x120 — `pthread_rwlock_t`. Its address is taken by
   * `HGRenderer::RenderCheckPoint()` @Helium 0xea603
   * (`leaq 0x120(%rbx), %r14`) and handed straight to
   * `_pthread_rwlock_rdlock` @0xea60d / `_pthread_rwlock_unlock` @0xea615.
   * Only the address is ever used, never the contents, so the lock is
   * modeled as an opaque identity object.
   */
  rwlock120: unknown = {};

  /**
   * u32-keyed parameter block at 0x240..0x2b0 + 0x340. Modeled as a
   * Record keyed by the byte offset so ports of downstream classes calling
   * GetParameter round-trip through here without inventing names for
   * undecoded fields.
   */
  paramBlock: { [offset: number]: number } = {};

  /** @+0x330 — HGLimits* for GPU/Metal target family. */
  limits60000: HGLimitsPtr | null = null;
  /** @+0x338 — HGLimits* for secondary CPU target family. */
  limits50000: HGLimitsPtr | null = null;

  /**
   * `HGRenderer::IsCPU() const` — Helium @0x000e9b10.
   *
   * Base implementation returns `true` (the CPU renderer is the default).
   * Concrete subclasses (`HGRendererMetal`, etc.) override slot *0x130 in
   * their own vtable to return `false`. Verbatim body:
   *
   *   0xe9b14: movb  $0x1, %al        ; return 1
   *   0xe9b16: popq  %rbp
   *   0xe9b17: retq
   */
  IsCPU(): boolean {
    return true;
  }

  /**
   * `HGRenderer::RenderFullROI_Default() const` — Helium @0x000e9b20.
   *
   *   0xe9b24: movb  $0x1, %al        ; return 1
   *   0xe9b26: popq  %rbp / retq
   */
  RenderFullROI_Default(): boolean {
    return true;
  }

  /**
   * `HGRenderer::GetLastError()` — Helium @0x000ea5e0.
   *
   *   0xea5e4: movl  0x418(%rdi), %eax  ; return *(u32*)(this + 0x418)
   */
  GetLastError(): number {
    return this.lastError >>> 0;
  }

  /**
   * `HGRenderer::label() const` — Helium @0x000e9990.
   *
   * Builds a std::string of the form  `"Renderer #<num>: <CPU|GPU>"` via a
   * std::stringstream. Verbatim key sites:
   *
   *   0xe99b9: literal "Renderer #" (10 bytes)
   *   0xe99ca: movl 0x3f8(%r14), %esi              ; rendererNumber
   *   0xe99d9: literal ": " (2 bytes)
   *   0xe99f6: callq *0x130(%rax)                  ; IsCPU()
   *   0xe99fc: leaq "CPU" ; 0xe9a03: leaq "GPU"    ; two literals
   *   0xe9a0a: testb %al,%al / cmovneq %rcx,%rsi   ; IsCPU→"CPU", else→"GPU"
   */
  label(): string {
    const kind = this.IsCPU() ? "CPU" : "GPU";
    return `Renderer #${this.rendererNumber >>> 0}: ${kind}`;
  }

  /**
   * `HGRenderer::debugDescription() const` — Helium @0x000e9af0.
   *
   *   0xe9af6: movq %rdi,%rbx           ; save sret slot
   *   0xe9af9: movq (%rsi),%rax         ; %rax = vptr
   *   0xe9afc: callq *0x28(%rax)        ; tail-call vtable slot 0x28
   *
   * Base binding of slot *0x28 is `HGRenderer::label` — verified because
   * no override symbol exists on the base HGRenderer vtable. Subclasses
   * may override slot *0x28 to a specialized label; that will naturally
   * shadow this JS method via normal dispatch when the subclass is ported.
   */
  debugDescription(): string {
    return this.label();
  }

  /**
   * `HGRenderer::GetTarget(unsigned int selector)` — Helium @0x000ea5a0.
   *
   * Returns a u32 "target id" for the selected backend family. Verbatim:
   *
   *   0xea5a0: testl %esi,%esi           ; selector==0 → g_target path
   *   0xea5a2: je    0xea5c8
   *   0xea5a4: cmpl  $0x60000,%esi       ; 0x60000 → limits at +0x330
   *   0xea5aa: je    0xea5bd
   *   0xea5ac: xorl  %eax,%eax
   *   0xea5ae: cmpl  $0x50000,%esi       ; 0x50000 → limits at +0x338
   *   0xea5b4: jne   0xea5d6              ; else return 0
   *   0xea5b6: movl  $0x338,%eax
   *   0xea5bb: jmp   0xea5c2
   *   0xea5bd: movl  $0x330,%eax
   *   0xea5c2: movq  (%rdi,%rax),%rax    ; HGLimits* ptr = *(this+offset)
   *   0xea5c6: jmp   0xea5cf
   *   0xea5c8: leaq  __ZL8g_target(%rip),%rax   ; module-scope u32
   *   0xea5cf: movl  (%rax),%eax          ; read u32 (target-id @ offset 0)
   *   0xea5d5: retq
   *
   * Callers compare the result to constants like 0x60b10 (Metal GPU b-family)
   * and 0x4700000 (software/AVX CPU). See file-header decode block for full
   * bitfield semantics.
   */
  GetTarget(selector: number): number {
    const sel = selector >>> 0;
    if (sel === 0) {
      // Path @0xea5c8/0xea5cf — reads Helium module-scope `g_target` (u32).
      //
      //   0xea5c8: leaq __ZL8g_target(%rip),%rax
      //   0xea5cf: movl (%rax),%eax
      //   0xea5d5: retq
      //
      // `__ZL8g_target` is a BSS u32 at Helium 0xaddd58 (nm shows
      // `b __ZL8g_target` — BSS, zero-initialized). Its runtime value is
      // written by a not-yet-transcribed Helium module-ctor that picks the
      // process-wide default target family; before that runs (and in a
      // headless port that never invokes the ctor) the value is 0, which is
      // exactly what a faithful transcription of `movl (%rax),%eax` returns.
      // Faithful port: return the module-scope holder value.
      return HGRenderer_g_target.value >>> 0;
    }
    if (sel === 0x60000) {
      // Path @0xea5bd/0xea5c2/0xea5cf.
      if (this.limits60000 === null) return 0;
      return this._limitsTarget(this.limits60000);
    }
    if (sel === 0x50000) {
      // Path @0xea5b6/0xea5c2/0xea5cf.
      if (this.limits50000 === null) return 0;
      return this._limitsTarget(this.limits50000);
    }
    // Path @0xea5ac/@0xea5b4 (jne → fall through with eax=0).
    return 0;
  }

  /** HGLimits.target — u32 field at HGLimits+0. Read by GetTarget @0xea5d3
   *  (`movl (%rax),%eax`) and GetParameter #4 @0xea3cf. Faithful port: read
   *  the pinned `target` u32 off the HGLimits POD. */
  private _limitsTarget(limits: HGLimitsPtr): number {
    // @0xea5cf: movl (%rax),%eax   — u32 at HGLimits+0.
    return (limits.target | 0) >>> 0;
  }

  /**
   * `HGRenderer::GetLimits(unsigned int selector)` — Helium @0x000f2be0.
   *
   * Returns the HGLimits pointer itself. Verbatim:
   *
   *   0xf2be4: cmpl  $0x60000,%esi
   *   0xf2bea: je    0xf2bff
   *   0xf2bec: cmpl  $0x50000,%esi
   *   0xf2bf2: jne   0xf2c0a
   *   0xf2bf4: movl  $0x338,%eax
   *   0xf2bf9: movq  (%rdi,%rax),%rax     ; return *(HGLimits**)(this+0x338)
   *   0xf2bff: movl  $0x330,%eax
   *   0xf2c04: movq  (%rdi,%rax),%rax     ; return *(HGLimits**)(this+0x330)
   *   0xf2c0a: xorl  %eax,%eax             ; return nullptr
   */
  GetLimits(selector: number): HGLimitsPtr | null {
    const sel = selector >>> 0;
    if (sel === 0x60000) return this.limits60000;
    if (sel === 0x50000) return this.limits50000;
    return null;
  }

  /**
   * `HGRenderer::GetInput(HGNode* n, int idx)` — Helium @0x000f2dd0.
   *
   * Bounds-checked lookup of `n->inputSlots[idx]->linkedNode`, dispatched
   * through GetOutput (returns the OUTPUT node of the sub-node). Verbatim:
   *
   *   0xf2dd4: testq %rsi,%rsi           ; n==null → return 0
   *   0xf2dd7: sete  %al
   *   0xf2dda: testl %edx,%edx           ; idx<0 → return 0
   *   0xf2ddc: sets  %cl
   *   0xf2ddf: orb   %al,%cl
   *   0xf2de1: jne   0xf2e01
   *   0xf2de3: cmpl  0x58(%rsi),%edx     ; idx >= numInputSlots → 0
   *   0xf2de6: jge   0xf2e01
   *   0xf2de8: movq  0x50(%rsi),%rax     ; slots = n->inputSlots (+0x50)
   *   0xf2dee: movq  (%rax,%rcx,8),%rax  ; slot = slots[idx]
   *   0xf2df2: testq %rax,%rax           ; slot==null → 0
   *   0xf2df5: je    0xf2e01
   *   0xf2df7: movq  0x10(%rax),%rsi     ; sub = slot->linkedNode (+0x10)
   *   0xf2dfc: jmp   HGRenderer::GetOutput   ; tail-call
   *   0xf2e01: xorl  %eax,%eax / retq    ; return null
   *
   * `HGInputSlot` layout (recovered from GetInput + GetFlags decode):
   *   +0x0c: u32     flags        (GetFlags @0xf2d9a)
   *   +0x10: HGNode* linkedNode   (GetInput @0xf2df7)
   */
  GetInput(n: HGNode | null, idx: number): HGNode | null {
    // @0xf2dd4..0xf2de1 — null / negative-index guard.
    if (n === null) return null;
    if ((idx | 0) < 0) return null;
    const nn = n as unknown as {
      numInputSlots: number;
      inputSlots: Array<{ linkedNode: HGNode | null } | null>;
    };
    // @0xf2de3 — bounds check against n->numInputSlots (+0x58).
    if ((idx | 0) >= (nn.numInputSlots | 0)) return null;
    if (!nn.inputSlots) return null;
    // @0xf2dee — slot = inputSlots[idx].
    const slot = nn.inputSlots[idx | 0];
    if (!slot) return null;
    // @0xf2df7 — sub = slot->linkedNode.
    const sub = slot.linkedNode;
    if (!sub) return null;
    // @0xf2dfc — tail-call GetOutput.
    return this.GetOutput(sub);
  }

  /**
   * `HGRenderer::GetOutput(HGNode* n)` — Helium @0x000f1ff0.
   *
   * The render-graph *output resolver*. Returns the HGNode that actually
   * produces pixels for `n` (may be `n` itself, or a collapsed upstream
   * chain, or a HGNode::GetGuardedOutput-guarded node). Caches the result
   * with bit `0x2` in `n->field_88` (+0x88), storing at `n->field_90`
   * (+0x90).
   *
   * Cache-hit path — fully ported here:
   *
   *   @0xf1ff0: testq %rsi,%rsi           ; null → return 0
   *   @0xf1ff3: je    0xf20df
   *   @0xf2007: testb $0x2, 0x88(%rsi)    ; cache-valid bit
   *   @0xf200e: jne   0xf20e2
   *   @0xf20e2: movq  0x90(%r14),%rax     ; return n->field_90 (cachedOutput)
   *   @0xf20e9: jmp   0xf21a4              ; epilogue
   *
   * Cold-path resolve — NOT yet transcribed. Uses:
   *   @0xf2035..@0xf209b : "single-input collapse" via node vtables:
   *                        - *0x158 on both n and sub (hasCompatibleOutput)
   *                        - HGRenderer::IsMergeable
   *                        - *0x10 (Retain) / *0x160 (adoptCollapsedInput) / *0x18 (Release)
   *   @0xf209c..@0xf20ee : recursion over every input slot
   *   @0xf2121           : HGNode::GetGuardedOutput
   *   @0xf2156..@0xf218c : re-resolve the guarded output + write cache fields
   *   @0xf2192..@0xf219b : virtual slot *0xb0 (onOutputPromoted)
   */
  GetOutput(n: HGNode | null): HGNode | null {
    // @0xf1ff0 — null guard.
    if (n === null) return null;
    // @0xf2007 — cache-valid bit 0x2 in n->field_88.
    const nc = n as unknown as {
      field_88: number;
      field_90: HGNode | null;
    };
    if ((nc.field_88 & 0x2) !== 0) {
      // @0xf20e2 — return cached output.
      return nc.field_90;
    }
    // Cold-path resolve needs several undecoded pieces; refuse rather than
    // silently returning `n` (which would silently corrupt every downstream
    // renderer that expects the collapsed chain).
    throw new Error(
      "HGRenderer::GetOutput @0x000f1ff0: cold-path resolve requires " +
        "HGNode vtable *0x158 (hasCompatibleOutput @0xf203b/@0xf2053), " +
        "*0x160 (adoptCollapsedInput @0xf208d), *0x30 (renderNodeName " +
        "@0xf20fd), *0xb0 (onOutputPromoted @0xf219b), plus " +
        "HGRenderer::IsMergeable @0x000f2c10 and " +
        "HGNode::GetGuardedOutput @__ZN6HGNode16GetGuardedOutputEP10HGRenderer" +
        " — none of these have been transcribed yet",
    );
  }

  /**
   * `HGRenderer::IsMergeable(HGNode* node, int slot, bool wantCollapse)` —
   * Helium @0x000f2c10.
   *
   * Predicates whether `node` (at input `slot`, or `node` itself if slot<0)
   * is a candidate for graph-level upstream merging. Two-tier gate:
   *
   *   Tier A — flag gate (@0xf2c10-@0xf2c8a):
   *     Build a flags word `%r15d`:
   *       - if slot >= 0 (@0xf2c24 testl edx,edx; jns):
   *           bounds-check @0xf2c2b (jge → false).
   *           slot = node.inputs[slot] (+0x50 array, 8-byte stride);
   *             null → drop through with %r15d=0.
   *           %r15d = slot.flags (+0x0c).
   *           src = slot.linkedNode (+0x10). If !src, skip to gate.
   *           subFlags = src.field_10 (+0x10).
   *           subFlags |= GetOutput(src).field_10   (@0xf2c56 recurse; @0xf2c5e or).
   *           %r15d |= subFlags.
   *       - if slot <  0 (@0xf2c72):
   *           %r15d = node.field_10 (+0x10, the same "renderPageStrategy"
   *                                       flag word GetFlags folds).
   *     If (%r15d & 0x26) != 0 (@0xf2c65 / @0xf2c76 testb $0x26, %r15b):
   *       -> return false immediately (@0xf2c6b xor eax,eax; jmp epi).
   *
   *   Tier B — collapse gate (@0xf2c7c-@0xf2d24):
   *     After the flag drop:
   *       %r15d &= 0x40                                (@0xf2c7c)
   *       %r15d |= this.field_340                      (@0xf2c80)  <- paramBlock[0x340]
   *       %al   = (%r15d != 0)                         (@0xf2c87 setne)
   *     Then branch on `wantCollapse` (%cl):
   *       - !wantCollapse: return %al (@0xf2c8c je epi).
   *       -  wantCollapse:
   *           if (%r15d == 0) return %al=0  (@0xf2c92 testl; je epi).
   *           %al = 1 (@0xf2c9b — collapse "yes" by default).
   *           if (node.field_80 < 2) return al=1 (@0xf2c9d cmpq $0x2; jb epi):
   *             a merge-info map with 0 or 1 entries always says "yes".
   *           Otherwise walk the std::_Tree at node+0x70/+0x78:
   *             r12 = tree root (+0x70), sentinel = node+0x78 (@0xf2ca7-@0xf2cab)
   *             Standard rb-tree successor-order iteration (@0xf2ccd-@0xf2d1d)
   *             at each entry: r15d += (GetOutput(entry.key) == entry.dedupKey)
   *             Return (%r15d < 2)  (@0xf2d1f cmpl $0x2; setb).
   *
   * PORTED faithfully for slot>=0 AND slot<0 flag-computation AND
   * wantCollapse=false. GetOutput's own cold-path caller passes
   * `wantCollapse=false` (@0xf2067 `xorl %ecx,%ecx`) so this cover unblocks
   * GetOutput's merge-check gate for the exact call-site of interest.
   *
   * The wantCollapse=true rb-tree walk is deferred to a throwing stub with
   * per-address citations — decoding the std::map<HGNode*,...> layout at
   * node+0x70/+0x78/+0x80 is a separate HGNode port.
   */
  IsMergeable(
    node: HGNode | null,
    slot: number,
    wantCollapse: boolean,
  ): boolean {
    if (node === null) return false;                              // guard
    const s = (slot | 0);

    let flags: number;                                            // %r15d
    if (s < 0) {
      // @0xf2c72: movl 0x10(%rbx), %r15d
      flags = ((node as unknown as { renderPageStrategy: number })
        .renderPageStrategy | 0) >>> 0;
    } else {
      // @0xf2c28: xorl %r15d,%r15d
      flags = 0;
      const nn = node as unknown as {
        numInputSlots: number;
        inputSlots: Array<
          | { flags: number; linkedNode: HGNode | null }
          | null
        >;
      };
      // @0xf2c2b-e: cmpl 0x58(%rbx), edx; jge -> tier-B gate with flags=0.
      if (s >= (nn.numInputSlots | 0) || !nn.inputSlots) {
        // fall through with flags=0.
      } else {
        // @0xf2c30-36: slot = inputSlots[s].
        const inSlot = nn.inputSlots[s];
        if (inSlot) {
          // @0xf2c3f: movl 0xc(%rax),%r15d — slot.flags.
          flags = (inSlot.flags | 0) >>> 0;
          const src = inSlot.linkedNode;
          if (src !== null) {
            // @0xf2c4c: movl 0x10(%rsi),%r13d — subFlags = src.field_10.
            const src10 = ((src as unknown as { renderPageStrategy: number })
              .renderPageStrategy | 0) >>> 0;
            // @0xf2c56: callq GetOutput(src).
            const resolved = this.GetOutput(src);
            // @0xf2c5e: orl 0x10(%rax),%r13d — subFlags |= resolved.field_10.
            let subFlags = src10;
            if (resolved !== null) {
              subFlags = (subFlags |
                (((resolved as unknown as { renderPageStrategy: number })
                  .renderPageStrategy | 0) >>> 0)) >>> 0;
            }
            // @0xf2c62: orl %r13d,%r15d.
            flags = (flags | subFlags) >>> 0;
          }
        }
      }
    }

    // @0xf2c65/@0xf2c76: testb $0x26, %r15b -- reject if any of the 0x02
    // (some kind of "cannot-collapse"), 0x04, or 0x20 bit is set.
    if ((flags & 0x26) !== 0) {
      // @0xf2c6b: xorl %eax,%eax; jmp epi -- return false.
      return false;
    }

    // @0xf2c7c: andl $0x40, %r15d -- keep only the 0x40 ("mergeable-hint") bit.
    let gate = (flags & 0x40) >>> 0;
    // @0xf2c80: orl 0x340(%r14), %r15d -- OR in the renderer's paramBlock[0x340].
    gate = (gate | ((this.paramBlock[0x340] | 0) >>> 0)) >>> 0;
    // @0xf2c87: setne %al -- boolean "gate != 0".
    const gateNonzero = gate !== 0;

    // @0xf2c8a-c: testb %cl,%cl; je epi -- if !wantCollapse, return gateNonzero.
    if (!wantCollapse) return gateNonzero;

    // @0xf2c92: testl %r15d,%r15d; je epi -- with wantCollapse, if gate is
    // clear we still return `gateNonzero` (false here, since gate==0 implies
    // %al=setne(0)=0 unless paramBlock[0x340] contributed but gate==0 forces
    // eax=0 through the je).
    if (gate === 0) return gateNonzero;

    // @0xf2c9b: movb $0x1,%al -- pre-load "collapse yes"; will only clear on
    // the tree-count arm below.
    // @0xf2c9d: cmpq $0x2, 0x80(%rbx); jb epi -- map size < 2 -> yes.
    const mergeInfoSize = (node as unknown as { field_80: number }).field_80 | 0;
    if ((mergeInfoSize >>> 0) < 2) return true;

    // @0xf2ca7-@0xf2d24 tree walk not yet transcribed. Two integers to
    // decode: node+0x70 (tree root ptr) and node+0x78 (end sentinel), plus
    // the per-entry offsets +0x08 (left link), +0x10 (parent link), +0x20
    // (payload -> key ptr + dedupKey). The result is (count < 2).
    throw new Error(
      "HGRenderer::IsMergeable @0x000f2c9d cold-collapse arm requires the " +
        "std::_Tree walk over node+0x70/+0x78/+0x80 (per-entry keys read via " +
        "callq GetOutput @0xf2cd8, cmp against *(entry+0x20) @0xf2ce9); " +
        "HGNode merge-info map layout not yet transcribed",
    );
  }

  /**
   * `HGRenderer::GetROI(HGNode* n)` — Helium @0x000f2d40.
   *
   * Returns the cached ROI rect for GetOutput(n). Verbatim:
   *
   *   @0xf2d44: callq GetOutput           ; out = GetOutput(this, n)
   *   @0xf2d49: testq %rax,%rax           ; !out → HGRectNull
   *   @0xf2d4c: je    0xf2d57
   *   @0xf2d4e: testb $0x8, 0x88(%rax)    ; cache-valid bit 0x8
   *   @0xf2d55: jne   0xf2d6a              ; set → return &out->rectB
   *   @0xf2d57: leaq  _HGRectNull(%rip),%rcx / return {0,0,0,0}
   *   @0xf2d6a: leaq  0xa8(%rax),%rcx     ; &out->rectB.lo (+0xa8)
   *   @0xf2d71: addq  $0xb0,%rax          ; &out->rectB.hi (+0xb0)
   *   @0xf2d77: movq  (%rax),%rdx / (%rcx),%rax   ; return {lo, hi}
   *
   * The 16-byte HGRect is laid out as {u32 x, u32 y, u32 w, u32 h} at
   * offset +0xa8..+0xb8 in HGNode. Per HGNode.ts this is field "rectB".
   */
  GetROI(n: HGNode | null): HGRect {
    const out = this.GetOutput(n);
    if (out === null) return { x: 0, y: 0, w: 0, h: 0 };
    const oc = out as unknown as {
      field_88: number;
      rectB: HGRect;
    };
    if ((oc.field_88 & 0x8) === 0) return { x: 0, y: 0, w: 0, h: 0 };
    return {
      x: oc.rectB.x,
      y: oc.rectB.y,
      w: oc.rectB.w,
      h: oc.rectB.h,
    };
  }

  /**
   * `HGRenderer::GetDOD(HGNode* n)` — Helium @0x000ed770.
   *
   * Returns the domain-of-definition rect for GetOutput(n). Similar caching
   * pattern to GetROI: cache-valid bit `0x4` in field_88, cached rect at
   * offset +0x98 (HGNode.rectA). Verbatim outline:
   *
   *   @0xed77e: rax = GetOutput(this, n)
   *   @0xed783: !out → return HGRectNull                  (@0xed834)
   *   @0xed78f: testb $0x4, 0x88(%rax) ; cache-valid → jump @0xed87a
   *   @0xed87a: leaq 0x98(%rbx),%rax ; movq (rax),rax / (rax+8),rdx
   *
   *   Cold path @0xed79c..@0xed873:
   *     - If out has inputs (numInputSlots > 0), for each slot i:
   *       - if slot null or slot->linkedNode null, skip.
   *       - subDod = GetDOD(this, slot->linkedNode->field_90) (via cache).
   *       - childRect = out->vptr[0x178/8](this, i, subDod)
   *       - accumulate via HGRectUnion; store into out->rectA (+0x98)
   *     - Else (leaf), childRect = out->vptr[0x178/8](this, 0, HGRectNull)
   *     - Set cache bit: out->field_88 |= 0x4
   */
  GetDOD(n: HGNode | null): HGRect {
    // @0xed77e — canonicalize via GetOutput.
    const out = this.GetOutput(n);
    // @0xed783/@0xed834 — null → HGRectNull.
    if (out === null) return { x: 0, y: 0, w: 0, h: 0 };
    // @0xed78f — cache-valid bit 0x4.
    const oc = out as unknown as { field_88: number; rectA: HGRect };
    if ((oc.field_88 & 0x4) !== 0) {
      // @0xed87a — return out->rectA (16 bytes at +0x98).
      return {
        x: oc.rectA.x,
        y: oc.rectA.y,
        w: oc.rectA.w,
        h: oc.rectA.h,
      };
    }
    throw new Error(
      "HGRenderer::GetDOD @0x000ed770: cold-path DOD compute requires " +
        "HGNode vtable *0x178 (map-input-DOD @0xed807/@0xed85f) and " +
        "HGRectUnion @0xed827 — neither is yet transcribed",
    );
  }

  /**
   * `HGRenderer::GetFlags(HGNode* n, int idx)` — Helium @0x000f2d80.
   *
   * Returns the flag word attached to input slot `idx` of `n`, OR'd with
   * the flag word of the slot's linked-node AND its output. Verbatim:
   *
   *   @0xf2d82: js    0xf2dc9              ; idx<0 → shortcut
   *   @0xf2d84: xorl  %eax,%eax
   *   @0xf2d86: cmpl  0x58(%rsi),%edx      ; bounds
   *   @0xf2d89: jge   0xf2dc8              ; oob → return 0
   *   @0xf2d8b: movq  0x50(%rsi),%rcx      ; slots = n->inputSlots
   *   @0xf2d91: movq  (%rcx,%rdx,8),%rcx   ; slot = slots[idx]
   *   @0xf2d95: testq %rcx,%rcx / je 0xf2dc8
   *   @0xf2d9a: movl  0xc(%rcx),%eax       ; slotFlags = slot->flags (+0x0c)
   *   @0xf2d9d: movq  0x10(%rcx),%rsi      ; sub = slot->linkedNode (+0x10)
   *   @0xf2da4: je    0xf2dc8              ; !sub → return slotFlags
   *   @0xf2dad: movl  0x10(%rsi),%r14d     ; subFlags = sub->field_10
   *   @0xf2db3: callq GetOutput            ; outNode = GetOutput(sub)
   *   @0xf2dbd: orl   0x10(%rcx),%r14d     ; subFlags |= outNode->field_10
   *                                          (%rcx here is outNode; the mov
   *                                           @0xf2db8: movq %rax,%rcx)
   *   @0xf2dc1: orl   %r14d,%eax           ; return slotFlags|subFlags|outFlags
   *   @0xf2dc9: movl  0x10(%rsi),%eax      ; idx<0 shortcut: n->field_10
   *
   * `HGNode.field_10` is the `renderPageStrategy` field per HGNode.ts —
   * the render graph repurposes it as a flag word. `n->inputSlots[i]->flags`
   * is at HGInputSlot +0x0c (u32).
   */
  GetFlags(n: HGNode | null, idx: number): number {
    if (n === null) return 0;
    // @0xf2dc9 shortcut for idx<0.
    if ((idx | 0) < 0) {
      return (((n as unknown as { renderPageStrategy: number })
        .renderPageStrategy) | 0) >>> 0;
    }
    const nn = n as unknown as {
      numInputSlots: number;
      inputSlots: Array<
        | { flags: number; linkedNode: HGNode | null }
        | null
      >;
      renderPageStrategy: number;
    };
    // @0xf2d86 bounds.
    if ((idx | 0) >= (nn.numInputSlots | 0)) return 0;
    if (!nn.inputSlots) return 0;
    // @0xf2d91 — slot.
    const slot = nn.inputSlots[idx | 0];
    if (!slot) return 0;
    // @0xf2d9a — slotFlags = slot->flags.
    let acc = (slot.flags | 0) >>> 0;
    // @0xf2d9d — sub = slot->linkedNode.
    const sub = slot.linkedNode;
    if (sub === null) return acc;
    // @0xf2dad — subFlags = sub->field_10 (renderPageStrategy).
    const subInner = sub as unknown as { renderPageStrategy: number };
    let subFlags = (subInner.renderPageStrategy | 0) >>> 0;
    // @0xf2db3 — outNode = GetOutput(sub).
    const outNode = this.GetOutput(sub);
    if (outNode !== null) {
      // @0xf2dbd — subFlags |= outNode->field_10.
      subFlags = (subFlags |
        ((outNode as unknown as { renderPageStrategy: number })
          .renderPageStrategy | 0)) >>>
        0;
    }
    // @0xf2dc1 — return slotFlags | subFlags | outFlags.
    return (acc | subFlags) >>> 0;
  }

  /**
   * `HGRenderer::GetOutputFormat(HGNode* n)` — Helium @0x000ec280.
   *
   * Verbatim:
   *
   *   @0xec289: cmpl $0x4, 0x20(%rsi)      ; n->componentCount == 4 ?
   *   @0xec28d: jne  0xec2b0
   *   @0xec28f: cmpl $0xf, 0x24(%rbx)      ; n->precisionCode == 15 ?
   *   @0xec293: jne  0xec2b0
   *   @0xec295: movl 0x240(%rdi),%esi      ; arg = this->pixelFormat
   *   @0xec29e: movq 0x128(%rax),%rax      ; vtable slot 0x128 (packFormat)
   *   @0xec2ae: jmpq *%rax                  ; tail-call
   *
   *   @0xec2b0: movl 0x240(%rdi),%edi      ; else pixelFormat path
   *   @0xec2b6: callq HGFormatUtils::precision       (%eax = p)
   *   @0xec2bb: movl 0x24(%rbx),%esi        ; precisionCode
   *   @0xec2c0: callq HGFormatUtils::adjustPrecision (%eax = q)
   *   @0xec2c5: movl 0x20(%rbx),%edi        ; componentCount
   *   @0xec2d0: jmp   HGFormatUtils::buildFormat     (tail-jmp)
   *
   * HGNode fields used: +0x20 componentCount (u32), +0x24 precisionCode (u32).
   * HGFormatUtils and vtable *0x128 (subclass packFormat) not yet ported.
   */
  GetOutputFormat(n: HGNode): HGFormat {
    const nc = n as unknown as { componentCount: number; precisionCode: number };
    const isPremulRGBA = (nc.componentCount | 0) === 4 &&
      (nc.precisionCode | 0) === 0xf;
    if (isPremulRGBA) {
      // @0xec295..@0xec2ae — tail-call vtable *0x128 (subclass packFormat).
      throw new Error(
        "HGRenderer::GetOutputFormat @0x000ec29e: premul-RGBA fast path " +
          "tail-calls subclass vtable *0x128 (packFormat) — not yet " +
          "transcribed",
      );
    }
    // @0xec2b0..@0xec2d0 — slow path via HGFormatUtils.
    throw new Error(
      "HGRenderer::GetOutputFormat @0x000ec280: slow path requires " +
        "HGFormatUtils::precision @0xec2b6 / ::adjustPrecision @0xec2c0 " +
        "/ ::buildFormat @0xec2d0 — not yet transcribed",
    );
  }

  /**
   * `HGRenderer::GetParameter(HGRendererParameter p)` — Helium @0x000ea390.
   *
   * A dense u32 field-selector via a 47-entry jump table indexed by `p`.
   * The full jump table is enumerated in `HGRendererParameter` above with
   * per-entry @0xADDR citations. Values range from a simple
   * `movl offset(%rdi),%eax` to special cases:
   *
   *   #4  (Target60000) → HGLimits[+0x330]->target  (u32 @ off 0)  @0xea3cf
   *   #5  (TileSizeConst) → hard-coded 0x2000                      @0xea3da
   *   #13 (TextureRect) → tail-call HGLimits::texturerect          @0xea419
   *   #23 (PixelCount)  → imull height * width                     @0xea472
   *   #34 (FloatEnv)    → mxcsr classifier at (this+0x430)         @0xea4b9
   *
   * Anything in [0..0x2e] not listed above is a compiler-emitted duplicate
   * arm (the switch table has unused indices) — the default fall-through
   * for `p > 0x2e` is 0 (@0xea394 / @0xea43e).
   */
  GetParameter(p: HGRendererParameterKind | number): number {
    const P = HGRendererParameter;
    switch (p) {
      case P.Kind: // 0 @0xea3af
        return ((this.paramBlock[0x248] | 0) | 0) >>> 0;
      case P.PixelFormat: // 1 @0xea3b7
        return this.pixelFormat >>> 0;
      case P.Param2: // 2 @0xea3bf
        return (this.paramBlock[0x298] | 0) >>> 0;
      case P.Param3: // 3 @0xea3c7
        return (this.paramBlock[0x280] | 0) >>> 0;
      case P.Target60000: // 4 @0xea3cf
        if (this.limits60000 === null) return 0;
        return this._limitsTarget(this.limits60000);
      case P.TileSizeConst: // 5 @0xea3da
        return 0x2000;
      case P.Param6: // 6 @0xea3e1
        return (this.paramBlock[0x268] | 0) >>> 0;
      case P.Param7: // 7 @0xea3e9
        return (this.paramBlock[0x2a8] | 0) >>> 0;
      case P.Param8: // 8 @0xea3f1
        return (this.paramBlock[0x29c] | 0) >>> 0;
      case P.Param9: // 9 @0xea3f9
        return (this.paramBlock[0x27c] | 0) >>> 0;
      case P.Param10: // 10 @0xea401
        return (this.paramBlock[0x244] | 0) >>> 0;
      case P.Height: // 11 @0xea409
        return (this.paramBlock[0x250] | 0) >>> 0;
      case P.Param12: // 12 @0xea411
        return (this.paramBlock[0x2ac] | 0) >>> 0;
      case P.TextureRect: // 13 @0xea419
        throw new Error(
          "HGRenderer::GetParameter(TextureRect=13) @0x000ea419 " +
            "tail-jmp HGLimits::texturerect — not yet transcribed",
        );
      case P.Param14: // 14 @0xea426
        return (this.paramBlock[0x254] | 0) >>> 0;
      case P.Param15: // 15 @0xea42e
        return (this.paramBlock[0x26c] | 0) >>> 0;
      case P.Param16: // 16 @0xea436
        return (this.paramBlock[0x2a0] | 0) >>> 0;
      case P.Width: // 17 @0xea442
        return (this.paramBlock[0x24c] | 0) >>> 0;
      case P.Param18: // 18 @0xea44a
        return (this.paramBlock[0x258] | 0) >>> 0;
      case P.Param19: // 19 @0xea452
        return (this.paramBlock[0x25c] | 0) >>> 0;
      case P.Param20: // 20 @0xea45a
        return (this.paramBlock[0x284] | 0) >>> 0;
      case P.Param21: // 21 @0xea462
        return (this.paramBlock[0x288] | 0) >>> 0;
      case P.Param22: // 22 @0xea46a
        return (this.paramBlock[0x2b0] | 0) >>> 0;
      case P.PixelCount: { // 23 @0xea472/@0xea478 — imull
        const w = (this.paramBlock[0x24c] | 0) >>> 0;
        const h = (this.paramBlock[0x250] | 0) >>> 0;
        return Math.imul(w, h) >>> 0;
      }
      case P.Param27: // 27 @0xea481
        return (this.paramBlock[0x274] | 0) >>> 0;
      case P.Param28: // 28 @0xea489
        return (this.paramBlock[0x264] | 0) >>> 0;
      case P.Param29: // 29 @0xea491
        return (this.paramBlock[0x260] | 0) >>> 0;
      case P.Param30: // 30 @0xea499
        return (this.paramBlock[0x294] | 0) >>> 0;
      case P.Param31: // 31 @0xea4a1
        return (this.paramBlock[0x28c] | 0) >>> 0;
      case P.Param32: // 32 @0xea4a9
        return (this.paramBlock[0x340] | 0) >>> 0;
      case P.Param33: // 33 @0xea4b1
        return (this.paramBlock[0x2a4] | 0) >>> 0;
      case P.FloatEnv: { // 34 @0xea4b9..@0xea4d5
        //   ecx = *(this + 0x430)
        //   edx = (ecx == 0x9fc0) ? 1 : 0
        //   edx ^= 0x3
        //   eax = 0
        //   if (ecx != 0x1f80) eax = edx  ; cmovnel edx→eax
        const ecx = this.floatEnvRaw >>> 0;
        let edx = ecx === 0x9fc0 ? 1 : 0;
        edx = edx ^ 0x3;
        let eax = 0;
        if (ecx !== 0x1f80) eax = edx;
        return eax >>> 0;
      }
      default:
        // @0xea394/@0xea43e — p out of range or unassigned arm.
        return 0;
    }
  }

  /**
   * `HGRenderer::SetExternalResource(void*)` — Helium @0x000ef400.
   *
   * Stores the opaque `void*` argument verbatim into the field at
   * `this + 0x448`. Full transcription (6 lines):
   *
   *   0xef400  pushq   %rbp
   *   0xef401  movq    %rsp, %rbp
   *   0xef404  movq    %rsi, 0x448(%rdi)   ; this->externalResource448 = arg
   *   0xef40b  popq    %rbp
   *   0xef40c  retq
   *
   * Zero callees, zero externs, zero indirect calls — a pure pointer store.
   * The pointer is untyped in the binary (`void*`), so it is stored as an
   * opaque value here (see the +0x448 field declaration above).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN10HGRenderer19SetExternalResourceEPv.s
   */
  SetExternalResource(resource: unknown): void {
    // @Helium 0xef404: movq %rsi, 0x448(%rdi)
    this.externalResource448 = resource;
  }

  /**
   * `HGRenderer::SetOwningRenderQueue(HGRenderQueue*)` — Helium @0x000ef3e0.
   *
   * Stores the `HGRenderQueue*` argument verbatim into the field at
   * `this + 0x440`. Full transcription (5 instructions + padding):
   *
   *   0xef3e0  pushq   %rbp
   *   0xef3e1  movq    %rsp, %rbp
   *   0xef3e4  movq    %rsi, 0x440(%rdi)   ; this->owningRenderQueue440 = arg
   *   0xef3eb  popq    %rbp
   *   0xef3ec  retq
   *   0xef3ed  nopl    (%rax)              ; alignment padding, not code
   *
   * Zero callees, zero externs, zero indirect calls, no null check — a pure
   * pointer store (the frame push/pop is the only other work, and has no
   * observable effect in a JS port). `HGRenderQueue` is not yet ported, so
   * the pointer is held opaquely (see the +0x440 field declaration above).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN10HGRenderer20SetOwningRenderQueueEP13HGRenderQueue.s
   */
  SetOwningRenderQueue(queue: unknown): void {
    // @Helium 0xef3e4: movq %rsi, 0x440(%rdi)
    this.owningRenderQueue440 = queue;
  }

  /**
   * `HGRenderer::RenderCheckPoint()` — Helium @0x000ea5f0.
   *
   * Faithful transcription of
   * raw-port/re/disasm/Helium.__ZN10HGRenderer16RenderCheckPointEv.s:
   *
   *   0xea5f0  pushq %rbp
   *   0xea5f1  movq  %rsp, %rbp
   *   0xea5f4  pushq %r14
   *   0xea5f6  pushq %rbx
   *   0xea5f7  movq  %rdi, %rbx                  ; %rbx = this
   *   0xea5fa  cmpl  $0x0, 0x280(%rdi)           ; param_280 == 0 ?
   *   0xea601  je    0xea61a                     ;   -> skip the barrier
   *   0xea603  leaq  0x120(%rbx), %r14           ; %r14 = &this->rwlock120
   *   0xea60a  movq  %r14, %rdi
   *   0xea60d  callq _pthread_rwlock_rdlock      ; stub 0x3c5588
   *   0xea612  movq  %r14, %rdi
   *   0xea615  callq _pthread_rwlock_unlock      ; stub 0x3c558e
   *   0xea61a  xorl  %eax, %eax                  ; %eax = 0
   *   0xea61c  cmpl  0x27c(%rbx), %eax           ; flags on 0 - param_27c
   *   0xea622  sbbl  %eax, %eax                  ; %eax = -CF
   *   0xea624  popq  %rbx / popq %r14 / popq %rbp / retq
   *
   * TWO independent halves, joined only by falling through:
   *
   * 1. THE BARRIER. When `param_280` (+0x280, the field `GetParameter #3`
   *    @0xea3c7 exposes) is non-zero, the renderer takes the read side of the
   *    rwlock at +0x120 and immediately drops it. Acquiring and releasing a
   *    READ lock with an empty critical section is the standard "wait for any
   *    in-flight writer to finish" barrier — that is the whole point of the
   *    check-point. Nothing is read or written under the lock.
   *
   * 2. THE RESULT. `xorl %eax,%eax ; cmpl 0x27c(%rbx),%eax ; sbbl %eax,%eax`
   *    is the classic branchless "non-zero -> all ones" idiom. In AT&T order
   *    `cmpl 0x27c(%rbx), %eax` computes `%eax - param_27c` = `0 - param_27c`,
   *    so the borrow flag CF is set exactly when `param_27c != 0` (unsigned
   *    `0 < x`). `sbbl %eax,%eax` then evaluates `%eax - %eax - CF` = `-CF`,
   *    giving 0xffffffff when `param_27c` is non-zero and 0 when it is zero.
   *    The return is therefore a full-width MASK, not a 0/1 boolean.
   *
   * Note the two fields are distinct: +0x280 gates the barrier, +0x27c
   * produces the result. Neither is touched by the other half.
   *
   * @returns `-1` (0xffffffff) when `param_27c` is non-zero, else `0`.
   */
  RenderCheckPoint(): number {
    // @0xea5fa  cmpl $0x0, 0x280(%rdi) ; @0xea601 je 0xea61a
    if ((this.paramBlock[0x280] | 0) !== 0) {
      // @0xea603  leaq 0x120(%rbx), %r14 — the lock's ADDRESS is the argument.
      const rwlock = this.rwlock120;
      // @0xea60d  callq _pthread_rwlock_rdlock
      pthread_rwlock_rdlock(rwlock);
      // @0xea615  callq _pthread_rwlock_unlock — empty critical section: this
      // is a barrier against in-flight writers, not a guarded read.
      pthread_rwlock_unlock(rwlock);
    }
    // @0xea61c  cmpl 0x27c(%rbx), %eax  with %eax = 0 (@0xea61a xorl) — CF is
    // set iff param_27c != 0; @0xea622 sbbl %eax,%eax yields -CF.
    return (this.paramBlock[0x27c] | 0) !== 0 ? -1 : 0;
  }
}
