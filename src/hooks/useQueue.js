import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeUserActiveToken,
  subscribeServiceTokens,
  cancelToken
} from '../services/tokenService';
import { subscribeQueue } from '../services/queueService';
import { getService } from '../services/serviceService';
import { calculateEstimatedWaitTime } from '../utils/queueCalculations';

export const useQueue = () => {
  const { user } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [queueMetadata, setQueueMetadata] = useState(null);
  const [serviceTokens, setServiceTokens] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Subscribe to User's Active Token
  useEffect(() => {
    if (!user?.uid) {
      setActiveToken(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeUserActiveToken(user.uid, (token) => {
      setActiveToken(token);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // 2. Subscribe to Service Queue & Tokens once activeToken is known
  useEffect(() => {
    if (!activeToken?.serviceId) {
      setQueueMetadata(null);
      setServiceTokens([]);
      setServiceDetails(null);
      return;
    }

    const serviceId = activeToken.serviceId;

    getService(serviceId).then((srv) => {
      if (srv) setServiceDetails(srv);
    });

    const unsubQueue = subscribeQueue(serviceId, (qMeta) => {
      setQueueMetadata(qMeta);
    });

    const unsubTokens = subscribeServiceTokens(serviceId, (tokens) => {
      setServiceTokens(tokens);
    });

    return () => {
      unsubQueue();
      unsubTokens();
    };
  }, [activeToken?.serviceId]);

  // 3. Compute dynamic position, people ahead, ETA, and progress bar
  const computedData = useMemo(() => {
    if (!activeToken) return null;

    // Filter only active waiting/called/in_service tokens
    const waitingTokens = serviceTokens.filter(t => t.status === 'waiting');
    const calledOrServingTokens = serviceTokens.filter(t => t.status === 'called' || t.status === 'in_service');

    // Currently serving token number
    const currentlyServing = 
      calledOrServingTokens[0]?.tokenNumber || 
      queueMetadata?.currentTokenNumber || 
      'None';

    // Calculate how many waiting tokens are ahead of current user's token
    const userSeq = activeToken.tokenSequence || 0;
    const peopleAheadCount = waitingTokens.filter(t => (t.tokenSequence || 0) < userSeq).length;
    
    // In service or called -> 0 people ahead
    const peopleAhead = (activeToken.status === 'called' || activeToken.status === 'in_service') 
      ? 0 
      : peopleAheadCount;

    const position = (activeToken.status === 'called' || activeToken.status === 'in_service') 
      ? 1 
      : peopleAhead + 1;

    // Estimated wait time: prioritize Firestore ML prediction, fallback to calculation
    const avgTime = serviceDetails?.averageServiceTime || 5;
    const counters = queueMetadata?.activeCounters || serviceDetails?.activeCounters || 1;
    const calculatedWait = calculateEstimatedWaitTime(peopleAhead, avgTime, counters);

    let estimatedWait = calculatedWait;
    if (activeToken.status === 'called' || activeToken.status === 'in_service') {
      estimatedWait = 0;
    } else if (typeof activeToken.estimatedWait === 'number') {
      estimatedWait = activeToken.estimatedWait;
    }

    const predictionSource = activeToken.predictionSource || 'ml';

    // Queue progress pills sequence (e.g. up to 5 tokens culminating in user's token)
    let progressQueue = [];
    if (serviceTokens.length > 0) {
      const relevantTokens = serviceTokens.slice(0, 6).map(t => t.tokenNumber);
      if (!relevantTokens.includes(activeToken.tokenNumber)) {
        relevantTokens.push(activeToken.tokenNumber);
      }
      progressQueue = relevantTokens;
    } else {
      progressQueue = [activeToken.tokenNumber];
    }

    return {
      tokenNumber: activeToken.tokenNumber,
      service: activeToken.serviceName || serviceDetails?.name || 'Campus Service',
      department: activeToken.departmentName || serviceDetails?.departmentName || 'Department',
      counter: activeToken.counterNumber || queueMetadata?.activeCounters ? `Counter ${activeToken.counterNumber || 1}` : 'Pending',
      status: activeToken.status, // 'waiting' | 'called' | 'in_service' | 'completed' | 'cancelled'
      currentlyServing,
      peopleAhead,
      position,
      estimatedWait,
      predictionSource,
      joinedAt: activeToken.createdAt?.toDate ? activeToken.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      progressQueue,
      tokenId: activeToken.id || activeToken.tokenId,
    };
  }, [activeToken, serviceTokens, queueMetadata, serviceDetails]);

  // Cancel Queue action
  const handleCancelQueue = useCallback(async () => {
    if (!activeToken?.id || !user?.uid) return false;
    setActionLoading(true);
    try {
      await cancelToken(activeToken.id, user.uid);
      setActiveToken(null);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [activeToken?.id, user?.uid]);

  return {
    activeToken,
    computedData,
    loading,
    actionLoading,
    error,
    cancelQueue: handleCancelQueue,
  };
};

export default useQueue;
