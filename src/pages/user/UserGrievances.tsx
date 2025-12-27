import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { StatusBadge } from '@/components/user/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, X, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const grievanceCategories = [
  { value: 'payment_delay', en: 'Payment Delay', hi: 'भुगतान में देरी' },
  { value: 'wrong_amount', en: 'Wrong Amount', hi: 'गलत राशि' },
  { value: 'account_issue', en: 'Bank Account Issue', hi: 'बैंक खाता समस्या' },
  { value: 'scheme_enrollment', en: 'Scheme Enrollment', hi: 'योजना नामांकन' },
  { value: 'document_issue', en: 'Document Issue', hi: 'दस्तावेज़ समस्या' },
  { value: 'other', en: 'Other', hi: 'अन्य' },
];

export default function UserGrievances() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
  });

  useEffect(() => {
    fetchGrievances();
  }, [profile?.id]);

  async function fetchGrievances() {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('beneficiary_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrievances(data || []);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('grievances')
        .insert({
          beneficiary_id: profile.id,
          category: formData.category,
          subject: formData.subject,
          description: formData.description,
        });

      if (error) throw error;

      toast({
        title: language === 'hi' ? 'शिकायत दर्ज की गई' : 'Grievance Submitted',
        description: language === 'hi' 
          ? 'आपकी शिकायत सफलतापूर्वक दर्ज की गई है'
          : 'Your grievance has been successfully submitted',
      });

      setFormData({ category: '', subject: '', description: '' });
      setShowForm(false);
      fetchGrievances();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const getCategoryLabel = (value: string) => {
    const cat = grievanceCategories.find(c => c.value === value);
    return cat ? (language === 'hi' ? cat.hi : cat.en) : value;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <div className="flex flex-1">
        <UserSidebar />
        
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-4xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{t('grievances')}</h1>
                  <p className="text-muted-foreground">
                    {language === 'hi' 
                      ? 'अपनी शिकायतें दर्ज करें और ट्रैक करें'
                      : 'Raise and track your grievances'}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowForm(!showForm)}
                size="lg"
                className="gap-2"
              >
                {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showForm 
                  ? (language === 'hi' ? 'बंद करें' : 'Cancel')
                  : t('raiseGrievance')}
              </Button>
            </div>

            {/* New Grievance Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="govt-card space-y-4">
                <h3 className="text-lg font-bold">{t('raiseGrievance')}</h3>
                
                <div className="space-y-2">
                  <label className="font-medium">
                    {language === 'hi' ? 'श्रेणी' : 'Category'}
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'hi' ? 'श्रेणी चुनें' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {grievanceCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {language === 'hi' ? cat.hi : cat.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-medium">
                    {language === 'hi' ? 'विषय' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={language === 'hi' ? 'संक्षिप्त विषय लिखें' : 'Brief subject'}
                    className="w-full h-12 px-4 border-2 border-input rounded-lg focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">
                    {language === 'hi' ? 'विवरण' : 'Description'}
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={language === 'hi' ? 'अपनी समस्या का विस्तार से वर्णन करें' : 'Describe your issue in detail'}
                    className="min-h-32 text-base"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || !formData.category || !formData.subject || !formData.description}
                  className="w-full gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {t('submit')}
                </Button>
              </form>
            )}

            {/* Grievances List */}
            {loading ? (
              <div className="govt-card">
                <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
              </div>
            ) : grievances.length > 0 ? (
              <div className="space-y-4">
                {grievances.map(grievance => (
                  <div key={grievance.id} className="govt-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm px-2 py-1 bg-muted rounded-md">
                            {getCategoryLabel(grievance.category)}
                          </span>
                          <StatusBadge status={grievance.status} size="sm" />
                        </div>
                        <h3 className="font-bold text-lg">{grievance.subject}</h3>
                        <p className="text-muted-foreground mt-1">{grievance.description}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(grievance.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {grievance.admin_response && (
                      <div className="mt-4 p-4 bg-success/10 rounded-lg border-l-4 border-success">
                        <p className="font-medium text-success mb-1">
                          {language === 'hi' ? 'प्रशासन का जवाब' : 'Admin Response'}
                        </p>
                        <p className="text-foreground">{grievance.admin_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="govt-card text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'hi' ? 'कोई शिकायत नहीं' : 'No Grievances'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'आपने अभी तक कोई शिकायत दर्ज नहीं की है'
                    : 'You have not raised any grievances yet'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
