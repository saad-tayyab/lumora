declare module '@lumora/auth/middleware' {
  export function getSession(headers: Headers): Promise<{
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
  } | null>;
}
