import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  User, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  HelpCircle,
  LogOut,
  Bot,
  CheckSquare
} from 'lucide-react';

const menuItems = [
  { key: 'profile', icon: User, path: '/user' },
  { key: 'schemes', icon: FileText, path: '/user/schemes' },
  { key: 'payments', icon: CreditCard, path: '/user/payments' },
  { key: 'checkEligibility', icon: CheckSquare, path: '/user/eligibility' },
  { key: 'grievances', icon: MessageSquare, path: '/user/grievances' },
  { key: 'talkToBot', icon: Bot, path: '/user/assistant' },
  { key: 'help', icon: HelpCircle, path: '/user/help' },
];

export function UserSidebar() {
  const { t } = useLanguage();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-72 bg-card border-r-2 border-border min-h-screen p-4 flex flex-col">
      {/* User Info */}
      <div className="p-4 bg-muted rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{profile?.phone}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{t(item.key)}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <Button
        variant="outline"
        size="lg"
        onClick={signOut}
        className="w-full mt-4 gap-2 border-2"
      >
        <LogOut className="w-5 h-5" />
        {t('logout')}
      </Button>
    </aside>
  );
}
