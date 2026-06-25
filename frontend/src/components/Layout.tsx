import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
  const [downloadingCrl, setDownloadingCrl] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (e) {}
  };

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {}
  };

  const handleDownloadCrl = async () => {
    setDownloadingCrl(true);
    try {
      const response = await api.get('/api/revocation/crl/generate', {
        responseType: 'blob',
      });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(response.data);
      element.download = 'crl_list.crl';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('Certificate Revocation List (CRL) downloaded', 'success');
    } catch (e: any) {
      showToast('CRL download failed', 'error');
    } finally {
      setDownloadingCrl(false);
    }
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return <>{children}</>;

  const isSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN');
  const isAdmin = user.roles.includes('ROLE_ADMIN');
  const isAuditor = user.roles.includes('ROLE_AUDITOR');
  const isEscrowAgent = user.roles.includes('ROLE_KEY_ESCROW');
  const isOcspOperator = user.roles.includes('ROLE_OCSP_OPERATOR');
  const canMakeSelfSigned = isAdmin || isSuperAdmin || user.roles.includes('ROLE_SELF_SIGNED');
  const canDownloadCrl = isAdmin || isSuperAdmin || isAuditor;

  // User initials for avatar
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="app-container">
      <aside className="sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="sidebar-logo">Web PKI Platform</div>
            <div style={{ fontSize: '0.6rem', color: '#4A6080', marginTop: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              INSA Infrastructure
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Overview</div>
            <div
              className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              📊 Dashboard
            </div>
          </div>

          {isSuperAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">System Admin</div>
              <div
                className={`sidebar-link ${isActive('/users') ? 'active' : ''}`}
                onClick={() => navigate('/users')}
              >
                👥 User Directory
              </div>
              <div
                className={`sidebar-link ${isActive('/hsm') ? 'active' : ''}`}
                onClick={() => navigate('/hsm')}
              >
                🔒 HSM Slot Monitor
              </div>
              <div
                className={`sidebar-link ${isActive('/publishing-target') ? 'active' : ''}`}
                onClick={() => navigate('/publishing-target')}
              >
                📡 Publishing Targets
              </div>
              <div
                className={`sidebar-link ${isActive('/revocation') ? 'active' : ''}`}
                onClick={() => navigate('/revocation')}
              >
                🚫 Revoked Registry
              </div>
              <div
                className={`sidebar-link ${isActive('/key-escrow') ? 'active' : ''}`}
                onClick={() => navigate('/key-escrow')}
              >
                🔐 Key Escrow Panel
              </div>
            </div>
          )}

          {(isAdmin || isSuperAdmin) && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Operations</div>
              <div
                className={`sidebar-link ${isActive('/requests') ? 'active' : ''}`}
                onClick={() => navigate('/requests')}
              >
                📋 Request Approval
              </div>
              <div
                className={`sidebar-link ${isActive('/keys') ? 'active' : ''}`}
                onClick={() => navigate('/keys')}
              >
                🔑 Key Generator
              </div>
              <div
                className={`sidebar-link ${isActive('/cas') ? 'active' : ''}`}
                onClick={() => navigate('/cas')}
              >
                👑 CA Wizard
              </div>
              <div
                className={`sidebar-link ${isActive('/csrs') ? 'active' : ''}`}
                onClick={() => navigate('/csrs')}
              >
                📄 CSR Portal
              </div>
              <div
                className={`sidebar-link ${isActive('/revocation') ? 'active' : ''}`}
                onClick={() => navigate('/revocation')}
              >
                🚫 Revocation Control
              </div>
              <div
                className={`sidebar-link ${isActive('/escrow-request') ? 'active' : ''}`}
                onClick={() => navigate('/escrow-request')}
              >
                🔑 Key Recovery Desk
              </div>
              {/* CA Operator needs access to Key Escrow for share initialization */}
              {isAdmin && !isSuperAdmin && (
                <div
                  className={`sidebar-link ${isActive('/key-escrow') ? 'active' : ''}`}
                  onClick={() => navigate('/key-escrow')}
                >
                  🔐 Key Escrow Panel
                </div>
              )}
            </div>
          )}

          {isAuditor && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Review</div>
              <div
                className={`sidebar-link ${isActive('/requests') ? 'active' : ''}`}
                onClick={() => navigate('/requests')}
              >
                📋 Pending Requests
              </div>
            </div>
          )}

          {isAuditor && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Security & Logs</div>
              <div
                className={`sidebar-link ${isActive('/audit') ? 'active' : ''}`}
                onClick={() => navigate('/audit')}
              >
                📊 Audit Data Grid
              </div>
              <div
                className={`sidebar-link ${isActive('/revocation') ? 'active' : ''}`}
                onClick={() => navigate('/revocation')}
              >
                🚫 Revocation List
              </div>
            </div>
          )}

          {isEscrowAgent && !isSuperAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Key Escrow</div>
              <div
                className={`sidebar-link ${isActive('/key-escrow') ? 'active' : ''}`}
                onClick={() => navigate('/key-escrow')}
              >
                🔐 Escrow Panel
              </div>
            </div>
          )}

          {isOcspOperator && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">OCSP Operations</div>
              <div
                className={`sidebar-link ${isActive('/ocsp-operator') ? 'active' : ''}`}
                onClick={() => navigate('/ocsp-operator')}
              >
                📋 Verification Requests
              </div>
              <div
                className={`sidebar-link ${isActive('/validation') ? 'active' : ''}`}
                onClick={() => navigate('/validation')}
              >
                🔍 Manual OCSP Console
              </div>
              <div
                className={`sidebar-link ${isActive('/ocsp-monitoring') ? 'active' : ''}`}
                onClick={() => navigate('/ocsp-monitoring')}
              >
                📊 Service Monitoring
              </div>
            </div>
          )}

          {(isSuperAdmin || isAuditor) && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">OCSP Monitoring</div>
              <div
                className={`sidebar-link ${isActive('/ocsp-monitoring') ? 'active' : ''}`}
                onClick={() => navigate('/ocsp-monitoring')}
              >
                📊 OCSP Health Check
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-title">Self Service</div>
            {!isAdmin && !isSuperAdmin && !isEscrowAgent && (
              <>
                <div
                  className={`sidebar-link ${isActive('/keys') ? 'active' : ''}`}
                  onClick={() => navigate('/keys')}
                >
                  🔑 Key Generator
                </div>
                <div
                  className={`sidebar-link ${isActive('/csrs') ? 'active' : ''}`}
                  onClick={() => navigate('/csrs')}
                >
                  📄 Submit CSR
                </div>
              </>
            )}
            <div
              className={`sidebar-link ${isActive('/certificates') ? 'active' : ''}`}
              onClick={() => navigate('/certificates')}
            >
              🏅 Certificates List
            </div>
            {canMakeSelfSigned && (
              <div
                className={`sidebar-link ${isActive('/self-signed') ? 'active' : ''}`}
                onClick={() => navigate('/self-signed')}
              >
                ✍️ Self-Signed Wizard
              </div>
            )}
            {!isOcspOperator && (
              <div
                className={`sidebar-link ${isActive('/request-verification') ? 'active' : ''}`}
                onClick={() => navigate('/request-verification')}
              >
                ✅ Request Verification
              </div>
            )}
            {!isAdmin && !isSuperAdmin && !isEscrowAgent && (
              <div
                className={`sidebar-link ${isActive('/escrow-request') ? 'active' : ''}`}
                onClick={() => navigate('/escrow-request')}
              >
                🔑 Key Recovery
              </div>
            )}
          </div>
        </nav>

        {/* ── Beautiful Sidebar Footer ── */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user.username}</span>
              <span className="sidebar-userrole">
                {user.roles.map((r) => r.replace('ROLE_', '')).join(', ')}
              </span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span style={{ fontSize: '1rem' }}>→</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        <header className="main-header">
          <div className="main-header-title">
            {location.pathname === '/dashboard' && '📊 Security Dashboard'}
            {location.pathname === '/users' && '👥 User Administration'}
            {location.pathname === '/hsm' && '🔒 Hardware Security Module'}
            {location.pathname === '/publishing-target' && '📡 Publication Channels'}
            {location.pathname === '/keys' && '🔑 Cryptographic Key Generator'}
            {location.pathname === '/cas' && '👑 Certificate Authorities Wizard'}
            {location.pathname === '/csrs' && '📄 CSR Processing Desk'}
            {location.pathname === '/revocation' && '🚫 Revocation Management'}
            {location.pathname === '/audit' && '📊 System Audit Trail'}
            {location.pathname === '/certificates' && '🏅 Active Certificates'}
            {location.pathname === '/profile' && '⚙️ Preferences & Profile'}
            {location.pathname === '/validation' && '🔍 Manual OCSP Console'}
            {location.pathname === '/request-verification' && '✅ Request Certificate Verification'}
            {location.pathname === '/self-signed' && '✍️ Self-Signed Certificate Wizard'}
            {location.pathname === '/requests' && '📋 Request Approval Desk'}
            {location.pathname === '/key-escrow' && '🔐 Key Escrow Management'}
            {location.pathname === '/escrow-request' && '🔑 Key Recovery'}
            {location.pathname === '/ocsp-operator' && '📋 OCSP Verification Requests'}
            {location.pathname === '/ocsp-monitoring' && '📊 OCSP Service Monitoring'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-preferences"
                style={{ position: 'relative' }}
              >
                🔔
                {unreadCount > 0 ? ` Notifications (${unreadCount})` : ' Notifications'}
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  width: '320px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.625rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '0.5rem',
                }}>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.35rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--text-primary)',
                    padding: '0.25rem 0.5rem 0.5rem',
                  }}>
                    <span>Notification Center</span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 600 }}>{unreadCount} unread</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                      No notifications.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--border-color)',
                            backgroundColor: (notif.isRead || notif.read) ? 'transparent' : 'rgba(59, 130, 246, 0.06)',
                            fontSize: '0.75rem',
                            position: 'relative',
                          }}
                        >
                          <div style={{ color: 'var(--text-primary)', paddingRight: '2rem', textAlign: 'left' }}>{notif.message}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.2rem', textAlign: 'left' }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                          {!(notif.isRead || notif.read) && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-accent)',
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                              }}
                            >
                              ✓ Read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Download CRL */}
            {canDownloadCrl && (
              <button
                onClick={handleDownloadCrl}
                className="btn-primary"
                disabled={downloadingCrl}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  height: 'auto',
                  lineHeight: '1.4',
                }}
              >
                {downloadingCrl ? 'Downloading...' : '📥 Download CRL'}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-preferences"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>

            {/* Preferences */}
            <button
              onClick={() => navigate('/profile')}
              className="btn-preferences"
              title="Preferences & Profile"
              style={{
                backgroundColor: isActive('/profile') ? 'var(--bg-canvas)' : undefined,
                borderColor: isActive('/profile') ? 'var(--color-accent)' : undefined,
                color: isActive('/profile') ? 'var(--color-accent)' : undefined,
              }}
            >
              ⚙️ Preferences
            </button>

            {/* Department badge */}
            <div className="badge badge-info">{user.department || 'PKI Infrastructure'}</div>
          </div>
        </header>

        <div className="main-content">{children}</div>
      </main>
    </div>
  );
};
