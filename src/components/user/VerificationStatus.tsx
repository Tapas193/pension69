import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export function VerificationStatusBanner() {
  const { language } = useLanguage();
  const { profile } = useAuth();

  const status = (profile as any)?.verification_status || 'pending';
  const rejectionReason = (profile as any)?.rejection_reason;

  if (status === 'approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-800">
            {language === 'hi' ? 'खाता सत्यापित' : 'Account Verified'}
          </p>
          <p className="text-sm text-green-700">
            {language === 'hi' 
              ? 'आपका खाता प्रशासक द्वारा सत्यापित किया गया है' 
              : 'Your account has been verified by an administrator'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800">
            {language === 'hi' ? 'सत्यापन अस्वीकृत' : 'Verification Rejected'}
          </p>
          <p className="text-sm text-red-700">
            {language === 'hi' 
              ? 'आपका खाता सत्यापन अस्वीकृत कर दिया गया है।' 
              : 'Your account verification has been rejected.'}
          </p>
          {rejectionReason && (
            <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
              <span className="font-medium">{language === 'hi' ? 'कारण:' : 'Reason:'}</span> {rejectionReason}
            </div>
          )}
          <p className="text-sm text-red-600 mt-2">
            {language === 'hi' 
              ? 'कृपया अपनी प्रोफ़ाइल अपडेट करें और पुनः सत्यापन के लिए आवेदन करें।' 
              : 'Please update your profile and apply for re-verification.'}
          </p>
        </div>
      </div>
    );
  }

  // Pending status
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
      <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-amber-800">
          {language === 'hi' ? 'सत्यापन लंबित' : 'Verification Pending'}
        </p>
        <p className="text-sm text-amber-700">
          {language === 'hi' 
            ? 'आपका खाता प्रशासक द्वारा समीक्षा के अधीन है। कृपया प्रतीक्षा करें।' 
            : 'Your account is under review by an administrator. Please wait.'}
        </p>
      </div>
    </div>
  );
}

export function VerificationStatusBadge() {
  const { language } = useLanguage();
  const { profile } = useAuth();

  const status = (profile as any)?.verification_status || 'pending';

  if (status === 'approved') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
        <CheckCircle className="w-3 h-3" />
        {language === 'hi' ? 'सत्यापित' : 'Verified'}
      </Badge>
    );
  }

  if (status === 'rejected') {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        {language === 'hi' ? 'अस्वीकृत' : 'Rejected'}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1">
      <Clock className="w-3 h-3" />
      {language === 'hi' ? 'लंबित' : 'Pending'}
    </Badge>
  );
}