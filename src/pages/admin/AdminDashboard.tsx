import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GrievanceManagement } from '@/components/admin/GrievanceManagement';
import { SchemeManagement } from '@/components/admin/SchemeManagement';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { 
  Users, 
  CreditCard, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Menu,
  X,
  Eye,
  Loader2,
  FileText,
  Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { signOut, isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    pendingVerifications: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    totalPayments: 0,
    activeSchemes: 0,
    pendingGrievances: 0,
    fraudAlerts: 0,
  });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Rejection dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // User details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);

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
        supabase.from('profiles').select('*'),
        supabase.from('payments').select('amount').eq('status', 'successful'),
        supabase.from('welfare_schemes').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('grievances').select('id', { count: 'exact' }).eq('status', 'submitted'),
        supabase.from('fraud_alerts').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const profiles = profilesRes.data || [];
      const pending = profiles.filter(p => p.verification_status === 'pending' || !p.verification_status);
      const approved = profiles.filter(p => p.verification_status === 'approved');
      const rejected = profiles.filter(p => p.verification_status === 'rejected');

      setStats({
        totalBeneficiaries: profiles.length,
        pendingVerifications: pending.length,
        approvedUsers: approved.length,
        rejectedUsers: rejected.length,
        totalPayments: paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        activeSchemes: schemesRes.count || 0,
        pendingGrievances: grievancesRes.count || 0,
        fraudAlerts: fraudRes.count || 0,
      });

      setAllUsers(profiles);
      setPendingUsers(pending);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (userId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          rejection_reason: null,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' ? 'उपयोगकर्ता स्वीकृत' : 'User approved successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'स्वीकृत करने में विफल' : 'Failed to approve user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया अस्वीकृति का कारण दें' : 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' ? 'उपयोगकर्ता अस्वीकृत' : 'User rejected',
      });

      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'अस्वीकृत करने में विफल' : 'Failed to reject user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (userProfile: any) => {
    setSelectedUser(userProfile);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const openDetailsDialog = (userProfile: any) => {
    setViewingUser(userProfile);
    setDetailsDialogOpen(true);
  };

  const getFilteredUsers = () => {
    switch (userFilter) {
      case 'pending':
        return allUsers.filter(u => u.verification_status === 'pending' || !u.verification_status);
      case 'approved':
        return allUsers.filter(u => u.verification_status === 'approved');
      case 'rejected':
        return allUsers.filter(u => u.verification_status === 'rejected');
      default:
        return allUsers;
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const statCards = [
    { label: language === 'hi' ? 'कुल लाभार्थी' : 'Total Beneficiaries', value: stats.totalBeneficiaries, icon: Users, color: 'text-primary' },
    { label: language === 'hi' ? 'सत्यापन लंबित' : 'Pending Verification', value: stats.pendingVerifications, icon: Clock, color: 'text-amber-600' },
    { label: language === 'hi' ? 'स्वीकृत उपयोगकर्ता' : 'Approved Users', value: stats.approvedUsers, icon: CheckCircle, color: 'text-green-600' },
    { label: language === 'hi' ? 'अस्वीकृत उपयोगकर्ता' : 'Rejected Users', value: stats.rejectedUsers, icon: XCircle, color: 'text-red-600' },
    { label: language === 'hi' ? 'कुल भुगतान' : 'Total Disbursed', value: `₹${stats.totalPayments.toLocaleString()}`, icon: CreditCard, color: 'text-green-600' },
    { label: language === 'hi' ? 'लंबित शिकायतें' : 'Pending Grievances', value: stats.pendingGrievances, icon: MessageSquare, color: 'text-amber-600' },
  ];

  const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { key: 'verification', icon: UserCheck, label: language === 'hi' ? 'उपयोगकर्ता सत्यापन' : 'User Verification' },
    { key: 'grievances', icon: MessageSquare, label: language === 'hi' ? 'शिकायतें' : 'Grievances' },
    { key: 'schemes', icon: FileText, label: language === 'hi' ? 'योजना प्रबंधन' : 'Scheme Management' },
    { key: 'notifications', icon: Bell, label: language === 'hi' ? 'सूचनाएं' : 'Notifications' },
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
                  {language === 'hi' ? 'उपयोगकर्ता अनुरोधों की समीक्षा और प्रबंधन करें' : 'Review and manage user requests'}
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(filter => (
                  <Button
                    key={filter}
                    variant={userFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUserFilter(filter)}
                    className="gap-1"
                  >
                    {filter === 'pending' && <Clock className="w-4 h-4" />}
                    {filter === 'approved' && <CheckCircle className="w-4 h-4" />}
                    {filter === 'rejected' && <XCircle className="w-4 h-4" />}
                    {filter === 'all' && <Users className="w-4 h-4" />}
                    {filter === 'pending' && (language === 'hi' ? 'लंबित' : 'Pending')}
                    {filter === 'approved' && (language === 'hi' ? 'स्वीकृत' : 'Approved')}
                    {filter === 'rejected' && (language === 'hi' ? 'अस्वीकृत' : 'Rejected')}
                    {filter === 'all' && (language === 'hi' ? 'सभी' : 'All')}
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-muted">
                      {filter === 'pending' ? stats.pendingVerifications :
                       filter === 'approved' ? stats.approvedUsers :
                       filter === 'rejected' ? stats.rejectedUsers : stats.totalBeneficiaries}
                    </span>
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="govt-card text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-2">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
                </div>
              ) : getFilteredUsers().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredUsers().map(userProfile => (
                    <div key={userProfile.id} className="govt-card">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg">{userProfile.full_name}</h3>
                            {userProfile.verification_status === 'approved' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                {language === 'hi' ? 'सत्यापित' : 'Verified'}
                              </span>
                            )}
                            {userProfile.verification_status === 'rejected' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                                {language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
                              </span>
                            )}
                            {(!userProfile.verification_status || userProfile.verification_status === 'pending') && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                {language === 'hi' ? 'लंबित' : 'Pending'}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground">{userProfile.phone}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${userProfile.aadhaar_masked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              Aadhaar: {userProfile.aadhaar_masked ? `****${userProfile.aadhaar_masked}` : 'Not provided'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${userProfile.bank_account_masked ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              Bank: {userProfile.bank_account_masked ? `****${userProfile.bank_account_masked}` : 'Not linked'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${userProfile.email_verified ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                              Email: {userProfile.email_verified ? '✓' : '✗'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${userProfile.phone_verified ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                              Phone: {userProfile.phone_verified ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openDetailsDialog(userProfile)}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            {language === 'hi' ? 'विवरण' : 'Details'}
                          </Button>
                          {userProfile.verification_status !== 'rejected' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => openRejectDialog(userProfile)}
                              className="gap-1 text-red-600 border-red-300 hover:bg-red-50"
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                              {language === 'hi' ? 'अस्वीकार' : 'Reject'}
                            </Button>
                          )}
                          {userProfile.verification_status !== 'approved' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(userProfile.id)}
                              className="gap-1"
                              disabled={actionLoading}
                            >
                              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              {language === 'hi' ? 'स्वीकृत' : 'Approve'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="govt-card text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {userFilter === 'pending' 
                      ? (language === 'hi' ? 'कोई लंबित अनुरोध नहीं' : 'No Pending Requests')
                      : (language === 'hi' ? 'कोई उपयोगकर्ता नहीं' : 'No Users Found')}
                  </h3>
                  <p className="text-muted-foreground">
                    {userFilter === 'pending'
                      ? (language === 'hi' ? 'सभी सत्यापन अनुरोधों की समीक्षा हो गई है' : 'All verification requests have been reviewed')
                      : (language === 'hi' ? 'इस श्रेणी में कोई उपयोगकर्ता नहीं मिला' : 'No users found in this category')}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grievances' && <GrievanceManagement />}

          {activeTab === 'schemes' && <SchemeManagement />}

          {activeTab === 'notifications' && <AdminNotifications />}
        </main>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <XCircle className="w-6 h-6" />
              {language === 'hi' ? 'उपयोगकर्ता अस्वीकृत करें' : 'Reject User'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' 
                ? `क्या आप ${selectedUser?.full_name} को अस्वीकृत करना चाहते हैं?` 
                : `Are you sure you want to reject ${selectedUser?.full_name}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'hi' ? 'अस्वीकृति का कारण *' : 'Rejection Reason *'}
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'hi' ? 'कृपया अस्वीकृति का कारण दें...' : 'Please provide a reason for rejection...'}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="flex-1"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'hi' ? 'अस्वीकृत कर रहा है...' : 'Rejecting...'}
                  </>
                ) : (
                  language === 'hi' ? 'अस्वीकृत करें' : 'Reject'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-primary" />
              {language === 'hi' ? 'उपयोगकर्ता विवरण' : 'User Details'}
            </DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'नाम' : 'Name'}</p>
                  <p className="font-semibold">{viewingUser.full_name}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'फ़ोन' : 'Phone'}</p>
                  <p className="font-semibold">{viewingUser.phone || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'लिंग' : 'Gender'}</p>
                  <p className="font-semibold">{viewingUser.gender || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}</p>
                  <p className="font-semibold">{viewingUser.date_of_birth || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'आधार' : 'Aadhaar'}</p>
                  <p className="font-semibold">{viewingUser.aadhaar_masked ? `XXXX-XXXX-${viewingUser.aadhaar_masked}` : 'Not provided'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'बैंक खाता' : 'Bank Account'}</p>
                  <p className="font-semibold">{viewingUser.bank_account_masked ? `XXXXXXX${viewingUser.bank_account_masked}` : 'Not linked'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg col-span-2">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'पता' : 'Address'}</p>
                  <p className="font-semibold">{viewingUser.address || 'N/A'}, {viewingUser.district || ''}, {viewingUser.state || ''}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'ईमेल सत्यापित' : 'Email Verified'}</p>
                  <p className={`font-semibold ${viewingUser.email_verified ? 'text-green-600' : 'text-amber-600'}`}>
                    {viewingUser.email_verified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'मोबाइल सत्यापित' : 'Phone Verified'}</p>
                  <p className={`font-semibold ${viewingUser.phone_verified ? 'text-green-600' : 'text-amber-600'}`}>
                    {viewingUser.phone_verified ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg col-span-2">
                  <p className="text-xs text-muted-foreground">{language === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status'}</p>
                  <p className={`font-semibold ${
                    viewingUser.verification_status === 'approved' ? 'text-green-600' :
                    viewingUser.verification_status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {viewingUser.verification_status === 'approved' ? 'Approved' :
                     viewingUser.verification_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </p>
                </div>
                {viewingUser.rejection_reason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg col-span-2">
                    <p className="text-xs text-red-600">{language === 'hi' ? 'अस्वीकृति का कारण' : 'Rejection Reason'}</p>
                    <p className="font-semibold text-red-700">{viewingUser.rejection_reason}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                {viewingUser.verification_status !== 'rejected' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      openRejectDialog(viewingUser);
                    }}
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'अस्वीकृत करें' : 'Reject'}
                  </Button>
                )}
                {viewingUser.verification_status !== 'approved' && (
                  <Button 
                    onClick={() => {
                      handleApprove(viewingUser.id);
                      setDetailsDialogOpen(false);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'स्वीकृत करें' : 'Approve'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
