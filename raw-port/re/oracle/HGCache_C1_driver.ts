// TS side of the differential oracle for HGCache::HGCache() [C1] @Helium 0x8b960.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HGCache_C1_oracle.py, which runs the REAL ctor on a poisoned buffer and
// matches every field reported here against the bytes it left behind.
import { HGCache, HGCACHE_VPTR_ADDR } from "../../src/render/HGCache.js";

const c = new HGCache();
process.stdout.write(
  JSON.stringify({
    vptrAddr: HGCACHE_VPTR_ADDR,
    countAt0x08: c.countAt0x08,
    itemsHead: c.itemsHead,
    slotAt0x18: c.slotAt0x18,
    slotAt0x20: c.slotAt0x20,
    mutexInitialized: c.mutex.initialized,
  }) + "\n",
);
