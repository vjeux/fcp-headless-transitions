// OZIdentityTimeStrategy.ts — Ozone "identity" time-remap strategy.
//
// This is a leaf polymorphic class in Ozone's OZTimeStrategy family. Its role is
// trivial: `operator()(CMTime const&)` returns the input time normalized through
// `CMTimeMake(value, timescale)` — i.e. it drops the input's `flags` (rounding
// history, infinity/indefinite markers) and `epoch`, keeping only the rational
// value/timescale and marking the result Valid with epoch=0. This is the
// "identity" strategy in the sense that it does not remap the rational time
// itself, but it DOES canonicalize the CMTime carrier through CMTimeMake.
//
// Transcribed from FCP Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// See raw-port/re/disasm/OZIdentityTimeStrategy.operator().s and
// raw-port/re/disasm/OZIdentityTimeStrategy.~OZIdentityTimeStrategy.s .
//
// Vtable @Ozone 0x8865c0 (installed +0x10 to skip typeinfo/offset-to-top):
//   slot +0x00: ~OZIdentityTimeStrategy()      @0x62a400  (D1, in-place dtor)
//   slot +0x08: ~OZIdentityTimeStrategy()      @0x62a410  (D0, dtor+delete)
//   slot +0x10: operator()(CMTime const&)      @0x62a3c0
//
// Instance layout: the class has NO data members — only the vtable pointer.
// (Confirmed by disasm: none of the three methods touch any offset other than
// %rdi = this. Object size = 8 bytes = a single vptr.)

import { CMTime, CMTimeMake } from "../infra/CMTime";

/**
 * OZIdentityTimeStrategy::operator()(CMTime const&) — identity time remap.
 * @Ozone 0x62a3c0
 *
 * Disasm (x86_64 sysv abi, sret return of CMTime):
 *   rdi = sret pointer (caller-provided CMTime out slot)
 *   rsi = this
 *   rdx = &input CMTime
 *
 *   0x62a3c0  push  rbp / mov rbp,rsp / push rbx / push rax
 *   0x62a3c6  mov   rbx, rdi                 ; save sret pointer
 *   0x62a3c9  mov   rsi, [rdx]               ; rsi = input.value  (int64 @+0x00)
 *   0x62a3cc  mov   edx, [rdx+0x8]           ; edx = input.timescale (int32 @+0x08)
 *   0x62a3cf  call  _CMTimeMake              ; @stub 0x6dcac8 → CoreMedia _CMTimeMake
 *                                              ; args: rdi(sret unchanged)=out, rsi=value, rdx=timescale
 *   0x62a3d4  mov   rax, rbx                 ; return sret pointer
 *   0x62a3d7  add   rsp,8 / pop rbx / pop rbp / ret
 *
 * Semantics: builds a fresh CMTime with the SAME (value, timescale) as input,
 * but with flags=kCMTimeFlags_Valid and epoch=0 (per CMTimeMake). This drops
 * input.flags (e.g. HasBeenRounded, PositiveInfinity, NegativeInfinity,
 * Indefinite) and input.epoch. Note this is NOT a struct copy — it is
 * specifically a CMTimeMake round-trip.
 *
 * The TS `this` receiver has no state to read (no fields on the class), so we
 * expose the method as an instance method on the class and it depends only on
 * its argument.
 */
export class OZIdentityTimeStrategy {
  /**
   * @Ozone 0x62a3c0  OZIdentityTimeStrategy::operator()(CMTime const&)
   * Calls CoreMedia CMTimeMake @stub Ozone 0x6dcac8 → _CMTimeMake.
   */
  call(t: CMTime): CMTime {
    // Mirrors: mov rsi,[rdx] ; mov edx,[rdx+8] ; call _CMTimeMake
    //   value     = t.value      (int64, from +0x00)
    //   timescale = t.timescale  (int32, from +0x08)
    return CMTimeMake(t.value, t.timescale);
  }

  /**
   * @Ozone 0x62a400  OZIdentityTimeStrategy::~OZIdentityTimeStrategy()  (D1, in-place)
   *
   * Disasm: push rbp / mov rbp,rsp / pop rbp / ret — a pure no-op prologue/epilogue.
   * The class has no members and no non-trivial base, so the in-place destructor
   * does nothing. TS has GC, so this is intentionally empty.
   */
  destroyInPlace(): void {
    // no-op (matches @Ozone 0x62a400: only frame setup + ret)
  }

  /**
   * @Ozone 0x62a410  OZIdentityTimeStrategy::~OZIdentityTimeStrategy()  (D0, deleting)
   *
   * Disasm:
   *   0x62a410  push rbp / mov rbp,rsp / pop rbp
   *   0x62a415  jmp   __ZdlPv               ; @stub 0x6dfc36 → operator delete(void*)
   *
   * Tail-call to `operator delete(this)`. Because the D1 dtor body is empty,
   * D0 skips calling D1 and jumps straight to `operator delete`. TS has GC,
   * so freeing the object is not something we model here.
   */
  destroyAndDelete(): void {
    // no-op — matches semantics: D1 is empty; `operator delete` is GC's job in TS.
    // (@Ozone 0x62a415: jmp __ZdlPv @stub 0x6dfc36 — operator delete(void*))
  }
}
