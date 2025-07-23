import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Settings, RefreshCw } from 'lucide-react';
import { openRouterManager } from '../api/grokManager';
import { config } from '../config/environment';

interface APIStatusProps {
  className?: string;
}

export default function APIStatus({ className = '' }: APIStatusProps) {
  const [status, setStatus] = useState({ initialized: false, hasApiKey: false, requestCount: 0, dailyRequestCount: 0 });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    updateStatus();
    checkConnection();
  }, []);

  const updateStatus = () => {
    const currentStatus = openRouterManager.getStatus();
    setStatus(currentStatus);
  };

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const result = await openRouterManager.validateConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRefresh = () => {
    updateStatus();
    checkConnection();
  };

  const getStatusColor = () => {
    if (!status.hasApiKey) return 'text-gray-400';
    if (connectionStatus === 'connected') return 'text-green-500';
    if (connectionStatus === 'disconnected') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getStatusText = () => {
    if (!status.hasApiKey) return 'No API Key';
    if (isChecking) return 'Checking...';
    if (connectionStatus === 'connected') return 'Connected';
    if (connectionStatus === 'disconnected') return 'Disconnected';
    return 'Unknown';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {status.hasApiKey ? (
          connectionStatus === 'connected' ? (
            <Wifi className={getStatusColor()} size={16} />
          ) : (
            <WifiOff className={getStatusColor()} size={16} />
          )
        ) : (
          <Settings className={getStatusColor()} size={16} />
        )}
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          OpenRouter API: {getStatusText()}
        </span>
      </div>
      
      {status.hasApiKey && (
        <button
          onClick={handleRefresh}
          disabled={isChecking}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw 
            className={`text-gray-400 hover:text-gray-600 ${isChecking ? 'animate-spin' : ''}`} 
            size={12} 
          />
        </button>
      )}
      
      {config.app.debugMode && (
        <span className="text-xs text-gray-500">
          ({status.requestCount}/min, {status.dailyRequestCount}/day)
        </span>
      )}
    </div>
  );
}