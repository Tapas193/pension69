import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  UserRound, 
  Heart, 
  Accessibility, 
  Calendar,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SchemeSuggestion {
  id: string;
  name: string;
  name_hindi: string;
  monthly_amount: number;
  reason: string;
  reason_hindi: string;
  matchScore: number;
}

export function LifeEventSuggestions() {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<SchemeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [lifeEvents, setLifeEvents] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      analyzeBeneficiary();
    }
  }, [profile]);

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

  const analyzeBeneficiary = async () => {
    setLoading(true);
    try {
      const age = calculateAge(profile?.date_of_birth);
      const events: string[] = [];

      // Detect life events from profile
      if (age && age >= 60) {
        events.push('senior_citizen');
      }
      if (profile?.gender === 'Female' && age && age >= 40) {
        // Could be widow - we'd need a field for this
        events.push('potential_widow_pension');
      }
      if (profile?.is_disabled) {
        events.push('disability');
      }
      if (profile?.employment_status === 'Unemployed' || profile?.employment_status === 'Retired') {
        events.push('unemployment_retired');
      }
      if (profile?.annual_income && Number(profile.annual_income) < 100000) {
        events.push('low_income');
      }

      setLifeEvents(events);

      // Fetch relevant schemes based on life events
      const { data: schemes, error } = await supabase
        .from('welfare_schemes')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Fetch already enrolled schemes
      const { data: enrolledSchemes } = await supabase
        .from('beneficiary_schemes')
        .select('scheme_id')
        .eq('beneficiary_id', profile?.id);

      const enrolledIds = new Set(enrolledSchemes?.map(s => s.scheme_id) || []);

      // Score and filter schemes
      const scored: SchemeSuggestion[] = [];

      for (const scheme of schemes || []) {
        if (enrolledIds.has(scheme.id)) continue;

        let matchScore = 0;
        let reason = '';
        let reason_hindi = '';

        // Senior citizen matching
        if (events.includes('senior_citizen')) {
          if (age && scheme.min_age && age >= scheme.min_age) {
            matchScore += 40;
            reason = 'Based on your age, you qualify as a senior citizen';
            reason_hindi = 'आपकी उम्र के आधार पर, आप वरिष्ठ नागरिक के रूप में योग्य हैं';
          }
        }

        // Disability matching
        if (events.includes('disability') && scheme.requires_disability) {
          matchScore += 50;
          reason = 'This scheme is designed for persons with disabilities';
          reason_hindi = 'यह योजना दिव्यांग व्यक्तियों के लिए बनाई गई है';
        }

        // Income matching
        if (events.includes('low_income')) {
          if (scheme.max_income && profile?.annual_income && Number(profile.annual_income) <= scheme.max_income) {
            matchScore += 30;
            if (!reason) {
              reason = 'Your income makes you eligible for this welfare scheme';
              reason_hindi = 'आपकी आय आपको इस कल्याण योजना के लिए पात्र बनाती है';
            }
          }
        }

        // Age range matching
        if (age) {
          const minOk = !scheme.min_age || age >= scheme.min_age;
          const maxOk = !scheme.max_age || age <= scheme.max_age;
          if (minOk && maxOk) {
            matchScore += 20;
          }
        }

        if (matchScore > 0) {
          scored.push({
            id: scheme.id,
            name: scheme.name,
            name_hindi: scheme.name_hindi || scheme.name,
            monthly_amount: scheme.monthly_amount,
            reason: reason || 'You may qualify based on your profile',
            reason_hindi: reason_hindi || 'आपकी प्रोफ़ाइल के आधार पर आप पात्र हो सकते हैं',
            matchScore,
          });
        }
      }

      // Sort by score and take top 3
      scored.sort((a, b) => b.matchScore - a.matchScore);
      setSuggestions(scored.slice(0, 3));
    } catch (error) {
      console.error('Error analyzing beneficiary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLifeEventIcon = (event: string) => {
    switch (event) {
      case 'senior_citizen':
        return <Calendar className="w-4 h-4" />;
      case 'disability':
        return <Accessibility className="w-4 h-4" />;
      case 'potential_widow_pension':
        return <Heart className="w-4 h-4" />;
      default:
        return <UserRound className="w-4 h-4" />;
    }
  };

  const getLifeEventLabel = (event: string) => {
    const labels: Record<string, { en: string; hi: string }> = {
      senior_citizen: { en: 'Senior Citizen', hi: 'वरिष्ठ नागरिक' },
      disability: { en: 'Person with Disability', hi: 'दिव्यांग व्यक्ति' },
      potential_widow_pension: { en: 'Widow/Single Woman', hi: 'विधवा/एकल महिला' },
      unemployment_retired: { en: 'Retired/Unemployed', hi: 'सेवानिवृत्त/बेरोजगार' },
      low_income: { en: 'Low Income', hi: 'कम आय' },
    };
    return labels[event]?.[language === 'hi' ? 'hi' : 'en'] || event;
  };

  if (loading) {
    return (
      <div className="govt-card">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="govt-card border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">
          {language === 'hi' 
            ? 'आपके लिए सुझाई गई योजनाएं' 
            : 'Recommended Schemes for You'}
        </h3>
      </div>

      {/* Life Events Tags */}
      {lifeEvents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {lifeEvents.map(event => (
            <span 
              key={event}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
            >
              {getLifeEventIcon(event)}
              {getLifeEventLabel(event)}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map(suggestion => (
          <div 
            key={suggestion.id}
            className="p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold">
                  {language === 'hi' ? suggestion.name_hindi : suggestion.name}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'hi' ? suggestion.reason_hindi : suggestion.reason}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  ₹{suggestion.monthly_amount}/month
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/user/schemes')}
                className="shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="link" 
        className="mt-4 p-0"
        onClick={() => navigate('/user/eligibility')}
      >
        {language === 'hi' ? 'पूरी पात्रता जांच करें →' : 'Check full eligibility →'}
      </Button>
    </div>
  );
}
