import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useLanguage } from '@/contexts/LanguageContext';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline, syncPending } = useOfflineSupport();
  const { language } = useLanguage();

  if (isOnline && !syncPending) return null;

  return (
    <div className={`fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
      isOnline 
        ? 'bg-warning text-warning-foreground' 
        : 'bg-destructive text-destructive-foreground'
    }`}>
      {syncPending ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          {language === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...'}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          {language === 'hi' ? 'ऑफ़लाइन - कैश्ड डेटा' : 'Offline - Cached Data'}
        </>
      )}
    </div>
  );
}
