// raw-port/src/channels/isCompatibleWithMatchingCodecGroup.ts
//
// Flexo free function `isCompatibleWithMatchingCodecGroup(unsigned int)` — decides
// whether a given fourCC codec code belongs to the DV "matching codec group"
// (the DV/DVCPRO family that Flexo treats as mutually compatible for a matching
// output). Returns bool.
//
// FRAMEWORK: Flexo.framework
// FAT slice: thin binary /tmp/Flexo.x86_64 (segment __TEXT vmaddr == file offset).
//
// DISASSEMBLY:
//   raw-port/re/disasm/Flexo.__Z34isCompatibleWithMatchingCodecGroupj.s
//
// SYMBOL:
//   @Flexo 0xe42440  isCompatibleWithMatchingCodecGroup(unsigned int)
//                    __Z34isCompatibleWithMatchingCodecGroupj
//
// The body is a fourCC switch. All constants are big-endian 4-char codec codes
// read straight from the `cmpl $imm, %edi` immediates in the disasm:
//   0x6476636f 'dvco'  — the signed pivot for the jg split (NOT a member)
//   0x6476356e 'dv5n'  — member
//   0x64763570 'dv5p'  — member
//   0x64766320 'dvc '  — member
//   0x64766870 'dvhp'  — member (low end of the [dvhp,dvhq] unsigned range)
//   0x64766871 'dvhq'  — member (high end of that range)
//   0x64766370 'dvcp'  — member
//   0x64767070 'dvpp'  — member
//
// CONTROL FLOW (default %al=1 at entry @0xe42444):
//   @0xe42446 cmpl $0x6476636f,%edi ; jg high     -> arg > 'dvco' (SIGNED) => high block
//   LOW block (arg <= 'dvco'):
//     @0xe4244e je 'dv5n' -> true
//     @0xe42456 je 'dv5p' -> true
//     @0xe4245e jne 'dvc ' -> if != 'dvc ' fall to xor(false); else true
//   HIGH block (arg > 'dvco'):
//     @0xe42468 leal -'dvhp'(%rdi),%ecx ; cmpl $2,%ecx ; jb true
//                  -> (arg - 'dvhp') unsigned < 2  => arg in {'dvhp','dvhq'} => true
//     @0xe42473 je 'dvcp' -> true
//     @0xe4247b je 'dvpp' -> true
//   @0xe42483 xorl %eax,%eax -> false (no match)

const DVCO = 0x6476636f; // 'dvco'  @Flexo 0xe42446 (signed jg pivot)
const DV5N = 0x6476356e; // 'dv5n'  @Flexo 0xe4244e
const DV5P = 0x64763570; // 'dv5p'  @Flexo 0xe42456
const DVC_ = 0x64766320; // 'dvc '  @Flexo 0xe4245e
const DVHP = 0x64766870; // 'dvhp'  @Flexo 0xe42468 (range base)
const DVCP = 0x64766370; // 'dvcp'  @Flexo 0xe42473
const DVPP = 0x64767070; // 'dvpp'  @Flexo 0xe4247b

/**
 * isCompatibleWithMatchingCodecGroup(unsigned int codec) @Flexo 0xe42440
 *   __Z34isCompatibleWithMatchingCodecGroupj
 *
 * Faithful transcription of the fourCC switch above. `codec` is an unsigned
 * 32-bit fourCC; the disasm's `jg` split is SIGNED, but every compared value
 * has bit31 clear (0x64xxxxxx), so signed and unsigned ordering coincide and
 * the low/high partition can be reproduced with an unsigned comparison. We keep
 * the exact two-block structure and constants regardless.
 */
export function isCompatibleWithMatchingCodecGroup(codec: number): boolean {
  const arg = codec >>> 0; // unsigned int argument (%edi)
  // @0xe42446 cmpl $DVCO,%edi ; jg high   (all constants have bit31=0 -> ordering unambiguous)
  if (arg > DVCO) {
    // HIGH block
    // @0xe42468 leal -DVHP(%rdi),%ecx ; cmpl $2,%ecx ; jb true
    const ecx = (arg - DVHP) >>> 0;
    if (ecx < 2) return true; // arg in {'dvhp','dvhq'}
    // @0xe42473 je DVCP -> true
    if (arg === DVCP) return true;
    // @0xe4247b je DVPP -> true
    if (arg === DVPP) return true;
    // @0xe42483 xorl %eax,%eax -> false
    return false;
  }
  // LOW block (arg <= DVCO)
  // @0xe4244e je DV5N -> true
  if (arg === DV5N) return true;
  // @0xe42456 je DV5P -> true
  if (arg === DV5P) return true;
  // @0xe4245e jne DVC_ -> false unless equal
  if (arg === DVC_) return true;
  // @0xe42483 xorl %eax,%eax -> false
  return false;
}
