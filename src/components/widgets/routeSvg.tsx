import { Footprints } from "lucide-react";
import { decodePolyline, toSvgPath } from "@/lib/polyline";
import { cn } from "@/lib/utils";

const WIDTH = 140;
const HEIGHT = 90;

// Draws the run's route without a map library; treadmill runs have no route and get an icon.
export default function RouteSvg({ polyline, className }: { polyline: string | null; className?: string }) {
    const path = polyline ? toSvgPath(decodePolyline(polyline), WIDTH, HEIGHT, 6) : "";

    if (!path) {
        return (
            <div className={cn("flex items-center justify-center", className)}>
                <Footprints className="size-8 text-muted-foreground" aria-hidden />
            </div>
        );
    }

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={className} aria-hidden>
            <path d={path} fill="none" stroke="#FC4C02" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
