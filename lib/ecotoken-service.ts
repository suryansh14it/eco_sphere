/**
 * EcoToken Service
 * 
 * This service handles the integration between the XP system and EcoToken smart contract.
 * It provides functions to mint EcoTokens when users earn XP, ensuring 1:1 ratio (1 XP = 1 EcoToken).
 */

interface EcoTokenMintResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

interface EcoTokenConfig {
  backendUrl: string;
  enabled: boolean;
}

class EcoTokenService {
  private config: EcoTokenConfig;

  constructor() {
    this.config = {
      backendUrl: process.env.ECOTOKEN_BACKEND_URL || 'http://localhost:3001',
      enabled: process.env.ECOTOKEN_ENABLED === 'true'
    };
  }

  /**
   * Mint EcoTokens for a user when they earn XP
   * @param walletAddress - User's Ethereum wallet address
   * @param amount - Amount of XP earned (will mint equivalent EcoTokens)
   * @returns Promise with minting result
   */
  async mintTokensForXP(walletAddress: string, amount: number): Promise<EcoTokenMintResponse> {
    // If EcoToken integration is disabled, return success without minting
    if (!this.config.enabled) {
      console.log('🔕 EcoToken integration disabled, skipping token minting');
      return { success: true };
    }

    // Validate wallet address format
    if (!this.isValidEthereumAddress(walletAddress)) {
      console.error('❌ Invalid wallet address format:', walletAddress);
      return { 
        success: false, 
        error: 'Invalid Ethereum wallet address format' 
      };
    }

    // Validate amount
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      console.error('❌ Invalid token amount:', amount);
      return { 
        success: false, 
        error: 'Invalid token amount. Must be a positive integer.' 
      };
    }

    try {
      console.log(`🪙 Attempting to mint ${amount} EcoTokens for wallet: ${walletAddress}`);

      const response = await fetch(`${this.config.backendUrl}/earn-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: walletAddress,
          amount: amount
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ EcoToken minting failed:', response.status, errorData);
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      if (data.success && data.txHash) {
        console.log(`✅ Successfully minted ${amount} EcoTokens. Tx: ${data.txHash}`);
        return {
          success: true,
          txHash: data.txHash
        };
      } else {
        console.error('❌ EcoToken minting failed:', data);
        return {
          success: false,
          error: data.error || 'Unknown minting error'
        };
      }

    } catch (error: any) {
      console.error('❌ EcoToken service error:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'EcoToken minting request timed out'
        };
      }
      
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'EcoToken backend service is unavailable'
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to connect to EcoToken service'
      };
    }
  }

  /**
   * Check if EcoToken integration is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get the current backend URL
   */
  getBackendUrl(): string {
    return this.config.backendUrl;
  }

  /**
   * Validate Ethereum address format
   * @param address - Address to validate
   * @returns true if valid Ethereum address format
   */
  private isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Test connection to EcoToken backend
   * @returns Promise with connection test result
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.enabled) {
      return { success: true }; // Consider disabled as "successful" for testing
    }

    try {
      const response = await fetch(`${this.config.backendUrl}/test`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout for health check
      });

      if (response.ok) {
        console.log('✅ EcoToken backend connection successful');
        return { success: true };
      } else {
        console.error('❌ EcoToken backend health check failed:', response.status);
        return { 
          success: false, 
          error: `Backend health check failed: HTTP ${response.status}` 
        };
      }
    } catch (error: any) {
      console.error('❌ EcoToken backend connection test failed:', error);
      return { 
        success: false, 
        error: error.message || 'Connection test failed' 
      };
    }
  }
}

// Export singleton instance
export const ecoTokenService = new EcoTokenService();

// Export types for use in other modules
export type { EcoTokenMintResponse, EcoTokenConfig };
