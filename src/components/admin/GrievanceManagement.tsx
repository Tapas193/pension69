import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Send,
  AlertCircle
} from 'lucide-react';

interface Grievance {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: 'submitted' | 'under_review' | 'resolved' | 'rejected';
  admin_response: string | null;
  created_at: string;
  beneficiary_id: string;
  profiles?: {
    full_name: string;
    phone: string;
  };
}

export function GrievanceManagement() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'under_review' | 'resolved' | 'rejected'>('submitted');
  
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState<'under_review' | 'resolved' | 'rejected'>('resolved');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGrievances();
  }, []);

  async function fetchGrievances() {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select(`
          *,
          profiles:beneficiary_id (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrievances(data || []);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  }

  const openRespondDialog = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setAdminResponse(grievance.admin_response || '');
    setResponseStatus(grievance.status === 'submitted' ? 'resolved' : grievance.status as any);
    setRespondDialogOpen(true);
  };

  const handleRespond = async () => {
    if (!selectedGrievance || !adminResponse.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया प्रतिक्रिया दें' : 'Please provide a response',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const updateData: any = {
        admin_response: adminResponse,
        status: responseStatus,
        assigned_to: user?.id,
      };

      if (responseStatus === 'resolved' || responseStatus === 'rejected') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('grievances')
        .update(updateData)
        .eq('id', selectedGrievance.id);

      if (error) throw error;

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' ? 'प्रतिक्रिया सहेजी गई' : 'Response saved successfully',
      });

      setRespondDialogOpen(false);
      fetchGrievances();
    } catch (error) {
      console.error('Error responding to grievance:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'प्रतिक्रिया सहेजने में विफल' : 'Failed to save response',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredGrievances = () => {
    if (filter === 'all') return grievances;
    return grievances.filter(g => g.status === filter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'under_review': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; hi: string }> = {
      submitted: { en: 'Submitted', hi: 'प्रस्तुत' },
      under_review: { en: 'Under Review', hi: 'समीक्षाधीन' },
      resolved: { en: 'Resolved', hi: 'हल किया गया' },
      rejected: { en: 'Rejected', hi: 'अस्वीकृत' },
    };
    return labels[status]?.[language === 'hi' ? 'hi' : 'en'] || status;
  };

  const counts = {
    all: grievances.length,
    submitted: grievances.filter(g => g.status === 'submitted').length,
    under_review: grievances.filter(g => g.status === 'under_review').length,
    resolved: grievances.filter(g => g.status === 'resolved').length,
    rejected: grievances.filter(g => g.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {language === 'hi' ? 'शिकायत प्रबंधन' : 'Grievance Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'hi' ? 'उपयोगकर्ता शिकायतों की समीक्षा और समाधान करें' : 'Review and resolve user grievances'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['submitted', 'under_review', 'resolved', 'rejected', 'all'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="gap-1"
          >
            {f === 'submitted' && <Clock className="w-4 h-4" />}
            {f === 'under_review' && <AlertCircle className="w-4 h-4" />}
            {f === 'resolved' && <CheckCircle className="w-4 h-4" />}
            {f === 'rejected' && <XCircle className="w-4 h-4" />}
            {f === 'all' && <MessageSquare className="w-4 h-4" />}
            {getStatusLabel(f === 'all' ? 'all' : f)}
            {f === 'all' && (language === 'hi' ? 'सभी' : 'All')}
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted">
              {counts[f]}
            </span>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="govt-card text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      ) : getFilteredGrievances().length > 0 ? (
        <div className="space-y-4">
          {getFilteredGrievances().map(grievance => (
            <div key={grievance.id} className="govt-card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{grievance.subject}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      grievance.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      grievance.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      grievance.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {getStatusIcon(grievance.status)}
                      {getStatusLabel(grievance.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{grievance.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-muted rounded-full">
                      {language === 'hi' ? 'श्रेणी' : 'Category'}: {grievance.category}
                    </span>
                    <span className="px-2 py-1 bg-muted rounded-full">
                      {language === 'hi' ? 'उपयोगकर्ता' : 'User'}: {grievance.profiles?.full_name || 'N/A'}
                    </span>
                    <span className="px-2 py-1 bg-muted rounded-full">
                      {new Date(grievance.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {grievance.admin_response && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'प्रशासन प्रतिक्रिया' : 'Admin Response'}:</p>
                      <p className="text-sm">{grievance.admin_response}</p>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={grievance.status === 'resolved' || grievance.status === 'rejected' ? 'outline' : 'default'}
                  onClick={() => openRespondDialog(grievance)}
                  className="gap-1"
                >
                  {grievance.status === 'resolved' || grievance.status === 'rejected' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      {language === 'hi' ? 'देखें' : 'View'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {language === 'hi' ? 'प्रतिक्रिया दें' : 'Respond'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="govt-card text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {language === 'hi' ? 'कोई शिकायत नहीं' : 'No Grievances'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'hi' ? 'इस श्रेणी में कोई शिकायत नहीं मिली' : 'No grievances found in this category'}
          </p>
        </div>
      )}

      {/* Respond Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6 text-primary" />
              {language === 'hi' ? 'शिकायत प्रतिक्रिया' : 'Grievance Response'}
            </DialogTitle>
            <DialogDescription>
              {selectedGrievance?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedGrievance && (
            <div className="space-y-4 pt-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{language === 'hi' ? 'विवरण' : 'Description'}</p>
                <p className="text-sm">{selectedGrievance.description}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'hi' ? 'स्थिति' : 'Status'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['under_review', 'resolved', 'rejected'] as const).map(status => (
                    <Button
                      key={status}
                      type="button"
                      variant={responseStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setResponseStatus(status)}
                      className="gap-1"
                    >
                      {status === 'under_review' && <AlertCircle className="w-4 h-4" />}
                      {status === 'resolved' && <CheckCircle className="w-4 h-4" />}
                      {status === 'rejected' && <XCircle className="w-4 h-4" />}
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === 'hi' ? 'प्रतिक्रिया *' : 'Response *'}
                </label>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder={language === 'hi' ? 'अपनी प्रतिक्रिया दें...' : 'Enter your response...'}
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setRespondDialogOpen(false)}
                  className="flex-1"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleRespond}
                  disabled={actionLoading || !adminResponse.trim()}
                  className="flex-1"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'hi' ? 'सहेज रहा है...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {language === 'hi' ? 'प्रतिक्रिया भेजें' : 'Send Response'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
