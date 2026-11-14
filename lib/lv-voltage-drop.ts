// Worst-case path published in the LV write-up. Strings match the page exactly.
export const VOLTAGE_DROP_PATH = {
  limit: 5,
  segments: [
    { id: "mains", label: "Consumer mains", value: "0.74" },
    { id: "submain", label: "Butcher submain", value: "0.61" },
    { id: "final", label: "Lighting final", value: "1.66" },
  ],
  total: "3.0",
} as const;
