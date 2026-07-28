// OZHGMotionEstimateJob — Ozone OZHGUserJob subclass wrapping a single
// `OZOpticalFlow::Private::AnalyzerImpl*` and dispatching its
// `estimateMotion(OZProcessControl&)` on the shared PGHGRenderQueue
// "optical-flow" queue.
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework)
// (thin Mach-O x86_64 slice — no fat header).
//
// Faithful transcription of exactly SIX exported symbols (nm listing):
//   0x4db7c0  OZHGMotionEstimateJob::OZHGMotionEstimateJob(OZOpticalFlow::Private::AnalyzerImpl*)  [C2]
//   0x4db820  OZHGMotionEstimateJob::OZHGMotionEstimateJob(OZOpticalFlow::Private::AnalyzerImpl*)  [C1]
//   0x4db880  OZHGMotionEstimateJob::~OZHGMotionEstimateJob()  [D2]
//   0x4db890  OZHGMotionEstimateJob::~OZHGMotionEstimateJob()  [D1]
//   0x4db8a0  OZHGMotionEstimateJob::~OZHGMotionEstimateJob()  [D0]
//   0x4db8c0  OZHGMotionEstimateJob::executing()
//
// VTABLE — resolved via `resolve.py Ozone vtable OZHGMotionEstimateJob`
// (`# OZHGMotionEstimateJob vtable @0x8770b0; installed ptr 0x8770c0`):
//   *0x00 -> 0x4db890  ~OZHGMotionEstimateJob()               [D1, this class]
//   *0x08 -> 0x4db8a0  ~OZHGMotionEstimateJob()               [D0, this class]
//   *0x10 -> 0x11a4    (Ozone-local RTTI/pure-virtual slot, opaque)
//   *0x18 -> 0x11a3    (Ozone-local RTTI/pure-virtual slot, opaque)
//   *0x20 -> 0x12dd    (Ozone-local RTTI/pure-virtual slot, opaque)
//   *0x28 -> 0x4db8c0  OZHGMotionEstimateJob::executing()     [this class]
//   *0x30 -> 0x636350  OZHGUserJob::canceled()                (inherited)
//   *0x38 -> 0x636360  OZHGUserJob::notifyOther()             (inherited)
//   *0x40 -> 0x0       (RTTI header slot; unused)
//   *0x48 -> 0x877148  typeinfo for OZOpticalFlow::Private::AnalyzerImpl (multi-inherit)
//   *0x50..*0x68       — inherited from OZOpticalFlow::Private::AnalyzerImpl
//                       through the SECONDARY subobject at +0x48; this class
//                       overrides ONLY the executing() slot at *0x28 (plus
//                       the two vdtor slots) relative to its OZHGUserJob
//                       primary base.
//
// The C2/C1 both install `vtable + 0x10 = 0x8770c0` at (this+0):
//   C2: leaq 0x39b8e5(%rip), %rax  @0x4db7d4  ->  next=0x4db7db + 0x39b8e5 = 0x8770c0
//   C1: leaq 0x39b885(%rip), %rax  @0x4db834  ->  next=0x4db83b + 0x39b885 = 0x8770c0
//
// STRUCT LAYOUT (recovered from field references in this class's own slice):
//   +0x000  primary vptr        (= vtable[OZHGMotionEstimateJob] + 0x10 = 0x8770c0)
//   +0x008..+0x047              (OZHGUserJob base subobject — opaque; this
//                               class's slice does not read/write any field
//                               below +0x48 by name)
//   +0x048  OZProcessControl    (embedded by-value; a 72-byte-ish struct
//                               starting here — the `executing()` body
//                               computes `&this->+0x48` @0x4db8cb via
//                               `leaq 0x48(%rdi), %rsi` and feeds that as
//                               the `OZProcessControl&` argument to
//                               `AnalyzerImpl::estimateMotion`. This class
//                               DOES NOT construct or reset that struct in
//                               C2/C1 — it must already be in a valid state
//                               by the time `executing()` is called, i.e.
//                               constructed by the OZHGUserJob base ctor.)
//   +0x090  AnalyzerImpl*       (owned analyzer handle. Written by both
//                               ctors @0x4db7de/0x4db83e via
//                               `movq %r14, 0x90(%rbx)`. NOT explicitly
//                               released by any of the three dtors on this
//                               class's own decoded surface — the release
//                               is presumably driven by OZHGUserJob::~D2
//                               through the multiple-inheritance tail.)
//   sizeof(OZHGMotionEstimateJob) is >= 0x98 (last observed +0x90 is an
//     8-byte pointer). We do not have a `new`-size literal on this class's
//     own surface to nail the total size down further — this class has no
//     `operator new` in-body; instances are always constructed into an
//     externally-provided buffer.
//
// FRONTIER CALLEES (each surfaced as a throwing stub with its call site cited):
//   OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)
//     [__ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object]
//     — OZHGUserJob base ctor. Called by BOTH C2 and C1 @Ozone 0x4db7cf
//     and 0x4db82f with (this, client=nullptr). Note both ctors HARDWIRE
//     the ObjC client parameter to nil (`xorl %esi, %esi` @0x4db7cd /
//     @0x4db82d), i.e. this class ALWAYS constructs its base subobject
//     with no client — the "estimateMotion" job routes its results back
//     through the AnalyzerImpl callback path, not through the ObjC
//     OZHGUserJobClient protocol.
//   OZHGUserJob::~OZHGUserJob()
//     [__ZN11OZHGUserJobD2Ev] — OZHGUserJob base dtor. Called tail-jmp
//     from D2/D1 @0x4db885/0x4db895 and body-call from D0 @0x4db8a9;
//     also invoked from BOTH C2/C1 exception-unwind paths @0x4db809 /
//     @0x4db869.
//   HGUserJob::SetPriority(HGUserJob::Priority)
//     [__ZN9HGUserJob11SetPriorityENS_8PriorityE] — inherited from
//     HGUserJob. Called by BOTH C2/C1 @0x4db7ea / 0x4db84a with
//     (this, 0). The `Priority` argument is an unnamed enum whose 0
//     value corresponds to some priority level — kept as a raw literal
//     rather than name-invented.
//   PGHGRenderQueue::getOpticalFlowQueueID()
//     [__ZN15PGHGRenderQueue21getOpticalFlowQueueIDEv] — returns the
//     shared "optical-flow queue" ID. Called by BOTH C2/C1 @0x4db7ef /
//     @0x4db84f (no args).
//   HGUserJob::SetQueueID(unsigned int)
//     [__ZN9HGUserJob10SetQueueIDEj] — inherited from HGUserJob. Called
//     by BOTH C2/C1 @0x4db7f9 / @0x4db859 with (this, queueID from
//     getOpticalFlowQueueID).
//   HGObject::operator delete(void*)
//     [__ZN8HGObjectdlEPv] — called tail-jmp from D0 @0x4db8b7.
//   OZOpticalFlow::Private::AnalyzerImpl::estimateMotion(OZProcessControl&)
//     [__ZN13OZOpticalFlow7Private12AnalyzerImpl14estimateMotionER16OZProcessControl]
//     — the actual work function. Called tail-jmp from executing()
//     @0x4db8d3 with (analyzer = this->+0x90, procCtl = &this->+0x48).
//   __Unwind_Resume — exception-unwind rethrow in BOTH C2/C1 @0x4db811/0x4db871.
//
// REUSED PORTS: none. This class introduces its own OZHGUserJob-family
// wrapper; the other OZHGUserJob subclasses in Ozone (OZHGAudioJob,
// OZHGRenderJob, ...) are not yet transcribed here.
//
// Source disassembly saved at:
//   raw-port/re/disasm/Ozone.OZHGMotionEstimateJob.all.s

/**
 * Opaque handle for `OZOpticalFlow::Private::AnalyzerImpl` — the analyzer
 * object whose `estimateMotion(OZProcessControl&)` method is the actual
 * work function scheduled by this job.  Layout not on this class's
 * decoded surface (its own transcription lives at Ozone 0x4dcdb0..).
 */
export type OZOpticalFlow_Private_AnalyzerImpl = {
  /**
   * `OZOpticalFlow::Private::AnalyzerImpl::estimateMotion(OZProcessControl&)`
   * — frontier method. Invoked tail-jmp from
   * OZHGMotionEstimateJob::executing() @Ozone 0x4db8d3 with the analyzer
   * as `this` and a reference to the job's embedded `OZProcessControl`
   * at +0x48.
   */
  estimateMotion(_procCtl: OZProcessControl): void;
};

/**
 * Opaque handle for `OZProcessControl` — the by-value-embedded control
 * struct at (this + 0x48). Constructed by OZHGUserJob's base ctor,
 * consumed by AnalyzerImpl::estimateMotion via a reference @0x4db8cb.
 * Layout is not on this class's decoded surface.
 */
export type OZProcessControl = object;

/**
 * Opaque handle for `OZHGUserJob::Client` (`id<OZHGUserJobClient>`).
 * Both ctors hardwire this to nil (`xorl %esi, %esi` @0x4db7cd /
 * @0x4db82d), so this type is only referenced through the base-ctor
 * frontier signature — never populated with a real value on this
 * class's own surface.
 */
export type OZHGUserJobClient = object;

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)` — frontier method
 * (OZHGUserJob base ctor, __ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object).
 * Called by BOTH OZHGMotionEstimateJob ctors @Ozone 0x4db7cf (C2) and
 * 0x4db82f (C1) with (`this`, `client = nullptr`).
 */
function OZHGUserJob_base_ctor(
  _self: OZHGMotionEstimateJob,
  _client: OZHGUserJobClient | null,
): void {
  throw new Error(
    "OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>) @Ozone U-extern " +
      "__ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object " +
      "(defined elsewhere in Ozone; not yet transcribed) — invoked by " +
      "OZHGMotionEstimateJob C2 @Ozone 0x4db7cf, C1 @0x4db82f",
  );
}

/**
 * `OZHGUserJob::~OZHGUserJob()` — frontier method (OZHGUserJob base
 * dtor, __ZN11OZHGUserJobD2Ev). Called tail-jmp from D2/D1 @Ozone
 * 0x4db885/0x4db895 and body-call from D0 @0x4db8a9; also invoked from
 * BOTH ctor exception-unwind paths @0x4db809 (C2) / @0x4db869 (C1).
 */
function OZHGUserJob_dtor(_self: OZHGMotionEstimateJob): void {
  throw new Error(
    "OZHGUserJob::~OZHGUserJob() @Ozone U-extern __ZN11OZHGUserJobD2Ev " +
      "(defined elsewhere in Ozone; not yet transcribed) — invoked by " +
      "OZHGMotionEstimateJob D2 tail-jmp @Ozone 0x4db885, D1 tail-jmp @0x4db895, " +
      "D0 call @0x4db8a9, C2 unwind @0x4db809, C1 unwind @0x4db869",
  );
}

/**
 * `HGUserJob::SetPriority(HGUserJob::Priority)` — frontier method
 * (__ZN9HGUserJob11SetPriorityENS_8PriorityE). Called by BOTH ctors
 * @Ozone 0x4db7ea (C2) / 0x4db84a (C1) with (`this`, `priority = 0`)
 * — the priority enum literal `0` is transcribed verbatim as an
 * integer, without name-inventing an enumerator label (the enum
 * definition is not on this class's decoded surface).
 */
function HGUserJob_SetPriority(
  _self: OZHGMotionEstimateJob,
  _priority: number,
): void {
  throw new Error(
    "HGUserJob::SetPriority(HGUserJob::Priority) @Ozone U-extern " +
      "__ZN9HGUserJob11SetPriorityENS_8PriorityE " +
      "(defined elsewhere; not yet transcribed) — invoked by " +
      "OZHGMotionEstimateJob C2 @Ozone 0x4db7ea, C1 @0x4db84a (priority literal 0)",
  );
}

/**
 * `PGHGRenderQueue::getOpticalFlowQueueID()` — frontier free function
 * (__ZN15PGHGRenderQueue21getOpticalFlowQueueIDEv). Returns the shared
 * "optical-flow queue" ID. Called by BOTH ctors @Ozone 0x4db7ef (C2) /
 * 0x4db84f (C1) with no args; result is passed straight into
 * `HGUserJob::SetQueueID`.
 */
function PGHGRenderQueue_getOpticalFlowQueueID(): number {
  throw new Error(
    "PGHGRenderQueue::getOpticalFlowQueueID() @Ozone U-extern " +
      "__ZN15PGHGRenderQueue21getOpticalFlowQueueIDEv " +
      "(defined elsewhere; not yet transcribed) — invoked by " +
      "OZHGMotionEstimateJob C2 @Ozone 0x4db7ef, C1 @0x4db84f",
  );
}

/**
 * `HGUserJob::SetQueueID(unsigned int)` — frontier method
 * (__ZN9HGUserJob10SetQueueIDEj). Called by BOTH ctors @Ozone 0x4db7f9
 * (C2) / 0x4db859 (C1) with (`this`, queueID from
 * `PGHGRenderQueue::getOpticalFlowQueueID`).
 */
function HGUserJob_SetQueueID(
  _self: OZHGMotionEstimateJob,
  _queueID: number,
): void {
  throw new Error(
    "HGUserJob::SetQueueID(unsigned int) @Ozone U-extern " +
      "__ZN9HGUserJob10SetQueueIDEj " +
      "(defined elsewhere; not yet transcribed) — invoked by " +
      "OZHGMotionEstimateJob C2 @Ozone 0x4db7f9, C1 @0x4db859",
  );
}

/**
 * `HGObject::operator delete(void*)` — frontier stub
 * (__ZN8HGObjectdlEPv). Called tail-jmp from D0 @Ozone 0x4db8b7
 * (the deleting-dtor `delete this;` step).
 */
function HGObject_operator_delete(_p: object): void {
  throw new Error(
    "HGObject::operator delete(void*) @Ozone U-extern __ZN8HGObjectdlEPv " +
      "(defined elsewhere; not yet transcribed) — invoked by " +
      "OZHGMotionEstimateJob D0 tail-jmp @Ozone 0x4db8b7",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZHGMotionEstimateJob` — Ozone OZHGUserJob subclass that wraps a
 * single `OZOpticalFlow::Private::AnalyzerImpl*` and, when the queue
 * scheduler calls `executing()`, forwards the call to
 * `analyzer->estimateMotion(this->procCtl)`.
 *
 * The class overrides ONLY three vtable slots relative to OZHGUserJob:
 *   • *0x00 D1                — this class's D1 dtor @0x4db890
 *   • *0x08 D0                — this class's D0 dtor @0x4db8a0
 *   • *0x28 executing()       — this class's executing() @0x4db8c0
 * All other slots inherit unchanged (see the vtable comment in the file
 * header). The vptr is 0x8770c0 (installed as `vtable + 0x10`), written
 * by both C2/C1 @0x4db7db/0x4db83b.
 *
 * NB: We do NOT `extends` an OZHGUserJob base class — its ctor is a
 * frontier stub (see `OZHGUserJob_base_ctor` above), so inheriting
 * would only propagate un-populatable fields. Instead we model the
 * observable per-instance state directly (analyzer @+0x90) and route
 * everything else through the frontier.
 */
export class OZHGMotionEstimateJob {
  /** Primary vptr @Ozone install site 0x4db7db (C2) / 0x4db83b (C1):
   *  both resolve to vtable+0x10 = 0x8770c0. Implicit in JS. */
  // (primary vtable slot is implicit)

  /** AnalyzerImpl* at C++ offset +0x90. Written by BOTH ctors @0x4db7de
   *  (C2) / 0x4db83e (C1) via `movq %r14, 0x90(%rbx)`. */
  analyzer!: OZOpticalFlow_Private_AnalyzerImpl;

  /**
   * `OZHGMotionEstimateJob::OZHGMotionEstimateJob(AnalyzerImpl*)`
   * — @Ozone 0x4db7c0 [C2] and @0x4db820 [C1]. Both bodies are
   * byte-for-byte identical (only the `leaq` displacement differs;
   * the RESOLVED vptr is 0x8770c0 in both).
   *
   * DISASM (C2 @0x4db7c0):
   *   0x4db7c0..0x4db7ca   frame setup + spill %rsi(analyzer)→%r14,
   *                        %rdi(this)→%rbx
   *   0x4db7cd xorl  %esi, %esi                    ; client = nullptr
   *   0x4db7cf callq OZHGUserJob::OZHGUserJob      ; base ctor(this, nullptr)
   *   0x4db7d4 leaq  0x39b8e5(%rip), %rax          ; rax = 0x8770c0 (vptr)
   *   0x4db7db movq  %rax, (%rbx)                  ; this->vptr = vtable+0x10
   *   0x4db7de movq  %r14, 0x90(%rbx)              ; this->+0x90 = analyzer
   *   0x4db7e5 movq  %rbx, %rdi                    ; rdi = this
   *   0x4db7e8 xorl  %esi, %esi                    ; priority = 0
   *   0x4db7ea callq HGUserJob::SetPriority(...)   ; this->SetPriority(0)
   *   0x4db7ef callq PGHGRenderQueue::getOpticalFlowQueueID()
   *   0x4db7f4 movq  %rbx, %rdi                    ; rdi = this
   *   0x4db7f7 movl  %eax, %esi                    ; esi = queueID
   *   0x4db7f9 callq HGUserJob::SetQueueID(...)    ; this->SetQueueID(queueID)
   *   0x4db7fe..0x4db802   frame teardown + retq
   *   [0x4db803..0x4db816 : exception-unwind pad — OZHGUserJob base
   *    dtor + __Unwind_Resume.]
   *
   * DISASM (C1 @0x4db820): identical spine (different `leaq` displacement
   * 0x39b885 — same resolved vptr 0x8770c0; PCs shifted by 0x60).
   */
  constructor(analyzer: OZOpticalFlow_Private_AnalyzerImpl) {
    // @0x4db7cd (C2) / @0x4db82d (C1) — client is nil.
    // @0x4db7cf (C2) / @0x4db82f (C1) — OZHGUserJob base ctor.
    OZHGUserJob_base_ctor(this, null);

    // @0x4db7db (C2) / @0x4db83b (C1) — vptr install (implicit in JS).

    // @0x4db7de (C2) / @0x4db83e (C1) — this->+0x90 = analyzer.
    this.analyzer = analyzer;

    // @0x4db7ea (C2) / @0x4db84a (C1) — this->SetPriority(0).
    HGUserJob_SetPriority(this, 0);

    // @0x4db7ef (C2) / @0x4db84f (C1) — getOpticalFlowQueueID.
    const queueID = PGHGRenderQueue_getOpticalFlowQueueID();

    // @0x4db7f9 (C2) / @0x4db859 (C1) — this->SetQueueID(queueID).
    HGUserJob_SetQueueID(this, queueID);
  }

  /**
   * `OZHGMotionEstimateJob::~OZHGMotionEstimateJob()` — @Ozone
   * 0x4db880 [D2], @0x4db890 [D1], @0x4db8a0 [D0].
   *
   * DISASM (D2 @0x4db880):
   *   0x4db880 pushq %rbp
   *   0x4db881 movq  %rsp, %rbp
   *   0x4db884 popq  %rbp
   *   0x4db885 jmp   OZHGUserJob::~OZHGUserJob()   ; tail-jmp
   *
   * DISASM (D1 @0x4db890): byte-identical to D2 (`jmp` @0x4db895).
   *
   * DISASM (D0 @0x4db8a0):
   *   0x4db8a0..0x4db8a6   frame setup + spill %rdi(this)→%rbx
   *   0x4db8a9 callq OZHGUserJob::~OZHGUserJob()   ; base dtor(this)
   *   0x4db8ae movq  %rbx, %rdi                    ; rdi = this
   *   0x4db8b1..0x4db8b6   frame teardown
   *   0x4db8b7 jmp   HGObject::operator delete     ; delete(this)
   *
   * The three-way D2/D1/D0 emit is exactly what Itanium C++ ABI produces
   * for a class with a non-trivial base dtor. D2 (base-object dtor) and
   * D1 (complete-object dtor) are identical because this class has no
   * own non-trivial per-instance state to release (the AnalyzerImpl* at
   * +0x90 is NOT released by any of these three dtors on this class's
   * own decoded surface — its lifetime is presumably managed elsewhere
   * or through OZHGUserJob's own release mechanism).
   */
  destructor(): void {
    // @0x4db885 (D2) / @0x4db895 (D1) / @0x4db8a9 (D0) — OZHGUserJob base dtor.
    OZHGUserJob_dtor(this);

    // @0x4db8b7 (D0 only) — HGObject::operator delete(this). Cited above;
    // no explicit TS mirror (JS GC reclaims the object once no live refs
    // remain).
  }

  /**
   * `OZHGMotionEstimateJob::executing()` — @Ozone 0x4db8c0
   * (vtable slot *0x28, overriding the base `executing()`).
   *
   * DISASM (@0x4db8c0):
   *   0x4db8c0..0x4db8c1   frame setup
   *   0x4db8c4 movq  0x90(%rdi), %rax                  ; rax = this->+0x90 (analyzer)
   *   0x4db8cb leaq  0x48(%rdi), %rsi                  ; rsi = &this->+0x48 (procCtl)
   *   0x4db8cf movq  %rax, %rdi                        ; rdi = analyzer
   *   0x4db8d2 popq  %rbp                              ; frame teardown BEFORE jmp
   *   0x4db8d3 jmp   AnalyzerImpl::estimateMotion(OZProcessControl&)
   *                                                    ; tail-jmp
   *
   * The tail-jmp encodes a plain forwarding call: this method has no
   * own body beyond fetching the two pointers from `this` and handing
   * them off to `analyzer->estimateMotion(this->procCtl)`.
   */
  executing(): void {
    // @0x4db8c4 — rax = this->+0x90 (analyzer).
    const analyzer = this.analyzer;

    // @0x4db8cb — rsi = &this->+0x48 (OZProcessControl).  The C++ code
    // takes the address of the by-value-embedded OZProcessControl at
    // +0x48; in TypeScript we model that as an object property. On this
    // class's own decoded surface the OZProcessControl is a frontier
    // (its layout / ctor / dtor are not decoded here), so a fully
    // faithful port must raise — the reference we would hand off is
    // opaque and unusable outside a full OZProcessControl transcription.
    const procCtl: OZProcessControl = ((): OZProcessControl => {
      throw new Error(
        "OZHGMotionEstimateJob::executing @Ozone 0x4db8cb — " +
          "&this->+0x48 (OZProcessControl) not yet transcribed " +
          "(OZProcessControl layout is a frontier)",
      );
    })();

    // @0x4db8d3 — tail-jmp analyzer.estimateMotion(procCtl).
    analyzer.estimateMotion(procCtl);
  }
}
