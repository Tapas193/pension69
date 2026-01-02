-- Allow admins to update profiles (for approval/rejection)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile or admins can update any" 
ON public.profiles 
FOR UPDATE 
USING ((auth.uid() = user_id) OR is_admin(auth.uid()));