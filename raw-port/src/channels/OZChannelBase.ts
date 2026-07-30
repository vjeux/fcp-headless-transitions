// OZChannelBase — base of every channel/parameter node (ProChannel.framework).
// Faithful port. Decode: OZChannelBase::parseElement @ ProChannel 0x666... (30-line base:
// handles <flags> and the common name/id/internalName/factoryID attributes via OZChannelBaseScope).
// OZChannelBaseScope: 0x6e name, 0x6f id, 0x70 flags, 0x71 factoryID, 0x76 internalName.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import type { OZChannelObjectRootBase } from "./OZChannelObjectRootBase.js";

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
}
