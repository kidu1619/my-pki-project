import React from 'react';

type BadgeStatus = 'VALID' | 'EXPIRING' | 'REVOKED';

interface StatusBadgeProps {
  status: BadgeStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = (state: string) => {
    switch (state.toUpperCase()) {
      case 'VALID':
      case 'ACTIVE':
        return {
          backgroundColor: '#D1FAE5',
          color: '#065F46',
        };
      case 'EXPIRING':
      case 'WARNING':
        return {
          backgroundColor: '#FEF3C7',
          color: '#92400E',
        };
      case 'REVOKED':
      case 'DANGER':
        return {
          backgroundColor: '#FEE2E2',
          color: '#991B1B',
        };
      default:
        return {
          backgroundColor: '#F1F5F9',
          color: '#334155',
        };
    }
  };

  const formattedStatus = status.toUpperCase();
  const styles = getStyles(formattedStatus);

  return (
    <span
      className="badge"
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      }}
    >
      {formattedStatus}
    </span>
  );
};
