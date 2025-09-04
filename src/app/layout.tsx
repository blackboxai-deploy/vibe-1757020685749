import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { BookingProvider } from '@/contexts/BookingContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoCare Workshop - Management System',
  description: 'Professional car workshop management system for bookings, payments, and customer management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}