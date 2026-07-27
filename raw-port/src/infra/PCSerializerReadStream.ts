// PCSerializerReadStream — the read cursor over a PCSerializer element tree.
//
// Faithful port of ProCore's PCSerializerReadStream (ProCore.framework). Decoded 2026-07-27:
//   - getAttributeAs{Int32,UInt32,Double,Float,String,Bool,UUID}(elem, id, &out): read attribute
//     `id` off `elem` and coerce (strtoul base10 / strtod / etc). @ ProCore 0x266xx.
//   - pushScope(PCScope*): set the child-element handler scope for the next descent.
//   - getElementInfo(name): resolve an element NAME (in the active scope) to its type tag +
//     child scope (@ ProCore 0x265b4). We fold this into the XML loader (see readScene).
//   - isLessThanVersion(maj,min): document-version gate used by many parseElement branches.
//   - setTimeScale(ts): the rational-time timescale for <timing>/<curve> values.
//
// The stream is a thin façade: attribute coercion lives on PCStreamElement (which already knows
// its scope). This class carries the parse-time CONTEXT (version, timescale, factory table) that
// parseElement methods consult.

import { PCStreamElement } from "./PCStreamElement.js";

export class PCSerializerReadStream {
  /** Document format version (from <ozml version=...> / OZDocument). */
  versionMajor = 0;
  versionMinor = 0;
  /** Rational-time timescale for timing/curve conversions (frames base). */
  timeScale = 0;
  /** factoryID -> factory UUID, populated from the <factory> table (FactoryParser). */
  factories = new Map<number, string>();

  // --- attribute reads (delegate to the element, which resolves id->name via its scope) ---
  getAttributeAsString(e: PCStreamElement, id: number): string | undefined { return e.getAttributeAsString(id); }
  getAttributeAsUInt32(e: PCStreamElement, id: number): number | undefined { return e.getAttributeAsUInt32(id); }
  getAttributeAsInt32(e: PCStreamElement, id: number): number | undefined { return e.getAttributeAsInt32(id); }
  getAttributeAsDouble(e: PCStreamElement, id: number): number | undefined { return e.getAttributeAsDouble(id); }
  getAttributeAsBool(e: PCStreamElement, id: number): boolean | undefined { return e.getAttributeAsBool(id); }
  getAttributeAsUUID(e: PCStreamElement, id: number): string | undefined { return e.getAttributeAsUUID(id); }

  // --- element text/value reads ---
  getAsString(e: PCStreamElement): string { return e.text; }
  getAsUInt32(e: PCStreamElement): number { const v = parseInt(e.text, 10); return Number.isNaN(v) ? 0 : v >>> 0; }
  getAsInt32(e: PCStreamElement): number { const v = parseInt(e.text, 10); return Number.isNaN(v) ? 0 : v | 0; }
  getAsDouble(e: PCStreamElement): number { const v = parseFloat(e.text); return Number.isNaN(v) ? 0 : v; }

  /**
   * getAsFigTime — parse a CMTime element to SECONDS. DECODED from PCStreamElement::aToFigTime
   * (ProCore @0x287d8): the text is 4 whitespace-separated fields parsed in THIS order/base:
   *   1. value     = strtoll(base 10)   -> CMTime.value      (int64, offset 0x0)
   *   2. timescale = strtol (base 10)   -> CMTime.timescale  (int32, offset 0x8)
   *   3. epoch     = strtoull(base 16)  -> CMTime.epoch       (uint,  offset 0xc)  [HEX!]
   *   4. flags     = strtoull(base 10)  -> CMTime.flags       (uint,  offset 0x10)
   * e.g. "88088 120000 1 0" = value 88088 / timescale 120000 = 0.7340666s. Returns seconds.
   */
  getAsFigTime(e: PCStreamElement): number {
    const t = e.text.trim();
    if (!t) return 0;
    const parts = t.split(/\s+/);
    const value = parts[0] !== undefined ? Number(BigInt.asIntN(64, BigInt(parseInt(parts[0], 10) || 0))) : 0;
    const timescale = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;
    // epoch (parts[2], base 16) and flags (parts[3], base 10) are parsed by FCP but do not affect
    // the scalar seconds value used for sampling; retained here only for fidelity of the format.
    return timescale > 0 ? value / timescale : 0;
  }

  /** OZDocument version gate. Returns true when doc version < (maj,min). */
  isLessThanVersion(maj: number, min: number): boolean {
    return this.versionMajor < maj || (this.versionMajor === maj && this.versionMinor < min);
  }
  setTimeScale(ts: number): void { this.timeScale = ts; }
}
