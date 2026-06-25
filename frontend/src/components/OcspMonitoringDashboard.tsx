import React, { useState, useEffect } from 'react';

interface OcspMonitoringData {
  serviceStatus: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  responderCertificateStatus: 'VALID' | 'EXPIRED' | 'REVOKED';
  lastSuccessfulResponse: string;
  averageResponseTime: number;
  failedRequests: number;
  successfulRequests: number;
  uptimePercentage: number;
}

export const OcspMonitoringDashboard: React.FC = () => {
  const [monitoring, setMonitoring] = useState<OcspMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      // In a real implementation, this would fetch actual monitoring data
      // For now, we'll create mock data based on OCSP service health
      const mockData: OcspMonitoringData = {
        serviceStatus: 'OPERATIONAL',
        responderCertificateStatus: 'VALID',
        lastSuccessfulResponse: new Date().toISOString(),
        averageResponseTime: 125, // milliseconds
        failedRequests: 2,
        successfulRequests: 1247,
        uptimePercentage: 99.95
      };
      setMonitoring(mockData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
      case 'VALID':
        return 'text-green-600 dark:text-green-400';
      case 'DEGRADED':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'DOWN':
      case 'EXPIRED':
      case 'REVOKED':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
      case 'VALID':
        return 'bg-green-50 dark:bg-green-900';
      case 'DEGRADED':
        return 'bg-yellow-50 dark:bg-yellow-900';
      case 'DOWN':
      case 'EXPIRED':
      case 'REVOKED':
        return 'bg-red-50 dark:bg-red-900';
      default:
        return 'bg-gray-50 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">Loading monitoring data...</p>
      </div>
    );
  }

  if (!monitoring) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error || 'Failed to load monitoring data'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          OCSP Service Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor OCSP responder health and performance
        </p>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Status */}
        <div className={`rounded-lg shadow p-6 ${getStatusBgColor(monitoring.serviceStatus)}`}>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            OCSP Service Status
          </h3>
          <p className={`text-3xl font-bold ${getStatusColor(monitoring.serviceStatus)}`}>
            {monitoring.serviceStatus}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {monitoring.serviceStatus === 'OPERATIONAL'
              ? 'Service is running normally'
              : monitoring.serviceStatus === 'DEGRADED'
              ? 'Service experiencing performance issues'
              : 'Service is unavailable'}
          </p>
        </div>

        {/* Responder Certificate Status */}
        <div className={`rounded-lg shadow p-6 ${getStatusBgColor(monitoring.responderCertificateStatus)}`}>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Responder Certificate Status
          </h3>
          <p className={`text-3xl font-bold ${getStatusColor(monitoring.responderCertificateStatus)}`}>
            {monitoring.responderCertificateStatus}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            OCSP responder certificate validity status
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase">
            Last Successful Response
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">
            {new Date(monitoring.lastSuccessfulResponse).toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(monitoring.lastSuccessfulResponse).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase">
            Avg Response Time
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {monitoring.averageResponseTime}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            milliseconds
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase">
            Failed Requests
          </p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
            {monitoring.failedRequests}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            in last 24 hours
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase">
            Uptime
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {monitoring.uptimePercentage}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            last 30 days
          </p>
        </div>
      </div>

      {/* Request Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Request Statistics
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Successful Requests (24h)
            </p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              {monitoring.successfulRequests}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Success Rate
            </p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {((monitoring.successfulRequests / (monitoring.successfulRequests + monitoring.failedRequests)) * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Health Check */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Health Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              monitoring.serviceStatus === 'OPERATIONAL' ? 'bg-green-500' : 
              monitoring.serviceStatus === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <p className="text-gray-700 dark:text-gray-300">
              Service is {monitoring.serviceStatus === 'OPERATIONAL' ? 'operational' : monitoring.serviceStatus === 'DEGRADED' ? 'degraded' : 'down'}
            </p>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              monitoring.responderCertificateStatus === 'VALID' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className="text-gray-700 dark:text-gray-300">
              Responder certificate is {monitoring.responderCertificateStatus.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              monitoring.uptimePercentage >= 99 ? 'bg-green-500' : 
              monitoring.uptimePercentage >= 95 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <p className="text-gray-700 dark:text-gray-300">
              Uptime is {monitoring.uptimePercentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
