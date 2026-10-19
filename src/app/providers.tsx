"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react';
import { shouldRetry } from '@/lib/widgetState';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } }));

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}