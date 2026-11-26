import { checkAvailability } from "./validation";
import { rooms as sampleRooms, bookings as sampleBookings } from "./sampleData";
import type { Room } from "./types";

const DEMO_NOW = 540; // 09:00
const TARGET_ROOM_ID = "r1";
const MAX_DURATION = 120;
const DAY_END = 1440;

export type Practice12ReasonCode =
  | "INVALID_INPUT"
  | "INVALID_DURATION"
  | "INVALID_WINDOW"
  | "PAST_START"
  | "BLOCKED"
  | "OVERLAP"
  | "AVAILABLE";

export interface Practice12Input {
  start: number;
  duration: number;
  blocked: boolean;
}

export interface Practice12Output {
  available: boolean;
  reasonCode: Practice12ReasonCode;
  message: string;
}

const MESSAGES: Record<Practice12ReasonCode, string> = {
  INVALID_INPUT: "Enter a valid start time, whole-minute duration and room status.",
  INVALID_DURATION: "Duration must be a whole number from 1 to 120 minutes.",
  INVALID_WINDOW: "Choose an interval within the demo day (00:00 to 24:00).",
  PAST_START: "Start time must be after the fixed demo time, 09:00.",
  BLOCKED: "Newton 101 is blocked and cannot be booked.",
  OVERLAP: "The requested interval overlaps an existing booking.",
  AVAILABLE: "Newton 101 is available for this interval.",
};

function isInteger(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && Number.isInteger(n);
}

export function validateInput(raw: unknown): Practice12Output | null {
  if (typeof raw !== "object" || raw === null) {
    return { available: false, reasonCode: "INVALID_INPUT", message: MESSAGES.INVALID_INPUT };
  }
  const { start, duration, blocked } = raw as Partial<Practice12Input>;

  if (!isInteger(start) || !isInteger(duration) || typeof blocked !== "boolean") {
    return { available: false, reasonCode: "INVALID_INPUT", message: MESSAGES.INVALID_INPUT };
  }
  if (duration < 1 || duration > MAX_DURATION) {
    return { available: false, reasonCode: "INVALID_DURATION", message: MESSAGES.INVALID_DURATION };
  }
  const end = start + duration;
  if (start < 0 || end > DAY_END || start >= end) {
    return { available: false, reasonCode: "INVALID_WINDOW", message: MESSAGES.INVALID_WINDOW };
  }
  if (start <= DEMO_NOW) {
    return { available: false, reasonCode: "PAST_START", message: MESSAGES.PAST_START };
  }
  return null;
}

function cloneRoom(room: Room, blocked: boolean): Room {
  return { ...room, blocked };
}

const OVERLAP_CODE_MAP: Record<string, Practice12ReasonCode> = {
  BLOCKED: "BLOCKED",
  OVERLAP: "OVERLAP",
  AVAILABLE: "AVAILABLE",
};

export function checkCommonAvailability(input: Practice12Input): Practice12Output {
  const preErr = validateInput(input);
  if (preErr) return preErr;

  const { start, duration, blocked } = input;
  const end = start + duration;

  const baseRoom = sampleRooms.find((r) => r.id === TARGET_ROOM_ID);
  if (!baseRoom) {
    return { available: false, reasonCode: "INVALID_INPUT", message: MESSAGES.INVALID_INPUT };
  }

  const scenarioRoom = cloneRoom(baseRoom, blocked);
  const scenarioRooms: Room[] = [scenarioRoom];

  const result = checkAvailability(
    TARGET_ROOM_ID,
    { start, end },
    DEMO_NOW,
    scenarioRooms,
    sampleBookings
  );

  const mapped = result.reasonCode ? OVERLAP_CODE_MAP[result.reasonCode] : undefined;
  const reasonCode: Practice12ReasonCode = mapped ?? "OVERLAP";
  const message = MESSAGES[reasonCode];

  return {
    available: result.decision === "available",
    reasonCode,
    message,
  };
}

export interface SharedTestCase {
  id: string;
  description: string;
  input: { start: number; duration: number; blocked: boolean };
  expected: { available: boolean; reasonCode: Practice12ReasonCode };
}

export const SHARED_TEST_CASES: SharedTestCase[] = [
  { id: "T1", description: "start 660, duration 60 -> available", input: { start: 660, duration: 60, blocked: false }, expected: { available: true, reasonCode: "AVAILABLE" } },
  { id: "T2", description: "start 570, duration 60 -> overlaps b1", input: { start: 570, duration: 60, blocked: false }, expected: { available: false, reasonCode: "OVERLAP" } },
  { id: "T3", description: "start 660, duration 60, blocked=true -> blocked", input: { start: 660, duration: 60, blocked: true }, expected: { available: false, reasonCode: "BLOCKED" } },
  { id: "T4", description: "start 660, duration 0 -> invalid duration", input: { start: 660, duration: 0, blocked: false }, expected: { available: false, reasonCode: "INVALID_DURATION" } },
  { id: "T5", description: "start 660, duration 121 -> invalid duration", input: { start: 660, duration: 121, blocked: false }, expected: { available: false, reasonCode: "INVALID_DURATION" } },
  { id: "T6", description: "start 510, duration 30 -> past start", input: { start: 510, duration: 30, blocked: false }, expected: { available: false, reasonCode: "PAST_START" } },
  { id: "T7", description: "start 600, duration 30 -> endpoint adjacency, available", input: { start: 600, duration: 30, blocked: false }, expected: { available: true, reasonCode: "AVAILABLE" } },
  { id: "T8", description: "fixtures unchanged after all checks", input: { start: 0, duration: 0, blocked: false }, expected: { available: false, reasonCode: "INVALID_DURATION" } },
];

export function runSharedTests(): {
  results: { id: string; description: string; passed: boolean; expected: string; observed: string }[];
  passedCount: number;
  failedCount: number;
} {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const tc of SHARED_TEST_CASES) {
    if (tc.id === "T8") {
      const beforeRooms = JSON.stringify(sampleRooms);
      const beforeBookings = JSON.stringify(sampleBookings);
      for (const other of SHARED_TEST_CASES) {
        checkCommonAvailability(other.input);
      }
      checkCommonAvailability(tc.input);
      const unchanged =
        JSON.stringify(sampleRooms) === beforeRooms &&
        JSON.stringify(sampleBookings) === beforeBookings;
      const passed = unchanged;
      const observed = unchanged ? "unchanged" : "mutated";
      results.push({ id: tc.id, description: tc.description, passed, expected: "unchanged", observed });
      if (passed) passedCount++; else failedCount++;
      continue;
    }

    const out = checkCommonAvailability(tc.input);
    const passed =
      out.available === tc.expected.available && out.reasonCode === tc.expected.reasonCode;
    results.push({
      id: tc.id,
      description: tc.description,
      passed,
      expected: `${tc.expected.available},${tc.expected.reasonCode}`,
      observed: `${out.available},${out.reasonCode}`,
    });
    if (passed) passedCount++; else failedCount++;
  }

  return { results, passedCount, failedCount };
}
