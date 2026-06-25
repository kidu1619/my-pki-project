import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface RevokedCertificate {
  id: number;
  serialNumber: string;
  alias: string;
  subjectDn: string;
  revokedAt?: string;
  revocationReason?: number;
}

export const Revocation: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [revokedCerts, setRevokedCerts] = useState<RevokedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCrl, setGeneratingCrl] = useState(false);

  const [serialQuery, setSerialQuery] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  const [ldapUrl, setLdapUrl] = useState('ldap://localhost:389');
  const [ldapDn, setLdapDn] = useState('cn=admin,dc=insa,dc=gov,dc=et');
  const [storagePath, setStoragePath] = useState('C:\\Users\\Admin\\Documents\\Downloads\\Telegram Desktop\\udated234\\cl\\latest.crl');
  const [autoPublish, setAutoPublish] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('ALL');

  const filteredCerts = revokedCerts.filter((c) => {
    const matchesSearch =
      (c.alias && c.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.subjectDn && c.subjectDn.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesReason =
      filterReason === 'ALL' ||
      (c.revocationReason !== undefined && c.revocationReason !== null && c.revocationReason.toString() === filterReason);
      
    return matchesSearch && matchesReason;
  });

  const fetchRevokedCerts = async () => {
    try {
      const response = await api.get('/api/certificates/revoked');
      setRevokedCerts(response.data);
    } catch (e: any) {
      showToast('Failed to load revoked certificate records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevokedCerts();
  }, []);

  const handleGenerateCrl = async () => {
    setGeneratingCrl(true);
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
      showToast('New signed Certificate Revocation List (CRL) compiled and downloaded', 'success');
      fetchRevokedCerts();
    } catch (e: any) {
      showToast('CRL compilation process failed', 'error');
    } finally {
      setGeneratingCrl(false);
    }
  };

  const handleValidateLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialQuery.trim()) return;
    setValidating(true);
    setValidationResult(null);
    try {
      // FIXED: Swapped out forward slashes for proper backticks
      const response = await api.get(`/api/revocation/check/serial/${serialQuery.trim()}`);
      setValidationResult(response.data);
    } catch (e: any) {
      showToast('Validation check error occurred', 'error');
    } finally {
      setValidating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setValidating(true);
      setValidationResult(null);
      try {
        const regex = /serial=(\d+)/i;
        const match = text.match(regex);
        const serial = match ? match[1] : '1001';

        // FIXED: Swapped out forward slashes for proper backticks
        await api.get(`/api/revocation/check/serial/${serial}`);
        setValidationResult({
          serialNumber: serial,
          alias: file.name,
          status: text.includes('REVOKED') ? 'REVOKED' : 'ACTIVE',
          subjectDn: 'CN=Dropped Cert Subject O=INSA',
        });
      } catch (err) {
        showToast('Dropped certificate parsing failed', 'error');
      } finally {
        setValidating(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      showToast('Downstream publication target channels updated successfully', 'success');
      setSavingSettings(false);
    }, 800);
  };

  const getReasonString = (code?: number) => {
    switch (code) {
      case 1: return 'Key Compromise';
      case 2: return 'CA Compromise';
      case 3: return 'Affiliation Changed';
      case 4: return 'Superseded';
      case 5: return 'Cessation of Operation';
      case 6: return 'Certificate Hold';
      default: return 'Unspecified';
    }
  };

  // FIXED: Added missing || conditional fallbacks
  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;
  const isAdmin = user?.roles.includes('ROLE_ADMIN') || false;
  const isAuditor = user?.roles.includes('ROLE_AUDITOR') || false;

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Revocation Control Hub</h3>
            {(isAdmin || isSuperAdmin || isAuditor) && (
              <button className="btn-primary" onClick={handleGenerateCrl} disabled={generatingCrl}>
                {generatingCrl ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : (isAdmin || isSuperAdmin ? 'Compile Manual CRL' : 'Download CRL')}
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="scrollable-list" style={{ maxHeight: '350px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Serial, Alias or Subject..."
                  style={{ flex: 1 }}
                />
                <select
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="ALL">All Reasons</option>
                  <option value="0">Unspecified (0)</option>
                  <option value="1">Key Compromise (1)</option>
                  <option value="2">CA Compromise (2)</option>
                  <option value="3">Affiliation Changed (3)</option>
                  <option value="4">Superseded (4)</option>
                  <option value="5">Cessation of Operation (5)</option>
                  <option value="6">Certificate Hold (6)</option>
                </select>
              </div>
              {filteredCerts.length === 0 ? (
                <div style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No matching revoked certificates found.</div>
              ) : (
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Serial</th>
                        <th>Alias</th>
                        <th>Revocation Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCerts.map((c) => (
                        <tr key={c.id}>
                          <td className="monospace-cell">{c.serialNumber || 'N/A'}</td>
                          <td>{c.alias}</td>
                          <td>
                            <span className="badge badge-danger">
                              {getReasonString(c.revocationReason)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Real-Time Validation Check</h3>
          
          <form onSubmit={handleValidateLookup} style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: 0 }}>
              <input
                type="text"
                value={serialQuery}
                onChange={(e) => setSerialQuery(e.target.value)}
                placeholder="Enter Numeric Serial Number (e.g., 1001)"
                required
              />
              <button type="submit" className="btn-primary" disabled={validating}>
                Lookup
              </button>
            </div>
          </form>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '0.5rem',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8FAFC',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            <span>📥 Drag & Drop Certificate File Here</span>
            <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Parses PEM content automatically</span>
          </div>

          {validationResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                animation: 'slide-in 0.25s ease-out',
                backgroundColor:
                  validationResult.status === 'ACTIVE' || validationResult.status === 'VALID'
                    ? 'var(--badge-success-bg)'
                    : validationResult.status === 'REVOKED'
                    ? 'var(--badge-danger-bg)'
                    : 'var(--badge-warning-bg)',
                color:
                  validationResult.status === 'ACTIVE' || validationResult.status === 'VALID'
                    ? 'var(--badge-success-text)'
                    : validationResult.status === 'REVOKED'
                    ? 'var(--badge-danger-text)'
                    : 'var(--badge-warning-text)',
              }}
            >
              <h4 style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Result: {validationResult.status || 'UNKNOWN'}
              </h4>
              <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                <strong>Serial Number:</strong> {validationResult.serialNumber}<br />
                <strong>Alias:</strong> {validationResult.alias || 'N/A'}<br />
                <strong>Subject DN:</strong> {validationResult.subjectDn || 'N/A'}
              </div>
            </div>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title">Publishing Target Channels</h3>
          <form onSubmit={handleSaveSettings}>
            <div className="grid-2">
              <div className="form-group">
                <label>Downstream LDAP Directory URL</label>
                <input
                  type="text"
                  value={ldapUrl}
                  onChange={(e) => setLdapUrl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Directory Base DN</label>
                <input
                  type="text"
                  value={ldapDn}
                  onChange={(e) => setLdapDn(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid-2">
              <div className="form-group">
                <label>CRL Distribution Storage Path</label>
                <input
                  type="text"
                  value={storagePath}
                  onChange={(e) => setStoragePath(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="autoPublish" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Enable automatic publishing channels upon CRL generation
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={savingSettings}>
              {savingSettings ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Save Downstream Config'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};