export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  bookingHistory: string[];
  createdAt: Date;
}

export interface CarDetails {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category: 'wash' | 'repair' | 'maintenance';
}

export interface Booking {
  id: string;
  bookingId: string; // BK-0001 format
  customerId: string;
  customerName: string;
  customerPhone: string;
  carDetails: CarDetails;
  services: string[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: Date;
  scheduledDate: Date;
  paymentLink?: string;
  notes?: string;
}

export interface Staff {
  id: string;
  pin: string; // encrypted
  name: string;
  role: string;
  createdAt: Date;
}

export interface WorkshopSettings {
  id: string;
  name: string;
  phone: string;
  address: string;
  services: Service[];
  nextBookingNumber: number;
}

export interface FinancialData {
  month: string;
  income: number;
  expenses: number;
}

export interface DashboardStats {
  todayBookings: number;
  pendingPayments: number;
  totalRevenue: number;
  completedBookings: number;
}