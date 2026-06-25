import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from './Modal';

interface OcspVerificationProps {
  requestId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RequestDetails {
  requestId: number;
  certificateAlias: string;
  certificateSerial: string;
  certificateOwner: string;
  requesterUsername: string;
  requesterRole: string;
  reason: string;
  status: string;
  createdAt: string;
  validityStart?: string;
  validityEnd?: string;
  issuer?: string;
  issuingCa?: number;
}

export const OcspVerificationModal: React.FC<OcspVerificationProps> = ({
  requestId,
  onClose,
  onSuccess
}) => {
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [certificateStatus, setCertificateStatus] = useState('VALID');
  const [revocationReason, setRevocationReason] = useState<number | ''>('');
  const [revocationDate, setRevocationDate] = useState('');
  const [revokedBy, setRevokedBy] = useState('');

  const revocationReasons = [
    { code: 0, label: 'Unspecified' },
    { code: 1, label: 'Key Compromise' },
    { code: 2, label: 'CA Compromise' },
    { code: 3, label: 'Affiliation Changed' },
    { code: 4, label: 'Superseded' },
    { code: 5, label: 'Cessation of Operation' },
    { code: 6, label: 'Certificate Hold' },
    { code: 7, label: 'Remove from CRL' },
    { code: 8, label: 'Privilege Withdrawn' },
    { code: 9, label: 'AA Compromise' },
    { code: 10, label: 'Weak Algorithm' }
  ];

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ocsp/request/${requestId}`);
      setRequestDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload: any = {
        certificateStatus
      };

      if (certificateStatus === 'REVOKED') {
        if (!revocationReason || !revocationDate || !revokedBy) {
          setError('Please provide revocation reason, date, and who revoked it');
          setSubmitting(false);
          return;
        }
        payload.revocationReason = revocationReason;
        payload.revocationDate = revocationDate;
        payload.revokedBy = revokedBy;
      }

      await api.post(`/ocsp/verify/${requestId}`, payload);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="OCSP Verification">
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading request details...</p>
        </div>
      </Modal>
    );
  }

  if (!requestDetails) {
    return (
      <Modal isOpen={true} onClose={onClose} title="OCSP Verification">
        <div className="p-6">
          <p className="text-red-600 dark:text-red-400">{error || 'Failed to load request'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-md"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="OCSP Certificate Verification">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Details */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-4 space-y-2">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Certificate Alias</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {requestDetails.certificateAlias}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Certificate Serial</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white">
              {requestDetails.certificateSerial}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Owner</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {requestDetails.certificateOwner}
            </p>
          </div>
          {requestDetails.validityStart && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Validity Period</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(requestDetails.validityStart).toLocaleDateString()} to{' '}
                {new Date(requestDetails.validityEnd || '').toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Certificate Status Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Certificate Status *
          </label>
          <select
            value={certificateStatus}
            onChange={(e) => setCertificateStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="VALID">Valid - Not Revoked</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>

        {/* Revocation Details (shown only if REVOKED) */}
        {certificateStatus === 'REVOKED' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revocation Reason *
              </label>
              <select
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a reason...</option>
                {revocationReasons.map((reason) => (
                  <option key={reason.code} value={reason.code}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revocation Date *
              </label>
              <input
                type="datetime-local"
                value={revocationDate}
                onChange={(e) => setRevocationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Revoked By *
              </label>
              <input
                type="text"
                value={revokedBy}
                onChange={(e) => setRevokedBy(e.target.value)}
                placeholder="Enter who revoked the certificate"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {submitting ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
