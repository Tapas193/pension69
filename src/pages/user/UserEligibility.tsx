import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GovtHeader } from '@/components/layout/GovtHeader';
import { UserSidebar } from '@/components/user/UserSidebar';
import { MobileNav } from '@/components/user/MobileNav';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface EligibilityResult {
  scheme: string;
  schemeHindi: string;
  eligible: boolean;
  reason: string;
  reasonHindi: string;
  amount: number;
}

export default function UserEligibility() {
  const { t, language } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    isDisabled: '',
    employmentStatus: '',
    gender: '',
  });
  const [results, setResults] = useState<EligibilityResult[]>([]);

  const checkEligibility = () => {
    const age = parseInt(formData.age);
    const income = parseInt(formData.income);
    const isDisabled = formData.isDisabled === 'yes';
    
    const eligibleSchemes: EligibilityResult[] = [];

    // Old Age Pension
    if (age >= 60 && income <= 200000) {
      eligibleSchemes.push({
        scheme: 'Old Age Pension',
        schemeHindi: 'वृद्धावस्था पेंशन',
        eligible: true,
        reason: 'You meet the age (60+) and income criteria',
        reasonHindi: 'आप आयु (60+) और आय मानदंडों को पूरा करते हैं',
        amount: 1500,
      });
    } else if (age >= 60) {
      eligibleSchemes.push({
        scheme: 'Old Age Pension',
        schemeHindi: 'वृद्धावस्था पेंशन',
        eligible: false,
        reason: income > 200000 ? 'Income exceeds ₹2,00,000 limit' : 'Age requirement not met',
        reasonHindi: income > 200000 ? 'आय ₹2,00,000 की सीमा से अधिक है' : 'आयु आवश्यकता पूर्ण नहीं',
        amount: 1500,
      });
    }

    // Disability Pension
    if (isDisabled && income <= 300000) {
      eligibleSchemes.push({
        scheme: 'Disability Pension',
        schemeHindi: 'विकलांगता पेंशन',
        eligible: true,
        reason: 'You qualify for disability benefits',
        reasonHindi: 'आप विकलांगता लाभ के लिए पात्र हैं',
        amount: 2000,
      });
    } else if (isDisabled) {
      eligibleSchemes.push({
        scheme: 'Disability Pension',
        schemeHindi: 'विकलांगता पेंशन',
        eligible: false,
        reason: 'Income exceeds ₹3,00,000 limit',
        reasonHindi: 'आय ₹3,00,000 की सीमा से अधिक है',
        amount: 2000,
      });
    }

    // Widow Pension
    if (formData.gender === 'female' && formData.employmentStatus === 'widow' && income <= 200000) {
      eligibleSchemes.push({
        scheme: 'Widow Pension',
        schemeHindi: 'विधवा पेंशन',
        eligible: true,
        reason: 'You qualify for widow pension benefits',
        reasonHindi: 'आप विधवा पेंशन लाभ के लिए पात्र हैं',
        amount: 1500,
      });
    }

    // IGNOAPS
    if (age >= 60 && income <= 100000) {
      eligibleSchemes.push({
        scheme: 'Indira Gandhi National Old Age Pension',
        schemeHindi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन',
        eligible: true,
        reason: 'You meet BPL criteria for central pension',
        reasonHindi: 'आप केंद्रीय पेंशन के लिए बीपीएल मानदंडों को पूरा करते हैं',
        amount: 2500,
      });
    }

    setResults(eligibleSchemes);
    setStep(6);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'आपकी आयु क्या है?' : 'What is your age?'}
            </h3>
            <Select
              value={formData.age}
              onValueChange={value => setFormData(prev => ({ ...prev, age: value }))}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={language === 'hi' ? 'आयु चुनें' : 'Select age range'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">18-40 {language === 'hi' ? 'वर्ष' : 'years'}</SelectItem>
                <SelectItem value="50">41-59 {language === 'hi' ? 'वर्ष' : 'years'}</SelectItem>
                <SelectItem value="65">60-70 {language === 'hi' ? 'वर्ष' : 'years'}</SelectItem>
                <SelectItem value="75">70+ {language === 'hi' ? 'वर्ष' : 'years'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'आपकी वार्षिक आय क्या है?' : 'What is your annual income?'}
            </h3>
            <Select
              value={formData.income}
              onValueChange={value => setFormData(prev => ({ ...prev, income: value }))}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={language === 'hi' ? 'आय चुनें' : 'Select income range'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50000">{language === 'hi' ? '₹50,000 से कम' : 'Less than ₹50,000'}</SelectItem>
                <SelectItem value="100000">₹50,000 - ₹1,00,000</SelectItem>
                <SelectItem value="200000">₹1,00,000 - ₹2,00,000</SelectItem>
                <SelectItem value="300000">₹2,00,000 - ₹3,00,000</SelectItem>
                <SelectItem value="500000">{language === 'hi' ? '₹3,00,000 से अधिक' : 'More than ₹3,00,000'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'क्या आप विकलांग हैं?' : 'Do you have a disability?'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, isDisabled: 'yes' }));
                  setStep(4);
                }}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  formData.isDisabled === 'yes' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-xl font-semibold">
                  {language === 'hi' ? 'हाँ' : 'Yes'}
                </span>
              </button>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, isDisabled: 'no' }));
                  setStep(4);
                }}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  formData.isDisabled === 'no' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-xl font-semibold">
                  {language === 'hi' ? 'नहीं' : 'No'}
                </span>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'आपका लिंग क्या है?' : 'What is your gender?'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, gender: 'male' }));
                  setStep(5);
                }}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  formData.gender === 'male' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-xl font-semibold">
                  {language === 'hi' ? 'पुरुष' : 'Male'}
                </span>
              </button>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, gender: 'female' }));
                  setStep(5);
                }}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  formData.gender === 'female' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-xl font-semibold">
                  {language === 'hi' ? 'महिला' : 'Female'}
                </span>
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'आपकी रोजगार स्थिति क्या है?' : 'What is your employment status?'}
            </h3>
            <Select
              value={formData.employmentStatus}
              onValueChange={value => {
                setFormData(prev => ({ ...prev, employmentStatus: value }));
                setTimeout(checkEligibility, 300);
              }}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder={language === 'hi' ? 'स्थिति चुनें' : 'Select status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">{language === 'hi' ? 'नियोजित' : 'Employed'}</SelectItem>
                <SelectItem value="unemployed">{language === 'hi' ? 'बेरोजगार' : 'Unemployed'}</SelectItem>
                <SelectItem value="retired">{language === 'hi' ? 'सेवानिवृत्त' : 'Retired'}</SelectItem>
                <SelectItem value="widow">{language === 'hi' ? 'विधवा' : 'Widow/Widower'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">
              {language === 'hi' ? 'पात्रता परिणाम' : 'Eligibility Results'}
            </h3>
            
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      result.eligible 
                        ? 'border-success bg-success/10' 
                        : 'border-border bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.eligible ? (
                        <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">
                          {language === 'hi' ? result.schemeHindi : result.scheme}
                        </h4>
                        <p className="text-muted-foreground mt-1">
                          {language === 'hi' ? result.reasonHindi : result.reason}
                        </p>
                        {result.eligible && (
                          <p className="text-success font-semibold mt-2">
                            {language === 'hi' ? 'मासिक राशि' : 'Monthly Amount'}: ₹{result.amount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'वर्तमान जानकारी के आधार पर कोई योजना उपलब्ध नहीं है'
                    : 'No schemes available based on your current information'}
                </p>
              </div>
            )}

            <Button
              onClick={() => {
                setStep(1);
                setFormData({ age: '', income: '', isDisabled: '', employmentStatus: '', gender: '' });
                setResults([]);
              }}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              {language === 'hi' ? 'फिर से जांचें' : 'Check Again'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GovtHeader />
      
      <div className="flex flex-1">
        <div className="hidden md:block">
          <UserSidebar />
        </div>
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('checkEligibility')}</h1>
                <p className="text-muted-foreground">
                  {language === 'hi' 
                    ? 'कुछ सरल प्रश्नों का उत्तर दें'
                    : 'Answer a few simple questions'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {step < 6 && (
              <div className="govt-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {language === 'hi' ? `प्रश्न ${step}/5` : `Question ${step}/5`}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(step / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Question Card */}
            <div className="govt-card">
              {renderStep()}
              
              {step < 6 && step > 1 && step !== 3 && step !== 4 && (
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    {t('back')}
                  </Button>
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && !formData.age) ||
                      (step === 2 && !formData.income) ||
                      (step === 5 && !formData.employmentStatus)
                    }
                    className="gap-2"
                  >
                    {t('next')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
