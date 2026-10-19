import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { WidgetState } from "@/lib/widgetState";

export type { WidgetState };

interface WidgetCardProps {
    title: string;
    icon: React.ReactNode;
    state: WidgetState;
    className?: string;
    children?: React.ReactNode;
}

// Shared frame for live widgets. A failing widget stays in place and says so quietly,
// so one dead integration never takes the page down.
export default function WidgetCard({ title, icon, state, className, children }: WidgetCardProps) {
    return (
        <Card className={cn("flex min-w-0 flex-col gap-3 bg-background/70 p-4 backdrop-blur-sm", className)}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon}
                <span>{title}</span>
            </div>
            {state === "loading" && <Skeleton className="min-h-24 w-full" />}
            {state === "error" && <p className="text-sm text-muted-foreground">Offline right now</p>}
            {state === "ready" && children}
        </Card>
    );
}
