"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
    fallback: ReactNode;
    children: ReactNode;
}

// Keeps one broken widget (bad API data, missing WebGL) from taking the whole page down.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        console.error(error);
    }

    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
