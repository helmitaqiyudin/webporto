"use client";

import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";
import { Music } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { queueMessage } from "@/lib/nowPlaying";
import type { SearchTrack } from "@/types/api";

interface SuggestSongDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Search Spotify and add a track to Helmi's queue. */
export default function SuggestSongDialog({ open, onOpenChange }: SuggestSongDialogProps) {
    const [text, setText] = useState("");
    const [query] = useDebounceValue(text.trim(), 300);

    const search = useQuery({
        queryKey: ["spotify", "search", query],
        queryFn: () => apiGet<{ tracks: SearchTrack[] }>(`/spotify/search?q=${encodeURIComponent(query)}`),
        enabled: open && query.length >= 2,
        staleTime: 60_000,
    });

    const queue = useMutation({
        mutationFn: (uri: string) => apiPost<{ ok: true }>("/spotify/queue", { uri }),
        onSuccess: () => setText(""),
    });

    const result = queue.isSuccess
        ? queueMessage("ok")
        : queue.isError
            ? queueMessage(queue.error instanceof ApiError ? queue.error.code : "error")
            : null;
    const tracks = query.length >= 2 ? (search.data?.tracks ?? []) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Suggest a song</DialogTitle>
                    <DialogDescription>It goes straight into Helmi&apos;s Spotify queue.</DialogDescription>
                </DialogHeader>

                <input
                    type="search"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (!queue.isIdle) queue.reset();
                    }}
                    placeholder="Search for a song"
                    aria-label="Search for a song"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />

                {search.isError && <p className="text-sm text-muted-foreground">Search is offline right now</p>}
                {search.isSuccess && query.length >= 2 && tracks.length === 0 && (
                    <p className="text-sm text-muted-foreground">No songs found</p>
                )}

                {tracks.length > 0 && (
                    <ul className="flex flex-col gap-1">
                        {tracks.map((track) => (
                            <li key={track.uri}>
                                <button
                                    type="button"
                                    disabled={queue.isPending}
                                    onClick={() => queue.mutate(track.uri)}
                                    className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent disabled:opacity-50"
                                >
                                    {track.imageUrl ? (
                                        <Image src={track.imageUrl} alt="" width={40} height={40} unoptimized className="size-10 shrink-0 rounded" />
                                    ) : (
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted">
                                            <Music className="size-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{track.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{track.artists.join(", ")}</p>
                                    </div>
                                    {track.explicit && (
                                        <span className="shrink-0 rounded-sm bg-muted px-1 text-[10px] font-medium text-muted-foreground" title="Explicit">
                                            E
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <p role="status" className="min-h-5 text-sm text-muted-foreground">
                    {queue.isPending ? "Adding…" : result}
                </p>
            </DialogContent>
        </Dialog>
    );
}
