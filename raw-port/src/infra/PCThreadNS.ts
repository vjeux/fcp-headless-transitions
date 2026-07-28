// PCThreadNS.ts — ProCore's "spawn a detached NSThread" C++ shim. Its
// constructor allocates a private ObjC helper class (a `PCThread`-style
// object whose Class object sits at ProCore __objc_data 0x159df8),
// initialises it with the caller's C-function pointer + user_ptr, then
// tells `+[NSThread detachNewThreadSelector:toTarget:withObject:]` to
// spawn a thread whose entry point calls back through the helper via
// `@selector(doThreadedProcess)`. All ObjC dispatch goes through
// `objc_msgSend` (cached in %r15 across two calls); the local retain is
// released via a tail-jmp to `objc_release` on the way out. The
// destructor is a no-op — PCThreadNS holds NO instance state (its
// stack-scoped placeholder is entirely for RAII / call-site attribution;
// the actual thread outlives the C++ object).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//   Versions/A/ProCore.
//
// Source disassembly:
//   raw-port/re/disasm/PCThreadNS.PCThreadNS.s   (C1 — tail-jmp to C2 @0x5b51)
//   raw-port/re/disasm/PCThreadNS.~PCThreadNS.s  (D1 — empty ret)
// The C2 base-object body and D2 base-object body were fetched inline
// via `otool -tv -arch x86_64` (disasm.sh only surfaces the C1/D1
// slices for Itanium-ABI ctor/dtor pairs). Both dtors are empty
// (`pushq %rbp; movq %rsp, %rbp; popq %rbp; retq`), sharing the same
// no-op body.
//
// ProCore symbols transcribed:
//   @0x00005ae2  PCThreadNS::PCThreadNS(void (*)(void*), void*, char const*)  (C2)
//   @0x00005b4c  PCThreadNS::PCThreadNS(void (*)(void*), void*, char const*)  (C1 — tail-jmp to C2 @0x5ae2)
//   @0x00005b56  PCThreadNS::~PCThreadNS()  (D2 — empty)
//   @0x00005b5c  PCThreadNS::~PCThreadNS()  (D1 — empty)
//
// DECODE evidence:
//   * Ctor signature (from the mangled name
//     `_ZN10PCThreadNSC2EPFvPvES0_PKc`):
//       PCThreadNS::PCThreadNS(void (*fn)(void*), void* user_ptr, char const* name);
//     ABI mapping observed at C2:
//       %rdi = this          (PCThreadNS* — never read after prologue)
//       %rsi = fn            → spilled to %r14 @0x5aef
//       %rdx = user_ptr      → spilled to %rbx @0x5aec
//       %rcx = name          (never saved; clobbered by the first
//                              callq — the name argument is DROPPED)
//
//   * The class has NO decoded instance layout. C2 never writes to
//     %rdi's memory; D2/D1 never read from it. PCThreadNS is a
//     stack-allocated call-site placeholder — a C++ RAII handle
//     whose whole purpose is to bracket a `spawn thread` operation
//     without carrying observable state.
//
//   * C2 body (@0x5ae2..0x5b46) — the payload:
//       Prologue     0x5ae2..0x5aeb   (rbp frame; callee-save r15/r14/rbx;
//                                       `pushq %rax` for 16B stack align).
//       Spill        0x5aec..0x5aef   %rbx = user_ptr ; %r14 = fn.
//       Alloc        0x5af2..0x5af9   %rdi = &PCThread-class-object
//                                       (RIP-next 0x5af9 + 0x1542ff = 0x159df8;
//                                        section: __objc_data — the internal
//                                        ObjC helper class's class-object.
//                                        Rebased target 0x159e20 = the isa slot).
//                                     callq _objc_alloc (stub@ProCore 0xde996).
//                                       Returns %rax = an instance of that class.
//       Cache SEL/msgSend  0x5afe..0x5b05
//                                     %rsi = *(selref @0x1578a8)
//                                          → sel "initWithFunc:arg:"
//                                            (rebased target 0x13c6f9 in
//                                             __objc_methname).
//                                     %r15 = *(objc_msgSend GOT @0x147db8)
//                                          → libobjc/_objc_msgSend.
//       Init call    0x5b0c..0x5b15   %rdi = instance ; %rdx = fn ;
//                                     %rcx = user_ptr ; call *%r15.
//                                     Semantic:
//                                       [instance initWithFunc:fn arg:user_ptr];
//                                     Returns %rax = self.
//       Save inst    0x5b18            %rbx = %rax  (the initialised instance).
//       Spawn setup  0x5b1b..0x5b30   %rdi = *(NSThread class GOT @0x147680)
//                                          → Foundation/_OBJC_CLASS_$_NSThread.
//                                     %rdx = *(selref @0x1578b0)
//                                          → sel "doThreadedProcess".
//                                     %rsi = *(selref @0x1578b8)
//                                          → sel "detachNewThreadSelector:
//                                                  toTarget:withObject:".
//                                     %rcx = %rax  (instance = target).
//                                     %r8d = 0     (withObject:nil).
//       Spawn call   0x5b33..0x5b36   `xorl %r8d, %r8d; callq *%r15`.
//                                     Semantic:
//                                       [NSThread detachNewThreadSelector:
//                                          @selector(doThreadedProcess)
//                                        toTarget:instance
//                                        withObject:nil];
//                                     NSThread retains `instance` during the
//                                     thread's lifetime, so our local retain
//                                     is safe to drop.
//       Release      0x5b39..0x5b46   %rdi = %rbx  (instance);
//                                     epilogue (undo the 5 pushes + 8B pad);
//                                     `jmpq *(objc_release GOT @0x147df0)`.
//                                     Semantic:
//                                       objc_release(instance);   // tail-called
//
//     Full semantic: fire-and-forget thread spawn. `fn` will be invoked
//     on a new NSThread with `user_ptr` as its argument (via the
//     `doThreadedProcess` selector on our internal helper class, which
//     unpacks the (fn, user_ptr) pair and calls `fn(user_ptr)`). The
//     `name` argument is IGNORED — the compiled binary does not use it.
//
//   * C1 body (@0x5b4c..0x5b51):
//       pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp 0x5ae2
//     A bare tail-jmp to C2. Standard Itanium ABI shape.
//
//   * D2 / D1 bodies (@0x5b56 / @0x5b5c):
//       Both are identical 4-instruction no-ops:
//         pushq %rbp; movq %rsp, %rbp; popq %rbp; retq
//     PCThreadNS holds no state to tear down; the destructor exists
//     solely for signature completeness.
//
// Vtable / vptr:
//   PCThreadNS has no virtual methods. C2 does not install a vptr (no
//   `leaq <vt>(%rip), %rax; movq %rax, (%rdi)` in the ctor body). No
//   vtable lookup is needed.
//
// Called functions / cached-through-GOT symbols (all ProCore imports):
//   _objc_alloc                              stub @ProCore 0xde996
//                                             (C2 call site @0x5af9)
//   _objc_msgSend                            GOT slot @ProCore 0x147db8
//                                             (loaded into %r15 @0x5b05;
//                                              used at both @0x5b15 and
//                                              @0x5b36)
//   _objc_release                            GOT slot @ProCore 0x147df0
//                                             (tail-jmp @0x5b46)
//   [Foundation] +[NSThread class]           GOT slot @ProCore 0x147680
//                                             (loaded into %rdi @0x5b1b)
//   [PCThread-like internal class]           class object @ProCore 0x159df8
//                                             (in __objc_data; rebased
//                                              value 0x159e20)
//   Selectors (all in __objc_selrefs):
//     "initWithFunc:arg:"                    selref @ProCore 0x1578a8
//                                             (rebased -> C-string
//                                              @ProCore 0x13c6f9)
//     "doThreadedProcess"                    selref @ProCore 0x1578b0
//                                             (rebased -> C-string
//                                              @ProCore 0x13b47c)
//     "detachNewThreadSelector:toTarget:withObject:"
//                                            selref @ProCore 0x1578b8
//                                             (rebased -> C-string
//                                              @ProCore 0x13b34b)
//
// Frontier callees (surfaced as throwing stubs — each cites its @0xADDR):
//   objc_alloc, objc_msgSend, objc_release, NSThread, PCThread-helper-class,
//   `initWithFunc:arg:`, `doThreadedProcess`, `detachNewThreadSelector:...`
//   are all runtime/library-provided — none is on this class's decoded
//   surface, and JS has no ObjC runtime, so the entire spawn path is a
//   throwing stub. The class's job is purely to marshal the arguments
//   into that call — which we transcribe honestly, mirroring every
//   register move.

/**
 * The ObjC helper class this file spawns. Its Class object sits at
 * @ProCore __objc_data 0x159df8; the compiled shim loads its address
 * directly (no classref indirection) and calls `objc_alloc` on it. Its
 * definition (name, methods, ivars) is entirely off-slice — we surface
 * it as an opaque token.
 */
export type ProCoreThreadHelperClass = object;

/**
 * `objc_alloc(Class)` — libobjc runtime helper (stub @ProCore 0xde996).
 * Called from PCThreadNS::C2 @0x5af9 with the internal helper class as
 * argument. Returns a freshly-allocated, un-initialised instance whose
 * refcount is +1. Not yet transcribed.
 */
function objc_alloc(_cls: ProCoreThreadHelperClass): object {
  throw new Error(
    "PCThreadNS: objc_alloc(Class) not yet transcribed @ProCore 0xde996 (C2 call site 0x5af9)",
  );
}

/**
 * `objc_msgSend(receiver, selector, ...)` — libobjc runtime message
 * dispatch. Cached into %r15 from GOT slot @ProCore 0x147db8 and reused
 * across the two msgSend calls in this ctor (@0x5b15 and @0x5b36). Not
 * yet transcribed.
 *
 * The two typed variants below fix the argument shapes seen in this
 * class to give each call site a distinct throwing stub — decoder
 * discipline: never a single blanket ObjC dispatcher.
 */
function objc_msgSend_initWithFunc_arg(
  _receiver: object,
  _selector_initWithFunc_arg: object,
  _fn: (_userPtr: object) => void,
  _userPtr: object,
): object {
  throw new Error(
    "PCThreadNS: objc_msgSend for [instance initWithFunc:fn arg:user_ptr] not yet transcribed @ProCore GOT 0x147db8 (call site 0x5b15; selref 0x1578a8 -> \"initWithFunc:arg:\")",
  );
}

function objc_msgSend_detachNewThread(
  _NSThread: object,
  _selector_detachNewThread: object,
  _selector_doThreadedProcess: object,
  _target: object,
  _withObject_nil: null,
): object {
  throw new Error(
    "PCThreadNS: objc_msgSend for +[NSThread detachNewThreadSelector:toTarget:withObject:] not yet transcribed @ProCore GOT 0x147db8 (call site 0x5b36; selrefs 0x1578b8 -> \"detachNewThreadSelector:toTarget:withObject:\", 0x1578b0 -> \"doThreadedProcess\")",
  );
}

/**
 * `objc_release(obj)` — libobjc runtime refcount decrement. Cached from
 * GOT slot @ProCore 0x147df0 and TAIL-jmp'd @0x5b46 (indirect jump
 * through the GOT slot). Not yet transcribed.
 */
function objc_release(_obj: object): void {
  throw new Error(
    "PCThreadNS: objc_release(id) not yet transcribed @ProCore GOT 0x147df0 (C2 tail-jmp site 0x5b46)",
  );
}

/**
 * `+[NSThread class]` — Foundation. Loaded from GOT slot @ProCore
 * 0x147680 into %rdi @0x5b1b as the receiver of
 * `+[NSThread detachNewThreadSelector:toTarget:withObject:]`. Not yet
 * transcribed.
 */
function getNSThreadClass(): object {
  throw new Error(
    "PCThreadNS: +[NSThread class] not yet transcribed @ProCore GOT 0x147680 (C2 load site 0x5b1b)",
  );
}

/**
 * The internal helper class's class-object at @ProCore __objc_data 0x159df8.
 */
function getProCoreThreadHelperClass(): ProCoreThreadHelperClass {
  throw new Error(
    "PCThreadNS: ProCore-thread-helper class object @ProCore __objc_data 0x159df8 not yet transcribed (C2 leaq site 0x5af2)",
  );
}

/**
 * Selector references. Each is a `SEL*` slot in __objc_selrefs. libobjc's
 * `objc_msgSend` reads the actual SEL by dereferencing the slot; we
 * mirror that by treating each selref as an opaque handle.
 */
function selref_initWithFunc_arg(): object {
  throw new Error(
    "PCThreadNS: selref @\"initWithFunc:arg:\" @ProCore 0x1578a8 not yet transcribed (C2 load site 0x5afe)",
  );
}
function selref_doThreadedProcess(): object {
  throw new Error(
    "PCThreadNS: selref @\"doThreadedProcess\" @ProCore 0x1578b0 not yet transcribed (C2 load site 0x5b22)",
  );
}
function selref_detachNewThreadSelector_toTarget_withObject(): object {
  throw new Error(
    "PCThreadNS: selref @\"detachNewThreadSelector:toTarget:withObject:\" @ProCore 0x1578b8 not yet transcribed (C2 load site 0x5b29)",
  );
}

/**
 * `PCThreadNS` — RAII call-site placeholder for detaching a new NSThread
 * with a C-function entry point. Constructor spawns the thread; the
 * caller's C-function fires asynchronously on that thread. Destructor
 * is a no-op (PCThreadNS holds no state — the thread outlives the
 * C++ object).
 *
 * The `name` argument in the C++ signature is accepted and DROPPED,
 * matching the compiled behaviour @ProCore C2 body 0x5ae2..0x5b46 (no
 * decoded read of %rcx after prologue).
 */
export class PCThreadNS {
  /**
   * `PCThreadNS::PCThreadNS(void (*fn)(void*), void* user_ptr, char const* name)`
   * — corresponds to both C1 (@ProCore 0x5b4c, a bare tail-jmp) and C2
   * (@ProCore 0x5ae2, the actual body).
   *
   * See the file-header DECODE evidence for the full byte-by-byte trace.
   * Summary of the C2 body:
   *   1. @0x5af2..0x5af9   `instance = objc_alloc(&<PCThread-helper-class>);`
   *   2. @0x5afe..0x5b15   `[instance initWithFunc:fn arg:user_ptr];`
   *                          (objc_msgSend via cached %r15)
   *   3. @0x5b1b..0x5b36   `[NSThread detachNewThreadSelector:
   *                             @selector(doThreadedProcess)
   *                           toTarget:instance
   *                           withObject:nil];`
   *                          (objc_msgSend via cached %r15; NSThread
   *                          retains `instance` during thread lifetime).
   *   4. @0x5b39..0x5b46   tail-jmp `objc_release(instance);`
   *
   * `name` is not referenced by any decoded byte of this body.
   */
  constructor(
    fn: (_userPtr: object) => void,
    user_ptr: object,
    _name: string,
  ) {
    // @0x5af2..0x5af9 — allocate helper instance.
    const cls = getProCoreThreadHelperClass();
    const instance = objc_alloc(cls);

    // @0x5afe..0x5b15 — [instance initWithFunc:fn arg:user_ptr].
    // Note the return value of `initWith...:` is the initialised self
    // (a ubiquitous ObjC convention); the compiled code writes %rax
    // back to %rbx @0x5b18 as the "canonical" instance handle for the
    // subsequent detach call. Mirror that here.
    const initSel = selref_initWithFunc_arg();
    const initialised = objc_msgSend_initWithFunc_arg(
      instance,
      initSel,
      fn,
      user_ptr,
    );

    // @0x5b1b..0x5b36 — [NSThread detachNewThreadSelector:@selector(doThreadedProcess)
    //                                        toTarget:initialised
    //                                        withObject:nil].
    const NSThreadClass = getNSThreadClass();
    const detachSel = selref_detachNewThreadSelector_toTarget_withObject();
    const doThreadedProcessSel = selref_doThreadedProcess();
    objc_msgSend_detachNewThread(
      NSThreadClass,
      detachSel,
      doThreadedProcessSel,
      initialised,
      null,
    );

    // @0x5b39..0x5b46 — tail-jmp objc_release(initialised).
    objc_release(initialised);
  }

  /**
   * `PCThreadNS::~PCThreadNS()` — no-op. Corresponds to both D1
   * (@ProCore 0x5b5c) and D2 (@ProCore 0x5b56), which share identical
   * empty bodies (`pushq %rbp; movq %rsp, %rbp; popq %rbp; retq`).
   *
   * PCThreadNS holds no state — its stack-scoped instance is entirely a
   * call-site placeholder; the actual thread lives independently on
   * NSThread's queue and outlives this C++ object.
   */
  destroy(): void {
    // @0x5b56 (D2) / @0x5b5c (D1) — empty body, nothing to do.
  }
}
