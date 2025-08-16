-- Create rainfall data table for monthly patterns
CREATE TABLE public.monthly_rainfall_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  state TEXT,
  district TEXT,
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2025),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  total_rainfall_mm DECIMAL(10,2) NOT NULL,
  avg_daily_rainfall_mm DECIMAL(10,2),
  max_daily_rainfall_mm DECIMAL(10,2),
  rainy_days_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monthly_rainfall_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for rainfall data
CREATE POLICY "Allow public read access to rainfall data" 
ON public.monthly_rainfall_data 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_monthly_rainfall_data_updated_at
BEFORE UPDATE ON public.monthly_rainfall_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample rainfall data for Indian cities (2020-2025)
INSERT INTO public.monthly_rainfall_data (location, state, district, year, month, total_rainfall_mm, avg_daily_rainfall_mm, max_daily_rainfall_mm, rainy_days_count) VALUES
-- Mumbai data
('mumbai', 'Maharashtra', 'Mumbai', 2020, 1, 12.5, 0.4, 8.2, 3),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 2, 8.3, 0.3, 5.1, 2),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 3, 15.2, 0.5, 12.4, 4),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 4, 25.7, 0.9, 18.3, 5),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 5, 68.4, 2.2, 35.6, 8),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 6, 485.3, 16.2, 89.4, 18),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 7, 892.1, 28.8, 156.7, 25),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 8, 734.6, 23.7, 142.3, 22),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 9, 298.4, 9.9, 67.8, 14),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 10, 87.2, 2.8, 28.5, 7),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 11, 32.1, 1.1, 15.3, 4),
('mumbai', 'Maharashtra', 'Mumbai', 2020, 12, 18.7, 0.6, 9.8, 3),

-- Chennai data
('chennai', 'Tamil Nadu', 'Chennai', 2020, 1, 24.3, 0.8, 12.5, 4),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 2, 18.6, 0.7, 11.2, 3),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 3, 32.4, 1.0, 19.8, 5),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 4, 45.8, 1.5, 28.9, 6),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 5, 78.2, 2.5, 42.1, 9),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 6, 124.5, 4.2, 67.3, 12),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 7, 98.7, 3.2, 54.6, 10),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 8, 145.3, 4.7, 78.4, 13),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 9, 189.6, 6.3, 89.7, 15),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 10, 234.8, 7.6, 124.5, 18),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 11, 298.4, 9.9, 156.2, 20),
('chennai', 'Tamil Nadu', 'Chennai', 2020, 12, 156.7, 5.1, 89.3, 14),

-- Delhi data
('delhi', 'Delhi', 'New Delhi', 2020, 1, 32.1, 1.0, 18.4, 4),
('delhi', 'Delhi', 'New Delhi', 2020, 2, 28.7, 1.0, 16.2, 3),
('delhi', 'Delhi', 'New Delhi', 2020, 3, 45.6, 1.5, 24.8, 5),
('delhi', 'Delhi', 'New Delhi', 2020, 4, 34.2, 1.1, 19.7, 4),
('delhi', 'Delhi', 'New Delhi', 2020, 5, 67.8, 2.2, 38.5, 7),
('delhi', 'Delhi', 'New Delhi', 2020, 6, 124.3, 4.1, 67.9, 11),
('delhi', 'Delhi', 'New Delhi', 2020, 7, 189.4, 6.1, 89.6, 16),
('delhi', 'Delhi', 'New Delhi', 2020, 8, 156.8, 5.1, 78.3, 14),
('delhi', 'Delhi', 'New Delhi', 2020, 9, 98.7, 3.3, 52.4, 9),
('delhi', 'Delhi', 'New Delhi', 2020, 10, 23.4, 0.8, 12.7, 3),
('delhi', 'Delhi', 'New Delhi', 2020, 11, 12.8, 0.4, 8.1, 2),
('delhi', 'Delhi', 'New Delhi', 2020, 12, 18.9, 0.6, 11.3, 3);

-- Add similar data for 2021-2025 (sample for Mumbai)
INSERT INTO public.monthly_rainfall_data (location, state, district, year, month, total_rainfall_mm, avg_daily_rainfall_mm, max_daily_rainfall_mm, rainy_days_count) VALUES
('mumbai', 'Maharashtra', 'Mumbai', 2021, 6, 512.8, 17.1, 92.4, 19),
('mumbai', 'Maharashtra', 'Mumbai', 2021, 7, 915.3, 29.5, 168.7, 26),
('mumbai', 'Maharashtra', 'Mumbai', 2021, 8, 756.2, 24.4, 148.9, 23),
('mumbai', 'Maharashtra', 'Mumbai', 2022, 6, 468.7, 15.6, 85.3, 17),
('mumbai', 'Maharashtra', 'Mumbai', 2022, 7, 834.9, 26.9, 145.2, 24),
('mumbai', 'Maharashtra', 'Mumbai', 2022, 8, 698.1, 22.5, 134.6, 21),
('mumbai', 'Maharashtra', 'Mumbai', 2023, 6, 523.4, 17.4, 96.8, 20),
('mumbai', 'Maharashtra', 'Mumbai', 2023, 7, 967.2, 31.2, 178.5, 27),
('mumbai', 'Maharashtra', 'Mumbai', 2023, 8, 789.6, 25.5, 156.3, 24),
('mumbai', 'Maharashtra', 'Mumbai', 2024, 6, 495.1, 16.5, 88.7, 18),
('mumbai', 'Maharashtra', 'Mumbai', 2024, 7, 878.4, 28.3, 162.1, 25),
('mumbai', 'Maharashtra', 'Mumbai', 2024, 8, 723.8, 23.3, 142.7, 22),
('mumbai', 'Maharashtra', 'Mumbai', 2025, 6, 501.6, 16.7, 89.9, 18),
('mumbai', 'Maharashtra', 'Mumbai', 2025, 7, 889.2, 28.7, 164.8, 25),
('mumbai', 'Maharashtra', 'Mumbai', 2025, 8, 734.5, 23.7, 145.2, 22);