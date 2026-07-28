// HGCameraLogEncode.ts — Helium @0x105c60/0x105ca0 (C2/C1), 0x105ce0/0x105d20 (D2/D1),
// 0x105d60 (D0), 0x105db0 (GetOutput).
//
// A render node that, when asked for its output, dispatches on a
// HGColorConform::hgColorConformRAWToLogEncoding enum (stored at this+0x1a0,
// set in the constructor) to construct one of several camera-specific
// log-encoding Encode nodes (HgcAppleLog_encode, HGSonySLog3::Encode,
// HGCanonLog::Encode, HGBMDFilmGen5::Encode, HGAppleLog::Encode,
// HGNikonNLog::Encode, HGPanasonicVLog::Encode, HGDJIDLog::Encode,
// HgcLogVideo_encode) which wraps the upstream renderer input and is
// installed at this+0x198 as the actual output.
//
// Layout (inherits HGNode):
//   +0x000  vtable ptr (leaq 0x914cc8(%rip) @Helium 0x105cb1)
//   +0x198  output-node pointer (installed by GetOutput @Helium 0x105dca)
//   +0x1a0  hgColorConformRAWToLogEncoding enum value (movl %ebx @0x105cc6)
//
// Every camera-log Encode class referenced by the switch is an undecoded
// frontier at time of this port; each case body raises with the exact
// callsite @0xADDR and the encoder class it must instantiate.

/**
 * HGNode::HGNode() — Helium @0x105c6c / @0x105cac (referenced by
 * HGCameraLogEncode C2/C1). Base-class construction is an undecoded frontier
 * in this port; other Helium ports inline the same throw-stub pattern.
 */
function HGNode_ctor(_self: object): void { // @Helium 0x105c6c / 0x105cac
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0x105c6c / 0x105cac — HGCameraLogEncode C2/C1)",
  );
}

/**
 * HGNode::~HGNode() — Helium @0x105d1a / @0x105d88 (referenced by
 * HGCameraLogEncode D2 / D0). Base-class destruction is an undecoded frontier.
 */
function HGNode_dtor(_self: object): void { // @Helium 0x105d1a / 0x105d88
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0x105d1a / 0x105d88 — HGCameraLogEncode D2/D0)",
  );
}

/**
 * HGColorConform::hgColorConformRAWToLogEncoding — enum passed as ctor arg
 * and reused by GetOutput's jump table (decl %ecx; cmpl $0xc, %ecx; ja default
 * @Helium 0x105dd8-0x105ddd). The subtracted-1 index 0..12 selects a case in
 * the 13-entry jump table at Helium 0x1060d0 (leaq 0x2e6(%rip) @0x105de3).
 * Values 1..13 correspond to a specific camera-log encoder; value 0 (or > 13)
 * takes the "no encoder" pass-through path (@Helium 0x106051).
 *
 * The concrete numeric label→encoder mapping is not yet decoded from
 * HGColorConform. This port faithfully preserves the ordinal→encoder
 * dispatch as observed in the jump table without renaming the ordinals.
 */
export type HgColorConformRAWToLogEncoding = number;

/**
 * HGRenderer — undecoded frontier; only referenced by GetOutput via
 * `HGRenderer::GetInput(HGNode*, int)` @Helium 0x105dc5 and by a virtual
 * dispatch on the constructed encoder at vtable slot +0x78 @Helium 0x105e45
 * (the encoder's install-input method) and slot +0x10 @Helium 0x10605e
 * (the pass-through node's cleanup/finalize).
 */
export interface HGRenderer {
  GetInput(node: HGCameraLogEncode, kind: number): unknown;
}

/**
 * HGCameraLogEncode — Helium render node.
 *
 * ctor: HGCameraLogEncode(HGColorConform::hgColorConformRAWToLogEncoding)
 *       @Helium 0x105c60 (C2) / 0x105ca0 (C1).
 * dtor: ~HGCameraLogEncode() @Helium 0x105ce0 (D2) / 0x105d20 (D1) / 0x105d60 (D0).
 * GetOutput(HGRenderer*) @Helium 0x105db0.
 */
export class HGCameraLogEncode {
  /** +0x198 — installed output node (HGNode* subclass). */
  public output: unknown = null;
  /** +0x1a0 — hgColorConformRAWToLogEncoding enum. */
  public encoding: HgColorConformRAWToLogEncoding;

  /**
   * HGCameraLogEncode::HGCameraLogEncode(hgColorConformRAWToLogEncoding)
   * — Helium @0x105c60 (C2) and @0x105ca0 (C1). Both are identical:
   *
   *   callq __ZN6HGNodeC2Ev          # HGNode::HGNode() @0x105c6c/0x105cac
   *   leaq  0x914cc8(%rip), %rax     # vtable ptr @0x105c71/0x105cb1
   *   movq  %rax, (%r14)             # this->vptr = vtable
   *   movq  $0x0, 0x198(%r14)        # this->output = null   @0x105c7b/0x105cbb
   *   movl  %ebx, 0x1a0(%r14)        # this->encoding = arg  @0x105c86/0x105cc6
   */
  public constructor(encoding: HgColorConformRAWToLogEncoding) {
    HGNode_ctor(this);
    this.output = null;
    this.encoding = encoding;
  }

  /**
   * HGCameraLogEncode::~HGCameraLogEncode() — Helium @0x105ce0 (D2) /
   * @0x105d20 (D1). D0 @0x105d60 is the deleting-dtor which also frees.
   *
   * D2 body @0x105ce0-0x105d1e:
   *   leaq  0x914cb0(%rip), %rax          # base vtable (rewrite of vptr)
   *   movq  %rax, (%rdi)
   *   movq  0x198(%rdi), %rdi             # this->output
   *   testq %rdi, %rdi
   *   je    (skip)
   *   movq  (%rdi), %rax
   *   callq *0x18(%rax)                   # output->~vtable[+0x18]  (virtual dtor)
   *   ...
   *   jmp   __ZN6HGNodeD2Ev                # HGNode::~HGNode() @0x105d1a
   */
  public destroy(): void {
    if (this.output !== null) {
      // virtual dispatch — output->vtable[+0x18] (deleting dtor slot) @Helium 0x105d05
      throw new Error(
        "HGCameraLogEncode::~HGCameraLogEncode: output virtual dtor at vtable+0x18 " +
        "not yet transcribed (@Helium 0x105ce0-0x105d1e)",
      );
    }
    HGNode_dtor(this);
  }

  /**
   * HGCameraLogEncode::~HGCameraLogEncode() [deleting] — Helium @0x105d60 (D0).
   *
   *   ...D2 body identical to above @0x105d60-0x105d8d...
   *   callq __ZN6HGNodeD2Ev              @0x105d88
   *   jmp   __ZN8HGObjectdlEPv           # HGObject::operator delete @0x105d96
   */
  public destroyAndDelete(): void {
    this.destroy();
    // @Helium 0x105d96 — jmp __ZN8HGObjectdlEPv (HGObject::operator delete)
    throw new Error(
      "HGCameraLogEncode::~HGCameraLogEncode [deleting]: HGObject::operator delete " +
      "not yet transcribed (@Helium 0x105d96)",
    );
  }

  /**
   * HGCameraLogEncode::GetOutput(HGRenderer*) — Helium @0x105db0.
   *
   *   callq  HGRenderer::GetInput(this, 0)   @0x105dc5
   *   movq   %rax, 0x198(%r14)                # this->output = input   @0x105dca
   *   movl   0x1a0(%r14), %ecx                # ecx = this->encoding   @0x105dd1
   *   decl   %ecx                             # ecx = enum - 1
   *   cmpl   $0xc, %ecx
   *   ja     0x106058                         # >12 → default pass-through @0x105ddd
   *   leaq   0x2e6(%rip), %rax                # jump table base = 0x1060d0
   *   movslq (%rax,%rcx,4), %rcx
   *   addq   %rax, %rcx
   *   jmpq   *%rcx                            @0x105df1
   *
   * Jump-table entries (decoded from Helium 0x1060d0):
   *   case 1  → 0x105df3  (HgcAppleLog_encode ctor, +HGNode wrapper, size 0x1b0)
   *   case 2  → 0x105f57  (HGNikonNLog::Encode(1), size 0x1c0)
   *   case 3  → 0x105eed  (HGBMDFilmGen5::Encode(1), size 0x1b0)
   *   case 4  → 0x105f0c  (HGCanonLog::Encode(1,1,1,0), size 0x1c0)
   *   case 5  → 0x105e72  (HGCanonLog::Encode(1,1,1,1), size 0x1c0)
   *   case 6  → 0x105f7b  (HGAppleLog::Encode(1,1), size 0x1b0)
   *   case 7  → 0x105f9a  (HgcLogVideo_encode wrapper w/ HGNode, size 0x1c0,
   *                        also sets +0x1b0 = 1)
   *   case 8  → 0x105f38  (HGDJIDLog::Encode(1), size 0x1b0)
   *   case 9  → 0x106017  (HGPanasonicVLog::Encode(1), size 0x1b0)
   *   case 10 → 0x105ec7  (HGSonySLog3::Encode(1,0,1), size 0x1d0)
   *   case 11 → 0x105ff7  (HGSonySLog3::Encode(1,0,0), size 0x1d0)
   *   case 12 → 0x105e49  (HGSonySLog3::Encode(1,1,1), size 0x1d0)
   *   case 13 → 0x105ea1  (HGSonySLog3::Encode(1,1,0), size 0x1d0)
   *
   * After the encoder object is constructed (test %rbx; jz default @0x106031),
   * the merge path @0x106036 installs it as the new output:
   *   movq  0x198(%r14), %rdx      # input from HGRenderer::GetInput
   *   movq  (%rbx), %rax           # encoder vtable
   *   movq  %rbx, %rdi
   *   xorl  %esi, %esi
   *   callq *0x78(%rax)            # encoder->vtable[+0x78](this=encoder, 0, input)
   *   movq  %rbx, 0x198(%r14)      # this->output = encoder
   *   jmp   0x106068               # return this->output
   *
   * Default path @0x106051 (encoder==null OR enum out of range):
   *   movq  0x198(%r14), %rax      # rax = this->output (the GetInput result)
   *   movq  (%rax), %rcx
   *   callq *0x10(%rcx)            # output->vtable[+0x10]()
   *   movq  0x198(%r14), %rbx      # reload
   *   return this->output
   */
  public GetOutput(renderer: HGRenderer): unknown {
    // @Helium 0x105dc5 — HGRenderer::GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x105dca — this->output = input
    this.output = input;

    const idx = (this.encoding | 0) - 1; // @Helium 0x105dd1-0x105dd8

    // @Helium 0x105ddd — cmpl $0xc, %ecx; ja default (unsigned >12 → 0..12 valid)
    if ((idx >>> 0) > 12) {
      // fall through to default pass-through @Helium 0x106051
      return this.defaultPath();
    }

    // @Helium 0x105de3-0x105df1 — jump table dispatch (decoded from 0x1060d0).
    // Every branch here allocates a specific undecoded frontier Encode class,
    // then merges at 0x106031/0x106036 to install it via vtable+0x78. Because
    // the frontier encoder classes are not yet transcribed, each case raises.
    switch (idx + 1) {
      case 1:
        // @Helium 0x105df3 — new 0x1b0; HGNode::HGNode(); vptr = 0x912e31(rip);
        // then new 0x1a0; HgcAppleLog_encode::HgcAppleLog_encode()  @0x105e2d
        throw new Error(
          "HGCameraLogEncode::GetOutput case 1: HgcAppleLog_encode + HGNode wrapper " +
          "not yet transcribed (@Helium 0x105df3 → 0x105e2d)",
        );
      case 2:
        // @Helium 0x105f57 — new 0x1c0; HGNikonNLog::Encode(1)  @0x105f4d
        throw new Error(
          "HGCameraLogEncode::GetOutput case 2: HGNikonNLog::Encode(SceneColorimetry=1) " +
          "not yet transcribed (@Helium 0x105f57 → 0x105f4d)",
        );
      case 3:
        // @Helium 0x105eed — new 0x1b0; HGBMDFilmGen5::Encode(1)  @0x105f02
        throw new Error(
          "HGCameraLogEncode::GetOutput case 3: HGBMDFilmGen5::Encode(SceneColorimetry=1) " +
          "not yet transcribed (@Helium 0x105eed → 0x105f02)",
        );
      case 4:
        // @Helium 0x105f0c — new 0x1c0; HGCanonLog::Encode(1,1,1,0)  @0x105f2e
        throw new Error(
          "HGCameraLogEncode::GetOutput case 4: HGCanonLog::Encode(1,1,1,0) " +
          "not yet transcribed (@Helium 0x105f0c → 0x105f2e)",
        );
      case 5:
        // @Helium 0x105e72 — new 0x1c0; HGCanonLog::Encode(1,1,1,1)  @0x105e97
        throw new Error(
          "HGCameraLogEncode::GetOutput case 5: HGCanonLog::Encode(1,1,1,1) " +
          "not yet transcribed (@Helium 0x105e72 → 0x105e97)",
        );
      case 6:
        // @Helium 0x105f7b — new 0x1b0; HGAppleLog::Encode(1,1)  @0x105f71
        throw new Error(
          "HGCameraLogEncode::GetOutput case 6: HGAppleLog::Encode(1,1) " +
          "not yet transcribed (@Helium 0x105f7b → 0x105f71)",
        );
      case 7:
        // @Helium 0x105f9a — new 0x1c0; HGNode::HGNode(); vptr = 0x9137ca(rip);
        // then new 0x1a0; HgcLogVideo_encode::HgcLogVideo_encode()  @0x105fd4;
        // set this+0x1b0 = 1 @0x105feb
        throw new Error(
          "HGCameraLogEncode::GetOutput case 7: HgcLogVideo_encode + HGNode wrapper " +
          "not yet transcribed (@Helium 0x105f9a → 0x105fd4)",
        );
      case 8:
        // @Helium 0x105f38 — new 0x1b0; HGDJIDLog::Encode(1)  @0x105f90
        throw new Error(
          "HGCameraLogEncode::GetOutput case 8: HGDJIDLog::Encode(SceneColorimetry=1) " +
          "not yet transcribed (@Helium 0x105f38 → 0x105f90)",
        );
      case 9:
        // @Helium 0x106017 — new 0x1b0; HGPanasonicVLog::Encode(1)  @0x10602c
        throw new Error(
          "HGCameraLogEncode::GetOutput case 9: HGPanasonicVLog::Encode(SceneColorimetry=1) " +
          "not yet transcribed (@Helium 0x106017 → 0x10602c)",
        );
      case 10:
        // @Helium 0x105ec7 — new 0x1d0; HGSonySLog3::Encode(1,0,1)  @0x105ebd
        throw new Error(
          "HGCameraLogEncode::GetOutput case 10: HGSonySLog3::Encode(1,0,1) " +
          "not yet transcribed (@Helium 0x105ec7 → 0x105ebd)",
        );
      case 11:
        // @Helium 0x105ff7 — new 0x1d0; HGSonySLog3::Encode(1,0,0)  @0x106010
        throw new Error(
          "HGCameraLogEncode::GetOutput case 11: HGSonySLog3::Encode(1,0,0) " +
          "not yet transcribed (@Helium 0x105ff7 → 0x106010)",
        );
      case 12:
        // @Helium 0x105e49 — new 0x1d0; HGSonySLog3::Encode(1,1,1)  @0x105e68
        throw new Error(
          "HGCameraLogEncode::GetOutput case 12: HGSonySLog3::Encode(1,1,1) " +
          "not yet transcribed (@Helium 0x105e49 → 0x105e68)",
        );
      case 13:
        // @Helium 0x105ea1 — new 0x1d0; HGSonySLog3::Encode(1,1,0)  @0x105ebd
        throw new Error(
          "HGCameraLogEncode::GetOutput case 13: HGSonySLog3::Encode(1,1,0) " +
          "not yet transcribed (@Helium 0x105ea1 → 0x105ebd)",
        );
      default:
        return this.defaultPath();
    }
  }

  /**
   * Default pass-through path @Helium 0x106051-0x106068.
   * Called when the encoding ordinal is 0 or > 13, or when a case body
   * would install a null encoder. Invokes output->vtable[+0x10]() on the
   * upstream input and returns this->output.
   */
  private defaultPath(): unknown {
    // @Helium 0x106058 — movq (%rax), %rcx; callq *0x10(%rcx)
    throw new Error(
      "HGCameraLogEncode::GetOutput default: output->vtable[+0x10]() virtual dispatch " +
      "on undecoded upstream HGNode subclass not yet transcribed (@Helium 0x106051-0x106061)",
    );
  }
}
