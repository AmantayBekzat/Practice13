import { describe, expect, it } from "vitest";
import { checkCommonAvailability, runSharedTests, SHARED_TEST_CASES } from "./practice12";
import { rooms as sampleRooms, bookings as sampleBookings } from "./sampleData";

describe("Practice 12 - common availability check", () => {
  it("T1: start 660, duration 60 -> available", () => {
    const out = checkCommonAvailability({ start: 660, duration: 60, blocked: false });
    expect(out.available).toBe(true);
    expect(out.reasonCode).toBe("AVAILABLE");
  });

  it("T2: start 570, duration 60 -> overlap", () => {
    const out = checkCommonAvailability({ start: 570, duration: 60, blocked: false });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("OVERLAP");
  });

  it("T3: start 660, duration 60, blocked=true -> blocked", () => {
    const out = checkCommonAvailability({ start: 660, duration: 60, blocked: true });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("BLOCKED");
  });

  it("T4: start 660, duration 0 -> invalid duration", () => {
    const out = checkCommonAvailability({ start: 660, duration: 0, blocked: false });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_DURATION");
  });

  it("T5: start 660, duration 121 -> invalid duration", () => {
    const out = checkCommonAvailability({ start: 660, duration: 121, blocked: false });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_DURATION");
  });

  it("T6: start 510, duration 30 -> past start", () => {
    const out = checkCommonAvailability({ start: 510, duration: 30, blocked: false });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("PAST_START");
  });

  it("T7: start 600, duration 30 -> endpoint adjacency, available", () => {
    const out = checkCommonAvailability({ start: 600, duration: 30, blocked: false });
    expect(out.available).toBe(true);
    expect(out.reasonCode).toBe("AVAILABLE");
  });

  it("T8: fixtures unchanged after running all checks including repeats", () => {
    const beforeRooms = JSON.stringify(sampleRooms);
    const beforeBookings = JSON.stringify(sampleBookings);
    for (const tc of SHARED_TEST_CASES) {
      checkCommonAvailability(tc.input);
    }
    expect(JSON.stringify(sampleRooms)).toBe(beforeRooms);
    expect(JSON.stringify(sampleBookings)).toBe(beforeBookings);
  });

  it("null input -> INVALID_INPUT", () => {
    const out = checkCommonAvailability(null as unknown as never);
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_INPUT");
  });

  it("empty object input -> INVALID_INPUT", () => {
    const out = checkCommonAvailability({} as never);
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_INPUT");
  });

  it("wrong-type input -> INVALID_INPUT", () => {
    const out = checkCommonAvailability("INJECT" as unknown as never);
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_INPUT");
  });

  it("fractional duration -> INVALID_INPUT", () => {
    const out = checkCommonAvailability({ start: 660, duration: 30.5, blocked: false });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_INPUT");
  });

  it("start equal to demo now (540) -> PAST_START", () => {
    const out = checkCommonAvailability({ start: 540, duration: 30, blocked: false });
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("PAST_START");
  });

  it("120-minute valid boundary -> available", () => {
    const out = checkCommonAvailability({ start: 660, duration: 120, blocked: false });
    expect(out.available).toBe(true);
    expect(out.reasonCode).toBe("AVAILABLE");
  });

  it("midnight boundary end=1440 -> available (no overlap)", () => {
    const out = checkCommonAvailability({ start: 1320, duration: 120, blocked: false });
    expect(out.available).toBe(true);
    expect(out.reasonCode).toBe("AVAILABLE");
  });

  it("injection-like string duration -> INVALID_INPUT", () => {
    const out = checkCommonAvailability({ start: 660, duration: "'; DROP TABLE--", blocked: false } as never);
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_INPUT");
  });

  it("missing blocked field -> INVALID_INPUT", () => {
    const out = checkCommonAvailability({ start: 660, duration: 60 } as never);
    expect(out.available).toBe(false);
    expect(out.reasonCode).toBe("INVALID_INPUT");
  });

  it("shared test runner produces correct pass count", () => {
    const { passedCount, failedCount } = runSharedTests();
    expect(passedCount).toBe(8);
    expect(failedCount).toBe(0);
  });
});
