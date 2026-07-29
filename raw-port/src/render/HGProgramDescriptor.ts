/**
 * HGProgramDescriptor — describes a Metal shader program (fragment, vertex, visible variants),
 * plus its argument/return bindings, inputs, and shader-declaration encoding.
 *
 * Ported from FCP framework: **Helium**.
 *   binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
 *
 * This file is being ported incrementally. Every exported symbol MUST cite its `@0xADDR`. Every
 * undecoded callee is a throwing stub with its addr. See raw-port/army/PORTING_SPEC.md.
 *
 * ==== Struct layout (recovered from ctors + accessor disasm) =============================
 *
 *   offset  field                                type         source
 *   0x00                                                       (vtable / header)
 *   0x10    vertexFunctionName                   std::string  (SetVertexFunctionName @0x16d8b0
 *                                                              writes basic_string::assign at +0x10;
 *                                                              GetVertexFunctionName @0x16d8f0 reads
 *                                                              SSO byte at +0x10, heap ptr at +0x20)
 *   0x28    fragmentFunctionName                 std::string  (SetFragmentFunctionName @0x16d8a0
 *                                                              writes at +0x28; GetFragmentFunctionName
 *                                                              @0x16cde0 reads SSO byte at +0x28,
 *                                                              heap ptr at +0x38, with a "fragmentFunc"
 *                                                              default when empty)
 *   0x40    fragmentShaderSource                 std::string  (SetVisibleShaderWithSource @0x16e6b0
 *                                                              writes source at +0x40)
 *                                                              also used by SetVisibleShaderWithLibrary
 *                                                              @0x16e6e0 (writes library name at +0x40).
 *   0x58    fragmentMetalLibraryName             std::string  (SetFragmentShaderWithLibrary @0x16e680
 *                                                              writes second arg at +0x58; also
 *                                                              SetVertexShaderWithLibrary @0x16e650
 *                                                              writes second arg at +0x58)
 *   0x58    metalLibPath (aliased slot — SEE     std::string  (SetMetalLibPath @0x16d8c0 writes at
 *           IsMergeable/IsComplete disasm which                +0x58; GetMetalLibPath @0x16d8d0 reads
 *           read length via SSO/heap at +0x58                  SSO byte at +0x58, heap ptr at +0x68)
 *           → same slot as fragmentMetalLibraryName;
 *           the class overloads the meaning.)
 *   0x70    inputs                               vector<pair<InputType, HGRef<HGProgramDescriptor>>>
 *                                                              (SetInput @0x168140 and @0x168210
 *                                                              write at +0x70/+0x78; sizeof(pair)=0x30)
 *   0x88    (std::string slot — SEE IsComplete)  std::string  (IsComplete reads byte at +0x88 and
 *                                                              heap ptr at +0x90 with std::string SSO
 *                                                              layout)  — vertexShaderSource? library?
 *                                                              Named `mysterySlot_0x88` until a caller
 *                                                              disambiguates it.
 *   0x88    shaderProgram                        std::string  (SetShaderProgram @0x16e630 writes at
 *                                                              +0x88 — SAME slot as mysterySlot_0x88;
 *                                                              they alias.)
 *   0xa0    vertexShaderSourceOrLibrary          std::string  (SetVisibleShaderWithSource @0x16e6b0
 *                                                              writes second arg at +0xa0;
 *                                                              SetVisibleShaderWithLibrary @0x16e6e0
 *                                                              writes second arg at +0xa0.)
 *   0xb8    returnAttribute (int32)              uint32       (getReturnAttribute @0x16ce90 reads
 *                                                              32-bit at +0xb8; SetReturnBinding
 *                                                              @0x167f30 writes InputType at +0xb8)
 *   0xc0    returnBinding.name (std::string)     std::string  (SetReturnBinding @0x167f30 assigns
 *                                                              basic_string at +0xc0 from +0x8 of
 *                                                              the argument HGBinding)
 *   0xd8    returnBinding.tail (16 bytes)        u128         (SetReturnBinding movups xmm0
 *                                                              +0x20(%rbx) -> +0xd8(this))
 *   0xe8    argumentBindings                     vector<HGBinding>
 *                                                              (SetArgumentBindings @0x167f70 writes
 *                                                              at +0xe8; sizeof(HGBinding)=0x30)
 *   0x100   stageInBindings                      vector<HGBinding>
 *                                                              (SetStageInBindings @0x168100 writes
 *                                                              at +0x100)
 *
 * NOTE: precise sizeof(HGProgramDescriptor) is not enforced — TS is not laying out C++ memory.
 * We model each field as an owned property; the offsets above are provenance only.
 */

// ---------- Types ----------

/**
 * `HGProgramDescriptor::InputType` — passed to `SetInput(size_t, InputType)` and used as the
 * `first` of the input-vector pair.
 *
 * Values recovered from `SetArgumentBindings` @0x167f70 disasm:
 *   - `HGBinding::type == 9` (arg-type "input"?) => `InputType::1` (stored as `mov 1,(rax)`)
 *   - `HGBinding::type == 0xA` (arg-type "input2"?) => `InputType::2` (stored as `mov 2,(rax)`)
 * Other values (including the plain `SetInput(idx, InputType)` @0x168210 path) accept any int32.
 * We model this as a raw uint32 tag; string enums would be a paraphrase (P1/P2 hazard).
 */
export type HGProgramDescriptorInputType = number;

/**
 * `HGBinding` — the binding record described by call-sites into SetReturnBinding / SetArgumentBindings.
 * From SetReturnBinding @0x167f30:
 *   - offset  0: uint32   type      (`movl (%rsi), %eax` → `%eax, 0xb8(%rdi)`; also SetArgBind reads
 *                                    `movl (%rax,%r12), %eax` at same offset)
 *   - offset  8: std::string name   (SetReturnBinding calls basic_string::operator= with `%rsi+8`)
 *   - offset 0x20: 16 bytes tail    (movups xmm0 read from +0x20; sizeof(HGBinding)=0x30)
 * We keep this as an opaque record here (owning class HGBinding lives in its own file).
 */
export interface HGBinding {
  /** `+0x00` uint32 tag (recovered from SetReturnBinding movl (%rsi),%eax). */
  type: number;
  /** `+0x08` std::string name. In TS: string. */
  name: string;
  /** `+0x20` 16 bytes tail (2×u64 or 4×u32). Preserved verbatim as a byte array. */
  tail: Uint8Array;
}

/**
 * `HGProgramDescriptor::Dependency` — record type used by `privateGetDependencies` (@0x16d3e0)
 * to append into a `std::vector<Dependency>`. Full struct layout is recovered when that method is
 * transcribed. Modeled here as an opaque record pending decode.
 */
export interface HGProgramDescriptorDependency {
  /** Opaque tail — decoded when privateGetDependencies is ported. See addr @0x16d3e0. */
  readonly __opaque: true;
}

// ---------- Class ----------

/**
 * HGProgramDescriptor — the C++ class. In FCP this is a heap-allocated ref-counted `HGObject`
 * subclass; here we mirror only the observable state its methods read/write.
 *
 * Fields are named per the recovered layout above. Each field cites the accessor that established
 * it. The vtable and refcount slots (offsets 0..0x0F) are not modeled — no ported method reads
 * them yet.
 */
export class HGProgramDescriptor {
  /** `+0x10` — vertex function name.        (Set@0x16d8b0 / Get@0x16d8f0)          */
  vertexFunctionName: string = "";
  /** `+0x28` — fragment function name.      (Set@0x16d8a0 / Get@0x16cde0)          */
  fragmentFunctionName: string = "";
  /**
   * `+0x40` — visible-shader source (or library name when set via `SetVisibleShaderWithLibrary`
   * or `SetFragmentShaderWithLibrary`).  (Set@0x16e6b0 / Set@0x16e6e0 / Set@0x16e680)
   */
  fragmentShaderSource: string = "";
  /**
   * `+0x58` — metal library path (Set@0x16d8c0 / Get@0x16d8d0); ALSO used by
   * `SetFragmentShaderWithLibrary` @0x16e680 and `SetVertexShaderWithLibrary` @0x16e650 which
   * write their 2nd argument here. The class overloads this slot; we mirror that overloading.
   */
  metalLibPath: string = "";
  /** `+0x70` — inputs. sizeof(pair) = 0x30. (Set/mutated by SetInput @0x168140, @0x168210).      */
  inputs: Array<[HGProgramDescriptorInputType, HGProgramDescriptor | null]> = [];
  /**
   * `+0x88` — shader program string (Set@0x16e630); ALSO the field read by `IsComplete` @0x167de0
   * and `EncodeShaderProgram` @0x16cea0 (SSO byte @+0x88, heap ptr @+0x90).
   */
  shaderProgram: string = "";
  /**
   * `+0xa0` — visible-shader second arg (fragment source variant name or library-function name).
   * Set@0x16e6b0 (SetVisibleShaderWithSource) and Set@0x16e6e0 (SetVisibleShaderWithLibrary) both
   * write it. IsMergeable/IsConcatenated/IsComplete all probe SSO byte at +0xa0 and heap ptr at
   * +0xa8.
   */
  visibleShaderSecondArg: string = "";
  /** `+0xb8` — return attribute (uint32). getReturnAttribute@0x16ce90 returns `[+0xb8]` as int32. */
  returnAttribute: number = 0;
  /** `+0xc0` / `+0xd8` — return binding, written by SetReturnBinding @0x167f30. */
  returnBinding: HGBinding = { type: 0, name: "", tail: new Uint8Array(16) };
  /** `+0xe8` — argument bindings vector.   (SetArgumentBindings@0x167f70)                 */
  argumentBindings: HGBinding[] = [];
  /** `+0x100` — stage-in bindings vector.  (SetStageInBindings@0x168100)                  */
  stageInBindings: HGBinding[] = [];

  // ---------------------------------------------------------------------------------------
  // trivial setters — all `pushq rbp; addq $OFF, rdi; jmp basic_string::assign(char const*)`.
  // See raw-port/re/disasm/Helium.HGProgramDescriptor.Set*.s.
  // ---------------------------------------------------------------------------------------

  /**
   * `HGProgramDescriptor::SetFragmentFunctionName(char const*)` @Helium 0x16d8a0.
   * Body (5 instructions): `add rdi, 0x28 ; jmp basic_string::assign(char const*)`.
   * i.e. `this.fragmentFunctionName = name`. See re/disasm/Helium.HGProgramDescriptor.SetFragmentFunctionName.s.
   */
  SetFragmentFunctionName(name: string): void {
    this.fragmentFunctionName = name;
  }

  /**
   * `HGProgramDescriptor::SetVertexFunctionName(char const*)` @Helium 0x16d8b0.
   * Body: `add rdi, 0x10 ; jmp basic_string::assign(char const*)`.
   * See re/disasm/Helium.HGProgramDescriptor.SetVertexFunctionName.s.
   */
  SetVertexFunctionName(name: string): void {
    this.vertexFunctionName = name;
  }

  /**
   * `HGProgramDescriptor::SetMetalLibPath(char const*)` @Helium 0x16d8c0.
   * Body: `add rdi, 0x58 ; jmp basic_string::assign(char const*)`.
   * See re/disasm/Helium.HGProgramDescriptor.SetMetalLibPath.s.
   */
  SetMetalLibPath(path: string): void {
    this.metalLibPath = path;
  }

  /**
   * `HGProgramDescriptor::SetShaderProgram(char const*)` @Helium 0x16e630.
   * Body: `add rdi, 0x88 ; jmp basic_string::assign(char const*)`.
   * See re/disasm/Helium.HGProgramDescriptor.SetShaderProgram.s.
   */
  SetShaderProgram(program: string): void {
    this.shaderProgram = program;
  }

  // ---------------------------------------------------------------------------------------
  // 2-arg setters — two consecutive basic_string::assign calls at documented offsets.
  // ---------------------------------------------------------------------------------------

  /**
   * `HGProgramDescriptor::SetVertexShaderWithLibrary(char const*, char const*)` @Helium 0x16e650.
   * Body: assign(this+0x10, arg1) ; assign(this+0x58, arg2).
   *   => this.vertexFunctionName = funcName; this.metalLibPath = libraryName.
   * See re/disasm/Helium.HGProgramDescriptor.SetVertexShaderWithLibrary.s.
   */
  SetVertexShaderWithLibrary(funcName: string, libraryName: string): void {
    this.vertexFunctionName = funcName;
    this.metalLibPath = libraryName;
  }

  /**
   * `HGProgramDescriptor::SetFragmentShaderWithLibrary(char const*, char const*)` @Helium 0x16e680.
   * Body: assign(this+0x28, arg1) ; assign(this+0x58, arg2).
   *   => this.fragmentFunctionName = funcName; this.metalLibPath = libraryName.
   * See re/disasm/Helium.HGProgramDescriptor.SetFragmentShaderWithLibrary.s.
   */
  SetFragmentShaderWithLibrary(funcName: string, libraryName: string): void {
    this.fragmentFunctionName = funcName;
    this.metalLibPath = libraryName;
  }

  /**
   * `HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*)` @Helium 0x16e6b0.
   * Body: assign(this+0x40, arg1) ; assign(this+0xa0, arg2).
   *   => this.fragmentShaderSource = arg1 (a shader-symbol name);
   *      this.visibleShaderSecondArg = arg2 (the actual Metal source text).
   * See re/disasm/Helium.HGProgramDescriptor.SetVisibleShaderWithSource.s.
   */
  SetVisibleShaderWithSource(shaderSymbol: string, shaderSource: string): void {
    this.fragmentShaderSource = shaderSymbol;
    this.visibleShaderSecondArg = shaderSource;
  }

  /**
   * `HGProgramDescriptor::SetVisibleShaderWithLibrary(char const*, char const*)` @Helium 0x16e6e0.
   * Body: assign(this+0x40, arg1) ; assign(this+0x58, arg2).
   *   => this.fragmentShaderSource = arg1; this.metalLibPath = arg2.
   * See re/disasm/Helium.HGProgramDescriptor.SetVisibleShaderWithLibrary.s.
   *
   * NOTE: SetVisibleShaderWithLibrary writes its 2nd arg to +0x58 (metalLibPath), NOT to +0xa0
   * like SetVisibleShaderWithSource does. This is a real semantic difference (library vs source).
   */
  SetVisibleShaderWithLibrary(shaderSymbol: string, libraryName: string): void {
    this.fragmentShaderSource = shaderSymbol;
    this.metalLibPath = libraryName;
  }

  // ---------------------------------------------------------------------------------------
  // trivial getters
  // ---------------------------------------------------------------------------------------

  /**
   * `HGProgramDescriptor::getReturnAttribute() const` @Helium 0x16ce90.
   * Body: `mov eax, [rdi + 0xb8] ; ret`. Returns the 32-bit `returnAttribute` slot.
   * See re/disasm/Helium.HGProgramDescriptor.getReturnAttribute.s.
   */
  getReturnAttribute(): number {
    return this.returnAttribute >>> 0;
  }

  /**
   * `HGProgramDescriptor::GetVertexFunctionName() const` @Helium 0x16d8f0.
   * Body: std::string c_str() at offset +0x10 — `mov rax, rdi ; testb $1, [rdi+0x10] ; jne heap
   * ; add rax, 0x11 ; ret ; heap: mov rax, [rax+0x20] ; ret`. Just returns the string.
   * See re/disasm/Helium.HGProgramDescriptor.GetVertexFunctionName.s.
   */
  GetVertexFunctionName(): string {
    return this.vertexFunctionName;
  }

  /**
   * `HGProgramDescriptor::GetMetalLibPath() const` @Helium 0x16d8d0.
   * Body: std::string c_str() at offset +0x58 (analogous to GetVertexFunctionName).
   * See re/disasm/Helium.HGProgramDescriptor.GetMetalLibPath.s.
   */
  GetMetalLibPath(): string {
    return this.metalLibPath;
  }

  /**
   * `HGProgramDescriptor::GetFragmentFunctionName() const` @Helium 0x16cde0.
   *
   * ICF-folded — otool -tV emits no label at 0x16cde0. Decoded by hand from raw bytes at file
   * offset 0x16cde0 of /tmp/Helium.x86_64 with capstone; verified via `nm -arch x86_64 -n` which
   * places `__ZNK19HGProgramDescriptor23GetFragmentFunctionNameEv` at exactly 0x16cde0. Raw bytes:
   *
   *   55                          push  rbp
   *   48 89 e5                    mov   rbp, rsp
   *   0f b6 47 28                 movzx eax, byte [rdi+0x28]         ; std::string SSO byte
   *   a8 01                       test  al, 1                        ; heap-flag?
   *   75 13                       jne   0x16cdff
   *   48 83 c7 29                 add   rdi, 0x29                    ; SSO chars start at +0x29
   *   84 c0                       test  al, al                       ; SSO length (already shifted-out
   *                                                                    of the flag bit) == 0?
   *   48 8d 05 1e de 74 00        lea   rax, [rip + 0x74de1e]        ; -> "fragmentFunc" @ 0x8bac17
   *   48 0f 45 c7                 cmovne rax, rdi                    ; if not empty, return SSO ptr
   *   5d                          pop   rbp
   *   c3                          ret
   *   ; heap branch (bit 0 of length byte set)
   *   48 83 7f 30 00              cmp   qword [rdi+0x30], 0          ; heap size == 0?
   *   74 06                       je    0x16ce0c
   *   48 8b 47 38                 mov   rax, [rdi+0x38]              ; heap data ptr
   *   5d ; c3                     pop rbp ; ret
   *   ; heap empty branch
   *   48 8d 05 04 de 74 00        lea   rax, [rip + 0x74de04]        ; -> "fragmentFunc" (same string)
   *   5d ; c3                     pop rbp ; ret
   *
   * Semantics: return the fragment function name, defaulting to the literal `"fragmentFunc"` when
   * the string is empty (BOTH the SSO-empty AND the heap-empty branches load the SAME cstring
   * literal at __cstring 0x8bac17). The RIP-rel address 0x8bac17 was verified by reading the thin
   * slice: bytes at file offset 0x8bac17 are `fragmentFunc\0`.
   *
   * NOTE: `SetFragmentFunctionName` at +0x28 (see @0x16d8a0) is what this getter reads back.
   */
  GetFragmentFunctionName(): string {
    // decoded default: literal "fragmentFunc" @ __cstring 0x8bac17 (Helium.x86_64).
    return this.fragmentFunctionName.length !== 0 ? this.fragmentFunctionName : "fragmentFunc";
  }
}
