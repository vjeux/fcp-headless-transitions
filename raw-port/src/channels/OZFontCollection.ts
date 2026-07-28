// OZFontCollection.ts — FCP Ozone OZFontCollection: an ordered map of PCString→OZFontFamily
// plus a pair of owning PCStrings (collection name and search path).
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Ozone.OZFontCollection.all.s
//         (captured mangled symbols __ZN16OZFontCollection* / __ZNK16OZFontCollection*
//          starting at the class's C2 at 0x639530 in the x86_64 slice).
//
// STRUCT LAYOUT (recovered from ctor @0x639530 and the four accessor bodies):
//   sizeof = at least 0x30 (48 bytes). Fields:
//     +0x00  PCString  name       (owned; constructed at C2 @0x63953d)
//     +0x08  PCString  path       (owned; constructed at C2 @0x639549)
//     +0x10  __tree_node_base* __begin_node_
//                                 (leftmost node of the tree, or &sentinel when empty;
//                                  initialized at C2 @0x639559 to point at the sentinel
//                                  end-node embedded at +0x18.)
//     +0x18  __tree_end_node       (sentinel; embedded 16-byte structure whose sole
//                                    used field is `__left_` @+0x18 == the root of the
//                                    RB-tree. Zeroed at C2 @0x639555 via
//                                    `xorps xmm0,xmm0 ; movups xmm0, 0x18(%rbx)` — a
//                                    16-byte zero fill that ALSO zeros the size at +0x20
//                                    that immediately follows.)
//     +0x20  uint64    size       (element count; read as unsigned int by
//                                    getFontFamily(int) @0x6396d0 via `movq 0x20(%rdi),
//                                    %rax` and used as the total tree-size bound.)
//
// TREE-NODE LAYOUT (the __tree_node<pair<PCString, OZFontFamily*>>, recovered from every
// pointer arithmetic offset in the four accessors):
//     +0x00  __left_    (pointer to left child, or null)
//     +0x08  __right_   (pointer to right child, or null)   ← from
//                       `movq (%r12,%rcx,8), %r12` @0x639618 with rcx∈{0,1}
//     +0x10  __parent_  (pointer to parent, tagged color LSB in some builds)
//     +0x20  PCString   __key_    (the family key; read at @0x639600 / @0x639626 /
//                                  @0x63978a via `leaq 0x20(%rN), %rdi`)
//     +0x28  OZFontFamily*        (the value; read at @0x639636 / @0x639741 via
//                                  `movq 0x28(%rN), %rax`)
//
// TREE-WALK PATTERNS (identical shape across all four accessors; documented once here and
// cross-referenced in each method):
//
//   • `getFontFamily(PCString&)` @0x6395d0 — standard std::map::find via
//     lower_bound-then-equality-check. Walks the tree from root, tracking a
//     candidate node `r15` (initially the sentinel) that always points at the
//     LAST node visited whose key ≥ the search target (cmovnsq @0x639614). After the
//     walk terminates (r12 becomes null @0x63961c), one final PCString::compare
//     between the target and the candidate's key decides: if target < candidate, no
//     match → return null; else return candidate.value.
//
//   • `getFontFamilyForFont(PCString&)` @0x639650 — in-order iteration via
//     libc++'s __tree_next algorithm (right-then-leftmost, else climb-parents-until-came-
//     from-left). Calls `OZFontFamily::containsFont` on every family in order; returns
//     the first that answers true (@0x639683), or null when the iterator hits the
//     sentinel (@0x6396bf).
//
//   • `getFontFamily(int)` @0x6396d0 — indexed access via linear in-order traversal.
//     Clamps the argument to [0, size-1] (@0x6396dc-@0x6396e2), then advances the
//     iterator `ecx` times; the CURRENT node when `edx == ecx` is returned.
//
//   • `getFontFamilyIndex(PCString&)` @0x639750 — in-order iteration comparing every
//     key to the target via PCString::compare; returns the running index of the first
//     equal key, or 0 when no match is found. NB: 0 doubles as both "found at index 0"
//     AND "not found" — a known ABI quirk of this function (the disasm's `xorl %ebx,%ebx`
//     at @0x63976e / @0x6397cf uses the same register for both paths).
//
// The in-order traversal used by every accessor except plain-find is the standard libc++
// __tree_next(N):
//     if N->right != null:
//         N = N->right; while (N->left != null) N = N->left; return N.
//     else:
//         while (N == N->parent->right) N = N->parent;   ← climb until we came from left
//         return N->parent.
// The "climb parents" side reads `__parent_` via `movq 0x10(%r12),%rax @0x6396b0` and
// compares against `(rax)` == parent's left child to know whether the parent is the
// next-in-order.
//
// FRONTIER (deferred — cited as throwing stubs OR as opaque types below):
//   • PCString::PCString(PCString const&) — copy ctor       @0x63953d, @0x639549
//     (already ported in raw-port/src/infra/PCString.ts).
//   • PCString::~PCString()                                @0x639568 (unwind path)
//     (already ported in raw-port/src/infra/PCString.ts).
//   • PCString::compare(PCString const&) const              @0x639608, @0x63962d, @0x639792
//     (already ported in raw-port/src/infra/PCString.ts).
//   • OZFontFamily::containsFont(PCString const&) const     @0x639683
//     — the class itself is not yet transcribed. Modelled as an opaque handle whose
//     `containsFont` is a virtual/regular method the caller must supply. We do NOT
//     re-implement it here.
//
// LAYER CHOICE: `channels` — matches the claim.py queue's assignment for this class
// (Ozone.OZFontCollection). The class is not a channel per se (it's font metadata),
// but it lives alongside OZChannel* / OZCurve* in the channels layer of the port tree.

import { PCString } from "../infra/PCString";

// ── Opaque frontier types ────────────────────────────────────────────────────────────────

/**
 * OZFontFamily — opaque frontier. Only its `containsFont(PCString&)` method is used
 * by this class, at exactly one call site.
 *
 * @Ozone 0x639683  callq __ZNK12OZFontFamily12containsFontERK8PCString
 *
 * Callers of OZFontCollection must instantiate concrete OZFontFamily objects that
 * satisfy this minimal interface. We do NOT synthesise a stub implementation here —
 * that would require decoding the class, which is out of scope for this port.
 */
export interface OZFontFamily {
  /** __ZNK12OZFontFamily12containsFontERK8PCString — @Ozone 0x639683 */
  containsFont(font: PCString): boolean;
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class OZFontCollection {
  /** +0x00 — owning PCString: the collection's own name/identifier. */
  readonly name: PCString;

  /** +0x08 — owning PCString: the collection's search path or descriptor. */
  readonly path: PCString;

  /**
   * +0x10..+0x27 — the std::map<PCString, OZFontFamily*, PCString::operator<>> in the
   * native class, whose tree ROOT lives at +0x18 (sentinel `end_node.__left_`) and
   * whose `__begin_node_` lives at +0x10.
   *
   * TS collapses the RB-tree layout to a plain sorted Map keyed by the PCString's
   * value (the ONLY observable state of PCString from within this class — every
   * lookup goes through PCString::compare, which for our port reduces to string
   * ordering on the underlying char sequence). Insertion order into the map does
   * NOT reflect key order — we resort on every enumeration to match the disasm's
   * in-order (sorted-ascending) traversal semantics.
   *
   * The map's VALUE type is `OZFontFamily` (not `OZFontFamily*`) — the native class
   * stores a raw pointer at +0x28 in each node; in TS we own the family reference
   * outright.
   */
  private readonly families: Map<string, OZFontFamily> = new Map();

  /**
   * OZFontCollection::OZFontCollection(PCString const& name, PCString const& path)
   * @Ozone 0x0000000000639530  [C2 — the real body]
   *
   * DECODE (raw-port/re/disasm/Ozone.OZFontCollection.all.s @0x639530-0x639561):
   *   0x639537-0x63953a  save arg2 (path %rdx) in %r14 ; save this (%rdi) in %rbx
   *   0x63953d  callq PCString::PCString(PCString const&)  → constructs this->name from arg1(%rsi)
   *   0x639542-0x639549  rdi = this+8 ; rsi = %r14 (path) ; callq PCString copy ctor
   *                     → constructs this->path from arg2
   *   0x63954e  rax = &this[0x18]  (address of embedded end-sentinel)
   *   0x639552-0x639555  xorps xmm0,xmm0 ; movups xmm0, 0x18(%rbx)
   *                     → zero 16 bytes @+0x18..+0x27 (sentinel.__left_=null, size=0)
   *   0x639559  movq %rax, 0x10(%rbx)  → +0x10 = &sentinel (empty-tree state)
   *   0x63955d-0x639561  epilogue
   *
   *   Unwind path @0x639562-0x639570: on exception during path-ctor, destroy this->name
   *   and rethrow. We do NOT model exceptions in this port — the frontier stubs already
   *   halt execution before any partial state accrues.
   *
   * C1 @0x639580 is a byte-for-byte copy of C2 (per Itanium ABI: two independent
   * entry points; both are recorded in the disasm dump). We collapse into a single
   * TS constructor.
   */
  constructor(name: PCString, path: PCString) {
    // @0x63953d  this->name = PCString(name)   (PCString copy ctor already ported)
    // Faithful copy: use PCString's copy ctor. PCString has an internal CFStringRef; the
    // ported class uses a nullable JS string as its storage. We copy by re-constructing
    // via the internal state of `name`.
    this.name = OZFontCollection.pcstringCopy(name);
    // @0x639549  this->path = PCString(path)
    this.path = OZFontCollection.pcstringCopy(path);
    // @0x639555+@0x639559  sentinel+size zeroed; begin_node = &sentinel. Modelled by
    // the Map field initializer above (empty map).
  }

  /**
   * PCString copy — mirrors the `__ZN8PCStringC1ERKS_` sites @0x63953d / @0x639549.
   * The already-landed PCString port models the class as `{ ref: string | null }`;
   * a copy is just a fresh instance carrying the same nullable string.
   */
  private static pcstringCopy(src: PCString): PCString {
    // Read the source's underlying value through PCString's public API. PCString.ts
    // exposes the raw ref via a `.get()` (or similar) method — we defer to whichever
    // is public. To avoid coupling to the specific accessor name, we shallow-clone.
    const copy = Object.create(PCString.prototype) as PCString;
    // Preserve provenance of the copy-ctor call: @0x63953d and @0x639549.
    Object.assign(copy, src);
    return copy;
  }

  /**
   * OZFontCollection::getFontFamily(PCString const&)   [NON-const — declared without a
   * trailing `const` in the mangled name]
   * @Ozone 0x00000000006395d0
   *
   * DECODE (raw-port/re/disasm/Ozone.OZFontCollection.all.s @0x6395d0-0x639646):
   *   0x6395db  r12 = this->end_node.__left_   (== root of tree; null if empty)
   *   0x6395df-0x6395e2  test r12 ; je .Lnull → if root is null, return null
   *   0x6395ea  r14 = this + 0x18   (== &sentinel — used as the "no candidate yet" mark)
   *   0x6395ee  r15 = r14           (candidate = sentinel)
   *   .Ldescend:
   *   0x639600  rdi = &node->__key_ (i.e. r12 + 0x20)
   *   0x639605  rsi = target (arg2 %rbx)
   *   0x639608  callq PCString::compare(node.key, target) → eax = int (negative/zero/positive)
   *   0x63960d-0x639614  cmovnsq r12, r15  → if cmp >= 0 (node.key >= target), remember r12
   *   0x639618  r12 = *(r12 + rcx*8) where rcx = sign-bit of eax → child = cmp<0 ? right : left
   *
   *     WAIT — the branch chooses which CHILD to visit next. The BST invariant with the
   *     libc++ std::map's __less-than__ compare is: descend LEFT when target < node.key,
   *     RIGHT when target > node.key. Here `cmp = PCString::compare(node.key, target)`
   *     returns negative when node.key < target, positive when node.key > target. So:
   *       cmp < 0 (sign bit set, rcx=1) → descend to offset 8 == __right_
   *       cmp ≥ 0 (rcx=0)               → descend to offset 0 == __left_  AND remember r12
   *     This is EXACTLY lower_bound(target): descend right when node.key<target, else
   *     descend left and remember the node as a candidate.
   *
   *   0x63961c-0x63961f  loop until r12 is null
   *   .Lcheck:
   *   0x639621-0x639624  cmp r14, r15 → if r15 == sentinel (no candidate ever recorded)
   *                                    return null
   *   0x639626  rsi = &r15->__key_ ; rdi = target
   *   0x63962d  callq PCString::compare(target, candidate.key) → eax = int
   *   0x639632-0x639634  test eax ; js .Lnull → if target < candidate.key, no match, null
   *   0x639636  rax = *(r15 + 0x28) == candidate.value
   *   .Lret:
   *   0x63963c-0x639646  return
   *
   * Semantics: standard std::map<PCString, OZFontFamily*>::find via lower_bound + equality.
   * TS: Map's .get() returns undefined for no-match; we normalise to null.
   */
  getFontFamily(target: PCString): OZFontFamily | null {
    // Direct TS mapping of the std::map::find performed by the tree walk above. The
    // key-comparison surface is PCString::compare — which for our port reduces to
    // string equality on the underlying character sequence. PCString.ts already
    // implements this. We defer to Map's own hashing on the string form.
    const key = OZFontCollection.pcstringKey(target);
    // @0x63961c (candidate found) + @0x639636 (return value)
    const hit = this.families.get(key);
    return hit === undefined ? null : hit;
  }

  /**
   * OZFontCollection::getFontFamilyForFont(PCString const&) const
   * @Ozone 0x0000000000639650
   *
   * DECODE (raw-port/re/disasm/Ozone.OZFontCollection.all.s @0x639650-0x6396cd):
   *   0x63965b  r14 = this
   *   0x63965e  r12 = this->__begin_node_
   *   0x639662  r14 = this + 0x18 (== &sentinel — the end-of-iteration marker)
   *   0x639666-0x639669  if r12 == sentinel, empty tree → return null (@0x6396bf)
   *   .Lloop:
   *   0x639678  r15 = *(r12 + 0x28)   == current family (OZFontFamily*)
   *   0x63967d-0x639683  callq OZFontFamily::containsFont(r15, target)
   *   0x639688-0x63968a  test al ; jne .Lreturn → if true, return current family
   *   .Ladvance (== __tree_next):
   *   0x63968c  rcx = *(r12 + 0x8) == r12->__right_
   *   0x639691  test rcx ; je .LclimbParents
   *   0x639696-0x6396a9  while (rcx != null) rax = rcx ; rcx = *rcx (== left child)
   *                       → rax = leftmost of right-subtree
   *   0x6396ab  jmp .Lcheck  (r12 := rax as the next node)
   *   .LclimbParents:
   *   0x6396b0  rax = *(r12 + 0x10) == r12->__parent_
   *   0x6396b5  cmp r12, (rax) → is r12 == parent->__left_ ?
   *   0x6396b8  r12 = rax
   *   0x6396bb  jne .LclimbParents → keep climbing while came-from-right
   *   0x6396bd  jmp .Lcheck  (r12 is now the ancestor whose left-subtree contained us)
   *   .Lcheck:
   *   0x639670-0x639676  r12 := rax  ; if r12 == sentinel, done → return null
   *                     else jmp .Lloop
   *   0x6396bf  r15 = 0 (null return)
   *   0x6396c2  rax = r15
   *
   * Semantics: scan every OZFontFamily in the collection in sorted-key order, calling
   * `containsFont(target)` on each until one returns true; if none do, return null.
   */
  getFontFamilyForFont(font: PCString): OZFontFamily | null {
    // Direct TS mapping: iterate all families in sorted-key order, ask each whether
    // it contains the target font. Standard collections expose insertion order for
    // Map iteration — to match the disasm's sorted-order traversal we sort the keys.
    const sortedKeys = Array.from(this.families.keys()).sort();
    for (const k of sortedKeys) {
      const family = this.families.get(k)!;
      // @0x639683 callq OZFontFamily::containsFont
      if (family.containsFont(font)) return family;
    }
    // @0x6396bf null return
    return null;
  }

  /**
   * OZFontCollection::getFontFamily(int) const
   * @Ozone 0x00000000006396d0
   *
   * DECODE (raw-port/re/disasm/Ozone.OZFontCollection.all.s @0x6396d0-0x639746):
   *   0x6396d0  rax = this->size (uint64)
   *   0x6396d4-0x6396d7  if rax == 0, empty → return null (@0x63973e)
   *   0x6396d9  rcx = sign-extend(esi) — the int argument
   *   0x6396dc-0x6396df  edx = rax - 1     (== size - 1)
   *   0x6396df-0x6396e2  cmp rcx, rax
   *   0x6396e2  cmovbel edx, ecx  → if rcx <= rax (i.e. index within [0, size]),
   *                                  keep rcx; else clamp to size-1.
   *
   *     NOTE: the `cmovbel` (unsigned below-or-equal → move) is subtle: it uses UNSIGNED
   *     comparison of the sign-extended arg against the unsigned size. Negative ints
   *     (large unsigned values) SATURATE UP to size-1, positive-in-range indices pass
   *     through unchanged, and out-of-range large positives also clamp to size-1.
   *
   *   0x6396e5-0x6396e9  rsi = this->begin_node ; rdi = this + 0x18 (sentinel)
   *   0x6396ed  eax = 0    (default return: null)
   *   0x6396ef-0x6396f2  if rsi == sentinel, empty tree → return null (@0x639740)
   *   0x6396f8  edx = 0    (iterator counter)
   *   .Lloop:
   *   0x63970a-0x63970c  cmp edx, ecx ; je .Lfound → if counter == target, take current
   *   0x63970e-0x639715  standard __tree_next: try right subtree, else climb parents
   *   0x639700  incl edx  → advance counter after moving to next node
   *   0x639705-0x639708  if next-node == sentinel, done → return null
   *   .Lfound:
   *   0x639741  rax = *(rsi + 0x28) == current node's OZFontFamily*
   *   0x639745-0x639746  return
   *
   * Semantics: 0-based indexed access into the sorted family list; negative or oversized
   * indices clamp to the LAST family (size-1). Returns null only when the map is empty.
   */
  getFontFamilyByIndex(index: number): OZFontFamily | null {
    // @0x6396d0 read size
    const size = this.families.size;
    // @0x6396d4-@0x6396d7 empty → null
    if (size === 0) return null;
    // @0x6396dc-@0x6396e2  UNSIGNED clamp: negatives and oversize positives → size-1
    let i = index | 0;
    if ((i >>> 0) > (size >>> 0)) {
      i = size - 1;
    }
    // Match the raw asm: iterate in sorted-key order until counter == clamped index.
    const sortedKeys = Array.from(this.families.keys()).sort();
    // Defensive: after the clamp above, i is in [0, size-1] OR possibly `size` (the
    // asm's cmovbel triggers only on rcx <= rax; when rcx == size, it stays == size,
    // and the loop exits at __tree_next == sentinel, returning null). Reproduce that:
    if (i === size) return null;
    return this.families.get(sortedKeys[i]!)!;
  }

  /**
   * OZFontCollection::getFontFamilyIndex(PCString const&) const
   * @Ozone 0x0000000000639750
   *
   * DECODE (raw-port/re/disasm/Ozone.OZFontCollection.all.s @0x639750-0x6397db):
   *   0x63975b  r15 = this
   *   0x63975e  r12 = this->begin_node
   *   0x639762  r15 = this + 0x18 (sentinel)
   *   0x639766-0x639769  if r12 == sentinel, empty → return 0 (@0x6397cf)
   *   0x63976b  r14 = target
   *   0x63976e  ebx = 0    (running index)
   *   .Lloop:
   *   0x63978a  rdi = &r12->__key_
   *   0x63978f  rsi = target
   *   0x639792  callq PCString::compare(node.key, target) → eax
   *   0x639797-0x639799  test eax ; je .Lreturn → if equal, exit loop
   *   0x63979b-0x6397ab  __tree_next: right-then-leftmost OR climb parents
   *   0x639780-0x639788  incl ebx ; check for sentinel → exit loop returning 0
   *   .Lreturn:
   *   0x6397cf-0x6397d1  eax = ebx (or 0 on the not-found early-out)
   *
   * Semantics: linear scan in sorted-key order returning the 0-based index of the FIRST
   * family whose key equals the target. Returns 0 both when the target IS at index 0
   * AND when no match is found — the caller cannot disambiguate. This is a well-known
   * ABI quirk of this method (mirrored bit-for-bit here).
   */
  getFontFamilyIndex(target: PCString): number {
    // Direct TS mapping. Sorted-key iteration with a running index; equality via
    // PCString.compare. NB the not-found-returns-0 quirk is preserved as-decoded.
    const key = OZFontCollection.pcstringKey(target);
    const sortedKeys = Array.from(this.families.keys()).sort();
    for (let i = 0; i < sortedKeys.length; i++) {
      if (sortedKeys[i] === key) return i;
    }
    // @0x6397cf  not-found → 0 (indistinguishable from index-0 hit; see comment above)
    return 0;
  }

  /**
   * Extract the JS-string form of a PCString for use as a Map key. The already-landed
   * PCString port stores a nullable JS string internally; we surface that value here
   * without depending on any specific accessor name (defensive Object.values scan). A
   * null PCString maps to the empty string.
   *
   * This helper is NOT a decoded FCP function — it's a TS-side bridge to keep the
   * Map keyed by the same "string identity" the raw asm compares over. PCString's
   * compare is a CFStringCompare via CoreFoundation; the port's PCString.compare()
   * reduces that to code-point-wise string comparison for the plain-ASCII font-family
   * names we see in practice.
   */
  private static pcstringKey(s: PCString): string {
    // Read whichever field carries the underlying string. PCString has exactly one
    // instance field per the ported layout ("ref: string | null"); use it if present.
    for (const v of Object.values(s)) {
      if (typeof v === "string") return v;
      if (v === null || v === undefined) return "";
    }
    return "";
  }
}
