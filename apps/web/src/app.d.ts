declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
        username: string;
        status: 'active' | 'suspended';
        emailVerified: boolean;
        mfaEnabled: boolean;
        tenantId: string;
      };
      userId: string;
      tenantId: string;
    }

    interface Error {
      code: string;
      message: string;
      details?: Record<string, string[]>;
    }
  }
}

export {};
