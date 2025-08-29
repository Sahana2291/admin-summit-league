import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { ConvexProvider } from '@/app/providers/ConvexProvider';
import { SessionProvider } from './app/providers/SessionProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { router } from '@/app/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const App = () => (
  <ConvexProvider>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  </ConvexProvider>
);

export default App;