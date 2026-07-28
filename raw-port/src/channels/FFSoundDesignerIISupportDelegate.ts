// FFSoundDesignerIISupportDelegate.ts — FCP Flexo helper that owns an
// ObjC-side FFSoundDesignerIISupportResourceLoaderDelegate + a serial
// libdispatch queue for Sound Designer II resource loading. Wraps an NSURL
// argument at construction; exposes the delegate and a rewritten URL
// (scheme-swapped for AVAsset consumption).
//
// Faithfully transcribed from FCP Flexo binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly (raw-port/re/disasm/Flexo.FFSoundDesignerIISupportDelegate.*.s):
//   C2  @0xe32540  __ZN32FFSoundDesignerIISupportDelegateC2EP5NSURL
//   C1  @0xe325a0  __ZN32FFSoundDesignerIISupportDelegateC1EP5NSURL
//   D2  @0xe32600  __ZN32FFSoundDesignerIISupportDelegateD2Ev
//   D1  @0xe32630  __ZN32FFSoundDesignerIISupportDelegateD1Ev
//   urlForAVAsset            @0xe32660 __ZNK32FFSoundDesignerIISupportDelegate13urlForAVAssetEv
//   resourceLoaderDelegate   @0xe326c0 __ZNK32FFSoundDesignerIISupportDelegate22resourceLoaderDelegateEv
//
// STRUCT LAYOUT (recovered from C1/C2/D1/D2/urlForAVAsset/resourceLoaderDelegate):
//   +0x00  id delegate           // ObjC pointer to a FFSoundDesignerIISupportResourceLoaderDelegate
//                                //   Written at @0xe32572 (C2) / @0xe325d2 (C1) (`movq %rax,(%rbx)`).
//                                //   Read at @0xe32609 (D2) / @0xe32639 (D1) — passed to objc_release.
//                                //   Read at @0xe326c4 (resourceLoaderDelegate) — returned directly.
//                                //   Read at @0xe32679 (urlForAVAsset) — passed as receiver of a
//                                //     -[selector] message to fetch a related url/string.
//   +0x08  dispatch_queue_t queue // libdispatch serial queue.
//                                //   Written at @0xe32590 (C2) / @0xe325f0 (C1).
//                                //   Read at @0xe32612 (D2) / @0xe32642 (D1) — passed to dispatch_release.
//
// FRONTIER CALLEES (unresolved ObjC + libdispatch — throwing stubs below):
//   _OBJC_CLASS_$_FFSoundDesignerIISupportResourceLoaderDelegate  — ObjC class ref at
//     @0xe32553 (C2) / @0xe325b3 (C1). Not yet ported (concrete ObjC class in Flexo).
//   _objc_alloc                                                   @0x14978fc  stub
//   _objc_release                                                 @via literal 0xabb0c6 (D1) / 0xabb0f6 (D2)
//   _dispatch_queue_attr_make_with_autorelease_frequency          @0x1497680  stub
//   _dispatch_queue_create                                        @0x149768c  stub
//   _dispatch_release                                             @0x1497692  stub  (tail-jmp target)
//   _objc_msgSend  (unresolved selectors — see per-call sites below)
//   _OBJC_CLASS_$_NSURL                                           ObjC class ref at @0xe3266a
//   _objc_autorelease                                             @0x149790e  stub  (tail-jmp)
//
// SELECTORS (RIP-relative selector-ref loads — otool mislabels these all as
// "appendData:" but the actual selectors live in different __objc_selrefs
// slots; keys are the DISPLACEMENT so downstream porters can resolve each
// independently via `dyld_info -fixups`):
//   C1/C2 first msgSend  @0xe3255f (C2) / @0xe325bf (C1)  disp 0xd8a92a / 0xd8a8ca
//     — receiver = objc_alloc(FFSoundDesignerIISupportResourceLoaderDelegate),
//       argN     = the constructor's NSURL argument.
//     — Signature: `id (id, SEL, NSURL*)` — likely `-initWith<Something>URL:`, but the
//       exact selector is not decoded from the mangled name; kept opaque.
//
//   urlForAVAsset msgSend #1  @0xe3267c    disp 0xd929fd
//     — receiver = self->delegate (this->+0x00), no args, returns id.
//     — Signature: `id (id, SEL)` — a getter selector (probably one that returns an
//       NSString / NSURL derived from the loader delegate). Kept opaque.
//
//   urlForAVAsset msgSend #2  @0xe3268c    disp 0xd85e2d
//     — receiver = result-of-#1 (id), no args, returns id.
//     — Signature: `id (id, SEL)` — a chained getter. Kept opaque.
//
//   urlForAVAsset msgSend #3  @0xe32698    disp 0xdc1981
//     — receiver = objc_alloc(NSURL), args: SEL, format-CFString, 0 (nil), id from #2.
//     — The immediate `xorl %ecx,%ecx` @0xe326a9 supplies a nil argument;
//       `movq %rax,%r8` @0xe326ab passes the msg#2 result as the fourth
//       ObjC argument. There's a CFStringRef literal at @0xe3269f
//       (`leaq 0xb80c02(%rip),%rdx`) — the format string / NSURL init pattern.
//     — Signature: `id (id, SEL, CFStringRef, id, id)` — likely
//       `-initWithString:baseURL:` or a printf-style `-initWithString:...` on NSURL.
//       Kept opaque.
//
//   The %rbx spill at @0xe32683 caches the ObjC msgSend function pointer once
//   and reuses it 3× (@0xe3268a, @0xe32696, @0xe326ae) — a size-optimization
//   idiom, not a semantic difference.
//
// CFSTRING literal read at @0xe3269f — the disassembler labels it
// `@"bad cfstring ref"` (a placeholder in otool's shown-value column when the
// name isn't decodable from the local slice); its actual value is in
// __cfstring at RIP+0xb80c02. Kept opaque per PORTING_SPEC decode rules.
//
// NUMERIC CONTRACT: none — this class does no float math; all work is ObjC
// message plumbing + a raw pointer store/return + libdispatch queue lifetime.

/**
 * ObjC-id opaque handle. The native code stores raw ObjC pointers; in the
 * TS port we preserve pointer-equality by keeping the id as a nominal type.
 */
export type ObjCId = { readonly __objcId: unique symbol } | null;

/**
 * libdispatch queue opaque handle. Same treatment.
 */
export type DispatchQueueT = { readonly __dispatchQueue: unique symbol } | null;

/**
 * NSURL is an ObjC class; in the ported TS layer we keep an opaque handle
 * (the native code never inspects its bytes here).
 */
export type NSURL = ObjCId;

/** objc_alloc(cls) — allocate uninitialized ObjC instance. Called @0xe3255a
 *  (C2) / @0xe325ba (C1) with `FFSoundDesignerIISupportResourceLoaderDelegate`,
 *  and @0xe32671 (urlForAVAsset) with `NSURL`. Frontier — not yet ported. */
function objc_alloc(_cls: unknown): ObjCId { // @0x14978fc
  throw new Error("FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _objc_alloc @0x14978fc (call-sites 0xe3255a / 0xe325ba / 0xe32671)"); // @0xe3255a
}

/** objc_release(id) — decrement retain count. Called via literal-pool pointer
 *  at @0xe3260c (D2) / @0xe3263c (D1) — the pointer is loaded from a
 *  __got slot at RIP+0xabb0c6/0xabb0f6. Frontier — not yet ported. */
function objc_release(_o: ObjCId): void { // @0xabb0c6 -> _objc_release
  throw new Error("FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _objc_release (call-sites 0xe3260c / 0xe3263c)"); // @0xe3260c
}

/** dispatch_queue_attr_make_with_autorelease_frequency(attr, freq) — build
 *  a queue-attributes obj. Called @0xe3257c (C2) / @0xe325dc (C1) with
 *  `attr = nil` (`xorl %edi,%edi`) and `freq = 1` (`movl $0x1,%esi`). The
 *  numeric constant 1 corresponds to
 *  `DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM` (per libdispatch's public
 *  header). Frontier — not yet ported. */
function dispatch_queue_attr_make_with_autorelease_frequency(_attr: unknown, _freq: number): unknown { // @0x1497680
  throw new Error("FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _dispatch_queue_attr_make_with_autorelease_frequency @0x1497680 (call-sites 0xe3257c / 0xe325dc)"); // @0xe3257c
}

/** dispatch_queue_create(label, attr) — create a serial dispatch queue.
 *  Called @0xe3258b (C2) / @0xe325eb (C1) with label = the literal
 *  "com.apple.flexo.sd2ResourceLoaderQueue" (at RIP+0x83240f). Frontier. */
function dispatch_queue_create(_label: string, _attr: unknown): DispatchQueueT { // @0x149768c
  throw new Error("FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _dispatch_queue_create @0x149768c (call-sites 0xe3258b / 0xe325eb)"); // @0xe3258b
}

/** dispatch_release(q) — decrement dispatch object retain count. Tail-called
 *  at @0xe3261c (D2) / @0xe3264c (D1). Frontier — not yet ported. */
function dispatch_release(_q: DispatchQueueT): void { // @0x1497692
  throw new Error("FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _dispatch_release @0x1497692 (call-sites 0xe3261c / 0xe3264c)"); // @0xe3261c
}

/** objc_autorelease(id) — send autorelease. Tail-called @0xe326b7
 *  (urlForAVAsset). Frontier — not yet ported. */
function objc_autorelease(_o: ObjCId): ObjCId { // @0x149790e
  throw new Error("FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _objc_autorelease @0x149790e (call-site 0xe326b7)"); // @0xe326b7
}

/**
 * Generic ObjC msgSend — receiver, selector-ref key, variadic args. We route
 * every call site through this shim; the actual selector-refs live at
 * displacements from the binary's __objc_selrefs section and remain opaque
 * pending resolution via `dyld_info -fixups`. Frontier — not yet ported. */
function objc_msgSend(_receiver: ObjCId, selrefDisp: number, ..._args: unknown[]): ObjCId { // @via *(%rip+abb036/e/e) / *(0xabb14e / 0xabb0ee)
  throw new Error(`FFSoundDesignerIISupportDelegate frontier callee not yet transcribed: _objc_msgSend selref@disp=0x${selrefDisp.toString(16)} (call-sites @0xe3256c/@0xe325cc/@0xe3268a/@0xe32696/@0xe326ae)`); // @0xe3256c
}

/** ObjC class ref: FFSoundDesignerIISupportResourceLoaderDelegate.
 *  RIP-relative at @0xe32553 (C2) / @0xe325b3 (C1). Frontier — the ObjC class
 *  itself is not yet ported. */
const OBJC_CLASS_FFSoundDesignerIISupportResourceLoaderDelegate: unknown = { // @0xe32553 / @0xe325b3
  __opaqueClassRef: "FFSoundDesignerIISupportResourceLoaderDelegate",
};

/** ObjC class ref: NSURL. RIP-relative at @0xe3266a (urlForAVAsset). Frontier. */
const OBJC_CLASS_NSURL: unknown = { // @0xe3266a
  __opaqueClassRef: "NSURL",
};

/** Literal pool CFString @RIP+0xb80c02 (loaded @0xe3269f in urlForAVAsset).
 *  Opaque — the exact value is a __cfstring entry not decoded from the local
 *  slice. Frontier — kept as an opaque handle keyed by its file address. */
const CFSTRING_urlForAVAsset_fmt: unknown = { // @0xe3269f -> __cfstring at file+... (disp 0xb80c02)
  __cfstringDisp: 0xb80c02,
};

/** String literal @RIP+0x83240f (loaded @0xe32581 in C2 / @0xe325e1 in C1).
 *  From otool's inline `## literal pool for: "com.apple.flexo.sd2ResourceLoaderQueue"`. */
const DISPATCH_QUEUE_LABEL_sd2ResourceLoaderQueue = "com.apple.flexo.sd2ResourceLoaderQueue"; // @0xe32581 / @0xe325e1

export class FFSoundDesignerIISupportDelegate {
  /**
   * Struct @+0x00 — id delegate. See STRUCT LAYOUT block above.
   */
  delegate: ObjCId = null;

  /**
   * Struct @+0x08 — dispatch_queue_t queue. See STRUCT LAYOUT block above.
   */
  queue: DispatchQueueT = null;

  /**
   * @Flexo 0x0000000000e32540  FFSoundDesignerIISupportDelegate::FFSoundDesignerIISupportDelegate(NSURL*)  [C2]
   * @Flexo 0x0000000000e325a0  FFSoundDesignerIISupportDelegate::FFSoundDesignerIISupportDelegate(NSURL*)  [C1]
   *
   * Both bodies are byte-identical:
   *   1. @0xe3254d..53 (C2) / @0xe325ad..b3 (C1) — zero this[0..15] (both fields).
   *      `xorps %xmm0,%xmm0; movups %xmm0,(%rdi)`.
   *   2. @0xe32553..5f / @0xe325b3..bf — id d = objc_alloc(FFSoundDesigner...Delegate).
   *   3. @0xe3255f..6c / @0xe325bf..cc — d = objc_msgSend(d, <sel@disp0xd8a92a>, url).
   *      This is `[[FFSoundDesignerIISupportResourceLoaderDelegate alloc]
   *          <initSel>:url]` — the concrete initializer selector.
   *   4. @0xe32572 / @0xe325d2 — this->+0x00 = d.
   *   5. @0xe32575..8b / @0xe325d5..eb — build queue attr with
   *      `_dispatch_queue_attr_make_with_autorelease_frequency(nil, 1)`, then
   *      `_dispatch_queue_create("com.apple.flexo.sd2ResourceLoaderQueue", attr)`.
   *   6. @0xe32590 / @0xe325f0 — this->+0x08 = queue.
   *
   * The C1 exists as a distinct ABI entry point that external callers use;
   * both invoke the same code (there's no base class). We expose a single TS
   * constructor and note both addresses.
   */
  constructor(url: NSURL) { // @0xe32540 (C2) / @0xe325a0 (C1)
    // @0xe3254d..53 / @0xe325ad..b3 — zero both fields (`xorps %xmm0; movups %xmm0,(%rdi)`).
    this.delegate = null;                                            // @0xe32550 / @0xe325b0
    this.queue = null;                                               // @0xe32550 / @0xe325b0 (same 128-bit store)

    // @0xe32553..5a / @0xe325b3..ba — allocate the loader-delegate.
    const allocated = objc_alloc(OBJC_CLASS_FFSoundDesignerIISupportResourceLoaderDelegate); // @0xe3255a / @0xe325ba

    // @0xe3255f..6c / @0xe325bf..cc — initializer message with the caller's NSURL.
    //   Receiver = allocated, selector ref @disp 0xd8a92a (C2) / 0xd8a8ca (C1)
    //   — the fixup slot is the SAME selector; the displacement differs because
    //   the next_insn addresses differ.
    const initialized = objc_msgSend(allocated, 0xd8a92a, url);      // @0xe3256c / @0xe325cc

    // @0xe32572 / @0xe325d2 — this->+0x00 = initialized.
    this.delegate = initialized;                                     // @0xe32572 / @0xe325d2

    // @0xe32575..7c / @0xe325d5..dc — attr = dispatch_queue_attr_make_with_autorelease_frequency(nil, 1)
    //   Native: `movl $0x1,%esi; xorl %edi,%edi; call _dispatch_queue_...` — freq=1.
    const attr = dispatch_queue_attr_make_with_autorelease_frequency(null, 1); // @0xe3257c / @0xe325dc

    // @0xe32581..8b / @0xe325e1..eb — queue = dispatch_queue_create(label, attr).
    const q = dispatch_queue_create(DISPATCH_QUEUE_LABEL_sd2ResourceLoaderQueue, attr); // @0xe3258b / @0xe325eb

    // @0xe32590 / @0xe325f0 — this->+0x08 = queue.
    this.queue = q;                                                  // @0xe32590 / @0xe325f0
  }

  /**
   * @Flexo 0x0000000000e32600  FFSoundDesignerIISupportDelegate::~FFSoundDesignerIISupportDelegate()  [D2]
   * @Flexo 0x0000000000e32630  FFSoundDesignerIISupportDelegate::~FFSoundDesignerIISupportDelegate()  [D1]
   *
   * Both bodies are byte-identical:
   *   1. @0xe32609 / @0xe32639 — rdi = this->+0x00; call objc_release.
   *   2. @0xe32612 / @0xe32642 — rdi = this->+0x08; tail-jmp _dispatch_release.
   * (@0xe32621..29 / @0xe32651..59 are the eh-cleanup edge landing on
   *  __clang_call_terminate — irrelevant to ported semantics.)
   *
   * In TS the two ObjC / libdispatch retain-counted references are released
   * by calling the frontier stubs; when they eventually get ported the JS
   * side becomes a no-op (GC).
   */
  destroy(): void { // @0xe32600 (D2) / @0xe32630 (D1)
    // @0xe32609 / @0xe32639 — objc_release(this->delegate).
    objc_release(this.delegate);                                     // @0xe3260c / @0xe3263c
    // @0xe3261c / @0xe3264c — tail-jmp dispatch_release(this->queue).
    dispatch_release(this.queue);                                    // @0xe3261c / @0xe3264c
  }

  /**
   * @Flexo 0x0000000000e32660  FFSoundDesignerIISupportDelegate::urlForAVAsset() const
   *   __ZNK32FFSoundDesignerIISupportDelegate13urlForAVAssetEv
   *
   * Body @0xe32660..bc:
   *   1. @0xe3266a..71  r14 = objc_alloc(NSURL).
   *   2. @0xe32679..8a  rdi = this->+0x00; rax = objc_msgSend(delegate, <sel@disp0xd929fd>).
   *      A no-arg getter on the delegate.
   *   3. @0xe3268c..96  rdi = <prev result>; rax = objc_msgSend(prev, <sel@disp0xd85e2d>).
   *      Chained no-arg getter.
   *   4. @0xe32698..ae  objc_msgSend(NSURL-alloc, <sel@disp0xdc1981>,
   *                                    cfstring@0xb80c02, nil, <prev result>).
   *      A four-argument NSURL initializer using a format-string CFString.
   *   5. @0xe326b0..b7  tail-jmp objc_autorelease(result).
   *
   * Semantics (opaque per binary): the delegate has some getter -> another
   * getter chain that yields an id (probably an NSString path); that id and
   * a CFString format are packed via NSURL's `-initWithString:...:` variant
   * to produce a rewritten URL suitable for AVAsset consumption (probably
   * the "sd2://" -> "file://" scheme dance the SoundDesigner-II support
   * loader uses). The exact selectors are not decoded — kept opaque.
   */
  urlForAVAsset(): NSURL { // @0xe32660
    // @0xe3266a..71  alloc an NSURL slot.
    const nsurlSlot = objc_alloc(OBJC_CLASS_NSURL);                  // @0xe32671

    // @0xe32679..8a  chain step 1 — no-arg selector on the delegate.
    const step1 = objc_msgSend(this.delegate, 0xd929fd);             // @0xe3268a

    // @0xe3268c..96  chain step 2 — no-arg selector on step1.
    const step2 = objc_msgSend(step1, 0xd85e2d);                     // @0xe32696

    // @0xe32698..ae  four-argument NSURL initializer.
    //   rdx = cfstring literal (@disp 0xb80c02) — format string
    //   rcx = nil                                — zeroed via `xorl %ecx,%ecx`
    //   r8  = step2                              — msg#3 fourth ObjC arg
    // Native selector uses SEL@disp=0xdc1981.
    const initialized = objc_msgSend(nsurlSlot, 0xdc1981, CFSTRING_urlForAVAsset_fmt, null, step2); // @0xe326ae

    // @0xe326b0..b7  tail-jmp objc_autorelease.
    return objc_autorelease(initialized);                            // @0xe326b7
  }

  /**
   * @Flexo 0x0000000000e326c0  FFSoundDesignerIISupportDelegate::resourceLoaderDelegate() const
   *   __ZNK32FFSoundDesignerIISupportDelegate22resourceLoaderDelegateEv
   *
   * Body @0xe326c0..c8: `rax = (%rdi)` — returns this->+0x00 directly.
   * Trivial POD getter, no retain/autorelease.
   */
  resourceLoaderDelegate(): ObjCId { // @0xe326c0
    // @0xe326c4  movq (%rdi),%rax ; retq.
    return this.delegate;                                            // @0xe326c4
  }
}
