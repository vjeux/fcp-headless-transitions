// SharedLib_GetFunction — ProCore file-local free function that resolves a
// symbol in a previously-opened shared library. A pure forwarding thunk to
// POSIX `dlsym(3)`.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Ledger @ProCore:
//   SharedLib_GetFunction(void*, char const*)  @0x0dbd96
//   __Z21SharedLib_GetFunctionPvPKc            (internal linkage — `nm` type `t`)
//   re/disasm: raw-port/re/disasm/ProCore.__Z21SharedLib_GetFunctionPvPKc.s (5 lines)
//
// This is a FREE FUNCTION, so per the porting spec's naming rule it lives in a
// file named after the function itself (precedent: the landed
// raw-port/src/infra/computePhysicalRAM.ts, likewise a `__ZL`/`t` ProCore free
// function whose only callee is a libc extern).
//
// -----------------------------------------------------------------------------
// FULL DISASM (5 lines, @0x0dbd96..@0x0dbd9b) — every instruction accounted for
// -----------------------------------------------------------------------------
//   __Z21SharedLib_GetFunctionPvPKc:
//     0xdbd96  pushq %rbp            ; frame setup (no JS effect)
//     0xdbd97  movq  %rsp, %rbp      ; frame setup (no JS effect)
//     0xdbd9a  popq  %rbp            ; frame teardown (no JS effect)
//     0xdbd9b  jmp   0xde84c         ; TAIL CALL, symbol stub for _dlsym
//
// There is NO argument shuffling: %rdi (`void* handle`) and %rsi
// (`const char* name`) are already in dlsym's argument registers, and the tail
// `jmp` makes dlsym's return value (%rax) this function's return value. The C++
// source was therefore literally `return dlsym(handle, name);`.
//
// -----------------------------------------------------------------------------
// THE FAMILY (context; each sibling is a SEPARATE ledger unit, NOT ported here)
// -----------------------------------------------------------------------------
//   0xdbd87  SharedLib_Load(char const*)   __Z14SharedLib_LoadPKc
//              movl $0x6,%esi @0xdbd8b then jmp _dlopen stub @0xde846 — i.e.
//              `dlopen(path, 6)`, 6 = RTLD_NOW|RTLD_LOCAL (0x2|0x4).
//   0xdbda0  SharedLib_Unload(void*)       __Z16SharedLib_UnloadPv
//              null-guards the handle @0xdbda4 then jmp _dlclose stub @0xde840.
// Together they are ProCore's three-call plugin-loader shim.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEE
// -----------------------------------------------------------------------------
//   * _dlsym — libc / dyld (`<dlfcn.h>`). TRUE out-of-scope extern: `nm -m` lists
//     it as `(undefined) external _dlsym (from libSystem)`, so it is NOT one of
//     the five in-scope frameworks and cannot be transcribed. Reached through the
//     ProCore __stubs entry at 0xde84c by the tail `jmp` @0xdbd9b. Modelled as a
//     boundary throw citing that address, exactly as the landed
//     computePhysicalRAM.ts models `_sysctl`.

/**
 * `void* dlsym(void* handle, const char* symbol)` — POSIX dynamic-linker symbol
 * lookup (libc / dyld). Tail-called from SharedLib_GetFunction @ProCore 0xdbd9b
 * through the __stubs entry at 0xde84c.
 *
 * TRUE OUT-OF-SCOPE extern: a JS runtime has no dynamic linker to ask, and the
 * returned value is a raw native function pointer that has no JS representation.
 * A host that genuinely needs plugin symbols must provide its own binding; this
 * port marks the boundary loudly rather than inventing a lookup.
 *
 * @0xADDR ProCore __stubs 0xde84c
 */
function _dlsym(_handle: unknown, _symbol: string): unknown {
  throw new Error(
    "_dlsym (libc/dyld extern) not modelled in this port — tail-called from " +
      "SharedLib_GetFunction @ProCore 0xdbd9b via stub 0xde84c. TRUE " +
      "out-of-scope extern (dynamic-linker symbol lookup returning a native " +
      "function pointer). Wire a host plugin-loader binding instead.",
  );
}

/**
 * `SharedLib_GetFunction(void* handle, char const* name) -> void*`
 * @ProCore 0xdbd96 — `__Z21SharedLib_GetFunctionPvPKc`.
 *
 * Resolves `name` in the shared library `handle` (a handle previously returned
 * by SharedLib_Load @0xdbd87, i.e. by `dlopen(path, RTLD_NOW|RTLD_LOCAL)`) and
 * returns the symbol's address, or NULL when the symbol is absent — whatever
 * dlsym returns, unfiltered.
 *
 * Line-for-line correspondence to the disasm quoted in the file header:
 *   - @0xdbd96..0xdbd97 : frame setup — no JS effect.
 *   - @0xdbd9a          : frame teardown — no JS effect.
 *   - @0xdbd9b          : `jmp _dlsym` — a TAIL call with the two incoming
 *     arguments untouched in %rdi/%rsi, so the callee's %rax IS this
 *     function's return value. Nothing is inspected, wrapped, null-checked or
 *     logged on the way out (contrast SharedLib_Unload @0xdbda4, which does
 *     null-guard its handle — this one deliberately does not).
 *
 * @param handle Opaque `void*` library handle from SharedLib_Load.
 * @param name   The symbol name to resolve (`const char*`).
 * @returns The resolved symbol address (`void*`), straight from dlsym.
 *
 * @0xADDR ProCore 0xdbd96
 */
export function SharedLib_GetFunction(handle: unknown, name: string): unknown {
  // @0xdbd9b jmp 0xde84c — tail call to dlsym(handle, name); its result is
  // returned verbatim.
  return _dlsym(handle, name);
}
