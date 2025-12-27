import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';

interface MobileInputProps {
  onSubmit: (phone: string) => void;
  isLoading: boolean;
}

export function MobileInput({ onSubmit, isLoading }: MobileInputProps) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setError('');
    onSubmit('+91' + cleanPhone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-foreground">
          {t('enterMobile')}
        </label>
        <p className="text-muted-foreground">{t('mobileHint')}</p>
        
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
            <Phone className="w-6 h-6" />
            <span className="text-lg font-medium">+91</span>
          </div>
          <Input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="9876543210"
            className="pl-24 h-16 text-2xl font-semibold tracking-widest border-2 focus:border-primary"
            autoFocus
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-destructive font-medium">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={phone.length !== 10 || isLoading}
        className="w-full btn-elderly bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t('loading')}
          </>
        ) : (
          <>
            {t('sendOtp')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
