import { expect, it } from "vitest";
import type { NowPlaying } from "@/types/api";
import { controlMessage, currentProgressMs, queueMessage } from "./nowPlaying";

const np = { isPlaying: true, progressMs: 190000, fetchedAt: 0, track: { durationMs: 200000 } } as NowPlaying;

it("interpolates and clamps progress", () => {
  expect(currentProgressMs(np, 5000)).toBe(195000);
  expect(currentProgressMs(np, 60000)).toBe(200000);
  expect(currentProgressMs({ ...np, isPlaying: false }, 60000)).toBe(190000);
});

it("maps queue results to copy", () => {
  expect(queueMessage("ok")).toBe("Added to Helmi's queue");
  expect(queueMessage("not_listening")).toBe("Helmi isn't listening right now");
  expect(queueMessage("upstream_error")).toBe("Couldn't add that song. Try again.");
});

it("maps playback control failures to copy", () => {
  expect(controlMessage("not_listening")).toBe("Helmi isn't listening right now");
  expect(controlMessage("upstream_error")).toBe("Couldn't reach Spotify. Try again.");
});
