'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBooking } from '@/contexts/BookingContext';
import BookingCard from '@/components/BookingCard';
import { Booking } from '@/types';

function AllBookingsContent() {
  const { bookings } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount-high':
        return b.totalAmount - a.totalAmount;
      case 'amount-low':
        return a.totalAmount - b.totalAmount;
      case 'customer':
        return a.customerName.localeCompare(b.customerName);
      default:
        return 0;
    }
  });

  // Stats
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    paid: bookings.filter(b => b.status === 'paid').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-gray-600">Manage and view all workshop bookings</p>
        </div>
        <Link href="/bookings/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            ➕ Create New Booking
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('pending')}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('paid')}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.paid}</div>
              <p className="text-sm text-gray-600">Paid</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('completed')}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.completed}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter('cancelled')}>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Booking ID, customer name, phone..."
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                  <SelectItem value="customer">Customer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">
                Showing {sortedBookings.length} of {bookings.length} bookings
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Bookings {sortedBookings.length > 0 && `(${sortedBookings.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              {bookings.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-4">Create your first booking to get started</p>
                  <Link href="/bookings/new">
                    <Button>Create First Booking</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings match your filters</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AllBookings() {
  return (
    <DashboardLayout>
      <AllBookingsContent />
    </DashboardLayout>
  );
}