import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Public Pages
import { HomePage } from '@/pages/Home'
import { SearchPage } from '@/pages/Search'
import { PropertyDetailPage } from '@/pages/PropertyDetail'

// Apply & Buy Flows
import { ApplyStep1, ApplyStep2, ApplyStep3, ApplyReview } from '@/pages/apply/ApplyFlow'
import { BuyStep1, BuyStep2, BuyStep3 } from '@/pages/buy/BuyFlow'

// Landlord Dashboard
import { LandlordDashboard } from '@/pages/landlord/Dashboard'
import { LandlordProperties } from '@/pages/landlord/Properties'
import { AddPropertyWizard } from '@/pages/landlord/AddProperty'
import { LandlordTenants } from '@/pages/landlord/Tenants'
import { LandlordApplicants } from '@/pages/landlord/Applicants'
import { LandlordFinancials } from '@/pages/landlord/Financials'

// Tenant Dashboard
import { TenantDashboard } from '@/pages/tenant/Dashboard'
import { TenantApplications } from '@/pages/tenant/Applications'
import { TenantMyHome } from '@/pages/tenant/MyHome'
import { TenantSavedProperties } from '@/pages/tenant/SavedProperties'
import { TenantMessages } from '@/pages/tenant/Messages'

// Agent Dashboard
import { AgentJobBoard } from '@/pages/agent/JobBoard'
import { AgentSchedule } from '@/pages/agent/Schedule'
import { AgentEarnings } from '@/pages/agent/Earnings'
import { AgentJobHistory } from '@/pages/agent/JobHistory'

const router = createBrowserRouter([
    // Public routes
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'search', element: <SearchPage /> },
            { path: 'properties/:id', element: <PropertyDetailPage /> },
        ],
    },
    // Apply flow
    {
        path: '/apply/:propertyId',
        children: [
            { index: true, element: <ApplyStep1 /> },
            { path: 'step-2', element: <ApplyStep2 /> },
            { path: 'step-3', element: <ApplyStep3 /> },
            { path: 'review', element: <ApplyReview /> },
        ],
    },
    // Buy flow
    {
        path: '/buy/:propertyId',
        children: [
            { index: true, element: <BuyStep1 /> },
            { path: 'step-2', element: <BuyStep2 /> },
            { path: 'step-3', element: <BuyStep3 /> },
        ],
    },
    // Landlord Dashboard
    {
        path: '/landlord',
        element: <DashboardLayout variant="landlord" />,
        children: [
            { index: true, element: <LandlordDashboard /> },
            { path: 'properties', element: <LandlordProperties /> },
            { path: 'properties/new', element: <AddPropertyWizard /> },
            { path: 'tenants', element: <LandlordTenants /> },
            { path: 'applicants', element: <LandlordApplicants /> },
            { path: 'financials', element: <LandlordFinancials /> },
        ],
    },
    // Tenant Dashboard
    {
        path: '/tenant',
        element: <DashboardLayout variant="tenant" />,
        children: [
            { index: true, element: <TenantDashboard /> },
            { path: 'home', element: <TenantMyHome /> },
            { path: 'applications', element: <TenantApplications /> },
            { path: 'saved', element: <TenantSavedProperties /> },
            { path: 'messages', element: <TenantMessages /> },
        ],
    },
    // Agent Dashboard
    {
        path: '/agent',
        element: <DashboardLayout variant="agent" />,
        children: [
            { index: true, element: <AgentJobBoard /> },
            { path: 'schedule', element: <AgentSchedule /> },
            { path: 'earnings', element: <AgentEarnings /> },
            { path: 'history', element: <AgentJobHistory /> },
        ],
    },
])

export function Router() {
    return <RouterProvider router={router} />
}
