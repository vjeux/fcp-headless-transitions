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
import { CMTime, CMTimeGetSeconds } from "../infra/CMTime.js";

/** One keyframe: a rational time + value (+ optional 2D-Bézier tangent handles/interp). */
export interface OZKeypoint {
  /** The vertex time "U" as the FULL rational CMTime (value/timescale), for CMTime-space interp. */
  u: CMTime;
  /** Convenience: u reduced to seconds (u.value/u.timescale). */
  time: number;
  value: number;
  interpolation?: number;  // 0xa
  // Bézier/CatmullRom tangent HANDLES, in (time,value) space, relative to this keypoint.
  // DECODED: the .motr tags are inputTangentTime/inputTangentValue/outputTangentTime/
  // outputTangentValue (strings present verbatim in ProChannel; consumed via
  // OZChannelCurve -> OZChannelCurve::setTangents(OZVertex2D, CMTime tanTime, double, double)).
  // The incoming handle time is NEGATIVE (points back toward the previous keypoint).
  inputTangentTime?: number;
  inputTangentValue?: number;
  outputTangentTime?: number;
  outputTangentValue?: number;
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
        const kp: OZKeypoint = { u: { value: 0n, timescale: 0, flags: 0, epoch: 0n }, time: 0, value: 0 };
        for (const c of e.children) {
          if (c.tagName === "time") { kp.u = s.getAsCMTime(c); kp.time = CMTimeGetSeconds(kp.u); } // full CMTime + seconds
          else if (c.tagName === "value") kp.value = s.getAsDouble(c);
          else if (c.tagName === "inputTangentTime") kp.inputTangentTime = s.getAsDouble(c);
          else if (c.tagName === "inputTangentValue") kp.inputTangentValue = s.getAsDouble(c);
          else if (c.tagName === "outputTangentTime") kp.outputTangentTime = s.getAsDouble(c);
          else if (c.tagName === "outputTangentValue") kp.outputTangentValue = s.getAsDouble(c);
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
