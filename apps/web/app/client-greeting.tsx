'use client';
// This component uses prefetched data from the server
// The data was prefetched using prefetchQuery in the server component
// Using useSuspenseQuery to avoid loading flash during hydration
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/server/trpc/client';

export function ClientGreeting() {
    const trpc = useTRPC();

    // useSuspenseQuery works better with prefetched data
    // It properly handles hydration and won't show loading state if data is prefetched
    const { data } = useSuspenseQuery(trpc.hello.queryOptions({
        text: 'Hello Yashwanth (Prefetched)'
    }));

    return (
        <div className="text-green-600">
            {data.greeting}
        </div>
    );
}