'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBooking } from '@/contexts/BookingContext';
import { Customer, Booking } from '@/types';
import { format } from 'date-fns';

function CustomerHistoryContent() {
  const { customers, bookings } = useBooking();
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSearch = () => {
    const customer = customers.find(c => c.phone.includes(searchPhone));
    setSelectedCustomer(customer || null);
  };

  const getCustomerBookings = (customerId: string): Booking[] => {
    return bookings.filter(b => 
      b.customerPhone === selectedCustomer?.phone || 
      selectedCustomer?.bookingHistory.includes(b.id)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer History</h1>
        <p className="text-gray-600">Search and view customer booking history and details</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter customer phone number..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Results */}
      {searchPhone && !selectedCustomer && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500">No customer found with phone number: {searchPhone}</p>
              <p className="text-sm text-gray-400 mt-2">Try searching with a different number</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Details */}
      {selectedCustomer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Name</Label>
                <p className="text-lg font-semibold">{selectedCustomer.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Phone</Label>
                <p className="font-medium">{selectedCustomer.phone}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Total Spent</Label>
                <p className="text-xl font-bold text-green-600">${selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Customer Since</Label>
                <p className="font-medium">
                  {format(new Date(selectedCustomer.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Total Bookings</Label>
                <p className="text-lg font-semibold">{getCustomerBookings(selectedCustomer.id).length}</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                {getCustomerBookings(selectedCustomer.id).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-500">No booking history found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getCustomerBookings(selectedCustomer.id).map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{booking.bookingId}</h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(booking.createdAt), 'MMM dd, yyyy - hh:mm a')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <Label className="text-xs text-gray-500">Car</Label>
                            <p className="text-sm font-medium">
                              {booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}
                            </p>
                            <p className="text-xs text-gray-400">{booking.carDetails.licensePlate}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Amount</Label>
                            <p className="text-sm font-bold text-green-600">${booking.totalAmount}</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500">Services</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {booking.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <Label className="text-xs text-gray-500">Notes</Label>
                            <p className="text-sm">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* All Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500">No customers found</p>
              <p className="text-sm text-gray-400">Create your first booking to add customers</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.slice(0, 12).map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setSearchPhone(customer.phone);
                  }}
                >
                  <h4 className="font-medium">{customer.name}</h4>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {customer.bookingHistory.length} bookings
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ${customer.totalSpent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerHistory() {
  return (
    <DashboardLayout>
      <CustomerHistoryContent />
    </DashboardLayout>
  );
}