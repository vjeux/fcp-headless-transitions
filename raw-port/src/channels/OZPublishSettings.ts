// OZPublishSettings.ts — Ozone "publish settings" record. Only the const
// accessor `getNumChannels() const` is ported in this file; other methods
// on this class are separate ledger entries and will be appended here
// when their own units are claimed (one-class-per-file rule).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted
//             VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/__ZNK17OZPublishSettings14getNumChannelsEv.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from getNumChannels — a std::vector<T*> tail-slots
// probe)
// -----------------------------------------------------------------------------
// The disasm reads two 8-byte fields at `this+0x8` (begin ptr) and
// `this+0x10` (end ptr) and returns `(end - begin) >> 3`. That is the
// canonical libc++ `std::vector<T*>::size()` unrolled by the compiler:
// the container's tail slots hold `_M_begin` and `_M_end`, and dividing
// their pointer-difference by `sizeof(T*) == 8` gives the element count.
// The element type is a pointer (some `OZChannel*`-family type — the
// class name and this accessor's name make "vector of channel pointers"
// the only sane fit; the exact channel-pointer type is recovered when
// the ctor and channel-add methods are ported and we can read the type
// off their store instructions).
//
// OZPublishSettings {
//   +0x00 ?                    (not read by this accessor — likely a
//                               vtable pointer or a base-class field)
//   +0x08 channels_begin : OZChannel** (libc++ vector _M_begin)
//   +0x10 channels_end   : OZChannel** (libc++ vector _M_end)
//   ...
// }
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   (none — leaf function: two loads, one subtract, one shift, ret.)
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZNK17OZPublishSettings14getNumChannelsEv
//       — OZPublishSettings::getNumChannels() const @Ozone 0x53c570
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZNK17OZPublishSettings14getNumChannelsEv.s)
// -----------------------------------------------------------------------------
//   0x53c570  pushq  %rbp
//   0x53c571  movq   %rsp, %rbp
//   0x53c574  movq   0x10(%rdi), %rax          ; rax = this->channels_end
//   0x53c578  subq   0x8(%rdi),  %rax          ; rax = end - begin (bytes)
//   0x53c57c  shrq   $0x3,       %rax          ; rax >>= 3   (÷ sizeof(T*))
//   0x53c580  popq   %rbp
//   0x53c581  retq

/**
 * `OZPublishSettings` — Ozone class that owns a `std::vector<T*>` of
 * channel pointers. Only the `getNumChannels() const` accessor is
 * ported here; other methods will land in this file when they are
 * scheduled off the dependency queue.
 */
export class OZPublishSettings {
  /** +0x08 — libc++ vector `_M_begin` slot (byte address of the first
   *  channel-pointer slot). Read by `getNumChannels` @0x53c578. */
  channels_begin: number = 0;

  /** +0x10 — libc++ vector `_M_end` slot (byte address one past the
   *  last channel-pointer slot). Read by `getNumChannels` @0x53c574. */
  channels_end: number = 0;

  /**
   * `OZPublishSettings::getNumChannels() const` — @Ozone 0x53c570
   * (__ZNK17OZPublishSettings14getNumChannelsEv).
   *
   * Faithful line-for-line transcription of the disassembly above. Reads
   * the vector's `end` and `begin` byte-address slots, subtracts (in the
   * dst-src AT&T sense: `rax -= this->channels_begin`, so `rax = end -
   * begin`), and shifts right by 3 to divide by `sizeof(T*)`. The 8-byte
   * element size matches the machine's shift (`shrq $0x3`) exactly — a
   * different element size would have used a different shift or an
   * imul.
   *
   * Because this is the compiler's canonical libc++ `vector::size()`
   * inlining, the return type is `size_t` in native; we model it as a
   * JS number (safely representable — channel counts in FCP are small).
   */
  getNumChannels(): number {
    // @0x53c574 — movq 0x10(%rdi), %rax : load end pointer.
    // @0x53c578 — subq 0x8(%rdi), %rax  : AT&T dst-src, so rax = end - begin.
    // @0x53c57c — shrq $0x3, %rax       : logical right shift 3 = ÷ 8.
    return (this.channels_end - this.channels_begin) >>> 3;
  }
}
