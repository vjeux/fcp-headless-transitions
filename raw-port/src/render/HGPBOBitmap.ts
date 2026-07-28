// HGPBOBitmap.ts — Helium HGPBOBitmap: an HGBitmap-derived façade over an
// HGPixelBufferObj (GL Pixel Buffer Object). It sniffs the PBO's rect,
// format, data pointer and row-bytes at construction time and forwards
// them straight to the HGBitmap base ctor; then it overrides ReadTile to
// short-circuit when the PBO's data pointer has been unmapped, and it
// hard-disables WriteTile with a logged warning. Faithful transcription of
// x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGPBOBitmap.HGPBOBitmap.s        (C1)
//   raw-port/re/disasm/Helium.HGPBOBitmap.~HGPBOBitmap.s       (D0)
//   raw-port/re/disasm/Helium.HGPBOBitmap.ReadTile.s
//   raw-port/re/disasm/Helium.HGPBOBitmap.WriteTile.s
//
// Helium symbols transcribed:
//   @0x000a11c0  HGPBOBitmap::HGPBOBitmap(HGPixelBufferObj*)   (C2 base ctor)
//   @0x000a1260  HGPBOBitmap::HGPBOBitmap(HGPixelBufferObj*)   (C1 complete ctor)
//   @0x000a1300  HGPBOBitmap::~HGPBOBitmap()                   (D2)
//   @0x000a1340  HGPBOBitmap::~HGPBOBitmap()                   (D1)
//   @0x000a1380  HGPBOBitmap::~HGPBOBitmap()                   (D0)
//   @0x000a13c0  HGPBOBitmap::ReadTile(void* dst, HGRect r, int flags)
//   @0x000a1430  HGPBOBitmap::WriteTile(void const* src, HGRect r)
//
// Vtable install (from C1 @0x000a12b9):
//   leaq  0x96a708(%rip),%rax  -> data @0x000a12b9+7+0x96a708 = 0xa0b9c8
//   movq  %rax,(%rbx)          ; vtable @Helium 0xa0b9c8
// D0 reinstalls the same prefix @0x000a1389 (leaq 0x96a638(%rip) -> 0xa0b9c8).
//
// STRUCT LAYOUT (recovered from the ctor + accessors):
//   0x00 : void*             vtable (this-class 0xa0b9c8)             (C1 @0x000a12b9)
//   0x08..0x7f : HGBitmap-owned fields set by HGBitmap::HGBitmap(HGRect,
//                HGFormat, void*, unsigned long) @Helium @0x000a12b4.
//                Not decoded in this file; treated opaque via `super()`.
//   0x80 : HGPixelBufferObj*  pbo   (C1 stores the PBO ptr here @0x000a12c3;
//                                    D0 vcall-Releases via vtable+*0x18)
//
// Called symbols (from otool -tV comments in the disasm):
//   __ZNK16HGPixelBufferObj4rectEv    HGPixelBufferObj::rect() const     (@0x000a1277)
//   __ZNK16HGPixelBufferObj6formatEv  HGPixelBufferObj::format() const   (@0x000a1286)
//   __ZN16HGPixelBufferObj10GetDataPtrEv
//                                     HGPixelBufferObj::GetDataPtr()
//                                     (@0x000a1291 in ctor; @0x000a13e4 in ReadTile)
//   __ZNK16HGPixelBufferObj8rowBytesEv
//                                     HGPixelBufferObj::rowBytes() const (@0x000a129c)
//   __ZN8HGBitmapC2E6HGRect8HGFormatPvm
//                                     HGBitmap::HGBitmap(HGRect, HGFormat,
//                                                        void*, unsigned long)
//                                                                        (@0x000a12b4)
//   *vtable+0x10 (on the PBO)         HGPixelBufferObj::Retain()          (@0x000a12d0)
//   *vtable+0x18 (on the PBO)         HGPixelBufferObj::Release()         (@0x000a139d)
//   __ZN8HGBitmapD2Ev                 HGBitmap::~HGBitmap()               (@0x000a13a3, @0x000a12e8)
//   __ZN8HGObjectdlEPv                HGObject::operator delete(void*)     (jmp @0x000a13b1)
//   __ZN8HGBitmap8ReadTileEPv6HGRecti HGBitmap::ReadTile(void*, HGRect, int)
//                                                                        (tail-jmp @0x000a140b)
//   __ZN8HGLogger7warningEPKcz        HGLogger::warning(char const*, ...)
//                                     (tail-jmp @0x000a1427, @0x000a143e)
//   ___clang_call_terminate            (unwind fallback @0x000a13b9)
//
// String-literal RIP pool (leaq 0x83a???(%rip),%rdi):
//   @0x000a1410 ; next-instr @0x000a1417 ; +0x83aad7 = data @0x0083bee7
//     "reading tile from unmapped PBO"
//   @0x000a1434 ; next-instr @0x000a143b ; +0x83aad2 = data @0x0083bf0d
//     "writing tile into PBO bitmap -- undefined!!"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HGObject as _HGObject } from "./HGObject";
import type { HGRect } from "./HGRect";

// ---------------------------------------------------------------------------
// Frontier types
// ---------------------------------------------------------------------------

/** HGFormat — pixel-format enum returned by HGPixelBufferObj::format(). */
export type HGFormat = number;

/** HGPixelBufferObj — underlying GL PBO wrapper. All fields are frontier
 *  throw-stubs citing the call-site addr. */
export interface HGPixelBufferObj {
  /** __ZNK16HGPixelBufferObj4rectEv @Helium — called @0x000a1277. */
  rect(): HGRect;
  /** __ZNK16HGPixelBufferObj6formatEv @Helium — called @0x000a1286. */
  format(): HGFormat;
  /** __ZN16HGPixelBufferObj10GetDataPtrEv @Helium — called @0x000a1291 & @0x000a13e4. */
  GetDataPtr(): unknown | null;
  /** __ZNK16HGPixelBufferObj8rowBytesEv @Helium — called @0x000a129c. */
  rowBytes(): number;
  /** *vtable+0x10 — HGPixelBufferObj::Retain() @Helium (@0x000a12d0). */
  Retain?(): void;
  /** *vtable+0x18 — HGPixelBufferObj::Release() @Helium (@0x000a139d). */
  Release?(): void;
}

/** HGBitmap — Helium base class for tile-addressable pixel bitmaps.
 *  Referenced only via its ctor / dtor / ReadTile from this file; each is a
 *  frontier throw-stub. */
export class HGBitmap {
  /** HGBitmap::HGBitmap(HGRect,HGFormat,void*,unsigned long) @Helium
   *  (__ZN8HGBitmapC2E6HGRect8HGFormatPvm; called @0x000a12b4). Frontier. */
  constructor(
    _rect: HGRect,
    _format: HGFormat,
    _dataPtr: unknown | null,
    _rowBytes: number
  ) {
    throw new Error(
      "HGBitmap::HGBitmap(HGRect,HGFormat,void*,ulong) @Helium (frontier) " +
        "— __ZN8HGBitmapC2E6HGRect8HGFormatPvm; called from HGPBOBitmap::HGPBOBitmap @0x000a12b4"
    );
  }

  /** HGBitmap::ReadTile(void*, HGRect, int) @Helium
   *  (__ZN8HGBitmap8ReadTileEPv6HGRecti) — tail-jmp target @0x000a140b. Frontier. */
  ReadTile(_dst: unknown, _rect: HGRect, _flags: number): number {
    throw new Error(
      "HGBitmap::ReadTile(void*,HGRect,int) @Helium (frontier) " +
        "— __ZN8HGBitmap8ReadTileEPv6HGRecti; tail-jmp target from HGPBOBitmap::ReadTile @0x000a140b"
    );
  }

  /** HGBitmap::~HGBitmap() @Helium (__ZN8HGBitmapD2Ev) — called from
   *  HGPBOBitmap::~HGPBOBitmap @0x000a13a3 (and the ctor unwind pad @0x000a12e8). Frontier. */
  destruct(): void {
    throw new Error(
      "HGBitmap::~HGBitmap() @Helium (frontier) " +
        "— __ZN8HGBitmapD2Ev; called from HGPBOBitmap::~HGPBOBitmap @0x000a13a3"
    );
  }
}

/** HGLogger — Helium's variadic warning printer. Frontier. */
export const HGLogger = {
  /** HGLogger::warning(char const*, ...) @Helium (__ZN8HGLogger7warningEPKcz).
   *  Tail-jmp'd from HGPBOBitmap::ReadTile @0x000a1427 and HGPBOBitmap::WriteTile
   *  @0x000a143e. Its int-return value becomes the caller's return; %al=0
   *  (varargs XMM count) at both call sites. Frontier. */
  warning(_fmt: string): number {
    throw new Error(
      "HGLogger::warning(char const*, ...) @Helium (frontier) " +
        "— __ZN8HGLogger7warningEPKcz; tail-jmp'd from @0x000a1427 & @0x000a143e"
    );
  },
};

/**
 * HGPBOBitmap — an HGBitmap that wraps an HGPixelBufferObj.
 * Vtable @Helium 0xa0b9c8 (installed at +0x00; C1 @0x000a12b9, D0 @0x000a1389).
 */
export class HGPBOBitmap extends HGBitmap {
  /** +0x80 — the underlying PBO (retained in ctor, released in dtor). */
  pbo!: HGPixelBufferObj;

  /**
   * HGPBOBitmap::HGPBOBitmap(HGPixelBufferObj*) @Helium @0x000a11c0 (C2) /
   *   @0x000a1260 (C1).
   *
   * C1 body @0x000a1260..@0x000a12e1:
   *   rectVal   = pbo->rect();                            (@0x000a1277)
   *   formatVal = pbo->format();                          (@0x000a1286)
   *   dataPtr   = pbo->GetDataPtr();                      (@0x000a1291)
   *   rowBytes  = pbo->rowBytes();  (u32→u64 via r9d)     (@0x000a129c)
   *   HGBitmap::HGBitmap(this, rectVal, formatVal, dataPtr, rowBytes);
   *                                                       (@0x000a12b4)
   *   *(void**)this        = 0xa0b9c8;   // this-class vtable (@0x000a12b9)
   *   *(void**)(this+0x80) = pbo;                         (@0x000a12c3)
   *   pbo->Retain();       // vcall *0x10                 (@0x000a12ca..@0x000a12d0)
   *
   * On HGBitmap ctor exception, landing pad @0x000a12e2 calls HGBitmap::~HGBitmap
   * then __Unwind_Resume. In JS the base throw already unwinds `this`.
   */
  constructor(pbo: HGPixelBufferObj) {
    const rectVal = pbo.rect(); // @0x000a1277
    const formatVal = pbo.format(); // @0x000a1286
    const dataPtr = pbo.GetDataPtr(); // @0x000a1291
    const rowBytesVal = pbo.rowBytes(); // @0x000a129c (32-bit → r9d)

    // @0x000a12b4: HGBitmap::HGBitmap(HGRect, HGFormat, void*, unsigned long)
    super(rectVal, formatVal, dataPtr, rowBytesVal >>> 0);

    // @0x000a12b9: vtable install (no-op in JS).
    // @0x000a12c3: this.pbo = pbo
    this.pbo = pbo;

    // @0x000a12d0: vcall *0x10  — HGPixelBufferObj::Retain()
    if (typeof this.pbo.Retain === "function") {
      this.pbo.Retain();
    } else {
      throw new Error(
        "HGPixelBufferObj::Retain() (vtable *0x10) @Helium (frontier) " +
          "— called from HGPBOBitmap::HGPBOBitmap @0x000a12d0"
      );
    }
  }

  /**
   * HGPBOBitmap::ReadTile(void* dst, HGRect r, int flags) @Helium @0x000a13c0.
   *
   * Body:
   *   if (this->pbo->GetDataPtr() == 0)                    (@0x000a13dd..@0x000a13ec)
   *     return HGLogger::warning("reading tile from unmapped PBO");
   *                                                        (@0x000a1410..@0x000a1427)
   *   else
   *     return HGBitmap::ReadTile(this, dst, r, flags);   (tail-jmp @0x000a140b)
   */
  ReadTile(dst: unknown, rect: HGRect, flags: number): number {
    // @0x000a13dd..@0x000a13e4: this.pbo.GetDataPtr()
    const dp = this.pbo.GetDataPtr();
    // @0x000a13e9..@0x000a13ec: testq %rax,%rax ; je 0xa1410
    if (dp === null || dp === undefined) {
      // @0x000a1410..@0x000a1427: warning + tail-jmp
      return HGLogger.warning("reading tile from unmapped PBO");
    }
    // @0x000a13ee..@0x000a140b: register shuffle + tail-jmp to base
    return super.ReadTile(dst, rect, flags);
  }

  /**
   * HGPBOBitmap::WriteTile(void const* src, HGRect r) @Helium @0x000a1430.
   *
   * Body (unconditional warning, no write is performed):
   *   return HGLogger::warning("writing tile into PBO bitmap -- undefined!!");
   *                                                        (@0x000a1434..@0x000a143e)
   */
  WriteTile(_src: unknown, _rect: HGRect): number {
    // @0x000a1434 leaq str,%rdi ; @0x000a143b xor %eax,%eax ; jmp warning
    return HGLogger.warning("writing tile into PBO bitmap -- undefined!!");
  }

  /**
   * HGPBOBitmap::~HGPBOBitmap() @Helium @0x000a1380 (D0), @0x000a1340 (D1),
   * @0x000a1300 (D2).
   *
   * D0 body @0x000a1380..@0x000a13b1:
   *   *(void**)this = 0xa0b9c8               // reinstall vtable (@0x000a1389)
   *   this->pbo->Release()                    // vcall *0x18       (@0x000a139d)
   *   HGBitmap::~HGBitmap(this)                                     (@0x000a13a3)
   *   HGObject::operator delete(this)          // tail-jmp          (@0x000a13b1)
   *
   * D1/D2 (@0x000a1300, @0x000a1340) omit the final `operator delete`.
   * We collapse to a single JS `destruct()`; JS GC handles the delete.
   */
  destruct(): void {
    // @0x000a1389: vtable reinstall — JS no-op.
    // @0x000a1393..@0x000a139d: this.pbo->Release()
    if (this.pbo) {
      if (typeof this.pbo.Release === "function") {
        this.pbo.Release();
      } else {
        throw new Error(
          "HGPixelBufferObj::Release() (vtable *0x18) @Helium (frontier) " +
            "— called from HGPBOBitmap::~HGPBOBitmap @0x000a139d"
        );
      }
    }
    // @0x000a13a3: HGBitmap::~HGBitmap(this)
    super.destruct();
    // @0x000a13b1: jmp HGObject::operator delete(void*) — JS GC.
    this.pbo = null as unknown as HGPixelBufferObj;
  }
}
