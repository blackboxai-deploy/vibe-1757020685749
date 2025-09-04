'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useBooking } from '@/contexts/BookingContext';
import { Booking } from '@/types';
import { format } from 'date-fns';

function ReceiptContent() {
  const { bookings } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter bookings that have payments (paid or completed)
  const paidBookings = bookings.filter(b => 
    b.status === 'paid' || b.status === 'completed'
  );

  // Filter bookings based on search
  const filteredBookings = paidBookings.filter(booking =>
    booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerPhone.includes(searchTerm)
  );

  const generateReceiptContent = (booking: Booking) => {
    const workshopName = process.env.NEXT_PUBLIC_WORKSHOP_NAME || 'AutoCare Workshop';
    const workshopPhone = process.env.NEXT_PUBLIC_WORKSHOP_PHONE || '+1234567890';
    const workshopAddress = process.env.NEXT_PUBLIC_WORKSHOP_ADDRESS || '123 Main St, City, State 12345';

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${booking.bookingId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 15px 0; }
        .total { font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h2>${workshopName}</h2>
            <p>${workshopAddress}</p>
            <p>Phone: ${workshopPhone}</p>
        </div>
        
        <div class="section">
            <h3>Receipt #${booking.bookingId}</h3>
            <p><strong>Date:</strong> ${format(new Date(booking.createdAt), 'MMM dd, yyyy - hh:mm a')}</p>
            <p><strong>Service Date:</strong> ${format(new Date(booking.scheduledDate), 'MMM dd, yyyy - hh:mm a')}</p>
        </div>
        
        <div class="section">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Phone:</strong> ${booking.customerPhone}</p>
        </div>
        
        <div class="section">
            <h4>Vehicle Information</h4>
            <p><strong>Vehicle:</strong> ${booking.carDetails.year} ${booking.carDetails.make} ${booking.carDetails.model}</p>
            <p><strong>License Plate:</strong> ${booking.carDetails.licensePlate}</p>
        </div>
        
        <div class="section">
            <h4>Services Provided</h4>
            <table>
                <tr><th>Service</th><th>Price</th></tr>
                ${booking.services.map(service => `<tr><td>${service}</td><td>-</td></tr>`).join('')}
            </table>
        </div>
        
        ${booking.notes ? `<div class="section"><h4>Notes</h4><p>${booking.notes}</p></div>` : ''}
        
        <div class="total">
            Total Amount: $${booking.totalAmount}
        </div>
        
        <div class="section" style="text-align: center; margin-top: 30px;">
            <p>Thank you for choosing ${workshopName}!</p>
            <p>We appreciate your business.</p>
        </div>
    </div>
</body>
</html>
    `;
  };

  const handlePrintReceipt = (booking: Booking) => {
    const receiptContent = generateReceiptContent(booking);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadReceipt = (booking: Booking) => {
    const receiptContent = generateReceiptContent(booking);
    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${booking.bookingId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
        <p className="text-gray-600">View, print, and download receipts for completed bookings</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by Booking ID, Customer Name, or Phone</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter booking ID, customer name, or phone number..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Preview */}
      {selectedBooking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Receipt Preview - {selectedBooking.bookingId}
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePrintReceipt(selectedBooking)}
                >
                  🖨️ Print
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedBooking)}
                >
                  📥 Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBooking(null)}
                >
                  ✕ Close
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              dangerouslySetInnerHTML={{ 
                __html: generateReceiptContent(selectedBooking) 
              }}
              className="border p-4 bg-white"
            />
          </CardContent>
        </Card>
      )}

      {/* Receipts List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Receipts ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🧾</div>
              <p className="text-gray-500">
                {paidBookings.length === 0 
                  ? 'No paid bookings available for receipts' 
                  : 'No receipts match your search criteria'}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  className="mt-3"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{booking.bookingId}</h4>
                      <p className="text-sm text-gray-500">
                        {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm">
                        {booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}
                      </p>
                      <p className="text-xs text-gray-500">{booking.carDetails.licensePlate}</p>
                    </div>
                    <div>
                      <p className="font-bold text-green-600">${booking.totalAmount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full"
                    >
                      👁️ View Receipt
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintReceipt(booking)}
                      >
                        🖨️ Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(booking)}
                      >
                        📥 Download
                      </Button>
                    </div>
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

export default function Receipts() {
  return (
    <DashboardLayout>
      <ReceiptContent />
    </DashboardLayout>
  );
}