import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface CertStatusInfo {
  id?: number;
  serialNumber: string;
  alias?: string;
  subject?: string;
  issuer?: string;
  status: string;
  revokedAt?: string;
  reasonCode?: number;
  message?: string;
}

export const Validation: React.FC = () => {
  const { showToast } = useToast();
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState<CertStatusInfo | null>(null);

  const handleSerialSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;
    setLoading(true);
    setStatusInfo(null);
    try {
      const response = await api.get(`/api/revocation/check/serial/${serial.trim()}`);
      setStatusInfo(response.data);
      showToast('Status retrieved successfully', 'success');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStatusInfo({
          serialNumber: serial.trim(),
          status: 'UNKNOWN',
          message: 'Certificate not found in database.',
        });
      } else {
        showToast('Failed to check status by serial', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      setLoading(true);
      setStatusInfo(null);
      try {
        const response = await api.post('/api/revocation/check/pem', { pem: text });
        setStatusInfo(response.data);
        showToast('Certificate PEM parsed and verified', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.error || 'Failed to parse and verify certificate', 'error');
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const getReasonText = (code: number) => {
    const reasons: Record<number, string> = {
      0: 'Unspecified',
      1: 'Key Compromise',
      2: 'CA Compromise',
      3: 'Affiliation Changed',
      4: 'Superseded',
      5: 'Cessation of Operation',
      6: 'Certificate Hold',
      8: 'Remove from CRL',
      9: 'Privilege Withdrawn',
      10: 'AA Compromise',
    };
    return reasons[code] || 'Unspecified';
  };

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">OCSP Status Check Console</h3>
          <p style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            Verify the active cryptographic validity and revocation standing of operational certificates managed within the national-security PKI catalog.
          </p>

          <form onSubmit={handleSerialSearch} style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Query by Hex Serial Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="e.g., 17FE8A449"
                  required
                />
                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }} disabled={loading}>
                  Search
                </button>
              </div>
            </div>
          </form>

          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
            <label>Verify by Uploading Certificate File (.crt / .pem)</label>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(248, 250, 252, 0.05)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📄</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Select Certificate from Explorer</strong>
              <input
                type="file"
                accept=".crt,.pem,.cer"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Real-Time Validation Verdict</h3>
          {loading ? (
            <div className="flex-center" style={{ height: '240px' }}>
              <div className="spinner"></div>
            </div>
          ) : statusInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Hex Serial: {statusInfo.serialNumber}</strong>
                {statusInfo.status === 'ACTIVE' || statusInfo.status === 'ISSUED' || statusInfo.status === 'VALID' ? (
                  <span className="badge badge-success">VALID</span>
                ) : statusInfo.status === 'REVOKED' ? (
                  <span className="badge badge-danger">REVOKED</span>
                ) : (
                  <span className="badge badge-info" style={{ backgroundColor: '#64748B', color: '#FFFFFF' }}>
                    {statusInfo.status}
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(248, 250, 252, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {statusInfo.alias && (
                  <div>
                    <strong>Subject Alias:</strong> {statusInfo.alias}
                  </div>
                )}
                {statusInfo.subject && (
                  <div>
                    <strong>Subject DN:</strong>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                      {statusInfo.subject}
                    </div>
                  </div>
                )}
                {statusInfo.issuer && (
                  <div>
                    <strong>Issuer DN:</strong>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', marginTop: '0.25rem' }}>
                      {statusInfo.issuer}
                    </div>
                  </div>
                )}
                {statusInfo.revokedAt && (
                  <div style={{ color: '#EF4444' }}>
                    <strong>Revoked Timestamp:</strong> {statusInfo.revokedAt}
                  </div>
                )}
                {statusInfo.reasonCode !== undefined && (
                  <div style={{ color: '#EF4444' }}>
                    <strong>Revocation Reason:</strong> {getReasonText(statusInfo.reasonCode)}
                  </div>
                )}
                {statusInfo.message && (
                  <div style={{ color: '#64748B', fontStyle: 'italic' }}>
                    {statusInfo.message}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: '#64748B', border: '1px dashed var(--border-color)', borderRadius: '0.375rem' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</span>
              <p style={{ fontSize: '0.85rem' }}>Awaiting Validation Target</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
