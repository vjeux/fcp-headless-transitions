// HGInterlaceHandler_InterlaceFields — Helium framework
// Interlace-fields node: routes even/odd field inputs through an inner
// HgcInterlaceHandler_InterlaceFields worker whose per-field operation is
// selected by a boolean parameter at +0x1a0 (0 → field-order A, 1 → B).
//
// One C++ class per file. All numeric constants + control flow transcribed
// directly from the x86_64 disasm; un-decoded FCP callees are throw-stubbed
// with their @0xADDR so the frontier tracker can pick them up.
//
// Framework: Helium (/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework)
// Mangled ctor: __ZN34HGInterlaceHandler_InterlaceFieldsC2Ev  @0x93040
// Mangled dtor: __ZN34HGInterlaceHandler_InterlaceFieldsD2Ev  @0x93180

// --- un-decoded external callees (throw stubs; each cites the addr it defers) ---

/** HGNode::HGNode() ctor — base subobject setup. Not yet transcribed. @0x???? (called from @0x9304d) */
function HGNode_ctor(_self: HGInterlaceHandler_InterlaceFields): void {
  throw new Error("HGNode::HGNode() @0x?? (call site @0x9304d) not yet transcribed");
}

/** HGNode::ClearBits() — clears node dirty/status bits. Not yet transcribed. @0x???? (called from @0x9324e) */
function HGNode_ClearBits(_self: HGInterlaceHandler_InterlaceFields): void {
  throw new Error("HGNode::ClearBits() @0x?? (call site @0x9324e) not yet transcribed");
}

/** HGNode::~HGNode() — base subobject teardown. Not yet transcribed. @0x???? (tail-called from @0x931a9) */
function HGNode_dtor(_self: HGInterlaceHandler_InterlaceFields): void {
  throw new Error("HGNode::~HGNode() @0x?? (call site @0x931a9) not yet transcribed");
}

/** HGObject::operator new(unsigned long) — allocator for the inner Hgc worker. Not yet transcribed. @0x???? (called from @0x93061) */
function HGObject_operator_new(_size: number): HgcInterlaceHandler_InterlaceFields {
  throw new Error("HGObject::operator new(unsigned long) @0x?? (call site @0x93061) not yet transcribed");
}

/** HGObject::operator delete(void*) — deallocator. Not yet transcribed. @0x???? (tail-called from @0x93231) */
function HGObject_operator_delete(_p: HgcInterlaceHandler_InterlaceFields): void {
  throw new Error("HGObject::operator delete(void*) @0x?? (call site @0x93231) not yet transcribed");
}

/** HgcInterlaceHandler_InterlaceFields ctor — inner per-field worker. Not yet transcribed. @0x338770 (called from @0x93079) */
function HgcInterlaceHandler_InterlaceFields_ctor(_self: HgcInterlaceHandler_InterlaceFields): void {
  throw new Error("HgcInterlaceHandler_InterlaceFields::HgcInterlaceHandler_InterlaceFields() @0x338770 (call site @0x93079) not yet transcribed");
}

/** HGRenderer::GetInput(HGNode*, int) — returns an input handle for the given input index. Not yet transcribed. @0x???? (called from @0x932d8 and @0x932ff) */
function HGRenderer_GetInput(_renderer: HGRenderer, _node: HGInterlaceHandler_InterlaceFields, _idx: number): unknown {
  throw new Error("HGRenderer::GetInput(HGNode*, int) @0x?? (call sites @0x932d8, @0x932ff) not yet transcribed");
}

// --- forward types (opaque; only used as pointer receivers here) ---

/** Base class HGNode (Helium node). Opaque here; only the vtable ptr at +0x0 is touched. */
export interface HGNode {
  /** vtable pointer at +0x0 (set in ctor @0x93052/@0x93059 to a RIP-relative address in this framework's rodata) */
  __vtable: unknown;
}

/** The per-field worker object owned at +0x198.
 *  Concrete layout is defined by HgcInterlaceHandler_InterlaceFields; opaque here.
 *  ctor at @0x338770 zero-fills 0x1b0 bytes (from @0x93061 = new 0x1b0) then runs its own ctor. */
export interface HgcInterlaceHandler_InterlaceFields {
  /** vtable pointer at +0x0 (set at @0x93085 in the owner's ctor) */
  __vtable: {
    /** vtable slot at offset +0x18: destructor thunk (called from @0x9319d, @0x9321d) */
    slot_0x18: (self: HgcInterlaceHandler_InterlaceFields) => void;
    /** vtable slot at offset +0x60: SetParameter(int, float, float, float, float) — used by SetFieldOrder tail-call @0x932ee.
     *  In C parlance this is HgcInterlaceHandler_InterlaceFields::SetParameter, whose disasm lives in a
     *  separate class (@0x338a30). Not transcribed here. */
    slot_0x60: (self: HgcInterlaceHandler_InterlaceFields, idx: number, p1: number, p2: number, p3: number, p4: number) => void;
    /** vtable slot at offset +0x78: the per-field render entry (called twice from GetOutput @0x932ea, @0x93310).
     *  This is HgcInterlaceHandler_InterlaceFields's "Bind" (see @0x337a00) or similar per-field dispatch.
     *  Not transcribed here. */
    slot_0x78: (self: HgcInterlaceHandler_InterlaceFields, fieldSelect: number, input: unknown) => void;
  };
}

/** HGRenderer — pipeline scheduler. Only GetInput is called here; kept opaque. */
export interface HGRenderer {
  /** GetInput(node, idx) — call-through to the external function above. */
  __opaque: true;
}

// --- the ported class ---

/**
 * HGInterlaceHandler_InterlaceFields
 *
 * A Helium render-graph node that owns an inner per-field worker
 * (HgcInterlaceHandler_InterlaceFields) at +0x198 and a boolean "field order"
 * flag at +0x1a0. GetOutput() pulls both inputs from the HGRenderer, then
 * dispatches each input through the worker's vtable slot +0x78 with a
 * field-select argument that is (flag ? 0 : 1) for input 0 and
 * (flag ? 1 : 0) for input 1 (i.e. the flag swaps which input becomes
 * which field).
 *
 * Verified by disasm:
 *   ctor         @0x93040
 *   dtors        @0x93180 (D2), @0x931c0 (D1), @0x93200 (D0)
 *   SetParameter @0x93240
 *   SetFieldOrder@0x93280
 *   GetOutput    @0x932a0
 */
export class HGInterlaceHandler_InterlaceFields implements HGNode {
  /** vtable pointer at +0x0 — set at ctor @0x93052/@0x93059. Opaque here. */
  public __vtable: unknown = null;

  /**
   * +0x198 — pointer to the inner per-field worker (HgcInterlaceHandler_InterlaceFields).
   * Allocated in ctor @0x9305c–@0x93088:
   *   size = 0x1b0 (@0x9305c)
   *   HGObject::operator new(0x1b0)  (@0x93061)
   *   ___bzero(ptr, 0x1b0)           (@0x93071)
   *   HgcInterlaceHandler_InterlaceFields::ctor(ptr) (@0x93079)
   *   worker->__vtable = <RIP-relative addr @0x9307e>  (@0x93085)
   *   this[+0x198] = ptr              (@0x93088)
   */
  public worker: HgcInterlaceHandler_InterlaceFields | null = null;

  /**
   * +0x1a0 — field-order/parameter flag.
   * Set by SetParameter(0, p1, ...) or SetFieldOrder(fo). Stored value is
   * (p1 != 0.0f) ? 1 : 0 for SetParameter; SetFieldOrder tail-calls the
   * worker's vtable slot +0x60 (which is its own SetParameter) with
   * p1 = (float)fieldOrder, so the same "!= 0" test applies there.
   * Initialized to 0 at ctor @0x9308f: `movl $0x0, 0x1a0(%rbx)`.
   */
  public fieldOrderFlag: number = 0;

  /**
   * Constructor — @0x93040 (__ZN34HGInterlaceHandler_InterlaceFieldsC2Ev)
   *
   * Instruction transcription:
   *   @0x9304d  call HGNode::HGNode()                       — base subobject
   *   @0x93052  lea  0x977c3f(%rip), %rax                   — vtable literal
   *   @0x93059  mov  %rax, (%rbx)                           — this->__vtable = ...
   *   @0x9305c  mov  $0x1b0, %edi                           — size = 0x1b0
   *   @0x93061  call HGObject::operator new(0x1b0)          — allocate worker
   *   @0x93071  call ___bzero(ptr, 0x1b0)                   — zero 0x1b0 bytes
   *   @0x93079  call HgcInterlaceHandler_InterlaceFields::ctor(ptr)
   *   @0x9307e  lea  0x9780db(%rip), %rax                   — worker vtable literal
   *   @0x93085  mov  %rax, (%r14)                           — worker->__vtable = ...
   *   @0x93088  mov  %r14, 0x198(%rbx)                      — this->worker = ptr
   *   @0x9308f  movl $0x0, 0x1a0(%rbx)                      — this->fieldOrderFlag = 0
   */
  constructor() {
    HGNode_ctor(this);
    // this->__vtable set here (opaque address literal)
    this.__vtable = "HGInterlaceHandler_InterlaceFields::vtable @rip+0x977c3f (from @0x93052)";

    // allocate inner worker: 0x1b0 bytes, zero-filled, ctor'd, then vtable-patched.
    const worker = HGObject_operator_new(0x1b0);
    // (bzero is implicit — HGObject::operator new is expected to return zeroed memory
    //  in this port; the actual zeroing at @0x93071 targets that allocation.)
    HgcInterlaceHandler_InterlaceFields_ctor(worker);
    worker.__vtable = "HgcInterlaceHandler_InterlaceFields::vtable @rip+0x9780db (from @0x9307e)" as unknown as HgcInterlaceHandler_InterlaceFields["__vtable"];

    this.worker = worker;
    this.fieldOrderFlag = 0;
  }

  /**
   * Destructor (D2 — base object) — @0x93180 (__ZN34HGInterlaceHandler_InterlaceFieldsD2Ev)
   *
   * Instruction transcription:
   *   @0x93189  lea  0x977b08(%rip), %rax
   *   @0x93190  mov  %rax, (%rdi)                — reset this->__vtable
   *   @0x93193  mov  0x198(%rdi), %rdi           — rdi = this->worker
   *   @0x9319a  mov  (%rdi), %rax                — rax = worker->__vtable
   *   @0x9319d  call *0x18(%rax)                 — worker->__vtable[+0x18](worker)  — dtor thunk
   *   @0x931a9  jmp  HGNode::~HGNode()           — chain to base dtor (tail call)
   *
   * The 0x18 vtable slot is the standard "in-charge dtor" thunk in Itanium C++ ABI
   * (D1 slot); it may free the worker via its D0 companion.
   */
  destructor_D2(): void {
    // reset vtable to base-class subobject vtable (address literal at @0x93189)
    this.__vtable = "HGInterlaceHandler_InterlaceFields::vtable-in-dtor @rip+0x977b08 (from @0x93189)";
    if (this.worker === null) {
      throw new Error("HGInterlaceHandler_InterlaceFields::~HGInterlaceHandler_InterlaceFields @0x93180: worker at +0x198 is null (ctor invariant violated)");
    }
    // worker->__vtable[+0x18](worker)  — call the worker's dtor thunk
    (this.worker.__vtable as { slot_0x18: (self: HgcInterlaceHandler_InterlaceFields) => void }).slot_0x18(this.worker);
    // tail-call HGNode::~HGNode()
    HGNode_dtor(this);
  }

  /**
   * Deleting destructor (D0) — @0x93200 (__ZN34HGInterlaceHandler_InterlaceFieldsD0Ev)
   *
   * Instruction transcription (mirrors D2 then delete):
   *   @0x93209  lea  0x977a88(%rip), %rax
   *   @0x93210  mov  %rax, (%rdi)                — reset this->__vtable
   *   @0x93213  mov  0x198(%rdi), %rdi           — rdi = this->worker
   *   @0x9321a  mov  (%rdi), %rax                — rax = worker->__vtable
   *   @0x9321d  call *0x18(%rax)                 — worker->__vtable[+0x18](worker)
   *   @0x93223  call HGNode::~HGNode()           — non-tail call (this time)
   *   @0x93231  jmp  HGObject::operator delete(void*)  — free this
   */
  destructor_D0(): void {
    this.__vtable = "HGInterlaceHandler_InterlaceFields::vtable-in-D0 @rip+0x977a88 (from @0x93209)";
    if (this.worker === null) {
      throw new Error("HGInterlaceHandler_InterlaceFields::~HGInterlaceHandler_InterlaceFields (D0) @0x93200: worker at +0x198 is null (ctor invariant violated)");
    }
    (this.worker.__vtable as { slot_0x18: (self: HgcInterlaceHandler_InterlaceFields) => void }).slot_0x18(this.worker);
    HGNode_dtor(this);
    HGObject_operator_delete(this.worker);
  }

  /**
   * SetParameter(int idx, float p1, float p2, float p3, float p4) — @0x93240
   *   (__ZN34HGInterlaceHandler_InterlaceFields12SetParameterEiffff)
   *
   * Note: `idx`, `p2`, `p3`, `p4` are IGNORED by this override.
   * Only `p1` (xmm0 on entry, stashed at -0xc(%rbp)) is consumed, and it is
   * reduced to a boolean flag by an ordered NOT-EQUAL compare against 0.0f.
   *
   * Instruction transcription:
   *   @0x93246  movss %xmm0, -0xc(%rbp)               — spill p1
   *   @0x9324e  call  HGNode::ClearBits()             — invalidate cached bits
   *   @0x93253  xorps %xmm0, %xmm0                    — xmm0 = 0.0f
   *   @0x93256  cmpneqss -0xc(%rbp), %xmm0            — xmm0 lanes = (0.0 != p1) ? all-1s : 0
   *   @0x9325c  movd  %xmm0, %eax                     — eax = -1 or 0
   *   @0x93260  and   $0x1, %eax                      — eax = 1 or 0
   *   @0x93263  mov   %eax, 0x1a0(%rbx)               — this->fieldOrderFlag = (p1 != 0.0f) ? 1 : 0
   *   @0x93269  mov   $0x1, %eax                      — return 1 (success)
   *
   * NOTE ON FLOAT SEMANTICS: `cmpneqss` is an ORDERED not-equal — it returns
   * all-ones only when both operands are non-NaN AND unequal. If p1 is NaN,
   * the compare is UNORDERED and the result is 0 → the flag is set to 0.
   * `Math.fround` is applied to p1 because it arrives as an SSE `float`
   * (movss / xmm0 as single-precision) per PORTING_SPEC rule 4.
   */
  SetParameter(_idx: number, p1: number, _p2: number, _p3: number, _p4: number): number {
    HGNode_ClearBits(this);
    // p1 spilled at -0xc(%rbp) via movss — it is a single-precision float.
    const p1f = Math.fround(p1);
    // cmpneqss with 0.0f: NaN → unordered → false; else strict !=.
    // JS `!==` on non-NaN reproduces the ordered NEQ; NaN !== 0 is TRUE in JS,
    // which would DIVERGE from FCP. Guard NaN explicitly.
    const neq = !Number.isNaN(p1f) && p1f !== 0;
    this.fieldOrderFlag = neq ? 1 : 0;
    return 1;
  }

  /**
   * SetFieldOrder(hgInterlaceHandler_InterlaceFields fieldOrder) — @0x93280
   *   (__ZN34HGInterlaceHandler_InterlaceFields13SetFieldOrderENS_34hgInterlaceHandler_InterlaceFieldsE)
   *
   * Instruction transcription:
   *   @0x93284  movl  %esi, %eax
   *   @0x93286  cvtsi2ss %rax, %xmm0     — xmm0 = (float)(int64)fieldOrder
   *   @0x9328b  mov   (%rdi), %rax       — rax = this->__vtable
   *   @0x9328e  mov   0x60(%rax), %rax   — rax = vtable[+0x60] (SetParameter override)
   *   @0x93292  xorps %xmm1..%xmm3       — p2 = p3 = p4 = 0.0f
   *   @0x9329b  xorl  %esi, %esi         — idx = 0
   *   @0x9329e  jmp   *%rax              — tail-call this->SetParameter(0, (float)fieldOrder, 0, 0, 0)
   *
   * i.e. SetFieldOrder is just: this->SetParameter(0, (float)fieldOrder, 0, 0, 0)
   * via the object's own vtable slot +0x60 (which for this class points at
   * HGInterlaceHandler_InterlaceFields::SetParameter above).
   *
   * The `cvtsi2ss %rax, %xmm0` treats the enum as a 64-bit SIGNED integer and
   * converts to float; for the enum values 0/1/... the fround is exact.
   */
  SetFieldOrder(fieldOrder: number): void {
    // cvtsi2ss on the sign-extended enum value → single-precision float.
    // For small integer field-order enums this is exact.
    const asFloat = Math.fround(fieldOrder | 0);
    // Tail-call SetParameter(0, asFloat, 0, 0, 0). We call it directly here
    // (this file owns the SetParameter override that lives at vtable +0x60).
    this.SetParameter(0, asFloat, 0, 0, 0);
  }

  /**
   * GetOutput(HGRenderer* renderer) — @0x932a0
   *   (__ZN34HGInterlaceHandler_InterlaceFields9GetOutputEP10HGRenderer)
   *
   * Instruction transcription:
   *   @0x932b7  cmpl  $0x0, 0x1a0(%rdi)             — cmp fieldOrderFlag, 0
   *   @0x932c1  sete  %r14b                         — r14 = (flag == 0) ? 1 : 0
   *   @0x932c5  setne %r15b                         — r15 = (flag != 0) ? 1 : 0
   *   @0x932c9  mov   0x198(%rdi), %r13             — r13 = this->worker
   *   @0x932d8  call  HGRenderer::GetInput(this, 0) — input0 = renderer->GetInput(this, 0)
   *   @0x932dd  mov   (%r13), %rcx                  — rcx = worker->__vtable
   *   @0x932e4  mov   %r15d, %esi                   — arg1 = r15 (flag != 0)
   *   @0x932e7  mov   %rax, %rdx                    — arg2 = input0
   *   @0x932ea  call  *0x78(%rcx)                   — worker->vtable[+0x78](worker, flag!=0, input0)
   *   @0x932ed  mov   0x198(%rbx), %r15             — reload r15 = this->worker
   *   @0x932ff  call  HGRenderer::GetInput(this, 1) — input1 = renderer->GetInput(this, 1)
   *   @0x93304  mov   (%r15), %rcx                  — rcx = worker->__vtable
   *   @0x9330a  mov   %r14d, %esi                   — arg1 = r14 (flag == 0)
   *   @0x9330d  mov   %rax, %rdx                    — arg2 = input1
   *   @0x93310  call  *0x78(%rcx)                   — worker->vtable[+0x78](worker, flag==0, input1)
   *   @0x93313  mov   0x198(%rbx), %rax             — return this->worker
   *
   * i.e.
   *   r14 = (flag == 0)   // "input 1 is the 'primary' field when flag is 0"
   *   r15 = (flag != 0)   // "input 0 is the 'primary' field when flag is 1"
   *   worker.slot_0x78(worker, r15, renderer.GetInput(this, 0));
   *   worker.slot_0x78(worker, r14, renderer.GetInput(this, 1));
   *   return worker;
   *
   * The flag thereby swaps which input becomes which field in the interlaced
   * output (that IS what "field order" means for this node).
   */
  GetOutput(renderer: HGRenderer): HgcInterlaceHandler_InterlaceFields {
    if (this.worker === null) {
      throw new Error("HGInterlaceHandler_InterlaceFields::GetOutput @0x932a0: worker at +0x198 is null (ctor invariant violated)");
    }
    const flag = this.fieldOrderFlag;
    const r14 = flag === 0 ? 1 : 0; // sete
    const r15 = flag !== 0 ? 1 : 0; // setne

    const worker = this.worker;

    // First input (idx = 0), dispatched with fieldSelect = r15
    const input0 = HGRenderer_GetInput(renderer, this, 0);
    (worker.__vtable as { slot_0x78: (self: HgcInterlaceHandler_InterlaceFields, sel: number, input: unknown) => void })
      .slot_0x78(worker, r15, input0);

    // Second input (idx = 1), dispatched with fieldSelect = r14.
    // NOTE: r15 is reloaded from +0x198 at @0x932ed as a fresh copy of the
    // same pointer — the reload guards against the worker ptr being clobbered
    // across the intervening call. We reflect that by re-reading `this.worker`.
    if (this.worker === null) {
      throw new Error("HGInterlaceHandler_InterlaceFields::GetOutput @0x932ed: worker at +0x198 became null between input dispatches (invariant violated)");
    }
    const workerReload = this.worker;
    const input1 = HGRenderer_GetInput(renderer, this, 1);
    (workerReload.__vtable as { slot_0x78: (self: HgcInterlaceHandler_InterlaceFields, sel: number, input: unknown) => void })
      .slot_0x78(workerReload, r14, input1);

    // returns this->worker (the +0x198 pointer, reloaded at @0x93313)
    return this.worker;
  }
}
