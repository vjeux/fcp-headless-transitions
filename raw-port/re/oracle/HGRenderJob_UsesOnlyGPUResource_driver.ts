// TS side of the differential oracle for HGRenderJob::UsesOnlyGPUResource() @Helium 0x54b20.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HGRenderJob_UsesOnlyGPUResource_oracle.py, which feeds the identical
// synthetic jobs to the live binary and to this port.
import { HGRenderJob, type HGRenderJobTaggedRef } from "../../src/render/HGRenderJob.js";

interface WireCase {
  resource: number;
  ref18: number | null;
  slot50: boolean;
  vec: number[];
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const job = new HGRenderJob();
    job._resource = c.resource;
    job.taggedRef18 = c.ref18 === null ? null : ({ tag08: c.ref18 } as HGRenderJobTaggedRef);
    job.slot50 = c.slot50 ? { opaque: true } : null;
    job.taggedRefs = c.vec.map((t) => ({ tag08: t }) as HGRenderJobTaggedRef);
    return job.UsesOnlyGPUResource();
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
