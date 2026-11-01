import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { paidAccessGuard } from './core/guards/paid-access.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home.page').then((m) => m.HomePage)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/public/home.page').then((m) => m.HomePage)
      },
      {
        path: 'adhesion',
        loadComponent: () => import('./features/public/membership.page').then((m) => m.MembershipPage)
      },
      {
        path: 'connexion',
        loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage)
      },
      {
        path: 'inscription',
        loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage)
      },
      {
        path: 'paiement/checkout/:sessionId',
        loadComponent: () =>
          import('./features/checkout/provider-checkout.page').then((m) => m.ProviderCheckoutPage)
      },
      {
        path: 'paiement/confirmation',
        loadComponent: () =>
          import('./features/checkout/confirmation.page').then((m) => m.ConfirmationPage)
      },
      {
        path: 'paiement/echec',
        loadComponent: () => import('./features/checkout/failure.page').then((m) => m.FailurePage)
      },
      {
        path: 'paiement/:planId',
        loadComponent: () => import('./features/checkout/checkout.page').then((m) => m.CheckoutPage)
      }
    ]
  },
  {
    path: 'espace',
    canActivate: [authGuard, paidAccessGuard],
    loadComponent: () =>
      import('./shared/layouts/dashboard-layout.component').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/overview.page').then((m) => m.OverviewPage)
      },
      {
        path: 'dossiers',
        loadComponent: () => import('./features/dashboard/cases.page').then((m) => m.CasesPage)
      },
      {
        path: 'dossiers/:id',
        loadComponent: () =>
          import('./features/dashboard/case-detail.page').then((m) => m.CaseDetailPage)
      },
      {
        path: 'paiements',
        loadComponent: () => import('./features/dashboard/payments.page').then((m) => m.PaymentsPage)
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/dashboard/profile.page').then((m) => m.ProfilePage)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./shared/layouts/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-overview.page').then((m) => m.AdminOverviewPage)
      },
      {
        path: 'dossiers',
        loadComponent: () => import('./features/admin/admin-cases.page').then((m) => m.AdminCasesPage)
      },
      {
        path: 'paiements',
        loadComponent: () =>
          import('./features/admin/admin-payments.page').then((m) => m.AdminPaymentsPage)
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/admin/admin-clients.page').then((m) => m.AdminClientsPage)
      }
    ]
  },
  { path: 'gestion', redirectTo: 'admin' },
  { path: '**', redirectTo: '' }
];
