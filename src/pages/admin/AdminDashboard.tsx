import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { Users, IndianRupee, Clock, FileText, AlertTriangle, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    totalDisbursed: 0,
    pendingPayments: 0,
    activeSchemes: 0,
    fraudAlerts: 0,
    pendingGrievances: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [profiles, payments, schemes, alerts, grievances] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('amount, status'),
        supabase.from('welfare_schemes').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('fraud_alerts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('grievances').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
      ]);

      const paymentsData = payments.data || [];
      setStats({
        totalBeneficiaries: profiles.count || 0,
        totalDisbursed: paymentsData.filter(p => p.status === 'successful').reduce((sum, p) => sum + Number(p.amount), 0),
        pendingPayments: paymentsData.filter(p => p.status === 'pending').length,
        activeSchemes: schemes.count || 0,
        fraudAlerts: alerts.count || 0,
        pendingGrievances: grievances.count || 0,
      });
    }
    fetchStats();
  }, []);

  const statCards = [
    { key: 'totalBeneficiaries', value: stats.totalBeneficiaries, icon: Users, color: 'text-primary' },
    { key: 'fundsDisbursed', value: `₹${stats.totalDisbursed.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success' },
    { key: 'pendingPayments', value: stats.pendingPayments, icon: Clock, color: 'text-warning' },
    { key: 'activeSchemes', value: stats.activeSchemes, icon: FileText, color: 'text-secondary' },
    { key: 'fraudAlerts', value: stats.fraudAlerts, icon: AlertTriangle, color: 'text-destructive' },
    { key: 'grievances', value: stats.pendingGrievances, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <GovtHeader />
      <div className="flex">
        <aside className="w-64 min-h-screen bg-sidebar p-4">
          <h2 className="text-lg font-bold text-sidebar-foreground mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            {['Dashboard', 'Beneficiaries', 'Payments', 'Schemes', 'Grievances', 'Fraud Alerts'].map(item => (
              <button key={item} className="sidebar-item w-full">{item}</button>
            ))}
          </nav>
          <Button variant="outline" onClick={signOut} className="w-full mt-8 gap-2">
            <LogOut className="w-4 h-4" /> {t('logout')}
          </Button>
        </aside>
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map(stat => (
              <div key={stat.key} className="stat-card">
                <div className="flex items-center justify-between">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{t(stat.key)}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
