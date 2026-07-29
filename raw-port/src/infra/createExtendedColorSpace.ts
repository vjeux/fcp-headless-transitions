// createExtendedColorSpace.ts — ProCore file-local free function:
//   createExtendedColorSpace(CGColorSpace*)   @ProCore 0x20581
//   __ZL24createExtendedColorSpaceP12CGColorSpace  (`__ZL` = internal-linkage/anonymous-ns)
// Transcribed from otool -tV disasm at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// See raw-port/re/disasm/ProCore.__ZL24createExtendedColorSpaceP12CGColorSpace.s.
//
// ROLE. Given an arbitrary CGColorSpace*, return an "extended-range" variant of it. Three
// distinct paths, chosen in order:
//
//   1. If `CGColorSpaceUsesExtendedRange(cs)` is already true, retain and return `cs` unchanged.
//   2. Otherwise, compare `CFHash(cs)` against `CFHash(deviceRGB)` — a Meyers-singleton
//      DeviceRGB space initialised on first call via __cxa_guard_acquire/release. On hash-equal
//      (i.e. the caller passed the DeviceRGB space), return
//      `CGColorSpaceCreateWithName(kCGColorSpaceExtendedSRGB)`.
//   3. Otherwise call `CGColorSpaceCreateExtended(cs)`. If it succeeds (non-null), return it.
//      If it fails (null), fall back to `CGColorSpaceRetain(cs)`.
//
// This is the pixel-format "widen to a P3/xxx-Extended variant for HDR-safe compositing" helper
// PCColorSpace path uses on macOS. Every callee is a CoreGraphics/CoreFoundation extern from
// __TEXT.__stubs — modelled as boundary functions (JS has no CoreFoundation lifecycle; retain/
// release are no-ops elsewhere in the port, see PCColorSpaceHandle.PCCFRefTraits_CGColorSpace_release).
//
// x86_64 CONTROL FLOW (VAs in ProCore.framework):
//
//   0x20581  pushq %rbp
//   0x20582  movq  %rsp, %rbp
//   0x20585  pushq %r14
//   0x20587  pushq %rbx
//   0x20588  movq  %rdi, %rbx                     ; rbx = arg cs
//   0x2058b  callq _CGColorSpaceUsesExtendedRange ; stub @0xde1f2
//   0x20590  testb %al, %al
//   0x20592  je    0x205a0                        ; !al -> non-extended path
//   0x20594  movq  %rbx, %rdi                     ; extended path: tail-jmp CGColorSpaceRetain(cs)
//   0x20597  popq  %rbx
//   0x20598  popq  %r14
//   0x2059a  popq  %rbp
//   0x2059b  jmp   _CGColorSpaceRetain             ; stub @0xde1ec (tail call)
//
// [non-extended path — Meyers-singleton deviceRGB init & CFHash compare]
//   0x205a0  movb  __ZGVZL24...E9deviceRGB(%rip), %al   ; guard variable byte
//   0x205a6  testb %al, %al
//   0x205a8  je    0x205eb                         ; guard==0 -> acquire slow path
//   0x205aa  movq  __ZZL24...E9deviceRGB(%rip), %rdi    ; rdi = deviceRGB singleton
//   0x205b1  callq _CFHash                         ; stub @0xddfd6
//   0x205b6  movq  %rax, %r14                      ; r14 = h(deviceRGB)
//   0x205b9  movq  %rbx, %rdi
//   0x205bc  callq _CFHash                         ; rax = h(cs)
//   0x205c1  cmpq  %rax, %r14                      ; AT&T: r14 - rax  (dst - src)
//   0x205c4  jne   0x205d9                         ; !=  -> Extended-from-arbitrary path
//   0x205c6  movq  0x127643(%rip), %rax            ; &_kCGColorSpaceExtendedSRGB GOT slot
//   0x205cd  movq  (%rax), %rdi                    ; deref -> CFStringRef value
//   0x205d0  popq  %rbx
//   0x205d1  popq  %r14
//   0x205d3  popq  %rbp
//   0x205d4  jmp   _CGColorSpaceCreateWithName     ; stub @0xde1c2 (tail call, returns to caller)
//
// [arbitrary-CS Extended path]
//   0x205d9  movq  %rbx, %rdi
//   0x205dc  callq _CGColorSpaceCreateExtended     ; stub @0xde1aa
//   0x205e1  testq %rax, %rax
//   0x205e4  je    0x20594                         ; null -> back to CGColorSpaceRetain(cs)
//   0x205e6  popq  %rbx
//   0x205e7  popq  %r14
//   0x205e9  popq  %rbp
//   0x205ea  retq                                  ; return rax (the new CGColorSpace*)
//
// [__cxa_guard slow-init of the deviceRGB singleton]
//   0x205eb  leaq  __ZGVZL24...E9deviceRGB(%rip), %rdi   ; &guard byte
//   0x205f2  callq ___cxa_guard_acquire            ; stub @0xde708
//   0x205f7  testl %eax, %eax
//   0x205f9  je    0x205aa                         ; someone else won the race -> reuse
//   0x205fb  callq _CGColorSpaceCreateDeviceRGB    ; stub @0xde1a4
//   0x20600  movq  %rax, __ZZL24...E9deviceRGB(%rip)     ; store singleton
//   0x20607  leaq  __ZGVZL24...E9deviceRGB(%rip), %rdi
//   0x2060e  callq ___cxa_guard_release            ; stub @0xde70e
//   0x20613  jmp   0x205aa
//   0x20615  movq  %rax, %rbx                      ; landing pad — exception
//   0x20618  leaq  __ZGVZL24...E9deviceRGB(%rip), %rdi
//   0x2061f  callq ___cxa_guard_abort              ; stub @0xde702
//   0x20624  movq  %rbx, %rdi
//   0x20627  callq __Unwind_Resume                 ; stub @0xde50a
//
// AT&T note: `cmpq %rax, %r14 ; jne` reads as `r14 - rax`, so `jne` == "hashes differ". If equal,
// fall through to the ExtendedSRGB branch. Matches PORTING_SPEC.md §Rule 4 cheat-sheet.

import type {CGColorSpaceRef} from "./PCColor";

/**
 * kCGColorSpaceExtendedSRGB — CoreGraphics extern imported from the CoreGraphics dylib
 * (read via `movq 0x127643(%rip), %rax; movq (%rax), %rdi` @ProCore 0x205c6/0x205cd). Opaque
 * CFStringRef pointer in the real binary; modelled here as a branded singleton because JS has
 * no CoreFoundation type identity to preserve. Only its identity as an argument to
 * CGColorSpaceCreateWithName is observed by the port.
 */
export type CGColorSpaceName = {
  readonly __brand: "CGColorSpaceName";
  readonly name: string;
};

export const kCGColorSpaceExtendedSRGB: CGColorSpaceName =
  Object.freeze({__brand: "CGColorSpaceName", name: "ExtendedSRGB"}) as CGColorSpaceName;

// ── CoreGraphics/CoreFoundation boundary stubs ─────────────────────────────────────────────
// All four externs are __TEXT.__stubs jumps in ProCore into the CoreGraphics dylib and the
// CoreFoundation _CFHash. They live outside the 5-framework port scope so we throw with the
// exact stub address — a real host embedder would wire these to the OS APIs.

/**
 * _CGColorSpaceUsesExtendedRange @ProCore stub 0xde1f2 (CoreGraphics extern).
 * Returns a `Boolean` (0/1) indicating whether the given CGColorSpace has an extended-range
 * (super-1.0) domain. Out-of-scope OS API — throws in the pure TS port so callers can wire it.
 */
export function CGColorSpaceUsesExtendedRange(cs: CGColorSpaceRef | null): boolean {
  // @0xde1f2 — CoreGraphics symbol stub; not part of the FCP port surface.
  void cs;
  throw new Error("CGColorSpaceUsesExtendedRange @0xde1f2 (CoreGraphics extern) not yet transcribed");
}

/**
 * _CGColorSpaceRetain @ProCore stub 0xde1ec (CoreFoundation-style retain). No-op in JS by
 * the same policy as PCCFRefTraits<CGColorSpace*>::release in PCColorSpaceHandle.ts: JS owns
 * the reference lifetime through GC. The retained pointer that CoreGraphics returns is
 * identity-equal to the input, so returning `cs` unchanged is bit-faithful for callers that
 * only observe pointer identity.
 */
export function CGColorSpaceRetain(cs: CGColorSpaceRef | null): CGColorSpaceRef | null {
  // @0xde1ec — CoreGraphics/CoreFoundation stub. No-op retain: identity is preserved.
  return cs;
}

/**
 * _CGColorSpaceCreateDeviceRGB @ProCore stub 0xde1a4 (CoreGraphics extern).
 * Creates a fresh DeviceRGB CGColorSpace with +1 retain. Out-of-scope OS API.
 */
export function CGColorSpaceCreateDeviceRGB(): CGColorSpaceRef {
  // @0xde1a4 — CoreGraphics symbol stub; not part of the FCP port surface.
  throw new Error("CGColorSpaceCreateDeviceRGB @0xde1a4 (CoreGraphics extern) not yet transcribed");
}

/**
 * _CGColorSpaceCreateExtended @ProCore stub 0xde1aa (CoreGraphics extern).
 * Attempts to return an extended-range variant of the given colour space, or NULL if the
 * input has no such variant. Out-of-scope OS API.
 */
export function CGColorSpaceCreateExtended(cs: CGColorSpaceRef | null): CGColorSpaceRef | null {
  // @0xde1aa — CoreGraphics symbol stub; not part of the FCP port surface.
  void cs;
  throw new Error("CGColorSpaceCreateExtended @0xde1aa (CoreGraphics extern) not yet transcribed");
}

/**
 * _CGColorSpaceCreateWithName @ProCore stub 0xde1c2 (CoreGraphics extern).
 * Returns a colour space matching the given canonical name (e.g. kCGColorSpaceExtendedSRGB).
 * Out-of-scope OS API.
 */
export function CGColorSpaceCreateWithName(name: CGColorSpaceName): CGColorSpaceRef {
  // @0xde1c2 — CoreGraphics symbol stub; not part of the FCP port surface.
  void name;
  throw new Error("CGColorSpaceCreateWithName @0xde1c2 (CoreGraphics extern) not yet transcribed");
}

/**
 * _CFHash @ProCore stub 0xddfd6 (CoreFoundation extern).
 * Returns the CFHashCode of an arbitrary CFTypeRef. For CGColorSpace-typed CF objects the
 * hash is guaranteed stable within a process, which is why FCP uses it as an identity probe
 * against the DeviceRGB singleton. Out-of-scope OS API.
 */
export function CFHash(obj: CGColorSpaceRef | null): number {
  // @0xddfd6 — CoreFoundation symbol stub; not part of the FCP port surface.
  void obj;
  throw new Error("CFHash @0xddfd6 (CoreFoundation extern) not yet transcribed");
}

// ── Meyers-singleton deviceRGB, modelled after the __cxa_guard-protected static @ProCore ──
//    __ZZL24createExtendedColorSpaceP12CGColorSpaceE9deviceRGB     (the static itself)
//    __ZGVZL24createExtendedColorSpaceP12CGColorSpaceE9deviceRGB   (its guard byte)
// The binary lazy-inits on first call, then caches for the process lifetime. JS is single-
// threaded so the __cxa_guard_acquire/release dance is degenerate: a simple `?? =` cache.

let __deviceRGB_singleton: CGColorSpaceRef | null = null;

/**
 * Returns the lazily-initialised DeviceRGB CGColorSpace singleton — the value stored in
 *   __ZZL24createExtendedColorSpaceP12CGColorSpaceE9deviceRGB
 * behind the __cxa_guard_acquire/release pair at ProCore 0x205f2/0x2060e. The guard byte at
 * __ZGVZL24...E9deviceRGB acts as an "already initialised" flag; in JS a null-check on the
 * cache pointer suffices because the runtime provides its own initialisation ordering.
 */
function getDeviceRGB(): CGColorSpaceRef {
  // Fast path — analogous to `movb __ZGV...(%rip),%al ; testb %al,%al ; je slow` @0x205a0..a8
  if (__deviceRGB_singleton !== null) return __deviceRGB_singleton;
  // Slow path — matches 0x205eb..0x20613: acquire guard, create, store, release.
  // (JS single-threading collapses acquire/release into a straight assignment.)
  const cs = CGColorSpaceCreateDeviceRGB();  // @stub 0xde1a4
  __deviceRGB_singleton = cs;
  return cs;
}

/**
 * createExtendedColorSpace(CGColorSpace*) @ProCore 0x20581.
 *
 * Return an extended-range CGColorSpace derived from `cs`. Three paths, transcribed directly
 * from the disasm:
 *
 *   - `cs` is already extended-range        -> retain & return `cs`               (0x20594)
 *   - `cs` hashes equal to DeviceRGB         -> CGColorSpaceCreateWithName(...ExtendedSRGB)
 *                                              (0x205c6..d4 tail call)
 *   - `cs` supports an extended variant      -> CGColorSpaceCreateExtended(cs)    (0x205dc)
 *   - otherwise                              -> retain & return `cs`              (fallback)
 *
 * Every branch produces a +1-retained CGColorSpace* (retain if reusing `cs`, +1 from
 * CGColorSpaceCreate* otherwise). Callers own the resulting reference.
 *
 * NOTE: the entire body is a series of Core{Graphics,Foundation} calls — all outside the
 * 5-framework port scope. Each is modelled here as a boundary throw citing its stub @0xADDR
 * so a host embedder can wire them without patching the port.
 */
export function createExtendedColorSpace(cs: CGColorSpaceRef | null): CGColorSpaceRef | null {
  // @0x20588  movq %rdi, %rbx     ; keep original cs alive across CoreGraphics calls
  // @0x2058b  callq _CGColorSpaceUsesExtendedRange
  // @0x20590  testb %al, %al ; je 0x205a0
  if (CGColorSpaceUsesExtendedRange(cs)) {
    // @0x20594..0x2059b  tail-jmp CGColorSpaceRetain(cs)
    return CGColorSpaceRetain(cs);
  }

  // Meyers-singleton DeviceRGB init @0x205a0..0x20613 — modelled as a lazy cache.
  const deviceRGB = getDeviceRGB();

  // @0x205b1  callq _CFHash(deviceRGB)                             -> r14
  // @0x205bc  callq _CFHash(cs)                                    -> rax
  // @0x205c1  cmpq %rax, %r14 ; jne 0x205d9   (AT&T: r14 - rax; !=0 means hashes differ)
  const h_deviceRGB = CFHash(deviceRGB);
  const h_cs = CFHash(cs);
  if (h_deviceRGB === h_cs) {
    // @0x205c6..d4  tail-jmp CGColorSpaceCreateWithName(kCGColorSpaceExtendedSRGB)
    return CGColorSpaceCreateWithName(kCGColorSpaceExtendedSRGB);
  }

  // @0x205d9..dc  callq _CGColorSpaceCreateExtended(cs)
  const extended = CGColorSpaceCreateExtended(cs);
  // @0x205e1  testq %rax, %rax ; je 0x20594   (null -> fall back to retain path)
  if (extended !== null) return extended;
  // Fall back to the same retain tail from the "already extended" path @0x20594.
  return CGColorSpaceRetain(cs);
}
