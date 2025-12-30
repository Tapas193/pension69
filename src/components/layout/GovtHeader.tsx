import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Shield } from 'lucide-react';

export function GovtHeader() {
  const { t } = useLanguage();
  
  return (
    <header className="bg-primary text-primary-foreground py-3 px-3 md:py-4 md:px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-foreground rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 md:w-7 md:h-7 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm text-primary-foreground/90 truncate">{t('govtOfIndia')}</p>
            <h1 className="text-sm md:text-xl font-bold text-primary-foreground truncate">{t('pensionWelfare')}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
