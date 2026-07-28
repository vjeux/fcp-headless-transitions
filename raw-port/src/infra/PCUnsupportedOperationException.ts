// PCUnsupportedOperationException.ts — ProCore's PCUnsupportedOperationException,
// a concrete C++ exception subclass of PCException signalling an
// "unsupported operation" error path. Sibling of PCNullPointerException
// (see raw-port/src/infra/PCNullPointerException.ts); the two share the
// exact codegen shape — the only differences are (a) the vtable slot
// pointer values, (b) the identifier string returned by `className()`.
//
// Transcribed from the disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
// Versions/A/ProCore. All three exported symbols cite their @0xADDR in
// ProCore; every callee is resolved by name from /tmp/ProCore_symmap.tsv;
// every constant is a byte offset read directly out of the assembly or
// (for the classname literal) directly out of __TEXT,__cstring in the
// binary — see the DECODE block for the cfstring/cstring read.
//
// nm evidence (`nm -arch x86_64 -n ProCore | grep PCUnsupportedOperation`):
//   000000000002c520 t __ZN31PCUnsupportedOperationExceptionD1Ev
//   000000000002c750 t __ZN31PCUnsupportedOperationExceptionD0Ev
//   000000000002c76c t __ZNK31PCUnsupportedOperationException9classNameEv
//
// Source disassembly (dumped via raw-port/tools/disasm.sh — D0/className
// files at raw-port/re/disasm/ProCore.PCUnsupportedOperationException.*
// — plus an awk pull on /tmp/ProCore_tV.txt for the D1 label):
//
// (D1 — complete-object dtor)
//   __ZN31PCUnsupportedOperationExceptionD1Ev:
//     0x2c520  pushq %rbp
//     0x2c521  movq  %rsp, %rbp
//     0x2c524  popq  %rbp
//     0x2c525  jmp   __ZN11PCExceptionD2Ev    ## PCException::~PCException()
//
// (D0 — deleting dtor)
//   __ZN31PCUnsupportedOperationExceptionD0Ev:
//     0x2c750  pushq %rbp
//     0x2c751  movq  %rsp, %rbp
//     0x2c754  pushq %rbx
//     0x2c755  pushq %rax                     ; 16B stack align
//     0x2c756  movq  %rdi, %rbx               ; spill this
//     0x2c759  callq __ZN11PCExceptionD2Ev    ; chain PCException D2
//     0x2c75e  movq  %rbx, %rdi               ; restore this
//     0x2c761  addq  $0x8, %rsp
//     0x2c765  popq  %rbx
//     0x2c766  popq  %rbp
//     0x2c767  jmp   0xde6c0                  ; symbol stub for __ZdlPv
//                                              ; (= operator delete(void*))
//
// (className — const)
//   __ZNK31PCUnsupportedOperationException9classNameEv:
//     0x2c76c  pushq %rbp
//     0x2c76d  movq  %rsp, %rbp
//     0x2c770  pushq %rbx
//     0x2c771  pushq %rax
//     0x2c772  movq  %rdi, %rbx               ; spill NRVO out-param
//     0x2c775  leaq  0x12091c(%rip), %rsi     ; &cfstring @VA 0x14d098
//                                              ; = "PCUnsupportedOperationException"
//                                              ; (see DECODE cfstring dump below)
//     0x2c77c  callq __ZN8PCStringC1EPK10__CFString  ; PCString::PCString(__CFString const*)
//     0x2c781  movq  %rbx, %rax               ; return the NRVO ptr (%rax = out param)
//     0x2c784  addq  $0x8, %rsp
//     0x2c788  popq  %rbx
//     0x2c789  popq  %rbp
//     0x2c78a  retq
//     0x2c78b  nop
//
// DECODE — cfstring literal @VA 0x14d098:
//   otool dumped the __cfstring section header:
//     sectname __cfstring, addr 0x14cc98, offset 1363096, size 0x3700.
//   File offset of the cfstring at 0x14d098 = 1363096 + (0x14d098 - 0x14cc98)
//                                            = 1363096 + 0x400 = 1364120.
//   Read 32 bytes at that offset:
//     isa       = 0x8020000000000363   (___CFConstantStringClassReference, w/ fixup hi bits)
//     flags     = 0x000000000000_07c8   (regular UTF-8 constant string)
//     cstr_ptr  = 0x2000_0000_00131700  (low-32 VA = 0x131700, hi bits are fixup marker)
//     length    = 31
//   __cstring section covers VA 0x131700; reading 31 bytes from the corresponding
//   file offset yields exactly "PCUnsupportedOperationException" (31 chars, no
//   trailing NUL in the count). This is the payload the className() call returns
//   wrapped in a PCString.
//
// Class layout (from the sibling PCNullPointerException port + confirmed here
// by the dtor-D0 body, which touches ONLY the base sub-object via PCException::D2
// and then operator-deletes `this` with the same %rdi pointer, meaning the base
// sits at offset 0 and this subclass adds NO fields of its own beyond the vtable
// slot):
//   +0x00  vtbl  : *const void  — installed by PCException's ctor path
//                                  (not on this class's decoded slice) to point
//                                  at the class's own vtable. This class carries
//                                  NO data fields.
//   PCException's own fields follow (undecoded on this slice — see
//   PCNullPointerException.ts's frontier stub for PCException).
//
// Frontier callees (all become throwing stubs — same pattern as
// PCNullPointerException):
//   PCException::~PCException()  [D2]           @ProCore tail-jmp D1 0x2c525 / callq D0 0x2c759
//   PCString::PCString(__CFString const*)       @ProCore callq className 0x2c77c
//   `_ZdlPv` (operator delete) via symbol stub  @ProCore tail-jmp D0 0x2c767 -> stub 0xde6c0
//
// Reused shape from PCNullPointerException.ts:
//   - PCString interface (opaque payload holder; full type deferred to the
//     future PCString port).
//   - pcStringFromCFString_stub — reuses the same faithful decoded-payload
//     placeholder.
// We DO NOT import from PCNullPointerException.ts because the raw-port
// convention is "one class per file, everything cited from THIS class's asm";
// re-declaring the stubs keeps the citations local and avoids cross-file
// coupling for what is a pure sibling class.

/**
 * Opaque handle for the PCString value returned by className() const.
 * The full class __ZN8PCStringE (layout, ctors, dtor, CFString bridging)
 * is not yet transcribed — see PCNullPointerException.ts for the same
 * observation. We model it here as its observable payload only.
 */
export interface PCString {
  readonly text: string;
}

/**
 * `PCString::PCString(__CFString const*)` — frontier callee. Called from
 * `className()` @0x2c77c with %rdi = an out-param PCString slot (NRVO) and
 * %rsi = the __CFConstantString ref at ProCore VA 0x14d098. Its body — the
 * CFString → PCString bridging code — is not on this class's decoded slice.
 *
 * As in PCNullPointerException's placeholder, we honour the DECODE by
 * returning a PCString whose payload is verbatim the constant-string bytes
 * read from ProCore's __cstring segment at VA 0x131700 (length 31,
 * "PCUnsupportedOperationException"). Not an invented value — the bytes
 * come straight out of the binary; see the DECODE cfstring block in the
 * file header.
 */
function pcStringFromCFString_stub(cfstringPayload: string): PCString {
  return { text: cfstringPayload };
}

/**
 * `PCException::~PCException()` [D2 base-object dtor] — frontier callee.
 * D1 tail-jmps to it @0x2c525; D0 callq's it @0x2c759 (D0 has additional
 * cleanup after — the tail-jmp to operator delete — so it can't tail-call
 * the base dtor). Not on this class's decoded surface. Same stub name and
 * shape as PCNullPointerException uses.
 */
function pcException_D2_dtor(_self: PCUnsupportedOperationException): void {
  throw new Error(
    "PCUnsupportedOperationException: PCException::~PCException() [D2] not " +
      "yet transcribed @ProCore tail-jmp D1 0x2c525 / callq D0 0x2c759"
  );
}

/**
 * `operator delete(void*)` — the C++ global deallocation function reached
 * through the symbol stub `__ZdlPv` @ProCore 0xde6c0. D0 tail-jmps to it at
 * @0x2c767. Standard C++ runtime; no per-class body.
 */
function cxx_operator_delete(_self: PCUnsupportedOperationException): void {
  throw new Error(
    "PCUnsupportedOperationException: operator delete(void*) not modelled in " +
      "the raw-port runtime @ProCore tail-jmp D0 0x2c767 (stub 0xde6c0)"
  );
}

/**
 * The class instance. Carries NO own data fields (see the layout block in the
 * file header). Its only own state is the vtable pointer at +0x00, which
 * PCException's ctor path installs — that path is not on this class's decoded
 * slice.
 */
export class PCUnsupportedOperationException {
  /**
   * `PCUnsupportedOperationException::~PCUnsupportedOperationException()` —
   * the Itanium C++ ABI D1 (complete-object) destructor. Mangled
   * `__ZN31PCUnsupportedOperationExceptionD1Ev` at @ProCore 0x2c520.
   *
   * Address-by-address:
   *   0x2c520  pushq %rbp             ─┐ empty frame
   *   0x2c521  movq  %rsp, %rbp       │
   *   0x2c524  popq  %rbp             ─┘
   *   0x2c525  jmp   PCException::~PCException()  ; tail-jmp base D2
   */
  destroy_D1_completeObjectDtor(): void {
    // @0x2c525 — tail-jmp base D2 dtor.
    pcException_D2_dtor(this);
  }

  /**
   * `PCUnsupportedOperationException::~PCUnsupportedOperationException()` —
   * the Itanium C++ ABI D0 (deleting) destructor. Mangled
   * `__ZN31PCUnsupportedOperationExceptionD0Ev` at @ProCore 0x2c750.
   *
   * Address-by-address:
   *   0x2c750..0x2c756  prologue + spill this into %rbx.
   *   0x2c759            callq PCException::~PCException().
   *   0x2c75e..0x2c766   restore this in %rdi + epilogue.
   *   0x2c767            tail-jmp `__ZdlPv` (operator delete(void*)).
   */
  destroy_D0_deletingDtor(): void {
    // @0x2c759 — chain base dtor.
    pcException_D2_dtor(this);
    // @0x2c767 — tail-jmp operator delete.
    cxx_operator_delete(this);
  }

  /**
   * `PCUnsupportedOperationException::className() const` — vtable override
   * returning the class's identifier as a PCString. Mangled
   * `__ZNK31PCUnsupportedOperationException9classNameEv` at @ProCore 0x2c76c.
   *
   * Address-by-address:
   *   0x2c76c..0x2c772  prologue + spill %rdi (NRVO out slot) into %rbx.
   *   0x2c775           leaq &cfstring, %rsi — cfstring @VA 0x14d098 whose
   *                     payload is the 31-byte string
   *                     "PCUnsupportedOperationException" at ProCore
   *                     __cstring VA 0x131700 (see DECODE block).
   *   0x2c77c           callq PCString::PCString(__CFString const*) —
   *                     the ctor writes into the NRVO slot at %rdi.
   *   0x2c781..0x2c78a  restore return value in %rax + epilogue + retq.
   *                     %rax carries the NRVO pointer (System V ABI: for a
   *                     class return whose size > 16B the caller passes the
   *                     out-slot in %rdi and the callee returns the same
   *                     pointer in %rax).
   */
  className(): PCString {
    // @0x2c775..0x2c77c — construct a PCString from the constant CFString
    // whose payload was read verbatim from the binary at __cstring VA
    // 0x131700 (31 bytes).
    return pcStringFromCFString_stub("PCUnsupportedOperationException");
  }
}
