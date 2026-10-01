import { useState, useEffect } from 'react';
import { subscribeServices, subscribeDepartments } from '../services/serviceService';
import { seedInitialDataIfEmpty } from '../services/seedService';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubServices = () => {};
    let unsubDepts = () => {};

    const initialize = async () => {
      try {
        await seedInitialDataIfEmpty();
        unsubServices = subscribeServices((data) => {
          setServices(data);
          setLoading(false);
        });
        unsubDepts = subscribeDepartments((data) => {
          setDepartments(data);
        });
      } catch (err) {
        console.warn('useServices initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initialize();

    return () => {
      unsubServices();
      unsubDepts();
    };
  }, []);

  return { services, departments, loading, error };
};

export default useServices;
