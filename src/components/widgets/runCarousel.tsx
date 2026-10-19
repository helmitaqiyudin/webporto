"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, formatKm, formatPace, formatRelativeTime } from "@/lib/format";
import type { StravaRun } from "@/types/api";
import RouteSvg from "./routeSvg";

/** One labelled number in the run summary. */
function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium tabular-nums">{value}</p>
        </div>
    );
}

/** Recent public runs, newest first, one at a time with newer/older buttons. */
export default function RunCarousel({ runs }: { runs: StravaRun[] }) {
    const [index, setIndex] = useState(0);
    const current = Math.min(index, runs.length - 1);
    const run = runs[current];

    return (
        <div className="flex flex-col gap-4 sm:flex-row">
            <RouteSvg polyline={run.polyline} className="h-[90px] w-full shrink-0 rounded-md bg-muted/40 sm:w-[140px]" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{run.name}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(run.startDate, new Date())}</p>
                    </div>
                    {runs.length > 1 && (
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label="Newer run"
                                disabled={current === 0}
                                onClick={() => setIndex(current - 1)}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
                                {current + 1} / {runs.length}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                aria-label="Older run"
                                disabled={current === runs.length - 1}
                                onClick={() => setIndex(current + 1)}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric label="Distance" value={formatKm(run.distanceM)} />
                    <Metric label="Pace" value={formatPace(run.avgPaceSPerKm)} />
                    <Metric label="Time" value={formatDuration(run.movingTimeS)} />
                    <Metric label="Elevation" value={`${Math.round(run.elevationM)} m`} />
                </div>
            </div>
        </div>
    );
}
