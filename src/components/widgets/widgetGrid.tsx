import DiscordActivity from "@/components/custom/discordActivity";

export default function WidgetGrid() {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
                <DiscordActivity />
            </div>
        </div>
    );
}
