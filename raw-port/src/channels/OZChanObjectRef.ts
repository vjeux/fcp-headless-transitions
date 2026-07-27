// @class OZChanObjectRef (Ozone)
// Base/stub class for channel object references. Both methods are trivial in the
// binary: getObjectRef returns nullptr, setObjectRef is a no-op. Derived subclasses
// presumably override these; the base is intentionally empty.
//
// Evidence (raw disasm):
//   __ZNK15OZChanObjectRef12getObjectRefEv @ 0x33ba80:
//     pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
//   __ZN15OZChanObjectRef12setObjectRefEPvb @ 0x33ba90:
//     pushq %rbp; movq %rsp,%rbp; popq %rbp; retq

export class OZChanObjectRef {
  /**
   * @0x33ba80  OZChanObjectRef::getObjectRef() const
   * Body: xorl %eax,%eax; ret  → always returns nullptr.
   */
  getObjectRef(): unknown {
    return null;
  }

  /**
   * @0x33ba90  OZChanObjectRef::setObjectRef(void*, bool)
   * Body: pushq/popq %rbp; ret  → no-op (parameters ignored).
   */
  setObjectRef(_objectRef: unknown, _flag: boolean): void {
    // intentionally empty — mirrors the empty base-class impl in the binary.
  }
}
