import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface OtpInputProps {
  phone: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  onResend: () => void;
  isLoading: boolean;
  error?: string;
}

export function OtpInput({ phone, onVerify, onBack, onResend, isLoading, error }: OtpInputProps) {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    if (pasted.length === 6) {
      onVerify(pasted);
    }
  };

  const handleResend = () => {
    onResend();
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('back')}</span>
      </button>

      <div className="space-y-3">
        <label className="block text-lg font-semibold text-foreground">
          {t('enterOtp')}
        </label>
        <p className="text-muted-foreground">
          {t('otpSent')}: <span className="font-semibold text-foreground">{phone}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            className="input-otp-elderly bg-background border-input focus:border-primary"
            disabled={isLoading}
            maxLength={1}
          />
        ))}
      </div>

      {error && (
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      <Button
        onClick={() => onVerify(otp.join(''))}
        size="lg"
        disabled={otp.some(d => !d) || isLoading}
        className="w-full btn-elderly bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t('loading')}
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            {t('verifyOtp')}
          </>
        )}
      </Button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-muted-foreground">
            {t('resendOtp')} in <span className="font-semibold">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-primary font-semibold hover:underline"
          >
            {t('resendOtp')}
          </button>
        )}
      </div>
    </div>
  );
}
