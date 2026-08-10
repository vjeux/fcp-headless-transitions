// PCEmbeddedCodecsAndFormatReadersAreBypassed.ts — a ProCore free function guarding a
// process-wide "are embedded codecs & format readers bypassed?" flag behind a dispatch_once
// one-time initializer. Faithfully transcribed from the FCP ProCore framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// Source disassembly:
//   raw-port/re/disasm/ProCore.__Z43PCEmbeddedCodecsAndFormatReadersAreBypassedv.s      (hot path)
//   raw-port/re/disasm/ProCore.__Z43PCEmbeddedCodecsAndFormatReadersAreBypassedvcold1.s (.cold.1)
//
// This is the classic function-local-`static` + `dispatch_once` idiom (identical in shape to
// infra/enableRAWProcessingInDecoder.ts). Two file-scope statics back the private
// `skipEmbeddedCodecsAndFormatReaders()` translation unit:
//   __ZZL34skipEmbeddedCodecsAndFormatReadersvE11s_predicate    : dispatch_once_t (long)
//   __ZZL34skipEmbeddedCodecsAndFormatReadersvE13s_skipPlugins  : bool (byte)
//
// HOT PATH (this unit) @ProCore 0x951b2:
//   cmpq $-0x1, s_predicate ; jne slow ; movb s_skipPlugins,%al ; retq
//   the fast path returns the cached byte once the predicate has reached -1 (dispatch_once "done").
//
// SLOW PATH .cold.1 @ProCore 0xddc72 (a SEPARATE ledger unit — NOT ported here):
//   leaq s_predicate,%rdi ; leaq ___block_literal_global,%rsi ; jmp _dispatch_once
//   i.e. dispatch_once(&s_predicate, ^{ ... compute s_skipPlugins ... }).
//
// Per the porting anti-cheat policy (call_once/dispatch_once boundary): the one-time WORK lives
// inside the `.cold.1` slow path + its global block, which is a DISTINCT symbol/ledger unit and an
// out-of-scope libdispatch (`_dispatch_once`) boundary. This unit faithfully models ONLY the hot
// path: the sentinel test and the cached-byte return. The first-call slow path defers to that
// separate initializer via a boundary that throws (citing the addresses) until a host binds it —
// we do NOT fabricate the block's body here, and we NEVER fabricate an allocation.

// @const ProCore __ZZL34skipEmbeddedCodecsAndFormatReadersvE11s_predicate
//   dispatch_once_t predicate (a `long`). Initial value 0 (never run). dispatch_once sets it to
//   ~0 (== -1) once the block has completed; the inlined fast path at 0x951b2 tests `== -1`.
let s_predicate: bigint = 0n;

// @const ProCore __ZZL34skipEmbeddedCodecsAndFormatReadersvE13s_skipPlugins
//   the cached bool result (one byte). Written by the dispatch_once block in .cold.1.
let s_skipPlugins = 0;

/**
 * PCEmbeddedCodecsAndFormatReadersAreBypassed() -> bool
 * @0xADDR ProCore 0x00000000000951b2  (__Z43PCEmbeddedCodecsAndFormatReadersAreBypassedv)
 *
 * DECODE (raw-port/re/disasm/ProCore.__Z43PCEmbeddedCodecsAndFormatReadersAreBypassedv.s):
 *   0x951b2  cmpq $-0x1, s_predicate(%rip)
 *   0x951ba  jne  0x951c3                     ; predicate != -1  -> run the one-time init
 *   0x951bc  movb s_skipPlugins(%rip),%al     ; fast path: cached byte
 *   0x951c2  retq
 *   0x951c3  pushq %rbp ; movq %rsp,%rbp
 *   0x951c7  callq __Z43PCEmbeddedCodecsAndFormatReadersAreBypassedv.cold.1  ; dispatch_once(...)
 *   0x951cc  popq %rbp
 *   0x951cd  jmp  0x951bc                      ; reload the cached byte after init
 *
 * The `.cold.1` initializer (@ProCore 0xddc72) and the global dispatch block it runs are a SEPARATE
 * ledger unit + an out-of-scope libdispatch boundary; they are modelled by the throwing helper
 * below, NOT reimplemented. Zero in-scope callees.
 *
 * NOTE the hot-path load here is `movb` (not `movzbl`): the machine returns the raw low byte into
 * %al. As a bool the caller only inspects the low byte, so `(s_skipPlugins & 0xff) !== 0` is the
 * faithful boolean projection.
 */
export function PCEmbeddedCodecsAndFormatReadersAreBypassed(): boolean {
  // @0x951b2..0x951ba  dispatch_once fast-path: predicate == -1 means the block already ran.
  if (s_predicate !== -1n) {
    // @0x951c3..0x951cc  slow path: run the one-time initializer (.cold.1 -> _dispatch_once).
    PCEmbeddedCodecsAndFormatReadersAreBypassed_cold1();
  }
  // @0x951bc  movb s_skipPlugins,%al ; retq — return the cached low byte as a bool.
  return (s_skipPlugins & 0xff) !== 0;
}

/**
 * PCEmbeddedCodecsAndFormatReadersAreBypassed()::.cold.1 — the dispatch_once slow path.
 * @0xADDR ProCore 0x00000000000ddc72  (__Z43PCEmbeddedCodecsAndFormatReadersAreBypassedv.cold.1)
 *
 * DECODE (raw-port/re/disasm/ProCore.__Z43PCEmbeddedCodecsAndFormatReadersAreBypassedvcold1.s):
 *   leaq s_predicate,%rdi ; leaq ___block_literal_global,%rsi ; jmp _dispatch_once  (stub @0xde810)
 *   => dispatch_once(&s_predicate, ___block_literal_global)
 *
 * `_dispatch_once` (libdispatch) and the global block are outside the 5-framework port scope, and
 * `.cold.1` is itself a distinct ledger symbol. This boundary is modelled as a throw citing its
 * address; a host that binds libdispatch + the block will set the statics here.
 */
function PCEmbeddedCodecsAndFormatReadersAreBypassed_cold1(): void {
  throw new Error(
    "PCEmbeddedCodecsAndFormatReadersAreBypassed .cold.1 -> " +
      "_dispatch_once(&s_predicate, block) @ProCore 0xddc72 (jmp _dispatch_once @stub 0xde810): " +
      "libdispatch one-time init is an out-of-scope boundary / separate ledger unit — " +
      "host must run the block.",
  );
}
