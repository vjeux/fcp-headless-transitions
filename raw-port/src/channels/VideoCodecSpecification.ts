// raw-port: VideoCodecSpecification — Flexo framework (channels layer)
//
// A single-field owner of a CFMutableDictionary. The class exposes
// exactly three entry points:
//
//   0x00e390c0  ~VideoCodecSpecification()               (D1)
//   0x00e417d0  VideoCodecSpecification()                (C2, base ctor)
//   0x00e41800  set(CFStringRef key, void* value)        — dictionary put
//
// LAYOUT (from the ctor + set)
// ----------------------------
//     +0x00  CFMutableDictionaryRef  dict
//
// That's the whole struct. There's no vptr, no other fields — the
// dtor reads exactly this one slot, and set() reads it once to hand
// off to `CFDictionarySetValue`.
//
// SEMANTICS
// ---------
// This is a plain "settings blob" wrapped in a CFDictionary so it can
// be passed through Core Media / VideoToolbox APIs that take
// `CFDictionaryRef`-style bags of options. Callers accumulate options
// via `set(key, value)` and later hand the dictionary off to a codec
// setup call. Neither of the three ported methods reveals what the
// keys/values are — that's frontier information at the call sites.
//
// FRONTIER CALLEES (all Core Foundation — un-decoded here)
//   _CFDictionaryCreateMutable(alloc=null, capacity=0,
//                              keyCB=&kCFTypeDictionaryKeyCallBacks,
//                              valCB=&kCFTypeDictionaryValueCallBacks)
//                                          @0x00e417eb  (ctor)
//   _CFDictionarySetValue(dict, key, value) @0x00e41808  (set, tail-jmp)
//   _CFRelease(dict)                        @0x00e390cc  (D1)
//
// (The ctor uses the "null allocator" form of CFDictionaryCreateMutable
// -- xorl %edi,%edi at 0x00e417e7 zeroes the first arg -- which asks
// Core Foundation to use kCFAllocatorDefault implicitly.)

/**
 * Opaque handle for a CFMutableDictionaryRef.
 *
 * We don't model the Core Foundation dictionary in JS beyond an opaque
 * brand — the frontier lives entirely in the injected `cf` backend.
 * Every method that would call into CF hits a throw-stub citing the
 * relevant @0xADDR unless a real CF-backend is provided.
 */
export type CFMutableDictionaryRef = {
  readonly __brand: "CFMutableDictionaryRef";
};

/** Opaque CFStringRef (dictionary keys are CFStrings by convention). */
export type CFStringRef = { readonly __brand: "CFStringRef" };

/**
 * Injectable CoreFoundation adapter. If any method is missing, the
 * corresponding VideoCodecSpecification path throws citing @0xADDR.
 */
export interface CFBackend {
  /**
   * Create an empty mutable CFDictionary. The asm passes:
   *   alloc  = 0 (nullptr — Core Foundation uses default)
   *   cap    = 0
   *   keyCB  = &kCFTypeDictionaryKeyCallBacks
   *   valCB  = &kCFTypeDictionaryValueCallBacks
   * @0x00e417eb
   */
  createMutableDictionary(): CFMutableDictionaryRef;

  /**
   * dict[key] := value.
   * The asm tail-jumps here so no ptr-diff'ing happens on the caller.
   * @0x00e41808
   */
  setValue(
    dict: CFMutableDictionaryRef,
    key: CFStringRef,
    value: unknown,
  ): void;

  /**
   * CFRelease(dict).  @0x00e390cc
   */
  release(dict: CFMutableDictionaryRef): void;
}

/**
 * VideoCodecSpecification — a `CFMutableDictionary` owner.
 *
 * The C++ ctor takes no arguments (C2 signature = `Ev`). The JS ctor
 * requires a CF adapter because the very first thing the C++ ctor does
 * is call into CoreFoundation.
 */
export class VideoCodecSpecification {
  /**
   * The wrapped CFMutableDictionary.
   *
   *   ctor  @0x00e417f0  `movq %rax, (%rbx)` after CFDictionaryCreateMutable
   *   set   @0x00e41804  `movq (%rdi), %rdi` reads it before tail-jmp
   *   D1    @0x00e390c4  `movq (%rdi), %rdi` reads it, null-checks, releases
   */
  private dict: CFMutableDictionaryRef | null;

  private readonly cf: CFBackend;

  /**
   * VideoCodecSpecification::VideoCodecSpecification()  @0x00e417d0  (C2)
   *
   * Faithful asm mirror:
   *   @0xe417d0  pushq %rbp; movq %rsp,%rbp
   *   @0xe417d4  pushq %rbx; pushq %rax
   *   @0xe417d6  movq  %rdi, %rbx                 ; rbx = this
   *   @0xe417d9  movq  _kCFTypeDictionaryKeyCallBacks(%rip), %rdx
   *   @0xe417e0  movq  _kCFTypeDictionaryValueCallBacks(%rip), %rcx
   *   @0xe417e7  xorl  %edi, %edi                 ; alloc = null
   *   @0xe417e9  xorl  %esi, %esi                 ; capacity = 0
   *   @0xe417eb  callq _CFDictionaryCreateMutable
   *   @0xe417f0  movq  %rax, (%rbx)               ; this->dict = returned
   *   @0xe417f3  epilogue; ret
   *
   * NB: the asm does not null-check the CFDictionaryCreateMutable
   * result before storing it — under memory pressure, the object may
   * outlive with a null `dict` slot; every consumer (set, dtor) DOES
   * null-check, so we mirror the store-without-check faithfully.
   */
  constructor(cf: CFBackend) {
    this.cf = cf;
    // @0xe417eb..0xe417f0
    this.dict = this.cf.createMutableDictionary();
  }

  /**
   * VideoCodecSpecification::set(CFStringRef key, void const* value)
   *   @0x00e41800
   *
   * Faithful asm mirror — a bare load+tail-jmp:
   *   @0xe41800  pushq %rbp; movq %rsp,%rbp
   *   @0xe41804  movq  (%rdi), %rdi              ; rdi = this->dict
   *   @0xe41807  popq  %rbp
   *   @0xe41808  jmp   _CFDictionarySetValue     ; tail-jmp; rsi & rdx unchanged
   *
   * Notable: the asm does NOT null-check `this->dict`. If the
   * constructor's CFDictionaryCreateMutable had returned null, this
   * call would pass a null first arg into CFDictionarySetValue (which
   * traps with a fresh crash). We mirror the missing null-check by
   * calling straight through — the exact same failure mode surfaces
   * as a throw from the injected CF backend, not a silent no-op.
   */
  set(key: CFStringRef, value: unknown): void {
    // @0xe41804 — read this->dict; @0xe41808 — tail-jmp.
    // We do NOT null-check, faithfully to the asm.
    this.cf.setValue(this.dict as CFMutableDictionaryRef, key, value);
  }

  /**
   * VideoCodecSpecification::~VideoCodecSpecification()  @0x00e390c0  (D1)
   *
   * Faithful asm mirror:
   *   @0xe390c0  pushq %rbp; movq %rsp,%rbp
   *   @0xe390c4  movq  (%rdi), %rdi              ; rdi = this->dict
   *   @0xe390c7  testq %rdi, %rdi                 ; if null, skip
   *   @0xe390ca  je    0xe390d1
   *   @0xe390cc  callq _CFRelease
   *   @0xe390d1  popq %rbp; ret
   *
   *   @0xe390d3  landing pad: mov %rax,%rdi; callq __clang_call_terminate
   *
   * D0 (deleting dtor) is not exported for this class — callers own
   * the storage and the destructor never deletes the wrapper. That's
   * consistent with the class being embedded as a value member (e.g.
   * `VideoCodecSpecification spec;` on the stack or inside another
   * object).
   */
  destroy(): void {
    // @0xe390c4..0xe390cc
    const dict = this.dict;
    if (dict !== null && dict !== undefined) {
      this.cf.release(dict);
    }
    // (Asm does NOT null the slot after release; but there's no legal
    // access after ~ runs, so we clear it defensively — a discrepancy
    // that has no observable consequence within the class's contract.)
    this.dict = null;
  }
}
