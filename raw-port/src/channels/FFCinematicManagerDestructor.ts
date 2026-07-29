// raw-port/src/channels/FFCinematicManagerDestructor.ts
//
// FCP `FFCinematicManagerDestructor` — a Flexo helper whose sole exported
// member is a D1 destructor emitted by the compiler for a static object
// that owns the process-wide `sDefaultCinematicManager` ObjC singleton.
// When the FCP process exits (Mach-O `__mod_term_func`) the destructor
// releases the retained ObjC object and NULLs the static slot, guaranteeing
// no leak on shutdown even though the manager was retained at first-access
// via a `dispatch_once` (or similar) init pattern elsewhere.
//
// Framework: Flexo
//
// Provenance (1 symbol):
//   ~FFCinematicManagerDestructor() [D1]  @0x38acc0
//
// EXTERNAL FUNCTIONS REFERENCED (boundary throw-stubs — cite the addr):
//   * objc_release(id) — releases an autoreleased/retained ObjC object.
//       @Flexo pointer-in-literal-pool at 0x1562a37(%rip) from 0x38accb;
//       resolves to `_objc_release` (a runtime import; see the load-commands
//       __DATA_CONST section that holds the objc image-info pointer).
//   * __clang_call_terminate — libcxx-emitted terminate wrapper called by
//       the personality routine's landing pad when the direct callee throws.
//       Not user-visible; only invoked on unwind of a hypothetical objc
//       exception out of objc_release.
//
// STATIC-LINKAGE GLOBAL REFERENCED:
//   * sDefaultCinematicManager — `id _Nullable` (ObjC pointer to the
//       default FFCinematicManager). @Flexo __ZL24sDefaultCinematicManager
//       (file-local; both read @0x38acc4 as `leaq …(%rip),%rdi` and written
//       @0x38acd1 as `movq $0x0,…(%rip)`).
//
// STRUCT LAYOUT — this class holds NO instance state (the destructor never
//   touches %rdi/`this` for any read/write; it acts purely on the static
//   global). The only reason it exists as a "class" at all is so the C++
//   compiler can emit a static-storage instance whose destructor is
//   registered by `__cxa_atexit`. Total instance size in the binary is
//   therefore effectively zero from a data-model perspective (though the
//   compiler still allocates 1 byte for identity per the ABI).

// -- Boundary throw-stubs for undecoded externs ------------------------------------------

/**
 * `objc_release(id obj)` — Objective-C runtime "release" imported by Flexo.
 * @Flexo indirect through the objc literal pool at 0x1562a37(%rip) from PC
 * 0x38accb (i.e. resolves at load time to `_objc_release`). Called by
 * ~FFCinematicManagerDestructor with the current sDefaultCinematicManager
 * as %rdi.
 */
function objc_release(_obj: unknown): void {
  throw new Error(
    "objc_release(id) @Flexo (import via 0x1562a37(%rip) at call-site 0x38accb) not yet transcribed",
  );
}

// -- File-local static global ------------------------------------------------------------

/**
 * `sDefaultCinematicManager` — file-local ObjC singleton pointer.
 * @Flexo __ZL24sDefaultCinematicManager. Read as source @0x38acc4 (leaq
 * disp -> %rdi) and written to 0x0 @0x38acd1 (movq $0x0, disp(%rip)).
 * This is the ONLY memory this destructor manipulates.
 *
 * Modeled as a mutable box so both operations (read the current pointer,
 * NULL the slot) can be transcribed against the SAME storage.
 */
export const sDefaultCinematicManager: { value: unknown } = { value: null };

// =============================================================================================
//  Destructor
// =============================================================================================

/**
 * ~FFCinematicManagerDestructor() [D1] — complete-object destructor.
 * @Flexo __ZN28FFCinematicManagerDestructorD1Ev @0x38acc0.
 *
 * Body (verbatim):
 *   0x38acc0  push %rbp
 *   0x38acc1  mov  %rsp,%rbp
 *   0x38acc4  mov  __ZL24sDefaultCinematicManager(%rip),%rdi
 *                                     ; %rdi = current default manager id
 *   0x38accb  callq *0x1562a37(%rip)  ; objc_release(rdi)
 *   0x38acd1  mov  $0x0,__ZL24sDefaultCinematicManager(%rip)
 *                                     ; NULL out the slot
 *   0x38acdc  pop  %rbp
 *   0x38acdd  ret
 *   0x38acde  mov  %rax,%rdi          ; landing pad — unwind from objc_release
 *   0x38ace1  callq ___clang_call_terminate
 *   0x38ace6  nop
 *
 * Semantic: release the retained ObjC default cinematic manager and clear
 * the slot to nil. Runs at process teardown from an `__cxa_atexit`
 * registration attached to a static-storage FFCinematicManagerDestructor
 * instance.
 *
 * The landing pad @0x38acde catches any (theoretically) uncaught exception
 * escaping objc_release and terminates via libc++'s __clang_call_terminate
 * — this is a compiler-emitted safety wrapper, not user-visible control
 * flow. We do not model the exception path here (Rule 3: a throw-stub could
 * cite `__clang_call_terminate` as unhandled, but since objc_release itself
 * is a boundary throw-stub the unwind path is subsumed).
 */
export function FFCinematicManagerDestructor_D1(
  _self: unknown,
): void {
  // 0x38acc4  load global -> %rdi
  const currentManager = sDefaultCinematicManager.value;
  // 0x38accb  objc_release(currentManager)
  objc_release(currentManager);
  // 0x38acd1  store $0x0 to global
  sDefaultCinematicManager.value = null;
}
