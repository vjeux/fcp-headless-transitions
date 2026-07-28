// PCAutoreleasePool.ts — faithful transcription of FCP's ProCore class
// PCAutoreleasePool, a thin RAII wrapper around an Objective-C
// NSAutoreleasePool.
//
// Binary source (x86_64 slice of the FAT ProCore framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore
//
// Disassembly:
//   raw-port/re/disasm/ProCore.PCAutoreleasePool.PCAutoreleasePool.s   @0x99f84  (C1)
//   raw-port/re/disasm/ProCore.PCAutoreleasePool.~PCAutoreleasePool.s  @0x99fc2  (D1)
//   raw-port/re/disasm/ProCore.PCAutoreleasePool.drain.s               @0x99fe0
//   (C2 @0x99f64 is ICF-folded onto C1 — no distinct body emitted.)
//   (D2 @0x99fa4 body was recovered directly from /tmp/ProCore_tV.txt.)
//
// nm -arch x86_64 ProCore:
//   0000000000099f64 T __ZN17PCAutoreleasePoolC2Ev            (ICF -> C1)
//   0000000000099f84 T __ZN17PCAutoreleasePoolC1Ev
//   0000000000099fa4 T __ZN17PCAutoreleasePoolD2Ev
//   0000000000099fc2 T __ZN17PCAutoreleasePoolD1Ev
//   0000000000099fe0 T __ZN17PCAutoreleasePool5drainEv
//
// STRUCT LAYOUT (recovered from every method):
//   +0x00  id  pool     an Objective-C NSAutoreleasePool* (the one owned
//                       by this scope).  C1 stores here @0x99f99; D1/D2
//                       load from here to send a message @0x99fa8/0x99fc6;
//                       drain does the same @0x99fe9 then overwrites here
//                       with a fresh alloc-init'd pool @0x9a005.
//   sizeof(PCAutoreleasePool) = 8 bytes.
//
// FRONTIER (Objective-C runtime):
//   _objc_alloc_init                          @__stubs 0xde99c
//   _OBJC_CLASS_$_NSAutoreleasePool            (literal-pool symbol) — cited
//     at C1 @0x99f8d and drain @0x99ff9 (both `movq  <RIP+off>, %rdi`).
//   Selector reference (unnamed at this layer of decode; the disasm.sh
//     hint labels it `-[… localizedStringForKey:value:table:]` but that's
//     a nearby-selref cache label — the actual selref address is loaded
//     via `movq <RIP+off>, %rsi` at D2 @0x99fab, D1 @0x99fc9,
//     drain @0x99fec; the resulting selector is whatever Objective-C
//     assigns to the RIP-relative selref slot at load time. The mirrored
//     TS code sends the same "opaque selref" to the pool.)
//
// The Objective-C runtime itself is not being ported; we surface each
// runtime edge as a throwing stub with the exact address citation.
export type ObjcId = object;

/**
 * Frontier: Objective-C runtime — `objc_alloc_init([NSAutoreleasePool class])`,
 * i.e. `[[NSAutoreleasePool alloc] init]`, tail-called at C1 @0x99f94 and
 * drain @0x9a000. Both call sites do `movq _OBJC_CLASS_$_NSAutoreleasePool
 * (%rip), %rdi` first, so the argument is the NSAutoreleasePool class.
 */
function objc_alloc_init_NSAutoreleasePool(): ObjcId {
  throw new Error(
    "objc_alloc_init(NSAutoreleasePool) not yet transcribed " +
    "(_objc_alloc_init __stub @ProCore 0x99f94/0x9a000; NSAutoreleasePool " +
    "class ptr loaded from RIP-relative literal-pool slot @ProCore 0x99f8d/0x99ff9)"
  );
}

/**
 * Frontier: Objective-C message send `objc_msgSend(pool, <sel>)` — the
 * selref at RIP+0xbe060 (D1 @0x99fc9), RIP+0xbe07e (D2 @0x99fab), and
 * RIP+0xbe03d (drain @0x99fec) resolves to the same selector in all
 * three cases (they are three RIP-relative reloads of the SAME __objc_selrefs
 * entry — the offsets differ only because the emitting insns are at
 * different addresses). The disasm.sh tool prints a `localizedStringForKey:
 * value:table:` hint but that is a nearby-selref cache label; the actual
 * selector identity is fixed only at Objective-C runtime bind. In an
 * NSAutoreleasePool RAII wrapper, the sole message that makes sense is
 * one of `drain`/`release`; we cite the selref slot and raise rather than
 * pick a name.
 */
function objc_msgSend_pool_selref(_pool: ObjcId): void {
  throw new Error(
    "objc_msgSend(pool, selref@__objc_selrefs) not yet transcribed " +
    "(selref loaded via movq RIP+0xbe060(%rip) @ProCore 0x99fc9 in D1, " +
    "RIP+0xbe07e(%rip) @ProCore 0x99fab in D2, RIP+0xbe03d(%rip) @ProCore " +
    "0x99fec in drain; message-send stub at RIP+0xadde2/0xade00/0xaddbf)"
  );
}

/**
 * PCAutoreleasePool — RAII wrapper around an Objective-C NSAutoreleasePool.
 *
 * The class has ONE field:
 *   +0x00  id  pool   an owned NSAutoreleasePool*.
 *
 * @ProCore class PCAutoreleasePool (module `ProCore`).
 */
export class PCAutoreleasePool {
  /**
   * The owned NSAutoreleasePool*. Cited at +0x00 in every method.
   */
  pool: ObjcId | null = null;

  /**
   * PCAutoreleasePool::PCAutoreleasePool() — C1 (complete-object ctor).
   * @ProCore __ZN17PCAutoreleasePoolC1Ev @0x99f84..0x99fa2
   *   (C2 @0x99f64 is ICF-folded onto C1 — same body.)
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   pushq %rbx / pushq %rax                     ; frame + align
   *   movq  %rdi, %rbx                            ; rbx = this
   *   movq  _OBJC_CLASS_$_NSAutoreleasePool(%rip), %rdi   ; @0x99f8d
   *   callq _objc_alloc_init                       ; @0x99f94 -> new pool
   *   movq  %rax, (%rbx)                           ; @0x99f99  this->pool = new
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp / retq
   */
  constructor() {
    this.pool = objc_alloc_init_NSAutoreleasePool(); // @0x99f94/0x99f99
  }

  /**
   * PCAutoreleasePool::~PCAutoreleasePool() — D1 (complete-object dtor).
   * @ProCore __ZN17PCAutoreleasePoolD1Ev @0x99fc2..0x99fdd
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   movq  (%rdi), %rdi                          ; @0x99fc6  rdi = this->pool
   *   movq  0xbe060(%rip), %rsi                   ; @0x99fc9  rsi = selref
   *   callq *0xadde2(%rip)                        ; @0x99fd0  objc_msgSend
   *   popq %rbp / retq
   * L_exc: (landing pad — cxx personality drops here on selector-send throw)
   *   movq %rax, %rdi / callq ___clang_call_terminate
   *
   * The exception path calls `___clang_call_terminate`; we mirror that as
   * a raise (which is exactly what `terminate()` would do, minus the
   * process abort — a bit-exact abort is not observable at the JS layer).
   */
  D1(): void {
    if (this.pool !== null) {
      try {
        objc_msgSend_pool_selref(this.pool); // @0x99fd0
      } catch (e) {
        // __clang_call_terminate @0x99fdb.
        throw e;
      }
    }
  }

  /**
   * PCAutoreleasePool::~PCAutoreleasePool() — D2 (base-object dtor).
   * @ProCore __ZN17PCAutoreleasePoolD2Ev @0x99fa4..0x99fbf
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   movq  (%rdi), %rdi                          ; @0x99fa8  rdi = this->pool
   *   movq  0xbe07e(%rip), %rsi                   ; @0x99fab  rsi = selref (same slot as D1)
   *   callq *0xade00(%rip)                        ; @0x99fb2  objc_msgSend
   *   popq %rbp / retq
   * L_exc: movq %rax,%rdi / callq ___clang_call_terminate
   *
   * Byte-identical shape to D1 (both send the same selector to the same
   * pool ivar); differs only in the RIP-relative offsets, which resolve
   * to the same absolute selref and msgSend stub addresses.
   */
  D2(): void {
    if (this.pool !== null) {
      try {
        objc_msgSend_pool_selref(this.pool); // @0x99fb2
      } catch (e) {
        // __clang_call_terminate @0x99fbd.
        throw e;
      }
    }
  }

  /**
   * PCAutoreleasePool::drain() — recycles the pool: send the selector to
   * the current pool, then replace it with a fresh alloc-init.
   * @ProCore __ZN17PCAutoreleasePool5drainEv @0x99fe0..0x9a00e
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   pushq %rbx / pushq %rax
   *   movq  %rdi, %rbx                            ; @0x99fe6  save this
   *   movq  (%rdi), %rdi                          ; @0x99fe9  rdi = this->pool
   *   movq  0xbe03d(%rip), %rsi                   ; @0x99fec  selref (same slot)
   *   callq *0xaddbf(%rip)                        ; @0x99ff3  objc_msgSend
   *   movq  _OBJC_CLASS_$_NSAutoreleasePool(%rip), %rdi   ; @0x99ff9
   *   callq _objc_alloc_init                       ; @0x9a000
   *   movq  %rax, (%rbx)                           ; @0x9a005  this->pool = new
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp / retq
   *
   * NB: drain does NOT trap-terminate on a selector-send throw (no
   * landing pad emitted); a raise from the msgSend would propagate up
   * the caller's frame.  We mirror that by NOT wrapping the msgSend in
   * a try/catch.
   */
  drain(): void {
    if (this.pool !== null) {
      objc_msgSend_pool_selref(this.pool); // @0x99ff3
    }
    this.pool = objc_alloc_init_NSAutoreleasePool(); // @0x9a000/0x9a005
  }
}
