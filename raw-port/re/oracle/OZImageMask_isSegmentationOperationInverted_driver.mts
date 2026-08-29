import { OZImageMask_isSegmentationOperationInverted } from "../../src/nodes/OZImageMask.ts";

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}
const { values } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  values: number[];
};

const port = values.map((value) =>
  OZImageMask_isSegmentationOperationInverted({
    segmentationOperationInvertedByte: value,
  }),
);
const mutants = [
  {
    name: "normalize the loaded byte to boolean",
    values: values.map((value) => (value !== 0 ? 1 : 0)),
  },
  {
    name: "sign-extend the loaded byte",
    values: values.map((value) => (value << 24) >> 24),
  },
];
process.stdout.write(JSON.stringify({ port, mutants }));
