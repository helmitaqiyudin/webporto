import { expect, it } from "vitest";
import { ApiError } from "./api";
import { shouldRetry, widgetState } from "./widgetState";

it("stays ready while it has data, even when a refetch fails", () => {
  expect(widgetState({ data: { ok: 1 }, isError: true, errorUpdateCount: 3 })).toBe("ready");
  expect(widgetState({ data: null, isError: false, errorUpdateCount: 0 })).toBe("ready");
});

it("stays offline across refetches once it has failed without data", () => {
  // React Query v5 resets a data-less query to pending (isError false) on every refetch.
  expect(widgetState({ data: undefined, isError: false, errorUpdateCount: 1 })).toBe("error");
  expect(widgetState({ data: undefined, isError: true, errorUpdateCount: 1 })).toBe("error");
});

it("is loading only before the first result", () => {
  expect(widgetState({ data: undefined, isError: false, errorUpdateCount: 0 })).toBe("loading");
});

it("never retries a missing API URL and otherwise retries twice", () => {
  expect(shouldRetry(0, new ApiError(0, "no_api_url"))).toBe(false);
  expect(shouldRetry(0, new ApiError(503, "reauth_required"))).toBe(true);
  expect(shouldRetry(1, new Error("x"))).toBe(true);
  expect(shouldRetry(2, new Error("x"))).toBe(false);
});
