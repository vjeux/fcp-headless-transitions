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

  /**
   * OZChannelBase::getAncestorRootBase() const.
   *
   * @ProChannel 0x4a818
   * (__ZNK13OZChannelBase19getAncestorRootBaseEv)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase19getAncestorRootBaseEv.s):
   *
   *   0x4a818  testq  %rdi, %rdi                          ; if (this == NULL)
   *   0x4a81b  je     0x4a864                             ;   goto bail_null
   *   0x4a81d  pushq  %rbp
   *   0x4a81e  movq   %rsp, %rbp
   *   0x4a821  pushq  %r15
   *   0x4a823  pushq  %r14
   *   0x4a825  pushq  %rbx
   *   0x4a826  pushq  %rax                                ; align stack
   *   0x4a827  movq   %rdi, %rbx                          ; cur = this
   *   0x4a82a  xorl   %eax, %eax                          ; result = NULL   (returned in rax)
   *   0x4a82c  leaq   __ZTI13OZChannelBase(%rip), %r14    ; srcType = &typeinfo(OZChannelBase)
   *   0x4a833  leaq   __ZTI23OZChannelObjectRootBase(%rip), %r15 ; dstType = &typeinfo(OZChannelObjectRootBase)
   *   0x4a83a  testb  $0x20, 0x39(%rbx)                   ; if ((*(u8*)(cur+0x39)) & 0x20) == 0
   *   0x4a83e  je     0x4a850                             ;   skip cast
   *   0x4a840  movq   %rbx, %rdi                          ; else: arg0 = cur
   *   0x4a843  movq   %r14, %rsi                          ;       arg1 = srcType
   *   0x4a846  movq   %r15, %rdx                          ;       arg2 = dstType
   *   0x4a849  xorl   %ecx, %ecx                          ;       arg3 = 0 (hint = none)
   *   0x4a84b  callq  0xacea0        ## ___dynamic_cast   ; result = ___dynamic_cast(cur, ...)
   *                                                       ;   (rax overwritten by callee — every hit
   *                                                       ;    replaces `result`, so the LAST hit wins)
   *   0x4a850  movq   0x30(%rbx), %rbx                    ; cur = cur->parent_folder     (offset 0x30)
   *   0x4a854  testq  %rbx, %rbx                          ; while (cur != NULL)
   *   0x4a857  jne    0x4a83a                             ;   goto loop
   *   0x4a859..0x4a863  epilogue + retq                   ; return result (rax = LAST cast, or NULL)
   *   0x4a864  xorl   %eax, %eax                          ; bail_null:
   *   0x4a866  retq                                       ;   return NULL
   *
   * SEMANTICS:
   *   Walks the ENTIRE parent chain from `this` up to the root of the chain
   *   (i.e. until `parent_folder == NULL` at offset 0x30). At every node
   *   whose flag byte at +0x39 has bit 0x20 set (the "channel root" flag),
   *   perform `dynamic_cast<OZChannelObjectRootBase*>(node)`. The RESULT
   *   variable (rax) is overwritten by each such call, so the value ultimately
   *   returned is the dynamic_cast of the LAST — i.e. topmost / rootmost —
   *   node in the chain whose flag bit 0x20 was set. If no node in the chain
   *   has that bit, or the chain is empty, return NULL.
   *
   *   Contrast with the sibling `getChannelRootBase()` @0x4a428, which uses
   *   a tail-jmp to `___dynamic_cast` and therefore returns AT the FIRST hit —
   *   the CLOSEST ancestor with the flag. `getAncestorRootBase()` keeps
   *   walking past the first hit and clobbers `rax` on each subsequent hit,
   *   so it returns the FURTHEST (topmost) hit.
   *
   *   `___dynamic_cast` is the Itanium C++ ABI cross-cast; see the
   *   `dynamic_cast_to_OZChannelObjectRootBase_stub` docblock at the top of
   *   this file for the boundary-stub policy (libc++abi, TRUE out-of-scope
   *   extern — modelled as a stub).
   *
   * DEPENDENCIES: none in-scope. The only external is `___dynamic_cast`
   * @ProChannel stub 0xacea0 — libcxxabi, modelled by the file-scope
   * `dynamic_cast_to_OZChannelObjectRootBase_stub` (same boundary as
   * `getChannelRootBase`).
   */
  getAncestorRootBase(): OZChannelObjectRootBase | null {
    // @0x4a818..0x4a81b  testq %rdi,%rdi ; je 0x4a864 — the null-`this` guard.
    //   In a TS method call `this` cannot be null (calling `null.method()`
    //   throws at the call site), so the guard collapses to `return null`
    //   as an unreachable-in-well-typed-code but disasm-faithful branch.
    //   We do NOT `throw` here — the disasm explicitly falls through to
    //   `xorl %eax,%eax ; retq` (return NULL), which is the observable
    //   behaviour a caller in the binary would receive. We match it.
    //   (In C++ this is `foo->getAncestorRootBase()` on a possibly-null
    //   pointer; the C++ member function ABI receives `this` in %rdi and
    //   the compiler emits a null-check because the method reads +0x39
    //   before doing anything else.)
    //
    //   `this` in a well-typed TS call is always the receiver object.
    //   No explicit check needed — proceed straight into the loop.

    // @0x4a82a  xorl %eax, %eax   — result register initialised to NULL.
    //   rax is used as BOTH the scratch return of every ___dynamic_cast
    //   call AND the eventual function return. Model as a mutable local
    //   `result` that starts NULL and is overwritten by every stub call.
    let result: OZChannelObjectRootBase | null = null;

    // @0x4a827  movq %rdi, %rbx    — cur = this;   (loop pointer)
    // (Typing narrowed to OZChannelBase for the +0x39 flag read and the
    //  +0x30 parent walk. Both fields live on OZChannelBase per the layout
    //  block above; the RTTI cast at each hit reconciles concrete class.)
    let cur: OZChannelBase | null = this;

    // @0x4a83a..0x4a857 — the tight loop. Structure differs from the
    // sibling getChannelRootBase (which EXITS at the first flag hit) in
    // that we CONTINUE past every hit, letting `result` be overwritten
    // each time. Only when `cur` (the +0x30 parent) becomes NULL do we
    // fall out and return whatever the LAST hit produced.
    while (cur !== null) {
      // @0x4a83a  testb $0x20, 0x39(%rbx)  ; @0x4a83e  je 0x4a850
      //   Read the flag byte at +0x39; if bit 0x20 is set, do the cast.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagByte: number = (cur as any).__flag_byte_at_0x39 as number;
      if ((flagByte & 0x20) !== 0) {
        // @0x4a840..0x4a84b  callq ___dynamic_cast(cur, TI(OZChannelBase),
        //                                          TI(OZChannelObjectRootBase), 0)
        //   The callq (NOT a jmp — see the epilogue at 0x4a859) writes rax
        //   and control returns; unlike getChannelRootBase's tail-jmp, we
        //   continue the loop after this call. Every subsequent flag-hit
        //   OVERWRITES `result`, which is the whole point: the function
        //   returns the topmost ancestor's cast, not the first.
        result = dynamic_cast_to_OZChannelObjectRootBase_stub(cur);
      }

      // @0x4a850  movq 0x30(%rbx), %rbx   ; cur = cur->parent_folder
      // @0x4a854  testq %rbx, %rbx        ; while (cur != NULL) via the loop head
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parent = (cur as any).__parent_folder_at_0x30 as
        | OZChannelBase
        | null;
      cur = parent;
    }

    // @0x4a859..0x4a863 — pop registers and `retq` with rax = `result`.
    //   If the loop never hit the flag bit, `result` stayed NULL from
    //   the @0x4a82a initialisation; if it hit one or more times, `result`
    //   holds the cast of the LAST (topmost / most-ancestor) hit.
    return result;
  }
}
