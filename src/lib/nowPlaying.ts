import type { NowPlaying } from "@/types/api";

/** Polls come every 10 s; between them the bar advances locally and stops at the track's end. */
export function currentProgressMs(np: NowPlaying, now: number): number {
  if (!np.isPlaying || !np.track) return np.progressMs;
  return Math.min(np.progressMs + (now - np.fetchedAt), np.track.durationMs);
}

/** Visitor-facing copy for a suggest-a-song result code. */
export function queueMessage(result: "ok" | string): string {
  if (result === "ok") return "Added to Helmi's queue";
  if (result === "not_listening") return "Helmi isn't listening right now";
  return "Couldn't add that song. Try again.";
}

/** Visitor-facing copy for a failed play/pause/next/previous. */
export function controlMessage(code: string): string {
  if (code === "not_listening") return "Helmi isn't listening right now";
  return "Couldn't reach Spotify. Try again.";
}
