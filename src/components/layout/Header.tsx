'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/contexts/BookingContext';

export default function Header() {
  const { staff } = useAuth();
  const { getTodayBookings, getPendingPayments } = useBooking();

  const todayBookings = getTodayBookings();
  const pendingPayments = getPendingPayments();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {staff?.name}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {todayBookings.length} Today's Bookings
            </Badge>
            <Badge 
              variant={pendingPayments.length > 0 ? "destructive" : "secondary"}
              className={pendingPayments.length > 0 ? "" : "bg-green-100 text-green-800"}
            >
              {pendingPayments.length} Pending Payments
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}