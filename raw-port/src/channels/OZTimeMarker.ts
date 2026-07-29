// OZTimeMarker — Ozone timeline marker record + total-ordering-by-start-time.
//
// Transcribed BYTE-VERBATIM from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// FAITHFUL PORT — every ported method cites `@Ozone 0xADDR`; every un-decoded overload
// / lifetime hook is a throwing stub with @0xADDR (Rule 3).
//
// Symbols in this class (nm -arch x86_64 | c++filt | grep '^OZTimeMarker::'):
//
//   @0x210920  OZTimeMarker::operator<(OZTimeMarker const&) const                 — PORTED
//   @0x210970  OZTimeMarker::operator==(OZTimeMarker const&) const                — PORTED
//   @0x210a40  OZTimeMarker::operator!=(OZTimeMarker const&) const                — PORTED
//   @0x210590  OZTimeMarker::OZTimeMarker(CMTime)                                 — PORTED (single-CMTime ctor)
//   @0x210440  OZTimeMarker::OZTimeMarker()                                       — stub (default ctor)
//   @0x210520  OZTimeMarker::OZTimeMarker(CMTime)                                 — stub (variant / thunk)
//   @0x2104b0  OZTimeMarker::OZTimeMarker()                                       — stub (variant)
//   @0x210600  OZTimeMarker::OZTimeMarker(PCTimeRange, PCString, PCString, int, OZTimeMarkerType)  — stub
//   @0x210690  OZTimeMarker::OZTimeMarker(PCTimeRange, PCString, PCString, int, OZTimeMarkerType)  — stub (variant)
//   @0x210720  OZTimeMarker::OZTimeMarker(OZTimeMarker const&)                    — stub (copy ctor)
//   @0x2107a0  OZTimeMarker::OZTimeMarker(OZTimeMarker const&)                    — stub (variant)
//   @0x2108c0  OZTimeMarker::operator=(OZTimeMarker const&)                       — stub
//   @0x210820  ~OZTimeMarker() (D0)                                               — stub
//   @0x210850  ~OZTimeMarker() (D1)                                               — stub
//   @0x210880  ~OZTimeMarker() (D2)                                               — stub
//   @0x210b20  OZTimeMarker::getLabel() const                                     — stub (345-line body)
//   @0x2110f0  writeHeader / writeBody / markFactoriesForSerialization / parse*   — stub (serializer plumbing)
//
// STRUCT LAYOUT — recovered from CMTime ctor @0x210590 + operator== field-store/compares:
//
//   +0x00   void*      vtable                          (leaq 0x636d5f(%rip); movq %rax,(%rdi))
//   +0x08   CMTime     startTime                       (16-byte movups @0x210594 low+high, 8-byte @0x2105ac at +0x18)
//                                                       (CMTime is 24 bytes: value/timescale/flags/epoch)
//   +0x20   CMTime     endTime                         (initialized to kCMTimeZero by CMTime ctor @0x2105b4-c6;
//                                                       compared in operator== @0x2109bd..d3, operator!= @0x210a92..b0)
//   +0x38   PCString   name  (or "label" / first-PCString field)  (PCString-default-ctor @0x2105d1;
//                                                       PCString::compare in operator== @0x2109fa-a02)
//   +0x40   PCString   secondString  (label variant / description) (PCString-default-ctor @0x2105da;
//                                                       PCString::compare in operator== @0x210a0b-13)
//   +0x48   int32      id            (movq $0x1, 0x48(%rbx) at ctor @0x2105df — 8-byte store zeroes
//                                     BOTH +0x48 (=1) and +0x4c (=0). operator== reads them as two
//                                     independent int32 comparisons @0x210a1c and @0x210a25.)
//   +0x4c   int32      markerType    (OZTimeMarkerType enum — read as int32 in operator== @0x210a25;
//                                     zero-initialized by the same movq at +0x48.)
//
//   Total sizeof(OZTimeMarker) = 0x50 (80 bytes, or a hair more if PCString has vtable padding).
//
// PROVENANCE / DECODE dumps:
//   raw-port/re/disasm/OZTimeMarker.operator<.s          @0x210920 (22 lines)
//   raw-port/re/disasm/OZTimeMarker.operator==.s         @0x210970 (62 lines)
//   raw-port/re/disasm/OZTimeMarker.operator!=.s         @0x210a40 (64 lines)
//   raw-port/re/disasm/OZTimeMarker.OZTimeMarker.s       @0x210590 (33 lines — CMTime ctor)

import { CMTimeCompare, kCMTimeZero, type CMTime } from "../infra/CMTime.js";
import { PCString } from "../infra/PCString.js";

// OZTimeMarkerType — the +0x4c enum. Encoded as int32; concrete tag values are only meaningful
// as identity comparisons in operator==/operator!=, so the port treats it as an opaque int.
// A full enum-value inventory would require decoding the parseElement/writeBody tables at
// @0x2113d0 / @0x211130, which are serializer plumbing (deferred).
// @provenance Ozone @0x210a25 (`movl 0x4c(%r14), %eax; cmpl 0x4c(%rbx), %eax`).
export type OZTimeMarkerType = number;

/**
 * OZTimeMarker — a timeline marker with a range (startTime..endTime), two label strings, an
 * int id (+0x48) and a type tag (+0x4c). Sortable by startTime; equality compares ALL fields.
 *
 * Fields are annotated with their +offset in bytes so a reviewer can diff this against
 * `OZTimeMarker.OZTimeMarker.s` (the CMTime ctor) and the two comparison operators.
 *
 * @provenance Ozone 0x210440..0x211470 (class byte range).
 */
export class OZTimeMarker {
  /**
   * startTime — CMTime at +0x08.
   *
   * Compared in operator<, operator==, operator!= as the first field.
   *
   * @provenance Ozone @0x210930 (`movups 0x8(%rdi), %xmm0` + `movq 0x18(%rdi), %rax`).
   */
  startTime!: CMTime; // @+0x08 (24 bytes CMTime: value@+0x08 / timescale@+0x10 / flags@+0x14 / epoch@+0x18)

  /**
   * endTime — CMTime at +0x20.  Initialized to `kCMTimeZero` by the single-CMTime ctor.
   *
   * @provenance Ozone @0x2105b4-@0x2105c6 (`movq 0x613f55(%rip), %rax` — literal pool symbol
   *             `_kCMTimeZero` — `movups (%rax), %xmm0; movups %xmm0, 0x20(%rdi); movq 0x10(%rax),
   *             %rax; movq %rax, 0x30(%rdi)`).
   */
  endTime!: CMTime; // @+0x20 (24 bytes CMTime)

  /**
   * name — PCString at +0x38.  Default-constructed by ctors.  Compared by `PCString::compare`
   * in operator==/operator!=.
   *
   * @provenance Ozone @0x2109fa (`leaq 0x38(%r14), %rdi; leaq 0x38(%rbx), %rsi;
   *             callq __ZNK8PCString7compareERKS_`).
   */
  name!: PCString; // @+0x38

  /**
   * secondString — PCString at +0x40.  Default-constructed.  Compared by `PCString::compare`.
   *
   * @provenance Ozone @0x210a0b (`leaq 0x40(%r14), %rdi; leaq 0x40(%rbx), %rsi;
   *             callq __ZNK8PCString7compareERKS_`).
   */
  secondString!: PCString; // @+0x40

  /**
   * id — int32 at +0x48.  The single-CMTime ctor writes 8 bytes of 0x0000_0000_0000_0001 at
   * +0x48, so this field is initialized to 1 and the adjacent +0x4c (`markerType`) is
   * initialized to 0.  operator== reads them as two independent 32-bit compares.
   *
   * @provenance Ozone @0x2105df (`movq $0x1, 0x48(%rbx)`) + @0x210a1c
   *             (`movl 0x48(%r14), %eax; cmpl 0x48(%rbx), %eax`).
   */
  id!: number; // @+0x48 (int32)

  /**
   * markerType — int32 at +0x4c.  See `OZTimeMarkerType` above.  Initialized to 0 by the ctor
   * (upper half of the +0x48 movq).
   *
   * @provenance Ozone @0x210a25 (`movl 0x4c(%r14), %eax; cmpl 0x4c(%rbx), %eax`).
   */
  markerType!: OZTimeMarkerType; // @+0x4c (int32)

  // ---------------------------------------------------------------------------
  // operator<(OZTimeMarker const&) const — @Ozone 0x210920.
  // ---------------------------------------------------------------------------
  /**
   * Total-ordering operator on `startTime` ALONE.  All other fields are ignored, so this is a
   * partial order in the marker-equality sense (two markers with the same startTime but
   * different names/types compare as neither < nor > — but they are NOT ==, hence not a total
   * order).  Used by the timeline sort.
   *
   * ```
   *   @0x210928  movq 0x18(%rdi), %rax           ; load this->startTime.epoch (+0x18) → -0x10(rbp)
   *   @0x210930  movups 0x8(%rdi), %xmm0         ; load this->startTime[+0x08..+0x18]  → -0x20(rbp)
   *   @0x210938  movq 0x18(%rsi), %rax           ; load other.startTime.epoch          → 0x28(rsp)
   *   @0x210941  movups 0x8(%rsi), %xmm0         ; load other.startTime[+0x08..+0x18]  → 0x18(rsp)
   *   @0x21094a  ...copy this-side into 0x10(rsp)/(rsp)...
   *   @0x21095b  callq _CMTimeCompare            ; CMTimeCompare(this.startTime, other.startTime)
   *   @0x210960  shrl $0x1f, %eax                ; %eax = (signed) result >> 31 = sign bit
   *   @0x210963  addq $0x50, %rsp; popq %rbp; retq   ; return %al (0 or 1)
   * ```
   *
   * `shrl $0x1f, %eax` extracts the sign bit: 1 if `CMTimeCompare(...) < 0`, else 0.  So
   * `a < b  <=>  CMTimeCompare(a.startTime, b.startTime) < 0`.
   *
   * @provenance Ozone @0x210920.
   */
  lessThan(other: OZTimeMarker): boolean {
    // @0x21095b  callq _CMTimeCompare(this.startTime, other.startTime)
    // @0x210960  shrl $0x1f, %eax   ; sign bit
    return CMTimeCompare(this.startTime, other.startTime) < 0;
  }

  // ---------------------------------------------------------------------------
  // operator==(OZTimeMarker const&) const — @Ozone 0x210970.
  // ---------------------------------------------------------------------------
  /**
   * Full-field equality.  Short-circuits: if any of {startTime, endTime, name, secondString,
   * id, markerType} differs, returns false.
   *
   * The asm walks:
   *   1. `CMTimeCompare(this.startTime, other.startTime)` — must be 0
   *   2. `CMTimeCompare(this.endTime,   other.endTime  )` — must be 0
   *   3. `PCString::compare(this.name,          other.name         )` — must return 0
   *   4. `PCString::compare(this.secondString,  other.secondString )` — must return 0
   *   5. `this.id         == other.id`          (int32 at +0x48)
   *   6. `this.markerType == other.markerType`  (int32 at +0x4c)  -- uses `sete %al`
   *
   * Any of the earlier steps taking the `jne 0x210a31` branch falls into `xorl %eax, %eax`
   * (return 0).  Only step 6 uses `sete`, so the return value is:
   *   1  iff  ALL SIX comparisons matched.
   *
   * @provenance Ozone @0x210970..@0x210a3b.
   */
  equals(other: OZTimeMarker): boolean {
    // @0x210981..@0x2109b4  CMTimeCompare(this.startTime, other.startTime); jne 0x210a31
    if (CMTimeCompare(this.startTime, other.startTime) !== 0) return false;
    // @0x2109bd..@0x2109f1  CMTimeCompare(this.endTime, other.endTime); jne 0x210a31
    if (CMTimeCompare(this.endTime, other.endTime) !== 0) return false;
    // @0x2109fa..@0x210a09  PCString::compare(this.name, other.name); jne 0x210a31
    if (this.name.compare(other.name) !== 0) return false;
    // @0x210a0b..@0x210a1a  PCString::compare(this.secondString, other.secondString); jne 0x210a31
    if (this.secondString.compare(other.secondString) !== 0) return false;
    // @0x210a1c..@0x210a23  cmpl this.id, other.id (int32); jne 0x210a31
    if ((this.id | 0) !== (other.id | 0)) return false;
    // @0x210a25..@0x210a2c  cmpl this.markerType, other.markerType; sete %al
    return (this.markerType | 0) === (other.markerType | 0);
  }

  // ---------------------------------------------------------------------------
  // operator!=(OZTimeMarker const&) const — @Ozone 0x210a40.
  // ---------------------------------------------------------------------------
  /**
   * Separately-compiled body (NOT `!this.equals(other)`).  Same short-circuit walk of the six
   * fields.  Register `%r15b` starts at 0x1 and stays 1 through any early `jne 0x210b05`
   * (i.e. return-1 = "not equal") from the first five checks.  Only the final int32 cmp at
   * +0x4c uses `setne %r15b` — so if ALL SIX fields match, %r15b becomes 0 (return-0 = "equal
   * hence not-not-equal"); otherwise it stays or becomes 1.
   *
   * ```
   *   @0x210a8b  movb $0x1, %r15b               ; %r15b := 1  (assume "differs" until proven equal)
   *   ; ...five compares, each `jne 0x210b05`   ; take the exit branch on any diff → return 1
   *   @0x210b01  setne %r15b                    ; the ONLY setne: on the last int32 cmp
   * ```
   *
   * The observable semantics are `a != b`, so we mirror `!this.equals(other)` — but the port
   * still walks each comparison in the exact same order as the asm so a reviewer can diff.
   *
   * @provenance Ozone @0x210a40..@0x210b12.
   */
  notEqual(other: OZTimeMarker): boolean {
    // @0x210a53..@0x210a86  CMTimeCompare(startTime); jne → return 1
    if (CMTimeCompare(this.startTime, other.startTime) !== 0) return true;
    // @0x210a92..@0x210ac6  CMTimeCompare(endTime);   jne → return 1
    if (CMTimeCompare(this.endTime, other.endTime) !== 0) return true;
    // @0x210acf..@0x210add  PCString::compare(name);   jne → return 1
    if (this.name.compare(other.name) !== 0) return true;
    // @0x210ae0..@0x210aef  PCString::compare(secondString); jne → return 1
    if (this.secondString.compare(other.secondString) !== 0) return true;
    // @0x210af1..@0x210af8  cmpl id (int32);  jne → return 1
    if ((this.id | 0) !== (other.id | 0)) return true;
    // @0x210afa..@0x210b01  cmpl markerType (int32); setne %r15b
    return (this.markerType | 0) !== (other.markerType | 0);
  }

  // ---------------------------------------------------------------------------
  // OZTimeMarker(CMTime t) — @Ozone 0x210590 (single-CMTime ctor).
  // ---------------------------------------------------------------------------
  /**
   * Construct with a single CMTime as `startTime`; `endTime` = kCMTimeZero; both PCStrings
   * default-constructed; id = 1; markerType = 0.
   *
   * ```
   *   @0x21059a  leaq 0x636d5f(%rip), %rax; movq %rax, (%rdi)     ; vtable @+0x00
   *   @0x2105a4  movaps 0x10(%rbp), %xmm0                          ; CMTime arg low 16B (value+timescale+flags)
   *   @0x2105a8  movups %xmm0, 0x8(%rdi)                           ; → startTime[+0x08..+0x18]
   *   @0x2105ac  movq 0x20(%rbp), %rax; movq %rax, 0x18(%rdi)      ; CMTime arg high 8B (epoch) → +0x18
   *   @0x2105b4  movq 0x613f55(%rip), %rax  ; = &kCMTimeZero
   *   @0x2105bb  movups (%rax), %xmm0; movups %xmm0, 0x20(%rdi)    ; endTime[+0x20..+0x30] = kCMTimeZero low
   *   @0x2105c2  movq 0x10(%rax), %rax; movq %rax, 0x30(%rdi)      ; endTime[+0x30..+0x38] = kCMTimeZero high
   *   @0x2105ca  leaq 0x38(%rdi), %r14; callq PCString::PCString() ; name = ""
   *   @0x2105d6  leaq 0x40(%rbx), %rdi; callq PCString::PCString() ; secondString = ""
   *   @0x2105df  movq $0x1, 0x48(%rbx)                             ; id = 1, markerType = 0 (both zeroed by movq high half)
   * ```
   *
   * The vtable pointer (+0x00) is `leaq 0x636d5f(%rip)` — not modelled in TS (no dispatch
   * yet), but its presence proves this is a polymorphic type.
   *
   * @provenance Ozone @0x210590.
   */
  static fromCMTime(t: CMTime): OZTimeMarker {
    const m = new OZTimeMarker();
    // @0x2105a4-b0  startTime = t   (all 24 CMTime bytes copied verbatim)
    m.startTime = { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
    // @0x2105b4-c6  endTime = kCMTimeZero
    m.endTime = { value: kCMTimeZero.value, timescale: kCMTimeZero.timescale, flags: kCMTimeZero.flags, epoch: kCMTimeZero.epoch };
    // @0x2105d1  name = PCString()
    m.name = new PCString();
    // @0x2105da  secondString = PCString()
    m.secondString = new PCString();
    // @0x2105df  movq $0x1, 0x48(%rbx)  → id=1, markerType=0
    m.id = 1;
    m.markerType = 0;
    return m;
  }

  // ---------------------------------------------------------------------------
  // Deferred: other ctors / dtor / operator= / getLabel / serializer plumbing.
  // ---------------------------------------------------------------------------

  /** Default OZTimeMarker() — @Ozone 0x210440 / 0x2104b0 (variant). Body not yet decoded. */
  static defaultConstruct(): OZTimeMarker {
    throw new Error("OZTimeMarker::OZTimeMarker() @0x210440 / @0x2104b0 not yet transcribed");
  }

  /** OZTimeMarker(PCTimeRange const&, PCString const&, PCString const&, int, OZTimeMarkerType) — @Ozone 0x210600 / 0x210690. */
  static fromRange(_range: unknown, _s1: PCString, _s2: PCString, _id: number, _type: OZTimeMarkerType): OZTimeMarker {
    throw new Error("OZTimeMarker::OZTimeMarker(PCTimeRange, PCString, PCString, int, OZTimeMarkerType) @0x210600 / @0x210690 not yet transcribed");
  }

  /** OZTimeMarker(OZTimeMarker const&) — @Ozone 0x210720 / 0x2107a0. */
  static copyConstruct(_src: OZTimeMarker): OZTimeMarker {
    throw new Error("OZTimeMarker::OZTimeMarker(OZTimeMarker const&) @0x210720 / @0x2107a0 not yet transcribed");
  }

  /** operator=(OZTimeMarker const&) — @Ozone 0x2108c0. */
  assignFrom(_src: OZTimeMarker): OZTimeMarker {
    throw new Error("OZTimeMarker::operator=(OZTimeMarker const&) @0x2108c0 not yet transcribed");
  }

  /** ~OZTimeMarker() — @Ozone 0x210820 (D0) / 0x210850 (D1) / 0x210880 (D2). */
  destroy(): void {
    throw new Error("OZTimeMarker::~OZTimeMarker() @0x210820 / @0x210850 / @0x210880 not yet transcribed");
  }

  /** OZTimeMarker::getLabel() const — @Ozone 0x210b20 (345-line body — likely `sprintf` or CFString formatter). */
  getLabel(): PCString {
    throw new Error("OZTimeMarker::getLabel() @0x210b20 not yet transcribed (345-line body)");
  }
}
