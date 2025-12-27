import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, CreditCard, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function Index() {
  const { t, language } = useLanguage();
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(isAdmin ? '/admin' : '/user');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const features = [
    { icon: FileText, title: language === 'hi' ? 'योजना प्रबंधन' : 'Scheme Management', desc: language === 'hi' ? 'सभी कल्याण योजनाओं को ट्रैक करें' : 'Track all welfare schemes' },
    { icon: CreditCard, title: language === 'hi' ? 'भुगतान ट्रैकिंग' : 'Payment Tracking', desc: language === 'hi' ? 'रियल-टाइम भुगतान अपडेट' : 'Real-time payment updates' },
    { icon: Users, title: language === 'hi' ? 'लाभार्थी पोर्टल' : 'Beneficiary Portal', desc: language === 'hi' ? 'आसान पहुंच और ट्रैकिंग' : 'Easy access and tracking' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">{t('securePortal')}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              {t('pensionWelfare')}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {language === 'hi' 
                ? 'पेंशन और कल्याण योजनाओं के लिए एकीकृत सरकारी पोर्टल। पारदर्शी, सुरक्षित और उपयोग में आसान।'
                : 'Unified government portal for pension and welfare schemes. Transparent, secure, and easy to use.'}
            </p>

            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="btn-elderly bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {t('login')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="govt-card text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© 2024 {t('govtOfIndia')} • {t('pensionWelfare')}</p>
      </footer>
    </div>
  );
}
