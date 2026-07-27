// OZUIComponent — Ozone/Flexo UI-component base class. Every OZ* UI-facing
// component (OZChannelParameterComponent, ...) inherits from it. The
// class-object body decoded here consists solely of a PCString member at
// offset 0x28 (the component id/label); everything else about the object
// (vtable slots, subclass state) is not observed by the two dtor slots we
// transcribe.
//
// Faithful transcription of the two symbols exported by nm on OZUIComponent
// in Flexo:
//   @Flexo 0x12b5e90  OZUIComponent::~OZUIComponent()   (D1 base dtor)
//   @Flexo 0x12b5eb0  OZUIComponent::~OZUIComponent()   (D0 deleting dtor)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.OZUIComponent.D1.s
//   raw-port/re/disasm/Flexo.OZUIComponent.D0.s
//
// Flexo referenced symbols:
//   __ZTV13OZUIComponent — this class's vtable, referenced by leaq at
//     @0x12b5e94 (D1) / @0x12b5eb9 (D0). Rebind target is `vtable + 0x10`
//     (Itanium: skip offset-to-top + typeinfo slots).
//   __ZN8PCStringD1Ev    — PCString::~PCString(). __stubs @Flexo 0x1496de0;
//     tail-jmp at @0x12b5ea7 (D1), callq at @0x12b5ecb (D0). PCString's
//     dtor body is decoded in raw-port/src/infra/PCString.ts (`destroy`).
//   __ZdlPv              — operator delete(void*) global. __stubs @Flexo
//     0x1497404; tail-jmp at @0x12b5ed9 (D0 only).
//
// Struct layout (recovered — only the fields the dtors touch):
//   +0x000  vptr                   — rebind target OZUIComponent vtable + 0x10
//   +0x028  PCString  id           — evidence: `addq $0x28, %rdi` @0x12b5ea2 (D1)
//                                    / @0x12b5ec7 (D0), then PCString D1 stub.
// Bytes 0x008..0x027 are opaque here (not read/written by these two symbols).

import { PCString } from "../infra/PCString.js";

/** Sentinel for `*this = &vtable_OZUIComponent + 0x10`. */
const OZUIComponent_vtable_plus_0x10 = Symbol("OZUIComponent::vtable+0x10");

/**
 * OZUIComponent — see file header.
 */
export class OZUIComponent {
  /** @+0x000 — instance vtable pointer. */
  vptr: symbol = OZUIComponent_vtable_plus_0x10;
  /** @+0x028 — PCString component id/label; owned. */
  id: PCString = new PCString();

  /**
   * OZUIComponent::~OZUIComponent() — D1 base destructor.
   * @Flexo 0x12b5e90 (raw-port/re/disasm/Flexo.OZUIComponent.D1.s)
   *
   * Line-for-line:
   *   0x12b5e90  push rbp; mov rbp, rsp                                    prologue
   *   0x12b5e94  lea  rax, [rip+ __ZTV13OZUIComponent ]  ## &OZUIComponent vtable
   *   0x12b5e9b  add  rax, 0x10
   *   0x12b5e9f  mov  [rdi], rax                         ## *this = vtable + 0x10
   *   0x12b5ea2  add  rdi, 0x28                          ## rdi = &this->id  (PCString)
   *   0x12b5ea6  pop  rbp
   *   0x12b5ea7  jmp  __ZN8PCStringD1Ev                  ## tail PCString::~PCString
   *
   * There is NO base-class dtor chain — OZUIComponent has no C++ base class body
   * to tear down (the `pop rbp; jmp PCString::D1` after the PCString call is the
   * whole tail). The trailing 0x12b5eac is padding.
   */
  dtor_D1_at_0x12b5e90(): void {
    // @0x12b5e9f — rebind vtable pointer.
    this.vptr = OZUIComponent_vtable_plus_0x10;
    // @0x12b5ea2..0x12b5ea7 — pass &this->id and tail-call PCString::~PCString.
    // In TS we call the ported destroy() method (see infra/PCString.ts).
    this.id.destroy();
  }

  /**
   * OZUIComponent::~OZUIComponent() — D0 deleting destructor.
   * @Flexo 0x12b5eb0 (raw-port/re/disasm/Flexo.OZUIComponent.D0.s)
   *
   *   0x12b5eb0  push rbp; mov rbp, rsp; push rbx; push rax                prologue
   *   0x12b5eb6  mov  rbx, rdi                                              save self
   *   0x12b5eb9  lea  rax, [rip+ __ZTV13OZUIComponent ]
   *   0x12b5ec0  add  rax, 0x10
   *   0x12b5ec4  mov  [rdi], rax                    ## *this = vtable + 0x10
   *   0x12b5ec7  add  rdi, 0x28                     ## rdi = &this->id
   *   0x12b5ecb  call __ZN8PCStringD1Ev             ## destroy the PCString
   *   0x12b5ed0  mov  rdi, rbx                      ## restore self for delete
   *   0x12b5ed3  add  rsp,8; pop rbx; pop rbp                              epilogue
   *   0x12b5ed9  jmp  __ZdlPv                       ## tail operator delete(this)
   *
   * i.e. D0 = D1 + operator delete(this). Modelled here by calling D1 then
   * dropping the reference — TS has no manual heap.
   */
  dtor_D0_at_0x12b5eb0(): void {
    // @0x12b5eb9..0x12b5ecb — identical body to D1.
    this.dtor_D1_at_0x12b5e90();
    // @0x12b5ed9 — operator delete(this); no-op in the GC runtime.
  }
}
