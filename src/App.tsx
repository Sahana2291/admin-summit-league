import { RouterProvider } from 'react-router';
import { ConvexProvider } from '@/app/providers/ConvexProvider';
import { SessionProvider } from './app/providers/SessionProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { router } from '@/app/router';

const App = () => (
  <ConvexProvider>
    <SessionProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </SessionProvider>
  </ConvexProvider>
);

export default App;