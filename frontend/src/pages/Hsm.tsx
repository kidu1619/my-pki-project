import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface SlotInfo {
  alias: string;
  hasCertificate: boolean;
  isKeyEntry: boolean;
}

interface HsmStatus {
  status: string;
  message?: string;
  provider?: string;
  providerInfo?: string;
  type?: string;
  slots?: SlotInfo[];
  totalSlots?: number;
}

export const Hsm: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [hsmData, setHsmData] = useState<HsmStatus | null>(null);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const [configPath, setConfigPath] = useState('C:\\Users\\Admin\\Documents\\Downloads\\Telegram Desktop\\udated234\\cl\\certificate-management-backend-phas5\\src\\main\\resources\\hsm.cfg');
  const [pin, setPin] = useState('');
  const [initializing, setInitializing] = useState(false);

  const fetchHsmStatus = async () => {
    try {
      const response = await api.get('/api/hsm/status');
      setHsmData(response.data);
      const globalResponse = await api.get('/api/hsm/global-status');
      setGlobalEnabled(globalResponse.data.enabled);
    } catch (e: any) {
      showToast('Error querying HSM controller status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobalHsm = async () => {
    try {
      const response = await api.post('/api/hsm/global-status/toggle', {});
      setGlobalEnabled(response.data.enabled);
      showToast(response.data.message || 'HSM global status updated', 'success');
    } catch (e: any) {
      showToast('Failed to toggle HSM global status', 'error');
    }
  };

  useEffect(() => {
    fetchHsmStatus();
  }, []);

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitializing(true);
    try {
      const response = await api.post('/api/hsm/init', {
        configPath,
        pin,
      });
      showToast(response.data.message || 'HSM initialized successfully', 'success');
      setPin('');
      fetchHsmStatus();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'HSM initialization failed', 'error');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">HSM Status & Connections</h3>
          {hsmData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>Status:</span>
                {hsmData.status === 'CONNECTED' ? (
                  <span className="badge badge-success">CONNECTED</span>
                ) : hsmData.status === 'DISCONNECTED' ? (
                  <span className="badge badge-danger">DISCONNECTED</span>
                ) : (
                  <span className="badge badge-warning">ERROR</span>
                )}
              </div>

              {hsmData.status === 'CONNECTED' && (
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #E2E8F0' }}>
                  <div><strong>Provider:</strong> {hsmData.provider}</div>
                  <div><strong>Provider Info:</strong> {hsmData.providerInfo}</div>
                  <div><strong>KeyStore Type:</strong> {hsmData.type}</div>
                  <div><strong>Registered Slot Count:</strong> {hsmData.totalSlots}</div>
                </div>
              )}

              {hsmData.status !== 'CONNECTED' && (
                <div style={{ fontSize: '0.875rem', color: '#EF4444', backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #FEE2E2' }}>
                  {hsmData.message || 'No HSM module connected.'}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', marginTop: '0.5rem', backgroundColor: 'var(--bg-canvas)' }}>
                <div>
                  <strong style={{ fontSize: '0.875rem' }}>Global HSM Permissions</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {globalEnabled ? 'HSM is globally allowed for key generation and CA signing.' : 'HSM operations are blocked globally.'}
                  </div>
                </div>
                {isSuperAdmin ? (
                  <button
                    onClick={handleToggleGlobalHsm}
                    className={globalEnabled ? 'btn-secondary' : 'btn-primary'}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', border: globalEnabled ? '1px solid #EF4444' : 'none', color: globalEnabled ? '#EF4444' : 'inherit' }}
                  >
                    {globalEnabled ? '⛔ Block HSM' : '✅ Allow HSM'}
                  </button>
                ) : (
                  <span className={`badge badge-${globalEnabled ? 'success' : 'danger'}`}>
                    {globalEnabled ? 'Allowed' : 'Blocked'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p>No status information available.</p>
          )}
        </div>

        {isSuperAdmin && (
          <div className="card">
            <h3 className="card-title">Initialize HSM Cryptographic Token</h3>
            <form onSubmit={handleInitialize}>
              <div className="form-group">
                <label>PKCS#11 Configuration File Path</label>
                <input
                  type="text"
                  value={configPath}
                  onChange={(e) => setConfigPath(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Master Security Officer (SO) PIN</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={initializing}>
                {initializing ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Initialize HSM Module'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">Token Slot Mapping & Aliases Registry</h3>
        <div className="table-container" style={{ border: 'none' }}>
          {hsmData?.slots && hsmData.slots.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Slot Alias</th>
                  <th>Key Entry Status</th>
                  <th>Certificate Association</th>
                </tr>
              </thead>
              <tbody>
                {hsmData.slots.map((slot, index) => (
                  <tr key={index}>
                    <td className="monospace-cell" style={{ fontWeight: 600 }}>{slot.alias}</td>
                    <td>
                      {slot.isKeyEntry ? (
                        <span className="badge badge-success">Dwelling Key</span>
                      ) : (
                        <span className="badge badge-warning">No Key Entry</span>
                      )}
                    </td>
                    <td>
                      {slot.hasCertificate ? (
                        <span className="badge badge-success">Certificate Bound</span>
                      ) : (
                        <span className="badge badge-danger">Certificate Missing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>
              No hardware mapping slots initialized in the provider.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
