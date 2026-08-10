// PCAtomMetadataHandler.ts — ProCore.framework metadata-handler class.
//
// This file ports ONLY `PCAtomMetadataHandler::copyMetadata()`. The class owns a
// CoreFoundation dictionary of atom metadata at field +0x88; copyMetadata() returns
// an immutable copy of it via CoreFoundation's CFDictionaryCreateCopy.
//
// Verbatim from FCP's ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Decode evidence:
//   re/disasm/ProCore.__ZN21PCAtomMetadataHandler12copyMetadataEv.s   @0xb525a  copyMetadata()
//
//   Disasm (9 lines):
//     0xb525a  pushq %rbp
//     0xb525b  movq  %rsp, %rbp
//     0xb525e  movq  0x921db(%rip), %rax   ## &_kCFAllocatorDefault (literal-pool sym)
//     0xb5265  movq  (%rax), %rax          ## rax = *kCFAllocatorDefault
//     0xb5268  movq  0x88(%rdi), %rsi      ## rsi = this->metadata  (+0x88)
//     0xb526f  movq  %rax, %rdi            ## rdi = kCFAllocatorDefault
//     0xb5272  popq  %rbp
//     0xb5273  jmp   0xddf88               ## tail-call _CFDictionaryCreateCopy stub
//
//   Semantics: `return CFDictionaryCreateCopy(kCFAllocatorDefault, this->metadata);`
//   Tail-jump means the CF call's return value (rax) is this function's return value.
//
// -- STRUCT LAYOUT (partial, from this method) ----------------------------
//   offset  size  field       source
//   ------  ----  ----------  -----------------------------------------------
//   +0x88   0x08  metadata    @0xb5268 movq 0x88(%rdi),%rsi  (a CFDictionaryRef;
//                             the source dictionary handed to CFDictionaryCreateCopy)
//
// -- FRONTIER EXTERNS (TRUE out-of-scope CoreFoundation — boundary stubs) --
//   _kCFAllocatorDefault      @0xb525e literal-pool ref — CoreFoundation global.
//   _CFDictionaryCreateCopy   @stub 0xddf88 — CoreFoundation.framework extern; creates
//                             an immutable copy of a CFDictionary. Not modelled in TS
//                             (the port never inspects CF dictionary bytes).

import type { CFDictionaryRef } from "./PCCFRef_CFDictionary";

/** Opaque CoreFoundation allocator handle (`CFAllocatorRef`). Only ever passed
 *  back through CF boundary stubs. */
export interface CFAllocatorRef {
  readonly __cf_allocator_brand: unique symbol;
}

/**
 * `_kCFAllocatorDefault` — CoreFoundation.framework global (the default allocator).
 * @0xb525e ProCore (literal-pool reference; dereferenced at @0xb5265).
 * TRUE out-of-scope extern: CoreFoundation owns this global; the JS surrogate has no
 * CF runtime, so reading it is a boundary stub.
 */
function kCFAllocatorDefault(): CFAllocatorRef {
  throw new Error(
    "_kCFAllocatorDefault is a CoreFoundation global with no pure-JS equivalent " +
      "(@ProCore 0xb525e).",
  );
}

/**
 * `_CFDictionaryCreateCopy(CFAllocatorRef, CFDictionaryRef)` — CoreFoundation.framework
 * extern (called via ProCore stub @0xddf88). TRUE out-of-scope extern: creates an
 * immutable copy of the source dictionary. The JS surrogate does not model CFDictionary
 * bytes; documented so a parity harness can hook the boundary.
 */
function CFDictionaryCreateCopy(
  _allocator: CFAllocatorRef,
  _source: CFDictionaryRef,
): CFDictionaryRef {
  throw new Error(
    "_CFDictionaryCreateCopy is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddf88).",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CoreFoundation externs used by createParsedHDRMetadata (all TRUE out-of-scope).
// Every one is a CoreFoundation.framework boundary stub — the JS surrogate has no
// CF runtime (no CFDictionary/CFData/CFString byte model), so each is a documented
// boundary throw citing its @0xADDR / ProCore stub, exactly like copyMetadata's
// externs above and the PCCFRef_* ports.
// ─────────────────────────────────────────────────────────────────────────────

/** Opaque CoreFoundation string handle (`CFStringRef`). Only ever passed back
 *  through CF boundary stubs. */
export interface CFStringRef {
  readonly __cf_string_brand: unique symbol;
}
/** Opaque CoreFoundation data handle (`__CFData const*` / `CFDataRef`). */
export interface CFDataRef2 {
  readonly __cf_data_brand2: unique symbol;
}

/** `_kCFTypeDictionaryKeyCallBacks` — CoreFoundation global (@ProCore literal
 *  pool @0xb4c8f). TRUE out-of-scope extern. */
function kCFTypeDictionaryKeyCallBacks(): unknown {
  throw new Error(
    "_kCFTypeDictionaryKeyCallBacks is a CoreFoundation global with no pure-JS " +
      "equivalent (@ProCore 0xb4c8f).",
  );
}
/** `_kCFTypeDictionaryValueCallBacks` — CoreFoundation global (@ProCore literal
 *  pool @0xb4c96). TRUE out-of-scope extern. */
function kCFTypeDictionaryValueCallBacks(): unknown {
  throw new Error(
    "_kCFTypeDictionaryValueCallBacks is a CoreFoundation global with no pure-JS " +
      "equivalent (@ProCore 0xb4c96).",
  );
}

/** `_CFDictionaryCreateMutable(allocator, capacity, keyCB, valueCB)` — CoreFoundation
 *  extern, called via ProCore stub 0xddf8e (@0xb4ca2). TRUE out-of-scope extern. */
function CFDictionaryCreateMutable(
  _allocator: CFAllocatorRef,
  _capacity: number,
  _keyCallBacks: unknown,
  _valueCallBacks: unknown,
): CFDictionaryRef {
  throw new Error(
    "_CFDictionaryCreateMutable is a CoreFoundation extern with no pure-JS " +
      "equivalent (@ProCore stub 0xddf8e).",
  );
}
/** `_CFDictionaryGetValue(dict, key)` — CoreFoundation extern, ProCore stub 0xddfb2
 *  (@0xb4cbd / @0xb4f79). TRUE out-of-scope extern. Returns the value or NULL. */
function CFDictionaryGetValue(
  _dict: CFDictionaryRef,
  _key: CFStringRef,
): CFDataRef2 | null {
  throw new Error(
    "_CFDictionaryGetValue is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddfb2).",
  );
}
/** `_CFDictionarySetValue(dict, key, value)` — CoreFoundation extern, ProCore stub
 *  0xddfc4 (@0xb4d1c etc.). TRUE out-of-scope extern. */
function CFDictionarySetValue(
  _dict: CFDictionaryRef,
  _key: CFStringRef,
  _value: CFStringRef,
): void {
  throw new Error(
    "_CFDictionarySetValue is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddfc4).",
  );
}
/** `_CFDataGetLength(data)` — CoreFoundation extern, ProCore stub 0xddf5e
 *  (@0xb4cd1 / @0xb4f8d). TRUE out-of-scope extern. Returns the byte length. */
function CFDataGetLength(_data: CFDataRef2): number {
  throw new Error(
    "_CFDataGetLength is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddf5e).",
  );
}
/** `_CFDataGetBytePtr(data)` — CoreFoundation extern, ProCore stub 0xddf52
 *  (@0xb4ce2 / @0xb4f9e). TRUE out-of-scope extern. Returns a pointer to the raw
 *  bytes; here modelled as a Uint8Array view. */
function CFDataGetBytePtr(_data: CFDataRef2): Uint8Array {
  throw new Error(
    "_CFDataGetBytePtr is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddf52).",
  );
}
/** `_CFStringCreateWithFormat(allocator, formatOptions, format, ...)` — CoreFoundation
 *  extern, ProCore stub 0xde07e (@0xb4d02 etc.). TRUE out-of-scope extern. Here always
 *  called with format "%d" and a single int argument; returns a retained CFStringRef
 *  or NULL. */
function CFStringCreateWithFormat(
  _allocator: CFAllocatorRef,
  _formatOptions: null,
  _format: string,
  _arg: number,
): CFStringRef | null {
  throw new Error(
    "_CFStringCreateWithFormat is a CoreFoundation extern with no pure-JS " +
      "equivalent (@ProCore stub 0xde07e).",
  );
}
/** `_CFRelease(cf)` — CoreFoundation extern, ProCore stub 0xde012 (@0xb4d24 etc.).
 *  TRUE out-of-scope extern. Balances the +1 retain from CFStringCreateWithFormat. */
function CFRelease(_cf: CFStringRef): void {
  throw new Error(
    "_CFRelease is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xde012).",
  );
}

export class PCAtomMetadataHandler {
  // +0x88: the atom-metadata dictionary (a CFDictionaryRef) that copyMetadata() copies.
  metadata!: CFDictionaryRef; // field @+0x88

  /**
   * PCAtomMetadataHandler::copyMetadata()
   * @0xb525a ProCore
   *
   * Tail-calls CoreFoundation's CFDictionaryCreateCopy to return an immutable copy of
   * this->metadata (+0x88), using the default allocator. See disasm above.
   */
  copyMetadata(): CFDictionaryRef {
    // @0xb525e/@0xb5265  rax = *kCFAllocatorDefault
    const allocator = kCFAllocatorDefault();
    // @0xb5268  rsi = this->metadata (+0x88)
    // @0xb5273  jmp _CFDictionaryCreateCopy(allocator, metadata) — tail call, return its rax
    return CFDictionaryCreateCopy(allocator, this.metadata);
  }

  /**
   * PCAtomMetadataHandler::createParsedHDRMetadata(__CFDictionary const*)
   * @0xADDR ProCore 0x00000000000b4c74
   *   (__ZN21PCAtomMetadataHandler23createParsedHDRMetadataEPK14__CFDictionary)
   *
   * Parses the two ISO-BMFF/QuickTime HDR mastering-metadata boxes carried in the
   * input CFDictionary — "mdcv" (Mastering Display Colour Volume, ISO/IEC 23001-8)
   * and "clli" (Content Light Level Information) — into a fresh mutable CFDictionary
   * of human-readable `%d` strings keyed by the standard field names. Returns the new
   * dictionary (the caller owns the +1 from CFDictionaryCreateMutable).
   *
   * All string literals were recovered from the __cfstring literal pool (otool prints
   * "@\"bad cfstring ref\"" because the __cfstring dataptr is a rebased pointer):
   *   input keys  : "mdcv" @0x14e9d8, "clli" @0x14e9f8
   *   format      : "%d" @0x14d8f8 (every value)
   *   mdcv out keys: display_primaries_x0 @0x14fd18, _y0 @0x14fd38, _x1 @0x14fd58,
   *     _y1 @0x14fd78, _x2 @0x14fd98, _y2 @0x14fdb8, white_point_x @0x14fdd8,
   *     white_point_y @0x14fdf8, max_display_mastering_luminance @0x14fe18,
   *     min_display_mastering_luminance @0x14fe38.
   *   clli out keys: max_content_light_level @0x14fe58, max_pic_average_light_level @0x14fe78.
   *
   * DECODE (raw-port/re/disasm/…createParsedHDRMetadataEPK14__CFDictionary.s, 257 lines):
   *   0xb4c85..0xb4ca7  out = CFDictionaryCreateMutable(kCFAllocatorDefault, 0,
   *                       kCFTypeDictionaryKeyCallBacks, kCFTypeDictionaryValueCallBacks)
   *   0xb4caa  if (input == NULL) goto 0xb5026 (return out)
   *   0xb4cb3..0xb4cbd  mdcv = CFDictionaryGetValue(input, "mdcv")
   *   0xb4cc2  if (mdcv == NULL) goto 0xb4f6f (skip to clli)
   *   0xb4cd1  if (CFDataGetLength(mdcv) <= 0) goto 0xb4f6f
   *   0xb4ce2  p = CFDataGetBytePtr(mdcv)
   *   then 10 uint16 fields (big-endian: movzwl + rolw $8) at byte offsets 0,2,4,6,8,
   *     0xa,0xc,0xe and 2 uint32 fields (bswapl) at 0x10,0x14 — each:
   *       s = CFStringCreateWithFormat(kCFAllocatorDefault, NULL, "%d", value)
   *       if (s) { CFDictionarySetValue(out, <key>, s); CFRelease(s); }
   *   0xb4f6f..0xb4f79  clli = CFDictionaryGetValue(input, "clli")
   *   0xb4f81  if (clli == NULL) goto 0xb5026
   *   0xb4f8d  if (CFDataGetLength(clli) <= 0) goto 0xb5026
   *   0xb4f9e  q = CFDataGetBytePtr(clli)
   *   then 2 uint16 fields (big-endian) at 0,2 with the same format+set+release dance.
   *   0xb5026  return out
   *
   * ENDIANNESS: uint16s are read `movzwl (ptr); rolw $8` — a byte-swap of a 16-bit
   * value = big-endian read; then `movzwl %ax,%ecx` zero-extends (UNSIGNED 0..65535)
   * before the "%d". uint32s are `movl; bswapl` = big-endian read, passed to "%d" as a
   * 32-bit int. Both boxes are defined big-endian by the ISO spec, matching this.
   *
   * FRONTIER CALLEES: all CoreFoundation externs (boundary stubs above) —
   * CFDictionaryCreateMutable/GetValue/SetValue, CFDataGetLength/BytePtr,
   * CFStringCreateWithFormat, CFRelease, and the two callback globals. NO in-scope
   * callees. Because the CF byte model is not simulated, the first CF call reaches its
   * documented CoreFoundation boundary; the parse/formatting control flow itself is
   * transcribed faithfully line-for-line.
   */
  createParsedHDRMetadata(input: CFDictionaryRef | null): CFDictionaryRef {
    // @0xb4c85..0xb4ca7  out = CFDictionaryCreateMutable(default, 0, keyCB, valueCB).
    const allocator = kCFAllocatorDefault(); // @0xb4c85/0xb4c8c deref _kCFAllocatorDefault
    const keyCB = kCFTypeDictionaryKeyCallBacks(); // @0xb4c8f
    const valueCB = kCFTypeDictionaryValueCallBacks(); // @0xb4c96
    const out = CFDictionaryCreateMutable(allocator, 0, keyCB, valueCB); // @0xb4ca2

    // @0xb4caa  if (input == NULL) return out.
    if (input === null || input === undefined) {
      // @0xb5026  return out.
      return out;
    }

    // Helper mirroring the repeated "format one %d value and store it under key"
    // block (@0xb4cf4..0xb4d29 etc.): it is the SAME 6-instruction sequence emitted
    // once per field, not an invented abstraction — the format string is always "%d".
    const setField = (key: string, value: number): void => {
      // @…  s = CFStringCreateWithFormat(default, NULL, "%d", value).
      const s = CFStringCreateWithFormat(allocator, null, "%d", value);
      // @…  testq %rax,%rax ; je (skip) : only set/release when non-NULL.
      if (s !== null) {
        // @…  CFDictionarySetValue(out, key, s).
        CFDictionarySetValue(out, key as unknown as CFStringRef, s);
        // @…  CFRelease(s).
        CFRelease(s);
      }
    };
    // big-endian uint16 read: movzwl (p+off) ; rolw $8 ; movzwl %ax (unsigned 0..65535).
    const be16 = (p: Uint8Array, off: number): number =>
      ((p[off]! << 8) | p[off + 1]!) & 0xffff;
    // big-endian uint32 read: movl (p+off) ; bswapl. Passed to "%d" as a 32-bit int.
    const be32 = (p: Uint8Array, off: number): number =>
      ((p[off]! << 24) | (p[off + 1]! << 16) | (p[off + 2]! << 8) | p[off + 3]!) | 0;

    // ---- "mdcv" (Mastering Display Colour Volume) @0xb4cb3 ----
    const mdcv = CFDictionaryGetValue(input, "mdcv" as unknown as CFStringRef); // @0xb4cbd
    // @0xb4cc2  if (mdcv != NULL) && @0xb4cd1 CFDataGetLength(mdcv) > 0.
    if (mdcv !== null && CFDataGetLength(mdcv) > 0) {
      // @0xb4ce2  p = CFDataGetBytePtr(mdcv).
      const p = CFDataGetBytePtr(mdcv);
      // 10 big-endian uint16 fields @byte offsets 0..0xe (@0xb4cea..0xb4eef).
      setField("display_primaries_x0", be16(p, 0x0)); // @0xb4cea
      setField("display_primaries_y0", be16(p, 0x2)); // @0xb4d29
      setField("display_primaries_x1", be16(p, 0x4)); // @0xb4d6b
      setField("display_primaries_y1", be16(p, 0x6)); // @0xb4dad
      setField("display_primaries_x2", be16(p, 0x8)); // @0xb4def
      setField("display_primaries_y2", be16(p, 0xa)); // @0xb4e31
      setField("white_point_x", be16(p, 0xc)); // @0xb4e73
      setField("white_point_y", be16(p, 0xe)); // @0xb4eb5
      // 2 big-endian uint32 luminance fields @0x10,0x14 (@0xb4ef7,@0xb4f33).
      setField("max_display_mastering_luminance", be32(p, 0x10)); // @0xb4ef7
      setField("min_display_mastering_luminance", be32(p, 0x14)); // @0xb4f33
    }

    // ---- "clli" (Content Light Level Information) @0xb4f6f ----
    const clli = CFDictionaryGetValue(input, "clli" as unknown as CFStringRef); // @0xb4f79
    // @0xb4f81  if (clli != NULL) && @0xb4f8d CFDataGetLength(clli) > 0.
    if (clli !== null && CFDataGetLength(clli) > 0) {
      // @0xb4f9e  q = CFDataGetBytePtr(clli).
      const q = CFDataGetBytePtr(clli);
      // 2 big-endian uint16 fields @byte offsets 0,2 (@0xb4fa6,@0xb4fe5).
      setField("max_content_light_level", be16(q, 0x0)); // @0xb4fa6
      setField("max_pic_average_light_level", be16(q, 0x2)); // @0xb4fe5
    }

    // @0xb5026  return out.
    return out;
  }
}

