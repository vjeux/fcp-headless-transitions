// SimplePoolingPolicy.ts — Helium.framework. A concrete HGTexturePoolingPolicy
// backed by (a) an integer cap on the pool size in bytes and (b) a float
// clamp-to-[0,1] finish-queue ratio. Owns a single virtual pool object
// referenced through an HGRef at +0x10 whose vtable methods are called
// indirectly (dispatch decoded but callee bodies are frontier — see stubs).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    re/disasm/Helium.SimplePoolingPolicy.*.s (otool -tV, x86_64 slice).
// VTABLE:    resolve.py Helium vtable SimplePoolingPolicy — installed ptr @0xa07838 = vtable base
//            0xa07828 + 0x10. Slots (this class overrides):
//              *0x28  preAllocateTexture(u32,u32,u32,u32,u32) -> @0x45a90
//              *0x30  renderEnd()                              -> @0x45b80
//              *0x38  waitForQueuedForDeletionTextures()       -> @0x45b90
//              *0x00/*0x08 dtor D1/D0                          -> @0x459e0 / @0x45a20
//              *0x10 HGObject::Retain, *0x18 HGObject::Release, *0x20 debugDescription — inherited.
//
// SYMBOLS (from /tmp/Helium_symmap.tsv):
//   __ZN19SimplePoolingPolicyC2Ev                         @0x0000000000045940  ctor (base)
//   __ZN19SimplePoolingPolicyC1Ev                         @0x0000000000045970  ctor (complete)
//   __ZN19SimplePoolingPolicyD2Ev                         @0x00000000000459a0  dtor (base)
//   __ZN19SimplePoolingPolicyD1Ev                         @0x00000000000459e0  dtor (complete)
//   __ZN19SimplePoolingPolicyD0Ev                         @0x0000000000045a20  dtor (deleting)
//   __ZN19SimplePoolingPolicy14setMaxPoolSizeEm           @0x0000000000045a60  setMaxPoolSize(u64)
//   __ZN19SimplePoolingPolicy26setMaxFinishQueueSizeRatioEf @0x0000000000045a70  setMaxFinishQueueSizeRatio(f32)
//   __ZN19SimplePoolingPolicy18preAllocateTextureEjjjjj   @0x0000000000045a90  preAllocateTexture(u32,u32,u32,u32,u32)
//   __ZN19SimplePoolingPolicy9renderEndEv                 @0x0000000000045b80  renderEnd()
//   __ZN19SimplePoolingPolicy32waitForQueuedForDeletionTexturesEv @0x0000000000045b90  waitForQueuedForDeletionTextures()
//
// INHERITANCE (proven by ctor body @0x45979):
//   SimplePoolingPolicy -> HGObject (single, non-virtual inheritance at +0).
//     - Ctor  @0x045979 callq __ZN8HGObjectC2Ev = HGObject::HGObject().
//
// INSTANCE LAYOUT (recovered from ctor + method field accesses):
//   +0x00   vtable pointer                (installed by ctor @0x04598c: leaq 0x9c1eac(%rip),%rax;
//                                          movq %rax,(%rbx) — RIP-target = 0x4598c(next)+0x9c1eac
//                                          = 0xa07838, the "first-function" slot of the vtable
//                                          @0xa07828 + 0x10).
//   +0x08   <inherited HGObject bytes>    (written by HGObject::HGObject())
//   +0x10   HGRef payload for the pool object (16 bytes: obj-ptr + refcount-ptr).
//                                         Zeroed by ctor @0x045981 `movups %xmm0,0x10(%rbx)`.
//                                         Read as `movq 0x10(%rdi),%rsi` in preAllocateTexture
//                                         @0x045aa1 and waitForQueuedForDeletionTextures
//                                         @0x045b99, treated as a polymorphic object whose
//                                         vtable is dereferenced via `movq (%rsi),%rax`.
//   +0x18   u64  m_maxPoolSize             (written by setMaxPoolSize @0x045a64
//                                          `movq %rsi,0x18(%rdi)`; read in preAllocateTexture
//                                          @0x045aef and waitForQueuedForDeletionTextures
//                                          @0x045bb7/@0x045bec).
//   +0x20   f32  m_maxFinishQueueSizeRatio (initialized to 0x3f000000 = 0.5f by ctor @0x04598f
//                                          `movl $0x3f000000,0x20(%rbx)`; written by
//                                          setMaxFinishQueueSizeRatio @0x045a87
//                                          `movss %xmm0,0x20(%rdi)`; read in
//                                          waitForQueuedForDeletionTextures @0x045bfa
//                                          `mulss 0x20(%rbx),%xmm1`).
//
// Total own storage: 16 bytes HGRef @+0x10 + 8 bytes u64 @+0x18 + 4 bytes f32 @+0x20 = 28 bytes.
//
// DECODED RIP-RELATIVE CONSTANT (setMaxFinishQueueSizeRatio):
//   @0x045a74 `movss 0x382244(%rip),%xmm1` -> RIP target = 0x045a7c(next) + 0x382244 = 0x3c7cc0.
//   File offset (x86_64 fat slice base 0x4000) = 0x4000+0x3c7cc0 -> bytes 00 00 80 3f = 1.0f.
//   Confirms the clamp-upper is 1.0f. Lower is +0.0f from `xorps %xmm0,%xmm0` @0x045a80.

import { HGObject_ctor, HGObject_dtor } from "../render/HGObject_stub";

/**
 * HGRef payload as seen at SimplePoolingPolicy+0x10. Two-pointer struct
 * (object + refcount). The concrete class of `obj` is dispatched through
 * its own vtable at runtime; SimplePoolingPolicy never names it directly.
 *
 * @+0x00  obj: pointer to the polymorphic pool object (its first qword is
 *         its vtable).
 * @+0x08  refCount: reference-count block pointer.
 *
 * @classAddr Helium 0x45981 (ctor zeroes both slots with `movups %xmm0`).
 */
export interface PoolHGRef {
  obj: PoolVtableHolder | null;
  refCount: unknown;
}

/**
 * Minimal interface for the polymorphic pool object referenced through the
 * HGRef at SimplePoolingPolicy+0x10. Only the vtable slots that this class
 * calls are named here — every one is a frontier stub because the concrete
 * class is attached at runtime by HGTextureManager::setTexturePoolingPolicy
 * (code not in this class and not yet decoded).
 *
 * Slots this class dispatches (indirect call sites cited in the stubs):
 *   pool.vt[*0x28]  — preAllocateTexture @0x045aac: writes stack-local iter.
 *   pool.vt[*0x38]  — preAllocateTexture @0x045aec (esi=3,edx=1),
 *                     waitForQueuedForDeletionTextures @0x045baa (esi=2,edx=1).
 *                     Same slot on iter @0x045afc returns current texture.
 *   pool.vt[*0x48]  — preAllocateTexture @0x045aca: deletes given texture.
 *   iter.vt[*0x28]  — preAllocateTexture @0x045ad4: isAtEnd bool.
 *   iter.vt[*0x18]  — preAllocateTexture @0x045b38 (and @0x045b63):
 *                     HGObject::Release on the iterator on the way out.
 *
 * @classAddr Helium 0x45aa5 (first vtable dereference — `movq (%rsi),%rax`).
 */
export interface PoolVtableHolder {
  // vtable is opaque; concrete callees are frontier.
  vt: unknown;
}

/**
 * SimplePoolingPolicy.
 *
 * @classAddr Helium
 *   ctor  @0x0000000000045940 (C2) / @0x0000000000045970 (C1)
 *   dtor  @0x00000000000459a0 (D2) / @0x00000000000459e0 (D1) / @0x0000000000045a20 (D0)
 *   setMaxPoolSize                    @0x0000000000045a60
 *   setMaxFinishQueueSizeRatio        @0x0000000000045a70
 *   preAllocateTexture                @0x0000000000045a90
 *   renderEnd                         @0x0000000000045b80
 *   waitForQueuedForDeletionTextures  @0x0000000000045b90
 */
export class SimplePoolingPolicy {
  /** @+0x10 HGRef to the pool object. Zeroed by ctor @0x045981. */
  m_pool: PoolHGRef;
  /** @+0x18 u64 hard cap on pool byte-size. Written by setMaxPoolSize
   *  @0x045a64 `movq %rsi,0x18(%rdi)`. */
  m_maxPoolSize: bigint;
  /** @+0x20 f32 clamp of finish-queue size ratio. Initialized to 0.5f
   *  (0x3f000000) by ctor @0x04598f. */
  m_maxFinishQueueSizeRatio: number;

  /**
   * SimplePoolingPolicy::SimplePoolingPolicy() — @0x0000000000045940 (C2) /
   * @0x0000000000045970 (C1). Both bodies are identical:
   *   0x045979  callq  HGObject::HGObject()    ; base subobject at +0
   *   0x04597e  xorps  %xmm0,%xmm0
   *   0x045981  movups %xmm0,0x10(%rbx)        ; zero HGRef @+0x10 (16 bytes)
   *   0x045985  leaq   0x9c1eac(%rip),%rax     ; &vtable_of_SimplePoolingPolicy+0x10
   *   0x04598c  movq   %rax,(%rbx)             ; install vptr @+0x00
   *   0x04598f  movl   $0x3f000000,0x20(%rbx)  ; this->m_maxFinishQueueSizeRatio = 0.5f
   */
  constructor() {
    HGObject_ctor(this);
    this.m_pool = { obj: null, refCount: null };   // @0x045981 zero-init
    this.m_maxPoolSize = 0n;                       // ctor never touches +0x18 (C++ leaves it
                                                   // uninitialized); every read is guarded by a
                                                   // subsequent setMaxPoolSize call in
                                                   // HGDefaultPolicies::getStudioPoolingPolicy.
                                                   // Choose 0n for a defined start.
    this.m_maxFinishQueueSizeRatio = Math.fround(0.5); // @0x04598f 0x3f000000 = 0.5f
  }

  /**
   * SimplePoolingPolicy::~SimplePoolingPolicy() — @0x00000000000459a0 (D2) /
   * @0x00000000000459e0 (D1) / @0x0000000000045a20 (D0). Bodies not disassembled
   * yet; when transcribed they will release the HGRef @+0x10 and call
   * HGObject::~HGObject(). Delegating to the base stub so the completion
   * frontier is a hard, cited failure mode.
   */
  destroy(): void {
    HGObject_dtor(this);
  }

  /**
   * SimplePoolingPolicy::setMaxPoolSize(unsigned long) — @0x0000000000045a60.
   * Whole body @0x045a60..@0x045a69:
   *   pushq %rbp; movq %rsp,%rbp
   *   0x045a64  movq %rsi,0x18(%rdi)     ; this->m_maxPoolSize = size
   *   popq %rbp; retq
   *
   * @param size unsigned 64-bit byte-cap. Stored verbatim.
   */
  setMaxPoolSize(size: bigint): void {
    // @0x045a64 movq %rsi,0x18(%rdi) — direct qword store, no clamp/no widening.
    this.m_maxPoolSize = BigInt.asUintN(64, size);
  }

  /**
   * SimplePoolingPolicy::setMaxFinishQueueSizeRatio(float) — @0x0000000000045a70.
   * Whole body @0x045a70..@0x045a8d — clamps x into [0.0f, 1.0f]:
   *   pushq %rbp; movq %rsp,%rbp
   *   0x045a74  movss 0x382244(%rip),%xmm1    ; xmm1 = 1.0f (decoded from 0x3c7cc0)
   *   0x045a7c  minss %xmm0,%xmm1             ; xmm1 = min(1.0f, ratio)
   *   0x045a80  xorps %xmm0,%xmm0             ; xmm0 = 0.0f
   *   0x045a83  maxss %xmm1,%xmm0             ; xmm0 = max(0.0f, min(1.0f, ratio))
   *   0x045a87  movss %xmm0,0x20(%rdi)        ; this->m_maxFinishQueueSizeRatio = xmm0
   *   popq %rbp; retq
   *
   * SSE minss/maxss are NOT commutative on NaN — they return source1 when
   * either input is NaN:
   *   minss %xmm0,%xmm1  ->  xmm1 = (xmm1 < xmm0) ? xmm1 : xmm0    (NaN -> xmm0)
   *   maxss %xmm1,%xmm0  ->  xmm0 = (xmm0 > xmm1) ? xmm0 : xmm1    (NaN -> xmm1)
   */
  setMaxFinishQueueSizeRatio(ratio: number): void {
    // @0x045a74 xmm1 = 1.0f; @0x045a7c minss %xmm0,%xmm1 (xmm1 = (xmm1<xmm0)?xmm1:xmm0).
    const one = Math.fround(1.0);            // decoded @0x3c7cc0
    const r = Math.fround(ratio);
    const min1: number = (one < r) ? one : r; // SSE minss semantics: NaN -> source (r)
    // @0x045a80 xmm0 = 0.0f; @0x045a83 maxss %xmm1,%xmm0 (xmm0 = (xmm0>xmm1)?xmm0:xmm1).
    const zero = Math.fround(0.0);
    const max0: number = (zero > min1) ? zero : min1; // SSE maxss: NaN -> source (min1)
    // @0x045a87 movss %xmm0,0x20(%rdi).
    this.m_maxFinishQueueSizeRatio = Math.fround(max0);
  }

  /**
   * SimplePoolingPolicy::preAllocateTexture(u32,u32,u32,u32,u32) — @0x0000000000045a90.
   * Signature `(w,h,depth,format,usage)` from mangled `Ejjjjj` (five u32).
   * The body reads only `this` (rdi); the five arg registers are consumed
   * inside pool.vt[*0x28] (frontier).
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq {r15,r14,r13,r12,rbx}; pushq %rax
   *   0x045a9e  movq %rdi,%rbx                    ; rbx = this
   *   0x045aa1  movq 0x10(%rdi),%rsi              ; rsi = this->m_pool.obj
   *   0x045aa5  movq (%rsi),%rax                  ; rax = pool.vtable
   *   0x045aa8  leaq -0x30(%rbp),%rdi             ; rdi = &iter (16-byte stack HGRef)
   *   0x045aac  callq *0x28(%rax)                 ; iter <- pool->beginEvictionIter(&iter)
   *   0x045aaf  leaq HGLogger::_enabled(%rip),%r13
   *   0x045ab6  leaq (pool too large fmt string)(%rip),%r15
   *   0x045abd  jmp  0x45acd                      ; jump into loop header
   * loop_body @0x045ac0:
   *   0x045ac0  movq -0x30(%rbp),%rdi             ; rdi = iter.obj
   *   0x045ac4  movq (%rdi),%rax                  ; rax = iter.vtable
   *   0x045ac7  movq %r12,%rsi                    ; rsi = victim texture-ref
   *   0x045aca  callq *0x48(%rax)                 ; iter->deleteTexture(victim)
   * loop_head @0x045acd:
   *   0x045acd  movq -0x30(%rbp),%rdi             ; rdi = iter.obj
   *   0x045ad1  movq (%rdi),%rax                  ; rax = iter.vtable
   *   0x045ad4  callq *0x28(%rax)                 ; al = iter->isAtEnd()
   *   0x045ad7  testb %al,%al
   *   0x045ad9  jne  0x45b2c                      ; if end -> break
   *   0x045adb  movq 0x10(%rbx),%rdi              ; rdi = this->m_pool.obj
   *   0x045adf  movq (%rdi),%rax                  ; rax = pool.vtable
   *   0x045ae2  movl $0x3,%esi                    ; arg1 = 3
   *   0x045ae7  movl $0x1,%edx                    ; arg2 = 1
   *   0x045aec  callq *0x38(%rax)                 ; rax = pool->getSize(3,1) (u64 pool bytes)
   *   0x045aef  cmpq 0x18(%rbx),%rax              ; compare pool_size vs this->m_maxPoolSize
   *   0x045af3  jbe  0x45b2c                      ; if pool_size <= max -> break loop
   *   0x045af5  movq -0x30(%rbp),%rdi
   *   0x045af9  movq (%rdi),%rax
   *   0x045afc  callq *0x38(%rax)                 ; rax = iter->currentTextureRef() (u64)
   *   0x045aff  movq %rax,%r12                    ; r12 = victim ref
   *   0x045b02  movzbl (%r13),%eax                ; al = HGLogger::_enabled
   *   0x045b07  cmpb $0x1,%al
   *   0x045b09  jne  0x45ac0                      ; if not enabled, straight to body
   *   0x045b0b  movl 0x40(%rdx),%ecx              ; ecx = *(u32*)((rdx from *0x38)+0x40) (log arg)
   *   0x045b0e  leaq "texManager"(%rip),%rdi
   *   0x045b15  movl $0x2,%esi
   *   0x045b1a  movq %rdx,%r14
   *   0x045b1d  movq %r15,%rdx
   *   0x045b20  xorl %eax,%eax
   *   0x045b22  callq HGLogger::log("texManager",2,fmt,arg)
   *   0x045b27  movq %r14,%rdx
   *   0x045b2a  jmp  0x45ac0
   * exit @0x045b2c:
   *   0x045b2c  movq -0x30(%rbp),%rdi
   *   0x045b30  testq %rdi,%rdi
   *   0x045b33  je   0x45b3b
   *   0x045b35  movq (%rdi),%rax
   *   0x045b38  callq *0x18(%rax)                 ; iter.HGObject::Release()
   *   0x045b3b  ...  pop regs; retq
   */
  preAllocateTexture(_w: number, _h: number, _depth: number, _format: number, _usage: number): void {
    // @0x045aa1..0x045aac: iter = pool->beginEvictionIter().
    const iter = pool_beginEvictionIter_slot_0x28(this.m_pool);
    // @0x045acd..0x045b3f: eviction loop.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x045ad4 callq *0x28 -> iter.isAtEnd()
      if (iter_isAtEnd_slot_0x28(iter)) break;
      // @0x045aec callq *0x38(pool) with (esi=3, edx=1) -> u64 pool_size
      const pool_size = pool_getSize_slot_0x38(this.m_pool, 3, 1);
      // @0x045aef cmpq 0x18(%rbx),%rax ; jbe exit (unsigned pool_size <= m_maxPoolSize -> exit)
      if (pool_size <= this.m_maxPoolSize) break;
      // @0x045afc callq *0x38 on iter -> u64 victim ref
      const victim = iter_currentTextureRef_slot_0x38(iter);
      // @0x045b02..@0x045b27: HGLogger-gated log.
      hgLogger_maybeLog_poolTooLarge_at_0x045b22(victim);
      // @0x045aca callq *0x48(iter) with rsi=victim -> iter.deleteTexture(victim)
      iter_deleteTexture_slot_0x48(iter, victim);
    }
    // @0x045b30..@0x045b38: iter release (skipped if iter payload is null).
    iter_release_slot_0x18(iter);
  }

  /**
   * SimplePoolingPolicy::renderEnd() — @0x0000000000045b80. Empty body:
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   * Deliberate no-op; overridden by MultiGPUPoolingPolicy @0x46d20.
   */
  renderEnd(): void {
    // @0x045b80 pushq %rbp / movq %rsp,%rbp / popq %rbp / retq — no-op.
  }

  /**
   * SimplePoolingPolicy::waitForQueuedForDeletionTextures() — @0x0000000000045b90.
   *
   * Body @0x045b90..@0x045c0b: returns a bool = "queuedForDeletionSize (as f32)
   * > m_maxFinishQueueSizeRatio (f32) * m_maxPoolSize (as f32)". All three
   * pieces use the standard u64->f32 conversion trick — `cvtsi2ss` treats
   * input as signed; for values with bit63 set the compiler emits
   * `(x>>1)|(x&1)` cvtsi2ss then doubles.
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   0x045b96  movq %rdi,%rbx                    ; rbx = this
   *   0x045b99  movq 0x10(%rdi),%rdi              ; rdi = this->m_pool.obj
   *   0x045b9d  movq (%rdi),%rax                  ; rax = pool.vtable
   *   0x045ba0  movl $0x2,%esi                    ; arg1 = 2
   *   0x045ba5  movl $0x1,%edx                    ; arg2 = 1
   *   0x045baa  callq *0x38(%rax)                 ; rax = pool->getSize(2,1) (u64 queued)
   *   0x045bad  testq %rax,%rax
   *   0x045bb0  js   0x45bd7                      ; if signed<0 (bit63) -> u64 branch
   *   0x045bb2  cvtsi2ss %rax,%xmm0               ; xmm0 = (f32)(i64)rax (fast)
   *   0x045bb7  movq 0x18(%rbx),%rax              ; rax = m_maxPoolSize
   *   0x045bbb  testq %rax,%rax
   *   0x045bbe  jns  0x45bf5                      ; if signed>=0 -> fast max path
   *   0x045bc0  movq %rax,%rcx
   *   0x045bc3  shrq %rcx
   *   0x045bc6  andl $0x1,%eax
   *   0x045bc9  orq  %rcx,%rax
   *   0x045bcc  cvtsi2ss %rax,%xmm1
   *   0x045bd1  addss %xmm1,%xmm1
   *   0x045bd5  jmp  0x45bfa
   *   0x045bd7  movq %rax,%rcx                    ; (from js above) same u64->f32 for queued
   *   0x045bda  shrq %rcx
   *   0x045bdd  andl $0x1,%eax
   *   0x045be0  orq  %rcx,%rax
   *   0x045be3  cvtsi2ss %rax,%xmm0
   *   0x045be8  addss %xmm0,%xmm0
   *   0x045bec  movq 0x18(%rbx),%rax              ; (repeat max read for the second branch)
   *   0x045bf0  testq %rax,%rax
   *   0x045bf3  js   0x45bc0
   *   0x045bf5  cvtsi2ss %rax,%xmm1               ; xmm1 = (f32)(i64) m_maxPoolSize (fast)
   *   0x045bfa  mulss 0x20(%rbx),%xmm1            ; xmm1 = xmm1 * m_maxFinishQueueSizeRatio
   *   0x045bff  ucomiss %xmm1,%xmm0               ; compare queued_f vs max_f * ratio
   *   0x045c02  seta %al                          ; al = (queued_f > max_f * ratio) & ordered
   *
   * `ucomiss` + `seta` yields TRUE only when queued_f > rhs AND neither is NaN
   * (unordered -> CF=1 -> seta clears). Preserved exactly.
   */
  waitForQueuedForDeletionTextures(): boolean {
    // @0x045baa: u64 queued = pool->getSize(2, 1).
    const queued = pool_getSize_slot_0x38(this.m_pool, 2, 1);
    // @0x045bad-@0x045bea u64->f32 via cvtsi2ss trick.
    const queued_f: number = u64ToF32_cvtsi2ss_trick(queued);
    // @0x045bb7/@0x045bec + @0x045bf5: same u64->f32 for m_maxPoolSize.
    const max_f: number = u64ToF32_cvtsi2ss_trick(this.m_maxPoolSize);
    // @0x045bfa mulss 0x20(%rbx),%xmm1 — single-precision multiply.
    const rhs = Math.fround(max_f * this.m_maxFinishQueueSizeRatio);
    // @0x045bff ucomiss / @0x045c02 seta: TRUE iff queued_f > rhs and ordered.
    if (Number.isNaN(queued_f) || Number.isNaN(rhs)) return false; // seta on unordered -> 0
    return queued_f > rhs;
  }
}

/**
 * u64 -> f32 conversion faithful to the compiler-emitted `cvtsi2ss` +
 * `(x>>1)|(x&1)`-doubled pattern used in waitForQueuedForDeletionTextures
 * @0x045bb0-@0x045bf5.
 *
 * @classAddr Helium 0x045bb0 (`testq %rax,%rax; js ...`) — the signed-check
 * that selects between direct cvtsi2ss and the shifted-double path.
 */
export function u64ToF32_cvtsi2ss_trick(x: bigint): number {
  // Bit 63 test — matches `testq %rax,%rax; js`.
  if ((x & (1n << 63n)) === 0n) {
    // Fast path @0x045bb2 / @0x045bf5: cvtsi2ss on a non-negative i64.
    return Math.fround(Number(x));
  }
  // Slow path @0x045bc0..@0x045bd1 (and @0x045bd7..@0x045be8): halve, or-in
  // the low bit, convert as signed positive i63, then double.
  const half = x >> 1n;
  const low = x & 1n;
  const combined = half | low;
  return Math.fround(Math.fround(Number(combined)) * 2);
}

// -----------------------------------------------------------------------------
// Frontier vtable-slot stubs. Every one throws with the exact indirect call-site
// @0xADDR and the vtable slot it dispatches. Bodies belong to whichever concrete
// class HGTextureManager::setTexturePoolingPolicy attaches at runtime; that
// wiring is not in SimplePoolingPolicy and is not yet decoded.
// -----------------------------------------------------------------------------

/** pool.vt[*0x28] — called at Helium @0x045aac to begin the eviction iterator. */
function pool_beginEvictionIter_slot_0x28(_pool: PoolHGRef): PoolHGRef {
  throw new Error(
    "pool.vtable[*0x28] beginEvictionIter (indirect call site @0x045aac in " +
    "SimplePoolingPolicy::preAllocateTexture) — callee body pending decode"
  );
}

/** pool.vt[*0x38] — called at Helium @0x045aec (esi=3,edx=1) and @0x045baa (esi=2,edx=1). */
function pool_getSize_slot_0x38(_pool: PoolHGRef, _kind: number, _mode: number): bigint {
  throw new Error(
    "pool.vtable[*0x38] getSize (indirect call sites @0x045aec and @0x045baa " +
    "in SimplePoolingPolicy) — callee body pending decode"
  );
}

/** iter.vt[*0x28] — called at Helium @0x045ad4; returns bool `isAtEnd`. */
function iter_isAtEnd_slot_0x28(_iter: PoolHGRef): boolean {
  throw new Error(
    "iter.vtable[*0x28] isAtEnd (indirect call site @0x045ad4 in " +
    "SimplePoolingPolicy::preAllocateTexture) — callee body pending decode"
  );
}

/** iter.vt[*0x38] — called at Helium @0x045afc; returns current texture-ref (u64). */
function iter_currentTextureRef_slot_0x38(_iter: PoolHGRef): bigint {
  throw new Error(
    "iter.vtable[*0x38] currentTextureRef (indirect call site @0x045afc in " +
    "SimplePoolingPolicy::preAllocateTexture) — callee body pending decode"
  );
}

/** iter.vt[*0x48] — called at Helium @0x045aca; evicts the passed texture. */
function iter_deleteTexture_slot_0x48(_iter: PoolHGRef, _tex: bigint): void {
  throw new Error(
    "iter.vtable[*0x48] deleteTexture (indirect call site @0x045aca in " +
    "SimplePoolingPolicy::preAllocateTexture) — callee body pending decode"
  );
}

/** iter.vt[*0x18] — called at Helium @0x045b38 and @0x045b63; HGObject::Release() on iter. */
function iter_release_slot_0x18(_iter: PoolHGRef): void {
  throw new Error(
    "iter.vtable[*0x18] Release (indirect call sites @0x045b38 and @0x045b63 " +
    "in SimplePoolingPolicy::preAllocateTexture) — callee body pending decode"
  );
}

/**
 * HGLogger-gated log line at Helium @0x045b22 (callq HGLogger::log). The body
 * of HGLogger::log is frontier — stubbing preserves the observable side effect
 * (a throw whenever logging is engaged) without inventing HGLogger's decoded
 * semantics.
 */
function hgLogger_maybeLog_poolTooLarge_at_0x045b22(_victim: bigint): void {
  // The disasm at @0x045b02 first reads HGLogger::_enabled (a byte). When it
  // is 0 (disabled) the call site is skipped entirely — that IS the runtime
  // behavior. Emulating that requires the HGLogger::_enabled global, which
  // is not ported. The callee stays a frontier stub so misuse throws.
  throw new Error(
    "HGLogger::log(texManager,2,fmt,arg) (indirect call site @0x045b22 in " +
    "SimplePoolingPolicy::preAllocateTexture; guarded by HGLogger::_enabled " +
    "@0x045ab6) — callee body pending decode"
  );
}

