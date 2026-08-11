// PCXMLWriteStream_getURL_driver.mts — runs the SHIPPED port for the oracle beside it.
//
// The live half of this unit can check the addresses and the two displacements, and it can
// show that the NULL-stream call faults; it cannot execute either branch. So the question
// left for the TypeScript is the one that actually distinguishes an honest port here:
// does it DEFER LOUDLY at the out-of-scope RTTI helper, or does it quietly return the
// fallback? A port that returned the fallback unconditionally would pass every test the
// fallback path can run and be wrong on every file-backed stream in the product.
//
//   raw-port/node_modules/.bin/tsx PCXMLWriteStream_getURL_driver.mts
const M = await import("../../src/infra/PCXMLWriteStream.ts");

const url460 = { __tag: "this+0x460" };
const url8 = { __tag: "casted+0x8" };

function call(streamAt50: unknown) {
  try {
    const r = M.PCXMLWriteStream_getURL({
      streamAt50: streamAt50 as never,
      urlAt460: url460 as never,
    });
    return { threw: false, tag: (r as unknown as { __tag: string }).__tag, error: "" };
  } catch (e) {
    return { threw: true, tag: "", error: String((e as Error).message) };
  }
}

const withNull = call(null);
const withStream = call({ urlAt8: url8 });

process.stdout.write(JSON.stringify({
  // both call sites must reach the extern rather than answering from thin air
  deferredOnNull: withNull.threw,
  deferredOnStream: withStream.threw,
  // ...and the deferral must name the call site, which is what makes it auditable
  citesCallSite: withNull.error.includes("0x2d81d") && withStream.error.includes("0x2d81d"),
  citesHelper: withNull.error.includes("__dynamic_cast"),
  returnedAnyway: withNull.tag || withStream.tag || null,
  error: withNull.error,
}));
