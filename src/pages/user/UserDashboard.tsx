import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { MobileNav } from '@/components/user/MobileNav';
import { StatusBadge } from '@/components/user/StatusBadge';
import { BankConnectionDialog } from '@/components/user/BankConnectionDialog';
import { ProfileEditDialog } from '@/components/user/ProfileEditDialog';
import { LocationButton } from '@/components/user/LocationButton';
import { ProfilePictureUpload } from '@/components/user/ProfilePictureUpload';
import { EmailPhoneVerification } from '@/components/user/EmailPhoneVerification';
import { User, Calendar, MapPin, CreditCard, Shield, Mail, Phone } from 'lucide-react';

export default function UserDashboard() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [latestPayment, setLatestPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return;

      try {
        // Fetch enrolled schemes
        const { data: schemesData } = await supabase
          .from('beneficiary_schemes')
          .select(`
            *,
            welfare_schemes (*)
          `)
          .eq('beneficiary_id', profile.id);

        setSchemes(schemesData || []);

        // Fetch latest payment
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('beneficiary_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setLatestPayment(paymentData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [profile?.id]);

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
            {/* Welcome Section with Profile Picture */}
            <div className="govt-card bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ProfilePictureUpload />
                <div className="text-center sm:text-left">
                  <p className="text-muted-foreground">{t('welcome')}</p>
                  <h1 className="text-2xl font-bold text-foreground">
                    {language === 'hi' && profile?.full_name_hindi 
                      ? profile.full_name_hindi 
                      : profile?.full_name || 'User'}
                  </h1>
                  {/* Verification Badges */}
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    <EmailPhoneVerification type="email" />
                    <EmailPhoneVerification type="phone" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="govt-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t('myProfile')}
                </h2>
                <ProfileEditDialog />
              </div>
              
              {/* Location Button */}
              <div className="mb-4">
                <LocationButton size="lg" className="w-full md:w-auto" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold">
                      {calculateAge(profile?.date_of_birth) || 'Not set'} years
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold">{profile?.gender || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aadhaar</p>
                    <p className="font-semibold">
                      XXXX-XXXX-{profile?.aadhaar_masked || 'XXXX'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Bank Account</p>
                    <p className="font-semibold">
                      {profile?.bank_account_masked 
                        ? `XXXXXXXX${profile.bank_account_masked}` 
                        : 'Not linked'}
                    </p>
                  </div>
                </div>

                {/* Bank Connection Button */}
                <div className="md:col-span-2">
                  <BankConnectionDialog />
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg md:col-span-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold">
                      {profile?.address || 'Not set'}, {profile?.district || ''}, {profile?.state || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Active Schemes */}
              <div className="govt-card">
                <h3 className="font-bold text-lg mb-3">{t('mySchemes')}</h3>
                {loading ? (
                  <p className="text-muted-foreground">{t('loading')}</p>
                ) : schemes.length > 0 ? (
                  <div className="space-y-3">
                    {schemes.slice(0, 2).map(scheme => (
                      <div key={scheme.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-semibold">
                            {language === 'hi' 
                              ? scheme.welfare_schemes?.name_hindi 
                              : scheme.welfare_schemes?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ₹{scheme.welfare_schemes?.monthly_amount}/month
                          </p>
                        </div>
                        <StatusBadge status={scheme.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No schemes enrolled yet</p>
                )}
              </div>

              {/* Latest Payment */}
              <div className="govt-card">
                <h3 className="font-bold text-lg mb-3">{t('lastPayment')}</h3>
                {loading ? (
                  <p className="text-muted-foreground">{t('loading')}</p>
                ) : latestPayment ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-primary">
                        ₹{latestPayment.amount}
                      </span>
                      <StatusBadge status={latestPayment.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {latestPayment.payment_date 
                        ? new Date(latestPayment.payment_date).toLocaleDateString('en-IN')
                        : 'Pending'}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No payments yet</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
