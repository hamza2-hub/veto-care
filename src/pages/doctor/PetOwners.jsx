import React, { useEffect, useState } from 'react';
import { UserCheck, Loader2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { supabase } from '../../lib/supabase';
import '../../styles/pages/dashboard.css';

const PetOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchOwners = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First, get all unique owner_ids from this doctor's appointments
        const { data: appointmentsData, error: aptError } = await supabase
          .from('appointments')
          .select('owner_id')
          .eq('doctor_id', user.id);

        if (aptError) throw aptError;

        const clientIds = [...new Set((appointmentsData || []).map(a => a.owner_id))];

        if (clientIds.length === 0) {
          setOwners([]);
          setLoading(false);
          return;
        }

        // Fetch only those specific clients and their pets
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, pets(id, name, type)')
          .in('id', clientIds);

        if (error) throw error;
        setOwners(data || []);
      } catch (err) {
        console.error('Error fetching pet owners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">My Clients</h1>
          <p className="dashboard-subtitle">Manage your client information and contacts</p>
        </div>
      </div>

      <div className="section-card animate-slide-up">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 className="animate-spin" size={28} color="var(--primary)" />
          </div>
        ) : owners.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No clients registered yet.</p>
        ) : (
          <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {owners.map(owner => {
              const petList = owner.pets?.map(p => `${p.name} (${p.type})`).join(', ') || 'No pets';
              return (
                <div key={owner.id} className="appointment-card">
                  <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="appointment-icon-wrapper">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{owner.full_name || 'Unknown'}</h4>
                      <p className="text-muted" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Pets: {petList} • {owner.pets?.length || 0} registered
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetOwners;
