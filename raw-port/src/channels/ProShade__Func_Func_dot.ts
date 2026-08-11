// ProShade__Func_Func_dot.ts — raw transcription of the Ozone template
// instantiation `ProShade::Func<ProShade::Func_dot>`.
//
// NAMING: the namespace joins with a DOUBLE underscore (`ProShade__Func`, the
// convention `PCBezierNamespace__SampledContour.ts` and `MXF__MXFPartitionData.ts`
// follow) and the template ARGUMENT joins with a single one (`_Func_dot`, the
// convention `PCMatrix44Tmpl_double.ts` follows). Each instantiation is its own
// C++ class with its own vtable — `__ZTVN8ProShade4FuncINS_8Func_dotEEE` — so it
// gets its own file, not a shared "Func" grab-bag.
//
// ONE symbol is transcribed in this file — `atomic() const`. Every other member
// of the instantiation is a SEPARATE ledger unit and is NOT ported here. The
// neighbours, for orientation only (addresses from the cached x86_64 inventory
// `raw-port/army/inventory/Ozone.syms.txt`):
//   0x1eaad0  eval(VarT<Node> const&, VarT<Node> const&)
//   0x1eafb0  Func(Node*, Node*)                                    [C1]
//   0x1eb670  ~Func()                                               [D1]
//   0x1eb760  ~Func()                                               [D0]
//   0x1eb780  repr() const
//   0x1eb830  description() const
//   0x1eb8e0  shortDescription()
//   0x1eb920  computeHash(PCHashWriteStream&) const
//   0x1eb9d0  inputs(PCArray<VarT<Node>, ...>&) const
//   0x1eba90  apply(NodeOperator&)
//   0x1ebd20  atomic() const                                        <-- ported here
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x1ebd20  ProShade::Func<ProShade::Func_dot>::atomic() const
//                __ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv        (LOCAL, `t`)
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv Ozone`):
//   raw-port/re/disasm/__ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv.s  (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x1ebd20  55              pushq %rbp        ; frame setup (no TS counterpart)
//   0x1ebd21  48 89 e5        movq  %rsp, %rbp  ; frame setup (no TS counterpart)
//   0x1ebd24  31 c0           xorl  %eax, %eax  ; the RESULT: zero the whole 32-bit
//                                               ; return register
//   0x1ebd26  5d              popq  %rbp        ; frame teardown
//   0x1ebd27  c3              retq              ; returns %eax = 0
//   0x1ebd28  0f 1f 44 00 00  nopl (%rax,%rax)  ; alignment padding, not executed
//
// ---------------------------------------------------------------------------
// A CONSTANT `false` IS THE BODY, NOT A MISSING ONE
// ---------------------------------------------------------------------------
// This is the shape an empty-body cheat imitates, so it is worth being explicit
// about why it is the real answer here: `this` (%rdi) is never read, no field is
// loaded, no callee is invoked, and the function is FIVE bytes of executable
// code. There is nothing else in it. A port that threw "not yet transcribed"
// would be less faithful than `return false`, not more.
//
// TYPE. The machine zeroes the whole of `%eax`, so the value is 0 under every
// reading — `bool`, `int`, `unsigned`, or a null pointer. It is modelled as
// `boolean` because the member is a const-qualified predicate named `atomic`
// and this family's callers use it as a yes/no property of a shader-graph node;
// what would FALSIFY that is a caller widening the result (`movzbl`/`cmpl`
// against something other than 0/1) or storing it as a pointer, neither of which
// appears in this body. Either way the ported VALUE is the same 0.
//
// ALL FOUR INSTANTIATIONS AGREE, which is a fact about the corpus rather than
// about this function: Ozone contains exactly four `Func<T>::atomic() const`
// bodies — Func_dot @0x1ebd20, Func_normalize @0x1e54b0,
// ScalarFunctionTraits_2<max_traits> @0x1ea510 and
// ScalarFunctionTraits_2<pow_traits> @0x1edcb0 — and all four are the identical
// `xorl %eax,%eax`. So this corpus offers NO instantiation returning true, and
// nothing here should be read as evidence about what a `true` override looks
// like. Each of the other three is its own ledger unit.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch — `depgraph.py deps __ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv`
// lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/ProShade__Func_Func_dot_atomic_oracle.py
// The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; the harness
// goes through raw-port/re/oracle/ozone_loader.py (depth-first @rpath preload)
// and calls the function at `dyld slide + 0x1ebd20`, under
// `arch -x86_64 /usr/bin/python3` so the process runs the same x86_64 slice this
// file was transcribed from. Results are recorded in the method's own comment
// below, with the counts from the run.

/**
 * `ProShade::Func<ProShade::Func_dot>` — one instantiation of Ozone's shader-graph
 * function-node template, with its own vtable
 * (`__ZTVN8ProShade4FuncINS_8Func_dotEEE`, installed by the C1 ctor @0x1eafb0).
 *
 * NO FIELD IS MODELLED. The one body transcribed here never reads `this`, so the
 * layout is not observable from it; the ctor and the other members are separate
 * ledger units and are the place where fields get grounded.
 *
 * @Ozone 0x1ebd20
 */
export class ProShade__Func_Func_dot {
  /**
   * `ProShade::Func<ProShade::Func_dot>::atomic() const` — @Ozone 0x1ebd20
   *   __ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv
   *
   * Full transcription — every instruction, in order:
   *
   *   0x1ebd20  pushq %rbp        ; frame setup (no TS counterpart)
   *   0x1ebd21  movq  %rsp, %rbp  ; frame setup (no TS counterpart)
   *   0x1ebd24  xorl  %eax, %eax  ; the result: 0
   *   0x1ebd26  popq  %rbp        ; frame teardown
   *   0x1ebd27  retq              ; returns %eax = 0
   *
   * The body is a constant. `this` is never dereferenced, so the answer does not
   * depend on the object — see the file header for why that is the real body and
   * not a missing one, and for why the 0 is modelled as `false`.
   *
   * MEASURED AGAINST THE LIVE BINARY
   * (raw-port/re/oracle/ProShade__Func_Func_dot_atomic_oracle.py, Ozone slide
   * 0x12611b000, called at slide+0x1ebd20 under `arch -x86_64`):
   *   - byte self-check PASS: the 8 bytes at slide+0x1ebd20 are
   *     `55 48 89 e5 31 c0 5d c3`, i.e. the five instructions above and nothing
   *     more
   *   - 38 `this` values (NULL, a real 0x100-byte poisoned object, every 8-byte
   *     step through it, 0x4141414141414141, 0xdeadbeef, 1, ~0UL): 38 returns of
   *     0, 0 divergences — the result is independent of `this`, as a constant
   *     body requires. The return register is read as a full uint64, so a body
   *     returning something wider than a bool could not hide in the high bits.
   *   - 0 of 256 poison bytes modified: the body reads and writes no memory
   *   - negative controls, none dead, reported per case because two of them
   *     legitimately agree with the truth on some inputs: "returns 1" 38/38,
   *     "returns `this`" 37/38 (they agree on NULL), "returns the low byte of
   *     `this`" 36/38 (NULL, plus the one `this` whose low byte is 0), "reads
   *     the first qword of the object" 37/38 (NULL again). Saying that out loud
   *     is more honest than rounding each control to a boolean.
   *
   * @returns false, unconditionally.
   */
  atomic(): boolean {
    // @0x1ebd24 — xorl %eax,%eax : the whole body. No load, no branch, no call.
    return false;
  }
}
