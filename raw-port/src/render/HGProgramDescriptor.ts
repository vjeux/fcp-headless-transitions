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
 *                                                              write at +0x70/+0x78; sizeof(pair)=0x10
 *                                                              — SetInput @0x168210 does `shl 0x4, %rsi`
 *                                                              on the index; layout is u32 InputType
 *                                                              at +0, HGRef ptr at +8.)
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

/**
 * `HGLimits` (used by `HGProgramDescriptor::GetSignature` @0x16d660) — a 48-byte struct populated
 * by seeding a sentinel + zeroing three 16-byte blocks + toggling a byte at +0x2a. Full field
 * decoding waits on `privateGetSignature` @0x16d6a0.
 */
export interface HGProgramDescriptorSignatureLimits {
  /** +0x00 sentinel u32 = 0x60b10 (395024). Written by GetSignature @0x16d678. */
  sentinel: number;
  /** +0x04..0x13 (16 bytes) — zeroed by GetSignature. */
  block04: Uint8Array;
  /** +0x14..0x23 (16 bytes) — zeroed by GetSignature. */
  block14: Uint8Array;
  /**
   * +0x20..0x2f (16 bytes) — zeroed by GetSignature, then byte at +0x2a set to 1 via
   * `movb $0x1, 0x2a(%rdi)`. Kept here so byte[0x0a] carries that flag.
   */
  block20: Uint8Array;
  /** Mirror of block20[0x0a] for callers that just want the flag. */
  flag2a: number;
}

/**
 * `HGMetalUtils::stringForMetalHeader()` @Helium — external utility, not yet decoded. Emits the
 * top-of-shader header block (Metal include lines). Called by EncodeShaderDeclarations @0x168302.
 * Throwing stub with call-site provenance.
 */
function HGMetalUtils_stringForMetalHeader__stub(): string {
  throw new Error(
    "HGMetalUtils::stringForMetalHeader @Helium not yet transcribed" +
      " (call-site: EncodeShaderDeclarations @0x168302)",
  );
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

  // ---------------------------------------------------------------------------------------
  // Binding & input setters
  // ---------------------------------------------------------------------------------------

  /**
   * `HGProgramDescriptor::SetReturnBinding(HGBinding)` @Helium 0x167f30.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.SetReturnBinding.s):
   *   1. `movl (%rsi), %eax ; movl %eax, 0xb8(%rdi)` — write `binding.type` (u32 at +0x00 of
   *      HGBinding) into `this.returnAttribute` (u32 at +0xb8).
   *   2. `addq $0xc0, %rdi ; addq $0x8, %rsi ; call basic_string::operator=(basic_string const&)` —
   *      copy-assign `binding.name` (std::string at +0x08 of HGBinding) into `this.returnBinding.name`
   *      (std::string at +0xc0).
   *   3. `movups 0x20(%rbx), %xmm0 ; movups %xmm0, 0xd8(%r14)` — copy 16 bytes from `+0x20` of
   *      the binding into `+0xd8` of `this` — the opaque "tail" of the binding.
   *
   * NOTE: this method writes BOTH `returnAttribute` (u32 at +0xb8) AND the return-binding record
   * (+0xc0/+0xd8). The `returnAttribute` slot is what `getReturnAttribute` @0x16ce90 reads.
   */
  SetReturnBinding(binding: HGBinding): void {
    this.returnAttribute = binding.type >>> 0;
    this.returnBinding = {
      type: binding.type >>> 0,
      name: binding.name,
      tail: new Uint8Array(binding.tail), // copy 16 bytes
    };
  }

  /**
   * `HGProgramDescriptor::SetArgumentBindings(std::vector<HGBinding> const&)` @Helium 0x167f70.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.SetArgumentBindings.s):
   *   (A) `addq $0xe8, %rdi ; cmpq %rsi, %rdi` — if `&this.argumentBindings == &input` (self-
   *       assignment) skip the copy. Otherwise call
   *       `vector<HGBinding>::__assign_with_size(begin, end, size)`.
   *   (B) Walk the copied `argumentBindings` linearly (element stride 0x30, per `imul r15,rcx`
   *       with `r15 = 0xAAAAAAAAAAAAAAAB` — the magic-multiply constant used for the /0x30
   *       division/multiplication that dodges an imul-by-a-non-power-of-two).
   *   (C) For each binding, examine `binding.type` (u32 at +0x00 of HGBinding):
   *         - if `binding.type == 9`  -> push `(InputType=1, HGRef=null)` onto `this.inputs` (@+0x70).
   *         - if `binding.type == 0xA` -> push `(InputType=2, HGRef=null)` onto `this.inputs`.
   *         - otherwise no input is pushed.
   *       The push uses `emplace_back_slow_path` when the vector is at capacity, or writes
   *       `mov [rax], InputType ; mov [rax+8], 0` directly when there's spare capacity.
   *
   * Semantic: replace `argumentBindings` and derive `inputs` entries from bindings whose types
   * are 9 (input) or 0xA (input2). Refcount juggling for the HGRef half is a no-op in TS.
   */
  SetArgumentBindings(bindings: readonly HGBinding[]): void {
    // (A) copy (with self-assign guard). We model owning-copy: rebuild the array.
    if (this.argumentBindings !== (bindings as unknown as HGBinding[])) {
      this.argumentBindings = bindings.map((b) => ({
        type: b.type >>> 0,
        name: b.name,
        tail: new Uint8Array(b.tail),
      }));
    }
    // (B)+(C) walk and push inputs for type==9 / type==0xA.
    for (const b of this.argumentBindings) {
      const t = b.type >>> 0;
      if (t === 0x9) {
        this.inputs.push([1, null]);
      } else if (t === 0xa) {
        this.inputs.push([2, null]);
      }
      // other types: no input push (fall through).
    }
  }

  /**
   * `HGProgramDescriptor::SetStageInBindings(std::vector<HGBinding> const&)` @Helium 0x168100.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.SetStageInBindings.s):
   *   `addq $0x100, %rdi ; cmpq %rsi, %rdi ; je ret` — self-assign guard on the stage-in vector
   *   at +0x100. Otherwise falls through to `vector<HGBinding>::__assign_with_size(begin, end,
   *   size)`. The stride is `sar rsi, 0x4 ; imul rcx, 0xAAAA...AB` = /0x30 (magic-multiply for
   *   sizeof(HGBinding)=0x30).
   *
   * Semantic: `this.stageInBindings = bindings` (copy). No side-effect on inputs.
   */
  SetStageInBindings(bindings: readonly HGBinding[]): void {
    if (this.stageInBindings !== (bindings as unknown as HGBinding[])) {
      this.stageInBindings = bindings.map((b) => ({
        type: b.type >>> 0,
        name: b.name,
        tail: new Uint8Array(b.tail),
      }));
    }
  }

  /**
   * `HGProgramDescriptor::SetInput(size_t idx, InputType t)` @Helium 0x168210.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.SetInput.s):
   *   ```
   *   rbx = this.inputs.begin (at +0x70); rax = this.inputs.end (at +0x78)
   *   size = (rax - rbx) >> 4                              ; stride 0x10 = sizeof(pair)
   *   if idx >= size: return                                ; bounds check
   *   offs = idx << 4
   *   *(rbx+offs)   = t                                     ; pair.first  = InputType (u32)
   *   rdi = *(rbx+offs+8)                                   ; old HGRef ptr
   *   if rdi != null: call *(rdi->vtable + 0x18) (release) ; pair.second = null
   *                   *(rbx+offs+8) = null
   *   ```
   * Semantic: `this.inputs[idx] = (t, null)`, guarded by bounds check. Old ref released (GC in TS).
   */
  SetInput_byType(idx: number, t: HGProgramDescriptorInputType): void {
    if (idx >>> 0 >= this.inputs.length) return;
    this.inputs[idx] = [t >>> 0, null];
  }

  /**
   * `HGProgramDescriptor::SetInput(size_t idx, HGRef<HGProgramDescriptor> const& ref)` @Helium
   * 0x168140. Overload of SetInput taking a ref instead of an InputType tag.
   *
   * Decoded (raw bytes via capstone, /tmp/Helium.x86_64 offset 0x168140 — otool -tV emits no label
   * here due to ICF folding neighbors, so we hand-decoded from the thin slice):
   *   ```
   *   size = ((this[+0x78] - this[+0x70]) >> 4)             ; stride 0x10
   *   if idx >= size: return                                ; bounds check
   *   newPtr = *(&ref)                                      ; deref HGRef -> raw ptr
   *   if newPtr == null:
   *       // just write null with the same shape as the byType overload:
   *       inputs[idx] = (InputType=0, null)                 ; releasing the old ptr if any
   *       return
   *   call *(newPtr->vtable + 0x10)                         ; retain newPtr
   *   inputs[idx].first  = InputType=0                      ; mov dword [rcx+rax], 0
   *   oldPtr = inputs[idx].second                           ; mov rdi, [rcx+rax+8]
   *   if oldPtr == newPtr:
   *       call *(newPtr->vtable + 0x18) (release once)      ; balance the retain
   *   else:
   *       if oldPtr != null: call *(oldPtr->vtable + 0x18)  ; release the old
   *       inputs[idx].second = newPtr                       ; mov [r14], rbx
   *   ```
   *
   * Semantic (ignoring retain/release which is GC-managed in TS): `this.inputs[idx] = (0, newRef)`
   * with bounds check, treating null newRef as clearing the slot.
   */
  SetInput_byRef(idx: number, ref: HGProgramDescriptor | null): void {
    if (idx >>> 0 >= this.inputs.length) return;
    this.inputs[idx] = [0, ref];
  }

  // ---------------------------------------------------------------------------------------
  // Predicates — all read SSO-vs-heap std::string length bytes at documented offsets, and
  // form boolean expressions over them. Documented mapping (Helium libc++ small-string layout):
  //
  //   `!fieldEmpty(off)` <=> `field.length > 0` where `field` is the std::string at `+off`.
  //   The C++ code path reads `[+off]` byte; if bit0=1 it's a heap-allocated string and the size
  //   lives at `[+off+8]`; if bit0=0 the byte's remaining bits (>>1) are the SSO length.
  //   In TS we just check `.length !== 0`.
  // ---------------------------------------------------------------------------------------

  /**
   * `HGProgramDescriptor::IsMergeable() const` @Helium 0x167d70.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.IsMergeable.s):
   *   Loads and length-tests `[+0x40]` (fragmentShaderSource), `[+0x58]` (metalLibPath), and
   *   `[+0xa0]` (visibleShaderSecondArg). Register `%dl` is set to `(+0x58 nonempty OR +0xa0
   *   nonempty)`; register `%al` is set to `+0x40 nonempty`; `andb %dl, %al` yields the answer.
   *
   * Semantic:
   *   IsMergeable <=> fragmentShaderSource.nonEmpty AND (metalLibPath.nonEmpty OR
   *                                                     visibleShaderSecondArg.nonEmpty)
   */
  IsMergeable(): boolean {
    const fragSourceNonEmpty = this.fragmentShaderSource.length !== 0;
    const otherNonEmpty =
      this.metalLibPath.length !== 0 || this.visibleShaderSecondArg.length !== 0;
    return fragSourceNonEmpty && otherNonEmpty;
  }

  /**
   * `HGProgramDescriptor::IsComplete() const` @Helium 0x167de0.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.IsComplete.s):
   *   Two-path structure. Path A tests `+0x40` (fragmentShaderSource) non-empty; if so, the answer
   *   is `+0x58 nonempty OR +0xa0 nonempty` (metalLibPath OR visibleShaderSecondArg). Path B
   *   (frag source empty) tests `+0x28` (fragmentFunctionName) non-empty AND
   *   `+0x58 nonempty OR +0x88 nonempty` (metalLibPath OR shaderProgram). Any other combination
   *   returns false.
   *
   * Semantic:
   *   IsComplete <=>
   *     (fragmentShaderSource.nonEmpty AND (metalLibPath.nonEmpty OR visibleShaderSecondArg.nonEmpty))
   *  OR (fragmentShaderSource.empty    AND fragmentFunctionName.nonEmpty
   *                                    AND (metalLibPath.nonEmpty OR shaderProgram.nonEmpty))
   */
  IsComplete(): boolean {
    const fragSourceNonEmpty = this.fragmentShaderSource.length !== 0;
    const metalLibNonEmpty = this.metalLibPath.length !== 0;
    const visible2NonEmpty = this.visibleShaderSecondArg.length !== 0;
    const fragFuncNonEmpty = this.fragmentFunctionName.length !== 0;
    const shaderProgNonEmpty = this.shaderProgram.length !== 0;
    if (fragSourceNonEmpty) {
      return metalLibNonEmpty || visible2NonEmpty;
    }
    return fragFuncNonEmpty && (metalLibNonEmpty || shaderProgNonEmpty);
  }

  /**
   * `HGProgramDescriptor::IsConcatenated() const` @Helium 0x167e90.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.IsConcatenated.s):
   *   First evaluates the same fragmentShaderSource / metalLibPath / visibleShaderSecondArg
   *   non-empty combination that IsMergeable uses (registers rcx / dl / rax carry the intermediate
   *   flags). If (frag_source nonempty AND (metalLib OR visible2 nonempty)) is FALSE, it returns 0.
   *   Otherwise it walks `this.inputs` (vector at +0x70/+0x78, stride 0x10) looking for an entry
   *   where `first == 0` AND `second != null`. If found, returns 1; else returns 0.
   *
   * The loop:
   *   ```
   *   rax = *(this+0x70); rcx = *(this+0x78)
   *   if rax == rcx: return 0            ; empty vector
   *   loop:
   *     if cmpl $0, [rax] != 0:  goto next   ; pair.first != 0 -> skip
   *     if cmpq $0, [rax+8] == 0: goto next  ; pair.second == null -> skip
   *     return 1
   *   next:
   *     rax += 0x10
   *     if rax != rcx: goto loop
   *   return 0
   *   ```
   *
   * Semantic:
   *   IsConcatenated <=> IsMergeable() AND (inputs contains some (0, non-null)).
   *   Where IsMergeable is inlined from IsMergeable @0x167d70 — both use the same +0x40/+0x58/
   *   +0xa0 non-empty formula.
   */
  IsConcatenated(): boolean {
    // Inlined IsMergeable disasm — same registers, same offsets. See @0x167d70.
    const fragSourceNonEmpty = this.fragmentShaderSource.length !== 0;
    const otherNonEmpty =
      this.metalLibPath.length !== 0 || this.visibleShaderSecondArg.length !== 0;
    if (!(fragSourceNonEmpty && otherNonEmpty)) return false;
    for (const [first, second] of this.inputs) {
      if (first === 0 && second !== null) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------------------
  // Shader encoders — public wrappers that IsMergeable-guard, reserve capacity, append template
  // literals, and delegate to the corresponding `private*` helper. The `private*` helpers do the
  // actual per-binding work and remain to be decoded (see the private-method stubs @0xADDRs below).
  // ---------------------------------------------------------------------------------------

  /**
   * `HGProgramDescriptor::EncodeShaderBufferStruct(std::string&) const` @Helium 0x168850.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.EncodeShaderBufferStruct.s):
   *   1. Run the IsMergeable predicate against `+0x40 / +0x58 / +0xa0`. If false, return without
   *      modifying `output`.
   *   2. `output.reserve(output.length + 0x116)` — 0x116 (278) is the pre-computed size overhead
   *      for the struct wrapper. Encoded via `andq $-0x2, %rax ; addq $0xff, %rax` on the SSO
   *      byte to derive the current-size term, `cmovneq %rax, %rsi` to pick between the SSO/heap
   *      variant, then `call basic_string::reserve`.
   *   3. `output.append("struct ShaderParameters {\n")`
   *      (literal at __cstring 0x8f1077; see `literal pool for:` in the disasm.)
   *   4. Zero-init a local `size_t = 0` at `[rbp-0x18]`.
   *   5. Call `this.privateEncodeShaderBufferStruct(output, localSize)` (localSize is an
   *      inout size_t byref).
   *   6. `output.append("};\n")`.
   */
  EncodeShaderBufferStruct(output: { s: string }): void {
    if (!this.IsMergeable()) return;
    // reserve is a hint, no functional impact in TS; keep the shape.
    output.s += "struct ShaderParameters {\n";
    const localSize = { v: 0 };
    this.privateEncodeShaderBufferStruct(output, localSize);
    output.s += "};\n";
  }

  /**
   * `HGProgramDescriptor::EncodeShaderDeclarations(std::string&) const` @Helium 0x168260.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.EncodeShaderDeclarations.s):
   *   1. IsMergeable-style guard on +0x40 / +0x58 / +0xa0. Skip on false.
   *   2. `output.reserve(...)` (size-computation identical to EncodeShaderBufferStruct).
   *   3. `output.append_length(HGMetalUtils::stringForMetalHeader().c_str(), len)` — writes the
   *      Metal include header.
   *   4. `output.append("struct FragmentOut {\n")`
   *   5. `output.append("float4 color0 [[ color(0) ]];\n")`   (@literal pool 0x81b029)
   *   6. Optionally more color slots (loop not yet fully decoded — the emitter appears to write
   *      one row per attachment).
   *   7. `output.append("};\n\n")`
   *   8. `output.append("extern \"C\" {\n")`
   *   9. Call `this.privateEncodeShaderDeclarations(output)`.
   *  10. `output.append("}\n")`
   *
   * NOTE: `HGMetalUtils::stringForMetalHeader()` is an external Helium utility, not yet decoded.
   */
  EncodeShaderDeclarations(output: { s: string }): void {
    if (!this.IsMergeable()) return;
    output.s += HGMetalUtils_stringForMetalHeader__stub();
    output.s += "struct FragmentOut {\n";
    output.s += "float4 color0 [[ color(0) ]];\n";
    output.s += "};\n\n";
    output.s += 'extern "C" {\n';
    this.privateEncodeShaderDeclarations(output);
    output.s += "}\n";
  }

  /**
   * `HGProgramDescriptor::EncodeShaderFunction(std::string&, ...many refs...) const` @Helium 0x168ec0.
   *
   * The largest method in the class (~1624 lines of disasm). Full signature:
   *   privateEncodeShaderFunction(std::string& out, std::vector<HGBinding>& bindings,
   *                               std::unordered_map<unsigned long, std::string>& fnMap,
   *                               unsigned long& a, unsigned long& b, unsigned long& c,
   *                               unsigned long& d, bool& e) const
   *
   * Body: IsMergeable guard; reserve; append `{\n`; call `this.privateEncodeShaderFunction(...)`;
   * append `return `; append literal params; append `;\n`; append `};`; append fragment
   * `[[ fragment ]] `; append space; then a lot of per-binding emission via ShaderParameters
   * fixups (see literal pool "ShaderParameters"). The final tail defaults the fragment function
   * name to `"fragmentFunc"` (same literal 0x8bac17 that GetFragmentFunctionName loads).
   *
   * This method is NOT YET TRANSCRIBED — it has too many delegated helpers still opaque
   * (privateEncodeShaderFunction @0x16ac00 alone is a substantial subroutine that owns the
   * per-binding Metal-argument emission). Ship as throwing stub; unblocks the systemic-blocker
   * consumers by giving them a real class binding to import.
   */
  EncodeShaderFunction(
    _output: { s: string },
    _bindings: HGBinding[],
    _fnMap: Map<number, string>,
    _a: { v: number },
    _b: { v: number },
    _c: { v: number },
    _d: { v: number },
    _e: { v: boolean },
  ): void {
    throw new Error(
      "HGProgramDescriptor::EncodeShaderFunction @Helium 0x168ec0 not yet transcribed" +
        " (delegates to privateEncodeShaderFunction @0x16ac00; ~1624 lines of per-binding Metal emission)",
    );
  }

  /**
   * `HGProgramDescriptor::EncodeShaderProgram(std::string&, std::unordered_map<std::string,bool>&) const`
   * @Helium 0x16cea0.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.EncodeShaderProgram.s, 128 lines):
   *   1. IsMergeable-style guard on +0x40 / +0x58 / +0xa0. On false, return.
   *   2. `output.reserve(output.length + 0x816)` — 0x816 (2070) is the estimated program size.
   *   3. Call `this.privateEncodeShaderProgram(output, visitedMap)`.
   *   4. If the private helper indicates failure, log `"Missing fragment shader for %s\n"` via
   *      the framework logger (literal pool at 0x8ea7c6). The exact logging path is not yet
   *      decoded — call sites lead to __Unwind_Resume for the failure branch.
   */
  EncodeShaderProgram(output: { s: string }, visitedMap: Map<string, boolean>): void {
    if (!this.IsMergeable()) return;
    this.privateEncodeShaderProgram(output, visitedMap);
    // The "Missing fragment shader for %s\n" log path is not yet transcribed — the private
    // helper's failure signaling is opaque. See @0x16d017 literal.
  }

  /**
   * `HGProgramDescriptor::CopyDependencies() const` @Helium 0x16d320.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.CopyDependencies.s):
   *   1. Zero-init a local vector<Dependency> on the stack at `[rbp-0x40]`. (`xorps xmm0` +
   *      `movaps xmm0` sequence.)
   *   2. Set the local's `float attentionOrScale` slot at `[rbp-0x20] = 0x3f800000` (1.0f).
   *   3. `operator new(0x18)` — allocate a 24-byte result vector<Dependency>.
   *   4. Zero-init the result (`movups xmm0, (rax) ; movq $0, 0x10(rax)`).
   *   5. Call `this.privateGetDependencies(&result, &local_visited_hash)` where the local at
   *      `[rbp-0x40]` doubles as an unordered_map<string,bool> used for cycle detection.
   *   6. Tear down the local (the HGMetalFunctionCache::Info destructor is called on the map).
   *   7. Return the heap-allocated result pointer.
   *
   * Return type: `std::vector<HGProgramDescriptor::Dependency>*` — a heap-allocated vector.
   *
   * NOTE: privateGetDependencies is not yet transcribed. In TS we return an empty array and let
   * the private-helper stub throw once it's actually walked.
   */
  CopyDependencies(): HGProgramDescriptorDependency[] {
    const result: HGProgramDescriptorDependency[] = [];
    const visited = new Map<string, boolean>();
    this.privateGetDependencies(result, visited);
    return result;
  }

  /**
   * `HGProgramDescriptor::GetSignature() const` @Helium 0x16d660.
   *
   * Body (see re/disasm/Helium.HGProgramDescriptor.GetSignature.s):
   *   1. Zero the caller-provided `HGLimits*` (in %rsi) via three unaligned SSE stores:
   *        `xorps xmm0, xmm0`
   *        `movups xmm0, 0x04(rdi)`
   *        `movups xmm0, 0x14(rdi)`
   *        `movups xmm0, 0x20(rdi)`
   *      NOTE: the `movl $0x60b10, (%rdi)` write of 0x60b10 (395024) into `[rsi+0x00]` seeds the
   *      first 4 bytes of the result buffer (looks like a fixed sentinel / version tag).
   *   2. `movb $0x1, 0x2a(%rdi)` — set a byte at offset +0x2a (flag) to 1.
   *   3. Call `this.privateGetSignature(&limits)` which populates the rest of the HGLimits.
   *   4. Return the result buffer (as the ABI-returned struct via %rax = %rbx).
   *
   * The exact `HGLimits` layout is not yet fully decoded; we model the shape as a small owned
   * struct with the fields the disasm actually writes.
   */
  GetSignature(): HGProgramDescriptorSignatureLimits {
    const limits: HGProgramDescriptorSignatureLimits = {
      // `movl $0x60b10, (%rdi)` — seed sentinel at offset +0x00. Provenance: literal in-place.
      sentinel: 0x60b10,
      // xorps+movups writes zero the next ~44 bytes; we just zero-init explicitly.
      block04: new Uint8Array(16),
      block14: new Uint8Array(16),
      block20: new Uint8Array(16),
      // `movb $0x1, 0x2a(%rdi)` — set flag byte at +0x2a. Overrides the movups that just cleared it.
      flag2a: 1,
    };
    // Overlay the +0x2a byte into block20 (spans +0x20..+0x2f). block20[+0x2a - 0x20] = block20[0x0a].
    limits.block20[0xa] = 1;
    this.privateGetSignature(limits);
    return limits;
  }

  /**
   * `HGProgramDescriptor::GetHash() const` @Helium 0x16d910.
   *
   * The 852-line hash function combines every non-empty descriptor field into a 64-bit digest.
   * Fully faithful transcription requires decoding the FCP hashing primitive (Metal Function
   * Cache uses `HGMetalFunctionCache::InfoHash` internally; see the vtable reference in
   * CopyDependencies @0x16d3cc). That primitive is NOT yet decoded.
   *
   * Ship as throwing stub — unblocking callers can obtain a class binding, but any code path
   * that actually needs a stable hash must transcribe the primitive first from @0x16d910
   * (see P4 requirement: throwing stubs must cite their address).
   */
  GetHash(): bigint {
    throw new Error(
      "HGProgramDescriptor::GetHash @Helium 0x16d910 not yet transcribed" +
        " (852-line combined-field hash; requires decoding HGMetalFunctionCache::InfoHash first)",
    );
  }

  // ---------------------------------------------------------------------------------------
  // Private (delegate) helpers — throwing stubs, one per undecoded subroutine.
  // Each cites the exact @0xADDR from the ledger so frontier.py can see the gap.
  // ---------------------------------------------------------------------------------------

  /** `HGProgramDescriptor::privateEncodeShaderDeclarations(std::string&) const` @Helium 0x168440. */
  private privateEncodeShaderDeclarations(_out: { s: string }): void {
    throw new Error(
      "HGProgramDescriptor::privateEncodeShaderDeclarations @Helium 0x168440 not yet transcribed",
    );
  }

  /**
   * `HGProgramDescriptor::privateEncodeShaderBufferStruct(std::string&, unsigned long&) const`
   * @Helium 0x168930.
   */
  private privateEncodeShaderBufferStruct(_out: { s: string }, _sizeInOut: { v: number }): void {
    throw new Error(
      "HGProgramDescriptor::privateEncodeShaderBufferStruct @Helium 0x168930 not yet transcribed",
    );
  }

  /**
   * `HGProgramDescriptor::privateEncodeShaderProgram(std::string&,
   *   std::unordered_map<std::string,bool>&) const` @Helium 0x16d050.
   */
  private privateEncodeShaderProgram(_out: { s: string }, _visited: Map<string, boolean>): void {
    throw new Error(
      "HGProgramDescriptor::privateEncodeShaderProgram @Helium 0x16d050 not yet transcribed",
    );
  }

  /**
   * `HGProgramDescriptor::privateGetDependencies(std::vector<Dependency>*,
   *   std::unordered_map<std::string,bool>&) const` @Helium 0x16d3e0.
   */
  private privateGetDependencies(
    _out: HGProgramDescriptorDependency[],
    _visited: Map<string, boolean>,
  ): void {
    throw new Error(
      "HGProgramDescriptor::privateGetDependencies @Helium 0x16d3e0 not yet transcribed",
    );
  }

  /** `HGProgramDescriptor::privateGetSignature(HGLimits&) const` @Helium 0x16d6a0. */
  private privateGetSignature(_limits: HGProgramDescriptorSignatureLimits): void {
    throw new Error(
      "HGProgramDescriptor::privateGetSignature @Helium 0x16d6a0 not yet transcribed",
    );
  }
}
