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
}
