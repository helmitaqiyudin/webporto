import { expect, it } from "vitest";
import { formatDay, formatDuration, formatKm, formatPace, formatRelativeTime } from "./format";

it("formats run numbers", () => {
  expect(formatKm(5234)).toBe("5.2 km");
  expect(formatKm(312400)).toBe("312 km");
  expect(formatPace(365)).toBe("6:05 /km");
  expect(formatPace(0)).toBe("–");
  expect(formatDuration(1900)).toBe("31:40");
  expect(formatDuration(3912)).toBe("1:05:12");
});

it("formats relative time", () => {
  const now = new Date("2026-10-19T12:00:00Z");
  expect(formatRelativeTime("2026-10-17T12:00:00Z", now)).toBe("2 days ago");
  expect(formatRelativeTime("2026-10-19T09:00:00Z", now)).toBe("3 hours ago");
  expect(formatRelativeTime("2026-10-19T11:58:00Z", now)).toBe("2 minutes ago");
  expect(formatRelativeTime("2026-08-19T12:00:00Z", now)).toBe("2 months ago");
});

it("returns empty strings for missing or malformed dates instead of throwing", () => {
  const now = new Date("2026-10-19T12:00:00Z");
  expect(formatRelativeTime("", now)).toBe("");
  expect(formatRelativeTime("not a date", now)).toBe("");
  expect(formatDay("2026-10-17")).toBe("Oct 17, 2026");
  expect(formatDay("garbage")).toBe("");
});
