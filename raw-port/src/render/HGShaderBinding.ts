// raw-port of Helium C++ class HGShaderBinding (5 methods)
// Source: Helium binary (x86_64 slice). All addresses cite the raw file offset.
//
// STRUCT LAYOUT (36 bytes = 0x24). Field names + offsets recovered directly
// from HGShaderBinding::print()'s printf format strings at @0xa7720:
//
//   0x00 uint32 base_array        ("base_array       = %d\n"  @0xa773c)
//   0x04 uint32 base_constant     ("base_constant    = %d\n"  @0xa774e)
//   0x08 uint32 base_texcoord     ("base_texcoord    = %d\n"  @0xa7760)
//   0x0C uint32 base_output       ("base_output      = %d\n"  @0xa7772)
//   0x10 uint32 base_param        ("base_param       = %d\n"  @0xa7784)
//   0x14 uint32 base_param_bytes  ("base_param_bytes = %d\n"  @0xa7796)
//   0x18 uint32 base_texture      ("base_texture     = %d\n"  @0xa77a8)
//   0x1C uint32 dead_input        ("dead_input       = %d\n"  @0xa77ba)
//   0x20 uint32 dead_inputs       ("dead_inputs      = %d\n"  @0xa77cc)
//
// All fields are unsigned 32-bit counters. In TS we hold them as `number`
// and force back to Uint32 with `>>> 0` after every arithmetic op.

export class HGShaderBinding {
  // Fields — mirror the C++ layout exactly.
  base_array: number = 0;        // @0x00
  base_constant: number = 0;     // @0x04
  base_texcoord: number = 0;     // @0x08
  base_output: number = 0;       // @0x0C
  base_param: number = 0;        // @0x10
  base_param_bytes: number = 0;  // @0x14
  base_texture: number = 0;      // @0x18
  dead_input: number = 0;        // @0x1C
  dead_inputs: number = 0;       // @0x20

  /**
   * HGShaderBinding::reset()  @0xa76e0
   *
   * Asm (@0xa76e0..0xa76f6):
   *   xorps  xmm0, xmm0            ; xmm0 = 0
   *   movups xmm0, 0x10(rdi)       ; zero bytes [0x10..0x1F]
   *   movups xmm0, (rdi)           ; zero bytes [0x00..0x0F]
   *   movl   $0x0, 0x20(rdi)       ; zero uint32 at 0x20 (dead_inputs)
   *
   * Zeros the full 36-byte struct.
   */
  reset(): void {
    this.base_array = 0;
    this.base_constant = 0;
    this.base_texcoord = 0;
    this.base_output = 0;
    this.base_param = 0;
    this.base_param_bytes = 0;
    this.base_texture = 0;
    this.dead_input = 0;
    this.dead_inputs = 0;
  }

  /**
   * HGShaderBinding::islive(unsigned int)  @0xa7700
   *
   * Asm (@0xa7700..0xa7716):
   *   movl 0x1c(rdi), ecx          ; ecx = this->dead_input
   *   movb $0x1, al                ; al  = 1  (default return)
   *   cmpl ecx, esi                ; compare arg (esi) with dead_input
   *   jb   0xa7715                 ; if arg <u dead_input -> return true
   *   addl 0x20(rdi), ecx          ; ecx = dead_input + dead_inputs
   *   cmpl ecx, esi                ; compare arg with (dead_input + dead_inputs)
   *   setae al                     ; al = (arg >=u dead_input + dead_inputs)
   *
   * Returns bool: whether the input index `idx` is "live" (i.e. NOT in the
   * dead range [dead_input, dead_input + dead_inputs)).
   *   live iff  idx < dead_input  ||  idx >= dead_input + dead_inputs.
   *
   * All comparisons are unsigned 32-bit (jb / setae).
   * NOTE: the addl at @0xa770d uses 32-bit modular arithmetic (uint32 wrap).
   */
  islive(idx: number): boolean {
    const arg = idx >>> 0;
    const dead_input = this.dead_input >>> 0;
    if (arg < dead_input) {
      return true;
    }
    const end = ((dead_input + (this.dead_inputs >>> 0)) >>> 0);
    return arg >= end;
  }

  /**
   * HGShaderBinding::print() const  @0xa7720
   *
   * Asm at @0xa7720..0xa77e1: calls puts() with a 34-char dashed banner
   * ("----------------------------------") then printf(fmt, field) nine
   * times, one per field (offsets 0..0x20 in order), then a trailing puts()
   * (tail call jmp to _puts @0xa77e1) with the same banner.
   *
   * String literal RIPs (all resolved to the banner + nine "name = %d\n"
   * format strings) are documented in the file header above.
   */
  print(): void {
    const banner = '----------------------------------';
    console.log(banner);                                                // @0xa7734
    console.log(`base_array       = ${this.base_array >>> 0}`);         // @0xa7745
    console.log(`base_constant    = ${this.base_constant >>> 0}`);      // @0xa7757
    console.log(`base_texcoord    = ${this.base_texcoord >>> 0}`);      // @0xa7769
    console.log(`base_output      = ${this.base_output >>> 0}`);        // @0xa777b
    console.log(`base_param       = ${this.base_param >>> 0}`);         // @0xa778d
    console.log(`base_param_bytes = ${this.base_param_bytes >>> 0}`);   // @0xa779f
    console.log(`base_texture     = ${this.base_texture >>> 0}`);       // @0xa77b1
    console.log(`dead_input       = ${this.dead_input >>> 0}`);         // @0xa77c3
    console.log(`dead_inputs      = ${this.dead_inputs >>> 0}`);        // @0xa77d5
    console.log(banner);                                                // @0xa77e1 (tail-call)
  }

  /**
   * HGShaderBinding::push(HGShaderBinding const&)  @0xa77f0
   *
   * Asm (@0xa77f0..0xa7825):
   *   movl (rsi), eax                     ; eax = src.base_array
   *   addl eax, (rdi)                     ; dst.base_array += src.base_array
   *   movdqu 0x04(rsi), xmm0              ; load src[0x04..0x13] (4 x u32)
   *   movdqu 0x04(rdi), xmm1              ; load dst[0x04..0x13]
   *   paddd  xmm0, xmm1                   ; per-lane 32-bit add
   *   movdqu xmm1, 0x04(rdi)              ; dst[0x04..0x13] += src[0x04..0x13]
   *     -> dst.base_constant, base_texcoord, base_output, base_param
   *   movq 0x14(rsi), xmm0                ; load src[0x14..0x1B] (2 x u32)
   *   movq 0x14(rdi), xmm1                ; load dst[0x14..0x1B]
   *   paddd xmm0, xmm1                    ; per-lane 32-bit add
   *   movq  xmm1, 0x14(rdi)               ; dst[0x14..0x1B] += src[0x14..0x1B]
   *     -> dst.base_param_bytes, base_texture
   *   movl 0x18(rsi), eax                 ; eax = src.base_texture
   *   addl eax, 0x1c(rdi)                 ; dst.dead_input += src.base_texture
   *
   * So push() accumulates the seven "base_*" counters into their like-named
   * dst counters, AND additionally adds src.base_texture into dst.dead_input.
   * dst.dead_inputs (0x20) is NOT modified. All ops are 32-bit modular.
   *
   * The trailing @0xa781e/0xa7821 pair is faithfully reproduced — it is the
   * observed behavior of the compiled code (either a hand-coded "carry" of
   * texture-slot use into the dead_input running total, or a fused counter
   * used by the caller). Do not "clean it up".
   */
  push(src: HGShaderBinding): void {
    this.base_array       = ((this.base_array       + src.base_array)       >>> 0);
    this.base_constant    = ((this.base_constant    + src.base_constant)    >>> 0);
    this.base_texcoord    = ((this.base_texcoord    + src.base_texcoord)    >>> 0);
    this.base_output      = ((this.base_output      + src.base_output)      >>> 0);
    this.base_param       = ((this.base_param       + src.base_param)       >>> 0);
    this.base_param_bytes = ((this.base_param_bytes + src.base_param_bytes) >>> 0);
    this.base_texture     = ((this.base_texture     + src.base_texture)     >>> 0);
    // @0xa781e/0xa7821: dst.dead_input += src.base_texture
    this.dead_input       = ((this.dead_input       + src.base_texture)     >>> 0);
    // dead_inputs (0x20) intentionally NOT touched (matches asm).
  }

  /**
   * HGShaderBinding::pop(HGShaderBinding const&)  @0xa7830
   *
   * Asm (@0xa7830..0xa7865): identical structure to push() but with subl /
   * psubd instead of addl / paddd. Faithful mirror of the push semantics.
   *
   *   movl (rsi), eax                     ; dst.base_array -= src.base_array
   *   subl eax, (rdi)
   *   movdqu/psubd/movdqu at 0x04         ; dst[0x04..0x13] -= src[0x04..0x13]
   *   movq/psubd/movq   at 0x14           ; dst[0x14..0x1B] -= src[0x14..0x1B]
   *   movl 0x18(rsi), eax                 ; dst.dead_input -= src.base_texture
   *   subl eax, 0x1c(rdi)
   *
   * All ops are 32-bit modular (subtraction wraps as uint32).
   */
  pop(src: HGShaderBinding): void {
    this.base_array       = ((this.base_array       - src.base_array)       >>> 0);
    this.base_constant    = ((this.base_constant    - src.base_constant)    >>> 0);
    this.base_texcoord    = ((this.base_texcoord    - src.base_texcoord)    >>> 0);
    this.base_output      = ((this.base_output      - src.base_output)      >>> 0);
    this.base_param       = ((this.base_param       - src.base_param)       >>> 0);
    this.base_param_bytes = ((this.base_param_bytes - src.base_param_bytes) >>> 0);
    this.base_texture     = ((this.base_texture     - src.base_texture)     >>> 0);
    // @0xa785e/0xa7861: dst.dead_input -= src.base_texture
    this.dead_input       = ((this.dead_input       - src.base_texture)     >>> 0);
    // dead_inputs (0x20) intentionally NOT touched (matches asm).
  }
}
