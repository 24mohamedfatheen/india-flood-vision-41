
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageData {
  code: string;
  name: string;
  displayName: string;
  direction: 'ltr' | 'rtl';
}

const languageData: LanguageData[] = [
  { code: 'english', name: 'English', displayName: 'English', direction: 'ltr' },
  { code: 'hindi', name: 'हिन्दी', displayName: 'Hindi', direction: 'ltr' },
  { code: 'tamil', name: 'தமிழ்', displayName: 'Tamil', direction: 'ltr' },
  { code: 'malayalam', name: 'മലയാളം', displayName: 'Malayalam', direction: 'ltr' },
  { code: 'telugu', name: 'తెలుగు', displayName: 'Telugu', direction: 'ltr' },
  { code: 'urdu', name: 'اردو', displayName: 'Urdu', direction: 'rtl' },
  { code: 'bengali', name: 'বাংলা', displayName: 'Bengali', direction: 'ltr' },
  { code: 'marathi', name: 'मराठी', displayName: 'Marathi', direction: 'ltr' }
];

interface LanguageContextType {
  language: string;
  languageData: LanguageData[];
  setLanguage: (language: string) => void;
  getCurrentLanguage: () => LanguageData;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('english');

  const setLanguage = (newLanguage: string) => {
    const selectedLang = languageData.find(lang => lang.code === newLanguage);
    
    if (selectedLang) {
      setLanguageState(newLanguage);
      
      // Update HTML attributes safely
      try {
        document.documentElement.setAttribute('lang', newLanguage);
        document.documentElement.setAttribute('dir', selectedLang.direction);
        
        // Save to localStorage
        localStorage.setItem('language', newLanguage);
        
        console.log(`Language changed to: ${selectedLang.displayName}`);
      } catch (error) {
        console.error('Error updating language attributes:', error);
      }
    }
  };

  const getCurrentLanguage = () => {
    return languageData.find(lang => lang.code === language) || languageData[0];
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && languageData.find(lang => lang.code === savedLanguage)) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }, []);

  const value = {
    language,
    languageData,
    setLanguage,
    getCurrentLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
