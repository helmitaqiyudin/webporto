"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInterval } from "usehooks-ts";
import { SiDiscord } from "react-icons/si";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hoverCard";
import { calculateTimes, getStatusText, getStatusType } from "@/lib/utils";
import type { Activity, DiscordData } from "@/types/discord_activity";
import WidgetCard, { type WidgetState } from "./widgetCard";

const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID;
const CUSTOM_STATUS = 4;

const STATUS_DOT: Record<string, string> = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
};

async function fetchPresence(): Promise<DiscordData> {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    if (!res.ok) throw new Error("Failed to fetch Discord presence");
    return res.json();
}

function ActivityLine({ activity, timer }: { activity: Activity; timer?: string }) {
    const verb = getStatusType(activity.type);
    return (
        <div className="min-w-0">
            <p className="truncate text-sm font-medium">
                {verb && <span className="font-normal text-muted-foreground">{verb} </span>}
                {activity.name}
            </p>
            {activity.details && <p className="truncate text-xs text-muted-foreground">{activity.details}</p>}
            {activity.state && <p className="truncate text-xs text-muted-foreground">{activity.state}</p>}
            {timer && <p className="text-xs text-muted-foreground">{timer}</p>}
        </div>
    );
}

export default function DiscordCard() {
    const [now, setNow] = useState(() => Date.now());
    useInterval(() => setNow(Date.now()), 1000);

    const { data, isPending, isError } = useQuery({
        queryKey: ["discord_activity"],
        queryFn: fetchPresence,
        refetchInterval: 5000,
        enabled: Boolean(DISCORD_USER_ID),
    });

    const state: WidgetState = !DISCORD_USER_ID || isError ? "error" : isPending ? "loading" : "ready";
    const presence = data?.data;
    const all = presence?.activities ?? [];
    const customStatus = all.find((a) => a.type === CUSTOM_STATUS)?.state;
    // Spotify has its own card, so it isn't repeated here.
    const activities = all.filter((a) => a.type !== CUSTOM_STATUS && a.name !== "Spotify");
    const { elapsedTimes } = calculateTimes(activities, now);
    const status = presence?.discord_status ?? "offline";
    const user = presence?.discord_user;

    return (
        <WidgetCard title="Discord" icon={<SiDiscord className="size-3.5 text-[#5865F2]" />} state={state}>
            <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                    {user?.avatar ? (
                        <Image
                            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 rounded-full"
                        />
                    ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <SiDiscord className="size-5 text-[#5865F2]" />
                        </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${STATUS_DOT[status] ?? "bg-gray-500"}`} />
                    {status === "online" && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 animate-ping rounded-full bg-green-500" />
                    )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium">{getStatusText(status)}</p>
                    {customStatus && <p className="truncate text-xs italic text-muted-foreground">{customStatus}</p>}
                    {activities.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Not doing anything right now</p>
                    ) : (
                        <ActivityLine activity={activities[0]} timer={elapsedTimes[activities[0].id]} />
                    )}
                    {activities.length > 1 && (
                        <HoverCard openDelay={200}>
                            <HoverCardTrigger asChild>
                                <button className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                                    +{activities.length - 1} more
                                </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72 space-y-3">
                                {activities.slice(1).map((activity) => (
                                    <ActivityLine key={activity.id} activity={activity} timer={elapsedTimes[activity.id]} />
                                ))}
                            </HoverCardContent>
                        </HoverCard>
                    )}
                </div>
            </div>
        </WidgetCard>
    );
}
