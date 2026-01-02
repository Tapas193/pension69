import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { MobileNav } from '@/components/user/MobileNav';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, IndianRupee, Calendar, Users, Loader2, CheckCircle } from 'lucide-react';

interface WelfareScheme {
  id: string;
  name: string;
  name_hindi: string | null;
  description: string | null;
  description_hindi: string | null;
  monthly_amount: number;
  min_age: number | null;
  max_age: number | null;
  max_income: number | null;
  requires_disability: boolean | null;
  is_active: boolean | null;
}

export default function UserBrowseSchemes() {
  const { t, language } = useLanguage();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [enrolledSchemeIds, setEnrolledSchemeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all active schemes
        const { data: schemesData, error: schemesError } = await supabase
          .from('welfare_schemes')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (schemesError) throw schemesError;
        setSchemes(schemesData || []);

        // Fetch user's enrolled schemes
        if (profile?.id) {
          const { data: enrolledData, error: enrolledError } = await supabase
            .from('beneficiary_schemes')
            .select('scheme_id')
            .eq('beneficiary_id', profile.id);

          if (enrolledError) throw enrolledError;
          setEnrolledSchemeIds(new Set(enrolledData?.map(e => e.scheme_id) || []));
        }
      } catch (error) {
        console.error('Error fetching schemes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [profile?.id]);

  const handleEnroll = async (schemeId: string) => {
    if (!profile?.id) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया पहले लॉगिन करें' : 'Please login first',
        variant: 'destructive',
      });
      return;
    }

    setEnrollingId(schemeId);
    try {
      const { error } = await supabase
        .from('beneficiary_schemes')
        .insert({
          beneficiary_id: profile.id,
          scheme_id: schemeId,
          status: 'pending',
        });

      if (error) throw error;

      setEnrolledSchemeIds(prev => new Set([...prev, schemeId]));
      
      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' 
          ? 'योजना के लिए आवेदन सफल। अनुमोदन की प्रतीक्षा करें।' 
          : 'Application submitted successfully. Await approval.',
      });
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: error.message || (language === 'hi' ? 'आवेदन विफल' : 'Failed to apply'),
        variant: 'destructive',
      });
    } finally {
      setEnrollingId(null);
    }
  };

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
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === 'hi' ? 'उपलब्ध योजनाएं' : 'Available Schemes'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'कल्याणकारी योजनाओं में आवेदन करें'
                    : 'Browse and apply for welfare schemes'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="govt-card text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">{t('loading')}</p>
              </div>
            ) : schemes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {schemes.map(scheme => {
                  const isEnrolled = enrolledSchemeIds.has(scheme.id);
                  return (
                    <div key={scheme.id} className="govt-card flex flex-col h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {language === 'hi' && scheme.name_hindi ? scheme.name_hindi : scheme.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === 'hi' && scheme.description_hindi 
                              ? scheme.description_hindi 
                              : scheme.description || (language === 'hi' ? 'कोई विवरण नहीं' : 'No description')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs mb-4 flex-1">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          ₹{scheme.monthly_amount.toLocaleString()}/{language === 'hi' ? 'माह' : 'month'}
                        </span>
                        {(scheme.min_age || scheme.max_age) && (
                          <span className="px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {scheme.min_age || 0} - {scheme.max_age || '∞'} {language === 'hi' ? 'वर्ष' : 'yrs'}
                          </span>
                        )}
                        {scheme.max_income && (
                          <span className="px-2 py-1 bg-muted rounded-full">
                            {language === 'hi' ? 'अधिकतम आय' : 'Max Income'}: ₹{scheme.max_income.toLocaleString()}
                          </span>
                        )}
                        {scheme.requires_disability && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                            {language === 'hi' ? 'विकलांगता आवश्यक' : 'Disability Required'}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleEnroll(scheme.id)}
                        disabled={isEnrolled || enrollingId === scheme.id}
                        className="w-full gap-2"
                        variant={isEnrolled ? 'secondary' : 'default'}
                      >
                        {enrollingId === scheme.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {language === 'hi' ? 'आवेदन कर रहे हैं...' : 'Applying...'}
                          </>
                        ) : isEnrolled ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {language === 'hi' ? 'आवेदन किया गया' : 'Already Applied'}
                          </>
                        ) : (
                          language === 'hi' ? 'आवेदन करें' : 'Apply Now'
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="govt-card text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'hi' ? 'कोई योजना उपलब्ध नहीं' : 'No Schemes Available'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'वर्तमान में कोई सक्रिय कल्याण योजना नहीं है'
                    : 'No active welfare schemes available at the moment'}
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
