// PCAtomMetadataHandler.ts — ProCore.framework metadata-handler class.
//
// This file ports `PCAtomMetadataHandler::copyMetadata()`, `createParsedHDRMetadata()`
// and `createParsedGoogleV2Metadata()`. The class owns a CoreFoundation dictionary of
// atom metadata at field +0x88; copyMetadata() returns an immutable copy of it via
// CoreFoundation's CFDictionaryCreateCopy.
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

// ─────────────────────────────────────────────────────────────────────────────
// CoreFoundation externs used by flattenDictionary (all TRUE out-of-scope). Each is
// a CoreFoundation.framework boundary stub — the JS surrogate has no CF runtime (no
// CFDictionary/CFString/CFNumber byte model), so each is a documented boundary throw
// citing its @ProCore stub, exactly like the copyMetadata/createParsedHDRMetadata
// externs above. `operator new[]`/`operator delete[]` are libc (out-of-scope) too.
// ─────────────────────────────────────────────────────────────────────────────

/** Opaque CoreFoundation type identifier (`CFTypeID`, an unsigned long). Compared for
 *  equality only. Kept as bigint since CFTypeID is a machine-word-sized value. */
type CFTypeID = bigint;

/** `_CFDictionaryGetCount(dict)` — CoreFoundation extern, ProCore stub 0xddf9a
 *  (@ProCore 0xb5b38). TRUE out-of-scope extern. Returns the entry count (CFIndex). */
function CFDictionaryGetCount(_dict: CFDictionaryRef): number {
  throw new Error(
    "_CFDictionaryGetCount is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddf9a).",
  );
}
/** `_CFDictionaryGetKeysAndValues(dict, keys, values)` — CoreFoundation extern, ProCore
 *  stub 0xddfa6 (@ProCore 0xb5b76). TRUE out-of-scope extern. Fills the caller's two
 *  parallel pointer arrays with the dictionary's keys and values. */
function CFDictionaryGetKeysAndValues(
  _dict: CFDictionaryRef,
  _keys: unknown[],
  _values: unknown[],
): void {
  throw new Error(
    "_CFDictionaryGetKeysAndValues is a CoreFoundation extern with no pure-JS " +
      "equivalent (@ProCore stub 0xddfa6).",
  );
}
/** `_CFGetTypeID(cf)` — CoreFoundation extern, ProCore stub 0xddfd0 (@ProCore 0xb5b90).
 *  TRUE out-of-scope extern. Returns the CFTypeID of an arbitrary CF object. */
function CFGetTypeID(_cf: unknown): CFTypeID {
  throw new Error(
    "_CFGetTypeID is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddfd0).",
  );
}
/** `_CFDictionaryGetTypeID()` — CoreFoundation extern, ProCore stub 0xddfac
 *  (@ProCore 0xb5b98). TRUE out-of-scope extern. Returns the CFDictionary CFTypeID. */
function CFDictionaryGetTypeID(): CFTypeID {
  throw new Error(
    "_CFDictionaryGetTypeID is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddfac).",
  );
}
/** `_CFStringGetTypeID()` — CoreFoundation extern, ProCore stub 0xde0d2
 *  (@ProCore 0xb5bb0). TRUE out-of-scope extern. Returns the CFString CFTypeID. */
function CFStringGetTypeID(): CFTypeID {
  throw new Error(
    "_CFStringGetTypeID is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xde0d2).",
  );
}
/** `_CFStringGetLength(str)` — CoreFoundation extern, ProCore stub 0xde0c6
 *  (@ProCore 0xb5bbd). TRUE out-of-scope extern. Returns the string's length (CFIndex). */
function CFStringGetLength(_str: unknown): number {
  throw new Error(
    "_CFStringGetLength is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xde0c6).",
  );
}
/** `_CFNumberGetTypeID()` — CoreFoundation extern, ProCore stub 0xddfe2
 *  (@ProCore 0xb5bc7). TRUE out-of-scope extern. Returns the CFNumber CFTypeID. */
function CFNumberGetTypeID(): CFTypeID {
  throw new Error(
    "_CFNumberGetTypeID is a CoreFoundation extern with no pure-JS equivalent " +
      "(@ProCore stub 0xddfe2).",
  );
}

/** `_CFStringCreateWithBytes(allocator, bytes, numBytes, encoding, isExternalRepresentation)`
 *  — CoreFoundation extern, ProCore stub 0xde066 (@0xb4927). TRUE out-of-scope extern.
 *  Used by createParsedGoogleV2Metadata to turn the "svhd" NUL-scanned byte range into a
 *  CFString with encoding kCFStringEncodingUTF8 (0x08000100); returns a retained CFStringRef
 *  or NULL. */
function CFStringCreateWithBytes(
  _allocator: CFAllocatorRef,
  _bytes: Uint8Array,
  _numBytes: number,
  _encoding: number,
  _isExternalRepresentation: number,
): CFStringRef | null {
  throw new Error(
    "_CFStringCreateWithBytes is a CoreFoundation extern with no pure-JS " +
      "equivalent (@ProCore stub 0xde066).",
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

  /**
   * PCAtomMetadataHandler::flattenDictionary(__CFDictionary const*, __CFDictionary*)
   * @0xADDR ProCore 0x00000000000b5b0c
   *   (__ZN21PCAtomMetadataHandler17flattenDictionaryEPK14__CFDictionaryPS0_)
   *
   * Recursively flattens a (possibly nested) source CFDictionary into a flat
   * destination CFDictionary: it walks every value, recursing into sub-dictionaries
   * and copying scalar leaves — non-empty CFStrings and any CFNumber — under their
   * key. (Empty strings and every other CF type are dropped.) Instance method, but
   * `this` is used only to recurse on itself; the work is on the two CF-dictionary
   * arguments.
   *
   * DECODE (raw-port/re/disasm/…flattenDictionaryEPK14__CFDictionaryPS0_.s, 87 lines):
   *   0xb5b1d  testq %rdi,%rdi ; sete %al                 ; source == NULL ?
   *   0xb5b23  movq  %rsi,-0x38(%rbp)                     ; save dest
   *   0xb5b27  testq %rsi,%rsi ; sete %cl                 ; dest == NULL ?
   *   0xb5b2d  orb   %al,%cl ; jne 0xb5c0c                ; if either NULL -> return
   *   0xb5b38  callq _CFDictionaryGetCount(source) -> r14 ; count
   *   0xb5b40..0xb5b4f  size = count*8 (overflow-guarded): shlq $0x20 ; movq $-1,%r15 ;
   *            cmovnsq %rax,%r15 ; sarq $0x1d,%r15        ; -> byte size for count 8-byte ptrs
   *   0xb5b56  rbx = operator new[](size)                 ; keys[]  array
   *   0xb5b61  r12 = operator new[](size)                 ; values[] array
   *   0xb5b76  _CFDictionaryGetKeysAndValues(source, keys, values)
   *   0xb5b7b  testl %r14d,%r14d ; jle 0xb5bed            ; if count <= 0 skip loop
   *   0xb5b80  andl $0x7fffffff,%r14d                     ; count masked to 31 bits (loop bound)
   *   0xb5b87  xorl %ebx,%ebx                             ; i = 0
   *   loop @0xb5b89:
   *     0xb5b89  r13 = values[i]                          ; movq (%r12,%rbx,8),%r13
   *     0xb5b90  r15 = CFGetTypeID(r13)
   *     0xb5b98  cmpq CFDictionaryGetTypeID() ; jne 0xb5bb0
   *     0xb5ba2  flattenDictionary(values[i], dest) ; jmp 0xb5be5   ; recurse into sub-dict
   *     0xb5bb0  cmpq CFStringGetTypeID()
   *     0xb5bb8  jne 0xb5bc7                              ; not a string -> try number
   *     0xb5bba  CFStringGetLength(values[i]) ; testq ; jg 0xb5bd1  ; non-empty string -> set
   *     0xb5bc7  cmpq CFNumberGetTypeID() ; jne 0xb5be5  ; a number -> set; else skip
   *     0xb5bd1  _CFDictionarySetValue(dest, keys[i], values[i])
   *     0xb5be5  i++ ; cmpq %rbx,%r14 ; jne 0xb5b89       ; loop while i != count
   *   0xb5bed  delete[] keys  (operator delete[] @stub 0xde6ba)
   *   0xb5bf6  rdi = values ; jmp operator delete[]        ; tail-delete[] values, return
   *   0xb5c0c  (early NULL return path) — no allocation, just return.
   *
   * NOTE the string test is `(isString && length>0)` then FALL THROUGH into the number
   * test: `jne 0xb5bc7` when not a string, and after the `jg 0xb5bd1` for a non-empty
   * string the number branch is skipped by the jump target ordering. So the set happens
   * iff `(type==CFString && CFStringGetLength>0) || type==CFNumber`.
   *
   * FRONTIER CALLEES: all CoreFoundation externs (boundary stubs declared above) —
   * CFDictionaryGetCount/GetKeysAndValues/SetValue, CFGetTypeID, CFDictionaryGetTypeID,
   * CFStringGetTypeID, CFStringGetLength, CFNumberGetTypeID — plus libc operator new[]/
   * delete[] (the JS GC owns the arrays). The only IN-scope callee is the recursive
   * self-call, transcribed directly. No CF byte model is simulated, so the first CF
   * call reaches its documented boundary; the walk/recursion control flow is faithful.
   */
  flattenDictionary(
    source: CFDictionaryRef | null,
    dest: CFDictionaryRef | null,
  ): void {
    // @0xb5b1d..0xb5b2f  if (source == NULL || dest == NULL) return.
    if (source === null || source === undefined) return;
    if (dest === null || dest === undefined) return;

    // @0xb5b38  count = CFDictionaryGetCount(source).
    const count = CFDictionaryGetCount(source);

    // @0xb5b40..0xb5b66  keys = new (ptr)[count]; values = new (ptr)[count]. The overflow-
    // guarded count*8 byte size just backs two count-element pointer arrays; the JS GC
    // owns them (operator delete[] @0xb5bed/0xb5c07 is a libc extern — no-op here).
    const keys: unknown[] = new Array<unknown>(count < 0 ? 0 : count);
    const values: unknown[] = new Array<unknown>(count < 0 ? 0 : count);

    // @0xb5b76  CFDictionaryGetKeysAndValues(source, keys, values).
    CFDictionaryGetKeysAndValues(source, keys, values);

    // @0xb5b7b  testl %r14d,%r14d ; jle 0xb5bed — skip the loop when count <= 0.
    if (count <= 0) {
      // @0xb5bed/0xb5c07  delete[] keys ; delete[] values ; return (GC owns them).
      return;
    }

    // @0xb5b80  count masked to 31 bits as the loop bound (i in [0,count)).
    const n = count & 0x7fffffff;
    // @0xb5b87  i = 0.
    for (let i = 0; i < n; i++) {
      // @0xb5b89  val = values[i].
      const val = values[i];
      // @0xb5b90  tid = CFGetTypeID(val).
      const tid = CFGetTypeID(val);

      // @0xb5b98  if (tid == CFDictionaryGetTypeID()) recurse.
      if (tid === CFDictionaryGetTypeID()) {
        // @0xb5ba9  flattenDictionary(val, dest) — in-scope recursion (this-relative call).
        this.flattenDictionary(val as CFDictionaryRef, dest);
        // @0xb5bae  jmp to loop-increment.
        continue;
      }

      // @0xb5bb0  isString = (tid == CFStringGetTypeID()).
      // @0xb5bb8/0xb5bc2  set iff (isString && CFStringGetLength(val) > 0) ...
      let doSet = false;
      if (tid === CFStringGetTypeID() && CFStringGetLength(val) > 0) {
        doSet = true;
      } else if (tid === CFNumberGetTypeID()) {
        // @0xb5c7/0xb5bcf  ... or (tid == CFNumberGetTypeID()).
        doSet = true;
      }

      if (doSet) {
        // @0xb5bd1..0xb5be0  CFDictionarySetValue(dest, keys[i], values[i]).
        CFDictionarySetValue(
          dest,
          keys[i] as CFStringRef,
          val as CFStringRef,
        );
      }
      // @0xb5be5  i++ (loop condition cmpq %rbx,%r14 handled by the for-bound).
    }

    // @0xb5bed/0xb5c07  delete[] keys ; delete[] values ; return (libc; GC owns arrays).
  }

  /**
   * PCAtomMetadataHandler::createParsedGoogleV2Metadata(__CFDictionary const*)
   * @0xADDR ProCore 0x00000000000b47b6
   *   (__ZN21PCAtomMetadataHandler28createParsedGoogleV2MetadataEPK14__CFDictionary)
   *
   * Parses Google's Spherical Video V2 / stereo QuickTime boxes carried in the input
   * CFDictionary — "st3d" (Stereoscopic 3D), "svhd" (Spherical Video Header), "prhd"
   * (Projection Header), "cbmp" (Cubemap Projection) and "equi" (Equirectangular
   * Projection) — into a fresh mutable CFDictionary of human-readable strings keyed by
   * the standard field names. Returns the new dictionary (the caller owns the +1 from
   * CFDictionaryCreateMutable).
   *
   * All string literals were recovered from the __cfstring literal pool (otool prints
   * "@\"bad cfstring ref\"" because the __cfstring dataptr is a rebased pointer):
   *   input box keys : "st3d" @0x14ea18, "svhd" @0x14ea38, "prhd" @0x14ea58,
   *                    "cbmp" @0x14ea78, "equi" @0x14ea98.
   *   formats        : "%d" @0x14d8f8 (integers), "%.6f" @0x14fbd8 (pose degrees).
   *   out keys       : "stereo_mode" @0x14fb98, "metadata_source" @0x14fbb8,
   *     "pose_yaw_degrees" @0x14fbf8, "pose_pitch_degrees" @0x14fc18,
   *     "pose_roll_degrees" @0x14fc38, "cube_layout" @0x14fc58, "cube_padding" @0x14fc78,
   *     "projection_bounds_top" @0x14fc98, "_bottom" @0x14fcb8, "_left" @0x14fcd8,
   *     "_right" @0x14fcf8.
   *   float consts   : 2^-16 = 1.52587890625e-05 @0x127f28; clamps 180.0 @0x123570,
   *                    -180.0 @0x128198, 90.0 @0x1281a0, -90.0 @0x1281a8.
   *
   * DECODE (raw-port/re/disasm/…createParsedGoogleV2MetadataEPK14__CFDictionary.s, 324 lines):
   *   0xb47c7..0xb47e9  out = CFDictionaryCreateMutable(kCFAllocatorDefault, 0, keyCB, valueCB)
   *   0xb47ec  if (input == NULL) goto 0xb4c62 (return out)
   *   0xb47f5  st3d = CFDictionaryGetValue(input, "st3d")
   *     0xb4807 if NULL, 0xb4818 if CFDataGetLength(st3d) < 5 -> skip
   *     0xb4822 movzbl 0x4(p),%ecx : UNSIGNED byte at +4 -> "%d" -> "stereo_mode"
   *   0xb485b  svhd = CFDictionaryGetValue(input, "svhd")
   *     0xb486d if NULL, 0xb4882 if CFDataGetLength(svhd) < 5 -> skip
   *     len=CFDataGetLength; p=CFDataGetBytePtr; rsi=p+4 (skip 4-byte version/flags header).
   *     0xb48a6..0xb48c2 scan rsi[0..len) for the first NON-zero byte -> start index (edx).
   *       (all-zero / len<=0 fall to 0xb48c4: start=0,end=0,bom=0 -> empty string.)
   *     0xb48cd if start==len -> no content (start=0? end=0,bom=0 kept). else BOM test:
   *       0xb48dd if len>=4 && p[4]==0xEF && p[5]==0xBB && p[6]==0xBF -> bom flag (dil)=1.
   *       0xb48f9 start=edx (offset of first non-zero); end=len (r8d).
   *     0xb48fe eax = end - start ; 0xb4903 if eax>=2 && p[len-1]==0 -> eax-- (trim trailing NUL).
   *     0xb4915 rsi += start ; 0xb4927 CFStringCreateWithBytes(alloc, rsi, eax,
   *       0x08000100 kCFStringEncodingUTF8, bom) -> "metadata_source"
   *   0xb494e  prhd = CFDictionaryGetValue(input, "prhd")
   *     0xb4960 if NULL, 0xb4976 if (CFDataGetLength(prhd) & 0xFFFFFFF0)==0 (len<16) -> skip
   *     3 signed int32 BE (movl; bswapl; cvtsi2sd) at +4,+8,+c, each * 2^-16 then clamped:
   *       yaw   @+4: min(v,180) then max(.,-180)  -> [-180,180] -> "%.6f" -> "pose_yaw_degrees"
   *       pitch @+8: min(v, 90) then max(., -90)   -> [-90,90]   -> "pose_pitch_degrees"
   *       roll  @+c: min(v,180) then max(.,-180)   -> [-180,180] -> "pose_roll_degrees"
   *   0xb4a93  cbmp = CFDictionaryGetValue(input, "cbmp")
   *     0xb4aa5 if NULL, 0xb4ab9 if CFDataGetLength(cbmp) < 12 (unsigned jb) -> skip
   *     2 signed int32 BE at +4,+8 -> "%d" -> "cube_layout", "cube_padding"
   *   0xb4b40  equi = CFDictionaryGetValue(input, "equi")
   *     0xb4b52 if NULL, 0xb4b66 if CFDataGetLength(equi) < 20 (unsigned jb) -> skip
   *     4 signed int32 BE at +4,+8,+c,+10 -> "%d" -> "projection_bounds_top/bottom/left/right"
   *   0xb4c62  return out
   *
   * ENDIANNESS: every multi-byte scalar is read big-endian — int32 via `movl; bswapl`
   * (Google's boxes are big-endian per the spec). The st3d field is a single UNSIGNED
   * byte (`movzbl`); the prhd pose fields are SIGNED int32 (`cvtsi2sd` of the bswapped
   * value, i.e. a signed 16.16 fixed-point angle scaled by 2^-16 and clamped). The svhd
   * source is a UTF-8 byte range with optional NUL padding, leading BOM, and trailing NUL.
   *
   * FRONTIER CALLEES: all CoreFoundation externs (boundary stubs above) —
   * CFDictionaryCreateMutable/GetValue/SetValue, CFDataGetLength/BytePtr,
   * CFStringCreateWithFormat, CFStringCreateWithBytes, CFRelease, and the two callback
   * globals. NO in-scope callees. The CF byte model is not simulated, so the first CF call
   * reaches its documented CoreFoundation boundary; the parse/formatting control flow is
   * transcribed faithfully line-for-line.
   */
  createParsedGoogleV2Metadata(input: CFDictionaryRef | null): CFDictionaryRef {
    // @0xb47c7..0xb47e9  out = CFDictionaryCreateMutable(default, 0, keyCB, valueCB).
    const allocator = kCFAllocatorDefault(); // @0xb47c7/0xb47ce deref _kCFAllocatorDefault
    const keyCB = kCFTypeDictionaryKeyCallBacks(); // @0xb47d1
    const valueCB = kCFTypeDictionaryValueCallBacks(); // @0xb47d8
    const out = CFDictionaryCreateMutable(allocator, 0, keyCB, valueCB); // @0xb47e4

    // @0xb47ec  if (input == NULL) return out.
    if (input === null || input === undefined) {
      // @0xb4c62  return out.
      return out;
    }

    // The repeated "format one value and store it under key" block (@0xb4826..0xb4856
    // etc.): the SAME sequence emitted once per field — format is "%d" for integers.
    const setFieldInt = (key: string, fmt: string, value: number): void => {
      // @…  s = CFStringCreateWithFormat(default, NULL, fmt, value).
      const s = CFStringCreateWithFormat(allocator, null, fmt, value);
      // @…  testq %rax,%rax ; je (skip) : only set/release when non-NULL.
      if (s !== null) {
        CFDictionarySetValue(out, key as unknown as CFStringRef, s); // @…  set
        CFRelease(s); // @…  release
      }
    };
    // big-endian SIGNED int32 read: movl (p+off) ; bswapl. `| 0` yields a signed 32-bit int.
    const be32 = (p: Uint8Array, off: number): number =>
      ((p[off]! << 24) | (p[off + 1]! << 16) | (p[off + 2]! << 8) | p[off + 3]!) | 0;

    // ---- "st3d" (Stereoscopic 3D) @0xb47f5 ----
    const st3d = CFDictionaryGetValue(input, "st3d" as unknown as CFStringRef); // @0xb47ff
    // @0xb4807 if != NULL && @0xb4818 CFDataGetLength(st3d) >= 5 (signed `jl`).
    if (st3d !== null && CFDataGetLength(st3d) >= 5) {
      // @0xb481d p = CFDataGetBytePtr(st3d) ; @0xb4822 movzbl 0x4(p) : UNSIGNED byte.
      const p = CFDataGetBytePtr(st3d);
      setFieldInt("stereo_mode", "%d", p[0x4]! & 0xff); // @0xb4822/0xb4834
    }

    // ---- "svhd" (Spherical Video Header) @0xb485b : a UTF-8 "metadata_source" string ----
    const svhd = CFDictionaryGetValue(input, "svhd" as unknown as CFStringRef); // @0xb4865
    // @0xb486d if != NULL && @0xb4882 CFDataGetLength(svhd) >= 5 (signed `jl`).
    if (svhd !== null && CFDataGetLength(svhd) >= 5) {
      // @0xb488b len = CFDataGetLength(svhd) ; @0xb4896 p = CFDataGetBytePtr(svhd).
      const len = CFDataGetLength(svhd); // r12
      const p = CFDataGetBytePtr(svhd);
      // @0xb489b rsi = p + 4 (skip the 4-byte version/flags header). We index p at +4+i.
      const base = 4;

      // @0xb489f start=0 ; @0xb48a6..0xb48c2 scan for the first NON-zero byte in [0,len).
      //   `cmpb $0,(rsi,rdx); jne 0xb48cd` -> break to the BOM/emit path on a non-zero byte.
      //   If the whole range is zero (or len<=0), fall through @0xb48c4 to empty result.
      let start = 0;
      let end = 0;
      let bom = 0;
      let foundNonZero = false;
      if (len > 0) {
        const n = len & 0x7fffffff; // @0xb48ae andl $0x7fffffff
        let idx = 0;
        for (; idx < n; idx++) {
          // @0xb48b6 cmpb $0,(rsi,rdx) ; jne -> stop at first non-zero byte.
          if ((p[base + idx] ?? 0) !== 0) {
            foundNonZero = true;
            break;
          }
        }
        if (!foundNonZero) {
          // @0xb48c4 xorl ecx/r8d/edi : all-zero range -> start=end=bom=0 (empty string).
          start = 0;
          end = 0;
          bom = 0;
        } else {
          // @0xb48cd r8d=0 ; edi=0 ; @0xb48d8 if (idx == len) skip BOM (start/end stay 0).
          if (idx === (len | 0)) {
            start = 0;
            end = 0;
            bom = 0;
          } else {
            // @0xb48dd BOM: len>=4 && p[4]==0xEF && p[5]==0xBB && p[6]==0xBF.
            //   (reads at rsi=p+4, then rax+5=p[5], rax+6=p[6].)
            if (
              (len | 0) >= 4 &&
              (p[0x4] ?? 0) === 0xef &&
              (p[0x5] ?? 0) === 0xbb
            ) {
              bom = 1; // @0xb48ee movb $1,%dil
              // @0xb48f1 cmpb $-0x41,0x6(rax) ; je keep : third BOM byte must be 0xBF.
              if ((p[0x6] ?? 0) !== 0xbf) bom = 0; // @0xb48f7 xorl edi,edi
            } else {
              bom = 0; // @0xb48f7
            }
            // @0xb48f9 start = idx (first non-zero offset) ; @0xb48fb end = len.
            start = idx;
            end = len | 0;
          }
        }
      }

      // @0xb48fe eax = end - start (content length).
      let n = (end - start) | 0;
      // @0xb4903 if (n >= 2) : cmpb $1,-1(rsi+end) ; sbbl $0,eax -> if last byte < 1 (==0),
      //   subtract the borrow, i.e. trim ONE trailing NUL. (rsi+end-1 = p[base+end-1].)
      if (n >= 2) {
        const lastByte = p[base + (end - 1)] ?? 0;
        const cf = lastByte < 1 ? 1 : 0; // cmpb $1 sets CF iff byte < 1 (byte == 0)
        n = (n - cf) | 0; // sbbl $0,eax
      }

      // @0xb4915 rsi += start : content view begins at p[base+start].
      const view = p.subarray(base + start, base + start + n);
      // @0xb4922 encoding = 0x08000100 (kCFStringEncodingUTF8) ; @0xb491b r8 = bom flag.
      const s = CFStringCreateWithBytes(allocator, view, n, 0x08000100, bom); // @0xb4927
      // @0xb492c testq %rax,%rax ; je -> only set/release when non-NULL.
      if (s !== null) {
        CFDictionarySetValue(
          out,
          "metadata_source" as unknown as CFStringRef,
          s,
        ); // @0xb4941
        CFRelease(s); // @0xb4949
      }
    }

    // ---- "prhd" (Projection Header): 3 signed 16.16 fixed-point pose angles @0xb494e ----
    const prhd = CFDictionaryGetValue(input, "prhd" as unknown as CFStringRef); // @0xb4958
    // @0xb4960 if != NULL && @0xb4971 (CFDataGetLength(prhd) & 0xFFFFFFF0) != 0 (len >= 16).
    if (prhd !== null && (CFDataGetLength(prhd) & 0xfffffff0) !== 0) {
      // @0xb497f p = CFDataGetBytePtr(prhd).
      const p = CFDataGetBytePtr(prhd);
      // The pose helper mirrors @0xb4987..0xb49d8 (repeated 3×): read a signed int32 BE,
      // scale by 2^-16, clamp to [lo,hi] (`minsd hi` then `maxsd lo`), "%.6f", set, release.
      const setPose = (key: string, value: number, lo: number, hi: number): void => {
        // @…  cvtsi2sd %eax,%xmm0 (signed) ; mulsd 2^-16 ; minsd hi ; maxsd lo.
        let d = value * 1.52587890625e-5; // 2^-16 @0x127f28
        d = Math.min(d, hi); // minsd hi
        d = Math.max(d, lo); // maxsd lo
        const s = CFStringCreateWithFormat(allocator, null, "%.6f", d); // @…  movb $1,%al (1 fp arg)
        if (s !== null) {
          CFDictionarySetValue(out, key as unknown as CFStringRef, s);
          CFRelease(s);
        }
      };
      // @0xb4987 yaw @+4 -> min(v,180) max(-180) ; @0xb49dd pitch @+8 -> min(90) max(-90) ;
      // @0xb4a38 roll @+c -> min(180) max(-180).
      setPose("pose_yaw_degrees", be32(p, 0x4), -180.0, 180.0); // @0xb4987
      setPose("pose_pitch_degrees", be32(p, 0x8), -90.0, 90.0); // @0xb49dd
      setPose("pose_roll_degrees", be32(p, 0xc), -180.0, 180.0); // @0xb4a38
    }

    // ---- "cbmp" (Cubemap Projection) @0xb4a93 ----
    const cbmp = CFDictionaryGetValue(input, "cbmp" as unknown as CFStringRef); // @0xb4a9d
    // @0xb4aa5 if != NULL && @0xb4ab9 CFDataGetLength(cbmp) >= 12 (unsigned `jb`).
    if (cbmp !== null && (CFDataGetLength(cbmp) >>> 0) >= 0xc) {
      // @0xb4ac2 p = CFDataGetBytePtr(cbmp) ; 2 signed int32 BE at +4,+8.
      const p = CFDataGetBytePtr(cbmp);
      setFieldInt("cube_layout", "%d", be32(p, 0x4)); // @0xb4aca
      setFieldInt("cube_padding", "%d", be32(p, 0x8)); // @0xb4b04
    }

    // ---- "equi" (Equirectangular Projection) @0xb4b40 ----
    const equi = CFDictionaryGetValue(input, "equi" as unknown as CFStringRef); // @0xb4b4a
    // @0xb4b52 if != NULL && @0xb4b66 CFDataGetLength(equi) >= 20 (unsigned `jb`).
    if (equi !== null && (CFDataGetLength(equi) >>> 0) >= 0x14) {
      // @0xb4b6f p = CFDataGetBytePtr(equi) ; 4 signed int32 BE at +4,+8,+c,+10.
      const p = CFDataGetBytePtr(equi);
      setFieldInt("projection_bounds_top", "%d", be32(p, 0x4)); // @0xb4b77
      setFieldInt("projection_bounds_bottom", "%d", be32(p, 0x8)); // @0xb4bb1
      setFieldInt("projection_bounds_left", "%d", be32(p, 0xc)); // @0xb4bec
      setFieldInt("projection_bounds_right", "%d", be32(p, 0x10)); // @0xb4c27
    }

    // @0xb4c62  return out.
    return out;
  }
}

