import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Loader2,
  Flame,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PrioritizedGrievance {
  id: string;
  subject: string;
  category: string;
  created_at: string;
  status: string;
  priorityScore: number;
  priorityReason: string;
  priorityReason_hi: string;
  daysOpen: number;
  profiles?: {
    full_name: string;
    is_disabled?: boolean;
    date_of_birth?: string;
  };
}

export function GrievancePrioritization({ onSelectGrievance }: { onSelectGrievance?: (id: string) => void }) {
  const { language } = useLanguage();
  const [grievances, setGrievances] = useState<PrioritizedGrievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndPrioritize();
  }, []);

  const calculateAge = (dob?: string | null) => {
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

  const fetchAndPrioritize = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select(`
          *,
          profiles:beneficiary_id (
            full_name,
            is_disabled,
            date_of_birth
          )
        `)
        .in('status', ['submitted', 'under_review'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      // AI-based prioritization logic
      const prioritized: PrioritizedGrievance[] = (data || []).map(g => {
        let score = 0;
        let reason = '';
        let reason_hi = '';

        const now = new Date();
        const created = new Date(g.created_at);
        const daysOpen = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

        // Age-based priority (elderly users)
        const userAge = calculateAge(g.profiles?.date_of_birth);
        if (userAge && userAge >= 70) {
          score += 30;
          reason = 'Elderly beneficiary (70+)';
          reason_hi = 'वरिष्ठ लाभार्थी (70+)';
        } else if (userAge && userAge >= 60) {
          score += 15;
        }

        // Disability priority
        if (g.profiles?.is_disabled) {
          score += 25;
          reason = reason || 'Person with disability';
          reason_hi = reason_hi || 'दिव्यांग व्यक्ति';
        }

        // Long-pending cases
        if (daysOpen >= 30) {
          score += 40;
          reason = reason || `Long pending (${daysOpen} days)`;
          reason_hi = reason_hi || `लंबित (${daysOpen} दिन)`;
        } else if (daysOpen >= 14) {
          score += 20;
          reason = reason || `Pending ${daysOpen} days`;
          reason_hi = reason_hi || `${daysOpen} दिन लंबित`;
        }

        // Category-based priority
        const urgentCategories = ['payment_issue', 'document_issue', 'bank_issue'];
        if (urgentCategories.includes(g.category)) {
          score += 15;
        }

        // Keyword detection for urgency
        const urgentKeywords = ['urgent', 'emergency', 'medical', 'hospital', 'death', 'dying'];
        const text = (g.subject + ' ' + g.description).toLowerCase();
        if (urgentKeywords.some(kw => text.includes(kw))) {
          score += 35;
          reason = reason || 'Urgent keywords detected';
          reason_hi = reason_hi || 'तत्काल शब्द पाए गए';
        }

        return {
          ...g,
          priorityScore: score,
          priorityReason: reason || 'Standard priority',
          priorityReason_hi: reason_hi || 'सामान्य प्राथमिकता',
          daysOpen,
        };
      });

      // Sort by priority score (highest first)
      prioritized.sort((a, b) => b.priorityScore - a.priorityScore);
      
      setGrievances(prioritized);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (score: number) => {
    if (score >= 50) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Flame className="w-3 h-3" />
          {language === 'hi' ? 'अत्यावश्यक' : 'Critical'}
        </Badge>
      );
    }
    if (score >= 30) {
      return (
        <Badge className="gap-1 bg-warning text-warning-foreground">
          <AlertTriangle className="w-3 h-3" />
          {language === 'hi' ? 'उच्च' : 'High'}
        </Badge>
      );
    }
    if (score >= 15) {
      return (
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="w-3 h-3" />
          {language === 'hi' ? 'मध्यम' : 'Medium'}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="w-3 h-3" />
        {language === 'hi' ? 'सामान्य' : 'Normal'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const urgentCount = grievances.filter(g => g.priorityScore >= 50).length;
  const highCount = grievances.filter(g => g.priorityScore >= 30 && g.priorityScore < 50).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg">
          <Flame className="w-4 h-4" />
          <span className="font-medium">{urgentCount} {language === 'hi' ? 'अत्यावश्यक' : 'Critical'}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 text-warning rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">{highCount} {language === 'hi' ? 'उच्च प्राथमिकता' : 'High Priority'}</span>
        </div>
      </div>

      {/* Prioritized List */}
      <div className="space-y-3">
        {grievances.slice(0, 10).map(grievance => (
          <div 
            key={grievance.id}
            onClick={() => onSelectGrievance?.(grievance.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary ${
              grievance.priorityScore >= 50 ? 'border-l-4 border-l-destructive bg-destructive/5' :
              grievance.priorityScore >= 30 ? 'border-l-4 border-l-warning bg-warning/5' :
              'border-border'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {getPriorityBadge(grievance.priorityScore)}
                  <span className="text-xs text-muted-foreground">
                    Score: {grievance.priorityScore}
                  </span>
                </div>
                <h4 className="font-semibold">{grievance.subject}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'hi' ? grievance.priorityReason_hi : grievance.priorityReason}
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {grievance.daysOpen}d
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {grievance.profiles?.full_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
