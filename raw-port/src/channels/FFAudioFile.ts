// raw-port: FFAudioFile — Flexo framework
// Faithful transcription of the two published entry points on the class:
//   0x00d02990  FFAudioFile::~FFAudioFile()            (base / non-deleting dtor, D1 == D2)
//   0x00d02a20  FFAudioFile::~FFAudioFile()            (deleting dtor, D0)
//
// The class holds a CoreAudio ExtAudioFileRef at offset +0x8. The dtors close the
// file via ExtAudioFileDispose and throw a CAXException on failure.
//
// The vtable is at Flexo `vtable for FFAudioFile` (referenced via
// leaq 0xc0e24f(%rip) @0xd0299a → 0x1910bf0, i.e. vtable_for_FFAudioFile+0x10;
// resolve.py Flexo sym 0x1910be8 → "vtable for FFAudioFile (+0x8)").
//
// ExtAudioFileDispose is an OSStatus-returning API from Apple's AudioToolbox
// (OS-level dependency); we do not have a JS ExtAudioFile stack, so we model
// the field as an opaque handle and delegate close via an injected disposer.
// This mirrors the asm faithfully — the class body IS just "own & release
// one ExtAudioFileRef".

/**
 * Opaque handle for a CoreAudio ExtAudioFileRef living at object offset +0x8
 * in the native class. In the raw-port we keep it as an untyped reference plus
 * an optional disposer so downstream code can plug in a real backend.
 */
export type ExtAudioFileRef = unknown;

/**
 * OSStatus disposer signature — matches
 *   extern "C" OSStatus ExtAudioFileDispose(ExtAudioFileRef inExtAudioFile);
 * (AudioToolbox / ExtendedAudioFile.h). 0 = noErr.
 */
export type ExtAudioFileDisposeFn = (ref: ExtAudioFileRef) => number;

/**
 * Thrown by ~FFAudioFile when ExtAudioFileDispose returns a non-zero OSStatus.
 * In FCP this is CAXException("ExtAudioFileClose failed", <osstatus>) — a
 * CoreAudioUtility exception type. See
 *   @0xd029d3 leaq 0x957c5a(%rip)  ## "ExtAudioFileClose failed"
 *   @0xd029e0 callq CAXException::CAXException(char const*, int)
 */
export class CAXException extends Error {
  readonly osstatus: number;
  constructor(message: string, osstatus: number) {
    super(`${message} (OSStatus=${osstatus})`);
    this.name = "CAXException";
    this.osstatus = osstatus;
  }
}

/**
 * FFAudioFile — thin RAII wrapper around an ExtAudioFileRef.
 *
 * Only the destructors are exported by Flexo at these addresses, so this port
 * models exactly that: a handle-owner with a `dispose()` that mirrors the
 * base-dtor semantics (@0xd02990).
 *
 * The vtable slot layout is not decoded here (no virtual methods observed in
 * the two dtors). If subclasses land later they'll extend this base.
 */
export class FFAudioFile {
  /**
   * Object field @+0x8: the ExtAudioFileRef, or null when closed.
   *   @0xd029a4 movq 0x8(%rdi), %rdi   (load field)
   *   @0xd029b6 movq $0x0, 0x8(%rbx)   (D1 clears on success)
   */
  protected _file: ExtAudioFileRef | null = null;

  /**
   * Optional injected disposer. When present, ~FFAudioFile invokes it as
   * ExtAudioFileDispose would. Returns OSStatus (0 = noErr). If not injected
   * we treat a non-null handle as un-decoded backend and throw — this is the
   * demand signal, per porting spec (no fabricated behavior).
   */
  protected _disposer: ExtAudioFileDisposeFn | null = null;

  constructor(file: ExtAudioFileRef | null = null, disposer: ExtAudioFileDisposeFn | null = null) {
    this._file = file;
    this._disposer = disposer;
  }

  /**
   * FFAudioFile::~FFAudioFile()  @0xd02990  (D1 / D2, non-deleting)
   *
   * Faithful asm mirror:
   *   @0xd0299a  leaq  0xc0e24f(%rip), %rax    // load vtable_for_FFAudioFile+0x10
   *   @0xd029a1  movq  %rax, (%rdi)            // this->vptr = &FFAudioFile_vtable[+2]
   *   @0xd029a4  movq  0x8(%rdi), %rdi         // rdi = this->_file
   *   @0xd029a8  testq %rdi, %rdi              // if _file == null:
   *   @0xd029ab  je    0xd029be                //   goto ret
   *   @0xd029ad  callq _ExtAudioFileDispose    // status = ExtAudioFileDispose(_file)
   *   @0xd029b2  testl %eax, %eax              // if status != 0:
   *   @0xd029b4  jne   0xd029c3                //   throw CAXException("ExtAudioFileClose failed", status)
   *   @0xd029b6  movq  $0x0, 0x8(%rbx)         // this->_file = null
   *   @0xd029be  ret
   *
   * Exception path @0xd029c3..0xd029f6:
   *   allocate CAXException, construct with ("ExtAudioFileClose failed", status),
   *   __cxa_throw with typeinfo for CAXException.
   *
   * In TS we call `dispose()` which returns void and throws CAXException on error.
   */
  dispose(): void {
    // @0xd029a4..0xd029ab
    const file = this._file;
    if (file === null || file === undefined) {
      return;
    }
    // @0xd029ad — invoke ExtAudioFileDispose(file). Without an injected
    // disposer we cannot fabricate the CoreAudio call; the raw-port surfaces
    // this as an undecoded frontier by throwing.
    if (this._disposer === null) {
      throw new Error(
        "FFAudioFile.dispose: no ExtAudioFileDispose backend injected — undecoded frontier @0xd029ad (symbol stub _ExtAudioFileDispose)"
      );
    }
    const status = this._disposer(file) | 0; // OSStatus is SInt32
    // @0xd029b2..0xd029b4
    if (status !== 0) {
      // @0xd029c3..0xd029f1 — throw CAXException("ExtAudioFileClose failed", status).
      throw new CAXException("ExtAudioFileClose failed", status);
    }
    // @0xd029b6 — clear field on success (only D1 does this; D0 skips it).
    this._file = null;
  }

  /**
   * FFAudioFile::~FFAudioFile()  @0xd02a20  (D0, deleting dtor)
   *
   * Faithful asm mirror:
   *   @0xd02a2a  leaq  0xc0e1bf(%rip), %rax   // same vtable slot as D1
   *   @0xd02a31  movq  %rax, (%rdi)
   *   @0xd02a34  movq  0x8(%rdi), %rdi
   *   @0xd02a38  testq %rdi, %rdi
   *   @0xd02a3b  je    0xd02a46                // skip Dispose if null
   *   @0xd02a3d  callq _ExtAudioFileDispose
   *   @0xd02a42  testl %eax, %eax
   *   @0xd02a44  jne   0xd02a52                // throw on failure
   *   @0xd02a46  movq  %rbx, %rdi
   *   @0xd02a49  popq  %rbx
   *   @0xd02a4a  popq  %r14
   *   @0xd02a4c  popq  %rbp
   *   @0xd02a4d  jmp   __ZdlPv                 // tail-call operator delete(this)
   *
   * Note: D0 does NOT clear `this->_file` on success (@0xd02a44 falls through
   * straight to the operator-delete tail-call). This is the sole observable
   * difference from D1. In JS there is no "operator delete"; we just clear
   * our own references so the JS GC can reap the wrapper.
   */
  destroyAndDelete(): void {
    // @0xd02a34..0xd02a44 — identical to dispose() body but WITHOUT the
    // this->_file = null store on success.
    const file = this._file;
    if (file !== null && file !== undefined) {
      if (this._disposer === null) {
        throw new Error(
          "FFAudioFile.destroyAndDelete: no ExtAudioFileDispose backend injected — undecoded frontier @0xd02a3d (symbol stub _ExtAudioFileDispose)"
        );
      }
      const status = this._disposer(file) | 0;
      if (status !== 0) {
        // @0xd02a52..0xd02a80 — throw CAXException.
        throw new CAXException("ExtAudioFileClose failed", status);
      }
      // Intentionally NOT clearing _file here to mirror D0's asm.
    }
    // @0xd02a4d — tail jmp to operator delete. JS has GC, so we just drop
    // our references and let the wrapper get collected.
    this._disposer = null;
  }
}
