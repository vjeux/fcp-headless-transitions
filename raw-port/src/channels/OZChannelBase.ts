// OZChannelBase — base of every channel/parameter node (ProChannel.framework).
// Faithful port. Decode: OZChannelBase::parseElement @ ProChannel 0x666... (30-line base:
// handles <flags> and the common name/id/internalName/factoryID attributes via OZChannelBaseScope).
// OZChannelBaseScope: 0x6e name, 0x6f id, 0x70 flags, 0x71 factoryID, 0x76 internalName.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import type { OZChannelObjectRootBase } from "./OZChannelObjectRootBase.js";
import type { PCSerializerWriteStream } from "../infra/PCSerializerWriteStream.js";
import type { CMTime } from "../infra/CMTime.js";

/**
 * `___dynamic_cast(void* src, const std::type_info* srcType,
 *                  const std::type_info* dstType, ptrdiff_t hint)`
 *   → Itanium C++ ABI RTTI cross-cast helper (libc++abi.dylib —
 *   `_Unwind_...`/`__cxa_...`/`___dynamic_cast` are all part of the
 *   C++ runtime, NOT one of the five FCP frameworks).
 *
 * Called via tail-jmp from `OZChannelBase::getChannelRootBase()`
 * @0x4a450 through ProChannel imported-stubs slot 0xacea0. In FCP's
 * actual invocation, srcType = &typeinfo(OZChannelBase) and dstType =
 * &typeinfo(OZChannelObjectRootBase); the runtime returns either an
 * adjusted OZChannelObjectRootBase* (when `src` is actually a sibling
 * of both in a multiple-inheritance hierarchy) or NULL (when the cast
 * cannot succeed for this concrete type).
 *
 * TRUE out-of-scope extern per this port's policy — RTTI metadata
 * lives in Mach-O `__DATA_CONST` sections that we do not reconstruct;
 * we cannot honestly walk the class hierarchy without a full C++
 * runtime. A faithful raise is the correct behaviour: any caller
 * reaching this point in the current partially-ported state depends
 * on RTTI info that is not yet modelled.
 *
 * The stub is signature-typed to return `OZChannelObjectRootBase |
 * null` because the ONE call-site in this file wants exactly that
 * type (the disasm's dstType is `OZChannelObjectRootBase`). When
 * additional call-sites for other cross-cast pairs appear, a
 * generic-typed helper can be introduced; for now the specialised
 * stub matches the single use.
 */
function dynamic_cast_to_OZChannelObjectRootBase_stub(
  _src: OZChannelBase,
): OZChannelObjectRootBase | null {
  throw new Error(
    "___dynamic_cast(this, &typeinfo(OZChannelBase), " +
      "&typeinfo(OZChannelObjectRootBase), 0) @ProChannel imported-stubs " +
      "GOT 0xacea0 — Itanium C++ ABI RTTI helper (libc++abi.dylib). " +
      "TRUE out-of-scope extern (C++ runtime). Called as a tail-jmp from " +
      "OZChannelBase::getChannelRootBase() @ProChannel 0x4a450 after the " +
      "parent-chain walk finds a node with flag bit 0x20 set at +0x39. " +
      "Not yet transcribed — no RTTI metadata available in this port.",
  );
}

/**
 * Module-scope static counter, mangled as `__ZL12sIDGenerator` in
 * ProChannel (Itanium `_ZL...` = file-local static, hidden linkage).
 * Backing store for `OZChannelBase::getNextUniqueID()` @ProChannel
 * 0x49c10; the setter is the sole reader/writer:
 *   @0x49c14  movl   $0x1, %eax          ; increment = 1
 *   @0x49c19  lock                        ; atomic prefix
 *   @0x49c1a  xaddl  %eax, __ZL12sIDGenerator(%rip)
 *                                         ; %eax = *sIDGenerator (OLD),
 *                                         ; *sIDGenerator += 1 (NEW)
 *
 * `xaddl` on a 32-bit memory operand: the class slot is int32/uint32.
 * The `lock` prefix makes the read-modify-write atomic across threads,
 * which matters because getNextUniqueID is the process-wide ID minter
 * for OZChannelBase instances (see `setID` @0x4a67c and the `id`
 * attribute on OZChannelBaseScope 0x6f). We model the concurrency
 * aspect faithfully: JavaScript's single-threaded event loop makes
 * the increment atomic for free within one agent/isolate; cross-
 * process/cross-worker uniqueness would need external coordination
 * (out of scope for this port).
 *
 * Initial value: 0 (Mach-O `__DATA` zero-fill for unset statics; the
 * FCP binary has no explicit initializer, so it starts at 0 like any
 * `static int` in C++).
 */
let sIDGenerator: number = 0;  // @ProChannel __ZL12sIDGenerator

/**
 * Opaque handle to a `CFStringRef` (`const __CFString*`) — the argument type of
 * `OZChannelBase::setParameterCtlrClassName(__CFString const*)` @0x49870 and
 * the type of the +0x58 slot it drives. CoreFoundation is out of port scope, so
 * the value is carried as an opaque identity: the ported code only ever
 * COMPARES it (`cmpq` @0x4987e, `testq` @0x49886/@0x49894) and passes it to the
 * two CF entry points below — it never dereferences it.
 */
export interface CFStringRef {
  readonly __cfType: "CFString";
  handle: unknown;
}

/**
 * `_CFRelease(CFTypeRef)` — out-of-scope CoreFoundation extern, modelled as a
 * JS NO-OP.
 *
 * Entered through the ProChannel symbol stub @0xaca50, from BOTH setters in
 * this file: `callq _CFRelease` @ProChannel 0x49851
 * (setLabelCtlrClassName, +0x50 slot) and @ProChannel 0x4988b
 * (setParameterCtlrClassName, +0x58 slot).
 *
 * WHY A NO-OP AND NOT A THROW. `_CFRelease` is a LIFETIME/OWNERSHIP primitive:
 * it returns void and produces no value a JS port could be accused of
 * fabricating — all it does is decrement a CoreFoundation retain count that
 * this port does not maintain, because the JS garbage collector owns the
 * `CFStringRef` surrogate instead. The faithful boundary model is therefore
 * "do nothing", and that is the settled, landed convention here: the RESOLVED
 * extern-boundary ruling in REVIEWER_BRIEF.md ("LIFETIME / OWNERSHIP
 * primitives → JS NO-OP … VALUE-PRODUCING externs → THROW with @0xADDR"), and
 * the same stub address 0xaca50 is already modelled as a documented no-op by
 * `raw-port/src/infra/PCCFRef_CFArray.ts` on main, with `PCCFRef_CFData.ts`
 * and `PCCFRef_CFDictionary.ts` doing the same.
 *
 * It also has to be a no-op for the setters to work at all: both release
 * sites sit on the ordinary reachable path (any non-NULL previous value), so
 * a throw here would make "replace an existing class name" raise on every
 * real call.
 */
function CFRelease(_cfObject: CFStringRef): void {
  // NO-OP. @ProChannel stub 0xaca50 — refcount decrement; the JS GC owns the
  // CFStringRef surrogate, so there is nothing to release at this boundary.
}

/**
 * `_CFRetain(CFTypeRef)` — out-of-scope CoreFoundation extern, modelled as a
 * JS NO-OP.
 *
 * TAIL-JUMPED through the ProChannel symbol stub @0xaca56, from BOTH setters
 * in this file: `jmp _CFRetain` @ProChannel 0x49866 (setLabelCtlrClassName,
 * +0x50 slot) and @ProChannel 0x498a0 (setParameterCtlrClassName, +0x58
 * slot).
 *
 * Same boundary and the same RESOLVED ruling as `_CFRelease` above: the
 * retain/release family are lifetime/ownership primitives, so the faithful JS
 * model is a no-op — the JS GC owns the `CFStringRef` surrogate, and the
 * retain count this instruction bumps has no representation in the port. Only
 * VALUE-PRODUCING externs throw, because those are the ones whose return value
 * JS cannot fabricate. Landed precedent: the PCCFRef family on main
 * (`PCCFRef_CFArray.ts`, `PCCFRef_CFData.ts`, `PCCFRef_CFDictionary.ts`) and
 * `PCCFRefTraits_CGColorSpace` / `PCCFRefTraits_vImageConverter`.
 *
 * ON THE RETURN TYPE. The C API is `CFTypeRef CFRetain(CFTypeRef)` — it hands
 * back its argument unchanged, which is what the "retain-family returns its
 * arg" half of the ruling refers to. NEITHER call site in this file consumes
 * that value: both are the tail `jmp` of a `void` C++ setter
 * (`__ZN13OZChannelBase21setLabelCtlrClassNameEPK10__CFString` and
 * `__ZN13OZChannelBase25setParameterCtlrClassNameEPK10__CFString` both return
 * void), so the value CFRetain leaves in %rax is discarded by every caller.
 * Typing it `void` here keeps the tail-call shape of the transcription exact
 * (`return CFRetain(name)` in a void method mirrors `jmp _CFRetain`) without
 * inventing a value nothing reads.
 *
 * As with the release side, both retain sites are on the ordinary reachable
 * path (any non-NULL new value), so a throw here would make setting a class
 * name on a fresh object raise.
 */
function CFRetain(_cfObject: CFStringRef): void {
  // NO-OP. @ProChannel stub 0xaca56 — refcount increment; the JS GC owns the
  // CFStringRef surrogate. The C API returns its argument unchanged, and
  // neither tail-jmp call site in this file reads that value (both setters are
  // void).
}

export class OZChannelBase {
  id = 0;
  name = "";
  internalName = "";
  factoryID = 0;
  flags = 0n;

  /** Read the common channel attributes present on a <parameter> element. */
  protected readCommon(s: PCSerializerReadStream, e: PCStreamElement): void {
    const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) this.id = id;         // 0x666f7
    const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) this.name = nm;       // 0x6679f
    const inm = s.getAttributeAsString(e, 0x76); if (inm !== undefined) this.internalName = inm;
    const fid = s.getAttributeAsUInt32(e, 0x71); if (fid !== undefined) this.factoryID = fid; // 0x66742
  }

  parseElement(_s: PCSerializerReadStream, _e: PCStreamElement): void {
    // Base handles <flags> (tag 0x0 in OZChannelBaseScope) + common attrs; concrete subclasses
    // (OZChannel / OZChannelFolder) call readCommon and add their own value/curve handling.
  }

  /**
   * OZChannelBase::undoWillReplace().
   * @0x000000000001fbe0..0x000000000001fbe5  (Ozone.framework)
   *
   * Body (from disasm):
   *   push rbp ; mov rbp,rsp ; pop rbp ; retq
   * Trivial empty-body virtual hook (no-op). Subclasses override this to snapshot state before
   * a keyframe/state replace; the base implementation does nothing.
   */
  undoWillReplace(): void {
    // @0x000000000001fbe0 — empty prologue/epilogue, no side effects.
  }

  /**
   * OZChannelBase::undoDidReplace().
   * @0x000000000001fbf0..0x000000000001fbf5  (Ozone.framework)
   *
   * Body:
   *   push rbp ; mov rbp,rsp ; pop rbp ; retq
   * Symmetric no-op counterpart to undoWillReplace. Subclasses override to commit their
   * post-replace bookkeeping; base = empty.
   */
  undoDidReplace(): void {
    // @0x000000000001fbf0 — empty prologue/epilogue, no side effects.
  }

  /**
   * OZChannelBase::hasOnlyOneKeypointAt(CMTime const&) const.
   * @0x000000000001fc00..0x000000000001fc07  (Ozone.framework)
   *
   * Body:
   *   push rbp ; mov rbp,rsp ; mov al, 0x1 ; pop rbp ; retq
   * Constant `return true`. The base OZChannelBase has no keypoint list (it isn't animatable),
   * so any query "does this channel have exactly one keypoint at the given time?" answers yes
   * by convention — subclasses (OZChannelDouble/OZChannelAngle/etc.) override with the real
   * keypoint-list scan.
   */
  hasOnlyOneKeypointAt(_time: unknown): boolean {
    // @0x000000000001fc04  movb $0x1, %al
    return true;
  }

  /**
   * OZChannelBase::shouldIgnoreDynamicIDs() const.
   * @0x000000000001fc10..0x000000000001fc17  (Ozone.framework)
   *
   * Body:
   *   push rbp ; mov rbp,rsp ; xor eax,eax ; pop rbp ; retq
   * Constant `return false`. Base default: dynamic IDs are meaningful for a plain channel.
   * Overridden by subclasses (e.g. compound/aggregate channels that flatten sub-IDs).
   */
  shouldIgnoreDynamicIDs(): boolean {
    // @0x000000000001fc14  xorl %eax, %eax
    return false;
  }

  /**
   * `OZChannelBase::isObjectRef() const` — @Flexo 0x217b40
   *   (__ZNK13OZChannelBase11isObjectRefEv)
   *
   * FULL DISASM (raw-port/re/disasm/Flexo.__ZNK13OZChannelBase11isObjectRefEv.s
   * — 7 lines):
   *
   *   0x217b40  pushq %rbp                ; frame prologue
   *   0x217b41  movq  %rsp, %rbp
   *   0x217b44  xorl  %eax, %eax          ; eax = 0 — the entire computation
   *   0x217b46  popq  %rbp                ; frame epilogue
   *   0x217b47  retq                      ; return false
   *   0x217b48  nopl  (%rax,%rax)         ; alignment pad — no effect
   *
   * A constant `return false`: the base-class default answer to "is this
   * channel an object reference?", which the object-ref subclasses override.
   * The body really is empty — one `xorl` and the frame — so this port is the
   * whole function, not a stub standing in for undecoded work.
   *
   * THREE COPIES. This symbol is statically linked into three of the five
   * in-scope frameworks, with the same five instructions in each (verified by
   * re-deriving all three and diffing the mnemonics + operands):
   *   @Flexo      0x217b40   (the address the ledger unit names, cited above)
   *   @Ozone      0x1fb70    (identical, including the trailing `nopl` pad)
   *   @ProChannel 0x518d4    (identical instructions; no trailing `nopl` — the
   *                           pad is alignment for whatever follows, not code)
   * The sibling `shouldIgnoreDynamicIDs()` just above cites its Ozone copy for
   * the same reason, so both conventions already coexist in this file; the
   * addresses are recorded here rather than picking one silently.
   *
   * ZERO callees: no call, no branch, no memory access, no in-scope callee, no
   * extern, no indirect or virtual dispatch (`depgraph.py deps
   * __ZNK13OZChannelBase11isObjectRefEv` lists nothing).
   */
  isObjectRef(): boolean {
    // @0x217b44  xorl %eax, %eax  ; @0x217b47 retq — the constant false.
    return false;
  }

  /**
   * `OZChannelBase::nofityObjCWrapperWillDelete()` — @ProChannel 0x4d5b8
   * (__ZN13OZChannelBase27nofityObjCWrapperWillDeleteEv).
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZN13OZChannelBase27nofityObjCWrapperWillDeleteEv.s):
   *   0x4d5b8  pushq  %rbp
   *   0x4d5b9  movq   %rsp, %rbp
   *   0x4d5bc  movq   %rdi, %rdx                 ; rdx = self (3rd ObjC arg = the channel ptr)
   *   0x4d5bf  movq   0x48(%rdi), %rdi           ; rdi = *(self + 0x48)  (the ObjC wrapper receiver)
   *   0x4d5c3  movq   0x9bd76(%rip), %rsi        ; rsi = @selector(_ozChannelWillBeDeleted:)  (selref @ 0xe9340)
   *   0x4d5ca  popq   %rbp
   *   0x4d5cb  jmpq   *0x7cf9f(%rip)             ; TAIL-CALL _objc_msgSend (imported stub GOT slot @ 0xca570)
   *
   * Semantics: `[(id)self->objcWrapper _ozChannelWillBeDeleted:(id)self]`. Fire-and-forget
   * notification to the ObjC bridge wrapper that the underlying C++ OZChannelBase is about
   * to be destroyed.
   *
   * Frontier: `_objc_msgSend` is a TRUE out-of-scope extern (ObjC runtime, libobjc.dylib) —
   * dispatched via ProChannel's imported-stubs GOT slot @0xca570. In this port there is no
   * ObjC runtime, so the dispatch is modelled as a boundary throw citing the exact GOT slot
   * and selref addresses (per the same policy as every other _objc_msgSend site in-tree).
   *
   * The ObjC wrapper field lives at offset 0x48 of the OZChannelBase layout. Layout not yet
   * fully decoded here — the field is loaded verbatim from that offset as an opaque `id`
   * pointer (unknown until an ObjC-bridge port is done); it may be null when no wrapper is
   * attached, in which case msgSend to nil is a documented ObjC no-op (nil-messaging), but
   * we cannot reproduce that behaviour without the runtime, so any invocation throws.
   */
  nofityObjCWrapperWillDelete(): void {
    // @0x4d5b8..0x4d5b9 — prologue.
    // @0x4d5bc — rdx = self (positional; ObjC 3rd arg).
    // @0x4d5bf — rdi = *(self + 0x48).  The ObjC wrapper `id` (opaque; layout TBD).
    const wrapper = this.__objc_wrapper_at_0x48; // (mirrors `movq 0x48(%rdi), %rdi` @0x4d5bf)
    // @0x4d5c3 — rsi = selref `_ozChannelWillBeDeleted:` @ProChannel selref 0xe9340.
    const _selector = "_ozChannelWillBeDeleted:";
    // @0x4d5ca..0x4d5cb — TAIL-CALL through the ObjC msgSend imported-stub GOT slot @0xca570.
    // libobjc runtime is out-of-scope: throw at the extern boundary citing the exact GOT slot.
    throw new Error(
      "OZChannelBase::nofityObjCWrapperWillDelete() would dispatch " +
        `[(id)wrapper=${String(wrapper)} ${_selector} (id)self] via _objc_msgSend ` +
        "@ProChannel imported-stubs GOT 0xca570 (selref @0xe9340). The ObjC runtime " +
        "(libobjc.dylib _objc_msgSend) is a TRUE out-of-scope extern — see policy on " +
        "boundary stubs. Called from OZChannelBase dtor path to notify the paired ObjC " +
        "bridge wrapper that this C++ instance is going away.",
    );
  }

  /** @ProChannel OZChannelBase layout offset 0x48 (read @0x4d5bf).
   *  Opaque `id` pointer to the paired ObjC wrapper. Layout not yet decoded — the ctor
   *  that populates this field is a separate ledger unit. Modelled as `unknown | null`
   *  so the offset-0x48 load in nofityObjCWrapperWillDelete has a well-typed source. */
  private __objc_wrapper_at_0x48: unknown | null = null;

  /** @ProChannel OZChannelBase layout offset 0x30 (read+write @0x49b2a/0x49b32).
   *  Parent OZChannelFolder pointer. Non-null when this channel is nested inside a folder;
   *  cleared by unregisterParent. Ctor that sets it is a separate ledger unit; modelled here
   *  as opaque | null because the OZChannelFolder class body isn't yet in this file. */
  private __parent_folder_at_0x30: unknown | null = null;

  /**
   * OZChannelBase::unregisterParent(OZChannelFolder*).
   * @ProChannel 0x49b26..0x49b3b  (__ZN13OZChannelBase16unregisterParentEP15OZChannelFolder)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZN13OZChannelBase16unregisterParentEP15OZChannelFolder.s):
   *   0x49b26  pushq  %rbp                        ; prologue
   *   0x49b27  movq   %rsp, %rbp                  ; prologue
   *   0x49b2a  cmpq   $0x0, 0x30(%rdi)            ; flags = (*(u64*)(this+0x30)) - 0   -> ZF=1 iff parent==NULL
   *   0x49b2f  setne  %al                         ; al = (ZF==0) = (parent != NULL) as a boolean
   *   0x49b32  movq   $0x0, 0x30(%rdi)            ; *(this+0x30) = 0   (clear the parent slot)
   *   0x49b3a  popq   %rbp                        ; epilogue
   *   0x49b3b  retq                               ; return %al (bool)
   *
   * Semantics: unconditionally clear the parent-folder pointer at offset 0x30 and return
   * `true` iff the slot HAD been non-null (i.e. we actually detached a parent) or `false`
   * if it was already null (no-op path). The `OZChannelFolder*` argument (%rsi) is IGNORED
   * — the disasm never reads it. Its identity doesn't matter; the channel just drops its
   * parent link. The parameter is likely there for symmetry with a registerParent()
   * counterpart / RAII paired API, and possibly for a caller-side assertion at a higher
   * layer that the folder pointer matches. In this port we preserve the parameter but
   * mark it unused (`_` prefix) to keep the signature faithful.
   *
   * Note: return type is `bool` in x86 ABI: the `setne %al` produces a byte in %al which
   * is the whole return value (no upper-bit clear needed — the ABI leaves the upper bytes
   * unspecified for a bool return, and callers do their own zext/movzbl).
   *
   * Note: the SETNE-then-STORE ordering matters. The compare reads the OLD value at 0x30
   * (setne captures whether it was non-null), THEN the store overwrites it with null. In
   * TS we mirror this exactly: capture `had` first, then null out the field.
   */
  unregisterParent(_folder: unknown): boolean {
    // @0x49b2a cmpq $0x0, 0x30(%rdi) + @0x49b2f setne %al  — "was the parent slot non-null?"
    const had = this.__parent_folder_at_0x30 !== null;
    // @0x49b32 movq $0x0, 0x30(%rdi)  — clear the parent slot to null.
    this.__parent_folder_at_0x30 = null;
    // @0x49b3b retq — return %al (bool).
    return had;
  }

  /** @ProChannel OZChannelBase layout offset +0x39 (one flag byte).
   *  Read @0x4a42f as `testb $0x20, 0x39(%rdi)` — a small bitfield. Bit
   *  0x20 is set on nodes that are the "channel root" (owned by an
   *  OZChannelObjectRootBase). Other bits in this byte are used by
   *  sibling methods not yet transcribed; we model the whole byte here
   *  and mask the bit at the read-site to preserve the disasm's
   *  arithmetic exactly. The ctor that populates this field is a
   *  separate ledger unit and will fill this in when landed. Modelled
   *  as `number` (a 0..0xff byte). */
  private __flag_byte_at_0x39: number = 0;

  /**
   * OZChannelBase::getChannelRootBase() const.
   * @ProChannel 0x4a426..0x4a455
   * (__ZNK13OZChannelBase18getChannelRootBaseEv)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase18getChannelRootBaseEv.s):
   *   0x4a426  pushq  %rbp                        ; prologue
   *   0x4a427  movq   %rsp, %rbp                  ; prologue
   *   0x4a42a  testq  %rdi, %rdi                  ; ZF = (this == NULL)
   *   0x4a42d  je     0x4a43b                     ; if (this == NULL) goto bail
   *   0x4a42f  testb  $0x20, 0x39(%rdi)           ; ZF = ((*(u8*)(this+0x39)) & 0x20) == 0
   *   0x4a433  jne    0x4a43f                     ; if (bit 0x20 set) goto cast
   *   0x4a435  movq   0x30(%rdi), %rdi            ; this = *(this+0x30) = parent
   *   0x4a439  jmp    0x4a42a                     ; goto loop
   *
   *   0x4a43b  xorl   %eax, %eax                  ; rax = 0     (bail path — no root found)
   *   0x4a43d  popq   %rbp                        ; epilogue
   *   0x4a43e  retq                               ; return NULL
   *
   *   0x4a43f  leaq   __ZTI13OZChannelBase(%rip),   %rsi   ; arg1 = &typeinfo(OZChannelBase)
   *   0x4a446  leaq   __ZTI23OZChannelObjectRootBase(%rip), %rdx ; arg2 = &typeinfo(OZChannelObjectRootBase)
   *   0x4a44d  xorl   %ecx, %ecx                  ; arg3 = 0    (hint = -1UL not; here literal 0)
   *   0x4a44f  popq   %rbp                        ; epilogue-before-tailcall
   *   0x4a450  jmp    0xacea0                     ## symbol stub for: ___dynamic_cast
   *                                               ; tail-call ___dynamic_cast(this, srcType, dstType, hint)
   *                                               ;   -> returns OZChannelObjectRootBase* or NULL
   *
   * SEMANTICS:
   *   Walk the parent chain (via +0x30) starting from `this`, stopping
   *   at the FIRST node with bit 0x20 set in its flag byte at +0x39
   *   (the "channel root" flag). At that stopping node, do a
   *   cross-cast: `dynamic_cast<OZChannelObjectRootBase*>(stop_node)`.
   *   Return NULL if the walk hits a NULL parent before finding the
   *   flag bit (chain terminates without a root — floating fragment).
   *
   *   `___dynamic_cast` is the Itanium C++ ABI symbol implementing the
   *   RTTI cross-cast; it walks the class-hierarchy metadata to compute
   *   the correct pointer adjustment from an OZChannelBase* to an
   *   OZChannelObjectRootBase* (a sibling in the multiple-inheritance
   *   hierarchy of concrete root classes). The hint argument (arg3=0)
   *   is `ptrdiff_t src2dst_offset` — 0 means "no hint given"; a value
   *   of -1 would say "definitely fails"; positive would encode a fast-
   *   path public-inheritance offset (per libcxxabi rules). The
   *   compiler here decided to leave the hint 0 (no precomputed
   *   offset — must consult full RTTI at runtime).
   *
   * DEPENDENCIES: none in-scope. The one external is `___dynamic_cast`
   * @ProChannel stub 0xacea0 — libcxxabi (part of libc++abi.dylib), a
   * TRUE out-of-scope extern like the other C++-runtime callees in this
   * port (operator new, __call_once). Modelled as a boundary stub.
   */
  getChannelRootBase(): OZChannelObjectRootBase | null {
    // The disasm is a tight loop over `this` — a pointer walk. In TS we
    // reflect that with a mutable local; JS's null-punning matches the
    // x86 `testq %rdi,%rdi ; je bail` and NULL-parent termination.
    // We DO NOT recurse — the disasm uses a `jmp 0x4a42a` back-edge, a
    // proper loop (not a self-call).
    let cur: OZChannelBase | null = this;

    // @0x4a42a..0x4a439 — the loop body.
    while (cur !== null) {
      // @0x4a42a  testq %rdi,%rdi ; @0x4a42d  je 0x4a43b
      //     already handled by the while-condition (we entered the body
      //     only if `cur` is non-null — the disasm re-checks at every
      //     iteration, which we model by re-checking at each while-turn).

      // @0x4a42f  testb $0x20, 0x39(%rdi)  ; @0x4a433  jne 0x4a43f
      //   Read the flag byte at +0x39; if bit 0x20 is set, exit the
      //   loop and go to the dynamic_cast at @0x4a43f.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagByte: number = (cur as any).__flag_byte_at_0x39 as number;
      if ((flagByte & 0x20) !== 0) {
        // @0x4a43f..0x4a450 — the "cast" tail.
        //   @0x4a43f  leaq  __ZTI13OZChannelBase(%rip),  %rsi   ; srcType = typeinfo(OZChannelBase)
        //   @0x4a446  leaq  __ZTI23OZChannelObjectRootBase(%rip), %rdx ; dstType = typeinfo(OZChannelObjectRootBase)
        //   @0x4a44d  xorl  %ecx, %ecx                          ; hint = 0
        //   @0x4a450  jmp   0xacea0                             ; tail-call ___dynamic_cast
        //             -> return ___dynamic_cast(cur, &typeinfo(OZChannelBase),
        //                                       &typeinfo(OZChannelObjectRootBase), 0)
        return dynamic_cast_to_OZChannelObjectRootBase_stub(cur);
      }

      // @0x4a435  movq 0x30(%rdi), %rdi  ; cur = cur->parent
      // @0x4a439  jmp  0x4a42a           ; goto loop
      //
      // The parent field at +0x30 is typed `unknown | null` in this
      // file (see `__parent_folder_at_0x30` above) because the parent
      // may be any OZChannelFolder in the general case. In THIS
      // function the walk only cares whether the pointer is
      // null/non-null and (via the flag byte) whether it's the root —
      // the RTTI cast at the end handles the sibling-cross issue. We
      // narrow via an unchecked assign consistent with the x86 raw
      // pointer walk; the eventual dynamic_cast is what validates the
      // final destination type.
      const parent = cur.__parent_folder_at_0x30 as
        | OZChannelBase
        | null;
      cur = parent;
    }

    // @0x4a43b..0x4a43e — the "bail" path.
    //   0x4a43b  xorl %eax,%eax  ; @0x4a43d popq %rbp ; @0x4a43e retq
    //   return NULL.
    return null;
  }

  /**
   * OZChannelBase::getChannelRoot() const.
   * @ProChannel 0x4a58a..0x4a5b9
   * (__ZNK13OZChannelBase14getChannelRootEv)
   *
   * A SEPARATE exported symbol from `getChannelRootBase()` @0x4a426 above,
   * with a byte-for-byte identical body at its own addresses (the linker did
   * NOT ICF-fold them — `nm` lists both 0x4a426 and 0x4a58a). It is
   * transcribed here independently rather than delegating to its twin, so the
   * ledger entry for THIS address carries its own instruction-level citation.
   *
   * FULL DISASM (raw-port/re/disasm/
   * ProChannel.__ZNK13OZChannelBase14getChannelRootEv.s — 14 lines):
   *
   *   0x4a58a  pushq  %rbp                              ; prologue
   *   0x4a58b  movq   %rsp, %rbp
   *   0x4a58e  testq  %rdi, %rdi                        ; ZF = (cur == NULL)
   *   0x4a591  je     0x4a59f                           ; NULL -> bail
   *   0x4a593  testb  $0x20, 0x39(%rdi)                 ; flag byte +0x39 & 0x20
   *   0x4a597  jne    0x4a5a3                           ; set -> cross-cast
   *   0x4a599  movq   0x30(%rdi), %rdi                  ; cur = cur->parent (+0x30)
   *   0x4a59d  jmp    0x4a58e                           ; loop back-edge
   *   0x4a59f  xorl   %eax, %eax                        ; bail: result = NULL
   *   0x4a5a1  popq   %rbp
   *   0x4a5a2  retq
   *   0x4a5a3  leaq   __ZTI13OZChannelBase(%rip), %rsi           ; srcType
   *   0x4a5aa  leaq   __ZTI23OZChannelObjectRootBase(%rip), %rdx ; dstType
   *   0x4a5b1  xorl   %ecx, %ecx                        ; hint = 0
   *   0x4a5b3  popq   %rbp                              ; epilogue-before-tailcall
   *   0x4a5b4  jmp    0xacea0                           ## symbol stub: ___dynamic_cast
   *   0x4a5b9  nop                                      ; padding, not executed
   *
   * SEMANTICS: walk the parent chain from `this` through +0x30, stopping at
   * the FIRST node whose flag byte at +0x39 has bit 0x20 set, and cross-cast
   * THAT node with `dynamic_cast<OZChannelObjectRootBase*>`. If the walk
   * reaches a NULL parent first, return NULL.
   *
   * Note the back-edge at @0x4a59d targets @0x4a58e — the NULL test — so the
   * check is re-run on every iteration (including on the parent just loaded),
   * which the `while (cur !== null)` below reproduces. The final transfer is a
   * TAIL-JMP (`jmp`, not `callq`) into ___dynamic_cast, so this frame's result
   * IS the cast's result — nothing is post-processed.
   *
   * DEPENDENCIES: none in-scope. The one external is `___dynamic_cast`
   * @ProChannel stub 0xacea0 — libc++abi, a TRUE out-of-scope extern, routed
   * through the SAME `dynamic_cast_to_OZChannelObjectRootBase_stub` boundary
   * this file already uses for `getChannelRootBase()` @0x4a450 and
   * `getAncestorRootBase()` (identical srcType/dstType/hint triple).
   */
  getChannelRoot(): OZChannelObjectRootBase | null {
    // @0x4a58e — the receiver is the initial walk cursor. As in the twin
    // above this is a LOOP (`jmp 0x4a58e` back-edge @0x4a59d), not recursion.
    let cur: OZChannelBase | null = this;

    // @0x4a58e..0x4a59d — the loop body.
    while (cur !== null) {
      // @0x4a58e  testq %rdi,%rdi ; @0x4a591 je 0x4a59f
      //   Re-checked each turn by the while-condition (the back-edge lands on
      //   this test, so the parent loaded below is tested before use).

      // @0x4a593  testb $0x20, 0x39(%rdi) ; @0x4a597 jne 0x4a5a3
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagByte: number = (cur as any).__flag_byte_at_0x39 as number;
      if ((flagByte & 0x20) !== 0) {
        // @0x4a5a3..0x4a5b4 — the cross-cast tail:
        //   leaq typeinfo(OZChannelBase) -> %rsi           (srcType)
        //   leaq typeinfo(OZChannelObjectRootBase) -> %rdx (dstType)
        //   xorl %ecx,%ecx                                 (hint = 0)
        //   jmp  0xacea0                                   (tail-call)
        return dynamic_cast_to_OZChannelObjectRootBase_stub(cur);
      }

      // @0x4a599  movq 0x30(%rdi), %rdi ; @0x4a59d jmp 0x4a58e
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parent = (cur as any).__parent_folder_at_0x30 as
        | OZChannelBase
        | null;
      cur = parent;
    }

    // @0x4a59f..0x4a5a2 — the bail path: xorl %eax,%eax ; popq %rbp ; retq.
    return null;
  }

  /**
   * OZChannelBase::getAncestorRootBase() const.
   * @ProChannel 0x4a818..0x4a866
   * (__ZNK13OZChannelBase19getAncestorRootBaseEv)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase19getAncestorRootBaseEv.s):
   *   0x4a818  testq  %rdi, %rdi                        ; ZF = (this == NULL)
   *   0x4a81b  je     0x4a864                           ; if NULL -> bail (return NULL)
   *   0x4a81d  pushq  %rbp                              ; prologue
   *   0x4a81e  movq   %rsp, %rbp
   *   0x4a821  pushq  %r15
   *   0x4a823  pushq  %r14
   *   0x4a825  pushq  %rbx
   *   0x4a826  pushq  %rax
   *   0x4a827  movq   %rdi, %rbx                        ; rbx = walking-this
   *   0x4a82a  xorl   %eax, %eax                        ; result accumulator = NULL
   *   0x4a82c  leaq   __ZTI13OZChannelBase(%rip), %r14  ; srcType = typeinfo(OZChannelBase)
   *   0x4a833  leaq   __ZTI23OZChannelObjectRootBase(%rip), %r15
   *                                                    ; dstType = typeinfo(OZChannelObjectRootBase)
   * [LOOP @0x4a83a]:
   *   0x4a83a  testb  $0x20, 0x39(%rbx)                 ; ZF = ((*(u8*)(rbx+0x39)) & 0x20) == 0
   *   0x4a83e  je     0x4a850                           ; if (bit 0x20 CLEAR) skip cast, just advance
   *   0x4a840  movq   %rbx, %rdi                        ; arg0 = current node
   *   0x4a843  movq   %r14, %rsi                        ; arg1 = srcType
   *   0x4a846  movq   %r15, %rdx                        ; arg2 = dstType
   *   0x4a849  xorl   %ecx, %ecx                        ; arg3 = 0 (hint = "no hint")
   *   0x4a84b  callq  0xacea0                           ; rax = ___dynamic_cast(...)
   *                                                    ; NOTE: this is a CALL not a tail-jmp — the
   *                                                    ; result overwrites the accumulator in %rax,
   *                                                    ; then the loop continues.
   * [ADVANCE @0x4a850]:
   *   0x4a850  movq   0x30(%rbx), %rbx                  ; rbx = rbx->parent
   *   0x4a854  testq  %rbx, %rbx                        ; ZF = (parent == NULL)
   *   0x4a857  jne    0x4a83a                           ; if (parent != NULL) goto LOOP
   *   0x4a859  addq   $0x8, %rsp                        ; epilogue
   *   0x4a85d  popq   %rbx
   *   0x4a85e  popq   %r14
   *   0x4a860  popq   %r15
   *   0x4a862  popq   %rbp
   *   0x4a863  retq                                     ; return %rax (last-set cast result)
   *
   *   0x4a864  xorl   %eax, %eax                        ; NULL-this bail
   *   0x4a866  retq                                     ; return NULL
   *
   * SEMANTICS (contrasted with `getChannelRootBase()` above):
   *   `getChannelRootBase()` walks the parent chain and stops at the
   *   FIRST node with flag bit 0x20 set at +0x39, then cross-casts
   *   THAT node and returns the result.
   *
   *   `getAncestorRootBase()` walks the ENTIRE parent chain to NULL.
   *   Every visited node with bit 0x20 set at +0x39 is cross-cast; the
   *   accumulator `%rax` retains the LAST successful cast. The final
   *   return is therefore the TOPMOST (root-most) ancestor node with
   *   bit 0x20 set that is also cross-castable to OZChannelObjectRootBase.
   *   If no ancestor has bit 0x20 set (or every cross-cast returns
   *   NULL), the initial `xorl %eax,%eax` (line 0x4a82a) leaves %rax
   *   NULL and the function returns NULL.
   *
   *   The NULL-this fast path (@0x4a818/0x4a81b/@0x4a864/@0x4a866)
   *   returns NULL without touching any state — matches the same
   *   pattern used at the top of `getChannelRootBase()`.
   *
   * DEPENDENCIES: none in-scope. The one external is `___dynamic_cast`
   * @ProChannel stub 0xacea0 — same libc++abi boundary stub already
   * modelled at the top of this file for `getChannelRootBase()`; the
   * same `dynamic_cast_to_OZChannelObjectRootBase_stub` is invoked
   * (identical srcType/dstType/hint at each call-site).
   */
  getAncestorRootBase(): OZChannelObjectRootBase | null {
    // @0x4a818/0x4a81b — NULL-this fast path.
    //
    // In C++ this can happen because the function is const-qualified
    // and the compiler will happily fold `((OZChannelBase*)nullptr)->
    // getAncestorRootBase()` into a call with %rdi = 0. TS never has
    // a `null` `this` so this branch is only reachable in principle;
    // we keep it for shape-faithfulness. (No test can exercise it in
    // TypeScript — but the shape mirrors the disasm.)
    //
    // Note: no `this` sentinel exists in TS, so the fast path is
    // effectively dead here. The disasm's semantics are captured by
    // the outer `if (cur === null) return null;` immediately below
    // the loop entry — since our first iteration reads `cur = this`,
    // and `this` is guaranteed non-null in TS method calls, control
    // never diverts. We still model the check inside the loop's
    // termination.

    // @0x4a827  movq %rdi,%rbx     ; walking-this = this
    let cur: OZChannelBase | null = this;

    // @0x4a82a  xorl %eax,%eax     ; result accumulator initialised to NULL
    let result: OZChannelObjectRootBase | null = null;

    // @0x4a82c/@0x4a833 — the two typeinfo pointers are constants of
    // the loop; nothing to model in TS beyond routing all call-sites
    // through the same boundary stub (below).

    // @0x4a83a..0x4a857 — the main loop.
    while (cur !== null) {
      // @0x4a83a  testb $0x20, 0x39(%rbx)  ; @0x4a83e je 0x4a850
      //   Read the flag byte at +0x39; if bit 0x20 is SET, do the
      //   cross-cast; otherwise skip to ADVANCE.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagByte: number = (cur as any).__flag_byte_at_0x39 as number;
      if ((flagByte & 0x20) !== 0) {
        // @0x4a840..0x4a84b — CALL (not tail-jmp) into ___dynamic_cast.
        //   The result overwrites the accumulator %rax; the loop
        //   continues walking parents. So each successful cast REPLACES
        //   the previous result — the final return is the LAST match
        //   encountered while walking toward the root.
        result = dynamic_cast_to_OZChannelObjectRootBase_stub(cur);
      }
      // @0x4a850  movq 0x30(%rbx),%rbx  ; cur = cur->parent
      const parent = cur.__parent_folder_at_0x30 as
        | OZChannelBase
        | null;
      cur = parent;
      // @0x4a854/@0x4a857 — the while-condition handles the NULL check
      // + back-edge exactly like the x86 loop.
    }

    // @0x4a859..0x4a863 — epilogue + return %rax.
    return result;
  }

  /** @ProChannel OZChannelBase layout offset 0x38 (read+write @0x4bb4c/0x4bb5c).
   *  Wide flags word (u64). Currently only two bits are known:
   *    * bit 19 (0x80000)  — "eligible-for-solo-inheritance" test bit. Read by
   *      `setChildSolo(false)` @0x4bb50 via `btl $0x13, %eax`. When SET on a
   *      given ancestor, that ancestor's bit 20 (0x100000) is turned on to
   *      indicate a solo descendant.
   *    * bit 20 (0x100000) — "has-solo-child" propagated flag. Set by
   *      `setChildSolo(false)` @0x4bb56 via `orq $0x100000, %rax`.
   *  Other bits are unused by the transcribed methods so far. Modelled as a
   *  BigInt so the u64 semantics (in particular that `btl $0x13` reads only
   *  the low dword) are faithful; the low 32 bits are what the disasm's
   *  `btl` / `orq` immediates operate on. Default 0 matches a
   *  zero-initialised C++ struct; the setter path only ORs bits, never
   *  clears them. */
  private __flags_word_at_0x38: bigint = 0n;

  /** @ProChannel OZChannelBase layout offset 0x40 (write @0x4bb8e in
   *  saveStateAsDefault). The "default state" snapshot word — a u64
   *  saved-copy of the flags at +0x38 with a specific mask applied. The
   *  mask `0xFFFFFFFDECA4CF86` (the movabsq immediate at @0x4bb80) clears
   *  a set of transient/volatile bits so that the "default" excludes
   *  runtime-only state. Only saveStateAsDefault writes to this slot in
   *  the currently-transcribed method set; readers are separate ledger
   *  entries. Modelled as a BigInt for the same u64-fidelity reason as
   *  __flags_word_at_0x38. Default 0 matches a zero-initialised struct. */
  private __default_state_word_at_0x40: bigint = 0n;

  /**
   * OZChannelBase::setChildSolo(bool).
   * @ProChannel 0x4bb42..0x4bb6c
   * (__ZN13OZChannelBase12setChildSoloEb)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZN13OZChannelBase12setChildSoloEb.s,
   * 17 lines including prologue/epilogue):
   *
   *   0x4bb42  pushq  %rbp                        ; prologue
   *   0x4bb43  movq   %rsp, %rbp                  ; prologue
   * [LOOP @0x4bb46]:
   *   0x4bb46  testb  $0x1, %sil                  ; test the bool arg (%sil = low byte of %rsi = `s`)
   *   0x4bb4a  jne    0x4bb60                     ; if (s != 0) goto ADVANCE
   *                                               ;   — skip modification of THIS node when
   *                                               ;     s is true; only the parents (with s=false)
   *                                               ;     get the flag propagated.
   *   0x4bb4c  movq   0x38(%rdi), %rax            ; rax = flags_at_+0x38  (u64)
   *   0x4bb50  btl    $0x13, %eax                 ; CF = bit 0x13 (=19) of the low dword
   *                                               ;   — `btl` operates on the 32-bit %eax view.
   *   0x4bb54  jae    0x4bb60                     ; if (CF == 0) goto ADVANCE
   *                                               ;   — `jae` = jump-if-above-or-equal = CF==0;
   *                                               ;     i.e. skip the OR when bit 19 is CLEAR.
   *                                               ;     Only when bit 19 is SET do we mark bit 20.
   *   0x4bb56  orq    $0x100000, %rax             ; rax |= (1 << 20)     ; set the "has-solo-child" bit
   *   0x4bb5c  movq   %rax, 0x38(%rdi)            ; store flags_at_+0x38
   * [ADVANCE @0x4bb60]:
   *   0x4bb60  movq   0x30(%rdi), %rdi            ; this = this->parent (u64 at +0x30)
   *   0x4bb64  xorl   %esi, %esi                  ; s = 0  (all subsequent iterations pass false)
   *   0x4bb66  testq  %rdi, %rdi                  ; ZF = (parent == NULL)
   *   0x4bb69  jne    0x4bb46                     ; if (parent != NULL) goto LOOP
   *   0x4bb6b  popq   %rbp                        ; epilogue
   *   0x4bb6c  retq                               ; return (void)
   *
   * SEMANTICS:
   *   Walk the parent chain starting from `this`. For each visited node
   *   except possibly THIS one (see below):
   *     - Read the flags word at +0x38.
   *     - If bit 19 (0x80000) is set, OR in bit 20 (0x100000) and
   *       write the flags back.
   *     - Advance to the parent via the +0x30 pointer.
   *   The bool argument `s` gates whether the FIRST node (this) is
   *   modified: when `s` is `true`, the initial iteration takes the
   *   ADVANCE branch WITHOUT reading/modifying flags, so the walk
   *   effectively begins at the parent. When `s` is `false`, `this`
   *   is a candidate for modification too. On subsequent iterations
   *   the register `%esi` is zeroed (see @0x4bb64), so parents always
   *   go through the check-and-set path.
   *
   *   In plain terms: "propagate the has-solo-descendant bit
   *   (0x100000) up the parent chain, marking every ancestor that
   *   already has bit 0x80000 set. If the caller passes `s=true`
   *   (meaning the CURRENT node is itself the solo one and doesn't
   *   need to be marked as its OWN solo-child), skip the first node."
   *
   * DEPENDENCIES: none. Pure loop over the parent chain — no calls,
   * no virtuals, no externs. The 17-line body has been transcribed
   * one-for-one below.
   */
  setChildSolo(s: boolean): void {
    // @0x4bb42/0x4bb43 — prologue.
    //
    // We model `%rdi` (the walking `this` pointer) as `cur`, and `%sil`
    // (the low byte of the bool arg) as `flag`. The loop mutates both
    // exactly like the x86 registers: `flag` is forcibly cleared to
    // false at each ADVANCE step (@0x4bb64  xorl %esi,%esi), and `cur`
    // is chased through the parent pointer (@0x4bb60  movq 0x30(%rdi),%rdi).
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cur: OZChannelBase | null = this;
    // @0x4bb46 — the loop entry uses the low bit of the bool arg. In TS
    // we normalise `boolean` down to that same "low bit" — `s ? 1 : 0`.
    let flag: number = s ? 1 : 0;

    // The loop terminates via @0x4bb66/0x4bb69 (`testq %rdi,%rdi ; jne 0x4bb46`)
    // — i.e. we stop when the walking pointer becomes NULL.
    while (cur !== null) {
      // @0x4bb46  testb $0x1, %sil   ; @0x4bb4a  jne 0x4bb60
      //   Test the low bit of `flag`. If set (bool arg is `true`), skip
      //   the read-modify-write block and go straight to ADVANCE.
      if ((flag & 0x1) === 0) {
        // @0x4bb4c  movq 0x38(%rdi), %rax     — load the u64 flags word.
        const rax_u64: bigint = cur.__flags_word_at_0x38;
        // @0x4bb50  btl $0x13, %eax           — CF = bit 19 of low dword.
        //           `btl` operates on the 32-bit %eax view, so we mask
        //           to the low 32 bits to match. Bit 0x13 = bit 19.
        const eax_low32: number = Number(rax_u64 & 0xffffffffn);
        const cf: number = (eax_low32 >>> 19) & 1;
        // @0x4bb54  jae 0x4bb60                — jump if CF == 0.
        //           i.e. only fall through when bit 19 is SET.
        if (cf !== 0) {
          // @0x4bb56  orq $0x100000, %rax     — set bit 20 of the u64.
          //           0x100000 fits in 32 bits so `orq` and `orl` are
          //           equivalent here; we OR the u64 directly to match.
          const new_rax: bigint = rax_u64 | 0x100000n;
          // @0x4bb5c  movq %rax, 0x38(%rdi)  — write back.
          cur.__flags_word_at_0x38 = new_rax;
        }
      }
      // @0x4bb60  movq 0x30(%rdi), %rdi   — advance: cur = cur->parent.
      const parent = cur.__parent_folder_at_0x30 as OZChannelBase | null;
      cur = parent;
      // @0x4bb64  xorl %esi, %esi        — zero the bool for all
      //                                   subsequent iterations.
      flag = 0;
      // @0x4bb66/0x4bb69  testq %rdi,%rdi ; jne 0x4bb46
      //   — the while-condition handles the NULL check + back-edge.
    }
    // @0x4bb6b/0x4bb6c  popq %rbp ; retq — void return.
  }

  /**
   * OZChannelBase::saveStateAsDefault().
   * @ProChannel 0x4bb7c..0x4bb93
   * (__ZN13OZChannelBase18saveStateAsDefaultEv)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZN13OZChannelBase18saveStateAsDefaultEv.s,
   * 8 lines including prologue/epilogue):
   *
   *   0x4bb7c  pushq   %rbp                                ; prologue
   *   0x4bb7d  movq    %rsp, %rbp                          ; prologue
   *   0x4bb80  movabsq $-0x2135b307a, %rax                 ; rax = signed imm; bit-pattern
   *                                                       ;   = 0xFFFFFFFDECA4CF86 (u64 mask).
   *   0x4bb8a  andq    0x38(%rdi), %rax                    ; rax = this->flags_at_0x38 & mask
   *                                                       ; (AT&T: `dst = dst AND src`; here dst=rax,
   *                                                       ;  src=[rdi+0x38] — but the operation is
   *                                                       ;  commutative so the read direction doesn't
   *                                                       ;  matter). Note: `andq` reads 8 bytes from
   *                                                       ;  memory into rax with the mask kept in rax.
   *   0x4bb8e  movq    %rax, 0x40(%rdi)                    ; this->default_state_at_0x40 = rax
   *   0x4bb92  popq    %rbp                                ; epilogue
   *   0x4bb93  retq                                        ; void return
   *
   * Semantics: snapshot the current flags word (+0x38) into the "default
   * state" slot (+0x40) with a fixed mask applied that clears a set of
   * transient/runtime-only bits. The mask value @0x4bb80 is a compile-time
   * constant; per PORTING_SPEC.md Rule 5 it is documented as a named u64
   * with the address of its immediate.
   *
   * Note on `movabsq $-0x2135b307a, %rax`: this is the AT&T-syntax 64-bit
   * absolute move of the SIGNED immediate -0x2135b307a (2^33 + 0x135b307a
   * ≈ 8.895 GiB negative in signed). The disassembler's `## imm =
   * 0xFFFFFFFDECA4CF86` comment gives the unsigned/u64 bit-pattern of the
   * same 8 bytes — the value that lands in %rax. We use the bigint literal
   * `0xFFFFFFFDECA4CF86n` (matching the u64 pattern) so that the JS `AND`
   * reproduces the exact bit-pattern the machine would compute.
   */
  saveStateAsDefault(): void {
    // ------------------------------------------------------------
    // @0x4bb7c..0x4bb7d — prologue (no TS-visible effect).
    // @0x4bb80 — movabsq $-0x2135b307a, %rax
    //   Load the 64-bit mask into %rax. Cited as the u64 bit-pattern
    //   0xFFFFFFFDECA4CF86 (see doc comment above for the two encodings).
    //   @const ProChannel 0x4bb80  (movabsq immediate)
    // ------------------------------------------------------------
    const MASK: bigint = 0xFFFFFFFDECA4CF86n;

    // ------------------------------------------------------------
    // @0x4bb8a — andq 0x38(%rdi), %rax
    //   rax = rax & this->__flags_word_at_0x38.
    // ------------------------------------------------------------
    const rax: bigint = MASK & this.__flags_word_at_0x38;

    // ------------------------------------------------------------
    // @0x4bb8e — movq %rax, 0x40(%rdi)
    //   this->__default_state_word_at_0x40 = rax.
    // ------------------------------------------------------------
    this.__default_state_word_at_0x40 = rax;

    // @0x4bb92..0x4bb93 — epilogue + retq (void return).
  }

  /**
   * OZChannelBase::getObjectManipulator() const.
   * @ProChannel 0x4a54e..0x4a583
   * (__ZNK13OZChannelBase20getObjectManipulatorEv)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase20getObjectManipulatorEv.s,
   * 20 body lines including prologue/epilogue):
   *
   *   0x4a54e  pushq  %rbp                                          ; prologue
   *   0x4a54f  movq   %rsp, %rbp                                    ; prologue
   * [LOOP @0x4a552]:
   *   0x4a552  testq  %rdi, %rdi                                    ; ZF = (this == NULL)
   *   0x4a555  je     0x4a563                                       ; if NULL goto BAIL
   *   0x4a557  testb  $0x20, 0x39(%rdi)                             ; ZF = ((*(u8*)(this+0x39)) & 0x20) == 0
   *   0x4a55b  jne    0x4a567                                       ; if bit 0x20 SET goto CAST
   *   0x4a55d  movq   0x30(%rdi), %rdi                              ; this = *(this+0x30) = parent
   *   0x4a561  jmp    0x4a552                                       ; goto LOOP
   * [BAIL @0x4a563]:
   *   0x4a563  xorl   %eax, %eax                                    ; rax = 0
   *   0x4a565  popq   %rbp                                          ; epilogue
   *   0x4a566  retq                                                 ; return NULL
   * [CAST @0x4a567]:
   *   0x4a567  leaq   __ZTI13OZChannelBase(%rip),  %rsi             ; arg1 = &typeinfo(OZChannelBase)
   *   0x4a56e  leaq   __ZTI23OZChannelObjectRootBase(%rip), %rdx    ; arg2 = &typeinfo(OZChannelObjectRootBase)
   *   0x4a575  xorl   %ecx, %ecx                                    ; arg3 = 0 (hint = "no hint")
   *   0x4a577  callq  0xacea0                                       ## ___dynamic_cast (symbol stub)
   *                                                                 ;   rax = OZChannelObjectRootBase* (or NULL)
   *   0x4a57c  movq   (%rax), %rcx                                  ; rcx = *rax = vtable ptr of the root
   *                                                                 ;   (NB: if rax == NULL this is a NULL-deref
   *                                                                 ;    crash — the machine relies on the
   *                                                                 ;    ancestor invariant to guarantee non-NULL)
   *   0x4a57f  movq   %rax, %rdi                                    ; arg1 = the root pointer
   *   0x4a582  popq   %rbp                                          ; epilogue-before-tailcall
   *   0x4a583  jmpq   *0x350(%rcx)                                  ; tail-call vtable[0x350/8 = slot 106]
   *                                                                 ;   → virtual getObjectManipulator on the
   *                                                                 ;     concrete root class.
   *
   * SEMANTICS:
   *   Walk the parent chain (via +0x30) starting from `this`, stopping at
   *   the FIRST node with bit 0x20 set in its flag byte at +0x39 (the
   *   "channel root" flag — same criterion as getChannelRootBase). At that
   *   stopping node, dynamic_cast to OZChannelObjectRootBase* and then
   *   VIRTUAL-DISPATCH through the resulting root's vtable at offset 0x350
   *   (slot 106) — that virtual is the concrete root class's
   *   "getObjectManipulator" implementation. Return NULL if the walk hits
   *   a NULL parent before finding the flag bit.
   *
   *   `getObjectManipulator` therefore is NOT implemented on
   *   OZChannelObjectRootBase itself in this translation unit — it is a
   *   virtual whose concrete impl lives on the derived root class. The
   *   base's job is only to locate that root and delegate.
   *
   * DEPENDENCIES:
   *   - `dynamic_cast_to_OZChannelObjectRootBase_stub` — the Itanium C++
   *     ABI cross-cast helper (`___dynamic_cast` @ProChannel stub 0xacea0,
   *     libc++abi.dylib). True out-of-scope extern; modelled as a boundary
   *     stub already defined at the top of this file for the sibling
   *     `getChannelRootBase()`.
   *   - vtable slot 0x350 on the concrete root class — modelled as a
   *     duck-typed optional hook `__vtable_0x350_getObjectManipulator` on
   *     the OZChannelObjectRootBase runtime, following the same pattern as
   *     `__vtable_0x2c8_getTimeExtent` in OZChannelObjectRootBase.ts. Not
   *     yet implemented on the base — subclasses (concrete roots) that
   *     have been ported must provide the slot. If the slot is missing,
   *     we throw with the @0xADDR of the vtable dispatch — matching what
   *     the disasm would do (jump to a NULL / uninit vtable entry crashes
   *     the process; a loud throw is the honest TS analogue).
   */
  getObjectManipulator(): unknown {
    // @0x4a54e/0x4a54f — prologue (no TS-visible effect).
    //
    // We model `%rdi` (the walking `this` pointer) as `cur`. The loop mirrors
    // the x86: chase +0x30 (parent) until either NULL (bail: return NULL) or
    // bit 0x20 of the byte at +0x39 is set (found root: cast + virtual-dispatch).
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cur: OZChannelBase | null = this;

    // @0x4a552..0x4a561 — the loop body. Terminated by the two branches
    // (je 0x4a563 → BAIL, jne 0x4a567 → CAST).
    while (cur !== null) {
      // @0x4a552  testq %rdi,%rdi ; @0x4a555  je 0x4a563
      //   The NULL check is handled by the `while (cur !== null)` header.
      //   The x86 re-checks at every iteration; so do we.

      // @0x4a557  testb $0x20, 0x39(%rdi) ; @0x4a55b  jne 0x4a567
      //   Read the flag byte at +0x39; if bit 0x20 is set, jump to CAST.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagByte: number = (cur as any).__flag_byte_at_0x39 as number;
      if ((flagByte & 0x20) !== 0) {
        // ------------------------------------------------------------
        // CAST + virtual-dispatch tail (@0x4a567..0x4a583).
        // ------------------------------------------------------------
        // @0x4a567  leaq __ZTI13OZChannelBase(%rip), %rsi
        // @0x4a56e  leaq __ZTI23OZChannelObjectRootBase(%rip), %rdx
        // @0x4a575  xorl %ecx, %ecx
        // @0x4a577  callq 0xacea0  (___dynamic_cast)
        //   rax = dynamic_cast<OZChannelObjectRootBase*>(cur), or NULL.
        //
        // NB: unlike getChannelRootBase() @0x4a450 which uses a `jmp`
        // (tail-call), this function uses `callq` because it still has
        // work to do afterwards: load the vtable, then jmpq through slot
        // 0x350. The C++-runtime call is otherwise identical.
        const root: OZChannelObjectRootBase | null =
          dynamic_cast_to_OZChannelObjectRootBase_stub(cur);

        // @0x4a57c  movq (%rax), %rcx    — rcx = *root = vtable pointer.
        //   If dynamic_cast returned NULL this is a NULL-deref crash in
        //   the native binary. In TS the analogous fault is a throw; we
        //   let the ambient behaviour of accessing a hook on `null`
        //   surface (see below) — but guard explicitly to give a loud
        //   diagnostic instead of the generic "cannot read properties
        //   of null" so the fault-mode matches the disasm site.
        if (root === null) {
          throw new Error(
            "OZChannelBase::getObjectManipulator @ProChannel 0x4a57c — " +
              "___dynamic_cast returned NULL for the ancestor with the " +
              "0x20 root-flag set; the native binary would NULL-deref " +
              "loading vtable at (rax). Ancestor invariant violated.",
          );
        }

        // @0x4a582  popq %rbp
        // @0x4a583  jmpq *0x350(%rcx)  — tail-call vtable[0x350/8 = slot 106].
        //   The vtable slot is a duck-typed optional method on the
        //   concrete root; same modelling as OZChannelObjectRootBase's
        //   own `__vtable_0x2c8_getTimeExtent` hook.
        interface OZChannelObjectRootWithManipulatorVTable
          extends OZChannelObjectRootBase {
          /** Vtable slot 0x350 (slot 106) — the root's virtual
           *  `getObjectManipulator()`. Concrete root classes override
           *  this; the base class in raw-port does not implement it. */
          __vtable_0x350_getObjectManipulator?(): unknown;
        }
        const fn = (root as OZChannelObjectRootWithManipulatorVTable)
          .__vtable_0x350_getObjectManipulator;
        if (fn === undefined) {
          throw new Error(
            "OZChannelBase::getObjectManipulator @ProChannel 0x4a583 — " +
              "vtable slot 0x350 (__vtable_0x350_getObjectManipulator) " +
              "not implemented on the concrete OZChannelObjectRootBase " +
              "subclass. Native binary would jmpq through the concrete " +
              "class's own override. Not yet transcribed.",
          );
        }
        // Tail-call semantics: return whatever the vtable slot returns.
        // The `%rdi` register is set to `%rax` (@0x4a57f) so the callee
        // receives the ROOT pointer as `this`, not the original leaf.
        // We reflect that by invoking the hook bound to `root`.
        return fn.call(root);
      }

      // @0x4a55d  movq 0x30(%rdi), %rdi   — cur = cur->parent.
      // @0x4a561  jmp  0x4a552            — goto loop.
      const parent = cur.__parent_folder_at_0x30 as OZChannelBase | null;
      cur = parent;
    }

    // @0x4a563..0x4a566 — BAIL: xorl %eax,%eax ; popq %rbp ; retq
    //   return NULL.
    return null;
  }

  /**
   * OZChannelBase::getPath(OZChannelBase const* endCh) const.
   * @0x000000000004a64e..0x000000000004a813  (ProChannel.framework)
   *
   * Signature (Itanium sret ABI, mangled `__ZNK13OZChannelBase7getPathEPKS_`):
   *   void getPath(std::string* sret     [rdi],
   *                OZChannelBase* self   [rsi],
   *                OZChannelBase* endCh  [rdx]) const;
   * The sret string is constructed in-place in the caller's stack slot; the
   * disasm initialises `*rdi` to an empty SSO basic_string @0x4a678-0x4a691.
   *
   * Semantics recovered from the disasm:
   *
   *   accum = ""                                        // @0x4a691 assign("")
   *   if (self != endCh) {
   *     cur = self
   *     do {
   *       // @0x4a6af  ecx = cur->id  (u32 at +0x18 -> `this.id`)
   *       // @0x4a6c4  snprintf(local, 32, "%u", cur->id)
   *       // @0x4a6c9..0x4a6e4  If accum is non-empty, append '/' at local[strlen].
   *       //   The SSO check reads *rbx (accum) low byte: if bit0 set (long-form)
   *       //   read size at +0x8; if the low byte itself is non-zero (short-form)
   *       //   short-form size is non-zero. Either way "accum is non-empty".
   *       // @0x4a716  accum = local + accum   (temp.assign(local); temp.append(accum); accum = temp)
   *       // @0x4a721  cur = cur->parent  (movq 0x30(%r14), %r14)
   *     } while (cur != endCh)
   *     // @0x4a72a  testq %r15,%r15 ; je 4a7b8
   *     if (endCh != NULL) {
   *       // @0x4a733  movw $0x2e, -0x50(%rbp)   — buffer becomes "."  (0x2e = '.', high byte 0)
   *       // @0x4a739  jmp 0x4a75b               — reuse finalise (append '/' if accum non-empty, prepend)
   *       accum = "." + ('/' if accum non-empty else '') + accum
   *     }
   *   } else {
   *     // @0x4a73b  self == endCh at entry
   *     if (endCh != NULL) {
   *       // @0x4a740  snprintf(local, 32, "%u", endCh->id)
   *       // @0x4a75b..0x4a7b3  same finalise (append '/' if accum non-empty, prepend)
   *       accum = "<endCh.id>" + ('/' if accum non-empty else '') + accum
   *     }
   *     // both null OR endCh==NULL: accum stays ""
   *   }
   *
   * Walk direction: startCh -> startCh->parent -> ... -> endCh (via +0x30).
   * Each step PREPENDS the current node's id to the accumulator, so the
   * returned path reads highest-ancestor-first / deepest-leaf-last, with
   * a trailing '/' after every id and (when the walk actually reached a
   * non-null endCh) a leading "./".
   *
   * Examples (for a chain  A -> B -> C = endCh, A being `self`):
   *   getPath(&C) starting from A:  "./C/B/A/"
   *   getPath(NULL) starting from A: "A/" once A->parent hits NULL — but note
   *     the disasm stops the loop only when cur == endCh, so with endCh=NULL
   *     the loop keeps walking parents; if the chain ever hits NULL BEFORE
   *     matching endCh the native code would segfault dereferencing +0x18/+0x30.
   *     Callers therefore only pass endCh that is guaranteed to lie on the
   *     parent chain of `self` (or equal to `self`). We faithfully mirror
   *     that: no NULL-parent guard is emitted — the loop is `do-while`.
   *   getPath(self=endCh, endCh=&C non-null):  "C/"    (single-id, no leading ".")
   *   getPath(self=NULL, endCh=NULL):          ""
   *
   * Return: the sret string is returned by-value in the caller's slot. In
   * TS we return a plain `string` (the sret ABI is not observable at the
   * TS level; @0x4a7d7 `movq %rbx, %rax` returns the sret pointer to
   * satisfy the ABI, which callers use as-is).
   *
   * Call graph: the only callees are pure libc/libc++ boundary externs —
   *   __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc  (assign(char*))
   *   __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm (append(char*,size))
   *   __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEaSERKS5_    (operator=)
   *   _snprintf, _strlen, __ZdlPv (operator delete),
   *   __stack_chk_guard, __Unwind_Resume.
   * All out-of-scope (libc / libc++ runtime). No in-scope FCP callees.
   */
  getPath(endCh: OZChannelBase | null): string {
    // @0x4a678..0x4a691 — *sret = std::string("")  (init empty SSO, then assign "").
    let accum = "";

    // @0x4a696  cmpq %r15, %r14 ; @0x4a699  je 0x4a73b
    //   dst-src (AT&T): flags on r14-r15. je taken iff r14 == r15, i.e. self == endCh.
    //   "not equal" -> fall through into the walk.
    if ((this as OZChannelBase) !== (endCh as OZChannelBase | null)) {
      // NON-TRIVIAL WALK PATH.
      // @0x4a6a7-0x4a6ab  r13 = &local[0]  (32-byte buffer at -0x50(%rbp))
      //                   r12 = &temp      (temp basic_string at -0x70(%rbp))
      let cur: OZChannelBase | null = this as OZChannelBase;

      // do { ... } while (cur != endCh)  — mirrors backedge @0x4a728.
      // The disasm has NO NULL-parent check inside the loop; the caller is
      // required to pass an endCh that lies on this's parent chain. We
      // faithfully reproduce the same fault mode: if `cur` becomes null we
      // would deref +0x18/+0x30. In TS we let the `null.id` access throw.
      do {
        // @0x4a6af  movl 0x18(%r14), %ecx        — ecx = cur->id (u32).
        // @0x4a6b3  movl $0x20, %esi             — buffer size = 32.
        // @0x4a6bb  leaq "%u"(%rip), %rdx
        // @0x4a6c2  xorl %eax, %eax              — al = 0 (no vararg SSE args).
        // @0x4a6c4  callq _snprintf              — local = "%u" % cur->id.
        // TS: `cur!.id >>> 0` reproduces the u32 read at +0x18. Formatting
        // with base-10 %u matches _snprintf's semantics.
        let local = ((cur as OZChannelBase).id >>> 0).toString();

        // @0x4a6c9..0x4a6e4 — if (accum is non-empty) local += "/"
        //   The SSO probe on *rbx checks the low byte and, if bit0 (long-form
        //   flag) is set, checks size at +0x8. In our TS model `accum` is
        //   a plain JS string, so "non-empty" is simply `accum.length > 0`.
        //   @0x4a6df  callq _strlen — locates the end of the local buffer
        //   @0x4a6e4  movw $0x2f, -0x50(%rbp,%rax) — writes '/' + '\0'.
        if (accum.length > 0) {
          local = local + "/";
        }

        // @0x4a6eb..0x4a6f1  temp.assign(local)
        //   (uses the libc++ char*-overload).
        // @0x4a6f6..0x4a70e  compute rsi/rdx = accum's data/size (SSO-aware).
        // @0x4a711  temp.append(accum_data, accum_size)
        // @0x4a71c  *this = temp                (operator= copy)
        //   Net effect: accum = local + accum   (prepend the current id-token).
        accum = local + accum;

        // @0x4a721  movq 0x30(%r14), %r14   — cur = cur->parent.
        cur = ((cur as OZChannelBase).__parent_folder_at_0x30 as
          | OZChannelBase
          | null);

        // @0x4a725  cmpq %r15, %r14 ; @0x4a728  jne 0x4a6af  — loop while cur != endCh.
      } while (cur !== endCh);

      // @0x4a72a  testq %r15, %r15 ; @0x4a72d  je 0x4a7b8   — if endCh==NULL skip finalise.
      if (endCh !== null) {
        // @0x4a733  movw $0x2e, -0x50(%rbp)  — buffer becomes ".\0" (0x2e = '.', high byte 0).
        // @0x4a739  jmp 0x4a75b              — fall into the shared finalise block.
        let local = ".";
        // @0x4a75b..0x4a777  if (accum non-empty) local += "/"   (SSO probe + strlen + '/' write).
        if (accum.length > 0) {
          local = local + "/";
        }
        // @0x4a77e..0x4a7b3  same three-step: temp.assign(local); temp.append(accum); *this = temp.
        accum = local + accum;
      }
    } else {
      // @0x4a73b  je 0x4a73b — trivial path: self == endCh.
      // @0x4a73e  testq %r15, %r15 ; @0x4a73e je 0x4a7b8  — if endCh==NULL return "".
      if (endCh !== null) {
        // @0x4a740  movl 0x18(%r14), %ecx        — ecx = endCh->id.
        // @0x4a744  leaq "%u"(%rip), %rdx
        // @0x4a74f  movl $0x20, %esi
        // @0x4a754  xorl %eax, %eax
        // @0x4a756  callq _snprintf              — local = "%u" % endCh->id.
        // NOTE: self == endCh here, so endCh->id == this.id; we still read
        // it through endCh to match the disasm's register choice (r14 = endCh
        // in this branch — the callee-saves loaded r14 = rsi at 0x4a662; when
        // self==endCh, r14 == r15, and the code reads 0x18(%r14)).
        let local = ((endCh as OZChannelBase).id >>> 0).toString();

        // @0x4a75b..0x4a777  slash-if-nonempty branch. `accum` is "" here
        // (we skipped the walk), so this is always false and no '/' is added.
        // Faithfully model the branch anyway.
        if (accum.length > 0) {
          local = local + "/";
        }
        // @0x4a77e..0x4a7b3  temp.assign(local); temp.append(accum=""); *this = temp.
        accum = local + accum;
      }
      // If endCh == NULL, jmp 0x4a7b8 leaves accum as "".
    }

    // @0x4a7b8..0x4a7c2  cleanup: if temp is long-form, `operator delete` its heap buffer.
    //   Not modelled — GC handles it in TS.
    // @0x4a7c7..0x4a7d5  __stack_chk_guard verification (canary). Compiler-inserted
    //   security hardening; not observable at the language level.
    // @0x4a7d7  movq %rbx, %rax — sret return: *rdi (== self here in the ABI sense);
    //   in TS we just return the string value.
    return accum;
  }

  /**
   * OZChannelBase::setNameUnset(bool).
   * @ProChannel 0x4b92c..0x4b943
   * (__ZN13OZChannelBase12setNameUnsetEb)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZN13OZChannelBase12setNameUnsetEb.s):
   *
   *   0x4b92c  pushq  %rbp                        ; prologue
   *   0x4b92d  movq   %rsp, %rbp                  ; prologue
   *   0x4b930  movq   0x38(%rdi), %rax            ; rax = flags_at_+0x38 (u64)
   *   0x4b934  andq   $-0x41, %rax                ; rax &= ~0x40  (clear bit 6)
   *   0x4b938  shll   $0x6, %esi                  ; esi = bool << 6 (0 or 0x40)
   *   0x4b93b  orq    %rax, %rsi                  ; rsi = cleared | (bit << 6)
   *   0x4b93e  movq   %rsi, 0x38(%rdi)            ; store flags_at_+0x38
   *   0x4b942  popq   %rbp                        ; epilogue
   *   0x4b943  retq                               ; void return
   *
   * SEMANTICS:
   *   Bit-6 setter on the u64 flags word at +0x38. Bit 6 (0x40) is the
   *   "name-is-unset" flag, distinguishing "no name assigned" from
   *   "empty string name explicitly set". Peer methods on the same
   *   flags word:
   *     * bit 19 (0x80000)  solo-eligibility  (setChildSolo @0x4bb42)
   *     * bit 20 (0x100000) has-solo-child    (setChildSolo @0x4bb42)
   *   This method claims bit 6 exclusively.
   *
   *   shll $6, %esi is a 32-bit shift that zero-extends into the
   *   upper 32 bits of %rsi. Since the input was a bool (only the low
   *   bit could ever be set) the result is either 0 or 0x40 and the
   *   upper 32 bits of %rax carry through the orq untouched. We
   *   model the slot as bigint (u64) and do all ops in that width.
   *
   * DEPENDENCIES: none.  Pure bitfield mutation.
   */
  setNameUnset(v: boolean): void {
    // @0x4b930  movq 0x38(%rdi), %rax
    const rax_u64: bigint = this.__flags_word_at_0x38;
    // @0x4b934  andq $-0x41, %rax   — clear bit 6 (imm32 -0x41 = ~0x40 in u64).
    const cleared: bigint = rax_u64 & ~0x40n;
    // @0x4b938  shll $0x6, %esi     — bool << 6 = 0 or 0x40.
    const bit6: bigint = v ? 0x40n : 0n;
    // @0x4b93b  orq %rax, %rsi / @0x4b93e movq %rsi, 0x38(%rdi)
    this.__flags_word_at_0x38 = cleared | bit6;
    // @0x4b942/0x4b943 — epilogue + void return.
  }
  /**
   * `OZChannelBase::getNextUniqueID()`
   *   — @ProChannel 0x49c10
   *   — __ZN13OZChannelBase15getNextUniqueIDEv
   *
   * Faithful line-for-line transcription of the 9-line disassembly:
   *   0x49c10  pushq  %rbp                        ; frame prologue
   *   0x49c11  movq   %rsp, %rbp
   *   0x49c14  movl   $0x1, %eax                    ; %eax = 1 (the addend)
   *   0x49c19  lock                                ; atomic prefix
   *   0x49c1a  xaddl  %eax, __ZL12sIDGenerator(%rip)
   *                                               ; atomic exchange-and-add:
   *                                               ; %eax = *sIDGenerator (OLD)
   *                                               ; *sIDGenerator += 1 (NEW)
   *   0x49c21  popq   %rbp                        ; frame epilogue
   *   0x49c22  retq                                ; return %eax (the OLD value)
   *   0x49c23  nop                                 ; alignment padding
   *
   * The `xadd` instruction is the classic post-increment fetch: it
   * returns the value that WAS in memory BEFORE the addition, while
   * writing the new (incremented) value back. The `lock` prefix makes
   * the read-modify-write atomic across all CPU cores — important
   * because this counter is the process-wide unique-ID source for
   * OZChannelBase objects, and channel objects can be created from
   * multiple threads in FCP (parser threads, render threads).
   *
   * The `%rdi` (this) register is NEVER read — despite the C++
   * name-mangling declaring this as a non-static member function
   * (`__ZN13OZChannelBase15getNextUniqueIDEv`, no trailing `k`/`v0`
   * static marker), the body touches no member of `*this`. It is
   * effectively a static, and could be called with `nullptr` as its
   * receiver; the compiler simply hasn't hoisted the qualifier. This
   * matches the C++ source's likely shape:
   *   unsigned OZChannelBase::getNextUniqueID() {
   *     static std::atomic<uint32_t> sIDGenerator{0};
   *     return sIDGenerator.fetch_add(1);
   *   }
   * (or a hand-written `__sync_fetch_and_add` equivalent).
   *
   * Return width: `xaddl` operates on a 32-bit slot; the returned
   * `%eax` holds the OLD 32-bit value. Modelled here as `number`
   * (JS covers uint32 exactly).
   *
   * Zero in-scope callees, zero externs, no indirect calls — a pure
   * atomic RMW on a module-scope counter.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBase15getNextUniqueIDEv.s
   *   (9 lines)
   */
  getNextUniqueID(): number {
    // @0x49c14  movl $0x1,%eax          ; increment = 1
    // @0x49c19-0x49c1a  lock xaddl %eax,__ZL12sIDGenerator(%rip)
    //   The atomic exchange-and-add semantics on a 32-bit slot: the
    //   returned value is the OLD contents of sIDGenerator; the new
    //   contents are old+1. In a single-threaded JS runtime the
    //   read+write can be expressed as a simple post-increment on the
    //   `let` binding without a mutex (the event loop guarantees no
    //   other synchronous mutation observes the intermediate state).
    //
    //   The `| 0` at the store site keeps sIDGenerator inside int32
    //   width: an FCP session that mints > 2^31 unique IDs would see
    //   the counter wrap back through negative-int32 space (matching
    //   the `xaddl` overflow behaviour); a session that mints > 2^32
    //   would then wrap around to 0 (matching the native uint32 wrap).
    //   In practice FCP sessions mint tens of thousands of IDs, well
    //   inside the safe range — but the width is preserved for
    //   faithfulness.
    const old = sIDGenerator;
    sIDGenerator = (sIDGenerator + 1) | 0;
    return old;
  }

  /** @ProChannel OZChannelBase layout offset +0x38 (u64 flag word).
   *  Read @0x4b97e as `movq 0x38(%rdi), %rcx ; andl $0x4, %ecx` (bit 2 = "locally locked").
   *  Also read/written by sibling methods:
   *    - setChildSolo @0x4bb42..0x4bb6c uses `btl $0x13, %eax` (bit 0x13 = 19) and
   *      `orq $0x100000, %rax` (bit 20).
   *    - isSolo(bool) also reads +0x38.
   *  The full bit assignment is subclass-defined and not yet fully decoded here — we
   *  model the whole 64-bit word and mask each bit at its read-site to preserve the
   *  disasm's arithmetic exactly. Ctor that populates this field is a separate ledger
   *  unit; default 0n matches a zero-initialised heap allocation. */
  private __flags_at_0x38: bigint = 0n;

  /**
   * OZChannelBase::isLocked(bool) const — @ProChannel 0x4b976.
   * (__ZNK13OZChannelBase8isLockedEb — the `Eb` suffix is the `bool` param.)
   *
   * Faithful transcription of the 20-instruction body at
   * raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase8isLockedEb.s
   *
   *   0x4b976  pushq  %rbp
   *   0x4b977  movq   %rsp, %rbp
   *   0x4b97a  xorb   $0x1, %sil                  ; sil = !arg    (invert the bool)
   *
   *   Loop head at 0x4b97e:
   *   0x4b97e  movq   0x38(%rdi), %rcx            ; rcx = *(this + 0x38)  = flags u64
   *   0x4b982  andl   $0x4, %ecx                  ; rcx &= 0x4              (isolate bit 2)
   *   0x4b985  movl   %ecx, %eax                  ; eax = rcx (bit-2 value 0 or 4)
   *   0x4b987  shrl   $0x2, %eax                  ; eax >>= 2               -> eax = 0 or 1
   *   0x4b98a  testb  $0x1, %sil                  ; ZF = ((!arg) & 1)==0
   *   0x4b98e  jne    0x4b9a5                     ; if (!arg), return eax    (local-only path)
   *   0x4b990  testq  %rcx, %rcx                  ; ZF = (rcx == 0)
   *   0x4b993  jne    0x4b9a5                     ; if (bit 2 set on this), return eax=1
   *   0x4b995  movq   0x30(%rdi), %rdi            ; rdi = *(this + 0x30) = parent
   *   0x4b999  xorl   %esi, %esi                  ; sil = 0  (so !arg==0 in the loop: never
   *                                               ;           re-take the "local-only" jne)
   *   0x4b99b  movl   $0x0, %eax                  ; eax = 0  (default if walk terminates
   *                                               ;           without finding bit 2)
   *   0x4b9a0  testq  %rdi, %rdi                  ; ZF = (parent == NULL)
   *   0x4b9a3  jne    0x4b97e                     ; if (parent != NULL), loop
   *
   *   Return trampoline at 0x4b9a5:
   *   0x4b9a5  popq   %rbp
   *   0x4b9a6  retq                               ; return eax (u8 bool)
   *
   * ALGORITHM decoded:
   *   Two arguments are conveyed on entry via the ABI:
   *     - `%rdi` = this
   *     - `%sil` = the user-passed `bool` (call it `arg`)
   *   The first thing the function does is FLIP sil: sil ^= 1. Downstream the
   *   check `testb $0x1, %sil ; jne` fires when sil == 1, i.e. when the ORIGINAL
   *   argument was `false`. So the effective control flow is:
   *
   *     bool isLocked(bool checkAncestors) {
   *       OZChannelBase* cur = this;
   *       for (;;) {
   *         uint64_t rcx = cur->flags & 0x4;   // bit 2 of flags@+0x38
   *         uint32_t eax = uint32_t(rcx) >> 2; // eax == 1 iff bit 2 set
   *         if (!checkAncestors) return eax != 0; // local-only exit  (sil==1 branch)
   *         if (rcx != 0)         return eax != 0; // this-node locked -> true
   *         cur = cur->parent;                     // walk up the chain
   *         if (cur == nullptr) return false;       // ran off the top -> false
   *         checkAncestors = false; // note: the xorl %esi,%esi at 0x4b999 sets sil=0
   *                                 // which xor'd earlier stays 0 in loop — but the
   *                                 // *value* the branch uses is sil DIRECT, and the
   *                                 // loop back-edge lands at 0x4b97e AFTER the xor at
   *                                 // 0x4b97a — so sil stays 0 for all iterations,
   *                                 // making the "local-only" branch NEVER fire after
   *                                 // iteration 1. The disasm keeps eax=0 pre-loaded at
   *                                 // 0x4b99b, which becomes the return value on the
   *                                 // NULL-parent bail (rdi==0 -> jne not taken ->
   *                                 // fall through to popq/retq with eax=0).
   *       }
   *     }
   *
   *   Concretely: `isLocked(true)` walks the parent chain (starting at `this`)
   *   and returns true if ANY node in the chain has bit 2 of its +0x38 flags
   *   set; false if the chain terminates without such a node. `isLocked(false)`
   *   short-circuits after the first iteration, returning only the LOCAL bit.
   *
   *   The `bool` parameter is thus best read as `checkAncestors` (true) vs.
   *   `localOnly` (false) — a common override pattern in scene-graph code
   *   where a caller might want "is my subtree contribution locked" vs. "am I,
   *   as this node in isolation, locked".
   *
   * FRONTIER: no external callees. Pure bit test + pointer walk. Uses the
   *   +0x38 flags field (introduced in this port here) and the +0x30 parent
   *   pointer (already established via `__parent_folder_at_0x30` above).
   *
   * PROVENANCE:
   *   flags-word offset 0x38 — @0x4b97e (movq 0x38(%rdi), %rcx)
   *   locked-bit mask 0x4    — @0x4b982 (andl $0x4, %ecx)
   *   parent offset 0x30     — @0x4b995 (movq 0x30(%rdi), %rdi)
   *   All read from
   *   raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase8isLockedEb.s.
   */
  isLocked(checkAncestors: boolean): boolean {
    // @0x4b97a  xorb $0x1, %sil  — flip the arg bit so the branch tests !arg.
    //   In TS we don't need the physical XOR: the meaning is that
    //   `sil==1 after xor` iff `arg==false`; use `checkAncestors` directly.
    // Loop mirrors the x86 back-edge at 0x4b9a3.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cur: OZChannelBase | null = this;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x4b97e  movq 0x38(%rdi), %rcx  — load the flag word.
      const flags: bigint = (cur as OZChannelBase).__flags_at_0x38;
      // @0x4b982  andl $0x4, %ecx  — mask bit 2. Note: `andl` operates on the
      //   low 32 bits; but bit 2 lives in the low 32 anyway, so a `Number` &
      //   is faithful. Match the width exactly by narrowing to u32 first.
      const rcx: number = Number(flags & 0xffffffffn) & 0x4;
      // @0x4b985..0x4b987  movl %ecx,%eax ; shrl $0x2,%eax  — eax = rcx>>2
      //   -> 0 or 1.
      const eax: number = rcx >>> 2;
      // @0x4b98a..0x4b98e  testb $0x1,%sil ; jne 0x4b9a5
      //   sil==1 (i.e. !arg == true, i.e. checkAncestors==false) on the very
      //   first iteration only; the loop back-edge lands after `xorl %esi,%esi`
      //   pre-zeros sil so this branch never fires on subsequent iterations.
      //   In TS we express this as: on the FIRST pass we honour the user's
      //   `checkAncestors`; on subsequent passes we behave as if
      //   `checkAncestors==true` (which is the "no local-only exit" path).
      if (!checkAncestors) {
        // @0x4b9a5..0x4b9a6  return eax
        return eax !== 0;
      }
      // @0x4b990..0x4b993  testq %rcx,%rcx ; jne 0x4b9a5  — if bit 2 set on
      //   this node, exit with eax==1.
      if (rcx !== 0) {
        return eax !== 0;
      }
      // @0x4b995  movq 0x30(%rdi), %rdi  — cur = cur->parent.
      //   The +0x30 field is typed `unknown | null` in this class body (see
      //   __parent_folder_at_0x30 above) because the general parent is an
      //   OZChannelFolder that may not itself be an OZChannelBase. In the
      //   binary, however, this method blindly dereferences the +0x38 flag
      //   word on whatever it finds there — the runtime relies on the
      //   invariant that a parent chain of OZChannelBase-derived nodes is
      //   uniform in that offset (both OZChannelBase and OZChannelFolder
      //   share the layout prefix). We narrow to OZChannelBase for the
      //   flags-read purposes only; the runtime object identity is
      //   irrelevant so long as +0x38 is consistent.
      const parent = (cur as OZChannelBase).__parent_folder_at_0x30 as
        | OZChannelBase
        | null;
      // @0x4b999  xorl %esi,%esi  — sil = 0 (so `!arg` becomes 0; the top-of-
      //   loop "local-only" jne never fires again).  Modelled implicitly by
      //   the next iteration going through the `checkAncestors==true` path.
      // @0x4b99b  movl $0x0, %eax — pre-load eax=0 as the return on bail.
      // @0x4b9a0..0x4b9a3  testq %rdi,%rdi ; jne 0x4b97e  — loop iff parent!=NULL.
      if (parent === null) {
        // Fall-through to popq/retq with eax==0 -> return false.
        return false;
      }
      cur = parent;
    }
  }

  /**
   * `OZChannelBase::calcHashForState(PCSerializerWriteStream&, CMTime const&)`
   *   — @ProChannel 0x4bed4
   *     (__ZN13OZChannelBase16calcHashForStateER23PCSerializerWriteStreamRK6CMTime)
   *
   * An EMPTY virtual: the base class contributes nothing to the state hash. The entire
   * function is a frame prologue and epilogue —
   * raw-port/re/disasm/ProChannel.__ZN13OZChannelBase16calcHashForStateER23PCSerializerWriteStreamRK6CMTime.s:
   *
   *   0x4bed4  pushq %rbp
   *   0x4bed5  movq  %rsp, %rbp
   *   0x4bed8  popq  %rbp
   *   0x4bed9  retq
   *
   * THE BODY IS COMPLETE, NOT TRUNCATED — the two facts that establish it:
   *   * the very next symbol in the table is `OZChannelBase::parseBegin` @0x4beda, exactly SIX
   *     bytes after 0x4bed4, which is the precise length of `push rbp; mov rsp,rbp; pop rbp;
   *     ret` (1 + 3 + 1 + 1). There is no room for another instruction.
   *   * there is no `xorl %eax,%eax`, consistent with a `void` return — the sibling empty
   *     bodies that DO return a scalar all zero %eax first.
   * (Worth stating explicitly because a truncated listing that ends early is exactly how the
   * #368 slicer bug turned REAL bodies into EMPTY ones.)
   *
   * NEITHER PARAMETER IS READ. `%rsi` (the stream) and `%rdx` (the CMTime) are never touched:
   * nothing is written to the stream, and no hash is mixed. Writing anything here — even a
   * zero — would be adding an instruction the machine does not execute (PORTING_SPEC Rule 1),
   * so both parameters are accepted and deliberately ignored.
   *
   * THIS IS A DEFAULT, NOT A GAP. Derived channels override it and do the real work: the
   * same-signature override `FFOZMediaRefChannel::calcHashForState(PCSerializerWriteStream&,
   * CMTime const&)` @Flexo 0x21d840 is a 43-instruction body (a separate, unported ledger
   * entry, cited here only as evidence). So the base's empty body means "a plain channel adds
   * nothing to the hash of its state", which is a decoded behaviour rather than an undecoded
   * one.
   *
   * @param _stream — %rsi, `PCSerializerWriteStream&`. Never read, never written to.
   * @param _time   — %rdx, `CMTime const&`. Never read.
   */
  calcHashForState(_stream: PCSerializerWriteStream, _time: CMTime): void {
    // @0x4bed4..0x4bed5 — prologue; @0x4bed8..0x4bed9 — epilogue + retq.
    // There is no instruction in between. Doing nothing IS the transcription.
  }

  /**
   * @ProChannel offset +0x58 — the retained `CFStringRef` parameter-controller
   * class name.
   *
   * Decoded from `setParameterCtlrClassName(__CFString const*)` @0x49870,
   * which reads it (`movq 0x58(%rdi), %rdi` @0x4987a), compares it against the
   * incoming pointer (@0x4987e), stores the new pointer into it
   * (`movq %rbx, 0x58(%r14)` @0x49890) and drives the CoreFoundation
   * refcount pair around both. Ownership: the slot holds a RETAINED reference
   * (the setter Releases the old value and Retains the new one), and NULL is a
   * legal state — both sides of the swap are null-checked in the binary. The
   * initial value is NULL because nothing in the decoded set writes it first.
   */
  parameterCtlrClassNameAt58: CFStringRef | null = null;

  /**
   * `OZChannelBase::setParameterCtlrClassName(__CFString const*)`
   *   — @ProChannel 0x49870
   *   — __ZN13OZChannelBase25setParameterCtlrClassNameEPK10__CFString
   *
   * The textbook CoreFoundation setter: identity-guard, Release the old,
   * store, Retain the new.
   *
   * Full transcription — every instruction, in order:
   *
   *   0x49870  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x49871  movq  %rsp, %rbp            ; frame setup (no TS counterpart)
   *   0x49874  pushq %r14                  ; callee-saved spill (no TS counterpart)
   *   0x49876  pushq %rbx                  ; callee-saved spill (no TS counterpart)
   *   0x49877  movq  %rdi, %r14            ; r14 = this
   *   0x4987a  movq  0x58(%rdi), %rdi      ; rdi = this->parameterCtlrClassNameAt58 (OLD)
   *   0x4987e  cmpq  %rsi, %rdi            ; flags on old - new (POINTER identity)
   *   0x49881  je    0x498a5               ;   old == new -> return, no refcount traffic
   *   0x49883  movq  %rsi, %rbx            ; rbx = new
   *   0x49886  testq %rdi, %rdi            ; old == NULL ?
   *   0x49889  je    0x49890               ;   NULL -> skip the release
   *   0x4988b  callq _CFRelease            ; stub 0xaca50 — release the OLD value
   *   0x49890  movq  %rbx, 0x58(%r14)      ; this->parameterCtlrClassNameAt58 = new
   *   0x49894  testq %rbx, %rbx            ; new == NULL ?
   *   0x49897  je    0x498a5               ;   NULL -> return without retaining
   *   0x49899  movq  %rbx, %rdi            ; arg1 = new
   *   0x4989c  popq  %rbx                  ; epilogue BEFORE the tail jump
   *   0x4989d  popq  %r14
   *   0x4989f  popq  %rbp
   *   0x498a0  jmp   _CFRetain             ; stub 0xaca56 — TAIL CALL, retain the NEW value
   *   0x498a5  popq  %rbx                  ; shared early-out epilogue
   *   0x498a6  popq  %r14
   *   0x498a8  popq  %rbp
   *   0x498a9  retq                        ; void return
   *
   * SEMANTICS and ORDERING, exactly as the machine does it:
   *   1. `cmpq %rsi, %rdi ; je` @0x4987e is a POINTER-IDENTITY test (equality
   *      on ZF, not an ordered compare), so passing the value already stored
   *      is a complete no-op — no Release, no store, no Retain. That guard is
   *      what makes the self-assignment `x.set(x.get())` safe.
   *   2. The OLD value is released BEFORE the new pointer is stored, and only
   *      when it is non-NULL (@0x49886).
   *   3. The store @0x49890 happens unconditionally on the non-identical path,
   *      NULL included — so this method is also the way the slot is cleared.
   *   4. The Retain of the NEW value happens LAST, through a tail jump, and
   *      only when it is non-NULL (@0x49894). Because it is a tail call the
   *      callee returns straight to this function's caller.
   *
   * FRONTIER CALLEES: `_CFRelease` @0xaca50 and `_CFRetain` @0xaca56 are TRUE
   * out-of-scope CoreFoundation externs (see the two boundary stubs above the
   * class), modelled as documented JS NO-OPs per the RESOLVED
   * lifetime/ownership-primitive ruling — so the ordinary path through this
   * setter runs to completion. They are the only two calls in the body; there
   * is no in-scope callee (`depgraph.py deps` lists none), no indirect and no
   * virtual dispatch.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBase25setParameterCtlrClassNameEPK10__CFString.s
   *   (23 lines)
   */
  setParameterCtlrClassName(
    this: OZChannelBase,
    name: CFStringRef | null,
  ): void {
    // @0x4987a  movq 0x58(%rdi),%rdi — the OLD value.
    const old = this.parameterCtlrClassNameAt58;
    // @0x4987e-0x49881  cmpq %rsi,%rdi ; je 0x498a5 — pointer identity.
    if (old === name) {
      return;
    }
    // @0x49886-0x4988b  testq %rdi,%rdi ; je ; callq _CFRelease — release the
    //   OLD value first, and only when it is non-NULL.
    if (old !== null) {
      CFRelease(old);
    }
    // @0x49890  movq %rbx,0x58(%r14) — store the new pointer, NULL included.
    this.parameterCtlrClassNameAt58 = name;
    // @0x49894-0x49897  testq %rbx,%rbx ; je 0x498a5 — nothing to retain.
    if (name === null) {
      return;
    }
    // @0x49899/@0x498a0  movq %rbx,%rdi ; jmp _CFRetain — TAIL CALL.
    return CFRetain(name);
  }

  /**
   * @ProChannel offset +0x50 — the retained `CFStringRef` LABEL-controller
   * class name.
   *
   * The sibling slot of {@link parameterCtlrClassNameAt58}, eight bytes lower.
   * Decoded from `setLabelCtlrClassName(__CFString const*)` @0x49836: read
   * (`movq 0x50(%rdi), %rdi` @0x49840), compared against the incoming pointer
   * (@0x49844) and written (`movq %rbx, 0x50(%r14)` @0x49856), with the same
   * CoreFoundation Release/Retain pair around it. Same ownership contract: a
   * RETAINED reference, NULL legal, initial value NULL.
   */
  labelCtlrClassNameAt50: CFStringRef | null = null;

  /**
   * `OZChannelBase::setLabelCtlrClassName(__CFString const*)`
   *   — @ProChannel 0x49836
   *   — __ZN13OZChannelBase21setLabelCtlrClassNameEPK10__CFString
   *
   * The instruction-for-instruction TWIN of `setParameterCtlrClassName`
   * @0x49870 above (same 23-line shape, same two CF stubs, same branch
   * structure) with the +0x50 slot in place of +0x58 — they sit 0x3a bytes
   * apart in ProChannel's text and differ ONLY in that displacement.
   *
   * Full transcription — every instruction, in order:
   *
   *   0x49836  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x49837  movq  %rsp, %rbp            ; frame setup (no TS counterpart)
   *   0x4983a  pushq %r14                  ; callee-saved spill (no TS counterpart)
   *   0x4983c  pushq %rbx                  ; callee-saved spill (no TS counterpart)
   *   0x4983d  movq  %rdi, %r14            ; r14 = this
   *   0x49840  movq  0x50(%rdi), %rdi      ; rdi = this->labelCtlrClassNameAt50 (OLD)
   *   0x49844  cmpq  %rsi, %rdi            ; flags on old - new (POINTER identity)
   *   0x49847  je    0x4986b               ;   old == new -> return, no refcount traffic
   *   0x49849  movq  %rsi, %rbx            ; rbx = new
   *   0x4984c  testq %rdi, %rdi            ; old == NULL ?
   *   0x4984f  je    0x49856               ;   NULL -> skip the release
   *   0x49851  callq _CFRelease            ; stub 0xaca50 — release the OLD value
   *   0x49856  movq  %rbx, 0x50(%r14)      ; this->labelCtlrClassNameAt50 = new
   *   0x4985a  testq %rbx, %rbx            ; new == NULL ?
   *   0x4985d  je    0x4986b               ;   NULL -> return without retaining
   *   0x4985f  movq  %rbx, %rdi            ; arg1 = new
   *   0x49862  popq  %rbx                  ; epilogue BEFORE the tail jump
   *   0x49863  popq  %r14
   *   0x49865  popq  %rbp
   *   0x49866  jmp   _CFRetain             ; stub 0xaca56 — TAIL CALL, retain the NEW value
   *   0x4986b  popq  %rbx                  ; shared early-out epilogue
   *   0x4986c  popq  %r14
   *   0x4986e  popq  %rbp
   *   0x4986f  retq                        ; void return
   *
   * Same ordering guarantees as the parameter-side twin: pointer-identity
   * guard first (equality on ZF @0x49844, so re-setting the stored value is a
   * complete no-op), then Release-old (only when non-NULL), then the store
   * (unconditional, NULL included — this is also how the slot is cleared), then
   * Retain-new LAST through a tail jump (only when non-NULL).
   *
   * FRONTIER CALLEES: the same two TRUE out-of-scope CoreFoundation externs —
   * `_CFRelease` (ProChannel stub @0xaca50, called @0x49851) and `_CFRetain`
   * (stub @0xaca56, tail-jumped @0x49866) — both modelled as documented JS
   * NO-OPs per the RESOLVED lifetime/ownership-primitive ruling, so the
   * ordinary path through this setter runs to completion. No in-scope callee
   * (`depgraph.py deps` lists none), no indirect and no virtual dispatch.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBase21setLabelCtlrClassNameEPK10__CFString.s
   *   (25 lines)
   */
  setLabelCtlrClassName(this: OZChannelBase, name: CFStringRef | null): void {
    // @0x49840  movq 0x50(%rdi),%rdi — the OLD value.
    const old = this.labelCtlrClassNameAt50;
    // @0x49844-0x49847  cmpq %rsi,%rdi ; je 0x4986b — pointer identity.
    if (old === name) {
      return;
    }
    // @0x4984c-0x49851  testq %rdi,%rdi ; je ; callq _CFRelease.
    if (old !== null) {
      CFRelease(old);
    }
    // @0x49856  movq %rbx,0x50(%r14) — store the new pointer, NULL included.
    this.labelCtlrClassNameAt50 = name;
    // @0x4985a-0x4985d  testq %rbx,%rbx ; je 0x4986b — nothing to retain.
    if (name === null) {
      return;
    }
    // @0x4985f/@0x49866  movq %rbx,%rdi ; jmp _CFRetain — TAIL CALL.
    return CFRetain(name);
  }

  /**
   * `OZChannelBase::getLabelCtlrClassName()`
   *   — @ProChannel 0x4bc6e
   *   — __ZN13OZChannelBase21getLabelCtlrClassNameEv
   *
   * The read side of {@link labelCtlrClassNameAt50}: a five-instruction leaf
   * that loads the +0x50 slot and returns it. Nothing else — no retain, no
   * NULL check, no copy.
   *
   * Full transcription — every instruction, in order (10 bytes, and the whole
   * function; the next symbol `getParameterCtlrClassName` starts at 0x4bc78):
   *
   *   0x4bc6e  55              pushq %rbp             ; frame setup (no TS counterpart)
   *   0x4bc6f  48 89 e5        movq  %rsp, %rbp       ; frame setup (no TS counterpart)
   *   0x4bc72  48 8b 47 50     movq  0x50(%rdi), %rax ; rax = this->labelCtlrClassNameAt50
   *   0x4bc76  5d              popq  %rbp             ; epilogue (no TS counterpart)
   *   0x4bc77  c3              retq                   ; the loaded qword IS the return value
   *
   * OWNERSHIP: the returned `CFStringRef` is **unretained** — there is no
   * `_CFRetain` here, unlike the setter twin @0x49836 which retains what it
   * stores. The caller receives a borrowed reference whose lifetime the
   * channel owns. NULL is returned unchanged: the load is unconditional, so an
   * unset slot (initial value NULL, or NULL written through
   * {@link setLabelCtlrClassName}) reads back as NULL rather than raising.
   *
   * FRONTIER CALLEES: none. No call, no jump, no indirect and no virtual
   * dispatch in the body (`depgraph.py deps` lists nothing).
   *
   * ONE OF A FAMILY OF THREE, and the displacement is the only difference —
   * checked against the raw bytes of the thin x86_64 slice so the sibling
   * slots cannot be confused with this one:
   *
   *   0x4bc6e  55 48 89 e5 48 8b 47 50 5d c3   getLabelCtlrClassName      -> +0x50
   *   0x4bc78  55 48 89 e5 48 8b 47 58 5d c3   getParameterCtlrClassName  -> +0x58
   *   0x4bc82  55 48 89 e5 48 8b 47 60 5d c3   getInspectorCtlrClassName  -> +0x60
   *
   * The other two are their own ledger units and are NOT ported here.
   *
   * MEASURED AGAINST THE LIVE BINARY
   * (raw-port/re/oracle/OZChannelBase_getLabelCtlrClassName_probe.py, run under
   * `arch -x86_64 /usr/bin/python3` so dlsym resolves the same x86_64 slice
   * this was transcribed from). The symbol is exported (`T` @0x4bc6e), so it is
   * called through dlsym over a poisoned 0x100-byte arena:
   *   - the 10 mapped opcode bytes equal the ones transcribed above
   *   - for each of six sentinels at +0x50 (0, 1, 0x58 — the displacement
   *     itself, so a wrong-slot read cannot alias — a heap pointer, ~0UL and a
   *     0xCD-pattern word) the return value is that sentinel, bit for bit
   *   - the arena is byte-identical after every call: the function reads and
   *     writes nothing
   *   - CONTROL: the same arena read through the +0x58 and +0x60 displacements
   *     returns the OTHER sentinels, so the probe can tell this getter from its
   *     two siblings rather than passing on any load whatsoever
   *
   * Result at ProChannel slide 0x10a951000: **17/17 PASS**, dlsym landing on
   * slide+0x4bc6e exactly, all six sentinels returned bit-for-bit, 0 of 256
   * arena bytes changed on every call, and both sibling displacements
   * returning their own values and not this one.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBase21getLabelCtlrClassNameEv.s
   *   (6 lines: the label plus the five instructions)
   */
  getLabelCtlrClassName(this: OZChannelBase): CFStringRef | null {
    // @0x4bc72  movq 0x50(%rdi),%rax — the whole body: load the slot and
    // return it, NULL included, unretained.
    return this.labelCtlrClassNameAt50;
  }

  /**
   * `OZChannelBase::getParameterCtlrClassName()`
   *   — @ProChannel 0x4bc78
   *   — __ZN13OZChannelBase25getParameterCtlrClassNameEv
   *
   * The read side of {@link parameterCtlrClassNameAt58}: a five-instruction
   * leaf that loads the +0x58 slot and returns it. Nothing else — no retain,
   * no NULL check, no copy. The +0x50 twin
   * {@link getLabelCtlrClassName} @0x4bc6e is already landed and is the same
   * body at a different displacement.
   *
   * Full transcription — every instruction, in order (10 bytes, and the whole
   * function; the next symbol `getInspectorCtlrClassName` starts at 0x4bc82):
   *
   *   0x4bc78  55              pushq %rbp             ; frame setup (no TS counterpart)
   *   0x4bc79  48 89 e5        movq  %rsp, %rbp       ; frame setup (no TS counterpart)
   *   0x4bc7c  48 8b 47 58     movq  0x58(%rdi), %rax ; rax = this->parameterCtlrClassNameAt58
   *   0x4bc80  5d              popq  %rbp             ; epilogue (no TS counterpart)
   *   0x4bc81  c3              retq                   ; the loaded qword IS the return value
   *
   * OWNERSHIP: the returned `CFStringRef` is **unretained** — there is no
   * `_CFRetain` here, unlike the setter twin
   * {@link setParameterCtlrClassName} @0x49870, which retains what it stores
   * (`jmp _CFRetain` @0x498a0) and releases the old value. The caller receives
   * a borrowed reference whose lifetime the channel owns. NULL is returned
   * unchanged: the load is unconditional, so an unset slot (initial value
   * NULL, or NULL written through the setter) reads back as NULL rather than
   * raising.
   *
   * FRONTIER CALLEES: none. No call, no jump, no indirect and no virtual
   * dispatch in the body (`depgraph.py deps` lists nothing).
   *
   * ONE OF A FAMILY OF THREE, and the displacement is the only difference —
   * checked against the raw bytes of the thin x86_64 slice so the sibling
   * slots cannot be confused with this one:
   *
   *   0x4bc6e  55 48 89 e5 48 8b 47 50 5d c3   getLabelCtlrClassName      -> +0x50
   *   0x4bc78  55 48 89 e5 48 8b 47 58 5d c3   getParameterCtlrClassName  -> +0x58  (THIS)
   *   0x4bc82  55 48 89 e5 48 8b 47 60 5d c3   getInspectorCtlrClassName  -> +0x60
   *
   * The +0x60 one is its own ledger unit and is NOT ported here.
   *
   * MEASURED AGAINST THE LIVE BINARY
   * (raw-port/re/oracle/OZChannelBase_getParameterCtlrClassName_probe.py, run
   * under `arch -x86_64 /usr/bin/python3` so dlsym resolves the same x86_64
   * slice this was transcribed from). The symbol is exported (`T` @0x4bc78),
   * so it is called through dlsym over a poisoned 0x100-byte arena:
   *   - the dlsym'd address is slide+0x4bc78 and the 10 mapped opcode bytes
   *     equal both the ones transcribed above AND the on-disk thin-slice bytes
   *     at the same offset
   *   - for each of six sentinels at +0x58 (0, 1, 0x50 — the SIBLING's
   *     displacement, so a wrong-slot read cannot alias — a heap pointer, ~0UL
   *     and a 0xCD-pattern word) the return value is that sentinel, bit for bit
   *   - the arena is byte-identical after every call: the function reads and
   *     writes nothing
   *   - CONTROL: the same arena read through the +0x50 and +0x60 displacements
   *     returns the OTHER sentinels, so the probe can tell this getter from its
   *     two siblings rather than passing on any load whatsoever. This is the
   *     mirror of the landed +0x50 probe, which used THIS function as one of
   *     its controls.
   *   - AND THE PORT ITSELF IS EXECUTED (check E), which the +0x50 probe does
   *     not do: `OZChannelBase_getParameterCtlrClassName_driver.mts` builds a
   *     real OZChannelBase, fills the three slots with distinguishable values,
   *     and calls this method. Everything else here measures the BINARY; the
   *     one defect this body can have is reading the +0x50 FIELD, which
   *     compiles, cites the right address and returns a plausible
   *     CFStringRef. MUTATION CONTROL, driven not asserted: change the body to
   *     `return this.labelCtlrClassNameAt50` and E goes red on both cases
   *     (returns '+0x50', and NULL is no longer preserved).
   *
   * Result at ProChannel slide 0x109a6b000: **20/20 PASS**, dlsym landing on
   * slide+0x4bc78 exactly, mapped bytes equal to the on-disk slice, all six
   * sentinels returned bit-for-bit, 0 of 256 arena bytes changed on every
   * call, both sibling displacements returning their own values and not this
   * one, and the executed port returning the +0x58 slot and preserving NULL.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBase25getParameterCtlrClassNameEv.s
   *   (6 lines: the label plus the five instructions)
   */
  getParameterCtlrClassName(this: OZChannelBase): CFStringRef | null {
    // @0x4bc7c  movq 0x58(%rdi),%rax — the whole body: load the slot and
    // return it, NULL included, unretained.
    return this.parameterCtlrClassNameAt58;
  }

  /**
   * `OZChannelBase::testDefaultFlag(unsigned long long) const`
   *   — @ProChannel 0x4a540
   *   — __ZNK13OZChannelBase15testDefaultFlagEy
   *
   * The read side of the "default state" snapshot slot at +0x40: mask the
   * saved word with the caller's bit set and report whether anything
   * survives.
   *
   * FULL DISASM (raw-port/re/disasm/
   * ProChannel.__ZNK13OZChannelBase15testDefaultFlagEy.s — 8 lines: the label
   * plus seven listed lines), every instruction accounted for:
   *
   *   0x4a540  55           pushq %rbp              ; frame setup (no TS counterpart)
   *   0x4a541  48 89 e5     movq  %rsp, %rbp        ; frame setup (no TS counterpart)
   *   0x4a544  48 85 77 40  testq %rsi, 0x40(%rdi)  ; ZF = ((*(u64*)(this+0x40)) & mask) == 0
   *   0x4a548  0f 95 c0     setne %al               ; al = !ZF = ((word & mask) != 0)
   *   0x4a54b  5d           popq  %rbp              ; epilogue (no TS counterpart)
   *   0x4a54c  c3           retq                    ; return %al (bool)
   *   0x4a54d  90           nop                     ; alignment pad — not executed
   *
   * THE BODY IS COMPLETE, NOT TRUNCATED. The thirteen instruction bytes above
   * run 0x4a540..0x4a54c inclusive, the `nop` pads 0x4a54d, and the next
   * symbol in the table starts at exactly 0x4a54e
   * (`__ZNK13OZChannelBase20getObjectManipulatorEv`), so there is no room for
   * a further instruction. (Stated explicitly because a listing that ends
   * early is how a truncated slice turns a REAL body into an apparently empty
   * one.)
   *
   * AT&T OPERAND ORDER. `testq %rsi, 0x40(%rdi)` is `test src, dst`, i.e. the
   * MEMORY operand is the destination: the machine computes
   * `*(u64*)(this+0x40) & %rsi`, sets ZF from the result and discards it.
   * `AND` is commutative, so no clamp/branch can be inverted by reading the
   * operands the wrong way round here — but the direction is recorded because
   * it establishes that the memory operand is a full QWORD (the `q` suffix /
   * REX.W in `48 85 77 40`), so all 64 bits of the argument participate. A
   * 32-bit transcription would silently answer `false` for any mask whose only
   * set bits are above bit 31; the oracle below tests exactly that case.
   *
   * `setne %al` writes ONE byte. The upper bits of %eax are left as they were,
   * which is the normal x86-64 convention for a `bool` return: the caller
   * reads only %al. So the returned value is exactly the boolean below.
   *
   * WHICH SLOT, AND WHY IT IS THE "DEFAULT" ONE. +0x40 is the slot written by
   * `saveStateAsDefault()` @ProChannel 0x4bb7c (`movq %rax, 0x40(%rdi)`
   * @0x4bb8e, storing the live flags word from +0x38 masked with
   * 0xFFFFFFFDECA4CF86) — already transcribed in this file as
   * {@link OZChannelBase.saveStateAsDefault}, which is why this method reuses
   * that field rather than introducing a second model of the same eight
   * bytes. The live flags word is a DIFFERENT slot, +0x38: its setter
   * `OZChannelBase::setFlags(unsigned long long)` @ProChannel 0x4a50a — the
   * symbol immediately preceding this one — ends in `movq %rbx, 0x38(%r14)`
   * @0x4a537, and it screens the incoming value with that same
   * 0xFFFFFFFDECA4CF86 mask @0x4a517 before dispatching a virtual notify.
   * So the pair reads: `setFlags`/`isLocked`/`setChildSolo` operate on the
   * LIVE word at +0x38, while `saveStateAsDefault` snapshots it into +0x40
   * and THIS method is how a caller asks a question of that snapshot.
   *
   * The `NK` in the mangled name marks the method `const`, and the body
   * matches: one load, no store.
   *
   * DEPENDENCIES: none. No call, no jump, no indirect or virtual dispatch, no
   * extern (`depgraph.py deps __ZNK13OZChannelBase15testDefaultFlagEy` lists
   * nothing).
   *
   * MEASURED AGAINST THE LIVE BINARY — not read-only review.
   * `raw-port/re/oracle/OZChannelBase_testDefaultFlag_oracle.py` (run under
   * `arch -x86_64 /usr/bin/python3`, so dlsym resolves the same x86_64 slice
   * this was transcribed from) dlsym's this exported `T` symbol, checks that
   * the address is slide+0x4a540 and that the 13 mapped opcode bytes are the
   * ones listed above, then runs a 204-case corpus over a 0xCD-poisoned
   * 0x100-byte arena — all 64 single bits (including bit 63, which is what
   * catches a 32-bit AND), the disjoint 0xAAAA…/0x5555… pair, the
   * `saveStateAsDefault` mask itself, and seeded random pairs — against the
   * REAL TypeScript below, executed by
   * `OZChannelBase_testDefaultFlag_driver.mts` (no Python restatement of the
   * port stands between the two sides). It also holds decoy values in the
   * neighbouring +0x38 and +0x48 slots so that reading the wrong slot cannot
   * pass, checks the arena is byte-identical after every call, and requires
   * six deliberately wrong variants of this method (inverted, 32-bit-truncated,
   * OR-instead-of-AND, +0x38-instead-of-+0x40, constant true, constant false)
   * to DIVERGE from the live function on the same corpus.
   *
   * RESULT at ProChannel slide 0x10aa69000: **PASS, 0 checks failed** — dlsym landing on
   * slide+0x4a540 exactly, the 13 live opcode bytes equal to the ones transcribed above, the
   * TypeScript agreeing with the live function on 204 of 204 cases (132 true / 72 false, so the
   * corpus exercises both answers), 0 of 256 arena bytes changed across all 204 calls, and every
   * negative control caught: inverted 204/204 cases differ, +0x38-instead-of-+0x40 138, constant
   * false 132, or-instead-of-and 71, constant true 72, and the 32-bit AND 33 (those 33 are the
   * high-half cases — a `testl` transcription is invisible to any corpus that stays under bit 31).
   *
   * @param mask — %rsi, `unsigned long long`. The bit set being asked about.
   */
  testDefaultFlag(mask: bigint): boolean {
    // @0x4a544  testq %rsi, 0x40(%rdi)
    //   %rsi is a 64-bit register, so the argument participates as a u64 and
    //   nothing above bit 63 exists to participate. Narrowing the incoming
    //   bigint to that width is the truncation the register performs; the
    //   literal is the register's own width at this instruction, not a value
    //   read from the image.
    const rsi: bigint = mask & 0xFFFFFFFFFFFFFFFFn;
    //   ...and the destination is the QWORD at this+0x40 — the default-state
    //   snapshot written by saveStateAsDefault @0x4bb8e.
    const anded: bigint = this.__default_state_word_at_0x40 & rsi;
    // @0x4a548  setne %al — the whole return value: ZF was set iff the AND
    //   produced zero, so %al is 1 exactly when some bit survived.
    return anded !== 0n;
    // @0x4a54b..0x4a54c  popq %rbp ; retq — return %al.
  }
}

/**
 * `OZChannelBase::allowsDrag(OZChannelBase const*)` — @ProChannel 0x49f44
 *   — `__ZN13OZChannelBase10allowsDragEPKS_` (exported `T`,
 *     `raw-port/army/inventory/ProChannel.syms.txt:3025`)
 *
 * FULL transcription. The whole function is five instructions and one of them is the body:
 *
 *   0x49f44  55        pushq %rbp        ; frame setup (no TS counterpart)
 *   0x49f45  48 89 e5  movq  %rsp, %rbp  ; frame setup (no TS counterpart)
 *   0x49f48  b0 01     movb  $0x1, %al   ; the return value: 1
 *   0x49f4a  5d        popq  %rbp        ; frame teardown (no TS counterpart)
 *   0x49f4b  c3        retq              ; return %al
 *
 * IT IGNORES BOTH OPERANDS, and that is the finding rather than an omission: `%rdi` (`this`) and
 * `%rsi` (the candidate channel) are never read — there is no load, no test, no branch, and no
 * callee. The base class answers "yes, a drag is allowed" for every pair, and a subclass override
 * is where any real policy lives. A port that consulted a flag here would be inventing a decision
 * the binary does not make, so both parameters are named with a leading underscore and left unread.
 *
 * The `movb $0x1, %al` writes only the low BYTE of the return register, which is the C++ `bool`
 * ABI: the caller reads `%al` alone, and the upper bits of `%eax` are left undefined by this
 * function. The oracle reads the result as a `c_ubyte` for exactly that reason — declaring it an
 * `int` would compare bits this function never set.
 *
 * ZERO callees: no in-scope call, no extern, no indirect and no virtual dispatch
 * (`depgraph.py deps __ZN13OZChannelBase10allowsDragEPKS_` lists nothing).
 *
 * WHY AN `export function` IN A CLASS-SHAPED FILE. The rest of this file models the class with
 * methods, which is the older style here; G5 only inspects `export function`, so a method is
 * invisible to the one gate that classifies a body against its disassembly (reviewer 4 filed that
 * hole today, and reviewer 1 noted on #647 that writing an export function is what makes G5 look at
 * all). A one-instruction constant-returning body is precisely the shape that should be judged
 * rather than taken on trust, so this unit is exported as a function. It reads no instance state,
 * so nothing is lost by not being a method.
 *
 * ORACLE — EXECUTED, not read (`raw-port/re/oracle/OZChannelBase_allowsDrag_oracle.py`, under
 * `arch -x86_64 /usr/bin/python3`; the symbol is `T`, so it is reached by dlsym after the recursive
 * @rpath preload, and the 8 opcode bytes at the symbol are checked against the transcription first).
 * Measured 2026-08-11: 49 (this, other) pairs — NULL, poison, 0x4141…, and real 0x100-byte
 * 0xCD-filled arenas in every combination, including this == other — returned 1 every time; 0 of
 * 512 arena bytes changed; and the two negative controls a constant cannot be told apart from by
 * value alone are checked structurally instead, in the TS driver: `false` dies on all 49, "return
 * whether other is non-null" dies on the 21 pairs with a NULL argument. The M0 control survives.
 *
 * Source disassembly:
 *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBase10allowsDragEPKS_.s (6 lines)
 *
 * @param _self  %rdi — the channel being asked. NEVER READ by this body.
 * @param _other %rsi — the candidate channel. NEVER READ by this body.
 * @returns `true`, unconditionally, as `movb $0x1, %al` does.
 */
export function OZChannelBase_allowsDrag(
  _self: OZChannelBase,
  _other: OZChannelBase | null,
): boolean {
  // @0x49f48  movb $0x1, %al — the entire body.
  return true;
}
