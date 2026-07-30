// HGRenderUtils::BufferCopier — Helium nested class. This file ports the
// complete-object constructor (C1) only; other methods will accrete into
// this same file as future ledger entries claim them (one class per file).
//
// Ledger @Helium (this file's scope):
//   BufferCopier::BufferCopier()   @0x60230    __ZN13HGRenderUtils12BufferCopierC1Ev
//
// LAYOUT (recovered from the ctor at @0x60230):
//   The ctor allocates a 0x50-byte inner "Impl" object on the heap via
//   `operator new(0x50)` @0x6023f (stub 0x3c4fb2), writes byte 0 at Impl+0x48,
//   creates a dispatch_group_t via _dispatch_group_create @0x6024b (stub
//   0x3c50a8), stores it at Impl+0x00, and finally stores the Impl* into
//   this->+0x00.
//
//   struct BufferCopier {           // 8 bytes on the stack ("thin handle")
//     BufferCopier::Impl* pImpl;    // +0x00 — heap-allocated 0x50-byte object
//   };
//
//   struct BufferCopier::Impl {     // 0x50 bytes = 80 bytes
//     dispatch_group_t group;       // +0x00 — from _dispatch_group_create()
//     ... (bytes 0x08..0x47 not yet decoded; likely more dispatch objects
//         and queues, given the group at +0x00 and a byte flag at +0x48)
//     uint8_t          flag;        // +0x48 — initialised to 0 by the ctor
//     ... (bytes 0x49..0x4f padding/other fields)
//   };
//
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs):
//   * __Znwm                   — libc++ operator new(size_t). Called @0x6023f
//                                via stub 0x3c4fb2. Standard C++ runtime alloc;
//                                out-of-scope by policy (same as every other
//                                operator-new call site in the port).
//   * _dispatch_group_create   — Grand Central Dispatch (libdispatch.dylib).
//                                Called @0x6024b via stub 0x3c50a8. Returns
//                                a retained dispatch_group_t. Apple system
//                                framework — TRUE out-of-scope extern.

/**
 * `operator new(size_t)` — libc++ global (C++ runtime allocator).
 * Called from BufferCopier::BufferCopier() @Helium 0x6023f via stub
 * 0x3c4fb2. TRUE OUT-OF-SCOPE extern (C++ standard library allocator);
 * modelled as a boundary throw citing @0xADDR. Consistent with
 * operator_new_16 in HGTraceGuard.ts and the __Znwm-family stubs in
 * every other ported class that heap-allocates.
 *
 * @param _size 0x50 bytes at this call site (%edi=0x50 @0x6023a).
 */
function operator_new_0x50(): BufferCopierImpl {
  // @Helium stub 0x3c4fb2 — __Znwm (libc++ global operator new(size_t)).
  throw new Error(
    "BufferCopier::BufferCopier: operator new(size_t=0x50) not yet " +
      "transcribed — called @Helium 0x6023f via stub 0x3c4fb2. TRUE " +
      "out-of-scope extern (libc++ runtime allocator).",
  );
}

/**
 * `dispatch_group_create()` — Grand Central Dispatch (libdispatch.dylib).
 * Called from BufferCopier::BufferCopier() @Helium 0x6024b via stub
 * 0x3c50a8. Returns a fresh, retained `dispatch_group_t` — an opaque
 * OS_dispatch_group object used to synchronise a group of blocks. The
 * caller owns the +1 retain and is responsible for the matching
 * dispatch_release (or ARC-style _Block_release in modern libdispatch).
 *
 * TRUE OUT-OF-SCOPE extern (Apple libdispatch, part of the Darwin
 * kernel-adjacent runtime). Modelled as a boundary throw citing @0xADDR;
 * callers that need concurrency semantics should be wired to a JS-side
 * pool/promise adapter, not routed through this native syscall stub.
 *
 * @returns dispatch_group_t — an opaque handle to a new dispatch group.
 */
function dispatch_group_create(): DispatchGroupRef {
  // @Helium stub 0x3c50a8 — _dispatch_group_create (libdispatch extern).
  throw new Error(
    "BufferCopier::BufferCopier: _dispatch_group_create not yet " +
      "transcribed — called @Helium 0x6024b via stub 0x3c50a8. TRUE " +
      "out-of-scope extern (Apple libdispatch runtime).",
  );
}

/** Opaque handle for a `dispatch_group_t` (OS_dispatch_group). The
 *  JS runtime has no libdispatch, so this is a nominal opaque type;
 *  produced only by the dispatch_group_create() boundary stub. */
export interface DispatchGroupRef {
  readonly __brand: "dispatch_group_t";
}

/** BufferCopier::Impl — the 0x50-byte heap-allocated inner object.
 *  Only two fields are decoded from the ctor at @0x60230; the rest
 *  are placeholder bytes until later methods (submit/wait/cancel)
 *  reveal their offsets. */
export class BufferCopierImpl {
  /** [+0x00] dispatch_group_t — from _dispatch_group_create() @0x6024b.
   *  Written by the ctor @0x60250 (`movq %rax, (%r14)`). */
  group: DispatchGroupRef | null = null;

  /** [+0x48] byte flag — initialised to 0 by the ctor @0x60247
   *  (`movb $0x0, 0x48(%rax)`). Semantics not yet decoded (likely a
   *  boolean "in-flight" / "cancelled" flag; will be pinned once a
   *  submit/cancel method claims this file). */
  flag_0x48: number = 0;
}

/**
 * `HGRenderUtils::BufferCopier` — nested class inside HGRenderUtils.
 * Ported here as a stand-alone TS class (JS has no C++-style nesting;
 * the `HGRenderUtils_` prefix in the file/class name preserves the
 * qualified-name provenance so the ledger maps cleanly).
 *
 * INSTANCE LAYOUT (recovered from C1 @0x60230):
 *   [0x00]  pImpl — BufferCopier::Impl* (heap-allocated, owned).
 *   The class is a thin 8-byte "handle" holding a pointer to a 0x50-byte
 *   heap object; a classic pImpl idiom hiding libdispatch details from
 *   the header. Every subsequent method observed in disassembly loads
 *   `this->pImpl` before doing anything useful.
 */
export class HGRenderUtils_BufferCopier {
  /** [+0x00] pImpl — the sole field on this 8-byte handle. Written by
   *  the C1 ctor @0x60253 (`movq %r14, (%rbx)`). Populated with a
   *  freshly-allocated `BufferCopierImpl`. */
  pImpl: BufferCopierImpl | null = null;

  /**
   * `HGRenderUtils::BufferCopier::BufferCopier()` @Helium 0x60230
   *   __ZN13HGRenderUtils12BufferCopierC1Ev
   *
   * Disasm (raw-port/re/disasm/Helium.__ZN13HGRenderUtils12BufferCopierC1Ev.s):
   *
   *   0x60230  pushq %rbp                     ; prologue
   *   0x60231  movq  %rsp, %rbp
   *   0x60234  pushq %r14                     ; callee-saved
   *   0x60236  pushq %rbx                     ; callee-saved
   *   0x60237  movq  %rdi, %rbx               ; rbx = this  (save across calls)
   *   0x6023a  movl  $0x50, %edi              ; size = 0x50 (arg -> operator new)
   *   0x6023f  callq  __Znwm                  ; stub 0x3c4fb2 (libc++ op new)
   *   0x60244  movq  %rax, %r14               ; r14 = Impl* (freshly allocated)
   *   0x60247  movb  $0x0, 0x48(%rax)         ; Impl->+0x48 = 0  (flag byte)
   *   0x6024b  callq  _dispatch_group_create  ; stub 0x3c50a8 (libdispatch)
   *   0x60250  movq  %rax, (%r14)             ; Impl->+0x00 = group
   *   0x60253  movq  %r14, (%rbx)             ; this->pImpl = Impl
   *   0x60256  popq  %rbx                     ; epilogue
   *   0x60257  popq  %r14
   *   0x60259  popq  %rbp
   *   0x6025a  retq
   *
   * SEMANTICS
   *   Complete-object ctor (C1). Allocates a fresh 0x50-byte Impl on the
   *   heap, initialises the +0x48 flag byte to 0 (default "not active"),
   *   creates a new dispatch_group_t and stores it at Impl+0x00, then
   *   installs the Impl pointer into `this->pImpl`. Classic pImpl-idiom
   *   ctor: cheap outer object, heavy inner object; the outer type is a
   *   forward-declaration-friendly 8-byte handle.
   *
   *   Order matters: the compiler emits `movb $0x0, 0x48(%rax)` BEFORE
   *   `_dispatch_group_create` because the second call clobbers %rax,
   *   and the address needs the fresh alloc result. The +0x48 flag is
   *   thus already zero when the group is stored at +0x00.
   *
   * FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs — see file header)
   */
  static C1(self: HGRenderUtils_BufferCopier): void {
    // @0x60237  movq %rdi, %rbx           — save `this` in %rbx.
    // @0x6023a..0x6023f  callq __Znwm     — operator new(0x50).
    const impl = operator_new_0x50();
    // @0x60244  movq %rax, %r14           — r14 = Impl*.
    // @0x60247  movb $0x0, 0x48(%rax)     — Impl->+0x48 = 0.
    impl.flag_0x48 = 0;
    // @0x6024b  callq _dispatch_group_create — group = new dispatch_group_t.
    const group = dispatch_group_create();
    // @0x60250  movq %rax, (%r14)         — Impl->+0x00 = group.
    impl.group = group;
    // @0x60253  movq %r14, (%rbx)         — this->pImpl = Impl.
    self.pImpl = impl;
    // @0x60256..0x6025a — epilogue + retq.
  }
}
