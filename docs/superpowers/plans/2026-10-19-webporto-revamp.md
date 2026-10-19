# webporto Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the portfolio to Next 16 / React 19, restructure the home page, add live widgets for Discord, Spotify with song suggestions, Strava, and a GitHub + Bitbucket heatmap, and expand the content: projects, experience highlights, and a grouped stack.

**Architecture:**
- The home page becomes a server component that composes client islands: the 3D head, the cat, text effects, and widgets.
- Widgets fetch `helmi-api` (see the `helmi-api` plan) through one small API client, plus Lanyard for Discord, using React Query.
- The data-shaping logic (formatting, polyline → SVG path, heatmap bucketing, progress interpolation) lives in pure functions with Vitest tests. Components stay thin and are verified in the browser.

**Tech Stack:** Bun, Next 16, React 19.2, `@react-three/fiber` 9, `@react-three/drei` 10, `framer-motion` 12, Tailwind 3 (unchanged), shadcn-style Radix components, `@tanstack/react-query` 5, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-19-porto-revamp-design.md` §1, §5, §6, §7 steps 2–4

## Global Constraints

- **Repo and tooling:**
  - Work on branch `feat/porto-revamp`.
  - Package manager is Bun. Delete `package-lock.json` and keep `bun.lock`.
  - Never stage `public/models/AllCats.png` (Helmi's untracked file).
- **Versions:** latest `next@16`, `react@19`/`react-dom@19` (≥ 19.2), `@react-three/fiber@9`, `@react-three/drei@10`, `framer-motion@12`. Tailwind stays on v3.
- **Removed packages:** `framer-motion-3d`, `@mantine/core`, `@mantine/hooks`.
- **File names** are camelCase, matching the existing `src/components/custom/*` and `src/components/ui/*`.
- **UI copy is English**, matching the existing site. The spec §5.3 copy table uses these exact strings.
- **Environment variables:**
  - `NEXT_PUBLIC_API_URL`: `helmi-api` base URL, no trailing slash
  - `NEXT_PUBLIC_DISCORD_USER_ID`: already used
- **Polling intervals:**
  - Discord 5 s
  - Spotify now-playing 10 s, with client-side progress ticking every 1 s
  - Strava 5 min
  - Activity 30 min
  - React Query `retry: 2`, default pause when the tab is hidden
- **Layout:**
  - Content max width 680px. Single column under 640px.
  - No horizontal page scroll at 375px width. The heatmap scrolls inside its own card.
- **Failure behavior:** a widget that fails shows the muted text "Offline right now" in its card. It never throws to the page, and never shows technical detail.
- **API types** in `src/types/api.ts` mirror the `helmi-api` plan exactly:
  - `TrackSummary`, `NowPlaying`, `RecentTrack`, `SearchTrack`
  - `StravaRun`, `Totals`, `StravaStats`
  - `ActivityDays`
  - `ActivityResponse = { updatedAt: string; days: ActivityDays }`

## Review Focus

1. **`NEXT_PUBLIC_API_URL` is unset** (for example, a Vercel preview without the env var). Expected: widgets show offline, and no request goes to `undefined/...`. Test is in Task 3.
2. **The track ends between polls.** Expected: the interpolated progress clamps at `durationMs` and never exceeds 100%. Test is in Task 3.
3. **Heatmap data is all zeros** (Bitbucket backfill still running, GitHub not connected). Expected: every cell is level 0, with no `NaN` thresholds. Test is in Task 3.
4. **Strava pace is 0, or the duration is ≥ 1 h.** Expected: pace renders `–`, and duration renders `1:05:12`. Test is in Task 3.
5. **The route has 0–1 points, or is a straight north–south line** (zero-width bbox). Expected: an empty path or a valid path with no `NaN`. Test is in Task 3.

---

### Task 1: Toolchain upgrade and 3D spring rewrite

**Files:**
- Modify: `package.json`, `src/components/core/themeProvider.tsx`, `src/components/modelControl.tsx`, `src/components/custom/head3D.tsx`, `src/components/custom/interactiveCat.tsx`, `src/app/cat/page.tsx`
- Create: `eslint.config.mjs`, `vitest.config.ts`, `src/lib/spring.ts`
- Delete: `.eslintrc.json`, `package-lock.json`
- Test: `src/lib/spring.test.ts`

**Interfaces:**
- Produces:
  - `type SpringState = { value: number; velocity: number }`
  - `type SpringConfig = { stiffness: number; damping: number; mass?: number }`
  - `stepSpring(s: SpringState, target: number, cfg: SpringConfig, dt: number): SpringState`
  - Scripts: `"lint": "eslint ."`, `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`

`MathUtils.damp` (named in spec §5.1) has no overshoot. It would lose the head's bounce, so a small spring integrator replaces it.

- [ ] **Step 1: Upgrade dependencies**

```bash
cd /c/Users/helmi/webporto && rm package-lock.json
bun remove framer-motion-3d @mantine/core @mantine/hooks
bun add next@16 react@19 react-dom@19 @react-three/fiber@9 @react-three/drei@10 three framer-motion@12 next-themes lucide-react @tanstack/react-query usehooks-ts react-icons @use-gesture/react @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-tooltip
bun add -d @types/react@19 @types/react-dom@19 @types/three eslint@9 eslint-config-next@16 vitest
```

- [ ] **Step 2: Replace the lint config and add the Vitest config**

`eslint.config.mjs` spreads `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, and ignores `.next/**`, `node_modules/**`, `next-env.d.ts`.

`vitest.config.ts` uses `environment: "node"`, `include: ["src/**/*.test.ts"]`, and the alias `@` → `./src`.

- [ ] **Step 3: Write the failing spring test**

```ts
const run = (from: number, to: number, cfg: SpringConfig, seconds: number) => {
  let s = { value: from, velocity: 0 }; let max = from;
  for (let t = 0; t < seconds; t += 1 / 60) { s = stepSpring(s, to, cfg, 1 / 60); max = Math.max(max, s.value); }
  return { s, max };
};
it("settles on the target", () => {
  expect(Math.abs(run(1, 2, { stiffness: 300, damping: 10 }, 3).s.value - 2)).toBeLessThan(1e-3);
  expect(Math.abs(run(0, 1, { stiffness: 1000, damping: 20 }, 3).s.value - 1)).toBeLessThan(1e-3);
});
it("keeps the bounce (overshoots with low damping)", () => {
  expect(run(2, 3, { stiffness: 300, damping: 10 }, 2).max).toBeGreaterThan(3.05);
});
it("stays stable on a long frame", () => {
  const s = stepSpring({ value: 0, velocity: 0 }, 1, { stiffness: 1000, damping: 20 }, 0.5);
  expect(Number.isFinite(s.value)).toBe(true); expect(Math.abs(s.value)).toBeLessThan(10);
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `bun run test`
Expected: FAIL, `stepSpring` not defined.

- [ ] **Step 5: Implement `stepSpring` in `src/lib/spring.ts`**

Semi-implicit Euler. Clamp `dt` to 0.1 s, and split it into substeps of at most 1/240 s. Force is `-stiffness * (value - target) - damping * velocity` over `mass` (default 1).

- [ ] **Step 6: Run the test**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 7: Rewrite the 3D motion without `framer-motion-3d`**

- `modelControl.tsx` (`BouncyControls`):
  - Keep the `useDrag` logic, but write the drag result into target refs instead of motion values.
  - In `useFrame`, step two springs with `{ stiffness: 1000, damping: 20 }` and assign them to `group.rotation.x` / `.y`.
- `head3D.tsx`:
  - Hoist `Model` out of `HeadModel`.
  - Scale starts at 1, targets 2, and targets 3 while hovered (`onPointerOver` / `onPointerOut` on the group).
  - Step it with `{ stiffness: 300, damping: 10 }` in `useFrame` and apply `group.scale.setScalar(value)`.
- `themeProvider.tsx`: type props as `React.ComponentProps<typeof NextThemesProvider>`.
- `interactiveCat.tsx` and `cat/page.tsx`: fix the React 19 ref types (`RefObject<THREE.Group | null>`).
  - If drei 10 renamed any `SpriteAnimator` prop, adapt it and keep identical behavior: same fps, frames, scale, flip, and play-backwards wake.

- [ ] **Step 8: Verify the build**

Run: `bun run typecheck && bun run lint && bun run test && bun run build`
Expected: all exit 0.

- [ ] **Step 9: Verify in the browser**

Run `bun run dev` in the background and open `http://localhost:3000`.

Check:
- dragging the head rotates it and it springs back
- hovering it bounces to a larger size
- the cat follows the cursor and sleeps after about 10 s idle
- the theme toggle works
- the Discord hover card still opens
- no console errors

- [ ] **Step 10: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "chore: upgrade to Next 16 / React 19 and replace framer-motion-3d with a spring step"
```

---

### Task 2: Home page as a server component with the new section order

**Files:**
- Modify: `src/app/page.tsx`
- Create:
  - `src/components/custom/lazy3d.tsx` (`"use client"`)
  - `src/components/custom/hero.tsx` (`"use client"`)
  - `src/components/custom/siteFooter.tsx`
  - `src/components/widgets/widgetGrid.tsx`

**Interfaces:**
- Produces:
  - `HeadModelLazy` and `InteractiveCatLazy` from `lazy3d.tsx`. Both use `next/dynamic` with `ssr: false`.
  - `Hero(): JSX.Element`
  - `SiteFooter(): JSX.Element`
  - `WidgetGrid(): JSX.Element`: a 2-column grid (`grid-cols-1 sm:grid-cols-2 gap-3`). Tasks 4–7 fill its cells. For now it holds the existing `DiscordActivity`.

- [ ] **Step 1: Restructure the page**

- `page.tsx` has no `"use client"`.
- Order:
  1. background grid div
  2. `ModeToggle` (top-right, as now)
  3. `InteractiveCatLazy`
  4. `<main className="mx-auto flex w-full max-w-[680px] flex-col gap-8 px-4 py-12 sm:px-6">` containing `Hero`, the `WidgetGrid` section (heading "Live"), `Separator`, `TimelineContainer`, `Separator`, `TechStackDisplay`, `Separator`, `SiteFooter`
- Remove the top-left `DiscordActivity`.
- `Hero` layout:
  - `sm:grid sm:grid-cols-[160px_1fr] sm:items-center gap-4`
  - head container `h-[220px] sm:h-[160px]`
  - text column: name shimmer, role, socials, bio (the text moves over unchanged)

- [ ] **Step 2: Verify**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: exit 0. The build output lists `/` as static or prerendered.

Then, in the browser at 375×812 and at desktop width, in light and dark:
- the section order matches
- no horizontal scroll
- the head and the cat still work

- [ ] **Step 3: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "refactor: server-rendered home page with hero and widget grid sections"
```

---

### Task 3: API client, types, and pure helpers

**Files:**
- Create:
  - `src/types/api.ts`, `src/lib/api.ts`, `src/lib/format.ts`
  - `src/lib/polyline.ts`, `src/lib/heatmap.ts`, `src/lib/nowPlaying.ts`
  - `.env.example`
- Test: `src/lib/api.test.ts`, `src/lib/format.test.ts`, `src/lib/polyline.test.ts`, `src/lib/heatmap.test.ts`, `src/lib/nowPlaying.test.ts`

**Interfaces:**
- Produces:
  - `src/types/api.ts`: the types listed in Global Constraints.
  - In `src/lib/api.ts`:
    - `class ApiError extends Error { constructor(public status: number, public code: string) }`
    - `apiGet<T>(path: string): Promise<T>` and `apiPost<T>(path: string, body: unknown): Promise<T>`
      - Missing `NEXT_PUBLIC_API_URL` throws `ApiError(0, "no_api_url")` without calling fetch.
      - A network failure throws `ApiError(0, "network")`.
      - A non-2xx response throws `ApiError(status, body.error ?? "upstream_error")`.
  - In `src/lib/format.ts`:
    - `formatKm(m: number): string`: one decimal below 100 km, integer from 100 km up
    - `formatPace(sPerKm: number): string`: `"m:ss /km"`, `0` → `"–"`
    - `formatDuration(s: number): string`: `"m:ss"` or `"h:mm:ss"`
    - `formatRelativeTime(iso: string, now: Date): string`: `Intl.RelativeTimeFormat("en", { numeric: "auto" })`, unit minutes < 60 min, hours < 24 h, days < 30 d, months < 365 d, else years
  - In `src/lib/polyline.ts`:
    - `decodePolyline(encoded: string): [number, number][]`
    - `toSvgPath(points: [number, number][], width: number, height: number, padding: number): string`. Uniform scale, centered. Lat maps to y inverted. Returns `""` for fewer than 2 points.
  - In `src/lib/heatmap.ts`:
    - `type HeatCell = { date: string; github: number; bitbucket: number; total: number; level: 0 | 1 | 2 | 3 | 4 }`
    - `buildHeatmap(days: ActivityDays): { weeks: (HeatCell | null)[][]; total: number }`
      - Columns are Sunday-first weeks of 7. The first column is padded with `null` before the first date's weekday, using `new Date(date + "T00:00:00Z").getUTCDay()`.
      - Levels use nearest-rank quartiles q1/q2/q3 of the non-zero totals: level 0 if total is 0, 1 if ≤ q1, 2 if ≤ q2, 3 if ≤ q3, else 4.
  - In `src/lib/nowPlaying.ts`:
    - `currentProgressMs(np: NowPlaying, now: number): number`
    - `queueMessage(result: "ok" | string): string`. Returns `"Added to Helmi's queue"`, `"Helmi isn't listening right now"` (for `not_listening`), or `"Couldn't add that song. Try again."`

- [ ] **Step 1: Write the failing tests**

```ts
// api.test.ts
it("does not fetch when the API URL is missing", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", ""); const f = vi.fn(); vi.stubGlobal("fetch", f);
  await expect(apiGet("/activity")).rejects.toMatchObject({ code: "no_api_url" }); expect(f).not.toHaveBeenCalled();
});
it("maps error bodies to ApiError codes", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "not_listening" }, { status: 409 })));
  await expect(apiPost("/spotify/queue", { uri: "x" })).rejects.toMatchObject({ status: 409, code: "not_listening" });
});

// format.test.ts
it("formats run numbers", () => {
  expect(formatKm(5234)).toBe("5.2 km"); expect(formatKm(312400)).toBe("312 km");
  expect(formatPace(365)).toBe("6:05 /km"); expect(formatPace(0)).toBe("–");
  expect(formatDuration(1900)).toBe("31:40"); expect(formatDuration(3912)).toBe("1:05:12");
});
it("formats relative time", () => {
  const now = new Date("2026-10-19T12:00:00Z");
  expect(formatRelativeTime("2026-10-17T12:00:00Z", now)).toBe("2 days ago");
  expect(formatRelativeTime("2026-10-19T09:00:00Z", now)).toBe("3 hours ago");
});

// polyline.test.ts
it("decodes the reference polyline", () => {
  expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);
});
it("builds a path inside the box and handles degenerate input", () => {
  const d = toSvgPath([[0, 0], [1, 1]], 100, 60, 4);
  expect(d.startsWith("M")).toBe(true); expect(d).not.toContain("NaN");
  expect(toSvgPath([[0, 0]], 100, 60, 4)).toBe(""); expect(toSvgPath([], 100, 60, 4)).toBe("");
  expect(toSvgPath([[0, 0], [1, 0]], 100, 60, 4)).not.toContain("NaN");
});

// heatmap.test.ts
const days = (vals: number[]) => Object.fromEntries(vals.map((v, i) => [new Date(Date.UTC(2026, 9, 4 + i)).toISOString().slice(0, 10), { github: v, bitbucket: 0 }]));
it("pads the first week to Sunday and sums totals", () => {
  const h = buildHeatmap(days([1, 2, 3])); // 2026-10-04 is a Sunday
  expect(h.weeks[0][0]?.date).toBe("2026-10-04"); expect(h.total).toBe(6);
});
it("all-zero data is level 0 everywhere", () => {
  const h = buildHeatmap(days([0, 0, 0, 0]));
  expect(h.weeks.flat().every((c) => c === null || c.level === 0)).toBe(true);
});
it("assigns quartile levels", () => {
  const h = buildHeatmap(days([0, 1, 2, 3, 4, 8, 20]));
  // non-zero sorted [1,2,3,4,8,20]: nearest-rank q1=2, q2=3, q3=8
  expect(h.weeks.flat().map((c) => c?.level)).toEqual([0, 1, 1, 2, 3, 3, 4]);
});

// nowPlaying.test.ts
const np = { isPlaying: true, progressMs: 190000, fetchedAt: 0, track: { durationMs: 200000 } } as NowPlaying;
it("interpolates and clamps progress", () => {
  expect(currentProgressMs(np, 5000)).toBe(195000); expect(currentProgressMs(np, 60000)).toBe(200000);
  expect(currentProgressMs({ ...np, isPlaying: false }, 60000)).toBe(190000);
});
it("maps queue results to copy", () => {
  expect(queueMessage("ok")).toBe("Added to Helmi's queue");
  expect(queueMessage("not_listening")).toBe("Helmi isn't listening right now");
  expect(queueMessage("upstream_error")).toBe("Couldn't add that song. Try again.");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test`
Expected: FAIL.

- [ ] **Step 3: Implement the modules and `.env.example`**

`.env.example` documents `NEXT_PUBLIC_API_URL=` and `NEXT_PUBLIC_DISCORD_USER_ID=`. Values come from Helmi.

For local dev, create the git-ignored `.env.local` with:
- the deployed or `wrangler dev` URL
- Helmi's Discord user ID

- [ ] **Step 4: Run tests**

Run: `bun run test && bun run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "feat: api client and tested helpers for widgets"
```

---

### Task 4: Widget shell and Discord card

**Files:**
- Create: `src/components/widgets/widgetCard.tsx`, `src/components/widgets/discordCard.tsx`
- Modify: `src/components/widgets/widgetGrid.tsx`, `src/app/providers.tsx`, `next.config.mjs`
- Delete: `src/components/custom/discordActivity.tsx`

**Interfaces:**
- Consumes: `calculateTimes`, `getStatusText`, `getStatusType` (`src/lib/utils.ts`); `DiscordData` (`src/types/discord_activity.ts`); `Skeleton` (`ui/skeleton`)
- Produces: `WidgetCard({ title, icon, state, className, children }: { title: string; icon: React.ReactNode; state: "loading" | "error" | "ready"; className?: string; children?: React.ReactNode })`
  - `loading` renders a `Skeleton` with `min-h-24`.
  - `error` renders `<p className="text-sm text-muted-foreground">Offline right now</p>`.
  - The header row shows the icon and title in `text-xs text-muted-foreground`.

- [ ] **Step 1: Build `WidgetCard` and `DiscordCard`**

`providers.tsx`: `new QueryClient({ defaultOptions: { queries: { retry: 2 } } })`.

`DiscordCard`:
- Lanyard query every 5 s.
- Shows the avatar from `https://cdn.discordapp.com/avatars/{id}/{avatar}.png?size=64` via `next/image`. Add `remotePatterns` for `cdn.discordapp.com` in `next.config.mjs`.
- A status dot with the existing colors and the ping animation for online.
- `getStatusText`.
- The first activity with its timer from `calculateTimes`, updated every 1 s.
- Activities named `Spotify` are left out, because the Spotify card covers them.
- With more than one remaining activity, a `HoverCard` lists them all, reusing the old markup.

Put it in the first grid cell.

- [ ] **Step 2: Verify**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: exit 0.

In the browser:
- the card shows real status
- with `NEXT_PUBLIC_DISCORD_USER_ID` removed from `.env.local` it shows "Offline right now" (restore it after)

- [ ] **Step 3: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "feat: widget card shell and Discord card"
```

---

### Task 5: Spotify card and suggest-a-song dialog

**Files:**
- Create: `src/components/ui/dialog.tsx`, `src/components/widgets/spotifyCard.tsx`, `src/components/widgets/suggestSongDialog.tsx`
- Modify: `src/components/widgets/widgetGrid.tsx`, `next.config.mjs` (add the `i.scdn.co` remote pattern)

**Interfaces:**
- Consumes: `apiGet`, `apiPost`, `ApiError` (Task 3); `currentProgressMs`, `queueMessage` (Task 3); `formatDuration`, `formatRelativeTime` (Task 3); `WidgetCard` (Task 4); `NowPlaying`, `RecentTrack`, `SearchTrack` (Task 3)
- Produces: `SpotifyCard()` and `SuggestSongDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void })`

- [ ] **Step 1: Add the dialog primitive**

```bash
bun add @radix-ui/react-dialog
```

`ui/dialog.tsx` is the standard shadcn Dialog (Root, Trigger, Portal, Overlay, Content with close button, Header, Title, Description), styled like the other `ui/` files.

- [ ] **Step 2: Build `SpotifyCard`**

- **Now playing:** query `/spotify/now-playing` every 10 s. A 1 s `useInterval` drives `currentProgressMs`.
- **Playing layout:**
  - 48px cover (`next/image`)
  - title linking to `track.url` (`target="_blank" rel="noopener"`)
  - artists joined with `, `
  - `Progress` bar and `"m:ss / m:ss"` via `formatDuration(ms / 1000)`
- **Not playing:** query `/spotify/recent` (`staleTime` 60 s, enabled only then). Label it "Last played" plus the relative time. With no recent track, show "Nothing played recently".
- **Footer:** a `Button variant="outline" size="sm"` labeled "Suggest a song" opens the dialog.

- [ ] **Step 3: Build `SuggestSongDialog`**

- Title "Suggest a song". Description "It goes straight into Helmi's Spotify queue."
- Input placeholder "Search for a song". Debounce 300 ms with `useDebounceValue`.
- Query `/spotify/search?q=` only when the trimmed text is ≥ 2 characters.
- Up to 5 result rows as buttons: 40px cover, name, artists, and a small "E" badge when `explicit`.
- Clicking a row runs a `useMutation` that POSTs `/spotify/queue` with `{ uri }`. All rows are disabled while pending, so a double click sends one request.
- The result shows in a `role="status"` line via `queueMessage(ok ? "ok" : error.code)`. On success, clear the input.

- [ ] **Step 4: Verify**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: exit 0.

In the browser, with `NEXT_PUBLIC_API_URL` pointing at a running `helmi-api`:
- now playing updates, and progress ticks then stops at the full duration
- pausing Spotify switches to "Last played"
- searching `AC/DC` returns results
- suggesting with Spotify open shows "Added to Helmi's queue", and the song appears in the queue
- with Spotify closed, the same suggestion shows "Helmi isn't listening right now"
- at 375px the dialog fits without horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "feat: Spotify now-playing card with suggest-a-song dialog"
```

---

### Task 6: Strava card

**Files:**
- Create: `src/components/widgets/routeSvg.tsx`, `src/components/widgets/stravaCard.tsx`
- Modify: `src/components/widgets/widgetGrid.tsx` (full-width cell `sm:col-span-2`)

**Interfaces:**
- Consumes: `decodePolyline`, `toSvgPath`, `formatKm`, `formatPace`, `formatDuration`, `formatRelativeTime` (Task 3); `WidgetCard` (Task 4); `StravaRun`, `StravaStats` (Task 3)
- Produces: `RouteSvg({ polyline, className }: { polyline: string | null; className?: string })` and `StravaCard()`

- [ ] **Step 1: Build `RouteSvg` and `StravaCard`**

`RouteSvg`:
- `viewBox="0 0 140 90"`, a path from `toSvgPath(decodePolyline(polyline), 140, 90, 6)`
- `stroke="#FC4C02"`, `strokeWidth=2.5`, round caps, no fill, `aria-hidden`
- With a `null` polyline or an empty path, render lucide `Footprints` instead

`StravaCard`:
- Queries `/strava/recent` and `/strava/stats` every 5 min.
- Left: `RouteSvg`. Right: run name, then "Last run · {relative time}".
- A 4-up metric row: Distance, Pace, Time, Elevation (`"{Math.round(elevationM)} m"`).
- Under it: "This year: {formatKm(ytd.distanceM)} · {ytd.count} runs" and "Last 4 weeks: {formatKm(recent4w.distanceM)}".
- When the recent run is `null` but stats exist, show "No public runs yet" in place of the run block.
- Below 640px the route stacks above the text.

- [ ] **Step 2: Verify**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: exit 0.

In the browser:
- the real last run renders with its route
- in DevTools, overriding the response with `polyline: null` shows the footprints icon
- light and dark both readable

- [ ] **Step 3: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "feat: Strava last-run card with SVG route and yearly stats"
```

---

### Task 7: Activity heatmap

**Files:**
- Create: `src/components/widgets/activityHeatmap.tsx`
- Modify: `src/components/widgets/widgetGrid.tsx` (full-width cell)

**Interfaces:**
- Consumes: `buildHeatmap`, `HeatCell` (Task 3); `apiGet` (Task 3); `WidgetCard` (Task 4); `ActivityResponse` (Task 3)
- Produces: `ActivityHeatmap()`

- [ ] **Step 1: Build `ActivityHeatmap`**

- Query `/activity` every 30 min.
- Title: "{total} contributions in the last year · GitHub + Bitbucket".
- Grid: `grid-flow-col grid-rows-7` of 10px cells with a 2px gap, inside `overflow-x-auto`. On mount, scroll to the right end so the latest weeks are visible.
- Level colors:

  | Level | Classes |
  |---|---|
  | 0 | `bg-muted` |
  | 1 | `bg-emerald-200 dark:bg-emerald-900` |
  | 2 | `bg-emerald-400 dark:bg-emerald-700` |
  | 3 | `bg-emerald-500 dark:bg-emerald-500` |
  | 4 | `bg-emerald-700 dark:bg-emerald-300` |

- Hovering or tapping a cell sets one shared "selected" state. A line under the grid reads "Oct 12, 2026 · 3 GitHub, 5 Bitbucket", formatted with `Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" })`.
- With nothing selected, the line shows the legend "Less ▢▢▢▢▢ More".
- The grid gets `role="img"` and `aria-label` "{total} contributions in the last year". Cells are `aria-hidden`.

- [ ] **Step 2: Verify**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: exit 0.

In the browser:
- real data renders, and the latest week is visible on load
- hover and tap update the line
- at 375px only the heatmap scrolls, not the page

- [ ] **Step 3: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "feat: GitHub + Bitbucket activity heatmap"
```

---

### Task 8: Projects, experience highlights, grouped stack

**Files:**
- Create: `src/data/projects.ts`, `src/components/custom/projectsSection.tsx`
- Modify: `src/data/experience.tsx`, `src/components/custom/expTimeline.tsx`, `src/data/stack.tsx`, `src/components/custom/techStack.tsx`, `src/app/page.tsx` (add a Projects section after the widgets)

**Interfaces:**
- Produces:
  - `type Project = { slug: string; name: string; year: string; role: string; summary: string; stack: string[]; image?: string; highlights: string[]; links?: { demo?: string; repo?: string }; internal?: boolean }`
  - `projects: Project[]`
  - `experience[i].highlights: string[]`
  - `tech[i]: { name: string; icon: IconType; color: string; desc: string; category: "frontend" | "mobile" | "backend" | "infra" | "tools" }`. The icon component is stored directly, which removes the string `iconMap`.

- [ ] **Step 1: Write the content drafts**

`projects` entries. Helmi revises the wording, adds numbers and screenshots under `public/images/projects/`.

| slug | year | role | internal | links |
|---|---|---|---|---|
| `myits-housing` | 2024 | Front-end developer | true | — |
| `iog-ecommerce` | 2023 | Front-end developer | true | — |
| `webporto` | 2026 | Solo | false | repo `https://github.com/helmitaqiyudin/webporto` |
| `helmi-api` | 2026 | Solo | false | none until Helmi publishes the repo |

- `myits-housing`: campus housing management web app for ITS, with AR property previews.
- `iog-ecommerce`: B2B/B2C procurement platform for SKK Migas.
- `webporto`: this site, with 3D and live widgets.
- `helmi-api`: Cloudflare Worker powering the live widgets.

Experience highlights: 3 per role, drawn only from facts in the current descriptions. Don't invent metrics.

Stack, by category. Confirm each icon exists in the installed `react-icons/si`; fall back to `SiCloudflare` if `SiCloudflareworkers` is missing.

| Category | Tech |
|---|---|
| frontend | TypeScript, React, Next.js, Tailwind, Three.js (`SiThreedotjs`) |
| mobile | Flutter (`SiFlutter`) |
| backend | Node, Express, Hono (`SiHono`), MongoDB, PostgreSQL (`SiPostgresql`) |
| infra | Cloudflare Workers (`SiCloudflareworkers`), Vercel (`SiVercel`) |
| tools | Git |

- [ ] **Step 2: Render**

`ProjectsSection`:
- heading "Projects"
- grid `grid-cols-1 sm:grid-cols-2 gap-3`
- each card: optional 16:9 `next/image`, name, "{year} · {role}", summary, stack chips
- an "Internal" badge when `internal`, otherwise link buttons "Live" (`ExternalLink`) / "Code" (`FiGithub`)

`expTimeline`: render `highlights` as a `ul` with `list-disc pl-4 text-sm text-muted-foreground` under the summary.

`techStack`: one subheading per category ("Frontend", "Mobile", "Backend", "Infra", "Tools") with the existing card grid under each. Remove `iconMap`.

- [ ] **Step 3: Verify**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: exit 0.

In the browser: all sections render in both themes at 375px and desktop, and no icon renders blank.

- [ ] **Step 4: Commit**

```bash
git add -A ':!public/models/AllCats.png' && git commit -m "feat: projects section, experience highlights, and grouped tech stack"
```

---

### Task 9: Final verification and PR

- [ ] **Step 1: Full check**

Run: `bun run typecheck && bun run lint && bun run test && bun run build`
Expected: all exit 0.

- [ ] **Step 2: Browser pass against production `helmi-api`**

Check at 375×812 and desktop, in light and dark:
- every widget has live data
- with `NEXT_PUBLIC_API_URL` blanked, all API widgets show "Offline right now" and the rest of the page works
- no console errors
- no horizontal page scroll

- [ ] **Step 3 (Helmi): Vercel env vars**

Add `NEXT_PUBLIC_API_URL` (the production worker URL) to the Vercel project for Production and Preview.

- [ ] **Step 4: Push and open the PR, after Helmi says yes**

```bash
git push -u origin feat/porto-revamp
gh pr create --title "Revamp portfolio with live widgets" --body "<summary of tasks 1–8 and the Helmi to-dos still open>"
```
