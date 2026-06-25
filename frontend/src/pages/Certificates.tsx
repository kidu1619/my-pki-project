import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import api from '../services/api';

interface Certificate {
  id: number;
  serialNumber: string;
  alias: string;
  subjectDn: string;
  issuerDn: string;
  status: string;
  notBefore: string;
  notAfter: string;
  ownerId?: number;
  type?: string;
  certificateType?: string;
}

interface CaItem {
  id: number;
  alias: string;
  commonName: string;
}

interface KeyPairItem {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  type: string;
}

export const Certificates: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [cas, setCas] = useState<CaItem[]>([]);
  const [keys, setKeys] = useState<KeyPairItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importAlias, setImportAlias] = useState('');
  const [importPem, setImportPem] = useState('');
  const [importing, setImporting] = useState(false);

  const [isSelfSignedOpen, setIsSelfSignedOpen] = useState(false);
  const [selfSignedKeyId, setSelfSignedKeyId] = useState('');
  const [selfSignedAlias, setSelfSignedAlias] = useState('');
  const [selfSignedCommonName, setSelfSignedCommonName] = useState('');
  const [selfSignedOrg, setSelfSignedOrg] = useState('');
  const [selfSignedCountry, setSelfSignedCountry] = useState('ET');
  const [generatingSelfSigned, setGeneratingSelfSigned] = useState(false);

  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedCertForRevoke, setSelectedCertForRevoke] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('0');
  const [revokerPassword, setRevokerPassword] = useState('');
  const [revoking, setRevoking] = useState(false);

  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedCertForRenew, setSelectedCertForRenew] = useState<Certificate | null>(null);
  const [renewYears, setRenewYears] = useState('1');
  const [renewCaKeyId, setRenewCaKeyId] = useState('');
  const [renewing, setRenewing] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCertForDelete, setSelectedCertForDelete] = useState<Certificate | null>(null);

  // File Upload State
  const [isFileRevokeOpen, setIsFileRevokeOpen] = useState(false);
  const [isFileRenewOpen, setIsFileRenewOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedDetails, setParsedDetails] = useState<any | null>(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [submittingFileAction, setSubmittingFileAction] = useState(false);

  // Request Workflow State
  const [isRequestRevokeOpen, setIsRequestRevokeOpen] = useState(false);
  const [selectedCertForRequestRevoke, setSelectedCertForRequestRevoke] = useState<Certificate | null>(null);
  const [isRequestRenewOpen, setIsRequestRenewOpen] = useState(false);
  const [selectedCertForRequestRenew, setSelectedCertForRequestRenew] = useState<Certificate | null>(null);

  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;
  const isAdmin = user?.roles.includes('ROLE_ADMIN') || isSuperAdmin || false;
  const isAuditor = user?.roles.includes('ROLE_AUDITOR') || false;
  const canSeeAll = isAdmin || isAuditor;
  const canMakeSelfSigned = isAdmin || user?.roles.includes('ROLE_SELF_SIGNED') || false;

  const canRevokeRenew = (c: any) => {
    if (user?.roles.includes('ROLE_SUPER_ADMIN')) {
      return true;
    }
    const certType = c.certificateType || c.type;
    if (user?.roles.includes('ROLE_ADMIN')) {
      return certType !== 'ROOT_CA' && certType !== 'INTERMEDIATE_CA';
    }
    return false;
  };

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const endpoint = (activeTab === 'all' && canSeeAll) ? '/api/certificates' : '/api/certificates/my';
      const response = await api.get(endpoint);
      setCerts(response.data);
    } catch (e: any) {
      showToast('Failed to load certificates inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCas = async () => {
    try {
      const response = await api.get('/api/ca');
      setCas(response.data);
      if (response.data.length > 0) {
        setRenewCaKeyId(response.data[0].id.toString());
      }
    } catch (e) {}
  };

  const fetchKeys = async () => {
    try {
      const response = await api.get('/api/keys');
      setKeys(response.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (canSeeAll && activeTab === 'all') {
      setActiveTab('all');
    } else {
      setActiveTab('my');
    }
  }, [user]);

  useEffect(() => {
    fetchCerts();
  }, [activeTab]);

  useEffect(() => {
    fetchCas();
    fetchKeys();
  }, []);

  const handleExport = async (cert: Certificate) => {
    try {
      const response = await api.get(`/api/certificates/${cert.id}/export`);
      const element = document.createElement('a');
      const file = new Blob([response.data], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${cert.alias}.pem`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast(`Exported certificate ${cert.alias}`, 'success');
    } catch (e: any) {
      showToast('Failed to export certificate', 'error');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    try {
      await api.post('/api/certificates/import', {
        alias: importAlias,
        pem: importPem,
      });
      showToast(`Certificate '${importAlias}' imported successfully`, 'success');
      setImportAlias('');
      setImportPem('');
      setIsImportOpen(false);
      fetchCerts();
    } catch (e: any) {
      showToast(e.response?.data || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateSelfSigned = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfSignedKeyId) {
      showToast('Please select a cryptographic key pair', 'error');
      return;
    }
    setGeneratingSelfSigned(true);
    try {
      const dnString = `CN=${selfSignedCommonName}, O=${selfSignedOrg}, C=${selfSignedCountry}`;
      await api.post('/api/certificates/self-signed', {
        keyId: parseInt(selfSignedKeyId, 10),
        alias: selfSignedAlias.trim(),
        dn: dnString,
      });
      showToast(`Self-signed certificate '${selfSignedAlias}' generated successfully!`, 'success');
      setSelfSignedKeyId('');
      setSelfSignedAlias('');
      setSelfSignedCommonName('');
      setSelfSignedOrg('');
      setIsSelfSignedOpen(false);
      fetchCerts();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.response?.data || 'Self-signed generation failed', 'error');
    } finally {
      setGeneratingSelfSigned(false);
    }
  };

  const triggerRevocationModal = (cert: Certificate) => {
    setSelectedCertForRevoke(cert);
    setRevokerPassword('');
    setIsRevokeOpen(true);
  };

  const handleRevoke = async () => {
    if (!selectedCertForRevoke) return;
    if (!revokerPassword.trim()) {
      showToast('Your login password is required to revoke a certificate.', 'error');
      return;
    }
    setRevoking(true);
    try {
      await api.post(
        `/api/certificates/${selectedCertForRevoke.id}/revoke`,
        { revokerPassword },
        { params: { reason: parseInt(revocationReason, 10) } }
      );
      showToast('Certificate revoked successfully.', 'success');
      setIsRevokeOpen(false);
      setSelectedCertForRevoke(null);
      setRevokerPassword('');
      fetchCerts();
    } catch (e: any) {
      const msg = e.response?.data || 'Certificate revocation failed.';
      showToast(typeof msg === 'string' ? msg : 'Revocation denied — check your password.', 'error');
    } finally {
      setRevoking(false);
    }
  };

  const triggerRenewModal = (cert: Certificate) => {
    setSelectedCertForRenew(cert);
    setIsRenewOpen(true);
  };

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForRenew) return;
    setRenewing(true);
    try {
      await api.post(`/api/certificates/${selectedCertForRenew.id}/renew`, null, {
        params: {
          years: parseInt(renewYears, 10),
          caKeyId: renewCaKeyId ? parseInt(renewCaKeyId, 10) : null,
        },
      });
      showToast("Certificate renewed successfully.", "success");
      setIsRenewOpen(false);
      setSelectedCertForRenew(null);
      fetchCerts();
    } catch (e: any) {
      showToast("Certificate renewal failed.", "error");
    } finally {
      setRenewing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setParsingFile(true);
    setParsedDetails(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/certificates/parse-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const matched = certs.find(c => c.serialNumber?.toUpperCase() === response.data.serialNumber?.toUpperCase());
      if (matched) {
        response.data.id = matched.id;
        response.data.ownerId = matched.ownerId;
      }
      setParsedDetails(response.data);
      showToast('Certificate file parsed successfully', 'success');
    } catch (err: any) {
      const errMsg = err.response?.data || 'Failed to parse certificate file';
      showToast(errMsg, 'error');
      setUploadedFile(null);
    } finally {
      setParsingFile(false);
    }
  };

  const handleFileRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile || !parsedDetails) return;
    setSubmittingFileAction(true);
    try {
      const matched = certs.find(c => c.serialNumber?.toUpperCase() === parsedDetails.serialNumber?.toUpperCase());
      if (!matched) {
        showToast("Operation failed. Please try again.", "error");
        setSubmittingFileAction(false);
        return;
      }
      const isUserRole = user?.roles.includes('ROLE_USER') && !isAdmin && !isSuperAdmin;

      if (isUserRole) {
        await api.post('/api/requests/revoke', {
          certificateId: matched.id,
          reason: revocationReason
        });
        showToast("Revocation request submitted successfully.", "success");
      } else {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('reason', revocationReason);
        await api.post('/api/certificates/revoke-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast("Certificate revoked successfully.", "success");
      }
      setIsFileRevokeOpen(false);
      setUploadedFile(null);
      setParsedDetails(null);
      fetchCerts();
    } catch (err: any) {
      showToast("Operation failed. Please try again.", "error");
    } finally {
      setSubmittingFileAction(false);
    }
  };

  const handleFileRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile || !parsedDetails) return;
    setSubmittingFileAction(true);
    try {
      const matched = certs.find(c => c.serialNumber?.toUpperCase() === parsedDetails.serialNumber?.toUpperCase());
      if (!matched) {
        showToast("Operation failed. Please try again.", "error");
        setSubmittingFileAction(false);
        return;
      }
      const isUserRole = user?.roles.includes('ROLE_USER') && !isAdmin && !isSuperAdmin;

      if (isUserRole) {
        await api.post('/api/requests/renew', {
          certificateId: matched.id,
          years: parseInt(renewYears, 10),
          caKeyId: renewCaKeyId ? parseInt(renewCaKeyId, 10) : null
        });
        showToast("Renewal request submitted successfully.", "success");
      } else {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('years', renewYears);
        if (renewCaKeyId) {
          formData.append('caKeyId', renewCaKeyId);
        }
        await api.post('/api/certificates/renew-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast("Certificate renewed successfully.", "success");
      }
      setIsFileRenewOpen(false);
      setUploadedFile(null);
      setParsedDetails(null);
      fetchCerts();
    } catch (err: any) {
      showToast("Operation failed. Please try again.", "error");
    } finally {
      setSubmittingFileAction(false);
    }
  };

  const triggerRequestRevokeModal = (cert: Certificate) => {
    setSelectedCertForRequestRevoke(cert);
    setIsRequestRevokeOpen(true);
  };

  const triggerRequestRenewModal = (cert: Certificate) => {
    setSelectedCertForRequestRenew(cert);
    setIsRequestRenewOpen(true);
  };

  const handleRequestRevoke = async () => {
    if (!selectedCertForRequestRevoke) return;
    try {
      await api.post('/api/requests/revoke', {
        certificateId: selectedCertForRequestRevoke.id,
        reason: revocationReason
      });
      showToast("Revocation request submitted successfully.", "success");
      setIsRequestRevokeOpen(false);
      setSelectedCertForRequestRevoke(null);
      fetchCerts();
    } catch (e: any) {
      showToast("Operation failed. Please try again.", "error");
    }
  };

  const handleRequestRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForRequestRenew) return;
    try {
      await api.post('/api/requests/renew', {
        certificateId: selectedCertForRequestRenew.id,
        years: parseInt(renewYears, 10),
        caKeyId: renewCaKeyId ? parseInt(renewCaKeyId, 10) : null
      });
      showToast("Renewal request submitted successfully.", "success");
      setIsRequestRenewOpen(false);
      setSelectedCertForRequestRenew(null);
      fetchCerts();
    } catch (e: any) {
      showToast("Operation failed. Please try again.", "error");
    }
  };

  const triggerDeleteModal = (cert: Certificate) => {
    setSelectedCertForDelete(cert);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCertForDelete) return;
    try {
      await api.delete(`/api/certificates/${selectedCertForDelete.id}`);
      showToast(`Certificate ${selectedCertForDelete.alias} deleted`, 'success');
      setIsDeleteOpen(false);
      setSelectedCertForDelete(null);
      fetchCerts();
    } catch (e: any) {
      showToast('Deletion failed', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn-secondary ${activeTab === 'my' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Certificates
          </button>
          {canSeeAll && (
            <button
              className={`btn-secondary ${activeTab === 'all' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Registry Certificates
            </button>
          )}
        </div>
        {!isAuditor && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canMakeSelfSigned && (
              <button className="btn-primary" style={{ backgroundColor: '#10B981' }} onClick={() => setIsSelfSignedOpen(true)}>
                Create Self-Signed Certificate
              </button>
            )}
            <button className="btn-primary" onClick={() => setIsImportOpen(true)}>
              Import External Certificate
            </button>
            <button className="btn-danger" onClick={() => { setUploadedFile(null); setParsedDetails(null); setIsFileRevokeOpen(true); }}>
              Revoke via File
            </button>
            <button className="btn-primary" style={{ backgroundColor: '#3B82F6' }} onClick={() => { setUploadedFile(null); setParsedDetails(null); setIsFileRenewOpen(true); }}>
              Renew via File
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex-center" style={{ height: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : certs.length === 0 ? (
          <div style={{ color: '#64748B', textAlign: 'center', padding: '3rem' }}>
            No active certificates found in this view context.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Serial Number</th>
                  <th>Alias Name</th>
                  <th>Subject DN</th>
                  <th>Issuer DN</th>
                  <th>Status</th>
                  <th>Validity Dates</th>
                  {!isAuditor && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => {
                  return (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td className="monospace-cell" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.serialNumber || 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>{c.alias}</span>
                          {c.type === 'HSM' && <span className="badge-hardware">HSM Secure</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.subjectDn}
                      </td>
                      <td style={{ fontSize: '0.75rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.issuerDn}
                      </td>
                      <td>
                        {c.status === 'REVOKED' ? (
                          <span className="badge badge-danger">Revoked</span>
                        ) : c.status === 'EXPIRED' ? (
                          <span className="badge badge-warning">Expired</span>
                        ) : (
                          <span className="badge badge-success">Active / Valid</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        Start: {c.notBefore ? c.notBefore.split('T')[0] : 'N/A'}<br />
                        End: {c.notAfter ? c.notAfter.split('T')[0] : 'N/A'}
                      </td>
                      {!isAuditor && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleExport(c)}>
                              Export
                            </button>
                            {c.status !== 'REVOKED' && (
                              <>
                                 {(isAdmin || isSuperAdmin) ? (
                                   <>
                                    {canRevokeRenew(c) && (
                                      <>
                                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRenewModal(c)}>
                                          Renew
                                        </button>
                                        <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRevocationModal(c)}>
                                          Revoke
                                        </button>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  (user?.roles.includes('ROLE_USER') && c.ownerId === user?.id) && (
                                    <>
                                      <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#3B82F6', color: 'white' }} onClick={() => triggerRequestRenewModal(c)}>
                                        Request Renewal
                                      </button>
                                      <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#F59E0B', color: 'white' }} onClick={() => triggerRequestRevokeModal(c)}>
                                        Request Revocation
                                      </button>
                                    </>
                                  )
                                )}
                              </>
                            )}
                            {isAdmin && (
                              <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#DC2626' }} onClick={() => triggerDeleteModal(c)}>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isImportOpen && (
        <div className="modal-overlay" onClick={() => setIsImportOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Import External Public Certificate</h3>
              <button className="toast-close" onClick={() => setIsImportOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleImport}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Keystore Alias Label</label>
                  <input
                    type="text"
                    value={importAlias}
                    onChange={(e) => setImportAlias(e.target.value)}
                    placeholder="e.g., external-partner-cert"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Or Select Certificate File (.crt / .pem / .cer)</label>
                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '0.375rem',
                      padding: '1rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(248, 250, 252, 0.05)',
                      cursor: 'pointer',
                      position: 'relative',
                      marginBottom: '1rem'
                    }}
                  >
                    <span>📄</span>
                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--text-primary)' }}>
                      Load Certificate from Disk
                    </span>
                    <input
                      type="file"
                      accept=".crt,.pem,.cer,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const text = event.target?.result as string;
                            setImportPem(text);
                            if (!importAlias) {
                              const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                              setImportAlias(nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-'));
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Raw Certificate Data (PEM Format)</label>
                  <textarea
                    value={importPem}
                    onChange={(e) => setImportPem(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----\nMIIF..."
                    style={{ height: '200px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsImportOpen(false)}>
                  Abort
                </button>
                <button type="submit" className="btn-primary" disabled={importing}>
                  {importing ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Import Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSelfSignedOpen && (
        <div className="modal-overlay" onClick={() => setIsSelfSignedOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Self-Signed Certificate</h3>
              <button className="toast-close" onClick={() => setIsSelfSignedOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateSelfSigned}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Key Pair</label>
                  <select value={selfSignedKeyId} onChange={(e) => setSelfSignedKeyId(e.target.value)} required>
                    <option value="">-- Choose Key Pair --</option>
                    {keys.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.alias} ({k.algorithm} &bull; {k.keySize} &bull; {k.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Certificate Alias</label>
                  <input
                    type="text"
                    value={selfSignedAlias}
                    onChange={(e) => setSelfSignedAlias(e.target.value)}
                    placeholder="e.g., self-signed-web-cert"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Common Name (CN)</label>
                  <input
                    type="text"
                    value={selfSignedCommonName}
                    onChange={(e) => setSelfSignedCommonName(e.target.value)}
                    placeholder="e.g., myserver.local"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Organization (O)</label>
                  <input
                    type="text"
                    value={selfSignedOrg}
                    onChange={(e) => setSelfSignedOrg(e.target.value)}
                    placeholder="e.g., Local Labs"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country (C)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={selfSignedCountry}
                    onChange={(e) => setSelfSignedCountry(e.target.value)}
                    placeholder="e.g., ET"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsSelfSignedOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={generatingSelfSigned}>
                  {generatingSelfSigned ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Generate Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRenewOpen && (
        <div className="modal-overlay" onClick={() => setIsRenewOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Renew Certificate Validity</h3>
              <button className="toast-close" onClick={() => setIsRenewOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRenew}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Extending the operational validity dates for alias <strong>{selectedCertForRenew?.alias}</strong>.
                </p>
                <div className="form-group">
                  <label>Signing CA Authority</label>
                  <select value={renewCaKeyId} onChange={(e) => setRenewCaKeyId(e.target.value)}>
                    <option value="">-- Defaults (Original CA) --</option>
                    {cas.map((ca) => (
                      <option key={ca.id} value={ca.id}>
                        {ca.alias} ({ca.commonName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Additional Validity Duration (Years)</label>
                  <select value={renewYears} onChange={(e) => setRenewYears(e.target.value)}>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsRenewOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={renewing}>
                  {renewing ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Execute Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={isRevokeOpen}
        title="🔒 Revoke Certificate — Confirm Authority"
        body={
          <div>
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem',
              fontSize: '0.82rem',
              color: '#DC2626',
              marginBottom: '1.25rem',
            }}>
              ⚠️ <strong>High-risk operation.</strong> Revoking <strong>{selectedCertForRevoke?.alias}</strong> will permanently publish this serial number to the CRL and cannot be undone.
            </div>
            <div className="form-group">
              <label>Reason Code (RFC 5280)</label>
              <select value={revocationReason} onChange={(e) => setRevocationReason(e.target.value)}>
                <option value="0">Unspecified (0)</option>
                <option value="1">Key Compromise (1)</option>
                <option value="2">CA Compromise (2)</option>
                <option value="3">Affiliation Changed (3)</option>
                <option value="4">Superseded (4)</option>
                <option value="5">Cessation of Operation (5)</option>
                <option value="6">Certificate Hold (6)</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ color: '#DC2626', fontWeight: 700 }}>
                🔑 Your Login Password (required to authorize revocation)
              </label>
              <input
                id="revoker-password-input"
                type="password"
                value={revokerPassword}
                onChange={(e) => setRevokerPassword(e.target.value)}
                placeholder="Enter your login password to confirm"
                autoComplete="current-password"
                required
                style={{ borderColor: revokerPassword ? 'var(--border-color)' : '#EF4444' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                This is your own login password — not the certificate password.
              </div>
            </div>
          </div>
        }
        confirmText={revoking ? 'Revoking...' : 'Revoke Certificate'}
        cancelText="Abort"
        onClose={() => { setIsRevokeOpen(false); setRevokerPassword(''); }}
        onConfirm={handleRevoke}
        confirmValidationText={selectedCertForRevoke?.alias}
      />


      <Modal
        isOpen={isDeleteOpen}
        title="Confirm Certificate Deletion"
        body={
          <p>
            Are you sure you want to permanently delete certificate <strong>{selectedCertForDelete?.alias}</strong>? This action cannot be undone.
          </p>
        }
        confirmText="Delete Certificate"
        cancelText="Abort"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        confirmValidationText={selectedCertForDelete?.alias}
      />

      {isFileRevokeOpen && (
        <div className="modal-overlay" onClick={() => setIsFileRevokeOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Revoke Certificate via File</h3>
              <button className="toast-close" onClick={() => setIsFileRevokeOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleFileRevoke}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Certificate File (.pem, .crt, .cer)</label>
                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '0.375rem',
                      padding: '1.5rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(248, 250, 252, 0.05)',
                      cursor: 'pointer',
                      position: 'relative',
                      marginBottom: '1rem'
                    }}
                  >
                    <span>📄</span>
                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--text-primary)' }}>
                      {uploadedFile ? uploadedFile.name : 'Load Certificate from Disk'}
                    </span>
                    <input
                      type="file"
                      accept=".crt,.pem,.cer"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      required
                    />
                  </div>
                </div>

                {parsingFile && (
                  <div className="flex-center" style={{ padding: '1rem' }}>
                    <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>Parsing certificate file...</span>
                  </div>
                )}

                {parsedDetails && (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(248, 250, 252, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    lineHeight: '1.5'
                  }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Extracted Certificate Details</h4>
                    <strong>Subject DN:</strong> {parsedDetails.subjectDn}<br />
                    <strong>Issuer DN:</strong> {parsedDetails.issuerDn}<br />
                    <strong>Serial Number:</strong> <span className="monospace-cell">{parsedDetails.serialNumber}</span><br />
                    <strong>Valid From:</strong> {parsedDetails.notBefore ? new Date(parsedDetails.notBefore).toLocaleDateString() : 'N/A'}<br />
                    <strong>Valid Until:</strong> {parsedDetails.notAfter ? new Date(parsedDetails.notAfter).toLocaleDateString() : 'N/A'}
                  </div>
                )}

                <div className="form-group">
                  <label>Reason Code (RFC 5280)</label>
                  <select value={revocationReason} onChange={(e) => setRevocationReason(e.target.value)}>
                    <option value="0">Unspecified (0)</option>
                    <option value="1">Key Compromise (1)</option>
                    <option value="2">CA Compromise (2)</option>
                    <option value="3">Affiliation Changed (3)</option>
                    <option value="4">Superseded (4)</option>
                    <option value="5">Cessation of Operation (5)</option>
                    <option value="6">Certificate Hold (6)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsFileRevokeOpen(false)}>
                  Abort
                </button>
                <button type="submit" className="btn-danger" disabled={!uploadedFile || parsingFile || submittingFileAction}>
                  {submittingFileAction ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}>
                  </div> : (
                    (user?.roles.includes('ROLE_USER') && !isAdmin && !isSuperAdmin) 
                      ? 'Submit Revocation Request' 
                      : 'Revoke Certificate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFileRenewOpen && (
        <div className="modal-overlay" onClick={() => setIsFileRenewOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Renew Certificate via File</h3>
              <button className="toast-close" onClick={() => setIsFileRenewOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleFileRenew}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Certificate File (.crt, .pem, .cer)</label>
                  <div
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '0.375rem',
                      padding: '1.5rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(248, 250, 252, 0.05)',
                      cursor: 'pointer',
                      position: 'relative',
                      marginBottom: '1rem'
                    }}
                  >
                    <span>📄</span>
                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--text-primary)' }}>
                      {uploadedFile ? uploadedFile.name : 'Load Certificate from Disk'}
                    </span>
                    <input
                      type="file"
                      accept=".crt,.pem,.cer"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                      required
                    />
                  </div>
                </div>

                {parsingFile && (
                  <div className="flex-center" style={{ padding: '1rem' }}>
                    <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>Parsing certificate file...</span>
                  </div>
                )}

                {parsedDetails && (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(248, 250, 252, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem',
                    fontSize: '0.8rem',
                    lineHeight: '1.5'
                  }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Extracted Certificate Details</h4>
                    <strong>Subject DN:</strong> {parsedDetails.subjectDn}<br />
                    <strong>Issuer DN:</strong> {parsedDetails.issuerDn}<br />
                    <strong>Serial Number:</strong> <span className="monospace-cell">{parsedDetails.serialNumber}</span><br />
                    <strong>Valid From:</strong> {parsedDetails.notBefore ? new Date(parsedDetails.notBefore).toLocaleDateString() : 'N/A'}<br />
                    <strong>Valid Until:</strong> {parsedDetails.notAfter ? new Date(parsedDetails.notAfter).toLocaleDateString() : 'N/A'}
                  </div>
                )}

                <div className="form-group">
                  <label>Signing CA Authority</label>
                  <select value={renewCaKeyId} onChange={(e) => setRenewCaKeyId(e.target.value)}>
                    <option value="">-- Defaults (Original CA) --</option>
                    {cas.map((ca) => (
                      <option key={ca.id} value={ca.id}>
                        {ca.alias} ({ca.commonName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Additional Validity Duration (Years)</label>
                  <select value={renewYears} onChange={(e) => setRenewYears(e.target.value)}>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsFileRenewOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={!uploadedFile || parsingFile || submittingFileAction}>
                  {submittingFileAction ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}>
                  </div> : (
                    (user?.roles.includes('ROLE_USER') && !isAdmin && !isSuperAdmin) 
                      ? 'Submit Renewal Request' 
                      : 'Execute Renewal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Modal
        isOpen={isRequestRevokeOpen}
        title="Submit Revocation Request"
        body={
          <div>
            <p style={{ marginBottom: '1rem' }}>
              You are requesting the revocation of certificate <strong>{selectedCertForRequestRevoke?.alias}</strong> (Serial: {selectedCertForRequestRevoke?.serialNumber}). This will be sent to the system administrators for approval.
            </p>
            <div className="form-group">
              <label>Reason Code (RFC 5280)</label>
              <select value={revocationReason} onChange={(e) => setRevocationReason(e.target.value)}>
                <option value="0">Unspecified (0)</option>
                <option value="1">Key Compromise (1)</option>
                <option value="2">CA Compromise (2)</option>
                <option value="3">Affiliation Changed (3)</option>
                <option value="4">Superseded (4)</option>
                <option value="5">Cessation of Operation (5)</option>
                <option value="6">Certificate Hold (6)</option>
              </select>
            </div>
          </div>
        }
        confirmText="Submit Request"
        cancelText="Cancel"
        onClose={() => setIsRequestRevokeOpen(false)}
        onConfirm={handleRequestRevoke}
      />

      {isRequestRenewOpen && (
        <div className="modal-overlay" onClick={() => setIsRequestRenewOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Certificate Renewal</h3>
              <button className="toast-close" onClick={() => setIsRequestRenewOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRequestRenew}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Requesting a validity extension for certificate <strong>{selectedCertForRequestRenew?.alias}</strong>. This request requires administrator review.
                </p>
                <div className="form-group">
                  <label>Signing CA Authority</label>
                  <select value={renewCaKeyId} onChange={(e) => setRenewCaKeyId(e.target.value)}>
                    <option value="">-- Defaults (Original CA) --</option>
                    {cas.map((ca) => (
                      <option key={ca.id} value={ca.id}>
                        {ca.alias} ({ca.commonName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Validity Duration (Years)</label>
                  <select value={renewYears} onChange={(e) => setRenewYears(e.target.value)}>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="5">5 Years</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsRequestRenewOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Renewal Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
