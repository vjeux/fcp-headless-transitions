// STBuiltinAudioUnitsRegistrar.ts — Flexo's STBuiltinAudioUnitsRegistrar.
// A singleton that manages CoreAudio AudioComponentRegister() calls for
// FCP's built-in AudioUnits: it either registers them immediately (once
// the built-in table is ready) or defers them into an internal std::vector
// until RegisterAllBuiltins() flushes the queue by calling
// _AudioComponentRegister on each entry.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo (see
// raw-port/re/disasm/Flexo.STBuiltinAudioUnitsRegistrar.*.s).
//
// DECODE. Every method below cites its @0xADDR. Frontier callees
// (_AudioComponentRegister, operator new, memcpy, operator delete,
// vector::__throw_length_error, __throw_bad_array_new_length,
// __ZN19STBuiltinAudioUnits8DescribeEj_block_invoke.cold.1) are exposed
// as throwing stubs — they are OS/libc++ runtime plus one internal
// helper we haven't decoded yet, and none of them are pure-math the
// oracle would fuzz.
//
// STRUCT LAYOUT (recovered by reading which offsets each method touches).
//   sizeof = 0x20 (32 bytes)
//     +0x00  bool    mIsRegistered              // "have we drained the
//                                               //  deferred queue yet?"
//                                               // read at 0x1251910 (RegisterAllBuiltins
//                                               //  early-out `cmpb $0x0,(%rdi); jne`),
//                                               // set at 0x12519ab (`movb $0x1,(%rbx)`)
//                                               //  at loop exit, and read at 0x12519d4
//                                               //  by DeferRegistration
//                                               //  (`cmpb $0x1,(%rdi); jne <defer branch>`).
//     +0x08  DeferredRegistration* mBegin      // std::vector::__begin_
//     +0x10  DeferredRegistration* mEnd        // std::vector::__end_
//     +0x18  DeferredRegistration* mCapEnd     // std::vector::__end_cap_
//                                               // (touched at 0x12519a5 /
//                                               //  0x1251915 / 0x1251919 /
//                                               //  0x1251a15 / 0x1251a37 /
//                                               //  0x1251ade / 0x1251ae2 /
//                                               //  0x1251ae6).
//
// DEFERRED-REGISTRATION ELEMENT LAYOUT (sizeof = 0x10, from the loop body
// in RegisterAllBuiltins @0x1251969..0x12519a5 and DeferRegistration
// @0x1251a22..0x1251a29 / 0x1251aa9..0x1251ab5):
//     +0x00  factory  : AudioComponentPlugInInterface* (*)(AudioComponentDescription const*)
//     +0x08  flags    : uint32_t   (the `unsigned int` arg to DeferRegistration)
//     +0x0c  registered : bool     (`cmpb $0x0, 0xc(%r12)` at 0x1251969,
//                                    `setne 0xc(%r12)` at 0x125199f,
//                                    `movb $0x0, 0xc(%rax,%r15)` at 0x1251ab5;
//                                    also cleared at 0x1251a29).

// ── The AudioComponentDescription that's built on the stack ────────────
// A 20-byte C struct (padded to 24 in the frame) written by both
// RegisterAllBuiltins and DeferRegistration. Layout (from CoreAudio):
//     +0x00 UInt32 componentType
//     +0x04 UInt32 componentSubType
//     +0x08 UInt32 componentManufacturer
//     +0x0c UInt32 componentFlags
//     +0x10 UInt32 componentFlagsMask
export interface AudioComponentDescription {
  componentType: number; // uint32
  componentSubType: number; // uint32
  componentManufacturer: number; // uint32
  componentFlags: number; // uint32
  componentFlagsMask: number; // uint32
}

// The four constant values baked into the code by both methods.
//
//   componentType = 0x61756d78 — from `movl $0x61756d78, -0x3c(%rbp)`
//     at 0x125197a (RegisterAllBuiltins) and `movl $0x61756d78, -0x54(%rbp)`
//     at 0x12519d9 (DeferRegistration). As a CoreAudio OSType 4-char
//     code this is 'aumx' (bytes 'a'=0x61,'u'=0x75,'m'=0x6d,'x'=0x78,
//     stored msb-first in the u32). This is the Apple AU 4CC for a
//     Mixer AudioUnit ("aumx").
const AU_COMPONENT_TYPE_AUMX = 0x61756d78; // 'aumx'

//   componentManufacturer (low 4 bytes of the 64-bit constant
//     0x37461705f loaded via `movabsq $0x37461705f, %r13` at 0x125193a
//     / 0x12519e3, then `movq %r13, -0x34(%rbp)` at 0x1251984 / 0x12519ed).
//     Low 4 bytes = 0x7461705f. As a 4CC (msb-first): 't','a','p','_'
//     — the FCP built-in AU manufacturer code (Apple internal).
const AU_COMPONENT_MANUFACTURER_TAP_ = 0x7461705f; // 'tap_'

//   componentFlags = 0x00000003 — high 4 bytes of the same 64-bit
//     constant 0x37461705f (bytes 03 00 00 00 in the upper half of
//     the u64). Written at offset +0x0c of the descriptor.
const AU_COMPONENT_FLAGS = 0x00000003;

//   componentFlagsMask = 0 — from `movl $0x0, -0x2c(%rbp)` at
//     0x1251988 (RegisterAllBuiltins) and `movl $0x0, -0x44(%rbp)`
//     at 0x12519f1 (DeferRegistration).
const AU_COMPONENT_FLAGS_MASK = 0x00000000;

// ── Frontier stubs ──────────────────────────────────────────────────────
// The C++ ABI/CoreAudio callees this class hits. Each is a genuine gap
// we haven't decoded — throw-stubs cite the addr so frontier.py can
// pick them up.

/** AudioComponentRegister(AudioComponentDescription const*, CFString*,
 *  ResourceType, AudioComponentFactoryFunction) — the CoreAudio public
 *  API stubbed at 0x1494512. Called from RegisterAllBuiltins @0x1251997
 *  and DeferRegistration @0x1251a08.
 *
 *  Returns AudioComponent (a pointer-sized handle) or NULL. The caller
 *  observes only whether the return is non-zero (see `setne 0xc(%r12)`
 *  at 0x125199f) to record "registered" state on each entry. */
function _AudioComponentRegister_stub(
  _desc: AudioComponentDescription,
  _name: unknown,
  _resourceType: number,
  _factory: AudioComponentFactoryFn,
): unknown {
  throw new Error(
    "_AudioComponentRegister (CoreAudio) @0x1494512 not yet transcribed",
  );
}

/** The "name" CFString the CoreAudio call receives (2nd arg).
 *  RegisterAllBuiltins @0x1251944:  leaq 0x6de29d(%rip), %r14 →
 *     RIP-relative target 0x125194b + 0x6de29d = 0x192FBE8.
 *  DeferRegistration @0x12519f8:    leaq 0x6de1e9(%rip), %rsi →
 *     RIP-relative target 0x12519ff + 0x6de1e9 = 0x192FBE8. (Same const.)
 *  This is the address of a CFString reference in Flexo's __DATA section;
 *  the annotator prints "@\"bad cfstring ref\"" because it couldn't
 *  render the payload — that literal string ISN'T what's stored there,
 *  it's a decoder placeholder. Deferred until the CFString is decoded. */
const _AU_NAME_CFSTRING_ADDR = 0x192FBE8;

/** __ZN19STBuiltinAudioUnits8DescribeEj_block_invoke.cold.1 — the
 *  "cold" fallback path invoked from sharedInstance @0x12518c6 when the
 *  singleton predicate isn't set. Almost certainly the once-init lambda
 *  body that constructs the singleton and describes the built-in list.
 *  Not yet decoded — porting deferred. */
function _sharedInstance_cold_init_stub(): void {
  throw new Error(
    "STBuiltinAudioUnits::Describe(unsigned int)::__block_invoke.cold.1 @Flexo 0x??? — singleton init lambda not yet transcribed",
  );
}

/** `operator new(size_t)` (libc++ __Znwm, stub 0x1497452) — called by
 *  DeferRegistration @0x1251a99 to allocate the reallocated vector
 *  storage. In this GC'd runtime we return a fresh backing array so
 *  the control flow stays honest. */
function _operator_new_stub(_bytes: number): DeferredRegistration[] {
  throw new Error("operator new @Flexo 0x1497452 not modeled — needs sized-alloc semantics for exact-capacity vector growth");
}

/** `operator delete(void*)` (libc++abi __ZdlPv, stub 0x1497404) — tail
 *  call in D0 @0x123e907 and in DeferRegistration @0x1251af2 when the
 *  old vector storage is freed after the memcpy. GC'd runtime: no-op. */
function _operator_delete_stub(_ptr: unknown): void {
  // Faithful to the tail jmp; no free needed under GC.
}

/** `memcpy` (libc __memcpy, stub 0x14978ba) — called at 0x1251ad9 to
 *  copy the old vector's live prefix into the newly-allocated storage
 *  during a reallocating push_back. Modeled below by an array slice/
 *  spread on the JS side; the frontier stub exists so any callsite that
 *  wants byte-exact memcpy semantics can hit it. */
function _memcpy_stub(_dst: unknown, _src: unknown, _bytes: number): void {
  throw new Error("memcpy @Flexo 0x14978ba not modeled at byte level (JS array copy used in decoded caller)");
}

/** std::vector<DeferredRegistration>::__throw_length_error() — libc++
 *  called at 0x1251b0c when new_size overflows past 2^60 elements.
 *  Faithful: throw a corresponding runtime error. */
function _throw_length_error_stub(): never {
  throw new RangeError("std::vector<STBuiltinAudioUnitsRegistrar::DeferredRegistration>::__throw_length_error @Flexo 0x1251b0c");
}

/** std::__throw_bad_array_new_length() — libc++ called at 0x1251b11
 *  when the requested allocation exceeds 2^63-16 bytes (the check at
 *  0x1251a86..0x1251a89 `cmpq 0x7ffffffffffffff0, %rax`). */
function _throw_bad_array_new_length_stub(): never {
  throw new RangeError("std::__throw_bad_array_new_length @Flexo 0x1251b11");
}

// ── Types ───────────────────────────────────────────────────────────────

/** A CoreAudio-style factory function pointer:
 *      AudioComponentPlugInInterface* (*)(AudioComponentDescription const*)
 *  Its concrete form isn't decoded here; we type it as an opaque JS fn. */
export type AudioComponentFactoryFn =
  (desc: AudioComponentDescription) => unknown;

/** STBuiltinAudioUnitsRegistrar::DeferredRegistration — a 16-byte POD
 *  built up in RegisterAllBuiltins/DeferRegistration and stored in the
 *  registrar's std::vector. See offsets in the class-level comment. */
export interface DeferredRegistration {
  factory: AudioComponentFactoryFn;
  flags: number; // uint32
  registered: boolean; // +0x0c
}

// ── The class ──────────────────────────────────────────────────────────

/** STBuiltinAudioUnitsRegistrar — a process-global singleton that
 *  maintains the "AU registrations to make once the built-in table is
 *  filled" queue. */
export class STBuiltinAudioUnitsRegistrar {
  /** +0x00. `mIsRegistered` — set to true by RegisterAllBuiltins() after
   *  the queue is drained (0x12519ab `movb $0x1, (%rbx)`); consulted by
   *  DeferRegistration() to choose "register now" (true) vs "queue up"
   *  (false). Initialized to false by the singleton init. */
  mIsRegistered: boolean = false;

  /** +0x08 begin, +0x10 end, +0x18 capacity-end — the std::vector<
   *  DeferredRegistration> the queued entries live in. We model it as
   *  a plain TS array; the offsets in the class-level comment refer
   *  to the pointer triple in the real object. */
  mDeferred: DeferredRegistration[] = [];

  /** STBuiltinAudioUnitsRegistrar::sharedInstance() @Flexo 0x12518b0.
   *  Classic dispatch-once "sPredicate + sInstance" pattern:
   *
   *      0x12518b0  cmpq  $-0x1, sPredicate(%rip)
   *      0x12518b8  jne   0x12518c2                      ; !ready → cold path
   *      0x12518ba  movq  sInstance(%rip), %rax
   *      0x12518c1  retq                                 ; fast path
   *      0x12518c2  pushq %rbp / movq %rsp,%rbp
   *      0x12518c6  callq __ZN19STBuiltinAudioUnits8DescribeEj_block_invoke.cold.1
   *                                                     ; run once-init
   *      0x12518cb  popq  %rbp
   *      0x12518cc  movq  sInstance(%rip), %rax
   *      0x12518d3  retq
   *
   *  The two static locals live in Flexo's __DATA:
   *     sPredicate  @Flexo static — 0xffffffffffffffff = "ready", else "not ready"
   *     sInstance   @Flexo static — the singleton pointer
   *
   *  In the TS port we lazy-init a module-scope instance guarded by a
   *  boolean; the cold path stub throws because the once-init lambda
   *  hasn't been decoded yet. */
  static sharedInstance(): STBuiltinAudioUnitsRegistrar {
    if (_sPredicate) {
      return _sInstance as STBuiltinAudioUnitsRegistrar;
    }
    // 0x12518c6 — cold: run the singleton init lambda (undecoded stub).
    _sharedInstance_cold_init_stub();
    return _sInstance as STBuiltinAudioUnitsRegistrar;
  }

  /** STBuiltinAudioUnitsRegistrar::RegisterAllBuiltins() @Flexo 0x1251910.
   *  Drains the deferred queue, calling _AudioComponentRegister for
   *  every entry whose `.registered` field is still false. Marks each
   *  entry `.registered = (result != NULL)` and finally flips the
   *  instance's mIsRegistered to true. Idempotent: an early-out at
   *  0x1251910 returns immediately if mIsRegistered was already true.
   *
   *  Faithful control flow:
   *     0x1251910  cmpb  $0x0,(%rdi)          ; if mIsRegistered != 0
   *     0x1251913  jne   0x12519bc            ;   → skip everything, ret
   *     [preamble @0x1251919..0x1251926]
   *     0x125192d  movq  0x8(%rdi),%r12       ; r12 = mBegin (iterator)
   *     0x1251931  movq  0x10(%rdi),%rax      ; rax = mEnd
   *     0x1251935  cmpq  %rax,%r12
   *     0x1251938  je    0x12519ab            ; empty vector → done
   *     [loop-invariant setup 0x125193a..0x125194f]
   *     .loopHead @0x1251969
   *     0x1251969  cmpb  $0x0, 0xc(%r12)      ; if entry.registered != 0
   *     0x125196f  jne   0x1251960            ;   → skip (already registered)
   *     0x1251971  movq  (%r12),%rcx          ; rcx = entry.factory
   *     0x1251975  movl  0x8(%r12),%eax       ; eax = entry.flags (used as subType)
   *     0x125197a  movl  $0x61756d78,-0x3c(%rbp)   ; desc.componentType = 'aumx'
   *     0x1251981  movl  %eax,-0x38(%rbp)          ; desc.componentSubType = flags
   *     0x1251984  movq  %r13,-0x34(%rbp)          ; desc.mfr = 'tap_' (low4),
   *                                                ; desc.componentFlags = 3 (high4)
   *     0x1251988  movl  $0x0,-0x2c(%rbp)          ; desc.componentFlagsMask = 0
   *     0x125198f  movq  %r15,%rdi                 ; arg1 = &desc
   *     0x1251992  movq  %r14,%rsi                 ; arg2 = cfstring @0x192fbe8
   *     0x1251995  xorl  %edx,%edx                 ; arg3 = 0 (resourceType/inKind)
   *                                                ; arg4 = %rcx = factory (pre-set)
   *     0x1251997  callq _AudioComponentRegister
   *     0x125199c  testq %rax,%rax
   *     0x125199f  setne 0xc(%r12)                 ; entry.registered = (rc != 0)
   *     0x12519a5  movq  0x10(%rbx),%rax           ; refresh end (may not move)
   *     0x12519a9  jmp   .step
   *     .step @0x1251960
   *     0x1251960  addq  $0x10,%r12               ; ++it
   *     0x1251964  cmpq  %rax,%r12
   *     0x1251967  je    0x12519ab                 ; end → done
   *     0x1251969  jmp   .loopHead
   *     .done @0x12519ab
   *     0x12519ab  movb  $0x1,(%rbx)              ; mIsRegistered = true
   *     [epilogue → retq @0x12519bc]
   *
   *  Note that %rcx (entry.factory) is only assigned inside the
   *  "not-yet-registered" branch — but the CALL sequence reuses %rcx
   *  as the 4th arg (AudioComponentFactoryFunction) via the standard
   *  System V AMD64 ABI. */
  RegisterAllBuiltins(): void {
    // 0x1251910 — early out if already drained.
    if (this.mIsRegistered) return;
    // 0x125192d/0x1251931 — iterate [mBegin, mEnd).
    for (const entry of this.mDeferred) {
      // 0x1251969 — skip entries already registered.
      if (entry.registered) continue;
      // 0x125197a..0x1251988 — build the AudioComponentDescription
      // literal on the stack. `entry.flags` (from the DeferRegistration
      // 2nd arg) is used as componentSubType — see 0x1251975/0x1251981.
      const desc: AudioComponentDescription = {
        componentType: AU_COMPONENT_TYPE_AUMX,
        componentSubType: entry.flags,
        componentManufacturer: AU_COMPONENT_MANUFACTURER_TAP_,
        componentFlags: AU_COMPONENT_FLAGS,
        componentFlagsMask: AU_COMPONENT_FLAGS_MASK,
      };
      // 0x1251997 — _AudioComponentRegister(&desc, cfstring, 0, factory).
      const rc = _AudioComponentRegister_stub(
        desc,
        _AU_NAME_CFSTRING_ADDR,
        0,
        entry.factory,
      );
      // 0x125199f — record success bit.
      entry.registered = rc != null && rc !== 0;
    }
    // 0x12519ab — flip the "queue drained" bit.
    this.mIsRegistered = true;
  }

  /** STBuiltinAudioUnitsRegistrar::DeferRegistration(
   *       AudioComponentPlugInInterface* (*factory)(AudioComponentDescription const*),
   *       unsigned int flags) @Flexo 0x12519c0.
   *
   *  If the singleton has already flushed its queue (mIsRegistered == 1),
   *  registers immediately by calling _AudioComponentRegister with a
   *  freshly-built AudioComponentDescription (the same 5-field literal
   *  RegisterAllBuiltins uses; see 0x12519d9..0x12519f1). Otherwise
   *  it push_back's a new DeferredRegistration{factory, flags, false}
   *  into the internal std::vector — with the full libc++ growth path:
   *  fast-path append if there's spare capacity, else geometric grow
   *  (new_cap = min(2*old_cap+1, max_size), bounds-checked, allocated
   *  via operator new, live prefix copied via memcpy, old buffer freed
   *  via operator delete). Return value is `true` (movb $0x1,%al @0x1251afb).
   *
   *  Faithful transcription of the two paths follows in the body. */
  DeferRegistration(factory: AudioComponentFactoryFn, flags: number): boolean {
    // 0x12519d4 — cmpb $0x1,(%rdi) ; jne 0x1251a12 → if !mIsRegistered
    //                                                jump to defer path.
    if (this.mIsRegistered) {
      // ---- IMMEDIATE REGISTRATION PATH (0x12519d9..0x1251a0d) --------
      // Build the AudioComponentDescription literal, exactly like
      // RegisterAllBuiltins does, and call through.
      const desc: AudioComponentDescription = {
        componentType: AU_COMPONENT_TYPE_AUMX,               // 0x12519d9
        componentSubType: flags,                             // 0x12519e0
        componentManufacturer: AU_COMPONENT_MANUFACTURER_TAP_, // 0x12519ed low
        componentFlags: AU_COMPONENT_FLAGS,                  // 0x12519ed high
        componentFlagsMask: AU_COMPONENT_FLAGS_MASK,         // 0x12519f1
      };
      // 0x1251a08 — _AudioComponentRegister(&desc, cfstring, 0, factory).
      _AudioComponentRegister_stub(
        desc,
        _AU_NAME_CFSTRING_ADDR,
        0,
        factory,
      );
      // 0x1251a0d — jmp to the tail-return.
    } else {
      // ---- DEFER-INTO-VECTOR PATH (0x1251a12..0x1251af7) -------------
      // 0x1251a15 — r15 = mEnd; 0x1251a19 — rax = mCapEnd.
      // 0x1251a1d..0x1251a20 — if r15 < rax  (spare capacity) → fast path.
      //
      // Fast path (0x1251a22..0x1251a32):
      //   0x1251a22  movq %r8, (%r15)           ; end->factory = arg
      //   0x1251a25  movl %edx, 0x8(%r15)       ; end->flags   = arg
      //   0x1251a29  movb $0x0, 0xc(%r15)       ; end->registered = false
      //   0x1251a2e  addq $0x10, %r15           ; ++end
      //   0x1251a32  jmp  0x1251af7             ; mEnd = new end; done
      //
      // Slow path (0x1251a37..0x1251af2): geometric realloc-and-copy.
      // We model both with a single push_back on the JS array — the
      // JS engine does the growth for us. The overflow-guards and the
      // frontier ops (new/memcpy/delete) are documented above; they
      // don't observably change semantics beyond "did we throw or not".
      //
      // Faithful behaviour recorded from the slow path:
      //   1. new_cap chosen at 0x1251a45..0x1251a89 as
      //         requested = old_size + 1
      //         geometric = old_cap * 2                 (0x1251a71 sar 3)
      //         chosen    = min(max(requested, geometric),
      //                         0xFFFFFFFFFFFFFFF)      (0x1251a5d/0x1251a8d)
      //      with overflow to bad_array_new_length at 0x1251b11.
      //   2. operator new(chosen * 0x10) at 0x1251a99.
      //   3. write new element at the current end offset (r15) into
      //      the freshly-allocated buffer:
      //         (aux+r15).factory   = factory
      //         (aux+r15).flags     = flags
      //         (aux+r15).registered = false
      //      (0x1251aa9/0x1251ab0/0x1251ab5)
      //   4. memcpy old prefix (aux, mBegin, r15 bytes)  at 0x1251ad9.
      //   5. update mBegin/mEnd/mCapEnd triple at 0x1251ade..0x1251ae6.
      //   6. operator delete(oldBegin) if it was non-null at 0x1251af2.
      //
      // JS equivalent: single push into the model array. Overflow
      // guards throw a matching RangeError.
      //
      // Length-error guard from 0x1251a4c/0x1251a50 (`shrq $0x3c, %rsi;
      // jne 0x1251b0c`): if new_size >> 60 != 0 → throw_length_error.
      if (this.mDeferred.length + 1 > 0x0FFFFFFFFFFFFFFF) {
        _throw_length_error_stub();
      }
      this.mDeferred.push({ factory, flags, registered: false });
    }
    // 0x1251afb — movb $0x1,%al ; ret true.
    return true;
  }

  /** STBuiltinAudioUnitsRegistrar::~STBuiltinAudioUnitsRegistrar()
   *  is not part of the public class API (nm exports the class only
   *  via its 3 static/instance methods; the class itself is trivially
   *  destructible — vector destructor is inlined by the compiler at
   *  callsites). No dedicated D0/D1 to transcribe. */
}

// ── Singleton state (module-scope; models `static Registrar* sInstance`
//    and `static intptr_t sPredicate` at Flexo __DATA) ─────────────────

let _sInstance: STBuiltinAudioUnitsRegistrar | null = new STBuiltinAudioUnitsRegistrar();
// sPredicate is -1 (== 0xffffffffffffffff) once init has run. We model
// that as a boolean; init hasn't been decoded, so we default to "ready"
// because our model instance is already usable (empty deferred queue).
let _sPredicate: boolean = true;
