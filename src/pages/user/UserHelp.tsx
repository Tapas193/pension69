import { useLanguage } from '@/contexts/LanguageContext';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { MobileNav } from '@/components/user/MobileNav';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  HelpCircle,
  FileText,
  MessageSquare,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserHelp() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const helpItems = [
    {
      icon: Bot,
      title: language === 'hi' ? 'AI सहायक से बात करें' : 'Talk to AI Assistant',
      description: language === 'hi' 
        ? 'अपने प्रश्नों के तुरंत उत्तर पाएं' 
        : 'Get instant answers to your questions',
      action: () => navigate('/user/assistant'),
      color: 'text-primary'
    },
    {
      icon: MessageSquare,
      title: language === 'hi' ? 'शिकायत दर्ज करें' : 'File a Grievance',
      description: language === 'hi' 
        ? 'अपनी समस्या की रिपोर्ट करें' 
        : 'Report your issue to authorities',
      action: () => navigate('/user/grievances'),
      color: 'text-secondary'
    },
    {
      icon: FileText,
      title: language === 'hi' ? 'योजनाएं देखें' : 'View Schemes',
      description: language === 'hi' 
        ? 'उपलब्ध पेंशन योजनाओं की जानकारी' 
        : 'Information about available pension schemes',
      action: () => navigate('/user/schemes'),
      color: 'text-success'
    },
  ];

  const faqs = [
    {
      q: language === 'hi' ? 'मैं अपनी पेंशन की स्थिति कैसे जांचूं?' : 'How do I check my pension status?',
      a: language === 'hi' 
        ? 'डैशबोर्ड पर जाएं और "मेरी योजनाएं" अनुभाग देखें।' 
        : 'Go to the Dashboard and check the "My Schemes" section.'
    },
    {
      q: language === 'hi' ? 'बैंक खाता कैसे जोड़ें?' : 'How to add a bank account?',
      a: language === 'hi' 
        ? 'डैशबोर्ड पर "बैंक खाता जोड़ें" बटन पर क्लिक करें।' 
        : 'Click on "Link Bank Account" button on the Dashboard.'
    },
    {
      q: language === 'hi' ? 'भुगतान कब आता है?' : 'When do payments arrive?',
      a: language === 'hi' 
        ? 'भुगतान हर महीने की 1-7 तारीख के बीच होता है।' 
        : 'Payments are processed between 1st-7th of every month.'
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <div className="flex flex-1">
        <div className="hidden md:block">
          <UserSidebar />
        </div>
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl space-y-6 animate-fade-in">
            {/* Header */}
            <div className="govt-card bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <HelpCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {language === 'hi' ? 'सहायता केंद्र' : 'Help Center'}
                  </h1>
                  <p className="text-muted-foreground">
                    {language === 'hi' ? 'हम आपकी मदद के लिए यहां हैं' : 'We are here to help you'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              {helpItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="govt-card hover:shadow-lg transition-shadow text-left"
                  >
                    <Icon className={`w-10 h-10 ${item.color} mb-3`} />
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Contact Information */}
            <div className="govt-card">
              <h2 className="text-xl font-bold mb-4">
                {language === 'hi' ? 'संपर्क जानकारी' : 'Contact Information'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hi' ? 'हेल्पलाइन' : 'Helpline'}
                    </p>
                    <p className="font-semibold">1800-180-1234 (Toll Free)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hi' ? 'ईमेल' : 'Email'}
                    </p>
                    <p className="font-semibold">pension.help@rajasthan.gov.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hi' ? 'समय' : 'Timing'}
                    </p>
                    <p className="font-semibold">Mon-Sat, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hi' ? 'कार्यालय' : 'Office'}
                    </p>
                    <p className="font-semibold">Social Justice Dept, Jaipur</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="govt-card">
              <h2 className="text-xl font-bold mb-4">
                {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
