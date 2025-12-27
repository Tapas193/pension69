import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { MobileInput } from '@/components/auth/MobileInput';
import { OtpInput } from '@/components/auth/OtpInput';
import { Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthStep = 'mobile' | 'otp';

export default function Auth() {
  const { t } = useLanguage();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<AuthStep>('mobile');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(isAdmin ? '/admin' : '/user');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSendOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;

      setPhone(phoneNumber);
      setStep('otp');
      toast({
        title: t('success'),
        description: t('otpSent'),
      });
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.message || 'Failed to send OTP');
      toast({
        title: t('error'),
        description: err.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('welcome'),
      });
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setError(t('invalidOtp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp(phone);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-gentle text-primary text-xl font-semibold">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="govt-card space-y-8">
            {/* Trust Badge */}
            <div className="flex justify-center">
              <div className="trust-badge">
                <Lock className="w-4 h-4" />
                <span>{t('securePortal')}</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {t('login')}
              </h2>
              <p className="text-muted-foreground">
                {step === 'mobile' ? t('mobileHint') : t('otpSent')}
              </p>
            </div>

            {/* Form */}
            {step === 'mobile' ? (
              <MobileInput onSubmit={handleSendOtp} isLoading={isLoading} />
            ) : (
              <OtpInput
                phone={phone}
                onVerify={handleVerifyOtp}
                onBack={() => setStep('mobile')}
                onResend={handleResendOtp}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>

          {/* Footer Info */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to the terms and conditions of this government portal.
          </p>
        </div>
      </main>
    </div>
  );
}
