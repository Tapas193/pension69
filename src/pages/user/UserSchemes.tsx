import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { MobileNav } from '@/components/user/MobileNav';
import { StatusBadge } from '@/components/user/StatusBadge';
import { FileText, Calendar, IndianRupee } from 'lucide-react';

export default function UserSchemes() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchemes() {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('beneficiary_schemes')
          .select(`
            *,
            welfare_schemes (*)
          `)
          .eq('beneficiary_id', profile.id);

        if (error) throw error;
        setSchemes(data || []);
      } catch (error) {
        console.error('Error fetching schemes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSchemes();
  }, [profile?.id]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <div className="flex flex-1">
        <div className="hidden md:block">
          <UserSidebar />
        </div>
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('mySchemes')}</h1>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'आपकी पंजीकृत कल्याण योजनाएं'
                    : 'Your enrolled welfare schemes'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="govt-card">
                <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
              </div>
            ) : schemes.length > 0 ? (
              <div className="space-y-4">
                {schemes.map(enrollment => {
                  const scheme = enrollment.welfare_schemes;
                  return (
                    <div key={enrollment.id} className="govt-card">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center shrink-0">
                              <FileText className="w-6 h-6 text-secondary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">
                                {language === 'hi' ? scheme?.name_hindi : scheme?.name}
                              </h3>
                              <p className="text-muted-foreground mt-1">
                                {language === 'hi' ? scheme?.description_hindi : scheme?.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={enrollment.status} size="lg" />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">{t('monthlyPension')}</p>
                            <p className="font-bold text-lg text-primary">₹{scheme?.monthly_amount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {language === 'hi' ? 'नामांकन तिथि' : 'Enrolled On'}
                            </p>
                            <p className="font-semibold">
                              {new Date(enrollment.enrolled_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {enrollment.remarks && (
                          <div className="md:col-span-1">
                            <p className="text-sm text-muted-foreground">
                              {language === 'hi' ? 'टिप्पणी' : 'Remarks'}
                            </p>
                            <p className="font-medium">{enrollment.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="govt-card text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'hi' ? 'कोई योजना नहीं मिली' : 'No Schemes Found'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'आप अभी किसी योजना में पंजीकृत नहीं हैं'
                    : 'You are not enrolled in any welfare scheme yet'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
