"use client";

import { useQuery } from "@tanstack/react-query";
import { SiStrava } from "react-icons/si";
import { apiGet } from "@/lib/api";
import { formatDuration, formatKm, formatPace, formatRelativeTime } from "@/lib/format";
import type { StravaRun, StravaStats } from "@/types/api";
import RouteSvg from "./routeSvg";
import { widgetState } from "@/lib/widgetState";
import WidgetCard from "./widgetCard";

const FIVE_MINUTES = 5 * 60_000;

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium tabular-nums">{value}</p>
        </div>
    );
}

export default function StravaCard() {
    const recent = useQuery({
        queryKey: ["strava", "recent"],
        queryFn: () => apiGet<StravaRun | null>("/strava/recent"),
        refetchInterval: FIVE_MINUTES,
    });
    const stats = useQuery({
        queryKey: ["strava", "stats"],
        queryFn: () => apiGet<StravaStats>("/strava/stats"),
        refetchInterval: FIVE_MINUTES,
    });

    const state = widgetState(recent);
    const run = recent.data;

    return (
        <WidgetCard title="Strava" icon={<SiStrava className="size-3.5 text-[#FC4C02]" />} state={state} className="sm:col-span-2">
            {run ? (
                <div className="flex flex-col gap-4 sm:flex-row">
                    <RouteSvg polyline={run.polyline} className="h-[90px] w-full shrink-0 rounded-md bg-muted/40 sm:w-[140px]" />
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{run.name}</p>
                            <p className="text-xs text-muted-foreground">Last run · {formatRelativeTime(run.startDate, new Date())}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Metric label="Distance" value={formatKm(run.distanceM)} />
                            <Metric label="Pace" value={formatPace(run.avgPaceSPerKm)} />
                            <Metric label="Time" value={formatDuration(run.movingTimeS)} />
                            <Metric label="Elevation" value={`${Math.round(run.elevationM)} m`} />
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No public runs yet</p>
            )}

            {stats.data && (
                <div className="flex flex-col gap-1 border-t pt-3 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                    <p>
                        This year: <span className="text-foreground">{formatKm(stats.data.ytd.distanceM)}</span> · {stats.data.ytd.count} runs
                    </p>
                    <p>
                        Last 4 weeks: <span className="text-foreground">{formatKm(stats.data.recent4w.distanceM)}</span>
                    </p>
                </div>
            )}
        </WidgetCard>
    );
}
