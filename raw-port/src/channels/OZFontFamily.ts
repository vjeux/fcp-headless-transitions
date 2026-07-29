// OZFontFamily — Ozone.framework font-family container: name + display-name + a list of typefaces.
//
// Faithful transcription of Ozone::OZFontFamily (8 methods @ 0x639ad0..0x639f16, sizeof=0x28).
// The class holds two PCString names and a std::vector<std::shared_ptr<Li3DEngineObjectData>> of
// typeface handles. Each Li3DEngineObjectData carries at least two PCString name fields (a
// typeface name at +0x08 and a PostScript-name at +0x10) — recovered from the different compare
// offsets in getTypeface/getTypefaceIndex (both @+0x08) vs containsFont (@+0x10).
//
// Struct layout (recovered from OZFontFamily::OZFontFamily @0x639b20 + D1 dtor @0x639c00 +
// getTypeface(int) @0x639c90):
//   +0x00  PCString familyName          — from ctor arg1 via __ZN8PCStringC1ERKS_ @0x639b2d
//   +0x08  PCString displayName         — from ctor arg2 via __ZN8PCStringC1ERKS_ @0x639b39
//   +0x10  Li3DEngineObjectData** _M_start   — xmm0-zeroed by ctor @0x639b41 (movups)
//   +0x18  Li3DEngineObjectData** _M_finish  — xmm0-zeroed by ctor @0x639b41 (movups high half)
//   +0x20  Li3DEngineObjectData** _M_cap     — zeroed by ctor @0x639b45 (movq $0)
//
// Vector element = std::shared_ptr<Li3DEngineObjectData> (16-byte stride @0x639c90 shrq $0x4):
//   entry+0x0:  Li3DEngineObjectData*   dataPtr
//   entry+0x8:  __shared_weak_count*    ctrlPtr    (nullptr means "not shared")
//
// Li3DEngineObjectData layout (partial — recovered from OZFontFamily reads only):
//   +0x00  vtable
//   +0x08  PCString  typefaceName   — compared in getTypeface(PCString)/getTypefaceIndex
//   +0x10  PCString  postScriptName — compared in containsFont
//
// Sibling classes (undecoded — throw with @0xADDR per PORTING_SPEC Rule 3):
//   PCString                              (infra type — opaque handle here)
//   Li3DEngineObjectData                  (typeface record — opaque, referenced via shared_ptr)
//   OZFontFace / OZCoreTextTypeface       (concrete typeface classes — not touched by this class)
//
// Decode evidence (raw-port/re/disasm/):
//   OZFontFamily.OZFontFamily.s          C1 @0x639b20, 24 lines
//   OZFontFamily.~OZFontFamily.s         D1 @0x639c00, 47 lines (vector-of-shared_ptr release)
//   OZFontFamily.getTypeface.s           by-name overload @0x639cd0, 63 lines
//   Ozone otool dump getTypeface(int)    @0x639c90, 27 lines (embedded)
//   OZFontFamily.getTypefaceIndex.s      @0x639d90, 67 lines
//   OZFontFamily.containsFont.s          @0x639e60, ~57 lines (otool tV bleeds after retq @0x639f16)

// ─── Opaque handle types (undecoded siblings — kept nominal) ──────────────────────────

/** PCString — opaque handle to Apple's PCString value type. */
export interface PCString { readonly __pcString: true; }

/** Li3DEngineObjectData — opaque; only its typeface-name @+0x08 and PS-name @+0x10 are read. */
export interface Li3DEngineObjectData {
  /** vtable slot — not consulted here beyond `(*vtable)[+0x10]` in shared_ptr destroy paths. */
  readonly __li3DEngineObjectData: true;
}

/** std::__1::__shared_weak_count* — libc++ shared_ptr control block. */
export interface SharedWeakCount { readonly __sharedWeakCount: true; }

/** shared_ptr<Li3DEngineObjectData> — a 16-byte pair {dataPtr, ctrlPtr}. */
export interface Li3DShared {
  data: Li3DEngineObjectData | null;   // entry+0x00
  ctrl: SharedWeakCount   | null;      // entry+0x08
}

// ─── Frontier callees (undecoded — throw per Rule 3 citing @0xADDR) ──────────────────

/**
 * PCString::PCString(PCString const&)  — copy ctor.
 *   Called by OZFontFamily::OZFontFamily @0x639b2d (family) and @0x639b39 (displayName)
 *   via `callq __ZN8PCStringC1ERKS_` (stub 0x6df0ba).
 */
function PCString_ctor_copy(_dst: PCString, _src: PCString): void {
  throw new Error(
    "PCString::PCString(PCString const&) @Ozone 0x639b2d / 0x639b39 (stub 0x6df0ba) " +
    "not yet transcribed",
  );
}

/**
 * PCString::~PCString()
 *   Called by OZFontFamily::~OZFontFamily @0x639c79 (displayName) and jmp @0x639c89 (family),
 *   and by the ctor unwind path @0x639b58 (stub 0x6df0c6).
 */
function PCString_dtor(_s: PCString): void {
  throw new Error(
    "PCString::~PCString() @Ozone 0x639c79 / 0x639c89 (stub 0x6df0c6) not yet transcribed",
  );
}

/**
 * PCString::compare(PCString const&) const  — returns 0 iff equal (strcmp-style).
 *   Called by getTypeface @0x639d2a, getTypefaceIndex @0x639de2, containsFont @0x639eb2
 *   (stub 0x6dfa50).
 */
function PCString_compare(_a: PCString, _b: PCString): number {
  throw new Error(
    "PCString::compare(PCString const&) const @Ozone 0x639d2a / 0x639de2 / 0x639eb2 " +
    "(stub 0x6dfa50) not yet transcribed",
  );
}

/**
 * std::__1::__shared_weak_count::__release_weak()
 *   Called by every shared_ptr temporary decref in the by-name accessors (getTypeface @0x639d56,
 *   getTypefaceIndex @0x639e10, containsFont @0x639ee5) after the last-strong-ref virtual dispatch
 *   through `(*(*ctrl))[+0x10]` (destroy the pointee). Stub 0x6dfbbe.
 */
function shared_weak_count_release_weak(_ctrl: SharedWeakCount): void {
  throw new Error(
    "std::__shared_weak_count::__release_weak() @Ozone 0x639d56 / 0x639e10 / 0x639ee5 " +
    "(stub 0x6dfbbe) not yet transcribed",
  );
}

/**
 * `(*(*ctrl))[+0x10]` — the destroy-pointee virtual slot on __shared_weak_count.
 *   Fired when the last strong reference is dropped (xaddq returned 0). Call sites:
 *     ~OZFontFamily          @0x639c5b   (element cleanup)
 *     getTypeface(PCString)  @0x639d50
 *     getTypefaceIndex       @0x639e0a
 *     containsFont           @0x639edf
 */
function shared_weak_count_destroy(_ctrl: SharedWeakCount): void {
  throw new Error(
    "__shared_weak_count vtable slot +0x10 (destroy pointee) @Ozone 0x639c5b / 0x639d50 / " +
    "0x639e0a / 0x639edf not yet transcribed",
  );
}

/**
 * std::__1::shared_ptr<Li3DEngineObjectData>::~shared_ptr[abi:nqe210106]()
 *   Local temporary shared_ptr dtor used in the unwind paths of getTypeface (@0x639d7b),
 *   getTypefaceIndex (@0x639e48), containsFont (@0x639f1e).
 */
function shared_ptr_Li3D_dtor(_sp: Li3DShared): void {
  throw new Error(
    "std::shared_ptr<Li3DEngineObjectData>::~shared_ptr @Ozone 0x639d7b / 0x639e48 / 0x639f1e " +
    "not yet transcribed",
  );
}

// ─── Decoded helpers (transcribed inline from repeated asm patterns) ─────────────────

/**
 * `shared_ptr<T> tmp = *iter;`  — increment strong ref on ctrl block if non-null.
 *   Faithful to the emitted lock-inc @0x639d1e (getTypeface), @0x639dd6 (getTypefaceIndex),
 *   @0x639ea6 (containsFont): `lock incq 0x8(%r15)`.
 *   The ctrl block's strong-count field is at +0x08 (matches the `xaddq %rax, 0x8(%r14)` in D1
 *   @0x639c4b).
 */
function shared_ptr_load_lockInc(entry: Li3DShared): Li3DShared {
  const tmp: Li3DShared = { data: entry.data, ctrl: entry.ctrl };
  if (tmp.ctrl !== null) {
    // lock incq 0x8(ctrl)  — model-only; no atomic in the TS mirror. The count is opaque here.
    // The oracle path (once shared_ptr's ctrl is decoded) will make this bit-exact.
  }
  return tmp;
}

/**
 * `~shared_ptr(&tmp);`  — decrement strong ref; if it hit zero, dispatch destroy + release_weak.
 *   Faithful to the emitted decrement-then-branch pattern @0x639d38..0x639d5b (getTypeface),
 *   @0x639df3..0x639e15 (getTypefaceIndex), @0x639ec9..0x639eea (containsFont), which all read:
 *     movq $-1, %rax; lock xaddq %rax, 0x8(ctrl); testq %rax, %rax; jne <skip>
 *     movq (ctrl), %rax; movq ctrl, %rdi; callq *0x10(%rax)                  // destroy pointee
 *     movq ctrl, %rdi; callq __release_weak                                   // stub 0x6dfbbe
 * When rax was 1 before decrement (last strong ref) the fetch-add returns 1 -> testq zero -> take
 * the destroy path. This matches libc++'s __shared_ptr_pointer::__on_zero_shared.
 */
function shared_ptr_release(tmp: Li3DShared): void {
  if (tmp.ctrl === null) return;
  // In the C++, `lock xaddq $-1, 0x8(ctrl)` yields the OLD count; if OLD==1, the new count is 0
  // and we destroy. The TS mirror can't observe libc++'s atomic — we throw when the runtime
  // reaches this branch so the caller cannot pretend to have decoded shared_ptr semantics.
  shared_weak_count_destroy(tmp.ctrl);         // callq *0x10(vtable) @0x639d50 / 0x639e0a / 0x639edf
  shared_weak_count_release_weak(tmp.ctrl);    // callq __release_weak @0x639d56 / 0x639e10 / 0x639ee5
}

// ─── OZFontFamily ─────────────────────────────────────────────────────────────────────

/**
 * Read a PCString field from an opaque Li3DEngineObjectData at the given byte offset. In the
 * C++ this is `data + offset` treated as `PCString*`; in TS we can't dereference by byte so
 * we throw — the caller sites still cite the correct @0xADDR + offset.
 */
function Li3D_getPCStringField(_data: Li3DEngineObjectData, offset: 0x08 | 0x10): PCString {
  throw new Error(
    `Li3DEngineObjectData PCString field @+0x${offset.toString(16)} — layout not yet transcribed ` +
    `(callers: getTypeface @0x639d23 (+0x08), getTypefaceIndex @0x639ddb (+0x08), ` +
    `containsFont @0x639eab (+0x10))`,
  );
}

export class OZFontFamily {
  /** familyName (PCString) at struct offset +0x00. */
  familyName: PCString;
  /** displayName (PCString) at struct offset +0x08. */
  displayName: PCString;
  /** std::vector<shared_ptr<Li3DEngineObjectData>> at +0x10..+0x27. */
  private typefaces: Li3DShared[] = [];

  /**
   * OZFontFamily::OZFontFamily(PCString const&, PCString const&)  C1/C2
   *   @Ozone 0x639ad0 (C2) / 0x639b20 (C1), 24 lines.
   *     callq PCString::PCString(&familyName, arg1)     @0x639b2d
   *     callq PCString::PCString(&displayName, arg2)    @0x639b39
   *     xorps + movups 0x10(%rbx)                        @0x639b41 (zeros _start,_finish)
   *     movq $0, 0x20(%rbx)                              @0x639b45 (zeros _cap)
   * Unwind path @0x639b52..0x639b60: if the SECOND PCString ctor threw, roll back the FIRST via
   * `callq PCString::D1(&familyName)` then `_Unwind_Resume`. In TS the two copies are a plain
   * assignment, so no unwind is emitted.
   */
  constructor(family: PCString, displayName: PCString) {
    // Faithful copy-ctor calls to PCString::PCString(PCString const&) — will throw until PCString
    // itself is transcribed. We do the field assignments too so the object shape matches.
    this.familyName = family;
    PCString_ctor_copy(this.familyName, family);          // @0x639b2d — throws frontier
    this.displayName = displayName;
    PCString_ctor_copy(this.displayName, displayName);    // @0x639b39 — throws frontier
    // xorps xmm0,xmm0 ; movups xmm0, 0x10(rbx) ; movq $0, 0x20(rbx)  @0x639b3e..0x639b45
    this.typefaces = [];
  }

  /**
   * OZFontFamily::~OZFontFamily()  D1 (also called through D2 slot @0x639b70 — ICF-shared with D1).
   *   @Ozone 0x639c00, 47 lines.
   *   Body:
   *     r15 = _M_start; if (r15 == null) skip vector cleanup                @0x639c0e/0x639c15
   *     r12 = _M_finish
   *     loop: r12 -= 0x10; if r12 == r15 -> done                             @0x639c30/0x639c34
   *           r14 = *(r12 - 0x8) = ctrl                                       @0x639c39
   *           if ctrl==0 -> next                                              @0x639c3e/0x639c41
   *           lock xaddq $-1, 0x8(ctrl)   ; if oldCount != 1 -> next          @0x639c43..0x639c53
   *           (*ctrl)[+0x10]() ; __release_weak(ctrl)                          @0x639c55..0x639c66
   *     free (_M_start)                                                       @0x639c68/0x639c70
   *     PCString::~PCString(&displayName)                                     @0x639c79
   *     jmp PCString::~PCString(&familyName)                                  @0x639c89 (tail)
   *   Order matters: typeface vector is torn down FIRST, then the two PCString members in
   *   REVERSE construction order (displayName then family).
   */
  destruct(): void {
    // Walk the vector from finish-1 down to start, releasing each shared_ptr's ctrl block.
    // Faithful to the reverse-loop @0x639c30..0x639c66.
    for (let i = this.typefaces.length - 1; i >= 0; i--) {
      const entry = this.typefaces[i]!;
      if (entry.ctrl !== null) {
        // lock xaddq $-1, 0x8(ctrl) — throws (frontier); models the "last-ref hit zero" branch.
        shared_ptr_release(entry);
      }
    }
    // operator delete(_M_start)  @0x639c70 — no-op in TS.
    this.typefaces = [];
    // Reverse-order member dtors: displayName first (call @0x639c79), then familyName (tail-jmp
    // @0x639c89). Both throw as PCString isn't yet transcribed.
    PCString_dtor(this.displayName);   // @0x639c79
    PCString_dtor(this.familyName);    // @0x639c89 (tail-jmp)
  }

  /**
   * OZFontFamily::getTypeface(int) const   — indexed accessor.
   *   @Ozone 0x639c90, 27 lines. Returns shared_ptr<Li3DEngineObjectData> (aggregate return in
   *   the first hidden arg — modelled here as a normal return).
   *     count = (_M_finish - _M_start) / 16                                    @0x639c9f..0x639ca2
   *     clampedIdx = min(idx, count-1)                                          @0x639ca6..0x639caa
   *                  (SIGNED cmp — negative idx passes through the cmovll, becoming a poison
   *                   read of vec[idx]; Apple's code trusts the caller not to pass negative.)
   *     entry = _M_start[clampedIdx]                                             @0x639cb4/0x639cb9
   *     copy the {dataPtr, ctrlPtr} pair via `movups xmm0, (rax)`               @0x639cbd
   *     if (ctrl != null) lock incq 0x8(ctrl)                                    @0x639cc0..0x639cc6
   *   returns the copy.
   */
  getTypefaceByIndex(idx: number): Li3DShared {
    // count = (_M_finish - _M_start) / 16  — vector size.  @0x639c9f..0x639ca2
    const count = this.typefaces.length;
    // signed clamp: min(idx, count-1)  — decl %ecx; cmpl %ecx, %edx; cmovll %edx, %ecx  @0x639ca6..0x639caa
    // (Note: no lower-bound clamp in the asm; matches Apple's caller-trust contract.)
    let clamped = count - 1;
    if (idx < clamped) clamped = idx;
    const entry = this.typefaces[clamped]!;
    // `movups (rdi,rdx), %xmm0 ; movups %xmm0, (rax)` — 16-byte struct copy of {data,ctrl}.
    const out: Li3DShared = { data: entry.data, ctrl: entry.ctrl };
    if (out.ctrl !== null) {
      // lock incq 0x8(ctrl)  @0x639cc5 — refcount bump, throws-through decode-frontier via helper.
      shared_ptr_load_lockInc(entry);
    }
    return out;
  }

  /**
   * OZFontFamily::getTypeface(PCString const&) const   — by-name accessor.
   *   @Ozone 0x639cd0, 63 lines. Aggregate return: the OZChanElementRef-style hidden first-arg
   *   result pointer is populated with the matching shared_ptr, or a zeroed pair if no match.
   *   Loop @0x639d09..0x639d5b:
   *     for iter=_M_start; iter!=_M_finish; iter+=0x10:
   *       tmp = *iter                                     @0x639d09..0x639d15
   *       if (tmp.ctrl) lock incq 0x8(tmp.ctrl)           @0x639d1e/0x639d1f
   *       cmp = PCString::compare(&(*data)[+0x8], name)   @0x639d2a
   *       if (cmp == 0) -> success (return tmp WITHOUT decref)  @0x639d31/0x639d63
   *       else -> release tmp, continue                    @0x639d38..0x639d5b
   *   No-match branch @0x639d5d: xorps + movups zero -> return {null,null}.
   *   Compare offset is +0x08 (the typeface name field on Li3DEngineObjectData).
   */
  getTypefaceByName(name: PCString): Li3DShared {
    // r12 = _M_start; r13 = _M_finish  @0x639ce1/0x639ce5
    // Iterate elements 16 bytes apart.
    for (let i = 0; i < this.typefaces.length; i++) {
      const entry = this.typefaces[i]!;
      // tmp = *iter ; if (tmp.ctrl) inc  @0x639d09..0x639d1f
      const tmp = shared_ptr_load_lockInc(entry);
      // PCString::compare(&data[+0x8], name)   @0x639d2a
      const cmp = tmp.data === null
        ? 1  // null data compares un-equal (no field to read); mirrors Apple's UB-not-taken path
        : PCString_compare(Li3D_getPCStringField(tmp.data, 0x08), name);
      if (cmp === 0) {
        // Match: return tmp with refcount HELD (no release).  @0x639d31 -> 0x639d63
        return tmp;
      }
      // No match: release tmp and continue.  @0x639d38..0x639d5b
      shared_ptr_release(tmp);
    }
    // Fall-through no-match  @0x639d5d: return {null,null}.
    return { data: null, ctrl: null };
  }

  /**
   * OZFontFamily::getTypefaceIndex(PCString const&) const  — returns 0-based index or 0 if missing.
   *   @Ozone 0x639d90, 67 lines. Same iteration shape as getTypefaceByName but yields uint32
   *   index. `ebx` counter starts at 0 (@0x639db5 `xorl %ebx, %ebx`), increments on non-match
   *   (@0x639e27 `incl %ebx`). On the no-match fall-through @0x639e2e it's re-zeroed
   *   (`xorl %ebx, %ebx`) — Apple deliberately returns 0 for "not found" AND for "matched at
   *   index 0" (indistinguishable). Callers must call containsFont first when 0 is ambiguous.
   *   Compare offset is +0x08.
   */
  getTypefaceIndex(name: PCString): number {
    let idx = 0;  // xorl %ebx, %ebx  @0x639db5
    for (let i = 0; i < this.typefaces.length; i++) {
      const entry = this.typefaces[i]!;
      const tmp = shared_ptr_load_lockInc(entry);   // @0x639dc0..0x639dd7
      const cmp = tmp.data === null
        ? 1
        : PCString_compare(Li3D_getPCStringField(tmp.data, 0x08), name); // @0x639de2
      // Release temp (both branches).  @0x639dec..0x639e15
      shared_ptr_release(tmp);
      if (cmp === 0) {
        // Match — jump to return path  @0x639e21 -> 0x639e30
        return idx;
      }
      idx = (idx + 1) | 0;    // incl %ebx  @0x639e27
    }
    // No match fall-through @0x639e2e: xorl %ebx,%ebx (Apple's return-0-for-missing).
    return 0;
  }

  /**
   * OZFontFamily::containsFont(PCString const&) const   — bool test.
   *   @Ozone 0x639e60, ~57 lines (real body ends at retq @0x639f16; otool -tV bleeds after that
   *   into an unrelated Objc method — DO NOT read past 0x639f26).
   *   Loop @0x639e90..0x639efe:
   *     tmp = *iter ; if (tmp.ctrl) inc                                @0x639e90..0x639ea7
   *     cmp = PCString::compare(&(*data)[+0x10], name)                 @0x639eb2   (OFFSET +0x10 — the POSTSCRIPT NAME)
   *     r14b = (cmp == 0) ? 1 : 0                                      @0x639eb9 `sete %r14b`
   *     release tmp                                                     @0x639ebd..0x639eea
   *     if (cmp != 0) continue else break                              @0x639ef3/0x639ef5
   *   Empty-list branch @0x639f02: r14 = 0.
   *   Return: r14b as int.  @0x639f05
   *   NOTE: unlike getTypeface(name), the compare offset is +0x10 (PostScript name), not +0x08.
   *   This is why containsFont can succeed where getTypeface(name) fails and vice-versa.
   */
  containsFont(psName: PCString): boolean {
    // Empty-list short-circuit  @0x639e79..0x639e7c (cmpq %r13,%r12 ; je 0x639f02).
    if (this.typefaces.length === 0) return false;   // xorl %r14d,%r14d @0x639f02
    let matched = false;   // r14b — sete result
    for (let i = 0; i < this.typefaces.length; i++) {
      const entry = this.typefaces[i]!;
      const tmp = shared_ptr_load_lockInc(entry);    // @0x639e90..0x639ea7
      const cmp = tmp.data === null
        ? 1
        : PCString_compare(Li3D_getPCStringField(tmp.data, 0x10), psName);  // OFFSET +0x10  @0x639eb2
      matched = (cmp === 0);                          // sete %r14b @0x639eb9
      shared_ptr_release(tmp);                        // both branches  @0x639ebd..0x639eea
      if (matched) break;                             // testl %eax,%eax ; je 0x639f05  @0x639ef3
    }
    return matched;                                   // movl %r14d, %eax  @0x639f05
  }
}
