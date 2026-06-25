import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RbacGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackPath?: string;
}

export const RbacGuard: React.FC<RbacGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
}) => {
  const { token, user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: '#F8FAFC' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

interface RbacShowProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  forbiddenRoles?: string[];
}

export const RbacShow: React.FC<RbacShowProps> = ({
  children,
  allowedRoles,
  forbiddenRoles,
}) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    return null;
  }

  if (forbiddenRoles && forbiddenRoles.some((role) => user.roles.includes(role))) {
    return null;
  }

  return <>{children}</>;
};
