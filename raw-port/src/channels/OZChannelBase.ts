// OZChannelBase — base of every channel/parameter node (ProChannel.framework).
// Faithful port. Decode: OZChannelBase::parseElement @ ProChannel 0x666... (30-line base:
// handles <flags> and the common name/id/internalName/factoryID attributes via OZChannelBaseScope).
// OZChannelBaseScope: 0x6e name, 0x6f id, 0x70 flags, 0x71 factoryID, 0x76 internalName.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";

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

  /** @ProChannel OZChannelBase layout offset 0x3a (read @0x4bb72).
   *  Packed flag byte containing at least the `isSolo` flag at bit 2 (mask 0x4).
   *  The ctor that clears/initialises this byte is a separate ledger unit — we model
   *  the field as a plain u8 (0..255) so the bit-3 shift/and in isSolo has a well-typed
   *  source, and default to 0 (not-solo, matching a zero-initialised C++ struct).
   *  Other bits in this byte are unused by isSolo and remain unnamed until the setter
   *  is decoded.  */
  private __flags_byte_at_0x3a: number = 0;

  /**
   * OZChannelBase::isSolo() const.
   * @ProChannel 0x4bb6e..0x4bb7b  (__ZNK13OZChannelBase6isSoloEv)
   *
   * Disasm (raw-port/re/disasm/ProChannel.__ZNK13OZChannelBase6isSoloEv.s):
   *   0x4bb6e  pushq  %rbp                    ; prologue
   *   0x4bb6f  movq   %rsp, %rbp              ; prologue
   *   0x4bb72  movb   0x3a(%rdi), %al         ; al = *(u8*)(this + 0x3a)
   *   0x4bb75  andb   $0x4, %al               ; al &= 0x04       (mask bit 2)
   *   0x4bb77  shrb   $0x2, %al               ; al >>= 2         (shift to bit 0)
   *   0x4bb7a  popq   %rbp                    ; epilogue
   *   0x4bb7b  retq                           ; return %al (0 or 1) — as bool
   *
   * Semantics: read the packed flag byte at layout offset 0x3a, extract bit 2, and
   * return it as a boolean.  The mask-then-shift idiom is the compiler's way of
   * lowering `return (flags & 0x4) ? true : false;` — the result is 0 or 1, which
   * the C++ ABI treats as bool.
   *
   * Note (0-vs-1 vs true/false): the machine returns a byte in %al holding exactly
   * 0 or 1; the C++ bool ABI leaves upper bits unspecified, so callers zero-extend
   * on their own.  We return a TS boolean directly — the value is derivable by
   * `((flags & 0x4) >> 2) !== 0`, which is bit-identical to the disasm's output.
   */
  isSolo(): boolean {
    // @0x4bb72  movb  0x3a(%rdi), %al   — read the packed flag byte.
    const flags = this.__flags_byte_at_0x3a & 0xff;
    // @0x4bb75  andb  $0x4, %al         — mask bit 2 (0x04).
    // @0x4bb77  shrb  $0x2, %al         — shift down to bit 0.
    // Combined: the low bit of the result is `(flags >> 2) & 1`.
    return ((flags & 0x04) >>> 2) !== 0;
  }
}
