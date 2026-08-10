// raw-port/src/render/HGRenderContext.ts
//
// FCP `HGRenderContext` — Helium's per-render execution context: it owns the
// compute device the render runs on, the `HGRenderer*` that drives the graph,
// the work-mode/state words, and the render-time statistics block. Derives
// from `HGObject` (ctor @0x31020 `callq HGObject::HGObject()`).
//
// Symbols transcribed in THIS file (Helium, x86_64 slice; VAs are the
// unadjusted VM addresses printed by `otool -tV`):
//
//   0x00031280  HGRenderContext::IsCPU() const                         (FULL)
//   0x00031290  HGRenderContext::IsGPU() const                         (FULL)
//   0x00031450  HGRenderContext::SetWorkMode(HGRenderContext::WorkMode) (FULL)
//   0x00031470  HGRenderContext::GetComputeDevice()                    (FULL)
//   0x00031490  HGRenderContext::GetWorkMode()                         (FULL)
//
// STRUCT LAYOUT — every offset below is cited to the exact instruction it was
// recovered from. The primary evidence is the constructor
// `HGRenderContext::HGRenderContext(HGRenderer*)` @0x31010
// (raw-port/re/disasm/Helium.__ZN15HGRenderContextC2EP10HGRenderer.s) plus the
// one-line accessors that read each field.
//
//   HGRenderContext {
//     +0x000  vptr                       [ctor @0x3102c movq %rax,(%rbx)]
//     +0x008  ...HGObject base fields    [ctor @0x31020 HGObject::HGObject()]
//     +0x010  HGComputeDevice*  computeDevice.__ptr_
//                                        [ctor @0x31032 movups %xmm0,0x10(%rbx)
//                                         zero-inits the 16 bytes at +0x10;
//                                         GetComputeDeviceIndex @0x31484
//                                         `movq 0x10(%rdi),%rax` dereferences it;
//                                         GetComputeDevice @0x31474 takes its
//                                         ADDRESS: `leaq 0x10(%rdi),%rax`]
//     +0x018  __shared_weak_count* computeDevice.__cntrl_
//                                        [ctor @0x310a5 `movq 0x18(%rbx),%r14`
//                                         then the standard shared_ptr release
//                                         sequence: @0x310ba `lock xaddq $-1,
//                                         0x8(%r14)`, @0x310ca `callq *0x10(%rax)`
//                                         (__on_zero_shared), @0x310d0 `callq
//                                         __ZNSt3__119__shared_weak_count14__release_weakEv`]
//                                        => +0x10 is a std::shared_ptr<HGComputeDevice>
//                                           (2 words: object ptr + control block).
//     +0x020  u64   state                [GetState @0x314a4 movl 0x20(%rdi),%eax;
//                                         ctor @0x3109a movq $0x1,0x20(%rbx)]
//     +0x024  u32   type                 [GetType @0x31464 movl 0x24(%rdi),%eax;
//                                         the 8-byte ctor store @0x3109a
//                                         `movq $0x1,0x20(%rbx)` covers +0x20 AND
//                                         +0x24, so type defaults to 0 (= CPU).
//                                         Encoding pinned by the three sibling
//                                         predicates that all test this one slot:
//                                         IsCPU @0x31284 `cmpl $0x0,0x24(%rdi)` => 0,
//                                         IsGPU @0x31294 `cmpl $0x1,0x24(%rdi)` => 1,
//                                         IsGL  @0x312a4 `cmpl $0x2,0x24(%rdi)` => 2.
//                                         Corroborated by the GPU subclass ctor
//                                         HGGPURenderContext::HGGPURenderContext(
//                                           shared_ptr<HGGPUComputeDevice const>
//                                           const&, bool) @0x3ecf0, which stamps
//                                         `movl $0x1,0x24(%rbx)` @0x3ed2a right
//                                         after chaining this class's ctor]
//     +0x028  u32   workMode             [GetWorkMode @0x31494 movl 0x28(%rdi),%eax;
//                                         ctor @0x31093 movl $0x2,0x28(%rbx)]
//     +0x030  u64                        [ctor @0x310d5 movq $0x0,0x30(%rbx)]
//     +0x038  HGSynchronizable*          [ctor @0x31077 __Znwm(0x88) ->
//                                         HGSynchronizable::HGSynchronizable()
//                                         @0x31082, stored @0x31087]
//     +0x040  u64                        [ctor @0x3108b movq $0x0,0x40(%rbx)]
//     +0x048  HGRenderer* renderer       [ctor @0x31045 movq %r14,0x48(%rbx);
//                                         GetRenderer @0x314b4 movq 0x48(%rdi),%rax]
//     +0x050  u32                        [ctor @0x3105a — renderer vtable *0x80
//                                         (GetParameter) with selector 0x13]
//     +0x054  u32                        [ctor @0x3106f — same vtable call with
//                                         selector 0x17]
//     +0x058  u32                        [ctor @0x310dd movl $0x0,0x58(%rbx)]
//     +0x05c  bool                       [ctor @0x310e4 movb $0x1,0x5c(%rbx)]
//     +0x060  u64                        [ctor @0x310e8 movq $0x5,0x60(%rbx)]
//     +0x068  u64                        [ctor @0x310f0 movq $0x186a0,0x68(%rbx)]
//     +0x070  16 bytes zeroed            [ctor @0x31036 movups %xmm0,0x70(%rbx)]
//     +0x080  u64                        [ctor @0x3103a movq $0x0,0x80(%rbx)]
//   }
//
// HGComputeDevice itself is NOT ported yet — the only field of it with a
// decoded reader on this class is +0x40 (the device index, read by
// `GetComputeDeviceIndex` @0x31488 `movl 0x40(%rax),%eax`), and that method is
// not part of this unit. It is therefore modeled as an opaque handle with the
// one decoded field, exactly like `HGLimitsPtr` in HGRenderer.ts.
//
// Per PORTING_SPEC.md Rules 2, 5, 6: every offset is cited @0xADDR, no magic
// numbers, one FCP class per file.

/**
 * Opaque handle to `HGComputeDevice` — the Metal/CPU compute device a render
 * context executes on. Not yet ported; the only field with a decoded reader
 * reachable from HGRenderContext is +0x40.
 */
export interface HGComputeDevicePtr {
  readonly __brand: "HGComputeDevice";
  /** @Helium HGComputeDevice +0x40 — u32 device index, read by
   *  `HGRenderContext::GetComputeDeviceIndex()` @0x31488
   *  (`movl 0x40(%rax),%eax`, where %rax = *(this+0x10)). */
  deviceIndex: number;
}

/**
 * `std::shared_ptr<HGComputeDevice>` as laid out at HGRenderContext +0x10.
 *
 * The two words are pinned by the constructor's zero-init
 * (@0x31032 `movups %xmm0, 0x10(%rbx)` — 16 bytes) and by the release
 * sequence it runs on the old value: @0x310a5 `movq 0x18(%rbx),%r14`
 * (the control block), @0x310ba `lock xaddq $-1, 0x8(%r14)` (decrement the
 * strong count at __shared_weak_count+0x8), @0x310ca `callq *0x10(%rax)`
 * (__on_zero_shared) and @0x310d0 `__shared_weak_count::__release_weak()`.
 *
 * Modeled as an object so that a JS reference to it IS the `&(this+0x10)`
 * that `GetComputeDevice` returns.
 */
export interface HGComputeDeviceSharedPtr {
  /** @+0x10 — `__ptr_`: the HGComputeDevice object pointer (null when the
   *  ctor's `movups %xmm0` zero-init @0x31032 is the last write). */
  ptr: HGComputeDevicePtr | null;
  /** @+0x18 — `__cntrl_`: the std::__shared_weak_count control block. Only
   *  its identity and its strong count at +0x08 (@0x310ba) are observed by
   *  decoded code, so it is held opaquely. */
  cntrl: unknown;
}

export class HGRenderContext {
  /**
   * @+0x10 — `std::shared_ptr<HGComputeDevice> computeDevice`.
   *
   * Zero-initialized by the ctor @0x31032 (`movups %xmm0, 0x10(%rbx)`), which
   * is why both words default to null here. The whole 16-byte member is one
   * sub-object; `GetComputeDevice` @0x31474 returns its ADDRESS, so this
   * object identity is the returned reference.
   */
  computeDevice: HGComputeDeviceSharedPtr = { ptr: null, cntrl: null };

  /**
   * @+0x24 — `u32 type`, the device-class discriminator (0 = CPU, 1 = GPU,
   * 2 = GL; see the layout table above for the three `cmpl` immediates that
   * pin the encoding).
   *
   * Defaults to 0 because the ctor's 8-byte store @0x3109a
   * (`movq $0x1, 0x20(%rbx)`) writes 1 into the u32 at +0x20 and 0 into the
   * u32 at +0x24. The GPU subclass overwrites it with 1 @0x3ed2a.
   */
  type: number = 0;

  /**
   * @+0x28 — `u32 workMode` (`HGRenderContext::WorkMode`).
   *
   * Defaults to 2 from the ctor @0x31093 (`movl $0x2, 0x28(%rbx)`); the same
   * literal is written by the no-arg ctor @0x30f50. Read back verbatim by
   * `GetWorkMode()` @0x31494 (`movl 0x28(%rdi), %eax`).
   */
  workMode: number = 2;

  /**
   * `HGRenderContext::IsCPU() const` — Helium @0x00031280
   * (mangled `__ZNK15HGRenderContext5IsCPUEv`).
   *
   * Full transcription (5 instructions + padding):
   *
   *   0x31280  pushq   %rbp
   *   0x31281  movq    %rsp, %rbp
   *   0x31284  cmpl    $0x0, 0x24(%rdi)   ; flags on (this->type - 0)
   *   0x31288  sete    %al                ; al = (ZF == 1) = (type == 0)
   *   0x3128b  popq    %rbp
   *   0x3128c  retq                       ; return al as bool
   *   0x3128d  nopl    (%rax)             ; alignment padding, not code
   *
   * AT&T decode note (PORTING_SPEC Rule 4): `cmpl $0x0, 0x24(%rdi)` computes
   * `dst - src` = `type - 0`, and `sete` is the ZF=1 condition — an exact
   * EQUALITY test against the CPU code 0. The compiler kept the explicit
   * `cmpl $0x0` (not the shorter `testl %eax,%eax` form), so the body is the
   * same shape as the IsGPU @0x31294 / IsGL @0x312a4 siblings with a
   * different immediate. `sete` writes the low byte only = SysV `bool`.
   *
   * Reads the same `+0x24 type` slot declared above, whose default of 0 comes
   * from the ctor's 8-byte store @0x3109a — so a default-constructed context
   * answers `true` here and `false` to `IsGPU()`.
   *
   * Zero callees, zero externs, zero indirect calls.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGRenderContext5IsCPUEv.s
   */
  IsCPU(): boolean {
    // @Helium 0x31284: cmpl $0x0, 0x24(%rdi)
    // @Helium 0x31288: sete %al
    return (this.type | 0) === 0;
  }

  /**
   * `HGRenderContext::IsGPU() const` — Helium @0x00031290
   * (mangled `__ZNK15HGRenderContext5IsGPUEv`).
   *
   * Full transcription (6 instructions + padding):
   *
   *   0x31290  pushq   %rbp
   *   0x31291  movq    %rsp, %rbp
   *   0x31294  cmpl    $0x1, 0x24(%rdi)   ; flags on (this->type - 1)
   *   0x31298  sete    %al                ; al = (ZF == 1) = (type == 1)
   *   0x3129b  popq    %rbp
   *   0x3129c  retq                       ; return al as bool
   *   0x3129d  nopl    (%rax)             ; alignment padding, not code
   *
   * AT&T decode note (PORTING_SPEC Rule 4): `cmpl $0x1, 0x24(%rdi)` computes
   * `dst - src` = `type - 1`, and `sete` is the ZF=1 condition — so this is an
   * exact EQUALITY test against the GPU code 1, not a bit test. `sete` writes
   * the low byte only, which is precisely a SysV-ABI C++ `bool` return.
   *
   * Zero callees, zero externs, zero indirect calls.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGRenderContext5IsGPUEv.s
   */
  IsGPU(): boolean {
    // @Helium 0x31294: cmpl $0x1, 0x24(%rdi)
    // @Helium 0x31298: sete %al
    return (this.type | 0) === 1;
  }

  /**
   * `HGRenderContext::SetWorkMode(HGRenderContext::WorkMode)` — Helium
   * @0x00031450 (mangled `__ZN15HGRenderContext11SetWorkModeENS_8WorkModeE`).
   *
   * Full transcription (5 instructions + padding):
   *
   *   0x31450  pushq   %rbp
   *   0x31451  movq    %rsp, %rbp
   *   0x31454  movl    %esi, 0x28(%rdi)   ; this->workMode = mode  (32-bit store)
   *   0x31457  popq    %rbp
   *   0x31458  retq
   *   0x31459  nopl    (%rax)             ; alignment padding, not code
   *
   * A bare 32-bit field store: the enum argument arrives in `%esi` (arg1 after
   * the `this` pointer in `%rdi`) and is written verbatim to +0x28. There is NO
   * validation, NO clamp, NO notification of the renderer and no read-back —
   * the whole method is that one `movl`. The `| 0` mirrors the 32-bit width of
   * the store (`movl`, not `movq`), matching what `GetWorkMode()` @0x31494
   * reads back with `movl 0x28(%rdi), %eax`.
   *
   * Zero callees, zero externs, zero indirect calls.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN15HGRenderContext11SetWorkModeENS_8WorkModeE.s
   */
  SetWorkMode(mode: number): void {
    // @Helium 0x31454: movl %esi, 0x28(%rdi)
    this.workMode = mode | 0;
  }

  /**
   * `HGRenderContext::GetWorkMode()` — Helium @0x00031490
   * (mangled `__ZN15HGRenderContext11GetWorkModeEv`).
   *
   * Full transcription (5 instructions + padding):
   *
   *   0x31490  pushq   %rbp
   *   0x31491  movq    %rsp, %rbp
   *   0x31494  movl    0x28(%rdi), %eax   ; return this->workMode  (32-bit load)
   *   0x31497  popq    %rbp
   *   0x31498  retq
   *   0x31499  nopl    (%rax)             ; alignment padding, not code
   *
   * The exact inverse of `SetWorkMode` @0x31454 (`movl %esi, 0x28(%rdi)`) on
   * the same slot: a bare 32-bit load, no masking, no clamping, no validation
   * against the WorkMode enum range, no lock (contrast `Lock()` @0x311f0).
   * `movl` zero-extends into %rax, but the ABI return here is the 32-bit
   * `%eax` — the enum is an `int`-sized value, so the `| 0` keeps the port at
   * the same 32-bit width the instruction operates on and returns the field
   * verbatim, including the ctor default of 2 (@0x31093 `movl $0x2,
   * 0x28(%rbx)`; the no-arg ctor writes the same literal @0x30f50).
   *
   * Zero callees, zero externs, zero indirect calls.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN15HGRenderContext11GetWorkModeEv.s
   */
  GetWorkMode(): number {
    // @Helium 0x31494: movl 0x28(%rdi), %eax
    return this.workMode | 0;
  }

  /**
   * `HGRenderContext::GetComputeDevice()` — Helium @0x00031470.
   *
   * Returns a REFERENCE to the `std::shared_ptr<HGComputeDevice>` member at
   * `this + 0x10` — the function computes an address, it does not load
   * through it. Full transcription (5 instructions + padding):
   *
   *   0x31470  pushq   %rbp
   *   0x31471  movq    %rsp, %rbp
   *   0x31474  leaq    0x10(%rdi), %rax    ; return &this->computeDevice
   *   0x31478  popq    %rbp
   *   0x31479  retq
   *   0x3147a  nopw    (%rax,%rax)         ; alignment padding, not code
   *
   * `leaq` (load EFFECTIVE address), not `movq (%rdi)` — contrast the sibling
   * `GetComputeDeviceIndex` @0x31484 which DOES dereference
   * (`movq 0x10(%rdi),%rax ; movl 0x40(%rax),%eax`). The C++ signature is
   * therefore `std::shared_ptr<HGComputeDevice>& GetComputeDevice()`: the
   * caller receives the member itself, not a copy (no retain is performed —
   * there is no `lock xaddq` on the control block anywhere in this body).
   *
   * The faithful JS equivalent of returning `&member` is returning the member
   * object, since a JS object value IS a reference: mutations the caller makes
   * through the result are visible on `this`, exactly as in the binary.
   *
   * Zero callees, zero externs, zero indirect calls, no null check.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN15HGRenderContext16GetComputeDeviceEv.s
   */
  GetComputeDevice(): HGComputeDeviceSharedPtr {
    // @Helium 0x31474: leaq 0x10(%rdi), %rax
    return this.computeDevice;
  }
}
