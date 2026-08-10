// HGLogger — Helium.framework's logging façade. Only ONE method is ported
// here: HGLogger::getLevel(char const*) @Helium 0x1ad8e0, the read-side
// query that resolves a logger's per-context level from the process-wide
// `HGLC::getContexts()::contexts` std::map<const char*, int, HGLC::ltstr>.
//
// Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium (x86_64 slice; unadjusted VAs).
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN8HGLogger8getLevelEPKc.s  (61 lines)
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZN8HGLogger8getLevelEPKc
//       — HGLogger::getLevel(char const*) @Helium 0x1ad8e0
//
// -----------------------------------------------------------------------------
// PROCESS-GLOBAL STATE REFERENCED
// -----------------------------------------------------------------------------
//   * HGLC::_ctxsLock                       (@Helium 0xadc690)
//       — pthread_mutex_t. Locked @0x1ad8f8, unlocked @0x1ad984 via the
//         out-of-scope libSystem stubs at 0x3c556a / 0x3c5570. Guards all
//         reads/writes of the `contexts` map. This mutex is DECLARED in
//         HGLC.ts (as an nm entry / comment) but not yet given a runtime
//         value — the disasm's lock/unlock pair is modelled through the
//         boundary-stub functions below.
//
//   * HGLC::getContexts()::contexts         (@Helium 0xade380)
//       — function-local static `std::__1::__tree<...> *`; imported here
//         from HGLC.ts's module-scoped `__ZZN4HGLC11getContextsEvE8contexts`
//         cell. getLevel reads this pointer DIRECTLY (not via getContexts()),
//         AND performs its own lazy-init if the cell is still null. The
//         two allocation paths (getLevel @0x1ad95c and getContexts
//         @Helium 0x1acb11) both allocate a 24-byte empty __tree and both
//         write back into the SAME static cell — this is by design (the
//         two lazy-init paths are equivalent).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _pthread_mutex_lock    — libSystem (POSIX threads).
//       Called @0x1ad8f8 via stub 0x3c556a.
//   * _pthread_mutex_unlock  — libSystem (POSIX threads).
//       Called @0x1ad984 via stub 0x3c5570.
//   * _strcmp                — libSystem (libc).
//       Called @0x1ad927 and @0x1ad94d via stub 0x3c55fa.
//   * __Znwm (operator new)  — libc++ ABI.
//       Called @0x1ad961 via stub 0x3c4fb2 (allocates 0x18 = 24 bytes).
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN8HGLogger8getLevelEPKc.s)
// -----------------------------------------------------------------------------
//   __ZN8HGLogger8getLevelEPKc:
//     0x1ad8e0  pushq  %rbp                           ; prologue
//     0x1ad8e1  movq   %rsp, %rbp
//     0x1ad8e4  pushq  %r15                           ; callee-saved
//     0x1ad8e6  pushq  %r14
//     0x1ad8e8  pushq  %r13
//     0x1ad8ea  pushq  %r12
//     0x1ad8ec  pushq  %rbx
//     0x1ad8ed  pushq  %rax                           ; 16B stack alignment pad
//     0x1ad8ee  movq   %rdi, %r14                     ; r14 = arg1 (name : char const*)
//     0x1ad8f1  leaq   HGLC::_ctxsLock(%rip), %rdi    ; arg1 = &_ctxsLock
//     0x1ad8f8  callq  _pthread_mutex_lock            ; lock
//     0x1ad8fd  movq   HGLC::getContexts()::contexts(%rip), %r12  ; r12 = contexts (may be null)
//     0x1ad904  testq  %r12, %r12                     ; contexts == null ?
//     0x1ad907  je     0x1ad95c                       ;   goto ALLOC (lazy-init)
//
//     ; --- lookup path (contexts is initialised) ---
//     0x1ad909  movq   0x8(%r12), %r13                ; r13 = end_node.__left_ (root)
//     0x1ad90e  xorl   %ebx, %ebx                     ; ebx = 0    (result if not-found)
//     0x1ad910  testq  %r13, %r13                     ; root == null ?
//     0x1ad913  je     0x1ad97d                       ;   goto UNLOCK  (empty tree -> 0)
//
//     0x1ad915  addq   $0x8, %r12                     ; r12 = &end_node
//                                                     ; (the "past-end" sentinel for lower_bound)
//     0x1ad919  movq   %r12, %r15                     ; r15 = past_end (candidate = sentinel)
//     0x1ad91c  nopl   (%rax)                         ; align
//
//     ; --- RB-tree descent (libc++ std::map lower_bound) ---
//     ;   loop invariant: r13 = current node (non-null), r15 = best candidate
//     ;   with node.key >= input_name so far (or past_end if none yet).
//     0x1ad920  movq   0x20(%r13), %rdi               ; arg1 = *(node+0x20) = node_key
//     0x1ad924  movq   %r14, %rsi                     ; arg2 = input_name
//     0x1ad927  callq  _strcmp                        ; strcmp(node_key, input_name)
//     0x1ad92c  movl   %eax, %ecx                     ; ecx = result
//     0x1ad92e  shrl   $0x1f, %ecx                    ; ecx = (result < 0) ? 1 : 0
//                                                     ; -> 1 iff node_key < input_name
//     0x1ad931  testl  %eax, %eax                     ; check sign
//     0x1ad933  cmovnsq %r13, %r15                    ; r15 = node iff result >= 0
//                                                     ;   (i.e. node_key >= input_name)
//     0x1ad937  movq   (%r13,%rcx,8), %r13            ; r13 = node.child[cmp]
//                                                     ;   ecx=0: node.left  (@+0x00)
//                                                     ;   ecx=1: node.right (@+0x08)
//     0x1ad93c  testq  %r13, %r13                     ; child null?
//     0x1ad93f  jne    0x1ad920                       ;   loop
//
//     ; --- lookup DONE: r15 = lower_bound; verify equality ---
//     0x1ad941  cmpq   %r12, %r15                     ; r15 == past_end ?
//     0x1ad944  je     0x1ad97d                       ;   no candidate -> return 0
//     0x1ad946  movq   0x20(%r15), %rsi               ; arg2 = candidate_key
//     0x1ad94a  movq   %r14, %rdi                     ; arg1 = input_name
//     0x1ad94d  callq  _strcmp                        ; strcmp(input_name, candidate_key)
//     0x1ad952  testl  %eax, %eax
//     0x1ad954  js     0x1ad97d                       ; if input < candidate -> not found -> 0
//                                                     ; (else input >= candidate; combined with
//                                                     ;  candidate.key >= input from the loop
//                                                     ;  invariant, that means keys are EQUAL)
//     0x1ad956  movl   0x28(%r15), %ebx               ; ebx = *(candidate+0x28) = level (int)
//     0x1ad95a  jmp    0x1ad97d                       ; goto UNLOCK
//
//     ; --- ALLOC path: contexts == null on entry, allocate an empty tree ---
//     0x1ad95c  movl   $0x18, %edi                    ; arg1 = 24 (sizeof __tree)
//     0x1ad961  callq  __Znwm                         ; operator new(24)
//     0x1ad966  leaq   0x8(%rax), %rcx                ; rcx = &new_obj.end_node
//                                                     ;       (the +0x08 slot in the alloc)
//     0x1ad96a  xorps  %xmm0, %xmm0                   ; xmm0 = 0 (16 zero bytes)
//     0x1ad96d  movups %xmm0, 0x8(%rax)               ; new_obj[+0x08..+0x18] = 0
//                                                     ;   -> end_node_left = 0, size = 0
//     0x1ad971  movq   %rcx, (%rax)                   ; new_obj[+0x00] = &new_obj[+0x08]
//                                                     ;   -> begin_node_ = self-ref to end_node
//     0x1ad974  movq   %rax, HGLC::getContexts()::contexts(%rip)  ; write into the static
//     0x1ad97b  xorl   %ebx, %ebx                     ; ebx = 0 (fresh tree -> not-found)
//
//     ; --- UNLOCK + RETURN ---
//     0x1ad97d  leaq   HGLC::_ctxsLock(%rip), %rdi    ; arg1 = &_ctxsLock
//     0x1ad984  callq  _pthread_mutex_unlock          ; unlock
//     0x1ad989  movl   %ebx, %eax                     ; return ebx (int level, or 0)
//     0x1ad98b  addq   $0x8, %rsp
//     0x1ad98f  popq   %rbx
//     0x1ad990  popq   %r12
//     0x1ad992  popq   %r13
//     0x1ad994  popq   %r14
//     0x1ad996  popq   %r15
//     0x1ad998  popq   %rbp
//     0x1ad999  retq
//     0x1ad99a  nopw   (%rax,%rax)                    ; alignment pad
//
// -----------------------------------------------------------------------------
// PORT NOTES
// -----------------------------------------------------------------------------
// * HGLC's std::__1::__tree<> is not YET materially decoded — HGLC.ts models
//   the empty-tree shape as `HGLCContexts` (begin_node_selfref, end_node_left,
//   size) with no per-node type. No FCP writer for the tree has been ported
//   yet, so at runtime the tree is always empty. The lookup loop @0x1ad920
//   would descend a null root and exit @0x1ad913. The "not-found" bail path
//   (return 0) is therefore the ONLY reachable outcome for now.
//
// * The lazy-init path @0x1ad95c mirrors HGLC::getContexts()' `operator_new_24`
//   + zero-init + self-ref-write. To keep both call-sites converging on the
//   same runtime state we defer to HGLC.getContexts() rather than duplicating
//   the allocator. That function's body is byte-identical to the ALLOC block
//   here (operator new(24); zero 16 bytes @+0x08; write self-ref @+0x00;
//   store into the static cell). The observable state after the call is
//   IDENTICAL — the only difference is that getContexts() is the ledger
//   holder of the boundary-stub `operator_new_24`. See HGLC.ts.
//
// * `_pthread_mutex_lock` / `_pthread_mutex_unlock` are modelled as boundary
//   stubs (single-threaded JS runtime has no thread suspension); we call
//   them for provenance but they are no-ops. The lock is DOCUMENTED for
//   reviewer legibility — any future multi-threaded port must replace
//   these with real Atomics or a Web Worker mutex.

import {
  HGLC,
  __getHGLCContextsCell,
} from "./HGLC.js";

// -----------------------------------------------------------------------------
// TRUE OUT-OF-SCOPE EXTERNS (libSystem + libc++ ABI)
// -----------------------------------------------------------------------------

/**
 * `_pthread_mutex_lock(pthread_mutex_t*)` — libSystem POSIX threads.
 * Called from HGLogger::getLevel @0x1ad8f8 via Helium stub 0x3c556a.
 * TRUE out-of-scope extern; single-threaded JS runtime has no thread
 * suspension, so this is a no-op boundary stub. Documented for
 * provenance so a future multi-threaded port can replace it.
 */
function pthread_mutex_lock_HGLC_ctxsLock_stub(): void {
  // @0x1ad8f8 callq _pthread_mutex_lock  (Helium stub 0x3c556a)
  //   libSystem out-of-scope extern — modelled as no-op in single-threaded JS.
}

/**
 * `_pthread_mutex_unlock(pthread_mutex_t*)` — libSystem POSIX threads.
 * Called from HGLogger::getLevel @0x1ad984 via Helium stub 0x3c5570.
 * TRUE out-of-scope extern; single-threaded JS runtime — no-op stub.
 */
function pthread_mutex_unlock_HGLC_ctxsLock_stub(): void {
  // @0x1ad984 callq _pthread_mutex_unlock  (Helium stub 0x3c5570)
  //   libSystem out-of-scope extern — modelled as no-op in single-threaded JS.
}

// -----------------------------------------------------------------------------
// HGLogger — the logger-config namespace class. Static-only (no instances
// in the disasm we've seen); `getLevel` is a static member. Any future
// setter/logger method goes into THIS file per one-class-per-file rule.
// -----------------------------------------------------------------------------

/**
 * Module-scope Helium `static int HGLogger::_indent`
 *   — symbol `__ZN8HGLogger7_indentE`, zero-initialized (BSS).
 *
 * Shared nesting-depth counter mutated by `HGLogger::indent(int)`
 * @0x1ad855 (`lock addl %edi, __ZN8HGLogger7_indentE(%rip)`). Exposed as
 * a mutable holder so the atomic add is observable process-wide, exactly
 * like the C++ static. Any future logger method that reads the current
 * indent depth imports this cell.
 */
export const HGLogger__indent: { value: number } = { value: 0 };

/**
 * `class HGLogger` — Helium namespace container for logger-level queries.
 * Static-only in the observed disasm; no ctor or instance data is
 * referenced. Extendable — future methods (setLevel, log, etc.) belong
 * here.
 */
export class HGLogger {
  /**
   * `HGLogger::getLevel(char const* name)`
   *   — @Helium 0x1ad8e0
   *   — __ZN8HGLogger8getLevelEPKc
   *
   * Faithful transcription of the 61-line disassembly (quoted in the
   * file header). Returns the per-name logger level (int) stored in
   * `HGLC::getContexts()::contexts` — a `std::map<const char*, int,
   * HGLC::ltstr>` — or 0 if the name is not present.
   *
   * Semantics (all under HGLC::_ctxsLock):
   *   1. Lock HGLC::_ctxsLock.
   *   2. If the contexts pointer is null, allocate an empty tree and
   *      store it (lazy init; convergent with HGLC::getContexts).
   *      The freshly-allocated tree yields 0 (nothing was inserted).
   *   3. Else walk the RB-tree using libc++'s lower_bound + equality:
   *        candidate = past_end
   *        node = root
   *        while node:
   *          cmp = sign(strcmp(node.key, input))
   *          if cmp >= 0: candidate = node
   *          node = cmp < 0 ? node.right : node.left
   *        if candidate == past_end: return 0
   *        if strcmp(input, candidate.key) < 0: return 0  (miss)
   *        return candidate.level
   *   4. Unlock and return the level (or 0).
   *
   * Because no FCP writer has been ported yet, the runtime tree is
   * always empty and the reachable exit is @0x1ad913 (root null →
   * return 0). The tree-descent loop is transcribed faithfully so that
   * once a per-node type is ported (with +0x00 left, +0x08 right,
   * +0x20 key, +0x28 level), this function walks it correctly with
   * ZERO further changes.
   *
   * DEPENDENCIES: zero in-scope callees. Externs:
   *   _pthread_mutex_lock / _pthread_mutex_unlock (libSystem, stub),
   *   _strcmp                                     (libc, JS builtin cmp),
   *   __Znwm                                      (via HGLC.getContexts).
   */
  static getLevel(name: string): number {
    // @0x1ad8ee  movq %rdi,%r14  ; r14 = name

    // @0x1ad8f1  leaq HGLC::_ctxsLock(%rip),%rdi
    // @0x1ad8f8  callq _pthread_mutex_lock  (Helium stub 0x3c556a)
    pthread_mutex_lock_HGLC_ctxsLock_stub();

    // @0x1ad8fd  movq HGLC::getContexts()::contexts(%rip),%r12
    //   Read the raw static cell directly (NOT through getContexts()) —
    //   the disasm confirms getLevel does its OWN lazy-init if the cell
    //   is null. We import an accessor pair that exposes the cell.
    let contexts = __getHGLCContextsCell();

    // ebx (return-value accumulator) is initialised at multiple points
    // in the disasm; we model it as a local `ebx` for legibility.
    let ebx = 0;

    // @0x1ad904  testq %r12,%r12
    // @0x1ad907  je    0x1ad95c    (contexts == null -> lazy-init)
    if (contexts === null) {
      // --- ALLOC branch @0x1ad95c..0x1ad97b ---
      //   0x1ad95c  movl $0x18, %edi
      //   0x1ad961  callq __Znwm                 (Helium stub 0x3c4fb2, alloc 24 bytes)
      //   0x1ad966  leaq 0x8(%rax), %rcx         ; rcx = &new_obj.end_node
      //   0x1ad96a  xorps %xmm0, %xmm0           ; xmm0 = 0
      //   0x1ad96d  movups %xmm0, 0x8(%rax)      ; end_node_left=0, size=0
      //   0x1ad971  movq %rcx, (%rax)            ; begin_node_ = self-ref
      //   0x1ad974  movq %rax, HGLC::getContexts()::contexts(%rip)
      //   0x1ad97b  xorl %ebx, %ebx              ; ebx = 0 (fresh -> not-found)
      //
      // This block is byte-identical to HGLC::getContexts()'s allocator
      // block @0x1acb11-0x1acb26. Delegating to HGLC.getContexts()
      // yields the exact same runtime state (allocate empty tree,
      // publish to the shared cell) — the only difference is which
      // ledger unit owns the operator new boundary stub. We call it
      // for provenance and then observe the freshly-published cell.
      contexts = HGLC.getContexts();
      ebx = 0; // @0x1ad97b xorl %ebx,%ebx
    } else {
      // --- LOOKUP branch @0x1ad909..0x1ad95a ---

      // @0x1ad909  movq 0x8(%r12), %r13       ; r13 = end_node.__left_ = root
      //   HGLCContexts models `end_node_left` as `null` because no FCP
      //   writer for the tree has been ported yet. The disasm's tree
      //   node type has +0x00 left, +0x08 right, +0x20 key, +0x28 level;
      //   once decoded, root becomes `HGLCTreeNode | null` and the walk
      //   below descends it. Until then, `root` is always null and the
      //   walk falls through to the bail @0x1ad913.
      const root: HGLCTreeNode | null = contexts.end_node_left as
        | HGLCTreeNode
        | null;

      // @0x1ad90e  xorl %ebx,%ebx              ; ebx = 0 (result if not-found)
      ebx = 0;

      // @0x1ad910  testq %r13,%r13
      // @0x1ad913  je    0x1ad97d              ; empty tree -> UNLOCK
      if (root !== null) {
        // @0x1ad915  addq $0x8, %r12           ; r12 = &end_node (past_end sentinel)
        // @0x1ad919  movq %r12, %r15           ; r15 = past_end (candidate seed)
        //
        // In C++/libc++ the "past_end" sentinel is a raw pointer to
        // the tree's embedded end_node. We can't take a JS address, so
        // we use a symbolic `PAST_END` sentinel value distinct from
        // any real node (the disasm's only use of past_end is the
        // `cmpq %r12,%r15 ; je 0x1ad97d` equality check @0x1ad941 —
        // an identity comparison, which our sentinel preserves).
        let node: HGLCTreeNode | null = root;
        let candidate: HGLCTreeNode | typeof PAST_END = PAST_END;

        // @0x1ad920..0x1ad93f  — RB-tree lower_bound descent.
        while (node !== null) {
          // @0x1ad920  movq 0x20(%r13), %rdi     ; arg1 = node.key
          // @0x1ad924  movq %r14, %rsi           ; arg2 = input_name
          // @0x1ad927  callq _strcmp
          const result = strcmp(node.key, name);

          // @0x1ad92c  movl %eax, %ecx
          // @0x1ad92e  shrl $0x1f, %ecx          ; ecx = (result < 0) ? 1 : 0
          //   -> ecx = 1 iff node.key < input_name (follow RIGHT)
          const cmp = result < 0 ? 1 : 0;

          // @0x1ad931  testl %eax, %eax
          // @0x1ad933  cmovnsq %r13, %r15        ; r15 = node iff result >= 0
          //   (i.e. node.key >= input_name; this node is a lower_bound
          //    frontier candidate — strictly monotonic descent).
          if (result >= 0) {
            candidate = node;
          }

          // @0x1ad937  movq (%r13,%rcx,8), %r13  ; r13 = node.child[cmp]
          //   The RB-node ABI has left @+0x00 and right @+0x08, so
          //   ecx==0 loads left and ecx==1 loads right.
          node = cmp === 0 ? node.left : node.right;

          // @0x1ad93c  testq %r13,%r13
          // @0x1ad93f  jne   0x1ad920            ; loop while child non-null
        }

        // @0x1ad941  cmpq %r12,%r15             ; r15 == past_end ?
        // @0x1ad944  je   0x1ad97d              ; no candidate -> 0
        if (candidate !== PAST_END) {
          // @0x1ad946  movq 0x20(%r15), %rsi     ; arg2 = candidate.key
          // @0x1ad94a  movq %r14, %rdi           ; arg1 = input_name
          // @0x1ad94d  callq _strcmp             ; strcmp(input_name, candidate.key)
          //   NOTE the swapped arg order vs the descent's strcmp
          //   @0x1ad927. Same C stdlib function; different operand
          //   order. If (input < candidate.key), the lower_bound
          //   strictly-greater case triggers -> not found.
          const equalityResult = strcmp(
            name,
            (candidate as HGLCTreeNode).key,
          );

          // @0x1ad952  testl %eax,%eax
          // @0x1ad954  js    0x1ad97d           ; input < candidate.key -> not found
          if (equalityResult >= 0) {
            // @0x1ad956  movl 0x28(%r15), %ebx  ; ebx = candidate.level
            ebx = (candidate as HGLCTreeNode).level;
          }
          // @0x1ad95a  jmp 0x1ad97d
        }
      }
    }

    // @0x1ad97d  leaq HGLC::_ctxsLock(%rip),%rdi
    // @0x1ad984  callq _pthread_mutex_unlock  (Helium stub 0x3c5570)
    pthread_mutex_unlock_HGLC_ctxsLock_stub();

    // @0x1ad989  movl %ebx, %eax  ; return int
    // @0x1ad98b..0x1ad999          epilogue + retq
    return ebx;
  }

  /**
   * `HGLogger::indent(int delta)`
   *   — @Helium 0x1ad850
   *   — __ZN8HGLogger6indentEi
   *
   * Atomically adds `delta` to the module-scope static `HGLogger::_indent`
   * (a shared indentation-depth counter used to prefix nested log lines).
   * Verbatim (6-line) transcription:
   *
   *   0x1ad850  pushq %rbp
   *   0x1ad851  movq  %rsp,%rbp
   *   0x1ad854  lock
   *   0x1ad855  addl  %edi, __ZN8HGLogger7_indentE(%rip)   ; _indent += delta
   *   0x1ad85b  popq  %rbp
   *   0x1ad85c  retq
   *
   * `__ZN8HGLogger7_indentE` is a Helium module-scope `static int
   * HGLogger::_indent`, zero-initialized (BSS). The `lock addl` is an
   * atomic read-modify-write; in the single-threaded JS port the add is
   * inherently atomic, so we model it as a plain 32-bit add on the shared
   * holder. Returns void (no result register set).
   *
   * DEPENDENCIES: zero in-scope callees; touches only the static counter.
   */
  static indent(delta: number): void {
    // @0x1ad855  lock addl %edi, __ZN8HGLogger7_indentE(%rip)
    //   32-bit two's-complement add on the static int, matching the
    //   machine's `addl` width.
    HGLogger__indent.value = ((HGLogger__indent.value | 0) + (delta | 0)) | 0;
  }
}

// -----------------------------------------------------------------------------
// RB-tree node ABI shape (offsets recovered from getLevel's disasm)
// -----------------------------------------------------------------------------

/**
 * `HGLCTreeNode` — the libc++ `__tree_node<pair<const char*, int>, void*>`
 * shape as READ by HGLogger::getLevel. Field offsets are recovered from
 * the disasm:
 *   +0x00  left           — child pointer (@0x1ad937 with rcx=0)
 *   +0x08  right          — child pointer (@0x1ad937 with rcx=1)
 *   +0x20  key            — const char*   (@0x1ad920, @0x1ad946)
 *   +0x28  level          — int           (@0x1ad956)
 *
 * The two intermediate slots (+0x10 parent, +0x18 color/red-black tag)
 * are NOT read by getLevel; we do not model them here because we don't
 * INVENT unread fields (PORTING_SPEC rule 5). A ported writer (insert /
 * erase / rebalance) will introduce them when its disasm is decoded.
 *
 * NOTE: this type is not YET referenced by HGLC.ts's `HGLCContexts`
 * (whose `end_node_left` is currently typed `null`). Widening the
 * container's field to `HGLCTreeNode | null` is a separate, larger
 * change — it must land together with a real writer. Until then, the
 * runtime `root` in getLevel is always null and the descent loop
 * doesn't execute. Once the writer lands, `HGLCContexts.end_node_left`
 * widens to `HGLCTreeNode | null` and this file's port immediately
 * starts walking real nodes without further edits.
 */
export interface HGLCTreeNode {
  /** @Helium node offset +0x00 — child pointer @0x1ad937 with rcx=0. */
  left: HGLCTreeNode | null;
  /** @Helium node offset +0x08 — child pointer @0x1ad937 with rcx=1. */
  right: HGLCTreeNode | null;
  /** @Helium node offset +0x20 — `const char*` key @0x1ad920, @0x1ad946. */
  key: string;
  /** @Helium node offset +0x28 — `int` level @0x1ad956. */
  level: number;
}

/**
 * Sentinel value for the RB-tree "past-end" node used by libc++'s
 * lower_bound descent (`r12 = &end_node` @0x1ad915). The disasm only
 * compares it for identity against the candidate register @0x1ad941;
 * we preserve that identity semantics with a unique `Symbol`, which
 * can never coincide with a real `HGLCTreeNode`.
 */
const PAST_END = Symbol("HGLC-tree-past-end") as unknown as symbol;

// -----------------------------------------------------------------------------
// libc++ `_strcmp` boundary — call-outs to two libSystem strcmp sites.
// -----------------------------------------------------------------------------

/**
 * `_strcmp(char const*, char const*)` — libSystem libc.
 * Called from HGLogger::getLevel @0x1ad927 and @0x1ad94d via Helium
 * stub 0x3c55fa. Returns:
 *   * negative  if a <  b
 *   * zero      if a == b
 *   * positive  if a >  b
 *
 * TRUE out-of-scope extern (libc). Modelled with the equivalent JS
 * comparison — for ASCII/UTF-8 strings this is byte-lexicographic and
 * matches libc's strcmp. The disasm reads ONLY the sign of the result
 * (via `shrl $31,%ecx` and `testl %eax,%eax ; js/cmovns`), so the
 * magnitude is irrelevant; we return -1 / 0 / +1 for clarity.
 */
function strcmp(a: string, b: string): number {
  // @0x1ad927 / @0x1ad94d callq _strcmp  (Helium stub 0x3c55fa)
  //   libc out-of-scope extern.
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
