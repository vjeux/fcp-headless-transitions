// OZFxPlugLockSentinel — Ozone RAII sentinel that pairs a shared-read lock on
// an `OZFxPlugSharedLock` with a std::shared_ptr-style weak reference to an
// `OZFxPlugInstance` (the object the lock protects). On destruction it must
// (a) release the read side of the shared lock, and (b) atomically decrement
// the weak-count of the held libc++ __shared_weak_count control block —
// firing __on_zero_shared_weak + __release_weak when the last weak owner
// drops. Between construction and destruction the sentinel exposes a
// getFxPlugInstance() accessor that returns the (raw) FxPlug instance
// pointer if the underlying shared_ptr slot still holds one, else null.
//
// Source disassembly (dumped via raw-port/tools/disasm.sh, framework=Ozone):
//   ~OZFxPlugLockSentinel()   @0x109c00  __ZN20OZFxPlugLockSentinelD1Ev
//   getFxPlugInstance() const @0x2847a0  __ZNK20OZFxPlugLockSentinel17getFxPlugInstanceEv
//
// DECODE — struct layout (recovered from both bodies; only offsets 0x00 and
// 0x08 are read, and their access patterns pin their C++ types):
//
//   +0x00  OZFxPlugSharedLock*      sharedLock
//          — ~sentinel loads `*(this+0x0)` @0x109c09 and calls
//            `OZFxPlugSharedLock::unlockForRead()` on it @0x109c0c
//            (`callq __ZN18OZFxPlugSharedLock13unlockForReadEv`). Non-virtual,
//            direct call — sharedLock is a raw pointer, not a std::shared_ptr.
//   +0x08  std::__1::__shared_weak_count*   weakCtl
//          — ~sentinel loads `*(this+0x08)` @0x109c11 into %rbx, tests
//            null @0x109c15/0x109c18, and if non-null performs
//              `lock xaddq $-1, 0x8(%rbx)` @0x109c21-0x109c22
//            i.e. an atomic fetch-add of -1 into offset +0x08 of the control
//            block. That offset +0x08 is the exact position of
//            `__shared_weak_count::__shared_weak_owners_` in libc++
//            (layout: {vtable @+0x00, __shared_owners_ @+0x04 int32,
//             __shared_weak_owners_ @+0x08 int32}; the code widens to 64-bit
//            xaddq — the +0x0c bytes are padding on this build). If the
//            pre-decrement value was 1 (`testq %rax, %rax; je 0x109c33`
//            @0x109c27/0x109c2a) the weak-count has just hit zero and the
//            control block is destroyed:
//              - `movq (%rbx), %rax` @0x109c33  — load vtable
//              - `callq *0x10(%rax)` @0x109c39  — vtable slot +0x10 =
//                `__shared_weak_count::__on_zero_shared_weak()` (the 3rd
//                virtual after the two-slot RTTI/dtor prefix of the libc++
//                __shared_count/__shared_weak_count base). Called on `%rbx`.
//              - `jmp   0x6dfbbe` @0x109c45  — tail-call to symbol stub for
//                `std::__1::__shared_weak_count::__release_weak()` on `%rbx`.
//            The `___clang_call_terminate` @0x109c4a is the noexcept-dtor
//            catch-all landing pad; happy path only in the JS port.
//
//   sizeof(OZFxPlugLockSentinel) = 0x10 bytes (one raw pointer + one control-
//   block pointer; no vtable ptr at +0x00 — the class is not polymorphic;
//   the ctor is not exported which means it's inlined at every use site).
//
// Runtime imports / cross-class calls:
//   __ZN18OZFxPlugSharedLock13unlockForReadEv
//     — OZFxPlugSharedLock::unlockForRead() — NOT YET PORTED (frontier
//       callee). Ported as a throwing stub `OZFxPlugSharedLock_unlockForRead`
//       that cites this addr; wiring it in when that class lands is the fix.
//   `*0x10(%rax)` on __shared_weak_count vtable @0x109c39
//     — libc++ std::__1::__shared_weak_count::__on_zero_shared_weak(). Pure
//       libc++ std internal; not an Ozone class. Modeled as a callback on the
//       WeakCtl adapter object supplied by the caller.
//   __ZNSt3__119__shared_weak_count14__release_weakEv
//     — libc++ std::__1::__shared_weak_count::__release_weak() — Ozone symbol
//       stub @0x6dfbbe, tail-jumped from @0x109c45. Also modeled as a
//       callback on the WeakCtl adapter.
//
// DECODE — getFxPlugInstance() const @0x2847a0:
//   %rdi = this. Sequence:
//     mov (%rdi), %rax   @0x2847a4  — %rax = sharedLock = *(this+0x00)
//     mov (%rax), %rax   @0x2847a7  — %rax = *(sharedLock+0x00)
//     test %rax, %rax    @0x2847aa
//     je   0x2847b5      @0x2847ad  — if null, jump to return-null
//     mov 0x18(%rax), %rax @0x2847af — %rax = *(that_ptr + 0x18)
//     retq               @0x2847b4  — return that (an OZFxPlugInstance*)
//   The null branch @0x2847b5-0x2847b8: `xor %eax, %eax; retq` — return null.
//
//   Interpretation: `OZFxPlugSharedLock` stores its currently-held
//   OZFxPlugInstance-slot at its very first field (+0x00). That slot is a
//   pointer to a "holder" object whose +0x18 field is the raw FxPlug
//   instance pointer. Both the "holder" pointer and the FxPlug ptr can be
//   null (independently — this code only null-checks the outer pointer;
//   the +0x18 read is unconditional once the outer is non-null). No
//   locking / no atomics on this path — the read is a plain load, relying
//   on the sentinel's read-lock to keep the slot stable for the caller.
//
// NOTE: everything past @0x2847b9 in the disassembly listing is the head of
// the NEXT function in Ozone (its body clears a large object at
// +0x00..+0xf0 on some %rdi and writes 0x3ff0000000000000 = double 1.0 at
// +0x18 / +0xc8 — a ctor for an unrelated Ozone class). Those bytes are NOT
// part of OZFxPlugLockSentinel::getFxPlugInstance and are ignored here.
//
// This class is a lock/lifetime sentinel — it holds no arithmetic. There is
// no pure-math oracle to bind, so raw-port/army/gate/oracle_map.json is NOT
// extended for this file.
//
// @class OZFxPlugLockSentinel (Ozone)

/**
 * OZFxPlugSharedLock::unlockForRead() — cross-class. Not yet ported; the
 * ~OZFxPlugLockSentinel body calls it @0x109c0c. Throw a stub that cites
 * the callee address so the demand signal is preserved; the sentinel's
 * dtor path re-throws it verbatim.
 */
function OZFxPlugSharedLock_unlockForRead(_lock: unknown): never {
  throw new Error(
    "OZFxPlugSharedLock::unlockForRead not yet ported — " +
      "called from OZFxPlugLockSentinel::~OZFxPlugLockSentinel @0x109c0c " +
      "(Ozone symbol __ZN18OZFxPlugSharedLock13unlockForReadEv). " +
      "Port OZFxPlugSharedLock and wire it into raw-port/src/channels/ " +
      "OZFxPlugLockSentinel.ts to satisfy this demand.",
  );
}

/**
 * Adapter over the libc++ shared_ptr / weak_ptr control block
 * `std::__1::__shared_weak_count` that OZFxPlugLockSentinel embeds at
 * offset +0x08. The dtor accesses only three parts of it:
 *   - offset +0x08: __shared_weak_owners_ (int, atomically decremented)
 *   - vtable slot  +0x10: __on_zero_shared_weak()
 *   - symbol stub       : __release_weak()
 * We expose exactly those as an adapter object; a JS host can model the
 * libc++ control block however it likes (real atomics, a shim, or a stub)
 * as long as this shape is honored. `weakOwners` must be a mutable
 * one-slot integer container so we can mirror the `xaddq` fetch-add.
 */
export interface OZSharedWeakCount {
  /** Mutable single-slot int32 container mirroring +0x08. */
  weakOwners: { value: number };
  /** vtable slot +0x10 — libc++ __on_zero_shared_weak(). */
  onZeroSharedWeak(): void;
  /** Symbol-stub call — libc++ __shared_weak_count::__release_weak(). */
  releaseWeak(): void;
}

/**
 * Read-side view returned by getFxPlugInstance(). The disassembly's
 * outermost pointer (`*(sharedLock + 0x00)`) points to a "holder" whose
 * +0x18 field is the raw FxPlug instance. We surface that via
 * `holder.fxPlugInstance` — the +0x18 read is unconditional in the asm,
 * so this port also reads it unconditionally when the outer pointer is
 * non-null.
 */
export interface OZFxPlugSharedLockLike {
  /** *(this+0x00) — may be null. */
  currentHolder: { fxPlugInstance: unknown } | null;
}

/**
 * OZFxPlugLockSentinel — Ozone read-lock RAII sentinel.
 *
 * Layout (2 fields, sizeof = 0x10):
 *   +0x00  sharedLock : OZFxPlugSharedLock*
 *   +0x08  weakCtl    : std::__1::__shared_weak_count*  (may be null)
 *
 * The ctor is not exported by Ozone — construction is inlined at every use
 * site; the JS caller supplies both fields directly.
 *
 * @source Ozone
 * @classAddr n/a (no ctor exported)
 */
export class OZFxPlugLockSentinel {
  /** +0x00 — the shared lock this sentinel holds a read grant on. */
  sharedLock: OZFxPlugSharedLockLike;
  /** +0x08 — libc++ weak-count control block; may be null. */
  weakCtl: OZSharedWeakCount | null;

  constructor(sharedLock: OZFxPlugSharedLockLike, weakCtl: OZSharedWeakCount | null) {
    this.sharedLock = sharedLock;
    this.weakCtl = weakCtl;
  }

  /**
   * Destructor @0x109c00 (`__ZN20OZFxPlugLockSentinelD1Ev`).
   *
   * Mirrored control flow:
   *   1. `movq (%rdi), %rdi; callq OZFxPlugSharedLock::unlockForRead` @0x109c0c
   *   2. `movq 0x8(%rbx), %rbx; testq; je .Lret`                     @0x109c11-0x109c18
   *   3. `lock xaddq $-1, 0x8(%rbx); testq %rax; je .Ldrop`          @0x109c21-0x109c2a
   *   4. .Lret: return                                               @0x109c2c-0x109c32
   *   5. .Ldrop:
   *        `movq (%rbx), %rax; callq *0x10(%rax)`                    @0x109c33-0x109c39
   *          — __shared_weak_count::__on_zero_shared_weak()
   *        `jmp __ZNSt3__119__shared_weak_count14__release_weakEv`   @0x109c45
   *          — tail-call, control does not return.
   *
   * @addr 0x109c00 (Ozone)
   */
  destroy(): void {
    // @0x109c0c — OZFxPlugSharedLock::unlockForRead(*(this+0x00))
    OZFxPlugSharedLock_unlockForRead(this.sharedLock);

    // @0x109c11 — reload weakCtl into a local, mirror `movq 0x8(%rbx), %rbx`.
    // @0x109c15..0x109c18 — testq %rbx, %rbx; je .Lret. Null weakCtl means
    // the sentinel was constructed without a shared_ptr companion; nothing
    // to decrement, return immediately.
    if (this.weakCtl === null) return;
    // Type-guard function to keep narrowing across the mutation of
    // `weakOwners.value` below (tsc otherwise drops the narrowing on
    // `this.weakCtl` after a nested property assignment).
    const wc: OZSharedWeakCount = this.weakCtl!;

    // @0x109c1a..0x109c22 — `movq $-1, %rax; lock xaddq %rax, 0x8(%rbx)`.
    // Atomic fetch-add of -1 into __shared_weak_owners_ (+0x08 of the
    // control block). %rax receives the PRE-decrement value.
    const pre = (wc.weakOwners.value | 0);
    wc.weakOwners.value = ((pre - 1) | 0);

    // @0x109c27..0x109c2a — testq %rax, %rax; je .Ldrop. i.e. if the value
    // BEFORE the decrement was 0 (%rax==0) we fall through to Ldrop and
    // destroy the control block. `testq %rax` sets ZF when %rax==0, so `je`
    // is taken when the pre value was 0 — meaning the weak-count post-
    // decrement is now negative. In practice libc++ uses this exact
    // sentinel value (initial __shared_weak_owners_ = 0 stands for
    // "one owner"; each additional weak owner increments, and release
    // decrements — the last-owner-release is the pre==0 case).
    if (pre !== 0) return;

    // @0x109c33 — .Ldrop: load vtable, call slot +0x10 =
    //   __shared_weak_count::__on_zero_shared_weak() on the control block.
    wc.onZeroSharedWeak();

    // @0x109c45 — jmp __shared_weak_count::__release_weak() (tail-call).
    // In C++ this is a tail-jump; in JS we express it as a plain call and
    // then return (control does not continue past the tail-jump either
    // way — the last statement of the dtor).
    wc.releaseWeak();
  }

  /**
   * getFxPlugInstance() const @0x2847a0
   * (`__ZNK20OZFxPlugLockSentinel17getFxPlugInstanceEv`).
   *
   * Mirrored control flow:
   *   %rdi = this
   *   %rax = *(this+0x00)                                            @0x2847a4
   *   %rax = *(%rax+0x00)                                            @0x2847a7
   *   test %rax, %rax; je .Lnull                                     @0x2847aa-0x2847ad
   *   %rax = *(%rax+0x18); retq                                      @0x2847af-0x2847b4
   *   .Lnull: xor %eax, %eax; retq                                   @0x2847b5-0x2847b8
   *
   * @addr 0x2847a0 (Ozone)
   */
  getFxPlugInstance(): unknown {
    // @0x2847a4 — %rax = sharedLock = *(this+0x00)
    // @0x2847a7 — %rax = *(sharedLock+0x00) = holder pointer
    const holder = this.sharedLock.currentHolder;
    // @0x2847aa..0x2847ad — testq %rax, %rax; je .Lnull.
    if (holder === null) return null;
    // @0x2847af — movq 0x18(%rax), %rax — the +0x18 field of the holder.
    return holder.fxPlugInstance;
  }
}
