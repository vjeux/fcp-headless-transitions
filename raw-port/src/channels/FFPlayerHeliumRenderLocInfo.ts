// FFPlayerHeliumRenderLocInfo.ts — small POD "info" struct describing a player render location.
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at raw-port/re/disasm/Flexo.FFPlayerHeliumRenderLocInfo.all.s.
//
// The class is a plain-old-data record: it has no vtable, its two constructors write fields at
// fixed byte offsets, and one method (getPreferredImageLocation) reads them back. All three
// method addresses (from `nm` + `otool -tV` on Flexo):
//   @Flexo 0x0000000000d73b00  FFPlayerHeliumRenderLocInfo::FFPlayerHeliumRenderLocInfo(bool)
//   @Flexo 0x0000000000d73b50  FFPlayerHeliumRenderLocInfo::FFPlayerHeliumRenderLocInfo(
//                                  FxDeviceSet const*, FFPlayerHeliumLocationPreference,
//                                  FxDevice const*, FFSVPriorityEnum, int, int, CMTime)
//   @Flexo 0x0000000000d73b80  FFPlayerHeliumRenderLocInfo::getPreferredImageLocation(NSArray<FFDestVideo*>*)
//
// STRUCT LAYOUT (recovered from both ctors — the field types come from the sole ctor whose
// mangled signature names them; the bool-ctor's field writes agree with these offsets, so it is
// the same struct — 60 bytes total):
//   +0x00  deviceSet             FxDeviceSet*                       // qword ; bool-ctor stores an FFImageLocationSet* here instead (see NOTE below)
//   +0x08  locationPreference    FFPlayerHeliumLocationPreference   // dword (int32 enum)
//   +0x10  device                FxDevice*                          // qword
//   +0x18  priority              FFSVPriorityEnum                   // dword (int32 enum)
//   +0x1c  intA                  int32                              // dword (5th signature arg)
//   +0x20  intB                  int32                              // dword (6th signature arg)
//   +0x24  time                  CMTime                             // 24 bytes: value(i64)@+0x24, timescale(i32)@+0x2c, flags(u32)@+0x30, epoch(i64)@+0x34
//                                                                    (moved as 16B movups + 8B movq — see 0xd73b6c..0xd73b78)
// Total sizeof = 0x3c = 60 bytes.
//
// NOTE on the +0x00 slot: the bool-constructor stores the return of the free function
// _FFImageLocationSetCPUOnly() into +0x00, but the primary constructor's signature declares that
// slot as an `FxDeviceSet const*`. This is the FCP binary's actual behavior — a POD union-ish
// reuse of that slot depending on which constructor built the record. We preserve BOTH storage
// intents in the TS field type (`FxDeviceSet | FFImageLocationSet | null`) rather than papering
// over the ABI mismatch. getPreferredImageLocation() interprets +0x00 as an `FFImageLocationSet*`
// (it calls `_FFImageLocationSetCountAllDeviceTypes(this->[+0x00])` at 0xd73bab), so callers of
// getPreferredImageLocation must have built the struct via a code path that leaves an
// FFImageLocationSet in +0x00.

// ── Opaque forward types (decoded elsewhere / on the frontier) ────────────────
// These are pointer-typed opaques whose full shape is not needed to transcribe this class.
// They will be replaced with proper transcribed interfaces as those classes land.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FxDeviceSet {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FxDevice {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFImageLocationSet {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFImageLocation {}
// FFDestVideo is an Objective-C class. NSArray<FFDestVideo*>* is the argument type of
// getPreferredImageLocation; we model it as an opaque pointer-list here (its methods, in
// particular -requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:, are
// invoked by dispatched Objective-C `objc_msgSend`s and are undecoded).
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFDestVideo {}

// ── Enums recovered from the ctor signature ───────────────────────────────────
// These are declared int32 in the Itanium C++ ABI mangling on the ctor:
//   ...32FFPlayerHeliumLocationPreference... (name-only, size = 4 by "..PreferenceP.." after)
//   ...16FFSVPriorityEnum...                 (name-only, size = 4)
// Their concrete enumerator values live in headers we haven't recovered; we leave the type as a
// signed 32-bit `number` and mark the two branch-relevant values that the bool-ctor produces:
export type FFPlayerHeliumLocationPreference = number;  // int32
export type FFSVPriorityEnum                 = number;  // int32
// The bool-ctor computes priority = ((!flag) * 3) + 3, so it can only ever be 3 or 6.
// (0xd73b24: xorb $0x1,%bl ; 0xd73b27: movzbl %bl,%eax ; 0xd73b2a: leal (%rax,%rax,2),%eax
//  ; 0xd73b2d: addl $0x3,%eax ; 0xd73b30: movl %eax, 0x18(%r14))
// We do NOT invent semantic names for 3/6 — that would be an ungrounded guess (P3/P4).
export const FF_SV_PRIORITY_BOOL_CTOR_TRUE_VALUE : FFSVPriorityEnum = 3;
export const FF_SV_PRIORITY_BOOL_CTOR_FALSE_VALUE: FFSVPriorityEnum = 6;

// ── CMTime (from raw-port/src/infra/CMTime.ts) ────────────────────────────────
import type { CMTime } from "../infra/CMTime.js";

// ── Undecoded free functions (Flexo internal). Throwing stubs — see Porting Spec Rule 3. ─────
// These are ordinary C symbols reached via `callq` from the disassembly. They are on the
// frontier; when transcribed they should replace these stubs one-to-one.
export function FFImageLocationSetCPUOnly(): FFImageLocation {
  // @Flexo _FFImageLocationSetCPUOnly — called from ctor(bool) @0xd73b0c. not yet transcribed.
  throw new Error("FFImageLocationSetCPUOnly (callsite @0xd73b0c) not yet transcribed");
}
export function FFImageLocationSetCountAllDeviceTypes(_set: FFImageLocationSet): number {
  // @Flexo _FFImageLocationSetCountAllDeviceTypes — called from getPreferredImageLocation @0xd73bab. not yet transcribed.
  throw new Error("FFImageLocationSetCountAllDeviceTypes (callsite @0xd73bab) not yet transcribed");
}
export function FFImageLocationSetIsEmpty(_set: FFImageLocationSet): boolean {
  // @Flexo _FFImageLocationSetIsEmpty — called from getPreferredImageLocation @0xd73cfe. not yet transcribed.
  throw new Error("FFImageLocationSetIsEmpty (callsite @0xd73cfe) not yet transcribed");
}
export function FFImageLocationSetIsSingleEntry(_set: FFImageLocationSet): boolean {
  // @Flexo _FFImageLocationSetIsSingleEntry — called from getPreferredImageLocation @0xd73d0a and @0xd73d16. not yet transcribed.
  throw new Error("FFImageLocationSetIsSingleEntry (callsites @0xd73d0a, @0xd73d16) not yet transcribed");
}
export function FFImageLocationSetGetSingleLocation(_set: FFImageLocationSet): FFImageLocation {
  // @Flexo _FFImageLocationSetGetSingleLocation — called from getPreferredImageLocation @0xd73d22 and @0xd73d49. not yet transcribed.
  throw new Error("FFImageLocationSetGetSingleLocation (callsites @0xd73d22, @0xd73d49) not yet transcribed");
}
export function FFImageLocationIsAbsoluteGPU(_loc: FFImageLocation): boolean {
  // @Flexo _FFImageLocationIsAbsoluteGPU — called from getPreferredImageLocation @0xd73d2d and @0xd73d5b. not yet transcribed.
  throw new Error("FFImageLocationIsAbsoluteGPU (callsites @0xd73d2d, @0xd73d5b) not yet transcribed");
}
export function FFImageLocationMustBeRAM(_loc: FFImageLocation): boolean {
  // @Flexo _FFImageLocationMustBeRAM — called from getPreferredImageLocation @0xd73d39 and @0xd73d6b. not yet transcribed.
  throw new Error("FFImageLocationMustBeRAM (callsites @0xd73d39, @0xd73d6b) not yet transcribed");
}
export function FFStringFromImageLocation(_loc: FFImageLocation): unknown {
  // @Flexo _FFStringFromImageLocation — called from getPreferredImageLocation @0xd73d92 and @0xd73d9a
  // (twice on the "diverged single-location" diagnostic path, presumably feeding a log/format
  // string that's discarded — the return value is not consumed). not yet transcribed.
  throw new Error("FFStringFromImageLocation (callsites @0xd73d92, @0xd73d9a) not yet transcribed");
}

// ── The class ─────────────────────────────────────────────────────────────────
export class FFPlayerHeliumRenderLocInfo {
  // Field storage — matches the byte offsets documented in the header block above.
  // The +0x00 slot is typed as the union of the two observed static types (see NOTE).
  deviceSet: FxDeviceSet | FFImageLocationSet | null;   // +0x00
  locationPreference: FFPlayerHeliumLocationPreference; // +0x08
  device: FxDevice | null;                              // +0x10
  priority: FFSVPriorityEnum;                           // +0x18
  intA: number;                                         // +0x1c  (int32)
  intB: number;                                         // +0x20  (int32)
  time: CMTime;                                         // +0x24  (24 bytes)

  // ── ctor(bool) @Flexo 0x0000000000d73b00 ───────────────────────────────────
  // 0xd73b00 pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
  // 0xd73b07 movl %esi,%ebx                 ; ebx = bool arg (zero-extended)
  // 0xd73b09 movq %rdi,%r14                 ; r14 = this
  // 0xd73b0c callq _FFImageLocationSetCPUOnly
  // 0xd73b11 movq %rax, (%r14)              ; this->+0x00 = returned FFImageLocationSet*
  // 0xd73b14 movl $0x0, 0x8(%r14)           ; this->+0x08 = 0
  // 0xd73b1c movq $0x0, 0x10(%r14)          ; this->+0x10 = nullptr
  // 0xd73b24 xorb $0x1,%bl                  ; bl ^= 1  (invert the incoming bool)
  // 0xd73b27 movzbl %bl,%eax
  // 0xd73b2a leal (%rax,%rax,2),%eax        ; eax = eax*3
  // 0xd73b2d addl $0x3,%eax                 ; eax = eax*3 + 3
  // 0xd73b30 movl %eax, 0x18(%r14)          ; this->+0x18 = priority
  // 0xd73b34 movl $0x0, 0x20(%r14)          ; this->+0x20 = 0
  //   (NOTE: the bool-ctor does NOT initialize +0x1c intA nor +0x24..+0x3b time. Since this is
  //    a POD ctor with no earlier zero-init prologue, those bytes are LEFT UNDEFINED — matching
  //    Apple's binary exactly. Callers must not rely on their values. We model this by leaving
  //    intA uninitialized-looking (0) but flag it; TS forces initialization, so we assign 0 and
  //    document the difference. In TS we cannot leave a field truly uninitialized, so we assign
  //    a sentinel 0 / zero-CMTime here — but no port logic must depend on that sentinel value,
  //    since the FCP binary itself does not guarantee those bytes.)
  static fromBool(flag: boolean): FFPlayerHeliumRenderLocInfo {
    const self = Object.create(FFPlayerHeliumRenderLocInfo.prototype) as FFPlayerHeliumRenderLocInfo;
    // 0xd73b0c + 0xd73b11
    self.deviceSet = FFImageLocationSetCPUOnly();
    // 0xd73b14
    self.locationPreference = 0;
    // 0xd73b1c
    self.device = null;
    // 0xd73b24..0xd73b30 — priority = ((flag XOR 1) * 3) + 3
    const inverted = flag ? 0 : 1;
    self.priority = inverted * 3 + 3;
    // 0xd73b34
    self.intB = 0;
    // Fields not written by this ctor — kept undefined at the ABI level. TS requires a value:
    self.intA = 0;
    self.time = { value: 0n, timescale: 0, flags: 0, epoch: 0n };
    return self;
  }

  // ── ctor(FxDeviceSet const*, FFPlayerHeliumLocationPreference, FxDevice const*,
  //         FFSVPriorityEnum, int, int, CMTime) @Flexo 0x0000000000d73b50 ───────
  // 0xd73b50 pushq %rbp / movq %rsp,%rbp
  // 0xd73b54 movl 0x10(%rbp), %eax          ; eax = 6th int arg (stack, System V AMD64 spillover)
  // 0xd73b57 movq %rsi, (%rdi)              ; this->+0x00 = FxDeviceSet* arg
  // 0xd73b5a movl %edx, 0x8(%rdi)           ; this->+0x08 = FFPlayerHeliumLocationPreference arg
  // 0xd73b5d movq %rcx, 0x10(%rdi)          ; this->+0x10 = FxDevice* arg
  // 0xd73b61 movl %r8d, 0x18(%rdi)          ; this->+0x18 = FFSVPriorityEnum arg
  // 0xd73b65 movl %r9d, 0x1c(%rdi)          ; this->+0x1c = 5th int arg
  // 0xd73b69 movl %eax, 0x20(%rdi)          ; this->+0x20 = 6th int arg
  // 0xd73b6c movups 0x18(%rbp), %xmm0       ; xmm0 = first 16 bytes of CMTime arg on stack
  // 0xd73b70 movups %xmm0, 0x24(%rdi)       ; this->+0x24 = CMTime bytes 0..15 (value+timescale+flags)
  // 0xd73b74 movq 0x28(%rbp), %rax          ; rax = last 8 bytes of CMTime arg (epoch)
  // 0xd73b78 movq %rax, 0x34(%rdi)          ; this->+0x34 = CMTime epoch (int64)
  // 0xd73b7c popq %rbp / retq
  constructor(
    deviceSet: FxDeviceSet | null,
    locationPreference: FFPlayerHeliumLocationPreference,
    device: FxDevice | null,
    priority: FFSVPriorityEnum,
    intA: number,
    intB: number,
    time: CMTime,
  ) {
    // 0xd73b57
    this.deviceSet = deviceSet;
    // 0xd73b5a
    this.locationPreference = locationPreference;
    // 0xd73b5d
    this.device = device;
    // 0xd73b61
    this.priority = priority;
    // 0xd73b65
    this.intA = intA | 0;   // int32 truncation semantics — matches movl width
    // 0xd73b69
    this.intB = intB | 0;   // int32 truncation semantics — matches movl width
    // 0xd73b6c..0xd73b78 — the CMTime is copied by value as 16B + 8B; we copy the fields.
    this.time = { value: time.value, timescale: time.timescale, flags: time.flags, epoch: time.epoch };
  }

  // ── getPreferredImageLocation(NSArray<FFDestVideo*>*) @Flexo 0x0000000000d73b80 ─────────────
  // FRONTIER: this method's body executes Objective-C `objc_msgSend` dispatches (notably
  //   -[FFDestVideo requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:])
  // and calls eight undecoded FFImageLocationSet*/FFImageLocation*/FFStringFromImageLocation
  // free functions. All eight are declared as throwing stubs above, each citing its callsite
  // address. The Objective-C bridge itself has not been modeled in this port.
  //
  // Rather than paraphrase the C++ control flow with plausible-looking TS (which would violate
  // Porting Spec Rule 3 the moment any of the stubs is called), this method throws immediately,
  // citing the enclosing method address. When the free-function frontier is transcribed AND an
  // Objective-C dispatch strategy is in place, this stub is replaced with the line-for-line
  // transcription of the disassembly saved at
  //   raw-port/re/disasm/Flexo.FFPlayerHeliumRenderLocInfo.all.s (0xd73b80..0xd73dd8).
  //
  // Short summary of the intended control flow (documented from the .s, NOT executed here):
  //   - guard: if (_FFImageLocationSetCountAllDeviceTypes(this->deviceSet) < 2) return NULL.
  //   - dispatch on this->locationPreference (+0x08):
  //       * pref == 1 -> zero a 4x __m128 scratch region on stack ; NSArray path via
  //         -[destVideos requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
  //         with r8d=$0x10 ; iterate the returned collection ; for each pair (rax = -msg(item,r13),
  //         then -msg(rax,r15)) union in and probe with _FFImageLocationSetIsEmpty /
  //         _FFImageLocationSetIsSingleEntry / _FFImageLocationSetGetSingleLocation /
  //         _FFImageLocationIsAbsoluteGPU / _FFImageLocationMustBeRAM ; on "diverging" single
  //         entries, call _FFStringFromImageLocation twice for a log and return NULL.
  //       * pref == 0 -> read this->device (+0x10) into the result slot directly and return it.
  //       * else     -> return NULL.
  getPreferredImageLocation(_destVideos: readonly FFDestVideo[]): FFImageLocation | null {
    // @Flexo 0xd73b80 FFPlayerHeliumRenderLocInfo::getPreferredImageLocation not yet transcribed
    // (blocked on: _FFImageLocationSetCountAllDeviceTypes @0xd73bab, the Objective-C
    //  requestedSizeForAssetSize:... dispatch @0xd73c17/0xd73c7e/0xd73cec/0xd73cf5,
    //  _FFImageLocationSetIsEmpty @0xd73cfe, _FFImageLocationSetIsSingleEntry @0xd73d0a/@0xd73d16,
    //  _FFImageLocationSetGetSingleLocation @0xd73d22/@0xd73d49,
    //  _FFImageLocationIsAbsoluteGPU @0xd73d2d/@0xd73d5b,
    //  _FFImageLocationMustBeRAM @0xd73d39/@0xd73d6b,
    //  _FFStringFromImageLocation @0xd73d92/@0xd73d9a).
    throw new Error("FFPlayerHeliumRenderLocInfo.getPreferredImageLocation @Flexo 0xd73b80 not yet transcribed");
  }
}
