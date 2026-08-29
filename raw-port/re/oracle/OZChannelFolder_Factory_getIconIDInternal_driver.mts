import { OZChannelFolder_Factory } from "../../src/channels/OZChannelFolder_Factory.ts";

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const { calls } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  calls: number;
};
const factory = new OZChannelFolder_Factory();
const port = Array.from({ length: calls }, () => factory.getIconIDInternal());
const mutants = [
  { name: "return zero", values: Array.from({ length: calls }, () => 0) },
  { name: "return unsigned 0xffffffff", values: Array.from({ length: calls }, () => 0xffffffff) },
];
process.stdout.write(JSON.stringify({ port, mutants }));
