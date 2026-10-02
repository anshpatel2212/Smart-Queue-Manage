/**
 * Deterministic Queue Calculations
 * Formula: ETA = (People Ahead × Average Service Time) / Active Counters
 */

/**
 * Calculates estimated wait time in minutes.
 * Formula: Math.ceil((peopleAhead * averageServiceTime) / activeCounters)
 * @param {number} peopleAhead Number of people waiting ahead in line
 * @param {number} averageServiceTime Average service duration in minutes (default 5)
 * @param {number} activeCounters Number of active counters serving this queue (default 1)
 * @returns {number} Estimated waiting time in minutes (0 if 0 people ahead)
 */
export const calculateEstimatedWaitTime = (
  peopleAhead = 0,
  averageServiceTime = 5,
  activeCounters = 1
) => {
  const counters = Math.max(activeCounters || 1, 1);
  const people = Math.max(peopleAhead || 0, 0);
  const serviceTime = Math.max(averageServiceTime || 0, 0);

  if (people === 0) return 0;

  return Math.ceil((people * serviceTime) / counters);
};

/**
 * Returns user-facing string for estimated wait according to token status and queue depth.
 * @param {string} status Token status ('waiting', 'called', 'in_service', 'completed', 'cancelled', 'skipped', 'no_show')
 * @param {number} peopleAhead Number of waiting tokens ahead of the student
 * @param {number} estimatedWait Dynamically computed estimated wait time
 * @returns {string} Formatted display string
 */
export const getEstimatedWaitDisplay = (status = 'waiting', peopleAhead = 0, estimatedWait = 0) => {
  const normStatus = (status || '').toLowerCase().replace(/[-\s]/g, '_');

  switch (normStatus) {
    case 'called':
      return 'Called — Proceed to Counter';
    case 'in_service':
      return 'In Service';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'skipped':
      return 'Skipped';
    case 'no_show':
      return 'No Show';
    case 'waiting':
    default:
      if (Math.max(peopleAhead || 0, 0) === 0) {
        return 'Your turn is next';
      }
      return `~${Math.max(1, estimatedWait || 0)} min`;
  }
};

/**
 * Formats wait time into human readable string.
 * @param {number} minutes 
 * @returns {string} e.g. "~8 min" or "Your turn is next"
 */
export const formatWaitTime = (minutes) => {
  if (minutes <= 0) return 'Your turn is next';
  return `~${minutes} min`;
};

/**
 * Calculates position in line given an ordered list of active tokens.
 * @param {Array} activeTokens Ordered list of tokens (by sequence or createdAt)
 * @param {string} tokenId Target token ID
 * @returns {number} 1-based position, or 0 if not found
 */
export const calculateQueuePosition = (activeTokens = [], tokenId) => {
  if (!activeTokens || !tokenId) return 0;
  const index = activeTokens.findIndex((t) => t.id === tokenId || t.tokenId === tokenId);
  return index >= 0 ? index + 1 : 0;
};
