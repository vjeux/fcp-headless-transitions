// FFIsNotZeroValueTransformer.ts — Flexo.
//
// NSValueTransformer subclass that converts an NSNumber "integer" into an
// NSNumber BOOL of whether the integer is nonzero, and (reverse) converts an
// NSNumber BOOL back into itself boxed as an NSNumber BOOL. This is a stock
// Cocoa bindings glue class used by inspector UI to drive an "isEnabled"
// checkbox off a raw integer channel value.
//
// The whole file is 4 tiny methods; every one is a straight
// message-in / message-out chain with no arithmetic beyond a `!= 0` test.
// The port is a faithful transcription of that ObjC-runtime dance; the ObjC
// message-send is modeled as a hand call on the input `value` object (the
// caller supplies whatever "acts like an NSNumber" object it likes).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//             Versions/A/Flexo (x86_64 slice mapped VA==offset at /tmp/Flexo.x86_64).
// Disasm saved: raw-port/re/disasm/Flexo.FFIsNotZeroValueTransformer.all.s
//
// Symbols (from nm -arch x86_64):
//   +[FFIsNotZeroValueTransformer transformedValueClass]        @0x12fd970
//   +[FFIsNotZeroValueTransformer allowsReverseTransformation]  @0x12fd990
//   -[FFIsNotZeroValueTransformer transformedValue:]            @0x12fd9a0
//   -[FFIsNotZeroValueTransformer reverseTransformedValue:]     @0x12fd9e0
//
// Selrefs resolved by dereferencing the RIP-relative selref slots in
// /tmp/Flexo.x86_64 (chained-fixup pointer, low 32 bits are the C-string VA):
//   selref @0x1BBAEE0 -> "intValue"
//   selref @0x1BB8800 -> "numberWithBool:"
//   selref @0x1BB8720 -> "boolValue"

/** Minimum interface for the NSNumber-like input value.  Real FCP passes an
 *  ObjC NSNumber; the port asks for the two selectors the FCP code sends. */
export interface NSNumberLike {
  /** @@selref @0x1BBAEE0 "intValue" — used by transformedValue: at @0x12fd9bf. */
  intValue(): number;
  /** @@selref @0x1BB8720 "boolValue" — used by reverseTransformedValue: at @0x12fd9ff. */
  boolValue(): boolean;
}

/** Minimum interface for the NSNumber class object.  In native FCP this is
 *  `_OBJC_CLASS_$_NSNumber` (rdi at the tail msgSend); the caller wires it
 *  to whatever "box a BOOL" it wants to hand back. */
export interface NSNumberClassLike {
  /** @@selref @0x1BB8800 "numberWithBool:" — tail-called from both methods. */
  numberWithBool(value: boolean): unknown;
}

// -----------------------------------------------------------------------------
// +[FFIsNotZeroValueTransformer transformedValueClass]                @0x12fd970
// -----------------------------------------------------------------------------
//   movq _OBJC_CLASS_$_NSNumber(%rip), %rdi                           @0x12fd974
//   jmp  _objc_opt_class                                              @0x12fd97c
// The result of `objc_opt_class(NSNumber)` is the NSNumber class object.
// TS surface: return the caller-provided "NSNumber class" handle. The FCP
// runtime returns the same NSNumber class object it read; we mirror that by
// making the class handle a parameter (there is no global NSNumber in JS).
// -----------------------------------------------------------------------------
export function FFIsNotZeroValueTransformer_transformedValueClass(
  NSNumberClass: NSNumberClassLike,
): NSNumberClassLike {
  return NSNumberClass; // @0x12fd974..7c  leaq NSNumber ; jmp objc_opt_class
}

// -----------------------------------------------------------------------------
// +[FFIsNotZeroValueTransformer allowsReverseTransformation]          @0x12fd990
// -----------------------------------------------------------------------------
//   movl $0x1, %eax        @0x12fd994
//   retq                   @0x12fd99a
// Trivially returns YES / true.
// -----------------------------------------------------------------------------
export function FFIsNotZeroValueTransformer_allowsReverseTransformation(): boolean {
  return true; // @0x12fd994 movl $0x1,%eax ; @0x12fd99a retq
}

// -----------------------------------------------------------------------------
// -[FFIsNotZeroValueTransformer transformedValue:]                    @0x12fd9a0
// -----------------------------------------------------------------------------
//
//   %rdx = value (the transformer arg after {self, _cmd})
//   movq %rdx, %rdi                                    @0x12fd9a7
//   movq _OBJC_CLASS_$_NSNumber(%rip), %rbx            @0x12fd9aa  target class
//   movq selref@0x1BBAEE0(%rip), %rsi   "intValue"     @0x12fd9b1
//   movq _objc_msgSend(%rip), %r14                     @0x12fd9b8
//   callq *%r14                                        @0x12fd9bf   -> eax = [value intValue]
//   xorl %edx, %edx                                    @0x12fd9c2
//   testl %eax, %eax                                   @0x12fd9c4
//   setne %dl                                          @0x12fd9c6   dl = (eax != 0)
//   movq selref@0x1BB8800(%rip), %rsi   "numberWithBool:" @0x12fd9c9
//   movq %rbx, %rdi                                    @0x12fd9d0   rdi = NSNumber class
//   ...
//   jmpq *%rax  (tail-call _objc_msgSend)              @0x12fd9da   -> [NSNumber numberWithBool:dl]
//
// Semantics:   return @([value intValue] != 0)
// The `testl` operates on the 32-bit eax return of intValue, so the boolean
// truly is "the 32-bit int value read by NSNumber's intValue" — negative
// integers included (any nonzero bit pattern is TRUE, matching Cocoa
// semantics precisely).
// -----------------------------------------------------------------------------
export function FFIsNotZeroValueTransformer_transformedValue(
  value: NSNumberLike,
  NSNumberClass: NSNumberClassLike,
): unknown {
  const iv = value.intValue();                       // @0x12fd9bf  callq *%r14 -> eax
  // The native `testl %eax, %eax` compares the low 32 bits. `intValue` returns
  // 32-bit signed; JS Number preserves that exactly for all int32 values, so
  // `iv !== 0` matches `setne` on eax.
  const nonZero = (iv !== 0);                        // @0x12fd9c2..c6  xor+test+setne
  return NSNumberClass.numberWithBool(nonZero);      // @0x12fd9da  jmp *%rax [NSNumber numberWithBool:]
}

// -----------------------------------------------------------------------------
// -[FFIsNotZeroValueTransformer reverseTransformedValue:]             @0x12fd9e0
// -----------------------------------------------------------------------------
//
//   movq %rdx, %rdi                                    @0x12fd9e7
//   movq _OBJC_CLASS_$_NSNumber(%rip), %rbx            @0x12fd9ea
//   movq selref@0x1BB8720(%rip), %rsi   "boolValue"    @0x12fd9f1
//   movq _objc_msgSend(%rip), %r14                     @0x12fd9f8
//   callq *%r14                                        @0x12fd9ff   -> al = [value boolValue]
//   xorl %edx, %edx                                    @0x12fda02
//   testb %al, %al                                     @0x12fda04
//   setne %dl                                          @0x12fda06   dl = (al != 0)
//   movq selref@0x1BB8800(%rip), %rsi   "numberWithBool:" @0x12fda09
//   movq %rbx, %rdi                                    @0x12fda10
//   ...
//   jmpq *%rax                                         @0x12fda1a   -> [NSNumber numberWithBool:dl]
//
// Semantics:   return @([value boolValue] ? YES : NO)   which is just re-boxing.
// The only reason `testb %al,%al ; setne %dl` exists (rather than passing al
// straight through) is the ABI: NSNumber's `boolValue` returns BOOL in %al
// with high bits unspecified; the setne materializes a strict {0,1} byte.
// We match the machine's post-condition by explicitly coercing to a JS bool.
// -----------------------------------------------------------------------------
export function FFIsNotZeroValueTransformer_reverseTransformedValue(
  value: NSNumberLike,
  NSNumberClass: NSNumberClassLike,
): unknown {
  const bv = value.boolValue();                      // @0x12fd9ff  callq *%r14 -> al
  const asBool = (bv !== false);                     // @0x12fda02..06  xor+testb+setne
  return NSNumberClass.numberWithBool(asBool);       // @0x12fda1a  jmp *%rax [NSNumber numberWithBool:]
}
