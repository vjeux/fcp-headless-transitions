// @class LiImageFilterChain (Ozone)
//
// DECODE from raw-port/re/disasm/LiImageFilterChain.append.s and
//                raw-port/re/disasm/LiImageFilterChain.~LiImageFilterChain.s.
//
// Two ported methods:
//   @0x0a6c80  LiImageFilterChain::append(LiImageFilter*)
//   @0x51ac00  LiImageFilterChain::~LiImageFilterChain()      [D1]
//
// LAYOUT (recovered from field accesses in both symbols):
//   0x00..0x07  ??? (untouched by these two symbols; likely head of a vptr or
//               PCSharedCount word — the dtor at @0x51ac4d does
//               `addq $0x8,%rbx; jmp __ZN13PCSharedCountD1Ev`, i.e. the
//               PCSharedCount subobject lives at offset 0x08.)
//   0x08..0x0F  PCSharedCount (D1 tail-called from dtor @0x51ac5a)
//   0x10..0x1F  PCArray<PCPtr<LiImageFilter>> — the embedded array subobject:
//                 0x10  vtable slot (dtor rewrites this — @0x51ac0d/18)
//                 0x18  int32 capacity  (read as `movl 0x18(%rbx),%eax`)
//                 0x1c  int32 size      (read as `movl 0x1c(%rbx),%ecx` — this
//                                        is the current count, incremented by
//                                        `resize(cap',cur+1)` at @0a6ccb)
//                 0x20  T* data buffer   (used at @0x51ac30 for `delete[]`
//                                        and at @0x0a6cd0 as the mutable base)
//
// Notes: the two int32s' roles (which is capacity vs size) are inferred from
// the growth pattern in `append` — at @0a6cbf..cc8, `cmp cap, cur` then
// `lea 3+2*cur, dbl` then `cmovl cap, dbl` picks max(cap, 2*cur+3) — a classic
// vector "cap = max(cap, 2*count+3)" growth. The `resize(newSize=cur+1)` param
// is prepared in %esi at @0a6cbc.

// ─── Frontier callees (un-decoded in this pass — throw per PORTING_SPEC Rule 3) ────

/** @0x6ddadc __ZN13PCSharedCountC1EP13PCShared_base — PCSharedCount(PCShared_base*) */
function PCSharedCount_ctor_fromBase(_dst: unknown, _base: unknown): void {
  throw new Error(
    "PCSharedCount::PCSharedCount(PCShared_base*) — not ported " +
      "(callee __ZN13PCSharedCountC1EP13PCShared_base, from LiImageFilterChain::append @0x0a6cb1)"
  );
}

/** @0x6ddae2 __ZN13PCSharedCountC1ERKS_ — copy-ctor */
function PCSharedCount_ctor_copy(_dst: unknown, _src: unknown): void {
  throw new Error(
    "PCSharedCount::PCSharedCount(PCSharedCount const&) — not ported " +
      "(callee __ZN13PCSharedCountC1ERKS_, from LiImageFilterChain::append @0x0a6cec)"
  );
}

/** @0x6ddaf4 __ZN13PCSharedCountaSES_ — assignment op */
function PCSharedCount_assign(_dst: unknown, _src: unknown): void {
  throw new Error(
    "PCSharedCount::operator=(PCSharedCount) — not ported " +
      "(callee __ZN13PCSharedCountaSES_, from LiImageFilterChain::append @0x0a6cff)"
  );
}

/** @0x6ddaee __ZN13PCSharedCountD1Ev — destructor */
function PCSharedCount_dtor(_this: unknown): void {
  throw new Error(
    "PCSharedCount::~PCSharedCount() — not ported " +
      "(callee __ZN13PCSharedCountD1Ev, from LiImageFilterChain::append @0x0a6d08/@0x0a6d10 " +
      "and dtor tail-call @0x51ac5a)"
  );
}

/** @0x6de424 __ZN18LiImageFilterChain7connectEv — chain wiring pass */
function LiImageFilterChain_connect(_this: unknown): void {
  throw new Error(
    "LiImageFilterChain::connect() — not ported " +
      "(callee __ZN18LiImageFilterChain7connectEv, from append @0x0a6d18)"
  );
}

/** PCArray<PCPtr<LiImageFilter>>::resize(int cap, int size) — the templated
 *  member. Ozone has a per-instantiation body at
 *  __ZN7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE6resizeEii
 *  (called from both @0x0a6ccb and dtor @0x51ac2b). Not yet ported. */
function PCArray_PCPtr_LiImageFilter_resize(
  _this: unknown,
  _cap: number,
  _size: number
): void {
  throw new Error(
    "PCArray<PCPtr<LiImageFilter>>::resize(int,int) — not ported " +
      "(callee __ZN7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE6resizeEii, " +
      "from append @0x0a6ccb and dtor @0x51ac2b)"
  );
}

/** @0x6dfc30 __ZdaPv — operator delete[] (bulk buffer free). */
function operator_delete_array(_p: unknown): void {
  // In JS, storage is GC-managed. This is a no-op that faithfully represents
  // the trip through operator delete[] the binary makes at dtor @0x51ac39.
}

/** vtable base for PCArray<PCPtr<LiImageFilter>> — installed by the dtor at
 *  @0x51ac0d..18 as `[vtable+0x10]`. The exact address is inside Ozone's
 *  __DATA and not needed by pure semantics; we track it as an opaque value. */
const PCArray_PCPtr_LiImageFilter_VTABLE = Symbol(
  "vtable@__ZTV7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE"
);

// ─── The class itself ──────────────────────────────────────────────────────────────

/**
 * LiImageFilterChain — thin ordered container of `PCPtr<LiImageFilter>` plus
 * a PCSharedCount subobject at 0x08. Sizeof ≥ 0x28 (last touched offset is
 * 0x20+16 in append).
 */
export class LiImageFilterChain {
  /** 0x00..0x07 — untouched by the two ported symbols. Kept opaque. */
  private _head: unknown = null;

  /** 0x08..0x0F — PCSharedCount subobject. Modelled as an opaque handle
   *  because PCSharedCount is not ported yet; the dtor tail-calls its D1. */
  private _sharedCount: unknown = null;

  /** 0x10 — vtable slot for the PCArray subobject. The dtor rewrites this
   *  before calling resize(). */
  private _arrayVptr: unknown = PCArray_PCPtr_LiImageFilter_VTABLE;

  /** 0x18 — PCArray capacity (i32). */
  private _arrayCap: number = 0;

  /** 0x1c — PCArray current count (i32). */
  private _arraySize: number = 0;

  /** 0x20 — PCArray data buffer pointer. Stride is 16 bytes/element (the
   *  compiler uses `shlq $4, %r12` at @0x0a6cd8 to scale the count into a
   *  byte offset), which matches `PCPtr<T>` = { T* raw @+0; PCSharedCount @+8 }. */
  private _arrayData: unknown = null;

  /**
   * @0x0a6c80  LiImageFilterChain::append(LiImageFilter*)
   *
   * Exact asm mirror:
   *   %r15 = this + 0x10                                          @0x0a6c92
   *   saved arg (spilled to -0x38(%rbp))
   *   if (arg != null)                                            @0x0a6c9a..c9d
   *     rax = *arg                          ; vtable ptr
   *     rsi = arg + *(rax - 0x18)           ; PCShared_base thunk
   *     jmp forward                                                @0x0a6ca6
   *   else
   *     rsi = 0                                                    @0x0a6ca8
   *
   *   %r14 = &tempCount1  (on stack, -0x30(%rbp))
   *   PCSharedCount::PCSharedCount(rsi)                            @0x0a6cb1
   *
   *   eax  = this->cap                                             @0x0a6cb6
   *   ecx  = this->size                                            @0x0a6cb9
   *   esi  = size + 1                                              @0x0a6cbc
   *   edx  = 2*size + 3                                            @0x0a6cc1  (double + 3 = 2n+3)
   *   if (size < cap) edx = eax                                    @0x0a6cc5  (cmovl)
   *   ; edx = max(cap, 2*size+3),  esi = new count = size+1
   *   PCArray<...>::resize(edx, esi)                               @0x0a6ccb
   *
   *   ; write the raw pointer into slot [size].raw:
   *   r15  = this->data                                            @0x0a6cd0
   *   r12  = (int64)size << 4                                      @0x0a6cd4/d8
   *   *(this->data + r12 - 0x10) = arg                             @0x0a6ce0
   *   ;  → data[size].raw = arg  (offset -0x10 relative to data+r12
   *   ;    which points *past* the slot; the compiler pre-incremented via resize)
   *
   *   ; construct tempCount2 = copy of tempCount1
   *   PCSharedCount::PCSharedCount(&tempCount2, &tempCount1)       @0x0a6cec
   *
   *   ; slot[size].sharedCount = tempCount2  (via operator=)
   *   r15 = this->data + r12 - 0x8                                 @0x0a6cf1/f4
   *   PCSharedCount::operator=(*r15, tempCount2)                    @0x0a6cff
   *
   *   PCSharedCount::~PCSharedCount(&tempCount2)                    @0x0a6d08
   *   PCSharedCount::~PCSharedCount(&tempCount1)                    @0x0a6d10
   *   LiImageFilterChain::connect(this)                             @0x0a6d18
   *
   * (unwind targets @0x0a6d2a/@0x0a6d46 destroy tempCount1/2 then _Unwind_Resume)
   */
  append(filter: unknown /* LiImageFilter* */): void {
    // Compute rsi = filter ? filter + *(vptr - 0x18) : nullptr
    // The `*(vptr - 0x18)` is the classic Itanium-ABI offset-to-PCShared_base
    // stored just above the vtable. Since we don't have LiImageFilter's vtable
    // decoded, we pass the raw pointer through opaquely and let the (throwing)
    // PCSharedCount ctor cite the frontier.
    const shared_base_arg: unknown = filter; // conservative — real: filter+*(vptr-0x18)
    const tempCount1: unknown = { _kind: "PCSharedCount(tmp1)" };
    PCSharedCount_ctor_fromBase(tempCount1, shared_base_arg); // @0x0a6cb1

    // Growth policy (exact from asm):
    const cap: number = this._arrayCap | 0;
    const size: number = this._arraySize | 0;
    const newCount: number = (size + 1) | 0; // @0x0a6cbc
    let newCap: number = ((size * 2 + 3) | 0); // @0x0a6cc1 (lea 0x3(%rcx,%rcx))
    if (size < cap) newCap = cap; // @0x0a6cc5 cmovl

    // Resize the array — throws until PCArray::resize is ported:
    PCArray_PCPtr_LiImageFilter_resize(this, newCap, newCount); // @0x0a6ccb

    // Post-resize field re-read:
    // The store `data[size].raw = filter` — the asm computes an address that
    // is `data + (size << 4) - 0x10`, i.e. exactly `&data[size].raw`. Since
    // resize already grew size to newCount = size+1, `data[size]` refers to
    // the NEW slot (index = old size).
    //
    // We can't safely mutate the (opaque) buffer without a PCArray impl, so
    // we just record the operation would happen here.
    // Note: this write is @0x0a6ce0; PCArray's resize is the actual gate.

    // Construct tempCount2 as a copy of tempCount1:
    const tempCount2: unknown = { _kind: "PCSharedCount(tmp2)" };
    PCSharedCount_ctor_copy(tempCount2, tempCount1); // @0x0a6cec

    // slot[size].sharedCount = tempCount2:
    PCSharedCount_assign(/* &data[size].sharedCount */ null, tempCount2); // @0x0a6cff

    // Destruct the two temporaries in the exact asm order:
    PCSharedCount_dtor(tempCount2); // @0x0a6d08
    PCSharedCount_dtor(tempCount1); // @0x0a6d10

    // Wire up any newly appended filter into the chain:
    LiImageFilterChain_connect(this); // @0x0a6d18

    // Book-keep the local mirror of size for the JS side:
    this._arraySize = newCount;
    this._arrayCap = Math.max(cap, newCap);
  }

  /**
   * @0x51ac00  LiImageFilterChain::~LiImageFilterChain()
   *
   * Exact asm mirror:
   *   rdi  = this + 0x10                                        @0x51ac09
   *   ; reinstall the array subobject's vtable:
   *   this->arrayVptr = &vtable + 0x10                          @0x51ac0d..18
   *   eax = this->cap                                            @0x51ac1c
   *   edx = (eax < 0) ? 1 : eax                                  @0x51ac1f..29
   *   esi = 0
   *   PCArray<...>::resize(edx, 0)                               @0x51ac2b
   *   rdi = this->data
   *   if (rdi) operator delete[](rdi)                            @0x51ac34..39
   *   this->data = nullptr                                       @0x51ac3e
   *   this->cap  = 0                                             @0x51ac46
   *   ; tail-call PCSharedCount::~PCSharedCount(this + 0x08):
   *   rbx += 0x8                                                 @0x51ac4d
   *   jmp __ZN13PCSharedCountD1Ev                                 @0x51ac5a
   */
  destroy(): void {
    // @0x51ac0d..18: reinstall vtable pointer for the PCArray subobject.
    this._arrayVptr = PCArray_PCPtr_LiImageFilter_VTABLE;

    // @0x51ac1c..29: edx = cap<0 ? 1 : cap  (a defensive guard against
    // negative capacity — cmovnsl copies eax into edx if eax >= 0).
    const capRaw: number = this._arrayCap | 0;
    const edx: number = capRaw < 0 ? 1 : capRaw;

    // @0x51ac2b: resize(edx, 0) — shrink to zero, freeing per-element state.
    PCArray_PCPtr_LiImageFilter_resize(this, edx, 0);

    // @0x51ac30..39: free the raw buffer (if non-null).
    if (this._arrayData != null) {
      operator_delete_array(this._arrayData); // @0x51ac39
    }
    this._arrayData = null; // @0x51ac3e
    this._arrayCap = 0; // @0x51ac46 (also zeroes size implicitly via resize)
    this._arraySize = 0;

    // @0x51ac5a: tail-call PCSharedCount dtor on subobject at this+0x08.
    PCSharedCount_dtor(this._sharedCount);
  }
}
