// src/components/layouts/AdminLayout.tsx
import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useCurrentAdmin } from '@/app/store';
import { Outlet } from 'react-router';
import { useAuthManager } from '@/hooks/useAuthManager';

export function AdminLayout() {
    const admin = useCurrentAdmin();
    const { logout } = useAuthManager();

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <AdminSidebar onLogout={logout} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header with sidebar trigger */}
                    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
                        <div className="flex items-center h-full px-6 gap-4">
                            <SidebarTrigger>
                                <Button variant="outline" size="sm">
                                    <Menu className="w-4 h-4" />
                                </Button>
                            </SidebarTrigger>

                            <div className="flex-1" />

                            <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    Welcome back, <span className="font-medium text-foreground">{admin?.name || admin?.email}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="flex-1 p-6 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}