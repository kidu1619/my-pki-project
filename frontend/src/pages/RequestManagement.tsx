import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface RequestItem {
  id: number;
  requestType: string; // RENEWAL or REVOCATION
  certificateId: number;
  requesterUsername: string;
  status: string;
  reason?: string;
  years?: number;
  caKeyId?: number;
  rejectionReason?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface Certificate {
  id: number;
  serialNumber: string;
  alias: string;
  subjectDn: string;
  issuerDn: string;
  status: string;
}

export const RequestManagement: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<RequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/requests/pending');
      setRequests(response.data);
    } catch (e: any) {
      showToast('Failed to load pending requests queue', 'error');
    }
  };

  const fetchCerts = async () => {
    try {
      const response = await api.get('/api/certificates');
      setCerts(response.data);
    } catch (e: any) {}
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchCerts()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCertDetails = (certId: number) => {
    return certs.find((c) => c.id === certId);
  };

  const canModerateRequests = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN');

  const handleRefresh = async () => {
    await loadData();
  };

  const handleApprove = async (req: RequestItem) => {
    if (!canModerateRequests) return;
    try {
      await api.post(`/api/requests/${req.id}/approve`);
      const toastMsg = req.requestType === 'RENEWAL' 
        ? "Certificate renewed successfully." 
        : "Certificate revoked successfully.";
      showToast(toastMsg, 'success');
      fetchRequests();
    } catch (err: any) {
      showToast(err.response?.data || "Operation failed. Please try again.", 'error');
    }
  };

  const triggerRejectModal = (req: RequestItem) => {
    setSelectedRequestForReject(req);
    setRejectReason('');
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReject) return;
    setSubmittingReject(true);
    try {
      await api.post(`/api/requests/${selectedRequestForReject.id}/reject`, {
        rejectionReason: rejectReason.trim() || 'No reason provided'
      });
      showToast("Request rejected.", "success");
      setIsRejectOpen(false);
      setSelectedRequestForReject(null);
      setRejectReason('');
      fetchRequests();
    } catch (err: any) {
      showToast(err.response?.data || "Operation failed. Please try again.", 'error');
    } finally {
      setSubmittingReject(false);
    }
  };

  const getReasonString = (code?: string) => {
    switch (code) {
      case '1': return 'Key Compromise (1)';
      case '2': return 'CA Compromise (2)';
      case '3': return 'Affiliation Changed (3)';
      case '4': return 'Superseded (4)';
      case '5': return 'Cessation of Operation (5)';
      case '6': return 'Certificate Hold (6)';
      default: return 'Unspecified (0)';
    }
  };

  const renewalRequests = requests.filter((r) => r.requestType === 'RENEWAL');
  const revocationRequests = requests.filter((r) => r.requestType === 'REVOCATION');

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Request Approval Desk</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#64748B', maxWidth: '720px' }}>
            Super Admin and Admin users can approve renewal and revocation requests here. Approving a renewal request triggers certificate renewal, and approving a revocation request triggers certificate revocation.
          </p>
        </div>
        <button className="btn-secondary" style={{ minWidth: '130px' }} onClick={handleRefresh}>
          Refresh Requests
        </button>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Pending Renewal Requests ({renewalRequests.length})</h3>
        {!canModerateRequests && (
          <div style={{ color: '#475569', marginBottom: '1rem' }}>
            You are viewing pending requests in read-only mode. Administrators may approve or reject these requests.
          </div>
        )}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {renewalRequests.length === 0 ? (
            <div style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No pending renewal requests.</div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Requester</th>
                    <th>Certificate Alias</th>
                    <th>Subject</th>
                    <th>Serial Number</th>
                    <th>Validity Extension</th>
                    <th>CA Key</th>
                    <th>Created At</th>
                    {canModerateRequests && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {renewalRequests.map((req) => {
                    const cert = getCertDetails(req.certificateId);
                    return (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td><strong>{req.requesterUsername}</strong></td>
                        <td>{cert?.alias || `ID: ${req.certificateId}`}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert?.subjectDn || 'N/A'}</td>
                        <td className="monospace-cell">{cert?.serialNumber || 'N/A'}</td>
                        <td>{req.years} Year{req.years && req.years > 1 ? 's' : ''}</td>
                        <td>{req.caKeyId ? `Key #${req.caKeyId}` : 'Default'}</td>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(req.createdAt).toLocaleString()}</td>
                        {canModerateRequests && (
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#10B981' }} onClick={() => handleApprove(req)}>
                                Approve
                              </button>
                              <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRejectModal(req)}>
                                Reject
                              </button>
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
      </div>

      <div>
        <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Pending Revocation Requests ({revocationRequests.length})</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {revocationRequests.length === 0 ? (
            <div style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No pending revocation requests.</div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Requester</th>
                    <th>Certificate Alias</th>
                    <th>Serial Number</th>
                    <th>Revocation Reason</th>
                    <th>Created At</th>
                    {canModerateRequests && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {revocationRequests.map((req) => {
                    const cert = getCertDetails(req.certificateId);
                    return (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td><strong>{req.requesterUsername}</strong></td>
                        <td>{cert?.alias || `ID: ${req.certificateId}`}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert?.subjectDn || 'N/A'}</td>
                        <td className="monospace-cell">{cert?.serialNumber || 'N/A'}</td>
                        <td>
                          <span className="badge badge-danger">
                            {getReasonString(req.reason)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(req.createdAt).toLocaleString()}</td>
                        {canModerateRequests && (
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#10B981' }} onClick={() => handleApprove(req)}>
                                Approve
                              </button>
                              <button className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => triggerRejectModal(req)}>
                                Reject
                              </button>
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
      </div>

      {isRejectOpen && (
        <div className="modal-overlay" onClick={() => setIsRejectOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Approval Request</h3>
              <button className="toast-close" onClick={() => setIsRejectOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Are you sure you want to reject request ID <strong>{selectedRequestForReject?.id}</strong> from <strong>{selectedRequestForReject?.requesterUsername}</strong>?
                </p>
                <div className="form-group">
                  <label>Rejection Reason Description</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide comments or audit reason..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsRejectOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-danger" disabled={submittingReject}>
                  {submittingReject ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
