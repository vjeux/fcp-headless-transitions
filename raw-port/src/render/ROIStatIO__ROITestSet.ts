// ROIStatIO__ROITestSet.ts — raw transcription of Helium `ROIStatIO::ROITestSet`.
//
// A row of Helium's ROI (region-of-interest) statistics log: a named test case with a frame
// number, an input index and a measured ratio. NESTED CLASS, so the file name joins the outer and
// inner names with a DOUBLE underscore per PORTING_SPEC.md
// (`ROIStatIO::ROITestSet` -> `ROIStatIO__ROITestSet.ts`).
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x147390  ROIStatIO::ROITestSet::~ROITestSet()
//                __ZN9ROIStatIO10ROITestSetD1Ev
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN9ROIStatIO10ROITestSetD1Ev Helium`):
//   raw-port/re/disasm/Helium.__ZN9ROIStatIO10ROITestSetD1Ev.s (22 lines)
//
// ONE symbol is ported here. The class's other emitted members are separate ledger units and are
// NOT ported: `operator<<(std::ostream&, ROITestSet const&)` @0x145fc0 (read below as layout
// evidence only), and the compiler-emitted `std::vector<ROITestSet>` machinery — `insert`
// @0x147a50, `__emplace_back_slow_path` @0x149c60, `__split_buffer::~__split_buffer` @0x149e00,
// `__uninitialized_allocator_relocate` @0x149e90, `__split_buffer::emplace_back` @0x14a030.
// D1 is the only destructor symbol the class emits (there is no separate D2 or D0 in
// raw-port/army/inventory/Helium.syms.txt).
//
// ---------------------------------------------------------------------------------------------
// STRUCT LAYOUT — grounded on the two decoded functions, nothing invented
// ---------------------------------------------------------------------------------------------
//   +0x00  std::string  name    — libc++ string #1. THIS destructor tests its is_long bit with
//                                 `testb $0x1, (%rbx)` @0x1473a8 and frees `*(this+0x10)`
//                                 @0x1473b4, i.e. __cap_ at +0x00, __size_ at +0x08, __data_ at
//                                 +0x10 — the x86_64 libc++ layout. `operator<<` @0x145fc0
//                                 corroborates all three: it reads the size byte with
//                                 `movzbl (%rbx),%edx` @0x145fda, and on the LONG path passes
//                                 `movq 0x10(%rbx),%rsi` (data) with `movq 0x8(%rbx),%rdx` (size)
//                                 @0x145fe2/@0x145fe6, while on the SHORT path it takes
//                                 `leaq 0x1(%rbx),%rsi` @0x145fec — the inline characters that
//                                 start one byte in. It prints after the literal "name ".
//   +0x18  int32        frame   — `movl 0x18(%rbx),%esi` @0x14600e, printed after " frame ".
//   +0x1c  int32        input   — `movl 0x1c(%rbx),%esi` @0x14602d, printed after " input ".
//   +0x20  int32        divisor — `cvtsi2sdl 0x20(%rbx),%xmm1` @0x14604c: read as a SIGNED int32
//                                 and converted to double.
//   +0x28  double       value   — `movsd 0x28(%rbx),%xmm0` @0x146051. The printed " ratio " is
//                                 `value / (double)divisor` (`divsd %xmm1,%xmm0` @0x146056).
//   +0x30  std::string  #2      — libc++ string #2, and the FIRST thing this destructor releases:
//                                 `testb $0x1, 0x30(%rdi)` @0x147399 tests its is_long bit and
//                                 `movq 0x40(%rbx),%rdi` @0x14739f loads its __data_ (0x30 + 0x10).
//                                 `operator<<` never prints it, so this file does not name it
//                                 beyond its offset — naming it would be a claim neither decoded
//                                 function makes.
//
// The two string members are destroyed in REVERSE declaration order (+0x30 first, then +0x00),
// which is the standard C++ rule and exactly what the instruction order shows.
//
// CALLEES: `operator delete(void*)` (`__ZdlPv`, the libc++/ABI extern) twice, through the Helium
// symbol stub at 0x3c4fa0 — once as a `callq` @0x1473a3 and once as a tail `jmp` @0x1473be. No
// in-scope callee, no indirect or virtual dispatch (`depgraph.py deps` lists nothing).

/**
 * The libc++ `std::string` representation this destructor actually inspects, in the **x86_64**
 * layout the port is transcribed from.
 *
 * Only the two words the body reads are modelled — the capacity word (whose bit 0 is `is_long`)
 * and the heap data pointer. `__size_` at +0x08 is not read by THIS function; it is documented in
 * the file header from `operator<<` rather than invented into the model here.
 *
 * (The arm64 slice encodes `is_long` in the sign bit of byte +0x17 instead, which is why every
 * address in this file is an x86_64 offset and why any oracle here must run under Rosetta.)
 */
export interface LibcxxStringRepr {
  /** +0x00 of the string — `__cap_`; bit 0 is `is_long`. Tested by `testb $0x1` @0x147399/@0x1473a8. */
  capWordLowByte: number;
  /** +0x10 of the string — `__data_`, the heap buffer freed when `is_long` is set. */
  dataPtr: unknown;
}

/**
 * `ROIStatIO::ROITestSet` — one row of the ROI statistics log.
 *
 * Only the members this destructor and its cited evidence establish are modelled; see the file
 * header for each offset and the instruction that proves it.
 */
export interface ROIStatIO__ROITestSet {
  /** +0x00 std::string `name` — printed by operator<< after the literal "name ". */
  name: LibcxxStringRepr;
  /** +0x18 int32 — printed after " frame ". */
  frameAt0x18: number;
  /** +0x1c int32 — printed after " input ". */
  inputAt0x1c: number;
  /** +0x20 int32 — the signed divisor of the printed ratio (`cvtsi2sdl` @0x14604c). */
  divisorAt0x20: number;
  /** +0x28 double — the numerator of the printed ratio (`movsd` @0x146051). */
  valueAt0x28: number;
  /** +0x30 std::string — released FIRST by the destructor; operator<< never prints it, so it is
   *  named only by its offset. */
  stringAt0x30: LibcxxStringRepr;
}

/**
 * `operator delete(void*)` — `__ZdlPv`, the libc++/ABI extern reached through the Helium symbol
 * stub at 0x3c4fa0 (@0x1473a3 as a call, @0x1473be as a tail jump).
 *
 * Out of scope, and modelled as a reference-drop rather than a throw — the same treatment the
 * landed `PCShared` destructors use ("JS GC handles the storage; we clear our references so the
 * wrapper is collectible"). A throwing stub would be wrong twice here: the destructor is FULLY
 * decoded, so a throw would announce a gap that does not exist, and releasing heap storage has no
 * observable effect on any JS value — the object is unreachable afterwards either way.
 */
function operator_delete(_p: unknown): void {
  // libc++ heap release — no observable JS effect. See the note above for why this is not a throw.
}

/**
 * `ROIStatIO::ROITestSet::~ROITestSet()` — @Helium 0x147390
 *   `__ZN9ROIStatIO10ROITestSetD1Ev`
 *
 * FULL transcription — every instruction, in order:
 *
 *   0x147390  pushq  %rbp                    ; frame setup (no TS counterpart)
 *   0x147391  movq   %rsp,%rbp
 *   0x147394  pushq  %rbx
 *   0x147395  pushq  %rax                    ; stack alignment for the call
 *   0x147396  movq   %rdi,%rbx               ; rbx = this
 *   0x147399  testb  $0x1,0x30(%rdi)         ; string#2.__cap_ & 1  (is_long?)
 *   0x14739d  je     0x1473a8                ;   short string -> nothing to free, skip
 *   0x14739f  movq   0x40(%rbx),%rdi         ; rdi = string#2.__data_   (0x30 + 0x10)
 *   0x1473a3  callq  0x3c4fa0                ; symbol stub for __ZdlPv (operator delete)
 *   0x1473a8  testb  $0x1,(%rbx)             ; string#1.__cap_ & 1  (is_long?)
 *   0x1473ab  jne    0x1473b4                ;   long -> go free it
 *   0x1473ad  addq   $0x8,%rsp ; popq %rbx ; popq %rbp ; retq     ; short -> done
 *   0x1473b4  movq   0x10(%rbx),%rdi         ; rdi = string#1.__data_
 *   0x1473b8  addq   $0x8,%rsp ; popq %rbx ; popq %rbp
 *   0x1473be  jmp    0x3c4fa0                ; TAIL-jump to operator delete
 *   0x1473c3  nopw   %cs:(%rax,%rax)         ; alignment padding, not executed
 *
 * WHAT IT IS. The inlined destructors of the class's two `std::string` members, in reverse
 * declaration order: the string at +0x30 first, then the one at +0x00. Each is the standard libc++
 * `~basic_string`: free `__data_` if and only if the `is_long` bit (bit 0 of the capacity word) is
 * set — a SHORT (SSO) string owns no heap buffer, so the code jumps straight past the free. There
 * is nothing else to destroy: the int32s at +0x18/+0x1c/+0x20 and the double at +0x28 are trivially
 * destructible, which is why the body never touches them.
 *
 * DECODE NOTES.
 *   * `testb $0x1, (%rbx)` sets ZF from `capWord & 1`, so `jne` (ZF=0) is "the bit IS set" — the
 *     long-string path. Reading that branch backwards would free exactly the strings that own no
 *     buffer and skip the ones that do.
 *   * The two frees call the SAME extern; only the second is a tail jump, because it is last. That
 *     is a codegen detail with no semantic content.
 *   * There is no vptr store and no base-class destructor call, so `ROITestSet` is a plain
 *     (non-polymorphic) struct — consistent with it being stored BY VALUE in a
 *     `std::vector<ROITestSet>` (see the emitted vector machinery listed in the file header).
 *
 * NOT ORACLED, deliberately — the honest note rather than a missing one. The observable effect of
 * this function is two `operator delete` calls on heap pointers the caller supplies; "verifying"
 * that live would mean handing real malloc'd pointers to the real destructor and then inspecting
 * freed memory, which is undefined behaviour, not evidence. The TS side models the free as a no-op
 * by policy anyway, so there is no value to compare. What can be checked without UB is the control
 * flow, and that is what the transcription above pins instruction by instruction.
 *
 * @param self the object being destroyed (%rdi).
 */
export function ROIStatIO__ROITestSet_D1(self: ROIStatIO__ROITestSet): void {
  // @0x147399/@0x14739d — testb $0x1,0x30(%rdi) ; je: only a LONG string owns a heap buffer.
  if ((self.stringAt0x30.capWordLowByte & 0x1) !== 0) {
    // @0x14739f/@0x1473a3 — movq 0x40(%rbx),%rdi ; callq operator delete(string#2.__data_).
    operator_delete(self.stringAt0x30.dataPtr);
  }
  // @0x1473a8/@0x1473ab — testb $0x1,(%rbx) ; jne: the same test for the string at +0x00.
  if ((self.name.capWordLowByte & 0x1) !== 0) {
    // @0x1473b4/@0x1473be — movq 0x10(%rbx),%rdi ; jmp operator delete(string#1.__data_).
    operator_delete(self.name.dataPtr);
  }
  // @0x1473b3/@0x1473be — both paths return void; no other member is touched.
}
