// raw-port: FFFlexo — Flexo framework (framework-scope error helpers)
// Two static-style throwers used across the Flexo audio-file pipeline:
//   0x014913f0  FFFlexo::ThrowErr_(int)   — throw <int>
//   0x01491420  FFFlexo::ThrowNULL_()     — throw std::bad_alloc
//
// Both are exception-only functions (never return): they allocate an
// exception object via __cxa_allocate_exception, construct in-place, then
// __cxa_throw. In TS we mirror that with `throw`.

/**
 * Marker error class for `throw <int>` — C++ ABI throws a bare int, which
 * has no message and typeid is `int` (see __ZTIi below). We wrap it in a
 * JS Error whose `.code` field carries the same integer, and set .name so
 * callers can distinguish it from other errors.
 */
export class FFFlexoIntException extends Error {
  readonly code: number;
  constructor(code: number) {
    super(`FFFlexo::ThrowErr_(${code | 0})`);
    this.name = "FFFlexoIntException";
    this.code = code | 0;
  }
}

/**
 * FFFlexo::ThrowErr_(int)  @0x014913f0
 *
 * Faithful asm mirror:
 *   @0x14913f0  push %rbp; mov %rsp,%rbp; push %rbx; push %rax
 *   @0x14913f6  mov  %edi, %ebx                     // save arg0 (int err)
 *   @0x14913f8  push $0x4; pop %rdi                 // rdi = 4 (sizeof(int))
 *   @0x14913fb  call ___cxa_allocate_exception      // rax = exc obj (>= 4 bytes)
 *   @0x1491400  mov  %ebx, (%rax)                   // *(int*)exc = err
 *   @0x1491402  mov  __ZTIi(%rip), %rsi             // rsi = typeinfo for int
 *   @0x1491409  mov  %rax, %rdi                     // rdi = exc
 *   @0x149140c  xor  %edx, %edx                     // rdx = 0 (no dtor)
 *   @0x149140e  call ___cxa_throw                   // throw
 *
 * The C++ ABI form is literally `throw (int)err;` with no wrapper class.
 * The typeinfo used (__ZTIi @0x1491402 → const int&) confirms this — the
 * argument itself IS the exception object.
 *
 * Never returns. In TS: throw an FFFlexoIntException carrying `err`.
 */
export function FFFlexo_ThrowErr_(err: number): never {
  // @0x1491400 — exception payload is exactly the caller's int argument.
  // @0x1491402 — typeinfo for int (__ZTIi), dtor = null (@0x149140c xor edx,edx).
  // @0x149140e — __cxa_throw. Function is [[noreturn]].
  throw new FFFlexoIntException(err | 0);
}

/**
 * FFFlexo::ThrowNULL_()  @0x01491420
 *
 * Faithful asm mirror (body ends at @0x149144a — everything after is C++
 * ABI landing-pad / __clang_call_terminate wreckage from surrounding funcs
 * and does NOT belong to ThrowNULL_):
 *   @0x1491420  push %rbp; mov %rsp,%rbp; push %rbx; push %rax
 *   @0x1491426  push $0x8; pop %rdi                 // rdi = 8 (sizeof(std::bad_alloc))
 *   @0x1491429  call ___cxa_allocate_exception      // rax = exc obj
 *   @0x149142e  mov  %rax, %rbx                     // save exc
 *   @0x1491431  mov  %rax, %rdi                     //
 *   @0x1491434  call __ZNSt9bad_allocC1Ev           // std::bad_alloc::bad_alloc()
 *   @0x1491439  mov  __ZTISt9bad_alloc(%rip), %rsi  // typeinfo for std::bad_alloc
 *   @0x1491440  mov  __ZNSt9bad_allocD1Ev(%rip), %rdx// dtor for std::bad_alloc
 *   @0x1491447  mov  %rbx, %rdi
 *   @0x149144a  call ___cxa_throw                   // throw
 *
 * The named-C++-type here is std::bad_alloc. In TS this is idiomatic
 * RangeError("bad_alloc"), but to keep parity semantics we throw a
 * distinct class whose `.name` is "bad_alloc" — matches what a JS
 * try/catch would see under most JS-C++ bridges.
 *
 * Never returns.
 */
export class BadAllocException extends Error {
  constructor() {
    // Message mirrors what std::bad_alloc::what() returns on Apple libc++.
    super("std::bad_alloc");
    this.name = "bad_alloc";
  }
}

export function FFFlexo_ThrowNULL_(): never {
  // @0x1491434 — std::bad_alloc default ctor (no state).
  // @0x1491439 / @0x1491440 — typeinfo + dtor for std::bad_alloc.
  // @0x149144a — __cxa_throw.
  throw new BadAllocException();
}

/**
 * FFFlexo — framework-scope holder. In FCP these two throwers are static
 * (no `this` argument in either method). We expose them both as free
 * functions above AND as static members here so callers can spell them
 * either way, matching how transcribed callers @ FCP will reference them.
 */
export class FFFlexo {
  /** @see FFFlexo_ThrowErr_ (@0x14913f0) */
  static ThrowErr_(err: number): never {
    return FFFlexo_ThrowErr_(err);
  }
  /** @see FFFlexo_ThrowNULL_ (@0x1491420) */
  static ThrowNULL_(): never {
    return FFFlexo_ThrowNULL_();
  }
}
