-- Allow admins to insert notifications
CREATE POLICY "Admins can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Allow admins to view all notifications
CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR SELECT 
USING (is_admin(auth.uid()));