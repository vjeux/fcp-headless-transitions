// raw-port/src/render/HGParamField.ts
//
// FCP `HGParamField` — Helium shader/uniform parameter field descriptor.
// A typed record describing ONE field inside a shader-parameter buffer:
// its name, C-type name, byte offset & size within the buffer, and shape
// (array count, vector width, matrix rank). Consumed by
// `HGParamBufferDesc::addField` (Helium 0x14c0) which vectors these into
// the buffer layout used by the render pipeline.
//
// FRAMEWORK: Helium.framework  (FAT slice offset 0x4000; thin binary
// /tmp/Helium.x86_64 has VA == file offset; segment __TEXT vmaddr = 0.)
//
// DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGParamField.HGParamField.s     (C2 ctor)
//   raw-port/re/disasm/Helium.HGParamField.arraySize.s
//   raw-port/re/disasm/Helium.HGParamField.vectorSize.s
//   raw-port/re/disasm/Helium.HGParamField.matrixSize.s
//   raw-port/re/disasm/Helium.HGParamField.fieldOffset.s
//   raw-port/re/disasm/Helium.HGParamField.fieldSize.s
//   raw-port/re/disasm/Helium.HGParamField.paramName.s
//   raw-port/re/disasm/Helium.HGParamField.paramTypeName.s
//
// SYMBOLS (Helium x86_64):
//   @Helium 0x0000000000001ab0  HGParamField::HGParamField(string const&, string const&, unsigned long, unsigned long, int, int, int)   [C2]
//     __ZN12HGParamFieldC2ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEES8_mmiii
//   @Helium 0x0000000000001ba0  HGParamField::arraySize() const           __ZNK12HGParamField9arraySizeEv
//   @Helium 0x0000000000001bb0  HGParamField::vectorSize() const          __ZNK12HGParamField10vectorSizeEv
//   @Helium 0x0000000000001bc0  HGParamField::matrixSize() const          __ZNK12HGParamField10matrixSizeEv
//   @Helium 0x0000000000001bd0  HGParamField::fieldOffset() const         __ZNK12HGParamField11fieldOffsetEv
//   @Helium 0x0000000000001be0  HGParamField::fieldSize() const           __ZNK12HGParamField9fieldSizeEv
//   @Helium 0x0000000000001bf0  HGParamField::paramName() const           __ZNK12HGParamField9paramNameEv
//   @Helium 0x0000000000001c00  HGParamField::paramTypeName() const       __ZNK12HGParamField13paramTypeNameEv
//   @Helium 0x00000000003c1050  HGParamField::~HGParamField()             [D2]
//   @Helium 0x00000000003c1060  HGParamField::~HGParamField()             [D1] (identical body)
//
// VTABLE (installed by C2 @0x1ad6):
//   `leaq __ZTV12HGParamField(%rip),%rax; addq $0x10,%rax; movq %rax,(%rbx)`
//   — installed-ptr = vtable base + 0x10 per Itanium ABI. Slots resolved via
//   `raw-port/army/tools/resolve.py Helium vtable HGParamField`.
//
// STRUCT LAYOUT (recovered from C2 @0x1ab0 + every accessor):
//   Extends HGObject (base ctor @0x1ad1). HGObject occupies 0x00..0x0f
//   (vtable @0x0, refCount @0x8 — see HGObject.ts). This subclass adds:
//     +0x0c : i32    arraySize   (from r9d = arg5; read by arraySize() @0x1ba4  movl 0xc(%rdi),%eax)
//     +0x10 : i32    vectorSize  (from rbp+0x10 = arg6; read by vectorSize() @0x1bb4  movl 0x10(%rdi),%eax)
//     +0x14 : i32    matrixSize  (from rbp+0x18 = arg7; read by matrixSize() @0x1bc4  movl 0x14(%rdi),%eax)
//     +0x18 : u64    fieldOffset (from rcx = arg3; read by fieldOffset() @0x1bd4  movq 0x18(%rdi),%rax)
//     +0x20 : u64    fieldSize   (from r8  = arg4; read by fieldSize()   @0x1be4  movq 0x20(%rdi),%rax)
//     +0x28 : std::string paramName      (inline SSO copy of arg1 name;      leaq 0x28(%rbx),%r15;      returned by-ptr from paramName()     @0x1bf4  leaq 0x28(%rdi),%rax)
//     +0x40 : std::string paramTypeName  (inline SSO copy of arg2 typeName;  leaq 0x40(%rbx),%rdi;      returned by-ptr from paramTypeName() @0x1c04  leaq 0x40(%rdi),%rax)
//   sizeof(HGParamField) = 0x58 (name string ends at 0x40; typeName at 0x40..0x58).
//   std::string SSO layout (libc++, x86_64, 24 bytes = 3 qwords): the low
//   bit of byte 0 flags "long form"; if 0 → SSO (data inline, xmm0 copy of
//   the whole 24-byte struct + a qword tail; see @0x1b04..0x1b1d + @0x1b35..0x1b4a);
//   if 1 → long-form (arg->data ptr @ +0x10, size @ +0x8): fall through to
//   `std::string::__init_copy_ctor_external(char*, size_t)` @0x1b2c / @0x1b54.
//
// DECODE-DON'T-FIT: every method here mirrors its asm exactly. TS models
// the two strings as plain JS strings (no SSO), the numerics as `number`
// (arraySize/vectorSize/matrixSize are 32-bit ints; fieldOffset/fieldSize
// are u64 — kept as `number` because shader-buffer offsets fit well below
// 2^53). Accessors return the stored values by reference to preserve the
// C++ observable of `paramName()`/`paramTypeName()` returning references
// to the interior strings.

import { HGObject } from "./HGObject";

/**
 * `HGParamField` — descriptor for one field within a shader/uniform
 * parameter buffer. Immutable after construction (all accessors are const).
 *
 * Constructed via `HGParamBufferDesc::addField` (Helium @0x14c0) during
 * shader-program setup; the buffer descriptor iterates its fields to
 * produce the packed CPU-side layout that mirrors the GPU-side uniform
 * block.
 *
 * @see HGParamBufferDesc (Helium @0x14c0, addField)
 */
export class HGParamField extends HGObject {
  /** Field @ +0x0c (i32). Number of array elements; 1 for scalars. Set from arg5 of C2 @0x1ac1 (movl %r9d,%r15d → 0xc(%rbx)). */
  private readonly _arraySize: number;
  /** Field @ +0x10 (i32). Vector width (1..4); e.g. vec4 → 4. Set from arg6 (rbp+0x10) @0x1ae8. */
  private readonly _vectorSize: number;
  /** Field @ +0x14 (i32). Matrix rank; e.g. mat4 → 4, non-matrix → 1. Set from arg7 (rbp+0x18) @0x1aee. */
  private readonly _matrixSize: number;
  /** Field @ +0x18 (u64). Byte offset of this field within the parameter buffer. Set from arg3 (rcx=r13) @0x1af4. */
  private readonly _fieldOffset: number;
  /** Field @ +0x20 (u64). Byte size of this field within the parameter buffer. Set from arg4 (r8) @0x1afc. */
  private readonly _fieldSize: number;
  /** Field @ +0x28 (std::string). Human-readable parameter name (e.g. "u_color"). Copied inline @0x1b00..0x1b31. */
  private readonly _paramName: string;
  /** Field @ +0x40 (std::string). C-type name for the parameter (e.g. "float4"). Copied inline @0x1b31..0x1b59. */
  private readonly _paramTypeName: string;

  /**
   * `HGParamField::HGParamField(string const& name, string const& typeName,
   *                             unsigned long fieldOffset, unsigned long fieldSize,
   *                             int arraySize, int vectorSize, int matrixSize)`
   * — C2 ctor @Helium 0x1ab0.
   *
   * Body (line-for-line correspondence to the disasm):
   *   1. Calls `HGObject::HGObject()` @0x1ad1 (base ctor: vtable←HGObject, refCount←1).
   *   2. Installs `HGParamField` vtable @0x1ad6: `leaq __ZTV12HGParamField,%rax; addq $0x10,%rax; movq %rax,(%rbx)`.
   *   3. Stores integer fields: r9d→+0xc, rbp+0x10→+0x10, rbp+0x18→+0x14, r13→+0x18, r8→+0x20.
   *   4. Copy-constructs `paramName` string into +0x28 (SSO fast-path or __init_copy_ctor_external).
   *   5. Copy-constructs `paramTypeName` string into +0x40 (same pattern).
   *
   * The TS port does no vtable install (JS classes carry their own dispatch)
   * and uses native JS strings (no SSO distinction); every observable
   * (accessor return values) is preserved exactly.
   *
   * Parameter order MATCHES the C++ signature (mangled `S8_mmiii`):
   * name, typeName, fieldOffset (u64), fieldSize (u64), then three i32.
   */
  constructor(
    name: string,
    typeName: string,
    fieldOffset: number,
    fieldSize: number,
    arraySize: number,
    vectorSize: number,
    matrixSize: number,
  ) {
    super();
    // Vtable install @0x1ad6..0x1ae1 (`__ZTV12HGParamField + 0x10`) modeled implicitly
    // by JS class dispatch; recorded here for provenance.
    this._arraySize = arraySize | 0; // i32 store @0x1ae4  movl %r15d,0xc(%rbx)
    this._vectorSize = vectorSize | 0; // i32 store @0x1aeb  movl %eax,0x10(%rbx)
    this._matrixSize = matrixSize | 0; // i32 store @0x1af1  movl %eax,0x14(%rbx)
    this._fieldOffset = fieldOffset; // u64 store @0x1af4  movq %r13,0x18(%rbx)
    this._fieldSize = fieldSize; // u64 store @0x1afc  movq (rbp-0x30),0x20(%rbx)
    this._paramName = name; // std::string copy @0x1b00..0x1b31 → +0x28
    this._paramTypeName = typeName; // std::string copy @0x1b31..0x1b59 → +0x40
  }

  /**
   * `HGParamField::arraySize() const` @Helium 0x1ba0.
   * Body: `movl 0xc(%rdi),%eax; ret` — returns the i32 at +0x0c.
   */
  arraySize(): number {
    return this._arraySize;
  }

  /**
   * `HGParamField::vectorSize() const` @Helium 0x1bb0.
   * Body: `movl 0x10(%rdi),%eax; ret` — returns the i32 at +0x10.
   */
  vectorSize(): number {
    return this._vectorSize;
  }

  /**
   * `HGParamField::matrixSize() const` @Helium 0x1bc0.
   * Body: `movl 0x14(%rdi),%eax; ret` — returns the i32 at +0x14.
   */
  matrixSize(): number {
    return this._matrixSize;
  }

  /**
   * `HGParamField::fieldOffset() const` @Helium 0x1bd0.
   * Body: `movq 0x18(%rdi),%rax; ret` — returns the u64 at +0x18.
   */
  fieldOffset(): number {
    return this._fieldOffset;
  }

  /**
   * `HGParamField::fieldSize() const` @Helium 0x1be0.
   * Body: `movq 0x20(%rdi),%rax; ret` — returns the u64 at +0x20.
   */
  fieldSize(): number {
    return this._fieldSize;
  }

  /**
   * `HGParamField::paramName() const` @Helium 0x1bf0.
   * Body: `leaq 0x28(%rdi),%rax; ret` — returns a reference (pointer) to
   * the inline `std::string` at +0x28. TS returns the JS string by value;
   * strings are immutable in JS so the observable is identical.
   */
  paramName(): string {
    return this._paramName;
  }

  /**
   * `HGParamField::paramTypeName() const` @Helium 0x1c00.
   * Body: `leaq 0x40(%rdi),%rax; ret` — returns a reference to the inline
   * `std::string` at +0x40. Same TS-string equivalence as `paramName`.
   */
  paramTypeName(): string {
    return this._paramTypeName;
  }
}
