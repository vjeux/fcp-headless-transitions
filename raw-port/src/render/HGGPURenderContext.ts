// raw-port/src/render/HGGPURenderContext.ts
//
// FCP `HGGPURenderContext` — Helium's GPU specialization of HGRenderContext (the render
// context an HGRenderQueue builds for a GPU compute device; see
// HGRenderQueue::CreateRenderContextForComputeDevice @Helium 0x61c90).
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//                   Versions/A/Helium (macOS FCP, x86_64 slice; VA == offset in the thin slice).
//
// THIS FILE PORTS ONE METHOD (one C++ method = one exported function citing its @0xADDR):
//
//   @Helium 0x3f680  HGGPURenderContext::GetGPUComputeDevice()
//                    mangled: __ZN18HGGPURenderContext19GetGPUComputeDeviceEv
//                    DECODE:  raw-port/re/disasm/Helium.__ZN18HGGPURenderContext19GetGPUComputeDeviceEv.s
//
// The class's other exported members — DumpContext @0x3f3a0, SetPreferredGPUGraphicsAPI
// @0x3f4b0, SetGraphConcatenationFlag @0x3f520, SetRendererPageSize @0x3f5a0,
// SetRenderFinishSyncFlag @0x3f610, GetGPURenderer @0x3f690, IsMetalOnly @0x3f6a0,
// GetRendererPageSize @0x3f6b0, GetGLContext @0x3f6c0, GetGLContextPriority @0x3f6f0,
// GetGraphConcatenationFlag @0x3f710, GetRenderFinishSyncFlag @0x3f720,
// SetGLContextPriority @0x3f730, SetGLTexturePoolingPolicy @0x3f8c0,
// SetGLTexturePaddingPolicy @0x3f990, the four ctor overloads (@0x3e960/@0x3ecd0 from
// HGGPURenderer*, @0x3ece0/@0x3ef90 from shared_ptr, @0x3ecf0/@0x3efa0 from
// shared_ptr+bool, @0x3efb0/@0x3f2d0 from shared_ptr+HGGLContextPtr) and the dtors
// (@0x3f2e0 D2, @0x3f370 D1, @0x3f380 D0) — are NOT ported here. This file is ADD-ONLY:
// each of those lands as its own exported function when its unit is claimed.
//
// ── INHERITANCE ─────────────────────────────────────────────────────────────────────────
// HGGPURenderContext derives from HGRenderContext: the C2 ctor @0x3ecf0 opens with
// `callq __ZN15HGRenderContextC2Ev` @0x3ed06, then installs its own vtable
// (`leaq 0x9c7d96(%rip),%rax ; movq %rax,(%rbx)` @0x3ed0b..0x3ed12, i.e. the
// `vtable for HGGPURenderContext` @Helium 0xa06a98 + 0x10 payload base), and then stamps
// `movl $0x1, 0x24(%rbx)` @0x3ed2a — writing the base class's `contextType` slot with the
// GPU code 1 (the exact value HGRenderContext::IsGPU() @0x31294 tests for; see
// raw-port/src/render/HGRenderContext.ts). So the base occupies +0x00..+0x87 and this
// subclass's own fields start at +0x88.
//
// ── FIELD-LAYOUT EVIDENCE (offsets on the HGGPURenderContext this*) ─────────────────────
//   +0x88  std::__1::shared_ptr<HGGPUComputeDevice const>::__ptr_   — the device pointer.
//   +0x90  std::__1::shared_ptr<HGGPUComputeDevice const>::__cntrl_ — the __shared_weak_count*.
//          Together +0x88..+0x97 are ONE 16-byte libc++ shared_ptr. Proof, all from the
//          shared_ptr+bool C2 ctor @0x3ecf0:
//            @0x3ed15..0x3ed18  `xorps %xmm0,%xmm0 ; movups %xmm0,0x88(%rbx)` — the member is
//                               zero-initialized as a single 16-byte unit (both words at once),
//                               which is the libc++ empty-shared_ptr representation.
//            @0x3ed31..0x3ed3e  the incoming `shared_ptr const&` (%r15) is read as
//                               `(%r15)` -> %rax (object ptr) and `0x8(%r15)` -> %rcx (control
//                               block), then `lock incq 0x8(%rcx)` bumps the STRONG count.
//            @0x3ed49..0x3ed50  `movq %rax,0x88(%rbx) ; movq %rcx,0x90(%rbx)` — the two words
//                               are stored to +0x88 and +0x90 respectively, i.e. the classic
//                               shared_ptr copy-assign (store new, then release old, the old
//                               __cntrl_ having been saved from 0x90(%rbx) @0x3ed42).
//            @0x3ef67           the ctor's unwind path runs `leaq 0x88(%rbx),%rdi` into the
//                               shared_ptr destructor — confirming +0x88 is the object's
//                               address, not merely the first word.
//   (+0x98 gpuRenderer, +0xa0, +0xa8, +0xaa isMetalOnly, +0xb0 HGGLContext* are sibling
//    fields visible in the same ctor and in GetGPURenderer @0x3f694 / IsMetalOnly @0x3f6a4 /
//    GetGLContext @0x3f6c9; they are NOT read by this method and are not modelled here.)
//
// NUMERICS: none — the ported method performs no arithmetic beyond forming an address.

import type { HGGPUComputeDeviceState } from "./HGGPUComputeDevice";

/**
 * `std::__1::__shared_weak_count` — the libc++ control block a shared_ptr points at. Only its
 * identity matters to this method (it is never dereferenced here); the strong/weak counters at
 * +0x8/+0x10 are the ones the ctor @0x3ed3e (`lock incq 0x8(%rcx)`) and the
 * `__release_weak` path @0x3eda1 manipulate.
 */
export interface StdSharedWeakCount {
  /** +0x08 of __shared_weak_count: the strong reference count (`lock incq 0x8(%rcx)` @0x3ed3e). */
  strong: number;
}

/**
 * `std::__1::shared_ptr<HGGPUComputeDevice const>` as laid out at +0x88..+0x97 of
 * HGGPURenderContext: a two-word record (object pointer, control block pointer).
 */
export interface SharedPtrHGGPUComputeDeviceConst {
  /** +0x00 of the shared_ptr (= +0x88 of the context): `__ptr_`, the device object. */
  ptr: HGGPUComputeDeviceState | null;
  /** +0x08 of the shared_ptr (= +0x90 of the context): `__cntrl_`, the control block. */
  cntrl: StdSharedWeakCount | null;
}

/**
 * The subset of the `HGGPURenderContext` object layout that
 * {@link hgGPURenderContext_GetGPUComputeDevice} touches. Modelled as an explicit fields
 * record (rather than a class) because only one method of the class is transcribed so far —
 * the base HGRenderContext portion (+0x00..+0x87) and the sibling GPU fields
 * (+0x98..+0xb7) are decoded by their own units and are deliberately not invented here.
 */
export interface HGGPURenderContextComputeDeviceField {
  /**
   * `+0x88  std::shared_ptr<HGGPUComputeDevice const> gpuComputeDevice` — the compute device
   * this context renders on. Zero-initialized @0x3ed18 and copy-assigned from the ctor
   * argument @0x3ed49/@0x3ed50.
   *
   * This must be a stable object identity: the ported method returns a REFERENCE to it (the
   * C++ signature returns `shared_ptr<HGGPUComputeDevice const> const&`), so callers observe
   * later mutations of the member through the returned value exactly as they do in C++.
   */
  gpuComputeDevice: SharedPtrHGGPUComputeDeviceConst;
}

/**
 * `HGGPURenderContext::GetGPUComputeDevice()` @Helium 0x3f680
 * (mangled `__ZN18HGGPURenderContext19GetGPUComputeDeviceEv`).
 *
 * Full body — every instruction of the function, in order
 * (raw-port/re/disasm/Helium.__ZN18HGGPURenderContext19GetGPUComputeDeviceEv.s):
 *
 *   0x3f680  pushq %rbp                   ; frame setup (no TS counterpart)
 *   0x3f681  movq  %rsp, %rbp             ; frame setup (no TS counterpart)
 *   0x3f684  leaq  0x88(%rdi), %rax       ; rax = &this->gpuComputeDevice  (ADDRESS, not a load)
 *   0x3f68b  popq  %rbp                   ; frame teardown (no TS counterpart)
 *   0x3f68c  retq                         ; return that address
 *   0x3f68d  nopl  (%rax)                 ; inter-function alignment padding, not executed
 *
 * The single real instruction is a `leaq`, NOT a `movq` — nothing is dereferenced and no
 * reference count is touched. That is the signature of a function returning a CONST REFERENCE
 * to an embedded member (contrast the sibling GetGPURenderer @0x3f694, which is
 * `movq 0x98(%rdi),%rax` — an actual pointer LOAD). Returning the member object itself is the
 * faithful TS rendering of `&this->gpuComputeDevice`: JS object identity is the reference.
 *
 * @param self the receiver (`%rdi`).
 * @returns a reference to this context's `shared_ptr<HGGPUComputeDevice const>` member.
 */
export function hgGPURenderContext_GetGPUComputeDevice(
  self: HGGPURenderContextComputeDeviceField,
): SharedPtrHGGPUComputeDeviceConst {
  // @Helium 0x3f684: leaq 0x88(%rdi), %rax
  return self.gpuComputeDevice;
}
