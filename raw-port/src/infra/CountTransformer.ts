// CountTransformer.ts — Flexo `CountTransformer` ObjC class.
//
// A one-way `NSValueTransformer` subclass that turns any responder-to-`-count`
// (typically an NSArray/NSSet/NSDictionary/NSString) into an NSNumber holding
// that count. Used by AppKit Cocoa Bindings to bind a "3 items" label to a
// collection whose length is derived at display time.
//
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (x86_64 slice). Every function cites its @0xADDR.
//
// nm -n Flexo (x86_64) enumerates ALL and ONLY these three methods:
//   0x000000000058d6f0  t +[CountTransformer transformedValueClass]
//   0x000000000058d710  t +[CountTransformer allowsReverseTransformation]
//   0x000000000058d720  t -[CountTransformer transformedValue:]
//
// ObjC class metadata (from __DATA,__objc_data — via `otool -o` / `dyld_info -fixups`):
//   The class has no ivars, no init/dealloc overrides — it is a bare
//   NSValueTransformer subclass exposing only the three class/instance methods
//   above. NSValueTransformer defines the -reverseTransformedValue: default
//   (which is inaccessible because +allowsReverseTransformation returns NO).
//
// Disasm saved:
//   raw-port/re/disasm/Flexo.CountTransformer.transformedValueClass.s
//   raw-port/re/disasm/Flexo.CountTransformer.allowsReverseTransformation.s
//   raw-port/re/disasm/Flexo.CountTransformer.transformedValue.s
//
// ── SELECTORS SENT (resolved via __objc_selrefs → __objc_methname) ────────────
//   `count`           (selref @0x1bb8550, addressed via @Flexo 0x58d733)
//   `numberWithInt:`  (selref @0x1bb9ef0, addressed via @Flexo 0x58d747)
//
// ── EXTERNAL SYMBOLS ─────────────────────────────────────────────────────────
//   _OBJC_CLASS_$_NSNumber (Foundation)  — targeted by @0x58d6f4 (transformedValueClass)
//                                           and @0x58d72c (transformedValue: receiver
//                                           for the tail-call to +numberWithInt:).
//   _objc_opt_class (libobjc)            — @0x58d6fc  (tail-jmp)
//   _objc_msgSend  (libobjc, cached in %r14) — @0x58d73a  (loads objc_msgSend ptr;
//                                           called twice at @0x58d744 and @0x58d75a).

/**
 * Placeholder for the Foundation `NSNumber` Class object. In the FCP binary
 * this is a `_OBJC_CLASS_$_NSNumber` bind fixup; here it is a nominal marker
 * so the port can be type-checked without pulling in Foundation.
 */
export type NSNumberClass = { readonly __nsNumberClass: unique symbol };

/**
 * The receiver type of `transformedValue:`. Anything that responds to `-count`
 * satisfies this — the disasm sends `count` unconditionally to the argument,
 * so callers pass an NSArray / NSSet / NSDictionary / NSString / etc.
 */
export interface CountRespondingObject {
  /** ObjC selector `count`. @Flexo selref @0x1bb8550 */
  count(): number;
}

/**
 * Foundation's `NSNumber` — modeled here only to the extent this class
 * touches it (`+numberWithInt:` factory).
 */
export interface NSNumberLike {
  readonly intValue: number;
}

/**
 * Bind `+objc_opt_class` — the tail-jmp target of `+transformedValueClass`.
 * The runtime call `objc_opt_class(cls)` returns `cls` unless `cls` is nil (in
 * which case it returns nil); it is the ObjC dispatch primitive used by
 * `+class`. Modeled here as identity for non-nil.
 *
 * @Flexo 0x000000000058d6fc  jmp __stubs:_objc_opt_class
 */
declare function objc_opt_class(cls: NSNumberClass): NSNumberClass;

/**
 * Bind `+[NSNumber numberWithInt:]`. Returns an autoreleased `NSNumber`
 * wrapping the given int. The disasm invokes it via the cached objc_msgSend
 * function pointer.
 *
 * @Flexo 0x000000000058d75a  jmpq *%rax  (tail-jmp via cached objc_msgSend in %r14)
 * SEL: `numberWithInt:` (selref @0x1bb9ef0)
 */
declare function NSNumber_numberWithInt(value: number): NSNumberLike;

/**
 * Foundation constant for the `NSNumber` class object. In the FCP binary this
 * is a `_OBJC_CLASS_$_NSNumber` bind fixup — modeled here as an opaque handle.
 *
 * @Flexo 0x0000000000135fded (RIP relative from @0x58d6f4 in transformedValueClass)
 * @Flexo 0x00000000001361a97 ish (RIP relative from @0x58d72c in transformedValue:)
 */
declare const NSNumberClassObject: NSNumberClass;

/**
 * ObjC class `CountTransformer` — an `NSValueTransformer` subclass that turns
 * any `-count`-responding object into an `NSNumber` holding that count.
 *
 * `NSValueTransformer` is stateless here; the class exposes three overrides
 * with no ivars, no ctor, no dtor. In a Cocoa Bindings context the caller
 * registers an instance of this class and consumes it via
 * `NSValueTransformer.setValueTransformer:forName:` — that plumbing lives in
 * AppKit/Foundation, not in this .m; we model just what the disasm defines.
 *
 * @see raw-port/re/disasm/Flexo.CountTransformer.transformedValueClass.s
 * @see raw-port/re/disasm/Flexo.CountTransformer.allowsReverseTransformation.s
 * @see raw-port/re/disasm/Flexo.CountTransformer.transformedValue.s
 */
export class CountTransformer {
  /**
   * +[CountTransformer transformedValueClass]
   *
   * Returns the Foundation `NSNumber` Class object — the class that the
   * `-transformedValue:` method promises to return. `NSValueTransformer`
   * requires this override so bindings clients can validate the pipeline
   * type at registration time.
   *
   * @Flexo 0x000000000058d6f0
   *
   * Faithful transcription:
   *   pushq %rbp / movq %rsp,%rbp                             @0x58d6f0..d6f1
   *   mov rdi, [rip+_OBJC_CLASS_$_NSNumber]                    @0x58d6f4
   *   popq %rbp                                                @0x58d6fb
   *   jmp _objc_opt_class                                      @0x58d6fc   (tail-jmp)
   *
   * `objc_opt_class` is the ObjC runtime primitive that unwraps a Class
   * pointer through the isa/opt path (it also returns nil for nil input,
   * matching the +class selector's contract). Here `rdi` is guaranteed
   * non-nil because it is a compile-time class-ref bind, so the return is
   * always the NSNumber class object unchanged.
   */
  static transformedValueClass(): NSNumberClass {
    // @0x58d6f4  mov rdi, [rip+_OBJC_CLASS_$_NSNumber]
    // @0x58d6fc  jmp objc_opt_class          (tail-jmp — return objc_opt_class(NSNumber))
    return objc_opt_class(NSNumberClassObject);
  }

  /**
   * +[CountTransformer allowsReverseTransformation]
   *
   * Returns `NO`. There is no meaningful inverse for "collection → count"
   * (you cannot reconstruct the collection from just its length), so this
   * transformer is one-way — the AppKit Bindings machinery honors this by
   * refusing to route reverse-direction updates through the transformer.
   *
   * @Flexo 0x000000000058d710
   *
   * Faithful transcription:
   *   pushq %rbp / movq %rsp,%rbp                            @0x58d710..d711
   *   xorl %eax, %eax          ; return NO (BOOL 0)          @0x58d714
   *   popq %rbp / retq                                        @0x58d716..d717
   */
  static allowsReverseTransformation(): boolean {
    // @0x58d714  xor eax,eax     — returns 0 / NO.
    return false;
  }

  /**
   * -[CountTransformer transformedValue:(id)value]
   *
   * If `value` is nil, returns nil. Otherwise returns
   * `[NSNumber numberWithInt:[value count]]` — an autoreleased NSNumber
   * wrapping the collection's element count as an `int`.
   *
   * @Flexo 0x000000000058d720
   *
   * Faithful transcription (22 asm lines, function body 0x58d720..0x58d75e):
   *   testq %rdx, %rdx                                         @0x58d720
   *   je    0x58d75c                                           @0x58d723   ; nil? → return nil
   *   pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx    @0x58d725..d72b
   *   mov rbx, [rip+_OBJC_CLASS_$_NSNumber]                    @0x58d72c   ; rbx = NSNumber
   *   mov rsi, [rip+SEL:count]                                 @0x58d733   ; rsi = @selector(count)
   *   mov r14, [rip+&objc_msgSend]                             @0x58d73a   ; r14 = objc_msgSend
   *   mov rdi, rdx                                             @0x58d741   ; rdi = value
   *   callq *r14                                               @0x58d744   ; rax = [value count]
   *   mov rsi, [rip+SEL:numberWithInt:]                        @0x58d747
   *   mov rdi, rbx                                             @0x58d74e   ; rdi = NSNumber (class)
   *   mov edx, eax                                             @0x58d751   ; edx = count as int
   *   mov rax, r14                                             @0x58d753   ; rax = objc_msgSend
   *   pop rbx / pop r14 / pop rbp                              @0x58d756..d759
   *   jmpq *rax                                                @0x58d75a   ; tail-jmp msgSend
   *   ; --- fallthrough for the nil case ---
   *   xorl %eax, %eax                                          @0x58d75c
   *   retq                                                     @0x58d75e
   *
   * SIGNED int truncation note (@0x58d751 `movl %eax, %edx`): the ObjC
   * `-count` selector on NSArray/NSSet/etc. returns `NSUInteger` (u64 on
   * arm64/x86_64), but this method's disasm treats the low 32 bits as an
   * `int` argument to `+numberWithInt:`. Collections with more than
   * 2^31-1 elements would therefore wrap. That is a real quirk of Apple's
   * shipping binary — we preserve it exactly (int32 truncation) rather
   * than upgrade to a wider integer.
   */
  transformedValue(value: CountRespondingObject | null): NSNumberLike | null {
    // @0x58d720/@0x58d723: nil-check → return nil.
    if (value === null) {
      // @0x58d75c: xor eax,eax  → return nil
      return null;
    }
    // @0x58d744  eax = objc_msgSend(value, @selector(count))   →  NSUInteger count
    const count = value.count();
    // @0x58d751  movl eax → edx: truncate to signed int32 (see NOTE above).
    // The signed-int32 truncation is a real quirk of the FCP binary
    // (`+numberWithInt:` takes `int`, not `NSUInteger`).
    const countAsInt = (count | 0) & 0xffffffff;
    // Bring the value into the correct signed-int32 range for the ObjC call.
    // Note: `| 0` already coerces to int32; we perform the width-cast
    // explicitly to preserve the exact truncation semantics.
    const countAsSignedInt32 = (countAsInt << 0);
    // @0x58d75a  jmpq *rax  = tail-jmp objc_msgSend(NSNumber, @selector(numberWithInt:), countAsSignedInt32)
    return NSNumber_numberWithInt(countAsSignedInt32);
  }
}
