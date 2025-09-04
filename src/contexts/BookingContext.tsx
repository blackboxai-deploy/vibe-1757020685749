'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { Booking, Customer, Service } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface BookingContextType {
  bookings: Booking[];
  customers: Customer[];
  services: Service[];
  isLoading: boolean;
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingId' | 'createdAt'>) => Promise<string>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  sendPaymentLink: (bookingId: string, customerPhone: string) => Promise<void>;
  getTodayBookings: () => Booking[];
  getPendingPayments: () => Booking[];
  generateBookingId: () => string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const defaultServices: Service[] = [
  { id: '1', name: 'Basic Car Wash', price: 25, category: 'wash' },
  { id: '2', name: 'Premium Car Wash', price: 45, category: 'wash' },
  { id: '3', name: 'Interior Cleaning', price: 35, category: 'wash' },
  { id: '4', name: 'Oil Change', price: 60, category: 'maintenance' },
  { id: '5', name: 'Brake Inspection', price: 80, category: 'maintenance' },
  { id: '6', name: 'Tire Rotation', price: 40, category: 'maintenance' },
  { id: '7', name: 'Engine Diagnostic', price: 120, category: 'repair' },
  { id: '8', name: 'Battery Replacement', price: 150, category: 'repair' },
  { id: '9', name: 'AC Repair', price: 200, category: 'repair' },
];

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services] = useState<Service[]>(defaultServices);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listeners for bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        scheduledDate: doc.data().scheduledDate?.toDate() || new Date(),
      })) as Booking[];
      
      setBookings(bookingsData);
      setIsLoading(false);
    });

    // Set up real-time listeners for customers
    const customersQuery = query(
      collection(db, 'customers'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Customer[];
      
      setCustomers(customersData);
    });

    return () => {
      unsubscribeBookings();
      unsubscribeCustomers();
    };
  }, []);

  const generateBookingId = (): string => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `BK-${year}${month}${day}-${random}`;
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingId' | 'createdAt'>): Promise<string> => {
    try {
      const bookingId = generateBookingId();
      const newBooking: Omit<Booking, 'id'> = {
        ...bookingData,
        bookingId,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Update or create customer record
      const existingCustomer = customers.find(c => c.phone === bookingData.customerPhone);
      if (existingCustomer) {
        // Update existing customer
        const customerRef = doc(db, 'customers', existingCustomer.id);
        await updateDoc(customerRef, {
          totalSpent: existingCustomer.totalSpent + bookingData.totalAmount,
          bookingHistory: [...existingCustomer.bookingHistory, docRef.id]
        });
      } else {
        // Create new customer
        await addDoc(collection(db, 'customers'), {
          name: bookingData.customerName,
          phone: bookingData.customerPhone,
          totalSpent: bookingData.totalAmount,
          bookingHistory: [docRef.id],
          createdAt: new Date()
        });
      }

      toast.success('Booking created successfully!');
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status });
      toast.success('Booking status updated!');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      throw error;
    }
  };

  const sendPaymentLink = async (bookingId: string, customerPhone: string): Promise<void> => {
    try {
      // Call Firebase Function to create payment link
      const createBookingPayment = httpsCallable(functions, 'createBookingPayment');
      
      const result = await createBookingPayment({
        bookingId,
        customerPhone
      });

      if (result.data) {
        const { paymentLink } = result.data as { paymentLink: string };
        
        // Update booking with payment link
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { paymentLink });
        
        toast.success('Payment link sent to customer successfully!');
      }
    } catch (error) {
      console.error('Error sending payment link:', error);
      toast.error('Failed to send payment link. Using demo mode.');
      
      // Demo fallback - just show success message
      toast.success('Demo: Payment link would be sent to customer');
    }
  };

  const getTodayBookings = (): Booking[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    });
  };

  const getPendingPayments = (): Booking[] => {
    return bookings.filter(booking => booking.status === 'pending');
  };

  const value = {
    bookings,
    customers,
    services,
    isLoading,
    createBooking,
    updateBookingStatus,
    sendPaymentLink,
    getTodayBookings,
    getPendingPayments,
    generateBookingId
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}