-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN DEFAULT false,
  link TEXT, -- Optional link to navigate to
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can manage own notifications" ON public.notifications 
  FOR ALL USING (auth.uid() = user_id);

-- Note: We allow INSERT from authenticated users if we want doctors to trigger notifications to users,
-- but a simpler policy is to let anyone authenticated insert, or use triggers.
CREATE POLICY "Authenticated users can create notifications" ON public.notifications 
  FOR INSERT TO authenticated WITH CHECK (true);
