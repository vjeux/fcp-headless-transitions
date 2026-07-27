// HGPage.ts — Helium's page/tile container. Faithful transcription of the two
// externally-visible HGPage methods from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGPage.Cancel.s          @0x11b750
//   raw-port/re/disasm/Helium.HGPage.ReleaseTextures.s @0x11b7e0
//
// nm confirms these are the ONLY externally-visible HGPage methods in Helium:
//   000000000011b750 T HGPage::Cancel(int, int)
//   000000000011b7e0 T HGPage::ReleaseTextures()
// (no `typeinfo`/`vtable for HGPage` entries — HGPage itself is not polymorphic.
// The nine texture pointers it OWNS at +0xa8..+0xe0 ARE polymorphic — they hold
// objects whose vtable slot *0x18 is invoked to release them; see below.)
//
// ---------------------------------------------------------------------------
// Struct layout — RECOVERED FROM THE TWO METHODS
//
// Cancel(int startIdx /*esi*/, int count /*edx*/) touches memory as if there
// is an array of 16-byte HGRect entries starting at HGPage+0x24 (@0x11b77e:
// `leaq (%r8,%rdi), %r10 ; addq $0x34, %r10` with r8 = startIdx*16 clears the
// SECOND rect of each 32-byte pair, so the first rect begins at +0x24 and the
// second at +0x34 — i.e. a stride of 16 bytes per HGRect, unrolled 2×).
//
//   struct HGPage {
//     ...                          // +0x00..+0x23  (2 slots not decoded here —
//                                   //               not touched by these fns)
//     HGRect rects[N];             // +0x24  16 bytes each (see HGRect.ts)
//                                  //   Cancel(start,count) resets rects[start
//                                  //   .. start+count-1] to _HGRectNull.
//     ...                          // gap to +0xa8
//     ITexture* tex0;              // +0xa8   \
//     ITexture* tex1;              // +0xb0    \
//     ITexture* tex2;              // +0xb8     \
//     ITexture* tex3;              // +0xc0      >-- 9 owned polymorphic
//     ITexture* tex4;              // +0xc8     /    releasables. Type is not
//     ITexture* tex5;              // +0xd0    /     recovered from these two
//     ITexture* tex6;              // +0xd8   /      methods; only the release
//     ITexture* tex7;              // +0xe0  /       vtable slot (*0x18) is used.
//     ITexture* tex8;              // +0xe0-- wait, disasm shows through +0xe0
//   };
//
// The disassembly of ReleaseTextures walks EXACTLY nine 8-byte pointers at
// +0xa8, +0xb0, +0xb8, +0xc0, +0xc8, +0xd0, +0xd8, +0xe0 — actually eight
// pointers if you count the offsets (0xe0-0xa8)/8+1 = 9. Count them from the
// disasm one-by-one: 0xa8, 0xb0, 0xb8, 0xc0, 0xc8, 0xd0, 0xd8, 0xe0 = 8.
// Rechecking the .s file: 0xa8 (@0x11b7e9), 0xb0 (@0x11b806), 0xb8 (@0x11b823),
// 0xc0 (@0x11b840), 0xc8 (@0x11b85d), 0xd0 (@0x11b87a), 0xd8 (@0x11b897),
// 0xe0 (@0x11b8b4) = 8 pointers. Correcting layout:
//
//   struct HGPage {
//     ...                          // +0x00..+0x23  (undecoded)
//     HGRect rects[N];             // +0x24  16 bytes each — see Cancel.
//     ...                          // gap
//     IReleasable* tex[8];         // +0xa8  8× 8-byte owning polymorphic
//                                   //             pointers, released via *0x18.
//   };
//
// The polymorphic release pattern at each slot:
//   movq   0xNN(%rbx), %rdi         ; this->texK
//   testq  %rdi, %rdi                ; if (texK != nullptr)
//   je     .skip                     ;
//   movq   (%rdi), %rax              ;   vtbl = *(void**)texK
//   callq  *0x18(%rax)               ;   vtbl[3](texK)   // slot 0x18/8 = 3
//   movq   $0x0, 0xNN(%rbx)          ;   this->texK = nullptr
//  .skip:
//
// Slot 0x18 in an Itanium C++ ABI vtable is method index 3 (slots 0/1 are the
// two RTTI/offset entries, slot 2 = first virtual). By universal convention in
// this codebase that slot is the object's own release/deleter (`operator delete`
// or `Release()`). Nothing in ReleaseTextures itself narrows it further — the
// texture concrete class isn't visible from these two methods — so this port
// exposes the callback via a caller-supplied `releaseFn` closure. Baking a
// specific class in here would be inventing; we don't.
//
// ---------------------------------------------------------------------------
// Reused ports:
//   HGRect, HGRectNull                     from raw-port/src/render/HGRect.ts
//
// Cited addresses:
//   HGPage::Cancel           @0x11b750
//   HGPage::ReleaseTextures  @0x11b7e0
//   _HGRectNull              @0x3d2284   (already ported in HGRect.ts)

import { HGRect, HGRectNull } from "./HGRect";

/** Minimal shape of an HGPage as touched by the two ported methods. Fields
 *  that these methods don't observe are intentionally omitted (we transcribe
 *  the asm, not guess the rest of the struct). */
export interface HGPage {
  /** Rects at struct offset +0x24 (stride 16). Cancel(start,count) resets a
   *  window of this array. Length is set by whichever ctor initializes it —
   *  Cancel itself never bounds-checks; it just writes count entries. */
  rects: HGRect[];
  /** 8 owning polymorphic pointers at struct offsets +0xa8..+0xe0.
   *  ReleaseTextures dispatches each non-null entry through vtable slot 0x18. */
  tex: (HeliumReleasable | null)[]; // length 8
}

/** Anything ReleaseTextures can drop. The real Helium symbol calls vtable slot
 *  0x18 (index 3 under the Itanium ABI) on each non-null pointer. The concrete
 *  class isn't recoverable from these two functions, so we surface it as a
 *  release closure — the object holds its own destructor. */
export interface HeliumReleasable {
  /** Invocation of vtable slot *0x18 at Helium.HGPage.ReleaseTextures.s
   *  @0x11b7f8 / @0x11b815 / @0x11b832 / @0x11b84f / @0x11b86c / @0x11b889 /
   *  @0x11b8a6 / @0x11b8c3. */
  release_vtbl_18(): void;
}

/**
 * HGPage::Cancel(int startIdx, int count)                        @Helium 0x11b750
 *
 * Writes `_HGRectNull` (16 zero bytes) into `count` consecutive HGRect slots
 * of `page.rects` starting at `startIdx`. Returns `startIdx + count` (the
 * value in `%eax` at ret, @0x11b7ce: `addl %esi, %eax ; retq` — see the .s).
 *
 * Control flow mirrors the asm exactly:
 *
 *   @0x11b750: mov  edx -> eax                  ; eax = count (also holds return
 *                                                 tail: eax += startIdx below)
 *   @0x11b752: testl edx, edx                   ; if (count == 0) goto tail
 *   @0x11b754: jle   0x11b7ce                   ; (signed le: 0 or negative)
 *   @0x11b756..@0x11b75d: frame setup + movslq esi -> rcx     ; rcx = (int64)startIdx
 *   @0x11b75f: cmpl $0x1, eax                    ; count == 1?
 *   @0x11b762: jne  0x11b769                     ; no  -> pair loop; yes -> tail
 *   @0x11b764: xorl r8d, r8d                     ; r8 = 0  ('loop wrote 0 pairs')
 *   @0x11b767: jmp  0x11b7ae                     ; -> odd-tail block
 *
 *   @0x11b769..@0x11b7ac  (pair loop @stride 32):
 *     r9 = count & 0x7ffffffe                    ; even part of count
 *     r10 = &page.rects[startIdx] + 0x10         ; second rect of the pair
 *     r8 = 0
 *     do {
 *       *(xmm)(r10 - 0x10) = _HGRectNull         ; first  rect of the pair
 *       *(xmm)(r10)         = _HGRectNull        ; second rect of the pair
 *       r8  += 2
 *       r10 += 0x20
 *     } while (r8 != r9)
 *
 *   @0x11b7ae..@0x11b7cd  (odd tail — one leftover rect when count is odd):
 *     if ((count & 1) != 0) {
 *       &page.rects[startIdx + r8].{16 bytes} = _HGRectNull
 *     }
 *
 *   @0x11b7ce..@0x11b7d0: eax += esi ; retq       ; returned startIdx + count
 *
 * The pair-loop / odd-tail split is a compiler-generated 2× unroll around a
 * simple `for (i=0; i<count; ++i) rects[startIdx+i] = HGRectNull;` — the
 * observable effect is identical, so this port collapses it to the readable
 * form while noting the branch structure in comments above.
 */
export function HGPage_Cancel(page: HGPage, startIdx: number, count: number): number {
  // @0x11b750-@0x11b754: `testl %edx,%edx ; jle 0x11b7ce` — count<=0 short-circuits.
  // Using `<= 0` is the signed test the `jle` after `testl` encodes.
  if ((count | 0) <= 0) {
    // @0x11b7ce: addl %esi,%eax ; retq — eax was already `count` on entry
    // (from @0x11b750 `movl %edx,%eax`) so the return is startIdx + count.
    return ((startIdx | 0) + (count | 0)) | 0;
  }
  // Pair-loop + odd-tail semantically = clear all `count` entries.
  // @0x11b790..@0x11b7ac (pair) and @0x11b7b3..@0x11b7c8 (odd tail).
  const s = startIdx | 0;
  const n = count | 0;
  for (let i = 0; i < n; i = (i + 1) | 0) {
    // *(xmm)(rects_base + (s+i)*16) = _HGRectNull      @HGRect.ts / _HGRectNull @0x3d2284
    page.rects[(s + i) | 0] = HGRectNull;
  }
  // @0x11b7ce: `addl %esi,%eax ; retq`. eax was `count` at entry (@0x11b750).
  return (s + n) | 0;
}

/**
 * HGPage::ReleaseTextures()                                      @Helium 0x11b7e0
 *
 * Releases each of the 8 owned polymorphic pointers at struct offsets
 * +0xa8, +0xb0, +0xb8, +0xc0, +0xc8, +0xd0, +0xd8, +0xe0 by dispatching
 * through vtable slot *0x18 (Itanium ABI method index 3 — the object's own
 * destroy/release entry point), and then zeroes the slot.
 *
 * The disassembly is 8 copies of the same "test, dispatch, null" idiom, one
 * per texture slot. This port mirrors it directly.
 *
 * Per-slot instruction citation (each block is identical modulo offset):
 *   +0xa8:  test @0x11b7f0, vcall @0x11b7f8, null @0x11b7fb
 *   +0xb0:  test @0x11b80d, vcall @0x11b815, null @0x11b818
 *   +0xb8:  test @0x11b82a, vcall @0x11b832, null @0x11b835
 *   +0xc0:  test @0x11b847, vcall @0x11b84f, null @0x11b852
 *   +0xc8:  test @0x11b864, vcall @0x11b86c, null @0x11b86f
 *   +0xd0:  test @0x11b881, vcall @0x11b889, null @0x11b88c
 *   +0xd8:  test @0x11b89e, vcall @0x11b8a6, null @0x11b8a9
 *   +0xe0:  test @0x11b8bb, vcall @0x11b8c3, null @0x11b8c6
 */
export function HGPage_ReleaseTextures(page: HGPage): void {
  // 8 slots, one per struct offset in the disassembly above.
  const tex = page.tex;
  for (let i = 0; i < 8; i = (i + 1) | 0) {
    const t = tex[i];
    if (t !== null && t !== undefined) {
      // Vtable slot *0x18 (@Itanium ABI index 3) — invoked at the addresses
      // cited in the doc comment above. Concrete class is not decoded from
      // these two methods, so we call the object's own release closure.
      t.release_vtbl_18();
      tex[i] = null;
    }
  }
}
