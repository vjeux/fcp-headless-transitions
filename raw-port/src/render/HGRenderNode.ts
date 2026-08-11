// raw-port/src/render/HGRenderNode.ts
//
// Helium `HGRenderNode` — the base class Ozone's OZHGRenderNodeBase derives from and the
// argument type of the notify callback installed via HGRenderNode::SetNotifyFunc.
//
// This module surfaces ONLY the minimum surface required to compile OZHGRenderNodeBase:
//   - class HGRenderNode              (opaque base; no fields decoded yet)
//   - HGRenderNodeSetNotifyFunc(node, fn)  ; extern @HGRenderNode::SetNotifyFunc
//
// All bodies are throwing stubs so the frontier stays visible (see raw-port/army/frontier).
//
// FRAMEWORK: Helium.framework.
// Mangled cite: __ZN12HGRenderNode13SetNotifyFuncEPFvPS_E (invoked from OZHGRenderNodeBase ctor
// at Ozone 0x6352c3 as a symbol stub — the concrete address inside Helium is not resolved here).

// The `HGRenderer*` argument type of SetRenderer @Helium 0xdcca0 — imported as
// a TYPE only (erased at runtime, so no import cycle with HGRenderer.ts).
import type { HGRenderer } from "./HGRenderer.js";

/** Signature of HGRenderNode::SetNotifyFunc — takes a plain C function pointer. */
export type HGRenderNodeNotifyFn = (node: HGRenderNode | null) => void;

/**
 * HGRenderNode — Helium base class for asynchronous render work.
 *
 * The concrete field layout is not decoded here. Ozone's OZHGRenderNodeBase adds NO extra fields
 * (verified: the ctor at Ozone 0x6352a0 does NOT write anywhere beyond `(rbx)` = vtable ptr and
 * whatever HGRenderNode::SetNotifyFunc writes). Subclasses in this port that inherit MUST NOT
 * assume a specific layout beyond what HGRenderNode itself decodes.
 */
/**
 * `HGRenderNode::State` — the enum tag stored at +0x38. No decoded instruction
 * pins a single NAMED enumerator: `SetState` @0xdcc94 passes %esi straight into
 * the slot with no mask, no range check and no branch, and `GetState` @0xdcdf4
 * hands the same 32 bits back. One value is now known — the constructor
 * initialises the slot to 1 (`movq $0x1, 0x38(%rbx)` @Helium 0xdc9ea), so 1 is
 * the state of a freshly built node — but the enumerator NAMES are still
 * undecoded, so the type stays an opaque u32 alias until a comparison site
 * reveals them; the same treatment the landed HGRenderJob.ts gives its own enum
 * tags.
 */
export type HGRenderNodeState = number;

export class HGRenderNode {
  // No decoded fields yet. The C++ HGRenderNode constructor is __ZN12HGRenderNodeC2Ev @Helium
  // (undecoded here); our stub does nothing so subclasses inherit a valid empty base.

  /**
   * @Helium offset +0xb0 — the `HGRenderer*` slot.
   *
   * FIRST decoded field of this class. Written by `SetRenderer(HGRenderer*)`
   * @0xdcca4 (`movq %rsi, 0xb0(%rdi)`) — a plain 64-bit pointer store: no
   * refcount call (no Retain on the incoming pointer, no Release of the
   * previous one), no null check, no dirty flag. The pointer is stored RAW,
   * NULL included, so the slot starts NULL here rather than being given an
   * invented initial value.
   *
   * Nothing else about the object's layout is decoded by that method, so no
   * other field is added from it: the +0x00..+0x9f region, the +0xa8 gap and
   * everything past +0xb8 stay unmodelled until a method that reads them is
   * transcribed (+0xa0 is decoded separately, by SetNotifyFunc @0xdcde4).
   */
  rendererAtB0: HGRenderer | null = null;

  /**
   * @Helium offset +0xa0 — the notify-callback slot.
   *
   * Written by `SetNotifyFunc(void(*)(HGRenderNode*))` @0xdcde4
   * (`movq %rsi, 0xa0(%rdi)`), the exact twin store of `SetRenderer`'s
   * @0xdcca4 sixteen bytes lower. Raw pointer store, NULL included, so the
   * slot starts NULL.
   */
  notifyFuncAtA0: HGRenderNodeNotifyFn | null = null;

  /**
   * `HGRenderNode::SetRenderer(HGRenderer*)` @Helium 0xdcca0
   * (__ZN12HGRenderNode11SetRendererEP10HGRenderer).
   *
   * Full transcription — every instruction, in order:
   *
   *   0xdcca0  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0xdcca1  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0xdcca4  movq  %rsi, 0xb0(%rdi)     ; this->rendererAtB0 = renderer
   *   0xdccab  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0xdccac  retq                       ; void return
   *   0xdccad  nopl  (%rax)               ; alignment padding, not executed
   *
   * A bare 64-bit store — the ENTIRE body is one instruction. The argument is
   * neither tested nor transformed: passing NULL clears the slot, and an
   * existing pointer is overwritten without any Release, so this setter does
   * NOT take ownership.
   *
   * ZERO callees of any kind: no in-scope call, no extern, no indirect and no
   * virtual dispatch (`depgraph.py deps` lists nothing).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s (7 lines)
   */
  SetRenderer(this: HGRenderNode, renderer: HGRenderer | null): void {
    // @0xdcca4  movq %rsi,0xb0(%rdi) — raw pointer store, NULL included.
    this.rendererAtB0 = renderer;
  }

  /**
   * @Helium offset +0x38 — the u32 `HGRenderNode::State` enum tag.
   *
   * Written by `SetState` @0xdcc94 (`movl %esi, 0x38(%rdi)`) and read back by
   * `GetState` @0xdcdf4 (`movl 0x38(%rdi), %eax`) — a matched 32-bit store/load
   * pair, which is what fixes both the offset and the width. (`GetState`
   * @0xdcdf0 is its own ledger unit and is NOT ported here; it is read only for
   * the layout, the same way `SetRenderer`'s +0xb0 was established.)
   *
   * INITIAL VALUE 1, read from the constructor's own initialiser:
   * `__ZN12HGRenderNodeC2Ev` @Helium 0xdc9c0 does
   *
   *   0xdc9df  movl $0x18, 0x30(%rbx)     ; the neighbouring +0x30 slot
   *   0xdc9e6  movb $0x0,  0x34(%rbx)
   *   0xdc9ea  movq $0x1,  0x38(%rbx)     ; <-- the state slot starts at 1
   *   0xdc9f2  movl $0x0,  0x40(%rbx)
   *
   * so a freshly constructed HGRenderNode reports state 1, not 0. The store is
   * a `movq`, i.e. eight bytes: it sets the u32 at +0x38 to 1 and separately
   * zeroes +0x3c, which is a different slot and not modelled here.
   *
   * The ctor is its own ledger unit and is NOT ported in this file — this field
   * only borrows its initialiser for the default, exactly as `rendererAtB0` and
   * `notifyFuncAtA0` already borrow the `movups %xmm0` zeroing at +0xb0/+0xa0
   * (@0xdca1e / @0xdca17).
   */
  stateAt38: HGRenderNodeState = 1; // @Helium 0xdc9ea  movq $0x1, 0x38(%rbx)

  /**
   * `HGRenderNode::SetState(HGRenderNode::State)` @Helium 0xdcc90
   * (__ZN12HGRenderNode8SetStateENS_5StateE).
   *
   * Full transcription — every instruction, in order:
   *
   *   0xdcc90  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0xdcc91  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0xdcc94  movl  %esi, 0x38(%rdi)     ; this->state = arg  (32-bit store)
   *   0xdcc97  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0xdcc98  retq                       ; void return
   *   0xdcc99  nopl  (%rax)               ; alignment padding, not executed
   *
   * A pure setter: one 32-bit store, no validation, no range check, no
   * notification fired (note it does NOT call the +0xa0 notify function), and
   * ZERO callees of any kind — `depgraph.py deps` lists nothing.
   *
   * ORACLE: verified against the live Helium binary
   * (raw-port/re/oracle/HGRenderNode_SetState_oracle.py). Both this setter and
   * its reader `GetState` @0xdcdf0 are EXPORTED, and the harness runs under
   * `arch -x86_64 /usr/bin/python3` because the port is transcribed from the
   * x86_64 slice. On a 0x200-byte object pre-filled with 0xEE, 209 cases (0..5,
   * INT_MAX, 0x80000000, 0xffffffff and 200 random u32s): the dword at +0x38
   * held the exact argument 209/209, the live getter returned it 209/209, and
   * NO other byte of the object changed 209/209.
   * NEGATIVE CONTROLS (measured, same 209 cases): a 16-bit store -> 209 wrong;
   * a byte store -> 209 wrong; writing +0x3c -> 209 wrong; writing the +0xb0
   * renderer slot -> 209 wrong.
   *
   * @param state — the `HGRenderNode::State` enum value (SysV %esi, u32).
   */
  SetState(this: HGRenderNode, state: HGRenderNodeState): void {
    // @0xdcc94  movl %esi,0x38(%rdi) — 32-bit store; `>>> 0` models the
    //   truncation, so a negative or oversized JS number stores the same bit
    //   pattern the machine would.
    this.stateAt38 = state >>> 0;
  }
}

/**
 * `HGRenderNode::SetNotifyFunc(void (*)(HGRenderNode*))` @Helium 0xdcde0
 * (__ZN12HGRenderNode13SetNotifyFuncEPFvPS_E).
 *
 * TRANSCRIBED (2026-08-10) — this export previously threw "not yet
 * transcribed" because the concrete Helium address had not been resolved from
 * the Ozone call site @0x6352c3. It has now been resolved: the symbol IS
 * defined in Helium and its body is seven lines, the exact twin of
 * `HGRenderNode::SetRenderer` @0xdcca0 with the notify slot (+0xa0) in place of
 * the renderer slot (+0xb0).
 *
 * Full transcription — every instruction, in order:
 *
 *   0xdcde0  pushq %rbp                 ; frame setup (no TS counterpart)
 *   0xdcde1  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
 *   0xdcde4  movq  %rsi, 0xa0(%rdi)     ; this->notifyFuncAtA0 = fn
 *   0xdcdeb  popq  %rbp                 ; frame teardown (no TS counterpart)
 *   0xdcdec  retq                       ; void return
 *   0xdcded  nopl  (%rax)               ; alignment padding, not executed
 *
 * A bare 64-bit store of the function pointer — no null check, no previous
 * value read, no notification fired, zero callees of any kind.
 *
 * Source disassembly:
 *   raw-port/re/disasm/Helium.__ZN12HGRenderNode13SetNotifyFuncEPFvPS_E.s (7 lines)
 */
export function HGRenderNodeSetNotifyFunc(_node: HGRenderNode, _fn: HGRenderNodeNotifyFn): void {
  // @0xdcde4  movq %rsi,0xa0(%rdi) — raw function-pointer store.
  _node.notifyFuncAtA0 = _fn;
}
