import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Bell,
  Plus,
  Send,
  Loader2,
  Users,
  User,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  title_hindi: string | null;
  message: string;
  message_hindi: string | null;
  type: string | null;
  is_read: boolean | null;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
}

export function AdminNotifications() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    title_hindi: '',
    message: '',
    message_hindi: '',
    type: 'info',
    sendToAll: true,
    selectedUserId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [notifRes, profilesRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('profiles')
          .select('id, user_id, full_name')
          .order('full_name'),
      ]);

      if (notifRes.error) throw notifRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setNotifications(notifRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'शीर्षक और संदेश आवश्यक हैं' : 'Title and message are required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.sendToAll && !formData.selectedUserId) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'कृपया उपयोगकर्ता चुनें' : 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const notificationsToInsert = formData.sendToAll
        ? profiles.map(p => ({
            user_id: p.user_id,
            title: formData.title,
            title_hindi: formData.title_hindi || null,
            message: formData.message,
            message_hindi: formData.message_hindi || null,
            type: formData.type,
          }))
        : [{
            user_id: formData.selectedUserId,
            title: formData.title,
            title_hindi: formData.title_hindi || null,
            message: formData.message,
            message_hindi: formData.message_hindi || null,
            type: formData.type,
          }];

      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (error) throw error;

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: formData.sendToAll
          ? (language === 'hi' ? 'सभी को सूचना भेजी गई' : `Notification sent to all ${profiles.length} users`)
          : (language === 'hi' ? 'सूचना भेजी गई' : 'Notification sent successfully'),
      });

      setDialogOpen(false);
      setFormData({
        title: '',
        title_hindi: '',
        message: '',
        message_hindi: '',
        type: 'info',
        sendToAll: true,
        selectedUserId: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'सूचना भेजने में विफल' : 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'info', label: language === 'hi' ? 'सूचना' : 'Info', color: 'bg-blue-100 text-blue-700' },
    { value: 'success', label: language === 'hi' ? 'सफलता' : 'Success', color: 'bg-green-100 text-green-700' },
    { value: 'warning', label: language === 'hi' ? 'चेतावनी' : 'Warning', color: 'bg-amber-100 text-amber-700' },
    { value: 'payment', label: language === 'hi' ? 'भुगतान' : 'Payment', color: 'bg-purple-100 text-purple-700' },
  ];

  const getTypeColor = (type: string | null) => {
    return notificationTypes.find(t => t.value === type)?.color || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {language === 'hi' ? 'सूचनाएं प्रबंधन' : 'Notifications Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hi' ? 'उपयोगकर्ताओं को सूचनाएं भेजें' : 'Send notifications to users'}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'hi' ? 'नई सूचना भेजें' : 'Send Notification'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="govt-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'hi' ? 'कुल' : 'Total'}</p>
              <p className="text-xl font-bold">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="govt-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'hi' ? 'पढ़ी गई' : 'Read'}</p>
              <p className="text-xl font-bold">{notifications.filter(n => n.is_read).length}</p>
            </div>
          </div>
        </div>
        <div className="govt-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'hi' ? 'अपठित' : 'Unread'}</p>
              <p className="text-xl font-bold">{notifications.filter(n => !n.is_read).length}</p>
            </div>
          </div>
        </div>
        <div className="govt-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'hi' ? 'उपयोगकर्ता' : 'Users'}</p>
              <p className="text-xl font-bold">{profiles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      {loading ? (
        <div className="govt-card text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">
            {language === 'hi' ? 'हाल की सूचनाएं' : 'Recent Notifications'}
          </h2>
          <div className="space-y-2">
            {notifications.slice(0, 20).map(notif => (
              <div key={notif.id} className="govt-card py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {language === 'hi' && notif.title_hindi ? notif.title_hindi : notif.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(notif.type)}`}>
                        {notificationTypes.find(t => t.value === notif.type)?.label || notif.type}
                      </span>
                      {notif.is_read && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'hi' && notif.message_hindi ? notif.message_hindi : notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="govt-card text-center py-12">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {language === 'hi' ? 'कोई सूचना नहीं' : 'No Notifications'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'hi' ? 'अभी तक कोई सूचना नहीं भेजी गई' : 'No notifications have been sent yet'}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'hi' ? 'पहली सूचना भेजें' : 'Send First Notification'}
          </Button>
        </div>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Send className="w-6 h-6 text-primary" />
              {language === 'hi' ? 'सूचना भेजें' : 'Send Notification'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'उपयोगकर्ताओं को सूचना भेजें' : 'Send notification to users'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Target Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.sendToAll ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, sendToAll: true, selectedUserId: '' })}
                className="gap-1"
              >
                <Users className="w-4 h-4" />
                {language === 'hi' ? 'सभी को' : 'All Users'}
              </Button>
              <Button
                type="button"
                variant={!formData.sendToAll ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, sendToAll: false })}
                className="gap-1"
              >
                <User className="w-4 h-4" />
                {language === 'hi' ? 'विशिष्ट उपयोगकर्ता' : 'Specific User'}
              </Button>
            </div>

            {!formData.sendToAll && (
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'उपयोगकर्ता चुनें' : 'Select User'}</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={formData.selectedUserId}
                  onChange={(e) => setFormData({ ...formData, selectedUserId: e.target.value })}
                >
                  <option value="">{language === 'hi' ? 'उपयोगकर्ता चुनें...' : 'Select user...'}</option>
                  {profiles.map(p => (
                    <option key={p.user_id} value={p.user_id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Type Selection */}
            <div className="space-y-2">
              <Label>{language === 'hi' ? 'प्रकार' : 'Type'}</Label>
              <div className="flex flex-wrap gap-2">
                {notificationTypes.map(type => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.type === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'शीर्षक (English) *' : 'Title (English) *'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</Label>
                <Input
                  value={formData.title_hindi}
                  onChange={(e) => setFormData({ ...formData, title_hindi: e.target.value })}
                  placeholder="सूचना शीर्षक"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'संदेश (English) *' : 'Message (English) *'}</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Notification message..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'संदेश (हिंदी)' : 'Message (Hindi)'}</Label>
              <Textarea
                value={formData.message_hindi}
                onChange={(e) => setFormData({ ...formData, message_hindi: e.target.value })}
                placeholder="सूचना संदेश..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={actionLoading}
                className="flex-1 gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {language === 'hi' ? 'भेजें' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
