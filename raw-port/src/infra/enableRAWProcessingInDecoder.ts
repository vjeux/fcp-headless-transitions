// enableRAWProcessingInDecoder.ts — a Flexo free function guarding a process-wide "is RAW
// processing enabled in the decoder?" flag behind a dispatch_once one-time initializer.
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly:
//   raw-port/re/disasm/Flexo.__Z28enableRAWProcessingInDecoderv.s        (this function, hot path)
//   raw-port/re/disasm/Flexo.__Z28enableRAWProcessingInDecodervcold1.s   (the .cold.1 slow path)
//
// This is the classic function-local-`static` + `dispatch_once` idiom. Two file-scope statics
// back it (the guard predicate + the value):
//   __ZZ28enableRAWProcessingInDecodervE11s_predicate                    : dispatch_once_t (long)
//   __ZZ28enableRAWProcessingInDecodervE30s_enableRAWProcessingInDecoder : bool (byte)
//
// HOT PATH (this unit) @Flexo 0xe404a0:
//   cmpq $-0x1, s_predicate ; jne slow ; movzbl s_enableRAWProcessingInDecoder ; retq
//   the fast path returns the cached byte once the predicate has reached -1 (dispatch_once "done").
//
// SLOW PATH .cold.1 @Flexo 0x1489750 (a SEPARATE ledger unit — NOT ported here):
//   leaq s_predicate,%rdi ; leaq ___block_literal_global,%rsi ; jmp _dispatch_once
//   i.e. dispatch_once(&s_predicate, ^{ ... compute s_enableRAWProcessingInDecoder ... }).
//
// Per the porting anti-cheat policy (call_once/dispatch_once boundary): the one-time WORK lives
// inside the `.cold.1` slow path + its global block, which is a DISTINCT symbol/ledger unit and an
// out-of-scope libdispatch (`_dispatch_once`) boundary. This unit faithfully models ONLY the hot
// path: the sentinel test and the cached-byte return. The first-call slow path defers to that
// separate initializer via a boundary that throws (citing the addresses) until a host binds it —
// we do NOT fabricate the block's body here.

// @const Flexo __ZZ28enableRAWProcessingInDecodervE11s_predicate
//   dispatch_once_t predicate (a `long`). Initial value 0 (never run). dispatch_once sets it to
//   ~0 (== -1) once the block has completed; the inlined fast path at 0xe404a0 tests `== -1`.
let s_predicate: bigint = 0n;

// @const Flexo __ZZ28enableRAWProcessingInDecodervE30s_enableRAWProcessingInDecoder
//   the cached bool result (one byte). Written by the dispatch_once block in .cold.1.
let s_enableRAWProcessingInDecoder = 0;

/**
 * enableRAWProcessingInDecoder() -> bool
 * @0xADDR Flexo 0x0000000000e404a0  (__Z28enableRAWProcessingInDecoderv)
 *
 * DECODE (raw-port/re/disasm/Flexo.__Z28enableRAWProcessingInDecoderv.s):
 *   0xe404a0  cmpq $-0x1, s_predicate(%rip)
 *   0xe404a8  jne  0xe404b2                    ; predicate != -1  -> run the one-time init
 *   0xe404aa  movzbl s_enableRAWProcessingInDecoder(%rip),%eax
 *   0xe404b1  retq                             ; fast path: already-initialised, return cached byte
 *   0xe404b2  pushq %rbp ; movq %rsp,%rbp
 *   0xe404b6  callq __Z28enableRAWProcessingInDecoderv.cold.1   ; dispatch_once(&s_predicate, block)
 *   0xe404bb  popq %rbp
 *   0xe404bc  movzbl s_enableRAWProcessingInDecoder(%rip),%eax  ; reload after init
 *   0xe404c3  retq
 *
 * The `.cold.1` initializer (@Flexo 0x1489750) and the global dispatch block it runs are a SEPARATE
 * ledger unit + an out-of-scope libdispatch boundary; they are modelled by the throwing helper
 * below, NOT reimplemented. Zero in-scope callees.
 */
export function enableRAWProcessingInDecoder(): boolean {
  // @0xe404a0..0xe404a8  dispatch_once fast-path: predicate == -1 means the block already ran.
  if (s_predicate !== -1n) {
    // @0xe404b2..0xe404bb  slow path: run the one-time initializer (.cold.1 -> _dispatch_once).
    enableRAWProcessingInDecoder_cold1();
  }
  // @0xe404aa / 0xe404bc  movzbl — return the cached byte as a bool (zero-extended low byte).
  return (s_enableRAWProcessingInDecoder & 0xff) !== 0;
}

/**
 * enableRAWProcessingInDecoder()::.cold.1 — the dispatch_once slow path.
 * @0xADDR Flexo 0x0000000001489750  (__Z28enableRAWProcessingInDecoderv.cold.1)
 *
 * DECODE (raw-port/re/disasm/Flexo.__Z28enableRAWProcessingInDecodervcold1.s):
 *   leaq s_predicate,%rdi ; leaq ___block_literal_global,%rsi ; jmp _dispatch_once
 *   => dispatch_once(&s_predicate, ___block_literal_global)
 *
 * `_dispatch_once` (libdispatch) and the global block are outside the 5-framework port scope, and
 * `.cold.1` is itself a distinct ledger symbol. This boundary is modelled as a throw citing its
 * address; a host that binds libdispatch + the block will set the statics here.
 */
function enableRAWProcessingInDecoder_cold1(): void {
  throw new Error(
    "enableRAWProcessingInDecoder .cold.1 -> _dispatch_once(&s_predicate, block) " +
      "@Flexo 0x1489750 (jmp _dispatch_once @stub 0x1497674): libdispatch one-time init " +
      "is an out-of-scope boundary / separate ledger unit — host must run the block.",
  );
}
