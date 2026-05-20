import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const usePets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pets')
        .select('*, medical_records(id)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (err) {
      console.error('Error fetching pets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPets();

      // Setup realtime subscription for this user's pets
      const channel = supabase
        .channel(`public:pets:user:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pets',
            filter: `owner_id=eq.${user.id}`
          },
          () => fetchPets()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'medical_records'
          },
          () => fetchPets()
        )
        .subscribe();

      return () => {
        if (channel) {
          channel.unsubscribe();
        }
      };
    } else {
      setPets([]);
      setLoading(false);
    }
  }, [user, fetchPets]);

  const removePetFromState = useCallback((petId) => {
    setPets(prev => prev.filter(p => p.id !== petId));
  }, []);

  const addPetToState = useCallback((newPet) => {
    setPets(prev => [newPet, ...prev]);
  }, []);

  return { pets, loading, error, refetch: fetchPets, removePetFromState, addPetToState };
};
