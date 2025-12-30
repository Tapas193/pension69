import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { signOut, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    pendingVerifications: 0,
    totalPayments: 0,
    activeSchemes: 0,
    pendingGrievances: 0,
    fraudAlerts: 0,
  });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/user');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [profilesRes, paymentsRes, schemesRes, grievancesRes, fraudRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('payments').select('amount').eq('status', 'successful'),
        supabase.from('welfare_schemes').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('grievances').select('id', { count: 'exact' }).eq('status', 'submitted'),
        supabase.from('fraud_alerts').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .or('aadhaar_masked.is.null,bank_account_masked.is.null')
        .order('created_at', { ascending: false });

      setStats({
        totalBeneficiaries: profilesRes.count || 0,
        pendingVerifications: usersData?.length || 0,
        totalPayments: paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        activeSchemes: schemesRes.count || 0,
        pendingGrievances: grievancesRes.count || 0,
        fraudAlerts: fraudRes.count || 0,
      });

      setPendingUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const statCards = [
    { label: language === 'hi' ? 'कुल लाभार्थी' : 'Total Beneficiaries', value: stats.totalBeneficiaries, icon: Users, color: 'text-primary' },
    { label: language === 'hi' ? 'सत्यापन लंबित' : 'Pending Verification', value: stats.pendingVerifications, icon: Clock, color: 'text-warning' },
    { label: language === 'hi' ? 'कुल भुगतान' : 'Total Disbursed', value: `₹${stats.totalPayments.toLocaleString()}`, icon: CreditCard, color: 'text-success' },
    { label: language === 'hi' ? 'सक्रिय योजनाएं' : 'Active Schemes', value: stats.activeSchemes, icon: FileText, color: 'text-secondary' },
    { label: language === 'hi' ? 'लंबित शिकायतें' : 'Pending Grievances', value: stats.pendingGrievances, icon: MessageSquare, color: 'text-warning' },
    { label: language === 'hi' ? 'धोखाधड़ी अलर्ट' : 'Fraud Alerts', value: stats.fraudAlerts, icon: AlertTriangle, color: 'text-destructive' },
  ];

  const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { key: 'verification', icon: UserCheck, label: language === 'hi' ? 'उपयोगकर्ता सत्यापन' : 'User Verification' },
    { key: 'grievances', icon: MessageSquare, label: language === 'hi' ? 'शिकायतें' : 'Grievances' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4">
          <div className="mb-6">
            <h2 className="font-bold text-lg text-primary">
              {language === 'hi' ? 'व्यवस्थापक पैनल' : 'Admin Panel'}
            </h2>
          </div>
          
          <nav className="flex-1 space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.key 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <Button variant="outline" onClick={handleLogout} className="mt-auto gap-2">
            <LogOut className="w-4 h-4" />
            {language === 'hi' ? 'लॉग आउट' : 'Logout'}
          </Button>
        </aside>

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-background/95 z-40 p-4">
            <div className="flex flex-col h-full">
              <h2 className="font-bold text-xl text-primary mb-6">
                {language === 'hi' ? 'व्यवस्थापक पैनल' : 'Admin Panel'}
              </h2>
              
              <nav className="flex-1 space-y-3">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-lg transition-colors ${
                        activeTab === item.key 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <Button variant="outline" onClick={handleLogout} size="lg" className="gap-2">
                <LogOut className="w-5 h-5" />
                {language === 'hi' ? 'लॉग आउट' : 'Logout'}
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {language === 'hi' ? 'व्यवस्थापक डैशबोर्ड' : 'Admin Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'hi' ? 'सभी आंकड़ों का अवलोकन' : 'Overview of all statistics'}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {statCards.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="govt-card">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-muted ${stat.color}`}>
                          <Icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {language === 'hi' ? 'उपयोगकर्ता सत्यापन' : 'User Verification'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'hi' ? 'लंबित सत्यापन अनुरोधों की समीक्षा करें' : 'Review pending verification requests'}
                </p>
              </div>

              {loading ? (
                <div className="govt-card text-center py-8">
                  <p className="text-muted-foreground">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
                </div>
              ) : pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="govt-card">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{user.full_name}</h3>
                          <p className="text-muted-foreground">{user.phone}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${user.aadhaar_masked ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                              Aadhaar: {user.aadhaar_masked ? '✓' : 'Pending'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${user.bank_account_masked ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                              Bank: {user.bank_account_masked ? '✓' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive">
                            <XCircle className="w-4 h-4" />
                            {language === 'hi' ? 'अस्वीकार' : 'Reject'}
                          </Button>
                          <Button size="sm" className="gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {language === 'hi' ? 'स्वीकृत' : 'Approve'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="govt-card text-center py-12">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{language === 'hi' ? 'सभी सत्यापित!' : 'All Verified!'}</h3>
                  <p className="text-muted-foreground">{language === 'hi' ? 'कोई लंबित सत्यापन अनुरोध नहीं' : 'No pending verification requests'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grievances' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{language === 'hi' ? 'शिकायत प्रबंधन' : 'Grievance Management'}</h1>
                <p className="text-muted-foreground">{language === 'hi' ? 'उपयोगकर्ता शिकायतों की समीक्षा और समाधान करें' : 'Review and resolve user grievances'}</p>
              </div>

              <div className="govt-card text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{language === 'hi' ? 'जल्द आ रहा है' : 'Coming Soon'}</h3>
                <p className="text-muted-foreground">{language === 'hi' ? 'शिकायत प्रबंधन सुविधा जल्द उपलब्ध होगी' : 'Grievance management feature will be available soon'}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
