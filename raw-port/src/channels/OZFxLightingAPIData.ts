/**
 * OZFxLightingAPIData — thread-local scratch used by the FxPlug lighting API
 * to hold a resolved `PCArray<LiLight>*` of scene lights across the
 * begin/end access pair.
 *
 * Native class in Ozone.framework — see the four methods below. This port
 * ships the two fully-decoded methods (endAccess, numberOfLightsAtTime) and
 * throw-stubs the two large ObjC/dynamic_cast-heavy methods (beginAccess,
 * lightInfoForLightAtTime), citing @0xADDR for every undecoded external call.
 *
 * Instance layout observed:
 *   this[0x00] : uint8   accessActive          (@0x53ddd6, 0x53de79, 0x53deeb)
 *   this[0x08] : PCArray<LiLight>* lightsArray (@0x53dded/0x53de7c: nullable ptr)
 *   this[0x10] : int32   refCount              (@0x53de08/0x53de67/0x53de71)
 *
 * @classAddr Ozone 0x000000000053ddc0 (beginAccess),
 *                  0x000000000053de60 (endAccess),
 *                  0x000000000053dee0 (numberOfLightsAtTime),
 *                  0x000000000053df50 (lightInfoForLightAtTime).
 */

// ---------------------------------------------------------------------------
// Forward types kept opaque — the fully-transcribed methods do not
// dereference them.
// ---------------------------------------------------------------------------

/**
 * OZFxPlugSharedBase* — opaque host pointer. `numberOfLightsAtTime` reads
 * `this[0x00]` to gate on accessActive, and `lightInfoForLightAtTime` (see
 * @0x53df7b) reads `this[0x00]` too — but never touches OZFxPlugSharedBase
 * beyond the null check for numberOfLightsAtTime, so we keep it opaque.
 */
export interface OZFxPlugSharedBase {
  readonly __brand: "OZFxPlugSharedBase";
}

/**
 * OZRenderState — passed by const reference to beginAccess. Native code
 * forwards it as-is to OZGroup::returnFxPlugLights (see @0x53de25). This
 * port never dereferences it and keeps the type opaque.
 */
export interface OZRenderState {
  readonly __brand: "OZRenderState";
}

/**
 * FxTime — value type. numberOfLightsAtTime accepts it but the fully-decoded
 * fast path never reads its bytes (only the error path @0x53df07 calls
 * `[time_obj description]` through ObjC).
 */
export interface FxTime {
  readonly __brand: "FxTime";
}

/**
 * FxLightInfo — the C++/ObjC-visible output struct filled by
 * lightInfoForLightAtTime. Fields recovered from stores at r14+offset:
 *   +0x00 : uint64  lightSource      (from *(FxLightInfo*)->r14, +0x00 store not seen here)
 *   +0x08 : double  timeInFrames     (@0x53e057: `movsd xmm0, 0x8(%r14)`)
 *   +0x10 : uint64  kind             (@0x53e209: `movq rdx, 0x10(r14)` — derived from LiLight kind)
 *   +0x18 : id      colorNSColor     (@0x53e270)
 *   +0x20 : float   f32 field         (@0x53e281)
 *   +0x24 : double  x,y stored via cvtpd2ps → 2×float (@0x53e2fd)
 *   +0x2c : float   f32 field         (@0x53e310)
 *   +0x30 : uint8   flag             (@0x53e2a1)
 *   +0x34 : ...several more via similar packed doubles→floats stores...
 *
 * A full recovery of the field mapping requires resolving LiLight (Ozone)
 * and FxLightInfo (from FxPlug SDK) — not yet transcribed. This port keeps
 * the type opaque and the whole method as a throw-stub.
 */
export interface FxLightInfo {
  readonly __brand: "FxLightInfo";
}

/**
 * NSError** in the ObjC signature. Native code writes into `*outError`
 * via `movq %rax, (%rbx)` @0x53e1c9.
 */
export interface NSErrorOutParam {
  readonly __brand: "NSErrorOutParam";
}

// ---------------------------------------------------------------------------
// Frontier stubs — every one is a real, uncrossed subsystem boundary. All
// stubs cite the exact call address in Ozone so the demand signal is clean.
// ---------------------------------------------------------------------------

/**
 * `OZGroup::returnFxPlugLights(OZRenderState const&) const` — the actual
 * light-scanning implementation. Called by beginAccess @0x53de28 after a
 * `__dynamic_cast<OZGroup*>(scene_root)` succeeds. Returns a heap-allocated
 * `PCArray<LiLight>*` (size 0x20 bytes, alloc'd via `operator new(0x20)`
 * @0x53de17 and stored into `this[0x8]`).
 */
function OZGroup_returnFxPlugLights_stub(
  _mem: unknown,
  _self: unknown,
  _state: OZRenderState,
): unknown {
  // Not yet transcribed: OZGroup::returnFxPlugLights @Ozone symbol
  //   __ZNK7OZGroup18returnFxPlugLightsERK13OZRenderState
  // Called from beginAccess @0x000000000053de28.
  throw new Error(
    "OZFxLightingAPIData::beginAccess — OZGroup::returnFxPlugLights not yet " +
      "transcribed (Ozone @0x000000000053de28 call site)"
  );
}

// ---------------------------------------------------------------------------
// The class itself.
// ---------------------------------------------------------------------------

/**
 * OZFxLightingAPIData — plain-data struct, no vtable. Nested-access counter
 * pattern: `beginAccess` refcounts up, `endAccess` refcounts down, freeing
 * the cached `PCArray<LiLight>*` when the counter hits zero.
 */
export class OZFxLightingAPIData {
  /** `this[0x00]` — set to 1 by beginAccess @0x53ddd6, cleared to 0 by
   *  endAccess @0x53de79 when refCount transitions to zero. Used by
   *  numberOfLightsAtTime @0x53deeb and lightInfoForLightAtTime @0x53df7b
   *  as the "am I inside a begin/end pair" gate. */
  accessActive: boolean = false;

  /** `this[0x08]` — cached `PCArray<LiLight>*` from
   *  OZGroup::returnFxPlugLights. Allocated by `operator new(0x20)`
   *  @0x53de17, freed via array-delete + operator delete @0x53deb6/@0x53debe
   *  when refCount drops to zero in endAccess. Null before the first
   *  beginAccess and after the outermost endAccess. */
  lightsArray: unknown = null;

  /** `this[0x10]` — 32-bit nested-access refcount. Incremented at end of
   *  beginAccess (@0x53de34: `incl %ecx ; mov %ecx, 0x10(%rbx)`), decremented
   *  at start of endAccess (@0x53de6e: `leal -0x1(%rax), %ecx`). */
  refCount: number = 0;

  /**
   * beginAccess — @Ozone 0x000000000053ddc0.
   *
   * Native signature: `void beginAccess(OZFxPlugSharedBase* sharedBase,
   *                                    OZRenderState const& state)`.
   *
   * Decoded flow:
   *
   *   000000000053ddcb  testq  %rsi, %rsi
   *   000000000053ddce  je     0x53de39                ; if !sharedBase, exit
   *   000000000053ddd6  movb   $0x1, (%rdi)            ; this->accessActive = true
   *   000000000053ddd9  movq   (%rsi), %rax            ; load sharedBase vtable
   *   000000000053dddf  callq  *0x18(%rax)             ; sharedBase->vtable[3]() -> returns some obj
   *   000000000053dde2  movq   0x3b8(%rax), %rdi       ; obj->[0x3b8] = OZSceneNode* root
   *   000000000053ddec  je     0x53de39                ; if root == null, exit
   *   000000000053ddee  leaq   __ZTI11OZSceneNode(%rip), %rsi   ; src type
   *   000000000053ddf5  leaq   __ZTI7OZGroup(%rip),     %rdx   ; dst type
   *   000000000053ddfc  xorl   %ecx, %ecx
   *   000000000053ddfe  callq  ___dynamic_cast          ; dynamic_cast<OZGroup*>(root)
   *   000000000053de06  je     0x53de39                ; if null, exit
   *   000000000053de08  movl   0x10(%rbx), %ecx        ; ecx = this->refCount
   *   000000000053de0d  jne    0x53de34                ; if refCount != 0, skip alloc
   *   ; ---- fresh allocation ----
   *   000000000053de0f  movl   $0x20, %edi             ; sizeof(PCArray<LiLight>) = 0x20
   *   000000000053de17  callq  __Znwm                  ; operator new(0x20)
   *   000000000053de28  callq  OZGroup::returnFxPlugLights(state)   ; ctor-in-place
   *   000000000053de2d  movq   %r15, 0x8(%rbx)         ; this->lightsArray = new_ptr
   *   000000000053de31  movl   0x10(%rbx), %ecx        ; reload refCount
   *   ; ---- shared tail ----
   *   000000000053de34  incl   %ecx                    ; ++refCount
   *   000000000053de36  movl   %ecx, 0x10(%rbx)
   *   000000000053de39  <exit>
   *
   * @method Ozone 0x000000000053ddc0
   */
  beginAccess(sharedBase: OZFxPlugSharedBase | null, state: OZRenderState): void {
    if (sharedBase === null) {
      // testq %rsi, %rsi ; je 0x53de39 — early-exit branch.
      return;
    }
    // movb $0x1, (%rdi) — @0x53ddd6.
    this.accessActive = true;

    // The whole "resolve OZGroup via vtable[3] + __dynamic_cast<OZGroup>"
    // subsystem is undecoded here. We faithfully mark it as a throwing
    // frontier — the effect of that path is to allocate a PCArray<LiLight>
    // and stash it in this->lightsArray, incrementing refCount either way.
    //
    // Callees not yet transcribed:
    //   - OZFxPlugSharedBase vtable slot @+0x18 (@0x53dddf)
    //   - typeinfo for OZSceneNode @__ZTI11OZSceneNode
    //   - typeinfo for OZGroup    @__ZTI7OZGroup
    //   - ___dynamic_cast          (@0x53ddfe)
    //   - operator new(size_t)     (@0x53de17)
    //   - OZGroup::returnFxPlugLights(OZRenderState const&) const (@0x53de28)
    throw new Error(
      "OZFxLightingAPIData::beginAccess — OZFxPlugSharedBase vtable[+0x18] " +
        "(Ozone @0x000000000053dddf), __dynamic_cast<OZGroup*> " +
        "(Ozone @0x000000000053ddfe), and OZGroup::returnFxPlugLights " +
        "(Ozone @0x000000000053de28) not yet transcribed — cannot resolve " +
        "OZGroup from sharedBase in TS host"
    );

    // If those frontier calls were resolved, the code past the throw would be:
    //
    //   const scene = ... /* sharedBase->vtable[3]() */;
    //   const root  = readPtr(scene, 0x3b8) as OZSceneNode | null;
    //   if (root === null) return;
    //   const group = __dynamic_cast<OZGroup>(root, "OZSceneNode", "OZGroup");
    //   if (group === null) return;
    //   if (this.refCount === 0) {
    //     const arr = OZGroup_returnFxPlugLights_stub(operatorNew(0x20), group, state);
    //     this.lightsArray = arr;
    //   }
    //   this.refCount = (this.refCount + 1) | 0;
  }

  /**
   * endAccess — @Ozone 0x000000000053de60.
   *
   * Decoded flow (fully transcribed, no undecoded external calls in the
   * public-API surface — the two callees `PCArray::resize` and `operator
   * delete[]` / `operator delete` are pure heap ops and can be modeled by
   * clearing the TS reference to the array):
   *
   *   000000000053de67  movl   0x10(%rdi), %eax        ; eax = refCount
   *   000000000053de6a  testl  %eax, %eax
   *   000000000053de6c  je     0x53dece                ; if refCount == 0, exit
   *   000000000053de6e  leal   -0x1(%rax), %ecx        ; ecx = refCount - 1
   *   000000000053de71  movl   %ecx, 0x10(%rdi)        ; store back
   *   000000000053de74  cmpl   $0x1, %eax
   *   000000000053de77  jg     0x53dece                ; if old refCount > 1, exit
   *   ; ---- refCount transitioned 1 -> 0: free the array ----
   *   000000000053de79  movb   $0x0, (%rdi)            ; this->accessActive = false
   *   000000000053de7c  movq   0x8(%rdi), %rbx         ; rbx = lightsArray
   *   000000000053de80  testq  %rbx, %rbx
   *   000000000053de83  je     0x53dec6                ; if null, skip to store nil
   *   000000000053de88  leaq   __ZTV7PCArray<LiLight>+0x10(%rip), %rax   ; vtable + 0x10
   *   000000000053de93  movq   %rax, (%rbx)            ; install vtable in already-alive object
   *   000000000053de96  movl   0x8(%rbx), %eax         ; count = lightsArray->count
   *   000000000053de99  testl  %eax, %eax
   *   000000000053de9b  movl   $0x1, %edx              ; edx = 1
   *   000000000053dea0  cmovnsl %eax, %edx             ; if count >= 0: edx = count
   *   000000000053dea3  ...    resize(edx, 0) via PCArray::resize
   *   000000000053deab  ...    delete[] lightsArray->items @0x53deb6
   *   000000000053debe  ...    operator delete(lightsArray)
   *   000000000053dec6  movq   $0x0, 0x8(%rdi)         ; this->lightsArray = null
   *   000000000053dece  <exit>
   *
   * The bit that makes it fully transcribable: nothing about this method
   * escapes the object. The two delete calls are TS-invisible.
   *
   * Callees TS-modeled as GC (@0x53dea8 resize, @0x53deb6 delete[],
   * @0x53debe delete): PCArray<LiLight>::resize @Ozone symbol
   *   __ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii — noted here
   * but has no observable effect on this class's fields (the array is being
   * dropped anyway).
   *
   * @method Ozone 0x000000000053de60
   */
  endAccess(): void {
    // movl 0x10(%rdi), %eax ; testl %eax, %eax ; je 0x53dece  — @0x53de67-0x53de6c.
    const oldRefCount = this.refCount | 0;
    if (oldRefCount === 0) {
      return;
    }
    // leal -0x1(%rax), %ecx ; movl %ecx, 0x10(%rdi)  — @0x53de6e-0x53de71.
    this.refCount = (oldRefCount - 1) | 0;

    // cmpl $0x1, %eax ; jg 0x53dece  — signed >: exit if oldRefCount > 1.
    if (oldRefCount > 1) {
      return;
    }

    // ---- oldRefCount was 1 → transitioned to 0. Tear down the cache. ----
    // movb $0x0, (%rdi)  — @0x53de79.
    this.accessActive = false;

    // movq 0x8(%rdi), %rbx ; testq %rbx, %rbx ; je 0x53dec6  — @0x53de7c-0x53de83.
    if (this.lightsArray !== null) {
      // Native: install PCArray<LiLight> vtable+0x10 (@0x53de88), then call
      //   PCArray<LiLight>::resize(count, 0)  (@0x53dea8)
      //   operator delete[](items)            (@0x53deb6)
      //   operator delete(lightsArray)        (@0x53debe)
      // In TS we drop the reference — GC handles the rest. This is the
      // observable behavior from OZFxLightingAPIData's perspective.
    }
    // movq $0x0, 0x8(%rdi)  — @0x53dec6.
    this.lightsArray = null;
  }

  /**
   * numberOfLightsAtTime — @Ozone 0x000000000053dee0.
   *
   * Native signature: `int numberOfLightsAtTime(OZFxPlugSharedBase* sharedBase,
   *                                             FxTime time)`.
   *
   * Decoded flow:
   *
   *   000000000053dee0  testq  %rsi, %rsi
   *   000000000053dee3  je     0x53df04                ; if !sharedBase, return 0
   *   000000000053dee5  ...    save frame
   *   000000000053deeb  cmpb   $0x0, (%rdi)            ; is accessActive?
   *   000000000053deee  je     0x53df07                ; if not, NSLog error path
   *   000000000053def0  movq   0x8(%rdi), %rax         ; rax = lightsArray
   *   000000000053def4  testq  %rax, %rax
   *   000000000053def7  je     0x53df3b                ; null → return 0
   *   000000000053def9  movslq 0xc(%rax), %rax         ; rax = sign-extend(lightsArray->[0xc])
   *   ; ---- normal return path ----
   *   000000000053defd  ...    restore frame, retq
   *   000000000053df04  xorl   %eax, %eax
   *   000000000053df06  retq                            ; return 0
   *   000000000053df07  ...    NSLog("bad cfstring ref", ...)
   *   000000000053df2f  ...    fall back to reading lightsArray anyway
   *   000000000053df3b  xorl   %eax, %eax               ; return 0
   *
   * Behavior:
   *   - sharedBase == null              → return 0
   *   - accessActive is true and array  → return array[0xc] (int32, sign-extended)
   *   - accessActive is true, array nil → return 0
   *   - accessActive is false           → NSLog error, then behaves as above
   *
   * `int32 at offset 0xc` in the PCArray<LiLight> struct is the "count"
   * field per standard PCArray layout (see PCArray_base.ts).
   *
   * Callees on the error path (not yet transcribed, but observably a debug
   * log with no effect on the return value):
   *   - `[FxTime description]` via objc_msgSend @0x53df18
   *   - `_NSLog(...)`                          @0x53df2a
   *
   * @method Ozone 0x000000000053dee0
   */
  numberOfLightsAtTime(sharedBase: OZFxPlugSharedBase | null, _time: FxTime): number {
    // testq %rsi, %rsi ; je 0x53df04  — @0x53dee0-0x53dee3.
    if (sharedBase === null) {
      return 0;
    }

    // cmpb $0x0, (%rdi) ; je 0x53df07  — @0x53deeb-0x53deee.
    if (!this.accessActive) {
      // The native error path @0x53df07 calls NSLog then falls through to
      // reload lightsArray at 0x53df32. Its RETURN VALUE, however, only
      // depends on lightsArray at that point (0x53df36-0x53df3b: null → 0,
      // non-null → arr[0xc]). We model the observable value; the NSLog
      // side-effect is not yet transcribed but is stateless w.r.t. this
      // object's fields.
      //
      // Not yet transcribed (log-only side effect, does not affect return):
      //   objc_msgSend([time description]) @0x000000000053df18
      //   _NSLog                            @0x000000000053df2a
    }

    // movq 0x8(%rdi), %rax ; testq %rax, %rax ; je 0x53df3b  — @0x53def0-0x53def7
    // (and the shared join at 0x53df32 also reads 0x8(%rdi)).
    const arr = this.lightsArray as { count?: number } | null;
    if (arr === null) {
      // xorl %eax, %eax ; retq  — @0x53df3b/0x53df04.
      return 0;
    }

    // movslq 0xc(%rax), %rax  — @0x53def9. `0xc(arr)` is the PCArray count
    // (int32), sign-extended to 64-bit. In TS ints are already 32-signed
    // when we do `| 0`, so we just return the field.
    if (arr.count === undefined) {
      // The concrete PCArray<LiLight> struct isn't ported here; consumers
      // of this class must supply an object with a `count: number` field
      // mirroring `arr[0xc]`. Failing loudly rather than silently 0 keeps
      // us honest.
      throw new Error(
        "OZFxLightingAPIData::numberOfLightsAtTime — lightsArray in-memory " +
          "layout (int32 count at offset 0xc, per PCArray<LiLight>) not yet " +
          "modeled in TS host (Ozone read site @0x000000000053def9)"
      );
    }
    return arr.count | 0;
  }

  /**
   * lightInfoForLightAtTime — @Ozone 0x000000000053df50.
   *
   * Native signature (from the mangled name):
   *   `bool lightInfoForLightAtTime(OZFxPlugSharedBase* sharedBase,
   *                                 FxLightInfo* out,
   *                                 unsigned long index,
   *                                 FxTime time,
   *                                 NSError** outError)`.
   *
   * This function is ~200 lines of x86_64 and touches four subsystems that
   * this port does NOT yet cover:
   *
   *   1. `PCArray_base::badIndex()` @0x53dfb3 — abort/throw on OOB.
   *   2. `OZFxPlugSharedBase` vtables (@0x53dff6 slot +0xa0, @0x53e00a slot +0x18)
   *      and downstream `OZScene* -> vtable+0x110` @0x53e013.
   *   3. `OZFxPlugSharedBase::getMotionEffect() const`  @0x53e020
   *      `FigTimeToFrames(CMTime, OZScene const*, FFMotionEffect*)` @0x53e04f
   *      `OZFxPlugRenderContextManager::getRenderParams(...)`         @0x53e22a
   *      `OZRenderParams::getWorkingColorSpace() const`                @0x53e232
   *      `PCColor::PCColor(f,f,f,f,CGColorSpace*)`                     @0x53e262
   *      `PCColor::getNSColor() const`                                 @0x53e26b
   *      `PCCFRefTraits<CGColorSpace*>::release`                       @0x53e31f
   *      `PCColor::~PCColor`                                           @0x53e35b (unwind)
   *   4. ObjC error construction via [NSError errorWithDomain:code:userInfo:]
   *      using _FxPlugErrorDomain / _NSLocalizedDescriptionKey and CFString
   *      literals (@0x53e06b-0x53e0d2, 0x53e0d7-0x53e15b, 0x53e15b-0x53e1c9).
   *
   * Field-write layout at the FxLightInfo* out (r14) is decoded but only
   * meaningful once the callees above supply values. See @classAddr
   * fields comment on FxLightInfo above.
   *
   * @method Ozone 0x000000000053df50
   */
  lightInfoForLightAtTime(
    _sharedBase: OZFxPlugSharedBase | null,
    _out: FxLightInfo,
    _index: number,
    _time: FxTime,
    _outError: NSErrorOutParam | null,
  ): boolean {
    // Not yet transcribed: OZFxPlugSharedBase vtable at slot +0xa0/+0x18
    // (Ozone @0x000000000053dff6 / @0x000000000053e00a), OZScene vtable +0x110
    // (@0x000000000053e013), OZFxPlugSharedBase::getMotionEffect
    // (@0x000000000053e020), FigTimeToFrames (@0x000000000053e04f),
    // OZFxPlugRenderContextManager::getRenderParams (@0x000000000053e22a),
    // OZRenderParams::getWorkingColorSpace (@0x000000000053e232),
    // PCColor::PCColor(f,f,f,f,CGColorSpace*) (@0x000000000053e262),
    // PCColor::getNSColor (@0x000000000053e26b),
    // PCArray_base::badIndex (@0x000000000053dfb3),
    // PCCFRefTraits<CGColorSpace*>::release (@0x000000000053e31f),
    // PCColor::~PCColor (@0x000000000053e35b),
    // and the NSError construction paths at Ozone
    // @0x000000000053e06b-0x000000000053e15b — the whole method is a
    // frontier and only endAccess+numberOfLightsAtTime survive as
    // fully decoded surface for now.
    throw new Error(
      "OZFxLightingAPIData::lightInfoForLightAtTime — full body not yet " +
        "transcribed; frontier callees are OZFxPlugSharedBase vtable " +
        "(Ozone @0x000000000053dff6), FigTimeToFrames " +
        "(Ozone @0x000000000053e04f), OZFxPlugRenderContextManager::" +
        "getRenderParams (Ozone @0x000000000053e22a), PCColor::PCColor " +
        "(Ozone @0x000000000053e262), and the NSError construction " +
        "paths (Ozone @0x000000000053e06b-0x000000000053e15b)"
    );
  }
}

// ---------------------------------------------------------------------------
// Reference re-export so the frontier stub is visible to the gate's linker.
// ---------------------------------------------------------------------------
export const __OZGroup_returnFxPlugLights_stub_reference =
  OZGroup_returnFxPlugLights_stub;
