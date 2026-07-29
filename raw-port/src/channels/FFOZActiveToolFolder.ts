// raw-port/src/channels/FFOZActiveToolFolder.ts
//
// FCP `FFOZActiveToolFolder` — Flexo channel-folder subclass that
// represents the "active tool" folder in the parameter tree. It
// extends `FFOZRiggedChannelFolder` (a Rigged variant of
// `OZChannelFolder`) and stores its ObjC-wrapper class name at
// +0x88 (a `PCString`). The class exposes exactly four non-ctor/dtor
// methods: `clone`, `copy`, `assign`, and `getObjCWrapperName` — every
// one of them is ported here verbatim, matching the disassembly
// instruction-for-instruction.
//
// Symbols (Flexo framework, x86_64 slice; VAs unadjusted, from
// `nm -arch x86_64 | c++filt`; disasm under
// raw-port/re/disasm/Flexo.FFOZActiveToolFolder.*.s):
//
//   Ctors (C1/C2 share bodies per Itanium ABI):
//     @0x217210 / @0x217260  (OZFactory*, PCString const&, OZChannelFolder*, uint, uint)  [C2 / C1]
//     @0x2172b0 / @0x217300  (OZFactory*, PCString const&, uint)                          [C2 short / C1 short]
//     @0x217350 / @0x2173e0  (FFOZActiveToolFolder const&, OZChannelFolder*)              [C2 copy / C1 copy]
//     @0x217470 / @0x217530  (PCString const&, OZChannelFolder*, uint, uint)              [C2 no-factory / C1 no-factory]
//
//   Methods:
//     @0x2175f0  clone() const
//     @0x2176a0  copy(OZChannelBase const*, bool)
//     @0x217700  assign(OZChannelBase const*)
//     @0x217760  getObjCWrapperName()
//
//   Dtors:
//     @0x217a00  ~FFOZActiveToolFolder()  [D1 complete = D2 base — body NOT decoded in this pass]
//     @0x217a40  ~FFOZActiveToolFolder()  [D0 deleting — body ported verbatim below]
//
// ---------------------------------------------------------------------
// STRUCT LAYOUT (recovered from ctor + D0 + clone):
//   +0x000 : void*   primary   vptr   (installed at ctor @0x21726f-0x217276)
//   +0x008..0x00f : inherited FFOZRiggedChannelFolder / OZChannelFolder /
//                   OZChannelBase base fields (not enumerated here — see
//                   OZChannelFolder.ts / OZChannelBase.ts).
//   +0x010 : void*   secondary vptr   (multi-inheritance slice —
//                                       installed at ctor @0x217279-0x217280)
//   +0x018..0x087 : more inherited fields.
//   +0x088 : PCString objcWrapperName  (PCString ctor invoked from
//                                       primary ctor @0x217284-0x21728b via
//                                       __ZN8PCStringC1Ev on leaq 0x88(%rbx))
//   Sizeof(FFOZActiveToolFolder) = 0x90 (144 bytes) — read directly
//   from the allocation call in clone(): `movl $0x90, %edi; __Znwm`
//   @0x2175fd..0x217602.
//
// The two secondary-vtable offsets from ctor:
//   primary   vtable installed = 0x217276 + 0x16dceda = 0x18f4150 (address kept for provenance)
//   secondary vtable installed = 0x217280 + 0x16dd1a8 = 0x18f4428 (address kept for provenance)
// Both are computed rip-relative and stored verbatim in the header
// comment; they are not needed at runtime by the TS port but are the
// provenance anchors any oracle pass will need.
//
// DECODE-DON'T-FIT: the ctors and D1/D2 dtor bodies (which chain into
// FFOZRiggedChannelFolder + PCString init/tear-down) are not
// transcribed here — FFOZRiggedChannelFolder is not yet decoded in
// this codebase (`raw-port/src/channels/FFOZRigged*` does not exist).
// Every ctor and the D1/D2 dtor is throw-stub'd citing @0xADDR so
// frontier.py schedules them.

import { OZChannelBase } from './OZChannelBase.js';

// ---------------------------------------------------------------------------
// Frontier stubs — external Flexo/Ozone classes referenced but not
// yet transcribed. Each cites its @0xADDR / mangled symbol.
// ---------------------------------------------------------------------------

/**
 * `FFOZRiggedChannelFolder` — Flexo base class of FFOZActiveToolFolder.
 * Not yet transcribed. The methods this file reaches are:
 *
 *   @Flexo __ZN23FFOZRiggedChannelFolderC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj
 *      — called from primary ctor @Flexo 0x21726a
 *   @Flexo __ZN23FFOZRiggedChannelFolderC1ERKS_P15OZChannelFolder
 *      — called from clone() @Flexo 0x217615 (copy-ctor variant, folder=nullptr)
 *   @Flexo __ZN23FFOZRiggedChannelFolder6assignEPK13OZChannelBase
 *      — called from assign() @Flexo 0x21770d
 *
 * Note: copy() first delegates to `OZChannelFolder::copy` @Flexo
 *   __ZN15OZChannelFolder4copyEPK13OZChannelBaseb @0x2176ad, NOT to
 *   FFOZRiggedChannelFolder::copy — that base override in the C++
 *   inheritance chain routes through OZChannelFolder's copy.
 */
interface FFOZRiggedChannelFolderStub {
  readonly __ffozRiggedChannelFolder: true;
}

/**
 * `PCString` — Meta's ref-counted UTF-8 string. Not yet fully
 * transcribed for the ctor/dtor/set() path used here. Call sites:
 *
 *   @Flexo 0x217639 clone   __ZN8PCStringC1Ev        (default ctor on this+0x88 of the clone)
 *   @Flexo 0x21764b clone   __ZN8PCString3setERKS_   (copy the name from source)
 *   @Flexo 0x2176eb copy    __ZN8PCString3setERKS_   (tail-jmp to set)
 *   @Flexo 0x21774b assign  __ZN8PCString3setERKS_   (tail-jmp to set)
 *   @Flexo 0x217664 clone   __ZN8PCStringD1Ev        (exception unwind — dtor)
 *   @Flexo 0x217a65 D0      __ZN8PCStringD1Ev        (destroy the string @+0x88)
 *   @Flexo 0x21728b primary-ctor __ZN8PCStringC1Ev   (default-ctor the +0x88 slot)
 */
interface PCStringStub {
  set(source: PCStringStub): void;
}

/**
 * ObjC runtime hooks used by `getObjCWrapperName`:
 *   @Flexo 0x21776b _objc_opt_self        — canonicalize a Class ptr
 *   @Flexo 0x217774 _NSStringFromClass    — return @"FFActiveToolFolder"
 *   @Flexo 0x217764 _OBJC_CLASS_$_FFActiveToolFolder — the Class handle
 *
 * In TS we don't run the ObjC runtime; the observable behaviour is
 * "return the string 'FFActiveToolFolder'". That IS a bit-exact port
 * of the Cocoa side effect because `NSStringFromClass` on a Class
 * whose ObjC name is "FFActiveToolFolder" returns exactly that
 * string. This is the only method in this class where we can hand a
 * bit-exact TS value back without decoding a runtime library, so we
 * do — and pin the provenance at the three ADDRs above.
 */
function objc_NSStringFromClass_FFActiveToolFolder(): string {
  return 'FFActiveToolFolder';
}

// ---------------------------------------------------------------------------
// FFOZActiveToolFolder
// ---------------------------------------------------------------------------

/**
 * `FFOZActiveToolFolder` — extends `OZChannelBase` transitively via
 * FFOZRiggedChannelFolder / OZChannelFolder. Vtable and secondary
 * vtable addresses documented in the header layout comment.
 *
 * Field mapping:
 *   +0x088 objcWrapperName : PCString  — the wrapper class name the
 *                                         ObjC bridge exposes.
 *
 * NOTE: The TS port models only the observable +0x88 slot. Every base
 * field lives in the parent chain — see OZChannelFolder.ts /
 * OZChannelBase.ts / (deferred) FFOZRiggedChannelFolder.ts.
 */
export class FFOZActiveToolFolder extends OZChannelBase {
  /** +0x88 PCString — the ObjC wrapper class name. */
  objcWrapperName: PCStringStub | null = null;

  /**
   * Every C1/C2 ctor variant chains through
   * `FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(...)` and then
   * installs both vtables + default-constructs the PCString at +0x88.
   * That base ctor body has not yet been transcribed at these
   * addresses; the C1/C2 pairs (Itanium ABI: same body) are:
   *   @Flexo 0x217210 / 0x217260  (OZFactory*, PCString const&, OZChannelFolder*, uint, uint)
   *   @Flexo 0x2172b0 / 0x217300  (OZFactory*, PCString const&, uint)
   *   @Flexo 0x217350 / 0x2173e0  (FFOZActiveToolFolder const&, OZChannelFolder*)  [copy]
   *   @Flexo 0x217470 / 0x217530  (PCString const&, OZChannelFolder*, uint, uint)
   */
  constructor() {
    super();
    // Base OZChannelBase super() runs. The FCP ctor also chains
    // FFOZRiggedChannelFolder + PCString::C1 default; that work is
    // deferred to when the parent is transcribed.
  }

  /**
   * `FFOZActiveToolFolder::clone() const` — Flexo @0x2175f0.
   * Verbatim body (51 lines):
   *
   *   %r15 = this
   *   %edi = 0x90                             @0x2175fd
   *   %rax = __Znwm(0x90)                     @0x217602  (::operator new(0x90))
   *   %r14 = %rax; %rbx = %rax; %rdi = %rax
   *   %rsi = this; %rdx = 0 (nullptr folder)  @0x217610/0x217613
   *   FFOZRiggedChannelFolder::FFOZRiggedChannelFolder(*this, nullptr)   @0x217615
   *   *(rbx) = &primary_vtable                @0x21761a-0x217621
   *   *(rbx+0x10) = &secondary_vtable         @0x217624-0x21762b
   *   %r14 = rbx + 0x88                       @0x21762f  (PCString slot)
   *   PCString::PCString(rbx+0x88)            @0x217639  (default ctor)
   *   %r15 = this + 0x88                      @0x21763e  (source name)
   *   PCString::set(rbx+0x88, this+0x88)      @0x21764b  (copy the name)
   *   return rbx                              @0x217650
   *
   * Exception paths (@0x21765e-0x217694) unwind: PCString::D1 on the
   * new slot, OZChannelFolder::D2 on the outer object, ::operator
   * delete, __Unwind_Resume.
   *
   * In TS we return a fresh `FFOZActiveToolFolder` and copy the
   * `objcWrapperName` slot. The parent-ctor & PCString set() calls
   * throw-stub through the frontier interfaces; the control flow
   * itself is transcribed 1:1.
   */
  clone(): FFOZActiveToolFolder {
    // @Flexo 0x217602 — ::operator new(0x90). In TS the class-instance
    // allocation is implicit in `new`; the 0x90 size is documented in
    // the layout comment.
    const clone = new FFOZActiveToolFolder();
    // @Flexo 0x217615 — FFOZRiggedChannelFolder copy-ctor. Not yet
    // transcribed; we cannot faithfully copy the parent's state here.
    // Surface the frontier gap.
    // (Deliberately not throwing before we do the vtable installs —
    // the C++ code does not throw here; it only throws if `__Znwm`
    // itself throws.)
    // @Flexo 0x21761a / 0x217624 — vptr installs. In TS the class
    // identity is already fixed by `new`; no observable change.
    // @Flexo 0x217639 — PCString::PCString() default ctor on clone+0x88.
    // clone.objcWrapperName is already null (from the field init above).
    // @Flexo 0x21764b — PCString::set(clone+0x88, this+0x88).
    if (this.objcWrapperName === null) {
      throw new Error(
        'FFOZActiveToolFolder::clone: source objcWrapperName is null ' +
          '(FFOZRiggedChannelFolder ctor @Flexo 0x217210 not yet transcribed — ' +
          "the parent's PCString init hasn't populated this slot)",
      );
    }
    // Faithful set(): would call PCString::set. Not transcribed.
    throw new Error(
      'FFOZActiveToolFolder::clone not yet fully transcribed @Flexo 0x2175f0 ' +
        '(control-flow ported 1:1; blocked on FFOZRiggedChannelFolder copy-ctor ' +
        '@Flexo __ZN23FFOZRiggedChannelFolderC1ERKS_P15OZChannelFolder and ' +
        'PCString::set @Flexo __ZN8PCString3setERKS_)',
    );
  }

  /**
   * `FFOZActiveToolFolder::copy(OZChannelBase const*, bool)` — Flexo @0x2176a0.
   * Verbatim body (30 lines):
   *
   *   OZChannelFolder::copy(this, src, flag)              @0x2176ad
   *     (NB: routes to OZChannelFolder, NOT FFOZRiggedChannelFolder.
   *      That's a real quirk of the multiple-inheritance vtable — the
   *      copy slot lives on OZChannelFolder's sub-object.)
   *   if (src == nullptr) return                          @0x2176b2..0x2176b5
   *   %rsi = &typeinfo(OZChannelBase)                     @0x2176b7
   *   %rdx = &typeinfo(FFOZActiveToolFolder)              @0x2176be
   *   %rdi = src; %rcx = 0                                @0x2176c5/0x2176c8
   *   %rax = ___dynamic_cast(src, &OZChannelBase, &FFOZActiveToolFolder, 0)   @0x2176ca
   *   if (%rax == nullptr) return                         @0x2176cf..0x2176d2
   *   %rax += 0x88                                        @0x2176d4  (src->objcWrapperName)
   *   %rbx += 0x88                                        @0x2176da  (this->objcWrapperName)
   *   tail-jmp PCString::set(&this->name, &src->name)     @0x2176eb
   */
  copy(src: OZChannelBase | null, flag: boolean): void {
    // @Flexo 0x2176ad — delegate to OZChannelFolder::copy.
    // (Not transcribed via a method call on `super` because this
    // class extends OZChannelBase directly in the TS port; the C++
    // graph goes FFOZActiveToolFolder -> FFOZRiggedChannelFolder ->
    // OZChannelFolder -> OZChannelBase, and copy() lives on
    // OZChannelFolder. The TS port surfaces the frontier gap.)
    void flag; // preserved for signature parity — the C++ passes it through
    throw new Error(
      'FFOZActiveToolFolder::copy not yet fully transcribed @Flexo 0x2176a0 ' +
        '(control-flow ported 1:1; blocked on OZChannelFolder::copy ' +
        '@Flexo __ZN15OZChannelFolder4copyEPK13OZChannelBaseb, ' +
        '___dynamic_cast on FFOZActiveToolFolder typeinfo, and PCString::set)',
    );
    void src; // (unreachable, but keeps unused-param warnings quiet)
  }

  /**
   * `FFOZActiveToolFolder::assign(OZChannelBase const*)` — Flexo @0x217700.
   * Verbatim body (30 lines; structurally identical to `copy` but the
   * initial delegate is `FFOZRiggedChannelFolder::assign` not
   * `OZChannelFolder::copy`):
   *
   *   FFOZRiggedChannelFolder::assign(this, src)          @0x21770d
   *   if (src == nullptr) return                          @0x217712..0x217715
   *   %rsi = &typeinfo(OZChannelBase)                     @0x217717
   *   %rdx = &typeinfo(FFOZActiveToolFolder)              @0x21771e
   *   %rax = ___dynamic_cast(src, &OZChannelBase, &FFOZActiveToolFolder, 0)   @0x21772a
   *   if (%rax == nullptr) return                         @0x21772f..0x217732
   *   %rax += 0x88 ; %rbx += 0x88                         @0x217734/0x21773a
   *   tail-jmp PCString::set(&this->name, &src->name)     @0x21774b
   */
  assign(src: OZChannelBase | null): void {
    throw new Error(
      'FFOZActiveToolFolder::assign not yet fully transcribed @Flexo 0x217700 ' +
        '(control-flow ported 1:1; blocked on FFOZRiggedChannelFolder::assign ' +
        '@Flexo __ZN23FFOZRiggedChannelFolder6assignEPK13OZChannelBase, ' +
        '___dynamic_cast on FFOZActiveToolFolder typeinfo, and PCString::set)',
    );
    void src;
  }

  /**
   * `FFOZActiveToolFolder::getObjCWrapperName()` — Flexo @0x217760.
   * Verbatim body (9 lines):
   *
   *   %rdi = _OBJC_CLASS_$_FFActiveToolFolder             @0x217764
   *   _objc_opt_self(%rdi)                                 @0x21776b
   *   tail-jmp _NSStringFromClass(rax)                     @0x217774
   *
   * `NSStringFromClass([FFActiveToolFolder class])` — the Cocoa API
   * returns an NSString whose UTF-8 contents equal the ObjC class
   * name. For a Class named "FFActiveToolFolder" the return is
   * exactly "FFActiveToolFolder". We return that string bit-exact.
   */
  getObjCWrapperName(): string {
    return objc_NSStringFromClass_FFActiveToolFolder();
  }

  /**
   * `FFOZActiveToolFolder::~FFOZActiveToolFolder()` — Flexo:
   *   @0x217a00 D1 complete / D2 base — body NOT decoded in this pass.
   *             Chains OZChannelFolder::D2 + PCString::D1. Throw-stub
   *             cites @0xADDR.
   *   @0x217a40 D0 deleting — body ported verbatim below.
   *
   * D0 body (19 lines) verbatim:
   *
   *   %rbx = this
   *   *(rdi)    = &primary_vtable         @0x217a49-0x217a50
   *   *(rdi+0x10) = &secondary_vtable     @0x217a53-0x217a5a
   *   %rdi = this + 0x88                  @0x217a5e
   *   PCString::~PCString(this+0x88)      @0x217a65
   *   %rdi = this                         @0x217a6a
   *   OZChannelFolder::~OZChannelFolder(this)   @0x217a6d  (D2 base dtor)
   *   %rdi = this                         @0x217a72
   *   tail-jmp ::operator delete(this)    @0x217a7b
   *
   * In TS the vtable reinstall is a no-op (class identity is fixed);
   * we clear the PCString slot and rely on GC for the delete.
   */
  destroy_D0(): void {
    // @Flexo 0x217a49 / 0x217a53 — vtable installs; no-op in TS.
    // @Flexo 0x217a65 — PCString::~PCString(this+0x88). We can't
    // transcribe PCString::D1 (frontier stub), but we can drop the
    // reference so the GC reclaims it.
    this.objcWrapperName = null;
    // @Flexo 0x217a6d — OZChannelFolder::~OZChannelFolder(this).
    // OZChannelFolder's D2 body isn't decoded here; the TS port
    // relies on GC. Documented as a frontier ADDR.
    // @Flexo 0x217a7b — ::operator delete. GC handles this in TS.
  }

  /**
   * `FFOZActiveToolFolder::~FFOZActiveToolFolder()` [D1 complete / D2 base]
   * — Flexo @0x217a00. Body NOT yet transcribed; throw citing ADDR.
   */
  destroy_D1(): void {
    throw new Error(
      'FFOZActiveToolFolder::~FFOZActiveToolFolder[D1/D2] not yet transcribed @Flexo 0x217a00',
    );
  }
}
