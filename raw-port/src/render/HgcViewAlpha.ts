// HgcViewAlpha.ts — faithful raw port of HgcViewAlpha::GetOutput.
//
// Source: Ozone.framework, x86_64.
// Disassembly: raw-port/re/disasm/
//   __ZN12HgcViewAlpha9GetOutputEP10HGRenderer.s

/** Opaque HGRenderer pointer; GetOutput does not inspect it. */
export interface HGRenderer {
  readonly __hgRenderer: unique symbol;
}

export class HgcViewAlpha {
  /**
   * HgcViewAlpha::GetOutput(HGRenderer*) @Ozone 0x6baa80
   * (`__ZN12HgcViewAlpha9GetOutputEP10HGRenderer`).
   *
   * The body spills `this` and the renderer argument, reloads only `this`, and
   * returns it. There are no calls, branches, field accesses, or side effects.
   */
  GetOutput(_renderer: HGRenderer): HgcViewAlpha {
    // @0x6baa84-@0x6baa90: spill this/renderer, reload this into rax, return.
    return this;
  }
}
