// src/app/router.tsx
import { createBrowserRouter, redirect } from 'react-router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { protectedLoader } from '@/lib/auth';

// Page imports
import { Login, Dashboard, NotFound } from '@/pages';
// Admin feature pages
import { UserManagement, TraderAccounts, CompetitionManagement, EntriesManagement, LeaderboardManagement, FinancialManagement, AffiliateManagement, ReportsAnalytics, AdminSettings } from '@/pages/AdminPages';

// Affiliate pages
import { CreateAgency, AgencyDirectory, DirectUrlManagement, AccessCodeLogs, AgencyDashboardProvisioning } from '@/pages/AffiliatePages'
// import {} from '@/pages/AgencyAdminPages'

// component for those pages those are not created yet
const NotFoundComponent = (title) => {
    return <div>{title} - Page not found</div>;
};

const router = createBrowserRouter([
    {
        path: '/',
        loader: () => redirect('/admin/login'),
    },
    {
        path: '/admin/login',
        Component: Login,
    },
    {
        path: '/admin',
        Component: AdminLayout,
        loader: protectedLoader, // Auth check function
        children: [
            { index: true, Component: Dashboard },
            { path: 'dashboard', Component: Dashboard },
            { path: 'users', Component: UserManagement },
            { path: 'user-dashboard', Component: UserManagement },
            { path: 'participants', Component: NotFoundComponent.bind(null, 'Participants') },
            { path: 'traders', Component: TraderAccounts },
            { path: 'accounts', Component: NotFoundComponent.bind(null, 'Trader Accounts') },
            { path: 'competitions', Component: CompetitionManagement },
            { path: 'entries', Component: EntriesManagement },
            { path: 'leaderboards', Component: LeaderboardManagement },
            { path: 'prizes', Component: FinancialManagement },
            { path: 'revenue', Component: FinancialManagement },
            { path: 'ledger', Component: FinancialManagement },
            { path: 'reports', Component: ReportsAnalytics },
            { path: 'settings', Component: AdminSettings },
        ],
    },
    {
        path: '/admin/affiliates',
        Component: AdminLayout,
        loader: protectedLoader,
        children: [
            { index: true, Component: AffiliateManagement },
            { path: 'create', Component: CreateAgency },
            { path: 'directory', Component: AgencyDirectory },
            { path: 'direct-url', Component: DirectUrlManagement },
            { path: 'logs', Component: AccessCodeLogs },
            { path: 'provision', Component: AgencyDashboardProvisioning },
        ],
    },
    {
        path: '*',
        Component: NotFound,
    },
]);

export { router };

// {
//     path: '/admin',
//     element: (
//         <ProtectedRoute>
//             <AdminLayout>
//                 <AdminDashboard />
//             </AdminLayout>
//         </ProtectedRoute>
//     ),
//     children: [
//         {
//             index: true,
//             element: <AdminDashboard />,
//         },
//         {
//             path: 'dashboard',
//             element: <AdminDashboard />,
//         },
//         {
//             path: 'users',
//             element: <UserManagement />,
//         },
//         {
//             path: 'participants',
//             element: <UserManagement />,
//         },
//         {
//             path: 'user-dashboard',
//             element: <UserManagement />,
//         },
//         {
//             path: 'accounts',
//             element: <TraderAccounts />,
//         },
//         {
//             path: 'analytics',
//             element: <ReportsAnalytics />,
//         },
//         {
//             path: 'competitions',
//             element: <CompetitionManagement />,
//         },
//         {
//             path: 'entries',
//             element: <EntriesManagement />,
//         },
//         {
//             path: 'leaderboards',
//             element: <LeaderboardManagement />,
//         },
//         {
//             path: 'prizes',
//             element: <FinancialManagement />,
//         },
//         {
//             path: 'revenue',
//             element: <FinancialManagement />,
//         },
//         {
//             path: 'ledger',
//             element: <FinancialManagement />,
//         },
//         {
//             path: 'affiliates',
//             children: [
//                 {
//                     index: true,
//                     element: <AffiliateManagement />,
//                 },
//                 {
//                     path: 'create',
//                     element: <CreateAgency />,
//                 },
//                 {
//                     path: 'directory',
//                     element: <AgencyDirectory />,
//                 },
//                 {
//                     path: 'direct-url',
//                     element: <DirectUrlManagement />,
//                 },
//                 {
//                     path: 'logs',
//                     element: <AccessCodeLogs />,
//                 },
//                 {
//                     path: 'provision',
//                     element: <AgencyDashboardProvisioning />,
//                 },
//             ],
//         },
//         {
//             path: 'reports',
//             element: <ReportsAnalytics />,
//         },
//         {
//             path: 'statistics',
//             element: <ReportsAnalytics />,
//         },
//         {
//             path: 'settings',
//             element: (
//                 <div className="text-center py-20">
//                     <h2 className="text-2xl font-bold text-muted-foreground">Platform Settings</h2>
//                     <p className="text-muted-foreground mt-2">Coming soon...</p>
//                 </div>
//             ),
//         },
//     ],
// },