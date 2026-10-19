"use client";

import dynamic from "next/dynamic";

// WebGL scenes only render in the browser; next/dynamic with ssr: false must live in a client module.
export const HeadModelLazy = dynamic(() => import("@/components/custom/head3D"), {
    ssr: false,
    loading: () => <div className="h-full w-full" />,
});

export const InteractiveCatLazy = dynamic(() => import("@/components/custom/interactiveCat"), {
    ssr: false,
});
