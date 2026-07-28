# Harness cluster — the shared subsystems that unblock the "heavies"

The class queue stalls because ~5,000 leaves are ObjC-facade / std-container / threadgroup-barrier
code that individual queue-pull workers can't port in isolation. Three shared harnesses fix that.
Each is a small, decode-backed TS module that the heavies IMPORT instead of re-stubbing. Once a
harness lands, the classes that depend on it become ordinary ports.

## H1 — ObjC runtime harness  → raw-port/src/harness/ObjC.ts
Faithful model of the Darwin ObjC dispatch the facades use. Decode + implement:
  - objc_msgSend / objc_msgSendSuper dispatch as a TS method-table call (selector string -> fn).
  - objc_retain/release/autorelease/alloc as refcount ops on a plain object (single-threaded JS:
    faithful because retain/release are balanced; model the count field literally).
  - Selector resolution: otool mislabels every objc_msgSend with a stock phantom selector — the REAL
    selector is the __objc_selrefs slot at the call-site RIP displacement -> __objc_methname cstring
    (VA+0x4000 on the x86_64 slice). Provide a helper `selectorAt(fw, callSiteVA)` documenting the
    recovery so facade ports cite the real selector.
  - A registry so an ObjC class port registers its selector->method map; msgSend looks it up.
  - CoreFoundation refcount: CFRetain/CFRelease/CFAutorelease behave exactly like objc_retain/release
    on a toll-free-bridged object — model them with the SAME refcount ops (worker-131 hit these on
    FFPMRInstrument's NSAutoreleasePool create/deletePool). Include them in H1.
This unblocks: FFProviderPSDAssistant, OZ*Undo Cocoa epilogues, device arbiters, the 66K Flexo ObjC.

## H2 — std container harness → raw-port/src/harness/StdContainers.ts
Faithful TS ports of the libc++ containers the heavies inline. Decode from the actual libc++ layout:
  - std::vector<T>: begin/end/cap pointers, push_back w/ geometric realloc, __emplace_back_slow_path.
  - std::__shared_weak_count / shared_ptr control block: __on_zero_shared vtable slot +0x10,
    add_shared/release_shared/weak_release (worker-100/112 already duplicated this 3×; consolidate).
  - std::list splice/erase (ClusteredPaddingPolicy LRU), std::map/__tree red-black walk (OZFontCollection).
This unblocks: HGPool, OZFontCollection, OZChannelUndo Swap vector-walks, every OZ* MI dtor.

## H3 — threadgroup-barrier reduction harness → raw-port/src/harness/ThreadgroupReduction.ts
A CPU model of Metal compute reductions so the air.wg.barrier shaders become portable:
  - threadgroup shared memory = a JS typed array indexed by thread-in-group.
  - air.wg.barrier = a phase boundary: run all threads' pre-barrier code, then all post-barrier code
    (the harness drives the two-phase loop; the shader body is written as phase functions).
  - Model thread_position_in_threadgroup / threadgroup_position_in_grid literally.
This unblocks: bm3dnr_buf haar8x8/mcBuf/noiseStats/variance, soMOMotionEstimation reduction*,
soOFlowEstimator estimateCLG — the whole >500-line barrier family (~30+ shaders).

RULES: decode-backed (@0xADDR / %IR cites), gate PASS, ONE file each, faithful (no guessing). After a
harness lands, note in AUDIT which heavy families are now unblocked so queue-pull workers pick them up.
