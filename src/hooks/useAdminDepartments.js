import { useState, useEffect } from 'react';
import {
  subscribeDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus
} from '../services/departmentService';

export const useAdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const unsub = subscribeDepartments((items) => {
      if (mounted) {
        setDepartments(items);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const addDepartment = async (data) => {
    try {
      setError(null);
      return await createDepartment(data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editDepartment = async (id, data) => {
    try {
      setError(null);
      return await updateDepartment(id, data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeDepartment = async (id) => {
    try {
      setError(null);
      return await deleteDepartment(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      return await toggleDepartmentStatus(id, currentStatus);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    departments,
    loading,
    error,
    addDepartment,
    editDepartment,
    removeDepartment,
    toggleStatus
  };
};

export default useAdminDepartments;
