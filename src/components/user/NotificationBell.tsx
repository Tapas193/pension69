import { useState } from 'react';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { language } = useLanguage();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const [open, setOpen] = useState(false);

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'hi' ? 'अभी' : 'Just now';
    if (diffMins < 60) return language === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'hi' ? `${diffHours} घंटे पहले` : `${diffHours}h ago`;
    return language === 'hi' ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">
            {language === 'hi' ? 'सूचनाएं' : 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3 h-3" />
              {language === 'hi' ? 'सभी पढ़ें' : 'Mark all read'}
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {language === 'hi' ? 'कोई सूचना नहीं' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 hover:bg-muted/50 cursor-pointer transition-colors',
                    !notification.is_read && 'bg-primary/5'
                  )}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {language === 'hi' && notification.title_hindi
                            ? notification.title_hindi
                            : notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {language === 'hi' && notification.message_hindi
                          ? notification.message_hindi
                          : notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
