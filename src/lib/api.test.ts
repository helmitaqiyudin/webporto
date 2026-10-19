import { afterEach, expect, it, vi } from "vitest";
import { apiGet, apiPost } from "./api";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("does not fetch when the API URL is missing", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "");
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  await expect(apiGet("/activity")).rejects.toMatchObject({ code: "no_api_url" });
  expect(f).not.toHaveBeenCalled();
});

it("maps error bodies to ApiError codes", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "not_listening" }, { status: 409 })));
  await expect(apiPost("/spotify/queue", { uri: "x" })).rejects.toMatchObject({ status: 409, code: "not_listening" });
});

it("returns parsed JSON and posts JSON bodies to the configured base URL", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test");
  const f = vi.fn(async () => Response.json({ ok: true }));
  vi.stubGlobal("fetch", f);
  expect(await apiPost("/spotify/queue", { uri: "u" })).toEqual({ ok: true });
  const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://api.test/spotify/queue");
  expect(init.method).toBe("POST");
  expect(init.body).toBe(JSON.stringify({ uri: "u" }));
});

it("turns a network failure into ApiError network", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
  await expect(apiGet("/activity")).rejects.toMatchObject({ status: 0, code: "network" });
});

it("falls back to upstream_error when the error body is not JSON", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn(async () => new Response("oops", { status: 500 })));
  await expect(apiGet("/activity")).rejects.toMatchObject({ status: 500, code: "upstream_error" });
});
