import DiscordCard from "./discordCard";

export default function WidgetGrid() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DiscordCard />
        </div>
    );
}
