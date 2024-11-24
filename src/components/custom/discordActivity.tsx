import { Card } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hoverCard";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DiscordData, Activity } from "@/types/discord_activity";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { SiDiscord } from "react-icons/si";
import { useInterval } from 'usehooks-ts';
import { getStatusText, getStatusType, calculateTimes } from "@/lib/utils";

const DISCORD_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID;

const fetchDiscordActivity = async (): Promise<DiscordData> => {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    if (!res.ok) {
        throw new Error('Failed to fetch Discord activity');
    }
    return res.json();
};


export default function DiscordActivity() {
    const [elapsedTimes, setElapsedTimes] = useState<{ [key: string]: string }>({});
    const [musicProgress, setMusicProgress] = useState<{ [key: string]: number }>({});

    const { data, refetch } = useQuery<DiscordData>({
        queryKey: ['discord_activity'],
        queryFn: fetchDiscordActivity,
        refetchInterval: 5000,
    });

    const updateTimes = useCallback(() => {
        if (data?.data.activities) {
            const now = Date.now();
            const { elapsedTimes: newElapsedTimes, musicProgress: newMusicProgress } = calculateTimes(data.data.activities, now);

            setElapsedTimes(newElapsedTimes);
            setMusicProgress(newMusicProgress);

            if (Object.values(newElapsedTimes).some(time => time === "Finished")) {
                refetch();
            }
        }
    }, [data, refetch]);

    useInterval(updateTimes, 1000);

    return (
        <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-md bg-background border border-border hover:bg-accent transition-colors duration-200">
                    <div className="relative">
                        <SiDiscord className="w-5 h-5 text-[#5865F2]" />
                        <div
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${data?.data.discord_status === "online" ? "bg-green-500" : data?.data.discord_status === "idle" ? "bg-yellow-500" : data?.data.discord_status === "dnd" ? "bg-red-500" : "bg-gray-500"} rounded-full border-2 border-background`}
                        />
                    </div>
                    <span className="text-sm font-medium">
                        {getStatusText(data?.data.discord_status)}
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 ml-3">
                <Card className="p-3">
                    {data?.data.activities && data.data.activities.length > 0 ? (
                        data.data.activities.map((activity: Activity) => (
                            <div key={activity.id} className="mb-3 last:mb-0">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium">{getStatusType(activity.type)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {activity.name}
                                        </p>
                                        {activity.details && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {activity.details}
                                            </p>
                                        )}
                                        {activity.state && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {activity.state}
                                            </p>
                                        )}
                                        {activity.type === 2 && activity.timestamps?.end ? (
                                            <div className="mt-2 space-y-1">
                                                <Progress value={musicProgress[activity.id]} className="h-1" />
                                                <p className="text-xs text-muted-foreground text-right">
                                                    {elapsedTimes[activity.id]}
                                                </p>
                                            </div>
                                        ) : (
                                            elapsedTimes[activity.id] && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {elapsedTimes[activity.id]}
                                                </p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Not doing anything right now 😅
                        </p>
                    )}
                </Card>
            </HoverCardContent>
        </HoverCard>
    )
}