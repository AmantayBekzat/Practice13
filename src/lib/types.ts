export interface Booking {
  id: string;
  room: string;
  start: number; // minutes from 00:00
  end: number;   // minutes from 00:00
  bookedBy: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface Interval {
  start: number;
  end: number;
}

export type Decision = "available" | "unavailable";

export type ReasonCode =
  | "INVALID_INPUT"
  | "INVALID_WINDOW"
  | "PAST_START"
  | "DURATION_LIMIT"
  | "BLOCKED"
  | "UNKNOWN_ROOM"
  | "OVERLAP"
  | "AVAILABLE";

export interface CheckResult {
  decision: Decision;
  reason: string;
  reasonCode?: ReasonCode;
}
