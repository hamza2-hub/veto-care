import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import AppointmentDetailsModal from '../../components/doctor/AppointmentDetailsModal';
import BookingModal from '../../components/user/BookingModal';
import { appointmentService } from '../../services/appointmentService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import '../../styles/pages/dashboard.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user } = useAuth();
  const appointmentsRef = useRef([]);

  const loadAppointments = async () => {
    if (!user) return;
    try {
      const data = await appointmentService.getAppointments(user.id);
      setAppointments(data);
      appointmentsRef.current = data;
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadAppointments();

    const subscription = supabase
      .channel('owner_appointments')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `owner_id=eq.${user.id}` },
        (payload) => {
          const oldApp = appointmentsRef.current.find(a => a.id === payload.new.id);
          if (oldApp && oldApp.status !== payload.new.status) {
            if (payload.new.status === 'in_progress') {
              toast.success("Your pet's treatment is now in progress");
            } else if (payload.new.status === 'completed') {
              toast.success("Treatment completed successfully");
            } else {
              toast(`Appointment status updated to ${payload.new.status.replace('_', ' ')}`);
            }
          }
          loadAppointments();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments', filter: `owner_id=eq.${user.id}` },
        () => loadAppointments()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const upcoming = appointments.filter(a => new Date(a.date) >= new Date() && a.status !== 'completed' && a.status !== 'cancelled');
  const past = appointments.filter(a => new Date(a.date) < new Date() || a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header flex justify-between items-center">
        <div>
          <h1 className="dashboard-title">Appointments</h1>
          <p className="dashboard-subtitle">Schedule and manage your clinic visits</p>
        </div>
        <Button onClick={() => setIsBookingModalOpen(true)}>Book Appointment</Button>
      </div>

      <div className="section-card animate-slide-up">
        <div className="section-header">
          <h2 className="section-title">Upcoming Appointments</h2>
        </div>
        {isLoading ? (
          <p className="mt-4">Loading appointments...</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-muted">No upcoming appointments.</p>
        ) : (
          upcoming.map(app => (
            <div key={app.id} className="appointment-card mt-4">
              <div className="flex items-center gap-4">
                <div className="appointment-icon-wrapper">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600 }} className="flex items-center gap-2">
                    {app.notes || 'Appointment'} - {app.pets?.name}
                    <StatusBadge status={app.status} />
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {new Date(app.date).toLocaleString()} • {app.doctor?.full_name || 'Unassigned'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="small" onClick={() => setSelectedAppointment(app)}>View Details</Button>
            </div>
          ))
        )}
      </div>

      <div className="section-card animate-slide-up" style={{ animationDelay: '0.1s', marginTop: '1.5rem' }}>
        <div className="section-header">
          <h2 className="section-title">Past Appointments</h2>
        </div>
        {isLoading ? (
          <p className="mt-4">Loading appointments...</p>
        ) : past.length === 0 ? (
          <p className="mt-4 text-muted">No past appointments.</p>
        ) : (
          past.map(app => (
            <div key={app.id} className="appointment-card mt-4" style={{ opacity: 0.7 }}>
              <div className="flex items-center gap-4">
                <div className="appointment-icon-wrapper" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600 }} className="flex items-center gap-2">
                    {app.notes || 'Appointment'} - {app.pets?.name}
                    <StatusBadge status={app.status} />
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {new Date(app.date).toLocaleDateString()} • {app.doctor?.full_name || 'Unassigned'}
                  </p>
                </div>
              </div>
              <Button variant="text" size="small" onClick={() => setSelectedAppointment(app)}>View Details</Button>
            </div>
          ))
        )}
      </div>

      <AppointmentDetailsModal 
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        onUpdate={loadAppointments}
        isOwner={true}
      />

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={loadAppointments}
      />
    </div>
  );
};

export default Appointments;
