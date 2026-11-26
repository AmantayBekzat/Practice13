import { useState } from "react";
import { ChevronDown, ChevronUp, FlaskConical, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { minutesToLabel, labelToMinutes } from "@/lib/validation";
import {
  checkCommonAvailability,
  runSharedTests,
  type Practice12Output,
  type Practice12ReasonCode,
} from "@/lib/practice12";

const DEMO_NOW_MINUTES = 540;

const VALIDATION_ERROR_CODES: ReadonlySet<Practice12ReasonCode> = new Set([
  "INVALID_INPUT",
  "INVALID_DURATION",
  "INVALID_WINDOW",
  "PAST_START",
]);

interface SharedTestRow {
  id: string;
  description: string;
  passed: boolean;
  expected: string;
  observed: string;
}

export function Practice12Panel() {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("11:00");
  const [duration, setDuration] = useState("60");
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<Practice12Output | null>(null);
  const [sharedResults, setSharedResults] = useState<SharedTestRow[] | null>(null);
  const [sharedSummary, setSharedSummary] = useState<{ passed: number; failed: number } | null>(null);

  function clearResult() {
    setResult(null);
  }

  function handleRunCheck() {
    const startNum = labelToMinutes(startTime);
    const durationNum = duration.trim() === "" ? NaN : Number(duration);
    const out = checkCommonAvailability({
      start: startNum,
      duration: durationNum,
      blocked,
    });
    setResult(out);
  }

  function handleRunShared() {
    const { results, passedCount, failedCount } = runSharedTests();
    setSharedResults(
      results.map((r) => ({
        id: r.id,
        description: r.description,
        passed: r.passed,
        expected: r.expected,
        observed: r.observed,
      }))
    );
    setSharedSummary({ passed: passedCount, failed: failedCount });
  }

  const isValidationError = result !== null && VALIDATION_ERROR_CODES.has(result.reasonCode);
  const statusLabel = result
    ? isValidationError
      ? "Validation error"
      : result.available
        ? "Available"
        : "Unavailable"
    : null;

  const statusColor = result
    ? isValidationError
      ? "text-amber-700"
      : result.available
        ? "text-emerald-700"
        : "text-red-700"
    : "";

  const bannerClass = result
    ? isValidationError
      ? "border-amber-300 bg-amber-50"
      : result.available
        ? "border-emerald-300 bg-emerald-50"
        : "border-red-300 bg-red-50"
    : "";

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Practice 12: common availability check
            </h2>
            <p className="text-xs text-gray-500">
              One-room comparison (Newton 101) with a fixed 09:00 demo clock.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {open && (
        <div className="mt-5 space-y-5">
          <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-800">
            Fictional scenario for <strong>Newton 101</strong>. Existing bookings:
            b1 [09:00, 10:00), b2 [13:30, 15:00). Experiment clock:
            <strong> {minutesToLabel(DEMO_NOW_MINUTES)}</strong> (540 min).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label htmlFor="practice12-start" className="block text-sm font-medium text-gray-700 mb-1.5">
                Start time
              </label>
              <input
                id="practice12-start"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  clearResult();
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="practice12-duration" className="block text-sm font-medium text-gray-700 mb-1.5">
                Duration (minutes)
              </label>
              <input
                id="practice12-duration"
                type="number"
                min={0}
                step={1}
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  clearResult();
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blocked}
                  onChange={(e) => {
                    setBlocked(e.target.checked);
                    clearResult();
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                />
                Room blocked (scenario)
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRunCheck}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <Play className="w-4 h-4" /> Check availability
            </button>
            <button
              type="button"
              onClick={handleRunShared}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <FlaskConical className="w-4 h-4" /> Run 8 shared tests
            </button>
          </div>

          {result && (
            <div
              role="status"
              aria-live="polite"
              className={["rounded-xl border-2 p-5 transition-all duration-300", bannerClass].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {isValidationError ? (
                    <AlertCircle className="w-7 h-7 text-amber-600" />
                  ) : result.available ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={["text-lg font-bold", statusColor].join(" ")}>
                    {statusLabel}
                  </p>
                  <p className="text-sm mt-0.5 text-gray-700">{result.message}</p>
                  <p className="text-xs mt-1 text-gray-400">
                    reasonCode: {result.reasonCode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {sharedResults && (
            <div className="rounded-xl border border-gray-200 p-4 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Shared test results</h3>
              <div className="overflow-x-auto min-w-0">
                <table className="text-sm min-w-[480px] w-full">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                      <th className="py-2 pr-3 whitespace-nowrap">ID</th>
                      <th className="py-2 pr-3">Scenario</th>
                      <th className="py-2 pr-3 whitespace-nowrap">Expected</th>
                      <th className="py-2 pr-3 whitespace-nowrap">Observed</th>
                      <th className="py-2 whitespace-nowrap">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedResults.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 pr-3 font-medium text-gray-900 whitespace-nowrap">{row.id}</td>
                        <td className="py-2 pr-3 text-gray-600">{row.description}</td>
                        <td className="py-2 pr-3 text-gray-600 font-mono text-xs whitespace-nowrap">{row.expected}</td>
                        <td className="py-2 pr-3 text-gray-600 font-mono text-xs whitespace-nowrap">{row.observed}</td>
                        <td className="py-2 whitespace-nowrap">
                          {row.passed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 className="w-4 h-4" /> PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                              <XCircle className="w-4 h-4" /> FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sharedSummary && (
                <p className="mt-3 text-sm text-gray-700">
                  <strong>{sharedSummary.passed}</strong> passed,{" "}
                  <strong>{sharedSummary.failed}</strong> failed of 8 shared tests.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
