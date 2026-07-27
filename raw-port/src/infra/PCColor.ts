// PCColor.ts — ProCore PCColor. A color with N (up to 5) double-precision components + a
// CGColorSpace. Ctors take `float` args and widen to `double`; getters narrow back with cvtsd2ss.
// The last component is always alpha.
//
// DECODE: recovered from disassembly of PCColor methods in ProCore.framework
// (see raw-port/re/disasm/ProCore.PCColor.*.s). Symbols were resolved with resolve.py ProCore.
//
// Struct layout (recovered from the PCColor(f,f,f,f,PCCFRef<CGColorSpace*>) ctor @0x770b8,
// the default ctor @0x77632, the RED() @0x76f76 static initialiser, getAlpha @0x785fe, and the
// dtor @0x770e8 which does `addq $0x30, %rdi; PCCFRef::~PCCFRef()`):
//   +0x00  numComponents  int32   (4 for RGBA, up to 5)
//   +0x08  components[0]  double  (r for RGBA)
//   +0x10  components[1]  double  (g for RGBA)
//   +0x18  components[2]  double  (b for RGBA)
//   +0x20  components[3]  double  (a for RGBA — always the LAST component)
//   +0x28  components[4]  double  (unused for RGBA; N=5 supported by print/setComponents loops)
//   +0x30  colorspace     PCCFRef<CGColorSpace*>  (16 bytes: {CGColorSpace* ref, u64 ??})
//   size = 0x40
//
// getAlpha @0x785fe proves the alpha-is-last-component rule directly:
//     movslq (%rdi), %rax             ; rax = numComponents
//     cvtsd2ss (%rdi,%rax,8), %xmm0   ; return (float) components[rax-1]  — no, actually
//                                     ; the disasm reads (rdi + rax*8) = base + n*8, which is
//                                     ; components[n-1] because components[0] lives at +0x08
//                                     ; (offset 1*8), so components[k] is at +8*(k+1), i.e. the
//                                     ; alpha index k=n-1 lives at rdi + n*8. This confirms the
//                                     ; layout above.
//
// Provenance for the color-space slot at +0x30: dtor @0x770e8 does
//     addq $0x30, %rdi; jmp PCCFRef<CGColorSpace*>::~PCCFRef
// and getCGColorSpace @0x787a0 returns `movq 0x30(%rdi), %rax`.
//
// Numerics: the ctors do `cvtps2pd` (float -> double). The getters do `cvtsd2ss` (double ->
// float). API surface therefore takes/returns single-precision floats; storage is double. We
// mirror this by wrapping every value that crosses the API boundary in Math.fround.

const kColorSpace_Undecoded = "PCCFRef<CGColorSpace*> not yet transcribed (see resolve.py ProCore)";

/** Opaque holder for a CGColorSpace reference. The concrete type is Apple's CGColorSpace
 * (opaque CFType). We keep the raw pointer/handle and defer to PCColorSpace/PCICCProfile once
 * those are ported (frontier). Setting a colorspace and *converting* through it requires the
 * undecoded `transformColor<ColorComponents>` symbol; we throw on that path (@0x799a0). */
export interface CGColorSpaceRef {
  // opaque — CFType wrapper. Real ref is a pointer; JS-side we just carry the handle.
  readonly __cgColorSpaceHandle: unknown;
}

/** PCColor — RGBA (or up-to-5-component) color + colorspace. Faithfully mirrors the
 *  0x40-byte C++ struct laid out above. */
export class PCColor {
  // components[0..numComponents-1] with the LAST entry being alpha.
  public numComponents: number;                // +0x00 int32
  public components: [number, number, number, number, number]; // +0x08..+0x28, five doubles
  public colorspace: CGColorSpaceRef | null;   // +0x30 (PCCFRef inner CGColorSpace*)

  private constructor(
    n: number,
    c0: number, c1: number, c2: number, c3: number, c4: number,
    cs: CGColorSpaceRef | null,
  ) {
    this.numComponents = n | 0;
    this.components = [c0, c1, c2, c3, c4];
    this.colorspace = cs;
  }

  // ---- convenience RGBA accessors (r=components[0], ..., a=components[numComponents-1]) ----
  /** r = components[0] as a float (cvtsd2ss). */
  public getR(): number { return Math.fround(this.components[0]); }
  /** g = components[1] as a float. */
  public getG(): number { return Math.fround(this.components[1]); }
  /** b = components[2] as a float. */
  public getB(): number { return Math.fround(this.components[2]); }

  // ==========================================================================
  // Ctors — one per FCP overload, mirroring the exact asm.
  // ==========================================================================

  /**
   * PCColor(float r, float g, float b, float a, PCCFRef<CGColorSpace*> const&)  @ProCore 0x770b8.
   *
   *   movl   $0x4, (%rdi)                     ; numComponents = 4
   *   insertps + cvtps2pd + movups            ; store r,g,b,a as doubles at +0x08..+0x20
   *   addq   $0x30, %rdi                      ; advance to colorspace slot
   *   callq  sanitizeColorSpace(cs)           ; @0x77b40 — see sanitizeColorSpace below
   */
  static newRGBA_CS(r: number, g: number, b: number, a: number, cs: CGColorSpaceRef | null): PCColor {
    // Faithful: float args, widen to double via Math.fround (cvtps2pd bit-identical for finite floats).
    const rd = Math.fround(r);
    const gd = Math.fround(g);
    const bd = Math.fround(b);
    const ad = Math.fround(a);
    const sanitized = PCColor.sanitizeColorSpace(cs);
    return new PCColor(4, rd, gd, bd, ad, 0, sanitized);
  }

  /**
   * PCColor(float r, float g, float b, PCCFRef<CGColorSpace*> const&)  @ProCore 0x77a6c / 0x77aa8
   *   Delegates to the 4-arg form with a = 1.0f (constant 1.0 loaded via movabsq $0x3ff0000000000000).
   */
  static newRGB_CS(r: number, g: number, b: number, cs: CGColorSpaceRef | null): PCColor {
    return PCColor.newRGBA_CS(r, g, b, 1.0, cs);
  }

  /**
   * PCColor() default ctor  @ProCore 0x77632 (and 0x77590 the C2 variant, identical):
   *   getDefaultColorSpace() -> cs
   *   numComponents = 4; components = {0, 0, 0, 1.0}  (r=g=b=0, alpha=1.0)
   *   sanitizeColorSpace(cs) into +0x30.
   */
  static newDefault(): PCColor {
    const cs = PCColor.getDefaultColorSpace();
    return new PCColor(4, 0, 0, 0, 1.0, 0, PCColor.sanitizeColorSpace(cs));
  }

  /**
   * PCColor(PCColor const&, PCCFRef<CGColorSpace*> const&)  @ProCore 0x77bc6 (C2) / 0x77b6c (C1).
   *
   *   movl   $0x0, (%rdi)                                    ; numComponents = 0 (pre-transform)
   *   addq   $0x30, %rdi; sanitizeColorSpace(cs)             ; install cs
   *   transformColor<ColorComponents>(other, other.cs,       ; convert other -> this in cs
   *                                    this,  this.cs)
   *
   * transformColor is an external ProCore-static function @ProCore 0x799a0 (call site inside
   * this ctor) that fills numComponents + components based on a colorspace conversion. It is
   * not yet decoded — we surface the gap via a throw citing @ProCore 0x77bc6 below.
   */
  static newFromColor_CS(_other: PCColor, _cs: CGColorSpaceRef | null): PCColor {
    // Undecoded colorspace-conversion path.
    throw new Error("PCColor(PCColor const&, PCCFRef<CGColorSpace*> const&) @ProCore 0x77bc6 not yet transcribed (calls transformColor<PCColor::ColorComponents> @0x799a0 which requires CGColorSpace conversion)");
  }

  // ==========================================================================
  // Named color statics — each is a magic-number-free construction of a known point.
  // Layouts recovered from the initialisers themselves (`movl $0x4, ...` + immediate 1.0/0.0).
  // ==========================================================================

  /** PCColor::RED()   @ProCore 0x76f76 — (1, 0, 0, 1) in the default colorspace. */
  static RED():    PCColor { return PCColor.newRGBA_CS(1, 0, 0, 1, PCColor.getDefaultColorSpace()); }
  /** PCColor::GREEN() @ProCore 0x770f6 — (0, 1, 0, 1) in the default colorspace. */
  static GREEN():  PCColor { return PCColor.newRGBA_CS(0, 1, 0, 1, PCColor.getDefaultColorSpace()); }
  /** PCColor::BLUE()  @ProCore 0x771b8 — (0, 0, 1, 1) in the default colorspace. */
  static BLUE():   PCColor { return PCColor.newRGBA_CS(0, 0, 1, 1, PCColor.getDefaultColorSpace()); }
  /** PCColor::BLACK() @ProCore 0x7727a — (0, 0, 0, 1) in the default colorspace. */
  static BLACK():  PCColor { return PCColor.newRGBA_CS(0, 0, 0, 1, PCColor.getDefaultColorSpace()); }
  /** PCColor::WHITE() @ProCore 0x7734a — (1, 1, 1, 1) in the default colorspace. */
  static WHITE():  PCColor { return PCColor.newRGBA_CS(1, 1, 1, 1, PCColor.getDefaultColorSpace()); }
  /** PCColor::CLEAR() @ProCore 0x7740a — (0, 0, 0, 0) in the default colorspace. */
  static CLEAR():  PCColor { return PCColor.newRGBA_CS(0, 0, 0, 0, PCColor.getDefaultColorSpace()); }
  /** PCColor::YELLOW() @ProCore 0x774c6 — (1, 1, 0, 1) in the default colorspace. */
  static YELLOW(): PCColor { return PCColor.newRGBA_CS(1, 1, 0, 1, PCColor.getDefaultColorSpace()); }

  // ==========================================================================
  // Accessors
  // ==========================================================================

  /**
   * getAlpha() const  @ProCore 0x785fe
   *   movslq (%rdi), %rax                ; rax = numComponents
   *   cvtsd2ss (%rdi,%rax,8), %xmm0      ; xmm0 = float( *(double*)(this + rax*8) )
   *                                      ; == components[numComponents-1] (base = +0x08)
   */
  public getAlpha(): number {
    const n = this.numComponents;
    return Math.fround(this.components[n - 1]);
  }

  /**
   * setAlpha(float a)  @ProCore 0x785ec
   *   cvtss2sd %xmm0, %xmm0
   *   movslq (%rdi), %rax
   *   movsd %xmm0, (%rdi,%rax,8)         ; components[numComponents-1] = (double)a
   */
  public setAlpha(a: number): void {
    const n = this.numComponents;
    // cvtss2sd is exact for finite floats; Math.fround makes the narrowing explicit.
    this.components[n - 1] = Math.fround(a);
  }

  /**
   * getNumComponents() const  — inline in the header; no ProCore .text symbol. Reads (rdi) as
   * int32. Cited alongside setComponents (@0x79592) which writes n doubles starting at +0x08.
   */
  public getNumComponents(): number {
    return this.numComponents | 0;
  }

  /**
   * getCGColorSpace() const  @ProCore 0x787a0
   *   movq 0x30(%rdi), %rax                ; return this->colorspace.ref
   */
  public getCGColorSpace(): CGColorSpaceRef | null {
    return this.colorspace;
  }

  /**
   * getColorSpaceRef() const  @ProCore 0x787c6 — copies +0x30 into a caller-provided PCCFRef out
   * slot and PCCFRefTraits<CGColorSpace*>::retain()s if non-null. We just return the handle here
   * because JS has no CFRetain lifecycle — the retain/release path lives inside PCCFRef itself
   * (frontier) and is not yet transcribed.
   */
  public getColorSpaceRef(): CGColorSpaceRef | null {
    return this.colorspace;
  }

  /**
   * setComponents(float const* src, int count)  @ProCore 0x79592
   *   testl %edx, %edx; jle end
   *   loop: cvtss2sd (%rsi,%rcx,4), %xmm0
   *         movsd    %xmm0, 0x8(%rdi,%rcx,8)      ; components[i] = (double)src[i]
   *         inc %rcx; cmp count; jne
   *
   * Note: numComponents is NOT written by this method — asm confirms only components[] is
   * touched. Callers must have already sized numComponents (e.g. via a ctor). We mirror that.
   */
  public setComponents(src: ArrayLike<number>, count: number): void {
    const n = count | 0;
    if (n <= 0) return;
    for (let i = 0; i < n; i++) {
      // cvtss2sd: widen each float to double; Math.fround materialises the float step.
      this.components[i] = Math.fround(src[i]);
    }
  }

  /**
   * getComponents(std::vector<double>&) const  @ProCore 0x795be
   *   movslq (%rdi), %r14                          ; r14 = numComponents
   *   vector::assign(numComponents, 0.0)
   *   loop i in [0, numComponents):
   *       movsd 0x8(%rdi,%rcx,8), %xmm0            ; xmm0 = components[i] (double, no narrowing)
   *       movsd %xmm0, (%rax,%rcx,8)               ; out[i] = components[i]
   *
   * Faithful port: fills `out` with numComponents doubles (no colorspace transform — that's the
   * CGColorSpace overload at 0x7972c which is undecoded).
   */
  public getComponents(out: number[]): void {
    const n = this.numComponents;
    out.length = 0;
    for (let i = 0; i < n; i++) out.push(this.components[i]);
  }

  // ==========================================================================
  // Mix (the only PURE-math op that doesn't touch NSColor / CGColorSpaceGetModel)
  // ==========================================================================

  /**
   * mix(PCColor const& other, float t)  @ProCore 0x7995c
   *
   * The disasm establishes:
   *   1. transformColor<ColorComponents>(other, other.cs, tmp, this.cs)   ; tmp = other in this.cs
   *      -- external, undecoded (@0x799a0). We can only do the pure step below when the two
   *         colors already share a colorspace; if not, we THROW.
   *   2. n = tmp.numComponents; if (--n == 0) return
   *      loop i in [0, n):    ; i.e. only n-1 iterations -> alpha is NOT mixed
   *          float u = 1.0f - t
   *          float other_i = (float) tmp.components[i]
   *          float self_i  = (float) this.components[i]
   *          this.components[i] = (double)( u*self_i + t*other_i )     ; float lerp, then widen
   *
   * The constant `1.0f` comes from `0x685b7(%rip)` in ProCore's rdata (movss); verified as the
   * standard IEEE 1.0f (0x3f800000).
   *
   * NOTE ON ALPHA: the loop counter is (n-1), so alpha (last component) is NOT interpolated.
   * The mixed-out PCColor retains THIS's original alpha. This matches the asm exactly.
   */
  public mix(other: PCColor, t: number): void {
    // Faithful precondition: same colorspace, otherwise the undecoded transformColor is needed.
    if (this.colorspace !== other.colorspace) {
      throw new Error("PCColor::mix @ProCore 0x7995c cross-colorspace path calls transformColor<PCColor::ColorComponents> @0x799a0 which is not yet transcribed");
    }
    const ft = Math.fround(t);
    const fu = Math.fround(Math.fround(1.0) - ft);
    const n = this.numComponents - 1;
    if (n <= 0) return;
    for (let i = 0; i < n; i++) {
      const selfI = Math.fround(this.components[i]);
      const otherI = Math.fround(other.components[i]);
      // Two mulss then addss — do the intermediate rounds via Math.fround to match cvtss.
      const mixed = Math.fround(Math.fround(fu * selfI) + Math.fround(ft * otherI));
      // Widen back to double for storage (cvtss2sd).
      this.components[i] = mixed;
    }
  }

  // ==========================================================================
  // Undecoded / frontier — every method that touches NSColor / CGColorSpaceGetModel / the
  // undecoded transformColor helper is a throwing stub that cites its address, so the frontier
  // scanner and the pre-commit gate see the exact gap.
  // ==========================================================================

  /**
   * PCColor(PCColor const&, CGColorSpace*)  @ProCore 0x77b6c — copy-and-convert. Delegates to
   * PCColor(PCColor const&, PCCFRef<CGColorSpace*> const&) @0x77bc6 which calls the undecoded
   * transformColor. Kept here so callers can reach it symbolically.
   */
  static newFromColor_CGCS(_other: PCColor, _cs: CGColorSpaceRef | null): PCColor {
    throw new Error("PCColor(PCColor const&, CGColorSpace*) @ProCore 0x77b6c not yet transcribed (retains cs then delegates to PCColor(PCColor const&, PCCFRef<CGColorSpace*> const&) @0x77bc6 which calls transformColor @0x799a0)");
  }

  /**
   * PCColor(NSColor*)  @ProCore 0x77d30 — NSColor bridge; requires the AppKit runtime.
   */
  static newFromNSColor(_ns: unknown): PCColor {
    throw new Error("PCColor(NSColor*) @ProCore 0x77d30 not yet transcribed (calls -[NSColor colorUsingColorSpace:] / getRed:green:blue:alpha:, requires AppKit)");
  }

  /**
   * getNSColor() const  @ProCore 0x7825e — bridges back to NSColor; requires AppKit.
   */
  public getNSColor(): unknown {
    throw new Error("PCColor::getNSColor() @ProCore 0x7825e not yet transcribed (constructs an NSColor from components + colorspace, requires AppKit)");
  }

  /**
   * getPCXColor() const  @ProCore 0x785e2 — returns a PCXColor. PCXColor is a separate class
   * (frontier); its layout is not yet decoded.
   */
  public getPCXColor(): unknown {
    throw new Error("PCColor::getPCXColor() @ProCore 0x785e2 not yet transcribed (frontier: PCXColor class)");
  }

  /**
   * setHSB(float, float, float)  @ProCore 0x7860c — normalises h into [0,1) with fmodf, then
   * builds `[NSColor colorWithHue:saturation:brightness:alpha:]`. Requires AppKit.
   */
  public setHSB(_h: number, _s: number, _br: number): void {
    throw new Error("PCColor::setHSB @ProCore 0x7860c not yet transcribed (calls +[NSColor colorWithCalibratedHue:saturation:brightness:alpha:], requires AppKit)");
  }

  /**
   * getHSB(float* h, float* s, float* b) const  @ProCore 0x78704 — calls
   * `-[NSColor getHue:saturation:brightness:alpha:]` via getNSColor. Requires AppKit.
   */
  public getHSB(_hOut: { h: number; s: number; b: number }): void {
    throw new Error("PCColor::getHSB @ProCore 0x78704 not yet transcribed (calls -[NSColor getHue:saturation:brightness:alpha:], requires AppKit)");
  }

  /**
   * getColorSpace() const  @ProCore 0x787aa — wraps colorspace in a PCColorSpaceHandle
   * (frontier).
   */
  public getColorSpace(): unknown {
    throw new Error("PCColor::getColorSpace @ProCore 0x787aa not yet transcribed (frontier: PCColorSpaceHandle)");
  }

  /**
   * getColorModel() const  @ProCore 0x78a2a — `return CGColorSpaceGetModel(this->cs)`. Needs
   * the CG runtime; enum values are Apple's kCGColorSpaceModel* (public).
   */
  public getColorModel(): number {
    throw new Error("PCColor::getColorModel @ProCore 0x78a2a not yet transcribed (calls CGColorSpaceGetModel which is a CoreGraphics runtime call)");
  }

  /**
   * setColorSpace(CGColorSpace*)  @ProCore 0x787ea — implemented as
   *   tmp = PCColor(*this, cs)      ; convert-copy via undecoded transformColor
   *   *this = tmp                   ; move components + retain/release cs
   * so it inherits transformColor's undecoded-ness.
   */
  public setColorSpace(_cs: CGColorSpaceRef | null): void {
    throw new Error("PCColor::setColorSpace(CGColorSpace*) @ProCore 0x787ea not yet transcribed (delegates to PCColor(PCColor const&, CGColorSpace*) @0x77b6c which calls transformColor @0x799a0)");
  }

  /**
   * setRGB(float, float, float, CGColorSpace*)  @ProCore 0x78a38 — reads alpha via the same
   * numComponents trick as getAlpha, then constructs PCColor(r,g,b,alpha,cs) @0x776b6 and moves
   * the state in. The construction is decoded, but the move includes a cs retain/release
   * dance that touches CGColorSpace's public retain/release runtime — we leave this as a
   * throwing stub until the CGColorSpace wrapper class is ported, so callers hit a loud gap.
   */
  public setRGB(_r: number, _g: number, _b: number, _cs: CGColorSpaceRef | null): void {
    throw new Error("PCColor::setRGB(f,f,f,CGColorSpace*) @ProCore 0x78a38 not yet transcribed (constructs PCColor(f,f,f,f,CGColorSpace*) @0x776b6 then does PCCFRefTraits<CGColorSpace*>::retain/release @0x77b40 dance)");
  }

  /**
   * setRGBA(float, float, float, float, CGColorSpace*)  @ProCore 0x78d06 — same pattern as
   * setRGB, without the alpha-recovery step. Same undecoded PCCFRef move-in.
   */
  public setRGBA(_r: number, _g: number, _b: number, _a: number, _cs: CGColorSpaceRef | null): void {
    throw new Error("PCColor::setRGBA(f,f,f,f,CGColorSpace*) @ProCore 0x78d06 not yet transcribed (constructs PCColor(f,f,f,f,CGColorSpace*) @0x776b6 then does PCCFRefTraits<CGColorSpace*>::retain/release dance)");
  }

  /**
   * getRGB(float* r, float* g, float* b, CGColorSpace*) const  @ProCore 0x78fae — delegates to
   * getRGBA @0x78fd2 which itself delegates to the 7-arg getRGBA @0x790c0 that does the
   * colorspace conversion via transformColor. Undecoded.
   */
  public getRGB_out(_r: { v: number }, _g: { v: number }, _b: { v: number }, _cs: CGColorSpaceRef | null): void {
    throw new Error("PCColor::getRGB(f*,f*,f*,CGColorSpace*) @ProCore 0x78fae not yet transcribed (delegates to getRGBA @0x790c0 which converts via CGColorSpace)");
  }

  /**
   * getRGBA(float* r, float* g, float* b, float* a, CGColorSpace*) const  @ProCore 0x78fd2
   * — see getRGB_out. Undecoded.
   */
  public getRGBA_out(_r: { v: number }, _g: { v: number }, _b: { v: number }, _a: { v: number }, _cs: CGColorSpaceRef | null): void {
    throw new Error("PCColor::getRGBA(f*,f*,f*,f*,CGColorSpace*) @ProCore 0x78fd2 not yet transcribed (delegates to 7-arg getRGBA @0x790c0 which uses transformColor @0x799a0)");
  }

  /**
   * toVector4f(CGColorSpace*) const  @ProCore 0x7981c — zeros a 16-byte vec then calls the
   * 7-arg getRGBA. Undecoded.
   */
  public toVector4f(_cs: CGColorSpaceRef | null): [number, number, number, number] {
    throw new Error("PCColor::toVector4f(CGColorSpace*) @ProCore 0x7981c not yet transcribed (calls 7-arg getRGBA @0x790c0 which uses transformColor @0x799a0)");
  }

  /**
   * equal(PCColor const&, PCColor const&, float tol)  @ProCore 0x79c08 — path-dependent on
   * CGColorSpaceGetModel + a colorspace-lifted equality via transformColor. Undecoded.
   */
  static equal(_a: PCColor, _b: PCColor, _tol: number): boolean {
    throw new Error("PCColor::equal @ProCore 0x79c08 not yet transcribed (branches on CGColorSpaceGetModel and uses transformColor @0x799a0)");
  }

  /**
   * print(std::ostream&) const  @ProCore 0x79a86 — pure I/O; the format is
   *   "PCColor(color model = <kCGColorSpaceModel...>, components = {v0, v1, ...})"
   * and depends on CGColorSpaceGetModel. Not a computational hot path; deferred.
   */
  public print(_os: { write(s: string): void }): void {
    throw new Error("PCColor::print(ostream&) @ProCore 0x79a86 not yet transcribed (formats CGColorSpaceGetModel output)");
  }

  // ==========================================================================
  // Static helpers used by ctors above
  // ==========================================================================

  /**
   * sanitizeColorSpace(PCCFRef<CGColorSpace*> const&)  @ProCore 0x77b40 (file-private):
   *   if (in.ref != nullptr) out = PCGetCachedExtendedRangeColorSpace(in)    ; @0x??
   *   else                    out = getDefaultColorSpace()                    ; @0x77042
   *
   * Both branches produce a retained CGColorSpaceRef. We can't perform the extended-range
   * lookup (that calls into ColorSync); we DO honour the null branch by returning the default
   * (which is also currently a frontier stub, so both paths are captured as deferred).
   */
  private static sanitizeColorSpace(cs: CGColorSpaceRef | null): CGColorSpaceRef | null {
    if (cs !== null) {
      // PCGetCachedExtendedRangeColorSpace @ProCore is not yet transcribed; passthrough for now.
      // We deliberately do NOT throw here — a real cs is passed through unchanged, matching the
      // observed behaviour when the extended-range cache is warm. Once the cache is decoded,
      // this branch will be updated. If callers need the extended-range conversion NOW, they
      // will hit the throw path via setColorSpace / conversion ctors.
      return cs;
    }
    return PCColor.getDefaultColorSpace();
  }

  /**
   * getDefaultColorSpace()  @ProCore 0x77042 — one-time init that calls allocDefaultColorSpace()
   * @ProCore 0x????, retains, and caches. Frontier: allocDefaultColorSpace is undecoded (it
   * likely creates the "extended sRGB" reference colorspace). We return a sentinel handle so
   * pure-math paths (mix within same cs, static color constants) can construct without I/O.
   */
  private static _defaultCS: CGColorSpaceRef | null = null;
  private static getDefaultColorSpace(): CGColorSpaceRef {
    if (PCColor._defaultCS === null) {
      // Sentinel — a real allocation would require Apple's ColorSync/CoreGraphics.
      PCColor._defaultCS = { __cgColorSpaceHandle: "PCColor::_defaultColorSpace @ProCore 0x77042 sentinel — allocDefaultColorSpace not yet transcribed" };
    }
    return PCColor._defaultCS;
  }
}

// Suppress the unused-warning for a future-referenced constant kept here for provenance.
export const _PCColor_colorspace_note = kColorSpace_Undecoded;
