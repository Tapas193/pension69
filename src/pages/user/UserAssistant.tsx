import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, MessageCircle } from 'lucide-react';

export default function UserAssistant() {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      <div className="flex flex-1">
        <UserSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center govt-card max-w-md">
            <Bot className="w-20 h-20 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'hi' ? 'AI सहायक' : 'AI Assistant'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === 'hi' 
                ? 'पेंशन और योजनाओं के बारे में प्रश्न पूछें'
                : 'Ask questions about pensions and schemes'}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon'}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
