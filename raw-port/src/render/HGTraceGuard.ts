// HGTraceGuard.ts — Helium's scoped debug/trace RAII guard. Constructing an
// HGTraceGuard writes an "indent-open" line to HGLogger (`"/-- <msg>\n"`)
// and starts a per-guard HGProfiler timer; destroying it stops the timer,
// computes the elapsed milliseconds, and writes an "indent-close" line
// (`"\-- <msg> : <ms> msec\n"`). The whole apparatus short-circuits to a
// no-op if either (a) the guard's own `level` argument is ≤ 0, (b) the
// global `HGLogger::_enabled` byte is 0, or (c) the requested `level`
// exceeds the runtime cap returned by `HGLogger::getLevel(component)`.
//
// This class is a debug/introspection concern — it is NOT on any render
// math path. Its portable shape is entirely control flow plus a handful
// of stdlib and HGLogger/HGProfiler calls, all of which are undecoded on
// this class's slice and thus surface as throwing stubs (each cited with
// its @0xADDR call site).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//   Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGTraceGuard.HGTraceGuard.s   (C1 — tail-jmp to C2 @0x1af585)
//   raw-port/re/disasm/Helium.HGTraceGuard.~HGTraceGuard.s  (D1 — tail-jmp to D2 @0x1af655)
// The C2/D2 base-object bodies were fetched inline via `otool -tv -arch x86_64`
// (disasm.sh emits only the D1/C1 slices for name-mangled Itanium-ABI
// destructor/constructor pairs). Their control-flow bodies are transcribed
// below with address-by-address citations.
//
// Helium symbols transcribed:
//   @0x001af490  HGTraceGuard::HGTraceGuard(char const*, int, char const*)  (C2 — base-object ctor)
//   @0x001af580  HGTraceGuard::HGTraceGuard(char const*, int, char const*)  (C1 — complete-object ctor; tail-jmp to C2)
//   @0x001af590  HGTraceGuard::~HGTraceGuard()  (D2 — base-object dtor)
//   @0x001af650  HGTraceGuard::~HGTraceGuard()  (D1 — complete-object dtor; tail-jmp to D2)
//
// DECODE evidence:
//   * Ctor signature (from the mangled name):
//       HGTraceGuard::HGTraceGuard(char const* component, int level, char const* message);
//     ABI mapping observed:
//       %rdi = this                (HGTraceGuard* — 16 bytes at [0..0xf])
//       %rsi = char const* component (used only to lookup the runtime level)
//       %edx = int level             (the caller's requested trace level)
//       %rcx = char const* message   (the human-readable trace text)
//
//   * Instance layout (16 bytes, zero-initialised at the top of C2):
//       [0x00]   char* dup_message   — heap copy of `message` via `strdup`
//                                       (0 if guard is inactive).
//       [0x08]   HGProfiler* timer   — heap-allocated HGProfiler; ::start()
//                                       is called before returning from C2.
//     Evidence @0x1af4ab..0x1af4ae: `xorps %xmm0, %xmm0; movups %xmm0, (%rdi)`
//     — zeroes the 16-byte instance. Evidence @0x1af4de and @0x1af52e —
//     stores into (%rbx)/[0x0] and 0x8(%rbx)/[0x8].
//
//   * Stack-canary boilerplate (Clang/Itanium ABI /GS-style):
//       @0x1af49d  movq  0x852db4(%rip), %rax   ; RIP-next 0x1af4a4 → 0xa02258
//                                                = ___stack_chk_guard (undefined
//                                                  external — dyld-bound). Read
//                                                  the guard pointer.
//       @0x1af4a4  movq  (%rax), %rax           ; *guard → the canary value
//       @0x1af4a7  movq  %rax, -0x20(%rbp)      ; spill canary on stack
//       ...body...
//       @0x1af53a  movq  0x852d17(%rip), %rax   ; reload guard on exit
//       @0x1af541  movq  (%rax), %rax
//       @0x1af544  cmpq  -0x20(%rbp), %rax
//       @0x1af548  jne   0x1af555               ; on mismatch: __stack_chk_fail
//     Purely defensive — has no observable effect on program behaviour
//     unless a stack smash occurs. We elide the canary from the JS port
//     (JS has no stack overwrite exposure); the DECODE evidence is
//     documented here for provenance.
//
//   * Level gate (@0x1af4b1..0x1af4d4):
//       %eax = HGLogger::_enabled (u8 @Helium 0xade514 — RIP-next 0x1af4b8
//                                   → 0xade514; nm confirms
//                                   `HGLogger::_enabled (+0x0)` at that VA)
//       if (level <= 0)       goto inactive @0x1af53a
//       if (_enabled == 0)    goto inactive @0x1af53a
//       cap = HGLogger::getLevel(component)   ; callq 0x1ad8e0 @0x1af4cc
//       if (level > cap)      goto inactive @0x1af53a
//     Only if all three checks pass does the guard actually record anything.
//
//   * Active-path body (@0x1af4d6..0x1af538):
//       dup = strdup(message)                    ; callq stub@0x3c5606 @0x1af4d9
//       this[0x0] = dup                          ; @0x1af4de
//       snprintf(buf, 0x64, "/-- %s\n", dup)     ; format literal @Helium 0x8eefad
//                                                  ("/-- %s\n") @0x1af501
//       HGLogger::print("%s", buf)               ; format literal @Helium 0x8ba5f9
//                                                  ("%s") @0x1af501; callq
//                                                  HGLogger::print @0x1af50d
//                                                  (Helium 0x1ae060)
//       atomically increment HGLogger::_indent   ; `lock incl 0x92eff7(%rip)`
//                                                  @0x1af512..0x1af513 — RIP-next
//                                                  0x1af519 → 0xade510 = the
//                                                  int32 `HGLogger::_indent`.
//       raw = operator new(0x10)                 ; callq stub@0x3c4fb2 (__Znwm)
//       HGProfiler::HGProfiler()  on raw         ; callq 0x1c3d20 @0x1af529
//       this[0x8] = raw                          ; @0x1af52e
//       HGProfiler::start()       on raw         ; callq 0x1c3d90 @0x1af535
//
//     Note the format string uses `snprintf` with `buf` on the stack
//     (leaq -0x90(%rbp), %r14 @0x1af4e8 — a 128-byte buffer). The
//     HGLogger::print call then re-formats via `"%s"` — an idiom that lets
//     HGLogger insert its own thread/timestamp/indent prefix around a
//     pre-baked payload.
//
//   * Dtor body (@0x1af590..0x1af631) — mirrors ctor but in reverse:
//       if (this[0x0] == 0)  goto delete_profiler @0x1af609
//       ms = HGProfiler::stop() on this[0x8]     ; callq 0x1c3db0 @0x1af5b8
//       (BUT: the disasm reads dup back @0x1af5bd `movq (%rbx), %r14`
//        BEFORE stop(); actual order in asm is stop then getTime — see below.)
//     Correct order (mirroring the asm literally):
//       0x1af5b4  movq  0x8(%rbx), %rdi                         ; = timer
//       0x1af5b8  callq HGProfiler::stop  (Helium 0x1c3db0)     ; ret = void
//       0x1af5bd  movq  (%rbx), %r14                            ; %r14 = dup
//       0x1af5c0  movq  0x8(%rbx), %rdi                         ; = timer
//       0x1af5c4  callq HGProfiler::getTime (Helium 0x1c3dd0)   ; returns f64 ms in xmm0
//       0x1af5c9  leaq  0x73f9e5(%rip), %rdx                    ; RIP-next 0x1af5d0
//                                                                → 0x8eefb5 = "\-- %s : %f msec\n"
//       0x1af5d0  leaq  -0x90(%rbp), %r15                       ; buf = alloca(128)
//       0x1af5d7  movl  $0x64, %esi                             ; size = 0x64
//       0x1af5dc  movq  %r15, %rdi                              ; dst
//       0x1af5df  movq  %r14, %rcx                              ; arg1 = dup
//       0x1af5e2  movb  $0x1, %al                               ; variadic: 1 XMM
//       0x1af5e4  callq _snprintf (stub@0x3c55e8)               ; format
//                                                                buf with the
//                                                                elapsed ms
//       0x1af5e9  lock decl 0x92ef20(%rip)                      ; RIP-next
//                                                                0x1af5f0 → 0xade510
//                                                                = HGLogger::_indent
//                                                                (atomic dec)
//       0x1af5f0  leaq  0x70b002(%rip), %rdi                    ; RIP-next
//                                                                0x1af5f7 → 0x8ba5f9
//                                                                = "%s"
//       0x1af5f7  movq  %r15, %rsi                              ; arg = buf
//       0x1af5fa  xorl  %eax, %eax                              ; variadic: 0 XMM
//       0x1af5fc  callq HGLogger::print (Helium 0x1ae060)       ; log the closer
//       0x1af601  movq  (%rbx), %rdi                            ; = dup
//       0x1af604  callq _free (stub@0x3c513e)                   ; free(dup)
//     Delete-profiler tail (@0x1af609..0x1af615) — always runs:
//       0x1af609  movq  0x8(%rbx), %rdi                         ; = timer
//       0x1af60d  testq %rdi, %rdi
//       0x1af610  je    0x1af617                                ; if null, skip
//       0x1af612  callq _ZdlPv (stub@0x3c4fa0)                  ; operator delete(timer)
//     Note: the HGProfiler's destructor is NOT called separately — the
//     class relies on ~HGProfiler being trivial (or on the raw `delete`
//     virtual-slot path). This is an accurate mirror of the asm; do NOT
//     add a HGProfiler dtor call the compiler didn't emit.
//     Exception-frame tail (@0x1af632..0x1af648): if unwinding through a
//     destructor throws (which the C++ standard forbids), Clang emits a
//     `__clang_call_terminate` (Helium 0x1690 — a tiny thunk that calls
//     `__cxa_begin_catch` then `std::terminate`). Since JS has no C++
//     unwinding, we omit this branch — but its DECODE evidence is here
//     for provenance.
//
// Vtable / vptr:
//   HGTraceGuard has NO virtual methods surfaced on this slice (the class
//   is a stack-allocated RAII trivial-layout scope-guard — the ctor never
//   installs a vptr). No vtable lookup is needed.
//
// Called stubs / free functions (all Helium imports; call sites annotated):
//   _strdup                                stub @Helium 0x3c5606     (C2 @0x1af4d9)
//   _snprintf                              stub @Helium 0x3c55e8     (C2 @0x1af4fc; D2 @0x1af5e4)
//   __Znwm  (operator new)                 stub @Helium 0x3c4fb2     (C2 @0x1af51e)
//   __ZdlPv (operator delete)              stub @Helium 0x3c4fa0     (D2 @0x1af612)
//   _free                                  stub @Helium 0x3c513e     (D2 @0x1af604)
//   ___stack_chk_fail                      stub @Helium 0x3c5030     (C2 @0x1af555; D2 @0x1af632)
//   __Unwind_Resume                        stub @Helium 0x3c4e02     (C2 @0x1af568/0x1af570; D2 @0x1af63e)
//   HGLogger::getLevel(char const*)             @Helium 0x1ad8e0     (C2 @0x1af4cc)
//   HGLogger::print(char const*, ...)           @Helium 0x1ae060     (C2 @0x1af50d; D2 @0x1af5fc)
//   HGProfiler::HGProfiler()                    @Helium 0x1c3d20     (C2 @0x1af529)
//   HGProfiler::start()                         @Helium 0x1c3d90     (C2 @0x1af535)
//   HGProfiler::stop()                          @Helium 0x1c3db0     (D2 @0x1af5b8)
//   HGProfiler::getTime()                       @Helium 0x1c3dd0     (D2 @0x1af5c4)
//   __clang_call_terminate                      @Helium 0x1690       (D2 @0x1af643)
//
// Helium data / globals (RIP-relative reads):
//   ___stack_chk_guard   external, dyld-bound at VA 0xa02258
//   HGLogger::_enabled   u8   @Helium 0xade514
//   HGLogger::_indent    i32  @Helium 0xade510
//   "/-- %s\n"           C-str @Helium 0x8eefad
//   "\\-- %s : %f msec\n" C-str @Helium 0x8eefb5
//   "%s"                 C-str @Helium 0x8ba5f9
//
// Frontier callees (surfaced as throwing stubs — each cites its @0xADDR):
//   All the calls listed above. Every stub is a THROWing implementation
//   citing the call-site @0xADDR (and the callee's @0xADDR when known).

/**
 * `strdup(const char*)` — POSIX heap-copy. Callq'd from HGTraceGuard::C2
 * @Helium 0x1af4d9 via stub @Helium 0x3c5606. Not yet transcribed.
 */
function strdup(_s: string): string {
  throw new Error(
    "HGTraceGuard: strdup not yet transcribed @Helium C2 call site 0x1af4d9 (stub @0x3c5606)",
  );
}

/**
 * `snprintf(char* dst, size_t n, const char* fmt, ...)` — POSIX. Callq'd
 * from HGTraceGuard::C2 @Helium 0x1af4fc (fmt = "/-- %s\n" @0x8eefad) and
 * from HGTraceGuard::D2 @Helium 0x1af5e4 (fmt = "\\-- %s : %f msec\n" @0x8eefb5),
 * both via stub @Helium 0x3c55e8. Not yet transcribed.
 */
function snprintf_format(_fmt: string, ..._args: unknown[]): string {
  throw new Error(
    "HGTraceGuard: snprintf not yet transcribed @Helium C2 call site 0x1af4fc / D2 call site 0x1af5e4 (stub @0x3c55e8)",
  );
}

/**
 * `HGLogger::getLevel(char const* component)` — Helium free function
 * @Helium 0x1ad8e0. Called from HGTraceGuard::C2 @0x1af4cc with
 * (component = %rsi ← ctor arg1). Returns the currently-configured cap
 * level for the named component (int). Not yet transcribed.
 */
function HGLogger_getLevel(_component: string): number {
  throw new Error(
    "HGTraceGuard: HGLogger::getLevel(char const*) not yet transcribed @Helium 0x1ad8e0 (C2 call site 0x1af4cc)",
  );
}

/**
 * `HGLogger::print(char const*, ...)` — Helium variadic-format free
 * function @Helium 0x1ae060. Called from HGTraceGuard::C2 @0x1af50d
 * (opener) and HGTraceGuard::D2 @0x1af5fc (closer), both with fmt =
 * `"%s"` (@Helium 0x8ba5f9) wrapping a pre-formatted buffer. Not yet
 * transcribed.
 */
function HGLogger_print(_fmt: string, ..._args: unknown[]): void {
  throw new Error(
    "HGTraceGuard: HGLogger::print(char const*, ...) not yet transcribed @Helium 0x1ae060 (C2 call site 0x1af50d; D2 call site 0x1af5fc)",
  );
}

/**
 * `HGLogger::_enabled` — global u8 at @Helium 0xade514. Read by
 * HGTraceGuard::C2 @0x1af4b1 to gate on/off. Not yet transcribed as a
 * mutable global; we surface it as a throwing accessor to honour the
 * decode-before-implement rule (the write site — presumably
 * `HGLogger::setEnabled(bool)` — is not on this class's slice).
 */
function HGLogger_isEnabled(): boolean {
  throw new Error(
    "HGTraceGuard: HGLogger::_enabled (u8 @Helium 0xade514) not yet transcribed — its writer is off-slice (C2 read site 0x1af4b1)",
  );
}

/**
 * `HGLogger::_indent` — global int32 at @Helium 0xade510. Atomically
 * incremented by HGTraceGuard::C2 @0x1af512..0x1af513 (`lock incl`) and
 * decremented by HGTraceGuard::D2 @0x1af5e9..0x1af5ea (`lock decl`). Not
 * yet transcribed as a mutable global.
 */
function HGLogger_indent_increment(): void {
  throw new Error(
    "HGTraceGuard: HGLogger::_indent atomic ++ (i32 @Helium 0xade510) not yet transcribed (C2 site 0x1af512)",
  );
}
function HGLogger_indent_decrement(): void {
  throw new Error(
    "HGTraceGuard: HGLogger::_indent atomic -- (i32 @Helium 0xade510) not yet transcribed (D2 site 0x1af5e9)",
  );
}

/**
 * `HGProfiler` — Helium's per-guard elapsed-time meter. Body layout and
 * methods live in a separate file (not on this class's slice). Only the
 * four methods below are referenced from here.
 */
export type HGProfiler = object;

/**
 * `HGProfiler::HGProfiler()` — @Helium 0x1c3d20. Called from
 * HGTraceGuard::C2 @0x1af529 on freshly-allocated 16-byte memory. Not
 * yet transcribed.
 */
function HGProfiler_construct(_this: HGProfiler): void {
  throw new Error(
    "HGTraceGuard: HGProfiler::HGProfiler() not yet transcribed @Helium 0x1c3d20 (C2 call site 0x1af529)",
  );
}

/**
 * `HGProfiler::start()` — @Helium 0x1c3d90. Called from HGTraceGuard::C2
 * @0x1af535 on the freshly-constructed timer to begin measuring elapsed
 * wall-clock time. Not yet transcribed.
 */
function HGProfiler_start(_this: HGProfiler): void {
  throw new Error(
    "HGTraceGuard: HGProfiler::start() not yet transcribed @Helium 0x1c3d90 (C2 call site 0x1af535)",
  );
}

/**
 * `HGProfiler::stop()` — @Helium 0x1c3db0. Called from HGTraceGuard::D2
 * @0x1af5b8 to freeze the timer. Not yet transcribed.
 */
function HGProfiler_stop(_this: HGProfiler): void {
  throw new Error(
    "HGTraceGuard: HGProfiler::stop() not yet transcribed @Helium 0x1c3db0 (D2 call site 0x1af5b8)",
  );
}

/**
 * `HGProfiler::getTime()` — @Helium 0x1c3dd0. Called from HGTraceGuard::D2
 * @0x1af5c4 to fetch the frozen elapsed time (returned in %xmm0 as f64
 * milliseconds — see the `%f` in the "\-- %s : %f msec\n" format). Not
 * yet transcribed.
 */
function HGProfiler_getTime(_this: HGProfiler): number {
  throw new Error(
    "HGTraceGuard: HGProfiler::getTime() not yet transcribed @Helium 0x1c3dd0 (D2 call site 0x1af5c4)",
  );
}

/**
 * `HGProfiler` operator-new + operator-delete — 16-byte allocations.
 * Callq stubs @Helium 0x3c4fb2 (__Znwm — operator new(size_t)) and
 * 0x3c4fa0 (__ZdlPv — operator delete(void*)). These are the standard
 * C++ globals; not yet transcribed here.
 */
function operator_new_16(): HGProfiler {
  throw new Error(
    "HGTraceGuard: operator new(size_t=0x10) not yet transcribed (C2 call site 0x1af51e; stub @Helium 0x3c4fb2)",
  );
}
function operator_delete(_p: HGProfiler): void {
  throw new Error(
    "HGTraceGuard: operator delete(void*) not yet transcribed (D2 call site 0x1af612; stub @Helium 0x3c4fa0)",
  );
}

/**
 * `free(void*)` — POSIX. Callq stub @Helium 0x3c513e; called from
 * HGTraceGuard::D2 @0x1af604 to release the `strdup`'d message. Not
 * yet transcribed.
 */
function free_cstr(_p: string): void {
  throw new Error(
    "HGTraceGuard: free(void*) not yet transcribed (D2 call site 0x1af604; stub @Helium 0x3c513e)",
  );
}

/**
 * `HGTraceGuard` — scoped debug/trace RAII. See file-header DECODE
 * evidence for the full byte-by-byte trace.
 *
 * Instance layout (16 bytes; zero-initialised at C2 entry
 * @Helium 0x1af4ab..0x1af4ae `xorps %xmm0, %xmm0; movups %xmm0, (%rdi)`):
 *   [0x00]  dup_message  — `strdup`'d copy of the caller's message, or
 *                          null if the guard is inactive. Read by ~D2
 *                          @0x1af5ae `cmpq $0x0, (%rdi)` to decide
 *                          whether to log a close-line.
 *   [0x08]  timer        — HGProfiler* (heap-allocated via operator new;
 *                          construct()+start() before returning from C2;
 *                          delete'd unconditionally by ~D2 if non-null).
 */
export class HGTraceGuard {
  /** [0x00] strdup'd message (null when guard is inactive). */
  private dup_message: string | null = null;

  /** [0x08] HGProfiler* timer (null when guard is inactive). */
  private timer: HGProfiler | null = null;

  /**
   * `HGTraceGuard::HGTraceGuard(char const* component, int level,
   * char const* message)` — the base-object constructor @Helium 0x1af490
   * (mangled `__ZN12HGTraceGuardC2EPKciS1_`). The complete-object
   * constructor at @Helium 0x1af580 (`__ZN12HGTraceGuardC1EPKciS1_`) is
   * a bare tail-jmp to this body (0x1af580..0x1af585), so both share
   * this implementation.
   *
   * Address-by-address:
   *   0x1af490..0x1af499  prologue (rbp frame; callee-save r15/r14/rbx;
   *                        subq $0x78,%rsp — 120 bytes of locals incl.
   *                        the 128-byte snprintf buf and the canary slot).
   *   0x1af49d..0x1af4a7  stack-canary spill (guard @Helium 0xa02258, via
   *                        RIP+0x852db4). Elided in JS (no stack smash
   *                        exposure).
   *   0x1af4ab..0x1af4ae  zero the 16-byte instance (this[0..0xf] = 0).
   *   0x1af4b1..0x1af4d4  three-part gate:
   *                        (a) `testl %edx, %edx; jle 0x1af53a` — inactive
   *                            if `level <= 0`.
   *                        (b) `testb %al, %al; je 0x1af53a` — inactive
   *                            if HGLogger::_enabled == 0 (u8 @0xade514).
   *                        (c) `cap = HGLogger::getLevel(component); cmpl
   *                             %eax, %r15d; jg 0x1af53a` — inactive if
   *                             `level > cap`.
   *   0x1af4d6..0x1af4de  active: `dup = strdup(message)` (stub@0x3c5606);
   *                        store dup at this[0x0].
   *   0x1af4e1..0x1af50d  format `"/-- <dup>\n"` into a stack buffer via
   *                        `snprintf(buf, 0x64, "/-- %s\n", dup)`, then
   *                        `HGLogger::print("%s", buf)`.
   *                        Format literals:
   *                          "/-- %s\n"  @Helium 0x8eefad
   *                          "%s"        @Helium 0x8ba5f9
   *   0x1af512..0x1af513  `lock incl HGLogger::_indent` (i32 @0xade510) —
   *                        atomic increment of the shared indent counter.
   *   0x1af519..0x1af52e  `raw = operator new(0x10)`; `HGProfiler(raw)`;
   *                        store at this[0x8].
   *   0x1af532..0x1af538  `HGProfiler::start(raw)`.
   *   0x1af53a..0x1af554  canary check + epilogue.
   *   0x1af555..0x1af574  canary-fail / unwind-resume landing pads
   *                        (elided in JS).
   */
  constructor(component: string, level: number, message: string) {
    // @0x1af4ab..0x1af4ae — zero-init.
    this.dup_message = null;
    this.timer = null;

    // @0x1af4b1..0x1af4ba — level <= 0 gate. `int level` is treated as
    // signed here (`jle` = signed-less-or-equal against 0).
    if ((level | 0) <= 0) {
      return; // @0x1af53a inactive path
    }

    // @0x1af4b1..0x1af4be — HGLogger::_enabled (u8 @Helium 0xade514).
    if (!HGLogger_isEnabled()) {
      return; // @0x1af53a inactive path
    }

    // @0x1af4c6..0x1af4cc — call HGLogger::getLevel(component). The asm
    // spills r14 = message and r15d = level and rbx = this before this
    // call — that spill is a compiler artefact; we model the call as a
    // pure function of `component`.
    const cap = HGLogger_getLevel(component) | 0;

    // @0x1af4d1..0x1af4d4 — level > cap gate (signed compare via `jg`).
    if ((level | 0) > cap) {
      return; // @0x1af53a inactive path
    }

    // ---- Active path ----

    // @0x1af4d6..0x1af4de — dup = strdup(message); this[0x0] = dup.
    const dup = strdup(message);
    this.dup_message = dup;

    // @0x1af4e1..0x1af50d — format and emit the opener line.
    //   fmt = "/-- %s\n" @Helium 0x8eefad
    //   buf = alloca(128) @0x1af4e8 (leaq -0x90(%rbp), %r14)
    //   snprintf(buf, 0x64, "/-- %s\n", dup)
    //   HGLogger::print("%s", buf)  — "%s" @Helium 0x8ba5f9
    const buf = snprintf_format("/-- %s\n", dup);
    HGLogger_print("%s", buf);

    // @0x1af512..0x1af513 — atomic increment of HGLogger::_indent
    // (i32 @Helium 0xade510).
    HGLogger_indent_increment();

    // @0x1af519..0x1af52e — allocate the HGProfiler.
    //   raw = operator new(0x10)     — callq stub@0x3c4fb2 (__Znwm)
    //   HGProfiler::HGProfiler(raw)  — callq @0x1af529 (Helium 0x1c3d20)
    //   this[0x8] = raw
    const raw = operator_new_16();
    HGProfiler_construct(raw);
    this.timer = raw;

    // @0x1af532..0x1af538 — HGProfiler::start(raw).
    HGProfiler_start(raw);
  }

  /**
   * `HGTraceGuard::~HGTraceGuard()` — the base-object destructor @Helium
   * 0x1af590 (mangled `__ZN12HGTraceGuardD2Ev`). The complete-object
   * destructor at @Helium 0x1af650 (`__ZN12HGTraceGuardD1Ev`) is a bare
   * tail-jmp to this body (0x1af650..0x1af655).
   *
   * Address-by-address:
   *   0x1af590..0x1af599  prologue (same shape as C2 — 120 bytes of
   *                        locals for the 128-byte snprintf buf + canary).
   *   0x1af59d            spill this into %rbx.
   *   0x1af5a0..0x1af5aa  canary spill (elided in JS).
   *   0x1af5ae..0x1af5b2  `cmpq $0x0, (%rdi); je 0x1af609` — if
   *                        this[0x0] (dup_message) is null the guard was
   *                        inactive; skip straight to the profiler-
   *                        deletion tail (which is itself null-guarded).
   *   0x1af5b4..0x1af5b8  `HGProfiler::stop(this[0x8])` @Helium 0x1c3db0.
   *   0x1af5bd..0x1af5c4  reload dup into %r14; `elapsed_ms =
   *                        HGProfiler::getTime(this[0x8])` @Helium
   *                        0x1c3dd0 (returned in %xmm0 as f64).
   *   0x1af5c9..0x1af5e4  snprintf(buf, 0x64, "\\-- %s : %f msec\n",
   *                        dup, elapsed_ms). Format literal @Helium
   *                        0x8eefb5. The `movb $0x1, %al` immediately
   *                        before the call is the System V variadic
   *                        indicator "1 XMM arg" (the %f elapsed_ms).
   *   0x1af5e9..0x1af5ea  `lock decl HGLogger::_indent` (i32
   *                        @Helium 0xade510).
   *   0x1af5f0..0x1af5fc  `HGLogger::print("%s", buf)` @Helium 0x1ae060.
   *                        Format literal `"%s"` @Helium 0x8ba5f9.
   *   0x1af601..0x1af604  `free(dup)` — stub@0x3c513e.
   *   0x1af609..0x1af615  `if (this[0x8]) operator delete(this[0x8]);`
   *                        stub@0x3c4fa0 (__ZdlPv). Note there is NO
   *                        explicit HGProfiler dtor call — the compiler
   *                        emitted a raw delete on a class it treats as
   *                        trivially-destructible.
   *   0x1af617..0x1af631  canary check + epilogue.
   *   0x1af632..0x1af648  canary-fail / clang-call-terminate landing
   *                        pads (elided in JS).
   */
  destroy(): void {
    // @0x1af5ae..0x1af5b2 — inactive-guard fast path.
    if (this.dup_message === null) {
      // @0x1af609..0x1af615 — still-null-guarded profiler delete.
      if (this.timer !== null) {
        operator_delete(this.timer);
        this.timer = null;
      }
      return;
    }

    // Active path — mirror the exact asm order.
    // (An inactive guard has both dup_message == null AND timer == null;
    //  but here dup_message is non-null which — per the ctor's execution
    //  order @0x1af4de then @0x1af52e — implies timer is also non-null
    //  unless the ctor threw between the two stores. In JS with strict
    //  RAII invariants we assume the ctor completed atomically; asserting
    //  timer !== null.)
    const timer = this.timer;
    if (timer === null) {
      // This branch is unreachable under normal use — but the C++ asm
      // proceeds to unconditionally call HGProfiler::stop on this[0x8],
      // which would crash if [0x8] were null. Mirror that by throwing.
      throw new Error(
        "HGTraceGuard::~D2: this.timer null despite dup_message non-null (unreachable per @0x1af4de -> 0x1af52e ordering); state corrupted",
      );
    }

    // @0x1af5b4..0x1af5b8 — HGProfiler::stop(timer).
    HGProfiler_stop(timer);

    // @0x1af5bd..0x1af5c4 — elapsed_ms = HGProfiler::getTime(timer).
    const elapsed_ms = HGProfiler_getTime(timer);

    // @0x1af5c9..0x1af5e4 — format the closer line.
    //   fmt = "\-- %s : %f msec\n" @Helium 0x8eefb5
    //   snprintf(buf, 0x64, fmt, dup_message, elapsed_ms)
    const buf = snprintf_format(
      "\\-- %s : %f msec\n",
      this.dup_message,
      elapsed_ms,
    );

    // @0x1af5e9..0x1af5ea — atomic decrement of HGLogger::_indent.
    HGLogger_indent_decrement();

    // @0x1af5f0..0x1af5fc — HGLogger::print("%s", buf).
    HGLogger_print("%s", buf);

    // @0x1af601..0x1af604 — free(dup_message).
    free_cstr(this.dup_message);
    this.dup_message = null;

    // @0x1af609..0x1af615 — operator delete(timer). Unconditional (except
    // for the null-check the compiler emitted at @0x1af60d — but since
    // we already established timer !== null, the null check is a no-op).
    operator_delete(timer);
    this.timer = null;
  }
}
