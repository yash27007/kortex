import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/server/trpc/server';
import { ClientGreeting } from './client-greeting';
import { NormalQueryExample } from './normal-query-example';
import { SuspenseQueryExample } from './suspense-query-example';
import { Suspense } from 'react';

export default async function Home() {
  console.log("Hello server......")
  const queryClient = getQueryClient();

  // Example 1: prefetchQuery - Server-side prefetching
  // AWAITING ensures data is ready before rendering, eliminating loading flash
  // This blocks until the query completes, ensuring data is available on first render
  await queryClient.prefetchQuery(
    trpc.hello.queryOptions({
      text: "Hello Yashwanth (Prefetched)"
    }),
  );

  // Prefetch for Suspense example as well (awaited to avoid loading flash)
  await queryClient.prefetchQuery(
    trpc.hello.queryOptions({
      text: "Yashwanth Aravind (Suspense Query)"
    }),
  );

  // Alternative: Non-blocking prefetch (streaming approach)
  // If you want to start fetching but not block rendering, use void:
  // void queryClient.prefetchQuery(...)
  // This allows streaming but may show a brief loading state

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold mb-4">tRPC Query Examples</h1>

        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Example 1: Prefetched Query (Server Component)
          </h2>
          <p className="text-gray-600 mb-4">
            This data was prefetched on the server using prefetchQuery.
            The query starts on the server and hydrates to the client.
            Using Suspense to avoid loading flash.
          </p>
          <Suspense fallback={<div className="text-blue-500">Loading prefetched data...</div>}>
            <ClientGreeting />
          </Suspense>
        </section>

        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Example 2: Normal Query (Client Component)
          </h2>
          <p className="text-gray-600 mb-4">
            This data is fetched on the client using useQuery hook.
            It will show a loading state initially.
          </p>
          <NormalQueryExample />
        </section>

        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Example 3: Suspense Query (Client Component with Suspense)
          </h2>
          <p className="text-gray-600 mb-4">
            This uses useSuspenseQuery with a Suspense boundary.
            The loading state is handled by the Suspense fallback.
          </p>
          <Suspense fallback={<div className="text-blue-500">Loading suspense query...</div>}>
            <SuspenseQueryExample />
          </Suspense>
        </section>
      </div>
    </HydrationBoundary>
  );
}