"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInterval } from "usehooks-ts";
import { Music } from "lucide-react";
import { SiSpotify } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiGet } from "@/lib/api";
import { formatDuration, formatRelativeTime } from "@/lib/format";
import { currentProgressMs } from "@/lib/nowPlaying";
import type { NowPlaying, RecentTrack, TrackSummary } from "@/types/api";
import SuggestSongDialog from "./suggestSongDialog";
import WidgetCard, { type WidgetState } from "./widgetCard";

function TrackRow({ track }: { track: TrackSummary }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            {track.imageUrl ? (
                <Image src={track.imageUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded" />
            ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded bg-muted">
                    <Music className="size-5 text-muted-foreground" />
                </div>
            )}
            <div className="min-w-0">
                <a href={track.url} target="_blank" rel="noopener" className="block truncate text-sm font-medium hover:underline">
                    {track.name}
                </a>
                <p className="truncate text-xs text-muted-foreground">{track.artists.join(", ")}</p>
            </div>
        </div>
    );
}

export default function SpotifyCard() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    const nowPlaying = useQuery({
        queryKey: ["spotify", "now-playing"],
        queryFn: () => apiGet<NowPlaying>("/spotify/now-playing"),
        refetchInterval: 10_000,
    });
    const np = nowPlaying.data;
    const playing = Boolean(np?.isPlaying && np.track);

    const recent = useQuery({
        queryKey: ["spotify", "recent"],
        queryFn: () => apiGet<RecentTrack>("/spotify/recent"),
        enabled: nowPlaying.isSuccess && !playing,
        staleTime: 60_000,
    });

    useInterval(() => setNow(Date.now()), playing ? 1000 : null);

    const state: WidgetState = nowPlaying.isError ? "error" : nowPlaying.isPending ? "loading" : "ready";
    // Measure from when this browser received the data, so a skewed visitor clock can't move the bar.
    const progressMs = np && playing ? currentProgressMs({ ...np, fetchedAt: nowPlaying.dataUpdatedAt }, now) : 0;
    const durationMs = np?.track?.durationMs ?? 0;

    return (
        <WidgetCard title="Spotify" icon={<SiSpotify className="size-3.5 text-[#1DB954]" />} state={state}>
            {playing && np?.track ? (
                <div className="flex flex-col gap-2">
                    <TrackRow track={np.track} />
                    <Progress value={durationMs ? (progressMs / durationMs) * 100 : 0} className="h-1" />
                    <p className="text-right text-xs tabular-nums text-muted-foreground">
                        {formatDuration(progressMs / 1000)} / {formatDuration(durationMs / 1000)}
                    </p>
                </div>
            ) : recent.data ? (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                        Last played · {formatRelativeTime(recent.data.playedAt, new Date(now))}
                    </p>
                    <TrackRow track={recent.data.track} />
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {recent.isPending && recent.fetchStatus !== "idle" ? "Loading…" : "Nothing played recently"}
                </p>
            )}

            <Button variant="outline" size="sm" className="self-start" onClick={() => setDialogOpen(true)}>
                Suggest a song
            </Button>
            <SuggestSongDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </WidgetCard>
    );
}
