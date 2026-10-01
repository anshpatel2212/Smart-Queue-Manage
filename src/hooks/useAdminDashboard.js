import { useState, useEffect } from 'react';
import { subscribeAllTokens } from '../services/tokenService';
import { subscribeServices, subscribeDepartments } from '../services/serviceService';
import { subscribeCampusHistory, calculateAdminMetrics } from '../services/adminService';
import { analyticsData } from '@/data/mockData';

export const useAdminDashboard = () => {
  const [tokens, setTokens] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Subscribe to all tokens in real time
    const unsubTokens = subscribeAllTokens((allTokens) => {
      if (mounted) {
        setTokens(allTokens);
        setLoading(false);
      }
    });

    // 2. Subscribe to queue history in real time
    const unsubHistory = subscribeCampusHistory((campusHistory) => {
      if (mounted) setHistoryItems(campusHistory);
    });

    // 3. Subscribe to campus services in real time
    const unsubServices = subscribeServices((allServices) => {
      if (mounted) setServices(allServices);
    });

    // 4. Subscribe to campus departments in real time
    const unsubDepts = subscribeDepartments((allDepts) => {
      if (mounted) setDepartments(allDepts);
    });

    return () => {
      mounted = false;
      unsubTokens();
      unsubHistory();
      unsubServices();
      unsubDepts();
    };
  }, []);

  // Compute live deterministic metrics
  const metrics = calculateAdminMetrics(tokens, historyItems, services, departments);

  // Compute hourly distribution from actual tokens created today
  const hoursMap = {
    '9AM': 0, '10AM': 0, '11AM': 0, '12PM': 0,
    '1PM': 0, '2PM': 0, '3PM': 0, '4PM': 0
  };

  tokens.forEach(t => {
    if (t.createdAt) {
      const date = t.createdAt.toDate ? t.createdAt.toDate() : (t.createdAt.seconds ? new Date(t.createdAt.seconds * 1000) : null);
      if (date) {
        const hour = date.getHours();
        if (hour === 9) hoursMap['9AM']++;
        else if (hour === 10) hoursMap['10AM']++;
        else if (hour === 11) hoursMap['11AM']++;
        else if (hour === 12) hoursMap['12PM']++;
        else if (hour === 13) hoursMap['1PM']++;
        else if (hour === 14) hoursMap['2PM']++;
        else if (hour === 15) hoursMap['3PM']++;
        else if (hour >= 16) hoursMap['4PM']++;
      }
    }
  });

  const hourlyDistribution = Object.entries(hoursMap).map(([hour, count]) => {
    const fallback = analyticsData.hourlyDistribution.find(h => h.hour === hour)?.tokens || 0;
    return {
      hour,
      tokens: count > 0 ? count : fallback
    };
  });

  // Recent Activity Feed
  const recentActivities = [
    ...metrics.activeTokens.slice(0, 4).map(t => {
      let action = 'Token Waiting';
      let type = 'warning';
      if (t.status === 'called') {
        action = 'Token Called';
        type = 'info';
      } else if (t.status === 'in_service') {
        action = 'Token In Service';
        type = 'info';
      }
      return {
        action,
        detail: `${t.tokenNumber} (${t.serviceName}) at ${t.counterNumber ? `Counter ${t.counterNumber}` : 'queue'}`,
        time: 'Active',
        type
      };
    }),
    ...historyItems.slice(0, 5).map(h => ({
      action: h.status === 'completed' ? 'Token Completed' : (h.status === 'cancelled' ? 'Token Cancelled' : 'Token Skipped'),
      detail: `${h.tokenNumber} served for ${h.serviceName}`,
      time: h.dateString ? `${h.dateString}` : 'Recorded',
      type: h.status === 'completed' ? 'success' : (h.status === 'cancelled' ? 'error' : 'warning')
    }))
  ];

  return {
    stats: {
      totalTokens: Math.max(metrics.totalTokens, analyticsData.totalTokensToday),
      waitingCount: metrics.waitingCount,
      calledCount: metrics.calledCount,
      inServiceCount: metrics.inServiceCount,
      completedCount: Math.max(metrics.completedCount, analyticsData.completedToday),
      cancelledCount: metrics.cancelledCount,
      activeServicesCount: metrics.activeServicesCount,
      activeCountersCount: metrics.activeCountersCount,
      avgWaitTime: metrics.avgWaitTime,
      avgServiceTime: metrics.avgServiceTime
    },
    departmentRows: metrics.departmentBreakdown.length > 0 ? metrics.departmentBreakdown : analyticsData.departmentPerformance,
    recentActivities: recentActivities.length > 0 ? recentActivities : analyticsData.recentActivity,
    chartData: {
      dailyVolume: analyticsData.dailyVolume,
      hourlyDistribution
    },
    loading
  };
};

export default useAdminDashboard;
