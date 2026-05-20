import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from './useAuth';

export const useAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    if (!user) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await appointmentService.getAppointments(user.id);
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAppointments();

      const subscription = supabase
        .channel(`appointments_user_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `owner_id=eq.${user.id}`
          },
          () => {
            fetchAppointments();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setAppointments([]);
      setLoading(false);
    }
  }, [user, fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
};
