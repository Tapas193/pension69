import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { StatusBadge } from '@/components/user/StatusBadge';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';

export default function UserPayments() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            welfare_schemes (name, name_hindi)
          `)
          .eq('beneficiary_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [profile?.id]);

  const totalReceived = payments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <div className="flex flex-1">
        <UserSidebar />
        
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-4xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('paymentHistory')}</h1>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'आपके सभी पेंशन भुगतान'
                    : 'All your pension payments'}
                </p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="govt-card bg-gradient-to-r from-primary/5 to-success/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    {language === 'hi' ? 'कुल प्राप्त राशि' : 'Total Received'}
                  </p>
                  <p className="text-3xl font-bold text-primary">₹{totalReceived.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-success" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="govt-card">
                <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map(payment => (
                  <div key={payment.id} className="govt-card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          payment.status === 'successful' 
                            ? 'bg-success/20' 
                            : payment.status === 'failed' 
                            ? 'bg-destructive/20' 
                            : 'bg-warning/20'
                        }`}>
                          <CreditCard className={`w-6 h-6 ${
                            payment.status === 'successful' 
                              ? 'text-success' 
                              : payment.status === 'failed' 
                              ? 'text-destructive' 
                              : 'text-warning'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {language === 'hi' 
                              ? payment.welfare_schemes?.name_hindi 
                              : payment.welfare_schemes?.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {payment.payment_date 
                                ? new Date(payment.payment_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : 'Processing...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">₹{payment.amount}</p>
                          {payment.transaction_id && (
                            <p className="text-xs text-muted-foreground">
                              ID: {payment.transaction_id}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={payment.status} />
                      </div>
                    </div>

                    {payment.status === 'failed' && payment.failure_reason && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">
                            {language === 'hi' ? 'विफलता का कारण' : 'Failure Reason'}
                          </p>
                          <p className="text-sm text-muted-foreground">{payment.failure_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="govt-card text-center py-12">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'hi' ? 'कोई भुगतान नहीं' : 'No Payments Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'भुगतान यहाँ दिखाई देंगे जब वे संसाधित होंगे'
                    : 'Payments will appear here once processed'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
