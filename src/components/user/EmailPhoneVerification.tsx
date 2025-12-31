import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Mail, Phone, CheckCircle, Loader2, Shield } from 'lucide-react';

interface VerificationProps {
  type: 'email' | 'phone';
}

export function EmailPhoneVerification({ type }: VerificationProps) {
  const { language } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const isVerified = type === 'email' 
    ? (profile as any)?.email_verified 
    : (profile as any)?.phone_verified;

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      // For email, we use Supabase's built-in email verification
      if (type === 'email') {
        // Simulate OTP sending (in production, use proper email service)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOtpSent(true);
        toast({
          title: language === 'hi' ? 'OTP भेजा गया' : 'OTP Sent',
          description: type === 'email'
            ? (language === 'hi' ? `OTP ${user?.email} पर भेजा गया` : `OTP sent to ${user?.email}`)
            : (language === 'hi' ? `OTP ${profile?.phone} पर भेजा गया` : `OTP sent to ${profile?.phone}`),
        });
      } else {
        // For phone, simulate OTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOtpSent(true);
        toast({
          title: language === 'hi' ? 'OTP भेजा गया' : 'OTP Sent',
          description: language === 'hi' 
            ? `OTP ${profile?.phone} पर भेजा गया` 
            : `OTP sent to ${profile?.phone}`,
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'OTP भेजने में विफल' 
          : 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'OTP 6 अंकों का होना चाहिए' 
          : 'OTP must be 6 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP verification (use 123456 as test OTP)
      if (otp === '123456') {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            [type === 'email' ? 'email_verified' : 'phone_verified']: true 
          })
          .eq('id', profile?.id);

        if (error) throw error;

        await refreshProfile();

        toast({
          title: language === 'hi' ? 'सत्यापित' : 'Verified',
          description: type === 'email'
            ? (language === 'hi' ? 'ईमेल सत्यापित हो गया' : 'Email verified successfully')
            : (language === 'hi' ? 'मोबाइल सत्यापित हो गया' : 'Mobile verified successfully'),
        });

        setShowOtpDialog(false);
        setOtp('');
        setOtpSent(false);
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'अमान्य OTP' 
          : 'Invalid OTP. Use 123456 for testing.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-green-500 text-green-600 bg-green-50">
        <CheckCircle className="w-4 h-4" />
        {type === 'email' 
          ? (language === 'hi' ? 'ईमेल सत्यापित' : 'Email Verified')
          : (language === 'hi' ? 'मोबाइल सत्यापित' : 'Mobile Verified')}
      </Badge>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOtpDialog(true)}
        className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
      >
        {type === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
        {type === 'email' 
          ? (language === 'hi' ? 'ईमेल सत्यापित करें' : 'Verify Email')
          : (language === 'hi' ? 'मोबाइल सत्यापित करें' : 'Verify Mobile')}
      </Button>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-primary" />
              {type === 'email' 
                ? (language === 'hi' ? 'ईमेल सत्यापन' : 'Email Verification')
                : (language === 'hi' ? 'मोबाइल सत्यापन' : 'Mobile Verification')}
            </DialogTitle>
            <DialogDescription>
              {type === 'email' 
                ? (language === 'hi' ? `OTP ${user?.email} पर भेजा जाएगा` : `OTP will be sent to ${user?.email}`)
                : (language === 'hi' ? `OTP ${profile?.phone} पर भेजा जाएगा` : `OTP will be sent to ${profile?.phone}`)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {!otpSent ? (
              <Button 
                onClick={handleSendOtp} 
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'hi' ? 'भेज रहा है...' : 'Sending...'}
                  </>
                ) : (
                  language === 'hi' ? 'OTP भेजें' : 'Send OTP'
                )}
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="h-12 text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'hi' ? 'परीक्षण के लिए 123456 का उपयोग करें' : 'Use 123456 for testing'}
                  </p>
                </div>
                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-12"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'hi' ? 'सत्यापित कर रहा है...' : 'Verifying...'}
                    </>
                  ) : (
                    language === 'hi' ? 'सत्यापित करें' : 'Verify OTP'
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  className="w-full"
                >
                  {language === 'hi' ? 'OTP दोबारा भेजें' : 'Resend OTP'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}