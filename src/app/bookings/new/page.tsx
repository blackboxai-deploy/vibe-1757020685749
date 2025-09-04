'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/contexts/BookingContext';
import { Booking, CarDetails } from '@/types';
import toast from 'react-hot-toast';

export default function NewBooking() {
  const router = useRouter();
  const { createBooking, sendPaymentLink, services } = useBooking();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    carDetails: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: ''
    } as CarDetails,
    selectedServices: [] as string[],
    scheduledDate: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('carDetails.')) {
      const carField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        carDetails: {
          ...prev.carDetails,
          [carField]: carField === 'year' ? parseInt(value) || new Date().getFullYear() : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: checked
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter(id => id !== serviceId)
    }));
  };

  const calculateTotal = () => {
    return formData.selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setIsLoading(true);
    try {
      const totalAmount = calculateTotal();
      
      const bookingData: Omit<Booking, 'id' | 'bookingId' | 'createdAt'> = {
        customerId: '', // Will be assigned by the context
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        carDetails: formData.carDetails,
        services: formData.selectedServices.map(id => {
          const service = services.find(s => s.id === id);
          return service?.name || '';
        }),
        totalAmount,
        status: 'pending',
        scheduledDate: new Date(formData.scheduledDate),
        notes: formData.notes
      };

      const bookingId = await createBooking(bookingData);
      
      // Send payment link
      await sendPaymentLink(bookingId, formData.customerPhone);
      
      toast.success(`Booking created! Payment link sent to ${formData.customerName}`);
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
        <p className="text-gray-600">Add a new service booking for a customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">WhatsApp Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Car Details */}
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.carDetails.make}
                    onChange={(e) => handleInputChange('carDetails.make', e.target.value)}
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.carDetails.model}
                    onChange={(e) => handleInputChange('carDetails.model', e.target.value)}
                    placeholder="Camry"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.carDetails.year}
                    onChange={(e) => handleInputChange('carDetails.year', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">License Plate *</Label>
                  <Input
                    id="licensePlate"
                    value={formData.carDetails.licensePlate}
                    onChange={(e) => handleInputChange('carDetails.licensePlate', e.target.value)}
                    placeholder="ABC-123"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Services *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={service.id}
                    checked={formData.selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={service.id} className="cursor-pointer">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{service.category}</div>
                      <div className="text-sm font-semibold text-green-600">${service.price}</div>
                    </Label>
                  </div>
                </div>
              ))}
            </div>

            {totalAmount > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalAmount}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special instructions or notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || formData.selectedServices.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Creating Booking...' : `Create Booking & Send Payment Link ($${totalAmount})`}
          </Button>
        </div>
      </form>
    </div>
  );
}