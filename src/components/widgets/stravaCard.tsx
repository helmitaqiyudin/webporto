"use client";

import { useQuery } from "@tanstack/react-query";
import { SiStrava } from "react-icons/si";
import { apiGet } from "@/lib/api";
import { formatKm } from "@/lib/format";
import type { StravaRun, StravaStats } from "@/types/api";
import RunCarousel from "./runCarousel";
import { widgetState } from "@/lib/widgetState";
import WidgetCard from "./widgetCard";

const FIVE_MINUTES = 5 * 60_000;

/** Recent public Strava runs (browsable) with their routes, plus yearly and 4-week totals. */
export default function StravaCard() {
    const runs = useQuery({
        queryKey: ["strava", "runs"],
        queryFn: () => apiGet<StravaRun[]>("/strava/runs"),
        refetchInterval: FIVE_MINUTES,
    });
    const stats = useQuery({
        queryKey: ["strava", "stats"],
        queryFn: () => apiGet<StravaStats>("/strava/stats"),
        refetchInterval: FIVE_MINUTES,
    });

    const state = widgetState(runs);

    return (
        <WidgetCard title="Strava" icon={<SiStrava className="size-3.5 text-[#FC4C02]" />} state={state} className="sm:col-span-2">
            {runs.data && runs.data.length > 0 ? (
                <RunCarousel runs={runs.data} />
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
