// HGMetalBufferWrapperInfinipool__Descriptor.ts — Helium
// `HGMetalBufferWrapperInfinipool::Descriptor`, the POD key that describes one
// pooled Metal buffer. NESTED class, so the file name joins the outer names
// with a DOUBLE underscore per PORTING_SPEC.md (precedent:
// PCBezierNamespace__SampledContour.ts).
//
// ONE symbol is transcribed in this file:
//
//   @0x17a6a0  HGMetalBufferWrapperInfinipool::Descriptor::size() const
//                __ZNK30HGMetalBufferWrapperInfinipool10Descriptor4sizeEv
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    raw-port/re/disasm/Helium.__ZNK30HGMetalBufferWrapperInfinipool10Descriptor4sizeEv.s
//            (re-derive with `raw-port/tools/disasm.sh --sym
//             __ZNK30HGMetalBufferWrapperInfinipool10Descriptor4sizeEv Helium`)
//
// The OUTER class HGMetalBufferWrapperInfinipool is a different class and a
// different ledger unit set (ctors @0x17aad0/@0x17a6e0, dtors
// @0x17ab20/@0x17aae0, clear @0x17b6f0, setLabel @0x17ab60, newBuffer
// @0x17ab80); nothing of it is ported here.
//
// ── DISASSEMBLY (verbatim, the WHOLE function) ──────────────────────────────
//   000000000017a6a0  pushq %rbp              ; frame setup
//   000000000017a6a1  movq  %rsp, %rbp        ; frame setup
//   000000000017a6a4  movq  0x8(%rdi), %rax   ; return *(uint64*)(this + 0x08)
//   000000000017a6a8  popq  %rbp              ; frame teardown
//   000000000017a6a9  retq                    ; returns the 64-bit value in %rax
//   000000000017a6aa  nopw  (%rax,%rax)       ; alignment padding, not code
//
// A single 64-bit load. No callq, no in-scope callee, no extern, no allocation
// and no indirect or virtual dispatch (`depgraph.py deps` lists nothing) — and
// no masking or conversion, so the accessor returns the raw stored word.
//
// ── LAYOUT (proven by the ONE consumer that reads all three fields) ─────────
// `(anonymous namespace)::BufferWrapperAllocator::allocate(
//      HGMetalBufferWrapperInfinipool::Descriptor const&)` @0x17b880 loads the
// whole struct into the argument registers of one ObjC message:
//
//   0x17b88d  movq (%rsi),%rdx        ; arg1 <- desc +0x00
//   0x17b890  movq 0x8(%rsi),%rcx     ; arg2 <- desc +0x08
//   0x17b894  movq 0x10(%rsi),%r8     ; arg3 <- desc +0x10
//   0x17b898  movq …(%rip),%rsi       ; selector
//             ## newBufferWithBytesNoCopy:length:options:deallocator:
//   0x17b8a2  callq *…(%rip)          ; -[device newBufferWithBytesNoCopy:…]
//   0x17b89f  xorl %r9d,%r9d          ; deallocator: nil
//
// which names each slot exactly:
//
//   struct HGMetalBufferWrapperInfinipool::Descriptor {   // >= 0x18 bytes
//     void*    bytes;    // +0x00  the no-copy backing pointer
//     uint64_t length;   // +0x08  NSUInteger byte length   <- size() returns THIS
//     uint64_t options;  // +0x10  MTLResourceOptions
//   };
//
// So `size()` is the buffer's BYTE LENGTH — the `length:` argument of the
// Metal allocation — not an element count and not a pool-entry count. (The
// sibling HGMetalTextureWrapperInfinipool::Descriptor::size() @0x17e070 is a
// different class's accessor and a different ledger unit.)

/**
 * `HGMetalBufferWrapperInfinipool::Descriptor` — the POD pool key.
 *
 * Only the field this unit reads is modelled; the two neighbours are declared
 * because the same disassembly (@0x17b88d/@0x17b894) proves their offsets and
 * types, and leaving them out would invite a later unit to re-model +0x08 at a
 * different offset.
 *
 * @Helium 0x17a6a0
 */
export interface HGMetalBufferWrapperInfinipool__Descriptor {
  /**
   * +0x00 — `void* bytes`, the no-copy backing pointer handed to
   * `newBufferWithBytesNoCopy:` @0x17b88d. Opaque here: `size()` never reads
   * it.
   */
  bytes?: unknown;

  /**
   * +0x08 — `NSUInteger length`, the byte length passed as `length:`
   * @0x17b890. This is the ONE field `size()` returns (@0x17a6a4).
   *
   * Held as `bigint` because the load is a full 64-bit `movq` with no
   * truncation: a `number` would silently lose precision above 2^53, and
   * PORTING_SPEC Rule 4 puts int64 values that can exceed 2^53 in bigint.
   */
  length: bigint;

  /**
   * +0x10 — `MTLResourceOptions options`, passed as `options:` @0x17b894.
   * Opaque here: `size()` never reads it.
   */
  options?: bigint;
}

/**
 * `HGMetalBufferWrapperInfinipool::Descriptor::size() const` — @Helium 0x17a6a0
 *   __ZNK30HGMetalBufferWrapperInfinipool10Descriptor4sizeEv
 *
 * Full transcription — every instruction, in order:
 *
 *   0x17a6a0  pushq %rbp            ; frame setup (no TS counterpart)
 *   0x17a6a1  movq  %rsp,%rbp       ; frame setup (no TS counterpart)
 *   0x17a6a4  movq  0x8(%rdi),%rax  ; rax = this->length  (+0x08, 64-bit load)
 *   0x17a6a8  popq  %rbp            ; frame teardown (no TS counterpart)
 *   0x17a6a9  retq                  ; returns that 64-bit value
 *   0x17a6aa  nopw  (%rax,%rax)     ; alignment padding, not executed
 *
 * Decode notes:
 *   * the load is `movq` — 64 bits, unmasked and unconverted — so the accessor
 *     is a pure field read and the return type is the stored 64-bit
 *     `NSUInteger`. There is no `movl`/`movzbl` narrowing to model.
 *   * `this` is read but never written: the method is `const` and the object
 *     is untouched.
 *
 * @param self %rdi — the Descriptor.
 * @returns %rax — the +0x08 byte length.
 */
export function HGMetalBufferWrapperInfinipool__Descriptor_size(
  self: HGMetalBufferWrapperInfinipool__Descriptor,
): bigint {
  // @0x17a6a4  movq 0x8(%rdi),%rax ; @0x17a6a9 retq
  return self.length;
}
