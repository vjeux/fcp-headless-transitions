/**
 * HGSystem — a thin C++ facade over -[NSProcessInfo processInfo] queries.
 *
 * Transcribed from Helium.framework (macOS x86_64). All five methods are static/free-
 * function-style utilities: they take no `this` (no non-static state, no vtable), just
 * forward to NSProcessInfo and return the value. In this raw-port they become module-level
 * functions grouped on a namespace-style object so callers can write `HGSystem.OSVersion(...)`
 * mirroring the C++ `HGSystem::OSVersion(...)` call sites.
 *
 * Because there is no Objective-C runtime available from TypeScript, this port models the
 * exact contract of the native calls via a host-installed bridge:
 *   setHGSystemProcessInfoBridge({...})
 * The default bridge raises — silently returning fake OS version / CPU / RAM values would
 * mis-model observable behaviour every caller depends on (feature gating, tile sizing,
 * threadpool sizing, memory budgeting).
 *
 * @classAddr Helium @0x00000000000da040 .. @0x00000000000da232
 */

/**
 * Native `NSOperatingSystemVersion` — three NSInteger (int64 on 64-bit) fields:
 *   { NSInteger majorVersion; NSInteger minorVersion; NSInteger patchVersion; }
 * The FCP call site only reads the LOW 32 bits of each into `int` out-params
 * (movl -0x30(%rbp),%edx @0xda082 / -0x28 @0xda085 / -0x20 @0xda088), so we type
 * them as `number` and require the bridge to hand back 32-bit-safe values.
 * @structRef Helium @0xda07d objc_msgSend_stret struct-return of `operatingSystemVersion`.
 */
export interface NSOperatingSystemVersionLike {
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
}

/**
 * Host bridge for -[NSProcessInfo processInfo] and the four selectors HGSystem sends to it.
 *
 * The four selectors, in native asm order:
 *   - operatingSystemVersion        (stret struct)   @0xda06f selref, @0xda07d msgSend_stret
 *   - operatingSystemVersionString  (NSString *)      @0xda0d9 selref
 *   - processorCount                (NSUInteger)      @0xda19d selref
 *   - activeProcessorCount          (NSUInteger)      @0xda1dd selref
 *   - physicalMemory                (unsigned long long) @0xda21d selref
 *
 * The native `+[NSProcessInfo processInfo]` singleton is fetched fresh at every call — the
 * asm does not cache it — so the bridge is free to memoise or not; either is faithful.
 * The `getProcessInfo()` field exists so the bridge can hand back a nil-safe object (the
 * OSVersion path branches on nil at @0xda06a; see below).
 */
export interface HGSystemProcessInfoBridge {
  /**
   * Mirrors -[NSProcessInfo operatingSystemVersion].
   * If the underlying `+[NSProcessInfo processInfo]` returned nil, native returns
   *   (major=0, minor=0, patch=0)  — see the `je 0xda08d ; xorl %eax,%eax ; xorl %ecx,%ecx ;
   *   xorl %edx,%edx` fall-through at @0xda06d .. @0xda091. Bridges that cannot fail
   *   should return the real triple; bridges without an OS should return {0,0,0}.
   */
  operatingSystemVersion(): NSOperatingSystemVersionLike;

  /**
   * Mirrors [[NSProcessInfo processInfo] operatingSystemVersionString] then -UTF8String.
   * Returns the raw UTF-8 bytes as a JS string. In native this becomes a std::string
   * constructed from the C string; here we return the string itself (the SSO/heap split
   * @0xda107 .. @0xda160 is an internal std::string layout detail — a length ≥ 0x17 (23)
   * triggers heap allocation via operator new @0xda13c, else it uses the 22-byte SSO buffer
   * and stores `len<<1` in the low byte @0xda10d..@0xda111 — that packing is std::__1
   * string internals and has NO observable JS analog).
   */
  operatingSystemVersionString(): string;

  /**
   * Mirrors -[NSProcessInfo processorCount].
   * @selRef Helium @0xda19d
   */
  processorCount(): number;

  /**
   * Mirrors -[NSProcessInfo activeProcessorCount].
   * @selRef Helium @0xda1dd
   */
  activeProcessorCount(): number;

  /**
   * Mirrors -[NSProcessInfo physicalMemory] — returns bytes as an unsigned 64-bit value.
   * We type as `bigint` because typical machines have >= 4 GiB, exceeding the safe-integer
   * range in some edge cases (128+ GiB Mac Pros are past Number.MAX_SAFE_INTEGER only
   * beyond 8 PiB, but bigint is the type-correct choice for `unsigned long long`).
   * @selRef Helium @0xda21d
   */
  physicalMemory(): bigint;
}

let g_bridge: HGSystemProcessInfoBridge = {
  operatingSystemVersion(): NSOperatingSystemVersionLike {
    throw new Error(
      "HGSystem.OSVersion: no NSProcessInfo bridge installed — native @0xda056 loads " +
        "_OBJC_CLASS_$_NSProcessInfo and calls +processInfo @0xda064, then " +
        "-operatingSystemVersion (stret) @0xda07d. Call setHGSystemProcessInfoBridge() first."
    );
  },
  operatingSystemVersionString(): string {
    throw new Error(
      "HGSystem.OSVersionString: no NSProcessInfo bridge installed — native @0xda0c1 " +
        "loads _OBJC_CLASS_$_NSProcessInfo, calls +processInfo @0xda0d6, " +
        "-operatingSystemVersionString @0xda0e3, then -UTF8String @0xda0f0. " +
        "Call setHGSystemProcessInfoBridge() first."
    );
  },
  processorCount(): number {
    throw new Error(
      "HGSystem.ProcessorCount: no NSProcessInfo bridge installed — native @0xda186 loads " +
        "_OBJC_CLASS_$_NSProcessInfo, +processInfo @0xda19b, then -processorCount @0xda1b0 " +
        "(tail-call). Call setHGSystemProcessInfoBridge() first."
    );
  },
  activeProcessorCount(): number {
    throw new Error(
      "HGSystem.ActiveProcessorCount: no NSProcessInfo bridge installed — native @0xda1c6 " +
        "loads _OBJC_CLASS_$_NSProcessInfo, +processInfo @0xda1db, -activeProcessorCount " +
        "@0xda1f0 (tail-call). Call setHGSystemProcessInfoBridge() first."
    );
  },
  physicalMemory(): bigint {
    throw new Error(
      "HGSystem.PhysicalMemory: no NSProcessInfo bridge installed — native @0xda206 loads " +
        "_OBJC_CLASS_$_NSProcessInfo, +processInfo @0xda21b, -physicalMemory @0xda230 " +
        "(tail-call). Call setHGSystemProcessInfoBridge() first."
    );
  },
};

/**
 * Install a host-provided NSProcessInfo bridge. Every HGSystem.* call then routes through
 * these five methods rather than raising.
 */
export function setHGSystemProcessInfoBridge(b: HGSystemProcessInfoBridge): void {
  g_bridge = b;
}

/**
 * HGSystem — grouped like a C++ namespace of static free functions.
 *
 * The native symbols are demangled as `HGSystem::OSVersion(int*, int*, int*)`,
 * `HGSystem::OSVersionString()`, `HGSystem::ProcessorCount()`,
 * `HGSystem::ActiveProcessorCount()`, `HGSystem::PhysicalMemory()`. None take an implicit
 * `this` (there are no non-static members in this class), so this is a pure-utility
 * namespace, modelled here as an object literal of functions.
 */
export const HGSystem = {
  /**
   * HGSystem::OSVersion(int* outMajor, int* outMinor, int* outPatch) — @0xda040.
   *
   * Native flow:
   *   0xda040-0xda053  prologue; move outMajor→r15, outMinor→r14, outPatch→rbx
   *   0xda056          load  _OBJC_CLASS_$_NSProcessInfo   (Objc classref @0x981673 rip-rel)
   *   0xda05d          load  @selector(processInfo)         (Objc selref  @0x980d64 rip-rel)
   *   0xda064          call *_objc_msgSend                  (Objc message @0x92814e rip-rel)
   *   0xda06a-0xda06d  testq %rax,%rax ; je 0xda08d          — nil-check the singleton
   *   0xda06f          load  @selector(operatingSystemVersion)
   *   0xda076          leaq  -0x30(%rbp),%rdi                — stret out buffer (3× NSInteger)
   *   0xda07a          mov   %rax,%rsi ; call _objc_msgSend_stret @0x3c549e
   *   0xda082-0xda088  load  low-32 of the three fields into edx,ecx,eax
   *   0xda08b          jmp   0xda093                          — join with the nil branch
   *   0xda08d-0xda091  nil branch: xor eax,ecx,edx  → all-zero triple
   *   0xda093-0xda099  store  edx→(%r15), ecx→(%r14), eax→(%rbx)  — write back to callers
   *   0xda09b-0xda0a5  epilogue
   *
   * We expose the same 3-int32 out-parameter shape by returning an object; callers
   * project the fields where they need them. The nil branch is preserved: if the bridge
   * reports the process info as absent (getProcessInfo returns null in the interface
   * contract), the nil-branch zero-triple is emitted verbatim; but because our
   * `operatingSystemVersion()` bridge method already models the composite call, the nil
   * check collapses into whatever the bridge decides — a bridge that has no OS should
   * itself return {0,0,0} to reproduce @0xda08d..@0xda091.
   *
   * @methodAddr Helium @0x00000000000da040
   */
  OSVersion(): { major: number; minor: number; patch: number } {
    // objc_msgSend_stret([NSProcessInfo processInfo], @selector(operatingSystemVersion))
    //   — @0xda064 (processInfo), @0xda07d (operatingSystemVersion stret)
    // The bridge is responsible for reproducing the nil-branch zero-triple @0xda08d
    // when +processInfo would have returned nil in native.
    const v = g_bridge.operatingSystemVersion();
    // movl -0x30(%rbp),%edx / -0x28(%rbp),%ecx / -0x20(%rbp),%eax @0xda082/0xda085/0xda088
    // — these are the LOW 32 bits of each NSInteger. The bridge already returns `number`
    // so no truncation is applied here; the interface docs require 32-bit-safe values.
    return {
      major: v.majorVersion,
      minor: v.minorVersion,
      patch: v.patchVersion,
    };
  },

  /**
   * HGSystem::OSVersionString() — @0xda0b0. Returns a std::string of the UTF-8 rendering
   * of -[NSProcessInfo operatingSystemVersionString].
   *
   * Native flow:
   *   0xda0b0-0xda0be  prologue; save rdi (= out `std::string* result`) into rbx
   *   0xda0c1          load  _OBJC_CLASS_$_NSProcessInfo
   *   0xda0c8          load  @selector(processInfo)
   *   0xda0cf          cache _objc_msgSend addr in r14
   *   0xda0d6          call *r14                                   ; +processInfo
   *   0xda0d9          load  @selector(operatingSystemVersionString)
   *   0xda0e3          call *r14                                   ; -operatingSystemVersionString
   *   0xda0e6          load  @selector(UTF8String)
   *   0xda0f0          call *r14                                   ; -UTF8String   → const char*
   *   0xda0f3-0xda0f9  r15 = c-string ; call _strlen                 ; len in %rax
   *   0xda0fe          cmpq $-0x9,%rax ; jae throw_length_error      ; std::string cap check
   *   0xda104-0xda15b  std::__1::basic_string ctor:
   *     - SSO path (len < 0x17):  movb (len<<1),(%rbx) ; buffer at %rbx+1
   *     - heap path (len ≥ 0x17): __Znwm alloc (cap or'd with 7, +1) ; store {size,cap,ptr}
   *     - memmove(buf, c-str, len)
   *   0xda160          buf[len] = 0
   *   0xda165-0xda176  epilogue; return %rbx (the std::string result)
   *   0xda177          length-error path — std::__1::__throw_length_error
   *
   * The std::string SSO/heap split is a native-ABI detail invisible from JS. We collapse
   * it to `string`. We do preserve the length-error contract: JS strings have an implementation-
   * defined maximum length; if the bridge returns something absurd we let the natural TS/JS
   * length limit raise. (In practice `operatingSystemVersionString` is like "Version 14.5.1"
   * — well under any limit.)
   *
   * @methodAddr Helium @0x00000000000da0b0
   */
  OSVersionString(): string {
    // Composite of +processInfo (@0xda0d6) → -operatingSystemVersionString (@0xda0e3)
    // → -UTF8String (@0xda0f0). The bridge folds all three into one JS-native call.
    return g_bridge.operatingSystemVersionString();
  },

  /**
   * HGSystem::ProcessorCount() — @0xda180. Tail-calls -[NSProcessInfo processorCount].
   *
   * Native flow (17 lines):
   *   0xda180-0xda185  prologue
   *   0xda186          load  _OBJC_CLASS_$_NSProcessInfo
   *   0xda18d          load  @selector(processInfo)
   *   0xda194          cache _objc_msgSend addr in rbx
   *   0xda19b          call *rbx                                   ; +processInfo
   *   0xda19d          load  @selector(processorCount)
   *   0xda1a4          mov   %rax,%rdi
   *   0xda1a7-0xda1af  restore rbx/rbp
   *   0xda1b0          jmpq  *rax   (tail-call through cached _objc_msgSend)
   *
   * The `NSUInteger` return type is 64-bit on x86_64; return value comes back in %rax
   * from the tail-called msgSend. We type it as `number` because processor counts on any
   * real Mac are well within safe-integer range.
   *
   * @methodAddr Helium @0x00000000000da180
   */
  ProcessorCount(): number {
    return g_bridge.processorCount();
  },

  /**
   * HGSystem::ActiveProcessorCount() — @0xda1c0. Byte-identical to ProcessorCount except
   * the second selref is @selector(activeProcessorCount) @0xda1dd instead of processorCount.
   *
   * @methodAddr Helium @0x00000000000da1c0
   */
  ActiveProcessorCount(): number {
    return g_bridge.activeProcessorCount();
  },

  /**
   * HGSystem::PhysicalMemory() — @0xda200. Byte-identical shape to Processor{,Active}Count
   * except:
   *   - the selector is @selector(physicalMemory) @0xda21d
   *   - the return is `unsigned long long` (64-bit RAM in bytes), not NSUInteger-cast-to-int
   *
   * Native flow (17 lines):
   *   0xda200-0xda205  prologue
   *   0xda206          load  _OBJC_CLASS_$_NSProcessInfo
   *   0xda20d          load  @selector(processInfo)
   *   0xda214          cache _objc_msgSend addr in rbx
   *   0xda21b          call *rbx                                   ; +processInfo
   *   0xda21d          load  @selector(physicalMemory)
   *   0xda224          mov   %rax,%rdi
   *   0xda227-0xda22f  restore rbx/rbp
   *   0xda230          jmpq  *rax                                    ; tail-call -physicalMemory
   *
   * We type the return as `bigint` to be `unsigned long long`-faithful — see the interface
   * docs above.
   *
   * @methodAddr Helium @0x00000000000da200
   */
  PhysicalMemory(): bigint {
    return g_bridge.physicalMemory();
  },
};
