/**
 * Deterministic Queue Calculations
 * Formula: ETA = (People Ahead × Average Service Time) / Active Counters
 */

/**
 * Calculates estimated wait time in minutes.
 * @param {number} peopleAhead Number of people waiting ahead in line
 * @param {number} averageServiceTime Average service duration in minutes (default 5)
 * @param {number} activeCounters Number of active counters serving this queue (default 1)
 * @returns {number} Estimated waiting time in minutes (minimum 0)
 */
export const calculateEstimatedWaitTime = (
  peopleAhead = 0,
  averageServiceTime = 5,
  activeCounters = 1
) => {
  const safeAhead = Math.max(0, parseInt(peopleAhead, 10) || 0);
  const safeAvgTime = Math.max(1, parseInt(averageServiceTime, 10) || 5);
  const safeCounters = Math.max(1, parseInt(activeCounters, 10) || 1);

  if (safeAhead === 0) return 0;

  const waitMinutes = Math.ceil((safeAhead * safeAvgTime) / safeCounters);
  return Math.max(1, waitMinutes);
};

/**
 * Formats wait time into human readable string.
 * @param {number} minutes 
 * @returns {string} e.g. "12 min" or "< 1 min"
 */
export const formatWaitTime = (minutes) => {
  if (minutes <= 0) return 'Immediate';
  if (minutes < 1) return '< 1 min';
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr`;
  }
  return `${minutes} min`;
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
