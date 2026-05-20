import React, { useState } from 'react';
import { Plus, FileText, HelpCircle, Heart, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button';
import PetCard from '../../components/common/PetCard';
import StatCard from '../../components/common/StatCard';
import { usePets } from '../../hooks/usePets';
import { useAppointments } from '../../hooks/useAppointments';
import { SkeletonCard, SkeletonStat } from '../../components/common/Skeleton';
import BookingModal from '../../components/user/BookingModal';
import '../../styles/pages/dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pets, loading: petsLoading } = usePets();
  const { appointments, loading: aptsLoading, refetch: refetchApts } = useAppointments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { title: t('dashboard.stats.my_pets'), value: pets.length, icon: Heart, colorClass: 'primary' },
    { title: t('dashboard.stats.upcoming'), value: appointments.filter(a => a.status === 'confirmed').length, icon: Calendar, colorClass: 'primary' },
    { title: t('dashboard.stats.pending'), value: appointments.filter(a => a.status === 'pending').length, icon: Activity, colorClass: 'primary' },
  ];

  const recentRequests = appointments.slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">{t('dashboard.title')}</h1>
          <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-8">
        {petsLoading || aptsLoading ? (
          <><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
        ) : (
          stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))
        )}
      </div>

      <div className="dashboard-grid">
        {/* Pets Section */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.quick_overview')}</h2>
            <button className="btn-text" onClick={() => navigate('/dashboard/pets')}>{t('dashboard.view_all_pets')}</button>
          </div>
          
          <div className="pets-grid-compact mt-4">
            {petsLoading ? (
              <><SkeletonCard /><SkeletonCard /></>
            ) : pets.length === 0 ? (
              <div className="empty-state">
                <p>{t('dashboard.no_pets')}</p>
                <button className="btn-outline mt-2" onClick={() => navigate('/dashboard/pets')}>{t('dashboard.add_first_pet')}</button>
              </div>
            ) : (
              pets.slice(0, 2).map(pet => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name}
                  type={pet.type}
                  breed={pet.breed}
                  age={pet.age}
                  status={pet.status}
                  image={pet.image_url}
                  createdAt={pet.created_at}
                  medicalRecordsCount={pet.medical_records?.length || 0}
                  onClick={() => navigate('/dashboard/pets')}
                />
              ))
            )}
          </div>
        </div>

        {/* Requests Section */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.recent_requests')}</h2>
            <div className="icon-button" onClick={() => navigate('/dashboard/appointments')}><FileText size={20} /></div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {aptsLoading ? (
              <p className="text-muted">{t('dashboard.loading_requests')}</p>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle size={40} className="mx-auto text-zinc-200 mb-2" />
                <p className="text-muted">{t('dashboard.no_recent_requests')}</p>
              </div>
            ) : (
              recentRequests.map((req) => (
                <div key={req.id} className="request-item" onClick={() => navigate('/dashboard/appointments')} style={{ cursor: 'pointer' }}>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{req.notes || t('dashboard.general_checkup')}</h4>
                    <p className="text-muted text-xs">
                      {new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {req.doctor?.full_name && ` • Dr. ${req.doctor.full_name}`}
                    </p>
                  </div>
                  <span className={`req-badge req-${req.status}`}>
                    {req.status?.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-center mt-5">
            <button 
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 font-semibold hover:bg-emerald-100 hover:shadow-sm transition-all text-sm group"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} className="group-hover:scale-110 transition-transform" />
              {t('dashboard.create_request')}
            </button>
          </div>
        </div>
      </div>

      {/* Shared Booking Modal */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={refetchApts}
      />
    </div>
  );
};

export default UserDashboard;
