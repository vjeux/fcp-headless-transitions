// FFMachPortCallback.ts — Flexo `FFMachPortCallback`, a tiny polymorphic
// helper that owns one Mach port name and can poke it with an empty message.
// This file ports ONE method of that class:
//
//   @0x12bc420  FFMachPortCallback::FFMachPortCallback()   (Itanium C2, base-object ctor)
//                 __ZN18FFMachPortCallbackC2Ev
//
// FRAMEWORK: Flexo.framework (Final Cut Pro), x86_64 slice.
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.__ZN18FFMachPortCallbackC2Ev.s
//            (re-derive with `raw-port/tools/disasm.sh --sym
//             __ZN18FFMachPortCallbackC2Ev Flexo`)
//
// Every OTHER member is a SEPARATE ledger unit and is NOT ported here:
//   @0x12bc440  SendEmptyMessageToPort(bool)
//   @0x12bc4a0  PortCallback()                    (an empty virtual — pushq/movq/popq/retq)
//   @0xd0b450   PortCallbackMsg(void const*, unsigned long)
//   @0x1491c40  ~FFMachPortCallback()             (D1)
//   @0x1491c50  ~FFMachPortCallback()             (D0, deleting)
//
// ── DISASSEMBLY (verbatim, the WHOLE function) ──────────────────────────────
//   00000000012bc420  pushq  %rbp                  ; frame setup
//   00000000012bc421  movq   %rsp, %rbp            ; frame setup
//   00000000012bc424  leaq   0x669465(%rip), %rax  ; RIP-after = 0x12bc42b
//                                                  ; 0x12bc42b + 0x669465 = 0x1925890
//   00000000012bc42b  movq   %rax, (%rdi)          ; this->vptr = 0x1925890
//   00000000012bc42e  movl   $0x0, 0x8(%rdi)       ; this->port = 0 (32-bit store)
//   00000000012bc435  popq   %rbp                  ; frame teardown
//   00000000012bc436  retq                         ; returns void (C2 returns nothing)
//   00000000012bc437  nopw   (%rax,%rax)           ; alignment padding, not code
//
// Two stores, no callq: no base-class ctor is invoked (FFMachPortCallback has
// no base subobject to initialize), nothing is allocated, and there is no
// in-scope callee, extern, indirect or virtual dispatch — `depgraph.py deps`
// lists nothing.
//
// ── VTABLE ──────────────────────────────────────────────────────────────────
// `nm -arch x86_64` puts __ZTV18FFMachPortCallback at 0x1925880 and
// __ZTI18FFMachPortCallback (the typeinfo) at 0x19258b8. The installed pointer
// 0x1925890 is therefore exactly `__ZTV18FFMachPortCallback + 0x10` — the
// standard Itanium ABI vptr, which points PAST the vtable's offset-to-top
// (+0x00) and typeinfo (+0x08) slots at the first virtual function.
//
// ── ICF NOTE (why the ctor and a destructor share an address) ───────────────
// `nm` also lists __ZN18FFMachPortCallbackD2Ev at the SAME address 0x12bc420.
// The linker folded them: the base-object destructor's body is byte-identical
// to the ctor's (re-install this class's vptr, zero the port). This is
// FAITHFUL — the shipped binary really has one function serving both symbols —
// and it is the same ld64 behaviour HGTile.ts documents for
// HGTile::Width()/HGRect::w(). This file transcribes the symbol it claimed,
// the CONSTRUCTOR; D2 remains its own ledger unit even though decoding it will
// land on these very bytes.
//
// ── FIELD +0x08 IS A mach_port_t, PROVEN BY THE SIBLING ─────────────────────
// `SendEmptyMessageToPort(bool)` @0x12bc440 builds a 0x1c-byte Mach message
// header on the stack and calls `_mach_msg` @0x149784e:
//   @0x12bc44b  movabsq $0x1c00000013,%rax ; @0x12bc455 store to -0x24(%rbp)
//                 -> msgh_bits = 0x13, msgh_size = 0x1c  (the header's first
//                    two 32-bit fields, written as one 64-bit immediate)
//   @0x12bc459  movl 0x8(%rdi),%eax ; @0x12bc45c movl %eax,-0x1c(%rbp)
//                 -> msgh_remote_port = this->+0x08
// The third header word of `mach_msg_header_t` IS `msgh_remote_port`, a
// `mach_port_t` (an unsigned 32-bit port NAME, not a pointer), which is why
// the ctor's zero store is a 32-bit `movl` and why zero means MACH_PORT_NULL.

/**
 * `FFMachPortCallback` instance state.
 *
 * Layout as this ctor writes it (the class is a 0x10-byte polymorphic object):
 *   +0x00  vptr        — installed @0x12bc42b
 *   +0x08  mach_port_t — zeroed @0x12bc42e (32-bit store)
 *   +0x0c  4 bytes of tail padding; the ctor does not touch them.
 *
 * @Flexo 0x12bc420
 */
export interface FFMachPortCallbackState {
  /**
   * +0x00 — the vtable pointer. Held as the numeric address the ctor stores so
   * the install is observable in the port (the virtuals themselves —
   * PortCallback @0x12bc4a0, PortCallbackMsg @0xd0b450, the dtors — are
   * separate ledger units).
   */
  vptr: number;

  /**
   * +0x08 — `mach_port_t port`, an unsigned 32-bit Mach port NAME. Zeroed by
   * this ctor (MACH_PORT_NULL) and later read by SendEmptyMessageToPort
   * @0x12bc459 as the message header's `msgh_remote_port`.
   */
  port: number;
}

/**
 * The vtable pointer this ctor installs: `__ZTV18FFMachPortCallback + 0x10`.
 *
 * Derived from the RIP-relative load @0x12bc424 (`leaq 0x669465(%rip),%rax`):
 * the displacement is added to the address of the NEXT instruction, so
 * 0x12bc42b + 0x669465 = 0x1925890. Cross-checked against `nm`, which places
 * __ZTV18FFMachPortCallback at 0x1925880 (+0x10 = 0x1925890) and its typeinfo
 * __ZTI18FFMachPortCallback at 0x19258b8.
 *
 * @Flexo 0x12bc424
 */
export const FFMachPortCallback_VTABLE_INSTALLED_PTR = 0x1925890 as const;

/**
 * `FFMachPortCallback::FFMachPortCallback()` — @Flexo 0x12bc420
 *   __ZN18FFMachPortCallbackC2Ev  (Itanium C2: the base-object constructor)
 *
 * Full transcription — every instruction, in order:
 *
 *   0x12bc420  pushq %rbp                 ; frame setup (no TS counterpart)
 *   0x12bc421  movq  %rsp,%rbp            ; frame setup (no TS counterpart)
 *   0x12bc424  leaq  0x669465(%rip),%rax  ; rax = 0x12bc42b + 0x669465
 *                                         ;     = 0x1925890 = vtable + 0x10
 *   0x12bc42b  movq  %rax,(%rdi)          ; this->vptr = that pointer
 *   0x12bc42e  movl  $0x0,0x8(%rdi)       ; this->port = 0  (32-bit store,
 *                                         ;   i.e. MACH_PORT_NULL)
 *   0x12bc435  popq  %rbp                 ; frame teardown (no TS counterpart)
 *   0x12bc436  retq                       ; void
 *   0x12bc437  nopw  (%rax,%rax)          ; alignment padding, not executed
 *
 * Decode notes:
 *   * no `callq` — there is no base-class constructor call and no member
 *     ctor, so FFMachPortCallback derives from nothing and holds no non-POD
 *     member. The object is fully initialized by these two stores.
 *   * the port store is `movl` (32 bits), not `movq`: +0x0c is NOT written and
 *     stays whatever the allocation left there. The port models the two
 *     WRITTEN fields only, which is the observable state.
 *   * the C1 (complete-object) constructor is not a separate symbol in this
 *     binary — only C2 is emitted — so this IS the class's constructor.
 *
 * @param self the object in %rdi, initialized in place.
 */
export function FFMachPortCallback_ctor(self: FFMachPortCallbackState): void {
  // @0x12bc424..@0x12bc42b  install the vptr.
  self.vptr = FFMachPortCallback_VTABLE_INSTALLED_PTR;
  // @0x12bc42e  zero the 32-bit mach_port_t at +0x08 (MACH_PORT_NULL).
  self.port = 0;
  // @0x12bc436  retq
}
