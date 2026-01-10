import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const CACHE_KEY_PREFIX = 'offline_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  data: any;
  timestamp: number;
}

interface OfflineQueue {
  action: string;
  payload: any;
  timestamp: number;
}

export function useOfflineSupport() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
      toast({
        title: language === 'hi' ? 'ऑनलाइन' : 'Back Online',
        description: language === 'hi' 
          ? 'इंटरनेट कनेक्शन बहाल हो गया' 
          : 'Internet connection restored',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: language === 'hi' ? 'ऑफ़लाइन मोड' : 'Offline Mode',
        description: language === 'hi' 
          ? 'कैश्ड डेटा दिखाया जा रहा है' 
          : 'Showing cached data',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  // Cache data to localStorage
  const cacheData = useCallback((key: string, data: any) => {
    const cacheEntry: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheEntry));
  }, []);

  // Get cached data
  const getCachedData = useCallback(<T>(key: string): T | null => {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    try {
      const parsed: CachedData = JSON.parse(cached);
      // Check if cache is expired
      if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
        return null;
      }
      return parsed.data as T;
    } catch {
      return null;
    }
  }, []);

  // Add to offline queue
  const queueOfflineAction = useCallback((action: string, payload: any) => {
    const queueKey = `${CACHE_KEY_PREFIX}queue`;
    const existing = localStorage.getItem(queueKey);
    const queue: OfflineQueue[] = existing ? JSON.parse(existing) : [];
    
    queue.push({
      action,
      payload,
      timestamp: Date.now(),
    });

    localStorage.setItem(queueKey, JSON.stringify(queue));
    setSyncPending(true);

    toast({
      title: language === 'hi' ? 'सहेजा गया' : 'Saved Offline',
      description: language === 'hi' 
        ? 'ऑनलाइन होने पर सिंक होगा' 
        : 'Will sync when back online',
    });
  }, [language]);

  // Sync offline queue when back online
  const syncOfflineQueue = useCallback(async () => {
    const queueKey = `${CACHE_KEY_PREFIX}queue`;
    const existing = localStorage.getItem(queueKey);
    if (!existing) return;

    const queue: OfflineQueue[] = JSON.parse(existing);
    if (queue.length === 0) return;

    setSyncPending(true);

    for (const item of queue) {
      try {
        switch (item.action) {
          case 'submit_grievance':
            await supabase.from('grievances').insert(item.payload);
            break;
          // Add more action handlers as needed
        }
      } catch (error) {
        console.error('Error syncing offline action:', error);
      }
    }

    localStorage.removeItem(queueKey);
    setSyncPending(false);

    toast({
      title: language === 'hi' ? 'सिंक पूर्ण' : 'Sync Complete',
      description: language === 'hi' 
        ? 'सभी ऑफ़लाइन कार्य सिंक हो गए' 
        : 'All offline actions synced',
    });
  }, [language]);

  // Fetch and cache key data
  const refreshCache = useCallback(async () => {
    if (!profile?.id || !isOnline) return;

    try {
      // Cache profile
      cacheData(`profile_${profile.id}`, profile);

      // Cache payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*, welfare_schemes(name, name_hindi)')
        .eq('beneficiary_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (payments) cacheData(`payments_${profile.id}`, payments);

      // Cache schemes
      const { data: schemes } = await supabase
        .from('beneficiary_schemes')
        .select('*, welfare_schemes(*)')
        .eq('beneficiary_id', profile.id);
      
      if (schemes) cacheData(`schemes_${profile.id}`, schemes);

      // Cache grievances
      const { data: grievances } = await supabase
        .from('grievances')
        .select('*')
        .eq('beneficiary_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (grievances) cacheData(`grievances_${profile.id}`, grievances);

    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  }, [profile?.id, isOnline, cacheData]);

  // Initial cache refresh
  useEffect(() => {
    if (isOnline && profile?.id) {
      refreshCache();
    }
  }, [isOnline, profile?.id, refreshCache]);

  return {
    isOnline,
    syncPending,
    cacheData,
    getCachedData,
    queueOfflineAction,
    refreshCache,
  };
}
