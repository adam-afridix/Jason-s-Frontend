import { useState, useEffect } from 'react';
import { Cloud, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../services/api';

const GoogleDriveConnect = () => {
  const [status, setStatus] = useState({
    authenticated: false,
    loading: true,
    error: null,
    expiresAt: null,
    isExpired: false,
  });

  const checkStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await api.get('/auth/status');
      setStatus({
        authenticated: response.data.authenticated,
        loading: false,
        error: null,
        expiresAt: response.data.expiresAt,
        isExpired: response.data.isExpired,
        hasRefreshToken: response.data.hasRefreshToken,
      });
    } catch (error) {
      console.error('Error checking Google Drive status:', error);
      setStatus({
        authenticated: false,
        loading: false,
        error: error.response?.data?.error || 'Failed to check status',
        expiresAt: null,
        isExpired: false,
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleConnect = async (forceNew = false) => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      // If forcing new connection, revoke old token first
      if (forceNew) {
        console.log('Revoking old token...');
        try {
          await api.post('/auth/revoke');
          console.log('Old token revoked');
        } catch (revokeError) {
          console.warn('Could not revoke token:', revokeError);
          // Continue anyway
        }
      }
      
      // Get the authorization URL from backend
      const response = await api.get('/auth/url');
      const { authUrl } = response.data;

      // Open Google OAuth in a new window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        authUrl,
        'Google Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll to check if authorization is complete
      const pollInterval = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(pollInterval);
          // Check status after window closes
          setTimeout(() => {
            checkStatus();
          }, 1000);
        }
      }, 500);

    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Failed to connect',
      }));
    }
  };

  const handleReconnect = () => {
    handleConnect(true); // Force new connection
  };

  const getStatusColor = () => {
    if (status.loading) return '#9ca3af';
    if (status.error) return '#ef4444';
    if (status.authenticated && !status.isExpired) return '#22c55e';
    if (status.isExpired) return '#f59e0b';
    return '#6b7280';
  };

  const getStatusText = () => {
    if (status.loading) return 'Checking...';
    if (status.error) return 'Connection Error';
    if (status.isExpired) return '⚠️ Token Expired - Reconnect Required';
    if (status.authenticated) return 'Connected to Google Drive';
    return 'Not Connected';
  };

  const getStatusIcon = () => {
    if (status.loading) {
      return <RefreshCw size={20} className="animate-spin" />;
    }
    if (status.error || status.isExpired) {
      return <AlertCircle size={20} />;
    }
    if (status.authenticated && !status.isExpired) {
      return <CheckCircle size={20} />;
    }
    return <Cloud size={20} />;
  };

  const formatExpiryDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: status.authenticated && !status.isExpired ? '#f0fdf4' : '#f3f4f6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: getStatusColor(),
          }}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px',
            }}>
              Google Drive Status
            </h3>
            <p style={{
              fontSize: '14px',
              color: getStatusColor(),
              margin: 0,
            }}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {(!status.authenticated || status.isExpired) && !status.loading && (
          <button
            onClick={status.isExpired ? handleReconnect : handleConnect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: status.isExpired ? '#f59e0b' : '#2563eb',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: status.isExpired ? '0 2px 4px rgba(245, 158, 11, 0.2)' : '0 2px 4px rgba(37, 99, 235, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = status.isExpired ? '#d97706' : '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = status.isExpired ? '0 4px 6px rgba(245, 158, 11, 0.3)' : '0 4px 6px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = status.isExpired ? '#f59e0b' : '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = status.isExpired ? '0 2px 4px rgba(245, 158, 11, 0.2)' : '0 2px 4px rgba(37, 99, 235, 0.2)';
            }}
          >
            <ExternalLink size={16} />
            {status.isExpired ? '🔄 Get New Token' : 'Connect Google Drive'}
          </button>
        )}

        {status.authenticated && !status.isExpired && (
          <button
            onClick={checkStatus}
            disabled={status.loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
              fontWeight: '500',
              cursor: status.loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!status.loading) {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <RefreshCw size={14} className={status.loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>

      {/* Additional Info */}
      {status.expiresAt && (
        <div style={{
          backgroundColor: status.isExpired ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${status.isExpired ? '#fecaca' : '#86efac'}`,
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: status.isExpired ? '#991b1b' : '#166534',
        }}>
          <p style={{ margin: 0 }}>
            <strong>Token {status.isExpired ? 'expired on' : 'expires on'}:</strong>{' '}
            {formatExpiryDate(status.expiresAt)}
          </p>
          {status.isExpired && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontWeight: '600' }}>
              ⚠️ Click "Get New Token" above to reconnect
            </p>
          )}
          {status.hasRefreshToken && !status.isExpired && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
              ✓ Auto-refresh enabled
            </p>
          )}
        </div>
      )}

      {status.error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: '#991b1b',
          marginTop: '12px',
        }}>
          <strong>Error:</strong> {status.error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GoogleDriveConnect;

