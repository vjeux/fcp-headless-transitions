// OZOpticalFlow__CacheFile.ts — raw transcription of Ozone
// `OZOpticalFlow::CacheFile`.
//
// The public handle for one on-disk optical-flow motion-vector cache file. It
// is a thin pimpl wrapper: the object is a single `shared_ptr` to the nested
// `OZOpticalFlow::CacheFile::Impl`, which owns the actual file. This file
// currently holds one method.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention (OZOpticalFlow__ProgressControllerFacade.ts,
// OZOpticalFlow__Private__JobIDPred.ts, PCEvictionHeap__EquivalenceKey.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4e4a20  CacheFile::isOpen() const   __ZNK13OZOpticalFlow9CacheFile6isOpenEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym <mangled> Ozone`):
//   raw-port/re/disasm/__ZNK13OZOpticalFlow9CacheFile6isOpenEv.s   (12 lines)
//
// NOT ported here — separate ledger units, deliberately absent rather than stubbed:
//   @0x4e4a00 CacheFile::openForReading, @0x4e4a10 CacheFile::openForWriting,
//   and the whole Impl class (@0x4e2b50 ctor … @0x4e4970 getVectorFieldSet),
//   which is its own nested class and therefore its own future file.
//
// ---------------------------------------------------------------------------
// LAYOUT — OZOpticalFlow::CacheFile
//
//   struct CacheFile {                    // 0x10 bytes
//     Impl*                impl;          // +0x00  shared_ptr object pointer
//     __shared_weak_count* implControl;   // +0x08  shared_ptr control block
//   };
//
// isOpen() reads ONLY +0x00 (`movq (%rdi), %rax` @0x4e4a20). The +0x08 slot is
// named from the standard libc++ shared_ptr shape that the Impl-side code makes
// explicit: at @0x4e3288/@0x4e328c a matching (object, control) pair is stored
// eight bytes apart and the old control block is released with
// `lock xaddq $-1, 0x8(%r12)` @0x4e329d — the shared_ptr strong-count decrement.
// It is documented but NOT read by the method below.
//
// ---------------------------------------------------------------------------
// LAYOUT — OZOpticalFlow::CacheFile::Impl (partial: only the slot this method needs)
//
//   +0x68 : shared_ptr<(anonymous namespace)::File> object pointer
//   +0x70 : …its control block
//
// Evidence: `Impl::isOpen() const` @Ozone 0x4e3e40 is the two-instruction body
// `cmpq $0x0, 0x68(%rdi) ; setne %al` — i.e. the SAME test the method below
// performs after dereferencing the pimpl, which is the compiler having inlined
// Impl::isOpen into CacheFile::isOpen. `Impl::openAndReadHeader` @0x4e3130
// fills the slot right after its `fcntl` call (`movq %r15, 0x68(%r14)`
// @0x4e3284, paired with the control block at @0x4e328c and the release of the
// previous one at @0x4e329d), which is what identifies it as the open-file
// handle rather than some other pointer.

/**
 * OZOpticalFlow::CacheFile::Impl — PARTIAL shape.
 *
 * A placeholder for the nested class that has not been ported yet: only the
 * one field `CacheFile::isOpen()` reaches through is modelled, and it keeps an
 * offset-derived name because no accessor naming it has been decoded. When
 * `Impl` is ported it gets its own `OZOpticalFlow__CacheFile__Impl.ts` and this
 * declaration is replaced by an import of it.
 */
export interface OZOpticalFlow__CacheFile__ImplPartial {
  /**
   * +0x68 — the open-file `shared_ptr`'s object pointer; null when the Impl
   * holds no file. Tested by Impl::isOpen() @Ozone 0x4e3e44 and written by
   * Impl::openAndReadHeader @Ozone 0x4e3284.
   */
  fileAt68: object | null;
}

export class OZOpticalFlow__CacheFile {
  /**
   * +0x00 — the pimpl `shared_ptr`'s object pointer. Null for a
   * default-constructed CacheFile that has not been opened.
   */
  implAt0: OZOpticalFlow__CacheFile__ImplPartial | null = null;

  /**
   * `CacheFile::isOpen() const` — @Ozone 0x4e4a20
   *   __ZNK13OZOpticalFlow9CacheFile6isOpenEv
   *
   * FULL DISASM (12 lines — raw-port/re/disasm/
   * __ZNK13OZOpticalFlow9CacheFile6isOpenEv.s):
   *
   *   0x4e4a20  movq  (%rdi), %rax        ; rax = this->impl        (NO prologue yet)
   *   0x4e4a23  testq %rax, %rax          ; impl == nullptr ?
   *   0x4e4a26  je    0x4e4a36            ;   yes -> the frameless return-0 tail
   *   0x4e4a28  pushq %rbp                ; prologue, only on the non-null path
   *   0x4e4a29  movq  %rsp, %rbp
   *   0x4e4a2c  cmpq  $0x0, 0x68(%rax)    ; flags on impl->file - 0
   *   0x4e4a31  setne %al                 ; al = (impl->file != nullptr)
   *   0x4e4a34  popq  %rbp
   *   0x4e4a35  retq
   *   0x4e4a36  xorl  %eax, %eax          ; return false
   *   0x4e4a38  retq
   *   0x4e4a39  nopl  (%rax)              ; alignment padding, not executed
   *
   * Decode notes:
   *   * This is the two-level test `impl != null && impl->file != null`, NOT a
   *     single one: a CacheFile whose pimpl was never created answers false at
   *     @0x4e4a26 without ever touching +0x68. The port keeps both levels.
   *   * `setne` fires on ZF == 0, and `cmpq $0x0, 0x68(%rax)` computes
   *     `impl->file - 0` (AT&T dst - src, PORTING_SPEC Rule 4), so the result is
   *     `impl->file != 0`. The compare is a QUADword — the field is a pointer,
   *     which is why the port tests against null rather than against 0.
   *   * The function is written with TWO exits and sets up a frame only on the
   *     second one (the `je` target at @0x4e4a36 is frameless). That is a code
   *     layout detail with no observable effect, transcribed as an early return.
   *   * The body is the compiler's INLINE of `Impl::isOpen()` @Ozone 0x4e3e40
   *     (identical `cmpq $0x0, 0x68 ; setne`) — there is no call here, so this
   *     is not a dispatch shell: no callee, no extern, no indirect or virtual
   *     dispatch.
   *
   * @returns true iff the pimpl exists AND holds an open file.
   */
  isOpen(): boolean {
    // @0x4e4a20  movq (%rdi), %rax
    const impl = this.implAt0;
    // @0x4e4a23/@0x4e4a26  testq %rax,%rax ; je -> @0x4e4a36 xorl %eax,%eax (false)
    if (impl === null) {
      return false;
    }
    // @0x4e4a2c/@0x4e4a31  cmpq $0x0, 0x68(%rax) ; setne %al
    return impl.fileAt68 !== null;
  }
}
