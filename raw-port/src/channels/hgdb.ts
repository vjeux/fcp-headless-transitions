// Raw-port of the Helium `hgdb` namespace — a small set of debug helpers.
// Source binary: Helium (macOS x86_64), FCP.app bundle.
//
// Class layout: `hgdb` is not really a class — its methods are static / free
// functions inside a `hgdb::` namespace (each takes an `HGObject*` explicitly,
// not a `this` pointer). We model it as an all-static TS class for parity with
// the other ports.

// `HGObject` is the abstract base of every Helium node.  The full class isn't
// transcribed yet (only raising ctor/dtor stubs exist in
// raw-port/src/render/HGObject_stub.ts), so we use an opaque local alias here
// rather than importing a non-existent type.
export type HGObject = object;

/** Marker type for a Core Video CVPixelBuffer.  We don't (yet) port CoreVideo,
 * so this is an opaque handle returned from `hgdb.createPixelBuffer`. */
export type CVPixelBufferRef = unknown;

/** Values for `HGNodeDotGraphType` — the last arg of `writeDotGraph`.  The
 * function only forwards it to `HGNode::WriteDotGraph` (unported), so we don't
 * decode the enum here. */
export type HGNodeDotGraphType = number;

export class hgdb {
  /**
   * `hgdb::createPixelBuffer(HGObject*)` — @0x40b60.
   *
   * Control flow reconstructed from Helium.hgdb.createPixelBuffer.s:
   *   @0x40b6c: if (obj == nullptr) return nullptr;
   *   @0x40b6e-0x40b80: __dynamic_cast(obj, &typeinfo HGObject, &typeinfo HGBitmap, 0)
   *   @0x40b88: if (cast == nullptr) return nullptr;
   *   @0x40b93: (*(void(**)(HGBitmap*))(vtable[2]))(cast)   — vtable slot @+0x10;
   *             this is the standard `HGRef` retain (AddRef) prologue used by
   *             all HGObject subclasses to build a `HGRef<HGBitmap>` on the
   *             stack.
   *   @0x40ba2: HGBitmapUtils::GetCVBitmap(HGRef<HGBitmap> const&) — writes
   *             the CV-backed HGBitmap into the caller's HGRef slot.
   *   @0x40bab-0x40bb9: cvPixelBuffer = CFRetain( *(void**)( *(void**)(newBmp
   *             + 0x80) + 0x18 ) )   — reach through the HGBitmap's internal
   *             pointer table to get the CVPixelBufferRef, and retain it.
   *   @0x40bbe-0x40bd9: release both HGRefs via vtable slot @+0x18 (dtor).
   *   Returns the retained CVPixelBufferRef in %rbx (via %rax).
   *
   * None of the callees are ported yet:
   *   - __dynamic_cast (RTTI)
   *   - HGBitmapUtils::GetCVBitmap
   *   - CoreFoundation CFRetain
   *   - HGObject vtable slots (retain @+0x10, release @+0x18)
   *
   * So the whole body raises.
   */
  static createPixelBuffer(_obj: HGObject | null): CVPixelBufferRef | null {
    // @0x40b6c
    if (_obj === null) return null;
    // @0x40b80 __dynamic_cast(obj, typeinfo HGObject, typeinfo HGBitmap, 0)
    //   → HGBitmap*  (nullptr if not a bitmap)
    // @0x40b93 vtable[+0x10](bitmap)  — HGRef retain
    // @0x40ba2 HGBitmapUtils::GetCVBitmap(HGRef<HGBitmap> const&) → HGRef<HGBitmap>
    // @0x40bb9 CFRetain(bitmap->cvHandle @+0x80/+0x18)
    // @0x40bcd/@0x40bd9 vtable[+0x18](refs)  — HGRef release
    // Every callee is unported; raise until they land. @0x40b60
    throw new Error(
      "hgdb.createPixelBuffer: requires __dynamic_cast + HGBitmapUtils::GetCVBitmap + CFRetain + HGObject vtable retain/release — none ported. @0x40b60",
    );
  }

  /**
   * `hgdb::writeBitmap(HGObject*, char const*)` — @0x40c40.
   *
   * Control flow reconstructed from Helium.hgdb.writeBitmap.s:
   *   @0x40c52: if (obj == nullptr) return;
   *   @0x40c5b-0x40c6b: __dynamic_cast(obj, &typeinfo HGObject, &typeinfo HGBitmap, 0)
   *   @0x40c73: if (cast == nullptr) return;
   *   @0x40c82: vtable[+0x10](bitmap)  — HGRef retain (into stack HGRef -0x28)
   *   @0x40c8c-0x40cf8: build a std::string from the C-string `filename`
   *             (SSO if strlen<=22, heap alloc via __Znwm if larger). This is
   *             a verbatim libc++ small-string-optimization inline expansion;
   *             the length-check `cmpq $-0x9, %rax` @0x40c91 traps
   *             SIZE_MAX-8 overflow via `basic_string::__throw_length_error`.
   *   @0x40d09: HGBitmapUtils::WriteTIFF(
   *               HGRef<HGBitmap> const&,
   *               std::string const&,
   *               CGColorSpace* colorSpace = nullptr,
   *               HGBitmapUtils::FlipType flip = 0,
   *               bool premult = true)
   *   @0x40d14-0x40d1e: free the string heap buf if `long-mode` bit set.
   *   @0x40d23-0x40d2f: release the HGRef via vtable[+0x18].
   *
   * All callees are unported (dynamic_cast, HGBitmapUtils::WriteTIFF, libc++
   * string, HGObject vtable), so we raise.
   */
  static writeBitmap(_obj: HGObject | null, _filename: string): void {
    // @0x40c52
    if (_obj === null) return;
    // @0x40c6b __dynamic_cast → HGBitmap*
    // @0x40c82 HGRef retain (vtable +0x10)
    // @0x40c8c strlen + libc++ basic_string SSO build of `filename`
    // @0x40d09 HGBitmapUtils::WriteTIFF(bitmap, filename, /*colorSpace=*/nullptr,
    //                                  /*flip=*/0, /*premult=*/true)
    // @0x40d1e string dtor (delete[] if long-mode)
    // @0x40d2f HGRef release (vtable +0x18)
    throw new Error(
      "hgdb.writeBitmap: requires __dynamic_cast + HGBitmapUtils::WriteTIFF + HGObject vtable retain/release — none ported. @0x40c40",
    );
  }

  /**
   * `hgdb::writeDotGraph(HGObject*, char const*, int type)` — @0x40d90.
   *
   * Control flow reconstructed from Helium.hgdb.writeDotGraph.s:
   *   @0x40da4: if (obj == nullptr) return;
   *   @0x40daf-0x40dbf: __dynamic_cast(obj, &typeinfo HGObject, &typeinfo HGNode, 0)
   *   @0x40dc7: if (cast == nullptr) return;
   *             (note: unlike createPixelBuffer/writeBitmap this path does
   *              NOT retain — HGNode::WriteDotGraph is a `const` method.)
   *   @0x40dd3-0x40e43: same libc++ SSO string construction from `filename`.
   *   @0x40e52: HGNode::WriteDotGraph(
   *               std::string const&,
   *               HGNodeDotGraphType type) const   [arg2 forwarded directly]
   *   @0x40e61: string dtor (delete[] if long-mode).
   *
   * All callees are unported.
   */
  static writeDotGraph(
    _obj: HGObject | null,
    _filename: string,
    _type: HGNodeDotGraphType,
  ): void {
    // @0x40da4
    if (_obj === null) return;
    // @0x40dbf __dynamic_cast → HGNode*
    // @0x40dd3 strlen + libc++ basic_string SSO build of `filename`
    // @0x40e52 HGNode::WriteDotGraph(filename, type)   [const method]
    // @0x40e61 string dtor
    throw new Error(
      "hgdb.writeDotGraph: requires __dynamic_cast + HGNode::WriteDotGraph — none ported. @0x40d90",
    );
  }

  /**
   * `hgdb::canPrint(HGObject*)` — @0x40ea0.
   *
   * Body decoded verbatim (5 insns):
   *   pushq %rbp; movq %rsp, %rbp; movb $0x1, %al; popq %rbp; retq
   *
   * i.e. `return true;` unconditionally — the HGObject* arg is ignored.
   */
  static canPrint(_obj: HGObject | null): boolean {
    // @0x40ea4: movb $0x1, %al  — return true regardless of `obj`.
    return true;
  }

  /**
   * `hgdb::print(HGObject*)` — @0x40eb0.
   *
   * Control flow reconstructed from Helium.hgdb.print.s:
   *   @0x40ebe: if (obj == nullptr) return;
   *   @0x40ec7-0x40ece: (*(void(**)(HGObject*, std::string*))(obj->vtable+0x20))
   *             (obj, &tmp)   — vtable slot @+0x20 is HGObject's virtual
   *             `getPrintString(std::string& out)` (returns a std::string by
   *             out-param in libc++ SSO layout: tmp @[-0x30..-0x21] on stack).
   *   @0x40ed1-0x40ee6: unpack the SSO representation — if long-mode
   *             (low bit of size@-0x30 set), (ptr,size) come from
   *             (-0x20, -0x28); else short-mode, size = size>>1 and ptr =
   *             &tmp+1 (@-0x2f).
   *   @0x40ef1: std::__1::__put_character_sequence(std::cout, ptr, size)
   *             — writes the string to stdout.
   *   @0x40ef6-0x40f3d: reproduce `std::endl` inline:
   *             (a) fetch cout's locale via ios_base::getloc();
   *             (b) locale.use_facet(std::ctype<char>::id);
   *             (c) ctype.widen('\n')   — vtable slot @+0x38;
   *             (d) locale dtor;
   *             (e) cout.put(widenedNewline);
   *             (f) cout.flush();
   *   @0x40f4a-0x40f54: if the tmp string was long-mode, delete[] its buf.
   *
   * All of libc++ iostream is unported, so we raise here even though the
   * intent (dbg-log obj->name to stdout) is clear.
   */
  static print(_obj: HGObject | null): void {
    // @0x40ebe
    if (_obj === null) return;
    // @0x40ece vtable[+0x20](obj, &tmpString)  — HGObject::getPrintString
    // @0x40ed1 unpack libc++ SSO string
    // @0x40ef1 std::cout << tmpString
    // @0x40f07-0x40f3d std::endl inline: locale + ctype<char>.widen('\n') + put + flush
    // @0x40f54 string dtor (delete[] if long-mode)
    throw new Error(
      "hgdb.print: requires HGObject::getPrintString vtable slot + libc++ std::cout/std::endl — none ported. @0x40eb0",
    );
  }
}
