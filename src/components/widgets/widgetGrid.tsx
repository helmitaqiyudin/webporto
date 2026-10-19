import { GitCommitHorizontal } from "lucide-react";
import { SiDiscord, SiSpotify, SiStrava } from "react-icons/si";
import ErrorBoundary from "@/components/core/errorBoundary";
import ActivityHeatmap from "./activityHeatmap";
import DiscordCard from "./discordCard";
import SpotifyCard from "./spotifyCard";
import StravaCard from "./stravaCard";
import WidgetCard from "./widgetCard";

// Each widget renders bad API data inside its own boundary, falling back to its offline card.
export default function WidgetGrid() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ErrorBoundary fallback={<WidgetCard title="Discord" icon={<SiDiscord className="size-3.5 text-[#5865F2]" />} state="error" />}>
                <DiscordCard />
            </ErrorBoundary>
            <ErrorBoundary fallback={<WidgetCard title="Spotify" icon={<SiSpotify className="size-3.5 text-[#1DB954]" />} state="error" />}>
                <SpotifyCard />
            </ErrorBoundary>
            <ErrorBoundary
                fallback={<WidgetCard title="Strava" icon={<SiStrava className="size-3.5 text-[#FC4C02]" />} state="error" className="sm:col-span-2" />}
            >
                <StravaCard />
            </ErrorBoundary>
            <ErrorBoundary
                fallback={<WidgetCard title="GitHub + Bitbucket" icon={<GitCommitHorizontal className="size-3.5" />} state="error" className="sm:col-span-2" />}
            >
                <ActivityHeatmap />
            </ErrorBoundary>
        </div>
    );
}
