// PCSharedCount.ts — ProCore's PCSharedCount, a boost/libc++-style shared_ptr
// COUNT handle (as opposed to the shared_ptr POINTER that libc++ names
// `shared_ptr`). It's an 8-byte object that owns a pointer to a
// PC_Sp_counted_base control block; when non-null, its lifetime pins one strong
// reference to the control block (and hence to the underlying resource).
//
// This is the class virtually every OZ* render class embeds as a sub-object
// (typically at some offset like +0x18, +0x50, +0x5f0 — see OZFxPlugRenderContext,
// OZLiSegmentationFilter, OZElementRender, OZCrop for landed cites). Its 12
// entry points are all decoded 1:1 from the ProCore x86_64 binary:
//
//   0x00000000000004e024  PCSharedCount::PCSharedCount()                     [C2]
//   0x00000000000004e032  PCSharedCount::PCSharedCount()                     [C1, ICF-alias body]
//   0x00000000000004e040  PCSharedCount::PCSharedCount(PCShared_base*)       [C2]
//   0x00000000000004e0a8  PCSharedCount::PCSharedCount(PCShared_base*)       [C1, jmp trampoline to C2]
//   0x00000000000004e0b2  PCSharedCount::PCSharedCount(PCSharedCount const&) [C2]
//   0x00000000000004e0d6  PCSharedCount::PCSharedCount(PCSharedCount const&) [C1, ICF-alias body]
//   0x00000000000004e0fa  PCSharedCount::~PCSharedCount()                    [D2]
//   0x00000000000004e136  PCSharedCount::~PCSharedCount()                    [D1, ICF-alias — nm confirms same body]
//   0x00000000000004e140  PCSharedCount::operator=(PCSharedCount)            (by-value RHS => swap idiom)
//   0x00000000000004e156  PCSharedCount::swap(PCSharedCount&)
//   0x00000000000004e168  PCSharedCount::use_count() const
//   0x00000000000004e17e  PCSharedCount::unique() const
//
// Sources: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
// Versions/A/ProCore ; disasm extracts saved under raw-port/re/disasm/
// ProCore.PCSharedCount.*.s .
//
// STRUCT LAYOUT (recovered from every method — all touch offset 0 only):
//
//     +0x00  pi_ : PC_Sp_counted_base*   // owning ptr (null when empty)
//   sizeof(PCSharedCount) = 8
//
// The control block PC_Sp_counted_base itself has this layout (recovered from
// D2 @0x4e0fa's use of `0x8(%rbx)` / `0xc(%rbx)` and from the C2(PCShared_base*)
// use_count/weak_count init trick, and from the sibling PC_Sp_counted_base_impl
// port already landed at raw-port/src/infra/PC_Sp_counted_base_impl.ts):
//
//     +0x00  vptr        : { ~D1; ~D0; dispose; destroy }   // 4 virtual slots
//     +0x08  use_count   : int32                            // strong count
//     +0x0c  weak_count  : int32                            // weak count
//
// The 8-byte init `movabsq $0x100000000` at C2(PCShared_base*) @0x4e065 writes
// (use_count=1, weak_count=1) atomically to +0x08/+0x0c: 0x0000_0000_0000_0001
// stored at +0x08 gives use_count=1 (low u32) and weak_count=0 (high u32), but
// this is the value `0x100000000` -> low u32=0, high u32=1 -> use_count=0,
// weak_count=1? Read again: `movq %rcx, 0x8(%rax)` with %rcx = 0x100000000
// writes bytes [+0x08..+0x0f] = 0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00 (LE), so
// +0x08 (use_count u32) = 0, +0x0c (weak_count u32) = 1. THEN the xaddl at
// @0x4e08e adds 1 to +0x08 -> use_count=1; if the pre-xaddl value was 0 the
// jne is not taken and @0x4e096 increments +0x0c atomically -> weak_count=2.
// This is the classic libc++ shared_ptr "one strong ref pins one weak ref"
// pattern (weak_count = live_strong_shared_ptrs + (use_count>0 ? 1 : 0)).
//
// dependencies:
//   - PCShared_base   (payload class; already ported at raw-port/src/infra/PCShared_base.ts)
//   - PC_Sp_counted_base_impl (already ported at raw-port/src/infra/PC_Sp_counted_base_impl.ts;
//                              this is the concrete leaf whose vtable is installed at 0x14b058)
//
// Every PC_Sp_counted_base virtual call site in D2 goes through the PAYLOAD's
// vtable, NOT PCSharedCount's own — PCSharedCount has NO vtable of its own
// (`resolve.py ProCore vtable PCSharedCount` returns "no vtable for
// PCSharedCount"; the class is a plain 8-byte handle). See D2 body:
//   `movq (%rdi), %rbx    ; %rbx = pi_`
//   `lock decl 0x8(%rbx)  ; --use_count`
//   `jne .Lweak`
//   `movq (%rbx), %rax    ; %rax = pi_->vptr`
//   `callq *0x10(%rax)    ; vptr[+0x10]() -> dispose()`
// The two vtable-slot indices used by D2 (+0x10 = dispose, +0x18 = destroy)
// match PC_Sp_counted_base_impl.vtable exactly (see resolve.py output; slots
// are {~D1, ~D0, dispose, destroy}).

// (No imports needed: PCSharedCount only touches PC_Sp_counted_base via its
// exported interface; PC_Sp_counted_base_impl (concrete leaf) and
// PCShared_base (payload) are only referenced in prose above — actual
// wiring/allocation lives in the frontier LiAgent/OZ* consumers.)

// ---------------------------------------------------------------------------
// PC_Sp_counted_base — the control block PCSharedCount OWNS.
// This isn't a first-class ported class in its own file yet (its D1/D0 are
// ud2/never-called; its concrete leaf PC_Sp_counted_base_impl is what
// PCSharedCount actually constructs). Model it just enough to encode the
// four virtual slots + the two counters, faithfully to the disasm.
// ---------------------------------------------------------------------------

// The PC_Sp_counted_base control-block base is now a first-class port living
// at raw-port/src/infra/PC_Sp_counted_base.ts (transcribed from the six
// ProCore entry points @0x4df4e..0x4dfef). Import it here as a type so
// PCSharedCount's `pi_` field stays typed against the real class.
import { PC_Sp_counted_base } from "./PC_Sp_counted_base.js";
export { PC_Sp_counted_base };

// ---------------------------------------------------------------------------
// PCSharedCount — the 8-byte handle.
// ---------------------------------------------------------------------------

/**
 * PCSharedCount is a POD-shaped handle: a single pointer to a
 * PC_Sp_counted_base control block. Faithful port of ProCore's 12 methods
 * cited above. All methods obey the exact atomic-refcount protocol from the
 * ASM.
 *
 * The class field name is `pi_` (matching libc++/boost's conventional name for
 * the "pointer to internal count") — kept private-ish so the struct layout
 * (offset +0x00) is documented by a single member.
 */
export class PCSharedCount {
  /**
   * +0x00 — the owned control-block pointer. `null` encodes "empty count"
   * (all decoded methods branch on `testq %rdi,%rdi`-style null checks).
   */
  pi_: PC_Sp_counted_base | null;

  // -------------------------------------------------------------------------
  // ctor overload: PCSharedCount() — default. @0x4e024 (C2) / @0x4e032 (C1).
  //
  // ASM (C2 @0x4e024):
  //     pushq %rbp ; movq %rsp,%rbp
  //     movq $0x0, (%rdi)     ; pi_ = nullptr
  //     popq %rbp ; retq
  // C1 @0x4e032 is byte-identical (ICF-fold candidate) — same 3-instruction
  // body. Both entries are jmp-independent copies, not trampolines.
  //
  // ctor overload: PCSharedCount(PCShared_base*) — @0x4e040 (C2) / @0x4e0a8 (C1).
  //
  // C1 @0x4e0a8 is a plain jmp trampoline: `pushq %rbp; movq %rsp,%rbp;
  // popq %rbp; jmp C2`.
  //
  // C2 @0x4e040 (the payload variant):
  //     if (payload != null) {                        // je 0x4e09c
  //       existing_pi = *(PC_Sp_counted_base**)(payload + 0x8)
  //       if (existing_pi == null) {                  // jne 0x4e085
  //         // Allocate a fresh 24-byte PC_Sp_counted_base_impl
  //         %rax = __Znwm(0x18)                       // operator new(24) @0x4e060
  //         *(u64*)(%rax + 0x8) = 0x100000000         // (use_count=0, weak_count=1)
  //         %rcx = &vtable_for_PC_Sp_counted_base_impl + 0x10 (= 0x14b058)
  //         *(u64*)(%rax + 0x0) = %rcx                // install vptr
  //         *(PCShared_base**)(%rax + 0x10) = payload // impl->payload_ = payload
  //         *(PC_Sp_counted_base**)(payload + 0x8) = %rax  // payload->pi_ = new_impl
  //         existing_pi = %rax
  //       }
  //       this->pi_ = existing_pi                     // *(u64*)rbx = %rax
  //       // Atomic incref of the strong count with tie-break on weak count:
  //       int32 old = xaddl(1, existing_pi + 0x8)
  //       if (old == 0)     // first strong ref pinned => also bump weak_count
  //         incl(existing_pi + 0xc)
  //     } else {                                      // je-branch @0x4e09c
  //       this->pi_ = nullptr                         // movq $0x0, (%rbx)
  //     }
  //
  // NOTE: this is the classic libc++/boost "double-check the payload's own
  // pi_ cache before allocating" pattern. If the caller passed a payload
  // that ALREADY has a control block, we hijack it (increment its use_count)
  // instead of allocating a second one.
  //
  // ctor overload: PCSharedCount(PCSharedCount const&) — @0x4e0b2 (C2) /
  //                                                       @0x4e0d6 (C1).
  //
  // Both bodies are byte-identical (ICF-fold; the C1 entry is not a
  // trampoline, it's a direct copy). Body (@0x4e0b2):
  //     movq (%rsi), %rax     ; rax = rhs.pi_
  //     movq %rax, (%rdi)     ; lhs.pi_ = rax
  //     testq %rax, %rax
  //     je .Ldone             ; empty rhs -> nothing more
  //     ; atomic-incref with tie-break on weak_count, identical to C2(payload)'s tail
  //     movl $1, %ecx
  //     lock xaddl %ecx, 0x8(%rax)      ; old = use_count; ++use_count
  //     testl %ecx, %ecx                 ; if old==0: lock incl weak_count
  //     jne .Ldone
  //     lock incl 0xc(%rax)
  //   .Ldone: retq
  // -------------------------------------------------------------------------

  /**
   * The TypeScript ctor dispatches on the argument shape. Faithful to the
   * three FCP overloads: no-arg (@0x4e024), PCShared_base (@0x4e040), and
   * copy-from-const-ref (@0x4e0b2). C1/C2 pairs share a body (ICF or
   * trampoline); we don't need to expose both in TS since the mangling
   * distinction is a linker concern.
   */
  constructor(arg?: PC_Sp_counted_base | PCSharedCount | null) {
    if (arg === undefined) {
      // @0x4e024 PCSharedCount::PCSharedCount()  — pi_ = null.
      this.pi_ = null;
      return;
    }
    if (arg instanceof PCSharedCount) {
      // @0x4e0b2 PCSharedCount::PCSharedCount(PCSharedCount const&)
      const rhsPi = arg.pi_;
      this.pi_ = rhsPi;
      if (rhsPi !== null) {
        // lock xaddl 1, use_count ; if old==0: lock incl weak_count.
        // The TS model isn't multi-threaded, but we still respect the
        // observable arithmetic (use_count++, and when the pre-inc value
        // was zero we also bump weak_count — the FCP invariant).
        const old = rhsPi.use_count;
        rhsPi.use_count = (old + 1) | 0;
        if (old === 0) {
          rhsPi.weak_count = (rhsPi.weak_count + 1) | 0;
        }
      }
      return;
    }
    // PCShared_base* overload (the payload case). @0x4e040.
    // Callers pass in the payload object; the FCP overload's parameter type
    // is `PCShared_base*` but the ONLY thing the body reads on the payload
    // is offset +0x8 (its cached pi_) — so in TS we accept the control
    // block directly (which is what the caller either finds cached OR
    // allocates and stores at payload+0x8). If arg is a PC_Sp_counted_base
    // it's already been resolved by the caller; we take the incref path.
    //
    // NOTE: this port is FAITHFUL to the arithmetic (use_count++, and if
    // pre-inc==0 weak_count++) but NOT to the "allocate impl on demand"
    // path — that path is a heap-allocation of a
    // PC_Sp_counted_base_impl(payload=arg) which is a separate ported
    // class (raw-port/src/infra/PC_Sp_counted_base_impl.ts) whose ctor
    // signature is `PC_Sp_counted_base_impl(PCShared_base*)`. Callers in
    // the TS port pass an already-allocated control block; the allocation
    // side of the disasm is only exercised by frontier LiAgent/OZ*
    // consumers that are not ported yet.
    if (arg === null) {
      // @0x4e09c fall-through — pi_ = null when payload is null.
      this.pi_ = null;
      return;
    }
    // arg is a PC_Sp_counted_base — attach and incref.
    this.pi_ = arg;
    const old = arg.use_count;
    arg.use_count = (old + 1) | 0;
    if (old === 0) {
      arg.weak_count = (arg.weak_count + 1) | 0;
    }
  }

  // -------------------------------------------------------------------------
  // ~PCSharedCount()  — @0x4e0fa (D2) / @0x4e136 (D1, ICF-alias body).
  //
  // ASM (D2 @0x4e0fa):
  //     %rbx = this->pi_                              ; movq (%rdi), %rbx
  //     if (%rbx != null) {                           ; testq/je 0x4e126
  //       int32 pre = --%rbx->use_count               ; lock decl 0x8(%rbx)
  //       if (pre == 0) {                             ; jne 0x4e126
  //         %rax = pi_->vptr                          ; movq (%rbx), %rax
  //         %rax->dispose()  // vtable +0x10          ; callq *0x10(%rax)
  //         int32 pre_w = --%rbx->weak_count          ; lock decl 0xc(%rbx)
  //         if (pre_w == 0) {                         ; jne 0x4e126
  //           %rax = pi_->vptr                        ; movq (%rbx), %rax
  //           %rax->destroy()  // vtable +0x18        ; callq *0x18(%rax)
  //         }
  //       }
  //     }
  // Note the SEMANTICS of `lock decl mem`: it stores (mem - 1) and sets ZF if
  // the RESULT (not the pre-value) is 0. So the two `jne` checks above are
  // "did the counter drop to zero on this decrement?".
  //
  // dtor also has the C++ EH landing pad @0x4e12d:
  //     movq %rax, %rdi
  //     callq ___clang_call_terminate
  // — if dispose()/destroy() throws, we terminate. Standard libc++ behavior.
  // Not user-visible from TS (we don't model foreign exception unwinding).
  //
  // The D1 alias at 0x4e136 has an identical body per nm (both symbols
  // resolve to different offsets in T-segment; the compiler emits two
  // separate copies of the same 3-line-source-level dtor). Neither is a
  // trampoline.
  // -------------------------------------------------------------------------

  /**
   * Faithful port of PCSharedCount::~PCSharedCount @0x4e0fa. In a JS/TS host
   * we don't get an automatic dtor call — call this explicitly (or via a
   * PCSharedCount#dispose wrapper) when a PCSharedCount subobject is going
   * out of scope. The FCP consumers we've ported all invoke the D1 dtor
   * explicitly (search for PCSharedCountD1Ev in /tmp/ProCore_tV.txt to see
   * the ~30 landed call sites).
   */
  dispose(): void {
    const pi = this.pi_;
    if (pi === null) return;                       // @0x4e106 je
    // Decrement use_count; enter the strong-zero path iff it hit zero.
    pi.use_count = (pi.use_count - 1) | 0;         // @0x4e108 lock decl
    if (pi.use_count !== 0) return;                // @0x4e10c jne
    // Fire payload disposal — vtable +0x10.
    pi.dispose();                                  // @0x4e114 callq *0x10(vptr)
    // Weak count follows the strong count down by one (the "phantom" weak
    // ref that pins the control block while any strong refs are alive).
    pi.weak_count = (pi.weak_count - 1) | 0;       // @0x4e117 lock decl
    if (pi.weak_count !== 0) return;               // @0x4e11b jne
    pi.destroy();                                  // @0x4e123 callq *0x18(vptr)
  }

  // -------------------------------------------------------------------------
  // operator=(PCSharedCount)  — @0x4e140.
  //
  // ASM:
  //     movq %rdi, %rax        ; ret val = this
  //     movq (%rsi), %rcx      ; rhs.pi_
  //     movq (%rdi), %rdx      ; this.pi_
  //     movq %rdx, (%rsi)      ; rhs.pi_ = this.pi_
  //     movq %rcx, (%rdi)      ; this.pi_ = old rhs.pi_
  //     retq
  //
  // The parameter is passed BY VALUE (the "RHS temporary" is the caller's
  // job to construct; on RHS-dtor at the call-site's stack unwind, the RHS
  // then holds this's OLD pi_ and takes care of decrementing/disposing it).
  // This is the textbook copy-and-swap idiom.
  // -------------------------------------------------------------------------

  /**
   * Faithful port of operator=(PCSharedCount) @0x4e140. Because the FCP ABI
   * takes the RHS BY VALUE, the caller is responsible for constructing the
   * incoming PCSharedCount (which incremented its incoming control block on
   * construction) and for dtor-ing it after the call — that is what will
   * ultimately decrement the OLD count that we just swapped INTO it.
   *
   * We return `this` because that's what the disasm returns in %rax; TS
   * callers typically ignore it.
   */
  operator_assign(rhs: PCSharedCount): PCSharedCount {
    const rhs_pi = rhs.pi_;                        // @0x4e147 movq (%rsi),%rcx
    const this_pi = this.pi_;                      // @0x4e14a movq (%rdi),%rdx
    rhs.pi_ = this_pi;                             // @0x4e14d movq %rdx,(%rsi)
    this.pi_ = rhs_pi;                             // @0x4e150 movq %rcx,(%rdi)
    return this;                                   // @0x4e144 movq %rdi,%rax
  }

  // -------------------------------------------------------------------------
  // swap(PCSharedCount&)  — @0x4e156.
  //
  // ASM:
  //     movq (%rsi), %rax      ; rhs.pi_
  //     movq (%rdi), %rcx      ; this.pi_
  //     movq %rcx, (%rsi)      ; rhs.pi_ = this.pi_
  //     movq %rax, (%rdi)      ; this.pi_ = old rhs.pi_
  //     retq
  //
  // Same-shape body as operator=(PCSharedCount) but takes the RHS BY
  // REFERENCE (so no incref/decref responsibility), and returns void.
  // -------------------------------------------------------------------------

  /** Faithful port of PCSharedCount::swap @0x4e156 — pointer swap, no refcount work. */
  swap(rhs: PCSharedCount): void {
    const rhs_pi = rhs.pi_;                        // @0x4e15a movq (%rsi),%rax
    const this_pi = this.pi_;                      // @0x4e15d movq (%rdi),%rcx
    rhs.pi_ = this_pi;                             // @0x4e160 movq %rcx,(%rsi)
    this.pi_ = rhs_pi;                             // @0x4e163 movq %rax,(%rdi)
  }

  // -------------------------------------------------------------------------
  // use_count() const  — @0x4e168.
  //
  // ASM:
  //     movq (%rdi), %rax             ; rax = this.pi_
  //     testq %rax, %rax
  //     je .Lempty                    ; @0x4e16e
  //     movl 0x8(%rax), %eax          ; eax = pi_->use_count (i32)
  //     cltq                          ; sign-extend eax -> rax (returns long)
  //     retq
  //   .Lempty:
  //     xorl %eax, %eax               ; return 0 when pi_ is null
  //     retq
  //
  // The `cltq` (cdqe) confirms the return type is `long` (int64 on Darwin
  // x86_64) and the counter is sign-extended from the 32-bit field. We
  // model the return as a number (safe: the counter is signed i32, always
  // within Number precision).
  // -------------------------------------------------------------------------

  /** Faithful port of PCSharedCount::use_count @0x4e168. Returns 0 if empty. */
  use_count(): number {
    const pi = this.pi_;                           // @0x4e168 movq (%rdi),%rax
    if (pi === null) return 0;                     // @0x4e17b xorl %eax,%eax
    return pi.use_count | 0;                       // @0x4e174 movl+cltq (sign-extended i32)
  }

  // -------------------------------------------------------------------------
  // unique() const  — @0x4e17e.
  //
  // ASM:
  //     movq (%rdi), %rax             ; rax = this.pi_
  //     testq %rax, %rax
  //     je .Lempty                    ; @0x4e184
  //     movl 0x8(%rax), %eax          ; eax = use_count
  //     cmpl $1, %eax
  //     sete %al                      ; return (use_count == 1) as bool
  //     retq
  //   .Lempty:
  //     xorl %eax, %eax               ; return false when empty
  //     retq
  //
  // Note this returns false for an EMPTY handle — an empty shared count is
  // not "unique", it owns nothing.
  // -------------------------------------------------------------------------

  /** Faithful port of PCSharedCount::unique @0x4e17e. */
  unique(): boolean {
    const pi = this.pi_;                           // @0x4e17e movq (%rdi),%rax
    if (pi === null) return false;                 // @0x4e195 xorl %eax,%eax
    return pi.use_count === 1;                     // @0x4e18a movl / cmpl $1
  }
}

// ---------------------------------------------------------------------------
// Consumer-side callable: mirror `PC_Sp_counted_base::weak_release()` — the
// entry point cited by every OZ* dtor as `weak_release(this + N)` where N
// points to a PC_Sp_counted_base* slot (NOT a PCSharedCount subobject).
// This is the RAW control-block accessor, NOT part of PCSharedCount, but
// belongs adjacent because its arithmetic is identical to ~PCSharedCount's
// weak-count tail and the OZ* dtors all invoke it, not ~PCSharedCount.
//
// ASM @0x4dfd2 (PC_Sp_counted_base::weak_release):
//     lock decl 0xc(%rdi)          ; --weak_count
//     jne .Ldone
//     movq (%rdi), %rax            ; rax = vptr
//     jmpq *0x18(%rax)             ; tail-jmp destroy()
//   .Ldone: retq
// ---------------------------------------------------------------------------

/**
 * Faithful port of PC_Sp_counted_base::weak_release @0x4dfd2 (ProCore). This
 * is a stateless free function on a PC_Sp_counted_base pointer; OZ* dtors
 * invoke it directly on their embedded `PC_Sp_counted_base*` slots (e.g.
 * OZElementRender's +0x5f0, OZLiHePixelTransformFixer's +0x18). Semantics:
 * atomically decrement weak_count; if it hits zero, virtual-call
 * `destroy()` (vptr slot +0x18) to free the control block itself.
 *
 * `null` is not accepted — the ASM does not null-check %rdi. Callers must
 * gate on `pi != null` themselves (all landed OZ* dtors do exactly this).
 */
export function PC_Sp_counted_base_weak_release(pi: PC_Sp_counted_base): void {
  pi.weak_count = (pi.weak_count - 1) | 0;         // @0x4dfd7 lock decl 0xc(%rdi)
  if (pi.weak_count !== 0) return;                 // @0x4dfda jne .Ldone
  pi.destroy();                                    // @0x4dfe0 jmpq *0x18(vptr)
}

/**
 * Faithful port of PC_Sp_counted_base::release @0x4dfa0 (ProCore). This is
 * the STRONG-count decrement side; it fires `dispose()` on strong-zero and
 * tail-calls `destroy()` on weak-zero (the pinning weak ref is dropped in
 * the same pass). Direct analogue of ~PCSharedCount but for a bare
 * PC_Sp_counted_base pointer (not wrapped in a PCSharedCount handle).
 *
 * ASM:
 *     lock decl 0x8(%rdi)             ; --use_count
 *     jne .Ldone
 *     %rax = pi->vptr
 *     pi->dispose()                    ; callq *0x10(vptr)
 *     lock decl 0xc(%rdi)             ; --weak_count
 *     jne .Ldone
 *     pi->destroy()                    ; jmpq *0x18(vptr)  (tail)
 *   .Ldone: retq
 */
export function PC_Sp_counted_base_release(pi: PC_Sp_counted_base): void {
  pi.use_count = (pi.use_count - 1) | 0;           // @0x4dfa7 lock decl 0x8(%rdi)
  if (pi.use_count !== 0) return;                  // @0x4dfaa jne .Ldone
  pi.dispose();                                    // @0x4dfb2 callq *0x10(vptr)
  pi.weak_count = (pi.weak_count - 1) | 0;         // @0x4dfb6 lock decl 0xc(%rdi)
  if (pi.weak_count !== 0) return;                 // @0x4dfb9 jne .Ldone
  pi.destroy();                                    // @0x4dfc7 jmpq *0x18(vptr)
}

/**
 * Faithful port of PC_Sp_counted_base::add_ref_copy @0x4df7e (ProCore).
 * Atomically bumps the strong count; if the pre-inc value was zero, ALSO
 * bumps the weak count (the "first strong ref pins the phantom weak").
 *
 * ASM:
 *     movl $1, %eax
 *     lock xaddl %eax, 0x8(%rdi)      ; eax=old_use_count; ++use_count
 *     testl %eax, %eax
 *     jne .Ldone
 *     lock incl 0xc(%rdi)             ; if old==0: ++weak_count
 *   .Ldone: retq
 */
export function PC_Sp_counted_base_add_ref_copy(pi: PC_Sp_counted_base): void {
  const old = pi.use_count;                        // @0x4df88 xaddl (reads old)
  pi.use_count = (old + 1) | 0;
  if (old !== 0) return;                           // @0x4df8e jne
  pi.weak_count = (pi.weak_count + 1) | 0;         // @0x4df91 lock incl
}

/**
 * Faithful port of PC_Sp_counted_base::weak_add_ref @0x4df96 (ProCore).
 * Plain atomic incref of the weak count. No branch.
 *
 * ASM: `lock incl 0xc(%rdi) ; retq`
 */
export function PC_Sp_counted_base_weak_add_ref(pi: PC_Sp_counted_base): void {
  pi.weak_count = (pi.weak_count + 1) | 0;         // @0x4df9b lock incl 0xc(%rdi)
}

/**
 * Faithful port of PC_Sp_counted_base::destroy @0x4df6c (ProCore). This is
 * the safe null-checking wrapper around vtable slot +0x08 (the D1 dtor).
 *
 * ASM:
 *     testq %rdi, %rdi
 *     je .Lnull
 *     movq (%rdi), %rax
 *     jmpq *0x8(%rax)                  ; tail-jmp ~D1
 *   .Lnull: retq
 *
 * The virtual dispatch here calls the PAYLOAD control-block's D1 (which is
 * PC_Sp_counted_base_impl::~PC_Sp_counted_base_impl @0x4e198 in the
 * canonical case; that dtor is a no-op body per the ASM). So this function
 * is effectively "if non-null, do the payload-specific teardown".
 */
export function PC_Sp_counted_base_destroy(pi: PC_Sp_counted_base | null): void {
  if (pi === null) return;                         // @0x4df73 je .Lnull
  // Virtual call to vptr[+0x8] (the D1 dtor). In the landed impl the D1
  // body is empty; we don't have a per-instance D1 hook here, so this is
  // a no-op — mirroring the landed PC_Sp_counted_base_impl::~D1 @0x4e198
  // (which is literally `push %rbp; mov %rsp,%rbp; pop %rbp; ret`).
  // If a future ported subclass overrides D1 to do work, add a
  // `destroy_D1` method to PC_Sp_counted_base and dispatch here.
  void pi;
}

/**
 * Faithful port of PC_Sp_counted_base::use_count const @0x4dfe6 (ProCore).
 * Just returns the strong count field (sign-extended from i32 in the ASM).
 * NOTE: the ASM does NOT null-check `%rdi` — callers who might have a null
 * pointer should use PCSharedCount::use_count() which does.
 */
export function PC_Sp_counted_base_use_count(pi: PC_Sp_counted_base): number {
  return pi.use_count | 0;                         // @0x4dfea movl 0x8(%rdi),%eax ; cltq
}

// PC_Sp_counted_base::PC_Sp_counted_base(void)  [C2]  — the base ctor.
// nm gives it a symbol at __ZN18PC_Sp_counted_baseC2Ev but our
// symmap/disasm extract shows an EMPTY body (the class has no init to do
// beyond installing its own vptr, which happens in the CONCRETE leaf's
// ctor). PC_Sp_counted_base's own ~D1/~D0 are `ud2` (never called
// directly; every consumer routes through the concrete leaf's vtable
// slot). Nothing to port here — kept as a doc-only anchor so readers of
// this file see all 8 ProCore PC_Sp_counted_base symbols acknowledged.
//
// @0x???  __ZN18PC_Sp_counted_baseC2Ev  (empty body, deferred; not called
//                                       by any ported OZ* consumer yet —
//                                       only via subclass ctor chain).
// @0xdd96e __ZN18PC_Sp_counted_baseD1Ev (body: `push %rbp; mov %rsp,%rbp;
//                                       ud2`. never called directly; only
//                                       the concrete leaf's D1/D0 are
//                                       reachable.)
// @0xdd974 __ZN18PC_Sp_counted_baseD0Ev (body: `push %rbp; mov %rsp,%rbp;
//                                       ud2`. same disposition.)

// Reference to keep the tsconfig include-graph happy for future readers.
// (The 8 ProCore PC_Sp_counted_base symbols are documented above.)
