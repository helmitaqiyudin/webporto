"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GitCommitHorizontal } from "lucide-react";
import { apiGet } from "@/lib/api";
import { buildHeatmap, type HeatCell } from "@/lib/heatmap";
import { cn } from "@/lib/utils";
import type { ActivityResponse } from "@/types/api";
import { formatDay } from "@/lib/format";
import { widgetState } from "@/lib/widgetState";
import WidgetCard from "./widgetCard";

const LEVEL_CLASS = [
    "bg-muted",
    "bg-emerald-200 dark:bg-emerald-900",
    "bg-emerald-400 dark:bg-emerald-700",
    "bg-emerald-500 dark:bg-emerald-500",
    "bg-emerald-700 dark:bg-emerald-300",
];

export default function ActivityHeatmap() {
    const activity = useQuery({
        queryKey: ["activity"],
        queryFn: () => apiGet<ActivityResponse>("/activity"),
        refetchInterval: 30 * 60_000,
    });
    const heatmap = useMemo(() => (activity.data ? buildHeatmap(activity.data.days) : null), [activity.data]);
    const [selected, setSelected] = useState<HeatCell | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // On narrow screens the grid scrolls inside the card; start at the latest weeks.
    useEffect(() => {
        if (heatmap && scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }, [heatmap]);

    const state = widgetState(activity);

    return (
        <WidgetCard title="GitHub + Bitbucket" icon={<GitCommitHorizontal className="size-3.5" />} state={state} className="sm:col-span-2">
            {heatmap && (
                <>
                    <p className="text-sm">
                        <span className="font-medium tabular-nums">{heatmap.total.toLocaleString("en")}</span> contributions in the last year
                    </p>
                    <div ref={scrollRef} className="overflow-x-auto pb-1">
                        <div
                            role="img"
                            aria-label={`${heatmap.total} contributions in the last year`}
                            className="grid w-max grid-flow-col grid-rows-7 gap-[2px]"
                            onMouseLeave={() => setSelected(null)}
                        >
                            {heatmap.weeks.flatMap((week, w) =>
                                Array.from({ length: 7 }, (_, d) => {
                                    const cell = week[d] ?? null;
                                    if (!cell) return <div key={`pad-${w}-${d}`} className="size-[9px]" aria-hidden />;
                                    return (
                                        <div
                                            key={cell.date}
                                            aria-hidden
                                            className={cn(
                                                "size-[9px] rounded-[2px]",
                                                LEVEL_CLASS[cell.level],
                                                selected?.date === cell.date && "ring-1 ring-foreground",
                                            )}
                                            onMouseEnter={() => setSelected(cell)}
                                            onClick={() => setSelected(cell)}
                                        />
                                    );
                                }),
                            )}
                        </div>
                    </div>
                    <div className="flex min-h-4 items-center text-xs text-muted-foreground">
                        {selected ? (
                            <p className="tabular-nums">
                                {formatDay(selected.date)} · {selected.github} GitHub, {selected.bitbucket} Bitbucket
                            </p>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span>Less</span>
                                {LEVEL_CLASS.map((cls) => (
                                    <span key={cls} className={cn("size-[9px] rounded-[2px]", cls)} />
                                ))}
                                <span>More</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </WidgetCard>
    );
}
