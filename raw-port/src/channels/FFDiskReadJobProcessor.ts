// FFDiskReadJobProcessor.ts — Flexo's sibling of FFCentralDecodingUnit that
// serialises FCP's DISK READ jobs (as opposed to VideoToolbox decode jobs).
// Same FFCentralJobProcessor-derived layout, same GCD queue+semaphore
// idiom, but the ctor takes an explicit `int` concurrency (rather than
// deriving it from PCInfo::getPhysicalCPU) and `doTheJob` is a bare
// tail-call to the token's selector (no dispatch_block wrapping).
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// FIVE EXPORTED SYMBOLS (nm -arch x86_64):
//   @Flexo 0x0000000000dff0d0  FFDiskReadJobProcessor::FFDiskReadJobProcessor(int)  (C1)
//   @Flexo 0x0000000000e000f0  FFDiskReadJobProcessor::FFDiskReadJobProcessor(int)  (C2)
//   @Flexo 0x0000000000e00170  FFDiskReadJobProcessor::doTheJob(FFScheduleTokenVTDecode*)
//   @Flexo 0x0000000000e001c0  FFDiskReadJobProcessor::~FFDiskReadJobProcessor()  (D1)
//   @Flexo 0x0000000000e001d0  FFDiskReadJobProcessor::~FFDiskReadJobProcessor()  (D0)
//
// Source disassembly (this worktree, raw-port/re/disasm/):
//   Flexo.FFDiskReadJobProcessor.FFDiskReadJobProcessor.s   (C1 body @0xdff0d0)
//   Flexo.FFDiskReadJobProcessor.doTheJob.s
//   Flexo.FFDiskReadJobProcessor.~FFDiskReadJobProcessor.s  (D0 body @0xe001d0)
// (C2 @0xe000f0 and D1 @0xe001c0 were extracted directly from
//  /tmp/Flexo_tV.txt on this worktree.)
//
// C1 vs C2 relationship: byte-for-byte identical modulo the vtable RIP
// offset (0xb170e4 in C1 vs 0xb160c4 in C2 — same absolute vtable, different
// displacement because C1 is at a lower address). Both funnel through the
// exact same field-init sequence, so we model them as a single JS
// constructor.
//
// D1 vs D0 relationship: D1 is a bare `jmp __ZN21FFCentralJobProcessorD2Ev`
// (tail-call the base D2). D0 is D1 followed by `jmp __ZdlPv` (operator
// delete). The class itself owns NO fields that need per-field teardown —
// the dispatch_queue_t @+0x50 and dispatch_semaphore_t @+0x68 are freed by
// the base class's D2.
//
// -- STRUCT LAYOUT (recovered from the ctor body) --------------------------
// Identical to FFCentralDecodingUnit's — inherited from FFCentralJobProcessor:
//
//   offset  size  field                              @Flexo cite (C1 @0xdff0d0)
//   ------  ----  ---------------------------------  --------------------------
//   +0x00   0x08  vptr : void*                       0xdff0dd leaq -> 0xdff0e4
//                                                    (installed twice: once
//                                                    on entry and once at
//                                                    epilogue @0xdff13c/
//                                                    0xdff143 — same address,
//                                                    matches the ABI's
//                                                    "vtable during
//                                                    construction" idiom).
//   +0x08..+0x47 (56 bytes) zeroed via four `movups %xmm0` at
//                                                    0xdff0ea/ee/f2/f6 (0x8,
//                                                    0x18, 0x28, 0x38 each
//                                                    16 bytes) — base
//                                                    FFCentralJobProcessor
//                                                    fields, opaque here.
//   +0x48   0x08  <baseSlot> : u64                   0xdff0fa movq $0,0x48.
//   +0x50   0x08  workQueue : dispatch_queue_t       0xdff118 dispatch_queue_
//                                                    create; stored @0xdff11d.
//                                                    Label:
//                                                    "com.apple.flexo.drjpfig"
//                                                    (@Flexo 0xdff10e literal
//                                                    pool).
//   +0x58   0x01  someFlag : u8                       0xdff121 movb $0,0x58.
//   +0x5c   0x04  concurrency : i32                   0xdff125 movl r14d,0x5c
//                                                    (r14 = the passed-in
//                                                    int arg, verbatim).
//   +0x60   0x04  <baseSlot> : i32                    0xdff129 movl $0,0x60.
//   +0x68   0x08  concurrencySem : dispatch_semaphore_t
//                                                    0xdff133 dispatch_
//                                                    semaphore_create(
//                                                        (int64_t)r14);
//                                                    stored @0xdff138.
//                                                    Note: `movslq %r14d,%rdi`
//                                                    at 0xdff130 sign-extends
//                                                    the i32 concurrency to
//                                                    the intptr_t/long that
//                                                    _dispatch_semaphore_create
//                                                    takes (which is a
//                                                    `long` in
//                                                    libdispatch/queue.h).
//   sizeof                = at least 0x70 bytes (last write @+0x68; layout
//                                                inherited from
//                                                FFCentralJobProcessor).
//
// -- KEY DIFFERENCE FROM FFCentralDecodingUnit -----------------------------
//   1. Ctor signature: `FFDiskReadJobProcessor(int concurrency)` — the
//      caller passes the desired semaphore initial count directly. No
//      PCInfo::getPhysicalCPU() call and no max-with-20 floor.
//   2. GCD queue label: "com.apple.flexo.drjpfig" (Disk Read Job Processor
//      FiFo). FFCentralDecodingUnit's is "com.apple.flexo.cdufig".
//   3. `doTheJob(token)` is a 4-instruction trampoline:
//        movq %rsi,%rdi         ; rdi = token (from arg2)
//        movq @sel_ref,%rsi     ; rsi = @selector(<undecoded>)
//        jmpq *&_objc_msgSend   ; tail-call [token <sel>]
//      i.e. it does NOT wrap the send in a QoS dispatch_block. That
//      wrapping (if needed) is the caller's responsibility, or the token's
//      selector is already async-safe.
//   4. `movslq %r14d,%rdi` (@0xdff130) sign-extends the ctor's i32 for
//      dispatch_semaphore_create (FFCentralDecodingUnit uses `movq %r14,
//      %rdi` because its r14 was already a 64-bit `max(cpu,20)` value).
//
// -- FRONTIER CALLEES -----------------------------------------------------
//   @Flexo 0xdff109    _dispatch_queue_attr_make_with_autorelease_frequency(
//                        attr=NULL, freq=DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM=1)
//                      (libdispatch — throw)
//   @Flexo 0xdff118    _dispatch_queue_create("com.apple.flexo.drjpfig", attr)
//                      (libdispatch — throw)
//   @Flexo 0xdff133    _dispatch_semaphore_create(count)
//                      (libdispatch — throw)
//   @Flexo 0xe0017f    _objc_msgSend on the token (tail-call in doTheJob).
//                      Selector identity un-decoded.
//   @Flexo 0xe001d9    __ZN21FFCentralJobProcessorD2Ev
//                      FFCentralJobProcessor::~FFCentralJobProcessor()
//                      (base class D2 — not yet ported)
//   @Flexo 0xe001e7    __ZdlPv (operator delete)
//
// Reused ports:
//   None — FFCentralJobProcessor and libdispatch are separate task-queue
//          entries.

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

// -- FRONTIER STUBS --------------------------------------------------------

/** @Flexo 0xdff109 _dispatch_queue_attr_make_with_autorelease_frequency. */
function dispatch_queue_attr_make_with_autorelease_frequency_stub(
  _attr: DispatchQueueAttr | null,
  _freq: number,
): DispatchQueueAttr {
  throw new Error(
    "_dispatch_queue_attr_make_with_autorelease_frequency is a libdispatch " +
      "primitive with no pure-JS equivalent (@Flexo 0xdff109).",
  );
}

/** @Flexo 0xdff118 _dispatch_queue_create(label, attr). */
function dispatch_queue_create_stub(
  _label: string,
  _attr: DispatchQueueAttr,
): DispatchQueue {
  throw new Error(
    "_dispatch_queue_create is a libdispatch primitive with no pure-JS " +
      "equivalent (@Flexo 0xdff118).",
  );
}

/** @Flexo 0xdff133 _dispatch_semaphore_create(count). */
function dispatch_semaphore_create_stub(_count: number): DispatchSemaphore {
  throw new Error(
    "_dispatch_semaphore_create is a libdispatch primitive with no pure-JS " +
      "equivalent (@Flexo 0xdff133).",
  );
}

/** @Flexo 0xe0017f _objc_msgSend on the FFScheduleTokenVTDecode token —
 *  tail-called with the un-decoded 1-arg decode/read selector. Selector
 *  identity requires the selref table. Not yet ported. */
function objc_msgSend_token_read_stub(_token: FFScheduleTokenVTDecode): void {
  throw new Error(
    "objc_msgSend on FFScheduleTokenVTDecode token @Flexo 0xe0017f " +
      "(doTheJob tail-call) is not yet ported — selector identity un-decoded.",
  );
}

/** @Flexo 0xe001d9 __ZN21FFCentralJobProcessorD2Ev —
 *  FFCentralJobProcessor::~FFCentralJobProcessor(). Base-class D2 that owns
 *  the dispatch_queue @+0x50 and dispatch_semaphore @+0x68. Not yet ported. */
function FFCentralJobProcessor_D2_stub(_self: FFDiskReadJobProcessor): void {
  throw new Error(
    "FFCentralJobProcessor::~FFCentralJobProcessor() @Flexo 0xe001d9 is not " +
      "yet ported — port the FFCentralJobProcessor base class in its own task.",
  );
}

/** @Flexo 0xe001e7 __ZdlPv — operator delete(void*). */
function operator_delete_stub(_p: FFDiskReadJobProcessor): void {
  // No TS-side equivalent; GC reclaims when references drop.
}

// -- FFDiskReadJobProcessor -----------------------------------------------

/**
 * FFDiskReadJobProcessor — Flexo's disk-read job dispatch unit. A thin
 * `FFCentralJobProcessor` subclass that:
 *   - owns a serial dispatch_queue "com.apple.flexo.drjpfig" (@+0x50),
 *   - guards concurrency with a dispatch_semaphore of `concurrency`
 *     tokens (@+0x68), where `concurrency` is the ctor's i32 argument
 *     verbatim (sign-extended for dispatch_semaphore_create),
 *   - implements `doTheJob(FFScheduleTokenVTDecode*)` as a bare tail-call
 *     to `[token <undecoded-read-selector>]` — NO QoS dispatch_block
 *     wrapping (unlike FFCentralDecodingUnit).
 *
 * Layout (all offsets inherited from FFCentralJobProcessor — see file header):
 *   +0x00 vptr; +0x08..+0x48 base fields (opaque); +0x50 workQueue;
 *   +0x58 someFlag:u8; +0x5c concurrency:i32; +0x60 baseSlot:i32;
 *   +0x68 concurrencySem.
 */
export class FFDiskReadJobProcessor {
  declare readonly __brand_FFDiskReadJobProcessor: "FFDiskReadJobProcessor";

  // Fields inherited from FFCentralJobProcessor. We surface the ones the
  // exported methods here read/write; the opaque baseSlots stay
  // uninitialised (matching the `movups %xmm0; movq $0` zero-fill).

  /** +0x50 — serial dispatch queue "com.apple.flexo.drjpfig". */
  private _workQueue: DispatchQueue | null = null;
  /** +0x58 — u8 flag (init 0). Semantics undecoded — probably "isRunning". */
  private _flag: number = 0;
  /** +0x5c — concurrency = ctor arg verbatim. */
  private _concurrency: number = 0;
  /** +0x60 — i32 (init 0). Probably "in-flight count". */
  private _inFlight: number = 0;
  /** +0x68 — dispatch_semaphore with initial value = _concurrency. */
  private _concurrencySem: DispatchSemaphore | null = null;

  /**
   * C1/C2 constructor — FFDiskReadJobProcessor::FFDiskReadJobProcessor(int)
   *   C1 @Flexo 0x0000000000dff0d0 .. 0x0000000000dff14a
   *   C2 @Flexo 0x0000000000e000f0 .. 0x0000000000e0016a
   *
   * The two bodies are byte-identical modulo the vtable RIP offset; we model
   * them as a single JS constructor.
   *
   * Faithful decode (C1 addresses cited):
   *
   *   0xdff0d0..0xdff0da  prologue, r14 = concurrency (i32), rbx = this
   *   0xdff0dd..0xdff0e4  install vptr at +0x00 (leaq &__ZTV22FFDiskReadJob
   *                        Processor+0x10; movq to *this)
   *   0xdff0e7..0xdff0fa  zero out +0x08..+0x50 (four 16-byte movups plus a
   *                        trailing 8-byte movq at +0x48)
   *   0xdff102..0xdff109  _dispatch_queue_attr_make_with_autorelease_frequency(
   *                          attr=NULL, freq=1 which is WORK_ITEM)
   *   0xdff10e..0xdff118  _dispatch_queue_create("com.apple.flexo.drjpfig",
   *                                              attr)
   *   0xdff11d            self[+0x50] = queue
   *   0xdff121            self[+0x58] = 0                       (u8 flag)
   *   0xdff125            self[+0x5c] = r14 (i32)               (concurrency)
   *   0xdff129            self[+0x60] = 0                       (i32)
   *   0xdff130..0xdff133  _dispatch_semaphore_create(
   *                          (long)(int32_t)r14)                ; movslq
   *                                                              sign-extends
   *                                                              i32 -> i64
   *   0xdff138            self[+0x68] = sem
   *   0xdff13c..0xdff143  install vptr at +0x00 (redundant reinstall — same
   *                        address as at 0xdff0dd; the compiler emitted
   *                        both writes for the "vtable during construction"
   *                        ABI corner)
   *   0xdff146..0xdff14a  epilogue, retq
   */
  constructor(concurrency: number) {
    // @Flexo 0xdff0dd..0xdff0fa — install vptr, zero base fields.
    // (Modelled by field default-initialisers above; no runtime action.)

    // @Flexo 0xdff102..0xdff109 — build the queue attr with autorelease-
    // frequency WORK_ITEM (value 1 per libdispatch/queue.h).
    const attr = dispatch_queue_attr_make_with_autorelease_frequency_stub(
      /* attr */ null,
      /* DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM */ 1,
    );

    // @Flexo 0xdff10e..0xdff118 — create the serial dispatch queue.
    this._workQueue = dispatch_queue_create_stub(
      "com.apple.flexo.drjpfig",
      attr,
    );

    // @Flexo 0xdff121..0xdff129 — field defaults + concurrency.
    this._flag = 0;
    // @Flexo 0xdff125 — store the i32 concurrency verbatim. The `| 0`
    // ensures TS models the int32 truncation semantic that `movl` implies.
    this._concurrency = concurrency | 0;
    this._inFlight = 0;

    // @Flexo 0xdff130..0xdff138 — concurrencySem = dispatch_semaphore_create(
    //   (long)(int32_t)concurrency). The `movslq` sign-extends i32 → i64;
    //   in JS Number preserves the sign automatically.
    this._concurrencySem = dispatch_semaphore_create_stub(
      this._concurrency,
    );

    // @Flexo 0xdff13c..0xdff143 — redundant vptr reinstall (no TS effect).
  }

  /**
   * doTheJob — FFDiskReadJobProcessor::doTheJob(FFScheduleTokenVTDecode*)
   *   @Flexo 0x0000000000e00170 .. 0x0000000000e00185
   *
   * The entire body is a 6-instruction tail-call. No QoS wrapping, no
   * dispatch_block, no state — just forward the send to the token:
   *
   *   0xe00170  pushq %rbp / movq %rsp,%rbp
   *   0xe00174  movq  %rsi,%rdi                          ; rdi = token
   *   0xe00177  movq  @sel_ref(%rip), %rsi               ; rsi = @sel(<...>)
   *   0xe0017e  popq  %rbp
   *   0xe0017f  jmpq  *&_objc_msgSend                    ; [token <sel>]
   *
   * The token's selector name isn't recoverable without the selref table.
   * Its argument shape (1-arg send, void return) suggests something like
   * `-[FFScheduleTokenVTDecode readFromDisk]` or `-[... run]`, but the port
   * doesn't guess — it routes through a throwing stub with a placeholder
   * name.
   *
   * Note: `this` (the FFDiskReadJobProcessor) is NEVER dereferenced. The
   * processor's state (queue, semaphore) is unused in this method; presumably
   * the token itself already knows how to enqueue onto the shared queue via
   * some external state, or the disk-read machinery is designed so that
   * `doTheJob` is only called from within the queue context and the token's
   * selector is I/O-safe.
   */
  doTheJob(token: FFScheduleTokenVTDecode): void {
    // @Flexo 0xe0017f — [token <undecoded read selector>].
    objc_msgSend_token_read_stub(token);
  }

  /**
   * D1 in-place destructor — FFDiskReadJobProcessor::~FFDiskReadJobProcessor()
   *   @Flexo 0x0000000000e001c0 .. 0x0000000000e001c5
   *
   * Disassembly (5 instructions total):
   *   0xe001c0  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0xe001c5  jmp   __ZN21FFCentralJobProcessorD2Ev  ; tail-call base D2
   *
   * The derived class itself owns NO fields that need per-field teardown —
   * everything (workQueue, semaphore, base fields) is released by
   * FFCentralJobProcessor::~FFCentralJobProcessor.
   */
  D1_destructor(): void {
    // @Flexo 0xe001c5 — tail-call the base D2.
    FFCentralJobProcessor_D2_stub(this);
  }

  /**
   * D0 deleting destructor — FFDiskReadJobProcessor::~FFDiskReadJobProcessor()
   *   @Flexo 0x0000000000e001d0 .. 0x0000000000e001e7
   *
   * Disassembly:
   *   0xe001d0..0xe001d6  prologue, rbx = this
   *   0xe001d9  callq __ZN21FFCentralJobProcessorD2Ev   ; base D2
   *   0xe001de..0xe001e6  epilogue
   *   0xe001e7  jmp   __ZdlPv                            ; operator delete
   */
  D0_deleting_destructor(): void {
    // @Flexo 0xe001d9 — base D2.
    FFCentralJobProcessor_D2_stub(this);
    // @Flexo 0xe001e7 — operator delete(this).
    operator_delete_stub(this);
  }
}
