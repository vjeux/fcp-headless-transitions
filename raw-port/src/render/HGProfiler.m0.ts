// HGProfiler.m0.ts — chunk 0 (all 8 methods) of Helium's `HGProfiler` — a stopwatch
// timer utility around Apple's `mach_absolute_time()` / `mach_timebase_info()`.
//
// Framework: Helium
// Method source disassemblies:
//   raw-port/re/disasm/Helium.HGProfiler._tb_init.s      @0x1c3c50   (static "prime the timebase" init)
//   raw-port/re/disasm/Helium.HGProfiler.HGProfiler.s    @0x1c3ca0   (C2 ctor)
//                                                        @0x1c3d20   (C1 ctor — same body as C2 per ICF-adjacent)
//   raw-port/re/disasm/Helium.HGProfiler.init.s          @0x1c3d10   ; instance re-init (accum=0)
//   raw-port/re/disasm/Helium.HGProfiler.start.s         @0x1c3d90
//   raw-port/re/disasm/Helium.HGProfiler.stop.s          @0x1c3db0
//   raw-port/re/disasm/Helium.HGProfiler.getTime.s       @0x1c3dd0   ; returns elapsed ms (as double)
//   raw-port/re/disasm/Helium.HGProfiler.getTimeSec.s    @0x1c3e20   ; returns elapsed seconds
//
// CLASS STATICS (Helium, x86_64 slice, fat-offset 0x4000):
//   HGProfiler::_first     @Helium 0xa............ (u8 sentinel, initially 1)
//   HGProfiler::_tbfreq    @Helium 0xa............ (f32, ms per mach tick — see K1 below)
//   HGProfiler::_tb_init()::s_tbinfo  @Helium 0xade3b0
//     (a mach_timebase_info_data_t: numer:u32 @+0x00, denom:u32 @+0x04. This is a
//     function-scoped static under _tb_init but shared across the ctors that inline it.)
//
// LAYOUT (recovered from start()/stop()/getTime()):
//   +0x00  u64  _startTicks   — mach_absolute_time() snapshot on start()
//   +0x08  u64  _accumTicks   — running total of (stop_ticks - start_ticks); zeroed by ctor/init()
//   sizeof(HGProfiler) = 0x10 bytes.
//
// RIP-DATA CONSTANTS:
//   K1 (double) = 1e-06                  @Helium 0x85ab20  hex 8dedb5a0f7c6b03e
//                — mulsd'd against `numer` in the timebase-freq init. Converts the
//                  nanoseconds-per-tick ratio (numer/denom) into milliseconds-per-tick
//                  (nanoseconds × 1e-6 = milliseconds). i.e. `_tbfreq` holds ms/tick.
//   K2 (double) = 0.001                  @Helium 0x85ee90  hex fca9f1d24d62503f
//                — mulsd'd at the tail of getTimeSec: (ms) × 0.001 = seconds.
//
// The full timebase pipeline:
//   nanoseconds_per_tick   = s_tbinfo.numer / s_tbinfo.denom     (per Apple's mach_timebase_info)
//   milliseconds_per_tick  = nanoseconds_per_tick × 1e-6
//   _tbfreq (f32)          = fround(milliseconds_per_tick)
//   getTime()              = fround(ticks × _tbfreq) as double   → milliseconds
//   getTimeSec()           = fround(ticks × _tbfreq) as double × 0.001  → seconds
//
// The odd `js` branch in getTime/getTimeSec handles the signed→unsigned conversion of a
// 64-bit tick count: if the high bit is set, cvtsi2ss treats it as a negative signed
// integer and produces the wrong magnitude. The mitigation the compiler emits mirrors
// libgcc's `__floatundisisf`: shift-right-by-1, OR the LSB back in, cvtsi2ss, then
// double the result. Ported faithfully below.
//
// Because JS numbers can't hold arbitrary 64-bit ticks without loss above 2^53, the
// port keeps _startTicks/_accumTicks as `bigint` (per PORTING_SPEC rule 4). But since
// _tbfreq is a small float and ticks fit in ~40 bits for any sane elapsed duration,
// the arithmetic in getTime/getTimeSec re-narrows to `Number` via BigInt→Number cast
// at the SAME place the asm re-narrows via cvtsi2ss.

// -- CoreOS bridge -----------------------------------------------------------------
// `_mach_absolute_time` and `_mach_timebase_info` are external Darwin APIs. In this
// pure-TS port we synthesize the same semantics from a monotonic time source. Both
// helpers throw if invoked in an environment without a monotonic clock — matching
// the spec's rule that undecoded/unsourced values throw rather than fabricate.
//
// Note on faithfulness: the mach_absolute_time value has NO fixed unit; it's platform
// ticks scaled through numer/denom. FCP's binary reads whatever numer/denom the host
// kernel reports (typically {1,1} on x86_64 → 1 tick == 1 ns). The port models this by
// treating "ticks" as nanoseconds and reporting numer=1, denom=1 in s_tbinfo. This is
// a HOST-BEHAVIOR reproduction (not a decode of Apple's implementation), so it's fenced
// off in its own bridge function and cited as such. If the caller needs bit-exact
// timing values from a specific host, they must plumb their own mach APIs through here.
function _mach_absolute_time_bridge(): bigint {
  // `process.hrtime.bigint()` returns nanoseconds. On x86_64 macOS the mach timebase
  // is (numer=1, denom=1) so mach_absolute_time IS nanoseconds — same units as hrtime.
  // On ARM64 mach_absolute_time is 24MHz ticks with numer=125/denom=3 (so ns = t*125/3);
  // this bridge doesn't emulate that — it always returns nanoseconds, and _tb_init below
  // reports numer=1/denom=1 so the pipeline is internally consistent.
  const g: unknown = (globalThis as { process?: { hrtime?: { bigint?: () => bigint } } }).process;
  const p = g as { hrtime?: { bigint?: () => bigint } } | undefined;
  if (p?.hrtime?.bigint) return p.hrtime.bigint();
  // Fallback: performance.now() * 1e6 → nanoseconds (loses sub-microsec precision)
  const perf = (globalThis as { performance?: { now?: () => number } }).performance;
  if (perf?.now) return BigInt(Math.floor(perf.now() * 1e6));
  throw new Error("HGProfiler: no monotonic clock available (_mach_absolute_time @Helium _mach_absolute_time not decoded, host bridge missing)");
}

// -- Class statics (mirror the .bss slots) -----------------------------------------
// Ported names retain the FCP originals:
//   HGProfiler::_first    @Helium (in-binary .bss slot with initial value 0x01)
//   HGProfiler::_tbfreq   @Helium (in-binary .bss slot for the cached float32)
//   HGProfiler::_tb_init()::s_tbinfo  @Helium 0xade3b0 (mach_timebase_info_data_t)
let _first: number = 1;                                    // u8 init = 1
let _tbfreq: number = 0;                                    // f32, populated on first ctor/tb_init
const s_tbinfo = { numer: 0, denom: 0 };                    // mach_timebase_info_data_t

const K1_msPerNs = 1e-6;                                    // @Helium 0x85ab20 (0x3eb0c6f7a0b5ed8d) = 1e-6
const K2_secPerMs = 0.001;                                  // @Helium 0x85ee90 (0x3f5062 4dd2f1a9fc) = 0.001

// Bridge to Apple's mach_timebase_info. On x86_64 macOS this returns {1,1}.
function _mach_timebase_info_bridge(out: { numer: number; denom: number }): void {
  // Faithful default: x86_64 macOS reports {numer:1, denom:1}. We use these values
  // because the disassembly's arithmetic (`numer * 1e-6 / denom` → ms/tick) yields
  // 1e-6 ms/tick = 1 ns/tick — which is what mach_absolute_time returns natively.
  out.numer = 1;
  out.denom = 1;
}

// ---------------------------------------------------------------------------
// HGProfiler::_tb_init()   @Helium 0x1c3c50   [class static]
// ---------------------------------------------------------------------------
// Body (mirrored):
//   cmpb  $0x1, _first(%rip)              ; if _first != 1
//   jne   0x1c3c9f                         ;   → skip entire init, ret
//   push %rbp ; mov %rsp,%rbp
//   leaq  s_tbinfo(%rip), %rdi
//   callq _mach_timebase_info              ; mach_timebase_info(&s_tbinfo)
//   movl  s_tbinfo(%rip), %eax             ; eax = s_tbinfo.numer
//   cvtsi2sd %rax, %xmm0                   ; xmm0 = (double)eax  (using 64-bit cvt)
//   mulsd  K1(=1e-6)(%rip), %xmm0          ; xmm0 *= 1e-6
//   movl  s_tbinfo.denom(%rip), %eax       ; eax = s_tbinfo.denom
//   cvtsi2sd %rax, %xmm1                   ; xmm1 = (double)eax
//   divsd  %xmm1, %xmm0                    ; xmm0 /= xmm1
//   cvtsd2ss %xmm0, %xmm0                  ; xmm0 = (float)xmm0
//   movss %xmm0, _tbfreq(%rip)             ; _tbfreq = xmm0
//   movb  $0x0, _first(%rip)               ; _first = 0
//   pop %rbp ; ret
export function HGProfiler__tb_init(): void {
  // @Helium 0x1c3c50: gate on _first (only prime once).
  if (_first !== 1) return;
  // @Helium 0x1c3c64: mach_timebase_info(&s_tbinfo)
  _mach_timebase_info_bridge(s_tbinfo);
  // @Helium 0x1c3c69..0x1c3c8b: compute _tbfreq = fround((numer * 1e-6) / denom)
  //   (mirrors cvtsi2sd → mulsd K1 → divsd (double)denom → cvtsd2ss)
  const numerD = s_tbinfo.numer;                             // cvtsi2sd from u32/u64 numer
  const denomD = s_tbinfo.denom;                             // cvtsi2sd from u32/u64 denom
  const msPerTickD = (numerD * K1_msPerNs) / denomD;         // f64 arithmetic
  _tbfreq = Math.fround(msPerTickD);                         // cvtsd2ss
  // @Helium 0x1c3c97: _first = 0
  _first = 0;
}

// ---------------------------------------------------------------------------
// HGProfiler::HGProfiler()  @Helium 0x1c3ca0 (C2) and 0x1c3d20 (C1)
// Both ctor bodies are identical: inline _tb_init check, then zero this->_accumTicks.
// ---------------------------------------------------------------------------
// Body (C1 shown; C2 is byte-identical modulo the mulsd/movl disp for the same targets):
//   push %rbp; mov %rsp,%rbp; push %rbx; push %rax
//   mov %rdi,%rbx                          ; save this
//   cmpb $0x1, _first(%rip)                ; ---- inlined _tb_init body ----
//   jne 0x1c3d73                           ;   skip if already primed
//   leaq s_tbinfo(%rip),%rdi ; call _mach_timebase_info
//   movl s_tbinfo(%rip),%eax ; cvtsi2sd %rax,%xmm0 ; mulsd K1,%xmm0
//   movl s_tbinfo.denom(%rip),%eax ; cvtsi2sd %rax,%xmm1 ; divsd %xmm1,%xmm0
//   cvtsd2ss %xmm0,%xmm0 ; movss %xmm0,_tbfreq(%rip) ; movb $0,_first(%rip)
//   movq $0x0, 0x8(%rbx)                   ; this->_accumTicks = 0
//   add $0x8,%rsp ; pop %rbx ; pop %rbp ; ret
export class HGProfiler {
  /** +0x00 — u64 mach_absolute_time snapshot from start(). Held as bigint for full 64-bit range. */
  _startTicks: bigint = 0n;
  /** +0x08 — u64 accumulated ticks: += (stop_ticks - start_ticks) on each stop(). */
  _accumTicks: bigint = 0n;

  constructor() {
    // @Helium 0x1c3d29..0x1c3d6c: inlined _tb_init (identical semantics — call it out here).
    HGProfiler__tb_init();
    // @Helium 0x1c3d73: this->_accumTicks = 0
    this._accumTicks = 0n;
    // _startTicks is not initialized by the ctor (asm never touches +0x00). The field
    // is left at whatever heap value was there; the port initializes to 0n via the
    // class-property initializer, which is a benign strictification (start() always
    // overwrites it before getTime() can read anything).
  }
}

// ---------------------------------------------------------------------------
// HGProfiler::init()  @Helium 0x1c3d10
// ---------------------------------------------------------------------------
// Body:  push %rbp ; mov %rsp,%rbp ; movq $0x0, 0x8(%rdi) ; pop %rbp ; ret
//   → this->_accumTicks = 0 (a lightweight "reset accumulator" that doesn't re-prime the timebase).
export function HGProfiler_init(self: HGProfiler): void {
  self._accumTicks = 0n;
}

// ---------------------------------------------------------------------------
// HGProfiler::start()  @Helium 0x1c3d90
// ---------------------------------------------------------------------------
// Body:
//   push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax
//   mov %rdi,%rbx
//   callq _mach_absolute_time             ; %rax = mach_absolute_time()
//   movq %rax, (%rbx)                     ; this->_startTicks = %rax
//   add $0x8,%rsp ; pop %rbx ; pop %rbp ; ret
export function HGProfiler_start(self: HGProfiler): void {
  self._startTicks = _mach_absolute_time_bridge();
}

// ---------------------------------------------------------------------------
// HGProfiler::stop()  @Helium 0x1c3db0
// ---------------------------------------------------------------------------
// Body:
//   push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax
//   mov %rdi,%rbx
//   callq _mach_absolute_time             ; %rax = mach_absolute_time()
//   subq (%rbx), %rax                     ; %rax -= this->_startTicks
//   addq %rax, 0x8(%rbx)                  ; this->_accumTicks += %rax
//   ret
export function HGProfiler_stop(self: HGProfiler): void {
  const now = _mach_absolute_time_bridge();
  // `subq (%rbx), %rax` gives the SIGNED 64-bit delta. In practice this is always
  // non-negative because now > start, but preserve the two's-complement wrap-around
  // semantics by masking to 64 bits — matches x86_64's native subq behavior.
  const delta = (now - self._startTicks) & 0xFFFFFFFFFFFFFFFFn;
  self._accumTicks = (self._accumTicks + delta) & 0xFFFFFFFFFFFFFFFFn;
}

// ---------------------------------------------------------------------------
// HGProfiler::getTime()   @Helium 0x1c3dd0   — returns MILLISECONDS as double
// ---------------------------------------------------------------------------
// Body:
//   push %rbp ; mov %rsp,%rbp
//   movq 0x8(%rdi), %rax                  ; rax = _accumTicks (i64 view)
//   testq %rax, %rax
//   js 0x1c3df0                            ;   if signed-negative (high bit set), unsigned-cvt path
//   cvtsi2ss %rax, %xmm0                  ; xmm0 = (float)(i64)rax
//   mulss _tbfreq(%rip), %xmm0            ; xmm0 *= _tbfreq  (ms/tick)
//   cvtss2sd %xmm0, %xmm0                 ; xmm0 = (double)xmm0
//   pop %rbp ; ret
// 0x1c3df0 (unsigned-cvt for rax with high bit):
//   movq %rax, %rcx
//   shrq %rcx                              ; rcx = rax >> 1
//   andl $0x1, %eax                        ; eax = rax & 1
//   orq %rcx, %rax                         ; rax = (rax>>1) | (rax&1)   → half the magnitude
//   cvtsi2ss %rax, %xmm0                  ; xmm0 = (float)(halved)
//   addss %xmm0, %xmm0                    ; xmm0 *= 2                    → restore magnitude
//   mulss _tbfreq(%rip), %xmm0
//   cvtss2sd %xmm0, %xmm0
//   pop %rbp ; ret
//
// This is the classic i64→f32 unsigned-conversion trick — needed because `cvtsi2ss`
// with a 64-bit source treats it as signed. We port it faithfully via bigint sign check.
export function HGProfiler_getTime(self: HGProfiler): number {
  const ticks = self._accumTicks;
  // js check: high bit of i64 set ↔ ticks >= 2^63
  if (ticks < (1n << 63n)) {
    // Signed positive: single cvtsi2ss suffices.
    const asF32 = Math.fround(Number(ticks));                // cvtsi2ss (rax → float32)
    const scaled = Math.fround(asF32 * _tbfreq);             // mulss
    return scaled;                                            // cvtss2sd (implicit widen for return)
  } else {
    // Unsigned high bit set: halve, cvt, double — bit-exact match of the shrq/or/addss path.
    const half = (ticks >> 1n) | (ticks & 1n);
    const asF32 = Math.fround(Number(half));                 // cvtsi2ss
    const doubled = Math.fround(asF32 + asF32);              // addss %xmm0, %xmm0
    const scaled = Math.fround(doubled * _tbfreq);           // mulss
    return scaled;                                            // cvtss2sd
  }
}

// ---------------------------------------------------------------------------
// HGProfiler::getTimeSec()  @Helium 0x1c3e20 — returns SECONDS as double
// ---------------------------------------------------------------------------
// Body (same shape as getTime but with a tail `mulsd K2(=0.001), xmm0` to convert ms→s):
//   push %rbp ; mov %rsp,%rbp
//   movq 0x8(%rdi), %rax
//   testq %rax, %rax ; js 0x1c3e34
//   cvtsi2ss %rax, %xmm0 ; jmp 0x1c3e49       ; positive path skips the doubling step
// 0x1c3e34: movq %rax,%rcx ; shrq %rcx ; andl $1,%eax ; orq %rcx,%rax ; cvtsi2ss %rax,%xmm0 ; addss %xmm0,%xmm0
// 0x1c3e49: mulss _tbfreq(%rip), %xmm0        ; ms = ticks * _tbfreq (f32)
//           cvtss2sd %xmm0, %xmm0             ; widen to double
//           mulsd K2(=0.001)(%rip), %xmm0     ; sec = ms * 0.001
//           pop %rbp ; ret
export function HGProfiler_getTimeSec(self: HGProfiler): number {
  const ticks = self._accumTicks;
  let msF32: number;
  if (ticks < (1n << 63n)) {
    const asF32 = Math.fround(Number(ticks));
    msF32 = Math.fround(asF32 * _tbfreq);
  } else {
    const half = (ticks >> 1n) | (ticks & 1n);
    const asF32 = Math.fround(Number(half));
    const doubled = Math.fround(asF32 + asF32);
    msF32 = Math.fround(doubled * _tbfreq);
  }
  // @Helium 0x1c3e51: cvtss2sd (widen to double), 0x1c3e55: mulsd K2(0.001) — done in f64.
  return msF32 * K2_secPerMs;
}

// ---------------------------------------------------------------------------
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ---------------------------------------------------------------------------
export const HGProfiler_m0_methods = {
  _tb_init:   HGProfiler__tb_init,
  ctor:       () => new HGProfiler(),
  init:       HGProfiler_init,
  start:      HGProfiler_start,
  stop:       HGProfiler_stop,
  getTime:    HGProfiler_getTime,
  getTimeSec: HGProfiler_getTimeSec,
};
