import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface OcspStats {
  pendingRequests: number;
  completedRequests: number;
  validCertificatesChecked: number;
  revokedCertificatesFound: number;
}

interface OcspRequest {
  id: number;
  certificateAlias: string;
  certificateSerial: string;
  certificateOwner: string;
  requesterUsername: string;
  requesterRole: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface CertificateCopy {
  id: number;
  certificateId: number;
  certificateAlias: string;
  certificatePem: string;
  issuer: string;
  subject: string;
  createdAt: string;
}

export const OcspOperatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<OcspStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<OcspRequest[]>([]);
  const [todayRequests, setTodayRequests] = useState<OcspRequest[]>([]);
  const [certificateCopies, setCertificateCopies] = useState<CertificateCopy[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      const [statsRes, pendingRes, todayRes, copiesRes] = await Promise.all([
        api.get('/ocsp/stats'),
        api.get('/ocsp/pending-requests'),
        api.get('/ocsp/today-requests'),
        api.get('/ocsp/certificate-copies')
      ]);

      setStats(statsRes.data);
      setPendingRequests(pendingRes.data);
      setTodayRequests(todayRes.data);
      setCertificateCopies(copiesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    }
  };

  const handleProcessRequest = (requestId: number) => {
    // Process request logic here
    console.log(requestId);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          OCSP Operator Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage certificate status verification requests
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.pendingRequests}
                </p>
              </div>
              <div className="text-3xl text-blue-400">⏳</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Completed Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.completedRequests}
                </p>
              </div>
              <div className="text-3xl text-green-400">✓</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Valid Certificates
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.validCertificatesChecked}
                </p>
              </div>
              <div className="text-3xl text-green-500">🔐</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Revoked Certificates
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.revokedCertificatesFound}
                </p>
              </div>
              <div className="text-3xl text-red-400">⛔</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending Verification Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No pending requests
                  </td>
                </tr>
              ) : (
                pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.certificateAlias}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {request.certificateSerial}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {request.requesterUsername}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {request.requesterRole}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleProcessRequest(request.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Process
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Requests */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today's Requests
          </h2>
        </div>
        <div className="p-6">
          {todayRequests.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No requests today</p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              {todayRequests.length} request{todayRequests.length !== 1 ? 's' : ''} received today
            </p>
          )}
        </div>
      </div>
      {/* Certificate Copies (Forwarded) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Certificate Copies (Forwarded)
          </h2>
          <p className="text-sm text-gray-500">Certificates created across the system and sent to the OCSP Operator for tracking.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Alias & ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Issuer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  PEM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {certificateCopies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No certificate copies found
                  </td>
                </tr>
              ) : (
                certificateCopies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {copy.certificateAlias}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {copy.certificateId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {copy.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {copy.issuer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(copy.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => { navigator.clipboard.writeText(copy.certificatePem); alert('PEM copied to clipboard!'); }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Copy PEM
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
