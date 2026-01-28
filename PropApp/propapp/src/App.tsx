import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import UnifiedNavbar from './components/common/UnifiedNavbar'
import HomePage from './pages/Home/HomePage'
import AIChatPage from './pages/Home/AIChatPage'
import SearchPage from './pages/Search/SearchPage'
import PropertyDetail from './pages/Property/PropertyDetail'
import LandlordLayout from './layouts/LandlordLayout'
import LandlordDashboard from './features/landlord/pages/LandlordDashboard'
import LandlordPropertyDetail from './features/landlord/pages/LandlordPropertyDetail'
import ApplicantManager from './features/landlord/pages/ApplicantManager'
import LandlordProfile from './features/landlord/pages/LandlordProfile'
import LandlordVerificationHub from './features/landlord/pages/LandlordVerificationHub'
import LandlordLeaseAgreement from './features/landlord/pages/LandlordLeaseAgreement'
import LandlordEditLeaseTerms from './features/landlord/pages/LandlordEditLeaseTerms'
import LandlordApplicantDetail from './features/landlord/pages/LandlordApplicantDetail'
import TenantProfileLandlordView from './features/landlord/pages/TenantProfileLandlordView'
import PropertyWizard from './features/landlord/pages/PropertyWizard'
import LandlordPropertyTasks from './features/landlord/pages/LandlordPropertyTasks'
import LandlordEditListing from './features/landlord/pages/LandlordEditListing'
import TenantLayout from './layouts/TenantLayout'
import TenantDashboard from './features/tenant/pages/TenantDashboard'
import TenantMyHome from './features/tenant/pages/TenantMyHome'
import TenantApplications from './features/tenant/pages/TenantApplications'
import TenantApplicationDetail from './features/tenant/pages/TenantApplicationDetail'
import TenantSavedProperties from './features/tenant/pages/TenantSavedProperties'
import TenantPayments from './features/tenant/pages/TenantPayments'
import TenantProfile from './features/tenant/pages/TenantProfile'
import TenantMaintenanceDetail from './features/tenant/pages/TenantMaintenanceDetail'
import TenantMaintenance from './features/tenant/pages/TenantMaintenance'
import TenantMessages from './features/tenant/pages/TenantMessages'
import TenantTransactions from './features/tenant/pages/TenantTransactions'
import TenantLeaseDetails from './features/tenant/pages/TenantLeaseDetails'
import AgentLayout from './layouts/AgentLayout'
import AgentJobBoard from './features/agent/pages/AgentJobBoard'
import AgentMyJobs from './features/agent/pages/AgentMyJobs'
import AgentJobDetail from './features/agent/pages/AgentJobDetail'
import AgentSchedule from './features/agent/pages/AgentSchedule'
import AgentEarnings from './features/agent/pages/AgentEarnings'
import AgentProfile from './features/agent/pages/AgentProfile'
import AgentTransactions from './features/agent/pages/AgentTransactions'
import RentalApplicationWizard from './pages/Property/RentalApplicationWizard'
import LandlordTransactions from './features/landlord/pages/LandlordTransactions'
import LandlordProperties from './features/landlord/pages/LandlordProperties'
import LandlordFinancials from './features/landlord/pages/LandlordFinancials'
import LandlordAlertCenter from './features/landlord/pages/LandlordAlertCenter'
import LandlordMaintenanceDetail from './features/landlord/pages/LandlordMaintenanceDetail'
import AgentPublicProfile from './pages/Profile/AgentPublicProfile'
import LandlordPublicProfile from './pages/Profile/LandlordPublicProfile'
import TenantPublicProfile from './pages/Profile/TenantPublicProfile'
import SettingsPage from './pages/Home/SettingsPage'

// Auth Pages
import AuthLayout from './layouts/AuthLayout'
import AuthHomePage from './pages/Auth/AuthHomePage'
import LoginPage from './pages/Auth/LoginPage'
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage'
import SignUpStep1 from './pages/Auth/SignUpStep1'
import SignUpStep2 from './pages/Auth/SignUpStep2'
import SignUpStep3 from './pages/Auth/SignUpStep3'
import SignUpStep4Tenant from './pages/Auth/SignUpStep4Tenant'
import SignUpStep4Landlord from './pages/Auth/SignUpStep4Landlord'
import SignUpStep4Agent from './pages/Auth/SignUpStep4Agent'
import TwoFactorAuthPage from './pages/Auth/TwoFactorAuthPage'
import TwoFactorMethodsPage from './pages/Auth/TwoFactorMethodsPage'
import EnterSMSCodePage from './pages/Auth/EnterSMSCodePage'
import SMSCodeSuccessPage from './pages/Auth/SMSCodeSuccessPage'
import EnterRecoveryCodePage from './pages/Auth/EnterRecoveryCodePage'
import RecoveryCodeVerifiedPage from './pages/Auth/RecoveryCodeVerifiedPage'
import UseSecurityKeyPage from './pages/Auth/UseSecurityKeyPage'
import SecurityKeyVerifiedPage from './pages/Auth/SecurityKeyVerifiedPage'
import PasswordResetPage from './pages/Auth/PasswordResetPage'
import PasswordResetSuccessPage from './pages/Auth/PasswordResetSuccessPage'

function App() {
  return (
    <AuthProvider>
      {/* Unified Navbar - rendered at app level for persistent animations */}
      <UnifiedNavbar />

      <Routes>
        {/* Auth Routes - No navbar, full-screen video background */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<AuthHomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="signup/step1" element={<SignUpStep1 />} />
          <Route path="signup/step2" element={<SignUpStep2 />} />
          <Route path="signup/step3" element={<SignUpStep3 />} />
          <Route path="signup/step4/tenant" element={<SignUpStep4Tenant />} />
          <Route path="signup/step4/landlord" element={<SignUpStep4Landlord />} />
          <Route path="signup/step4/agent" element={<SignUpStep4Agent />} />
          <Route path="2fa" element={<TwoFactorAuthPage />} />
          <Route path="2fa/methods" element={<TwoFactorMethodsPage />} />
          <Route path="2fa/sms" element={<EnterSMSCodePage />} />
          <Route path="2fa/sms-success" element={<SMSCodeSuccessPage />} />
          <Route path="2fa/recovery" element={<EnterRecoveryCodePage />} />
          <Route path="2fa/recovery-success" element={<RecoveryCodeVerifiedPage />} />
          <Route path="2fa/security-key" element={<UseSecurityKeyPage />} />
          <Route path="2fa/security-key-success" element={<SecurityKeyVerifiedPage />} />
          <Route path="reset-password" element={<PasswordResetPage />} />
          <Route path="reset-password-success" element={<PasswordResetSuccessPage />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property/:id/apply" element={<RentalApplicationWizard />} />
        <Route path="/agent/:id" element={<AgentPublicProfile />} />
        <Route path="/landlord-profile/:id" element={<LandlordPublicProfile />} />
        <Route path="/member/:id" element={<TenantPublicProfile />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Landlord Dashboard Routes - Protected */}
        <Route path="/landlord" element={
          <ProtectedRoute requiredRole="LANDLORD">
            <LandlordLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<LandlordDashboard />} />
          <Route path="properties" element={<LandlordProperties />} />
          <Route path="properties/:id" element={<LandlordPropertyDetail />} />
          <Route path="properties/:id/tasks" element={<LandlordPropertyTasks />} />
          <Route path="properties/:id/edit" element={<LandlordEditListing />} />
          <Route path="new-property" element={<PropertyWizard />} />
          <Route path="tenants" element={<ApplicantManager />} />
          <Route path="tenants/:id" element={<LandlordApplicantDetail />} />
          <Route path="tenants/:id/profile" element={<TenantProfileLandlordView />} />
          <Route path="leases/:id" element={<LandlordLeaseAgreement />} />
          <Route path="leases/:id/edit" element={<LandlordEditLeaseTerms />} />
          <Route path="transactions" element={<LandlordTransactions />} />
          <Route path="financials" element={<LandlordFinancials />} />
          <Route path="profile" element={<LandlordProfile />} />
          <Route path="verification" element={<LandlordVerificationHub />} />
          <Route path="alerts" element={<LandlordAlertCenter />} />
          <Route path="maintenance/:id" element={<LandlordMaintenanceDetail />} />
        </Route>

        {/* Tenant Dashboard Routes - Protected */}
        <Route path="/tenant" element={
          <ProtectedRoute requiredRole="TENANT">
            <TenantLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<TenantDashboard />} />
          <Route path="my-home" element={<TenantMyHome />} />
          <Route path="applications" element={<TenantApplications />} />
          <Route path="applications/:id" element={<TenantApplicationDetail />} />
          <Route path="saved" element={<TenantSavedProperties />} />
          <Route path="payments" element={<TenantPayments />} />
          <Route path="profile" element={<TenantProfile />} />
          <Route path="maintenance" element={<TenantMaintenance />} />
          <Route path="maintenance/:id" element={<TenantMaintenanceDetail />} />
          <Route path="messages" element={<TenantMessages />} />
          <Route path="transactions" element={<TenantTransactions />} />
          <Route path="lease-details" element={<TenantLeaseDetails />} />
        </Route>

        {/* Agent Dashboard Routes - Protected */}
        <Route path="/agent" element={
          <ProtectedRoute requiredRole="AGENT">
            <AgentLayout />
          </ProtectedRoute>
        }>
          <Route path="jobs" element={<AgentJobBoard />} />
          <Route path="my-jobs" element={<AgentMyJobs />} />
          <Route path="my-jobs/:id" element={<AgentJobDetail />} />
          <Route path="schedule" element={<AgentSchedule />} />
          <Route path="earnings" element={<AgentEarnings />} />
          <Route path="transactions" element={<AgentTransactions />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
