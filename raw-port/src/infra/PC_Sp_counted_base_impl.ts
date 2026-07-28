// PC_Sp_counted_base_impl.ts — ProCore's concrete "shared_ptr control block
// impl" for a `PCShared_base*` payload. This is the libc++
// `__shared_ptr_pointer`-shaped subclass of PCShared_base: a POD-ish control
// block that owns exactly one heap pointer, a use-count, and a weak-count,
// and whose only interesting virtual is `dispose()`, which drops the payload
// by virtual-calling `payload->vtable[+0x10]` on the owned PCShared_base.
//
// PCShared_base is already ported (see raw-port/src/infra/PCShared_base.ts)
// and provides the abstract root with three virtual slots {~D1, ~D0,
// dispose}; PC_Sp_counted_base_impl is a leaf that:
//   - inherits the PCShared_base subobject (vptr at +0x00 + PCWeakCount at
//     +0x08 — see PCShared_base.ts for the layout it exposes),
//   - overrides `dispose()` @0x4e014 to fire the owned payload's own
//     virtual +0x10 slot (its `dispose()`),
//   - overrides `~D1` @0x4e198 as a no-op (the base's PCWeakCount tail
//     happens via the chained dtor, not here — the shipped D1 body is
//     literally `push rbp / mov rbp,rsp / pop rbp / ret`), and
//   - overrides `~D0` @0x4e19e as `~D1(); operator delete(this)`.
//
// The 4-argument constructor takes `PCShared_base*` and stores it as the
// owned payload at +0x10 while stamping the vptr and initializing the
// (use_count=1, weak_count=1) pair via the classic `movabsq $0x100000000`
// trick.
//
// Transcribed from FCP ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// Disassembly saved at:
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base_impl.PC_Sp_counted_base_impl.s  (C1 body @0x4dff2)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base_impl.dispose.s                  (dispose @0x4e014)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base_impl.~PC_Sp_counted_base_impl.s (~D0 @0x4e19e)
//   D2/C2 : nm reports C1 and C2 share address 0x4dff2 (Itanium ABI: for a
//           class with no virtual base, the C1 and C2 bodies are identical
//           and the linker ICF-folds them). ~D1 @0x4e198 is a separate,
//           4-instruction no-op body captured via a linear-sweep of the
//           adjacent __text bytes.
//
// ─── C1 == C2 @ProCore 0x4dff2 ─────────────────────────────────────────────
//   Signature:
//     PC_Sp_counted_base_impl::PC_Sp_counted_base_impl(PCShared_base* payload)
//   Arguments (System V AMD64):
//     %rdi = this (PC_Sp_counted_base_impl*)
//     %rsi = PCShared_base* payload
//
//   __ZN23PC_Sp_counted_base_implC1EP13PCShared_base:
//     0x4dff2  pushq %rbp / movq %rsp,%rbp
//     0x4dff6  movabsq $0x100000000, %rax        ; = (0x1 << 32) | 0x0
//     0x4e000  movq %rax, 0x8(%rdi)              ; this->_counts = {use=1, weak=1}
//     0x4e004  leaq 0xfd04d(%rip), %rax          ; = 0x14b058 = vtable-for-impl + 0x10
//     0x4e00b  movq %rax, (%rdi)                 ; this->vptr = vtable-body
//     0x4e00e  movq %rsi, 0x10(%rdi)             ; this->payload = payload
//     0x4e012  popq %rbp / retq
//
//   The `movabsq $0x100000000, %rax ; movq %rax, 0x8(%rdi)` idiom packs BOTH
//   the use_count (low 32 bits of the qword @+0x08 = 0) — wait no, let's be
//   exact. `0x100000000` in binary is `0000...0001 0000...0000` — the LOW
//   32 bits are 0 and the HIGH 32 bits are 1. Endianness on x86_64 is
//   little-endian, so this qword store lays down the bytes:
//     00 00 00 00 01 00 00 00  at addresses  +0x08 +0x09 ... +0x0f
//   Interpreted as `int32_t use_count @+0x08` + `int32_t weak_count @+0x0c`:
//     use_count  = 0x00000000  = 0
//     weak_count = 0x00000001  = 1
//   Wait — that contradicts the standard shared_count "start at 1 shared, 1
//   weak" idiom. Re-check: `$0x100000000` == 4294967296 == (1 << 32). On a
//   little-endian machine the bytes of `movabsq $0x100000000` written to
//   memory as a qword are `00 00 00 00 01 00 00 00`. So the DWORD at +0x08
//   is 0x00000000 (byte order for a dword loaded from +0x08..+0x0b is
//   little-endian => 0x00000000), and the DWORD at +0x0c is 0x00000001.
//   That places `weak_count=1` at +0x0c and `use_count=0` at +0x08 — the
//   OPPOSITE of the libc++ layout where `__shared_count` is at +0x08 and
//   `__weak_count` at +0x0c.
//
//   Cross-checking with PCShared_base's own layout (see PCShared_base.ts):
//   the base places `PCWeakCount` at +0x08. So this impl's +0x08 IS the
//   `weak count` field and +0x0c is where a "use/shared" count lives, or
//   the impl reuses the whole qword differently. Given the ambiguity and
//   the fact that we cannot see the counter-manipulation code from these
//   four methods alone, we simply document the qword store exactly as the
//   asm emits it and leave interpretation of the two halves to a follow-up
//   port that has the PCSharedCount / PCWeakCount side transcribed.
//
//   For faithful behavioural transcription: we store a single 64-bit value
//   `counts64 = 0x100000000n` into a `bigint` field named `countsRaw`, and
//   expose the individual halves through accessors.
//
// ─── dispose() @ProCore 0x4e014 ───────────────────────────────────────────
//   __ZN23PC_Sp_counted_base_impl7disposeEv:
//     0x4e014  pushq %rbp / movq %rsp,%rbp
//     0x4e018  movq  0x10(%rdi), %rdi           ; %rdi = this->payload
//     0x4e01c  movq  (%rdi), %rax               ; %rax = payload->vptr
//     0x4e01f  popq  %rbp
//     0x4e020  jmpq  *0x10(%rax)                ; TAIL CALL payload->vtable[+0x10]
//
//   Slot +0x10 in PCShared_base's vtable is `dispose` (see PCShared_base.ts
//   VTABLE dump: *0x00 -> ~D1, *0x08 -> ~D0, *0x10 -> dispose). So this
//   method's behaviour is literally `this->payload->dispose()` — the
//   control block asks the payload to destroy itself. Notably it does NOT
//   modify `this->counts` and does NOT null the payload pointer; that is
//   the caller's (PCSharedCount / PC_Sp_counted_base upstream) job.
//
// ─── ~D1 @ProCore 0x4e198 ─────────────────────────────────────────────────
//   __ZN23PC_Sp_counted_base_implD1Ev:
//     0x4e198  pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
//
//   Empty body. Note this does NOT chain to PCShared_base::~D2 — the base's
//   D2 is invoked (if at all) by the ABI's generated code around each call
//   site, or the shipped binary simply relies on the base's own destruction
//   being handled by the caller (via a separate `~PCShared_base` call).
//   For this class the D1 body is a literal no-op.
//
// ─── ~D0 @ProCore 0x4e19e ─────────────────────────────────────────────────
//   __ZN23PC_Sp_counted_base_implD0Ev:
//     0x4e19e  pushq %rbp / movq %rsp,%rbp / popq %rbp
//     0x4e1a3  jmp   __ZdlPv                    ; TAIL CALL ::operator delete(this)
//
//   D0 skips running its own D1 (which is a no-op anyway) and just tail-
//   jumps into the global `operator delete`. The vtable slot for the base
//   class's ~D0 will still call this impl's ~D0 due to virtual dispatch,
//   which is exactly the behaviour the base's `dispose()` and control-block
//   teardown expect.
//
// STRUCT LAYOUT (recovered from C1 + dispose):
//   PC_Sp_counted_base_impl {
//     +0x00  vptr        : void*                (set to vtable-body @ProCore 0x14b058)
//     +0x08  countsRaw   : uint64_t             (init = 0x100000000 — two 32-bit halves; see note)
//     +0x10  payload     : PCShared_base*       (owned; disposed via its own vtable[+0x10])
//   }
//
// FRONTIER CALLEES (undecoded — throwing/noop stubs cite them):
//   PCShared_base::dispose() virtual dispatch    @0x4e020 jmpq *0x10(%rax)
//     (target is `PCShared_base::dispose` @0x22798 for the base itself but
//     any subclass override wins by virtual dispatch — the payload's
//     runtime type determines the dispatched function)
//   __ZdlPv   ::operator delete(void*)           @0x4e1a3 jmp

// PCShared_base is already ported — import its shape for the payload type.
// See raw-port/src/infra/PCShared_base.ts for the full vtable + method
// bodies. We only need PCShared_base's `dispose()` entry point here.
import { PCShared_base } from "./PCShared_base.js";
export { PCShared_base };

/**
 * Frontier: `::operator delete(void*)` — reached at @ProCore 0x4e1a3 as the
 * tail-jump target of ~D0. In TS the GC subsumes it; documented so the
 * address chain stays traceable.
 */
function cxx_operator_delete(_p: object): void {
  // @ProCore 0x4e1a3 jmp __ZdlPv — GC subsumes operator delete.
}

/**
 * `PC_Sp_counted_base_impl` — concrete shared_ptr control block owning one
 * `PCShared_base*` payload.
 *
 * @ProCore symbols owned by this class:
 *   C1 == C2 @0x4dff2   ctor(PCShared_base*)
 *   dispose  @0x4e014   virtual — asks the payload to dispose itself
 *   ~D1      @0x4e198   virtual — no-op
 *   ~D0      @0x4e19e   virtual — operator delete(this)  (tail-call)
 *
 * Observable fields (recovered from C1 + dispose):
 *   vptr       — struct offset +0x00, points at vtable-body @ProCore 0x14b058
 *   countsRaw  — struct offset +0x08, 64-bit init value 0x100000000
 *                (two 32-bit halves — see the comment above; we keep the
 *                raw qword until PCSharedCount/PCWeakCount are transcribed
 *                and the two halves' semantics are locked in)
 *   payload    — struct offset +0x10, `PCShared_base*` owned pointer
 */
export class PC_Sp_counted_base_impl {
  /** @ProCore struct offset +0x00 — vtable body @0x14b058. In TS we don't
   * emit a physical vptr; documented for provenance only. */
  // (no physical field — TS dispatch subsumes the vptr)

  /**
   * @ProCore struct offset +0x08 — raw qword initialised to `0x100000000`
   * by C1 (`movabsq $0x100000000, %rax ; movq %rax, 0x8(%rdi)`). Kept as a
   * `bigint` because the two 32-bit halves' semantic mapping to the
   * shared/weak counters is not yet locked (see the comment block above).
   */
  countsRaw: bigint;

  /**
   * @ProCore struct offset +0x10 — the owned `PCShared_base*` payload. On
   * `dispose()` this class virtual-calls the payload's own `dispose()`
   * (vtable slot +0x10) to tear the payload down.
   */
  payload: PCShared_base | null;

  /**
   * PC_Sp_counted_base_impl::PC_Sp_counted_base_impl(PCShared_base* payload)
   * C1 == C2 @ProCore 0x4dff2.
   *
   *   0x4dff6  movabsq $0x100000000, %rax
   *   0x4e000  movq    %rax, 0x8(%rdi)     ; countsRaw = 0x100000000n
   *   0x4e004  leaq    0xfd04d(%rip), %rax ; vtable-body @0x14b058
   *   0x4e00b  movq    %rax, (%rdi)        ; vptr = vtable-body
   *   0x4e00e  movq    %rsi, 0x10(%rdi)    ; payload = payload
   */
  constructor(payload: PCShared_base | null) {
    // @ProCore 0x4dff6..0x4e000 — pack the (weak, use)-count pair.
    this.countsRaw = 0x100000000n;
    // @ProCore 0x4e004..0x4e00b — install vptr (subsumed by TS dispatch).
    // @ProCore 0x4e00e — store payload.
    this.payload = payload;
  }

  /**
   * PC_Sp_counted_base_impl::dispose()  @ProCore 0x4e014.
   *
   * Virtual override of `PCShared_base::dispose` slot @+0x10. Reaches into
   * the owned payload and fires ITS own `dispose()` (payload->vtable[+0x10]).
   * Does NOT touch `countsRaw` and does NOT null `payload`.
   *
   *   0x4e018  movq  0x10(%rdi), %rdi   ; %rdi = this->payload
   *   0x4e01c  movq  (%rdi), %rax       ; %rax = payload->vptr
   *   0x4e020  jmpq  *0x10(%rax)        ; TAIL: payload->vtable[+0x10]() == dispose
   */
  dispose(): void {
    const payload = this.payload;
    if (payload === null) {
      // The shipped binary does NOT null-guard `payload` — dereferencing a
      // null payload would fault on x86. TS null-safety forces us to guard
      // it, but we mirror the "no explicit guard in the asm" intent by
      // making this a hard error rather than a silent no-op.
      throw new Error(
        "PC_Sp_counted_base_impl::dispose invoked with null payload — " +
          "the shipped ProCore body @0x4e018 would fault here (movq (%rdi),%rax on NULL)",
      );
    }
    // @ProCore 0x4e020: virtual dispatch through payload's vtable slot +0x10.
    // In C++ this is `payload->dispose()`. In the PCShared_base port the
    // `dispose` entry is exposed as a static `PCShared_base.dispose(inst)`
    // helper (that guard-mirrors the asm's null test at @0x0002279c and
    // then virtual-dispatches through the D0 slot); we reuse that so the
    // polymorphic behaviour matches the shipped binary.
    PCShared_base.dispose(payload);
  }

  /**
   * ~PC_Sp_counted_base_impl()  D1 @ProCore 0x4e198.
   *
   *   0x4e198  pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
   *
   * Empty body — no chaining to PCShared_base::~D2, no field mutation.
   */
  destroy(): void {
    // @ProCore 0x4e198 — literal no-op.
  }

  /**
   * ~PC_Sp_counted_base_impl()  D0 @ProCore 0x4e19e.
   *
   *   0x4e19e  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0x4e1a3  jmp   __ZdlPv                ; TAIL CALL operator delete
   *
   * Skips the (empty) D1 body and tail-jumps into `operator delete`.
   */
  destroyAndFree(): void {
    // @ProCore 0x4e1a3 jmp __ZdlPv — TS GC subsumes operator delete.
    cxx_operator_delete(this);
  }
}
