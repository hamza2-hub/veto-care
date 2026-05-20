import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar as CalendarIcon, Syringe, Activity, 
  Clock, AlertTriangle, ArrowRight, CheckCircle,
  History, CalendarCheck, User, Stethoscope
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import PetCard from '../../components/common/PetCard';
import { SkeletonStat, SkeletonCard } from '../../components/common/Skeleton';
import { toast } from 'react-hot-toast';
import { useDoctorDashboard } from '../../hooks/useDoctorDashboard';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/dashboard.css';

/* ── Status helpers ───────────────────────── */
const STATUS_STYLES = {
  pending:     { bg: '#fef3c7', color: '#d97706', dot: '#f59e0b', label: 'Pending' },
  confirmed:   { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6', label: 'Confirmed' },
  in_progress: { bg: '#fef9c3', color: '#a16207', dot: '#eab308', label: 'In Progress' },
  completed:   { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', label: 'Completed' },
  cancelled:   { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: 'Cancelled' },
  urgent:      { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: 'Urgent' },
};

const getStatus = (apt) => {
  if (apt.pets?.status === 'emergency') return 'urgent';
  return apt.status || 'pending';
};

/* ── Appointment Row ─────────────────────── */
const AppointmentRow = ({ item, isToday = true }) => {
  const statusKey = getStatus(item);
  const cfg = STATUS_STYLES[statusKey] || STATUS_STYLES.pending;
  const dateStr = new Date(item.date).toLocaleString('en-US', {
    hour: '2-digit', minute: '2-digit',
    ...(isToday ? {} : { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1rem',
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 'var(--border-radius-md)',
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ borderColor: 'var(--primary)', boxShadow: '0 4px 12px rgba(16,185,129,0.08)', x: 2 }}
    >
      {/* Left accent */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.dot, borderRadius: '4px 0 0 4px' }} />

      {/* Time badge */}
      <div style={{ textAlign: 'center', minWidth: 56, paddingLeft: 6 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
          {isToday
            ? new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        </p>
        {!isToday && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {new Date(item.date).getFullYear()}
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 36, background: 'var(--border)', flexShrink: 0 }} />

      {/* Icon */}
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {statusKey === 'completed'
          ? <CheckCircle size={17} style={{ color: cfg.color }} />
          : statusKey === 'urgent'
          ? <AlertTriangle size={17} style={{ color: cfg.color }} />
          : <Stethoscope size={17} style={{ color: cfg.color }} />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.pets?.name || 'Unknown Pet'}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          {item.pets?.type && <span style={{ textTransform: 'capitalize' }}>{item.pets.type}</span>}
          {item.owner?.full_name && <><span style={{ color: '#cbd5e1' }}>·</span><User size={10} />{item.owner.full_name}</>}
          {item.notes && <><span style={{ color: '#cbd5e1' }}>·</span>{item.notes}</>}
        </p>
      </div>

      {/* Status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.25rem 0.7rem', borderRadius: 99, background: cfg.bg, flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
      </div>
    </motion.div>
  );
};

/* ── Schedule Section with Tabs ──────────── */
const ScheduleSection = ({ todaySchedule, previousAppointments, isLoading }) => {
  const [activeTab, setActiveTab] = useState('today');

  const tabs = [
    { id: 'today',    label: "Today's Appointments", icon: CalendarCheck, count: todaySchedule.length },
    { id: 'previous', label: 'Previous',              icon: History,       count: previousAppointments.length },
  ];

  const items = activeTab === 'today' ? todaySchedule : previousAppointments;

  return (
    <div className="section-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Tab header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--border-radius-md)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.45rem 1rem', borderRadius: 'var(--border-radius-sm)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-soft)' : 'none',
              }}
            >
              <tab.icon size={14} />
              {tab.label}
              <span style={{
                padding: '0.1rem 0.4rem', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800,
                background: activeTab === tab.id ? 'var(--primary-light)' : 'var(--border)',
                color: activeTab === tab.id ? 'var(--primary-dark)' : 'var(--text-muted)',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--border-radius-md)' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'var(--primary)' }}>
            {activeTab === 'today' ? <CalendarCheck size={24} /> : <History size={24} />}
          </div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>
            {activeTab === 'today' ? 'No appointments today' : 'No previous appointments'}
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            {activeTab === 'today' ? 'Your schedule is clear for today.' : 'All previous visits will appear here.'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
          >
            {items.map((item) => (
              <AppointmentRow key={item.id} item={item} isToday={activeTab === 'today'} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

/* ── Main page ───────────────────────────── */
const DoctorDashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const { profile } = useAuth();
  const { stats, todaySchedule, previousAppointments, recentPatients, loading: isLoading } = useDoctorDashboard();

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerateSuccess(true);
      toast.success('Report generated successfully!');
      setTimeout(() => setGenerateSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title capitalize">Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back, Dr. {profile?.full_name || 'Doctor'}</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating || generateSuccess}>
          {isGenerating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Generating…
            </span>
          ) : generateSuccess ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} /> Report Ready!</span>
          ) : 'Generate Report'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {isLoading ? (
          <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
        ) : (
          <>
            <StatCard title="Active Patients"       value={stats.patientsCount}          icon={Users}          trend={{ positive: true,  value: 12 }} colorClass="primary" />
            <StatCard title="Appointments Today"    value={stats.todayAppointmentsCount} icon={CalendarIcon}   trend={{ positive: true,  value: 5  }} colorClass="primary" />
            <StatCard title="Vaccination Rate"      value="—"                            icon={Syringe}        trend={{ positive: true,  value: 2  }} colorClass="primary" />
            <StatCard title="Emergency Cases"       value={stats.emergencyCount}         icon={Activity}       trend={{ positive: false, value: 1  }} colorClass="emergency" />
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="grid-left">
          {/* Today & Previous Schedule with Tabs */}
          <ScheduleSection
            todaySchedule={todaySchedule}
            previousAppointments={previousAppointments}
            isLoading={isLoading}
          />

          {/* Recent Patients */}
          <div className="section-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <h2 className="section-title">Recent Patients</h2>
              <Button variant="text">See All <ArrowRight size={16} style={{ marginLeft: 4 }} /></Button>
            </div>
            <div className="recent-patients-grid-compact">
              {isLoading ? (
                <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
              ) : recentPatients.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No patients found.</p>
              ) : (
                recentPatients.map(pet => (
                  <PetCard
                    key={pet.id}
                    name={pet.name}
                    type={pet.type}
                    breed={pet.breed}
                    age={pet.age}
                    status={pet.status}
                    image={pet.image_url}
                    ownerName={pet.profiles?.full_name}
                    medicalRecordsCount={pet.medical_records?.length || 0}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid-right">
          {/* Inventory Alerts */}
          <div className="section-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Inventory Alerts</h2>
            <div className="alert-box">
              <AlertTriangle className="alert-icon" size={24} />
              <div>
                <h4 className="alert-title">Low Stock: Rabies Vaccine</h4>
                <p className="alert-desc">Only 5 doses remaining. Please restock immediately.</p>
                <Button variant="outline" size="small" style={{ marginTop: '0.5rem' }}>Order Now</Button>
              </div>
            </div>
          </div>

          {/* Treatment Progress */}
          <div className="section-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="section-title">Treatment Progress</h2>
            <div className="donut-chart-container">
              <div className="donut">
                <div className="donut-inner">
                  <span className="donut-value">75%</span>
                  <span className="donut-label">Success</span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Stats Bar Chart */}
          <div className="section-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="section-title">Patient Stats</h2>
            <div className="bar-chart">
              <div className="bar" style={{ height: '60%' }}><span>Mon</span></div>
              <div className="bar" style={{ height: '80%' }}><span>Tue</span></div>
              <div className="bar" style={{ height: '100%' }}><span>Wed</span></div>
              <div className="bar" style={{ height: '40%' }}><span>Thu</span></div>
              <div className="bar" style={{ height: '70%' }}><span>Fri</span></div>
              <div className="bar" style={{ height: '50%' }}><span>Sat</span></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
