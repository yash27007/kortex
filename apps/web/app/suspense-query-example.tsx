'use client';
// Suspense query example - uses useSuspenseQuery for better loading states
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/server/trpc/client';

export function SuspenseQueryExample() {
  const trpc = useTRPC();

  // useSuspenseQuery - throws a promise that Suspense can catch
  // This provides better loading state management with Suspense boundaries
  const { data } = useSuspenseQuery(trpc.hello.queryOptions({
    text: 'Yashwanth Aravind (Suspense Query)'
  }));

  return (
    <div className="text-green-600">
      {data.greeting}
    </div>
  );
}
