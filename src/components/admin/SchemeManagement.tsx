import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Loader2,
  IndianRupee,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface WelfareScheme {
  id: string;
  name: string;
  name_hindi: string | null;
  description: string | null;
  description_hindi: string | null;
  monthly_amount: number;
  min_age: number | null;
  max_age: number | null;
  max_income: number | null;
  requires_disability: boolean | null;
  is_active: boolean | null;
  created_at: string;
}

const defaultScheme: Partial<WelfareScheme> = {
  name: '',
  name_hindi: '',
  description: '',
  description_hindi: '',
  monthly_amount: 0,
  min_age: null,
  max_age: null,
  max_income: null,
  requires_disability: false,
  is_active: true,
};

export function SchemeManagement() {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [schemes, setSchemes] = useState<WelfareScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActive, setShowActive] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Partial<WelfareScheme> | null>(null);
  const [formData, setFormData] = useState<Partial<WelfareScheme>>(defaultScheme);
  const [actionLoading, setActionLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<WelfareScheme | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  async function fetchSchemes() {
    try {
      const { data, error } = await supabase
        .from('welfare_schemes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  }

  const openAddDialog = () => {
    setEditingScheme(null);
    setFormData(defaultScheme);
    setDialogOpen(true);
  };

  const openEditDialog = (scheme: WelfareScheme) => {
    setEditingScheme(scheme);
    setFormData({
      name: scheme.name,
      name_hindi: scheme.name_hindi || '',
      description: scheme.description || '',
      description_hindi: scheme.description_hindi || '',
      monthly_amount: scheme.monthly_amount,
      min_age: scheme.min_age,
      max_age: scheme.max_age,
      max_income: scheme.max_income,
      requires_disability: scheme.requires_disability || false,
      is_active: scheme.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.monthly_amount) {
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'नाम और राशि आवश्यक हैं' : 'Name and amount are required',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const schemeData = {
        name: formData.name,
        name_hindi: formData.name_hindi || null,
        description: formData.description || null,
        description_hindi: formData.description_hindi || null,
        monthly_amount: Number(formData.monthly_amount),
        min_age: formData.min_age ? Number(formData.min_age) : null,
        max_age: formData.max_age ? Number(formData.max_age) : null,
        max_income: formData.max_income ? Number(formData.max_income) : null,
        requires_disability: formData.requires_disability || false,
        is_active: formData.is_active ?? true,
      };

      if (editingScheme?.id) {
        const { error } = await supabase
          .from('welfare_schemes')
          .update(schemeData)
          .eq('id', editingScheme.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('welfare_schemes')
          .insert([schemeData]);
        if (error) throw error;
      }

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: editingScheme?.id
          ? (language === 'hi' ? 'योजना अपडेट की गई' : 'Scheme updated successfully')
          : (language === 'hi' ? 'योजना जोड़ी गई' : 'Scheme added successfully'),
      });

      setDialogOpen(false);
      fetchSchemes();
    } catch (error) {
      console.error('Error saving scheme:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'योजना सहेजने में विफल' : 'Failed to save scheme',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!schemeToDelete) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('welfare_schemes')
        .delete()
        .eq('id', schemeToDelete.id);

      if (error) throw error;

      toast({
        title: language === 'hi' ? 'सफल' : 'Success',
        description: language === 'hi' ? 'योजना हटाई गई' : 'Scheme deleted successfully',
      });

      setDeleteDialogOpen(false);
      setSchemeToDelete(null);
      fetchSchemes();
    } catch (error) {
      console.error('Error deleting scheme:', error);
      toast({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'hi' ? 'योजना हटाने में विफल' : 'Failed to delete scheme',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSchemes = showActive 
    ? schemes.filter(s => s.is_active) 
    : schemes;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {language === 'hi' ? 'योजना प्रबंधन' : 'Scheme Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hi' ? 'कल्याणकारी योजनाओं को जोड़ें और प्रबंधित करें' : 'Add and manage welfare schemes'}
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'hi' ? 'नई योजना जोड़ें' : 'Add New Scheme'}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Switch
          id="active-filter"
          checked={showActive}
          onCheckedChange={setShowActive}
        />
        <Label htmlFor="active-filter">
          {language === 'hi' ? 'केवल सक्रिय योजनाएं दिखाएं' : 'Show active schemes only'}
        </Label>
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted">
          {filteredSchemes.length}
        </span>
      </div>

      {loading ? (
        <div className="govt-card text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      ) : filteredSchemes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSchemes.map(scheme => (
            <div key={scheme.id} className="govt-card">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-lg">
                      {language === 'hi' && scheme.name_hindi ? scheme.name_hindi : scheme.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      scheme.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {scheme.is_active 
                        ? (language === 'hi' ? 'सक्रिय' : 'Active')
                        : (language === 'hi' ? 'निष्क्रिय' : 'Inactive')
                      }
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(scheme)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSchemeToDelete(scheme);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {language === 'hi' && scheme.description_hindi 
                    ? scheme.description_hindi 
                    : scheme.description || (language === 'hi' ? 'कोई विवरण नहीं' : 'No description')
                  }
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    ₹{scheme.monthly_amount.toLocaleString()}/month
                  </span>
                  {(scheme.min_age || scheme.max_age) && (
                    <span className="px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {scheme.min_age || 0} - {scheme.max_age || '∞'} {language === 'hi' ? 'वर्ष' : 'yrs'}
                    </span>
                  )}
                  {scheme.max_income && (
                    <span className="px-2 py-1 bg-muted rounded-full">
                      Max Income: ₹{scheme.max_income.toLocaleString()}
                    </span>
                  )}
                  {scheme.requires_disability && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                      {language === 'hi' ? 'विकलांगता आवश्यक' : 'Disability Required'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="govt-card text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {language === 'hi' ? 'कोई योजना नहीं' : 'No Schemes'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'hi' ? 'अभी तक कोई योजना नहीं जोड़ी गई है' : 'No schemes have been added yet'}
          </p>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'hi' ? 'पहली योजना जोड़ें' : 'Add First Scheme'}
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-primary" />
              {editingScheme?.id 
                ? (language === 'hi' ? 'योजना संपादित करें' : 'Edit Scheme')
                : (language === 'hi' ? 'नई योजना जोड़ें' : 'Add New Scheme')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' ? 'योजना विवरण दर्ज करें' : 'Enter scheme details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'नाम (English) *' : 'Name (English) *'}</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Scheme Name"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'नाम (हिंदी)' : 'Name (Hindi)'}</Label>
                <Input
                  value={formData.name_hindi || ''}
                  onChange={(e) => setFormData({ ...formData, name_hindi: e.target.value })}
                  placeholder="योजना का नाम"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'विवरण (English)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Scheme description..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'hi' ? 'विवरण (हिंदी)' : 'Description (Hindi)'}</Label>
              <Textarea
                value={formData.description_hindi || ''}
                onChange={(e) => setFormData({ ...formData, description_hindi: e.target.value })}
                placeholder="योजना का विवरण..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'मासिक राशि (₹) *' : 'Monthly Amount (₹) *'}</Label>
                <Input
                  type="number"
                  value={formData.monthly_amount || ''}
                  onChange={(e) => setFormData({ ...formData, monthly_amount: Number(e.target.value) })}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'अधिकतम आय (₹)' : 'Max Income (₹)'}</Label>
                <Input
                  type="number"
                  value={formData.max_income || ''}
                  onChange={(e) => setFormData({ ...formData, max_income: e.target.value ? Number(e.target.value) : null })}
                  placeholder="100000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'न्यूनतम आयु' : 'Minimum Age'}</Label>
                <Input
                  type="number"
                  value={formData.min_age || ''}
                  onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? Number(e.target.value) : null })}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'hi' ? 'अधिकतम आयु' : 'Maximum Age'}</Label>
                <Input
                  type="number"
                  value={formData.max_age || ''}
                  onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? Number(e.target.value) : null })}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="requires_disability"
                  checked={formData.requires_disability || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_disability: checked })}
                />
                <Label htmlFor="requires_disability">
                  {language === 'hi' ? 'विकलांगता आवश्यक' : 'Requires Disability'}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">
                  {language === 'hi' ? 'सक्रिय' : 'Active'}
                </Label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={actionLoading || !formData.name?.trim() || !formData.monthly_amount}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'hi' ? 'सहेज रहा है...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {language === 'hi' ? 'सहेजें' : 'Save'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
              <Trash2 className="w-6 h-6" />
              {language === 'hi' ? 'योजना हटाएं' : 'Delete Scheme'}
            </DialogTitle>
            <DialogDescription>
              {language === 'hi' 
                ? `क्या आप "${schemeToDelete?.name}" योजना को हटाना चाहते हैं?`
                : `Are you sure you want to delete "${schemeToDelete?.name}"?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex-1"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'hi' ? 'हटा रहा है...' : 'Deleting...'}
                </>
              ) : (
                language === 'hi' ? 'हटाएं' : 'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
