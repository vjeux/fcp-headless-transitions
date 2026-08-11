// PostTextureDeleteEventList_unlock_hasEvent_driver.mts — the TypeScript side of the
// differential for PR #178 (rework).
//
// Imports the REAL ported module — no Python restatement of the port, which would
// share any misreading of the disassembly with the port itself (OPS_LOG, worker 3).
// Node 24 strips types natively, so there is no build step:
//
//     node --experimental-strip-types <this file>      # JSON on stdin, JSON on stdout
//
// It also evaluates the negative-control MUTANTS in this same process, so they are
// apples-to-apples with the port rather than a differently-built comparison.

import {
  PostTextureDeleteEventList_unlock,
  PostTextureDeleteEventList_hasEvent,
  type HGTextureManager_PostTextureDeleteEventList,
  type PthreadMutex,
} from "../../src/render/HGTextureManager__PostTextureDeleteEventList.ts";

type Req = {
  unlock: { rc: number }[];
  hasEvent: { begin: number; end: number }[];
};

/** A PthreadMutex whose native call returns a scripted code, so the differential can
 *  ask the ONE question the rejection was about: does the port forward it? */
function mutexReturning(rc: number): PthreadMutex {
  return { lock: () => rc, unlock: () => rc };
}

function receiver(mutex: PthreadMutex, begin: number, end: number):
    HGTextureManager_PostTextureDeleteEventList {
  return {
    mutexAtPlus0x00: mutex,
    eventsBeginAtPlus0x40: begin,
    eventsEndAtPlus0x48: end,
  };
}

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req: Req = JSON.parse(Buffer.concat(chunks).toString("utf8"));

const out = {
  // --- the port under review -------------------------------------------------
  unlock: req.unlock.map(({ rc }) =>
    PostTextureDeleteEventList_unlock(receiver(mutexReturning(rc), 0, 0))),
  hasEvent: req.hasEvent.map(({ begin, end }) =>
    PostTextureDeleteEventList_hasEvent(receiver(mutexReturning(0), begin, end))),

  // --- negative controls, evaluated in this same process ---------------------
  // M1 is not an invented mutant: it is LITERALLY what PR #178 shipped before this
  // rework (a local pthread_mutex_unlock helper that discarded the native result and
  // returned a hard-coded 0), i.e. the exact defect reviewer-5 rejected.
  mutants: {
    unlock_M1_constant_zero: req.unlock.map(() => 0),
    // M2: the tail jmp read as a `call` whose result is negated/ignored differently.
    unlock_M2_negated: req.unlock.map(({ rc }) => -rc),
    // M3: `setne` misread as `sete` (the classic polarity flip).
    hasEvent_M3_inverted: req.hasEvent.map(({ begin, end }) => begin === end),
    // M4: the ZF compare misread as an ordering compare (`setb`).
    hasEvent_M4_lessthan: req.hasEvent.map(({ begin, end }) => begin < end),
  },
};

process.stdout.write(JSON.stringify(out));
