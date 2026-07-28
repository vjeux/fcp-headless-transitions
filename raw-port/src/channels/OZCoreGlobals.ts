// OZCoreGlobals.ts — raw transcription of ProChannel `OZCoreGlobals`.
//
// A dispatch_once-guarded singleton derived from PCSingleton. Holds a `tag`
// (PCSingleton payload set to 0x1000000) and a CMTime snapshot initialized from the
// CoreMedia global `kCMTimeZero`. `getInstance()` lazy-initializes exactly once via
// libdispatch's `dispatch_once` and returns the resulting pointer.
//
// Provenance (ProChannel framework, x86_64 slice):
//   OZCoreGlobals::OZCoreGlobals()          [C2 alias]  @0x0000000000013bcc
//   OZCoreGlobals::OZCoreGlobals()          [C1]        @0x0000000000013c0e
//   OZCoreGlobals::getInstance()                        @0x0000000000013c50
//   ~OZCoreGlobals()                        [D1]        @0x0000000000013cd6
//   ~OZCoreGlobals()                        [D0]        @0x0000000000013ce0
//   OZCoreGlobals::getInstance() (.cold.1)              @0x00000000000ac160
//   getInstance-block-invoke                            @0x0000000000013c6e
//
// vtable @0xd1380 (installed ptr = vtable+0x10 = 0xd1390). Slots (from
// `raw-port/army/tools/vtable.py ProChannel OZCoreGlobals`):
//   *0x00 -> 0x13cd6  ~OZCoreGlobals   (D1 non-deleting; tail-calls PCSingleton::~PCSingleton)
//   *0x08 -> 0x13ce0  ~OZCoreGlobals   (D0 deleting; PCSingleton::~PCSingleton then operator delete)
//   (higher slots are unrelated typeinfo/factory data — see vtable dump.)
//
// Struct layout (recovered from C1 @0x13c0e..0x13c4f and block-invoke @0x13c6e..0x13cc2;
// heap size is 0x28 = 40 bytes, allocated via `movl $0x28,%edi ; callq __Znwm` @0x13c75):
//   +0x00  vtable ptr                installed at 0x13c29 / 0x13c97 (= 0xd1390 = vtable+0x10)
//   +0x08  tag              : u32    written to 0x1000000  (movl $0x1000000,0x8(%rbx))
//                                    @0x13c2c / @0x13c9a. NB: PCSingleton::PCSingleton was
//                                    called with tag=0 first at @0x13c19 / @0x13c87 — this
//                                    field is then OVERWRITTEN to 0x1000000 by the derived ctor.
//   +0x0c  cmTime           : CMTime 24-byte CoreMedia CMTime, initialized by two-part memcpy
//                                    from `kCMTimeZero`:
//                                       xmm0 = *(u128*)(&kCMTimeZero+0x00)          # 16 bytes (value+timescale+flags)
//                                       *(u128*)(this+0x0c) = xmm0
//                                       *(u64*)(this+0x1c)  = *(u64*)(&kCMTimeZero+0x10)   # 8 bytes (epoch)
//                                    @0x13c33..0x13c45 / @0x13ca1..0x13cb3.
//     +0x0c  value          : i64    kCMTimeZero.value     = 0
//     +0x14  timescale      : i32    kCMTimeZero.timescale = 1
//     +0x18  flags          : u32    kCMTimeZero.flags     = kCMTimeFlags_Valid (1)
//     +0x1c  epoch          : i64    kCMTimeZero.epoch     = 0
//   (Total = 0x24 = 36 bytes; heap allocator rounds up to 0x28.)
//
// Callee/const citations (via raw-port/army/tools/resolve.py ProChannel + /tmp/ProChannel_symmap.tsv):
//   stub  __ZN11PCSingletonC2Ej   — PCSingleton::PCSingleton(unsigned int)    (C1 @0x13c19; block-invoke @0x13c87)
//   stub  __ZN11PCSingletonD2Ev   — PCSingleton::~PCSingleton()               (D1 @0x13cda; D0 @0x13ce9)
//   stub  __Znwm                  — operator new(unsigned long)                (block-invoke @0x13c7a)
//   stub  __ZdlPv                 — operator delete(void*)                     (D0 @0x13cf7; ctor unwind @0x13cc9)
//   stub  __Unwind_Resume         — libunwind resume                           (ctor unwind @0x13cd1)
//   stub  _dispatch_once          — libdispatch dispatch_once                  (getInstance.cold.1 @0xac173)
//   const 0x149330 (via literal pool `_kCMTimeZero` @RIP+0xb6886 from 0x13c33) — CoreMedia
//                                    kCMTimeZero (16-byte + 8-byte read on the CMTime layout).
//                                    Available in-port as `kCMTimeZero` from ../infra/CMTime.
//   const _kCMTimeZero literal-pool pointer @0x13c33 / @0x13ca1 — CoreMedia's exported
//                                    `const CMTime kCMTimeZero`.
//   symbol __ZZN13OZCoreGlobals11getInstanceEvE4once — the local static "once" sentinel
//                                    (dispatch_once_t; 8 bytes). Read as u64 for the
//                                    fast-path `cmpq $-0x1, once` @0x13c50.
//   symbol __ZN13OZCoreGlobals9_instanceE — the local static `_instance` pointer, published
//                                    by the block-invoke @0x13cb7 and read on both the
//                                    fast-path @0x13c5a and the slow-path fall-through.
//   symbol ___block_literal_global — the dispatch_once block descriptor + invocation
//                                    function pointer (block-invoke @0x13c6e is stored inside
//                                    it). Passed to `dispatch_once` at .cold.1 @0xac16b.
//
// FRONTIERS (undecoded — kept as throwing stubs where needed):
//   • PCSingleton::PCSingleton(unsigned int) / PCSingleton::~PCSingleton — the port DOES
//     have a landed PCSingleton in raw-port/src/infra/PCSingleton.ts (transcribed from
//     ProCore); we reuse its class here rather than re-stubbing.
//   • dispatch_once — libdispatch primitive. Not portable to a single-threaded TS runtime
//     verbatim; we honor its once-only semantics via a boolean sentinel.
//   • CoreMedia kCMTimeZero — the source constant is available in raw-port/src/infra/CMTime.

import { PCSingleton } from "../infra/PCSingleton";
import { type CMTime, kCMTimeZero } from "../infra/CMTime";

/**
 * OZCoreGlobals::OZCoreGlobals() (C1 alias @0x13c0e; the C2 base variant is @0x13bcc and
 * is an alias to the same body — nm shows both symbols in the map).
 *
 * Body @0x13c0e..0x13c4f:
 *   0x13c0e: pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax             # prologue
 *   0x13c14: movq %rdi,%rbx                                                     # rbx = this
 *   0x13c17: xorl %esi,%esi                                                     # arg2 = 0
 *   0x13c19: callq PCSingleton::PCSingleton(unsigned int)                       # this->PCSingleton(0)
 *   0x13c1e: leaq __ZTV13OZCoreGlobals(%rip),%rax                               # rax = &vtable
 *   0x13c25: addq $0x10,%rax                                                    # rax = vtable+0x10 = 0xd1390
 *   0x13c29: movq %rax,(%rbx)                                                   # this->vtable = 0xd1390
 *   0x13c2c: movl $0x1000000,0x8(%rbx)                                          # this->tag = 0x1000000
 *   0x13c33: movq _kCMTimeZero(%rip),%rax                                        # rax = &kCMTimeZero
 *   0x13c3a: movups (%rax),%xmm0                                                 # xmm0 = kCMTimeZero[0..16]
 *   0x13c3d: movups %xmm0,0xc(%rbx)                                              # this[+0x0c..+0x1c] = kCMTimeZero[0..16]
 *   0x13c41: movq 0x10(%rax),%rax                                                # rax = kCMTimeZero[+0x10..+0x18]
 *   0x13c45: movq %rax,0x1c(%rbx)                                                # this[+0x1c..+0x24] = kCMTimeZero.epoch
 *   0x13c49..0x13c4f: epilogue (addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq)
 *
 * The PCSingleton::PCSingleton call registers `this` in the global singleton list with
 * tag=0; the derived ctor then overwrites the tag slot with 0x1000000 so subsequent
 * PCSingleton::Info reads see the derived tag.
 */
export class OZCoreGlobals extends PCSingleton {
  /** Installed vtable pointer (ProChannel @0xd1390). Base = 0xd1380. */
  static readonly INSTALLED_VPTR = 0xd1390;
  /** vtable base (ProChannel @0xd1380). */
  static readonly VTABLE_BASE = 0xd1380;

  /**
   * +0x08 (u32). The derived tag value baked into every OZCoreGlobals instance
   * by the ctor via `movl $0x1000000,0x8(%rbx)` @0x13c2c / @0x13c9a. NB: PCSingleton::
   * PCSingleton was called with 0 immediately above; the derived ctor overwrites it
   * to 0x1000000. Same const in the block-invoke body.
   */
  static readonly TAG_VALUE = 0x1000000;

  /**
   * +0x00 vtable pointer (installed to INSTALLED_VPTR by the ctor).
   * `movq %rax,(%rbx)` @0x13c29 / @0x13c97.
   */
  vptr: number = OZCoreGlobals.INSTALLED_VPTR;

  /**
   * +0x0c (CMTime, 24 bytes). Snapshot of CoreMedia's `kCMTimeZero` copied byte-for-byte
   * by the ctor. Two-part memcpy: xmm0-wide 16-byte read+write, then a trailing 8-byte
   * epoch read+write. `movups`/`movq` @0x13c33..0x13c45 / @0x13ca1..0x13cb3.
   *
   * We spread `kCMTimeZero` (from raw-port/src/infra/CMTime — CoreMedia
   * `const CMTime kCMTimeZero` = {value:0, timescale:1, flags:Valid, epoch:0}) into a
   * fresh object so subsequent writes don't alias the imported constant.
   */
  cmTime: CMTime = {
    value: kCMTimeZero.value, // @0x13c3a movups (%rax),%xmm0 (bytes 0..8)   → value
    timescale: kCMTimeZero.timescale, // @0x13c3a xmm0 bytes 8..12          → timescale
    flags: kCMTimeZero.flags, // @0x13c3a xmm0 bytes 12..16                  → flags
    epoch: kCMTimeZero.epoch, // @0x13c41 movq 0x10(%rax),%rax + movq %rax,0x1c(%rbx) → epoch
  };

  constructor() {
    // @0x13c19: PCSingleton::PCSingleton(unsigned int) with tag=0.
    super(0);
    // @0x13c2c: derived ctor OVERWRITES the tag with 0x1000000.
    this.tag = OZCoreGlobals.TAG_VALUE;
    // vtable + cmTime are set as instance-field initializers above (mirror @0x13c29/13c3a/13c41).
  }

  /**
   * OZCoreGlobals::~OZCoreGlobals() (D1 non-deleting) @0x13cd6..0x13cdb:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp __ZN11PCSingletonD2Ev                              # tail-call PCSingleton::~PCSingleton
   *
   * i.e. the derived non-deleting dtor is a bare wrapper that unlinks from the singleton
   * list via the base dtor. TS delegates to PCSingleton.destroy() (the sibling PCSingleton
   * transcription's non-deleting entry point).
   */
  destroy(): void {
    // @0x13cdb tail-call: PCSingleton::~PCSingleton()
    super.destroy();
  }

  /**
   * OZCoreGlobals::~OZCoreGlobals() (D0 deleting) @0x13ce0..0x13cf7:
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax                       # prologue
   *   movq %rdi,%rbx                                                                # rbx = this
   *   callq __ZN11PCSingletonD2Ev                                                   # PCSingleton::~PCSingleton
   *   movq %rbx,%rdi
   *   addq $0x8,%rsp ; popq %rbx ; popq %rbp
   *   jmp __ZdlPv                                                                   # tail-call operator delete(void*)
   *
   * i.e. call the base dtor, then free the object. In TS this reduces to destroy();
   * the memory is reclaimed by the GC.
   */
  deleteAndFree(): void {
    this.destroy();
    // @0x13cf7 tail-call: operator delete(void*) — no-op in GC.
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Static: getInstance() — dispatch_once singleton
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * `__ZZN13OZCoreGlobals11getInstanceEvE4once` (function-local static). 8-byte
   * `dispatch_once_t`; libdispatch sets it to `-1` (0xFFFFFFFFFFFFFFFF) once the block
   * has run. Read as u64 by the fast-path `cmpq $-0x1, once(%rip)` @0x13c50.
   *
   * TS models it as a plain bool — semantically the same "run exactly once" trigger.
   */
  private static _once: boolean = false;

  /**
   * `__ZN13OZCoreGlobals9_instanceE` (function-local static). Pointer to the singleton
   * instance, published by the block @0x13cb7 (`movq %rbx,__ZN13OZCoreGlobals9_instanceE(%rip)`).
   * On the fast-path we simply return this value @0x13c5a.
   */
  private static _instance: OZCoreGlobals | null = null;

  /**
   * OZCoreGlobals::getInstance() @0x13c50..0x13c6c:
   *   0x13c50: cmpq $-0x1, __ZZN13OZCoreGlobals11getInstanceEvE4once(%rip)
   *   0x13c58: jne  0x13c62                                                          # if once != -1: goto slow
   *   0x13c5a: movq __ZN13OZCoreGlobals9_instanceE(%rip),%rax                        # rax = _instance
   *   0x13c61: retq                                                                   # return
   *
   *   ── slow path ──
   *   0x13c62: pushq %rbp ; movq %rsp,%rbp                                           # prologue
   *   0x13c66: callq __ZN13OZCoreGlobals11getInstanceEv.cold.1                       # cold: run dispatch_once
   *   0x13c6b: popq %rbp                                                              # epilogue
   *   0x13c6c: jmp  0x13c5a                                                           # goto fast-path load
   *
   * .cold.1 @0xac160..0xac173:
   *   pushq %rbp ; movq %rsp,%rbp
   *   leaq __ZZN13OZCoreGlobals11getInstanceEvE4once(%rip),%rdi                       # &once
   *   leaq ___block_literal_global(%rip),%rsi                                          # &block
   *   popq %rbp
   *   jmp   _dispatch_once
   *
   * The block (`____ZN13OZCoreGlobals11getInstanceEv_block_invoke` @0x13c6e..0x13cc2)
   * allocates a fresh OZCoreGlobals via `operator new(0x28)`, runs the ctor sequence
   * (PCSingleton::PCSingleton(0), install vtable+0x10, tag=0x1000000, cmTime=kCMTimeZero),
   * and stores the pointer into `_instance` @0x13cb7. On any exception during ctor the
   * catch pad @0x13cc3 calls `operator delete` on the raw allocation and re-raises via
   * `__Unwind_Resume`.
   */
  static getInstance(): OZCoreGlobals {
    // @0x13c50/@0x13c58 fast-path guard: if `once == -1` fall through to the load; else run slow path.
    if (!OZCoreGlobals._once) {
      // @0x13c62..0x13c6c slow-path entry → .cold.1 @0xac160 → tail-jump `_dispatch_once(&once,&block)`.
      // The block body is `____ZN13OZCoreGlobals11getInstanceEv_block_invoke` @0x13c6e:
      //   %rax = operator new(0x28)              @0x13c75/@0x13c7a
      //   PCSingleton::PCSingleton(this, 0)      @0x13c87
      //   this->vtable = vtable+0x10             @0x13c8c/@0x13c93/@0x13c97
      //   this->tag = 0x1000000                  @0x13c9a
      //   this->cmTime = kCMTimeZero             @0x13ca1..0x13cb3
      //   _instance = this                       @0x13cb7
      OZCoreGlobals._instance = new OZCoreGlobals();
      // `dispatch_once` sets `once` to -1 upon successful block completion; we mirror
      // by flipping our sentinel true.
      OZCoreGlobals._once = true;
    }
    // @0x13c5a: return `_instance` (via a movq from the RIP-relative symbol).
    // `_instance` is non-null on this path because getInstance's slow-path just wrote it.
    // (The C ABI can also observe this being non-null concurrently with `_once` still 0
    // right before `dispatch_once` publishes the -1; libdispatch's memory barrier ensures
    // the load-after-cmpq observes both. TS is single-threaded so no barrier is needed.)
    if (OZCoreGlobals._instance === null) {
      // Cannot happen after the _once flip above; kept for TS null-safety.
      // raise: dispatch_once block failed to publish _instance @ProChannel 0x13cb7
      throw new Error(
        "OZCoreGlobals::getInstance frontier: dispatch_once block did not publish _instance (@ProChannel 0x13cb7)",
      );
    }
    return OZCoreGlobals._instance;
  }
}
