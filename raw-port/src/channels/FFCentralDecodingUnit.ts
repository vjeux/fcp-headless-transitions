// FFCentralDecodingUnit.ts — Flexo's central-job-processor subclass that
// dispatches VT (VideoToolbox) decode tokens onto a serial GCD queue with a
// per-CPU concurrency semaphore.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// FIVE EXPORTED SYMBOLS (nm -arch x86_64):
//   @Flexo 0x0000000000dff270  FFCentralDecodingUnit::FFCentralDecodingUnit()  (C1, complete)
//   @Flexo 0x0000000000dfffb0  FFCentralDecodingUnit::FFCentralDecodingUnit()  (C2, base-object)
//   @Flexo 0x0000000000e00040  FFCentralDecodingUnit::doTheJob(FFScheduleTokenVTDecode*)
//   @Flexo 0x0000000000e00190  FFCentralDecodingUnit::~FFCentralDecodingUnit()  (D1, in-place)
//   @Flexo 0x0000000000e001a0  FFCentralDecodingUnit::~FFCentralDecodingUnit()  (D0, deleting)
// (Plus the compiler-emitted block trampoline
//   @Flexo 0x0000000000e000d0  ____ZN21FFCentralDecodingUnit8doTheJob...
//                              _block_invoke.)
//
// Source disassembly (this worktree, raw-port/re/disasm/):
//   Flexo.FFCentralDecodingUnit.FFCentralDecodingUnit.s      (C1 body @0xdff270)
//   Flexo.FFCentralDecodingUnit.doTheJob.s
//   Flexo.FFCentralDecodingUnit.~FFCentralDecodingUnit.s     (D0 body @0xe001a0)
// (C2 @0xdfffb0 and D1 @0xe00190 were extracted directly from
//  /tmp/Flexo_tV.txt on this worktree. See file header for the raw bytes.)
//
// C1 vs C2 relationship: byte-for-byte identical modulo the vtable literal-
// pool RIP offset (0xb16f35 in C1 vs 0xb161f5 in C2 — same absolute vtable,
// different displacement because C1 is at a lower address). Both funnel
// through the same field-init sequence, so we model them as a single JS
// constructor.
//
// D1 vs D0 relationship: D1 is a bare `jmp __ZN21FFCentralJobProcessorD2Ev`
// (tail-call the base D2). D0 is D1 followed by `jmp __ZdlPv` (operator
// delete). The class itself owns NO fields that need per-field teardown —
// the dispatch_queue_t @+0x50 and dispatch_semaphore_t @+0x68 are freed by
// the base class's D2, and the flag/int fields need no release.
//
// -- STRUCT LAYOUT (recovered from the ctor body) --------------------------
// The class INHERITS SINGLY from FFCentralJobProcessor. Both C1 and C2 emit
// exactly the same field-init sequence, so all offsets are shared with the
// base:
//
//   offset  size  field                              @Flexo cite (C2 @0xdfffb0)
//   ------  ----  ---------------------------------  --------------------------
//   +0x00   0x08  vptr : void*                       0xdfffcc leaq -> 0xdfffd3
//                                                    movq
//                                                    (installed twice: once
//                                                    by base? No — the same
//                                                    vptr is written a second
//                                                    time at 0xe0002b/0xe00032
//                                                    after all field inits.
//                                                    The first write at
//                                                    0xdfffcc could be a
//                                                    "safe vtable during
//                                                    field construction"
//                                                    trick, but on inspection
//                                                    both leaq target the
//                                                    SAME address — the
//                                                    compiler simply emitted
//                                                    the write twice, once as
//                                                    part of the "install
//                                                    vptr" prologue and once
//                                                    as a redundant reinstall
//                                                    at the epilogue.)
//   +0x08..+0x47 (56 bytes) zeroed via four `movups %xmm0` at
//                                                    0xdfffd9/dd/e1/e5 (0x8,
//                                                    0x18, 0x28, 0x38 each
//                                                    16 bytes). Base
//                                                    FFCentralJobProcessor
//                                                    fields, opaque here.
//   +0x48   0x08  <baseSlot> : u64                   0xdfffe9 movq $0,0x48
//                                                    (also base-class field,
//                                                    initialised to 0).
//   +0x50   0x08  workQueue : dispatch_queue_t       0xe00007 dispatch_queue_
//                                                    create; stored @0xe0000c.
//                                                    Label:
//                                                    "com.apple.flexo.cdufig"
//                                                    (from
//                                                    @Flexo 0xdffffd literal
//                                                    pool).
//   +0x58   0x01  someFlag : u8                       0xe00010 movb $0,0x58
//   +0x5c   0x04  concurrency : i32                   0xe00014 movl r14d,0x5c
//                                                    (r14 = max(cpu, 20);
//                                                    see NOTE below).
//   +0x60   0x04  <baseSlot> : i32                    0xe00018 movl $0,0x60
//                                                    (pending-count? Init 0.)
//   +0x68   0x08  concurrencySem : dispatch_semaphore_t
//                                                    0xe00022 dispatch_
//                                                    semaphore_create(r14);
//                                                    stored @0xe00027.
//   sizeof                = at least 0x70 = 112 bytes (last write is @0x68,
//                                                     8 bytes). This is
//                                                     entirely inherited
//                                                     from FFCentralJobProcessor
//                                                     — no derived-specific
//                                                     ivars.
//
// -- CONCURRENCY-COUNT COMPUTATION (@Flexo 0xdfffba..0xdfffc8) --------------
// The dispatch-semaphore is initialised with `max(physicalCPUCount, 20)`.
// The exact asm:
//
//   0xdfffba callq  __ZN6PCInfo14getPhysicalCPUEv     ; eax = PCInfo::getPhysicalCPU()
//   0xdfffbf cmpl   $0x15, %eax                      ; compare eax vs 21
//   0xdfffc2 movl   $0x14, %r14d                     ; r14 = 20 (default)
//   0xdfffc8 cmovgel %eax, %r14d                     ; if eax >= 0x15 => r14 = eax
//
// So `concurrency = (physicalCPU >= 21) ? physicalCPU : 20`.
// Equivalently `concurrency = max(physicalCPU, 20)` for any physicalCPU
// (because if physicalCPU is 20 the condition is false → r14 stays 20;
// if physicalCPU is 22 the condition is true → r14=22). This floor-of-20
// ensures at least 20 concurrent VT decode jobs even on small machines.
//
// -- BLOCK CAPTURE @Flexo 0xe0006e (doTheJob) ------------------------------
// The `doTheJob` body constructs a stack block:
//
//   -0x30(%rbp)  isa      = __NSConcreteStackBlock                    (@0xe00063)
//   -0x28(%rbp)  flags    = 0xC2000000                                (@0xe0006e)
//                          = BLOCK_HAS_COPY_DISPOSE (0x02000000)
//                          | BLOCK_HAS_STRET       (0x00000000)
//                          | BLOCK_IS_GLOBAL       (0x00000000)
//                          | BLOCK_HAS_SIGNATURE   (0x40000000)
//                          | BLOCK_USE_STRET/etc.
//                          (0xC2000000 is the standard "captures one strong
//                           ObjC ref, has signature, has copy/dispose"
//                           combination.)
//   -0x20(%rbp)  invoke   = &____ZN21FFCentralDecodingUnit8doTheJob...
//                            _block_invoke                            (@0xe00077)
//   -0x18(%rbp)  descPtr  = &___block_descriptor_40_e8_32o_e5_v8?0l   (@0xe00082)
//                          — descriptor for a 40-byte block, capturing one
//                           object at offset 32, dispose type 5 (release),
//                           signature "v8@?0l" (returns void, takes block +
//                           long).
//   -0x10(%rbp)  capture[0] = %rbx (the token, FFScheduleTokenVTDecode*)  (@0xe0008d)
//                Captured at offset +0x20 of the block struct (matches
//                the block_invoke's `movq 0x20(%rdi), %rdi` at 0xe000d4).
//
// The block is then wrapped by `dispatch_block_create_with_qos_class(
//   flags=0x20, qos=fromToken, relPri=0, block=&stackBlock)` and executed
// synchronously via `dispatch_block_perform(0x20, wrappedBlock)`, then
// released via `_Block_release`.
//
// Block-invoke body (@Flexo 0xe000d0..0xe000e6):
//   0xe000d4 movq 0x20(%rdi),%rdi   ; rdi = captured token
//   0xe000d8 movq @sel_ref,%rsi     ; rsi = @selector(<undecoded>)
//   0xe000e0 jmpq *&_objc_msgSend   ; tail-call objc_msgSend(token, sel)
//
// The captured token's decode selector name isn't recoverable without the
// selref table (the disasm tool misdemangles it as
// "_notifyRecordingHasStopped" for every send in this compile unit).
// Structurally it's a 1-arg send that returns void. The most plausible name
// from FCP's known API surface is `-[FFScheduleTokenVTDecode decodeSample]`
// or `-[FFScheduleTokenVTDecode run]`, but the port doesn't guess — it
// routes through the objc_msgSend throwing stub with a placeholder selector
// name.
//
// -- FRONTIER CALLEES -----------------------------------------------------
//   @Flexo 0xdfffba (C2) / 0xdff27a (C1)
//                      __ZN6PCInfo14getPhysicalCPUEv
//                      PCInfo::getPhysicalCPU() -> int  (not yet ported)
//   @Flexo 0xdfffe9    _dispatch_queue_attr_make_with_autorelease_frequency(
//                        attr=NULL, freq=DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM=1)
//                      (libdispatch — unavailable in JS; throw)
//   @Flexo 0xe00007    _dispatch_queue_create("com.apple.flexo.cdufig", attr)
//                      (libdispatch — throw)
//   @Flexo 0xe00022    _dispatch_semaphore_create(count)
//                      (libdispatch — throw)
//   @Flexo 0xe0005e    _FFSVPriorityGetQOSClass(priority) -> qos_class_t
//                      (Flexo helper — not yet ported)
//   @Flexo 0xe0009e    _dispatch_block_create_with_qos_class(
//                        flags=0x20, qos, relPri=0, block)
//                      (libdispatch — throw)
//   @Flexo 0xe000ae    _dispatch_block_perform(flags=0x20, block)
//                      (libdispatch — throw)
//   @Flexo 0xe000b6    __Block_release(block)  (libSystem — throw)
//   @Flexo 0xe0001a9   __ZN21FFCentralJobProcessorD2Ev
//                      FFCentralJobProcessor::~FFCentralJobProcessor()
//                      (base class D2 — not yet ported)
//   @Flexo 0xe001b7    __ZdlPv (operator delete)
//   @Flexo 0xe000e0    _objc_msgSend on the captured token (in block_invoke)
//   @Flexo 0xdff28c/93 vtable install — writes
//                        __ZTV21FFCentralDecodingUnit + 0x10 into +0x00.
//                        Not modelled in TS (no vtable machinery).
//
// Reused ports:
//   None — FFCentralJobProcessor, PCInfo, FFSVPriority, and libdispatch/
//          block ABI are all separate task-queue entries.

// -- OPAQUE FORWARD-DECLARATIONS -------------------------------------------

/** Opaque handle to Objective-C `id` — reference-counted heap pointer. */
export interface NSObject {
  readonly __brand_NSObject: "NSObject";
}

/** Opaque handle to the FCP-internal FFScheduleTokenVTDecode object handed
 *  to `doTheJob`. Ported separately when its ObjC symbols are decoded. */
export interface FFScheduleTokenVTDecode extends NSObject {
  readonly __brand_FFScheduleTokenVTDecode: "FFScheduleTokenVTDecode";
}

/** Opaque handle to libdispatch's `dispatch_queue_t`. */
export interface DispatchQueue {
  readonly __brand_DispatchQueue: "DispatchQueue";
}

/** Opaque handle to libdispatch's `dispatch_semaphore_t`. */
export interface DispatchSemaphore {
  readonly __brand_DispatchSemaphore: "DispatchSemaphore";
}

/** Opaque handle to libdispatch's `dispatch_queue_attr_t`. */
export interface DispatchQueueAttr {
  readonly __brand_DispatchQueueAttr: "DispatchQueueAttr";
}

/** Opaque handle to libdispatch's `dispatch_block_t` (a wrapped block). */
export interface DispatchBlock {
  readonly __brand_DispatchBlock: "DispatchBlock";
}

// -- FRONTIER STUBS --------------------------------------------------------

/** @Flexo 0xdff27a (C1) / 0xdfffba (C2) __ZN6PCInfo14getPhysicalCPUEv.
 *  PCInfo::getPhysicalCPU() → int. Returns the physical CPU count as
 *  reported by hostinfo (not the logical core count). Not yet ported. */
function PCInfo_getPhysicalCPU_stub(): number {
  throw new Error(
    "PCInfo::getPhysicalCPU() @Flexo 0xdfffba is not yet ported — port the " +
      "PCInfo class in its own task entry to lift this frontier.",
  );
}

/** @Flexo 0xdfffe9 _dispatch_queue_attr_make_with_autorelease_frequency(
 *    attr, freq) — libdispatch helper. Not portable to pure JS. */
function dispatch_queue_attr_make_with_autorelease_frequency_stub(
  _attr: DispatchQueueAttr | null,
  _freq: number,
): DispatchQueueAttr {
  throw new Error(
    "_dispatch_queue_attr_make_with_autorelease_frequency is a libdispatch " +
      "primitive with no pure-JS equivalent (@Flexo 0xdfffe9).",
  );
}

/** @Flexo 0xe00007 _dispatch_queue_create(label, attr). */
function dispatch_queue_create_stub(
  _label: string,
  _attr: DispatchQueueAttr,
): DispatchQueue {
  throw new Error(
    "_dispatch_queue_create is a libdispatch primitive with no pure-JS " +
      "equivalent (@Flexo 0xe00007).",
  );
}

/** @Flexo 0xe00022 _dispatch_semaphore_create(count). */
function dispatch_semaphore_create_stub(_count: number): DispatchSemaphore {
  throw new Error(
    "_dispatch_semaphore_create is a libdispatch primitive with no pure-JS " +
      "equivalent (@Flexo 0xe00022).",
  );
}

/** @Flexo 0xe0005e _FFSVPriorityGetQOSClass(FFSVPriorityEnum).
 *  Maps FCP's priority enum onto dispatch's qos_class_t. Not yet ported. */
function FFSVPriorityGetQOSClass_stub(_priority: number): number {
  throw new Error(
    "_FFSVPriorityGetQOSClass @Flexo 0xe0005e is not yet ported.",
  );
}

/** @Flexo 0xe0009e _dispatch_block_create_with_qos_class(flags, qos, relPri, block). */
function dispatch_block_create_with_qos_class_stub(
  _flags: number,
  _qos: number,
  _relPri: number,
  _block: unknown,
): DispatchBlock {
  throw new Error(
    "_dispatch_block_create_with_qos_class is a libdispatch primitive with " +
      "no pure-JS equivalent (@Flexo 0xe0009e).",
  );
}

/** @Flexo 0xe000ae _dispatch_block_perform(flags, block) — runs synchronously
 *  in the current queue, honouring the block's QoS. */
function dispatch_block_perform_stub(
  _flags: number,
  _block: DispatchBlock,
): void {
  throw new Error(
    "_dispatch_block_perform is a libdispatch primitive with no pure-JS " +
      "equivalent (@Flexo 0xe000ae).",
  );
}

/** @Flexo 0xe000b6 __Block_release(block). Releases the wrapping
 *  dispatch_block created above. */
function Block_release_stub(_block: DispatchBlock): void {
  throw new Error(
    "__Block_release is a Block ABI primitive with no pure-JS equivalent " +
      "(@Flexo 0xe000b6).",
  );
}

/** @Flexo 0xe000e0 (inside block_invoke) _objc_msgSend(token, sel) — invokes
 *  the token's decode selector. Selector name un-decoded (see file header). */
function objc_msgSend_token_decode_stub(_token: FFScheduleTokenVTDecode): void {
  throw new Error(
    "objc_msgSend on FFScheduleTokenVTDecode token @Flexo 0xe000e0 " +
      "(block_invoke tail-call) is not yet ported — selector identity un-decoded.",
  );
}

/** @Flexo 0xe001a9 __ZN21FFCentralJobProcessorD2Ev —
 *  FFCentralJobProcessor::~FFCentralJobProcessor(). Base-class D2 that owns
 *  the dispatch_queue @+0x50 and dispatch_semaphore @+0x68. Not yet ported. */
function FFCentralJobProcessor_D2_stub(_self: FFCentralDecodingUnit): void {
  throw new Error(
    "FFCentralJobProcessor::~FFCentralJobProcessor() @Flexo 0xe001a9 is not " +
      "yet ported — port the FFCentralJobProcessor base class in its own task.",
  );
}

/** @Flexo 0xe001b7 __ZdlPv — operator delete(void*). */
function operator_delete_stub(_p: FFCentralDecodingUnit): void {
  // No TS-side equivalent; GC reclaims when references drop.
}

// -- FFCentralDecodingUnit -------------------------------------------------

/**
 * FFCentralDecodingUnit — Flexo's VideoToolbox decode dispatch unit. A thin
 * `FFCentralJobProcessor` subclass that:
 *   - owns a serial dispatch_queue "com.apple.flexo.cdufig" (@+0x50),
 *   - guards concurrency with a dispatch_semaphore of `max(physicalCPU, 20)`
 *     tokens (@+0x68),
 *   - implements `doTheJob(FFScheduleTokenVTDecode*)` by wrapping a stack
 *     block that calls `[token <decodeSelector>]` in a QoS-boosted
 *     dispatch_block and running it synchronously via
 *     `dispatch_block_perform`.
 *
 * Layout (all offsets inherited from FFCentralJobProcessor — see file header):
 *   +0x00 vptr; +0x08..+0x48 base fields (opaque); +0x50 workQueue;
 *   +0x58 someFlag:u8; +0x5c concurrency:i32; +0x60 baseSlot:i32;
 *   +0x68 concurrencySem
 */
export class FFCentralDecodingUnit {
  declare readonly __brand_FFCentralDecodingUnit: "FFCentralDecodingUnit";

  // Fields are inherited from FFCentralJobProcessor. We surface the ones the
  // exported methods here read/write; the opaque baseSlots stay
  // uninitialised (matching the `movups %xmm0; movq $0` zero-fill).

  /** +0x50 — serial dispatch queue "com.apple.flexo.cdufig". */
  private _workQueue: DispatchQueue | null = null;
  /** +0x58 — u8 flag (init 0). Semantics undecoded — probably "isRunning". */
  private _flag: number = 0;
  /** +0x5c — concurrency = max(physicalCPU, 20). */
  private _concurrency: number = 0;
  /** +0x60 — i32 (init 0). Probably "in-flight count". */
  private _inFlight: number = 0;
  /** +0x68 — dispatch_semaphore with initial value = _concurrency. */
  private _concurrencySem: DispatchSemaphore | null = null;

  /**
   * C1/C2 constructor — FFCentralDecodingUnit::FFCentralDecodingUnit()
   *   C1 @Flexo 0x0000000000dff270 .. 0x0000000000dff2f9
   *   C2 @Flexo 0x0000000000dfffb0 .. 0x0000000000e00039
   *
   * The two bodies are byte-identical modulo the vtable RIP offset; we model
   * them as a single JS constructor.
   *
   * Faithful decode (C2 addresses cited; C1 offsets are 0xdff270..0xdff2f9):
   *
   *   0xdfffb0..0xdfffb9  prologue, %rbx = this
   *   0xdfffba            callq PCInfo::getPhysicalCPU(); eax = count
   *   0xdfffbf..0xdfffc8  r14 = max(eax, 0x14); i.e. concurrency floor 20
   *   0xdfffcc..0xdfffd3  install vptr at +0x00
   *                       (leaq &__ZTV21FFCentralDecodingUnit+0x10; movq
   *                        to *this — first of two identical writes)
   *   0xdfffd6..0xdfffe9  zero out +0x08..+0x50 (four 16-byte movups plus a
   *                       trailing 8-byte movq at +0x48)
   *   0xdffff1..0xdfffff8 _dispatch_queue_attr_make_with_autorelease_frequency(
   *                         attr=NULL, freq=1 (WORK_ITEM))
   *   0xdffffd..0xe00007  _dispatch_queue_create("com.apple.flexo.cdufig",
   *                                              attr)
   *   0xe0000c            self[+0x50] = queue
   *   0xe00010            self[+0x58] = 0                       (u8 flag)
   *   0xe00014            self[+0x5c] = r14                     (concurrency)
   *   0xe00018            self[+0x60] = 0                       (i32)
   *   0xe0001f..0xe00022  _dispatch_semaphore_create(r14)
   *   0xe00027            self[+0x68] = sem
   *   0xe0002b..0xe00032  install vptr at +0x00 (redundant reinstall — same
   *                       address as at 0xdfffcc; the compiler emitted both
   *                       writes to cover the "vtable during construction"
   *                       ABI corner)
   *   0xe00035..0xe00039  epilogue, retq
   */
  constructor() {
    // @Flexo 0xdfffba — PCInfo::getPhysicalCPU().
    const physicalCPU = PCInfo_getPhysicalCPU_stub();

    // @Flexo 0xdfffbf..0xdfffc8 — concurrency = max(physicalCPU, 20).
    const concurrency = physicalCPU >= 0x15 ? physicalCPU : 0x14;

    // @Flexo 0xdfffcc..0xdfffe9 — install vptr, zero base fields.
    // (Modelled by the field default-initialisers above; no runtime action.)

    // @Flexo 0xdffff1..0xdfffff8 — build the queue attr with autorelease-
    // frequency WORK_ITEM (value 1 per libdispatch/queue.h).
    const attr = dispatch_queue_attr_make_with_autorelease_frequency_stub(
      /* attr */ null,
      /* DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM */ 1,
    );

    // @Flexo 0xdffffd..0xe00007 — create the serial dispatch queue.
    this._workQueue = dispatch_queue_create_stub(
      "com.apple.flexo.cdufig",
      attr,
    );

    // @Flexo 0xe00010..0xe00018 — field defaults.
    this._flag = 0;
    this._concurrency = concurrency;
    this._inFlight = 0;

    // @Flexo 0xe0001f..0xe00027 — concurrencySem = dispatch_semaphore_create(concurrency).
    this._concurrencySem = dispatch_semaphore_create_stub(concurrency);

    // @Flexo 0xe0002b..0xe00032 — redundant vptr reinstall (no TS effect).
  }

  /**
   * doTheJob — FFCentralDecodingUnit::doTheJob(FFScheduleTokenVTDecode*)
   *   @Flexo 0x0000000000e00040 .. 0x0000000000e000c1
   *
   * Faithful decode:
   *
   *   0xe00040..0xe00049  prologue, %rbx = token
   *   0xe0004c..0xe00056  rsi = @selector(<undecoded 1-arg getter>);
   *                       rax = objc_msgSend(token, sel) — reads back a
   *                       priority-enum-typed value from the token.
   *   0xe0005c..0xe0005e  edi = eax (priority)
   *   0xe0005e            callq _FFSVPriorityGetQOSClass(priority)
   *                       eax = qos_class_t
   *   0xe00063..0xe0008d  build 0x28-byte stack block:
   *                         isa      = __NSConcreteStackBlock
   *                         flags    = 0xC2000000
   *                         invoke   = &_block_invoke
   *                         descPtr  = &___block_descriptor_40_e8_32o_e5_v8?0l
   *                         captured = token   (at +0x20 of block)
   *   0xe00091            rcx = &stackBlock
   *   0xe00095..0xe0009e  _dispatch_block_create_with_qos_class(
   *                         flags = 0x20    (DISPATCH_BLOCK_ASSIGN_CURRENT? —
   *                                          matches "0x20" in libdispatch/
   *                                          block.h flag table),
   *                         qos = qos_class_t from above,
   *                         relPri = 0,
   *                         block = &stackBlock)
   *   0xe000a3            rbx = wrappedBlock
   *   0xe000a6..0xe000ae  _dispatch_block_perform(flags=0x20, wrappedBlock)
   *   0xe000b3..0xe000b6  __Block_release(wrappedBlock)
   *   0xe000bb..0xe000c1  epilogue, retq
   *
   * The block_invoke @Flexo 0xe000d0 is a 4-instruction trampoline:
   *
   *   0xe000d4  movq 0x20(%rdi),%rdi     ; rdi = captured token from block
   *   0xe000d8  movq @sel_ref,%rsi       ; rsi = @selector(<undecoded>)
   *   0xe000e0  jmpq *&_objc_msgSend     ; tail-call [token <sel>]
   *
   * i.e. "on the QoS-boosted dispatch queue, send the token its decode
   * selector". The initial `objc_msgSend` at 0xe00056 reads the token's
   * `priority` property (returns i32) — its selector is also un-decoded but
   * shaped like a plain getter.
   */
  doTheJob(token: FFScheduleTokenVTDecode): void {
    // @Flexo 0xe0004c..0xe00056 — priority = [token <prioritySelector>].
    const priority = _objc_msgSend_priorityGetter_stub(token);

    // @Flexo 0xe0005e — qos = FFSVPriorityGetQOSClass(priority).
    const qos = FFSVPriorityGetQOSClass_stub(priority);

    // @Flexo 0xe00063..0xe0008d — construct the stack block. We model the
    // block as a plain closure since we don't have the Block ABI in JS.
    // The captured token flows into the closure the same way the block's
    // +0x20 slot holds it in the asm.
    const capturedToken = token;
    const stackBlock = () => {
      // Matches ____ZN21FFCentralDecodingUnit8doTheJob..._block_invoke
      // @Flexo 0xe000d0..0xe000e6.
      objc_msgSend_token_decode_stub(capturedToken);
    };

    // @Flexo 0xe0009e — wrap with QoS class.
    const wrapped = dispatch_block_create_with_qos_class_stub(
      /* flags = 0x20 */ 0x20,
      qos,
      /* relPri */ 0,
      stackBlock,
    );

    // @Flexo 0xe000ae — dispatch_block_perform(0x20, wrapped).
    dispatch_block_perform_stub(0x20, wrapped);

    // @Flexo 0xe000b6 — Block_release(wrapped).
    Block_release_stub(wrapped);
  }

  /**
   * D1 in-place destructor — FFCentralDecodingUnit::~FFCentralDecodingUnit()
   *   @Flexo 0x0000000000e00190 .. 0x0000000000e00195
   *
   * Disassembly (5 instructions total):
   *   0xe00190  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0xe00195  jmp   __ZN21FFCentralJobProcessorD2Ev  ; tail-call base D2
   *
   * The derived class itself owns NO fields that need per-field teardown —
   * everything (workQueue, semaphore, base fields) is released by
   * FFCentralJobProcessor::~FFCentralJobProcessor.
   */
  D1_destructor(): void {
    // @Flexo 0xe00195 — tail-call the base D2.
    FFCentralJobProcessor_D2_stub(this);
  }

  /**
   * D0 deleting destructor — FFCentralDecodingUnit::~FFCentralDecodingUnit()
   *   @Flexo 0x0000000000e001a0 .. 0x0000000000e001b7
   *
   * Disassembly:
   *   0xe001a0..0xe001a5  prologue, rbx = this
   *   0xe001a9  callq __ZN21FFCentralJobProcessorD2Ev   ; base D2
   *   0xe001ae..0xe001b6  epilogue
   *   0xe001b7  jmp   __ZdlPv                            ; operator delete
   */
  D0_deleting_destructor(): void {
    // @Flexo 0xe001a9 — base D2.
    FFCentralJobProcessor_D2_stub(this);
    // @Flexo 0xe001b7 — operator delete(this).
    operator_delete_stub(this);
  }
}

/** @Flexo 0xe00056 — send the un-decoded priority-getter selector to the
 *  token, receive its FFSVPriorityEnum value. Not yet ported. */
function _objc_msgSend_priorityGetter_stub(
  _token: FFScheduleTokenVTDecode,
): number {
  throw new Error(
    "objc_msgSend priority-getter on FFScheduleTokenVTDecode @Flexo 0xe00056 " +
      "is not yet ported — selector identity un-decoded from selref table.",
  );
}
