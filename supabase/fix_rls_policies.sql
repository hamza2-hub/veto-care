-- =============================================================================
-- MIGRATION: Fix data-leakage RLS policies
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ── 1. PETS ──────────────────────────────────────────────────────────────────

-- Drop the over-permissive policy that let ALL doctors see ALL pets
DROP POLICY IF EXISTS "Doctors can view all pets" ON public.pets;

-- Owners manage their own pets (unchanged, keep if already exists)
DROP POLICY IF EXISTS "Users can manage own pets" ON public.pets;
CREATE POLICY "Users can manage own pets" ON public.pets
  FOR ALL
  USING (auth.uid() = owner_id);

-- Doctors can ONLY see pets that have at least one appointment with them
CREATE POLICY "Doctors can view their patients pets" ON public.pets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.pet_id = pets.id
        AND appointments.doctor_id = auth.uid()
    )
  );


-- ── 2. APPOINTMENTS ──────────────────────────────────────────────────────────

-- Drop the broken policy whose OR clause let any doctor see all appointments
DROP POLICY IF EXISTS "Doctors can manage assigned appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can manage own appointments"        ON public.appointments;

-- Owners: only their own rows
CREATE POLICY "Users can manage own appointments" ON public.appointments
  FOR ALL
  USING (auth.uid() = owner_id);

-- Doctors: only rows where they are explicitly assigned
CREATE POLICY "Doctors can manage their assigned appointments" ON public.appointments
  FOR ALL
  USING (auth.uid() = doctor_id);


-- ── 3. MEDICAL RECORDS ───────────────────────────────────────────────────────

-- Drop any overly broad doctor policy
DROP POLICY IF EXISTS "Doctors can manage all records"           ON public.medical_records;
DROP POLICY IF EXISTS "Doctors can manage records of their patients" ON public.medical_records;

-- Owners: records for their own pets
DROP POLICY IF EXISTS "Users can view own pets records" ON public.medical_records;
CREATE POLICY "Users can manage own pets records" ON public.medical_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = medical_records.pet_id
        AND pets.owner_id = auth.uid()
    )
  );

-- Doctors: only records for pets that have an appointment with them
CREATE POLICY "Doctors can manage records of their patients" ON public.medical_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.pet_id = medical_records.pet_id
        AND appointments.doctor_id = auth.uid()
    )
  );
