import { db, doc, getDoc, setDoc, getDocs, collection, serverTimestamp } from '../firebase/firestore';

export const INITIAL_DEPARTMENTS = [
  {
    id: 'examination',
    name: 'Examination',
    description: 'Exam scheduling, hall tickets, grade verification, and revaluation',
    status: 'active',
    activeCounters: 2,
    totalCounters: 3,
    icon: 'FileText'
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Tuition fees, dues clearance, receipts, scholarships, and refunds',
    status: 'active',
    activeCounters: 2,
    totalCounters: 2,
    icon: 'Banknote'
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Book borrowing, returns, catalog access, fines, and clearances',
    status: 'active',
    activeCounters: 1,
    totalCounters: 2,
    icon: 'BookOpen'
  },
  {
    id: 'student_admin',
    name: 'Student Administration',
    description: 'Bonafide certificates, enrollment verification, degree collection, and NOCs',
    status: 'active',
    activeCounters: 1,
    totalCounters: 2,
    icon: 'GraduationCap'
  },
  {
    id: 'it_support',
    name: 'IT Support',
    description: 'Campus Wi-Fi credentials, portal access, institutional email, and software',
    status: 'active',
    activeCounters: 1,
    totalCounters: 2,
    icon: 'Monitor'
  },
  {
    id: 'id_card',
    name: 'ID Card Section',
    description: 'Smart campus ID card issuance, badge replacements, and RFID encoding',
    status: 'closed',
    activeCounters: 0,
    totalCounters: 1,
    icon: 'CreditCard'
  }
];

export const INITIAL_SERVICES = [
  {
    id: 'exam_hall_ticket',
    name: 'Exam Hall Ticket',
    departmentId: 'examination',
    departmentName: 'Examination',
    description: 'Collect, verify, or reprint your official semester hall ticket',
    averageServiceTime: 5,
    activeCounters: 2,
    status: 'open',
    prefix: 'E',
    icon: 'Ticket'
  },
  {
    id: 'result_revaluation',
    name: 'Result Revaluation',
    departmentId: 'examination',
    departmentName: 'Examination',
    description: 'Submit subject re-evaluation and paper verification requests',
    averageServiceTime: 8,
    activeCounters: 1,
    status: 'open',
    prefix: 'E',
    icon: 'FileText'
  },
  {
    id: 'fee_payment',
    name: 'Fee Payment',
    departmentId: 'finance',
    departmentName: 'Finance',
    description: 'Settle tuition, hostel, examination fees, or request receipts',
    averageServiceTime: 4,
    activeCounters: 2,
    status: 'open',
    prefix: 'F',
    icon: 'Banknote'
  },
  {
    id: 'scholarship_application',
    name: 'Scholarship Application',
    departmentId: 'finance',
    departmentName: 'Finance',
    description: 'Submit or verify campus and government scholarship applications',
    averageServiceTime: 10,
    activeCounters: 1,
    status: 'open',
    prefix: 'F',
    icon: 'Award'
  },
  {
    id: 'book_issue_return',
    name: 'Book Issue & Return',
    departmentId: 'library',
    departmentName: 'Library',
    description: 'Check out new curriculum books or return existing borrowed texts',
    averageServiceTime: 3,
    activeCounters: 1,
    status: 'open',
    prefix: 'L',
    icon: 'BookOpen'
  },
  {
    id: 'library_clearance',
    name: 'Library Clearance',
    departmentId: 'library',
    departmentName: 'Library',
    description: 'Obtain official no-dues clearance certificate for semester/graduation',
    averageServiceTime: 5,
    activeCounters: 1,
    status: 'open',
    prefix: 'L',
    icon: 'BookOpen'
  },
  {
    id: 'bonafide_certificate',
    name: 'Bonafide Certificate',
    departmentId: 'student_admin',
    departmentName: 'Student Administration',
    description: 'Request authentic bonafide or study certificates for passports/visas',
    averageServiceTime: 6,
    activeCounters: 1,
    status: 'open',
    prefix: 'A',
    icon: 'FileCheck'
  },
  {
    id: 'transfer_certificate',
    name: 'Transfer Certificate (TC)',
    departmentId: 'student_admin',
    departmentName: 'Student Administration',
    description: 'Process academic relocation or graduation transfer certificates',
    averageServiceTime: 10,
    activeCounters: 1,
    status: 'open',
    prefix: 'A',
    icon: 'FileCheck'
  },
  {
    id: 'wifi_email_support',
    name: 'Wi-Fi & Email Access',
    departmentId: 'it_support',
    departmentName: 'IT Support',
    description: 'Campus network onboarding, email reset, and lab account help',
    averageServiceTime: 5,
    activeCounters: 1,
    status: 'open',
    prefix: 'IT',
    icon: 'Monitor'
  },
  {
    id: 'new_id_card',
    name: 'New ID Card & Replacement',
    departmentId: 'id_card',
    departmentName: 'ID Card Section',
    description: 'First-year student badge issuance or replacement for lost RFID cards',
    averageServiceTime: 7,
    activeCounters: 0,
    status: 'closed',
    prefix: 'ID',
    icon: 'CreditCard'
  }
];

/**
 * Checks if departments and services exist in Firestore.
 * If empty, seeds initial data without duplicating documents.
 */
export const seedInitialDataIfEmpty = async () => {
  try {
    const deptSnap = await getDocs(collection(db, 'departments'));
    if (deptSnap.empty) {
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', dept.id), {
          ...dept,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }

    const srvSnap = await getDocs(collection(db, 'services'));
    if (srvSnap.empty) {
      for (const srv of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', srv.id), {
          ...srv,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Initialize queue tracker for each service
        const queueRef = doc(db, 'queues', srv.id);
        const queueDoc = await getDoc(queueRef);
        if (!queueDoc.exists()) {
          await setDoc(queueRef, {
            serviceId: srv.id,
            departmentId: srv.departmentId,
            prefix: srv.prefix,
            currentTokenNumber: null,
            currentTokenSequence: 0,
            nextTokenSequence: 1,
            activeCounters: srv.activeCounters || 1,
            status: srv.status,
            waitingCount: 0,
            updatedAt: serverTimestamp()
          });
        }
      }
    }
  } catch (error) {
    console.warn('Initial seeding skipped or Firestore permission pending:', error.message);
  }
};
