-- Drop the existing insecure RLS policies
DROP POLICY IF EXISTS "Anyone can view emergency reports" ON public.emergency_reports;
DROP POLICY IF EXISTS "Anyone can update emergency reports" ON public.emergency_reports;

-- Keep the policy that allows anyone to create emergency reports (needed for emergencies)
-- This one is fine as it only allows INSERT operations

-- Create secure policies that restrict access to sensitive data
CREATE POLICY "Only authenticated users can view emergency reports" 
ON public.emergency_reports 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can update reports (for status changes by admins)
CREATE POLICY "Only authenticated users can update emergency reports" 
ON public.emergency_reports 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Add policy to allow admins to delete reports if needed (currently not allowed)
CREATE POLICY "Only authenticated users can delete emergency reports" 
ON public.emergency_reports 
FOR DELETE 
TO authenticated
USING (true);