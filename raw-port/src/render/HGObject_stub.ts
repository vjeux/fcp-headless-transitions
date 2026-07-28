// HGObject_stub.ts — throwing stubs for HGObject::HGObject() / ::~HGObject()
// as referenced from HGRenderQueueSetupProperties C2 @Helium 0x710c2 and
// D1/D0 @Helium 0x711cc/0x711e8/0x71288.
//
// The HGObject base class itself is not yet transcribed in this port.
// Every consumer imports the C2/D2 wrappers below so the ABI edge is
// explicit and the missing decode is a hard, cited failure mode.

/**
 * HGObject::HGObject() — Helium @0x710c2 (referenced).  Not yet transcribed.
 */
export function HGObject_ctor(_self: object): void {
  // Correct signal: base-class construction is an undecoded frontier.
  throw new Error(
    "HGObject::HGObject() not yet transcribed " +
    "(referenced from HGRenderQueueSetupProperties C2 @Helium 0x710c2)"
  );
}

/**
 * HGObject::~HGObject() — Helium @0x711cc (referenced).  Not yet transcribed.
 */
export function HGObject_dtor(_self: object): void {
  throw new Error(
    "HGObject::~HGObject() not yet transcribed " +
    "(referenced from HGRenderQueueSetupProperties D1 @Helium 0x71288, " +
    "D0 @Helium 0x71288, and exception-unwind paths @Helium 0x711cc/0x711e8)"
  );
}
