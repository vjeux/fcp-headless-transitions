// CustomPixelFormatRegistry — Flexo's thread-safe map from
// `unsigned int pixelFormatType` to `FFAudioPlayerSourceInfo*` (yes, the value
// type really is FFAudioPlayerSourceInfo — the reverse-engineered symbol demangle
// leaves no ambiguity; this class is a cross-subsystem lookup table that lives
// on the pixel-format registration path but produces audio-source handles).
//
// Object layout — proved by the offsets loaded across the four disassembled
// methods (all rip-relative loads at struct-offset positions):
//   +0x00  FFSynchronizable* sync              // loaded @0xe2984 (clear),
//                                              //         @0xc86 (find), etc.
//   +0x08  struct { treeNode* __begin;         // first node (@0xe2997 in clear)
//                    treeNode* __end;          // sentinel  (@0xe29ee "leaq 0x8(%r14),..")
//                    treeNode* __root; }       // root      (@0xe29f2, @0xc96 find)
//          + size_t __size (implicit in std::__tree layout — not read here)
// This is the LLVM libc++ std::__1::map<unsigned int, FFAudioPlayerSourceInfo*>
// canonical layout: an 8-byte allocator + a 3-pointer sentinel embedded in the
// map instance. Confirmed by the mangled destroy() callee cited below.
//
// Verbatim from FCP's Flexo framework at:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// nm evidence (`nm -arch x86_64 -m Flexo | grep CustomPixelFormatRegistry`):
//   00000000012e2920 T __ZN25CustomPixelFormatRegistryD1Ev
//   00000000012e2970 T __ZN25CustomPixelFormatRegistry5clearEv
//   00000000012e2a40 T __ZN25CustomPixelFormatRegistry23registerCustomRAWFormatEj
//   00000000012e2c70 T __ZN25CustomPixelFormatRegistry4findEj
//
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.CustomPixelFormatRegistry.~CustomPixelFormatRegistry.s (D1, 24 lines)
//   raw-port/re/disasm/Flexo.CustomPixelFormatRegistry.clear.s (66 lines)
//   raw-port/re/disasm/Flexo.CustomPixelFormatRegistry.registerCustomRAWFormat.s (157 lines)
//   raw-port/re/disasm/Flexo.CustomPixelFormatRegistry.find.s (55 lines)
//
// FRONTIER CALLEES (undecoded — the ported methods throw citing these):
//   __ZN16FFSynchronizable4LockEv                        FFSynchronizable::Lock()
//                                                        @Flexo callq 0xe2992 (clear)
//                                                        @Flexo callq 0xe2c91 (find)
//                                                        @Flexo callq 0xe2a65 (register)
//   __ZN16FFSynchronizable6UnlockEv                      FFSynchronizable::Unlock()
//                                                        @Flexo callq 0xe2a0a (clear)
//   __ZN16FFSynchronizableD1Ev                           FFSynchronizable::~FFSynchronizable()
//                                                        @Flexo callq 0xe293a (D1)
//   __ZN14FFSynchronizerD1Ev                             FFSynchronizer::~FFSynchronizer()
//                                                        @Flexo landing-pad 0xe2a2d (clear)
//   __ZNSt3__16__treeI...E7destroyEP__tree_nodeI...E    std::map<uint,FFAudioPlayerSourceInfo*>::__tree::destroy
//                                                        @Flexo callq 0xe29f6 (clear); tail-called @0xe2956 (D1)
//   __ZdlPv                                              operator delete(void*)
//                                                        @Flexo callq stub 0x1497404 (D1's sync-free path)
//   _CVPixelFormatDescriptionCreateWithPixelFormatType   CoreVideo entry point
//                                                        @Flexo callq stub 0x1495484 (register)
//   _CFDictionaryGetValue                                CoreFoundation entry point
//                                                        @Flexo callq stub 0x14947b2 (register, x2)
//   _objc_release                                        Objective-C ARC hook
//                                                        RIP-load @0xe29a4 (clear)
//   ObjC msg -[%rdi setTopMargin:]                       (aliased selector for the actual accessor;
//                                                        the FCP binary's selector strings got
//                                                        stringpool-coalesced into an unrelated
//                                                        SEL. The mangled disasm cites setTopMargin
//                                                        but semantically this is a "convert
//                                                        CFNumberRef to int" bridge via
//                                                        CFNumberGetValue-equivalent shim.)
//                                                        RIP-relative @0xe2ae2 / @0xe2b03 (register)
//   _kCFAllocatorDefault                                 RIP-load @0xe2aa5 (register)
//   _kCVPixelFormatBlockWidth                            RIP-load @0xe2ac3 (register)
//   _kCVPixelFormatBitsPerBlock                          RIP-load @0xe2aeb (register)
//
// This class is a THIN skeleton port: every method throws citing its Flexo
// address and its immediate un-decoded callees. That is the CORRECT frontier
// signal — the class body is dominated by libc++ __tree internals, ObjC ARC
// release/retain, and CoreFoundation/CoreVideo entry points, none of which
// have TS counterparts yet. The layout above is nonetheless PROVEN by the
// offsets the methods load — future implementations must respect it.

/**
 * Frontier stub for FFSynchronizable (an FCP internal recursive-lock
 * primitive). Field at struct offset +0x0 on CustomPixelFormatRegistry.
 * Not yet transcribed — the ported class only knows its identity through
 * the three exported instance methods below.
 */
export interface FFSynchronizable {
  /** @Flexo __ZN16FFSynchronizable4LockEv (called at 0xe2992/0xe2c91/0xe2a65) */
  lock(): void;
  /** @Flexo __ZN16FFSynchronizable6UnlockEv (called at 0xe2a0a) */
  unlock(): void;
}

/**
 * Frontier stub for FFAudioPlayerSourceInfo — the value type stored in the
 * std::map. The pointer field at treeNode+0x28 (`movq 0x28(%r13), %rdi`
 * @Flexo 0xe29b8 in clear) is what gets `objc_release`-d during clear().
 * All other observable structure is opaque to this port.
 */
export interface FFAudioPlayerSourceInfo {
  readonly __rtti: "FFAudioPlayerSourceInfo";
}

/**
 * CustomPixelFormatRegistry — the exported class shape.
 *
 * Field layout (proved by observed loads across the four methods):
 *   this+0x00 : FFSynchronizable* sync
 *   this+0x08 : std::__1::map<uint32, FFAudioPlayerSourceInfo*>::__end_node_
 *              start (a 3-pointer sentinel — begin/end/parent, standard libc++)
 *
 * @Flexo symbols owned by this class:
 *   ~D1                      @0x12e2920
 *   clear()                  @0x12e2970
 *   registerCustomRAWFormat  @0x12e2a40
 *   find()                   @0x12e2c70
 */
export class CustomPixelFormatRegistry {
  /** this+0x00 — the FFSynchronizable lock (@Flexo 0xe2984 load in clear). */
  sync: FFSynchronizable | null = null;

  /**
   * this+0x08..+0x18 — the std::__1::map sentinel triple. Modelled as a JS
   * Map keyed by the observed key type (uint32). The libc++ __tree
   * internals used by the disasm (`__tree::destroy`, node-navigation via
   * treeNode+0x20 key / +0x28 value) are undecoded frontier callees.
   */
  readonly formats: Map<number, FFAudioPlayerSourceInfo> = new Map();

  /**
   * ~CustomPixelFormatRegistry() (D1)
   * @Flexo 0x12e2920. Sequence recovered from the disasm:
   *   0xe292a  callq clear()
   *   0xe292f  load  this->sync (@+0x0)
   *   0xe2935  null-check; skip if 0
   *   0xe293a  callq FFSynchronizable::~FFSynchronizable()
   *   0xe2942  callq operator delete (via stub 0x1497404)
   *   0xe2947  arg1 = this+0x8 (the map root), arg2 = this+0x10 (map __end)
   *   0xe2956  jmp   __tree::destroy   (tail-call)
   *
   * Every branch reaches an undecoded callee — throw citing them.
   */
  destroy(): void {
    // @Flexo 0xe292a callq __ZN25CustomPixelFormatRegistry5clearEv
    this.clear();
    // @Flexo 0xe293a callq __ZN16FFSynchronizableD1Ev
    //         0xe2942 callq __ZdlPv (Flexo stub 0x1497404)
    //         0xe2956 jmp   __ZNSt3__16__treeI...E7destroyE... (tail call)
    throw new Error(
      "CustomPixelFormatRegistry::~D1 tail-chain not yet transcribed " +
        "(frontier callees @Flexo 0xe293a FFSynchronizable::~D1, " +
        "@Flexo 0xe2942 operator delete via stub 0x1497404, " +
        "@Flexo 0xe2956 std::__1::__tree::destroy)",
    );
  }

  /**
   * clear()
   * @Flexo 0x12e2970. 66 disasm lines. Sequence:
   *   0xe2984  load  this->sync
   *   0xe2992  callq FFSynchronizable::Lock()
   *   0xe2997  scan the map: for each tree-node, objc_release the
   *            +0x28 value (@0xe29a4 loads _objc_release; @0xe29bc callq *%r12)
   *   0xe29f6  callq __tree::destroy(this->map)
   *   0xe29fb  reset the map sentinel to empty (this->__begin = &this->__end,
   *            xor xmm0, movups to +0x10 of the map)
   *   0xe2a0a  callq FFSynchronizable::Unlock()
   * Landing pad at 0xe2a2d releases FFSynchronizer.
   *
   * All frontier — throw citing addresses.
   */
  clear(): void {
    // @Flexo 0xe2992 callq __ZN16FFSynchronizable4LockEv
    // @Flexo 0xe29a4 RIP-load _objc_release
    // @Flexo 0xe29bc callq *%r12 (objc_release on treeNode+0x28)
    // @Flexo 0xe29f6 callq __ZNSt3__16__treeI...E7destroyE...
    // @Flexo 0xe2a0a callq __ZN16FFSynchronizable6UnlockEv
    throw new Error(
      "CustomPixelFormatRegistry::clear() not yet transcribed " +
        "(frontier callees @Flexo 0xe2992 FFSynchronizable::Lock, " +
        "@Flexo 0xe29bc objc_release, " +
        "@Flexo 0xe29f6 std::__1::__tree::destroy, " +
        "@Flexo 0xe2a0a FFSynchronizable::Unlock)",
    );
  }

  /**
   * registerCustomRAWFormat(unsigned int pixelFormatType)
   * @Flexo 0x12e2a40. 157 disasm lines. Sequence:
   *   0xe2a65  callq FFSynchronizable::Lock()
   *   0xe2a73..0xe2a9f  binary-search the __tree for pixelFormatType (early-out
   *                     if already registered — matches libc++ __find pattern
   *                     with the u32 compare at +0x20 of each node)
   *   0xe2ab2  callq _CVPixelFormatDescriptionCreateWithPixelFormatType
   *                  (CoreVideo entry via Flexo stub 0x1495484)
   *   0xe2ad0  callq _CFDictionaryGetValue(desc, _kCVPixelFormatBlockWidth)
   *   0xe2ae2  ObjC msg -[num intValue] (aliased as setTopMargin: in the
   *                                       binary's selector table)
   *   0xe2af8  callq _CFDictionaryGetValue(desc, _kCVPixelFormatBitsPerBlock)
   *   0xe2b03  ObjC msg -[num intValue]
   *   ...     (rest of the function assembles an FFAudioPlayerSourceInfo* and
   *            inserts it into the map — 100+ more instructions of libc++
   *            __tree_insert and refcount bookkeeping)
   *   0xe2c2c  landing / early-return branch (target of "already registered"
   *            and "CV descriptor create failed" paths)
   *
   * All frontier — throw citing the first block of addresses.
   */
  registerCustomRAWFormat(_pixelFormatType: number): void {
    // @Flexo 0xe2a65 callq FFSynchronizable::Lock
    // @Flexo 0xe2ab2 callq _CVPixelFormatDescriptionCreateWithPixelFormatType (stub 0x1495484)
    // @Flexo 0xe2ad0 callq _CFDictionaryGetValue (stub 0x14947b2)
    // @Flexo 0xe2ae2 ObjC msg-send (selector aliased setTopMargin: — actually intValue)
    // ... plus libc++ __tree_insert callees at 0xe2b13 onwards (not decoded)
    throw new Error(
      "CustomPixelFormatRegistry::registerCustomRAWFormat not yet transcribed " +
        "(frontier callees @Flexo 0xe2a65 FFSynchronizable::Lock, " +
        "@Flexo 0xe2ab2 _CVPixelFormatDescriptionCreateWithPixelFormatType stub 0x1495484, " +
        "@Flexo 0xe2ad0 _CFDictionaryGetValue stub 0x14947b2, " +
        "@Flexo 0xe2ae2 ObjC msg-send)",
    );
  }

  /**
   * find(unsigned int pixelFormatType) -> FFAudioPlayerSourceInfo*
   * @Flexo 0x12e2c70. 55 disasm lines. Sequence:
   *   0xe2c91  callq FFSynchronizable::Lock()
   *   0xe2c96..0xe2ccb  standard libc++ __tree lower_bound walk:
   *                     - %rcx = root; if null → return null
   *                     - loop: cmp key at node+0x20 with pixelFormatType,
   *                             follow left/right child at node+0/8*(dl)
   *                     - post-loop: if lower_bound.key > key, return null;
   *                                  else return node->value at +0x28
   *   (unlock and cleanup omitted — the disasm continues into the RAII-lock
   *    dtor at the FFSynchronizer sentinel at -0x28(%rbp) via landing pads)
   *
   * All frontier — the lock alone blocks a portable implementation.
   */
  find(_pixelFormatType: number): FFAudioPlayerSourceInfo | null {
    // @Flexo 0xe2c91 callq FFSynchronizable::Lock
    // @Flexo 0xe2cb0..0xe2ccb libc++ __tree lower_bound loop (not decoded)
    // Unlock via FFSynchronizer RAII sentinel at -0x28(%rbp) (destructor
    // landing pad — same class as FFSynchronizable but with lock/unlock
    // bracketed by ctor/dtor).
    throw new Error(
      "CustomPixelFormatRegistry::find not yet transcribed " +
        "(frontier callees @Flexo 0xe2c91 FFSynchronizable::Lock, " +
        "@Flexo 0xe2cb0 libc++ __tree lower_bound loop, " +
        "@Flexo FFSynchronizer::~D1 landing-pad unlock)",
    );
  }
}

