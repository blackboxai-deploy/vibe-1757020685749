'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [pin, setPin] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      await login(pin);
    }
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    // Auto-submit when PIN is complete
    if (value.length === 4) {
      setTimeout(() => login(value), 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="text-white text-2xl font-bold">🚗</div>
          </div>
          <CardTitle className="text-2xl">
            {process.env.NEXT_PUBLIC_WORKSHOP_NAME || 'AutoCare Workshop'}
          </CardTitle>
          <CardDescription>
            Enter your 4-digit PIN to access the workshop management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Demo PIN: 1234</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={pin.length !== 4 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure access for authorized workshop staff only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}