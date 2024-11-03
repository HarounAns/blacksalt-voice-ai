'use client'

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import Layout from '@/components/Layout';
import Configuration from '../components/Configuration';
import FAQManagement from '../components/FAQManagement';
import CallLogs from '@/components/CallLogs';

const API_URL = 'https://7al3ohcnml.execute-api.us-east-1.amazonaws.com';
const APP_TITLE = 'BlackSalt Voice AI';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('config');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const credentials = localStorage.getItem('auth_credentials');
      if (credentials) {
        try {
          const { username, password } = JSON.parse(credentials);
          const response = await fetch(`${API_URL}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            setIsAuthenticated(true);
          }
        } catch (err) {
          localStorage.removeItem('auth_credentials');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/[.08] dark:border-white/[.145] border-t-foreground"></div>
          <h1 className="text-xl font-semibold">{APP_TITLE}</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-md">
          <h1 className="text-3xl font-bold">{APP_TITLE}</h1>
          <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-gray-500">
          <p>BlackSalt Voice AI Restaurant Admin Dashboard</p>
        </footer>
      </div>
    );
  }

  const contentMap = {
    config: <Configuration />,
    calls: <CallLogs />,
    faq: <FAQManagement />,
  };

  return (
    <Layout title={APP_TITLE} onMenuClick={toggleMenu}>
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />
      <div className="w-full">
        {contentMap[activeTab]}
      </div>
    </Layout>
  );
}
