import { Card } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hoverCard";
import { Separator } from "@/components/ui/separator";
import { DiscordData } from "@/types/discord_activity";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiDiscord } from "react-icons/si";

const useGetDiscordActivity = () => {
    return useQuery<DiscordData>({
        queryKey: ['discord_activity'],
        queryFn: async () => {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${process.env.NEXT_PUBLIC_DISCORD_USER_ID}`)
            return res.json()
        }
    })
}

export default function DiscrodActivity() {
    const { data } = useGetDiscordActivity();

    const [elapsedTime, setElapsedTime] = useState<string | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            if (data?.data.activities[0]?.timestamps?.start) {
                const start = data.data.activities[0].timestamps.start
                const now = Date.now()
                const elapsed = Math.floor((now - start) / 1000)
                const hours = Math.floor(elapsed / 3600)
                const minutes = Math.floor((elapsed % 3600) / 60)
                setElapsedTime(
                    hours > 0 ? `${hours}h ${minutes}m elapsed` : `${minutes}m elapsed`
                )
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [data])


    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case 'online':
                return 'bg-green-500'
            case 'idle':
                return 'bg-yellow-500'
            case 'dnd':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getStatusText = (status: string | undefined) => {
        switch (status) {
            case 'online':
                return 'Online'
            case 'idle':
                return 'Idle'
            case 'dnd':
                return 'Do Not Disturb'
            default:
                return 'Offline'
        }
    }

    const getStatusType = (type: number | undefined) => {
        switch (type) {
            case 0:
                return 'Playing'
            case 2:
                return 'Listening'
            case 3:
                return 'Watching'
            case 5:
                return 'Competing'
            default:
                return null
        }
    }

    return (
        <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-md bg-background border border-border hover:bg-accent transition-colors duration-200">
                    <div className="relative">
                        <SiDiscord className="w-5 h-5 text-[#5865F2]" />
                        <div
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(
                                data?.data.discord_status
                            )} rounded-full border-2 border-background`}
                        />
                    </div>
                    <span className="text-sm font-medium">
                        {getStatusText(data?.data.discord_status)}
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 ml-3">
                <Card className="p-3">
                    {data?.data.activities[0] ? (
                        <>
                            <div className="flex items-center">
                                <span className="text-sm font-medium">{getStatusType(data?.data.activities[0]?.type)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {data.data.activities[0].name}
                                    </p>
                                    {data.data.activities[0].details && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {data.data.activities[0].details}
                                        </p>
                                    )}
                                    {data.data.activities[0].state && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {data.data.activities[0].state}
                                        </p>
                                    )}
                                    {elapsedTime && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {elapsedTime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
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