import { useState, useEffect } from 'react';
import {
  subscribeStaffMembers,
  updateStaffMember,
  toggleStaffStatus,
  approveStaffMember,
  assignStaffDepartment
} from '../services/staffService';
import { subscribeDepartments } from '../services/departmentService';

export const useAdminStaff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const unsubStaff = subscribeStaffMembers((staffList) => {
      if (mounted) {
        setStaffMembers(staffList);
        setLoading(false);
      }
    });

    const unsubDepts = subscribeDepartments((depts) => {
      if (mounted) {
        setDepartments(depts);
      }
    });

    return () => {
      mounted = false;
      unsubStaff();
      unsubDepts();
    };
  }, []);

  const updateStaff = async (uid, data) => {
    try {
      setError(null);
      return await updateStaffMember(uid, data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleStatus = async (uid, currentStatus) => {
    try {
      setError(null);
      return await toggleStaffStatus(uid, currentStatus);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const approveStaff = async (uid) => {
    try {
      setError(null);
      return await approveStaffMember(uid);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const assignDepartment = async (uid, deptId, counter = 1) => {
    try {
      setError(null);
      return await assignStaffDepartment(uid, deptId, counter);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    staffMembers,
    departments,
    loading,
    error,
    updateStaff,
    toggleStatus,
    approveStaff,
    assignDepartment
  };
};

export default useAdminStaff;
