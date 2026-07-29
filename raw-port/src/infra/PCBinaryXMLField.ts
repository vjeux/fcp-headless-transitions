// PCBinaryXMLField — ProCore's tagged-union field value read out of a .motr binary XML stream.
//
// Faithful port of the ProCore x86_64 disassembly. Every method cites its @ProCore addr.
// Framework: ProCore  (thin slice extracted from Final Cut Pro.app/.../ProCore).
//
// Provenance (raw-port/re/disasm/ProCore.PCBinaryXMLField.*.s):
//   PCBinaryXMLField(PCString)   ctor C2 @0x066de0     (also referenced from getAsBool/UUID stubs)
//   getAsBool(bool*)      const  @0x066932
//   getAsDouble(double*)  const  @0x06682e
//   getAsFigTime(CMTime*) const  @0x066ae8
//   getAsFloat(float*)    const  @0x066722
//   getAsInt32(int*)      const  @0x066346
//   getAsInt64(i64*)      const  @0x066512
//   getAsUInt32(u32*)     const  @0x06642a
//   getAsUInt64(u64*)     const  @0x0665fe
//   getAsString(PCString*) const @0x06617e
//   getAsUUID()           const  @0x066a32
//
// ── Decoded struct layout (from the ctor + every getter's jump table + memory offsets) ─────
//
//   +0x00  u32   kind   (tag; the switch discriminator)
//                       0 = INT      (i64 at +0x08, signed)
//                       1 = FLOAT    (f32 at +0x18, single-precision)
//                       2 = UINT     (u64 at +0x10, unsigned)
//                       3 = DOUBLE   (f64 at +0x20, double-precision)
//                       4 = FIGTIME  (CMTime at +0x28: i64 value, i32 timescale, u32 flags, i64 epoch)
//                       5 = STRING   (PCString at +0x40; ctor C2 @0x066de0 sets kind=5)
//                       6 = UUID     (16 bytes at +0x48 — 4× u32 little-endian dwords)
//   +0x08  i64   iValue     (INT payload)
//   +0x10  u64   uValue     (UINT payload)
//   +0x18  f32   fValue     (FLOAT payload)
//   +0x20  f64   dValue     (DOUBLE payload)
//   +0x28  i64   tValue     (CMTime.value)      ── FIGTIME (16 bytes: value+timescale/flags)
//   +0x30  i32   tScale     (CMTime.timescale)
//   +0x34  u32   tFlags     (CMTime.flags)
//   +0x38  i64   tEpoch     (CMTime.epoch)      ── one more qword to complete CMTime
//   +0x40  PCString sValue  (16-byte PCString slot — ctor C2 @0x066de0 constructs it in place)
//   +0x50  <PCString ends here>
//   +0x48  u32×4 uuid       (UUID payload; overlaps sValue slot — only valid when kind==6)
//
// ── Kind numbering, derived by matching each getter's jump-table branches ──────────────────
// The ctor C2 @0x066de0 does `movl $0x5, (%r15)` — kind 5 = STRING (proved by the "%s"
// path in every getter: STRING is the path that calls `createCStr()` + `strtoX`, and the
// PCString slot is exactly +0x40 as constructed).
//
// The 6-entry / 7-entry jump tables (`cmpq $0x5, %rcx` or `cmpq $0x6, %rax` before
// `movslq (jt[rcx*4]), %rcx; addq jt, %rcx; jmpq *%rcx`) fix the other kinds:
//
//   getAsInt32 @0x066346    (6 entries, kinds 0..5)
//     case 0: `movl 0x8(%rdi), %ecx`        -> INT  reads i64@+8 truncated to i32
//     case 1: `cvttss2si 0x18(%rdi), %ecx`  -> FLOAT   f32@+0x18 -> i32
//     case 2: `movl 0x10(%rdi), %ecx`       -> UINT   u64@+0x10 truncated
//     case 3: `cvttsd2si 0x20(%rdi), %ecx`  -> DOUBLE f64@+0x20 -> i32
//     case 4: (no in-range emission; falls out to string parse path — CMTime int32 unsupported)
//     case 5: STRING via _strtol(cstr, 0, 10)
//
//   getAsDouble @0x06682e
//     case 0 INT:    `cvtsi2sdq 0x8(%rdi), %xmm0`                                  -> i64->f64
//     case 1 FLOAT:  `cvtss2sd 0x18(%rdi), %xmm0`                                  -> f32->f64
//     case 2 UINT:   u64->f64 via the classic 2×i64 unpack+haddpd trick
//     case 3 DOUBLE: `movsd 0x20(%rdi), %xmm0`                                     -> f64@+0x20
//     case 5 STRING: `_strtod(cstr, 0)`
//
//   getAsFloat @0x066722
//     case 0 INT:   `cvtsi2ssq 0x8(%rdi), %xmm0`
//     case 1 FLOAT: `movss 0x18(%rdi), %xmm0`
//     case 2 UINT:  branchy u64->f32: `movq 0x10(%rdi),%rcx; if(rcx<0) unsigned-round-with-carry; else cvtsi2ss %rcx,%xmm0`
//     case 3 DOUBLE:`cvtsd2ss 0x20(%rdi), %xmm0`
//     case 5 STRING:`_strtof(cstr, 0)`
//
//   getAsInt64 @0x066512 / getAsUInt64 @0x0665fe / getAsUInt32 @0x06642a
//     symmetric to getAsInt32 with the appropriate cvttXX2si-r64/movq/movl widths.
//     UInt64's FLOAT/DOUBLE path uses the well-known "signed-cvttXX2si + (x - 2^63) fixup"
//     to convert values >= 2^63 without hardware unsigned support.
//
//   getAsBool @0x066932
//     case 0 INT:    `(iValue != 0)`
//     case 1 FLOAT:  `(fValue != 0.0f)`      via `xorps %xmm0; ucomiss 0x18(%rdi); setp|setne`
//     case 2 UINT:   `(uValue != 0)`
//     case 3 DOUBLE: `(dValue != 0.0)`
//     case 5 STRING: `strtoul(cstr,0,10) != 0` then check errno != ERANGE(0x22)
//
//   getAsFigTime @0x066ae8
//     case 4 FIGTIME: copy CMTime struct out (value@+0x28, scale/flags@+0x30, epoch@+0x38);
//                     return true.
//     case 5 STRING:  createCStr + PCStreamElement::aToFigTime(&p, out); free.
//     any other kind: return false (leaves *out untouched).
//
//   getAsString @0x06617e
//     case 0 INT:    snprintf(&buf,0x80,"%lld", iValue)
//     case 1 FLOAT:  snprintf(&buf,0x80,"%.10g", (double)fValue)
//     case 2 UINT:   snprintf(&buf,0x80,"%llu", uValue)
//     case 3 DOUBLE: snprintf(&buf,0x80,"%.16lg", dValue)
//     case 4 FIGTIME: snprintf(&buf,0x80,"%lld %d %x %lld", value, timescale, flags, epoch)
//     case 5 STRING:  PCString::set(&this->sValue) — direct copy, no snprintf
//     case 6 UUID:    snprintf(&buf,0x80,"%08x%08x%08x%08x", u0,u1,u2,u3)
//
//   getAsUUID @0x066a32
//     case 5 STRING:  createCStr + PCStreamElement::atoUUID(&p) -> heap UUID*
//     case 6 UUID:    `_Znwm(16)` + `movups 0x48(%rbx),%xmm0; movups %xmm0,(%rax)` -> heap copy
//     other: nullptr.
//
// ── Numeric fidelity notes (PORTING_SPEC Rule 4) ────────────────────────────────────────────
// - FLOAT payload is stored as single-precision. When we widen for `getAsDouble` (case 1) or
//   for the printf specifier in `getAsString` (case 1), we DO NOT re-round; JS numbers are f64
//   so widening is free. When narrowing for `getAsFloat` cases DOUBLE/INT/UINT we call
//   `Math.fround` to model the CPU's `cvtsd2ss`/`cvtsi2ss` narrowing exactly.
// - `!= 0.0` for f32/f64 is modeled via `x === x && x !== 0` — the `setp|setne` combo the
//   CPU emits treats NaN as "unordered => bool is 1" (setp fires); JS `!==` on NaN is already
//   true for any operand, so `x !== 0` matches.
// - UINT case is `bigint` (values >= 2^63 are legal in .motr and lose bits as `number`).
// - INT case is `bigint` (same reason: CMTime.value/i64 counters).
// - CMTime.value/epoch are bigint per raw-port/src/infra/CMTime.ts.
//
// ── What is INTENTIONALLY still a throwing frontier stub ────────────────────────────────────
// The four external callees this class touches from the STRING path — `PCString::createCStr()`
// @0x032278, `PCStreamElement::aToFigTime(char const**, CMTime*)` (ProCore), and
// `PCStreamElement::atoUUID(char const**)` (ProCore) — are not yet transcribed. Per Rule 3
// we route through throwing stubs so the "STRING -> parse" branch loudly fails until those
// leaves land, rather than silently returning wrong values.

import type { CMTime } from "./CMTime.js";
import { PCString } from "./PCString.js";

// ── kind enum (u32 at +0x00) ────────────────────────────────────────────────────────────────

/** Tagged-union discriminator at PCBinaryXMLField +0x00.  Values fixed by the getter jump
 *  tables + the string ctor's `movl $0x5,(%r15)` — see file header for the per-getter proof. */
export const kPCBinaryXMLFieldKind = {
  /** INT — signed 64-bit integer payload at +0x08. */
  Int: 0,
  /** FLOAT — 32-bit single-precision payload at +0x18. */
  Float: 1,
  /** UINT — unsigned 64-bit integer payload at +0x10. */
  UInt: 2,
  /** DOUBLE — 64-bit double-precision payload at +0x20. */
  Double: 3,
  /** FIGTIME — CoreMedia CMTime payload at +0x28. */
  FigTime: 4,
  /** STRING — PCString payload at +0x40 (16-byte slot).  Ctor C2 @0x066de0 sets this kind. */
  String: 5,
  /** UUID — 16-byte (4× u32) payload at +0x48. */
  UUID: 6,
} as const;
export type PCBinaryXMLFieldKind =
  (typeof kPCBinaryXMLFieldKind)[keyof typeof kPCBinaryXMLFieldKind];

// ── errno / ERANGE (used by getAsBool/getAsInt32/... to detect strtoX overflow) ─────────────

/** POSIX ERANGE. In the ProCore disasm this is a literal `cmpl $0x22, (___error)` after every
 *  strtoX call — 0x22 = 34 = ERANGE on Darwin.  See getAsBool @0x0669c2, getAsDouble @0x0668c0,
 *  getAsFloat @0x0667a2, getAsInt32 @0x0663bc, getAsUInt32 @0x0664a1, getAsInt64 @0x066589,
 *  getAsUInt64 @0x0666b0. */
const ERANGE = 0x22;

// ── externs (throw-stubs — see PORTING_SPEC Rule 3) ─────────────────────────────────────────

/** PCString::createCStr() const — @ProCore 0x032278. Allocates a `malloc`'d UTF-8 C-string
 *  from the PCString's CFString ref.  Callers in this file `free()` the result.  Not yet
 *  fully ported (frontier note in raw-port/src/infra/PCString.ts around line 487); the stub
 *  below throws citing @0x032278 so the STRING branch loudly fails rather than corrupting. */
function PCString_createCStr(_s: PCString): string {
  throw new Error("PCString::createCStr @0x032278 (ProCore) not yet transcribed");
}

/** PCStreamElement::aToFigTime(char const**, CMTime*) — @ProCore.
 *  Called from getAsFigTime STRING path @0x066b18 to parse "value scale flags epoch" into CMTime.
 *  Not yet transcribed. */
function PCStreamElement_aToFigTime(_cstr: string, _out: CMTime): boolean {
  throw new Error("PCStreamElement::aToFigTime(char const**, CMTime*) @0x066b18-callsite (ProCore) not yet transcribed");
}

/** PCStreamElement::atoUUID(char const**) — @ProCore.
 *  Called from getAsUUID STRING path @0x066a62.  Returns a heap-owned `UUID*`.
 *  Not yet transcribed. */
function PCStreamElement_atoUUID(_cstr: string): PCBinaryXMLFieldUUID | null {
  throw new Error("PCStreamElement::atoUUID(char const**) @0x066a62-callsite (ProCore) not yet transcribed");
}

// ── typed UUID (matches the 16-byte, 4× u32 layout at +0x48 in getAsString/getAsUUID) ───────

/** 128-bit UUID as stored in a PCBinaryXMLField payload — four little-endian u32 words.
 *  Provenance: getAsString @0x06628a reads +0x48/+0x4c/+0x50/+0x54 as `%08x%08x%08x%08x`, and
 *  getAsUUID @0x066a81 does `movups 0x48(%rbx), %xmm0` (a 16-byte copy) to fill a heap slot.
 *  This is the C++ representation of an in-file UUID; it isn't the RFC-4122 string form. */
export interface PCBinaryXMLFieldUUID {
  w0: number; // u32  (+0x48)
  w1: number; // u32  (+0x4c)
  w2: number; // u32  (+0x50)
  w3: number; // u32  (+0x54)
}

// ── the tagged-union itself ─────────────────────────────────────────────────────────────────

/** PCBinaryXMLField — tagged union of 7 payload kinds, produced by PCBinaryXMLReadStream and
 *  consumed by every FCP parser that wants a strongly-typed value out of the .motr stream.
 *
 *  The struct is a 128-byte block in the native binary (0x40 header + 0x40 union tail); this
 *  TS mirror keeps the same field offsets on-record via the `PCBinaryXMLFieldKind` enum. Only
 *  ONE payload slot is meaningful at a time — the rest are undefined per the ctor's `xorps` +
 *  `movups 0x48(...)` zeroing at @0x066dfc/@0x066dff. */
export class PCBinaryXMLField {
  /** @+0x00  kind (u32).  Every getter dispatches on this via a compiler-emitted jump table. */
  kind: PCBinaryXMLFieldKind;

  /** @+0x08  INT payload (i64).  Meaningful iff kind === Int. */
  iValue: bigint;

  /** @+0x10  UINT payload (u64).  Meaningful iff kind === UInt. */
  uValue: bigint;

  /** @+0x18  FLOAT payload (f32).  Meaningful iff kind === Float. */
  fValue: number;

  /** @+0x20  DOUBLE payload (f64).  Meaningful iff kind === Double. */
  dValue: number;

  /** @+0x28..+0x40  FIGTIME payload (CMTime).  Meaningful iff kind === FigTime.
   *  Nullable in TS because the native struct is inline-zeroed on construction and only
   *  populated by PCBinaryXMLReadStream when a <time> tag is decoded. */
  tValue: CMTime | null;

  /** @+0x40  STRING payload (PCString).  Meaningful iff kind === String.
   *  Constructed in place by ctor C2 @0x066de0 via `PCString::PCString()` + `set(PCString&)`. */
  sValue: PCString;

  /** @+0x48  UUID payload (16 bytes = 4× u32).  Meaningful iff kind === UUID.
   *  Overlaps the sValue slot in the C++ layout (union'd — only one is live per `kind`). */
  uuid: PCBinaryXMLFieldUUID | null;

  /**
   * PCBinaryXMLField::PCBinaryXMLField(PCString) — @ProCore 0x066de0 (C2 / in-place ctor).
   *
   *   leaq 0x40(%rdi),%rbx          ; rbx = &this->sValue        (+0x40)
   *   callq PCString::PCString()    ; in-place default-construct the PCString slot
   *   xorps %xmm0,%xmm0
   *   movups %xmm0,0x48(%r15)       ; zero 16 bytes at +0x48 (UUID slot / rest of PCString tail)
   *   movl $0x5,(%r15)              ; kind = STRING (5)
   *   callq PCString::set(PCString const&) ; sValue.set(arg)
   *
   * Faithful port: default-construct every payload slot to a safe zero, then set kind=String
   * and copy the incoming PCString into `sValue`.  The other slots stay zero because the C++
   * struct's inline `xorps/movups` at @0x066dfc-@0x066dff zeroes the union tail. */
  constructor(src: PCString) {
    // @0x066df7  PCString::PCString()  — in-place default construct at +0x40
    this.sValue = new PCString();
    // @0x066dfc..0x066dff  xorps + movups 0x48(%r15) — zero the union tail
    this.iValue = 0n;
    this.uValue = 0n;
    this.fValue = 0;
    this.dValue = 0;
    this.tValue = null;
    this.uuid = null;
    // @0x066e04  movl $0x5,(%r15)  — kind = STRING
    this.kind = kPCBinaryXMLFieldKind.String;
    // @0x066e11  PCString::set(PCString const&)  — sValue = src
    this.sValue.set(src);
  }

  /**
   * PCBinaryXMLField::getAsBool(bool*) const — @ProCore 0x066932.
   *
   * Jump-table dispatch on `kind` (6 entries, kinds 0..5). Returns TRUE on success and
   * writes into `*out`; returns FALSE (with `*out` untouched, or with the errno==ERANGE
   * bit set on the STRING path) when the discriminant is out of range.
   *
   *   @0x066932  movl (%rdi),%ecx            ; ecx = kind
   *   @0x066936  cmpq $0x5,%rcx
   *   @0x06693a  ja   0x669cc               ; kind > 5 -> return al=1 (default true), no write
   *   @0x06695a  case 0 INT     : setne (0x8(%rdi) != 0)
   *   @0x066961  case 1 FLOAT   : ucomiss 0x18(%rdi),xorps'd 0 ; setp|setne
   *   @0x06696a  case 2 UINT    : setne (0x10(%rdi) != 0)
   *   @0x066974  case 3 DOUBLE  : ucomisd 0x20(%rdi),xorpd'd 0 ; setp|setne
   *   @0x066989  case 5 STRING  : createCStr + strtoul(cstr,0,10); *out = (r != 0)
   *                               al = (errno != 0x22 ERANGE)
   *
   * Note case 4 (FIGTIME) is intentionally omitted from the JT: the CPU falls through into
   * the string path — which then dereferences `0x40(%rdi)` as a PCString and produces a
   * garbage `createCStr`.  We DON'T reproduce that UB; we return false with *out untouched,
   * matching what a correct caller would see when the discriminant is invalid. */
  getAsBool(out: { value: boolean }): boolean {
    // @0x066932-0x06693a  kind > 5 -> return true
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x06695a  cmpq $0x0, 0x8(%rdi); setne (%rbx)
        out.value = this.iValue !== 0n;
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x066961-0x066968  xorps + ucomiss + setp|setne — treats NaN as true
        const x = this.fValue;
        out.value = !(x === 0);
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x06696a  cmpq $0x0, 0x10(%rdi); setne (%rbx)
        out.value = this.uValue !== 0n;
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x066974-0x06697d  xorpd + ucomisd + setp|setne — NaN true
        const x = this.dValue;
        out.value = !(x === 0);
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        // Not in the JT — see the note above; safest faithful thing is "kind mismatch, no write".
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x066989-0x0669c5  createCStr + strtoul + errno-check
        const cstr = PCString_createCStr(this.sValue);
        // strtoul(cstr,0,10); out = (r != 0); return errno != ERANGE
        const parsed = parseIntBase10Unsigned(cstr);
        out.value = parsed.value !== 0n;
        return parsed.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsDouble(double*) const — @ProCore 0x06682e.
   *
   *   @0x06682e  cmpq $0x5,%rcx ; ja -> return true
   *   @0x066856  case 0 INT    : cvtsi2sdq 0x8(%rdi),xmm0  ; movsd xmm0,(%rbx)
   *   @0x06685e  case 1 FLOAT  : cvtss2sd  0x18(%rdi),xmm0 ; movsd xmm0,(%rbx)
   *   @0x066865  case 2 UINT   : u64 -> f64 via
   *                               movsd 0x10(%rdi),xmm0
   *                               unpcklps  [magic0](%rip),xmm0
   *                               subpd     [magic1](%rip),xmm0
   *                               haddpd    xmm0,xmm0
   *                               movlpd    xmm0,(%rbx)
   *                              — the canonical LLVM-emitted unsigned-u64->f64 sequence.
   *   @0x066883  case 3 DOUBLE : movsd 0x20(%rdi),xmm0 ; movsd xmm0,(%rbx)
   *   @0x06688e  case 5 STRING : createCStr + strtod ; errno != ERANGE. */
  getAsDouble(out: { value: number }): boolean {
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x066856  cvtsi2sdq 0x8(%rdi),xmm0
        out.value = Number(this.iValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x06685e  cvtss2sd 0x18(%rdi),xmm0  — widen f32 to f64 (already exact in JS)
        out.value = this.fValue;
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x066865  unsigned u64 -> f64.  Since JS bigint is arbitrary-precision, we can go
        // directly through Number(bigint) which does IEEE-754 round-to-nearest-even — the same
        // final f64 the unpcklps/subpd/haddpd sequence produces on x86_64.
        out.value = Number(this.uValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x066883  movsd 0x20(%rdi),xmm0
        out.value = this.dValue;
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        // No case 4 in this JT; fallthrough would UB the string path.
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x06688e-0x0668c3  createCStr + strtod
        const cstr = PCString_createCStr(this.sValue);
        const p = parseDouble(cstr);
        out.value = p.value;
        return p.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsFloat(float*) const — @ProCore 0x066722.
   *
   *   @0x066722  cmpq $0x5,%rcx ; ja -> return true
   *   @0x06674a  case 0 INT    : cvtsi2ssq 0x8(%rdi),xmm0
   *   @0x066752  case 1 FLOAT  : movss   0x18(%rdi),xmm0
   *   @0x066759  case 2 UINT   : u64 -> f32 with the "sign-bit branch" idiom:
   *                              movq 0x10(%rdi),%rcx ; testq %rcx,%rcx
   *                              js -> unsigned path (rcx>>1 | rcx&1, cvtsi2ss, addss self)
   *                              else -> cvtsi2ss %rcx,%xmm0
   *   @0x066769  case 3 DOUBLE : cvtsd2ss 0x20(%rdi),xmm0
   *   @0x066770  case 5 STRING : createCStr + strtof
   *
   * Numeric fidelity (Rule 4): cvtsi2ss / cvtsd2ss produce a single-precision result; we
   * wrap `Math.fround` to model the CPU-native narrowing. */
  getAsFloat(out: { value: number }): boolean {
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x06674a  cvtsi2ssq 0x8(%rdi),xmm0  — i64 -> f32 via signed 64-bit
        out.value = Math.fround(Number(this.iValue));
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x066752  movss 0x18(%rdi),xmm0
        out.value = this.fValue;
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x066759-0x0667bd  unsigned u64 -> f32 with sign-bit branch to preserve range.
        // The idiom: if MSB set, (v >> 1) | (v & 1) then cvtsi2ss then addss %xmm0,%xmm0.
        // JS: Number(bigint) is IEEE-754 correct-rounding; Math.fround narrows to f32 with
        // the same round-to-nearest-even used by cvtsi2ss.
        out.value = Math.fround(Number(this.uValue));
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x066769  cvtsd2ss 0x20(%rdi),xmm0  — f64 -> f32 narrow
        out.value = Math.fround(this.dValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x066770-0x0667a5  createCStr + strtof + errno-check
        const cstr = PCString_createCStr(this.sValue);
        const p = parseFloat32(cstr);
        out.value = p.value;
        return p.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsInt32(int*) const — @ProCore 0x066346.
   *
   *   @0x06634a  cmpq $0x5,%rcx ; ja -> return true
   *   @0x06636a  case 0 INT    : movl 0x8(%rdi),%ecx        ; movl %ecx,(%rbx)
   *   @0x06636f  case 1 FLOAT  : cvttss2si 0x18(%rdi),%ecx  ; movl %ecx,(%rbx)
   *   @0x066376  case 2 UINT   : movl 0x10(%rdi),%ecx       ; movl %ecx,(%rbx)
   *   @0x06637b  case 3 DOUBLE : cvttsd2si 0x20(%rdi),%ecx  ; movl %ecx,(%rbx)
   *   @0x066387  case 5 STRING : createCStr + strtol(cstr,0,10) ; errno != ERANGE
   *
   * Faithful notes: `movl 0x8(%rdi),%ecx` truncates the i64 payload to its low 32 bits (a
   * plain narrowing cast — matches C++ `(int32_t)(int64_t)v`).  `cvttss2si`/`cvttsd2si`
   * truncate-toward-zero — modeled with `Math.trunc(x) | 0` to force a 32-bit signed wrap. */
  getAsInt32(out: { value: number }): boolean {
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x06636a  movl 0x8(%rdi),%ecx  — low 32 bits of i64, signed
        out.value = Number(BigInt.asIntN(32, this.iValue));
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x06636f  cvttss2si 0x18(%rdi),%ecx
        out.value = Math.trunc(this.fValue) | 0;
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x066376  movl 0x10(%rdi),%ecx  — low 32 bits of u64, reinterpret as signed
        out.value = Number(BigInt.asIntN(32, this.uValue));
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x06637b  cvttsd2si 0x20(%rdi),%ecx
        out.value = Math.trunc(this.dValue) | 0;
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x066387-0x0663bf  createCStr + strtol + errno-check
        const cstr = PCString_createCStr(this.sValue);
        const p = parseIntBase10Signed(cstr);
        // strtol returns long; the store is `movl %eax,(%rbx)` — take the low 32 bits.
        out.value = Number(BigInt.asIntN(32, p.value));
        return p.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsInt64(long long*) const — @ProCore 0x066512.
   *
   *   @0x066536  case 0 INT    : movq 0x8(%rdi),%rcx        ; movq %rcx,(%rbx)
   *   @0x06653c  case 1 FLOAT  : cvttss2si 0x18(%rdi),%rcx  ; movq %rcx,(%rbx)
   *   @0x066544  case 2 UINT   : movq 0x10(%rdi),%rcx       ; movq %rcx,(%rbx)
   *   @0x06654a  case 3 DOUBLE : cvttsd2si 0x20(%rdi),%rcx  ; movq %rcx,(%rbx)
   *   @0x066558  case 5 STRING : createCStr + strtoll(cstr,0,10) ; errno != ERANGE.
   *
   * Faithful notes: `cvttss2si`/`cvttsd2si` at 64-bit width truncate-toward-zero and saturate
   * to INT64_MIN on overflow/NaN.  We model that with a bigint via the truncated JS number
   * (already f64) narrowed by BigInt() — for finite in-range values this is bit-exact. */
  getAsInt64(out: { value: bigint }): boolean {
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x066536  movq 0x8(%rdi),%rcx
        out.value = this.iValue;
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x06653c  cvttss2si (r64 form)
        out.value = cvttf2i64(this.fValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x066544  movq 0x10(%rdi),%rcx  — reinterpret u64 bits as signed
        out.value = BigInt.asIntN(64, this.uValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x06654a  cvttsd2si (r64 form)
        out.value = cvttf2i64(this.dValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x066558-0x066591  createCStr + strtoll + errno-check
        const cstr = PCString_createCStr(this.sValue);
        const p = parseIntBase10Signed(cstr);
        out.value = p.value;
        return p.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsUInt32(unsigned int*) const — @ProCore 0x06642a.
   *
   *   @0x06644e  case 0 INT    : movl 0x8(%rdi),%ecx        ; movl %ecx,(%rbx)
   *   @0x066453  case 1 FLOAT  : cvttss2si 0x18(%rdi),%rcx  ; movl %ecx,(%rbx)  (r64 -> low32)
   *   @0x06645b  case 2 UINT   : movl 0x10(%rdi),%ecx       ; movl %ecx,(%rbx)
   *   @0x066462  case 3 DOUBLE : cvttsd2si 0x20(%rdi),%rcx  ; movl %ecx,(%rbx)
   *   @0x06646c  case 5 STRING : createCStr + strtoul(cstr,0,10) ; errno != ERANGE. */
  getAsUInt32(out: { value: number }): boolean {
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x06644e  movl 0x8(%rdi),%ecx  — low 32 bits (as unsigned)
        out.value = Number(BigInt.asUintN(32, this.iValue));
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x066453  cvttss2si -> r64 truncate ; movl narrows to low 32 (unsigned view)
        const w = cvttf2i64(this.fValue);
        out.value = Number(BigInt.asUintN(32, w));
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x06645b  movl 0x10(%rdi),%ecx
        out.value = Number(BigInt.asUintN(32, this.uValue));
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x066462  cvttsd2si -> r64 truncate ; movl narrows
        const w = cvttf2i64(this.dValue);
        out.value = Number(BigInt.asUintN(32, w));
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x06646c-0x0664a4  createCStr + strtoul + errno-check
        const cstr = PCString_createCStr(this.sValue);
        const p = parseIntBase10Unsigned(cstr);
        // low 32 bits of the unsigned long result
        out.value = Number(BigInt.asUintN(32, p.value));
        return p.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsUInt64(unsigned long long*) const — @ProCore 0x0665fe.
   *
   *   @0x066626  case 0 INT    : movq 0x8(%rdi),%rcx        ; movq %rcx,(%rbx)
   *   @0x06662c  case 1 FLOAT  : movss 0x18(%rdi),xmm0
   *                              cvttss2si xmm0,%rcx        ; rcx = signed-truncated
   *                              movq %rcx,%rdx             ; rdx = rcx (sign detector)
   *                              subss [magic 2^63f](%rip),xmm0
   *                              cvttss2si xmm0,%rsi        ; rsi = (x - 2^63) signed-truncated
   *                              sarq $0x3f,%rdx            ; rdx = -1 iff rcx<0 (x >= 2^63)
   *                              andq %rdx,%rsi
   *                              orq  %rcx,%rsi             ; if x<2^63: rsi = 0 | rcx = rcx
   *                                                          ;  if x>=2^63: rsi = (x-2^63)_i64 | rcx (= INT64_MIN);
   *                                                          ; the low 63 bits of rsi carry the correct u64.
   *                              movq %rsi,(%rbx)
   *   @0x066648  case 2 UINT   : movq 0x10(%rdi),%rcx       ; movq %rcx,(%rbx)
   *   @0x066651  case 3 DOUBLE : same idiom as FLOAT but with cvttsd2si / subsd
   *   @0x06667a  case 5 STRING : createCStr + strtoull(cstr,0,10) ; errno != ERANGE.
   *
   * Numeric fidelity: the "sign-bit fixup" idiom is the standard signed-to-unsigned f->u64
   * conversion (`x >= 2^63 ? INT64_MIN | (int64)(x - 2^63) : (int64)x`).  For finite
   * in-range values Math.trunc + BigInt gives the same bits. */
  getAsUInt64(out: { value: bigint }): boolean {
    if (this.kind > 5) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x066626  movq 0x8(%rdi),%rcx  — reinterpret i64 bits as u64
        out.value = BigInt.asUintN(64, this.iValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x06662c-0x066675  f32 -> u64 via the "signed cvttss2si + (x-2^63) fixup" idiom.
        out.value = cvttf2u64(this.fValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x066648  movq 0x10(%rdi),%rcx
        out.value = this.uValue;
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x066651-0x066675  same idiom with cvttsd2si / subsd
        out.value = cvttf2u64(this.dValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        return false;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x06667a-0x0666b3  createCStr + strtoull + errno-check
        const cstr = PCString_createCStr(this.sValue);
        const p = parseIntBase10Unsigned(cstr);
        out.value = p.value;
        return p.errno !== ERANGE;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsFigTime(CMTime*) const — @ProCore 0x066ae8.
   *
   *   @0x066af6  eax = kind
   *   @0x066af8  if eax == 4 (FIGTIME) -> copy CMTime, return true
   *              @0x066b29  movq 0x38(%rdi),%rax  ; movq %rax,0x10(%rbx)    ; epoch
   *              @0x066b31  movups 0x28(%rdi),%xmm0 ; movups %xmm0,(%rbx)   ; value + timescale+flags
   *              @0x066b38  movb $0x1,%bl
   *   @0x066afd  if eax != 5 -> return false                                (@0x066b3c xorl %ebx,%ebx)
   *   @0x066b02  else (STRING) : createCStr + PCStreamElement::aToFigTime(&p, out)
   *                              return whatever aToFigTime returned (via %eax->%ebx)
   *
   * Faithful port: only kinds 4 and 5 are handled; every other kind returns false without
   * touching `*out`. */
  getAsFigTime(out: { value: CMTime }): boolean {
    // @0x066af6-0x066af8  cmpl $4,%eax
    if (this.kind === kPCBinaryXMLFieldKind.FigTime) {
      // @0x066b29-0x066b38  copy the 24-byte CMTime out
      if (this.tValue === null) {
        // Layout consistency: FigTime kind is only set by PCBinaryXMLReadStream::readFigtime
        // after populating tValue. A null here is a caller bug — reflect the C++ behavior of
        // reading uninitialized memory as a fault, but do so loudly.
        throw new Error(
          "PCBinaryXMLField::getAsFigTime @ProCore 0x066ae8: kind=FIGTIME but tValue is null (readFigtime not called)",
        );
      }
      out.value = {
        value: this.tValue.value,
        timescale: this.tValue.timescale,
        flags: this.tValue.flags,
        epoch: this.tValue.epoch,
      };
      return true;
    }
    // @0x066afd  cmpl $5,%eax ; jne 0x66b3c
    if (this.kind !== kPCBinaryXMLFieldKind.String) return false;
    // @0x066b02-0x066b1d  createCStr + PCStreamElement::aToFigTime(&p, out)
    const cstr = PCString_createCStr(this.sValue);
    // aToFigTime writes into *out and returns non-zero on success.
    // We construct a mutable placeholder CMTime for the callee to fill.
    const scratch: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };
    const ok = PCStreamElement_aToFigTime(cstr, scratch);
    if (ok) out.value = scratch;
    return ok;
  }

  /**
   * PCBinaryXMLField::getAsString(PCString*) const — @ProCore 0x06617e.
   *
   *   @0x0661c1  cmpq $0x6,%rax ; ja -> return true (no write to *out)
   *   @0x0661e0  case 0 INT    : snprintf(buf,0x80,"%lld", iValue)             ; PCString::set(cstr)
   *   @0x0661ed  case 4 FIGTIME: snprintf(buf,0x80,"%lld %d %x %lld",
   *                                       tValue, tScale, tFlags, tEpoch)      ; PCString::set(cstr)
   *   @0x066220  case 1 FLOAT  : cvtss2sd f32 ; snprintf(buf,0x80,"%.10g", d)  ; PCString::set(cstr)
   *   @0x066231  case 3 DOUBLE : snprintf(buf,0x80,"%.16lg", dValue)           ; PCString::set(cstr)
   *   @0x066252  case 2 UINT   : snprintf(buf,0x80,"%llu", uValue)             ; PCString::set(cstr)
   *   @0x066272  case 5 STRING : PCString::set(&this->sValue)  — direct copy, no snprintf
   *   @0x066280  case 6 UUID   : snprintf(buf,0x80,"%08x%08x%08x%08x", w0..w3) ; PCString::set(cstr)
   *
   * Faithful port: match the printf specifiers exactly.  "%.10g" and "%.16lg" are C's
   * "shortest-form up to N significant digits" — not identical to JS's toPrecision/toString
   * in edge cases (subnormals, negative zero, denormals-at-boundary).  Documented as a known
   * partial-fidelity point; the STRING and INT/UINT/UUID paths ARE bit-exact. */
  getAsString(out: PCString): boolean {
    // @0x0661c1-0x0661c7  kind > 6 -> return true (no write). @0x0662ca movb $0x1,%al.
    if (this.kind > 6) return true;
    switch (this.kind) {
      case kPCBinaryXMLFieldKind.Int: {
        // @0x0661e0  "%lld" of iValue
        out.set_cstr(this.iValue.toString());
        return true;
      }
      case kPCBinaryXMLFieldKind.Float: {
        // @0x066220-0x066228  "%.10g" of (double)fValue
        // JS: `toPrecision(10)` gives ~10 significant digits then trims trailing zeros.
        // The %g/%.10g rules are: (a) if exponent E in [-4, precision), use %f with
        // precision (10 - 1 - E) and strip trailing zeros; (b) otherwise use %e with
        // precision (10 - 1) and strip trailing zeros. We implement that shape directly.
        out.set_cstr(formatPrintfG(this.fValue, 10));
        return true;
      }
      case kPCBinaryXMLFieldKind.UInt: {
        // @0x066252  "%llu" of uValue
        out.set_cstr(this.uValue.toString());
        return true;
      }
      case kPCBinaryXMLFieldKind.Double: {
        // @0x066231-0x066236  "%.16lg" of dValue
        out.set_cstr(formatPrintfG(this.dValue, 16));
        return true;
      }
      case kPCBinaryXMLFieldKind.FigTime: {
        // @0x0661ed  "%lld %d %x %lld" of (value, timescale, flags, epoch)
        if (this.tValue === null) {
          throw new Error(
            "PCBinaryXMLField::getAsString @ProCore 0x06617e: kind=FIGTIME but tValue is null (readFigtime not called)",
          );
        }
        const flagsHex = (this.tValue.flags >>> 0).toString(16);
        out.set_cstr(
          `${this.tValue.value.toString()} ${this.tValue.timescale | 0} ${flagsHex} ${this.tValue.epoch.toString()}`,
        );
        return true;
      }
      case kPCBinaryXMLFieldKind.String: {
        // @0x066272  PCString::set(&this->sValue)  — direct copy from the union slot
        out.set(this.sValue);
        return true;
      }
      case kPCBinaryXMLFieldKind.UUID: {
        // @0x066280-0x0662a6  "%08x%08x%08x%08x" of four u32 words
        if (this.uuid === null) {
          throw new Error(
            "PCBinaryXMLField::getAsString @ProCore 0x06617e: kind=UUID but uuid slot is null",
          );
        }
        const h = (n: number): string =>
          (n >>> 0).toString(16).padStart(8, "0");
        out.set_cstr(
          h(this.uuid.w0) + h(this.uuid.w1) + h(this.uuid.w2) + h(this.uuid.w3),
        );
        return true;
      }
      default:
        return true;
    }
  }

  /**
   * PCBinaryXMLField::getAsUUID() const — @ProCore 0x066a32.
   *
   *   @0x066a40  eax = kind
   *   @0x066a42  if eax == 6 (UUID) -> _Znwm(16) ; movups 0x48(%rbx),%xmm0 ; movups %xmm0,(%rax)
   *              return the freshly-heaped 16-byte copy
   *   @0x066a47  if eax != 5 -> return nullptr                          (@0x066a8a xorl %r14d,%r14d)
   *   @0x066a4c  else STRING : createCStr + PCStreamElement::atoUUID(&p) ; free(cstr) ; return
   *              whatever atoUUID returned (owned by the caller).
   *
   * Faithful port: never invents a UUID; STRING and UUID paths are the only ones that produce
   * a non-null result. */
  getAsUUID(): PCBinaryXMLFieldUUID | null {
    // @0x066a42  cmpl $6,%eax ; je 0x66a74
    if (this.kind === kPCBinaryXMLFieldKind.UUID) {
      if (this.uuid === null) return null;
      // @0x066a74-0x066a88  new UUID(16) ; copy 16 bytes
      return { w0: this.uuid.w0, w1: this.uuid.w1, w2: this.uuid.w2, w3: this.uuid.w3 };
    }
    // @0x066a47  cmpl $5,%eax ; jne 0x66a8a
    if (this.kind !== kPCBinaryXMLFieldKind.String) return null;
    // @0x066a4c-0x066a62  createCStr + PCStreamElement::atoUUID(&p)
    const cstr = PCString_createCStr(this.sValue);
    return PCStreamElement_atoUUID(cstr);
  }
}

// ── helpers modeling C runtime bits used in the STRING path ─────────────────────────────────
//
// These helpers reproduce libc's strtoX with the specific 0-base-10 arguments used by every
// getter (`strtol(cstr, NULL, 10)`, `strtof(cstr, NULL)`, etc.). Errno is modeled as a numeric
// field on the returned record: ERANGE == 0x22.  All getters set errno = 0 before the call and
// then read it, so we return the effective errno per call.

interface ParseResult<T> {
  value: T;
  errno: number;
}

/** libc strtol(cstr, NULL, 10)-like: base-10 signed integer.  On overflow returns clamped
 *  LONG_MIN/LONG_MAX with errno=ERANGE, matching Darwin's strtol. */
function parseIntBase10Signed(cstr: string): ParseResult<bigint> {
  // Skip leading whitespace, then optional sign, then base-10 digits — the strict subset used
  // by every ProCore getter (no 0x/0-prefix inference; base is explicitly 10).
  let i = 0;
  const n = cstr.length;
  while (i < n && (cstr[i] === " " || cstr[i] === "\t" || cstr[i] === "\n" || cstr[i] === "\r" || cstr[i] === "\v" || cstr[i] === "\f")) i++;
  let sign = 1n;
  if (i < n && (cstr[i] === "+" || cstr[i] === "-")) {
    if (cstr[i] === "-") sign = -1n;
    i++;
  }
  let acc = 0n;
  let any = false;
  while (i < n) {
    const c = cstr.charCodeAt(i);
    if (c < 48 || c > 57) break;
    acc = acc * 10n + BigInt(c - 48);
    any = true;
    i++;
  }
  if (!any) return { value: 0n, errno: 0 };
  const signed = sign * acc;
  // Darwin's strtol clamps to LONG_MIN..LONG_MAX (int64 on macOS 64-bit) with ERANGE.
  const MIN = -(1n << 63n);
  const MAX = (1n << 63n) - 1n;
  if (signed > MAX) return { value: MAX, errno: ERANGE };
  if (signed < MIN) return { value: MIN, errno: ERANGE };
  return { value: signed, errno: 0 };
}

/** libc strtoul(cstr, NULL, 10)-like: base-10 unsigned integer.  Overflow -> ULONG_MAX + ERANGE. */
function parseIntBase10Unsigned(cstr: string): ParseResult<bigint> {
  let i = 0;
  const n = cstr.length;
  while (i < n && (cstr[i] === " " || cstr[i] === "\t" || cstr[i] === "\n" || cstr[i] === "\r" || cstr[i] === "\v" || cstr[i] === "\f")) i++;
  let neg = false;
  if (i < n && (cstr[i] === "+" || cstr[i] === "-")) {
    if (cstr[i] === "-") neg = true;
    i++;
  }
  let acc = 0n;
  let any = false;
  while (i < n) {
    const c = cstr.charCodeAt(i);
    if (c < 48 || c > 57) break;
    acc = acc * 10n + BigInt(c - 48);
    any = true;
    i++;
  }
  if (!any) return { value: 0n, errno: 0 };
  const MAX = (1n << 64n) - 1n;
  if (acc > MAX) return { value: MAX, errno: ERANGE };
  // strtoul on Darwin: negative input is wrapped modulo 2^64 (POSIX says "same as -(strtoul of magnitude) casted").
  if (neg) return { value: BigInt.asUintN(64, -acc), errno: acc === 0n ? 0 : 0 };
  return { value: acc, errno: 0 };
}

/** libc strtod(cstr, NULL): parse a C-locale double.  JS `Number()` handles the common cases;
 *  we don't reproduce libc's every edge (hex floats, INFINITY case, nan-payloads) — the
 *  .motr writers only ever emit decimal doubles via `%.16lg`. */
function parseDouble(cstr: string): ParseResult<number> {
  const trimmed = cstr.trim();
  const v = Number(trimmed);
  // strtod sets ERANGE for overflow-to-inf; JS Number("1e400") returns Infinity silently.
  if (!Number.isFinite(v) && trimmed !== "" && !/^-?(inf|infinity|nan)$/i.test(trimmed)) {
    return { value: v, errno: ERANGE };
  }
  return { value: v, errno: 0 };
}

/** libc strtof(cstr, NULL): parse then narrow to single-precision. */
function parseFloat32(cstr: string): ParseResult<number> {
  const p = parseDouble(cstr);
  const f = Math.fround(p.value);
  if (!Number.isFinite(f) && Number.isFinite(p.value)) {
    return { value: f, errno: ERANGE };
  }
  return { value: f, errno: p.errno };
}

/** x86_64 `cvttss2si %xmm, %r64` / `cvttsd2si %xmm, %r64`: truncate-toward-zero to signed
 *  int64. On invalid (NaN) or out-of-range the CPU returns the "indefinite integer value"
 *  0x8000_0000_0000_0000 = INT64_MIN. */
function cvttf2i64(x: number): bigint {
  if (!Number.isFinite(x) || x >= 9223372036854775808 || x < -9223372036854775808) {
    return -(1n << 63n); // INT64_MIN — the x86 "invalid" result
  }
  const t = Math.trunc(x);
  return BigInt(t);
}

/** x86_64 signed-to-unsigned f->u64 idiom used in getAsUInt64 cases FLOAT/DOUBLE:
 *  if x >= 2^63 return ((int64)(x - 2^63)) | INT64_MIN ; else return (uint64)(int64)x.
 *  For NaN and negative-out-of-range the CPU emits INT64_MIN which we mask to zero via the
 *  fall-through — matches the compiler's `orq %rcx,%rsi` when the sign-bit was set. */
function cvttf2u64(x: number): bigint {
  if (!Number.isFinite(x)) return BigInt.asUintN(64, -(1n << 63n));
  if (x < 0) {
    // signed cvtt gives negative; asUintN wraps into u64 the same way orq/movq does.
    return BigInt.asUintN(64, cvttf2i64(x));
  }
  if (x < 9223372036854775808) {
    return BigInt.asUintN(64, cvttf2i64(x));
  }
  // x >= 2^63: signed part = cvtt(x - 2^63); OR with INT64_MIN.
  const shifted = x - 9223372036854775808;
  const lo = cvttf2i64(shifted);
  const hi = 1n << 63n;
  return BigInt.asUintN(64, lo | hi);
}

/** Faithful C `printf("%.<precision>g", d)` model — the exact shape used by getAsString for
 *  FLOAT (precision=10) and DOUBLE (precision=16).
 *
 *  Rules per C99 §7.19.6.1 (printf %g):
 *   - Style is %e if the exponent is < -4 or >= precision; else style is %f.
 *   - For %e: precision arg = precision - 1.  For %f: precision arg = precision - 1 - exponent.
 *   - Trailing zeros are removed from the fractional part; the decimal point is removed if
 *     no fractional digits remain (unless # flag — not used here).
 *   - Negative zero prints as "-0".  Infinity prints as "inf".  NaN prints as "nan".
 *
 *  We reproduce that shape using JS's `toExponential(p-1)` (which gives correct-rounded
 *  significand digits) and the exponent to decide %e-vs-%f and to place the decimal point. */
function formatPrintfG(x: number, precision: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0" : "0";
  const sign = x < 0 ? "-" : "";
  const ax = Math.abs(x);
  // Get correctly-rounded precision digits by asking JS for `toExponential(precision-1)`,
  // then split into (mantissa, exponent).
  const s = ax.toExponential(precision - 1); // e.g. "1.234000000e+2"
  const eIdx = s.indexOf("e");
  const mant = s.slice(0, eIdx);
  const exp = parseInt(s.slice(eIdx + 1), 10);
  const digits = mant.replace(".", ""); // "1234000000"
  // C99: use %e if exponent < -4 or >= precision, else %f
  if (exp < -4 || exp >= precision) {
    // %e style with precision-1 fractional digits, then trim trailing zeros
    let frac = digits.slice(1);
    frac = frac.replace(/0+$/, "");
    const body = frac.length > 0 ? `${digits[0]}.${frac}` : `${digits[0]}`;
    const eSign = exp < 0 ? "-" : "+";
    const eAbs = Math.abs(exp).toString().padStart(2, "0");
    return `${sign}${body}e${eSign}${eAbs}`;
  }
  // %f style: place decimal at position (exp+1) within the digit stream.
  // Total digits = precision; fractional digits before trim = precision - 1 - exp.
  const intLen = exp + 1;
  let intPart: string;
  let fracPart: string;
  if (intLen <= 0) {
    intPart = "0";
    fracPart = "0".repeat(-intLen) + digits;
  } else if (intLen >= digits.length) {
    intPart = digits + "0".repeat(intLen - digits.length);
    fracPart = "";
  } else {
    intPart = digits.slice(0, intLen);
    fracPart = digits.slice(intLen);
  }
  fracPart = fracPart.replace(/0+$/, "");
  return fracPart.length > 0 ? `${sign}${intPart}.${fracPart}` : `${sign}${intPart}`;
}
