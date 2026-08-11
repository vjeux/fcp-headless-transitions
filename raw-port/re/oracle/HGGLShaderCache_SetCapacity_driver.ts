// TS side of the differential oracle for HGGLShaderCache::SetCapacity(unsigned long)
// @Helium 0x175a10. Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HGGLShaderCache_SetCapacity_oracle.py.
//
// Values cross the JSON boundary as 16-hex-digit u64 strings: the corpus deliberately contains
// values above 2^53, which a JSON number would round — the very error the port's `bigint` field
// exists to avoid, so the harness must not reintroduce it in its own transport.
import { HGGLShaderCache } from "../../src/render/HGGLShaderCache.js";

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const values = JSON.parse(Buffer.concat(chunks).toString("utf8")) as string[];
  const out = values.map((hex) => {
    const cache = new HGGLShaderCache();
    cache.SetCapacity(BigInt("0x" + hex));
    return cache.capacity.toString(16).padStart(16, "0");
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
