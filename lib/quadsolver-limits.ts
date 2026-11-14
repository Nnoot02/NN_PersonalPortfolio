// The nine checks QuadSolver makes on the 5-inch preset, as the limit-use
// figure prints them. Read from QuadSolverApp 330ed39 (make_five_inch,
// run_five_inch, default assumptions) and rounded the way the write-up rounds.
// share is the unrounded app value over the limit, in percent; null where the
// check is not a share of a rating. One object per line: the contract parses
// this file as text.
export type LimitRow = {
  key: string;
  label: string;
  cls: "Feasibility" | "Warning";
  at: "Hover" | "Full throttle" | "Setup";
  value: string;
  limit: string;
  share: number | null;
  note: string | null;
};

export const QUADSOLVER_LIMITS: readonly LimitRow[] = [
  { key: "motor-current", label: "Motor current", cls: "Feasibility", at: "Hover", value: "6.1 A", limit: "50 A", share: 12.1, note: null },
  { key: "motor-power", label: "Motor power", cls: "Feasibility", at: "Hover", value: "36 W", limit: "1260 W", share: 2.9, note: null },
  { key: "esc-continuous", label: "ESC continuous current", cls: "Feasibility", at: "Hover", value: "6.1 A", limit: "55 A", share: 11.0, note: null },
  { key: "battery-current", label: "Battery current", cls: "Feasibility", at: "Hover", value: "6.6 A", limit: "180 A", share: 3.6, note: null },
  { key: "hover-throttle", label: "Hover throttle", cls: "Feasibility", at: "Hover", value: "27 %", limit: "60 %", share: 45.2, note: null },
  { key: "thrust-to-weight", label: "Thrust-to-weight", cls: "Feasibility", at: "Full throttle", value: "7.69 : 1", limit: "2.3 : 1", share: null, note: "target met" },
  { key: "esc-burst", label: "ESC burst current", cls: "Warning", at: "Full throttle", value: "36.5 A", limit: "70 A", share: 52.2, note: null },
  { key: "esc-voltage", label: "ESC voltage range", cls: "Warning", at: "Setup", value: "22.2 V", limit: "11.1 to 25.2 V", share: null, note: "inside the range" },
  { key: "airframe-mass", label: "Airframe mass", cls: "Warning", at: "Setup", value: "620 g", limit: "unset", share: null, note: "band unset, not tested" },
];
