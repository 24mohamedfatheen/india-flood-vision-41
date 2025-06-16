
-- Create emergency_reports table
CREATE TABLE public.emergency_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  location TEXT NOT NULL,
  num_people INTEGER NOT NULL,
  has_disabled BOOLEAN DEFAULT FALSE,
  has_medical_needs BOOLEAN DEFAULT FALSE,
  medical_details TEXT,
  has_water_food BOOLEAN DEFAULT FALSE,
  water_food_duration TEXT,
  situation_description TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.emergency_reports ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to INSERT emergency reports (public can report emergencies)
CREATE POLICY "Anyone can create emergency reports" 
  ON public.emergency_reports 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows anyone to SELECT emergency reports (for admin viewing)
CREATE POLICY "Anyone can view emergency reports" 
  ON public.emergency_reports 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to UPDATE emergency reports (for admin status updates)
CREATE POLICY "Anyone can update emergency reports" 
  ON public.emergency_reports 
  FOR UPDATE 
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_emergency_reports_updated_at 
  BEFORE UPDATE ON public.emergency_reports 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
