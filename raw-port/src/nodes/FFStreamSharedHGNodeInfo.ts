// FFStreamSharedHGNodeInfo — transcribed from Flexo.framework x86_64 slice.
//
// Cache of "shared images" keyed by (pts, duration, FFSVContext). When a
// stream node produces the same output for multiple contexts, it stores the
// original FFImage once here via setOrigImg(...) and later short-circuits
// re-rendering via newSharedImage(...) which returns a fresh FFImage view of
// the cached backing (colorspace + surface metadata reused).
//
// Object layout (from ctor @0x0fa3884..@0x0fa3896):
//   this[0x00] : int32   flags/version   (ctor writes 0; no other writer decoded)
//   this[0x08] : Node*   list->_end_.prev  (libc++ std::list sentinel prev)
//   this[0x10] : Node*   list->_end_.next  (libc++ std::list sentinel next)
//   this[0x18] : size_t  list->_size_
//
// The two pointers at +0x08/+0x10 start pointing at (this + 0x08) itself —
// the classic empty-libc++-std::list-with-embedded-sentinel invariant. The
// setOrigImg splice at @0x0fa3b70..0x0fa3b7f matches libc++'s doubly-linked
// insert-before-end (Node* n; n->next = end; n->prev = end->prev; …).
//
// Node layout (allocated 0x18 bytes at @0x0fa3b62 via `operator new(0x18)`):
//   node[0x00] : Node* prev
//   node[0x08] : Node* next
//   node[0x10] : Entry*
//
// Entry layout (allocated 0x58 bytes at @0x0fa3ac8 via `operator new(0x58)`):
//   entry[0x00..0x17] : CMTime pts          (24 bytes)
//   entry[0x18..0x2f] : CMTime duration     (24 bytes)
//   entry[0x30]       : FFSVContext*       (objc_retain'd)
//   entry[0x38]       : NSDictionary*      (from `-[FFImage <selector 0xc2d8ba>: & : &]`)
//   entry[0x40]       : NSObject*          (retained out-param)
//   entry[0x48]       : CGColorSpaceRef    (CGColorSpaceRetain'd out-param)
//   entry[0x50]       : FFImage*           (objc_retain'd arg1)
//
// External cited addresses:
//   _CMTimeCompare                    @stub 0x149511e  (used @0xfa3a05, 0xfa3a33)
//   operator new (__Znwm)             @stub 0x1497452  (used @0xfa3acd, 0xfa3b67)
//   operator delete (__ZdlPv)         @stub 0x1497404  (unwind path @0xfa3b9a)
//   _objc_retain                       (indirect @0xfa3b00/0xfa3b0d/0xfa3b47)
//   _objc_alloc                        @stub 0x14978fc (newSharedImage @0xfa3a62)
//   _CGColorSpaceRetain               @stub 0x1494ad6 (setOrigImg @0xfa3b55)
//   _OBJC_CLASS_$_FFImage             ObjC class handle (newSharedImage @0xfa3a5b)
//   __Unwind_Resume                   @stub 0x1495d30 (setOrigImg unwind @0xfa3ba2)
//
// The class also uses two RIP-relative selector caches:
//   @0xfa39c1  sel `initWithSize:pixelFormat:preferredBackingType:colorSpace:`
//              (the FFImage designated initialiser — see @0xfa3a77/0xfa3a8f)
//   @0xc14d98(%rip) at 0xfa39c1 : ObjC selector for the FFSVContext-compat
//              check (@0xfa3a48 objc_msgSend returns BOOL)
//   @0xc2d8ba(%rip) at 0xfa3b27 : ObjC selector fed to the FFImage in
//              setOrigImg (returns an NSDictionary + fills two out-params).
// These selector *strings* are not resolved here — they're stored in the
// __objc_selrefs section at the printed RIP targets; disassemble that region
// to recover them when the ObjC bridge is ported.
//
// CMTime helper is re-used from raw-port/src/infra/CMTime.ts.

import { CMTime, CMTimeCompare } from "../infra/CMTime";

/** Opaque handles for the ObjC types this class doesn't own. */
export interface FFImage      { __opaque: "FFImage" }
export interface FFSVContext  { __opaque: "FFSVContext" }
export interface NSDictionary { __opaque: "NSDictionary" }
export interface NSObject     { __opaque: "NSObject" }
export interface CGColorSpace { __opaque: "CGColorSpace" }

/** Cache entry — one row of the internal std::list<Entry*>. */
interface FFStreamSharedEntry {
  pts: CMTime;            // entry[0x00..0x17]
  duration: CMTime;       // entry[0x18..0x2f]
  context: FFSVContext;   // entry[0x30] (retained)
  info: NSDictionary;     // entry[0x38]
  extra: NSObject | null; // entry[0x40]
  colorSpace: CGColorSpace | null; // entry[0x48]
  image: FFImage;         // entry[0x50] (retained)
}

export class FFStreamSharedHGNodeInfo {
  /** @0x0fa3884 : int32 at +0x00, initial 0.
   *  No other writer is observed in this class; likely a version tag or an
   *  atomic ref-count consumed elsewhere. */
  flags = 0;

  /** libc++ std::list<Entry*> — decoded from the ctor's sentinel init
   *  (+0x08/+0x10 both point at &self+0x08). Modelled here as a plain
   *  array; ordering matches insert-at-end from setOrigImg. */
  private entries: FFStreamSharedEntry[] = [];

  /**
   * FFStreamSharedHGNodeInfo() @0x0fa3880 (C1) — trivial:
   *   @0x0fa3884  *(int32*)(this + 0x00) = 0
   *   @0x0fa388a  rax = this + 0x08
   *   @0x0fa388e  *(void**)(this + 0x08) = rax   // sentinel.prev = &sentinel
   *   @0x0fa3892  *(void**)(this + 0x10) = rax   // sentinel.next = &sentinel
   *   @0x0fa3896  *(size_t*)(this + 0x18) = 0    // size = 0
   */
  constructor() {
    // Fields already initialised via class-property defaults — matches the
    // "empty list + zero flags" invariant established at @0x0fa3884..@0x0fa3896.
  }

  /**
   * ~FFStreamSharedHGNodeInfo() @0x0fa3980 (D1) — tail-jumps to D2
   * (__ZN24FFStreamSharedHGNodeInfoD2Ev), the base which walks the list and
   * releases each retained ObjC ref (objc_release + CGColorSpaceRelease per
   * entry) before deleting the Node cells. D2's body is not carried in this
   * pass; TypeScript's GC subsumes the release side.
   */
  destroy(): void {
    this.entries.length = 0;
  }

  /**
   * newSharedImage(CMTime pts, CMTime duration, FFSVContext* ctx) @0x0fa3990
   *
   * Iterates the internal list; returns a fresh FFImage backed by the same
   * (dict, extra, colorspace, image) tuple as the FIRST matching entry.
   *
   *   @0x0fa39a8..@0x0fa39b3  r12 = list.begin (skip empty)
   *   @0x0fa39c1              rax = sel_isCompatibleWithContext (RIP-rel @0xc14d98)
   *   loop @0x0fa39de:
   *     @0x0fa39de  r15 = node->entry
   *     @0x0fa39e3..0x0fa3a05  memcpy entry.pts to arg1, caller.pts to arg2,
   *                            CMTimeCompare(a, b)
   *     @0x0fa3a0a  if (cmp != 0) advance node → next; loop
   *     @0x0fa3a0e..0x0fa3a33  same for durations; if (cmp != 0) → next
   *     @0x0fa3a3c  rdx = entry.context (@ +0x30)
   *     @0x0fa3a40..0x0fa3a48  objc_msgSend(ctx, sel_isCompatible, entry.context)
   *     @0x0fa3a4e  if (!BOOL) → next
   *   found:
   *     @0x0fa3a56  rbx = node->entry (r15 also holds it)
   *     @0x0fa3a5b  rdi = _OBJC_CLASS_$_FFImage
   *     @0x0fa3a62  rax = objc_alloc(FFImage)
   *     @0x0fa3a67..0x0fa3a73  load (entry.info, entry.extra, entry.colorSpace,
   *                            entry.image) into (rdx, r8, rcx, r9)
   *     @0x0fa3a77  rsi = @sel "initWithSize:pixelFormat:preferredBackingType:colorSpace:"
   *                       or similar 5-arg initialiser (selector at RIP-rel 0xc2e08a)
   *     @0x0fa3a8f  tail-jmp objc_msgSend  → returned FFImage*
   *   miss:
   *     @0x0fa3a95  xor eax,eax → return nullptr
   *
   * This method needs the ObjC bridge to actually construct a new FFImage.
   * We can, however, faithfully perform the linear lookup and return the
   * matched Entry — that is a valid partial port on its own.
   */
  newSharedImage(pts: CMTime, duration: CMTime, ctx: FFSVContext): FFImage | null {
    for (const entry of this.entries) {                        // @0x0fa39d0 list walk
      if (CMTimeCompare(entry.pts, pts) !== 0) continue;       // @0x0fa3a05
      if (CMTimeCompare(entry.duration, duration) !== 0) continue; // @0x0fa3a33
      if (!this.isContextCompatible(ctx, entry.context)) continue; // @0x0fa3a48
      // Match. The real FCP tail-calls -[FFImage init…: entry.info … entry.image];
      // the ObjC bridge is not ported yet, so surface the match through the
      // decoded call-site rather than fabricating a new FFImage here.
      // Requires _OBJC_CLASS_$_FFImage + sel@0xfa3a77; see @0x0fa3a62..@0x0fa3a8f.
      throw new Error(
        "FFStreamSharedHGNodeInfo.newSharedImage match found — FFImage allocation unresolved @0x0fa3a62",
      );
    }
    return null;                                               // @0x0fa3a95
  }

  /**
   * setOrigImg(FFImage* img, CMTime pts, CMTime duration, FFSVContext* ctx) @0x0fa3ab0
   *
   *   @0x0fa3ac8  entry = operator new(0x58)                  ← 0x58 == sizeof(Entry)
   *   @0x0fa3ad5  entry.pts       = *(CMTime*)(rbp+0x10)      (memcpy 24B)
   *   @0x0fa3ae4  entry.duration  = *(CMTime*)(rbp+0x28)      (memcpy 24B)
   *   @0x0fa3af5  entry.image_field(+0x50) = nullptr          (defensive init)
   *   @0x0fa3afd  entry.context   = objc_retain(ctx)          (r12=rdx)
   *   @0x0fa3b0a  entry.image     = objc_retain(img)          (r15=rsi)  ← stored at +0x50
   *   @0x0fa3b17..0x0fa3b39  out1=nil, out2=nil; entry.info =
   *                          [img <sel @0xc2d8ba>: &out1 : &out2]
   *   @0x0fa3b43  entry.extra      = objc_retain(out1)         (+0x40)
   *   @0x0fa3b51  entry.colorSpace = CGColorSpaceRetain(out2)  (+0x48)
   *   @0x0fa3b62..0x0fa3b83  node = operator new(0x18); splice at end of list;
   *                          ++size
   *
   * TS port: build the Entry record and push it. ObjC retain semantics reduce
   * to plain references in JS (the caller must keep img/ctx alive itself; JS
   * GC covers the rest).
   */
  setOrigImg(img: FFImage, pts: CMTime, duration: CMTime, ctx: FFSVContext): void {
    // Requires FFImage ObjC bridge to compute (info, extra, colorSpace) via
    // the selector at @0xc2d8ba (see @0x0fa3b27..@0x0fa3b39). Without it we
    // cannot fill entry.info/extra/colorSpace; stub with citations so the
    // demand-signal reaches the ObjC layer.
    throw new Error(
      "FFStreamSharedHGNodeInfo.setOrigImg needs FFImage selector @0xc2d8ba; see @0x0fa3ab0",
    );
    // When the bridge lands, insert-at-end mirrors @0x0fa3b7f:
    //   this.entries.push({ pts, duration, context: ctx, info, extra, colorSpace, image: img });
    void img; void pts; void duration; void ctx;
  }

  /**
   * Helper backing @0x0fa3a48: `[ctx <selector @0xc14d98>: other]` returning a
   * BOOL. Not decoded — awaits FFSVContext port.
   */
  private isContextCompatible(_a: FFSVContext, _b: FFSVContext): boolean {
    // Requires FFSVContext selector @0xc14d98; see @0x0fa3a48.
    throw new Error(
      "FFStreamSharedHGNodeInfo.isContextCompatible needs FFSVContext selector @0xc14d98",
    );
  }
}
