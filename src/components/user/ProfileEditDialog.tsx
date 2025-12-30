import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil, Loader2, X, User, Camera } from 'lucide-react';

export function ProfileEditDialog() {
  const { language } = useLanguage();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    address: profile?.address || '',
    district: profile?.district || '',
    state: profile?.state || 'उत्तराखंड',
    aadhaar: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Aadhaar - exactly 12 digits
    if (formData.aadhaar && formData.aadhaar.length !== 12) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'आधार नंबर 12 अंकों का होना चाहिए' 
          : 'Aadhaar number must be 12 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        address: formData.address || null,
        district: formData.district || null,
        state: formData.state || null,
      };

      // Mask Aadhaar if provided (show only last 4 digits)
      if (formData.aadhaar) {
        updateData.aadhaar_masked = formData.aadhaar.slice(-4);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' 
          ? 'प्रोफ़ाइल अपडेट हो गई' 
          : 'Profile updated successfully',
      });

      setOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' 
          ? 'प्रोफ़ाइल अपडेट करने में विफल' 
          : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          {language === 'hi' ? 'संपादित करें' : 'Edit Profile'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-primary" />
            {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-base">
              {language === 'hi' ? 'पूरा नाम' : 'Full Name'} *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-base">
              {language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">
              {language === 'hi' ? 'लिंग' : 'Gender'}
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder={language === 'hi' ? 'लिंग चुनें' : 'Select gender'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{language === 'hi' ? 'पुरुष' : 'Male'}</SelectItem>
                <SelectItem value="female">{language === 'hi' ? 'महिला' : 'Female'}</SelectItem>
                <SelectItem value="other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaar" className="text-base">
              {language === 'hi' ? 'आधार नंबर' : 'Aadhaar Number'}
            </Label>
            <Input
              id="aadhaar"
              value={formData.aadhaar}
              onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
              placeholder="XXXX XXXX XXXX"
              className="h-12 text-base"
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'hi' ? 'केवल अंतिम 4 अंक सहेजे जाएंगे' : 'Only last 4 digits will be saved'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-base">
              {language === 'hi' ? 'पता' : 'Address'}
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={language === 'hi' ? 'अपना पता दर्ज करें' : 'Enter your address'}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district" className="text-base">
              {language === 'hi' ? 'जिला' : 'District'}
            </Label>
            <Select
              value={formData.district}
              onValueChange={(value) => setFormData({ ...formData, district: value })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder={language === 'hi' ? 'जिला चुनें' : 'Select district'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dehradun">Dehradun (देहरादून)</SelectItem>
                <SelectItem value="Haridwar">Haridwar (हरिद्वार)</SelectItem>
                <SelectItem value="Nainital">Nainital (नैनीताल)</SelectItem>
                <SelectItem value="Almora">Almora (अल्मोड़ा)</SelectItem>
                <SelectItem value="Pithoragarh">Pithoragarh (पिथौरागढ़)</SelectItem>
                <SelectItem value="Chamoli">Chamoli (चमोली)</SelectItem>
                <SelectItem value="Uttarkashi">Uttarkashi (उत्तरकाशी)</SelectItem>
                <SelectItem value="Tehri Garhwal">Tehri Garhwal (टिहरी गढ़वाल)</SelectItem>
                <SelectItem value="Pauri Garhwal">Pauri Garhwal (पौड़ी गढ़वाल)</SelectItem>
                <SelectItem value="Rudraprayag">Rudraprayag (रुद्रप्रयाग)</SelectItem>
                <SelectItem value="Champawat">Champawat (चंपावत)</SelectItem>
                <SelectItem value="Bageshwar">Bageshwar (बागेश्वर)</SelectItem>
                <SelectItem value="Udham Singh Nagar">Udham Singh Nagar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-base">
              {language === 'hi' ? 'राज्य' : 'State'}
            </Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="h-12 text-base"
              disabled
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-12"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...'}
                </>
              ) : (
                language === 'hi' ? 'सहेजें' : 'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
