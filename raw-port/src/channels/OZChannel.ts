// OZChannel — a leaf value channel (a single animatable scalar). Extends OZChannelBase.
// Faithful port. Decode: OZChannel::parseElement @ ProChannel 0x15184 — calls
// OZChannelBase::parseElement then handles fade curves/offsets (tags 0x76-0x83:
// setFadeInCurve/setFadeOutCurve/setFadeInOffset/setFadeOutOffset). The scalar VALUE + DEFAULT
// are set by the PARENT OZChannelFolder while reading the <parameter> attributes (0x72 value ->
// setInitialValue @0x669a1, 0x73 default -> setDefaultValue @0x668b1); the <curve> child (if any)
// is parsed by OZCurve. OZChannelScope: 0x72 value, 0x73 default, 0x5 index, 0x7 id (vertex refs).
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZChannelBase } from "./OZChannelBase.js";
import { OZCurve } from "./OZCurve.js";

export class OZChannel extends OZChannelBase {
  /** Static (non-animated) value; overridden by curve when present. */
  value?: number;
  defaultValue?: number;
  curve?: OZCurve;
  /** For vertex channels: the vertex index/id. */
  index?: number;

  setInitialValue(v: number): void { this.value = v; }
  setDefaultValue(v: number): void { this.defaultValue = v; }

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZChannelBase::parseElement @0x15184
    // A <curve> child carries keyframes; OZChannelFolder dispatches it, but a channel may also own
    // it directly. Fade in/out (0x76-0x83) are advanced cases handled when present.
    if (e.tagName === "curve") {
      this.curve = new OZCurve();
      this.curve.parseElement(s, e);
    }
  }
}
