import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Shield } from 'lucide-react';

export function GovtHeader() {
  const { t } = useLanguage();
  
  return (
    <header className="govt-header">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm opacity-90">{t('govtOfIndia')}</p>
            <h1 className="text-lg md:text-xl font-bold">{t('pensionWelfare')}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
