import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../models/user.model';
import { PaymentSession } from '../models/payment.model';
import { hashPassword } from './id.util';
import { createId } from './id.util';
import { StorageService } from './storage.service';

const USERS_KEY = 'grf.users';
const SESSION_KEY = 'grf.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly sessionId = signal<string | null>(this.storage.read<string | null>(SESSION_KEY, null));
  private readonly userRevision = signal(0);

  readonly currentUser = computed(() => {
    this.userRevision();
    const id = this.sessionId();
    return this.users().find((u) => u.id === id) ?? null;
  });

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly hasPlatformAccess = computed(() => this.userHasPlatformAccess(this.currentUser()));

  userHasPlatformAccess(user: User | null | undefined): boolean {
    if (!user?.hasPlatformAccess) return false;
    return !user.membershipExpiresAt || new Date(user.membershipExpiresAt).getTime() > Date.now();
  }
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor() {
    this.migrateMembershipDates();
    this.ensureAdmin();
  }

  users(): User[] {
    return this.storage.read<User[]>(USERS_KEY, []);
  }

  async register(input: { fullName: string; email: string; password: string; phone: string; dateOfBirth: string }): Promise<User> {
    if (!input.fullName.trim() || !input.phone.trim() || !input.dateOfBirth || !input.email.trim() || input.password.length < 8) {
      throw new Error('Renseignez les champs obligatoires et choisissez un mot de passe d’au moins 8 caractères.');
    }
    const email = input.email.trim().toLowerCase();
    if (this.users().some((u) => u.email === email)) {
      throw new Error('Un compte existe déjà avec cet email.');
    }
    const user: User = {
      id: createId('usr'),
      fullName: input.fullName.trim(),
      email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      role: 'CLIENT',
      passwordHash: await hashPassword(input.password),
      hasPlatformAccess: false,
      createdAt: new Date().toISOString()
    };
    this.storage.write(USERS_KEY, [...this.users(), user]);
    this.setSession(user.id);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const hash = await hashPassword(password);
    const user = this.users().find((u) => u.email === email.trim().toLowerCase() && u.passwordHash === hash);
    if (!user) {
      throw new Error('Identifiants incorrects.');
    }
    this.setSession(user.id);
    return user;
  }

  logout(): void {
    this.sessionId.set(null);
    this.storage.remove(SESSION_KEY);
  }

  activateMembership(userId: string, paidAt = new Date().toISOString()): User {
    const users = this.users();
    const current = users.find((user) => user.id === userId);
    if (!current) throw new Error('Membre introuvable.');
    const now = new Date(paidAt);
    const previousExpiry = current.membershipExpiresAt ? new Date(current.membershipExpiresAt) : null;
    const start = previousExpiry && previousExpiry.getTime() > now.getTime() ? previousExpiry : now;
    const expires = new Date(start);
    expires.setFullYear(expires.getFullYear() + 1);
    if (start.getMonth() === 1 && start.getDate() === 29 && expires.getMonth() !== 1) expires.setDate(0);
    const updated: User = {
      ...current,
      hasPlatformAccess: true,
      membershipNumber: current.membershipNumber ?? `GRF-${createId('member').slice(-8).toUpperCase()}`,
      membershipStartedAt: previousExpiry && previousExpiry.getTime() > now.getTime()
        ? current.membershipStartedAt ?? now.toISOString()
        : now.toISOString(),
      membershipExpiresAt: expires.toISOString()
    };
    this.storage.write(USERS_KEY, users.map((user) => user.id === userId ? updated : user));
    this.userRevision.update((revision) => revision + 1);
    return updated;
  }

  updateProfile(patch: Partial<Pick<User, 'fullName' | 'phone'>>): User {
    const current = this.currentUser();
    if (!current) {
      throw new Error('Session expirée.');
    }
    const users = this.users().map((user) => (user.id === current.id ? { ...user, ...patch } : user));
    this.storage.write(USERS_KEY, users);
    this.userRevision.update((revision) => revision + 1);
    return users.find((u) => u.id === current.id)!;
  }

  private setSession(userId: string): void {
    this.sessionId.set(userId);
    this.storage.write(SESSION_KEY, userId);
  }

  private migrateMembershipDates(): void {
    const users = this.users();
    const payments = this.storage.read<PaymentSession[]>('grf.payments', []);
    let changed = false;
    const migrated = users.map((user) => {
      if (!user.hasPlatformAccess || user.membershipExpiresAt || user.role === 'ADMIN') return user;
      const latestPaid = payments
        .filter((payment) => payment.userId === user.id && payment.planId === 'adhesion' && payment.status === 'PAID')
        .sort((a, b) => (b.paidAt ?? b.createdAt).localeCompare(a.paidAt ?? a.createdAt))[0];
      const started = new Date(latestPaid?.paidAt ?? latestPaid?.createdAt ?? user.createdAt);
      const expires = new Date(started);
      expires.setFullYear(expires.getFullYear() + 1);
      if (started.getMonth() === 1 && started.getDate() === 29 && expires.getMonth() !== 1) expires.setDate(0);
      changed = true;
      return {
        ...user,
        membershipNumber: user.membershipNumber ?? `GRF-${createId('member').slice(-8).toUpperCase()}`,
        membershipStartedAt: user.membershipStartedAt ?? started.toISOString(),
        membershipExpiresAt: expires.toISOString()
      };
    });
    if (changed) this.storage.write(USERS_KEY, migrated);
  }

  private async ensureAdmin(): Promise<void> {
    if (this.users().some((u) => u.role === 'ADMIN')) {
      return;
    }
    const admin: User = {
      id: 'usr_admin',
      fullName: 'Administration GRF',
      email: 'admin@grfconsulting.sn',
      phone: '770000000',
      role: 'ADMIN',
      passwordHash: await hashPassword('Admin@2026'),
      hasPlatformAccess: true,
      createdAt: new Date().toISOString()
    };
    this.storage.write(USERS_KEY, [...this.users(), admin]);
  }
}
