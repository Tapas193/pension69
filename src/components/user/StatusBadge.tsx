import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

type StatusType = 'active' | 'pending' | 'suspended' | 'successful' | 'failed' | 'submitted' | 'under_review' | 'resolved' | 'rejected';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { 
  icon: any; 
  className: string;
  translationKey: string;
}> = {
  active: { icon: CheckCircle, className: 'status-active', translationKey: 'active' },
  successful: { icon: CheckCircle, className: 'status-active', translationKey: 'successful' },
  resolved: { icon: CheckCircle, className: 'status-active', translationKey: 'resolved' },
  pending: { icon: Clock, className: 'status-pending', translationKey: 'pending' },
  submitted: { icon: Clock, className: 'status-pending', translationKey: 'submitted' },
  under_review: { icon: AlertTriangle, className: 'bg-secondary text-secondary-foreground', translationKey: 'underReview' },
  suspended: { icon: XCircle, className: 'status-failed', translationKey: 'suspended' },
  failed: { icon: XCircle, className: 'status-failed', translationKey: 'failed' },
  rejected: { icon: XCircle, className: 'status-failed', translationKey: 'error' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{t(config.translationKey)}</span>
    </span>
  );
}
