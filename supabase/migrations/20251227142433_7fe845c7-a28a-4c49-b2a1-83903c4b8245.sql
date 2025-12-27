-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'scheme_officer', 'auditor', 'support_staff', 'beneficiary');

-- Create beneficiary status enum
CREATE TYPE public.beneficiary_status AS ENUM ('active', 'pending', 'suspended', 'rejected');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('successful', 'pending', 'failed');

-- Create grievance status enum
CREATE TYPE public.grievance_status AS ENUM ('submitted', 'under_review', 'resolved', 'rejected');

-- Create scheme status enum
CREATE TYPE public.scheme_status AS ENUM ('active', 'pending', 'suspended');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  full_name_hindi TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  aadhaar_masked TEXT, -- Last 4 digits only
  bank_account_masked TEXT, -- Last 4 digits only
  address TEXT,
  district TEXT,
  state TEXT DEFAULT 'राजस्थान',
  is_disabled BOOLEAN DEFAULT FALSE,
  employment_status TEXT,
  annual_income DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'beneficiary',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create welfare schemes table
CREATE TABLE public.welfare_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_hindi TEXT,
  description TEXT,
  description_hindi TEXT,
  monthly_amount DECIMAL(10,2) NOT NULL,
  eligibility_criteria JSONB,
  min_age INTEGER,
  max_age INTEGER,
  max_income DECIMAL(12,2),
  requires_disability BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create beneficiary schemes (enrollment)
CREATE TABLE public.beneficiary_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheme_id UUID REFERENCES public.welfare_schemes(id) ON DELETE CASCADE NOT NULL,
  status scheme_status DEFAULT 'pending',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  remarks TEXT,
  UNIQUE(beneficiary_id, scheme_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheme_id UUID REFERENCES public.welfare_schemes(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_date DATE,
  transaction_id TEXT,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create grievances table
CREATE TABLE public.grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status grievance_status DEFAULT 'submitted',
  assigned_to UUID REFERENCES auth.users(id),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create fraud alerts table
CREATE TABLE public.fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  title_hindi TEXT,
  message TEXT NOT NULL,
  message_hindi TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is any admin type
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('super_admin', 'scheme_officer', 'auditor', 'support_staff')
  )
$$;

-- Create function to get user's profile id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for welfare_schemes (public read)
CREATE POLICY "Anyone can view active schemes"
ON public.welfare_schemes FOR SELECT
USING (is_active = TRUE OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage schemes"
ON public.welfare_schemes FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for beneficiary_schemes
CREATE POLICY "Users can view their own enrollments"
ON public.beneficiary_schemes FOR SELECT
USING (
  beneficiary_id = public.get_profile_id(auth.uid()) 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can enroll in schemes"
ON public.beneficiary_schemes FOR INSERT
WITH CHECK (beneficiary_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admins can manage enrollments"
ON public.beneficiary_schemes FOR UPDATE
USING (public.is_admin(auth.uid()));

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (
  beneficiary_id = public.get_profile_id(auth.uid()) 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage payments"
ON public.payments FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for grievances
CREATE POLICY "Users can view their own grievances"
ON public.grievances FOR SELECT
USING (
  beneficiary_id = public.get_profile_id(auth.uid()) 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can create grievances"
ON public.grievances FOR INSERT
WITH CHECK (beneficiary_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own grievances"
ON public.grievances FOR UPDATE
USING (
  beneficiary_id = public.get_profile_id(auth.uid()) 
  OR public.is_admin(auth.uid())
);

-- RLS Policies for fraud_alerts (admin only)
CREATE POLICY "Admins can view fraud alerts"
ON public.fraud_alerts FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage fraud alerts"
ON public.fraud_alerts FOR ALL
USING (public.is_admin(auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at
BEFORE UPDATE ON public.grievances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at
BEFORE UPDATE ON public.welfare_schemes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data ->> 'phone', '')
  );
  
  -- Assign default beneficiary role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'beneficiary');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample welfare schemes
INSERT INTO public.welfare_schemes (name, name_hindi, description, description_hindi, monthly_amount, min_age, max_age, max_income, requires_disability)
VALUES 
  ('Old Age Pension', 'वृद्धावस्था पेंशन', 'Monthly pension for senior citizens above 60 years', '60 वर्ष से अधिक आयु के वरिष्ठ नागरिकों के लिए मासिक पेंशन', 1500.00, 60, NULL, 200000, FALSE),
  ('Widow Pension', 'विधवा पेंशन', 'Financial support for widows', 'विधवाओं के लिए वित्तीय सहायता', 1500.00, 18, NULL, 200000, FALSE),
  ('Disability Pension', 'विकलांगता पेंशन', 'Monthly support for persons with disabilities', 'विकलांग व्यक्तियों के लिए मासिक सहायता', 2000.00, 18, NULL, 300000, TRUE),
  ('Indira Gandhi National Pension', 'इंदिरा गांधी राष्ट्रीय पेंशन', 'Central government pension scheme for BPL families', 'बीपीएल परिवारों के लिए केंद्र सरकार की पेंशन योजना', 2500.00, 60, NULL, 100000, FALSE);