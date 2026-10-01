import { db, doc, getDoc, setDoc, serverTimestamp } from '../firebase/firestore';

const DEFAULT_SETTINGS = {
  institutionName: 'Smart Campus University',
  queueStartTime: '09:00',
  queueEndTime: '16:30',
  maxTokensPerService: 50,
  tokenPrefix: true,
  autoResetDaily: true,
  smsEnabled: true,
  emailEnabled: true,
  pushEnabled: true,
  notifyBefore: 3,
  welcomeMessage: true,
  showEstimatedTime: true,
  showPeopleAhead: true,
  showCounterNumber: true,
  showServiceDescription: true,
  soundAlert: false,
};

export const getSystemSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data() };
    }
    // initialize defaults
    await setDoc(settingsRef, {
      ...DEFAULT_SETTINGS,
      updatedAt: serverTimestamp(),
    });
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('Error fetching system settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
};

export const updateSystemSettings = async (newSettings) => {
  try {
    const settingsRef = doc(db, 'settings', 'system');
    const dataToSave = {
      ...newSettings,
      updatedAt: serverTimestamp(),
    };
    await setDoc(settingsRef, dataToSave, { merge: true });
    return dataToSave;
  } catch (error) {
    console.error('Error saving system settings:', error);
    throw error;
  }
};
