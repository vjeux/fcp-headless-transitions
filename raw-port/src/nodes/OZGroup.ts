// OZGroup — a container scene node (<layer>/<group>). Extends OZElement.
// Faithful port of Ozone OZGroup::parseElement @0xeea80. OZGroup's distinguishing role is being a
// pure CONTAINER; child-scene-node recursion (0x3d layer / 0x3e scenenode / 0x3f group -> createSceneNode
// -> recurse -> registerNode, @0xeeb3b/@0xeeda9) is handled UNIVERSALLY in the OZSceneNode base
// (parseSceneNode recurses on every node's directChildren 'scenenode'), so OZGroup adds no extra
// element handling beyond the base + OZElement (mask/override). It exists as the concrete class for
// <layer>/<group> elements (vs OZImageElement for media <scenenode>s).
import { OZElement } from "./OZElement.js";
import type { OZSceneNode } from "./OZSceneNode.js";

export class OZGroup extends OZElement {
  /**
   * @Ozone +0x3b8 — pointer to this node's PARENT scene node (an
   * `OZSceneNode*`), read by `isAtRootLevel()` @0xf17d0 via
   * `movq 0x3b8(%rdi), %rdi`. Null when the node has no parent (i.e. it is a
   * top-level node in the scene). Only the offset actually dereferenced by
   * this getter is claimed here (Rule 5); the field is typed as the base
   * `OZSceneNode` because the getter feeds it straight to
   * `dynamic_cast<OZGroup*>` (which takes the object's static
   * `OZSceneNode*`/`__ZTI11OZSceneNode` source type — see disasm @0xf17e0).
   */
  parent_at_0x3b8: OZSceneNode | null = null;

  /**
   * `OZGroup::isAtRootLevel() const` @Ozone 0xf17d0
   *   — __ZNK7OZGroup13isAtRootLevelEv
   *
   * Faithful transcription of the body. Load the parent pointer at +0x3b8; if
   * it is null the node is at the root (return true). Otherwise
   * `dynamic_cast<OZGroup*>(parent)` and return true iff the cast FAILS — i.e.
   * the parent is NOT itself an OZGroup, meaning this group is not nested
   * inside another group and therefore sits at root level.
   *
   *   0xf17d0  movq   0x3b8(%rdi), %rdi         ; rdi = this->parent (+0x3b8)
   *   0xf17d7  testq  %rdi, %rdi
   *   0xf17da  je     0xf17fd                   ; parent == null -> true
   *   0xf17dc  pushq  %rbp
   *   0xf17dd  movq   %rsp, %rbp
   *   0xf17e0  leaq   __ZTI11OZSceneNode(%rip), %rsi  ; src type = OZSceneNode
   *   0xf17e7  leaq   __ZTI7OZGroup(%rip), %rdx       ; dst type = OZGroup
   *   0xf17ee  xorl   %ecx, %ecx                ; hint = 0 (no known offset)
   *   0xf17f0  callq  ___dynamic_cast(parent, OZSceneNode, OZGroup, 0)
   *   0xf17f5  testq  %rax, %rax
   *   0xf17f8  sete   %al                       ; al = (cast result == null)
   *   0xf17fb  popq   %rbp
   *   0xf17fc  retq                             ; return al
   *   0xf17fd  movb   $0x1, %al                 ; null-parent branch -> true
   *   0xf17ff  retq
   *
   * FRONTIER CALLEE
   *   * ___dynamic_cast @ProCore/libc++abi stub 0x6dfd0e — the C++ RTTI
   *     runtime cast. Faithfully modeled as `parent instanceof OZGroup`
   *     (a `dynamic_cast<OZGroup*>` on an `OZSceneNode*` source returns
   *     non-null exactly when the runtime type is-an OZGroup), the same
   *     policy used for every ___dynamic_cast in this port (see
   *     OZConstantNode_compare @0x29ad5). `sete %al` inverts that:
   *     return true iff the cast is null, i.e. `!(parent instanceof OZGroup)`.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK7OZGroup13isAtRootLevelEv.s
   */
  isAtRootLevel(): boolean {
    // @0xf17d0 movq 0x3b8(%rdi), %rdi — rdi = this->parent.
    const parent = this.parent_at_0x3b8;
    // @0xf17d7..0xf17da testq %rdi,%rdi; je 0xf17fd — null parent -> true.
    if (parent === null) {
      // @0xf17fd movb $0x1, %al; retq — root level.
      return true;
    }
    // @0xf17e0..0xf17f0 ___dynamic_cast<OZGroup*>(parent) (src=OZSceneNode).
    // @0xf17f5..0xf17f8 testq %rax,%rax; sete %al — true iff cast == null,
    // i.e. the parent is NOT an OZGroup (so this group is at root level).
    return !(parent instanceof OZGroup);
  }
}
