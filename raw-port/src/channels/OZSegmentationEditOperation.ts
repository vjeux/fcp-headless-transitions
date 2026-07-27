/**
 * OZSegmentationEditOperation — Ozone framework
 *
 * Pure static helpers describing the segmentation edit operation enum used by
 * Ozone paint/mask segmentation channels. Faithfully transcribed from disasm.
 *
 * Empirical enum semantics recovered from the two decoders below:
 *   0 → maps to 1 under inverse
 *   1 → maps to 0 under inverse
 *   2 → "None"    (isNone returns true; inverse is fixed point at 2)
 *   n>2 → inverse returns 2
 */

export class OZSegmentationEditOperation {
  /**
   * @0x0000000000332180  __ZN27OZSegmentationEditOperation7inverseEj
   *
   * Faithful transcription of:
   *   xorl  %ecx, %ecx
   *   cmpl  $0x1, %edi         ; op == 1 ?
   *   setne %cl                ; cl = (op != 1)
   *   addl  %ecx, %ecx         ; ecx = (op != 1) ? 2 : 0
   *   testl %edi, %edi         ; op == 0 ?
   *   movl  $0x1, %eax         ; default result = 1
   *   cmovnel %ecx, %eax       ; if op != 0, eax = ecx
   *   retq
   *
   * Truth table:
   *   op=0 → 1
   *   op=1 → 0     (ecx = (1!=1)?2:0 = 0; op!=0 → eax=ecx=0)
   *   op=2 → 2     (ecx = 2; op!=0 → eax=2)
   *   op=n>2 → 2   (ecx = 2; op!=0 → eax=2)
   */
  static inverse(op: number): number {
    // Force uint32 semantics on inputs (asm operates on %edi / %eax as u32).
    const edi = op >>> 0;
    // setne cl : cl = (edi != 1) ? 1 : 0
    let ecx = (edi !== 1) ? 1 : 0;
    // addl ecx, ecx
    ecx = (ecx + ecx) >>> 0;
    // default eax = 1
    let eax = 1;
    // cmovnel ecx, eax : if (edi != 0) eax = ecx
    if (edi !== 0) {
      eax = ecx;
    }
    return eax >>> 0;
  }

  /**
   * @0x00000000003321a0  __ZN27OZSegmentationEditOperation6isNoneEj
   *
   * Faithful transcription of:
   *   cmpl  $0x2, %edi
   *   sete  %al
   *   retq
   *
   * Returns (op == 2) as an unsigned 8-bit boolean (0 or 1). We surface it as
   * a TypeScript boolean since the C++ ABI (sete %al) mirrors bool return.
   */
  static isNone(op: number): boolean {
    const edi = op >>> 0;
    return edi === 2;
  }
}
