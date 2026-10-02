import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeUserActiveToken,
  subscribeServiceTokens,
  cancelToken
} from '../services/tokenService';
import { subscribeQueue } from '../services/queueService';
import { getService } from '../services/serviceService';
import { calculateEstimatedWaitTime, getEstimatedWaitDisplay } from '../utils/queueCalculations';
import { predictWaitingTime } from '../services/mlService';

export const useQueue = () => {
  const { user } = useAuth();
  const [activeToken, setActiveToken] = useState(null);
  const [queueMetadata, setQueueMetadata] = useState(null);
  const [serviceTokens, setServiceTokens] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mlWait, setMlWait] = useState(null);
  const [mlSource, setMlSource] = useState('fallback');

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

  // 3. Extract waiting tokens and calculate people ahead in real-time
  const waitingTokens = useMemo(() => {
    return serviceTokens.filter(t => t.status === 'waiting');
  }, [serviceTokens]);

  const userSeq = activeToken?.tokenSequence || 0;
  const peopleAheadCount = useMemo(() => {
    return waitingTokens.filter(t => (t.tokenSequence || 0) < userSeq).length;
  }, [waitingTokens, userSeq]);

  const normStatus = (activeToken?.status || '').toLowerCase().replace(/[-\s]/g, '_');
  const isServingOrDone = normStatus === 'called' || normStatus === 'in_service' || normStatus === 'completed' || normStatus === 'cancelled' || normStatus === 'skipped' || normStatus === 'no_show';
  const peopleAhead = isServingOrDone ? 0 : peopleAheadCount;

  const avgTime = Math.max(serviceDetails?.averageServiceTime || 5, 0);
  const counters = Math.max(queueMetadata?.activeCounters || serviceDetails?.activeCounters || 1, 1);

  // 4. ML Wait Time Prediction query with fallback protection
  useEffect(() => {
    if (!activeToken?.serviceId || peopleAhead <= 0 || isServingOrDone) {
      setMlWait(null);
      setMlSource('fallback');
      return;
    }

    let isMounted = true;
    const runMLPrediction = async () => {
      try {
        const res = await predictWaitingTime({
          peopleAhead,
          queueLength: peopleAhead + 1,
          activeCounters: counters,
          averageServiceTime: avgTime,
          serviceType: serviceDetails?.departmentName || serviceDetails?.name,
          serviceName: serviceDetails?.name,
        });

        if (isMounted && typeof res?.estimatedWait === 'number' && res.estimatedWait >= 0) {
          setMlWait(res.estimatedWait);
          setMlSource(res.predictionSource || 'ml');
        }
      } catch {
        if (isMounted) {
          setMlWait(null);
          setMlSource('fallback');
        }
      }
    };

    runMLPrediction();
    return () => {
      isMounted = false;
    };
  }, [activeToken?.serviceId, peopleAhead, counters, avgTime, isServingOrDone, serviceDetails?.name]);

  // 5. Compute dynamic position, people ahead, ETA, and progress bar
  const computedData = useMemo(() => {
    if (!activeToken) return null;

    const calledOrServingTokens = serviceTokens.filter(t => t.status === 'called' || t.status === 'in_service');

    // Currently serving token number
    const currentlyServing = 
      calledOrServingTokens[0]?.tokenNumber || 
      queueMetadata?.currentTokenNumber || 
      'None';

    const position = isServingOrDone ? 1 : peopleAhead + 1;

    // Deterministic fallback: (peopleAhead * averageServiceTime) / activeCounters, rounded UP
    const fallbackWait = calculateEstimatedWaitTime(peopleAhead, avgTime, counters);

    let estimatedWait = fallbackWait;
    let predictionSource = 'fallback';

    if (peopleAhead === 0 || isServingOrDone) {
      estimatedWait = 0;
      predictionSource = 'deterministic';
    } else if (typeof mlWait === 'number' && mlWait > 0) {
      estimatedWait = mlWait;
      predictionSource = mlSource;
    } else if (typeof activeToken.estimatedWait === 'number' && activeToken.estimatedWait > 0 && activeToken.predictionSource === 'ml' && peopleAhead === (activeToken.peopleAhead ?? peopleAhead)) {
      estimatedWait = activeToken.estimatedWait;
      predictionSource = 'ml';
    } else {
      estimatedWait = fallbackWait;
      predictionSource = 'fallback';
    }

    const estimatedWaitDisplay = getEstimatedWaitDisplay(activeToken.status, peopleAhead, estimatedWait);

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
      counter: activeToken.counterNumber ? `Counter ${activeToken.counterNumber}` : (queueMetadata?.activeCounters ? 'Counter 1' : 'Pending'),
      status: activeToken.status, // 'waiting' | 'called' | 'in_service' | 'completed' | 'cancelled'
      currentlyServing,
      peopleAhead,
      position,
      estimatedWait,
      estimatedWaitDisplay,
      predictionSource,
      joinedAt: activeToken.createdAt?.toDate ? activeToken.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      progressQueue,
      tokenId: activeToken.id || activeToken.tokenId,
    };
  }, [
    activeToken,
    serviceTokens,
    queueMetadata,
    serviceDetails,
    peopleAhead,
    isServingOrDone,
    avgTime,
    counters,
    mlWait,
    mlSource
  ]);

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
