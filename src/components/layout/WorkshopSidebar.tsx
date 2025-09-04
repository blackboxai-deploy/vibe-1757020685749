'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'New Booking',
    href: '/bookings/new',
    icon: '➕',
  },
  {
    name: 'All Bookings',
    href: '/bookings',
    icon: '📝',
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: '👥',
  },
  {
    name: 'Receipts',
    href: '/receipts',
    icon: '🧾',
  },
];

export default function WorkshopSidebar() {
  const pathname = usePathname();
  const { logout, staff } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🚗</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              AutoCare
            </h1>
            <p className="text-sm text-gray-500">Workshop</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{staff?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{staff?.role}</p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}