import { supabase } from '../lib/supabase';

export const medicalService = {
  /**
   * Fetch all pets visible to a doctor (all pets across all owners)
   */
  async getAllPets() {
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single pet's full details including owner info
   */
  async getPetById(petId) {
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        profiles(full_name, avatar_url)
      `)
      .eq('id', petId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all appointments for a specific pet
   */
  async getAppointmentsForPet(petId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_doctor_id_fkey(full_name)
      `)
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch medical_records rows for a specific pet
   */
  async getMedicalRecordsForPet(petId) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add a new medical record for a pet (doctor only)
   */
  async addMedicalRecord(petId, { diagnosis, treatment }) {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([{ pet_id: petId, diagnosis, treatment }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update pet status (e.g. mark as healthy after treatment)
   */
  async updatePetStatus(petId, status) {
    const { error } = await supabase
      .from('pets')
      .update({ status })
      .eq('id', petId);

    if (error) throw error;
  },
};
