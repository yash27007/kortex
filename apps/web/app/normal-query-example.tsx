'use client';
// Normal query example - fetches data on the client side
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/server/trpc/client';

export function NormalQueryExample() {
  const trpc = useTRPC();

  // Normal query - fetches on the client, shows loading state
  const greeting = useQuery(trpc.hello.queryOptions({
    text: 'Yashwanth Aravind (Normal Query)'
  }));

  if (greeting.isLoading) {
    return <div className="text-blue-500">Loading normal query...</div>;
  }

  if (greeting.isError) {
    return <div className="text-red-500">Error: {greeting.error?.message}</div>;
  }

  return (
    <div className="text-green-600">
      {greeting.data?.greeting}
    </div>
  );
}
