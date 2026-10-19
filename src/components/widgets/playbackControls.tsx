import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PlaybackAction = "play" | "pause" | "next" | "previous";

interface PlaybackControlsProps {
    isPlaying: boolean;
    pending: boolean;
    onAction: (action: PlaybackAction) => void;
}

/** Previous / play-pause / next for Helmi's Spotify player. */
export default function PlaybackControls({ isPlaying, pending, onAction }: PlaybackControlsProps) {
    return (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" aria-label="Previous track" disabled={pending} onClick={() => onAction("previous")}>
                <SkipBack className="size-4" />
            </Button>
            {isPlaying ? (
                <Button variant="ghost" size="icon" className="size-8" aria-label="Pause" disabled={pending} onClick={() => onAction("pause")}>
                    <Pause className="size-4" />
                </Button>
            ) : (
                <Button variant="ghost" size="icon" className="size-8" aria-label="Play" disabled={pending} onClick={() => onAction("play")}>
                    <Play className="size-4" />
                </Button>
            )}
            <Button variant="ghost" size="icon" className="size-8" aria-label="Next track" disabled={pending} onClick={() => onAction("next")}>
                <SkipForward className="size-4" />
            </Button>
        </div>
    );
}
