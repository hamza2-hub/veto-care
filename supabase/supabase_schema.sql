-- 1. Create Tables

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('user', 'doctor')) DEFAULT 'user',
  avatar_url TEXT,
  specialty TEXT,
  bio TEXT,
  experience_years INTEGER,
  clinic_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Pets table
CREATE TABLE public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  status TEXT CHECK (status IN ('healthy', 'treatment', 'emergency')) DEFAULT 'healthy',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  diagnosis TEXT,
  treatment_details TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Medical Records table
CREATE TABLE public.medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Fixed infinite recursion by allowing authenticated users to read profiles
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pets Policies
CREATE POLICY "Users can manage own pets" ON public.pets FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Doctors can view their patients pets" ON public.pets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.appointments WHERE appointments.pet_id = pets.id AND appointments.doctor_id = auth.uid())
);

-- Appointments Policies
CREATE POLICY "Users can manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Doctors can manage their assigned appointments" ON public.appointments FOR ALL USING (auth.uid() = doctor_id);

-- Medical Records Policies
CREATE POLICY "Users can manage own pets records" ON public.medical_records FOR ALL USING (
  EXISTS (SELECT 1 FROM public.pets WHERE pets.id = medical_records.pet_id AND pets.owner_id = auth.uid())
);
CREATE POLICY "Doctors can manage records of their patients" ON public.medical_records FOR ALL USING (
  EXISTS (SELECT 1 FROM public.appointments WHERE appointments.pet_id = medical_records.pet_id AND appointments.doctor_id = auth.uid())
);

-- 3. Auto Profile Creation (Trigger)

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Storage Setup
-- Note: Bucket 'medical-files' must be created manually or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false) ON CONFLICT DO NOTHING;

-- Storage Policies for medical-files
CREATE POLICY "Doctors can upload medical files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'medical-files' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'doctor')));
CREATE POLICY "Users can view own medical files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'medical-files');
