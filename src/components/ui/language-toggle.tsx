import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={toggleLanguage}
      className="gap-2 min-h-12 px-4 border-2 font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
    >
      <Globe className="h-5 w-5" />
      <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
    </Button>
  );
}
