// HGComputeDeviceManager_stub.ts — HGComputeDeviceManager::GetComputeDeviceList
// throwing stub, cited from HGRenderQueueSetupProperties C2 @Helium 0x710d5.
//
// The manager class itself is not yet transcribed.  Callers get a hard
// failure at the ABI edge with the exact @0xADDR reference preserved.

import type { SharedPtr_HGComputeDevice_Const } from "./HGRenderQueueSetupProperties.js";

/**
 * HGComputeDeviceManager::GetComputeDeviceList() — Helium @0x710d5 (referenced).
 * Returns a reference to a `std::vector<std::shared_ptr<const HGComputeDevice>>`.
 * Not yet transcribed.
 */
export function HGComputeDeviceManager_GetComputeDeviceList():
  SharedPtr_HGComputeDevice_Const[]
{
  throw new Error(
    "HGComputeDeviceManager::GetComputeDeviceList() not yet transcribed " +
    "(referenced from HGRenderQueueSetupProperties C2 @Helium 0x710d5)"
  );
}
