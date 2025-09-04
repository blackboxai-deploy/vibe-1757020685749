'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Plus,
  Users,
  FileText,
  BarChart3,
  LogOut
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'New Booking',
    href: '/bookings/new',
    icon: Plus,
  },
  {
    name: 'Customer History',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Receipts',
    href: '/receipts',
    icon: FileText,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { staff, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Workshop Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🚗</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">
              {process.env.NEXT_PUBLIC_WORKSHOP_NAME || 'AutoCare Workshop'}
            </h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-blue-600 text-white"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Staff Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{staff?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{staff?.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}