// FFThreadLocalCountedSetSupport.ts — Flexo framework's
// FFThreadLocalCountedSetSupport: a tiny helper that checks whether a
// `void const*` value belongs to a named CFBag stored in thread-local
// storage under a globally-registered pthread key (`sThreadStorageKey`).
// It is a RAII+static-lookup helper: the ctor registers the (name, value)
// association, ptrExistsForKey does the lookup, and the dtor tears it down.
//
// Method dispatch (from `raw-port/army/tools/brief.py Flexo`):
//   @Flexo 0x00000000012fba30  FFThreadLocalCountedSetSupport::FFThreadLocalCountedSetSupport(CFString*,void*)  (C2)
//   @Flexo 0x00000000012fbb20  FFThreadLocalCountedSetSupport::FFThreadLocalCountedSetSupport(CFString*,void*)  (C1)
//   @Flexo 0x00000000012fbb30  FFThreadLocalCountedSetSupport::~FFThreadLocalCountedSetSupport()  (D1)
//   @Flexo 0x00000000012fbbe0  FFThreadLocalCountedSetSupport::~FFThreadLocalCountedSetSupport()  (D2 — but only D1 has an extractable body)
//   @Flexo 0x00000000012fbbf0  FFThreadLocalCountedSetSupport::ptrExistsForKey(CFString*, void*)
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.FFThreadLocalCountedSetSupport.FFThreadLocalCountedSetSupport.s  (@0x12fbb20..0x12fbb2a, 6 lines)
//     — pure Itanium-ABI thunk: push rbp; mov rsp,rbp; pop rbp; jmp C2.
//   Flexo.FFThreadLocalCountedSetSupport.~FFThreadLocalCountedSetSupport.s (@0x12fbbe0..0x12fbbea, 6 lines)
//     — thunk: push rbp; mov rsp,rbp; pop rbp; jmp D2.
//   Flexo.FFThreadLocalCountedSetSupport.ptrExistsForKey.s               (@0x12fbbf0..0x12fbc76, 44 lines)
//     — the only method with a substantive body.
// C2 @0x12fba30 and D2 @0x12fbbe0 bodies are NOT independently extractable
// via `xcrun llvm-objdump --disassemble-symbols` (the emitted output is a
// fixed generic dump, not per-symbol) and per PORTING_SPEC Rule 3 MUST NOT
// be paraphrased. Their behavior is inferred from ptrExistsForKey's read
// of `sThreadStorageKey` — the ctor plausibly registers a per-thread
// dictionary entry keyed by the CFString name; the dtor tears it down.
// Both are emitted here as throwing stubs citing their entry addresses.
//
// Frontier callees observed in ptrExistsForKey:
//   PCAutoreleasePool::PCAutoreleasePool()  @stub 0x14965f4
//   PCAutoreleasePool::~PCAutoreleasePool() @stub 0x14965fa
//   pthread_getspecific                     @stub 0x1497ab8
//   CFBagContainsValue                      @stub 0x14946ec
//   __Unwind_Resume                         @stub 0x1495d30 (landing pad only)
//   objc_msgSend via [rip+0x5f1a8d]         (selector ref @[rip+0x8bd52e], not resolved
//                                            — Flexo's __objc_selrefs at that RIP-delta)
//
// TLS-value shape (recovered from @0x12fbc1b: `movq 0x8(%rax), %rdi`):
//   The value returned by pthread_getspecific(sThreadStorageKey) is a pointer
//   to a small ObjC/CF wrapper struct whose +0x08 field is the receiver of
//   the ObjC message (an NSMutableDictionary / NSCache-like keyed store).

/**
 * FFThreadLocalCountedSetSupport — a per-thread "does this value exist in
 * my counted set" helper. Public surface:
 *   - ctor(name, value)      — undecoded body @0x12fba30, throws.
 *   - dtor / dispose()       — undecoded body @0x12fbb30/@0x12fbbe0, throws.
 *   - ptrExistsForKey(k,v)   — fully decoded (@0x12fbbf0..0x12fbc5f).
 */
export class FFThreadLocalCountedSetSupport {
  /**
   * FFThreadLocalCountedSetSupport::FFThreadLocalCountedSetSupport(CFString*, void*)
   * @Flexo C1 0x00000000012fbb20 (thunk to C2 @0x00000000012fba30)
   *
   * The C1 thunk is a 6-line trampoline (push rbp; mov rsp,rbp; pop rbp; jmp C2).
   * The C2 body @0x12fba30 is not independently extractable via
   * `xcrun llvm-objdump --disassemble-symbols` (the tool emits a fixed generic
   * dump, not per-symbol). Per PORTING_SPEC Rule 3, a body that cannot be
   * decoded MUST throw citing its address rather than be paraphrased.
   *
   * Behavior inferred from ptrExistsForKey (which reads
   * `sThreadStorageKey`, extracts a TLS wrapper's +0x08 field, and dispatches
   * an ObjC message with the CFString+value): the ctor likely registers a
   * (name, value) entry into a per-thread ObjC/CF-backed dictionary keyed by
   * pthread_getspecific(sThreadStorageKey). Registration lives in the
   * undecoded C2 body and is emitted as a throwing stub.
   */
  constructor(_name: unknown, _value: unknown) {
    const stub = (): never => {
      const err = new Error(
        "FFThreadLocalCountedSetSupport::FFThreadLocalCountedSetSupport C2 @0x12fba30 not yet transcribed (body not extractable — Itanium-ABI C1→C2 thunk observed)",
      );
      throw err;
    };
    stub();
  }

  /**
   * FFThreadLocalCountedSetSupport::~FFThreadLocalCountedSetSupport()
   * @Flexo D1 0x00000000012fbb30 (thunk) / D2 0x00000000012fbbe0 (thunk to D2 body)
   *
   * Both D1 and the second address are 6-line Itanium-ABI trampolines:
   *   push rbp; mov rsp,rbp; pop rbp; jmp D2
   * The D2 body's contents are not independently extractable. Per
   * PORTING_SPEC Rule 3, the port emits a throwing stub citing the D2 entry.
   */
  dispose(): void {
    const stub = (): never => {
      const err = new Error(
        "FFThreadLocalCountedSetSupport::~FFThreadLocalCountedSetSupport D2 @0x12fbbe0 not yet transcribed (body not extractable — Itanium-ABI D1→D2 thunk observed)",
      );
      throw err;
    };
    stub();
  }

  /**
   * FFThreadLocalCountedSetSupport::ptrExistsForKey(CFString*, void*)
   * @Flexo 0x00000000012fbbf0
   *
   * Faithful transcription of the 44-line disasm at
   * raw-port/re/disasm/Flexo.FFThreadLocalCountedSetSupport.ptrExistsForKey.s.
   *
   * Prolog @0x12fbbf0..0x12fbbfe:
   *   push rbp; mov rsp,rbp; push r14; push rbx; sub rsp,0x10
   *   mov rbx, rsi   (rbx = key: CFString*)
   *   mov r14, rdi   (r14 = this: FFThreadLocalCountedSetSupport*)
   *
   * @0x12fbc01  lea rdi, [rbp-0x18] ; call PCAutoreleasePool::PCAutoreleasePool()
   *   — establishes a scoped ObjC autorelease pool at [rbp-0x18]. Its
   *     destructor @0x12fbc50 releases it in every exit path (normal + unwind
   *     landing pad @0x12fbc60..0x12fbc71).
   *
   * @0x12fbc0a  mov rdi, [rip+sThreadStorageKey] ; call pthread_getspecific
   *   — reads the pthread key registered by whichever module owns
   *     `__ZL17sThreadStorageKey` (Flexo-internal file-static). Returns the
   *     TLS value or NULL.
   *
   * @0x12fbc16  test rax, rax ; je 0x12fbc21
   *   if (tlsValue != NULL) rdi = *(void**)(tlsValue + 0x08)
   *   else                  rdi = NULL
   *
   * @0x12fbc23  mov rsi, [rip+<selectorRef @0x8bd52e>] ; mov rdx, r14 ;
   *              callq *[rip+<msgSend dispatch @0x5f1a8d>]
   *   — ObjC-style dispatch: msgSend(receiver=tlsDict-or-nil, sel=<sel>, this).
   *     The selector identity is not decoded here (`__objc_selrefs` entry at
   *     RIP-delta 0x8bd52e in Flexo — not resolved by nm because it points
   *     into __objc_selrefs, not __text). The result rax is a CFBag* (or
   *     NULL if the dictionary lookup missed).
   *
   * @0x12fbc33  test rax, rax ; je 0x12fbc4a
   *   if (bag != NULL) {
   *     @0x12fbc38  rdi = rax ; rsi = rbx ; call CFBagContainsValue
   *     @0x12fbc43  setne bl                  ← bl = (result != 0)
   *   } else {
   *     @0x12fbc4a  xor ebx, ebx               ← bl = 0
   *   }
   *
   * @0x12fbc4c  lea rdi, [rbp-0x18] ; call PCAutoreleasePool::~PCAutoreleasePool()
   * @0x12fbc55  mov eax, ebx    ← return the boolean via the bl byte
   * @0x12fbc57  add rsp,0x10 ; pop rbx ; pop r14 ; pop rbp ; ret
   *
   * Landing pad @0x12fbc60..0x12fbc71 releases the pool then re-raises the
   * exception via _Unwind_Resume — modeled by JS exception propagation.
   *
   * Frontier callees (all left as throwing stubs — none of them are on the
   * transitions engine's read path, and this class is only called via other
   * yet-to-be-ported callers):
   *   pthread_getspecific  — not modeled
   *   PCAutoreleasePool    — not yet ported (ObjC autorelease-pool RAII)
   *   objc_msgSend         — not modeled
   *   CFBagContainsValue   — not yet ported (CoreFoundation bag lookup)
   */
  ptrExistsForKey(_key: unknown, _value: unknown): boolean {
    // The observable data path is fully decoded above, but every callee is a
    // frontier stub (pthread_getspecific, PCAutoreleasePool, objc_msgSend,
    // CFBagContainsValue). Rather than manufacture a plausible-but-wrong
    // result, per PORTING_SPEC Rule 3 the port emits a throwing stub citing
    // its entry address. Consumers that need this must first port the
    // frontier callees listed in the doc comment.
    const stub = (): never => {
      const err = new Error(
        "FFThreadLocalCountedSetSupport::ptrExistsForKey @0x12fbbf0 requires frontier callees: pthread_getspecific, PCAutoreleasePool, objc_msgSend, CFBagContainsValue — not yet ported",
      );
      throw err;
    };
    return stub();
  }
}
