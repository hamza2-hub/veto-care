import React, { useEffect, useState } from 'react';
import { Syringe, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import '../../styles/pages/dashboard.css';

const Vaccinations = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('id, name, type, status, profiles(full_name)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPets(data || []);
      } catch (err) {
        console.error('Error fetching pets for vaccinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">Vaccinations</h1>
          <p className="dashboard-subtitle">Track vaccination schedules for all registered pets</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="section-card animate-slide-up grid-left">
          <h2 className="section-title">Registered Pets — Vaccination Tracking</h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 className="animate-spin" size={28} color="var(--primary)" />
            </div>
          ) : pets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.9rem' }}>
              No pets registered yet. Vaccination schedule will appear here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {pets.map(pet => (
                <div key={pet.id} className="appointment-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="appointment-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <Syringe size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{pet.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>({pet.type})</span></h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Owner: {pet.profiles?.full_name || 'Unknown'} • Status: <strong style={{ textTransform: 'capitalize' }}>{pet.status}</strong>
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.8rem',
                    borderRadius: '999px',
                    background: pet.status === 'emergency' ? '#fee2e2' : pet.status === 'treatment' ? '#fef9c3' : '#dcfce7',
                    color: pet.status === 'emergency' ? '#b91c1c' : pet.status === 'treatment' ? '#a16207' : '#15803d',
                    textTransform: 'capitalize'
                  }}>
                    {pet.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vaccinations;
