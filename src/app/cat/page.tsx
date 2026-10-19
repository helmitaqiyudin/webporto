import InteractiveCat from "@/components/custom/interactiveCat";

/** Playground for the cat: move the cursor (or drag a finger) around the screen. */
export default function CatPage() {
    return (
        <main className="flex h-[100dvh] w-full items-center justify-center bg-cyan-300 text-sm text-cyan-950">
            <p>Move your cursor around</p>
            <InteractiveCat />
        </main>
    );
}
