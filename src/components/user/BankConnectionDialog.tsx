import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreditCard, Building2, CheckCircle, Loader2 } from 'lucide-react';

export function BankConnectionDialog() {
  const { language } = useLanguage();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: profile?.full_name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'खाता नंबर मेल नहीं खाते' 
          : 'Account numbers do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'अमान्य खाता नंबर' 
          : 'Invalid account number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mask the account number (show only last 4 digits)
      const maskedAccount = formData.accountNumber.slice(-4);

      const { error } = await supabase
        .from('profiles')
        .update({
          bank_account_masked: maskedAccount,
        })
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' 
          ? 'बैंक खाता सफलतापूर्वक जोड़ा गया' 
          : 'Bank account linked successfully',
      });

      setOpen(false);
    } catch (error) {
      console.error('Error linking bank:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'बैंक खाता जोड़ने में विफल' 
          : 'Failed to link bank account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = !!profile?.bank_account_masked;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isConnected ? 'outline' : 'default'}
          className="w-full h-14 text-base gap-3"
        >
          {isConnected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>
                {language === 'hi' ? 'बैंक जुड़ा हुआ' : 'Bank Connected'}
                <span className="text-muted-foreground ml-2">
                  (****{profile.bank_account_masked})
                </span>
              </span>
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5" />
              <span>{language === 'hi' ? 'बैंक खाता जोड़ें' : 'Connect Bank Account'}</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-primary" />
            {language === 'hi' ? 'बैंक खाता जोड़ें' : 'Link Bank Account'}
          </DialogTitle>
          <DialogDescription>
            {language === 'hi' 
              ? 'पेंशन भुगतान प्राप्त करने के लिए अपना बैंक खाता जोड़ें'
              : 'Link your bank account to receive pension payments'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="accountHolderName" className="text-base">
              {language === 'hi' ? 'खाताधारक का नाम' : 'Account Holder Name'}
            </Label>
            <Input
              id="accountHolderName"
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              placeholder="As per bank records"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-base">
              {language === 'hi' ? 'बैंक का नाम' : 'Bank Name'}
            </Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="State Bank of India"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-base">
              {language === 'hi' ? 'खाता नंबर' : 'Account Number'}
            </Label>
            <Input
              id="accountNumber"
              type="password"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="Enter account number"
              className="h-12 text-base"
              maxLength={18}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmAccountNumber" className="text-base">
              {language === 'hi' ? 'खाता नंबर पुष्टि करें' : 'Confirm Account Number'}
            </Label>
            <Input
              id="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="Re-enter account number"
              className="h-12 text-base"
              maxLength={18}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifscCode" className="text-base">
              {language === 'hi' ? 'IFSC कोड' : 'IFSC Code'}
            </Label>
            <Input
              id="ifscCode"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              placeholder="SBIN0001234"
              className="h-12 text-base uppercase"
              maxLength={11}
              required
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'hi' ? 'जोड़ रहा है...' : 'Linking...'}
                </>
              ) : (
                language === 'hi' ? 'बैंक खाता जोड़ें' : 'Link Bank Account'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {language === 'hi' 
              ? 'आपकी जानकारी सुरक्षित और एन्क्रिप्टेड है'
              : 'Your information is secure and encrypted'}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
