// OZCurve — a keyframe animation curve (<curve> element). ProChannel.framework.
// Faithful port. Decode: OZCurve::parseElement @ ProChannel 0x270xx (re/disasm/ProChannel.OZCurve.parseElement.s).
//   - Reads OZCurveScope attributes: numberOfKeypoints(0x0), value(0x1), type(0x4), parametric(0x5),
//     round(0x6), retimingExtrapolation(0x7), default(0x8), enabled(0x9), interpolation(0xa), flags(0xb).
//   - Backing store is an OZSpline: getSpline()/createSpline()/reserveMemoryForKeypoints(n)/
//     appendVertexNoTangents(CMTime time, double value, CMTime ...) — @0x27114..0x27509. Keypoints
//     carry a rational CMTime + value (+ optional in/out tangents for parametric curves).
//   - Element cases (elem->type at +0x8): 0xe (a scalar/int header), 0x76 (a keypoint entry), etc.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";

/** One keyframe: a rational time + value (+ optional tangents/interp). */
export interface OZKeypoint {
  time: number;            // CMTime numerator in the stream timescale (setTimeScale)
  value: number;
  interpolation?: number;  // 0xa
  inTangent?: number;
  outTangent?: number;
  flags?: number;          // 0xb
}

export class OZCurve {
  type?: number;                  // 0x4
  parametric?: number;            // 0x5
  round?: number;                 // 0x6
  retimingExtrapolation?: number; // 0x7
  defaultValue?: number;          // 0x8
  enabled?: number;               // 0x9
  numberOfKeypoints = 0;          // 0x0
  keypoints: OZKeypoint[] = [];

  parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    switch (e.tagName) {
      case "numberOfKeypoints":
        this.numberOfKeypoints = s.getAsInt32(e); // OZSpline::reserveMemoryForKeypoints
        break;
      case "keypoint": {
        // <keypoint><time>..</time><value>..</value> ... </keypoint> — appendVertexNoTangents.
        const kp: OZKeypoint = { time: 0, value: 0 };
        for (const c of e.children) {
          if (c.tagName === "time") kp.time = s.getAsDouble(c);
          else if (c.tagName === "value") kp.value = s.getAsDouble(c);
          else if (c.tagName === "inTangent") kp.inTangent = s.getAsDouble(c);
          else if (c.tagName === "outTangent") kp.outTangent = s.getAsDouble(c);
        }
        const interp = s.getAttributeAsUInt32(e, 0xa); if (interp !== undefined) kp.interpolation = interp;
        const flags = s.getAttributeAsUInt32(e, 0xb); if (flags !== undefined) kp.flags = flags;
        this.keypoints.push(kp);
        break;
      }
      default:
        break;
    }
  }
}
