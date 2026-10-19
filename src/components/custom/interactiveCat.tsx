"use client";

import { useEffect, useRef } from "react";
import { CAT_FRAMES, catFrame, initialCat, stepCat, type Point } from "@/lib/cat";

const SIZE = 48; // the sheets are 64 px frames, drawn at 3/4 size

/**
 * A small pixel cat that walks to wherever the cursor (or finger) last was, sits down next to it,
 * and naps after ten quiet seconds. It lives in viewport coordinates, so scrolling never confuses it.
 */
export default function InteractiveCat() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        for (const sheet of ["idle", "run", "sleep"]) new Image().src = `/models/${sheet}.png`;

        let cat = initialCat(SIZE, window.innerHeight - SIZE);
        let target: Point | null = null;
        let moved = false;
        const pointAt = (x: number, y: number) => {
            target = { x, y };
            moved = true;
        };
        const onMouse = (e: MouseEvent) => pointAt(e.clientX, e.clientY);
        const onTouch = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (touch) pointAt(touch.clientX, touch.clientY);
        };
        window.addEventListener("mousemove", onMouse, { passive: true });
        window.addEventListener("touchstart", onTouch, { passive: true });
        window.addEventListener("touchmove", onTouch, { passive: true });

        let last = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            cat = stepCat(cat, target, moved, (now - last) / 1000);
            moved = false;
            last = now;

            const { sheet, frame } = catFrame(cat.mode, cat.modeTime);
            // The idle sheet faces left; the run and sleep sheets face right.
            const flip = sheet === "idle" ? -cat.facing : cat.facing;
            el.style.transform = `translate3d(${cat.x - SIZE / 2}px, ${cat.y - SIZE / 2}px, 0) scaleX(${flip})`;
            el.style.backgroundImage = `url(/models/${sheet}.png)`;
            el.style.backgroundSize = `${CAT_FRAMES[sheet] * SIZE}px ${SIZE}px`;
            el.style.backgroundPosition = `-${frame * SIZE}px 0`;
            el.style.opacity = "1";
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMouse);
            window.removeEventListener("touchstart", onTouch);
            window.removeEventListener("touchmove", onTouch);
        };
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40 opacity-0 [image-rendering:pixelated]"
            style={{ width: SIZE, height: SIZE, backgroundRepeat: "no-repeat" }}
        />
    );
}
