// Students
export const students = [
  { id: 'STU001', name: 'Arjun Mehta', email: 'arjun.mehta@smartcampus.edu', department: 'Computer Science', avatar: null, phone: '+91 98765 43210', enrollmentYear: 2024 },
  { id: 'STU002', name: 'Priya Sharma', email: 'priya.sharma@smartcampus.edu', department: 'Electronics', avatar: null, phone: '+91 98765 43211', enrollmentYear: 2023 },
  { id: 'STU003', name: 'Rahul Patel', email: 'rahul.patel@smartcampus.edu', department: 'Mechanical', avatar: null, phone: '+91 98765 43212', enrollmentYear: 2024 },
  { id: 'STU004', name: 'Sneha Reddy', email: 'sneha.reddy@smartcampus.edu', department: 'Civil', avatar: null, phone: '+91 98765 43213', enrollmentYear: 2023 },
  { id: 'STU005', name: 'Vikram Singh', email: 'vikram.singh@smartcampus.edu', department: 'Computer Science', avatar: null, phone: '+91 98765 43214', enrollmentYear: 2025 },
];

// Current user (student)
export const currentStudent = students[0];

// Staff members
export const staffMembers = [
  { id: 'STF001', name: 'Dr. Kavitha Nair', email: 'kavitha.nair@smartcampus.edu', department: 'Examination', role: 'Senior Staff', status: 'active', counter: 1, avatar: null },
  { id: 'STF002', name: 'Ramesh Kumar', email: 'ramesh.kumar@smartcampus.edu', department: 'Finance', role: 'Clerk', status: 'active', counter: 2, avatar: null },
  { id: 'STF003', name: 'Anita Desai', email: 'anita.desai@smartcampus.edu', department: 'Library', role: 'Librarian', status: 'active', counter: 1, avatar: null },
  { id: 'STF004', name: 'Suresh Babu', email: 'suresh.babu@smartcampus.edu', department: 'Student Administration', role: 'Admin Officer', status: 'active', counter: 1, avatar: null },
  { id: 'STF005', name: 'Meera Joshi', email: 'meera.joshi@smartcampus.edu', department: 'IT Support', role: 'Technical Lead', status: 'break', counter: null, avatar: null },
  { id: 'STF006', name: 'Deepak Verma', email: 'deepak.verma@smartcampus.edu', department: 'Examination', role: 'Staff', status: 'active', counter: 2, avatar: null },
  { id: 'STF007', name: 'Pooja Mishra', email: 'pooja.mishra@smartcampus.edu', department: 'Finance', role: 'Senior Clerk', status: 'offline', counter: null, avatar: null },
];

export const currentStaff = staffMembers[0];

// Departments
export const departments = [
  { id: 'DEP001', name: 'Examination', description: 'Exam scheduling, results, hall tickets, revaluation', status: 'active', activeCounters: 2, totalCounters: 3, currentQueue: 12, icon: 'FileText' },
  { id: 'DEP002', name: 'Finance', description: 'Fee payments, scholarships, refunds, receipts', status: 'active', activeCounters: 2, totalCounters: 2, currentQueue: 8, icon: 'Banknote' },
  { id: 'DEP003', name: 'Library', description: 'Book issue/return, membership, clearance', status: 'active', activeCounters: 1, totalCounters: 2, currentQueue: 5, icon: 'BookOpen' },
  { id: 'DEP004', name: 'Student Administration', description: 'Certificates, bonafide, TC, admission queries', status: 'active', activeCounters: 1, totalCounters: 2, currentQueue: 15, icon: 'GraduationCap' },
  { id: 'DEP005', name: 'IT Support', description: 'WiFi, email, ERP access, lab issues', status: 'active', activeCounters: 1, totalCounters: 2, currentQueue: 3, icon: 'Monitor' },
  { id: 'DEP006', name: 'ID Card Section', description: 'New ID cards, replacement, photo update', status: 'closed', activeCounters: 0, totalCounters: 1, currentQueue: 0, icon: 'CreditCard' },
];

// Services
export const services = [
  { id: 'SRV001', name: 'Exam Hall Ticket', department: 'Examination', description: 'Collect or reprint your examination hall ticket', estimatedServiceTime: 5, currentQueue: 7, estimatedWait: 25, status: 'open', counters: 2, icon: 'Ticket' },
  { id: 'SRV002', name: 'Result Revaluation', department: 'Examination', description: 'Apply for result revaluation or verification', estimatedServiceTime: 8, currentQueue: 5, estimatedWait: 30, status: 'open', counters: 1, icon: 'FileSearch' },
  { id: 'SRV003', name: 'Fee Payment', department: 'Finance', description: 'Pay tuition fees, hostel fees, or exam fees', estimatedServiceTime: 4, currentQueue: 8, estimatedWait: 20, status: 'open', counters: 2, icon: 'Banknote' },
  { id: 'SRV004', name: 'Scholarship Application', department: 'Finance', description: 'Submit or follow up on scholarship applications', estimatedServiceTime: 10, currentQueue: 3, estimatedWait: 20, status: 'open', counters: 1, icon: 'Award' },
  { id: 'SRV005', name: 'Book Issue / Return', department: 'Library', description: 'Issue new books or return borrowed ones', estimatedServiceTime: 3, currentQueue: 5, estimatedWait: 10, status: 'open', counters: 1, icon: 'BookOpen' },
  { id: 'SRV006', name: 'Library Clearance', department: 'Library', description: 'Get your library clearance certificate', estimatedServiceTime: 5, currentQueue: 2, estimatedWait: 8, status: 'open', counters: 1, icon: 'BookCheck' },
  { id: 'SRV007', name: 'Bonafide Certificate', department: 'Student Administration', description: 'Request a bonafide or enrollment certificate', estimatedServiceTime: 6, currentQueue: 10, estimatedWait: 40, status: 'open', counters: 1, icon: 'FileCheck' },
  { id: 'SRV008', name: 'Transfer Certificate', department: 'Student Administration', description: 'Apply for a transfer certificate (TC)', estimatedServiceTime: 10, currentQueue: 5, estimatedWait: 35, status: 'open', counters: 1, icon: 'FilePlus' },
  { id: 'SRV009', name: 'WiFi / Email Access', department: 'IT Support', description: 'Get help with campus WiFi or email account', estimatedServiceTime: 5, currentQueue: 3, estimatedWait: 10, status: 'open', counters: 1, icon: 'Wifi' },
  { id: 'SRV010', name: 'New ID Card', department: 'ID Card Section', description: 'Apply for a new student ID card', estimatedServiceTime: 7, currentQueue: 0, estimatedWait: 0, status: 'closed', counters: 0, icon: 'CreditCard' },
];

// Active token for current student
export const activeToken = {
  tokenNumber: 'E-047',
  service: 'Exam Hall Ticket',
  department: 'Examination',
  counter: 2,
  status: 'waiting', // waiting, in-service, completed, cancelled, skipped
  currentlyServing: 'E-043',
  peopleAhead: 4,
  estimatedWait: 12,
  joinedAt: '2026-09-30T10:30:00',
  queueProgress: ['E-043', 'E-044', 'E-045', 'E-046', 'E-047'],
};

// Queue for staff view
export const queueItems = [
  { id: 'Q001', tokenNumber: 'E-043', studentName: 'Sneha Reddy', studentId: 'STU004', status: 'in-service', waitingTime: '2 min', counter: 1, service: 'Exam Hall Ticket' },
  { id: 'Q002', tokenNumber: 'E-044', studentName: 'Vikram Singh', studentId: 'STU005', status: 'waiting', waitingTime: '8 min', counter: null, service: 'Exam Hall Ticket' },
  { id: 'Q003', tokenNumber: 'E-045', studentName: 'Rahul Patel', studentId: 'STU003', status: 'waiting', waitingTime: '10 min', counter: null, service: 'Exam Hall Ticket' },
  { id: 'Q004', tokenNumber: 'E-046', studentName: 'Priya Sharma', studentId: 'STU002', status: 'waiting', waitingTime: '12 min', counter: null, service: 'Exam Hall Ticket' },
  { id: 'Q005', tokenNumber: 'E-047', studentName: 'Arjun Mehta', studentId: 'STU001', status: 'waiting', waitingTime: '15 min', counter: null, service: 'Exam Hall Ticket' },
  { id: 'Q006', tokenNumber: 'E-048', studentName: 'Anil Kumar', studentId: 'STU006', status: 'waiting', waitingTime: '18 min', counter: null, service: 'Exam Hall Ticket' },
  { id: 'Q007', tokenNumber: 'E-049', studentName: 'Kavya Nair', studentId: 'STU007', status: 'waiting', waitingTime: '20 min', counter: null, service: 'Exam Hall Ticket' },
];

// Notifications for student
export const notifications = [
  { id: 'N001', type: 'queue', title: 'Queue Update', message: 'Your token E-047 is now 4 positions away. Estimated wait: 12 minutes.', time: '2 min ago', read: false, icon: 'Clock' },
  { id: 'N002', type: 'alert', title: 'Counter Change', message: 'Your service has been assigned to Counter 2.', time: '10 min ago', read: false, icon: 'ArrowRight' },
  { id: 'N003', type: 'info', title: 'Service Reminder', message: 'Please keep your hall ticket receipt ready for verification.', time: '15 min ago', read: true, icon: 'Info' },
  { id: 'N004', type: 'success', title: 'Token Generated', message: 'Your token E-047 has been successfully generated for Exam Hall Ticket service.', time: '30 min ago', read: true, icon: 'CheckCircle' },
  { id: 'N005', type: 'queue', title: 'Queue Joined', message: 'You have joined the Examination queue. Your position: 8', time: '30 min ago', read: true, icon: 'Users' },
  { id: 'N006', type: 'info', title: 'Campus Notice', message: 'Library services will be closed tomorrow for inventory. Plan accordingly.', time: '1 hr ago', read: true, icon: 'AlertCircle' },
];

// Queue history for student
export const queueHistory = [
  { id: 'H001', tokenNumber: 'E-032', service: 'Fee Payment', department: 'Finance', date: '2026-09-28', joinedAt: '09:15 AM', servedAt: '09:35 AM', status: 'completed', waitTime: '20 min', counter: 1 },
  { id: 'H002', tokenNumber: 'L-015', service: 'Book Issue / Return', department: 'Library', date: '2026-09-25', joinedAt: '02:30 PM', servedAt: '02:42 PM', status: 'completed', waitTime: '12 min', counter: 1 },
  { id: 'H003', tokenNumber: 'A-008', service: 'Bonafide Certificate', department: 'Student Administration', date: '2026-09-22', joinedAt: '11:00 AM', servedAt: '11:45 AM', status: 'completed', waitTime: '45 min', counter: 1 },
  { id: 'H004', tokenNumber: 'E-021', service: 'Result Revaluation', department: 'Examination', date: '2026-09-20', joinedAt: '10:00 AM', servedAt: null, status: 'cancelled', waitTime: '-', counter: null },
  { id: 'H005', tokenNumber: 'F-011', service: 'Scholarship Application', department: 'Finance', date: '2026-09-18', joinedAt: '03:00 PM', servedAt: '03:30 PM', status: 'completed', waitTime: '30 min', counter: 2 },
];

// Staff service history
export const serviceHistory = [
  { id: 'SH001', tokenNumber: 'E-042', studentName: 'Anil Kumar', service: 'Exam Hall Ticket', startTime: '10:15 AM', endTime: '10:20 AM', duration: '5 min', status: 'completed', date: '2026-09-30' },
  { id: 'SH002', tokenNumber: 'E-041', studentName: 'Kavya Nair', service: 'Exam Hall Ticket', startTime: '10:08 AM', endTime: '10:14 AM', duration: '6 min', status: 'completed', date: '2026-09-30' },
  { id: 'SH003', tokenNumber: 'E-040', studentName: 'Deepa Pillai', service: 'Exam Hall Ticket', startTime: '10:00 AM', endTime: '10:07 AM', duration: '7 min', status: 'completed', date: '2026-09-30' },
  { id: 'SH004', tokenNumber: 'E-039', studentName: 'Rohit Saxena', service: 'Result Revaluation', startTime: '09:50 AM', endTime: '09:58 AM', duration: '8 min', status: 'completed', date: '2026-09-30' },
  { id: 'SH005', tokenNumber: 'E-038', studentName: 'Nisha Gupta', service: 'Exam Hall Ticket', startTime: '09:42 AM', endTime: '09:48 AM', duration: '6 min', status: 'skipped', date: '2026-09-30' },
];

// Analytics data
export const analyticsData = {
  totalTokensToday: 156,
  completedToday: 98,
  currentlyWaiting: 43,
  cancelledToday: 15,
  avgWaitTime: 18,
  avgServiceTime: 6,
  peakHour: '10:00 AM - 11:00 AM',
  dailyVolume: [
    { day: 'Mon', tokens: 142 },
    { day: 'Tue', tokens: 168 },
    { day: 'Wed', tokens: 155 },
    { day: 'Thu', tokens: 189 },
    { day: 'Fri', tokens: 134 },
    { day: 'Sat', tokens: 78 },
  ],
  hourlyDistribution: [
    { hour: '9AM', tokens: 22 },
    { hour: '10AM', tokens: 35 },
    { hour: '11AM', tokens: 28 },
    { hour: '12PM', tokens: 18 },
    { hour: '1PM', tokens: 8 },
    { hour: '2PM', tokens: 25 },
    { hour: '3PM', tokens: 20 },
    { hour: '4PM', tokens: 12 },
  ],
  departmentPerformance: [
    { name: 'Examination', tokens: 45, avgWait: 20, completed: 38, satisfaction: 4.2 },
    { name: 'Finance', tokens: 32, avgWait: 15, completed: 28, satisfaction: 4.5 },
    { name: 'Library', tokens: 18, avgWait: 8, completed: 16, satisfaction: 4.7 },
    { name: 'Student Admin', tokens: 40, avgWait: 35, completed: 30, satisfaction: 3.8 },
    { name: 'IT Support', tokens: 12, avgWait: 10, completed: 10, satisfaction: 4.4 },
  ],
  weeklyTrend: [
    { week: 'W1', tokens: 680, avgWait: 22 },
    { week: 'W2', tokens: 720, avgWait: 20 },
    { week: 'W3', tokens: 695, avgWait: 18 },
    { week: 'W4', tokens: 756, avgWait: 17 },
  ],
  recentActivity: [
    { id: 'RA001', action: 'Token Completed', detail: 'E-042 served at Counter 1', time: '2 min ago', type: 'success' },
    { id: 'RA002', action: 'New Token', detail: 'E-048 joined Examination queue', time: '5 min ago', type: 'info' },
    { id: 'RA003', action: 'Token Skipped', detail: 'F-019 skipped at Counter 2', time: '8 min ago', type: 'warning' },
    { id: 'RA004', action: 'Counter Opened', detail: 'Library Counter 2 is now active', time: '15 min ago', type: 'info' },
    { id: 'RA005', action: 'Token Cancelled', detail: 'A-012 cancelled by student', time: '20 min ago', type: 'error' },
  ],
};

// AI Chat mock messages
export const aiChatMessages = [
  { id: 'AI001', role: 'assistant', message: 'Hello! I\'m your Smart Campus Assistant. I can help you with queue information, campus services, and general queries. How can I help you today?', time: '10:00 AM' },
];

export const aiSuggestedQuestions = [
  'What is my queue position?',
  'How long will I wait?',
  'Which service has the shortest queue?',
  'Where is the examination section?',
];

export const aiMockResponses = {};

// Admin settings
export const adminSettings = {
  general: {
    institutionName: 'Smart Campus University',
    queueStartTime: '09:00',
    queueEndTime: '16:30',
    maxTokensPerService: 50,
    tokenPrefix: true,
    autoResetDaily: true,
  },
  notifications: {
    enableSMS: true,
    enableEmail: true,
    enablePush: true,
    notifyBefore: 3,
    sendWelcome: true,
  },
  display: {
    showEstimatedTime: true,
    showPeopleAhead: true,
    showCounterNumber: true,
    showServiceDescription: true,
    enableSoundAlert: false,
  },
};
