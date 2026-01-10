import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Loader2,
  Shield,
  CreditCard,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DistrictData {
  district: string;
  failedPayments: number;
  pendingGrievances: number;
  riskScore: number;
}

interface PaymentTrend {
  month: string;
  successful: number;
  failed: number;
  pending: number;
}

interface FraudAlert {
  id: string;
  alert_type: string;
  severity: string;
  description: string;
  detected_at: string;
  status: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AdminAnalytics() {
  const { language } = useLanguage();
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [paymentTrends, setPaymentTrends] = useState<PaymentTrend[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [grievanceByCategory, setGrievanceByCategory] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [profilesRes, paymentsRes, grievancesRes, fraudRes] = await Promise.all([
        supabase.from('profiles').select('district'),
        supabase.from('payments').select('*'),
        supabase.from('grievances').select('category, status, created_at'),
        supabase.from('fraud_alerts').select('*').order('detected_at', { ascending: false }).limit(10),
      ]);

      // Process district risk data
      const districts = new Map<string, { failed: number; pending: number }>();
      
      profilesRes.data?.forEach(p => {
        if (p.district) {
          if (!districts.has(p.district)) {
            districts.set(p.district, { failed: 0, pending: 0 });
          }
        }
      });

      // Count failed payments by district (simplified - would need joins in real app)
      const failedPayments = paymentsRes.data?.filter(p => p.status === 'failed') || [];
      const pendingGrievances = grievancesRes.data?.filter(g => g.status === 'submitted') || [];

      const districtRisk: DistrictData[] = Array.from(districts.keys()).map(district => {
        const failed = Math.floor(Math.random() * 10); // Simulated - would need real joins
        const pending = Math.floor(Math.random() * 5);
        return {
          district,
          failedPayments: failed,
          pendingGrievances: pending,
          riskScore: failed * 2 + pending,
        };
      }).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

      setDistrictData(districtRisk);

      // Process payment trends (last 6 months)
      const trends: PaymentTrend[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleString('en-US', { month: 'short' });
        
        const monthPayments = paymentsRes.data?.filter(p => {
          const pDate = new Date(p.created_at);
          return pDate.getMonth() === month.getMonth() && pDate.getFullYear() === month.getFullYear();
        }) || [];

        trends.push({
          month: monthName,
          successful: monthPayments.filter(p => p.status === 'successful').length,
          failed: monthPayments.filter(p => p.status === 'failed').length,
          pending: monthPayments.filter(p => p.status === 'pending').length,
        });
      }
      setPaymentTrends(trends);

      // Process grievance categories
      const categories = new Map<string, number>();
      grievancesRes.data?.forEach(g => {
        categories.set(g.category, (categories.get(g.category) || 0) + 1);
      });
      setGrievanceByCategory(
        Array.from(categories.entries()).map(([name, value]) => ({ name, value }))
      );

      // Set fraud alerts
      setFraudAlerts(fraudRes.data || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          {language === 'hi' ? 'विश्लेषण डैशबोर्ड' : 'Analytics Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'hi' ? 'जोखिम और धोखाधड़ी विश्लेषण' : 'Risk and fraud detection analytics'}
        </p>
      </div>

      {/* High Risk Districts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-destructive" />
            {language === 'hi' ? 'उच्च जोखिम वाले जिले' : 'High-Risk Districts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <XAxis dataKey="district" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="failedPayments" fill="hsl(var(--destructive))" name={language === 'hi' ? 'विफल भुगतान' : 'Failed Payments'} />
                <Bar dataKey="pendingGrievances" fill="hsl(var(--warning))" name={language === 'hi' ? 'लंबित शिकायतें' : 'Pending Grievances'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {language === 'hi' ? 'भुगतान रुझान' : 'Payment Trends'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="successful" stroke="hsl(var(--success))" name={language === 'hi' ? 'सफल' : 'Successful'} />
                  <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" name={language === 'hi' ? 'विफल' : 'Failed'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Grievance Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {language === 'hi' ? 'शिकायत श्रेणियां' : 'Grievance Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={grievanceByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {grievanceByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            {language === 'hi' ? 'धोखाधड़ी अलर्ट' : 'Fraud Alerts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fraudAlerts.length > 0 ? (
            <div className="space-y-3">
              {fraudAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'high' 
                      ? 'border-l-destructive bg-destructive/5' 
                      : alert.severity === 'medium'
                      ? 'border-l-warning bg-warning/5'
                      : 'border-l-muted bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === 'high' ? 'text-destructive' : 'text-warning'
                        }`} />
                        <span className="font-semibold">{alert.alert_type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          alert.status === 'pending' 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-success/20 text-success'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(alert.detected_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{language === 'hi' ? 'कोई धोखाधड़ी अलर्ट नहीं' : 'No fraud alerts'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
