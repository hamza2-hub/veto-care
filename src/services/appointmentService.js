import { supabase } from '../lib/supabase';

export const appointmentService = {
  async getAppointments() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        pets(name, type, breed, age, image_url),
        doctor:profiles!appointments_doctor_id_fkey(full_name)
      `)
      .eq('owner_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDoctors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('role', 'doctor');

    if (error) throw error;
    return data;
  },

  async createAppointment(appointmentData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('appointments')
      .insert([{ 
        ...appointmentData, 
        owner_id: user.id,
        files: appointmentData.files || [],
      }])
      .select()
      .single();

    if (error) throw error;

    // Send notification to the selected doctor
    if (data.doctor_id) {
      await supabase.from('notifications').insert([{
        user_id: data.doctor_id,
        title: 'New Appointment Request',
        message: 'A pet owner has requested a new appointment with you.',
        type: 'info'
      }]);
    }

    return data;
  },

  // ── Doctor-specific ────────────────────────────────────────────────────────

  /**
   * Fetch only the appointments assigned to this vet.
   * Double-gated: explicit doctor_id filter here + RLS policy in DB.
   */
  async getAppointmentsForVet(vetId) {
    if (!vetId) throw new Error('Vet ID is required');

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        pets(name, type, breed, age, image_url),
        owner:profiles!appointments_owner_id_fkey(full_name)
      `)
      .eq('doctor_id', vetId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update appointment status — doctor can only touch their own rows (RLS enforced).
   */
  async updateAppointmentStatus(appointmentId, status, notes = null) {
    const payload = { status };
    if (notes !== null) payload.notes = notes;

    const { data, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', appointmentId)
      .select('*, doctor:profiles!doctor_id(full_name)')
      .single();

    if (error) throw error;

    // Send notification to the pet owner about the status update
    if (data.owner_id) {
      const docName = data.doctor?.full_name || 'A doctor';
      await supabase.from('notifications').insert([{
        user_id: data.owner_id,
        title: 'Appointment Status Updated',
        message: `${docName} updated your appointment status to: ${status.replace('_', ' ')}.`,
        type: status === 'confirmed' ? 'success' : (status === 'cancelled' ? 'error' : 'info')
      }]);
    }

    return data;
  },
};
