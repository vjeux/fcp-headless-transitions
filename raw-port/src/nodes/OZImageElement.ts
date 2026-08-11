// OZImageElement — an image/media/generator/drop-zone leaf. Extends OZElement.
// Faithful port of Ozone OZImageElement::parseElement @0x5f8770.
//   - base OZElement::parseElement (@0x5f878f)
//   - minor own cases (0x5, 0x1) + a getAsString read.
// Like every node, the SUBSTANTIVE data (media/clip ref, Drop Zone Type, transform, colour) lives
// in the <parameter> CHANNEL tree parsed by OZChannelObjectRoot (channels/) — populated onto
// `channels` when the channel-tree driver is wired. OZImageElementScope: id 0x0 = "type".
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZElement } from "./OZElement.js";
import { OZChannel } from "../channels/OZChannel.js";

export class OZImageElement extends OZElement {
  /** Root of this node's <parameter> channel tree (transform, media ref, colour, ...). */
  channelRoot?: OZChannel;

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZElement::parseElement (@0x5f878f)
    // OZImageElement-specific tags (0x1/0x5) are advanced; the media/transform come from the
    // <parameter> channel subtree handled by the channel driver.
  }

  /**
   * `OZImageElement::setIsPassthroughPlaceholder(int)` @Ozone 0xd9090
   * (__ZN14OZImageElement27setIsPassthroughPlaceholderEi).
   *
   * Full transcription — every instruction, in order:
   *
   *   0xd9090  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0xd9091  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0xd9094  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0xd9095  retq                       ; void return
   *   0xd9096  nopw  %cs:(%rax,%rax)      ; alignment padding, not executed
   *
   * An EMPTY BODY — the four instructions are the frame prologue/epilogue and
   * nothing else. Neither `%rdi` (`this`) nor `%esi` (the `int` argument) is
   * read, no field is written, no flag is set, and there is no callee of any
   * kind (`depgraph.py deps` lists nothing). The argument is accepted and
   * DISCARDED by the machine.
   *
   * This is the base implementation of a virtual hook: a subclass (or another
   * element type) overrides it to record the passthrough-placeholder state,
   * while `OZImageElement` itself keeps no such slot — exactly the shape of the
   * landed no-op hooks `OZChannelBase::undoWillReplace()` @0x1fbe0 and
   * `undoDidReplace()` @0x1fbf0. Writing a field here would INVENT state the
   * binary does not have.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZImageElement27setIsPassthroughPlaceholderEi.s
   *   (6 lines)
   */
  setIsPassthroughPlaceholder(_isPassthroughPlaceholder: number): void {
    // @0xd9090-0xd9095 — prologue, epilogue, void return. The `int` argument
    // in %esi is never read: the body is intentionally empty.
  }
}
