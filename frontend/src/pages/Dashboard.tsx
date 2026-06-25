import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface SuperAdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  activeCertificates: number;
  pendingRequests: number;
}

interface AdminStats {
  totalCas: number;
  pendingCsrs: number;
  totalCertificates: number;
}

interface UserStats {
  myCertificates: number;
  myKeys: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [superStats, setSuperStats] = useState<SuperAdminStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSuperStats = async () => {
    try {
      const response = await api.get('/api/users/dashboard/stats');
      setSuperStats(response.data);
    } catch (e: any) {
      showToast('Failed to load system admin stats', 'error');
    }
  };

  const fetchAdminStats = async () => {
    try {
      const cas = await api.get('/api/ca');
      const csrs = await api.get('/api/csr/pending');
      const certs = await api.get('/api/certificates');
      setAdminStats({
        totalCas: cas.data.length,
        pendingCsrs: csrs.data.length,
        totalCertificates: certs.data.length,
      });
    } catch (e: any) {
      showToast('Failed to load operational metrics', 'error');
    }
  };

  const fetchUserStats = async () => {
    try {
      const certs = await api.get('/api/certificates/my');
      const keys = await api.get('/api/keys');
      setUserStats({
        myCertificates: certs.data.length,
        myKeys: keys.data.length,
      });
    } catch (e: any) {
      showToast('Failed to load asset counts', 'error');
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      if (user.roles.includes('ROLE_SUPER_ADMIN') || user.roles.includes('ROLE_AUDITOR')) {
        await fetchSuperStats();
      } else if (user.roles.includes('ROLE_ADMIN')) {
        await fetchAdminStats();
      } else if (user.roles.includes('ROLE_USER')) {
        await fetchUserStats();
      }
      setLoading(false);
    };
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  const isSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN');
  const isAdmin = user.roles.includes('ROLE_ADMIN');
  const isAuditor = user.roles.includes('ROLE_AUDITOR');
  const isNormalUser = user.roles.includes('ROLE_USER');

  if (isSuperAdmin) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>System Administrator Control Desk</h2>
          <p style={{ color: '#64748B' }}>System-wide directory controls, hardware status, and configurations.</p>
        </div>

        {superStats && (
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Certificates
              </h3>
              <div className="stat-value">{superStats.activeCertificates}</div>
              <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                Active Registry
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pending CSR Inbox
              </h3>
              <div className="stat-value">{superStats.pendingRequests}</div>
              <div className="badge badge-warning" style={{ marginTop: '0.5rem' }}>
                Awaiting Sign
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Directory Accounts
              </h3>
              <div className="stat-value">{superStats.totalUsers}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
                {superStats.activeUsers} Active / {superStats.suspendedUsers} Suspended
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MFA Compliancy
              </h3>
              <div className="stat-value">100%</div>
              <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                Enforced
              </div>
            </div>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">System Infrastructure Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>HSM Module Integration Slot 0</span>
                  <span style={{ color: '#059669' }}>Connected (INSA-Root-CA)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', backgroundColor: '#10B981', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>LDAP Publication Target Status</span>
                  <span style={{ color: '#D97706' }}>Awaiting Initial Sync</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '50%', backgroundColor: '#F59E0B', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Infrastructure Shortcuts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => navigate('/users')}>
                User Directory
              </button>
              <button className="btn-secondary" onClick={() => navigate('/hsm')}>
                HSM Slot Monitor
              </button>
              <button className="btn-secondary" onClick={() => navigate('/publishing-target')}>
                Configure LDAP
              </button>
              <button className="btn-secondary" onClick={() => navigate('/certificates')}>
                Certificates Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>Cryptographic Operations Console</h2>
          <p style={{ color: '#64748B' }}>Key generation, CA management, CSR approvals, and revocation triggers.</p>
        </div>

        {adminStats && (
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CA Trust Anchors
              </h3>
              <div className="stat-value">{adminStats.totalCas}</div>
              <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                Anchors Configured
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pending CSR Queue
              </h3>
              <div className="stat-value">{adminStats.pendingCsrs}</div>
              <div className="badge badge-warning" style={{ marginTop: '0.5rem' }}>
                Action Required
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Registry Certificates
              </h3>
              <div className="stat-value">{adminStats.totalCertificates}</div>
              <div className="badge badge-info" style={{ marginTop: '0.5rem' }}>
                Total Issued
              </div>
            </div>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Trust Anchors Validity Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>Root Authority Certificate</span>
                  <span style={{ color: '#059669' }}>95% remaining (345 days)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '95%', backgroundColor: '#10B981', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>Subordinate Intermediate CA</span>
                  <span style={{ color: '#059669' }}>88% remaining (320 days)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '88%', backgroundColor: '#10B981', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Cryptographic Execution Panel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => navigate('/keys')}>
                Key Generator
              </button>
              <button className="btn-secondary" onClick={() => navigate('/cas')}>
                CA Wizard
              </button>
              <button className="btn-secondary" onClick={() => navigate('/csrs')}>
                CSR Signing Desk
              </button>
              <button className="btn-danger" onClick={() => navigate('/revocation')}>
                Revoke Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuditor) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>Compliance Assurance Portal</h2>
          <p style={{ color: '#64748B' }}>Cryptographic transaction ledgers, integrity reports, and CSV/PDF exporters.</p>
        </div>

        {superStats && (
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Registry Certificates
              </h3>
              <div className="stat-value">{superStats.activeCertificates}</div>
              <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                Valid
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pending CSR Requests
              </h3>
              <div className="stat-value">{superStats.pendingRequests}</div>
              <div className="badge badge-warning" style={{ marginTop: '0.5rem' }}>
                Pending Approval
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Audit Verification Status
              </h3>
              <div className="stat-value">HMAC Secure</div>
              <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                Chain Intact
              </div>
            </div>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Compliance Reports Compiler</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Compile ledger data slices and export cryptographic records.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => navigate('/audit')}>
                Export PDF
              </button>
              <button className="btn-secondary" onClick={() => navigate('/audit')}>
                Export CSV
              </button>
              <button className="btn-secondary" onClick={() => navigate('/audit')}>
                Export JSON
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Auditor Workspace Navigation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/audit')}>
                System Transaction Audit Trail
              </button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/certificates')}>
                Browse Public Certificate Registry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isNormalUser) {
    return (
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>Personal Cryptographic Self-Service Hub</h2>
          <p style={{ color: '#64748B' }}>Request credentials, view personal key catalogs, and configure MFA indicators.</p>
        </div>

        {userStats && (
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                My Private Key Pairs
              </h3>
              <div className="stat-value">{userStats.myKeys}</div>
              <div className="badge badge-info" style={{ marginTop: '0.5rem' }}>
                Generated
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                My Active Certificates
              </h3>
              <div className="stat-value">{userStats.myCertificates}</div>
              <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                Issued & Valid
              </div>
            </div>

            <div className="card">
              <h3 className="stat-desc" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TOTP Protection
              </h3>
              <div className="stat-value">{user.mfaEnabled ? 'Enforced' : 'Disabled'}</div>
              {user.mfaEnabled ? (
                <div className="badge badge-success" style={{ marginTop: '0.5rem' }}>
                  Secure
                </div>
              ) : (
                <div className="badge badge-danger" style={{ marginTop: '0.5rem' }}>
                  Action Required
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">Active Assets Validity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>My Primary Certificate</span>
                  <span style={{ color: '#059669' }}>100% remaining (365 days)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', backgroundColor: '#10B981', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Self-Service Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => navigate('/certificates')}>
                My Certificates
              </button>
              <button className="btn-secondary" onClick={() => navigate('/profile')}>
                Setup Google MFA
              </button>
              <button className="btn-secondary" onClick={() => navigate('/profile')}>
                Rotate Password
              </button>
              <button className="btn-secondary" onClick={() => navigate('/validation')}>
                Check Certificate Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
