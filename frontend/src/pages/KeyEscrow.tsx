import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface EscrowedKey {
  id: number;
  keyId: number;
  ownerUsername: string;
  keyPurpose: string;
  escrowStatus: string;
  wrapAlgorithm: string;
  escrowedAt: string;
  recoveredAt?: string;
  recoveredBy?: string;
  certificateSerial?: string;
}

interface RecoveryRequest {
  id: number;
  escrowId: number;
  requestedBy: string;
  justification: string;
  status: string;
  superAdminUsername?: string;
  superAdminVerifiedAt?: string;
  caOperatorUsername?: string;
  caOperatorVerifiedAt?: string;
  escrowAgentUsername?: string;
  requestedAt: string;
  completedAt?: string;
  keyAlias?: string;
  keyAlgorithm?: string;
  keySize?: string;
}

interface InitStatus {
  initialized: boolean;
  initStatus: string;
  superAdminUsername?: string;
  superSubmittedAt?: string;
  caOperatorUsername?: string;
  caSubmittedAt?: string;
  agentUsername?: string;
  agentActivatedAt?: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: '#D1FAE5', color: '#065F46' },
    RECOVERED: { bg: '#DBEAFE', color: '#1E3A8A' },
    DESTROYED: { bg: '#FEE2E2', color: '#7F1D1D' },
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
      letterSpacing: '0.03em',
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const PhaseStep: React.FC<{
  number: number;
  label: string;
  done: boolean;
  active: boolean;
}> = ({ number, label, done, active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: done ? 'rgba(16,185,129,0.08)' : active ? 'rgba(99,102,241,0.1)' : 'transparent', border: `1px solid ${done ? '#10B981' : active ? '#6366F1' : 'var(--border-color)'}` }}>
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#10B981' : active ? '#6366F1' : 'var(--bg-surface)', color: done || active ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
      {done ? '✓' : number}
    </div>
    <span style={{ fontSize: '0.875rem', fontWeight: done || active ? 600 : 400, color: done ? '#10B981' : active ? '#6366F1' : 'var(--text-muted)' }}>
      {label}
    </span>
    {active && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', backgroundColor: 'rgba(99,102,241,0.2)', color: '#6366F1', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>YOUR TURN</span>}
    {done && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#10B981' }}>✅ Done</span>}
  </div>
);

export const KeyEscrow: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN') || false;
  const isCaOperator = user?.roles.includes('ROLE_ADMIN') || false;
  const isEscrowAgent = user?.roles.includes('ROLE_KEY_ESCROW') || false;

  // Default to 'initialize' tab for authority roles so CA Operator sees the form immediately
  const defaultTab: 'requests' | 'escrows' | 'initialize' =
    (user?.roles.includes('ROLE_SUPER_ADMIN') || user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_KEY_ESCROW'))
      ? 'initialize'
      : 'requests';
  const [activeTab, setActiveTab] = useState<'requests' | 'escrows' | 'initialize'>(defaultTab);
  const [escrowedKeys, setEscrowedKeys] = useState<EscrowedKey[]>([]);
  const [recoveryRequests, setRecoveryRequests] = useState<RecoveryRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [initStatus, setInitStatus] = useState<InitStatus | null>(null);

  // Per-role init password forms
  const [saPassword, setSaPassword] = useState('');
  const [caPassword, setCaPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Recovery modal
  const [recoveredPem, setRecoveredPem] = useState<string | null>(null);
  const [recoveringId, setRecoveringId] = useState<number | null>(null);

  const fetchStatus = async () => {
    try {
      const r = await api.get('/api/escrow/status');
      setInitStatus(r.data);
    } catch {
      setInitStatus({ initialized: false, initStatus: 'PENDING_SUPER_ADMIN' });
    }
  };

  const fetchEscrowedKeys = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/escrow');
      setEscrowedKeys(r.data);
    } catch {
      showToast('Failed to load escrowed keys', 'error');
    } finally { setLoading(false); }
  };

  const fetchRecoveryRequests = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/escrow/recovery-requests');
      setRecoveryRequests(r.data);
    } catch {
      showToast('Failed to load recovery requests', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStatus();
    fetchRecoveryRequests();
    if (isSuperAdmin || isEscrowAgent) fetchEscrowedKeys();
  }, []);

  // ── Phase 1: Super Admin submits their share ──────────────────────────────
  const handleSuperAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/escrow/initialize/super-admin', { password: saPassword });
      showToast('Share submitted! CA Operator must now log in and submit their password.', 'success');
      setSaPassword('');
      fetchStatus();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Submission failed', 'error');
    } finally { setSubmitting(false); }
  };

  // ── Phase 2: CA Operator submits their share ──────────────────────────────
  const handleCaOperatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/escrow/initialize/ca-operator', { password: caPassword });
      showToast('CA Operator share submitted! Master key generated. Escrow Agent must now activate.', 'success');
      setCaPassword('');
      fetchStatus();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Submission failed', 'error');
    } finally { setSubmitting(false); }
  };

  // ── Phase 3: Escrow Agent activates ──────────────────────────────────────
  const handleAgentActivate = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/escrow/initialize/agent-activate');
      showToast('Key Escrow system is now fully operational! 🔒', 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Activation failed', 'error');
      fetchStatus(); // refresh so UI shows the actual current state
    } finally { setSubmitting(false); }
  };

  // ── Recovery actions ──────────────────────────────────────────────────────
  const handleRecover = async (requestId: number) => {
    setRecoveringId(requestId);
    try {
      const r = await api.post(`/api/escrow/recovery-requests/${requestId}/recover`);
      setRecoveredPem(r.data.privateKeyPem);
      fetchRecoveryRequests();
      showToast('Key successfully reconstructed!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Key recovery failed', 'error');
    } finally { setRecoveringId(null); }
  };

  const handleReject = async (requestId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/api/escrow/recovery-requests/${requestId}/reject`, { reason });
      showToast('Request rejected', 'success');
      fetchRecoveryRequests();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Rejection failed', 'error');
    }
  };

  const pendingAgentRequests = recoveryRequests.filter(r => r.status === 'PENDING_AGENT');
  const currentPhase = initStatus?.initStatus || 'PENDING_SUPER_ADMIN';
  const isFullyInitialized = initStatus?.initialized;

  // ── Parallel submission flags (independent of each other) ───────────────
  // SA already submitted this session
  const saDone = !!initStatus?.superSubmittedAt;
  // CA already submitted this session
  const caDone = !!initStatus?.caSubmittedAt;
  // SA can submit: has role, system not initialized
  // Re-submission always allowed (handles server restart / cache loss)
  const saCanSubmit = !isFullyInitialized && isSuperAdmin;
  // CA can submit: has ROLE_ADMIN (not ROLE_SUPER_ADMIN), system not initialized
  // Re-submission always allowed — this is the key fix so CA always sees their form
  const caCanSubmit = !isFullyInitialized && isCaOperator && !isSuperAdmin;
  // Agent can activate only after BOTH SA and CA have submitted (DB flags set)
  const agentCanActivate = !isFullyInitialized && isEscrowAgent && saDone && caDone;
  // Agent waiting (escrow agent but not both submitted yet)
  const agentWaiting = !isFullyInitialized && isEscrowAgent && (!saDone || !caDone);

  // Determine what the Initialize tab shows for this user
  const showInitTab = isSuperAdmin || isCaOperator || isEscrowAgent;

  return (
    <div>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)', borderRadius: '0.75rem', padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>🔐 Key Escrow Management</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Dual-control key recovery — Shamir's Secret Sharing (k=2, n=2) · Two-Phase Initialization</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: isFullyInitialized ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isFullyInitialized ? '#6EE7B7' : '#FCA5A5', border: `1px solid ${isFullyInitialized ? '#10B981' : '#EF4444'}` }}>
            {initStatus === null ? 'Checking...' : isFullyInitialized ? '🔒 INITIALIZED' : `⚠️ ${currentPhase.replace(/_/g, ' ')}`}
          </span>
          {pendingAgentRequests.length > 0 && (
            <span style={{ padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(99,102,241,0.3)', color: '#A5B4FC', border: '1px solid #6366F1' }}>
              {pendingAgentRequests.length} pending recovery
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setActiveTab('requests'); fetchRecoveryRequests(); }}>
          📋 Recovery Requests {recoveryRequests.length > 0 && `(${recoveryRequests.length})`}
        </button>
        {(isSuperAdmin || isEscrowAgent) && (
          <button className={activeTab === 'escrows' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setActiveTab('escrows'); fetchEscrowedKeys(); }}>
            🗄️ Escrowed Keys {escrowedKeys.length > 0 && `(${escrowedKeys.length})`}
          </button>
        )}
        {showInitTab && (
          <button className={activeTab === 'initialize' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setActiveTab('initialize'); fetchStatus(); }}>
            ⚙️ Initialize Escrow
            {!isFullyInitialized && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', backgroundColor: 'rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>PENDING</span>}
          </button>
        )}
      </div>

      {/* ── Recovery Requests Tab ─────────────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div>
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}><div className="spinner" /></div>
          ) : recoveryRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No recovery requests found</div>
              <div style={{ fontSize: '0.85rem' }}>Key recovery requests submitted by users will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recoveryRequests.map(req => (
                <div key={req.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        Request #{req.id} — {req.keyAlias || `Escrow ID: ${req.escrowId}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Submitted by <strong>{req.requestedBy}</strong> on {new Date(req.requestedAt).toLocaleString()}
                        {req.keyAlgorithm && <> · {req.keyAlgorithm} ({req.keySize})</>}
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(99,102,241,0.05)', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    <strong>Justification:</strong> {req.justification}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', backgroundColor: req.superAdminUsername ? '#D1FAE5' : '#F1F5F9', color: req.superAdminUsername ? '#065F46' : '#94A3B8' }}>
                      {req.superAdminUsername ? `✅ Super Admin: ${req.superAdminUsername}` : '⏳ Awaiting Super Admin'}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', backgroundColor: req.caOperatorUsername ? '#D1FAE5' : '#F1F5F9', color: req.caOperatorUsername ? '#065F46' : '#94A3B8' }}>
                      {req.caOperatorUsername ? `✅ CA Operator: ${req.caOperatorUsername}` : '⏳ Awaiting CA Operator'}
                    </span>
                    {req.escrowAgentUsername && (
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#DBEAFE', color: '#1E3A8A' }}>
                        🔑 Agent: {req.escrowAgentUsername}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isSuperAdmin && req.status === 'PENDING_SUPER_ADMIN' && (
                      <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                        onClick={async () => {
                          const pw = prompt('Enter your Super Admin password to verify this recovery request:');
                          if (!pw) return;
                          try {
                            await api.post(`/api/escrow/recovery-requests/${req.id}/verify-super-admin`, { password: pw });
                            showToast('Verified! CA Operator must now verify.', 'success');
                            fetchRecoveryRequests();
                          } catch (err: any) { showToast(err.response?.data?.error || 'Verification failed', 'error'); }
                        }}>
                        ✅ Verify as Super Admin
                      </button>
                    )}
                    {isCaOperator && !isSuperAdmin && req.status === 'PENDING_CA_OPERATOR' && (
                      <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                        onClick={async () => {
                          const pw = prompt('Enter your CA Operator password to verify this recovery request:');
                          if (!pw) return;
                          try {
                            await api.post(`/api/escrow/recovery-requests/${req.id}/verify-ca-operator`, { password: pw });
                            showToast('Verified! Escrow Agent can now recover the key.', 'success');
                            fetchRecoveryRequests();
                          } catch (err: any) { showToast(err.response?.data?.error || 'Verification failed', 'error'); }
                        }}>
                        ✅ Verify as CA Operator
                      </button>
                    )}
                    {isEscrowAgent && req.status === 'PENDING_AGENT' && (
                      <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                        disabled={recoveringId === req.id} onClick={() => handleRecover(req.id)}>
                        {recoveringId === req.id
                          ? <span><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', display: 'inline-block', marginRight: '0.4rem' }} />Reconstructing...</span>
                          : '🔑 Reconstruct & Recover Key'}
                      </button>
                    )}
                    {isSuperAdmin && ['PENDING_SUPER_ADMIN', 'PENDING_CA_OPERATOR', 'PENDING_AGENT'].includes(req.status) && (
                      <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', color: '#EF4444' }} onClick={() => handleReject(req.id)}>
                        ✕ Reject Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Escrowed Keys Tab ─────────────────────────────────────────────── */}
      {activeTab === 'escrows' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
            🗄️ All Escrowed Private Keys ({escrowedKeys.length})
          </div>
          {loading ? (
            <div className="flex-center" style={{ height: '200px' }}><div className="spinner" /></div>
          ) : escrowedKeys.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No keys have been escrowed yet. Generate encryption keys and initialize the escrow system first.
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Escrow ID</th><th>Key ID</th><th>Owner</th>
                    <th>Purpose</th><th>Algorithm</th><th>Status</th>
                    <th>Escrowed At</th><th>Recovered By</th>
                  </tr>
                </thead>
                <tbody>
                  {escrowedKeys.map(k => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 600 }}>#{k.id}</td>
                      <td>#{k.keyId}</td>
                      <td>{k.ownerUsername}</td>
                      <td><span className="badge badge-info">{k.keyPurpose || 'GENERAL'}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{k.wrapAlgorithm}</td>
                      <td><StatusBadge status={k.escrowStatus} /></td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(k.escrowedAt).toLocaleString()}</td>
                      <td style={{ fontSize: '0.75rem' }}>{k.recoveredBy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Initialize Tab — Phase-Aware ──────────────────────────────────── */}
      {activeTab === 'initialize' && showInitTab && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">⚙️ Escrow Initialization Workflow</h3>

            {/* Phase progress steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <PhaseStep number={1} label={`Super Admin submits password share${saDone && initStatus?.superAdminUsername ? ' (' + initStatus.superAdminUsername + ')' : ''}`} done={saDone} active={saCanSubmit} />
              <PhaseStep number={2} label={`CA Operator submits password share${caDone && initStatus?.caOperatorUsername ? ' (' + initStatus.caOperatorUsername + ')' : ''}`} done={caDone} active={caCanSubmit} />
              <PhaseStep number={3} label="Escrow Agent generates master key & activates" done={!!isFullyInitialized} active={agentCanActivate} />
            </div>

            {/* Already initialized */}
            {isFullyInitialized && (
              <div style={{ padding: '1rem', backgroundColor: '#D1FAE5', borderRadius: '0.5rem', border: '1px solid #10B981', color: '#065F46', fontSize: '0.875rem' }}>
                <strong>✅ The escrow system is fully initialized and operational.</strong>
                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  Activated by agent: <strong>{initStatus?.agentUsername}</strong> at {initStatus?.agentActivatedAt ? new Date(initStatus.agentActivatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}

            {/* Phase 1: Super Admin password form */}
            {!isFullyInitialized && saCanSubmit && (
              <form onSubmit={handleSuperAdminSubmit}>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.25)', color: '#DC2626', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  ⚠️ <strong>One-time operation.</strong> Enter your own login password to generate your Shamir share. The CA Operator submits their own password independently.
                </div>
                <div className="form-group">
                  <label>Your Super Admin Password</label>
                  <input type="password" value={saPassword} onChange={e => setSaPassword(e.target.value)} placeholder="Enter your own login password" required autoComplete="current-password" />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Submitting...</span> : '🔐 Submit My Share (Step 1 of 3)'}
                </button>
              </form>
            )}

            {/* Phase 1: SA already submitted */}
            {!isFullyInitialized && isSuperAdmin && saDone && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(16,185,129,0.3)', color: '#059669', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ✅ <strong>Your share has been submitted.</strong> {caDone ? 'CA Operator has also submitted. Waiting for Escrow Agent to activate.' : 'Waiting for CA Operator to submit their share independently.'}
              </div>
            )}

            {/* Phase 2: CA Operator password form — visible as soon as CA is logged in and hasn't submitted */}
            {!isFullyInitialized && caCanSubmit && (
              <form onSubmit={handleCaOperatorSubmit}>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(234,179,8,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(234,179,8,0.3)', color: '#B45309', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  ℹ️ Submit <strong>your own CA Operator password</strong> to register your Shamir share. You do NOT need to wait for the Super Admin — both shares can be submitted independently.
                </div>
                <div className="form-group">
                  <label>Your CA Operator Password</label>
                  <input type="password" value={caPassword} onChange={e => setCaPassword(e.target.value)} placeholder="Enter your own login password" required autoComplete="current-password" />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Submitting...</span> : '🔑 Submit My Share (Step 2 of 3)'}
                </button>
              </form>
            )}

            {/* Phase 2: CA already submitted */}
            {!isFullyInitialized && isCaOperator && !isSuperAdmin && caDone && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(16,185,129,0.3)', color: '#059669', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ✅ <strong>Your share has been submitted.</strong> {saDone ? 'Super Admin has also submitted. Waiting for Escrow Agent to activate.' : 'Waiting for Super Admin to submit their share independently.'}
                <button className="btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.8rem', display: 'block' }} onClick={fetchStatus}>🔄 Refresh Status</button>
              </div>
            )}

            {/* Phase 3: Escrow Agent — activate (appears only after BOTH SA and CA submitted) */}
            {!isFullyInitialized && agentCanActivate && (
              <div>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(16,185,129,0.3)', color: '#059669', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  ✅ <strong>Both authority shares received.</strong> Super Admin (<strong>{initStatus?.superAdminUsername}</strong>) and CA Operator (<strong>{initStatus?.caOperatorUsername}</strong>) have submitted their shares. Clicking the button below will generate the AES-256 master key, run Shamir's split, and activate the escrow system.
                </div>
                <button className="btn-primary" style={{ width: '100%' }} disabled={submitting} onClick={handleAgentActivate}>
                  {submitting ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Generating master key...</span> : '🚀 Generate Master Key & Activate Escrow (Step 3 of 3)'}
                </button>
              </div>
            )}

            {/* Escrow Agent: waiting for SA or CA or both */}
            {agentWaiting && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(148,163,184,0.08)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <strong>⏳ Waiting for authorities to submit their shares.</strong>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', backgroundColor: saDone ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: saDone ? '#059669' : '#DC2626' }}>
                    {saDone ? `✅ Super Admin: ${initStatus?.superAdminUsername}` : '⏳ Super Admin: pending'}
                  </span>
                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', backgroundColor: caDone ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: caDone ? '#059669' : '#DC2626' }}>
                    {caDone ? `✅ CA Operator: ${initStatus?.caOperatorUsername}` : '⏳ CA Operator: pending'}
                  </span>
                </div>
                <button className="btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }} onClick={fetchStatus}>🔄 Refresh Status</button>
              </div>
            )}

          </div>

          <div className="card">
            <h3 className="card-title" style={{ color: 'var(--text-primary)' }}>🔑 How Key Escrow Works</h3>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Two-Phase Initialization</strong>
                <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                  The Super Admin and CA Operator each submit <em>only their own password</em> in separate sessions. Neither party knows the other's password.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Shamir's Secret Sharing (k=2, n=2)</strong>
                <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                  The AES-256 master key is split into exactly 2 shares. Both must be combined to reconstruct it. Neither authority can recover alone.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Share Storage</strong>
                <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                  Share 1 → encrypted with Super Admin's password (PBKDF2 + AES-GCM)<br />
                  Share 2 → encrypted with CA Operator's password
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Recovery Flow</strong>
                <ol style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', marginBottom: 0 }}>
                  <li>User submits recovery request with justification</li>
                  <li>Super Admin enters <em>their own</em> password → Share 1 decrypted</li>
                  <li>CA Operator enters <em>their own</em> password → Share 2 decrypted</li>
                  <li>Key Escrow Agent reconstructs master key via SSS → decrypts key</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recovered PEM Modal ───────────────────────────────────────────── */}
      {recoveredPem && (
        <div className="modal-overlay" onClick={() => setRecoveredPem(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: '#10B981' }}>🔑 Recovered Private Key — One-Time Display</h3>
              <button className="toast-close" onClick={() => setRecoveredPem(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#DC2626', marginBottom: '1rem' }}>
                ⚠️ <strong>This key is displayed only once.</strong> Copy it now and deliver securely to the key owner. Closing this dialog permanently removes the key from memory.
              </div>
              <textarea readOnly value={recoveredPem} style={{ width: '100%', height: '240px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', resize: 'none', lineHeight: 1.6 }} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(recoveredPem!)}>📋 Copy to Clipboard</button>
              <button className="btn-primary" onClick={() => { const blob = new Blob([recoveredPem!], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'recovered_private_key.pem'; a.click(); }}>💾 Download PEM</button>
              <button className="btn-secondary" style={{ color: '#EF4444' }} onClick={() => setRecoveredPem(null)}>🗑️ Dismiss & Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
