import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface RecoveryRequest {
  id: number;
  escrowId: number;
  requestedBy: string;
  justification: string;
  status: string;
  superAdminUsername?: string;
  caOperatorUsername?: string;
  requestedAt: string;
  completedAt?: string;
}

interface KeyItem {
  id: number;
  alias: string;
  algorithm: string;
  keySize: string;
  purpose?: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, { bg: string; color: string }> = {
    PENDING_SUPER_ADMIN: { bg: '#FEF3C7', color: '#92400E' },
    PENDING_CA_OPERATOR: { bg: '#FEF3C7', color: '#92400E' },
    PENDING_AGENT: { bg: '#E0E7FF', color: '#3730A3' },
    COMPLETED: { bg: '#D1FAE5', color: '#065F46' },
    REJECTED: { bg: '#FEE2E2', color: '#7F1D1D' },
  };
  const c = colorMap[status] || { bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 700,
      backgroundColor: c.bg,
      color: c.color,
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export const EscrowRequest: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;
  const isAdmin = user?.roles.includes('ROLE_ADMIN') || false;

  const [activeTab, setActiveTab] = useState<'request' | 'status' | 'verify'>('status');
  const [myRequests, setMyRequests] = useState<RecoveryRequest[]>([]);
  const [allRequests, setAllRequests] = useState<RecoveryRequest[]>([]);
  const [myKeys, setMyKeys] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Request form
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Verification form (Super Admin / CA Operator)
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/escrow/my-requests');
      setMyRequests(r.data);
    } catch {
      showToast('Failed to fetch your requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const r = await api.get('/api/escrow/recovery-requests');
      setAllRequests(r.data);
    } catch {}
  };

  const fetchMyKeys = async () => {
    try {
      const r = await api.get('/api/keys');
      setMyKeys(r.data);
    } catch {}
  };

  useEffect(() => {
    fetchMyRequests();
    fetchMyKeys();
    if (isSuperAdmin || isAdmin) {
      fetchAllRequests();
      setActiveTab('verify');
    }
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKeyId) { showToast('Select a key', 'error'); return; }
    if (!justification.trim()) { showToast('Justification is required', 'error'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/escrow/${selectedKeyId}/request-recovery`, { justification });
      showToast('Recovery request submitted successfully', 'success');
      setSelectedKeyId('');
      setJustification('');
      fetchMyRequests();
      setActiveTab('status');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySuperAdmin = async (requestId: number) => {
    if (!verifyPassword) { showToast('Enter your password', 'error'); return; }
    setVerifying(true);
    try {
      await api.post(`/api/escrow/recovery-requests/${requestId}/verify-super-admin`, { password: verifyPassword });
      showToast('Super Admin verification complete', 'success');
      setVerifyPassword('');
      setVerifyingId(null);
      fetchAllRequests();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Verification failed — check your password', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyCaOperator = async (requestId: number) => {
    if (!verifyPassword) { showToast('Enter your password', 'error'); return; }
    setVerifying(true);
    try {
      await api.post(`/api/escrow/recovery-requests/${requestId}/verify-ca-operator`, { password: verifyPassword });
      showToast('CA Operator verification complete', 'success');
      setVerifyPassword('');
      setVerifyingId(null);
      fetchAllRequests();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Verification failed — check your password', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async (requestId: number) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;
    try {
      await api.post(`/api/escrow/recovery-requests/${requestId}/reject`, { reason });
      showToast('Request rejected', 'success');
      fetchAllRequests();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Rejection failed', 'error');
    }
  };

  const pendingSuperAdminRequests = allRequests.filter(r => r.status === 'PENDING_SUPER_ADMIN');
  const pendingCaOperatorRequests = allRequests.filter(r => r.status === 'PENDING_CA_OPERATOR');

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 60%, #0891B2 100%)',
        borderRadius: '0.75rem',
        padding: '1.25rem 2rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>
            🔑 Key Recovery
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            Request recovery of lost private keys or approve pending requests
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isSuperAdmin && pendingSuperAdminRequests.length > 0 && (
            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.3)', color: '#FDE68A', border: '1px solid #F59E0B' }}>
              {pendingSuperAdminRequests.length} awaiting your approval
            </span>
          )}
          {isAdmin && pendingCaOperatorRequests.length > 0 && (
            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.3)', color: '#FDE68A', border: '1px solid #F59E0B' }}>
              {pendingCaOperatorRequests.length} awaiting CA approval
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(isSuperAdmin || isAdmin) && (
          <button
            className={activeTab === 'verify' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => { setActiveTab('verify'); fetchAllRequests(); }}
            style={{ position: 'relative' }}
          >
            🛡️ Verify Requests
            {(pendingSuperAdminRequests.length + pendingCaOperatorRequests.length) > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#EF4444', color: 'white', borderRadius: '50%', padding: '0.15rem 0.4rem', fontSize: '0.65rem', fontWeight: 700 }}>
                {isSuperAdmin ? pendingSuperAdminRequests.length : pendingCaOperatorRequests.length}
              </span>
            )}
          </button>
        )}
        <button
          className={activeTab === 'request' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('request')}
        >
          📝 Request Recovery
        </button>
        <button
          className={activeTab === 'status' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => { setActiveTab('status'); fetchMyRequests(); }}
        >
          📊 My Requests
        </button>
      </div>

      {/* === VERIFY TAB (Super Admin + CA Operator) === */}
      {activeTab === 'verify' && (isSuperAdmin || isAdmin) && (
        <div>
          {isSuperAdmin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.25rem', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.75rem' }}>
                  SUPER ADMIN
                </span>
                Requests Awaiting Your Verification ({pendingSuperAdminRequests.length})
              </div>
              {pendingSuperAdminRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ✅ No requests pending your approval.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingSuperAdminRequests.map(req => (
                    <div key={req.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>Request #{req.id} — Key: {(req as any).keyAlias || `Escrow ID: ${req.escrowId}`}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Submitted by <strong>{req.requestedBy}</strong> on {new Date(req.requestedAt).toLocaleString()}
                            {(req as any).keyAlgorithm && <> · {(req as any).keyAlgorithm} ({(req as any).keySize})</>}
                          </div>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                      <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: '0.375rem', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <strong>Business Justification:</strong> {req.justification}
                      </div>

                      {verifyingId === req.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="password"
                            placeholder="Your Super Admin password"
                            value={verifyPassword}
                            onChange={e => setVerifyPassword(e.target.value)}
                            style={{ flex: 1, marginBottom: 0 }}
                          />
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', whiteSpace: 'nowrap' }}
                            disabled={verifying}
                            onClick={() => handleVerifySuperAdmin(req.id)}
                          >
                            {verifying ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '✅ Verify & Approve'}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                            onClick={() => { setVerifyingId(null); setVerifyPassword(''); }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                            onClick={() => { setVerifyingId(req.id); setVerifyPassword(''); }}
                          >
                            🛡️ Verify Identity & Approve
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', color: '#EF4444' }}
                            onClick={() => handleReject(req.id)}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '0.25rem', backgroundColor: '#DBEAFE', color: '#1E3A8A', fontSize: '0.75rem' }}>
                  CA OPERATOR
                </span>
                Requests Awaiting CA Operator Verification ({pendingCaOperatorRequests.length})
              </div>
              {pendingCaOperatorRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ✅ No requests awaiting CA Operator approval.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingCaOperatorRequests.map(req => (
                    <div key={req.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>Request #{req.id} — Key: {(req as any).keyAlias || `Escrow ID: ${req.escrowId}`}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Submitted by <strong>{req.requestedBy}</strong>
                            {req.superAdminUsername && <> · Super Admin approved: <strong>{req.superAdminUsername}</strong></>}
                            {(req as any).keyAlgorithm && <> · {(req as any).keyAlgorithm} ({(req as any).keySize})</>}
                          </div>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                      <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: '0.375rem', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <strong>Business Justification:</strong> {req.justification}
                      </div>

                      {verifyingId === req.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="password"
                            placeholder="Your CA Operator password"
                            value={verifyPassword}
                            onChange={e => setVerifyPassword(e.target.value)}
                            style={{ flex: 1, marginBottom: 0 }}
                          />
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', whiteSpace: 'nowrap' }}
                            disabled={verifying}
                            onClick={() => handleVerifyCaOperator(req.id)}
                          >
                            {verifying ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : '✅ Verify & Approve'}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                            onClick={() => { setVerifyingId(null); setVerifyPassword(''); }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                            onClick={() => { setVerifyingId(req.id); setVerifyPassword(''); }}
                          >
                            🛡️ Verify Identity & Approve
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', color: '#EF4444' }}
                            onClick={() => handleReject(req.id)}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* === REQUEST TAB === */}
      {activeTab === 'request' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">📝 Submit Key Recovery Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              If you have lost access to your private key, submit a recovery request. A dual-authority approval process will be triggered. Both a Super Admin and a CA Operator must approve before the Key Escrow Agent can recover your key.
            </p>
            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label>Select Key to Recover</label>
                <select value={selectedKeyId} onChange={e => setSelectedKeyId(e.target.value)} required>
                  <option value="">— Select a key —</option>
                  {myKeys.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.alias} ({k.algorithm} {k.keySize}) — ID: {k.id}
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Only escrowed keys can be recovered. HSM keys and DS-purpose keys are not escrowed.
                </small>
              </div>
              <div className="form-group">
                <label>Business Justification <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="Explain why you need this private key recovered. This will be reviewed by both the Super Admin and CA Operator before approval."
                  style={{ height: '120px', lineHeight: 1.6 }}
                  required
                  minLength={20}
                />
                <small style={{ color: justification.length < 20 ? '#EF4444' : 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {justification.length}/20 minimum characters
                </small>
              </div>
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(99,102,241,0.06)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(99,102,241,0.15)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                lineHeight: 1.6,
              }}>
                ⚠️ Your request and justification will be permanently logged in the audit trail. False justifications may result in account suspension.
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting || justification.length < 20}>
                {submitting
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Submitting...
                    </span>
                  : '🔑 Submit Recovery Request'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--text-primary)' }}>📋 Recovery Process Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { step: '1', icon: '📝', label: 'You submit a recovery request', desc: 'Provide your key ID and a valid business justification for why you need the key recovered.' },
                { step: '2', icon: '🛡️', label: 'Super Admin verifies', desc: 'The Super Admin reviews your request and enters their password, decrypting their share of the master key.' },
                { step: '3', icon: '🔒', label: 'CA Operator verifies', desc: 'The CA Operator independently verifies and enters their password, decrypting their share.' },
                { step: '4', icon: '🔑', label: 'Key Escrow Agent recovers', desc: 'The escrow agent uses both shares to reconstruct the master key and decrypt your private key — returned as PEM.' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === STATUS TAB === */}
      {activeTab === 'status' && (
        <div>
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}><div className="spinner" /></div>
          ) : myRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No recovery requests yet</div>
              <div style={{ fontSize: '0.85rem' }}>
                If you've lost your private key, use the <strong>Request Recovery</strong> tab to submit a request.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myRequests.map(req => (
                <div key={req.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        Recovery Request #{req.id} — Key: {(req as any).keyAlias || `Escrow ID: ${req.escrowId}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Key Escrow ID: {req.escrowId} · Submitted: {new Date(req.requestedAt).toLocaleString()}
                        {(req as any).keyAlgorithm && <> · {(req as any).keyAlgorithm} ({(req as any).keySize})</>}
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(99,102,241,0.05)',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.75rem',
                  }}>
                    {req.justification}
                  </div>

                  {/* Timeline */}
                  {req.status !== 'REJECTED' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Approval Progress
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {[
                          { label: 'Submitted', done: true },
                          { label: 'Super Admin', done: !!req.superAdminUsername },
                          { label: 'CA Operator', done: !!req.caOperatorUsername },
                          { label: 'Recovered', done: req.status === 'COMPLETED' },
                        ].map((s, i, arr) => (
                          <React.Fragment key={i}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                backgroundColor: s.done ? '#10B981' : 'var(--border-color)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6rem', fontWeight: 700,
                              }}>
                                {s.done ? '✓' : i + 1}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: s.done ? '#10B981' : 'var(--text-muted)', fontWeight: s.done ? 600 : 400 }}>
                                {s.label}
                              </div>
                            </div>
                            {i < arr.length - 1 && (
                              <div style={{ flex: 1, height: '2px', backgroundColor: s.done ? '#10B981' : 'var(--border-color)', marginBottom: '1rem' }} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {req.status === 'REJECTED' && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FEE2E2', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#7F1D1D', border: '1px solid #FCA5A5' }}>
                      ✕ This request was rejected. Please submit a new request with a stronger justification if needed.
                    </div>
                  )}

                  {req.status === 'COMPLETED' && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#D1FAE5', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#065F46', border: '1px solid #6EE7B7' }}>
                      ✅ Key successfully recovered on {req.completedAt ? new Date(req.completedAt).toLocaleString() : '—'}. Contact the Key Escrow Agent for your private key.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
