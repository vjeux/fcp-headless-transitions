// HGPool_BasePool.ts — FCP Helium framework class `HGPool::BasePool`.
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.__ZN6HGPool8BasePoolC2Ev.s   (the body ported here)
//   raw-port/re/disasm/Helium.__ZN6HGPool8BasePoolC1Ev.s   (byte-identical sibling copy)
//
// Symbols (nm -arch x86_64 | c++filt) for this class:
//   0x0008c7f0 T __ZN6HGPool8BasePoolC2Ev   HGPool::BasePool::BasePool()  (C2 base ctor)   <- PORTED HERE
//   0x0008c820 T __ZN6HGPool8BasePoolC1Ev   HGPool::BasePool::BasePool()  (C1 complete ctor)
//   0x0008d700 t __ZN6HGPool8BasePoolD1Ev   HGPool::BasePool::~BasePool() (D1)
//   0x0008d710 t __ZN6HGPool8BasePoolD0Ev   HGPool::BasePool::~BasePool() (D0)
//   0x0008d720 t __ZNK6HGPool8BasePool16usedObjectsCountEv
//   0x0008d730 t __ZNK6HGPool8BasePool14usedTotalUsageEv
//   0x0008d740 t __ZNK6HGPool8BasePool16freeObjectsCountEv
//   0x0008d750 t __ZNK6HGPool8BasePool14freeTotalUsageEv
//   0x0008d760 t __ZN6HGPool8BasePool7serviceEv
//   0x0008d770 t __ZNK6HGPool8BasePool5traceEv
//   0x0008d780 t __ZNK6HGPool8BasePool3logEv
//   0x0008d790 t __ZNK6HGPool8BasePool10canServiceEv
//   0x0008d7a0 t __ZNK6HGPool8BasePool8canTraceEv
//   0x0008d7b0 t __ZNK6HGPool8BasePool6canLogEv
// Only the C2 base constructor is in scope for this unit; the remaining methods
// above stay `todo` in the ledger until their own units are claimed.
//
// Referenced statics (Helium x86_64 slice):
//   __ZTVN6HGPool8BasePoolE               vtable for HGPool::BasePool   @0xa0a228 (__DATA_CONST)
//   __ZTIN6HGPool8BasePoolE               typeinfo  for HGPool::BasePool @0xa07ed0
//   __ZTSN6HGPool8BasePoolE               typeinfo name                  @0x3cbc20
//   __ZZN6HGPool8BasePoolC1EvE11poolCounter  function-local static counter @0xadcf38 (__BSS)
//
// ── CLASS SHAPE ──────────────────────────────────────────────────────────
// HGPool::BasePool is the non-template polymorphic base of every Helium
// resource pool (HGMetalTexturePool, HGMetalBufferPool, HGMetalHeapPool,
// HGCVPixelBufferPool, ... — all of which are registered with the process
// wide registry through HGPool::registerPool(HGPool::BasePool*) @0x8c850).
// The base holds only bookkeeping; the actual storage lives in the derived
// template instantiation.
//
// Instance layout recovered from the C2 body @0x8c7f0:
//   +0x00  vptr    : void**    installed to &__ZTVN6HGPool8BasePoolE + 0x10
//   +0x08  u16     : zeroed by the 32-bit store at 0x8c802 (see note below)
//   +0x0a  poolId  : u16       serial number handed out by `poolCounter`
//
// Note on the +0x08 store: `movl $0x0, 0x8(%rdi)` @0x8c802 writes FOUR bytes,
// i.e. it clears 0x08..0x0b.  The very next store `movw %ax, 0xa(%rdi)`
// @0x8c818 then overwrites 0x0a..0x0b with the pool serial.  So the durable
// effect of the 32-bit clear is limited to the u16 at +0x08, and the u16 at
// +0x0a always ends up holding the serial.  Both stores are transcribed
// below in source order so the observable end state matches instruction for
// instruction.
//
// ── THE SERIAL COUNTER ───────────────────────────────────────────────────
// `poolCounter` is a function-local static of the C1 constructor (the mangled
// name __ZZN6HGPool8BasePoolC1EvE11poolCounter says so), living in __BSS
// @0xadcf38 and therefore zero at image load.  Because it is a plain
// zero-initialized POD there is no guard variable and no __cxa_guard_acquire
// in either constructor — the `lock xaddw` is the whole of the increment.
//
//   0x8c809  movw  $0x1, %ax
//   0x8c80d  lock xaddw %ax, poolCounter(%rip)
//
// `lock xaddw` atomically swaps in `old + 1` and returns `old` in %ax — a
// 16-BIT read-modify-write, so the counter wraps modulo 0x10000.  The store
// at +0x0a is likewise 16-bit, so the id written into the object is exactly
// the counter's new value.  The first pool constructed in a process gets
// id 1 (old = 0, stored = 1).
//
// The `incl %eax` @0x8c816 that sits between the xadd and the store is a
// FULL 32-bit increment, but only %ax is ever stored (`movw %ax, 0xa(%rdi)`),
// so any carry out of bit 15 is discarded and the visible result is
// `(old + 1) & 0xffff`.  That masking is reproduced explicitly below rather
// than left implicit in JS number arithmetic.

/**
 * Runtime shape of an `HGPool::BasePool` subobject.
 *
 * Field names/offsets are the ones recovered from the C2 body @0x8c7f0
 * (see the CLASS SHAPE block above).  `vptr` carries the resolved address
 * of the installed vtable slot as a tag string: nothing in the decoded call
 * graph dispatches through it yet (the nine virtual methods listed at the
 * top of this file are still un-transcribed units), so modelling it as an
 * observable value keeps the install verifiable without inventing a
 * function-pointer table.
 */
export interface HGPool_BasePoolInstance {
  /**
   * +0x00 — installed by `movq %rax, (%rdi)` @0x8c7ff with
   * `&__ZTVN6HGPool8BasePoolE + 0x10` = 0xa0a228 + 0x10 = 0xa0a238
   * (the first virtual-function slot, past the Itanium-ABI
   * offset-to-top and typeinfo slots).
   */
  vptr: "HGPool::BasePool::__vtable+0x10 @Helium 0xa0a238";
  /** +0x08 — u16 cleared by the 32-bit store @0x8c802. */
  field8: number;
  /** +0x0a — u16 pool serial written @0x8c818 from the shared counter. */
  poolId: number;
}

/**
 * `__ZZN6HGPool8BasePoolC1EvE11poolCounter` — Helium @0xadcf38 (__BSS, u16).
 *
 * The process-wide 16-bit pool serial counter incremented by the
 * `lock xaddw` @0x8c80d.  __BSS, so its load-time value is 0.
 *
 * Module-private, exactly as the C++ function-local static is private to
 * the constructor: nothing outside this translation unit reads or writes
 * it, so no accessor is exported (there is no such FCP entry point).
 */
let poolCounter = 0;

/**
 * HGPool::BasePool::BasePool()  —  Helium @0x8c7f0 (C2 base constructor).
 *
 * Faithful mirror of raw-port/re/disasm/Helium.__ZN6HGPool8BasePoolC2Ev.s:
 *
 *   0x8c7f0  pushq %rbp
 *   0x8c7f1  movq  %rsp, %rbp
 *   0x8c7f4  leaq  __ZTVN6HGPool8BasePoolE(%rip), %rax  ; %rax = 0xa0a228
 *   0x8c7fb  addq  $0x10, %rax                          ; %rax = 0xa0a238
 *   0x8c7ff  movq  %rax, (%rdi)                         ; this->vptr = &VT+0x10
 *   0x8c802  movl  $0x0, 0x8(%rdi)                      ; *(u32*)(this+0x8) = 0
 *   0x8c809  movw  $0x1, %ax                            ; %ax = 1 (the xadd addend)
 *   0x8c80d  lock xaddw %ax, poolCounter(%rip)          ; %ax = old ; counter = old+1 (u16)
 *   0x8c816  incl  %eax                                 ; %eax = old + 1
 *   0x8c818  movw  %ax, 0xa(%rdi)                       ; *(u16*)(this+0xa) = (old+1) & 0xffff
 *   0x8c81c  popq  %rbp
 *   0x8c81d  retq
 *
 * There is no base-class delegation and no allocation: the whole
 * constructor is a vptr install, a field clear, and one atomic serial
 * hand-out.  The byte-identical C1 complete-object constructor @0x8c820 is
 * a separate ledger unit and is not exported from here.
 *
 * @param self the `HGPool::BasePool` subobject being constructed (%rdi).
 */
export function HGPool_BasePool_ctor(
  self: Partial<HGPool_BasePoolInstance>
): asserts self is HGPool_BasePoolInstance {
  // 0x8c7f4  leaq __ZTVN6HGPool8BasePoolE(%rip), %rax   -> 0xa0a228
  // 0x8c7fb  addq $0x10, %rax                           -> 0xa0a238
  // 0x8c7ff  movq %rax, (%rdi)
  self.vptr = "HGPool::BasePool::__vtable+0x10 @Helium 0xa0a238";

  // 0x8c802  movl $0x0, 0x8(%rdi)   — clears 0x08..0x0b; 0x0a..0x0b is
  //                                   overwritten again at 0x8c818 below.
  self.field8 = 0;
  self.poolId = 0;

  // 0x8c809  movw $0x1, %ax
  // 0x8c80d  lock xaddw %ax, poolCounter(%rip)
  //          -> %ax receives the PRE-increment value, memory receives
  //             (old + 1) truncated to 16 bits.
  const old = poolCounter;
  poolCounter = (old + 1) & 0xffff;

  // 0x8c816  incl %eax                  ; 32-bit increment of the returned old value
  // 0x8c818  movw %ax, 0xa(%rdi)        ; only the low 16 bits reach the object
  self.poolId = (old + 1) & 0xffff;
}
