import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Toast notifications are handled within handleSubmit
import { api } from '../services/api';

interface OcspRequestFormProps {
  serialNumber: string; // Serial number of the certificate to verify
  certificateFile?: string; // base64 of uploaded certificate (optional)
  onSuccess?: (requestId: number) => void;
  onError?: (error: string) => void;
}

export const OcspRequestForm: React.FC<OcspRequestFormProps> = ({
  serialNumber,
  certificateFile: certificateFileProp = '',
  onSuccess,
  onError
}) => {
  const [reason, setReason] = useState('');
  const [certificateFile, setCertificateFile] = useState<string>(certificateFileProp); // base64 string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync prop changes to state
  useEffect(() => {
    if (certificateFileProp) {
      setCertificateFile(certificateFileProp);
    }
  }, [certificateFileProp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Ensure latest certificateFile prop is used
    if (certificateFileProp && certificateFileProp !== certificateFile) {
      setCertificateFile(certificateFileProp);
    }
    setSuccess(false);

    try {
        const response = await api.post('/ocsp/request', {
          serialNumber,
          certificateFile,
          reason
        });
        toast.success('OCSP request submitted successfully!');
        setSuccess(true);
        setReason('');
        if (onSuccess) {
          onSuccess(response.data.requestId);
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to submit request';
        setError(errorMsg);
        toast.error(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Request Certificate Status Verification
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Certificate Alias
        </label>
        <input
          type="text"
          value={serialNumber}
          disabled
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Reason for Verification *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          placeholder="Enter the reason for requesting verification"
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        {/* Certificate file input */}
        <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Certificate File (optional, max 10 MB)</label>
        <input
          type="file"
          accept=".crt,.pem,.der"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const maxSize = 10 * 1024 * 1024; // 10 MB
            if (file.size > maxSize) {
              toast.error('File size exceeds 10 MB limit');
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove any data URL prefix
              const base64 = result.split(',')[1] || result;
              setCertificateFile(base64);
            };
            reader.readAsDataURL(file);
          }}
          className="mt-1 w-full text-gray-700 dark:text-gray-300"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            Request submitted successfully! The OCSP Operator will process it soon.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};
