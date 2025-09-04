'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Staff } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  staff: Staff | null;
  isLoading: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!staff;

  useEffect(() => {
    // Check if user is already logged in (stored in localStorage)
    const storedStaffId = localStorage.getItem('workshopStaffId');
    if (storedStaffId) {
      // In a real app, you'd validate the stored session
      // For now, we'll assume it's valid
      setStaff({
        id: storedStaffId,
        pin: '',
        name: 'Staff Member',
        role: 'admin',
        createdAt: new Date()
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll use a hardcoded PIN
      // In production, this should query the Firebase staff collection
      const defaultPin = process.env.NEXT_PUBLIC_DEFAULT_STAFF_PIN || '1234';
      
      if (pin === defaultPin) {
        const staffData: Staff = {
          id: 'demo-staff-1',
          pin: '',
          name: 'Workshop Staff',
          role: 'admin',
          createdAt: new Date()
        };
        
        setStaff(staffData);
        localStorage.setItem('workshopStaffId', staffData.id);
        toast.success('Login successful!');
        return true;
      } else {
        // Query Firebase for staff with matching PIN
        const staffQuery = query(
          collection(db, 'staff'),
          where('pin', '==', pin)
        );
        
        const querySnapshot = await getDocs(staffQuery);
        
        if (!querySnapshot.empty) {
          const staffDoc = querySnapshot.docs[0];
          const staffData = {
            id: staffDoc.id,
            ...staffDoc.data()
          } as Staff;
          
          setStaff(staffData);
          localStorage.setItem('workshopStaffId', staffData.id);
          toast.success(`Welcome back, ${staffData.name}!`);
          return true;
        } else {
          toast.error('Invalid PIN. Please try again.');
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('workshopStaffId');
    toast.success('Logged out successfully');
  };

  const value = {
    staff,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}