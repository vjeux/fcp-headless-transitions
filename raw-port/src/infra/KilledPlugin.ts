// KilledPlugin — Ozone-side utility class exposing a single static helper for comparing two
// CFUUIDs by their textual form (case-insensitive).  Used by FCP's "killed plugin" registry
// bookkeeping: when a plugin is disabled or fails to load, its UUID is recorded and later
// look-ups compare against that list via this helper.
//
// Framework: Ozone  (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework)
// x86_64 slice; VAs below are unadjusted VM addresses from `otool -tV`.
//
// SYMBOLS (from nm | c++filt | grep KilledPlugin):
//   0x000000000050c530  KilledPlugin::compareUUIDs(__CFUUID const*, __CFUUID const*)
//                       [__ZN12KilledPlugin12compareUUIDsEPK8__CFUUIDS2_]
//
// This is the only Ozone-side method exposed by KilledPlugin; the class ships as a `T`
// symbol here with no other exports — no ctors/dtors/vtable are emitted, consistent with a
// class holding only free/static helpers.
//
// The function has no fanout to any raw-port class; the only externals it touches are
// CoreFoundation:
//   _kCFAllocatorDefault  (RIP-relative literal-pool load @0x50c540)
//   _CFUUIDCreateString   (symbol stub @0x6dc8ca; called @0x50c54d & @0x50c55b)
//   _CFStringCompare      (symbol stub @0x6dc85e; called @0x50c56e)
//   _CFRelease            (symbol stub @0x6dc810; called @0x50c579 & @0x50c581)
//
// The %edx=0x1 immediately before the CFStringCompare call (@0x50c563) is the options mask
// passed as the third argument: `kCFCompareCaseInsensitive = 1` per CoreFoundation's
// CFStringCompareFlags enum (Apple public API header CFString.h). No other CFCompare flag
// has value 1, so this literal is decoded, not invented.

/**
 * CFComparisonResult mirrors CoreFoundation's public enum
 *   kCFCompareLessThan   = -1
 *   kCFCompareEqualTo    =  0
 *   kCFCompareGreaterThan=  1
 * The @0x50c56e call returns a CFIndex-shaped comparison result which is one of these
 * three values; the ported function forwards it verbatim.
 */
export type CFComparisonResult = -1 | 0 | 1;

/**
 * A stand-in for the CoreFoundation opaque `__CFUUID*` pointer type.  This port does not
 * decode CFUUID's internal 16-byte state (that lives in CoreFoundation and is out of scope
 * for the raw-port); callers pass whatever opaque handle their JS-side CF shim uses.
 */
export type CFUUIDRef = object;

/**
 * A stand-in for the CoreFoundation opaque `CFStringRef` (i.e. `__CFString*`).
 */
export type CFStringRef = object;

/**
 * The tiny CoreFoundation surface this function needs.  Callers wire real implementations
 * (either via a JS reimplementation of CFUUID/CFString or via a native bridge).  Every
 * field name matches the underlying CF symbol resolved from the disasm; the argument order
 * matches Apple's public CoreFoundation headers exactly (CFUUID.h / CFString.h).
 */
export interface KilledPluginCF {
  /**
   * kCFAllocatorDefault — the CFAllocatorRef used for allocation.  In the binary this is
   * a RIP-relative literal-pool load (@Ozone 0x50c540) followed by a de-reference
   * (@0x50c547 `movq (%rax), %r14`) — i.e. the exported global's *value*, not its
   * address.  Callers pass whatever their CF layer treats as the default allocator.
   */
  kCFAllocatorDefault: object;

  /**
   * CFUUIDCreateString(alloc, uuid) — creates a CFString containing the canonical
   * (`XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`) textual form of `uuid`.  Returns a
   * +1-retained CFStringRef the caller must release.  Symbol stub @Ozone 0x6dc8ca.
   */
  CFUUIDCreateString(alloc: object, uuid: CFUUIDRef): CFStringRef;

  /**
   * CFStringCompare(s1, s2, options) — compares two CFStrings and returns a
   * CFComparisonResult.  Symbol stub @Ozone 0x6dc85e.  Called with options=1
   * (kCFCompareCaseInsensitive) per @0x50c563.
   */
  CFStringCompare(s1: CFStringRef, s2: CFStringRef, options: number): CFComparisonResult;

  /**
   * CFRelease(obj) — decrements the CF retain count.  Symbol stub @Ozone 0x6dc810.
   */
  CFRelease(obj: object): void;
}

/**
 * KilledPlugin — see file header.  All members are `static`.
 */
export class KilledPlugin {
  /**
   * KilledPlugin::compareUUIDs(__CFUUID const*, __CFUUID const*)
   *   @Ozone 0x000000000050c530  [__ZN12KilledPlugin12compareUUIDsEPK8__CFUUIDS2_]
   *
   * FAITHFUL TRANSCRIPTION of the 34-instruction disasm at
   * raw-port/re/disasm/KilledPlugin.compareUUIDs.s :
   *
   *   0x50c530  push rbp / mov rbp,rsp                              ; prologue
   *   0x50c534  push r15 / push r14 / push rbx / push rax           ; 16-byte align
   *   0x50c53a  mov rbx, rsi                                         ; rbx = uuid2
   *   0x50c53d  mov rsi, rdi                                         ; rsi = uuid1 (arg2 for CFUUIDCreateString)
   *   0x50c540  mov rax, [rip + _kCFAllocatorDefault_ptr]            ; RIP-relative literal
   *   0x50c547  mov r14, [rax]                                       ; r14 = *kCFAllocatorDefault
   *   0x50c54a  mov rdi, r14                                         ; rdi = alloc
   *   0x50c54d  call _CFUUIDCreateString                             ; s1 = CFUUIDCreateString(alloc, uuid1)
   *   0x50c552  mov r15, rax                                         ; r15 = s1
   *   0x50c555  mov rdi, r14 / mov rsi, rbx                          ; args = (alloc, uuid2)
   *   0x50c55b  call _CFUUIDCreateString                             ; s2 = CFUUIDCreateString(alloc, uuid2)
   *   0x50c560  mov rbx, rax                                         ; rbx = s2
   *   0x50c563  mov edx, 0x1                                         ; options = kCFCompareCaseInsensitive
   *   0x50c568  mov rdi, r15                                         ; arg1 = s1
   *   0x50c56b  mov rsi, rax                                         ; arg2 = s2
   *   0x50c56e  call _CFStringCompare                                ; r14 = CFStringCompare(s1, s2, 1)
   *   0x50c573  mov r14, rax
   *   0x50c576  mov rdi, r15 / call _CFRelease                       ; CFRelease(s1)
   *   0x50c57e  mov rdi, rbx / call _CFRelease                       ; CFRelease(s2)
   *   0x50c586  mov rax, r14                                         ; return the comparison result
   *   0x50c589..0x50c593  epilogue + retq
   *
   * SEMANTICS: turn each CFUUID into its canonical hyphenated textual form, compare
   * the two strings case-insensitively, and return the CFComparisonResult (-1/0/1).
   * The two CFStrings are +1-retained by CFUUIDCreateString and are released before
   * returning; the CFComparisonResult is a value type so ownership isn't a concern.
   *
   * Note the code path has NO branches — it's a straight-line sequence of five CF
   * calls plus register shuffles.  The port therefore has NO if/else either.
   *
   * The two `CFRelease` calls preserve the CFComparisonResult in %r14 across them
   * (r14 is callee-saved in the System V AMD64 ABI); the port likewise stashes the
   * result in a local before releasing so a hypothetical throwing release would not
   * clobber it (in this JS port the "releases" are no-ops if callers wire a JS
   * CFString shim).
   */
  static compareUUIDs(
    cf: KilledPluginCF,
    uuid1: CFUUIDRef,
    uuid2: CFUUIDRef,
  ): CFComparisonResult {
    // @0x50c540..0x50c547 : load the CFAllocatorDefault value.
    const alloc = cf.kCFAllocatorDefault;
    // @0x50c54d : s1 = CFUUIDCreateString(alloc, uuid1).
    const s1 = cf.CFUUIDCreateString(alloc, uuid1);
    // @0x50c55b : s2 = CFUUIDCreateString(alloc, uuid2).
    const s2 = cf.CFUUIDCreateString(alloc, uuid2);
    // @0x50c563 : options = 0x1 = kCFCompareCaseInsensitive.
    // @0x50c56e : result = CFStringCompare(s1, s2, 1).
    const result = cf.CFStringCompare(s1, s2, 1);
    // @0x50c579 : CFRelease(s1).
    cf.CFRelease(s1);
    // @0x50c581 : CFRelease(s2).
    cf.CFRelease(s2);
    // @0x50c586 : return the saved comparison result.
    return result;
  }
}
