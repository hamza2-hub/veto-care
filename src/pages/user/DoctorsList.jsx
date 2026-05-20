import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Clock, Stethoscope,
  X, Calendar as CalendarIcon, Award, ChevronRight, User
} from 'lucide-react';
import Button from '../../components/common/Button';
import { profileService } from '../../services/profileService';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/dashboard.css';

/* ─── helpers ─────────────────────────────── */
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const SPECIALTIES = ['All', 'General Veterinarian', 'Surgery', 'Dermatology', 'Cardiology', 'Dentistry', 'Ophthalmology'];

/* ─── Avatar ───────────────────────────────── */
const Avatar = ({ url, name, size = 64 }) => {
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return url ? (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      border: `2px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 700, fontSize: size * 0.3,
    }}>
      {initials(name) || <User size={size * 0.4} />}
    </div>
  );
};

/* ─── StarRow ──────────────────────────────── */
const StarRow = ({ rating = 4.9 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={12} fill="#f59e0b" stroke="none" />
    ))}
    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{rating}</span>
  </div>
);

/* ─── Doctor Card ──────────────────────────── */
const DoctorCard = ({ doc, index, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    onClick={() => onSelect(doc)}
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--shadow-soft)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(16,185,129,0.12)', borderColor: 'var(--primary)' }}
  >
    {/* Top accent bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: 'linear-gradient(90deg, var(--primary), #34d399)',
      opacity: 0,
      transition: 'opacity 0.2s',
    }} className="doctor-card-accent" />

    {/* Header row */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar url={doc.avatar_url} name={doc.full_name} size={60} />
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: 14, height: 14, borderRadius: '50%',
          background: '#10b981', border: '2px solid white',
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Dr. {doc.full_name}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
          {doc.specialty || 'General Veterinarian'}
        </p>
        <StarRow />
      </div>
    </div>

    {/* Info chips */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {doc.experience_years && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.65rem', borderRadius: 99, background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
          <Clock size={11} /> {doc.experience_years} yrs exp
        </span>
      )}
      {doc.clinic_address && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 500, padding: '0.3rem 0.65rem', borderRadius: 99, background: '#f1f5f9', color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {doc.clinic_address.split(',')[0]}
        </span>
      )}
    </div>

    {/* Bio excerpt */}
    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
      {doc.bio || 'Dedicated veterinary professional committed to the health and well-being of your pets.'}
    </p>

    {/* Footer */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        View Full Profile <ChevronRight size={14} />
      </span>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)' }}>
        <CalendarIcon size={14} />
      </div>
    </div>
  </motion.div>
);

/* ─── Doctor Modal ─────────────────────────── */
const DoctorModal = ({ doc, onClose, onBook }) => (
  <AnimatePresence>
    {doc && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: 20,
            boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Cover */}
          <div style={{ position: 'relative', height: 140, background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)', borderRadius: '20px 20px 0 0', flexShrink: 0 }}>
            <button onClick={onClose} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white',
              transition: 'background 0.2s',
            }}>
              <X size={18} />
            </button>

            {/* Avatar positioned at bottom of cover */}
            <div style={{ 
              position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
              padding: 4, background: 'white', borderRadius: '50%', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              <Avatar url={doc.avatar_url} name={doc.full_name} size={80} />
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '3.25rem 2rem 2rem', textAlign: 'center' }}>
            {/* Name & Specialty */}
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
              Dr. {doc.full_name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.25rem', textTransform: 'capitalize' }}>
              {doc.specialty || 'General Veterinarian'}
            </p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { icon: <Star size={16} fill="#f59e0b" stroke="none" />, label: 'Rating', value: '4.9 / 5.0' },
                { icon: <Award size={16} />, label: 'Experience', value: doc.experience_years ? `${doc.experience_years} Years` : 'N/A' },
                { icon: <MapPin size={16} />, label: 'Location', value: doc.clinic_address?.split(',')[0] || 'Not specified' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, padding: '0.875rem 0.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: 6 }}>{icon}</div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Bio */}
            {doc.bio && (
              <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>About</p>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.75 }}>
                  {doc.bio}
                </p>
              </div>
            )}

            {/* Clinic address */}
            {doc.clinic_address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--primary-light)', borderRadius: 12, marginBottom: '1.25rem', textAlign: 'left' }}>
                <MapPin size={16} style={{ color: 'var(--primary-dark)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 500 }}>{doc.clinic_address}</p>
              </div>
            )}

            {/* CTA */}
            <Button style={{ width: '100%', borderRadius: 12, padding: '0.875rem' }} onClick={() => onBook(doc)}>
              <CalendarIcon size={16} style={{ marginRight: 8 }} />
              Book an Appointment with Dr. {doc.full_name?.split(' ')[0]}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Empty state ──────────────────────────── */
const EmptyState = ({ isFiltered }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '5rem 2rem', 
    border: '1px solid rgba(255, 255, 255, 0.5)', 
    borderRadius: '24px', 
    background: 'linear-gradient(145deg, #ffffff, #f0f4f8)', 
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,1)',
    overflow: 'hidden',
    position: 'relative'
  }}>
    <div style={{
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
      pointerEvents: 'none'
    }}></div>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
        <Stethoscope size={32} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
        {isFiltered ? 'No doctors match your search' : 'No doctors available'}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {isFiltered ? 'Try changing your filter or search term.' : 'Doctors will appear here once they set up their profile.'}
      </p>
    </div>
  </div>
);

/* ─── Main page ────────────────────────────── */
const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    profileService.getDoctorProfiles()
      .then(data => setDoctors(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = doctors.filter(doc => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      (doc.full_name?.toLowerCase() || '').includes(search) ||
      (doc.specialty?.toLowerCase() || '').includes(search);
    const matchFilter =
      activeFilter === 'All' ||
      (doc.specialty || 'General Veterinarian') === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleBook = (doctor) => {
    setSelectedDoctor(null);
    navigate('/dashboard', { state: { openAppointmentModal: true, preselectedDoctorId: doctor.id } });
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease forwards' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="dashboard-title">Find a Doctor</h1>
          <p className="dashboard-subtitle">Browse and book appointments with our veterinary specialists</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '0.5rem 1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>
          <Stethoscope size={14} /> {doctors.length} Specialist{doctors.length !== 1 ? 's' : ''} Available
        </div>
      </div>

      {/* ── Search + filter bar ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
              border: '1.5px solid var(--border)', borderRadius: 'var(--border-radius-md)',
              fontSize: '0.9rem', fontFamily: 'inherit', color: 'var(--text-main)',
              background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Specialty filter chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SPECIALTIES.map(spec => (
            <button
              key={spec}
              onClick={() => setActiveFilter(spec)}
              style={{
                padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid', fontFamily: 'inherit',
                transition: 'all 0.2s',
                background: activeFilter === spec ? 'var(--primary)' : 'transparent',
                color: activeFilter === spec ? 'white' : 'var(--text-muted)',
                borderColor: activeFilter === spec ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--border-radius-lg)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState isFiltered={searchTerm.length > 0 || activeFilter !== 'All'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((doc, i) => (
            <DoctorCard key={doc.id} doc={doc} index={i} onSelect={setSelectedDoctor} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <DoctorModal doc={selectedDoctor} onClose={() => setSelectedDoctor(null)} onBook={handleBook} />
    </div>
  );
};

export default DoctorsList;
