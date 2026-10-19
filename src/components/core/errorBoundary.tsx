"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
    fallback: ReactNode;
    children: ReactNode;
}

/** Keeps one broken widget (bad API data, missing WebGL) from taking the whole page down. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
    state = { failed: false };

    /** Switch to the fallback on the next render. */
    static getDerivedStateFromError() {
        return { failed: true };
    }

    /** Keep the error visible in the console for debugging. */
    componentDidCatch(error: unknown) {
        console.error(error);
    }

    /** The children, or the fallback once something below has thrown. */
    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
