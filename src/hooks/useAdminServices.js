import { useState, useEffect } from 'react';
import {
  subscribeServices,
  subscribeDepartments,
  createService,
  updateService,
  deleteService
} from '../services/serviceService';

export const useAdminServices = () => {
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const unsubServices = subscribeServices((items) => {
      if (mounted) {
        setServices(items);
        setLoading(false);
      }
    });

    const unsubDepts = subscribeDepartments((items) => {
      if (mounted) {
        setDepartments(items);
      }
    });

    return () => {
      mounted = false;
      unsubServices();
      unsubDepts();
    };
  }, []);

  const addService = async (data) => {
    try {
      setError(null);
      return await createService(data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editService = async (id, data) => {
    try {
      setError(null);
      return await updateService(id, data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeService = async (id) => {
    try {
      setError(null);
      return await deleteService(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleServiceStatus = async (id, currentStatus) => {
    const newStatus = (currentStatus === 'open' || currentStatus === 'Active') ? 'closed' : 'open';
    return editService(id, { status: newStatus });
  };

  return {
    services,
    departments,
    loading,
    error,
    addService,
    editService,
    removeService,
    toggleServiceStatus
  };
};

export default useAdminServices;
