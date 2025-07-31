// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AuthProvider } from './context/AuthContext'; // 🔐 Import AuthProvider

// Set up translations
const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Render app with AuthProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);