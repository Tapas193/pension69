import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  FileText, 
  CreditCard, 
  MessageSquare,
  Bot
} from 'lucide-react';

const navItems = [
  { key: 'profile', icon: User, path: '/user' },
  { key: 'schemes', icon: FileText, path: '/user/schemes' },
  { key: 'payments', icon: CreditCard, path: '/user/payments' },
  { key: 'grievances', icon: MessageSquare, path: '/user/grievances' },
  { key: 'talkToBot', icon: Bot, path: '/user/assistant' },
];

export function MobileNav() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{t(item.key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
