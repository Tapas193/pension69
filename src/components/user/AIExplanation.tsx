import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  MessageCircleQuestion, 
  Loader2, 
  X,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIExplanationProps {
  type: 'payment_delay' | 'eligibility' | 'grievance_status';
  context: {
    status?: string;
    reason?: string;
    amount?: number;
    schemeName?: string;
    daysDelayed?: number;
  };
}

export function AIExplanation({ type, context }: AIExplanationProps) {
  const { language } = useLanguage();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const getExplanation = async () => {
    setLoading(true);
    setVisible(true);
    try {
      let prompt = '';
      
      switch (type) {
        case 'payment_delay':
          prompt = language === 'hi'
            ? `एक सरल भाषा में समझाएं कि पेंशन भुगतान में ${context.daysDelayed || 'कुछ'} दिन की देरी क्यों हो सकती है। कारण: ${context.reason || 'अज्ञात'}. योजना: ${context.schemeName}. 2-3 वाक्यों में बताएं।`
            : `Explain in simple terms why a pension payment might be delayed by ${context.daysDelayed || 'some'} days. Reason: ${context.reason || 'unknown'}. Scheme: ${context.schemeName}. Keep it to 2-3 sentences.`;
          break;
        case 'eligibility':
          prompt = language === 'hi'
            ? `एक वरिष्ठ नागरिक को सरल भाषा में समझाएं कि उनकी पात्रता स्थिति "${context.status}" क्यों है। 2-3 वाक्यों में बताएं।`
            : `Explain to a senior citizen in simple terms why their eligibility status is "${context.status}". Keep it to 2-3 sentences.`;
          break;
        case 'grievance_status':
          prompt = language === 'hi'
            ? `एक शिकायत की स्थिति "${context.status}" क्या मतलब है? इसका क्या मतलब है और आगे क्या होगा? 2-3 वाक्यों में बताएं।`
            : `What does a grievance status of "${context.status}" mean? What does it mean and what happens next? Keep it to 2-3 sentences.`;
          break;
      }

      const { data, error } = await supabase.functions.invoke('ai-explanation', {
        body: { prompt, language }
      });

      if (error) throw error;
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation(
        language === 'hi' 
          ? 'माफ़ करें, व्याख्या प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
          : 'Sorry, there was an issue getting the explanation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={getExplanation}
        className="text-primary gap-1"
      >
        <MessageCircleQuestion className="w-4 h-4" />
        {language === 'hi' ? 'समझाएं' : 'Explain'}
      </Button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setVisible(false)}
        className="absolute top-1 right-1 p-1 h-auto"
      >
        <X className="w-4 h-4" />
      </Button>
      
      <div className="flex items-start gap-2 pr-6">
        <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {language === 'hi' ? 'समझ रहा हूं...' : 'Thinking...'}
              </span>
            </div>
          ) : (
            <p className="text-sm">{explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}
