'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';
import { format } from 'date-fns';
import { useBooking } from '@/contexts/BookingContext';

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const { updateBookingStatus, sendPaymentLink } = useBooking();

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = async (newStatus: Booking['status']) => {
    await updateBookingStatus(booking.id, newStatus);
  };

  const handleSendPaymentLink = async () => {
    await sendPaymentLink(booking.id, booking.customerPhone);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{booking.bookingId}</h3>
            <p className="text-sm text-gray-600">{booking.customerName}</p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{booking.customerPhone}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Amount</p>
            <p className="font-medium text-green-600">${booking.totalAmount}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Car Details</p>
          <p className="font-medium">
            {booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}
          </p>
          <p className="text-sm text-gray-600">{booking.carDetails.licensePlate}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Services</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {booking.services.map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Scheduled Date</p>
          <p className="font-medium">
            {format(new Date(booking.scheduledDate), 'MMM dd, yyyy - hh:mm a')}
          </p>
        </div>

        {booking.notes && (
          <div>
            <p className="text-gray-500 text-sm">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {booking.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendPaymentLink}
                className="flex-1"
              >
                Send Payment Link
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('paid')}
                className="flex-1"
              >
                Mark as Paid
              </Button>
            </>
          )}
          
          {booking.status === 'paid' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              className="w-full"
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}