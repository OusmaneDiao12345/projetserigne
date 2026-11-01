export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  role: UserRole;
  passwordHash: string;
  hasPlatformAccess: boolean;
  membershipNumber?: string;
  membershipStartedAt?: string;
  membershipExpiresAt?: string;
  createdAt: string;
}
