import { useState, useEffect } from 'react';
import { subscribeActiveQueueTokens } from '../services/queueService';

export const useAdminQueues = (selectedServiceId = 'ALL') => {
  const [activeTokens, setActiveTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const unsub = subscribeActiveQueueTokens((tokens) => {
      if (mounted) {
        setActiveTokens(tokens);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const filteredTokens = activeTokens.filter((token) => {
    if (selectedServiceId !== 'ALL' && token.serviceId !== selectedServiceId) {
      return false;
    }
    return true;
  });

  return {
    tokens: filteredTokens,
    allActiveTokens: activeTokens,
    loading,
    error,
  };
};

export default useAdminQueues;
