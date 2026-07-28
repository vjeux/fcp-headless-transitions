// OZChannelCrop — Ozone compound channel bundling four scalar sub-channels
// (the four crop edges: top/left/bottom/right in the FCP crop parameter group).
// Only ONE symbol is exported from Ozone for this class:
//
//   @Ozone 0x000000000009a6c0  OZChannelCrop::~OZChannelCrop()     [D1 dtor]
//
// The ctor(s), clone(), copy(), getObjCWrapperName(), setValue*/getValue*
// helpers are all UNDEFINED IMPORTS in the Ozone binary — they live in
// ProChannel (like the base OZCompoundChannel) or were emitted only inline
// at call sites (no separate C1/C2 symbol). Their frontier stubs live under
// the "static make_*" methods that throw citing the address they need.
//
// STRUCT LAYOUT (recovered exhaustively from the D1 dtor body @0x9a6c0):
//
//   size >= 0x2e8    (four sub-OZChannels at 0x88/0x120/0x1B8/0x250 — each
//                     OZChannel is 0x98 bytes wide; +0x88 first + 4*0x98 = 0x2e8)
//   +0x00  void*  primary vtable    (installed = OZChannelCrop vtable + 0x10)
//   +0x10  void*  secondary vtable  (installed = OZChannelCrop vtable + 0x358
//                                    = +0x10 + 0x348, per `addq $0x348, %rax`)
//   +0x18..0x87    OZCompoundChannel base sub-object (opaque here — decoded
//                                    in raw-port/src/channels/OZCompoundChannel.ts
//                                    and its ProChannel-side ctor)
//   +0x88   OZChannel  edge_0 (first crop edge — likely top)     size 0x98
//   +0x120  OZChannel  edge_1 (second — likely left)              size 0x98
//   +0x1B8  OZChannel  edge_2 (third — likely bottom)             size 0x98
//   +0x250  OZChannel  edge_3 (fourth — likely right)             size 0x98
//
// Ordering (top/left/bottom/right) is INFERRED from the FCP Crop transition
// parameter group; the binary does not carry the display names in this dtor.
// If a caller ever depends on which slot is which edge, the ctor decode
// (frontier) must land first — this file exposes them as byte offsets in
// EDGE_OFFSETS so no false name is baked in.
//
// FRAMEWORK: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone). The thin x86_64 slice was analyzed via
// `bash raw-port/tools/disasm.sh OZChannelCrop '~OZChannelCrop' Ozone`
// (output in raw-port/re/disasm/OZChannelCrop.~OZChannelCrop.s).
//
// D1 dtor disassembly (25 lines) — every instruction is transcribed below:
//   0x9a6c0  pushq  %rbp
//   0x9a6c1  movq   %rsp, %rbp
//   0x9a6c4  pushq  %rbx
//   0x9a6c5  pushq  %rax                       ; 8-byte stack align
//   0x9a6c6  movq   %rdi, %rbx                 ; rbx = this
//   0x9a6c9  movq   0x7881c0(%rip), %rax       ; rax = &vtable_for_OZChannelCrop
//                                              ;      (## literal pool: __ZTV13OZChannelCrop)
//   0x9a6d0  leaq   0x10(%rax), %rcx           ; rcx = vtable + 0x10 (installed ptr)
//   0x9a6d4  movq   %rcx, (%rdi)               ; this[0x00] = primary vtable slot
//   0x9a6d7  addq   $0x348, %rax               ; rax = vtable + 0x348
//                                              ;      = installed secondary at +0x10 + 0x348
//   0x9a6dd  movq   %rax, 0x10(%rdi)           ; this[0x10] = secondary vtable slot
//   0x9a6e1  addq   $0x250, %rdi               ; rdi = &edges[3]  (+0x250)
//   0x9a6e8  callq  __ZN9OZChannelD2Ev         ; ~OZChannel(edges[3])   [reverse ctor order]
//   0x9a6ed  leaq   0x1b8(%rbx), %rdi          ; rdi = &edges[2]  (+0x1B8)
//   0x9a6f4  callq  __ZN9OZChannelD2Ev         ; ~OZChannel(edges[2])
//   0x9a6f9  leaq   0x120(%rbx), %rdi          ; rdi = &edges[1]  (+0x120)
//   0x9a700  callq  __ZN9OZChannelD2Ev         ; ~OZChannel(edges[1])
//   0x9a705  leaq   0x88(%rbx), %rdi           ; rdi = &edges[0]  (+0x88)
//   0x9a70c  callq  __ZN9OZChannelD2Ev         ; ~OZChannel(edges[0])
//   0x9a711  movq   %rbx, %rdi                 ; rdi = this
//   0x9a714  addq   $0x8, %rsp
//   0x9a718  popq   %rbx
//   0x9a719  popq   %rbp
//   0x9a71a  jmp    __ZN17OZCompoundChannelD2Ev; TAIL: ~OZCompoundChannel(this)
//   0x9a71f  nop
//
// The dtor's shape is textbook Itanium-ABI for a class that derives from
// OZCompoundChannel and holds four fully-owned sub-OZChannel members:
//   1) reset vtable pointers to my own class's vtable (so any virtual call
//      inside a base dtor now dispatches to MY overrides, i.e. is a no-op —
//      this is the C++-standard "type changes as you unwind" behavior),
//   2) destroy the four sub-OZChannels in REVERSE construction order
//      (edge_3, edge_2, edge_1, edge_0),
//   3) tail-jump into the base class dtor OZCompoundChannel::~OZCompoundChannel
//      which is a `U` import from ProChannel and will unwind the base storage
//      (calling OZChannelBase::~OZChannelBase in turn).
//
// Because OZChannel::~OZChannel (ProChannel D2) and
// OZCompoundChannel::~OZCompoundChannel are BOTH un-ported at the time this
// file lands, `destroy()` below THROWS to keep the gap loud (per PORTING_SPEC
// rule 3). The struct-shape and reverse-order are still recorded so a later
// pass that transcribes the base dtors gets a mechanically-correct scaffold.

// ---------------------------------------------------------------------------
// Frontier imports — the four sub-slots hold real OZChannel instances built
// by a ctor that isn't emitted as a distinct symbol in Ozone. Until the ctor
// lands, edges[] are typed as OZChannel (frontier itself) so no caller can
// dereference them without hitting an already-throwing method.
// ---------------------------------------------------------------------------
import type { OZChannel } from "./OZChannel";
// OZCompoundChannel is the base sub-object; its dtor is the tail call. Kept
// as a `type import` only so nothing runtime references it from here.
import type { OZCompoundChannel } from "./OZCompoundChannel";

/**
 * OZChannelCrop instance shape — proven by the D1 dtor @0x9a6c0.
 *
 * Note: this interface reflects only what the D1 dtor touches. The base
 * class fields (0x18..0x87) are decoded by OZCompoundChannel / OZChannel /
 * OZChannelBase — see those files.
 */
export interface OZChannelCropLayout {
  /** +0x00: primary vtable pointer (installed = OZChannelCrop_vtable+0x10, @Ozone 0x9a6d0). */
  _vtable_primary: unknown;
  /** +0x10: secondary vtable pointer (installed = OZChannelCrop_vtable+0x358, @Ozone 0x9a6dd). */
  _vtable_secondary: unknown;
  /** Base sub-object OZCompoundChannel — occupies 0x18..0x87 (dtor tail-calls @Ozone 0x9a71a). */
  _base: OZCompoundChannel;
  /** +0x88: first crop-edge sub-channel  (each edge is a full OZChannel, size 0x98). */
  edge0: OZChannel;
  /** +0x120: second crop-edge sub-channel. */
  edge1: OZChannel;
  /** +0x1B8: third crop-edge sub-channel. */
  edge2: OZChannel;
  /** +0x250: fourth crop-edge sub-channel. */
  edge3: OZChannel;
}

/**
 * OZChannelCrop — the only decoded surface is the destructor. Every other
 * method is a frontier (ctor / clone / copy / getObjCWrapperName / setValue /
 * getValue) — decoded in ProChannel and not yet ported. Any real
 * construction MUST go through those un-ported ctors, so the class exposes
 * NO usable constructor from TS.
 */
export class OZChannelCrop {
  /**
   * Vtable-installed offsets read directly from the D1 dtor at @Ozone
   * 0x9a6d0 and @Ozone 0x9a6dd (see file header). These are the SAME
   * offsets ANY ctor for this class will install; recorded here so the
   * (later) ctor port can be cross-checked mechanically.
   */
  static readonly VTABLE_PRIMARY_OFFSET   = 0x10;   // @Ozone 0x9a6d0  `leaq 0x10(%rax), %rcx`
  static readonly VTABLE_SECONDARY_OFFSET = 0x358;  // @Ozone 0x9a6dd  `addq $0x348, %rax` (0x10+0x348)

  /**
   * Byte offsets of the four owned sub-OZChannel members inside an
   * OZChannelCrop. Values are read directly from the D1 dtor bodies at
   * @Ozone 0x9a6e1 (edge3), @Ozone 0x9a6ed (edge2), @Ozone 0x9a6f9 (edge1),
   * @Ozone 0x9a705 (edge0).
   */
  static readonly EDGE_OFFSETS = [0x88, 0x120, 0x1B8, 0x250] as const;

  /**
   * OZChannelCrop::~OZChannelCrop() — @Ozone 0x000000000009a6c0 (D1 dtor).
   *
   * TRANSCRIPTION (line-for-line from the disasm above):
   *   this->_vtable_primary   = &vtable_for_OZChannelCrop[+0x010]   (@Ozone 0x9a6d0/0x9a6d4)
   *   this->_vtable_secondary = &vtable_for_OZChannelCrop[+0x358]   (@Ozone 0x9a6d7/0x9a6dd)
   *   OZChannel::~OZChannel(&this->edge3)                            (@Ozone 0x9a6e1/0x9a6e8)
   *   OZChannel::~OZChannel(&this->edge2)                            (@Ozone 0x9a6ed/0x9a6f4)
   *   OZChannel::~OZChannel(&this->edge1)                            (@Ozone 0x9a6f9/0x9a700)
   *   OZChannel::~OZChannel(&this->edge0)                            (@Ozone 0x9a705/0x9a70c)
   *   tail: OZCompoundChannel::~OZCompoundChannel(this)              (@Ozone 0x9a71a)
   *
   * `OZChannel::~OZChannel` and `OZCompoundChannel::~OZCompoundChannel` are
   * both symbol-stub calls into ProChannel (undefined imports in Ozone):
   *   __ZN9OZChannelD2Ev            @stub 0x6df480
   *   __ZN17OZCompoundChannelD2Ev   @stub 0x6de2b6
   * Both are frontier — no ProChannel dtor bodies have been transcribed
   * into raw-port/src/channels/OZChannel.ts or OZCompoundChannel.ts yet. So
   * this method throws to keep the gap visible per PORTING_SPEC rule 3.
   */
  static destroy(_this: OZChannelCropLayout): void {
    throw new Error(
      "OZChannelCrop::~OZChannelCrop @Ozone 0x9a6c0 not yet fully transcribed: " +
      "OZChannel::~OZChannel (ProChannel stub 0x6df480 for __ZN9OZChannelD2Ev @ProChannel not yet transcribed) and " +
      "OZCompoundChannel::~OZCompoundChannel (ProChannel stub 0x6de2b6 for __ZN17OZCompoundChannelD2Ev @ProChannel not yet transcribed) " +
      "have not been ported. Reverse-order sub-object destruction shape is recorded " +
      "in this file's header and in EDGE_OFFSETS."
    );
  }

  // Guard: no TS constructor is exposed. The FCP C1/C2 ctors are not
  // emitted as distinct Ozone symbols (they live in ProChannel or are
  // inlined at call sites) and their bodies are un-ported. Providing a
  // default TS `constructor()` here would silently create objects with the
  // wrong shape — that is a rule-3 shortcut. Instead: private + throwing
  // citing the address it defers to.
  private constructor() {
    throw new Error(
      "OZChannelCrop::OZChannelCrop @Ozone 0x9a6c0 (C1/C2 not emitted as distinct symbols) " +
      "not yet transcribed. Ctors live in ProChannel (undefined import in Ozone) " +
      "and are frontier — decode them before instantiating."
    );
  }
}
