import { auth } from '../firebase/config';
import {
  db,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from '../firebase/firestore';
import { getService, getServices } from './serviceService';
import { getQueue } from './queueService';
import { predictWaitingTime } from './mlService';

/**
 * AI Assistant Service - Grounded in Real Firestore SmartQueue Data
 * Never fabricates or hallucinates token, position, wait time, or campus locations.
 */

const getMillis = (t) => {
  if (!t) return 0;
  if (t.toMillis) return t.toMillis();
  if (t.seconds) return t.seconds * 1000;
  if (typeof t === 'number') return t;
  if (typeof t === 'string') {
    const parsed = Date.parse(t);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Fetch the active or most recent token for a user from Firestore
 */
export const getUserTokensData = async (explicitUserId = null) => {
  try {
    const userId = explicitUserId || auth.currentUser?.uid;
    if (!userId) {
      return { activeToken: null, latestToken: null, userId: null };
    }

    const q = query(
      collection(db, 'tokens'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return { activeToken: null, latestToken: null, userId };
    }

    const tokens = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Sort descending by creation time
    tokens.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));

    // Active tokens are waiting, called, or in_service / in-service
    const activeToken = tokens.find(t => {
      const st = String(t.status || '').toLowerCase().replace(/[-\s]/g, '_');
      return ['waiting', 'called', 'in_service'].includes(st);
    }) || null;

    return {
      activeToken,
      latestToken: tokens[0] || null,
      userId
    };
  } catch (error) {
    console.error('AI Queue Data Error:', error);
    throw error;
  }
};

/**
 * Calculate the exact queue position and people ahead for a waiting token
 */
export const calculateTokenPosition = async (activeToken) => {
  if (!activeToken || !activeToken.serviceId) {
    return { peopleAhead: 0, position: 1, waitingCount: 0 };
  }

  const normStatus = String(activeToken.status || '').toLowerCase().replace(/[-\s]/g, '_');
  if (normStatus === 'called' || normStatus === 'in_service') {
    return { peopleAhead: 0, position: 1, waitingCount: 0 };
  }

  try {
    const q = query(
      collection(db, 'tokens'),
      where('serviceId', '==', activeToken.serviceId)
    );
    const snap = await getDocs(q);
    const waitingTokens = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(t => {
        const st = String(t.status || '').toLowerCase().replace(/[-\s]/g, '_');
        return st === 'waiting';
      });

    // Sort by sequence or creation time ascending (FIFO)
    waitingTokens.sort((a, b) => {
      if (a.tokenSequence && b.tokenSequence) {
        return a.tokenSequence - b.tokenSequence;
      }
      return getMillis(a.createdAt) - getMillis(b.createdAt);
    });

    const tokenIdx = waitingTokens.findIndex(t => t.id === activeToken.id);
    let peopleAhead = 0;
    if (tokenIdx >= 0) {
      peopleAhead = tokenIdx;
    } else {
      const userSeq = activeToken.tokenSequence || 0;
      peopleAhead = waitingTokens.filter(t => (t.tokenSequence || 0) < userSeq).length;
    }

    return {
      peopleAhead: Math.max(0, peopleAhead),
      position: Math.max(1, peopleAhead + 1),
      waitingCount: waitingTokens.length
    };
  } catch (error) {
    console.error('AI Queue Data Error:', error);
    throw error;
  }
};

/**
 * Calculate or predict the wait time for a waiting token
 */
export const calculateTokenWaitTime = async (activeToken, peopleAhead) => {
  if (!activeToken || peopleAhead <= 0) {
    return { waitMinutes: 0, isNext: true, source: 'deterministic' };
  }

  try {
    let service = null;
    let queueMeta = null;

    try {
      service = await getService(activeToken.serviceId);
    } catch {}

    try {
      queueMeta = await getQueue(activeToken.serviceId);
    } catch {}

    const avgTime = Math.max(service?.averageServiceTime || 5, 1);
    const counters = Math.max(queueMeta?.activeCounters || service?.activeCounters || 1, 1);

    // Try ML prediction first
    try {
      const mlRes = await predictWaitingTime({
        peopleAhead,
        queueLength: peopleAhead + 1,
        activeCounters: counters,
        averageServiceTime: avgTime,
        serviceType: service?.departmentName || service?.name,
        serviceName: service?.name,
      });

      if (mlRes?.success && typeof mlRes.estimatedWait === 'number' && mlRes.estimatedWait > 0) {
        return {
          waitMinutes: Math.ceil(mlRes.estimatedWait),
          isNext: false,
          source: mlRes.predictionSource || 'ml',
          activeCounters: counters,
          averageServiceTime: avgTime
        };
      }
    } catch {}

    // Deterministic fallback: Math.ceil((peopleAhead * averageServiceTime) / activeCounters)
    const fallbackWait = Math.ceil((peopleAhead * avgTime) / counters);
    return {
      waitMinutes: fallbackWait,
      isNext: false,
      source: 'fallback',
      activeCounters: counters,
      averageServiceTime: avgTime
    };
  } catch (error) {
    console.error('AI Queue Data Error:', error);
    return { waitMinutes: Math.ceil(peopleAhead * 5), isNext: false, source: 'fallback' };
  }
};

/**
 * Handle "Which service has the shortest queue?" using real Firestore data
 */
export const getShortestQueueResponse = async () => {
  try {
    const services = await getServices();
    if (!services || services.length === 0) {
      return "Currently, no campus services are available.";
    }

    const snap = await getDocs(
      query(collection(db, 'tokens'), where('status', '==', 'waiting'))
    );
    const waitingTokens = snap.docs.map(d => d.data());

    if (waitingTokens.length === 0) {
      return "Currently, no students are waiting in the available service queues.";
    }

    // Count waiting tokens per service
    const counts = {};
    services.forEach(s => { counts[s.id] = 0; });
    waitingTokens.forEach(t => {
      if (t.serviceId) {
        counts[t.serviceId] = (counts[t.serviceId] || 0) + 1;
      }
    });

    // Filter to open services
    const openServices = services.filter(s => s.status !== 'closed');
    const targetServices = openServices.length > 0 ? openServices : services;

    // Sort by count ascending
    targetServices.sort((a, b) => (counts[a.id] || 0) - (counts[b.id] || 0));
    const shortest = targetServices[0];
    const count = counts[shortest.id] || 0;

    return `**${shortest.name}** currently has the shortest queue, with ${count} ${count === 1 ? 'student' : 'students'} waiting.`;
  } catch (error) {
    console.error('AI Queue Data Error:', error);
    return "I can't access live queue information right now. Please try again.";
  }
};

/**
 * Process a user query and generate a strictly data-grounded response.
 */
export const processAIQuery = async (queryText, explicitUserId = null) => {
  const text = (queryText || '').trim().toLowerCase();
  if (!text) {
    return "How can I help you today? You can ask about your queue position, wait time, counter, or campus services.";
  }

  try {
    // -------------------------------------------------------------
    // INTENT 1: Queue Position & People Ahead
    // -------------------------------------------------------------
    if (
      text.includes('queue position') ||
      text.includes('my position') ||
      text.includes('where am i in line') ||
      text.includes('where am i in the queue') ||
      text.includes('what is my position') ||
      text.includes('how many people are ahead') ||
      text.includes('how many people ahead') ||
      text.includes('people ahead') ||
      text.includes('who is ahead of me') ||
      text === 'position' ||
      text === 'my token' ||
      text.includes('what is my token') ||
      text.includes('what is my token number')
    ) {
      const { activeToken } = await getUserTokensData(explicitUserId);
      if (!activeToken) {
        return "You don't currently have an active queue token. Please join a service queue first.";
      }

      const normStatus = String(activeToken.status || '').toLowerCase().replace(/[-\s]/g, '_');
      const tokenNum = activeToken.tokenNumber || 'your token';
      const serviceName = activeToken.serviceName || 'the service';

      if (normStatus === 'called') {
        const counterStr = activeToken.counterNumber ? `Counter ${activeToken.counterNumber}` : 'the assigned counter';
        return `Your token **${tokenNum}** has been called! Please proceed to ${counterStr}.`;
      }

      if (normStatus === 'in_service') {
        const counterStr = activeToken.counterNumber ? `Counter ${activeToken.counterNumber}` : 'the counter';
        return `Your token **${tokenNum}** is currently being served at ${counterStr}.`;
      }

      // Waiting status
      const { peopleAhead, position } = await calculateTokenPosition(activeToken);

      // If user specifically asked only for their token number
      if (text.includes('what is my token') || text === 'my token') {
        return `Your current token is **${tokenNum}** for **${serviceName}**. You are #${position} in the queue with ${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead.`;
      }

      if (peopleAhead === 0) {
        return `Your current token is **${tokenNum}**. You are **#1 in the queue**, and your turn is next!`;
      }

      return `Your current token is **${tokenNum}**. You are **#${position} in the queue**, with **${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you**.`;
    }

    // -------------------------------------------------------------
    // INTENT 2: Estimated Wait Time
    // -------------------------------------------------------------
    if (
      text.includes('how long will i wait') ||
      text.includes('how long') ||
      text.includes('estimated wait') ||
      text.includes('wait time') ||
      text.includes('how much time') ||
      text.includes('when is my turn') ||
      text.includes('when will i be served')
    ) {
      const { activeToken } = await getUserTokensData(explicitUserId);
      if (!activeToken) {
        return "You don't currently have an active queue token. Please join a service queue first.";
      }

      const normStatus = String(activeToken.status || '').toLowerCase().replace(/[-\s]/g, '_');
      if (normStatus === 'called') {
        return `Your token **${activeToken.tokenNumber}** has already been called! Please proceed to the counter.`;
      }
      if (normStatus === 'in_service') {
        return `Your token **${activeToken.tokenNumber}** is currently being served at the counter.`;
      }

      const { peopleAhead } = await calculateTokenPosition(activeToken);
      if (peopleAhead === 0) {
        return "You're next in the queue.";
      }

      const { waitMinutes, activeCounters } = await calculateTokenWaitTime(activeToken, peopleAhead);
      const counterText = activeCounters ? ` across ${activeCounters} active ${activeCounters === 1 ? 'counter' : 'counters'}` : '';
      return `Based on current queue data, your estimated waiting time is approximately **~${waitMinutes} minutes** (${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead${counterText}).`;
    }

    // -------------------------------------------------------------
    // INTENT 3: Token Status
    // -------------------------------------------------------------
    if (
      text.includes('token status') ||
      text.includes('my status') ||
      text.includes('status of my token') ||
      text.includes("what's my status") ||
      text.includes('what is my status')
    ) {
      const { activeToken, latestToken } = await getUserTokensData(explicitUserId);
      const targetToken = activeToken || latestToken;

      if (!targetToken) {
        return "You don't currently have an active queue token. Please join a service queue first.";
      }

      const tokenNum = targetToken.tokenNumber || 'your token';
      const serviceName = targetToken.serviceName || 'Campus Service';
      const normStatus = String(targetToken.status || '').toLowerCase().replace(/[-\s]/g, '_');

      switch (normStatus) {
        case 'waiting':
          return `Your token **${tokenNum}** is currently **waiting** in the queue for **${serviceName}**.`;
        case 'called':
          return `Your token **${tokenNum}** has been **called**. Please proceed to the assigned counter.`;
        case 'in_service':
          return `Your token **${tokenNum}** is currently **being served**.`;
        case 'completed':
          return `Your service for token **${tokenNum}** has been **completed**.`;
        case 'cancelled':
          return `Your token **${tokenNum}** was **cancelled**.`;
        case 'skipped':
          return `Your token **${tokenNum}** was **skipped**.`;
        case 'no_show':
          return `Your token **${tokenNum}** was marked as a **no-show**.`;
        default:
          return `Your token **${tokenNum}** status is **${targetToken.status || 'unknown'}**.`;
      }
    }

    // -------------------------------------------------------------
    // INTENT 4: Counter Information
    // -------------------------------------------------------------
    if (
      text.includes('which counter') ||
      text.includes('what counter') ||
      text.includes('assigned counter') ||
      text.includes('counter number') ||
      text.includes('where do i go')
    ) {
      const { activeToken } = await getUserTokensData(explicitUserId);
      if (!activeToken) {
        return "You don't currently have an active queue token. Please join a service queue first.";
      }

      if (activeToken.counterNumber) {
        return `Your token **${activeToken.tokenNumber}** is assigned to **Counter ${activeToken.counterNumber}**.`;
      }

      return "The counter has not been assigned yet. Counters are assigned when your token is called.";
    }

    // -------------------------------------------------------------
    // INTENT 5: Service Information for current token
    // -------------------------------------------------------------
    if (
      text.includes('what service am i waiting for') ||
      text.includes('what service did i join') ||
      text.includes('my service') ||
      text.includes('which service am i in')
    ) {
      const { activeToken } = await getUserTokensData(explicitUserId);
      if (!activeToken) {
        return "You don't currently have an active queue token. Please join a service queue first.";
      }

      let serviceName = activeToken.serviceName;
      if (!serviceName && activeToken.serviceId) {
        const srv = await getService(activeToken.serviceId);
        serviceName = srv?.name;
      }

      return `You are currently waiting for **${serviceName || 'Campus Service'}** (Token: **${activeToken.tokenNumber}**).`;
    }

    // -------------------------------------------------------------
    // INTENT 6: Shortest Queue across all campus services
    // -------------------------------------------------------------
    if (
      text.includes('shortest queue') ||
      text.includes('least waiting') ||
      text.includes('fastest queue') ||
      text.includes('shortest line') ||
      text.includes('fastest service')
    ) {
      return await getShortestQueueResponse();
    }

    // -------------------------------------------------------------
    // INTENT 7: Examination section & Campus Locations (NO FABRICATION)
    // -------------------------------------------------------------
    if (
      text.includes('where is the examination section') ||
      text.includes('examination section') ||
      text.includes('exam section location') ||
      text.includes('where is exam')
    ) {
      // Check if location is stored in Firestore
      try {
        const services = await getServices();
        const examService = services.find(s => 
          (s.name || '').toLowerCase().includes('exam') || 
          (s.departmentName || '').toLowerCase().includes('exam')
        );
        if (examService?.location) {
          return `The Examination Section is located at: **${examService.location}**.`;
        }
      } catch {}

      // Section 9 strict requirement:
      return "I don't have the examination section location in the current SmartQueue data.";
    }

    if (
      text.includes('where is') ||
      text.includes('location of') ||
      text.includes('room number') ||
      text.includes('which floor') ||
      text.includes('which building')
    ) {
      // General location check - do NOT fabricate
      return "I don't have location or room information for that section in the current SmartQueue data.";
    }

    // -------------------------------------------------------------
    // INTENT 8: Service Availability / Status
    // -------------------------------------------------------------
    if (
      text.includes('is my service open') ||
      text.includes('is the service open') ||
      text.includes('service status')
    ) {
      const { activeToken } = await getUserTokensData(explicitUserId);
      if (activeToken?.serviceId) {
        const srv = await getService(activeToken.serviceId);
        if (srv) {
          return `**${srv.name}** is currently **${srv.status || 'open'}**.`;
        }
      }
      return "Please check the Services page to see the real-time operational status of all campus services.";
    }

    // -------------------------------------------------------------
    // INTENT 9: General Educational Knowledge (No Live Data Hallucinations)
    // -------------------------------------------------------------
    if (text.includes('what is a digital queue') || text.includes('digital queue')) {
      return "A digital queue replaces physical waiting lines with virtual tokens. You receive a digital ticket on your phone and can relax or study anywhere on campus while tracking your live position in real-time.";
    }

    if (text.includes('how does smartqueue work') || text.includes('how it works') || text.includes('how does this work')) {
      return "SmartQueue makes campus visits effortless:\n1. **Select a Service:** Browse available services on the Services page.\n2. **Get a Token:** Join the queue to receive an instant digital token without registration.\n3. **Track Live:** Monitor your position and estimated wait time remotely.\n4. **Get Served:** Head to the assigned counter once your token is called!";
    }

    if (text.includes('estimated waiting time') || text.includes('how is wait time calculated')) {
      return "Estimated wait time is calculated dynamically based on the number of students ahead of you, the service's average completion time, and the number of active staff counters, enhanced with Machine Learning predictions.";
    }

    if (text.includes('how should i prepare') || text.includes('prepare before visiting') || text.includes('what to bring')) {
      return "Before visiting the counter, make sure you have your student ID card and any relevant documentation (e.g., receipts, forms, or clearance slips). Keep an eye on your live token status so you can arrive promptly when your token is called.";
    }

    if (text.includes('how to cancel') || text.includes('cancel token') || text.includes('cancel my queue')) {
      return "You can cancel your queue position at any time by visiting the **My Token** or **Dashboard** page and clicking the 'Cancel Queue' button.";
    }

    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      return "Hello! I am your Smart Campus Assistant. You can ask me about your queue position, estimated wait time, token status, assigned counter, or campus services.";
    }

    // Fallback response: strictly neutral and helpful, no made-up data
    return "I can help you with live queue information (such as your queue position, estimated wait time, token status, and assigned counter) or campus services. Try asking: *'What is my queue position?'* or *'Which service has the shortest queue?'*";
  } catch (error) {
    console.error("AI Queue Data Error:", error);
    return "I can't access your live queue information right now. Please try again.";
  }
};
