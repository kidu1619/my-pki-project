import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Toaster } from 'react-hot-toast';
import { RbacGuard } from './components/RbacGuard';
import { Layout } from './components/Layout';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Hsm } from './pages/Hsm';
import { Keys } from './pages/Keys';
import { CAs } from './pages/CAs';
import { Csrs } from './pages/Csrs';
import { Certificates } from './pages/Certificates';
import { Revocation } from './pages/Revocation';
import { PublishingTarget } from './pages/PublishingTarget';
import { Audit } from './pages/Audit';
import { Profile } from './pages/Profile';
import { Validation } from './pages/Validation';
import { SelfSignedWizard } from './pages/SelfSignedWizard';
import { RequestManagement } from './pages/RequestManagement';
import { KeyEscrow } from './pages/KeyEscrow';
import { EscrowRequest } from './pages/EscrowRequest';
import { OcspOperator } from './pages/OcspOperator';
import { OcspMonitoring } from './pages/OcspMonitoring';
import { RequestVerification } from './pages/RequestVerification';
import { RegistrationForm } from './components/RegistrationForm';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { CAInfo } from './pages/CAInfo';
import { CertInfo } from './pages/CertInfo';
import { PublicationsPage } from './pages/PublicationsPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <Toaster />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '2rem' }}><RegistrationForm /></div>} />
            <Route path="/forgot-password" element={<div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '2rem' }}><ForgotPassword /></div>} />
            <Route path="/auth/reset-password" element={<div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '2rem' }}><ResetPassword /></div>} />

            {/* Public informational pages — no auth required */}
            <Route path="/ca-info" element={<CAInfo />} />
            <Route path="/cert-info" element={<CertInfo />} />
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            <Route
              path="/dashboard"
              element={
                <RbacGuard>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/users"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <Users />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/hsm"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <Hsm />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/publishing-target"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <PublishingTarget />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/keys"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER', 'ROLE_HSM', 'ROLE_SELF_SIGNED']}>
                  <Layout>
                    <Keys />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/cas"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']}>
                  <Layout>
                    <CAs />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/csrs"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}>
                  <Layout>
                    <Csrs />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/revocation"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_AUDITOR']}>
                  <Layout>
                    <Revocation />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/requests"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_AUDITOR']}>
                  <Layout>
                    <RequestManagement />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/audit"
              element={
                <RbacGuard allowedRoles={['ROLE_AUDITOR']}>
                  <Layout>
                    <Audit />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/certificates"
              element={
                <RbacGuard>
                  <Layout>
                    <Certificates />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/self-signed"
              element={
                <RbacGuard allowedRoles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_SELF_SIGNED']}>
                  <Layout>
                    <SelfSignedWizard />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/profile"
              element={
                <RbacGuard>
                  <Layout>
                    <Profile />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/validation"
              element={
                <RbacGuard allowedRoles={['ROLE_OCSP_OPERATOR']}>
                  <Layout>
                    <Validation />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route
              path="/request-verification"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_AUDITOR', 'ROLE_USER', 'ROLE_HSM', 'ROLE_SELF_SIGNED', 'ROLE_KEY_ESCROW']}>
                  <Layout>
                    <RequestVerification />
                  </Layout>
                </RbacGuard>
              }
            />

            {/* Key Escrow Agent + Super Admin + CA Operator management panel */}
            <Route
              path="/key-escrow"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_KEY_ESCROW']}>
                  <Layout>
                    <KeyEscrow />
                  </Layout>
                </RbacGuard>
              }
            />

            {/* Everyone can request recovery; Super Admin + CA Operator can verify */}
            <Route
              path="/escrow-request"
              element={
                <RbacGuard>
                  <Layout>
                    <EscrowRequest />
                  </Layout>
                </RbacGuard>
              }
            />

            {/* OCSP Operator dashboard */}
            <Route
              path="/ocsp-operator"
              element={
                <RbacGuard allowedRoles={['ROLE_OCSP_OPERATOR']}>
                  <Layout>
                    <OcspOperator />
                  </Layout>
                </RbacGuard>
              }
            />

            {/* OCSP Monitoring dashboard (Auditor + Super Admin) */}
            <Route
              path="/ocsp-monitoring"
              element={
                <RbacGuard allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_AUDITOR']}>
                  <Layout>
                    <OcspMonitoring />
                  </Layout>
                </RbacGuard>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
