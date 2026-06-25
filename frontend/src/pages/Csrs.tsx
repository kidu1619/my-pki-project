import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface CsrItem {
  id: number;
  internalName: string;
  csrPem: string;
  commonName?: string;
  ownerId?: number;
  keyId?: number;
  status: string; // PENDING | SIGNED | REJECTED
  submittedAt?: string;
  resolvedAt?: string;
  rejectionReason?: string;
  signedCertificateId?: number;
}

interface KeyPair {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  type: string;
}

interface CaItem {
  id: number;
  alias: string;
  subject?: string;
  type: string;
}

const Step: React.FC<{ label: string; done?: boolean; active?: boolean }> = ({ label, done, active }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: 600,
    backgroundColor: done ? 'rgba(16,185,129,0.15)' : active ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.1)',
    color: done ? '#059669' : active ? '#2563EB' : '#64748B',
    border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : active ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.2)'}`,
    whiteSpace: 'nowrap',
  }}>
    {done ? '✓ ' : active ? '● ' : '○ '}{label}
  </span>
);

const Arrow: React.FC = () => (
  <span style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>→</span>
);

export const Csrs: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN') || false;

  const [myCsrs, setMyCsrs] = useState<CsrItem[]>([]);
  const [pendingQueue, setPendingQueue] = useState<CsrItem[]>([]);
  const [keys, setKeys] = useState<KeyPair[]>([]);
  const [cas, setCas] = useState<CaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'mycsrs' | 'queue'>('generate');

  // Generate form fields
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [internalName, setInternalName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [organization, setOrganization] = useState('');
  const [orgUnit, setOrgUnit] = useState('');
  const [country, setCountry] = useState('ET');
  const [state, setState] = useState('');
  const [locality, setLocality] = useState('');
  const [reason, setReason] = useState('');
  const [excludedFields, setExcludedFields] = useState<string[]>([]);
  const [generatedPem, setGeneratedPem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // CA Operator: sign
  const [selectedForSign, setSelectedForSign] = useState<CsrItem | null>(null);
  const [signingCaAlias, setSigningCaAlias] = useState('');
  const [signing, setSigning] = useState(false);
  const [operatorPassword, setOperatorPassword] = useState('');
  const [validityYears, setValidityYears] = useState('1');
  const [pathLengthConstraint, setPathLengthConstraint] = useState('');

  // CA Operator: reject
  const [selectedForReject, setSelectedForReject] = useState<CsrItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, casRes, myRes] = await Promise.all([
        api.get('/api/keys'),
        api.get('/api/ca'),
        api.get('/api/csr/my'),
      ]);
      setKeys(keysRes.data);
      if (keysRes.data.length > 0) setSelectedKeyId(keysRes.data[0].id.toString());

      // Feature 5: Filter ROOT_CA out of the signing dropdown
      const eligibleCas = casRes.data.filter((c: CaItem) => c.type !== 'ROOT_CA');
      setCas(eligibleCas);
      if (eligibleCas.length > 0) setSigningCaAlias(eligibleCas[0].alias);

      setMyCsrs(myRes.data);

      if (isAdmin) {
        const pendingRes = await api.get('/api/csr/pending');
        setPendingQueue(pendingRes.data);
      }
    } catch {
      showToast('Error loading CSR portal data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateCsr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyId) { showToast('Please select a private key', 'error'); return; }
    setSubmitting(true);
    try {
      const response = await api.post('/api/csr/generate', {
        keyId: parseInt(selectedKeyId, 10),
        internalName, commonName, organization,
        organizationalUnit: orgUnit, country, state,
        locality, reason, excludedFields
      });
      setGeneratedPem(response.data);
      showToast('CSR submitted. Status: PENDING — a CA Operator will review it.', 'success');
      setInternalName(''); setCommonName(''); setOrganization(''); setOrgUnit(''); setState(''); setLocality(''); setReason(''); setExcludedFields([]);
      fetchData();
      setActiveTab('mycsrs');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'CSR generation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignCsr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForSign || !signingCaAlias) return;
    setSigning(true);
    try {
      await api.post(`/api/csr/${selectedForSign.id}/sign`, { 
        caAlias: signingCaAlias,
        operatorPassword,
        validityYears: parseInt(validityYears, 10) || 1,
        pathLengthConstraint: pathLengthConstraint ? parseInt(pathLengthConstraint, 10) : null
      });
      showToast(`CSR "${selectedForSign.commonName}" signed — certificate issued!`, 'success');
      setSelectedForSign(null);
      setOperatorPassword('');
      setValidityYears('1');
      setPathLengthConstraint('');
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || (typeof e.response?.data === 'string' ? e.response.data : 'Signing failed'), 'error');
    } finally {
      setSigning(false);
    }
  };

  const handleRejectCsr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForReject) return;
    setRejecting(true);
    try {
      await api.post(`/api/csr/${selectedForReject.id}/reject`, { reason: rejectReason });
      showToast(`CSR "${selectedForReject.commonName}" rejected.`, 'success');
      setSelectedForReject(null);
      setRejectReason('');
      fetchData();
    } catch (e: any) {
      showToast(e.response?.data?.message || (typeof e.response?.data === 'string' ? e.response.data : 'Rejection failed'), 'error');
    } finally {
      setRejecting(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':  return <span className="badge badge-warning">⏳ Pending</span>;
      case 'SIGNED':   return <span className="badge badge-success">✅ Signed</span>;
      case 'REJECTED': return <span className="badge badge-danger">❌ Rejected</span>;
      default:         return <span className="badge badge-info">{status}</span>;
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '400px' }}><div className="spinner"></div></div>
  );

  return (
    <div>

      {/* ── CSR Workflow Banner ── */}
      <div style={{
        background: isAdmin
          ? 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.08) 100%)',
        border: `1px solid ${isAdmin ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.2)'}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isAdmin ? '#7C3AED' : '#059669', marginBottom: '0.6rem' }}>
          {isAdmin ? '🔐 CA Operator — CSR Review Flow' : '📄 User — CSR Request Flow'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <>
              <Step label="1. User submits CSR" done />
              <Arrow />
              <Step label="2. CSR enters Pending Queue" done />
              <Arrow />
              <Step label="3. You review &amp; Sign / Reject" active />
              <Arrow />
              <Step label="4. Certificate issued (if signed)" />
            </>
          ) : (
            <>
              <Step label="1. Generate a Key Pair" done={keys.length > 0} />
              <Arrow />
              <Step label="2. Submit this CSR" active={activeTab === 'generate'} />
              <Arrow />
              <Step label="3. Wait for CA Operator approval" active={activeTab === 'mycsrs'} />
              <Arrow />
              <Step label="4. Download signed Certificate" />
            </>
          )}
        </div>
        {!isAdmin && keys.length === 0 && (
          <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#EF4444', fontWeight: 500 }}>
            ⚠️ You have no key pairs yet. Go to <strong>🔑 Key Generator</strong> first, then come back to submit a CSR.
          </div>
        )}
      </div>
      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={activeTab === 'generate' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('generate')}>
          Generate CSR
        </button>
        <button className={activeTab === 'mycsrs' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('mycsrs')}>
          My Requests ({myCsrs.length})
        </button>
        {isAdmin && (
          <button
            className={activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('queue')}
            style={{ position: 'relative' }}
          >
            CA Operator Queue ({pendingQueue.length})
            {pendingQueue.length > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                backgroundColor: '#EF4444', color: 'white', borderRadius: '50%',
                padding: '0.15rem 0.4rem', fontSize: '0.65rem', fontWeight: 700
              }}>{pendingQueue.length}</span>
            )}
          </button>
        )}
      </div>

      {/* ── GENERATE TAB ── */}
      {activeTab === 'generate' && (
        <div className="card" style={{ maxWidth: '680px' }}>
          <h3 className="card-title">CSR Generation Wizard</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Your CSR will be submitted with status <strong>PENDING</strong>. A CA Operator will sign or reject it.
          </p>
          <form onSubmit={handleGenerateCsr}>
            <div className="form-group">
              <label>Select Key Pair</label>
              <select value={selectedKeyId} onChange={(e) => setSelectedKeyId(e.target.value)}>
                {keys.length === 0
                  ? <option disabled>No keys available — generate a key first</option>
                  : keys.map((k) => <option key={k.id} value={k.id}>{k.alias} ({k.algorithm} {k.keySize}) [{k.type}]</option>)
                }
              </select>
            </div>
            <div className="form-group">
              <label>Internal Reference Name</label>
              <input type="text" value={internalName} onChange={(e) => setInternalName(e.target.value)} placeholder="e.g., insa-intranet-csr" required />
            </div>
            <div className="form-group">
              <label>Common Name (CN)</label>
              <input type="text" value={commonName} onChange={(e) => setCommonName(e.target.value)} placeholder="e.g., mail.insa.gov.et" required />
            </div>
            <div className="form-group">
              <label>Organization (O)</label>
              <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g., INSA Group" required />
            </div>
            <div className="form-group">
              <label>Organizational Unit (OU)</label>
              <input type="text" value={orgUnit} onChange={(e) => setOrgUnit(e.target.value)} placeholder="e.g., PKI Division" />
            </div>
            <div className="grid-2" style={{ gap: '1rem', margin: 0 }}>
              <div className="form-group">
                <label>Country Code (C)</label>
                <input type="text" maxLength={2} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="ET" required={!excludedFields.includes('C')} disabled={excludedFields.includes('C')} />
              </div>
              <div className="form-group">
                <label>State / Province (ST)</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Addis Ababa" disabled={excludedFields.includes('ST')} />
              </div>
            </div>
            <div className="form-group">
              <label>Locality / City (L)</label>
              <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="e.g., Addis Ababa" disabled={excludedFields.includes('L')} />
            </div>
            <div className="form-group">
              <label>Reason for CSR Generation</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Email Encryption, Code Signing" required />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: '0.5rem', display: 'block' }}>Exclude Fields from CSR</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                {['O', 'OU', 'C', 'ST', 'L'].map(field => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={excludedFields.includes(field)} 
                      onChange={(e) => {
                        if (e.target.checked) setExcludedFields([...excludedFields, field]);
                        else setExcludedFields(excludedFields.filter(f => f !== field));
                      }} 
                    />
                    Exclude {field}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Generate & Submit CSR'}
            </button>
          </form>
          {generatedPem && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Generated PEM Block:</h4>
              <textarea readOnly value={generatedPem} className="pem-container" style={{ width: '100%', height: '160px', resize: 'none' }} />
              <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(generatedPem); showToast('Copied!', 'success'); }} style={{ width: '100%', marginTop: '0.75rem' }}>
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MY REQUESTS TAB ── */}
      {activeTab === 'mycsrs' && (
        <div className="card">
          <h3 className="card-title">My CSR Requests</h3>
          {myCsrs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No requests yet. Generate a CSR to get started.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myCsrs.map((csr) => (
                <div key={csr.id} style={{
                  padding: '1rem', border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem', backgroundColor: 'var(--bg-surface)',
                  borderLeft: `4px solid ${csr.status === 'SIGNED' ? '#10B981' : csr.status === 'REJECTED' ? '#EF4444' : '#F59E0B'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{csr.internalName}</strong>
                    {statusBadge(csr.status)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>CN:</strong> {csr.commonName || 'N/A'} &bull; <strong>CSR ID:</strong> {csr.id}
                    {csr.signedCertificateId && (
                      <> &bull; <strong style={{ color: '#10B981' }}>Certificate ID: {csr.signedCertificateId} — check Certificates page</strong></>
                    )}
                    {csr.rejectionReason && (
                      <div style={{ color: '#EF4444', marginTop: '0.25rem' }}>
                        <strong>Rejection Reason:</strong> {csr.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CA OPERATOR QUEUE TAB ── */}
      {activeTab === 'queue' && isAdmin && (
        <div className="card">
          <h3 className="card-title">CA Operator — Pending Signing Queue</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Review and sign or reject certificate requests. <strong style={{ color: '#F59E0B' }}>Root CA is excluded from signing by policy.</strong>
          </p>
          {pendingQueue.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>✅ Queue is clear — no pending requests.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {pendingQueue.map((item) => (
                <div key={item.id} style={{
                  padding: '1.25rem', border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem', backgroundColor: 'var(--bg-surface)',
                  borderLeft: '4px solid #F59E0B'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.internalName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        CN: {item.commonName || 'N/A'} &bull; CSR ID: {item.id} &bull; Owner ID: {item.ownerId || 'N/A'}
                      </div>
                    </div>
                    {statusBadge(item.status)}
                  </div>
                  <textarea readOnly value={item.csrPem} style={{
                    fontSize: '0.72rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-canvas)',
                    padding: '0.5rem', borderRadius: '0.25rem', color: 'var(--text-secondary)',
                    height: '70px', width: '100%', resize: 'none', border: '1px solid var(--border-color)', marginBottom: '0.75rem'
                  }} />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', color: '#EF4444' }}
                      onClick={() => { setSelectedForReject(item); setRejectReason(''); }}
                    >
                      Reject
                    </button>
                    <button
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                      onClick={() => {
                        setSelectedForSign(item);
                        setOperatorPassword('');
                        setValidityYears('1');
                        setPathLengthConstraint('');
                      }}
                    >
                      ✓ Sign & Issue Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SIGN MODAL ── */}
      {selectedForSign && (
        <div className="modal-overlay" onClick={() => setSelectedForSign(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Sign CSR — {selectedForSign.commonName}</h3>
              <button className="toast-close" onClick={() => setSelectedForSign(null)}>&times;</button>
            </div>
            <form onSubmit={handleSignCsr}>
              <div className="modal-body">
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <strong>Reference:</strong> {selectedForSign.internalName}<br />
                  <strong>CN:</strong> {selectedForSign.commonName || 'N/A'}<br />
                  <strong>CSR ID:</strong> {selectedForSign.id} &bull; <strong>Owner ID:</strong> {selectedForSign.ownerId || 'N/A'}
                </div>
                <div className="form-group">
                  <label>
                    Select Signing CA &nbsp;
                    <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 400 }}>
                      (Root CA excluded by PKI policy — only Intermediate / Issuing CAs shown)
                    </span>
                  </label>
                  <select value={signingCaAlias} onChange={(e) => setSigningCaAlias(e.target.value)} required>
                    {cas.length === 0
                      ? <option disabled>No eligible signing CAs — create an Intermediate or Issuing CA first</option>
                      : cas.map((ca) => (
                          <option key={ca.id} value={ca.alias}>{ca.alias} [{ca.type}]</option>
                        ))
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label>Validity (Years)</label>
                  <input type="number" min="1" max="100" value={validityYears} onChange={(e) => setValidityYears(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Path Length Constraint (Optional)</label>
                  <input type="number" min="0" max="10" value={pathLengthConstraint} onChange={(e) => setPathLengthConstraint(e.target.value)} placeholder="e.g., 0 for end-entity" />
                </div>
                <div className="form-group">
                  <label>Operator Password</label>
                  <input type="password" value={operatorPassword} onChange={(e) => setOperatorPassword(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setSelectedForSign(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={signing || cas.length === 0}>
                  {signing
                    ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    : 'Sign & Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {selectedForReject && (
        <div className="modal-overlay" onClick={() => setSelectedForReject(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject CSR — {selectedForReject.commonName}</h3>
              <button className="toast-close" onClick={() => setSelectedForReject(null)}>&times;</button>
            </div>
            <form onSubmit={handleRejectCsr}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Rejection Reason &nbsp;
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>(will be shown to the user)</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., CN does not match the registered domain. Please resubmit."
                    style={{ height: '100px', resize: 'vertical' }}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setSelectedForReject(null)}>Cancel</button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
                  disabled={rejecting}
                >
                  {rejecting
                    ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
