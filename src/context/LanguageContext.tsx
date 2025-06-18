
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../utils/translations';

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
  translate: (key: string) => string;
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

  const translate = (key: string): string => {
    try {
      const translation = translations[language]?.[key];
      return translation || translations['english']?.[key] || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  const setLanguage = (newLanguage: string) => {
    try {
      const selectedLang = languageData.find(lang => lang.code === newLanguage);
      
      if (selectedLang) {
        setLanguageState(newLanguage);
        
        // Update HTML attributes safely
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('lang', newLanguage);
          document.documentElement.setAttribute('dir', selectedLang.direction);
          
          // Save to localStorage
          localStorage.setItem('language', newLanguage);
          
          console.log(`Language changed to: ${selectedLang.displayName}`);
          
          // Force a re-render by dispatching a custom event
          window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: newLanguage, displayName: selectedLang.displayName } 
          }));
        }
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const getCurrentLanguage = () => {
    try {
      return languageData.find(lang => lang.code === language) || languageData[0];
    } catch (error) {
      console.error('Error getting current language:', error);
      return languageData[0];
    }
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage && languageData.find(lang => lang.code === savedLanguage)) {
        setLanguageState(savedLanguage);
        const selectedLang = languageData.find(lang => lang.code === savedLanguage);
        if (selectedLang && typeof document !== 'undefined') {
          document.documentElement.setAttribute('lang', savedLanguage);
          document.documentElement.setAttribute('dir', selectedLang.direction);
        }
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }, []);

  const value = {
    language,
    languageData,
    setLanguage,
    getCurrentLanguage,
    translate
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
