import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface RiskInfo {
  level: 'low' | 'medium' | 'high';
  missedPayments: number;
  delayedPayments: number;
  lastPaymentDate: string | null;
  avgDelay: number;
}

export function PaymentRiskIndicator() {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const [riskInfo, setRiskInfo] = useState<RiskInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      analyzePaymentRisk();
    }
  }, [profile?.id]);

  const analyzePaymentRisk = async () => {
    setLoading(true);
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('beneficiary_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const failed = payments?.filter(p => p.status === 'failed') || [];
      const pending = payments?.filter(p => p.status === 'pending') || [];
      const successful = payments?.filter(p => p.status === 'successful') || [];

      // Calculate average delay for successful payments
      let totalDelay = 0;
      let delayedCount = 0;
      successful.forEach(p => {
        if (p.payment_date && p.created_at) {
          const created = new Date(p.created_at);
          const paid = new Date(p.payment_date);
          const diffDays = Math.floor((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 7) {
            totalDelay += diffDays;
            delayedCount++;
          }
        }
      });

      const avgDelay = delayedCount > 0 ? Math.round(totalDelay / delayedCount) : 0;

      // Determine risk level
      let level: 'low' | 'medium' | 'high' = 'low';
      if (failed.length >= 3 || avgDelay > 30) {
        level = 'high';
      } else if (failed.length >= 1 || avgDelay > 14 || pending.length > 2) {
        level = 'medium';
      }

      setRiskInfo({
        level,
        missedPayments: failed.length,
        delayedPayments: delayedCount,
        lastPaymentDate: successful[0]?.payment_date || null,
        avgDelay,
      });
    } catch (error) {
      console.error('Error analyzing payment risk:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{language === 'hi' ? 'जांच हो रही है...' : 'Analyzing...'}</span>
      </div>
    );
  }

  if (!riskInfo) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getRiskLabel = (level: string) => {
    const labels: Record<string, { en: string; hi: string }> = {
      high: { en: 'High Risk - Contact Office', hi: 'उच्च जोखिम - कार्यालय से संपर्क करें' },
      medium: { en: 'Moderate Risk', hi: 'मध्यम जोखिम' },
      low: { en: 'All Payments On Track', hi: 'सभी भुगतान समय पर' },
    };
    return labels[level]?.[language === 'hi' ? 'hi' : 'en'] || level;
  };

  return (
    <div className={`p-4 rounded-lg border ${getRiskColor(riskInfo.level)}`}>
      <div className="flex items-center gap-3 mb-3">
        {getRiskIcon(riskInfo.level)}
        <span className="font-semibold">{getRiskLabel(riskInfo.level)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {riskInfo.missedPayments > 0 && (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <span>
              {riskInfo.missedPayments} {language === 'hi' ? 'विफल' : 'failed'}
            </span>
          </div>
        )}
        
        {riskInfo.delayedPayments > 0 && (
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-warning" />
            <span>
              {riskInfo.avgDelay}d {language === 'hi' ? 'औसत देरी' : 'avg delay'}
            </span>
          </div>
        )}

        {riskInfo.lastPaymentDate && (
          <div className="col-span-2 text-muted-foreground">
            {language === 'hi' ? 'अंतिम भुगतान: ' : 'Last payment: '}
            {new Date(riskInfo.lastPaymentDate).toLocaleDateString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
}
