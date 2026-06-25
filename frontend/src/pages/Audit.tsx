import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface AuditLog {
  id: number;
  username: string;
  action: string;
  ipAddress?: string;
  timestamp: string;
  details?: string;
}

export const Audit: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [exportingType, setExportingType] = useState<'pdf' | 'csv' | 'json' | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/audit');
      setLogs(response.data);
    } catch (e: any) {
      showToast('Failed to load transaction audit trails', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleVerifyIntegrity = async () => {
    setVerifying(true);

    try {
      const response = await api.post('/api/audit/verify');

      if (response.data.valid) {
        showToast(
          response.data.message || 'Integrity chain verified via HMAC-SHA256 ledger.',
          'success'
        );
      } else {
        showToast(
          response.data.message || 'Ledger chain verification failed!',
          'error'
        );
      }
    } catch (e: any) {
      showToast('Integrity verification process failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'csv' | 'json') => {
    setExportingType(type);

    try {
      if (type === 'pdf') {
        const response = await api.get('/api/reports/audit/pdf', {
          responseType: 'blob',
        });

        const element = document.createElement('a');
        element.href = URL.createObjectURL(response.data);
        element.download = 'audit_report.pdf';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        showToast('PDF compliance audit log downloaded', 'success');
      } else if (type === 'csv') {
        const response = await api.get('/api/reports/audit/csv');

        const element = document.createElement('a');
        const file = new Blob([response.data], { type: 'text/plain' });

        element.href = URL.createObjectURL(file);
        element.download = 'audit_report.csv';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        showToast('CSV compliance audit log downloaded', 'success');
      } else if (type === 'json') {
        const jsonString = JSON.stringify(logs, null, 2);

        const element = document.createElement('a');
        const file = new Blob([jsonString], {
          type: 'application/json',
        });

        element.href = URL.createObjectURL(file);
        element.download = 'audit_report.json';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        showToast('JSON raw compliance audit log downloaded', 'success');
      }
    } catch (e: any) {
      showToast(`Exporting ${type.toUpperCase()} report failed`, 'error');
    } finally {
      setExportingType(null);
    }
  };

  const isAuditorOrAdmin =
    user?.roles?.includes('ROLE_AUDITOR') ||
    user?.roles?.includes('ROLE_SUPER_ADMIN');

  if (!isAuditorOrAdmin) {
    return (
      <div className="card">
        <h3 style={{ color: '#EF4444' }}>Access Denied</h3>
        <p>
          You do not have the required Auditor role profile to access system
          transaction audit logs.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            onClick={() => handleExport('pdf')}
            disabled={exportingType !== null}
          >
            {exportingType === 'pdf'
              ? 'Compiling PDF...'
              : 'Export PDF Report'}
          </button>

          <button
            className="btn-secondary"
            onClick={() => handleExport('csv')}
            disabled={exportingType !== null}
          >
            {exportingType === 'csv'
              ? 'Compiling CSV...'
              : 'Export CSV Report'}
          </button>

          <button
            className="btn-secondary"
            onClick={() => handleExport('json')}
            disabled={exportingType !== null}
          >
            {exportingType === 'json'
              ? 'Compiling JSON...'
              : 'Export JSON Log'}
          </button>
        </div>

        <button
          className="btn-primary"
          onClick={handleVerifyIntegrity}
          disabled={verifying}
        >
          {verifying ? 'Checking...' : 'Verify Ledger Integrity'}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex-center" style={{ height: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div
            className="table-container"
            style={{ border: 'none', borderRadius: 0 }}
          >
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Caller Identity</th>
                  <th>Action Performed</th>
                  <th>IP Address</th>
                  <th>Ledger Context Details</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="monospace-cell">{log.id}</td>

                    <td
                      style={{
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.timestamp
                        ? log.timestamp.replace('T', ' ')
                        : 'N/A'}
                    </td>

                    <td style={{ fontWeight: 600 }}>{log.username}</td>

                    <td>
                      <span
                        className="badge badge-info"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="monospace-cell">
                      {log.ipAddress === '0:0:0:0:0:0:0:1'
                        ? '127.0.0.1'
                        : log.ipAddress || '127.0.0.1'}
                    </td>

                    <td
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={
                        log.details || 'No extended parameters logged.'
                      }
                    >
                      {log.details || 'No extended parameters logged.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};