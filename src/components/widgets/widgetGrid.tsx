import DiscordCard from "./discordCard";
import SpotifyCard from "./spotifyCard";

export default function WidgetGrid() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DiscordCard />
            <SpotifyCard />
        </div>
    );
}
