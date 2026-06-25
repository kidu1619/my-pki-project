import React, { useState } from 'react';
import { OcspRequestForm } from '../components/OcspRequestForm';

export const RequestVerification: React.FC = () => {
  const [serialNumber, setSerialNumber] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Intentionally unhandled in this example, but removing 'file' state
    }
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSerialNumber(e.target.value);
  };

  // Convert file to base64 and pass to OcspRequestForm via a prop (new prop certificateFile)
  // For simplicity, we will let OcspRequestForm handle the file upload internally.

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Request Certificate Verification</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Submit a request to the OCSP Operator to verify the status of a certificate.
        </p>
        <div className="space-y-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificate Alias (Serial Number)</label>
          <input
            type="text"
            value={serialNumber}
            onChange={handleSerialChange}
            placeholder="Enter certificate alias or serial number"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificate File (optional)</label>
          <input
            type="file"
            accept=".pem,.crt,.cer"
            onChange={handleFileChange}
            className="mt-1 w-full"
          />
        </div>
      </div>
      <OcspRequestForm serialNumber={serialNumber} />
    </div>
  );
};
