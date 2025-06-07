
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Language data for initialization
const languageData = [
  { code: 'english', name: 'English', direction: 'ltr' },
  { code: 'hindi', name: 'हिन्दी', direction: 'ltr' },
  { code: 'tamil', name: 'தமிழ்', direction: 'ltr' },
  { code: 'malayalam', name: 'മലയാളം', direction: 'ltr' },
  { code: 'telugu', name: 'తెలుగు', direction: 'ltr' },
  { code: 'urdu', name: 'اردو', direction: 'rtl' },
  { code: 'bengali', name: 'বাংলা', direction: 'ltr' },
  { code: 'marathi', name: 'मराठी', direction: 'ltr' }
];

// Apply saved theme if available
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.classList.add(savedTheme);

// Apply saved language if available
const savedLanguage = localStorage.getItem('language') || 'english';
document.documentElement.setAttribute('lang', savedLanguage);

// Find the selected language details
const selectedLang = languageData.find(lang => lang.code === savedLanguage);

// Set html attribute for language direction
if (selectedLang) {
  document.documentElement.setAttribute('dir', selectedLang.direction);
} else {
  document.documentElement.setAttribute('dir', 'ltr');
}

// Create root with StrictMode to ensure proper React context
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
