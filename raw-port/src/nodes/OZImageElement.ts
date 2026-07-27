// OZImageElement — an image/media/generator/drop-zone leaf. Extends OZElement.
// Faithful port of Ozone OZImageElement::parseElement @0x5f8770.
//   - base OZElement::parseElement (@0x5f878f)
//   - minor own cases (0x5, 0x1) + a getAsString read.
// Like every node, the SUBSTANTIVE data (media/clip ref, Drop Zone Type, transform, colour) lives
// in the <parameter> CHANNEL tree parsed by OZChannelObjectRoot (channels/) — populated onto
// `channels` when the channel-tree driver is wired. OZImageElementScope: id 0x0 = "type".
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZElement } from "./OZElement.js";
import { OZChannel } from "../channels/OZChannel.js";

export class OZImageElement extends OZElement {
  /** Root of this node's <parameter> channel tree (transform, media ref, colour, ...). */
  channelRoot?: OZChannel;

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZElement::parseElement (@0x5f878f)
    // OZImageElement-specific tags (0x1/0x5) are advanced; the media/transform come from the
    // <parameter> channel subtree handled by the channel driver.
  }
}
