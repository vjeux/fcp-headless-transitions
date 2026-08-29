// MultiGPUPoolingPolicy.ts — faithful raw port of the queue-ratio setter.
//
// Source: Helium.framework, x86_64.
// Disassembly: raw-port/re/disasm/
//   Helium.__ZN21MultiGPUPoolingPolicy20setMaxQueueSizeRatioEf.s

import { HG_RENDERER_ENV } from "../render/HGDefaultPolicies";

/**
 * Fields of MultiGPUPoolingPolicy used by the ported method.
 *
 * The setter stores a float32 directly at receiver offset +0x20
 * (`movss %xmm0, 0x20(%rdi)` @0x45f22).
 */
export interface MultiGPUPoolingPolicyFields {
  /** f32 at +0x20, written by setMaxQueueSizeRatio @0x45f22. */
  maxQueueSizeRatio: number;
}

/**
 * MultiGPUPoolingPolicy::setMaxQueueSizeRatio(float) @Helium 0x45f10
 * (`__ZN21MultiGPUPoolingPolicy20setMaxQueueSizeRatioEf`).
 *
 * The process-wide MAX_TEXTURE_QUEUE_SIZE_PERCENT override has the int32
 * sentinel -1. When an override is present, this explicit setter is a no-op;
 * only the sentinel path stores the supplied float32.
 */
export function MultiGPUPoolingPolicy_setMaxQueueSizeRatio(
  self: MultiGPUPoolingPolicyFields,
  ratio: number,
): void {
  // @0x45f14-@0x45f1e: load the int32 override and return unless it is -1.
  const override = HG_RENDERER_ENV.MAX_TEXTURE_QUEUE_SIZE_PERCENT | 0;
  if (override !== -1) {
    return;
  }

  // @0x45f22: movss %xmm0, 0x20(%rdi).
  self.maxQueueSizeRatio = Math.fround(ratio);
}
