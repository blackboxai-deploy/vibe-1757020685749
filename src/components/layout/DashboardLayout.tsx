'use client';

import React from 'react';
import WorkshopSidebar from './WorkshopSidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // This will be handled by the auth guard
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <WorkshopSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}