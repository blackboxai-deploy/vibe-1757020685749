'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useBooking } from '@/contexts/BookingContext';
import BookingCard from '@/components/BookingCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock financial data for demo
const financialData = [
  { month: 'Jan', income: 3200, expenses: 1500 },
  { month: 'Feb', income: 2800, expenses: 1400 },
  { month: 'Mar', income: 3800, expenses: 1600 },
  { month: 'Apr', income: 4200, expenses: 1700 },
  { month: 'May', income: 3600, expenses: 1550 },
  { month: 'Jun', income: 4800, expenses: 1800 },
];

export default function Dashboard() {
  const { getTodayBookings, getPendingPayments, bookings } = useBooking();

  const todayBookings = getTodayBookings();
  const pendingPayments = getPendingPayments();
  
  // Calculate stats
  const totalRevenue = bookings
    .filter(b => b.status === 'paid' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);
  
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your workshop operations</p>
        </div>
        <Link href="/bookings/new">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            ➕ Create New Booking
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-gray-500">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingPayments.length}</div>
            <p className="text-xs text-gray-500">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings}</div>
            <p className="text-xs text-gray-500">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Today's Bookings
                <Badge variant="secondary">{todayBookings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-500">No bookings scheduled for today</p>
                  <Link href="/bookings/new">
                    <Button className="mt-3" variant="outline">
                      Create First Booking
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayBookings.slice(0, 3).map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                  {todayBookings.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/bookings">
                        <Button variant="outline">
                          View All {todayBookings.length} Bookings
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pending Payments
                <Badge variant="destructive">{pendingPayments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-500">All payments up to date!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">{booking.bookingId}</p>
                        </div>
                        <p className="font-bold text-red-600">${booking.totalAmount}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => {
                          // This would send a payment reminder
                          console.log('Send reminder to:', booking.customerPhone);
                        }}
                      >
                        Send Reminder
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'income' ? 'Income' : 'Expenses']}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}