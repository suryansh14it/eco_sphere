'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, CheckCircle, XCircle, Info } from 'lucide-react';

interface WalletManagementProps {
  className?: string;
}

interface Message {
  type: 'success' | 'error' | 'info';
  text: string;
}

export function WalletManagement({ className }: WalletManagementProps) {
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load current wallet address on component mount
  useEffect(() => {
    loadCurrentAddress();
  }, []);

  const loadCurrentAddress = async () => {
    try {
      const response = await fetch('/api/user/wallet');
      const data = await response.json();

      if (data.success) {
        setCurrentAddress(data.walletAddress);
        setWalletAddress(data.walletAddress || '');
      } else {
        console.error('Failed to load wallet address:', data.message);
      }
    } catch (error) {
      console.error('Error loading wallet address:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress || null }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentAddress(data.walletAddress);
        setMessage({
          type: 'success',
          text: data.message
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update wallet address'
        });
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/wallet', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCurrentAddress(null);
        setWalletAddress('');
        setMessage({
          type: 'success',
          text: data.message
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to remove wallet address'
        });
      }
    } catch (error) {
      console.error('Error removing wallet address:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  if (isInitialLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Management
        </CardTitle>
        <CardDescription>
          Connect your Ethereum wallet to automatically receive EcoTokens when you earn XP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {currentAddress ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-medium">
              {currentAddress ? 'Wallet Connected' : 'No Wallet Connected'}
            </span>
          </div>
          {currentAddress && (
            <div className="text-sm text-muted-foreground font-mono break-all">
              {currentAddress}
            </div>
          )}
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            When you earn XP, equivalent EcoTokens will be automatically minted to your wallet address.
            1 XP = 1 EcoToken. You can participate without a wallet, but won't receive tokens.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Ethereum Wallet Address</Label>
            <Input
              id="walletAddress"
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono"
            />
            {walletAddress && !isValidAddress(walletAddress) && (
              <p className="text-sm text-red-600">
                Invalid address format. Must be 42 characters starting with 0x.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || (walletAddress && !isValidAddress(walletAddress))}
              className="flex-1"
            >
              {isLoading ? 'Updating...' : currentAddress ? 'Update Wallet' : 'Connect Wallet'}
            </Button>
            
            {currentAddress && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={isLoading}
              >
                Remove
              </Button>
            )}
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            {message.type === 'error' ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
