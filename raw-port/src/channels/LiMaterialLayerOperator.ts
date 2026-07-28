// LiMaterialLayerOperator.ts — Ozone's "no-op" material layer operator.
// Faithful transcription of the four exported symbols in Ozone.framework:
//
//   @0x00000000001e30d0  LiMaterialLayerOperator::~LiMaterialLayerOperator()  [D1]
//                        __ZN23LiMaterialLayerOperatorD1Ev
//   @0x00000000001e3100  LiMaterialLayerOperator::~LiMaterialLayerOperator()  [D0 — deleting]
//                        __ZN23LiMaterialLayerOperatorD0Ev
//   @0x00000000001e3140  LiMaterialLayerOperator::eval(LayerContext const&, SurfaceProperties&)
//                        __ZN23LiMaterialLayerOperator4evalERK12LayerContextR17SurfaceProperties
//   @0x00000000001e3160  LiMaterialLayerOperator::eval(LayerContext const&, ProShade::VarT<ProShade::Node>&)
//                        __ZN23LiMaterialLayerOperator4evalERK12LayerContextRN8ProShade4VarTINS3_4NodeEEE
//
// The brief lists both eval symbols as if there were two @0x1e3140 + @0x1e3160
// entries; the Ozone binary shows they are TWO independent overloads with
// byte-identical bodies (each just prints "no op\n" to std::cerr). Both are
// covered here.
//
// Frontier / imports referenced (resolved via `resolve.py Ozone stub <addr>`):
//   0x006de4fc  __ZN18PC_Sp_counted_base12weak_releaseEv
//                    PC_Sp_counted_base::weak_release()
//   0x006dfc36  __ZdlPv
//                    operator delete(void*)  — tail-jump from D0
//   __ZTV13PCShared_base  installed pointer = __ZTV13PCShared_base + 0x10
//                    (ProCore's PCShared_base vtable is ported in
//                     raw-port/src/infra/PCShared_base.ts).
//   __ZNSt3__14cerrE / __put_character_sequence[abi:nqe210106]
//                    std::cerr and the internal "write literal to ostream"
//                    helper — a libc++ runtime import, not transcribed.
//
// STRUCT LAYOUT (recovered from both destructor bodies — the class has ONLY
// three observable slots; no vptr at +0x00 in these methods):
//   +0x00  <unknown / inherited base subobject>  (untouched by these dtors)
//   +0x08  vptr                        D1 @0x1e30d4..@0x1e30df: `leaq
//                                       __ZTV13PCShared_base(%rip), %rax ;
//                                       addq $0x10, %rax ; movq %rax, 0x8(%rdi)`
//                                       (installed vptr for the PCShared_base
//                                       subobject at +0x08 — Itanium ABI
//                                       reinstall-vptr-before-teardown).
//   +0x10  PC_Sp_counted_base*         D1 @0x1e30e3..@0x1e30ea: `movq
//                                       0x10(%rdi), %rdi ; testq %rdi,%rdi ;
//                                       je ...` — nullable weak-count backref.
//                                       When non-null the dtor tail-calls
//                                       __ZN18PC_Sp_counted_base12weak_releaseEv
//                                       (@0x1e30ec) — same shape as
//                                       PCBlendOptions +0x28 (see
//                                       raw-port/src/infra/PCBlendOptions.ts).

/**
 * `LayerContext` — forward-declared reference-only parameter type. Its
 * internals aren't touched by either eval body (the whole method is just
 * one std::cerr write), so we intentionally leave it opaque. */
export interface LayerContext {}

/** `SurfaceProperties` — same deal: only referenced by name in the mangled
 *  symbol; never dereferenced by the "no op" body @0x1e3140. */
export interface SurfaceProperties {}

/** `ProShade::Node` — placeholder for the ProShade shading-graph node type
 *  named in the second eval overload's signature. Never dereferenced by
 *  the body @0x1e3160. */
export interface ProShadeNode {}

/** `ProShade::VarT<T>` — the ProShade "variable box" template. Only its
 *  name appears in the second eval overload's mangled symbol. Untouched
 *  by the body @0x1e3160. */
export interface ProShadeVarT<T> {
  /** Placeholder — the field layout of VarT<Node> is not observed here.
   *  Kept generic so the type parameter is preserved. */
  __phantom?: T;
}

/**
 * `PC_Sp_counted_base::weak_release()` — external symbol stub at
 * @Ozone 0x006de4fc (__ZN18PC_Sp_counted_base12weak_releaseEv). Same
 * throwing-stub shape used by raw-port/src/infra/PCBlendOptions.ts for the
 * identical symbol. Called from both dtors when +0x10 is non-null.
 * Not yet transcribed (undecoded @0x006de4fc).
 */
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release() @Ozone stub 0x006de4fc " +
      "(__ZN18PC_Sp_counted_base12weak_releaseEv) not yet transcribed",
  );
}

/**
 * `operator delete(void*)` — external symbol stub at @Ozone 0x006dfc36
 * (__ZdlPv). Modeled as a no-op in the GC'd runtime; the D0 dtor tail-
 * jumps to this after the D1-equivalent teardown (@0x1e312f).
 */
function operator_delete_stub(_p: unknown): void {
  // no-op: the GC'd JS runtime frees the object automatically.
}

/**
 * `std::cerr << "no op\n"` — modeled as a call to the runtime's
 * console.error. The libc++ helper
 * `std::__put_character_sequence<char, char_traits<char>>(std::cerr,
 *  "no op\n", 6)` is a runtime import, not transcribed. Both eval bodies
 * jump to it with %rdi = std::cerr, %rsi = "no op\n", %rdx = 6.
 */
function stderr_write_no_op(): void {
  // Faithful behavior of the tail-jmp @0x1e3158 / @0x1e3178:
  //   __put_character_sequence[abi:nqe210106](std::cerr, "no op\n", 6)
  console.error("no op");
}

/**
 * `LiMaterialLayerOperator` — a material-layer operator whose two eval
 * overloads are both stubbed to print `"no op\n"`. The class exists solely
 * as a placeholder inside Ozone's material-layer pipeline (both D1 and D0
 * dtors are the standard PCShared_base subobject teardown, no fields owned
 * beyond the +0x10 weak-count back-pointer).
 */
export class LiMaterialLayerOperator {
  /**
   * @Ozone LiMaterialLayerOperator +0x08 — vptr slot for the PCShared_base
   * subobject at +0x08. Both dtors reinstall it to
   * `__ZTV13PCShared_base + 0x10` (D1 @0x1e30d4, D0 @0x1e3109). Modeled as
   * a string tag so the reinstall is observable at runtime. */
  vptr_at_0x08: string = "";

  /**
   * @Ozone LiMaterialLayerOperator +0x10 — nullable `PC_Sp_counted_base*`
   * back-pointer. When non-null on destruction the dtor calls
   * `weak_release` on it (D1 @0x1e30ec, D0 @0x1e3121). Modeled as
   * `unknown`; NULL is `null`. */
  spCountedBasePtr_at_0x10: unknown = null;

  /**
   * `LiMaterialLayerOperator::~LiMaterialLayerOperator()` D1 (non-deleting)
   * @Ozone 0x1e30d0 (__ZN23LiMaterialLayerOperatorD1Ev).
   *
   * Full body (all @Ozone):
   *   0x1e30d0  pushq %rbp / movq %rsp,%rbp
   *   0x1e30d4  leaq  __ZTV13PCShared_base(%rip), %rax
   *   0x1e30db  addq  $0x10, %rax                        ; rax = installed vptr
   *   0x1e30df  movq  %rax, 0x8(%rdi)                    ; this->+0x08 = vptr
   *   0x1e30e3  movq  0x10(%rdi), %rdi                   ; rdi = this->+0x10
   *   0x1e30e7  testq %rdi, %rdi
   *   0x1e30ea  je    0x1e30f1                           ; if NULL skip
   *   0x1e30ec  callq __ZN18PC_Sp_counted_base12weak_releaseEv
   *   0x1e30f1  popq  %rbp / retq
   *   0x1e30f3  <landing pad>: movq %rax,%rdi ; callq ___clang_call_terminate
   *
   * The Ozone binary maps BOTH the D2 (base) and D1 (complete) manglings to
   * this same address block (the demangled `D0Ev/D1Ev` symbols); there is
   * no separate D2 body (empty class, no members needing separate teardown).
   */
  destructor_D1(): void {
    // @0x1e30d4..@0x1e30df — reinstall PCShared_base vptr at +0x08.
    this.vptr_at_0x08 = "__ZTV13PCShared_base+0x10";
    // @0x1e30e3..@0x1e30ea — load +0x10, null-check, then weak_release.
    const p = this.spCountedBasePtr_at_0x10;
    if (p !== null) {
      // @0x1e30ec — callq __ZN18PC_Sp_counted_base12weak_releaseEv
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0x1e30f1 — retq
  }

  /**
   * `LiMaterialLayerOperator::~LiMaterialLayerOperator()` D0 (deleting)
   * @Ozone 0x1e3100 (__ZN23LiMaterialLayerOperatorD0Ev).
   *
   * Full body (all @Ozone):
   *   0x1e3100  pushq %rbp / movq %rsp,%rbp
   *   0x1e3104  pushq %rbx / pushq %rax
   *   0x1e3106  movq  %rdi, %rbx                         ; rbx = this
   *   0x1e3109  leaq  __ZTV13PCShared_base(%rip), %rax
   *   0x1e3110  addq  $0x10, %rax
   *   0x1e3114  movq  %rax, 0x8(%rdi)                    ; this->+0x08 = vptr
   *   0x1e3118  movq  0x10(%rdi), %rdi                   ; rdi = this->+0x10
   *   0x1e311c  testq %rdi, %rdi
   *   0x1e311f  je    0x1e3126
   *   0x1e3121  callq __ZN18PC_Sp_counted_base12weak_releaseEv
   *   0x1e3126  movq  %rbx, %rdi                         ; rdi = this (restore)
   *   0x1e3129  addq  $0x8, %rsp / popq %rbx / popq %rbp
   *   0x1e312f  jmp   __ZdlPv                            ; tail-call operator delete
   *   0x1e3134  <landing pad>: movq %rax,%rdi ; callq ___clang_call_terminate
   *
   * This is D1-equivalent body followed by `operator delete(this)`.
   */
  destructor_D0(): void {
    // @0x1e3109..@0x1e3114 — reinstall PCShared_base vptr at +0x08.
    this.vptr_at_0x08 = "__ZTV13PCShared_base+0x10";
    // @0x1e3118..@0x1e311f — nullable weak-count release.
    const p = this.spCountedBasePtr_at_0x10;
    if (p !== null) {
      // @0x1e3121 — callq __ZN18PC_Sp_counted_base12weak_releaseEv
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0x1e312f — jmp __ZdlPv (operator delete on `this`).
    operator_delete_stub(this);
  }

  /**
   * `LiMaterialLayerOperator::eval(LayerContext const&, SurfaceProperties&)`
   * @Ozone 0x1e3140
   * (__ZN23LiMaterialLayerOperator4evalERK12LayerContextR17SurfaceProperties).
   *
   * Full body (all @Ozone):
   *   0x1e3140  pushq %rbp / movq %rsp,%rbp
   *   0x1e3144  movq  __ZNSt3__14cerrE(%rip), %rdi       ; rdi = &std::cerr
   *   0x1e314b  leaq  "no op\n"(%rip), %rsi              ; rsi = "no op\n"
   *   0x1e3152  movl  $0x6, %edx                         ; rdx = 6
   *   0x1e3157  popq  %rbp
   *   0x1e3158  jmp   __ZNSt3__124__put_character_sequence... ; tail-jmp
   *
   * The tail-jmp target is libc++'s internal helper that emits a byte
   * sequence to an ostream — modeled as `console.error("no op")` here.
   */
  eval(_ctx: LayerContext, _out: SurfaceProperties): void {
    // @0x1e3144..@0x1e3158 — write "no op\n" (6 bytes) to std::cerr.
    stderr_write_no_op();
  }

  /**
   * `LiMaterialLayerOperator::eval(LayerContext const&,
   *  ProShade::VarT<ProShade::Node>&)` @Ozone 0x1e3160
   * (__ZN23LiMaterialLayerOperator4evalERK12LayerContextRN8ProShade4VarTINS3_4NodeEEE).
   *
   * Full body (all @Ozone) — byte-identical shape to the first overload:
   *   0x1e3160  pushq %rbp / movq %rsp,%rbp
   *   0x1e3164  movq  __ZNSt3__14cerrE(%rip), %rdi       ; rdi = &std::cerr
   *   0x1e316b  leaq  "no op\n"(%rip), %rsi              ; rsi = "no op\n"
   *   0x1e3172  movl  $0x6, %edx                         ; rdx = 6
   *   0x1e3177  popq  %rbp
   *   0x1e3178  jmp   __ZNSt3__124__put_character_sequence... ; tail-jmp
   */
  eval_varT(_ctx: LayerContext, _out: ProShadeVarT<ProShadeNode>): void {
    // @0x1e3164..@0x1e3178 — write "no op\n" (6 bytes) to std::cerr.
    stderr_write_no_op();
  }
}
