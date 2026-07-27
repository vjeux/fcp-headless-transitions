// AUFaderLevel — Flexo.framework built-in AudioUnit "fadr" (Fader Level).
//
// Faithful transcription of the two destructor slots that Apple emits for every C++ class
// under the Itanium ABI. Source: raw-port/re/disasm/Flexo.AUFaderLevel.D1.s (D1 base dtor
// @Flexo 0x1244800) and raw-port/re/disasm/Flexo.AUFaderLevel.D0.s (D0 deleting dtor
// @Flexo 0x1244890). Both are called through the class vtable / factory Destruct hook
// (ausdk::APFactory<AUBaseLookup, AUFaderLevel>::Destruct).
//
// This class is a THIN SUBCLASS of ausdk::AUEffectBase — its only additional member
// (compared to the base) that this dtor touches is a std::vector<Owned*> whose
// _M_start/_M_finish pair lives at (this+0x250, this+0x258). The dtor:
//   1) rebinds the vtable pointer (*this) back to `AUEffectBase::vtable + 0x10` so any
//      virtual call fired during member teardown resolves to AUEffectBase's impl, not
//      the (partially destroyed) derived one — standard Itanium behaviour.
//   2) walks the owned-element vector from _M_finish-1 down to _M_start, virtual-calling
//      slot [1] (vtable offset 0x8) on each non-null element — that slot is the element
//      type's own D0 (deleting dtor), so the pointed-to object is destroyed AND freed.
//      The slot is stored back to null as it goes.
//   3) frees the vector's underlying storage via operator delete(_M_start).
//   4) D1 tail-jumps into ausdk::AUBase::~AUBase (D2 base subobject dtor) to finish the
//      hierarchy. D0 chains through the same path and additionally operator-deletes `this`.
//
// The vtable rebind constant `__ZTVN5ausdk12AUEffectBaseE + 0x10` is the address of
// AUEffectBase's first *virtual function slot* (skipping the two-slot ABI header:
// offset-to-top + typeinfo pointer). We have not decoded any of AUEffectBase's virtual
// methods, its member layout beyond the 0x250/0x258 vector, or the element type's D0 —
// they are frontier callees. Per PORTING_SPEC Rule 3 the callees throw citing @0xADDR.
//
// Decode evidence:
//   raw-port/re/disasm/Flexo.AUFaderLevel.D1.s            (0x1244800..0x1244887)
//   raw-port/re/disasm/Flexo.AUFaderLevel.D0.s            (0x1244890..0x124491a)
//   nm -arch x86_64 Flexo | c++filt:
//     __ZTVN5ausdk12AUEffectBaseE  — vtable const referenced from RIP+0x6a3bd4 (D1) / +0x6a3b44 (D0)
//     __ZN5ausdk6AUBaseD2Ev        — symbol stub target of the tail-jmp (D1) / callq (D0) @0x1496bc4
//     __ZdlPv                      — operator delete(void*) symbol stub @0x1497404

// ─── Frontier callees (undecoded — throw per Rule 3) ──────────────────────────────────

/**
 * Element-slot virtual destructor (D0, deleting), invoked via `*(*vtable)+0x8` on each
 * non-null pointer in the (this+0x250 .. this+0x258) vector.
 *   D1 site: callq *0x8(%rax)   @Flexo 0x124485d
 *   D0 site: callq *0x8(%rax)   @Flexo 0x12448ed
 * The element class isn't identified in AUFaderLevel's own binary (comes in through the
 * ausdk template machinery); resolve.py has no name for this vtable slot yet.
 */
function elementVDeleter(_element: object): void {
  throw new Error(
    "AUFaderLevel: element-vector vtable slot 0x8 (element D0 dtor) not yet transcribed — " +
    "sites @Flexo 0x124485d (D1) / @Flexo 0x12448ed (D0)"
  );
}

/**
 * ausdk::AUBase::~AUBase — base subobject destructor. D1 tail-jumps into it; D0 calls it
 * then falls through to operator delete(this).
 *   D1:  jmp   __ZN5ausdk6AUBaseD2Ev  @Flexo 0x1244882 (stub @0x1496bc4)
 *   D0:  callq __ZN5ausdk6AUBaseD2Ev  @Flexo 0x1244908 (stub @0x1496bc4)
 * Not decoded — deep inside CoreAudio's ausdk static library.
 */
function ausdk_AUBase_D2(_self: AUFaderLevel): void {
  throw new Error(
    "ausdk::AUBase::~AUBase not yet transcribed — @Flexo stub 0x1496bc4 " +
    "(called @0x1244882 / @0x1244908)"
  );
}

/**
 * operator delete(void*) — libc++ / libsystem. Frees the vector storage and, in D0, frees
 * `this` itself.
 *   Vector storage free: callq __ZdlPv @Flexo 0x1244870 (D1) / @0x1244900 (D0)   stub 0x1497404
 *   D0 tail free of this: jmp __ZdlPv @Flexo 0x124491a                            stub 0x1497404
 * Modelled here as a no-op in the TS mirror (no manual heap in a GC runtime), but kept
 * as a documented call so future oracle work can attach a hook.
 */
function operator_delete(_p: unknown): void {
  // libsystem/libc++ operator delete(void*). No-op in the TS mirror; the citations
  // are recorded on the call-sites below to keep the provenance chain honest.
}

// ─── The class itself ─────────────────────────────────────────────────────────────────

/**
 * Sentinel for the vtable rebind. `AUEffectBase`'s vtable is a linker symbol we can't
 * dereference from TS; store its "resolved to +0x10" marker so the destructor mirror
 * still reflects the write to `*this` faithfully.
 */
const AUEffectBase_vtable_plus_0x10 = Symbol("ausdk::AUEffectBase::vtable+0x10");

/**
 * The AUFaderLevel object graph as decoded from the destructor. Only the fields the
 * destructor actually touches are modelled — the rest of the AUBase/AUEffectBase
 * subobject is opaque here.
 *
 * Layout (offsets recovered from D1/D0 disasm):
 *   +0x000  vptr                       — rebind target: ausdk::AUEffectBase vtable +0x10
 *                                        @0x124480d (D1) / @0x124489d (D0)
 *   +0x250  ownedVector._M_start       — pointer to first Owned* slot
 *                                        @0x124481b (D1) / @0x12448ab (D0)
 *   +0x258  ownedVector._M_finish      — one-past-end pointer
 *                                        @0x1244827 (D1) / @0x12448b7 (D0)
 */
export class AUFaderLevel {
  vptr: symbol = AUEffectBase_vtable_plus_0x10;
  /**
   * std::vector<Owned*> stored inline as {start, finish}. The vector's third member
   * (_M_end_of_storage) is not read by the destructor, so we don't model it.
   */
  ownedVector: { start: (object | null)[]; finish: number } = { start: [], finish: 0 };

  /**
   * AUFaderLevel::~AUFaderLevel() — D1 base destructor.
   * @Flexo 0x1244800  (raw-port/re/disasm/Flexo.AUFaderLevel.D1.s)
   *
   * Mirrors the x86-64 line-for-line:
   *   0x1244800  push rbp/r15/r14/rbx/rax; mov rbx, rdi                    prologue
   *   0x124480d  mov rax, [rip+0x6a3bd4]        ## __ZTVN5ausdk12AUEffectBaseE
   *   0x1244814  add rax, 0x10
   *   0x1244818  mov [rdi], rax                 ## *this = AUEffectBase vtable + 0x10
   *   0x124481b  mov r14, [rdi+0x250]           ## r14 = _M_start
   *   0x1244822  test r14, r14
   *   0x1244825  je 0x1244875                   ## if start==NULL skip loop+free
   *   0x1244827  mov r15, [rbx+0x258]           ## r15 = _M_finish
   *   0x124482e  mov rdi, r14
   *   0x1244831  cmp r14, r15
   *   0x1244834  jne 0x1244849                  ## if start != finish, enter loop
   *   0x1244836  jmp 0x1244869                  ## empty vector: skip loop, still free
   *   ┌─ loop body (destroy from finish-1 down to start) ─┐
   *   0x1244840  add r15, -0x8                  ## --finish (pointer)
   *   0x1244844  cmp r15, r14
   *   0x1244847  je 0x1244862                   ## done -> exit
   *   0x1244849  mov rdi, [r15-0x8]             ## rdi = *(finish-1) = element ptr
   *   0x124484d  mov qword [r15-0x8], 0
   *   0x1244855  test rdi, rdi
   *   0x1244858  je 0x1244840                   ## null slot -> skip virtual call
   *   0x124485a  mov rax, [rdi]                 ## rax = element vtable
   *   0x124485d  call [rax+0x8]                 ## slot 1 (D0 deleting dtor)
   *   0x1244860  jmp 0x1244840
   *   0x1244862  mov rdi, [rbx+0x250]           ## reload _M_start for the free call
   *   0x1244869  mov [rbx+0x258], r14           ## _M_finish = _M_start  (empty vector)
   *   0x1244870  call __ZdlPv                   ## operator delete(_M_start)
   *   0x1244875  mov rdi, rbx
   *   0x1244878  add rsp,0x8; pop rbx/r14/r15/rbp                         epilogue
   *   0x1244882  jmp __ZN5ausdk6AUBaseD2Ev      ## tail-chain base dtor
   */
  dtor_D1_at_0x1244800(): void {
    // @0x1244818 — rebind vtable
    this.vptr = AUEffectBase_vtable_plus_0x10;

    // @0x124481b — r14 = _M_start (we model _M_start as the JS array itself)
    const r14 = this.ownedVector.start;
    // @0x1244822..0x1244825 — testq/je: if _M_start == NULL, jump to the tail. In C++
    // an empty default-constructed vector has _M_start==NULL and skips both the loop
    // and operator delete entirely (there is no storage to free).
    if (r14 === null) {
      // fall through to epilogue @0x1244875 -> AUBase::~AUBase
      ausdk_AUBase_D2(this);
      return;
    }

    // @0x1244827 — r15 = _M_finish (index into the same array).
    let r15 = this.ownedVector.finish;

    // @0x1244831..0x1244836 — if start == finish, empty vector: skip loop but still
    // fall into the operator-delete call at 0x1244869.
    if (r15 !== 0) {
      // @0x1244840..0x1244860 — reverse walk, virtual-call slot 0x8 on each non-null.
      // The asm decrements r15 by 8 FIRST, then reads [r15-0x8], which addresses the
      // element BEFORE the previous finish pointer. Modelled as: read at index
      // r15-1, then decrement r15 to reflect the pointer decrement.
      for (;;) {
        r15 = r15 - 1;                                // @0x1244840
        if (r15 < 0) break;                           // r15 reached _M_start
        // @0x1244849..0x124484d — pop the slot and null it out.
        const rdi = r14[r15];
        r14[r15] = null;
        // @0x1244855..0x1244858 — null-check the element pointer.
        if (rdi !== null && rdi !== undefined) {
          // @0x124485a..0x124485d — virtual call: vtable[1] = element D0 deleting dtor.
          elementVDeleter(rdi);
        }
        // @0x1244860 — jmp back to loop head.
      }
    }

    // @0x1244869 — _M_finish = _M_start (empty the vector). r14 is the original _M_start.
    this.ownedVector.finish = 0;
    // @0x1244870 — operator delete(_M_start): frees the vector's underlying storage.
    operator_delete(r14);

    // @0x1244875..0x1244882 — epilogue then tail-jmp to ausdk::AUBase::~AUBase.
    ausdk_AUBase_D2(this);
  }

  /**
   * AUFaderLevel::~AUFaderLevel() — D0 deleting destructor.
   * @Flexo 0x1244890  (raw-port/re/disasm/Flexo.AUFaderLevel.D0.s)
   *
   * Bytes 0x1244890..0x1244919 are BYTE-IDENTICAL to D1 except the last two instructions:
   *   0x1244905  mov rdi, rbx
   *   0x1244908  call __ZN5ausdk6AUBaseD2Ev            ## call (not jmp) into base dtor
   *   0x124490d  mov rdi, rbx
   *   0x1244910..0x1244919  epilogue
   *   0x124491a  jmp  __ZdlPv                          ## then operator delete(this)
   * i.e. D0 = D1 + `operator delete(this)`.
   */
  dtor_D0_at_0x1244890(): void {
    // @0x1244890..0x1244908 — same body as D1 up through the AUBase::~AUBase call.
    this.dtor_D1_at_0x1244800();
    // @0x124491a — tail: operator delete(this). No-op in the GC-managed TS mirror; the
    // citation records the site.
    operator_delete(this);
  }
}
