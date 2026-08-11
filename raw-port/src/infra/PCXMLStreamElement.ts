// PCXMLStreamElement — ProCore's concrete PCStreamElement for the XML/binary
// serializer stream. This file transcribes ONE method today:
//
//   PCXMLStreamElement::getAttributeAsCString(unsigned int) const
//   MANGLED: __ZNK18PCXMLStreamElement21getAttributeAsCStringEj
//   ADDRESS: ProCore @0x00000000000290f6 (x86_64 slice)
//
// Everything else about the class (ctor, dtor, initParams, getAs*, addAttribute,
// appendContentWithNewline, the other getAttributeAs* coercions) is NOT in this
// claim and stays undecoded until a later worker claims those symbols. The ctor
// IS read below, but only as LAYOUT provenance for the fields this method
// touches — no ctor behaviour is ported here.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore, x86_64 slice, unadjusted VAs from
// `otool -arch x86_64 -tvV`. Disassembly source (regenerated in-worktree):
//   raw-port/re/disasm/ProCore.__ZNK18PCXMLStreamElement21getAttributeAsCStringEj.s
//
// NOTE ON raw-port/src/infra/PCStreamElement.ts (already on main): that file is
// the project's earlier BEHAVIOURAL model of this same C++ class — it says so in
// its own header ("Faithful port of ProCore's PCXMLStreamElement ... we just skip
// the numeric interning that FCP does for binary streams") and it carries a
// name->value Map plus a scope-driven id->name lookup, with no @0xADDR on any of
// its getAttributeAs* methods. It models the XML PARSE-TIME view. This file is
// the instruction-level transcription of the real class under its real name, and
// it is the one the ledger keys off (the claimed symbol cites its address here).
// The two are intentionally NOT merged: touching PCStreamElement.ts would be a
// non-ADD-only edit of landed work, and its shape (strings by name) cannot
// represent what this method actually does (raw `const char*` slots by integer
// id, with a 7-entry inline array in front of a std::map).
//
// ─── FULL LINE-BY-LINE DISASM of the claimed method (verbatim, 0x290f6..0x29169) ───
//
//   __ZNK18PCXMLStreamElement21getAttributeAsCStringEj:
//   ; SysV x86_64: %rdi = this (const PCXMLStreamElement*), %esi = attrId (unsigned int)
//   ; returns %rax = const char* (0 == not found)
//   0x290f6  movl   0xb8(%rdi), %eax        ; eax = this->inlineAttrCount (u32; zero-extends into rax)
//   0x290fc  testq  %rax, %rax
//   0x290ff  je     0x29116                 ; count == 0 -> skip the inline scan entirely
//   0x29101  shlq   $0x4, %rax              ; rax = count * 16 (byte limit; slot stride is 0x10)
//   0x29105  xorl   %ecx, %ecx              ; rcx = 0 (byte cursor into the inline array)
//   ; --- INLINE ARRAY SCAN (do/while) ---
//   0x29107  cmpl   0x48(%rdi,%rcx), %esi   ; AT&T: flags = esi - slot[i].id  (dst=esi, src=mem)
//   0x2910b  je     0x2915a                 ; id matches -> return slot[i].value
//   0x2910d  addq   $0x10, %rcx             ; next 16-byte slot
//   0x29111  cmpq   %rcx, %rax              ; flags = rax - rcx
//   0x29114  jne    0x29107                 ; keep scanning while cursor != count*16
//   ; --- MAP PATH ---
//   0x29116  movq   0xc0(%rdi), %rax        ; rax = this->attrMap (std::map<unsigned,const char*>*)
//   0x2911d  testq  %rax, %rax
//   0x29120  je     0x29160                 ; no map -> return nullptr
//   0x29122  pushq  %rbp                    ; (frame set up only on this path)
//   0x29123  movq   %rsp, %rbp
//   0x29126  movq   0x8(%rax), %rdx         ; rdx = map->__end_node.__left_  == root node
//   0x2912a  testq  %rdx, %rdx
//   0x2912d  je     0x29156                 ; empty tree -> return nullptr
//   0x2912f  addq   $0x8, %rax              ; rax = &map->__end_node.__left_  == the END sentinel
//   0x29133  movq   %rax, %rcx              ; rcx = candidate = END  (lower_bound accumulator)
//   ; --- lower_bound DESCENT (do/while) ---
//   0x29136  xorl   %edi, %edi
//   0x29138  cmpl   %esi, 0x20(%rdx)        ; AT&T: flags = node->key - esi  (dst=mem, src=esi)
//   0x2913b  setb   %dil                    ; dil = CF = (node->key <  attrId)   [unsigned]
//   0x2913f  cmovaeq %rdx, %rcx             ; if CF==0, i.e. node->key >= attrId: candidate = node
//   0x29143  movq   (%rdx,%rdi,8), %rdx     ; dil=0 -> node->__left_ (+0x00); dil=1 -> node->__right_ (+0x08)
//   0x29147  testq  %rdx, %rdx
//   0x2914a  jne    0x29136                 ; descend until we fall off a leaf
//   0x2914c  cmpq   %rax, %rcx              ; candidate == END ?
//   0x2914f  je     0x29156                 ; never took a >= step -> not found
//   0x29151  cmpl   0x20(%rcx), %esi        ; AT&T: flags = attrId - candidate->key
//   0x29154  jae    0x29163                 ; attrId >= candidate->key (unsigned) -> EQUAL -> found
//   0x29156  xorl   %eax, %eax              ; return nullptr
//   0x29158  popq   %rbp
//   0x29159  retq
//   0x2915a  movq   0x50(%rdi,%rcx), %rax   ; inline hit: rax = slot[i].value  (id@+0x48, value@+0x50)
//   0x2915f  retq                           ; NOTE: no popq — the inline path never pushed %rbp
//   0x29160  xorl   %eax, %eax              ; null map -> nullptr (also no popq: pre-frame path)
//   0x29162  retq
//   0x29163  movq   0x28(%rcx), %rax        ; found: rax = candidate->value (pair::second @+0x28)
//   0x29167  jmp    0x29158                 ; -> popq %rbp; retq
//   0x29169  nop
//
// ─── WHY THE DESCENT IS `lower_bound`, AND WHY THE TAIL COMPARE MEANS "EQUAL" ───
//
// The loop keeps the last node from which it went LEFT (the `cmovaeq` fires
// exactly when node->key >= attrId). That node is the smallest key >= attrId,
// i.e. std::map::lower_bound. libc++'s inlined `find` then does
// `if (it != end() && !(key < it->first)) return it;`. Here the "!(attrId <
// candidate->key)" is spelled as `attrId >= candidate->key` (`jae` @0x29154).
// Since the candidate already satisfies candidate->key >= attrId, that test can
// only succeed on equality — so a `jae` hit IS an exact-key hit. Same shape as
// the landed peer raw-port/src/infra/map_find_PCCFRef_CGColorSpace_CacheData.ts
// (which tracks the same "last left turn" candidate and then re-checks it).
//
// ─── OBJECT LAYOUT (recovered from the ctor + addAttribute, both cited) ───
//
// PCXMLStreamElement, 0xc8 bytes. Provenance = PCXMLStreamElement::PCXMLStreamElement(
// unsigned int, PCScope*, PCSerializer*) C2 @ProCore 0x288ba, whose stores enumerate
// the fields, plus PCXMLStreamElement::addAttribute(unsigned int, const char*)
// @ProCore 0x28fee, which is the writer for the two containers this method reads:
//
//   +0x00        vptr                       ; `leaq 0x1210bb(%rip),%rax; movq %rax,(%rdi)` @0x288de
//   +0x08  u32   elementType                ; `movl %esi, 0x8(%rdi)` @0x288c4
//   +0x0c  u8    flag                       ; `movb %r14b, 0xc(%rdi)` @0x288ca (zeroed)
//   +0x10  ptr   PCScope*                   ; `movq %rdx, 0x10(%rdi)` @0x288ce
//   +0x18  ptr   PCSerializer*              ; `movq %rcx, 0x18(%rdi)` @0x288d2
//   +0x20  ptr   (zeroed)                   ; `movq %r14, 0x20(%rdi)` @0x288d6
//   +0x28  u8    (zeroed)                   ; `movb %r14b, 0x28(%rdi)` @0x288da
//   +0x30        PCString                   ; `addq $0x30,%rdi; callq PCString::PCString()` @0x288e8
//   +0x38  16B   (zeroed)                   ; `xorps %xmm0,%xmm0; movups %xmm0, 0x38(%rbx)` @0x28905
//   +0x48  7 x 16B  INLINE ATTRIBUTE SLOTS  ; { u32 id @+0x00, 4B pad, const char* value @+0x08 }
//                                           ; writer: `movl %esi, 0x48(%r14,%rcx)` @0x29015 and
//                                           ; `movq %rbx, 0x50(%r14,%rcx)` @0x2901a, with
//                                           ; rcx = count<<4 — same base/stride this method reads.
//   +0xb8  u32   inlineAttrCount            ; `movl $0x0, 0xb8(%rbx)` @0x288f1 (init 0),
//                                           ; `incl %eax; movl %eax, 0xb8(%r14)` @0x29021 (bump)
//   +0xc0  ptr   std::map<unsigned,const char*>* attrMap   ; `movq %r14, 0xc0(%rbx)` @0x288fb (init null)
//
// CAPACITY 7 is not a guess: addAttribute @0x29008 does `cmpq $0x6, %rax; ja 0x2902a`
// — with count <= 6 it writes slot[count] inline, otherwise it spills to the map. Seven
// slots at 0x10 bytes each is exactly 0x48 + 0x70 = 0xb8, i.e. the array ends where the
// count field begins.
//
// The map is HEAP-allocated lazily by addAttribute @0x29036: `movl $0x18,%edi; callq __Znwm`
// (0x18 bytes), then `movq %rax,%rdi; addq $0x8,%rax; xorps %xmm0,%xmm0; movups %xmm0,0x8(%rdi);
// movq %rax,(%rdi)` @0x29040..0x2904e — the canonical empty libc++ __tree:
//
//   std::map<unsigned int, const char*> (libc++ __tree), 0x18 bytes:
//     +0x00  __begin_node_        (initialised to &__end_node, i.e. this+0x08; NOT read here)
//     +0x08  __end_node_.__left_  = ROOT pointer   <- the only field this method reads
//     +0x10  __size_              (zeroed with the same movups; NOT read here)
//
//   __tree_node<__value_type<unsigned int, const char*>>, 0x30 bytes:
//     +0x00  __left_        ; `movq (%rdx,%rdi,8), %rdx` with dil=0 @0x29143
//     +0x08  __right_       ; same load with dil=1
//     +0x10  __parent_      ; not read here
//     +0x18  __is_black_    ; not read here
//     +0x20  key   (unsigned int)   ; `cmpl %esi, 0x20(%rdx)` @0x29138
//     +0x28  value (const char*)    ; `movq 0x28(%rcx), %rax` @0x29163
//   Cross-check on the value type: addAttribute's map path calls
//   __tree<__value_type<unsigned int, char const*>, __map_value_compare<unsigned int,
//   pair<unsigned int const, char const*>, less<unsigned int>, true>, ...>::
//   __emplace_unique_key_args<...> @0x2906e and then `movq %rbx, 0x28(%rax)` @0x29073 —
//   the same +0x28 slot, written with the `const char*` argument.
//
// ─── DEPS ───
//
// `python3 raw-port/army/tools/depgraph.py deps
//  __ZNK18PCXMLStreamElement21getAttributeAsCStringEj` prints NOTHING: zero in-scope
// callees and zero externs. The whole body is integer compares and pointer loads —
// the comparator `std::less<unsigned int>` is inlined as the single `cmpl` at
// @0x29138. No imports are needed and none are made.
//
// ─── ORACLE ───
//
// Verified bit-exactly against the live ProCore symbol; see
//   raw-port/re/oracle/PCXMLStreamElement_getAttributeAsCString_oracle.py
// (run under `arch -x86_64 /usr/bin/python3`, because every address above is an
// x86_64 offset — OPS_LOG "the executable oracle calls the wrong architecture").
// The harness builds real 0xc8-byte element arenas and real libc++ tree nodes in
// process memory, calls the real function, and compares the returned pointer to
// this port's, plus five negative controls.

/**
 * A raw `const char*` as it lives in the object: a 64-bit pointer value.
 * `0n` is the null pointer, which this method also uses as its "not found"
 * return (`xorl %eax, %eax` @0x29156 / @0x29160).
 *
 * Modelled as `bigint` per PORTING_SPEC Rule 4 ("int64 -> bigint where the value
 * can exceed 2^53") — a userspace pointer routinely exceeds 2^53, and this
 * method's only contract is that it hands back the EXACT stored pointer, so the
 * value must round-trip without precision loss.
 */
export type ConstCharPtr = bigint;

/** The null `const char*` (`xorl %eax, %eax` @0x29156, @0x29160). */
export const PCXML_NULL_CSTRING: ConstCharPtr = 0n;

/**
 * One entry of the 7-element inline attribute array at +0x48. Stride 0x10:
 * `addq $0x10, %rcx` @0x2910d, with the id read at 0x48(%rdi,%rcx) @0x29107 and
 * the value at 0x50(%rdi,%rcx) @0x2915a.
 */
export interface PCXMLStreamElementInlineAttr {
  /** +0x00 within the slot (= element +0x48 + i*0x10): the attribute id, u32. */
  id: number;
  /** +0x08 within the slot (= element +0x50 + i*0x10): the attribute value. */
  value: ConstCharPtr;
}

/**
 * A libc++ `__tree_node<__value_type<unsigned int, const char*>>` — the spill
 * storage addAttribute uses once the 7 inline slots are full.
 */
export interface PCXMLStreamElementAttrNode {
  /** +0x00 `__left_` — `movq (%rdx,%rdi,8), %rdx` with dil == 0 @0x29143. */
  __left_: PCXMLStreamElementAttrNode | null;
  /** +0x08 `__right_` — the same load with dil == 1 @0x29143. */
  __right_: PCXMLStreamElementAttrNode | null;
  /** +0x10 `__parent_` — never read by this method; modelled optional. */
  __parent_?: PCXMLStreamElementAttrNode | null;
  /** +0x18 `__is_black_` — never read by this method; modelled optional. */
  __is_black_?: boolean;
  /** +0x20 `value.first`, the attribute id — `cmpl %esi, 0x20(%rdx)` @0x29138. */
  key: number;
  /** +0x28 `value.second`, the attribute value — `movq 0x28(%rcx), %rax` @0x29163. */
  value: ConstCharPtr;
}

/**
 * The heap-allocated `std::map<unsigned int, const char*>` at element +0xc0
 * (0x18 bytes, `operator new(0x18)` @0x2903b). Only the root slot is read here.
 */
export interface PCXMLStreamElementAttrMap {
  /** +0x00 `__begin_node_` — initialised to `&__end_node`; not read here. */
  __begin_node_?: PCXMLStreamElementAttrNode | null;
  /**
   * +0x08 `__end_node_.__left_` — the tree ROOT (`movq 0x8(%rax), %rdx` @0x29126).
   * The ADDRESS of this slot doubles as the end() sentinel the descent compares
   * against (`addq $0x8, %rax` @0x2912f, `cmpq %rax, %rcx` @0x2914c).
   */
  __end_node___left_: PCXMLStreamElementAttrNode | null;
  /** +0x10 `__size_` — zeroed at construction; not read here. */
  __size_?: number;
}

/**
 * A red-black tree of N nodes has depth <= 2*log2(N+1); no FCP attribute map
 * comes close to 128 levels. The bound exists so a cyclic/corrupt graph (which
 * the binary would spin on forever) fails loudly here instead.
 */
const MAX_TREE_DEPTH = 128;

export class PCXMLStreamElement {
  /** +0x08 element type tag (`movl %esi, 0x8(%rdi)` @0x288c4). Not read by this method. */
  elementType = 0;

  /**
   * +0x48 .. +0xb7 — the inline attribute array, capacity 7
   * (`cmpq $0x6, %rax; ja` in addAttribute @0x29008).
   */
  inlineAttrs: PCXMLStreamElementInlineAttr[] = [];

  /** +0xb8 — how many of the inline slots are live (`movl 0xb8(%rdi), %eax` @0x290f6). */
  inlineAttrCount = 0;

  /** +0xc0 — the spill map, null until addAttribute allocates it (@0x29036). */
  attrMap: PCXMLStreamElementAttrMap | null = null;

  /**
   * PCXMLStreamElement::getAttributeAsCString(unsigned int) const
   * @ProCore 0x00000000000290f6
   * mangled: __ZNK18PCXMLStreamElement21getAttributeAsCStringEj
   *
   * Looks an attribute up by integer id: first a linear scan of the inline
   * 7-slot array, then — only if that misses — an inlined `std::map::find`.
   * Returns the stored `const char*`, or null (0n) when the id is absent.
   *
   * The full disassembly is transcribed at the top of this file; each step below
   * cites the instruction it came from.
   */
  getAttributeAsCString(attrId: number): ConstCharPtr {
    // %esi is a 32-bit register: the caller's argument is truncated to u32, and
    // every compare against it (@0x29107, @0x29138, @0x29151) is a 32-bit
    // UNSIGNED compare.
    const esi = attrId >>> 0;

    // @0x290f6  movl 0xb8(%rdi), %eax   — u32 load, zero-extended into rax.
    let rax = this.inlineAttrCount >>> 0;

    // @0x290fc  testq %rax, %rax
    // @0x290ff  je    0x29116           — count == 0 skips the scan.
    if (rax !== 0) {
      // @0x29101  shlq $0x4, %rax       — byte limit = count * 16.
      const limit = rax * 0x10;
      // @0x29105  xorl %ecx, %ecx
      let rcx = 0;
      // do/while: the entry test above already proved there is >= 1 slot.
      for (;;) {
        const i = rcx / 0x10;
        const slot = this.inlineAttrs[i];
        if (slot === undefined) {
          // The binary reads 0x48(%rdi, %rcx) unconditionally for cursor <
          // count*16; with a count above the 7-slot capacity it would walk off
          // the array into +0xb8 and beyond. addAttribute can never produce
          // that (it spills at 7), so rather than invent a value we make the
          // impossible state loud — PORTING_SPEC Rule 3.
          throw new Error(
            "PCXMLStreamElement::getAttributeAsCString @ProCore 0x290f6: inline slot " +
              i +
              " is missing while inlineAttrCount=" +
              (this.inlineAttrCount >>> 0) +
              " — the binary would read past the 7-slot array at +0x48",
          );
        }
        // @0x29107  cmpl 0x48(%rdi,%rcx), %esi   ; flags = esi - slot.id
        // @0x2910b  je   0x2915a                 ; ZF -> equal
        if ((slot.id >>> 0) === esi) {
          // @0x2915a  movq 0x50(%rdi,%rcx), %rax
          // @0x2915f  retq
          return slot.value;
        }
        // @0x2910d  addq $0x10, %rcx
        rcx += 0x10;
        // @0x29111  cmpq %rcx, %rax
        // @0x29114  jne  0x29107
        if (rcx === limit) break;
      }
    }

    // @0x29116  movq 0xc0(%rdi), %rax
    const map = this.attrMap;
    // @0x2911d  testq %rax, %rax
    // @0x29120  je    0x29160  -> xorl %eax, %eax; retq
    if (map === null) return PCXML_NULL_CSTRING;

    // @0x29126  movq 0x8(%rax), %rdx    ; rdx = root
    const root: PCXMLStreamElementAttrNode | null = map.__end_node___left_;
    // @0x2912a  testq %rdx, %rdx
    // @0x2912d  je    0x29156  -> xorl %eax, %eax; popq %rbp; retq
    if (root === null) return PCXML_NULL_CSTRING;
    let rdx: PCXMLStreamElementAttrNode = root;

    // @0x2912f  addq $0x8, %rax   ; rax = &map.__end_node.__left_ == end() sentinel
    // @0x29133  movq %rax, %rcx   ; candidate starts AT the sentinel
    let candidate: PCXMLStreamElementAttrNode | null = null; // null models "== the sentinel"

    // --- descent @0x29136 .. @0x2914a ---
    for (let depth = 0; ; depth++) {
      if (depth >= MAX_TREE_DEPTH) {
        throw new Error(
          "PCXMLStreamElement::getAttributeAsCString @ProCore 0x290f6: attribute tree " +
            "descent exceeded " +
            MAX_TREE_DEPTH +
            " levels — cyclic __left_/__right_ graph",
        );
      }
      // @0x29136  xorl %edi, %edi
      // @0x29138  cmpl %esi, 0x20(%rdx)   ; AT&T flags = node.key - attrId
      // @0x2913b  setb %dil               ; dil = CF = (node.key < attrId), UNSIGNED
      const goRight: boolean = (rdx.key >>> 0) < esi;
      // @0x2913f  cmovaeq %rdx, %rcx      ; CF == 0, i.e. node.key >= attrId
      if (!goRight) candidate = rdx;
      // @0x29143  movq (%rdx,%rdi,8), %rdx  ; +0x00 __left_ when dil=0, +0x08 __right_ when dil=1
      const next: PCXMLStreamElementAttrNode | null = goRight ? rdx.__right_ : rdx.__left_;
      // @0x29147  testq %rdx, %rdx
      // @0x2914a  jne   0x29136
      if (next === null) break;
      rdx = next;
    }

    // @0x2914c  cmpq %rax, %rcx    ; candidate still the end sentinel?
    // @0x2914f  je   0x29156       -> nullptr
    if (candidate === null) return PCXML_NULL_CSTRING;

    // @0x29151  cmpl 0x20(%rcx), %esi   ; AT&T flags = attrId - candidate.key
    // @0x29154  jae  0x29163            ; CF == 0, i.e. attrId >= candidate.key (unsigned).
    //   The candidate is the lower_bound, so candidate.key >= attrId already; the
    //   only way both hold is candidate.key == attrId.
    if (esi >= (candidate.key >>> 0)) {
      // @0x29163  movq 0x28(%rcx), %rax
      // @0x29167  jmp  0x29158  -> popq %rbp; retq
      return candidate.value;
    }

    // @0x29156  xorl %eax, %eax; popq %rbp; retq
    return PCXML_NULL_CSTRING;
  }
}
