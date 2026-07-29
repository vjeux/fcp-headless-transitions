// OZChannelColor::OZChannelColor_alphaInfo — ProChannel.framework.
// Meyers-singleton descriptor for a color-channel's ALPHA component. Nested
// inside OZChannelColor. Two non-dtor methods transcribed here (bodies fully
// decoded); dtors ~OZChannelColor_alphaInfo @0x54c08/@0x54c28 are the standard
// D1/D0 aliases and are elided per porting convention.
//
//   @ProChannel 0x54aca  OZChannelColor_alphaInfo::getInstance()
//   @ProChannel 0x54b66  OZChannelColor_alphaInfo::OZChannelColor_alphaInfo()  (C2)
//
// Source disassemblies:
//   raw-port/re/disasm/ProChannel.OZChannelColor.OZChannelColor_alphaInfo.getInstance.s
//   raw-port/re/disasm/ProChannel.OZChannelColor.OZChannelColor_alphaInfo.ctor.s
//
// INHERITANCE (recovered from the ctor 0x54b66..0x54be5):
//   OZChannelColor_alphaInfo : public OZChannelInfo,     (primary base at +0x00, sizeof=0x50)
//                              public PCSingleton         (secondary base at +0x50)
//
//   Evidence: base ctor OZChannelInfo(d,d,d,d,d,PCString&) is called with rdi=%rbx
//   (@0x54bab); then PCSingleton::PCSingleton(unsigned int) is called with
//   rdi = %rbx + 0x50 and tag = 0x64 (@0x54bb9..0x54bc2). Two separate vptrs
//   are installed at +0x00 and +0x50 (@0x54bc7..0x54bd9).
//
// VTABLE (address 0x149b??; installed pointers derived from the ctor):
//   this[+0x00].vptr = &__ZTVN14OZChannelColor24OZChannelColor_alphaInfoE + 0x10
//   this[+0x50].vptr = &__ZTVN14OZChannelColor24OZChannelColor_alphaInfoE + 0x30
//   (two vtable subobjects for the primary and secondary base — Itanium C++ ABI
//    layout for multiple inheritance.)
//
// BASE-CTOR ARGS (recovered from xmm0..xmm4 setup at 0x54b87..0x54ba5):
//   Register state at the callq at 0x54bab (System V x86_64 ABI):
//     rdi   = this           (from movq %rbx,%rdi @0x54ba2)
//     rsi   = &PCString("")  (from movq %r14,%rsi @0x54ba8)
//     xmm0  = 0.0            (from xorps %xmm0,%xmm0 @0x54b9f)
//     xmm1  = 1.0            (from movsd @0xaf528, resolve.py const -> double 1.0)
//     xmm2  = 0.01           (from movsd @0xaf520, resolve.py const -> double 0.01)
//     xmm3  = 0.001          (from movsd @0xb0518, resolve.py const -> double 0.001)
//     xmm4  = 1.0            (from movaps %xmm1,%xmm4 @0x54ba5)
//
//   The C++ signature is
//     OZChannelInfo::OZChannelInfo(double min, double max, double stepCoarse,
//                                  double stepFine, double displayScale,
//                                  PCString const& unitSuffix)
//   (matched by OZChannelInfo.fromPCString in raw-port/src/channels/OZChannelInfo.ts
//    and by OZChannelInfo's disasm at @0x71a94 which stores xmm1 -> +0x08 (max),
//    xmm0 -> +0x10 (min), xmm3 -> +0x18 (stepFine), xmm2 -> +0x20 (stepCoarse),
//    xmm4 -> +0x28 (displayScale)).
//
//   Alpha-channel plate:
//     min          = 0.0   (arg 1  / xmm0)
//     max          = 1.0   (arg 2  / xmm1)
//     stepCoarse   = 0.01  (arg 3  / xmm2)
//     stepFine     = 0.001 (arg 4  / xmm3)
//     displayScale = 1.0   (arg 5  / xmm4)
//     unitSuffix   = ""    (arg 6  / PCString from @0xbc3f8 empty literal)
//
// SECONDARY-BASE ARG (PCSingleton at +0x50):
//   PCSingleton::PCSingleton(unsigned int tag) called with tag = 0x64 (=100).
//   (movl $0x64, %esi @0x54bbd, then callq PCSingleton::PCSingleton @0x54bc2.)
//   The specific tag values are enumerated by PCSingleton's registry — 0x64
//   is the singleton-id assigned to OZChannelColor_alphaInfo at process
//   initialization.
//
// FRONTIER CALLEES (all cited per Rule 3):
//   __ZN8PCStringC1EPKc                              @0xacd08  PCString::PCString(char const*)
//   __ZN13OZChannelInfoC2EdddddRK8PCString           @0x71a94  OZChannelInfo(d,d,d,d,d,PCString&)
//   __ZN8PCStringD1Ev                                @0xacd20  PCString::~PCString()
//   __ZN11PCSingletonC2Ej                            @0xacb46  PCSingleton::PCSingleton(unsigned int)
//   std::__1::__call_once(...)                       @0xacdc8
//
// getInstance() is a plain std::call_once + return pointer-to-singleton. The
// underlying `_OZChannelColor_alphaInfo` global (symbol
// __ZN14OZChannelColor24OZChannelColor_alphaInfo25_OZChannelColor_alphaInfoE)
// is the actual instance pointer, populated by the call_once lambda on first call.

import { OZChannelInfo } from "./OZChannelInfo";
import { PCSingleton } from "../infra/PCSingleton";

/**
 * OZChannelColor::OZChannelColor_alphaInfo — describes the alpha component of
 * a color-channel parameter: range 0..1, coarse/fine step 0.01/0.001, unit
 * display scale 1.0 (so the user sees the raw 0..1 value), no unit suffix.
 *
 * Layout (Itanium multiple-inheritance):
 *   +0x00..+0x50  OZChannelInfo primary base (see OZChannelInfo.ts)
 *   +0x50..       PCSingleton secondary base (tag=0x64)
 *
 * In TS multiple inheritance is not expressible as a class extends chain; we
 * expose the two base subobjects as fields so callers can drive either base's
 * interface deterministically, matching the two-vptr binary layout.
 */
export class OZChannelColor_alphaInfo {
  /**
   * Primary base subobject at +0x00.
   *
   * Populated by OZChannelInfo::OZChannelInfo(d,d,d,d,d,PCString&) @0x71a94
   * with (min=0.0, max=1.0, stepCoarse=0.01, stepFine=0.001, displayScale=1.0,
   * unitSuffix="").
   */
  public info: OZChannelInfo;

  /**
   * Secondary base subobject at +0x50.
   *
   * Populated by PCSingleton::PCSingleton(unsigned int) @0x1d5a6 with tag=0x64.
   */
  public singleton: PCSingleton;

  /**
   * @ProChannel 0x54b66  __ZN14OZChannelColor24OZChannelColor_alphaInfoC2Ev
   *
   * Disasm walk (44 lines, linear path 0x54b66..0x54be5; unwind cleanup
   * at 0x54be6..0x54c02 elided — the port cannot throw):
   *
   *   0x54b71  movq %rdi,%rbx                           this = rdi
   *   0x54b74  leaq @0xbc3f8(%rip),%rsi                 rsi = "" (empty C-string literal)
   *   0x54b7b  leaq -0x18(%rbp),%r14                    r14 = &tmp PCString (stack slot)
   *   0x54b7f  movq %r14,%rdi                           rdi = &tmp
   *   0x54b82  callq PCString::PCString(char const*)    tmp = PCString("")   @0xacd08 stub
   *   0x54b87  movsd @0xaf520,%xmm2                     xmm2 = 0.01
   *   0x54b8f  movsd @0xb0518,%xmm3                     xmm3 = 0.001
   *   0x54b97  movsd @0xaf528,%xmm1                     xmm1 = 1.0
   *   0x54b9f  xorps %xmm0,%xmm0                        xmm0 = 0.0
   *   0x54ba2  movq  %rbx,%rdi                          rdi = this
   *   0x54ba5  movaps %xmm1,%xmm4                       xmm4 = 1.0
   *   0x54ba8  movq  %r14,%rsi                          rsi = &tmp
   *   0x54bab  callq OZChannelInfo(d,d,d,d,d,PCString&) @0x71a94
   *   0x54bb0  leaq -0x18(%rbp),%rdi
   *   0x54bb4  callq PCString::~PCString()              tmp.~PCString() @0xacd20 stub
   *   0x54bb9  leaq 0x50(%rbx),%rdi                     rdi = &this[+0x50]
   *   0x54bbd  movl $0x64,%esi                          esi = 100
   *   0x54bc2  callq PCSingleton::PCSingleton(u32)      @0xacb46 stub -> @0x1d5a6
   *   0x54bc7  leaq __ZTV...OZChannelColor_alphaInfo(%rip),%rax     rax = &vtable
   *   0x54bce  leaq 0x10(%rax),%rcx                     rcx = vtable + 0x10 (primary vptr)
   *   0x54bd2  movq %rcx,(%rbx)                         this[+0x00].vptr = ^
   *   0x54bd5  addq $0x30,%rax                          rax = vtable + 0x30 (secondary vptr)
   *   0x54bd9  movq %rax,0x50(%rbx)                     this[+0x50].vptr = ^
   *   0x54bdd..0x54be5   epilogue + retq
   *
   * Alpha-channel plate: [0..1] range, 0.01 coarse step, 0.001 fine step,
   * displayScale 1.0 (so slider maps 1:1 to the underlying value).
   */
  public constructor() {
    // Base ctor call sequence, in the exact order the binary calls them.
    //
    // OZChannelInfo(min=0.0, max=1.0, stepCoarse=0.01, stepFine=0.001,
    //               displayScale=1.0, unitSuffix="").
    //
    // The double literals are lifted verbatim from ProChannel's data section
    // via resolve.py const:
    //   0.01  @0xaf520 (u64=0x3f847ae147ae147b)
    //   0.001 @0xb0518 (u64=0x3f50624dd2f1a9fc)
    //   1.0   @0xaf528 (u64=0x3ff0000000000000)
    this.info = OZChannelInfo.fromPCString(
      0.0,   // min          xmm0 = xorps @0x54b9f
      1.0,   // max          xmm1 = movsd @0xaf528 @0x54b97
      0.01,  // stepCoarse   xmm2 = movsd @0xaf520 @0x54b87
      0.001, // stepFine     xmm3 = movsd @0xb0518 @0x54b8f
      1.0,   // displayScale xmm4 = movaps %xmm1,%xmm4 @0x54ba5
      "",    // unitSuffix   rsi  = &PCString("") built from @0xbc3f8
    );

    // PCSingleton subobject at +0x50, tag = 0x64 (=100).
    this.singleton = new PCSingleton(0x64);

    // The two vptr writes at 0x54bd2 and 0x54bd9 install the primary and
    // secondary vtable pointers. TS has no observable vtable — the two-vtbl
    // layout is instead expressed by the two typed sub-objects above. Any
    // caller invoking a virtual slot on *this must dispatch through
    // this.info or this.singleton (per Itanium ABI thunk semantics).
  }
}

// ─── Singleton storage ──────────────────────────────────────────────────────
//
// The C++ code holds the singleton as a global pointer initialized on first
// call by std::call_once:
//   static std::once_flag _OZChannelColor_alphaInfo_once;   // (%rip @0x54aca)
//   static OZChannelColor_alphaInfo* _OZChannelColor_alphaInfo;
//
// getInstance() returns _OZChannelColor_alphaInfo after ensuring the
// call_once lambda has run. The lambda body (not visible in getInstance
// itself — it's the target of __call_once_proxy) allocates + constructs the
// singleton and stores its pointer at _OZChannelColor_alphaInfo.
//
// We reproduce this with a private module-scope cache and a lazy allocator.

/** Backing storage for the singleton (matches the C++ static pointer). */
let _OZChannelColor_alphaInfo: OZChannelColor_alphaInfo | null = null;

/**
 * @ProChannel 0x54aca  __ZN14OZChannelColor24OZChannelColor_alphaInfo11getInstanceEv
 *
 * Disasm (19 lines):
 *   0x54aca  movq once_flag(%rip),%rax                rax = once_flag value
 *   0x54ad1  cmpq $-1,%rax                            check "already-initialized" sentinel (-1)
 *   0x54ad5  je   0x54b09                             if initialized, skip lambda
 *   0x54ad7..0x54b04  set up 3-arg call_once(once_flag, &lambda_capture, __call_once_proxy)
 *   0x54b09  movq _OZChannelColor_alphaInfo(%rip),%rax  rax = singleton pointer
 *   0x54b10  retq
 *
 * The `-1` sentinel is libc++'s marker for a completed once_flag; on that
 * path getInstance bypasses call_once entirely and just returns the stored
 * pointer. In TS we mirror the same fast/slow-path with a nullable cache.
 */
export function getInstance_OZChannelColor_alphaInfo(): OZChannelColor_alphaInfo {
  if (_OZChannelColor_alphaInfo !== null) {
    // Fast path — mirror `cmpq $-1, %rax; je 0x54b09`.
    return _OZChannelColor_alphaInfo;
  }
  // Slow path — mirror the call_once lambda (which just allocates a new
  // OZChannelColor_alphaInfo and stores it in the global). The C++ code
  // guarantees this runs exactly once across all threads; JS is
  // single-threaded so a plain nullish-init is bit-exact for the observable
  // program state.
  _OZChannelColor_alphaInfo = new OZChannelColor_alphaInfo();
  return _OZChannelColor_alphaInfo;
}
