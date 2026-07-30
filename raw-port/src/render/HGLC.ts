// HGLC.ts — Helium.framework's HGLC (Helium GL Contexts) name-space object. Only ONE method is
// externally-visible on the class: HGLC::getContexts(), a lazy-init static getter that returns
// a pointer to a process-wide std::map<const char*, int, HGLC::ltstr> (recovered from other
// symbols in Helium — see NOTE below).
//
// Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGLC.getContexts.s                    @0x1acb00 (this file)
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x1acb00  t HGLC::getContexts()                                 (the only method exported here)
//   0xadc690  d HGLC::_ctxsLock                                     (process-wide mutex, unused here)
//   0x1af660  t std::__1::__tree<std::__1::__value_type<const char*,int>,
//                                std::__1::__map_value_compare<...,
//                                                              HGLC::ltstr, true>, ...>::
//               __emplace_unique_key_args<...>                       (proof the container is a
//                                                                    std::map keyed on `const char*`
//                                                                    with a HGLC::ltstr comparator)
//   0xade380  b HGLC::getContexts()::contexts                       (function-local static storage)
//
// The nm entries above pin the container type: `std::__1::map<const char*, int, HGLC::ltstr>`.
// libc++'s std::map is a thin wrapper over std::__1::__tree; the __tree object's initial
// (empty) layout is exactly 24 bytes:
//     +0x00   __end_node* __begin_node_    (self-referential: points at &this->__pair1_.first,
//                                          i.e. the embedded __end_node_ at +0x08)
//     +0x08   __end_node.__left_           (0 — no root yet)
//     +0x10   size_                         (0 — empty)
// which matches the disasm exactly (see body annotation below).
//
// ─── Method body (@0x1acb00, 17 lines of asm) ──────────────────────────────────────────
//   00 movq  __ZZN4HGLC11getContextsEvE8contexts(%rip), %rax   ; rax = static.contexts (may be null)
//   07 testq %rax, %rax                                          ; if (rax != null) return rax;
//   0a je    0x1acb0d
//   0c retq
//   0d pushq %rbp ; movq %rsp,%rbp
//   11 movl  $0x18, %edi                                         ; rdi = 24 (sizeof(__tree))
//   16 callq operator new(size_t)                                ; rax = raw allocation (24 bytes)
//        (__Znwm; stub 0x3c4fb2)
//   1b leaq  0x8(%rax), %rcx                                     ; rcx = &new_obj->__end_node_
//        (i.e. address of the byte at offset +8 inside new_obj)
//   1f xorps %xmm0, %xmm0                                        ; xmm0 = 0 (16 zero bytes)
//   22 movups %xmm0, 0x8(%rax)                                   ; new_obj[+0x08..+0x18] = 0
//        (this zeros the __end_node_.__left_ AND the size_ field in one 128-bit store)
//   26 movq  %rcx, (%rax)                                        ; new_obj[+0] = new_obj + 8
//        (__begin_node_ = &__end_node_ — the self-referential empty-tree marker)
//   29 movq  %rax, __ZZN4HGLC11getContextsEvE8contexts(%rip)     ; static.contexts = new_obj
//   30 popq %rbp ; retq
//
// The `HGLC::_ctxsLock` mutex at 0xadc690 is NOT touched by getContexts — this initialization
// is not thread-safe as written in the binary. Callers presumably lock _ctxsLock before
// reading/writing the map, and the first getContexts() call is expected to be single-threaded
// (typical for library-init paths). We preserve this exactly: no locking.
//
// FRAMEWORK POSITIONING: this is a leaf singleton getter. Callers of getContexts() (which will
// then insert/lookup name→int entries under _ctxsLock) are not yet transcribed. Once those
// callers land they'll surface as `HGLC` frontier work.
//
// Called symbols:
//   __Znwm (operator new(size_t))  — @Helium __stubs 0x3c4fb2, invoked @0x1acb16 with size=24.
//
// No other calls, no vtable dispatch, no ObjC. This is pure C++ static-storage lazy init.
// ─────────────────────────────────────────────────────────────────────────────────────────

/**
 * HGLCContexts — the concrete run-time layout of one empty
 * `std::__1::map<const char*, int, HGLC::ltstr>`, as produced by
 * HGLC::getContexts()'s first-call initialization.
 *
 * All three fields are byte-exact from the disasm; the map's insertion/lookup methods that
 * mutate them are NOT ported here (they live in different symbols such as
 * `std::__1::__tree<...>::__emplace_unique_key_args<...>` @Helium 0x1af660). Consumers of
 * getContexts() that need to insert or read entries MUST port the tree method they intend
 * to call.
 */
export interface HGLCContexts {
  /**
   * +0x00 — `__begin_node_`. In an empty tree this is a self-referential pointer to the
   * embedded __end_node_ at offset +0x08 of the same allocation. Modelled as a symbolic
   * marker; JS has no address arithmetic so a real self-ptr can't be represented — the
   * marker documents the C++ ABI semantics for any future port that consumes this field.
   */
  begin_node_selfref: true;
  /** +0x08 — `__end_node_.__left_`. Zero for an empty tree (no root). */
  end_node_left: null;
  /** +0x10 — `size_`. Zero for an empty tree. */
  size: number;
}

/**
 * `operator new(size_t)` — libc++ ABI global operator new, called at @Helium 0x1acb16 with
 * size = 24 (0x18) to allocate the __tree object.
 *
 * Stub resolution: Helium __stubs 0x3c4fb2 → __Znwm.
 *
 * The disasm ignores the failure path (the compiler generated no branch after callq __Znwm),
 * consistent with the standard `new` never returning null. Our port also never returns null.
 */
function operator_new_24(): HGLCContexts {
  // The 24-byte allocation is then initialized by the following instructions in the disasm:
  //   @0x1acb1f xorps  %xmm0, %xmm0                    ; 128-bit zero
  //   @0x1acb22 movups %xmm0, 0x8(%rax)                ; +0x08..+0x18 = 0
  //   @0x1acb26 movq   %rcx , (%rax)                   ; +0x00 = rax+0x08  (self-ref)
  // In JS we allocate a fresh object whose fields carry the same semantic marker.
  return {
    begin_node_selfref: true,
    end_node_left: null,
    size: 0,
  };
}

/**
 * HGLC::getContexts()::contexts — the function-local static storage cell at @Helium 0xade380
 * (in the BSS/.data section). Zero-initialized (bss) before the first call, then set by the
 * first invocation. NOTE: NOT thread-safe — no atomic init guard is emitted (unlike a normal
 * `static X x;` under -fthreadsafe-statics). Callers presumably serialize via HGLC::_ctxsLock
 * before mutating the returned map.
 */
let __ZZN4HGLC11getContextsEvE8contexts: HGLCContexts | null = null;

/**
 * class HGLC — Helium namespace object. Only one method is externally-visible on this class
 * (getContexts); everything else in the "HGLC" symbol space is either mutable global data
 * (_ctxsLock) or an internal std::__tree helper. HGLC is not a construct-instantiate C++ class
 * — there are no ctors/dtors and it acts as a namespace-scoped bag of statics.
 */
export class HGLC {
  /**
   * HGLC::getContexts()  @Helium 0x1acb00.
   *
   * Lazy-init getter for the process-wide `std::map<const char*, int, HGLC::ltstr>` at
   * `HGLC::getContexts()::contexts` (bss @0xade380).
   *
   * Body (byte-for-byte mirror of the 17-line disasm):
   *   1. Read the static pointer.
   *   2. If non-null, return it.
   *   3. Else `operator new(24)`, initialize the __tree's empty layout, store the pointer
   *      back into the static, return it.
   *
   * The static field is written last (after full initialization), matching the asm's
   * @0x1acb29 store — a race-free single write once the object is fully constructed.
   */
  static getContexts(): HGLCContexts {
    // @0x1acb00 movq static.contexts, %rax
    // @0x1acb07 testq %rax, %rax
    // @0x1acb0a je   0x1acb0d
    // @0x1acb0c retq
    let contexts = __ZZN4HGLC11getContextsEvE8contexts;
    if (contexts !== null) {
      return contexts;
    }
    // @0x1acb11-0x1acb26: allocate, initialize as empty __tree.
    contexts = operator_new_24();                          // @0x1acb11-0x1acb16
    // (the movups+movq initialization is folded into operator_new_24's field defaults)
    // @0x1acb29 movq %rax, static.contexts
    __ZZN4HGLC11getContextsEvE8contexts = contexts;
    // @0x1acb30 popq %rbp / retq
    return contexts;
  }
}

/**
 * Test-only reset for the singleton (NOT present in the FCP binary — provided here so unit
 * tests can exercise the lazy-init branch multiple times without accumulating state across
 * runs). Deliberately named after the resettable symbol so nothing in production code
 * accidentally reaches for it.
 */
export function __resetHGLCContextsForTests(): void {
  __ZZN4HGLC11getContextsEvE8contexts = null;
}

/**
 * Read-only access to the raw `HGLC::getContexts()::contexts` static
 * cell (@Helium 0xade380). NOT exported as a public API — used
 * exclusively by `HGLogger::getLevel(char const*)` @Helium 0x1ad8e0,
 * whose disasm reads the cell DIRECTLY at @0x1ad8fd (rather than going
 * through getContexts()) so that it can perform its OWN lazy-init if
 * the cell is still null. Exposing an accessor here keeps HGLC.ts as
 * the single writer of the cell (HGLogger.ts delegates to
 * `HGLC.getContexts()` for the ALLOC path @0x1ad95c-0x1ad97b) while
 * letting HGLogger.ts faithfully model getLevel's null-check branch.
 *
 * The `__get` prefix signals "port-internal boundary accessor, not FCP-
 * public" — mirrors the `__resetHGLCContextsForTests` pattern above.
 */
export function __getHGLCContextsCell(): HGLCContexts | null {
  return __ZZN4HGLC11getContextsEvE8contexts;
}
