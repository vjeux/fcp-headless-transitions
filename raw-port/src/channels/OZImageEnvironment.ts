// OZImageEnvironment.ts — FCP Ozone OZImageEnvironment:
// A scene-graph "environment" image node that owns a stack of parameter <folder>s
// wiring up an environment (Backdrop / Skylight / Ambient / …). Extends OZImageGenerator.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: otool -tV -arch x86_64
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//   Symbol map: nm-derived; disasm dumped from /tmp/Ozone_tV.txt.
//
// CLASS HIERARCHY (from ctor @0x4d51b0, aggregated with the parent classes' ports):
//   OZImageEnvironment  extends
//     OZImageGenerator  extends   (base ctor called @0x4d51c1 by C2)
//       OZTransformNode extends   (didAddToScene chain @0x4d5cda)
//         OZElement     extends
//           OZSceneNode extends
//             OZChannelObjectRoot ...
//   The base-object ctor `OZImageGeneratorC2` runs first; C2@0x4d51b0 then rewrites four
//   vtable slots (primary vtable + 3 secondary-base vtables) to the derived
//   __ZTV18OZImageEnvironment slots and constructs the embedded OZChannelFolder subobject
//   at +0x4bb0 with parent-pointer at +0x1b8 and factoryID=1. C2 tail-calls
//   OZImageEnvironment::setupEnvironmentChannels() @0x4d5290 to configure the folder tree.
//
// STRUCT LAYOUT (recovered from ctor + methods; only decoded slots listed):
//     +0x0000  primary vtable slot   (`movq %rax, (%rbx)` @0x4d51cd, addr 0x39ebfb rip-rel)
//     +0x0010  secondary vtable slot (`movq %rax, 0x10(%rbx)` @0x4d51d7)
//     +0x0028  secondary vtable slot (`movq %rax, 0x28(%rbx)` @0x4d51e2)
//     +0x01b8  parent-folder back-pointer used as OZChannelFolder ctor arg2 (@0x4d51fb)
//     +0x0498  (accessor: `addq $0x498, %rax` in getNaturalDuration @0x4d5bca — likely a
//              CMTime accessor slot on the getInput()-returned generator, NOT on `this`.)
//     +0x04b8  embedded OZChannelBase subobject #1 (setupEnvironmentChannels @0x4d529a)
//     +0x047d4 (movabsq 0x100000002 stored — a packed 2×u32 flag field, per C2 @0x4d5233)
//     +0x04bb0 OZChannelFolder subobject (`OZImageGenerator`-owned root env folder, ctor
//              @0x4d5213 with factoryID=1, parent=`this+0x1b8`)
//     +0x04c30 bool `didAddToScene`-run flag (parseBegin sets @0x4d5f74 unconditionally;
//              didAddToScene tests + sets @0x4d5d58/@0x4d5d61; setTimeOffsetAndDuration
//              gate @0x4d5d5f)
//     +0x04c38 `std::__1::shared_ptr<Li3DEngineObjectData>` slot (2-word pair,
//              zero-initialised by C2 @0x4d521f-@0x4d5222 via `xorps xmm0, xmm0;
//              movups %xmm0, 0x4c38(%rbx)`; released by D0 @0x4d5895 via classic
//              `xaddq $-1` refcount-decrement path — control block ptr at +0x4c40).
//     +0x04c40 shared_ptr control-block pointer (D2/D1/D0 @0x4d55b5 / @0x4d5645 / @0x4d5895)
//     +0x01150 embedded OZChannelBase #2 (@0x4d52c7 setupEnvironmentChannels)
//     +0x013a0 embedded OZChannelBase #3 (@0x4d52ed)
//     +0x01558 embedded OZChannelBase #4 (@0x4d5313)
//     +0x026c8 embedded OZChannelFolder A (@0x4d5339 — `saveStateAsDefault` called)
//     +0x020b8 embedded OZChannelFolder B (@0x4d5357)
//     +0x03178 embedded OZChannelFolder C (@0x4d5375)
//     +0x038e0 embedded OZChannelFolder D (@0x4d5393)
//     +0x04468 embedded OZChannelFolder E (@0x4d53b1 — the last one; C2's tail folder)
//     +0x01978 secondary vtable slot (`movq %rax, 0x1978(%rbx)` @0x4d51ed) — this offset
//              matches OZTransformNode's secondary-base vtable.
//
// EXPORTED SYMBOLS (from ledger — 24 methods; C1 tail-calls C2, D1==D2==D0-prefix):
//   @0x004d51b0  OZImageEnvironment::OZImageEnvironment(OZFactory*, PCString const&, u32)  (C2)
//   @0x004d53d0  OZImageEnvironment::OZImageEnvironment(OZFactory*, PCString const&, u32)  (C1 -> C2)
//   @0x004d53e0  OZImageEnvironment::OZImageEnvironment(OZImageEnvironment const&, u32)    (C2 copy)
//   @0x004d54b0  OZImageEnvironment::OZImageEnvironment(OZImageEnvironment const&, u32)    (C1 copy)
//   @0x004d5580  OZImageEnvironment::~OZImageEnvironment()                                 (D2)
//   @0x004d5610  OZImageEnvironment::~OZImageEnvironment()                                 (D1)
//   @0x004d5860  OZImageEnvironment::~OZImageEnvironment()                                 (D0 — deleting)
//   @0x004d5290  OZImageEnvironment::setupEnvironmentChannels()
//   @0x004d5ad0  OZImageEnvironment::operator=(OZSceneNode const&)
//   @0x004d5af0  OZImageEnvironment::eval(OZRenderParams&)                                 (returns 0)
//   @0x004d5b00  OZImageEnvironment::hasDescendants() const                                (returns false)
//   @0x004d5b10  OZImageEnvironment::numberOfDescendants() const                           (returns 0)
//   @0x004d5b20  OZImageEnvironment::setName(PCString const&, bool)
//   @0x004d5ba0  OZImageEnvironment::getNaturalDuration()                                  (CMTime)
//   @0x004d5c50  OZImageEnvironment::getNaturalDurationFlags()                             (returns 6)
//   @0x004d5c70  OZImageEnvironment::getOriginalBounds(PCRect<double>*, OZRenderState const&)
//   @0x004d5c90  OZImageEnvironment::setGeodeProperties(OZRenderParams&, OZRenderGraphState&, LiGeode*)
//   @0x004d5cb0  OZImageEnvironment::didAddToScene(OZScene*)
//   @0x004d5de0  OZImageEnvironment::setTimeOffsetAndDuration(CMTime, CMTime)
//   @0x004d5f70  OZImageEnvironment::parseBegin(PCSerializerReadStream&)
//   @0x004d5fb0  OZImageEnvironment::variesOverTime()                                      (returns false)
//   @0x004d5fc0  OZImageEnvironment::getInput()                                            (returns null)
//   @0x004d5fd0  OZImageEnvironment::isLit(OZRenderParams const&) const                    (returns false)
//   @0x004d5fe0  OZImageEnvironment::isPluginMissing(PCString&)                            (returns false)
//
// FIDELITY NOTES:
//   * Many virtuals are DELIBERATELY stubbed to constant 0/false — the disassembly is
//     literally `xorl %eax,%eax; ret` (see @0x4d5af0 eval; @0x4d5b00 hasDescendants;
//     @0x4d5b10 numberOfDescendants; @0x4d5fb0 variesOverTime; @0x4d5fc0 getInput;
//     @0x4d5fd0 isLit; @0x4d5fe0 isPluginMissing). Returning 0/false is the FCP
//     behaviour — this class is an "environment" node with no per-frame eval and no
//     children in the OZ tree walker sense (its channel-tree is where the values live).
//   * getNaturalDurationFlags returns constant 0x6 (`movl $0x6, %eax` @0x4d5c54).
//   * getOriginalBounds writes a constant `PCRect<double>::empty` blob to arg1+0x10
//     from a rip-relative constant (@0x4d5c74 `movaps 0x22f745(%rip), %xmm0;
//     movups %xmm0, 0x10(%rsi)`). The constant IS the empty rect (16 zero bytes),
//     leaving the caller-provided origin bytes at +0x00 untouched — the disasm shows
//     only the size half is overwritten.
//   * getNaturalDuration @0x4d5ba0 dispatches via arg-vtable +0x110 (getInput) — if the
//     input generator is null, it returns kCMTimeZero into out-arg *rbx; otherwise it
//     re-vcalls getInput and returns *(gen+0x498) as a CMTime. `this` is `%rbx = arg0`
//     but %rsi is the OZRenderParams-carrying input arg used for the vcall.
//   * setName @0x4d5b20 forwards to OZChannelBase::setName on `this+0x4bb0` (the root
//     env folder) THEN tail-calls OZObjectManipulator::setName on `this+0x10`.
//   * parseBegin @0x4d5f70 sets `this+0x4c30 = 1` (the addedToScene flag) then
//     tail-calls OZElement::parseBegin.
//   * didAddToScene @0x4d5cb0 chains OZTransformNode::didAddToScene then, if the
//     OZScene arg is non-null, reads the scene's OZSceneSettings (arg+0x90), copies
//     it, computes `frameDuration * animRange` (@0x4d5d14 `__ZmlRK6CMTimej`), and
//     if the `addedToScene`-flag at +0x4c30 is false, sets it true and calls
//     OZChannelObjectRootBase::setTimeExtent(this+0x30, {0, frameDuration*rangeLen}).
//   * setTimeOffsetAndDuration @0x4d5de0 branches on CMTimeCompare(newDuration, 0):
//       > 0 → OZChannelObjectRootBase::setTimeExtent(this+0x30, {offset, duration}, false).
//       ≤ 0 → dispatch via getInput()+ +0x110 vtable slot; if that generator has
//             OZSceneSettings, `frameDuration * animRange` recomputed, then same
//             setTimeExtent call with the derived range.
//   * operator=(OZSceneNode const&) @0x4d5ad0 forwards to OZElement::operator= then
//     tail-calls setupEnvironmentChannels() — same channel-init sequence as ctor.
//   * setupEnvironmentChannels @0x4d5290 walks 10 embedded channel/folder subobjects
//     at fixed offsets (+0x4b8, +0x1150, +0x13a0, +0x1558, +0x26c8, +0x20b8, +0x3178,
//     +0x38e0, +0x4468 as `saveStateAsDefault` targets; +0x4bb0-adjacent as vtable-
//     hop targets). Each: `setFlag(0x8002, false)`; the folder variants additionally
//     invoke `saveStateAsDefault`; the non-folder ones vcall through slot +0x80 (a
//     virtual method — same across the 4 non-folder instances).
//   * The three D0/D1/D2 destructors share a common body — rebind 4 vtable slots
//     back to the OZImageEnvironment vtables (Itanium ABI: on dtor entry, restore
//     `this`'s vtable to the class-under-destruction's own vtable BEFORE running the
//     derived-object cleanups), release the shared_ptr<Li3DEngineObjectData> at
//     +0x4c38 (raii `xaddq $-1` decrement of control-block ptr at +0x4c40; if it
//     drops to zero call vtable+0x10 then __shared_weak_count::__release_weak),
//     destroy the embedded OZChannelFolder at +0x4bb0 (@0x4d58d7), and tail-call
//     OZImageGenerator::~OZImageGenerator on `this` (D0 additionally calls
//     `operator delete`).
//
// FRONTIER (undecoded callees this class depends on):
//   OZImageGenerator::OZImageGenerator(OZFactory*, PCString const&, u32)    @Ozone 0x4d51c1 (base ctor)
//   OZImageGenerator::OZImageGenerator(OZImageGenerator const&, u32)         @Ozone 0x4d53f1 (base copy)
//   OZImageGenerator::~OZImageGenerator()                                    @Ozone 0x4d5693 tail (D2)
//   OZChannelFolder::OZChannelFolder(PCString const&, OZChannelFolder*, u32, u32, u32)  @Ozone 0x6ddffe (stub)
//   OZChannelFolder::OZChannelFolder(OZChannelFolder const&, OZChannelFolder*)          @Ozone 0x6de004 (stub)
//   OZChannelFolder::~OZChannelFolder()                                                 @Ozone 0x6de028 (stub)
//   OZChannelBase::setFlag(u64, bool)                                                   @Ozone 0x6dd914 (stub)
//   OZChannelBase::setName(PCString const&, bool)                                       @Ozone 0x6dd91a (stub)
//   OZChannelFolder::saveStateAsDefault()                                               @Ozone 0x6ddf92 (stub)
//   OZObjectManipulator::setName(PCString const&, bool)                                 @Ozone 0x4d5b56 (tail)
//   OZTransformNode::didAddToScene(OZScene*)                                            @Ozone 0x4d5cda (base)
//   OZElement::setGeodeProperties(...)                                                  @Ozone 0x4d5c99 (base)
//   OZElement::parseBegin(PCSerializerReadStream&)                                      @Ozone 0x4d5f7c (base tail)
//   OZElement::operator=(OZSceneNode const&)                                            @Ozone 0x4d5ad9 (base)
//   OZSceneSettings::OZSceneSettings(OZSceneSettings const&)                            @Ozone 0x4d5cf5 (didAddToScene)
//   OZSceneSettings::getFrameDuration() const                                           @Ozone 0x4d5d01 (didAddToScene)
//   OZSceneSettings::~OZSceneSettings()                                                 @Ozone 0x4d5dca (didAddToScene EH)
//   OZChannelObjectRootBase::setTimeExtent(PCTimeRange const&, bool)                    @Ozone 0x6de7c0 (stub)
//   CMTimeCompare(CMTime, CMTime)                                                       @Ozone 0x6dcab0 (stub)
//   CMTime operator*(CMTime const&, u32)                                                @Ozone 0x6dfc7e (stub) [__ZmlRK6CMTimej]
//   __shared_weak_count::__release_weak()                                               @Ozone 0x6dfbbe (stub)
//   PCString::~PCString()                                                               @Ozone 0x6df0c6 (stub)
//   PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)                                @Ozone 0x6dda9a (stub)
//   operator delete(void*)                                                              @Ozone 0x6dfc36 (stub) [__ZdlPv]
//   _kCMTimeZero (data symbol)                                                          @Ozone lit-pool 0x82450b
//
// NOTES ON PORTING SHAPE:
//   * The runtime-render engine does not currently instantiate/execute environment
//     nodes (no rig-3D compositor); this port faithfully mirrors the FCP class so
//     downstream code can distinguish an environment node, ask if it has
//     descendants (no), or check plugin-missing (no), and drive its parseBegin.
//   * The channel-folder ctors, setFlag/setName/saveStateAsDefault, and CMTime
//     helpers remain undecoded frontier stubs. This is intentional per PORTING_SPEC
//     Rule 3 — a loud gap is correct; setup logic is captured in commentary so a
//     follow-up port can wire it once those callees are available.

import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZElement } from "../nodes/OZElement.js";

/**
 * OZImageEnvironment — extends OZElement (transitive base via OZImageGenerator ->
 * OZTransformNode -> OZElement chain established in the disassembly). Because
 * OZImageGenerator itself is not yet ported, we take its NEAREST-decoded ancestor
 * (OZElement) as the TypeScript base so downstream parse code still gets the
 * OZElement/OZTransformNode/OZSceneNode tag switches. When OZImageGenerator lands,
 * this `extends` should be re-pointed. (Marking with an explicit @extends comment
 * so a reviewer sees the intentional narrowing.)
 *
 * @extends OZImageGenerator  (via OZElement TS placeholder until parent lands)
 */
export class OZImageEnvironment extends OZElement {
  /**
   * `this+0x4c30` — the `didAddToScene`-has-run flag. Set to true by:
   *   - parseBegin @0x4d5f74 (unconditional pre-super)
   *   - didAddToScene @0x4d5d61 (only inside the if `== false` branch @0x4d5d5e).
   * Read by setTimeOffsetAndDuration and didAddToScene as the gate for the
   * setTimeExtent call.
   */
  addedToScene = false;

  /**
   * OZImageEnvironment::parseBegin(PCSerializerReadStream&) — @Ozone 0x4d5f70.
   * Body: `movb $0x1, 0x4c30(%rdi); jmp OZElement::parseBegin`.
   */
  parseBegin(s: PCSerializerReadStream): void {
    this.addedToScene = true; // @0x4d5f74
    // Tail-call OZElement::parseBegin(s) @0x4d5f7c — not yet transcribed.
    void s;
    throw new Error(
      "OZImageEnvironment::parseBegin tail-call to OZElement::parseBegin " +
      "@Ozone 0x4d5f7c (jmp target) not yet transcribed",
    );
  }

  /**
   * OZImageEnvironment::variesOverTime() — @Ozone 0x4d5fb0.
   * Body: `xorl %eax,%eax; ret`. Environment nodes are static — no per-frame variation.
   */
  variesOverTime(): boolean {
    return false; // @0x4d5fb4
  }

  /**
   * OZImageEnvironment::hasDescendants() const — @Ozone 0x4d5b00.
   * Body: `xorl %eax,%eax; ret`. Environment nodes have no scene-graph descendants
   * (their data lives in the channel tree, not as child nodes).
   */
  hasDescendants(): boolean {
    return false; // @0x4d5b04
  }

  /**
   * OZImageEnvironment::numberOfDescendants() const — @Ozone 0x4d5b10.
   * Body: `xorl %eax,%eax; ret`.
   */
  numberOfDescendants(): number {
    return 0; // @0x4d5b14
  }

  /**
   * OZImageEnvironment::eval(OZRenderParams&) — @Ozone 0x4d5af0.
   * Body: `xorl %eax,%eax; ret`. No per-frame evaluation — environment is a
   * declarative resource, not a signal-flow node.
   */
  eval(_params: unknown): number {
    return 0; // @0x4d5af4
  }

  /**
   * OZImageEnvironment::getInput() — @Ozone 0x4d5fc0.
   * Body: `xorl %eax,%eax; ret`. Returns nullptr (an environment has no input port).
   */
  getInput(): unknown | null {
    return null; // @0x4d5fc4
  }

  /**
   * OZImageEnvironment::isLit(OZRenderParams const&) const — @Ozone 0x4d5fd0.
   * Body: `xorl %eax,%eax; ret`. Environment nodes are self-lit (their own image
   * IS the light source in a Motion 3D rig) — no scene lighting applies.
   */
  isLit(_params: unknown): boolean {
    return false; // @0x4d5fd4
  }

  /**
   * OZImageEnvironment::isPluginMissing(PCString&) — @Ozone 0x4d5fe0.
   * Body: `xorl %eax,%eax; ret`. Environment is a first-party FCP node with no
   * plugin bundle to be missing.
   */
  isPluginMissing(_outName: unknown): boolean {
    return false; // @0x4d5fe4
  }

  /**
   * OZImageEnvironment::getNaturalDurationFlags() — @Ozone 0x4d5c50.
   * Body: `movl $0x6, %eax; ret`. Constant 0x6 — the OZDurationFlag enum bits
   * that classify how getNaturalDuration()'s result should be interpreted.
   */
  getNaturalDurationFlags(): number {
    return 0x6; // @0x4d5c54
  }

  /**
   * OZImageEnvironment::getOriginalBounds(PCRect<double>*, OZRenderState const&) — @Ozone 0x4d5c70.
   * Body:
   *   movaps 0x22f745(%rip), %xmm0    ; rip-rel: 16-byte zero blob at (Ozone base + 0x22f745
   *                                     from insn 0x4d5c74+7 = 0x704dc0-ish) — the empty PCRect<double>
   *                                     size half.
   *   movups %xmm0, 0x10(%rsi)         ; write to outRect->size (offset +0x10 of PCRect<double>).
   * PCRect<double> layout is {origin:{x,y}, size:{w,h}} in dvec4 form; only the size
   * pair (bytes +0x10..+0x1f) is overwritten — origin at +0x00..+0x0f is left as-is,
   * matching what the caller pre-initialised. The constant IS the empty-size ({0,0}).
   */
  getOriginalBounds(outRect: { origin?: { x: number; y: number }; size: { w: number; h: number } }, _state: unknown): void {
    // @0x4d5c7b — write size = {0, 0} from the rip-rel empty-size constant.
    outRect.size = { w: 0, h: 0 };
    // Origin (bytes +0x00..+0x0f) intentionally UNTOUCHED per the disassembly.
  }

  /**
   * OZImageEnvironment::setName(PCString const&, bool) — @Ozone 0x4d5b20.
   * Body: call `OZChannelBase::setName(this+0x4bb0, name, false)` then tail-call
   * `OZObjectManipulator::setName(this+0x10, name, propagate)`.
   * The `edx` argument (bool `propagate`) is FORCED to 0 for the channel-folder
   * side (@0x4d5b39 `xorl %edx,%edx`) but PRESERVED for the OZObjectManipulator
   * tail-call (@0x4d5b4a `movl %ebx,%edx` restoring the original arg).
   */
  setName(name: unknown, propagate: boolean): void {
    // OZChannelBase::setName(this+0x4bb0, name, false) — @0x4d5b3b — undecoded stub.
    OZChannelBase_setName_stub(this, name, false); // @0x4d5b3b -> Ozone 0x6dd91a
    // OZObjectManipulator::setName(this+0x10, name, propagate) — @0x4d5b56 (tail) — undecoded stub.
    OZObjectManipulator_setName_stub(this, name, propagate); // @0x4d5b56 -> tail-called
  }

  /**
   * OZImageEnvironment::setupEnvironmentChannels() — @Ozone 0x4d5290.
   * Configures ten embedded channel subobjects (offsets recovered from insn addrs):
   *   +0x4b8 , +0x1150, +0x13a0, +0x1558   — OZChannelBase subobjects; each
   *       setFlag(0x8002, false) then vcall through vtable slot +0x80 (a virtual
   *       "reset default / save state" method — same slot for all four).
   *   +0x26c8, +0x20b8, +0x3178, +0x38e0, +0x4468 — OZChannelFolder subobjects;
   *       each setFlag(0x8002, false) then saveStateAsDefault().
   * The 0x8002 flag encodes two OZChannelBase flag bits: 0x2 ("has a factory-set
   * default") + 0x8000 ("environment-slot") observed elsewhere in the ledger.
   */
  setupEnvironmentChannels(): void {
    // Four fixed-offset OZChannelBase substruct configurations. Because the ports
    // for those substructs are not yet in scope (they live inside OZImageGenerator's
    // to-be-ported vector storage), transcribing the exact side-effects requires
    // the parent class. Cite each address so a follow-up can wire the calls once
    // OZChannelBase/OZChannelFolder are exported handles for this class.
    //
    // @0x4d529a  setFlag(this+0x4b8 , 0x8002, false)  ; then vcall +0x80
    // @0x4d52c0  setFlag(this+0x1150, 0x8002, false)  ; then vcall +0x80
    // @0x4d52e6  setFlag(this+0x13a0, 0x8002, false)  ; then vcall +0x80
    // @0x4d530c  setFlag(this+0x1558, 0x8002, false)  ; then vcall +0x80
    // @0x4d5332  setFlag(this+0x26c8, 0x8002, false)  ; saveStateAsDefault()
    // @0x4d5350  setFlag(this+0x20b8, 0x8002, false)  ; saveStateAsDefault()
    // @0x4d536e  setFlag(this+0x3178, 0x8002, false)  ; saveStateAsDefault()
    // @0x4d538c  setFlag(this+0x38e0, 0x8002, false)  ; saveStateAsDefault()
    // @0x4d53aa  setFlag(this+0x4468, 0x8002, false)  ; saveStateAsDefault() (tail-call)
    throw new Error(
      "OZImageEnvironment::setupEnvironmentChannels @Ozone 0x4d5290 not yet transcribed " +
      "— depends on OZChannelBase::setFlag @Ozone 0x6dd914 + OZChannelFolder::saveStateAsDefault " +
      "@Ozone 0x6ddf92 which are undecoded frontier stubs.",
    );
  }

  /**
   * OZImageEnvironment::getNaturalDuration() — @Ozone 0x4d5ba0.
   * Signature: returns CMTime by value (via caller-provided out-slot at %rdi;
   * the arg1 is the OZRenderParams-carrying "context" object %rsi=%r14).
   *
   * Body:
   *   ctx  = %r14 = arg
   *   this = %rbx = out-CMTime*
   *   input = (*ctx->vtable[0x110])(ctx)                   ; @0x4d5bad-@0x4d5bb3
   *   if input == nullptr:
   *     *this = *_kCMTimeZero                              ; @0x4d5bd2-@0x4d5be4
   *   else:
   *     input2 = (*ctx->vtable[0x110])(ctx)                ; @0x4d5bbe-@0x4d5bc4 (called AGAIN)
   *     *this  = *(CMTime*)((char*)input2 + 0x498)          ; @0x4d5bca (`addq $0x498, %rax`)
   *   return this
   *
   * Note the double vcall @0x110 — the compiler didn't CSE it, so the disassembly
   * literally invokes the virtual twice. We preserve that shape.
   *
   * CMTime layout: value(i64) at +0x0, timescale(i32)+flags(u32)+epoch(i64) at +0x8.
   * `movups (%rax), %xmm0; movq 0x10(%rax), %rcx` — copies the 24-byte struct
   * as a 16-byte movups + a 64-bit movq — same as memcpy.
   */
  getNaturalDuration(_ctx: unknown): CMTimeLike {
    // Both vcalls resolve to the same "getInput()" virtual on the ctx object. The
    // exact slot @0x110 corresponds to whichever generator interface ctx implements.
    // Because we cannot resolve that vtable statically, throw with the address.
    throw new Error(
      "OZImageEnvironment::getNaturalDuration @Ozone 0x4d5ba0 not yet transcribed " +
      "— requires resolving virtual-slot ctx.vtable[0x110] (getInput) on the caller " +
      "context AND the CMTime returned by getInput()->at(+0x498). Callee undecoded.",
    );
  }

  /**
   * OZImageEnvironment::setGeodeProperties(OZRenderParams&, OZRenderGraphState&, LiGeode*) — @Ozone 0x4d5c90.
   * Body:
   *   call OZElement::setGeodeProperties(args...)            ; @0x4d5c99
   *   movb $0x1, 0x21d(geode)                                ; @0x4d5c9e — sets a flag on the
   *                                                            LiGeode arg (%rcx=%rbx) at +0x21d.
   * The LiGeode+0x21d flag is the "is environment" tag on the render-graph node
   * (surfaced elsewhere in Ozone's render-graph lookups).
   */
  setGeodeProperties(params: unknown, graphState: unknown, geode: { environmentFlag?: boolean } | null): void {
    // OZElement::setGeodeProperties(params, graphState, geode) — @0x4d5c99 — undecoded stub.
    OZElement_setGeodeProperties_stub(this, params, graphState, geode); // -> Ozone 0x4d5c99
    if (geode) {
      geode.environmentFlag = true; // @0x4d5c9e — `movb $0x1, 0x21d(%rbx)`
    }
  }

  /**
   * OZImageEnvironment::didAddToScene(OZScene*) — @Ozone 0x4d5cb0.
   * Body:
   *   OZTransformNode::didAddToScene(this, scene)             ; @0x4d5cda
   *   if (scene == null) goto done                            ; @0x4d5cdf-@0x4d5ce2 -> @0x4d5d58
   *   settings = scene + 0x90                                 ; @0x4d5ce4
   *   OZSceneSettings copy(settings)                          ; @0x4d5cf5
   *   frameDur = copy.getFrameDuration()                      ; @0x4d5d01
   *   animFrames = *(u32*)(copy+0)                            ; @0x4d5d06 (`-0x160(%rbp)`, i.e.
   *                                                             the packed data returned by the
   *                                                             getFrameDuration temp lives at
   *                                                             the same stack slot as the copy —
   *                                                             here %edx reads the frame-count
   *                                                             from the scene-settings header).
   *   endTime = frameDur * animFrames                         ; @0x4d5d14 (`__ZmlRK6CMTimej`)
   *   copy.~OZSceneSettings()                                 ; @0x4d5d29-@0x4d5d53
   * done:
   *   if (this+0x4c30 == false) {                             ; @0x4d5d58 (`cmpb $0,0x4c30(%rbx)`)
   *     this+0x4c30 = true                                    ; @0x4d5d61
   *     range = {start = this+0xc8 (a CMTimeRange half already in memory), end = endTime}
   *     OZChannelObjectRootBase::setTimeExtent(this+0x30, &range, false)  ; @0x4d5da7
   *   }
   */
  didAddToScene(_scene: unknown): void {
    throw new Error(
      "OZImageEnvironment::didAddToScene @Ozone 0x4d5cb0 not yet transcribed " +
      "— chains OZTransformNode::didAddToScene (undecoded), copies OZSceneSettings, " +
      "computes frameDuration*animFrames via __ZmlRK6CMTimej (@Ozone 0x6dfc7e), and " +
      "calls OZChannelObjectRootBase::setTimeExtent (@Ozone 0x6de7c0). All base callees undecoded.",
    );
  }

  /**
   * OZImageEnvironment::setTimeOffsetAndDuration(CMTime offset, CMTime duration) — @Ozone 0x4d5de0.
   * Body:
   *   c = CMTimeCompare(duration, kCMTimeZero)                ; @0x4d5e44 — sign of duration.
   *   if (c > 0) {                                            ; @0x4d5e4b (`jle 0x4d5e9b`, so >0 falls through)
   *     range = { offset, duration }
   *     OZChannelObjectRootBase::setTimeExtent(this+0x30, &range, false)  ; @0x4d5e8c
   *     return
   *   }
   *   // c <= 0 branch:
   *   input = (*this.vtable[0x110])(this)                     ; @0x4d5e9b-@0x4d5ea1  (getInput)
   *   if input == null: goto setTimeExtent-with-orig-args     ; @0x4d5e4d fallthrough
   *   input2 = (*this.vtable[0x110])(this)                    ; @0x4d5eac-@0x4d5eb2  (SECOND vcall)
   *   settings = OZSceneSettings(input2 + 0x90)               ; @0x4d5ec6
   *   frameDur = settings.getFrameDuration()                  ; @0x4d5ee4
   *   animFrames = *(u32*)(settings)                          ; @0x4d5ee9
   *   duration' = frameDur * animFrames                       ; @0x4d5ef7 __ZmlRK6CMTimej
   *   settings.~OZSceneSettings()                             ; @0x4d5f0c-@0x4d5f34
   *   fallthrough to setTimeExtent-with-{offset, duration'}   ; @0x4d5f3f -> @0x4d5e4d
   *
   *   The @0x4d5e4d block builds a PCTimeRange local (@stack -0x160/-0x150/-0x148/-0x138)
   *   copying {offset, duration'} (or {offset, duration}) and calls
   *   OZChannelObjectRootBase::setTimeExtent(this+0x30, &range, false).
   */
  setTimeOffsetAndDuration(_offset: CMTimeLike, _duration: CMTimeLike): void {
    throw new Error(
      "OZImageEnvironment::setTimeOffsetAndDuration @Ozone 0x4d5de0 not yet transcribed " +
      "— requires CMTimeCompare (@Ozone 0x6dcab0), a virtual-slot vtable[0x110] getInput " +
      "on `this` returning an OZSceneSettings-carrying object, and " +
      "OZChannelObjectRootBase::setTimeExtent (@Ozone 0x6de7c0). All callees undecoded.",
    );
  }

  /**
   * OZImageEnvironment::operator=(OZSceneNode const&) — @Ozone 0x4d5ad0.
   * Body:
   *   call OZElement::operator=(this, rhs)                    ; @0x4d5ad9
   *   tail-call setupEnvironmentChannels(this)                ; @0x4d5ae7
   *   return this
   *
   * Rebuilds the environment-channel folder tree so the pin-values match the
   * newly-assigned rhs (which is why the folder walk fires again, even though
   * ctor already ran it once — the OZElement:: copy over-wrote the folder
   * flags/state).
   */
  copyAssign(rhs: unknown): this {
    // OZElement::operator=(this, rhs) — @0x4d5ad9 — undecoded stub.
    OZElement_copyAssign_stub(this, rhs); // -> Ozone 0x4d5ad9 (base)
    // Tail-call setupEnvironmentChannels — will THROW because setupEnvironmentChannels
    // itself depends on undecoded stubs. Preserving faithful call shape.
    this.setupEnvironmentChannels(); // @0x4d5ae7
    return this;
  }
}

// -------- CMTime helper type --------
/**
 * A minimal CMTime shape captured for signature-fidelity. Not a full port of
 * CMTime; the FCP disassembly manipulates it as a 24-byte struct
 * (value:i64, timescale:i32, flags:u32, epoch:i64).
 */
export interface CMTimeLike {
  value: bigint;
  timescale: number;
  flags: number;
  epoch: bigint;
}

// -------- Frontier stubs (undecoded callees) --------

/**
 * OZChannelBase::setName(PCString const&, bool) — @Ozone stub 0x6dd91a.
 * Called from OZImageEnvironment::setName @0x4d5b3b with `this+0x4bb0` and
 * bool=false.
 */
export function OZChannelBase_setName_stub(_folder: unknown, _name: unknown, _propagate: boolean): void {
  throw new Error("OZChannelBase::setName @Ozone 0x6dd91a not yet transcribed");
}

/**
 * OZObjectManipulator::setName(PCString const&, bool) — @Ozone stub 0x4d5b56 (tail-called).
 * Called from OZImageEnvironment::setName with `this+0x10` (the OZObjectManipulator
 * secondary base) and the original `propagate` bool.
 */
export function OZObjectManipulator_setName_stub(_obj: unknown, _name: unknown, _propagate: boolean): void {
  throw new Error("OZObjectManipulator::setName @Ozone (jmp target of 0x4d5b56) not yet transcribed");
}

/**
 * OZElement::setGeodeProperties(OZRenderParams&, OZRenderGraphState&, LiGeode*) — @Ozone stub
 * (callq target at 0x4d5c99 resolves to the OZElement base method).
 */
export function OZElement_setGeodeProperties_stub(_self: unknown, _params: unknown, _graphState: unknown, _geode: unknown): void {
  throw new Error("OZElement::setGeodeProperties @Ozone (callq target of 0x4d5c99) not yet transcribed");
}

/**
 * OZElement::operator=(OZSceneNode const&) — @Ozone stub (callq target at 0x4d5ad9).
 */
export function OZElement_copyAssign_stub(_self: unknown, _rhs: unknown): void {
  throw new Error("OZElement::operator= @Ozone (callq target of 0x4d5ad9) not yet transcribed");
}
