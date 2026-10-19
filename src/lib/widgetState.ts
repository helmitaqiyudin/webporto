import { ApiError } from "./api";

export type WidgetState = "loading" | "error" | "ready";

type QueryLike = { data: unknown; isError: boolean; errorUpdateCount: number };

// React Query v5 puts a query without data back into "pending" on every refetch, so
// isPending/isError alone would flash the skeleton on each poll of a dead integration.
export function widgetState(q: QueryLike): WidgetState {
  if (q.data !== undefined) return "ready";
  if (q.isError || q.errorUpdateCount > 0) return "error";
  return "loading";
}

// A missing API URL won't fix itself between attempts.
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.code === "no_api_url") return false;
  return failureCount < 2;
}
