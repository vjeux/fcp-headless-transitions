// OZGradient.ts — raw port of Ozone.framework `OZGradient::compute()`.
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// x86_64 slice; disassembly saved at raw-port/re/disasm/OZGradient.compute.s (from disasm.sh).
//
// Class-scope decode inventory (nm -arch x86_64 | c++filt)
// --------------------------------------------------------
//   DEFINED in this framework:
//     @0x004b5a10  OZGradient::compute()                         — this file
//   UNDEFINED (declared/referenced only; body lives in another translation unit):
//     __ZN10OZGradient4initEP12CGColorSpace
//     __ZN10OZGradient6updateE6CMTime
//     __ZN10OZGradient7getHashER6CMTime
//     __ZN10OZGradientC2ER17OZChannelGradientiP12CGColorSpace
//     __ZN10OZGradientD0Ev / D1Ev / D2Ev
//   → No struct layout is observable from this file alone; other methods are frontier callees.
//
// Body of OZGradient::compute() — from re/disasm/OZGradient.compute.s
// -------------------------------------------------------------------
//   __ZN10OZGradient7computeEv:
//   0x4b5a10  pushq %rbp
//   0x4b5a11  movq  %rsp, %rbp
//   0x4b5a14  popq  %rbp
//   0x4b5a15  retq
//   0x4b5a16  nopw  %cs:(%rax,%rax)                              (padding)
//
// Interpretation: this is the canonical **empty-body virtual**. The compiler has emitted the
// bare SysV-x86_64 prologue/epilogue with no field reads, no callees, and no return value
// setup. `compute()` is declared virtual on the base class and OZGradient overrides it as a
// no-op (a common pattern for a "recompute derived state on demand" hook that this concrete
// subclass has nothing to do for — the gradient's actual state is fully materialised by
// `init()`/`update()`, both of which live in other translation units and are NOT decoded here).
//
// No numeric constants, no branches, no callees, no field accesses — nothing to speculate about.
// The transcription is: a function that returns void with no observable side effect.
//
// Frontier callees discovered from the class-scope UND set (each stays undecoded until a worker
// claims that leaf):
//   - OZGradient::init(CGColorSpace*)                — build gradient from OZChannelGradient
//   - OZGradient::update(CMTime)                     — re-sample gradient at a time
//   - OZGradient::getHash(CMTime&)                   — content-hash of the sampled gradient
//   - OZGradient::OZGradient(OZChannelGradient&, int, CGColorSpace*)  — ctor
//   - OZGradient::~OZGradient (D0/D1/D2)

/**
 * OZGradient::compute()   @Ozone 0x4b5a10
 *
 * Transcribed verbatim from the shipping x86_64 disassembly:
 *     push %rbp ; mov %rsp,%rbp ; pop %rbp ; retq
 * That is, the empty function body. It reads no fields, calls no methods, mutates nothing.
 * We port it as an empty method with a `void` return, matching the machine code line-for-line.
 */
export function OZGradient_compute(): void {
  // @0x4b5a10  push %rbp
  // @0x4b5a11  mov  %rsp, %rbp
  // @0x4b5a14  pop  %rbp
  // @0x4b5a15  retq
  //
  // No body. FCP's compute() is an intentional no-op override on OZGradient.
  return;
}
