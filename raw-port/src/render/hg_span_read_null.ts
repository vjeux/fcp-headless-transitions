// hg_span_read_null.ts — Helium's "null" span reader.
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * hg_span_read_null(float vector[4]*, int, void const*)  @Helium 0x1e8f90
//     __ZL17hg_span_read_nullPDv4_fiPKv   (file-local: the `L` in the mangling)
//     re/disasm: raw-port/re/disasm/Helium.__ZL17hg_span_read_nullPDv4_fiPKv.s
//
// One member of Helium's `hg_span_read_*` family — the per-pixel-format span
// readers that decode `count` source pixels into a span of `float4`s. This is
// the NULL/no-source variant: it ignores the source pointer entirely and
// zero-fills the destination span, which is what a reader for "there is no
// input here" must produce.
//
// A free function gets a file named after it (PORTING_SPEC naming rule): it
// belongs to no class, and the `__ZL` prefix marks it file-local (`static`) in
// the Helium translation unit that builds the span-reader dispatch tables.
//
// FRONTIER CALLEES — one, and it is a TRUE out-of-scope extern:
//   `___bzero` (libc/libSystem), reached through the Helium symbol stub at
//   0x3c4fca and entered by a TAIL JUMP @0x1e8f9f. It is not stubbed with a
//   throw here: zero-filling is directly expressible, and a JS typed-array
//   `fill(0, …)` IS the observable effect of `bzero` — the same modelling the
//   landed `PCGenBlockRef` ctor uses for its own `_bzero` call @0xba0b7.
//
// Per PORTING_SPEC.md Rules 1, 2, 3, 6.

/**
 * `hg_span_read_null(float vector[4]* dst, int count, void const* src)`
 * — @Helium 0x001e8f90 (`__ZL17hg_span_read_nullPDv4_fiPKv`).
 *
 * Full transcription — every instruction of the function, in order
 * (raw-port/re/disasm/Helium.__ZL17hg_span_read_nullPDv4_fiPKv.s):
 *
 *   0x1e8f90  pushq %rbp                ; frame setup (no TS counterpart)
 *   0x1e8f91  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
 *   0x1e8f94  testl %esi, %esi          ; flags on count
 *   0x1e8f96  jle   0x1e8fa4            ;   count <= 0 (SIGNED) -> return
 *   0x1e8f98  movl  %esi, %esi          ; zero-extend count to 64 bits
 *   0x1e8f9a  shlq  $0x4, %rsi          ; byte length = count * 16
 *   0x1e8f9e  popq  %rbp                ; epilogue BEFORE the tail jump
 *   0x1e8f9f  jmp   ___bzero            ; TAIL CALL bzero(dst, count*16)
 *   0x1e8fa4  popq  %rbp                ; the count <= 0 arm
 *   0x1e8fa5  retq                      ; return, having written nothing
 *   0x1e8fa6  nopw  %cs:(%rax,%rax)     ; alignment padding, not executed
 *
 * DECODE NOTES
 *
 * • `jle` is the SIGNED condition, so a negative `count` returns without
 *   touching `dst` — it does not wrap into a huge unsigned length. The guard
 *   below is therefore `<= 0` on the sign-extended int, not a `>>> 0` test.
 *
 * • `shlq $0x4` after the zero-extension is `count * 16` BYTES = 16 bytes per
 *   element, which is exactly `sizeof(float vector[4])`. That shift is the
 *   only place the element size appears, and it is what proves the span is
 *   four-float pixels rather than scalars.
 *
 * • The `src` argument (`%rdx`) is NEVER read — not once in the body. That is
 *   the whole point of the "null" reader, and it is why the port takes the
 *   parameter and deliberately ignores it rather than pretending to decode a
 *   source buffer.
 *
 * • The `jmp` at @0x1e8f9f is a TAIL CALL (the frame is popped first), so
 *   `bzero`'s return is this function's return — both are void.
 *
 * @param dst   the destination span (`%rdi`), viewed as `count * 4` floats.
 * @param count the number of `float4` pixels to write (`%esi`, signed int32).
 * @param _src  the source pointer (`%rdx`) — accepted and ignored, exactly as
 *              the binary does.
 */
export function hg_span_read_null(
  dst: Float32Array,
  count: number,
  _src: unknown,
): void {
  // @0x1e8f94/@0x1e8f96 — testl %esi,%esi ; jle: signed early-out.
  if ((count | 0) <= 0) {
    // @0x1e8fa4/@0x1e8fa5 — return without writing anything.
    return;
  }
  // @0x1e8f98/@0x1e8f9a — movl %esi,%esi ; shlq $0x4: byteLength = count * 16,
  //   i.e. count * 4 float lanes.
  const floatCount = (count | 0) * 4;
  // @0x1e8f9f — jmp ___bzero(dst, count*16): zero the whole span.
  dst.fill(0, 0, floatCount);
}
