// FFEffectRegistryDestructor.ts — the STATIC DESTRUCTOR sentinel for FCP's effect-registration
// subsystem. This class has no fields of its own; a single file-scope instance is constructed at
// image-load time (so its ctor runs first, before any deferred registration client can register
// itself) and destroyed at image-unload time. The destructor is the interesting side: it
//   (a) latches a "static destruction has started" boolean so late registration attempts can no-op,
//   (b) frees the singly-linked list of DeferredRegistrationClient records that queued themselves
//       before the registry was ready, and
//   (c) reaches into +[FFEffect registriesAndLock:] to acquire {registries-collection, lock} pair,
//       takes the FFSynchronizable lock, and empties the collection under the lock.
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at raw-port/re/disasm/Flexo.FFEffectRegistryDestructor.~FFEffectRegistryDestructor.s
// (D2 body observed at file offset ~/tmp/Flexo_tV.txt lines around __ZN26FFEffectRegistryDestructorD2Ev).
//
// TWO SYMBOLS — the Itanium ABI D1 / D2 pair (this class has no vtable, so D0 does not exist):
//   @Flexo 0x00000000006b5f80  FFEffectRegistryDestructor::~FFEffectRegistryDestructor()  (D1: complete)
//   @Flexo 0x00000000006bc1d0  FFEffectRegistryDestructor::~FFEffectRegistryDestructor()  (D2: base)
// D1 is a 5-byte thin tail-call trampoline into D2 (confirmed by disasm: `pushq %rbp / movq %rsp,%rbp
// / popq %rbp / jmp D2` @0x6b5f80..0x6b5f8a). ALL real work is in D2.
//
// FILE-SCOPE GLOBALS observed in D2 (both live in Flexo's __DATA/__bss):
//   __ZL36gRegistryStaticDestructionHasStarted   (u8; the ".0" suffix means it's the first byte of
//                                                  the local-static guard word for the singleton)
//   __ZL28gDeferredRegistrationClients           (DeferredRegistrationClient*; head of a linked list)
// The `ZL` mangling prefix marks these as file-static ("internal linkage") in the compilation unit
// that defines FFEffectRegistryDestructor. TS has no true file-static; we model them as
// module-private `let` bindings inside this file. Callers cannot see them.
//
// LINKED-LIST NODE LAYOUT (recovered from the drain block @0x6bc1e3..0x6bc206):
//   struct DeferredRegistrationClient {
//     +0x00  void* payload;   // (rbx) load @0x6bc1ef, tested and `delete`d if non-null
//     +0x08  ???;             // set to `payload` @0x6bc1f7 (`movq %rdi, 0x8(%rbx)` — see below)
//   };
// The `movq %rdi, 0x8(%rbx)` at 0x6bc1f7 is peculiar: it stores the payload pointer at +0x8 of the
// node RIGHT BEFORE deleting the payload. That's almost certainly the compiler emitting a
// "back-link null-out that never actually reads afterwards" (or a scratch write into the tail-link
// slot the allocator will reuse). Since the store's destination is inside the block that is about
// to be `delete`d one line later (both callq __ZdlPv sites free `rbx` next), it is a semantically
// dead write from OUR perspective — but faithfulness requires we perform an equivalent store to
// keep the observable-memory sequence intact against any hypothetical reader. We record it below
// as a `next` field write and comment its role. NOTE the drain as observed frees ONLY the first
// node: there is no back-branch to 0x6bc1e3 in this body. That's not a bug in the transcription —
// D2 truly drains only one head node. If Flexo relied on multiple deferred clients being drained
// here, the drain would have been a real loop; the fact that it isn't tells us the runtime pattern
// is "at most one deferred client ever queues before the singleton constructs" (or the multi-node
// drain lives elsewhere). We mirror the asm; we do NOT invent a loop that isn't there.
//
// OBJC MESSAGE SENDS (both via `callq *objc_msgSend@GOT(%rip)`):
//   sel @0x1bd6e00 → "registriesAndLock:"   (class method on +_OBJC_CLASS_$_FFEffect)
//                    resolved via _objc_selrefs entry loaded @RIP+0x151abea = 0x1bd6e00,
//                    string @__objc_methname 0x17e69c1 = "registriesAndLock:"
//                    Signature (inferred from ABI: rdi=class, rsi=sel, rdx=&outLock,
//                    returns id in rax): +[FFEffect registriesAndLock:(FFSynchronizable**)outLock]
//                    -> returns the registries collection object; stores the lock pointer at *outLock.
//   sel @0x1bb85e8 → "removeAllObjects"     (instance method on the returned collection)
//                    resolved via _objc_selrefs entry loaded @RIP+0x14fc3b2 = 0x1bb85e8,
//                    string @__objc_methname 0x17e7aee = "removeAllObjects"
//                    Signature: -[id removeAllObjects] (NSMutableArray/NSMutableDictionary/NSMutableSet).
//
// FRONTIER CALLEES (not decoded here — throwing stubs per Rule 3):
//   FFSynchronizable::Lock       @0x12f8ec0
//   FFSynchronizable::Unlock     @0x12f8f20
//   operator delete (__ZdlPv)    @0x1497404 (a symbol stub jumping to libc++'s ::operator delete)
//   +[FFEffect registriesAndLock:]         (ObjC class method; ObjC runtime frontier)
//   -[<collection> removeAllObjects]       (ObjC selector; runtime dispatch)
//
// EXCEPTION PATHS: the destructor has two ___clang_call_terminate landing pads at 0x6bc250 and
// 0x6bc258 (one for each of the ObjC msgSend calls, since msgSend can raise). If either throws,
// std::terminate() runs — noexcept-dtor convention. From TS we can only surface that as an
// unhandled throw at the module level; there is no faithful std::terminate binding.

// ── Opaque frontier types ─────────────────────────────────────────────────────────────────────
// FFSynchronizable is a Flexo internal recursive-mutex object with a `count` field at +0x78
// (recovered in FFTimingIntervalInfo.ts's transcription notes for the D1/D2 destructor sequence
// and the Lock/Unlock disasm at 0x12f8ec0 / 0x12f8f20). We only need the pointer-typed handle
// here; the port of the class itself is a separate task.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFSynchronizable {}

// The Objective-C collection returned by +[FFEffect registriesAndLock:] — we don't know its exact
// class (likely NSMutableDictionary keyed by effect UUID given the "registries" plural) and the
// disasm doesn't tell us. We MUST NOT guess — we model it as an opaque id.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFEffectRegistriesCollection {}

/**
 * DeferredRegistrationClient — singly-linked list node whose head lives in the file-static
 * gDeferredRegistrationClients. Layout recovered from the drain block at @Flexo 0x6bc1e3..0x6bc206:
 *   +0x00  payload  (freed via `operator delete` if non-null)
 *   +0x08  next     (written from `payload` @0x6bc1f7 immediately before the block is freed;
 *                    see the top-of-file note — this is a semantically dead store from the reader's
 *                    perspective but we retain it for observable-memory faithfulness.)
 * Total sizeof = 16 bytes.
 */
export interface DeferredRegistrationClient {
  /** +0x00 payload pointer; the node "owns" this and `delete`s it in the drain path. */
  payload: unknown | null;
  /** +0x08 back-link/next slot; written just before free @0x6bc1f7. */
  next: unknown | null;
}

// ── File-static globals (ZL-mangled in Flexo; module-private here) ────────────────────────────
/**
 * gRegistryStaticDestructionHasStarted — @Flexo __ZL36gRegistryStaticDestructionHasStarted.0
 * A one-byte latch flipped to 1 by the D2 body via `xchgb $0x1, ...` @0x6bc1dd. The `.0` byte
 * offset is the first byte of the local-static guard variable; the byte the destructor writes is
 * the same one deferred-registration code paths read to short-circuit late registrations.
 */
let gRegistryStaticDestructionHasStarted: number = 0;

/**
 * gDeferredRegistrationClients — @Flexo __ZL28gDeferredRegistrationClients
 * Head of a linked list of DeferredRegistrationClient records queued by callers that tried to
 * register before the effect registry singleton was ready. Loaded @0x6bc1e3 into %rbx.
 */
let gDeferredRegistrationClients: DeferredRegistrationClient | null = null;

// ── Frontier stubs (Rule 3: undecoded → throw) ────────────────────────────────────────────────
/**
 * FFSynchronizable::Lock @Flexo 0x12f8ec0 — recursive-mutex acquire. Not yet transcribed.
 * Called @0x6bc22a with %rdi = FFSynchronizable* returned via the out-parameter of
 * +[FFEffect registriesAndLock:].
 */
function FFSynchronizable_Lock(_lock: FFSynchronizable): void {
  throw new Error('FFSynchronizable::Lock @Flexo 0x12f8ec0 not yet transcribed');
}
/**
 * FFSynchronizable::Unlock @Flexo 0x12f8f20 — recursive-mutex release. Not yet transcribed.
 * Called @0x6bc242 with %rdi = the same FFSynchronizable* passed to Lock().
 */
function FFSynchronizable_Unlock(_lock: FFSynchronizable): void {
  throw new Error('FFSynchronizable::Unlock @Flexo 0x12f8f20 not yet transcribed');
}
/**
 * operator delete (::__ZdlPv) — libc++ global operator delete, reached via Flexo's symbol stub
 * @0x1497404. Called twice in the drain block (@0x6bc1fb for the payload, @0x6bc203 for the node).
 * The JS host has no equivalent explicit deallocator; a faithful port must nevertheless not silently
 * ignore the call — we throw so any code path that actually reaches this destructor is forced to
 * supply a real deleter binding.
 */
function operator_delete(_p: unknown): void {
  throw new Error('operator delete (__ZdlPv @Flexo stub 0x1497404) not yet bound');
}
/**
 * +[FFEffect registriesAndLock:(FFSynchronizable**)outLock] — ObjC class method invoked @0x6bc21a
 * via `callq *objc_msgSend@GOT`. Selector "registriesAndLock:" @__objc_methname 0x17e69c1,
 * _objc_selrefs entry @0x1bd6e00. Returns the registries collection object; writes the lock into
 * *outLock. The ObjC runtime is not available from TS; a faithful port throws.
 */
function FFEffect_registriesAndLock(
  _outLock: { value: FFSynchronizable | null },
): FFEffectRegistriesCollection {
  throw new Error(
    '+[FFEffect registriesAndLock:] (ObjC msgSend @Flexo 0x6bc21a, sel @0x1bd6e00) not yet bound',
  );
}
/**
 * -[<collection> removeAllObjects] — ObjC instance method invoked @0x6bc239 via
 * `callq *objc_msgSend@GOT`. Selector "removeAllObjects" @__objc_methname 0x17e7aee, _objc_selrefs
 * entry @0x1bb85e8. Empties the collection returned by +[FFEffect registriesAndLock:].
 */
function collection_removeAllObjects(_collection: FFEffectRegistriesCollection): void {
  throw new Error(
    '-[<collection> removeAllObjects] (ObjC msgSend @Flexo 0x6bc239, sel @0x1bb85e8) not yet bound',
  );
}

// ── The class ─────────────────────────────────────────────────────────────────────────────────

/**
 * FFEffectRegistryDestructor — static-lifetime sentinel; only its destructor has observable
 * behaviour. Instances are not user-constructed; the runtime creates exactly one at image-load
 * time. TS callers that want to trigger the destruction sequence call `dispose()` on the
 * exported singleton.
 */
export class FFEffectRegistryDestructor {
  /**
   * D1 (complete-object destructor) @Flexo 0x6b5f80.
   * Disasm:
   *   0x6b5f80 pushq %rbp
   *   0x6b5f81 movq  %rsp, %rbp
   *   0x6b5f84 popq  %rbp
   *   0x6b5f85 jmp   __ZN26FFEffectRegistryDestructorD2Ev
   * Thin tail-call trampoline into D2. No side effects of its own.
   */
  destroyComplete(): void {
    // @0x6b5f85 jmp D2
    this.destroyBase();
  }

  /**
   * D2 (base-object destructor) @Flexo 0x6bc1d0.
   * Faithful line-by-line transcription. The `this` pointer is unused inside the body — this class
   * has no fields — so no reads off `%rdi` appear in the disasm; ALL work is on the file-static
   * globals plus the +[FFEffect registriesAndLock:] result.
   */
  destroyBase(): void {
    // @0x6bc1db movb  $0x1, %al
    // @0x6bc1dd xchgb %al, gRegistryStaticDestructionHasStarted(%rip)
    //   `xchgb` is a full memory barrier + atomic swap. The prior value in %al (loaded as 1) is
    //   discarded; the STORE side sets the byte to 1. Faithful TS: assign 1. We don't emulate the
    //   fence because JS is single-threaded (the only "other thread" here would be another native
    //   registration-client code path that TS callers can't reach).
    gRegistryStaticDestructionHasStarted = 1;

    // @0x6bc1e3 movq gDeferredRegistrationClients(%rip), %rbx
    let rbx: DeferredRegistrationClient | null = gDeferredRegistrationClients;
    // @0x6bc1ea testq %rbx, %rbx
    // @0x6bc1ed je   0x6bc208    (skip drain block if head is null)
    if (rbx !== null) {
      // @0x6bc1ef movq (%rbx), %rdi           ; rdi = rbx->payload
      const rdi: unknown | null = rbx.payload;
      // @0x6bc1f2 testq %rdi, %rdi
      // @0x6bc1f5 je   0x6bc200                (skip payload delete if null)
      if (rdi !== null) {
        // @0x6bc1f7 movq %rdi, 0x8(%rbx)       ; rbx->next = payload (see file header note)
        rbx.next = rdi;
        // @0x6bc1fb callq __ZdlPv               ; ::operator delete(rdi)
        operator_delete(rdi);
      }
      // @0x6bc200 movq %rbx, %rdi
      // @0x6bc203 callq __ZdlPv                 ; ::operator delete(rbx)
      operator_delete(rbx);
      rbx = null;
    }

    // @0x6bc208 leaq _OBJC_CLASS_$_FFEffect(%rip), %rdi
    // @0x6bc20f movq objc_selref"registriesAndLock:"(%rip), %rsi
    // @0x6bc216 leaq -0x18(%rbp), %rdx          ; rdx = &lockOut (stack slot for out-lock*)
    // @0x6bc21a callq *objc_msgSend@GOT(%rip)   ; +[FFEffect registriesAndLock:(FFSynchronizable**)]
    // @0x6bc220 movq %rax, %r14                 ; r14 = returned collection id
    const outLock: { value: FFSynchronizable | null } = { value: null };
    const collection: FFEffectRegistriesCollection =
      FFEffect_registriesAndLock(outLock);

    // @0x6bc223 movq -0x18(%rbp), %rbx          ; rbx = lockOut (FFSynchronizable*)
    // @0x6bc227 movq %rbx, %rdi
    // @0x6bc22a callq __ZN16FFSynchronizable4LockEv
    if (outLock.value === null) {
      // The disasm unconditionally passes the read-back stack slot to Lock; if the caller stored a
      // null lock into *outLock the resulting SIGSEGV inside Lock is the real behaviour. Faithfulness
      // requires we surface that path as a loud error rather than silently no-op'ing the lock.
      throw new Error(
        '+[FFEffect registriesAndLock:] returned null lock (would crash in FFSynchronizable::Lock @Flexo 0x6bc22a)',
      );
    }
    const lock: FFSynchronizable = outLock.value;
    FFSynchronizable_Lock(lock);

    // @0x6bc22f movq objc_selref"removeAllObjects"(%rip), %rsi
    // @0x6bc236 movq %r14, %rdi                 ; rdi = collection
    // @0x6bc239 callq *objc_msgSend@GOT(%rip)   ; -[collection removeAllObjects]
    // If this throws, the ___clang_call_terminate landing pad @0x6bc253 runs (noexcept dtor).
    // We don't emulate std::terminate; the throw propagates.
    collection_removeAllObjects(collection);

    // @0x6bc23f movq %rbx, %rdi
    // @0x6bc242 callq __ZN16FFSynchronizable6UnlockEv
    FFSynchronizable_Unlock(lock);

    // @0x6bc247..0x6bc24f epilogue (addq $0x10,%rsp; popq %rbx; popq %r14; popq %rbp; retq)
    // — no TS emission needed.
  }

  /**
   * Convenience alias matching the semantic name callers use ("run the static destructor once").
   * Not present in the binary; provided purely so TS callers don't have to pick D1 vs D2 by hand.
   * Both destructor entry points converge on D2, so this simply calls destroyBase().
   */
  dispose(): void {
    this.destroyComplete();
  }
}

// ── Introspection helpers (module-private state readers, used by tests only) ──────────────────
export function _testing_hasStaticDestructionStarted(): number {
  return gRegistryStaticDestructionHasStarted;
}
export function _testing_setDeferredRegistrationClientsHead(
  head: DeferredRegistrationClient | null,
): void {
  gDeferredRegistrationClients = head;
}
export function _testing_getDeferredRegistrationClientsHead(): DeferredRegistrationClient | null {
  return gDeferredRegistrationClients;
}
export function _testing_resetStaticDestructionStarted(): void {
  gRegistryStaticDestructionHasStarted = 0;
}
