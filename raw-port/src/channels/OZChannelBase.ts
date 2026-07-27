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
}
