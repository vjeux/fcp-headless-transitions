// SetPixelBufferAttributes — Flexo's tiny RAII wrapper around a CoreFoundation
// CFMutableDictionaryRef used to configure a CVPixelBuffer. The class owns
// exactly ONE pointer field at struct offset 0x0 (the CFMutableDictionaryRef
// itself), populated by the constructor from up to four inputs and CFReleased
// by the destructor. A helper `setIntAttribute(CFString*, int)` lets callers
// tack extra integer entries onto the dictionary after construction.
//
// Verbatim from FCP's Flexo framework at:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// nm evidence (`nm -arch x86_64 -m Flexo | grep SetPixelBufferAttributes`):
//   0000000000e03020 T __ZN24SetPixelBufferAttributesD1Ev
//   0000000000e41620 T __ZN24SetPixelBufferAttributesC2Ejiib
//   0000000000e41760 T __ZN24SetPixelBufferAttributesC1Ejiib
//   0000000000e41770 T __ZN24SetPixelBufferAttributes15setIntAttributeEPK10__CFStringi
//
// The C1 (complete-object) constructor is a 5-byte thin trampoline into C2
// (base-object) — no separately-emitted code beyond `jmp C2`. The class has
// exactly one member (the dict at +0x0), no vtable, and no D0 (no dynamic
// allocation path exported).
//
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.SetPixelBufferAttributes.SetPixelBufferAttributes.s (C1, 6 lines)
//   raw-port/re/disasm/Flexo.SetPixelBufferAttributes.~SetPixelBufferAttributes.s (D1, 12 lines)
//   raw-port/re/disasm/Flexo.SetPixelBufferAttributes.setIntAttribute.s (31 lines)
//   C2 body recovered via `awk` over /tmp/Flexo_tV.txt at __ZN24SetPixelBufferAttributesC2Ejiib (93 lines)
//
// ─── C1 (complete-object ctor) @Flexo 0x0e41760 ───────────────────────────────
//   __ZN24SetPixelBufferAttributesC1Ejiib:
//     0xe41760  pushq %rbp
//     0xe41761  movq  %rsp, %rbp
//     0xe41764  popq  %rbp
//     0xe41765  jmp   __ZN24SetPixelBufferAttributesC2Ejiib
//
// Thin trampoline: the C1/C2 pair in the Itanium ABI is collapsed to a single
// body since the class has no virtual bases and no vtable slot to swap in
// mid-construction. All real work lives in C2.
//
// ─── C2 (base-object ctor) @Flexo 0x0e41620 ───────────────────────────────────
// Arguments (System-V AMD64 calling convention):
//   %rdi  = this pointer  (saved to %rbx @0xe4163e)
//   %esi  = pixelFormatType (unsigned int, saved to %r12d @0xe4163b)
//   %edx  = planeAlignment  (int,          saved to %r13d @0xe41638)
//   %ecx  = bytesPerRowAlignment (int,     stashed at -0x2c(%rbp) @0xe41635)
//   %r8b  = useIOSurface         (bool,    stashed at -0x30(%rbp) @0xe41631)
//
// Step 1 (@0xe41641..0xe41663): create an empty CFMutableDictionary
//   0xe41641  load _kCFAllocatorDefault  ; %r15 = *ptr
//   0xe4164b  load _kCFTypeDictionaryKeyCallBacks   ; arg3 = %rdx
//   0xe41652  load _kCFTypeDictionaryValueCallBacks ; arg4 = %rcx
//   0xe4165c  xorl %esi, %esi            ; arg2 = capacityHint = 0
//   0xe4165e  callq _CFDictionaryCreateMutable
//   0xe41663  movq  %rax, (%rbx)         ; this->dict = returned dict
//
// Step 2 (@0xe41666..0xe416a8): if pixelFormatType != 0, add it under
//                                _kCVPixelBufferPixelFormatTypeKey
//   0xe41666  testl %r12d, %r12d
//   0xe41669  je    0xe416a8             ; skip
//   0xe41672  spill pixelFormatType to -0x34(%rbp)
//   0xe41676  esi = 0x9 = kCFNumberIntType (see CoreFoundation/CFNumber.h)
//   0xe4167e  callq _CFNumberCreate      ; wraps the int as a CFNumberRef
//   0xe41683  testq %rax, %rax           ; skip if CFNumberCreate failed
//   0xe41686  je    0xe416a8
//   0xe41688  arg2 = *_kCVPixelBufferPixelFormatTypeKey
//   0xe4169b  callq _CFDictionaryAddValue(this->dict, kKey, numRef)
//   0xe416a3  callq _CFRelease(numRef)   ; the dict retained it; drop our ref
//
// Step 3 (@0xe416a8..0xe416eb): if planeAlignment >= 2, add it under
//                                _kCVPixelBufferPlaneAlignmentKey
//   0xe416a8  cmpl  $0x2, %r13d
//   0xe416..  jl    0xe416eb (implicit — the disasm continues with the
//                              standard CFNumberCreate/AddValue/Release cycle
//                              observed identically at @0xe416b5..0xe416e6)
//   0xe416cb  arg2 = *_kCVPixelBufferPlaneAlignmentKey
//   (same _CFNumberCreate → _CFDictionaryAddValue → _CFRelease sequence)
//
// Step 4 (@0xe416eb..0xe4172f): if bytesPerRowAlignment (at -0x2c(%rbp)) >= 2,
//                                add it under _kCVPixelBufferBytesPerRowAlignmentKey
//   0xe416eb  movl  -0x2c(%rbp), %eax
//   0xe416ee  cmpl  $0x2, %eax
//   0xe416f1  jl    0xe4172f
//   (same _CFNumberCreate → _CFDictionaryAddValue → _CFRelease sequence)
//   0xe4170f  arg2 = *_kCVPixelBufferBytesPerRowAlignmentKey
//
// Step 5 (@0xe4172f..0xe41749): if useIOSurface (at -0x30(%rbp)) != 0, add an
//                                EMPTY dictionary under
//                                _kCVPixelBufferIOSurfacePropertiesKey
//   0xe4172f  cmpb  $0x0, -0x30(%rbp)
//   0xe41733  je    0xe4174e
//   0xe41738  arg2 = *_kCVPixelBufferIOSurfacePropertiesKey
//   0xe41742  arg3 = ___NSDictionary0__struct   ; the shared empty CFDictionary
//   0xe41749  callq _CFDictionarySetValue(this->dict, kKey, emptyDict)
//
// Note the subtle Step-5 asymmetry: it calls `_CFDictionarySetValue`, not
// `_CFDictionaryAddValue`, and its value is a STATIC empty-dictionary constant
// (___NSDictionary0__struct) — so no CFRetain/CFRelease is needed. This is a
// small but faithful detail we preserve below.
//
// ─── D1 destructor @Flexo 0x0e03020 ───────────────────────────────────────────
//   __ZN24SetPixelBufferAttributesD1Ev:
//     0xe03020  pushq %rbp
//     0xe03021  movq  %rsp, %rbp
//     0xe03024  movq  (%rdi), %rdi          ; load this->dict
//     0xe03027  testq %rdi, %rdi            ; null?
//     0xe0302a  je    0xe03031              ; -> ret
//     0xe0302c  callq _CFRelease            ; drop our owning ref
//     0xe03031  popq  %rbp
//     0xe03032  retq
//     0xe03033  (landing pad: ___clang_call_terminate)
//
// ─── setIntAttribute @Flexo 0x0e41770 ─────────────────────────────────────────
//   __ZN24SetPixelBufferAttributes15setIntAttributeEPK10__CFStringi:
//     0xe41770  testq %rsi, %rsi          ; key == NULL?
//     0xe41773  je    0xe417c7            ; -> ret
//     0xe41783  movq  (%rdi), %r14        ; %r14 = this->dict
//     0xe41786  movl  %edx, -0x14(%rbp)   ; spill value
//     0xe41789  load  _kCFAllocatorDefault
//     0xe41793  arg3 = &value
//     0xe41797  esi = 0x9 = kCFNumberIntType
//     0xe4179c  callq _CFNumberCreate
//     0xe417a1  testq %rax, %rax          ; failed?
//     0xe417a4  je    0xe417bf
//     0xe417b2  callq _CFDictionaryAddValue(this->dict, key, numRef)
//     0xe417ba  callq _CFRelease(numRef)
//     0xe417c7  retq
//
// FRONTIER CALLEES (undecoded CoreFoundation entry points; the ported code
// dispatches to `CoreFoundation.*` shim functions defined below that THROW if
// the CF runtime isn't wired up):
//   0x1494794 (stub)  _CFDictionaryCreateMutable
//   0x149477c (stub)  _CFDictionaryAddValue
//   0x14947c4 (stub)  _CFDictionarySetValue
//   0x149480c (stub)  _CFNumberCreate
//   0x149484e (stub)  _CFRelease
//   _kCFAllocatorDefault, _kCFTypeDictionaryKeyCallBacks,
//   _kCFTypeDictionaryValueCallBacks, _kCVPixelBufferPixelFormatTypeKey,
//   _kCVPixelBufferPlaneAlignmentKey, _kCVPixelBufferBytesPerRowAlignmentKey,
//   _kCVPixelBufferIOSurfacePropertiesKey, ___NSDictionary0__struct
//     — RIP-relative loads at the addresses cited above; all live on the
//     CoreFoundation / CoreVideo dylibs Flexo links against.

/**
 * Opaque handle to a CFMutableDictionaryRef. In the raw-port layer we don't
 * pull in Objective-C runtime bindings; callers are expected to supply their
 * own bridge object with a `handle` for the underlying CF pointer.
 * @Flexo struct offset +0x0 on SetPixelBufferAttributes carries this pointer.
 */
export interface CFMutableDictionaryRef {
  /** Opaque CoreFoundation identity. Cited from the disasm as a raw pointer. */
  readonly __cfType: "CFMutableDictionary";
  handle: unknown;
}

/**
 * Opaque handle to a CFStringRef (const __CFString*). The setIntAttribute
 * key parameter type observed at @Flexo 0xe41770.
 */
export interface CFStringRef {
  readonly __cfType: "CFString";
  handle: unknown;
}

/**
 * Frontier: CoreFoundation function-table (the five CF entry points reached
 * from Flexo stubs at 0x1494794 / 0x149477c / 0x14947c4 / 0x149480c /
 * 0x149484e). The TS port has no CoreFoundation runtime available; every
 * method THROWS to make the missing bridge an explicit demand signal instead
 * of a silent no-op. Any real embedding must inject a working implementation
 * via `installCoreFoundationBridge()`.
 */
export interface CoreFoundationBridge {
  /** @Flexo stub 0x1494794 — _CFDictionaryCreateMutable */
  createMutableDictionary(): CFMutableDictionaryRef;
  /** @Flexo stub 0x149477c — _CFDictionaryAddValue */
  dictionaryAddValue(
    dict: CFMutableDictionaryRef,
    key: unknown,
    value: unknown,
  ): void;
  /** @Flexo stub 0x14947c4 — _CFDictionarySetValue */
  dictionarySetValue(
    dict: CFMutableDictionaryRef,
    key: unknown,
    value: unknown,
  ): void;
  /** @Flexo stub 0x149480c — _CFNumberCreate (type = kCFNumberIntType = 0x9) */
  numberCreateInt(value: number): unknown | null;
  /** @Flexo stub 0x149484e — _CFRelease */
  release(cfObject: unknown): void;
  /** RIP-relative load @0xe41688 — _kCVPixelBufferPixelFormatTypeKey */
  readonly kCVPixelBufferPixelFormatTypeKey: unknown;
  /** RIP-relative load @0xe416cb — _kCVPixelBufferPlaneAlignmentKey */
  readonly kCVPixelBufferPlaneAlignmentKey: unknown;
  /** RIP-relative load @0xe4170f — _kCVPixelBufferBytesPerRowAlignmentKey */
  readonly kCVPixelBufferBytesPerRowAlignmentKey: unknown;
  /** RIP-relative load @0xe41738 — _kCVPixelBufferIOSurfacePropertiesKey */
  readonly kCVPixelBufferIOSurfacePropertiesKey: unknown;
  /** RIP-relative load @0xe41742 — ___NSDictionary0__struct (shared empty dict) */
  readonly emptyDictionary: unknown;
}

let _cfBridge: CoreFoundationBridge | null = null;

/**
 * Install the CoreFoundation bridge. Must be called before constructing a
 * SetPixelBufferAttributes; otherwise the constructor throws when reaching
 * the _CFDictionaryCreateMutable frontier stub @Flexo 0xe4165e.
 */
export function installCoreFoundationBridge(bridge: CoreFoundationBridge): void {
  _cfBridge = bridge;
}

function cf(): CoreFoundationBridge {
  if (_cfBridge === null) {
    // The class body cannot advance without a CoreFoundation bridge; every
    // Flexo stub cited above must resolve to a real CF runtime symbol.
    throw new Error(
      "CoreFoundationBridge not installed — SetPixelBufferAttributes reaches " +
        "CF frontier stubs at @Flexo 0x1494794/0x149477c/0x14947c4/0x149480c/0x149484e; " +
        "call installCoreFoundationBridge() first.",
    );
  }
  return _cfBridge;
}

/**
 * SetPixelBufferAttributes — the Flexo helper class that assembles a
 * CVPixelBuffer-attributes dictionary from four scalar inputs.
 *
 * @Flexo symbols owned by this class:
 *   C1                @0xe41760   (thin trampoline into C2)
 *   C2                @0xe41620   (real ctor body — 93 disasm lines)
 *   ~D1               @0xe03020   (12 disasm lines)
 *   setIntAttribute   @0xe41770   (31 disasm lines)
 */
export class SetPixelBufferAttributes {
  /**
   * The owning CFMutableDictionaryRef. Sits at struct offset +0x0 in the
   * Flexo layout (`movq %rax, (%rbx)` @0xe41663 and `movq (%rdi), %rdi`
   * @0xe03024 both key on offset 0).
   */
  dict: CFMutableDictionaryRef | null = null;

  /**
   * SetPixelBufferAttributes(unsigned int pixelFormatType, int planeAlignment,
   *                          int bytesPerRowAlignment, bool useIOSurface).
   *
   * @Flexo 0xe41620 (C2, base-object ctor). The exported C1 @0xe41760 is a
   * 5-byte thin `jmp C2` trampoline.
   *
   * Faithful control-flow (five steps mirroring the disasm):
   *   1. Create an empty CFMutableDictionary @0xe41641..0xe41663.
   *   2. If `pixelFormatType != 0`, add it as an int under
   *      _kCVPixelBufferPixelFormatTypeKey  @0xe41666..0xe416a8.
   *   3. If `planeAlignment >= 2`, add it as an int under
   *      _kCVPixelBufferPlaneAlignmentKey   @0xe416a8..0xe416eb.
   *   4. If `bytesPerRowAlignment >= 2`, add it as an int under
   *      _kCVPixelBufferBytesPerRowAlignmentKey  @0xe416eb..0xe4172f.
   *   5. If `useIOSurface != 0`, SET (not add) the shared empty dict under
   *      _kCVPixelBufferIOSurfacePropertiesKey   @0xe4172f..0xe4174e.
   *
   * Step 5 uses `_CFDictionarySetValue` (@Flexo 0x14947c4) instead of
   * `_CFDictionaryAddValue` (@Flexo 0x149477c), and the value is a static
   * empty-dictionary constant (___NSDictionary0__struct) so no CFRetain /
   * CFRelease pair is emitted. Faithfully preserved.
   */
  constructor(
    pixelFormatType: number,
    planeAlignment: number,
    bytesPerRowAlignment: number,
    useIOSurface: boolean,
  ) {
    const b = cf();

    // Step 1 @0xe41641..0xe41663
    this.dict = b.createMutableDictionary();

    // Step 2 @0xe41666..0xe416a8 — pixelFormatType != 0
    if ((pixelFormatType | 0) !== 0) {
      // `testl %r12d, %r12d ; je 0xe416a8` — treat as unsigned int compare.
      const num = b.numberCreateInt(pixelFormatType >>> 0);
      if (num !== null) {
        // @0xe41688 arg2 = *_kCVPixelBufferPixelFormatTypeKey
        b.dictionaryAddValue(this.dict, b.kCVPixelBufferPixelFormatTypeKey, num);
        // @0xe416a3 _CFRelease — the dict retained; drop our ref.
        b.release(num);
      }
    }

    // Step 3 @0xe416a8..0xe416eb — planeAlignment >= 2 (signed compare)
    // `cmpl $0x2, %r13d ; jl 0xe416eb`
    if ((planeAlignment | 0) >= 2) {
      const num = b.numberCreateInt(planeAlignment | 0);
      if (num !== null) {
        // @0xe416cb arg2 = *_kCVPixelBufferPlaneAlignmentKey
        b.dictionaryAddValue(this.dict, b.kCVPixelBufferPlaneAlignmentKey, num);
        // @0xe416e6 _CFRelease
        b.release(num);
      }
    }

    // Step 4 @0xe416eb..0xe4172f — bytesPerRowAlignment >= 2 (signed compare)
    // `movl -0x2c(%rbp), %eax ; cmpl $0x2, %eax ; jl 0xe4172f`
    if ((bytesPerRowAlignment | 0) >= 2) {
      const num = b.numberCreateInt(bytesPerRowAlignment | 0);
      if (num !== null) {
        // @0xe4170f arg2 = *_kCVPixelBufferBytesPerRowAlignmentKey
        b.dictionaryAddValue(
          this.dict,
          b.kCVPixelBufferBytesPerRowAlignmentKey,
          num,
        );
        // @0xe4172a _CFRelease
        b.release(num);
      }
    }

    // Step 5 @0xe4172f..0xe4174e — useIOSurface
    // `cmpb $0x0, -0x30(%rbp) ; je 0xe4174e`
    if (useIOSurface) {
      // @0xe41738 arg2 = *_kCVPixelBufferIOSurfacePropertiesKey
      // @0xe41742 arg3 = ___NSDictionary0__struct (static empty dict — no CFRetain)
      // @0xe41749 _CFDictionarySetValue (SET, not ADD; no CFRelease follows)
      b.dictionarySetValue(
        this.dict,
        b.kCVPixelBufferIOSurfacePropertiesKey,
        b.emptyDictionary,
      );
    }
  }

  /**
   * ~SetPixelBufferAttributes()
   * @Flexo 0xe03020 (D1). Release the owning CFMutableDictionaryRef if any.
   *
   *   0xe03024  movq  (%rdi), %rdi
   *   0xe03027  testq %rdi, %rdi
   *   0xe0302a  je    0xe03031
   *   0xe0302c  callq _CFRelease
   */
  destroy(): void {
    // @0xe03024..0xe03027 load+null-check
    if (this.dict === null) return;
    // @0xe0302c _CFRelease
    cf().release(this.dict);
    // Mirror the observed lifetime: the field is not re-nulled by the disasm
    // (the object is dead after D1 anyway), but we clear it defensively so a
    // double-destroy doesn't double-release under a hostile mock bridge.
    this.dict = null;
  }

  /**
   * setIntAttribute(const __CFString* key, int value)
   * @Flexo 0xe41770.
   *
   *   0xe41770  testq %rsi, %rsi                ; key == null? -> return
   *   0xe41783  movq  (%rdi), %r14              ; %r14 = this->dict
   *   0xe4179c  callq _CFNumberCreate(kCFNumberIntType=0x9, &value)
   *   0xe417a1  testq %rax, %rax                ; failed? -> skip add+release
   *   0xe417b2  callq _CFDictionaryAddValue(this->dict, key, numRef)
   *   0xe417ba  callq _CFRelease(numRef)
   */
  setIntAttribute(key: CFStringRef | null, value: number): void {
    // @0xe41770..0xe41773: null-key early return
    if (key === null) return;
    // @0xe41783: load this->dict. If the dict was never created (dtor'd?),
    // the disasm would still deref +0x0 and pass whatever is there; we treat
    // a null dict as an implicit no-op to avoid a bogus AddValue call.
    if (this.dict === null) return;

    const b = cf();
    // @0xe4179c _CFNumberCreate(kCFAllocatorDefault, kCFNumberIntType=0x9, &value)
    const num = b.numberCreateInt(value | 0);
    // @0xe417a1: skip if _CFNumberCreate returned null
    if (num === null) return;
    // @0xe417b2 _CFDictionaryAddValue(this->dict, key, numRef)
    b.dictionaryAddValue(this.dict, key, num);
    // @0xe417ba _CFRelease(numRef)
    b.release(num);
  }
}

