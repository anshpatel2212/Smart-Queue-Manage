import {
  db,
  collection,
  query,
  limit,
  onSnapshot
} from '../firebase/firestore';
import { subscribeAllTokens } from './tokenService';
import { subscribeServices, subscribeDepartments } from './serviceService';

/**
 * Service to aggregate Admin Real-Time Metrics & Analytics
 */

export const calculateAdminMetrics = (tokens = [], historyItems = [], services = [], departments = []) => {
  // Deterministic count based strictly on status
  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  const calledTokens = tokens.filter(t => t.status === 'called');
  const inServiceTokens = tokens.filter(t => t.status === 'in_service');
  const completedTokens = tokens.filter(t => t.status === 'completed');
  const cancelledTokens = tokens.filter(t => t.status === 'cancelled');

  const waitingCount = waitingTokens.length;
  const calledCount = calledTokens.length;
  const inServiceCount = inServiceTokens.length;

  // Combine completed from live tokens and history collection
  const completedHistory = historyItems.filter(h => h.status === 'completed');
  const cancelledHistory = historyItems.filter(h => h.status === 'cancelled');

  // De-duplicate completed and cancelled if present in both
  const completedIds = new Set(completedTokens.map(t => t.id || t.tokenId));
  const uniqueHistoryCompleted = completedHistory.filter(h => !completedIds.has(h.id || h.tokenId));
  const completedCount = completedTokens.length + uniqueHistoryCompleted.length;

  const cancelledIds = new Set(cancelledTokens.map(t => t.id || t.tokenId));
  const uniqueHistoryCancelled = cancelledHistory.filter(h => !cancelledIds.has(h.id || h.tokenId));
  const cancelledCount = cancelledTokens.length + uniqueHistoryCancelled.length;

  const totalTokens = waitingCount + calledCount + inServiceCount + completedCount + cancelledCount;

  // Active services & counters
  const activeServices = services.filter(s => (s.status || '').toLowerCase() === 'open' || (s.status || '').toLowerCase() === 'active');
  const activeCountersCount = activeServices.reduce((sum, s) => sum + (parseInt(s.activeCounters, 10) || 1), 0);

  // Compute average waiting time (in minutes)
  const allCompleted = [...completedTokens, ...uniqueHistoryCompleted];
  const waitTimes = allCompleted
    .map(t => t.waitingTime)
    .filter(w => typeof w === 'number' && w > 0);
  const avgWaitTime = waitTimes.length > 0
    ? Math.round(waitTimes.reduce((acc, v) => acc + v, 0) / waitTimes.length)
    : 15; // default fallback if no history recorded yet

  // Compute average service time (in minutes)
  const serviceTimes = allCompleted
    .map(t => t.serviceTime)
    .filter(s => typeof s === 'number' && s > 0);
  const avgServiceTime = serviceTimes.length > 0
    ? Math.round(serviceTimes.reduce((acc, v) => acc + v, 0) / serviceTimes.length)
    : 6;

  // Compute department breakdown
  const departmentBreakdown = departments.map(dept => {
    const deptTokens = tokens.filter(t => t.departmentId === dept.id || t.departmentName === dept.name);
    const deptCompleted = allCompleted.filter(h => h.departmentId === dept.id || h.departmentName === dept.name);
    const deptWaiting = deptTokens.filter(t => t.status === 'waiting').length;
    const deptInService = deptTokens.filter(t => t.status === 'in_service' || t.status === 'called').length;

    return {
      id: dept.id,
      name: dept.name,
      status: dept.status,
      activeCounters: dept.activeCounters || 1,
      totalCounters: dept.totalCounters || 2,
      waiting: deptWaiting,
      inService: deptInService,
      completed: deptCompleted.length,
      total: deptTokens.length + deptCompleted.length,
      avgWait: `${avgWaitTime} min`,
      satisfaction: 4.5
    };
  });

  return {
    totalTokens,
    waitingCount,
    calledCount,
    inServiceCount,
    completedCount,
    cancelledCount,
    activeServicesCount: activeServices.length,
    activeCountersCount,
    avgWaitTime,
    avgServiceTime,
    departmentBreakdown,
    activeTokens: tokens.filter(t => ['waiting', 'called', 'in_service'].includes(t.status))
  };
};

/**
 * Real-time campus history listener
 */
export const subscribeCampusHistory = (callback, limitCount = 100) => {
  const q = query(
    collection(db, 'queueHistory'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const timeA = a.completedAt?.toMillis ? a.completedAt.toMillis() : (a.completedAt?.seconds ? a.completedAt.seconds * 1000 : 0);
        const timeB = b.completedAt?.toMillis ? b.completedAt.toMillis() : (b.completedAt?.seconds ? b.completedAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      callback(items);
    },
    (err) => {
      console.warn('Campus history subscription error:', err);
      callback([]);
    }
  );
};
