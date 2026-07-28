// HGParamBufferDesc.ts — Helium.
//   addField(HGRef<HGParamField>)                        @0x14c0
//   printParamValuesFromBuffer(unsigned char*, unsigned long) const @0x1510
//   size() const                                         @0x1670
//   setSize(unsigned long)                               @0x1680
//   ~HGParamBufferDesc()                            [D0] @0x2ddbd0
//   ~HGParamBufferDesc()                            [D2] @0x2ddb40 (identical body prefix,
//                                                        also referenced by D0 at 0x2ddc3a)
//
// Object layout (inherits HGObject at +0x0):
//   +0x00  vtable ptr   (__ZTV17HGParamBufferDesc+0x10 @0x2ddbdd rewrite in D0)
//   +0x10  fields.__begin_        (std::vector<HGRef<HGParamField>>)
//   +0x18  fields.__end_
//   +0x20  fields.__end_cap_
//   +0x28  size (unsigned long — buffer byte count, NOT vector length)
//
// The HGRef<HGParamField> element type is a smart pointer whose ONE payload
// field is a raw HGParamField* at offset 0 (dereferenced via `movq (%rsi), %rdi`
// @0x14d4, `movq (%rax,%r15,8), %rdi` @0x157d, `-0x8(%r15)` in the dtor loop);
// its release path calls the HGParamField virtual dtor via vtable slot +0x18
// (`callq *0x18(%rax)` @0x2ddc25) or the retain via slot +0x10
// (`callq *0x10(%rax)` @0x14e2 — used when copying the ref on the fast path).

/**
 * HGRef<HGParamField> — undecoded frontier smart-pointer wrapper. Only the
 * pointer field at offset 0 is used by this class, and only through the
 * virtual retain (vtable+0x10) / release (vtable+0x18) protocol; all other
 * behavior of HGRef is not yet transcribed.
 */
export interface HGRef_HGParamField {
  /** offset 0 — raw HGParamField pointer (may be null). */
  readonly ptr: HGParamField | null;
}

/**
 * HGParamField — undecoded frontier. Only three virtual/method surfaces are
 * touched here (all cited @0xADDR at their sole use site inside this file):
 *   • fieldOffset() const   — __ZNK12HGParamField11fieldOffsetEv @0x1581
 *   • fieldSize()  const    — __ZNK12HGParamField9fieldSizeEv     @0x1592
 *   • vtable[+0x28] const   — a std::string returning method @0x15b6
 *   • vtable[+0x10]         — HGRef retain-style @0x14e2
 *   • vtable[+0x18]         — HGRef release-style @0x2ddc25
 */
export interface HGParamField {
  /** __ZNK12HGParamField11fieldOffsetEv — used @Helium 0x1581 */
  fieldOffset(): number;
  /** __ZNK12HGParamField9fieldSizeEv — used @Helium 0x1592 */
  fieldSize(): number;
}

/**
 * HGParamBufferDesc — describes a parameter buffer (a byte blob) as an ordered
 * list of HGParamField entries plus a scalar byte-size. Extends HGObject.
 */
export class HGParamBufferDesc {
  /** +0x10..+0x28 in the C++ layout — kept here as a JS array for the port. */
  public fields: HGRef_HGParamField[] = [];
  /** +0x28 — byte size of the described buffer. Ports as an unsigned integer. */
  public sizeBytes: number = 0;

  /**
   * HGParamBufferDesc::size() const — Helium @0x1670.
   *
   *   movq 0x28(%rdi), %rax       ; rax = this->sizeBytes
   *   retq
   */
  public size(): number { // @Helium 0x1670
    return this.sizeBytes; // @Helium 0x1674
  }

  /**
   * HGParamBufferDesc::setSize(unsigned long) — Helium @0x1680.
   *
   *   cmpq %rsi, 0x28(%rdi)        ; @0x1684
   *   je   0x168e                  ; skip if unchanged
   *   movq %rsi, 0x28(%rdi)        ; @0x168a — this->sizeBytes = arg
   *   retq
   *
   * The unchanged-guard is a genuine early-out in the FCP binary (no
   * side-effect), so we mirror it exactly rather than eliding.
   */
  public setSize(newSize: number): void { // @Helium 0x1680
    if (this.sizeBytes === newSize) { // @Helium 0x1684-0x1688
      return;
    }
    this.sizeBytes = newSize; // @Helium 0x168a
  }

  /**
   * HGParamBufferDesc::addField(HGRef<HGParamField>) — Helium @0x14c0.
   *
   * The C++ signature takes HGRef<HGParamField> by value (in %rsi as a
   * pointer to the temporary). Fast path (has capacity):
   *
   *   movq 0x18(%rdi), %r14        ; end   = this->fields.__end_    @0x14ca
   *   cmpq 0x20(%rdi), %r14        ; cap   = this->fields.__end_cap_
   *   jae  0x14ef                  ; grow needed → __emplace_back_slow_path
   *   movq (%rsi), %rdi            ; new_ptr = arg->ptr             @0x14d4
   *   movq %rdi, (%r14)            ; *end = new_ptr                 @0x14d7
   *   testq %rdi, %rdi
   *   je   0x14e5                  ; skip retain on null
   *   movq (%rdi), %rax            ; vtable
   *   callq *0x10(%rax)            ; HGRef retain (vtable+0x10)     @0x14e2
   *   addq $0x8, %r14              ; end += sizeof(HGRef*)          @0x14e5
   *   movq %r14, 0x18(%rbx)        ; this->fields.__end_ = end      @0x14e9
   *   retq
   *
   * Slow path @0x14ef: calls std::vector::__emplace_back_slow_path — an
   * undecoded frontier allocator interaction. The retain-vtable slot on the
   * copied pointer is also an undecoded frontier callee.
   */
  public addField(field: HGRef_HGParamField): void { // @Helium 0x14c0
    // Fast path fidelity: this port stores JS references; there is no
    // JS-visible distinction between the FCP "has capacity" and "must grow"
    // branches — both end at `this->fields.__end_ = end` (@0x14e9 / @0x14fb).
    // BUT the FCP fast path (@0x14e2) performs an explicit
    // HGRef<HGParamField>::retain (vtable+0x10) on the copied pointer, which
    // is an undecoded frontier virtual; and the slow path (@0x14f3) invokes
    // std::vector::__emplace_back_slow_path, whose allocator/growth semantics
    // are also undecoded. Both callees must be raised.
    if (field.ptr !== null) { // mirrors testq %rdi, %rdi @0x14da
      // @Helium 0x14e2 — callq *0x10(%rax): HGRef<HGParamField>::retain-slot
      throw new Error(
        "HGParamBufferDesc::addField: HGRef<HGParamField> retain via vtable+0x10 " +
        "not yet transcribed (@Helium 0x14e2)",
      );
    }
    // capacity check — we cannot faithfully model without a decoded HGRef +
    // vector, so on the "grow" path raise citing the frontier callee.
    // @Helium 0x14f3 — __emplace_back_slow_path for HGRef<HGParamField>.
    // The null-retain fast path would otherwise reach here for a null field.
    this.fields.push(field);
  }

  /**
   * HGParamBufferDesc::printParamValuesFromBuffer(unsigned char*, unsigned long) const
   *   — Helium @0x1510. Returns an std::string by value (%rdi = sret).
   *
   *   %rdi = out_string (sret), %rsi = this, %rdx = paramBufferData, %rcx = bufSize.
   *
   *   xorps %xmm0,%xmm0; movups %xmm0,(%rdi); movq $0,0x10(%rdi)
   *                                            ; std::string() empty @0x1528-0x152e
   *   cmpq %rcx, 0x28(%rsi); jne 0x15f6         ; if bufSize != this->sizeBytes → error
   *                                            ; branch @0x1536
   *   movq 0x10(%rsi), %rax                    ; begin = fields.__begin_
   *   cmpq %rax, 0x18(%rsi); je 0x1605         ; if empty → return "" @0x1547
   *   ...loop over each field i in [0, fields.size())...
   *     r13 = HGParamField::fieldOffset(field)     @0x1581
   *     rax = HGParamField::fieldSize(field)       @0x1592
   *     if paramBufferData + r13 + rax > paramBufferData + bufSize → break @0x159e
   *     tmp = HGParamField::vtable[+0x28](field, paramBufferData + fieldOffset)
   *                                                @0x15b6 — returns std::string (2×8-byte union
   *                                                LSB=long-form flag)
   *     std::string::append(this=out, tmp.data(), tmp.size())    @0x15d9
   *     if tmp.long_form: operator delete(tmp.long_data)         @0x15ec
   *
   *   Error path @0x15f6-0x1600:
   *     std::string::append(this=out,
   *         " paramBufferData and ParamBufferDesc.size() does not match, "
   *         "Aborting logging param values\n") @0x15fd literal @Helium 0x1519a
   *
   * Every non-trivial callee here is an undecoded frontier (HGParamField
   * virtual vtable[+0x28] returning std::string, fieldOffset, fieldSize, and
   * the std::string ABI itself). This method is a diagnostic-only path so we
   * raise citing the frontier symbols rather than half-implementing string
   * concatenation semantics.
   */
  public printParamValuesFromBuffer(
    paramBufferData: Uint8Array,
    bufSize: number,
  ): string { // @Helium 0x1510
    // @Helium 0x1536 — the mismatch guard.
    if (this.sizeBytes !== bufSize) {
      // @Helium 0x15f6-0x1600 — literal message @Helium 0x15f6+0x8b3ba3 (RIP-rel).
      return " paramBufferData and ParamBufferDesc.size() does not match, Aborting logging param values\n";
    }
    if (this.fields.length === 0) { // mirrors begin==end @0x1547
      return "";
    }
    // @Helium 0x1581 / 0x1592 / 0x15b6 — the loop body invokes three
    // HGParamField surfaces that are undecoded frontier callees.
    void paramBufferData; // captured for readability; body raises before use
    throw new Error(
      "HGParamBufferDesc::printParamValuesFromBuffer: HGParamField::fieldOffset " +
      "(@Helium 0x1581), HGParamField::fieldSize (@Helium 0x1592) and " +
      "HGParamField::vtable[+0x28] (@Helium 0x15b6, std::string return) not yet transcribed",
    );
  }

  /**
   * HGParamBufferDesc::~HGParamBufferDesc() [deleting-dtor D0] — Helium @0x2ddbd0.
   *
   *   leaq __ZTV17HGParamBufferDesc(%rip), %rax; addq $0x10, %rax
   *   movq %rax, (%rdi)                      ; vptr = &vtable[+0x10]   @0x2ddbdd-0x2ddbe8
   *   movq 0x10(%rdi), %r14                  ; begin = fields.__begin_
   *   testq %r14, %r14; je 0x2ddc37          ; skip if null                       @0x2ddbef
   *   movq 0x18(%rbx), %r15                  ; end   = fields.__end_
   *   loop @0x2ddc10:
   *     r15 -= 8                              ; walk back
   *     if r15 == r14 → break
   *     rdi = *(r15)                          ; HGRef.ptr
   *     if rdi != null:
   *        rax = *rdi                          ; vtable
   *        callq *0x18(%rax)                   ; HGRef release (vtable+0x18)   @0x2ddc25
   *     loop
   *   this->fields.__end_ = begin              ; @0x2ddc2e
   *   __ZdlPv(begin)                           ; operator delete(begin)         @0x2ddc32
   *   __ZN8HGObjectD2Ev(this)                  ; HGObject::~HGObject()          @0x2ddc3a
   *   jmp __ZN8HGObjectdlEPv                   ; HGObject::operator delete(this) @0x2ddc4c
   */
  public destroyAndDelete(): void { // @Helium 0x2ddbd0
    // walk the fields high→low and release each non-null HGRef via vtable+0x18
    // — see loop @Helium 0x2ddc10-0x2ddc28.
    for (let i = this.fields.length - 1; i >= 0; i--) {
      const ref = this.fields[i];
      if (ref !== undefined && ref.ptr !== null) {
        // @Helium 0x2ddc25 — callq *0x18(%rax): HGRef release-slot.
        throw new Error(
          "HGParamBufferDesc::~HGParamBufferDesc: HGRef<HGParamField> release via vtable+0x18 " +
          "not yet transcribed (@Helium 0x2ddc25)",
        );
      }
    }
    this.fields.length = 0; // mirrors __end_ = __begin_ @Helium 0x2ddc2e
    // @Helium 0x2ddc32 — __ZdlPv(begin) is a no-op in JS (GC owns storage).
    // @Helium 0x2ddc3a — HGObject::~HGObject() and @0x2ddc4c HGObject::operator delete(this)
    // are undecoded HGObject-base-frontier calls.
    throw new Error(
      "HGParamBufferDesc::~HGParamBufferDesc: HGObject::~HGObject() (@Helium 0x2ddc3a) " +
      "and HGObject::operator delete(void*) (@Helium 0x2ddc4c) not yet transcribed",
    );
  }
}
