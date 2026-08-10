// raw-port/src/render/HGGLContextCGL.ts
//
// FCP `HGGLContextCGL` — Helium's CGL (Apple OpenGL) implementation of the abstract
// `HGGLContext` interface. It is a thin RAII wrapper around one `CGLContextObj`: the class
// holds exactly a vtable pointer and that context handle, and every one of its methods is a
// forward to a CGL C API entry point.
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//                   Versions/A/Helium (macOS FCP, x86_64 slice; VA == offset in the thin slice).
//
// THIS FILE PORTS ONE METHOD (one C++ method = one exported entry point citing its @0xADDR):
//
//   @Helium 0x21090  HGGLContextCGL::HGGLContextCGL()      (C2 base-object ctor)
//                    mangled: __ZN14HGGLContextCGLC2Ev
//                    DECODE:  raw-port/re/disasm/Helium.__ZN14HGGLContextCGLC2Ev.s
//
//   NOTE: C1 and C2 are THE SAME ADDRESS here — `nm` lists 0x21090 twice for
//   `HGGLContextCGL::HGGLContextCGL()` (the complete-object and base-object ctors were
//   ICF-folded because the class has no virtual bases and no base-class ctor call). So this
//   single transcription is both.
//
// The class's other members — the dtors @0x210b0 (D2) / @0x210e0 (D1) / @0x21110 (D0),
// create() @0x21150, createSingularForRegistryID @0x211a0, createSharedForRegistryID @0x213e0,
// create(HGGLContextPtr) @0x216e0, share @0x21770, context() @0x217c0, isAccelerated @0x217e0,
// getShareGroup @0x21840, setVirtualScreen @0x21850, getVirtualScreen @0x21860,
// getRegistryID @0x21880, retain @0x219b0, release @0x219d0, setCurrent() @0x219f0,
// setCurrent(HGGLContextPtr) @0x21a00, getCurrent @0x21a50, getPriority @0x21a80,
// setPriority @0x21ad0 — are NOT ported here. This file is ADD-ONLY: each lands as its own
// method when its unit is claimed.
//
// ── VTABLE ──────────────────────────────────────────────────────────────────────────────
// `vtable for HGGLContextCGL` @Helium 0xa04018; the pointer the ctor installs is the
// Itanium-ABI virtual-function payload base 0xa04028 (= vtable + 0x10, past offset-to-top and
// the RTTI slot). Derivation of the RIP-relative operand at @0x21094:
//     leaq 0x9e2f8d(%rip), %rax    with %rip = next-instruction address 0x2109b
//     0x2109b + 0x9e2f8d = 0xa04028
// and `resolve.py Helium sym 0xa04028` answers `vtable for HGGLContextCGL (+0x10)`.
// Slot map (army/tools/vtable.py Helium HGGLContextCGL), recorded here as the decode
// reference for the methods that land later:
//     *0x00 -> 0x210e0  ~HGGLContextCGL (D1)      *0x58 -> 0x21850  setVirtualScreen(int)
//     *0x08 -> 0x21110  ~HGGLContextCGL (D0)      *0x60 -> 0x21860  getVirtualScreen() const
//     *0x10 -> 0x21150  create()                  *0x68 -> 0x21880  getRegistryID() const
//     *0x18 -> 0x216e0  create(HGGLContextPtr)    *0x70 -> 0x219b0  retain()
//     *0x20 -> 0x21770  share(HGGLContextPtr)     *0x78 -> 0x219d0  release()
//     *0x28 -> 0x217c0  context()                 *0x80 -> 0x219f0  setCurrent()
//     *0x30 -> 0x217e0  isAccelerated() const     *0x88 -> 0x21a80  getPriority()
//     *0x50 -> 0x21840  getShareGroup() const     *0x90 -> 0x21ad0  setPriority(Priority)
// (The dtor at *0x00 is the class's own D1, and the ctor calls NO base-class constructor —
//  the abstract base `HGGLContext` contributes only the vptr slot, no data.)
//
// ── FIELD LAYOUT ────────────────────────────────────────────────────────────────────────
//   +0x00  void*         __vptr        — installed = 0xa04028 (ctor @0x21094..0x2109b).
//   +0x08  CGLContextObj cglContext    — the Apple CGL context handle. Zeroed by the ctor
//                                        (`movq $0x0, 0x8(%rdi)` @0x2109e). Corroborated by
//                                        every sibling method that touches the slot:
//             ~HGGLContextCGL (D2) @0x210be reads `0x8(%rdi)` and, when non-null, passes it
//                 straight to `_CGLReleaseContext` @0x210c7 — so the slot OWNS a CGL context.
//             create() @0x2118e writes the `_CGLCreateContext` out-parameter into `0x8(%rbx)`.
//             getVirtualScreen() @0x21868 passes `0x8(%rdi)` to `_CGLGetVirtualScreen`.
//             getRegistryID() @0x2188e passes `0x8(%rdi)` to `_CGLGetPixelFormat`.
//             context() @0x217c9 wraps `0x8(%rsi)` in an HGGLContextPtr.
//   sizeof(HGGLContextCGL) = 0x10 (two 8-byte words; the ctor initializes both and no member
//   function ever addresses past +0x8).
//
// NUMERICS: none — the ctor performs no arithmetic, only two pointer-sized stores.

/**
 * `CGLContextObj` — an Apple OpenGL (CGL) context handle. Out-of-scope extern: it is an opaque
 * pointer created by `_CGLCreateContext` (called from HGGLContextCGL::create @Helium 0x21181)
 * and destroyed by `_CGLReleaseContext` (called from ~HGGLContextCGL @Helium 0x210c7). This
 * port never dereferences it; it only stores and forwards the handle, exactly as the binary does.
 */
export type CGLContextObj = { readonly __brand: "CGLContextObj" };

/**
 * The `vtable for HGGLContextCGL` payload pointer that the constructor installs at +0x00.
 *
 * @provenance Helium @0x21094 `leaq 0x9e2f8d(%rip), %rax` with %rip = 0x2109b
 *             => 0x2109b + 0x9e2f8d = 0xa04028, resolved by
 *             `resolve.py Helium sym 0xa04028` to `vtable for HGGLContextCGL (+0x10)`
 *             (the class's vtable symbol itself is @Helium 0xa04018).
 */
export const kHGGLContextCGLVTablePtr = 0xa04028;

/**
 * `HGGLContextCGL` — CGL-backed HGGLContext.
 *
 * Only the constructor is transcribed in this unit; the field set is therefore exactly the two
 * words the constructor writes (see the layout block above).
 */
export class HGGLContextCGL {
  /**
   * @+0x00 — `__vptr`. Installed with the HGGLContextCGL vtable payload base 0xa04028 by the
   * ctor @0x21094..0x2109b. Held as the numeric address so that a later port of the dtor
   * (which RE-installs the very same pointer @0x210b4..0x210bb before releasing the context)
   * can be transcribed literally.
   */
  vptr: number = kHGGLContextCGLVTablePtr;

  /**
   * @+0x08 — `CGLContextObj cglContext`. Null after construction
   * (`movq $0x0, 0x8(%rdi)` @0x2109e); populated later by create() @0x2118e.
   */
  cglContext: CGLContextObj | null = null;

  /**
   * `HGGLContextCGL::HGGLContextCGL()` @Helium 0x21090
   * (mangled `__ZN14HGGLContextCGLC2Ev`; C1 is ICF-folded onto the same address).
   *
   * Full body — every instruction of the function, in order
   * (raw-port/re/disasm/Helium.__ZN14HGGLContextCGLC2Ev.s):
   *
   *   0x21090  pushq %rbp                    ; frame setup (no TS counterpart)
   *   0x21091  movq  %rsp, %rbp              ; frame setup (no TS counterpart)
   *   0x21094  leaq  0x9e2f8d(%rip), %rax    ; rax = 0xa04028 = &vtable[HGGLContextCGL]+0x10
   *   0x2109b  movq  %rax, (%rdi)            ; this->__vptr = that pointer
   *   0x2109e  movq  $0x0, 0x8(%rdi)         ; this->cglContext = nullptr
   *   0x210a6  popq  %rbp                    ; frame teardown (no TS counterpart)
   *   0x210a7  retq
   *   0x210a8  nopl  (%rax,%rax)             ; alignment padding, not executed
   *
   * There is NO base-class constructor call (the abstract `HGGLContext` adds no data), NO
   * allocation, and NO CGL call — construction leaves the object holding a null context, and
   * it is `create()` @0x21150 (or the createFor…RegistryID factories) that later fills +0x8.
   */
  constructor() {
    // @Helium 0x21094 + 0x2109b: leaq 0x9e2f8d(%rip),%rax ; movq %rax,(%rdi)
    this.vptr = kHGGLContextCGLVTablePtr;
    // @Helium 0x2109e: movq $0x0, 0x8(%rdi)
    this.cglContext = null;
  }
}
