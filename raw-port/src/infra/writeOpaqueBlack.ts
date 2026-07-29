// writeOpaqueBlack — anonymous-namespace helper from ProCore's PCColorUtil transform code.
// Fills a strided float buffer with "opaque black": alpha channel = 1.0, all other lanes = 0.
//
// Symbol: __ZL16writeOpaqueBlackmRKN12_GLOBAL__N_110BufferArgsIfEE
// Demangled: writeOpaqueBlack(unsigned long, (anonymous namespace)::BufferArgs<float> const&)
// Address:  @ProCore 0x10e06
// Called from: doSimpleTransform, doDynamicRangeTransform<>, and other PCColorUtil paths
// (see call-sites @0xe175, @0xe2a1, @0xe61d, @0xe7f4, @0xe81d — all in the tone-map/color
// transform pipeline; write an "empty output" plate when there's nothing to convert).
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZL16writeOpaqueBlackmRKN12_GLOBAL__N_110BufferArgsIfEE.s
//
// BufferArgs<float> layout recovered from the load pattern in this function:
//   +0x00  float*         buffer       (r13 <- (%rsi))
//   +0x08  unsigned long  count        (rbx <- 0x8(%rsi))         ; #floats per row (channels)
//   +0x18  int            alphaPos     (eax <- 0x18(%rsi))        ; enum: 0=none, 1=first, 2=last
// (Other fields at +0x10, +0x20 etc. exist per callers but are not touched here.)
//
// The first argument (%rdi = r14) is `unsigned long nRows` — number of rows to fill.

/**
 * Anonymous BufferArgs<float> shape as seen by writeOpaqueBlack. Only 3 fields are
 * required by this function; the full struct is modelled elsewhere when a broader port
 * is done. Callers pass by const reference (`RK...` in the mangling) so we take a
 * plain object here.
 */
export interface BufferArgs_float {
  /** +0x00  float*  buffer     Raw destination buffer, indexed AS FLOATS (not bytes). */
  buffer: Float32Array;
  /** +0x08  unsigned long  count      #floats per row (channel count). */
  count: number;
  /** +0x18  int  alphaPos    Alpha position enum. 1 = alpha-first (ARGB-like);
   *                          2 = alpha-last (RGBA-like); anything else = no alpha channel
   *                          (fall through to plain bzero of the whole plane). */
  alphaPos: number;
  /** +0x00 offset in FLOATS from `buffer` at which the row-0 starts. Because JS lacks raw
   *  pointer arithmetic, callers that hand a subview should set this to 0; callers that
   *  want to write into a larger buffer at an offset can shift `buffer` themselves. */
  bufferOffset?: number;
}

/**
 * writeOpaqueBlack(unsigned long nRows, BufferArgs<float> const& args)
 * @ProCore 0x10e06  __ZL16writeOpaqueBlackmRKN12_GLOBAL__N_110BufferArgsIfEE
 *
 * Body decoded from the disasm — three branches on `args.alphaPos`:
 *
 *   0x10e17  movq (%rsi), %r13            ; buffer     = args.buffer
 *   0x10e1a  movq 0x8(%rsi), %rbx         ; count      = args.count      (floats/row)
 *   0x10e1e  movl 0x18(%rsi), %eax        ; alphaPos   = args.alphaPos
 *   0x10e21  xorl %ecx, %ecx
 *   0x10e23  cmpl $0x1, %eax
 *   0x10e26  sete %cl                     ; cl = (alphaPos == 1)
 *   0x10e29  leaq (%r13,%rcx,4), %rcx     ; zeroStart = buffer + (alphaPos==1 ? 4 bytes : 0)
 *   0x10e2e  movq %rcx, -0x30(%rbp)       ;         (spill zeroStart into stack slot)
 *   0x10e32  je 0x10e40                   ; if alphaPos==1  goto rowLoopHead (alpha at [0])
 *   0x10e34  cmpl $0x2, %eax
 *   0x10e37  jne 0x10e7c                  ; if alphaPos!=2 AND !=1  goto zeroAll
 *   0x10e39  leaq -0x4(%r13,%rbx,4), %r13 ; alphaPtr = buffer + (count-1)*4 bytes = &buffer[count-1]
 *   0x10e3e  jmp 0x10e45                  ; goto rowLoopBody
 *   0x10e40  testq %r13, %r13
 *   0x10e43  je 0x10e7c                   ; alphaPos==1 && buffer==NULL -> zeroAll (defensive)
 *   0x10e45  leaq -0x4(,%rbx,4), %r12     ; zeroBytesPerRow = (count - 1) * 4  bytes
 *   0x10e4d  shlq $0x2, %rbx              ; rowStrideBytes = count * 4
 *   0x10e51  xorl %r15d, %r15d            ; rowByteOffset = 0
 *
 *   Row loop  (r14 = nRows, decremented until 0):
 *     0x10e54  testq %r12, %r12
 *     0x10e57  jle 0x10e69                ; if count==1 no bzero needed (single-channel alpha)
 *     0x10e59  movq -0x30(%rbp), %rax
 *     0x10e5d  leaq (%rax,%r15), %rdi     ; rdi = zeroStart + rowByteOffset
 *     0x10e61  movq %r12, %rsi            ; rsi = zeroBytesPerRow
 *     0x10e64  callq ___bzero             ; bzero(rdi, rsi)  — zero all non-alpha lanes of the row
 *     0x10e69  movl $0x3f800000, (%r13,%r15) ; *(alphaPtr + rowByteOffset) = 1.0f
 *     0x10e72  addq %rbx, %r15            ; rowByteOffset += rowStrideBytes
 *     0x10e75  decq %r14                  ; nRows--
 *     0x10e78  jne 0x10e54                ; continue while nRows != 0
 *     0x10e7a  jmp 0x10ea3                ; done
 *
 *   Fall-through zeroAll  (alphaPos not 1 or 2, OR alphaPos==1 && buffer==null):
 *     0x10e7c  imulq %r14, %rbx           ; totalFloats = nRows * count
 *     0x10e80  testq %rbx, %rbx
 *     0x10e83  jle 0x10ea3                ; if <=0 done
 *     0x10e85  shlq $0x2, %rbx            ; totalBytes = totalFloats * 4
 *     0x10e89  movq -0x30(%rbp), %rdi     ; rdi = zeroStart (== buffer when alphaPos!=1; when
 *                                         ;   alphaPos==1 && buffer==NULL, zeroStart == 4 which
 *                                         ;   would be a wild-write, but the earlier je already
 *                                         ;   guarded the null-buffer subcase.)
 *     0x10e8d  movq %rbx, %rsi
 *     0x10e9e  jmp ___bzero               ; tail-jmp bzero
 *
 * Note (alphaPos==1 && buffer==null): the disasm falls through to zeroAll but with
 * zeroStart == 4 (i.e. NULL+4). The compiler knows `buffer == NULL` here, so `zeroStart`
 * has value 0x4 — a would-be wild write. This is defensive-and-buggy in the original;
 * the buffer==null path is unreachable in practice (callers always pass a non-null buffer).
 * We faithfully mirror the disasm: check for null buffer with `alphaPos == 1`, and when
 * true fall into the zeroAll path with the (impossible-to-actually-fire) offset behavior.
 * The result is a JS-safe no-op — we early-return when buffer is null / length is zero,
 * matching the effective behavior of the compiled code without reproducing the UB.
 */
export function writeOpaqueBlack(nRows: number, args: BufferArgs_float): void {
  // @0x10e17..0x10e1e  Field loads
  const buffer = args.buffer;                       // r13 <- (%rsi)
  const count = args.count | 0;                     // rbx <- 0x8(%rsi)   (unsigned long, but bounded)
  const alphaPos = args.alphaPos | 0;               // eax <- 0x18(%rsi)  (int)
  const bufferOffset = (args.bufferOffset ?? 0) | 0;

  // @0x10e21..0x10e29  Compute zeroStart offset (in FLOATS, not bytes).
  //   cl = (alphaPos == 1) -> zeroStart = buffer + (cl ? 4 bytes : 0)
  //   Then leaq (%r13, %rcx, 4)  — in JS we work in float units, so +1 element when alphaPos==1.
  const zeroStartFloatOffset = bufferOffset + (alphaPos === 1 ? 1 : 0);   // @0x10e29 leaq (%r13,%rcx,4)

  // @0x10e32  je 0x10e40  — alphaPos == 1 goes to rowLoop
  // @0x10e34..0x10e37     — alphaPos != 2 (and != 1) goes to zeroAll
  if (alphaPos !== 1 && alphaPos !== 2) {
    // @0x10e7c..0x10e9e  Fallthrough: bzero the entire plane. tail-jmp ___bzero.
    const totalFloats = (nRows * count) | 0;        // @0x10e7c imulq %r14, %rbx
    if (totalFloats <= 0) return;                   // @0x10e83 jle done
    // @0x10e89..0x10e9e  bzero(buffer + zeroStart, totalBytes).  In JS: subarray + fill(0).
    buffer.fill(0, zeroStartFloatOffset, zeroStartFloatOffset + totalFloats);
    return;
  }

  // Determine the alpha-lane offset (in FLOATS) within the row.
  //   alphaPos == 1: alphaPtr = buffer + 0                            (alpha first)
  //   alphaPos == 2: alphaPtr = buffer + (count - 1)  [@0x10e39 leaq -4(r13, rbx, 4)]
  let alphaFloatOffset: number;
  if (alphaPos === 1) {
    // @0x10e40  testq %r13, %r13  — alphaPos==1 && buffer==NULL guard.
    // We can't have a NULL Float32Array reference, but a zero-length buffer with
    // bufferOffset=0 is the JS analogue: the guard falls to zeroAll (no-op below).
    if (buffer.length === 0) {
      // @0x10e43 je 0x10e7c  — fall through to zeroAll (which is a no-op for empty buffer).
      return;
    }
    alphaFloatOffset = bufferOffset;                // r13 stays as buffer
  } else {
    // alphaPos == 2, @0x10e39
    alphaFloatOffset = bufferOffset + (count - 1);  // alphaPtr = &buffer[count-1]
  }

  // @0x10e45  zeroBytesPerRow = (count - 1) * 4  -> in JS: zeroFloatsPerRow = count - 1
  const zeroFloatsPerRow = count - 1;               // r12
  // @0x10e4d  rowStrideBytes = count * 4  -> in JS: rowStrideFloats = count
  const rowStrideFloats = count;                    // rbx after shl
  // @0x10e51  rowByteOffset = 0  -> rowFloatOffset = 0
  let rowFloatOffset = 0;                           // r15

  // @0x10e54..0x10e78  Row loop: for each of nRows rows, bzero non-alpha lanes then set alpha=1.
  let rows = nRows | 0;                             // r14
  while (rows !== 0) {                              // @0x10e78 jne back to 0x10e54
    // @0x10e54  testq %r12, %r12  ;  @0x10e57 jle 0x10e69
    if (zeroFloatsPerRow > 0) {
      // @0x10e59..0x10e64  bzero(zeroStart + rowByteOffset, zeroBytesPerRow)
      //   -> fill zeroFloatsPerRow floats to 0 starting at zeroStartFloatOffset + rowFloatOffset.
      const start = zeroStartFloatOffset + rowFloatOffset;
      buffer.fill(0, start, start + zeroFloatsPerRow);
    }
    // @0x10e69  movl $0x3f800000, (%r13, %r15)  ; *(alphaPtr + rowByteOffset) = 1.0f
    //   0x3f800000 is the IEEE-754 single-precision bit pattern for 1.0.
    buffer[alphaFloatOffset + rowFloatOffset] = 1.0;
    // @0x10e72  addq %rbx, %r15    ; rowByteOffset += rowStrideBytes
    rowFloatOffset += rowStrideFloats;
    // @0x10e75  decq %r14
    rows--;
  }
  // @0x10e7a  jmp 0x10ea3 -> return
}
