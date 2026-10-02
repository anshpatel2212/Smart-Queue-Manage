import { calculateEstimatedWaitTime } from '../utils/queueCalculations';

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:8000';

/**
 * Service to interface with the Python FastAPI Machine Learning Wait Time Model
 */

/**
 * Checks health and connectivity of the ML service.
 * @returns {Promise<{ status: string, modelLoaded: boolean }>}
 */
export const checkMLHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${ML_API_BASE_URL}/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        status: data.status,
        modelLoaded: Boolean(data.model_loaded)
      };
    }
    return { status: 'offline', modelLoaded: false };
  } catch {
    return { status: 'offline', modelLoaded: false };
  }
};

/**
 * Predicts estimated waiting time using the trained ML model with deterministic fallback.
 * @param {Object} params
 * @param {number} params.peopleAhead Number of people waiting ahead in queue
 * @param {number} [params.queueLength] Total queue length
 * @param {number} [params.activeCounters=1] Active counter count
 * @param {number} [params.averageServiceTime=5] Expected average service duration
 * @param {string} [params.serviceType] Service category or name
 * @param {string} [params.serviceName] Raw service name
 * @returns {Promise<{ estimatedWait: number, predictionSource: 'ml'|'fallback', error?: string }>}
 */
export const predictWaitingTime = async ({
  peopleAhead = 0,
  queueLength = null,
  activeCounters = 1,
  averageServiceTime = 5,
  serviceType = null,
  serviceName = null,
}) => {
  const safeAhead = Math.max(0, parseInt(peopleAhead, 10) || 0);
  const safeCounters = Math.max(1, parseInt(activeCounters, 10) || 1);
  const safeAvgTime = Math.max(1, parseFloat(averageServiceTime) || 5.0);
  const safeQueueLength = queueLength !== null 
    ? Math.max(safeAhead, parseInt(queueLength, 10) || safeAhead + 1)
    : safeAhead + 1;

  // Immediate deterministic return for 0 people ahead
  if (safeAhead === 0) {
    return {
      estimatedWait: 0,
      predictionSource: 'deterministic',
    };
  }

  // Fallback calculation in case ML server is unreachable
  const fallbackWait = calculateEstimatedWaitTime(safeAhead, safeAvgTime, safeCounters);

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun
    const isPeakHour = currentHour >= 10 && currentHour <= 14 ? 1 : 0;
    const peakFactor = isPeakHour ? 1.2 : 1.0;

    const payload = {
      people_ahead: safeAhead,
      queue_length: safeQueueLength,
      active_counters: safeCounters,
      avg_service_time: safeAvgTime,
      hour: currentHour,
      day_of_week: currentDay,
      service_type: serviceType || serviceName || 'Examination Cell',
      service_name: serviceName || serviceType || '',
      is_peak_hour: isPeakHour,
      peak_factor: peakFactor
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s network timeout

    const response = await fetch(`${ML_API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (result.success && typeof result.estimated_wait_minutes === 'number') {
        const predicted = Math.round(result.estimated_wait_minutes);
        return {
          estimatedWait: safeAhead === 0 ? 0 : Math.max(1, predicted),
          predictionSource: 'ml',
          featuresUsed: result.features_used
        };
      }
    }

    // Server responded but indicated failure
    return {
      estimatedWait: fallbackWait,
      predictionSource: 'fallback',
      error: 'ML model prediction returned fallback'
    };
  } catch (error) {
    // Network failure, timeout, or server offline -> graceful fallback
    return {
      estimatedWait: fallbackWait,
      predictionSource: 'fallback',
      error: error.name === 'AbortError' ? 'ML prediction timeout' : 'ML API unavailable'
    };
  }
};
