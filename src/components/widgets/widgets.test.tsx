// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { StravaRun } from "@/types/api";
import PlaybackControls from "./playbackControls";
import RunCarousel from "./runCarousel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
const mount = (ui: React.ReactNode) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const created = createRoot(container);
  root = created;
  act(() => created.render(ui));
  return container;
};
const button = (c: HTMLElement, label: string) => c.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
});

const run = (name: string): StravaRun => ({
  name,
  sportType: "Run",
  startDate: "2026-10-12T09:24:43Z",
  distanceM: 4720,
  movingTimeS: 1815,
  elevationM: 39.8,
  avgPaceSPerKm: 385,
  polyline: null,
});

it("steps through runs and disables the ends", () => {
  const c = mount(<RunCarousel runs={[run("Newest"), run("Middle"), run("Oldest")]} />);
  expect(c.textContent).toContain("Newest");
  expect(c.textContent).toContain("1 / 3");
  expect(button(c, "Newer run").disabled).toBe(true);
  act(() => button(c, "Older run").click());
  act(() => button(c, "Older run").click());
  expect(c.textContent).toContain("Oldest");
  expect(c.textContent).toContain("3 / 3");
  expect(button(c, "Older run").disabled).toBe(true);
  act(() => button(c, "Newer run").click());
  expect(c.textContent).toContain("Middle");
});

it("hides the navigation for a single run", () => {
  const c = mount(<RunCarousel runs={[run("Only")]} />);
  expect(c.textContent).toContain("Only");
  expect(button(c, "Older run")).toBeNull();
});

it("shows pause while playing and play while paused, and reports each action", () => {
  const onAction = vi.fn();
  const playing = mount(<PlaybackControls isPlaying onAction={onAction} pending={false} />);
  act(() => button(playing, "Previous track").click());
  act(() => button(playing, "Pause").click());
  act(() => button(playing, "Next track").click());
  expect(onAction.mock.calls.map((call) => call[0])).toEqual(["previous", "pause", "next"]);
  expect(button(playing, "Play")).toBeNull();
  act(() => root?.unmount());
  const paused = mount(<PlaybackControls isPlaying={false} onAction={onAction} pending={false} />);
  act(() => button(paused, "Play").click());
  expect(onAction).toHaveBeenLastCalledWith("play");
});

it("disables the controls while an action is in flight", () => {
  const c = mount(<PlaybackControls isPlaying onAction={vi.fn()} pending />);
  expect(button(c, "Pause").disabled).toBe(true);
  expect(button(c, "Next track").disabled).toBe(true);
});
