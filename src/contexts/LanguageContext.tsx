import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // Common
  welcome: { en: 'Welcome', hi: 'स्वागत है' },
  login: { en: 'Login', hi: 'लॉगिन' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  home: { en: 'Home', hi: 'होम' },
  profile: { en: 'Profile', hi: 'प्रोफ़ाइल' },
  schemes: { en: 'My Schemes', hi: 'मेरी योजनाएं' },
  payments: { en: 'Payments', hi: 'भुगतान' },
  grievances: { en: 'Grievances', hi: 'शिकायतें' },
  help: { en: 'Help', hi: 'सहायता' },
  submit: { en: 'Submit', hi: 'जमा करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  back: { en: 'Back', hi: 'वापस' },
  next: { en: 'Next', hi: 'आगे' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  error: { en: 'Error', hi: 'त्रुटि' },
  success: { en: 'Success', hi: 'सफलता' },
  
  // Auth
  enterMobile: { en: 'Enter Mobile Number', hi: 'मोबाइल नंबर दर्ज करें' },
  enterOtp: { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  sendOtp: { en: 'Send OTP', hi: 'OTP भेजें' },
  verifyOtp: { en: 'Verify OTP', hi: 'OTP सत्यापित करें' },
  resendOtp: { en: 'Resend OTP', hi: 'OTP पुनः भेजें' },
  mobileHint: { en: 'Enter your 10-digit mobile number', hi: 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें' },
  otpSent: { en: 'OTP sent to your mobile', hi: 'OTP आपके मोबाइल पर भेजा गया' },
  invalidOtp: { en: 'Invalid OTP. Please try again.', hi: 'अमान्य OTP। कृपया पुनः प्रयास करें।' },
  
  // User Panel
  myProfile: { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल' },
  mySchemes: { en: 'My Welfare Schemes', hi: 'मेरी कल्याण योजनाएं' },
  paymentHistory: { en: 'Payment History', hi: 'भुगतान इतिहास' },
  raiseGrievance: { en: 'Raise Grievance', hi: 'शिकायत दर्ज करें' },
  checkEligibility: { en: 'Check Eligibility', hi: 'पात्रता जांचें' },
  talkToBot: { en: 'Talk to Assistant', hi: 'सहायक से बात करें' },
  browseSchemes: { en: 'Browse Schemes', hi: 'योजनाएं देखें' },
  
  // Status
  active: { en: 'Active', hi: 'सक्रिय' },
  pending: { en: 'Pending', hi: 'लंबित' },
  suspended: { en: 'Suspended', hi: 'निलंबित' },
  successful: { en: 'Successful', hi: 'सफल' },
  failed: { en: 'Failed', hi: 'विफल' },
  submitted: { en: 'Submitted', hi: 'जमा किया' },
  underReview: { en: 'Under Review', hi: 'समीक्षाधीन' },
  resolved: { en: 'Resolved', hi: 'हल किया गया' },
  
  // Amounts
  monthlyPension: { en: 'Monthly Pension', hi: 'मासिक पेंशन' },
  lastPayment: { en: 'Last Payment', hi: 'अंतिम भुगतान' },
  
  // Admin
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  beneficiaries: { en: 'Beneficiaries', hi: 'लाभार्थी' },
  analytics: { en: 'Analytics', hi: 'विश्लेषण' },
  fraudAlerts: { en: 'Fraud Alerts', hi: 'धोखाधड़ी अलर्ट' },
  settings: { en: 'Settings', hi: 'सेटिंग्स' },
  totalBeneficiaries: { en: 'Total Beneficiaries', hi: 'कुल लाभार्थी' },
  fundsDisbursed: { en: 'Funds Disbursed', hi: 'वितरित राशि' },
  pendingPayments: { en: 'Pending Payments', hi: 'लंबित भुगतान' },
  activeSchemes: { en: 'Active Schemes', hi: 'सक्रिय योजनाएं' },
  
  // Government
  govtOfIndia: { en: 'Government of India', hi: 'भारत सरकार' },
  pensionWelfare: { en: 'Pension & Welfare Portal', hi: 'पेंशन एवं कल्याण पोर्टल' },
  securePortal: { en: 'Secure Government Portal', hi: 'सुरक्षित सरकारी पोर्टल' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
