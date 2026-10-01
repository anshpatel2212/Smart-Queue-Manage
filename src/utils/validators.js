/**
 * Data validation helpers for Smart Queue Manager
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string') return false;
  return studentId.trim().length >= 3;
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};
