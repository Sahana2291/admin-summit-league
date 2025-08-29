import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from 'convex/react';
import { ReactNode } from 'react';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

interface ConvexProviderProps {
    children: ReactNode;
}

export function ConvexProvider({ children }: ConvexProviderProps) {
    return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}