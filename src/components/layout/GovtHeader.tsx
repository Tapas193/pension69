import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Shield } from 'lucide-react';

export function GovtHeader() {
  const { t } = useLanguage();
  
  return (
    <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-foreground rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-primary-foreground/90">{t('govtOfIndia')}</p>
            <h1 className="text-lg md:text-xl font-bold text-primary-foreground">{t('pensionWelfare')}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
