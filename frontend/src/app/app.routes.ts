import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent)
  },

  // Role-based dashboard routes
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'dashboard/prestataire',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'PRESTATAIRE' }
  },
  {
    path: 'dashboard/ci',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'CORRESPONDANT_INFORMATIQUE' }
  },

  // Protected routes with role-based access
  {
    path: 'prestations-dashboard',
    loadComponent: () => import('./features/dashboard/components/prestations-dashboard/prestations-dashboard.component').then(m => m.PrestationsDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'contrats',
    loadComponent: () => import('./features/contrats/components/contrat-list/contrat-list.component').then(m => m.ContratListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ordres-commande',
    loadComponent: () => import('./features/ordres-commande/components/ordre-commande-list/ordre-commande-list.component').then(m => m.OrdreCommandeListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluations',
    loadComponent: () => import('./features/evaluations/components/evaluation-list/evaluation-list.component').then(m => m.EvaluationListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluations/new',
    loadComponent: () => import('./features/evaluation/evaluation-form.component').then(m => m.EvaluationFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'demandes-intervention',
    loadComponent: () => import('./features/demandes-intervention/components/demande-list/demande-list.component').then(m => m.DemandeListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'fiches-prestation',
    loadComponent: () => import('./features/fiches-prestation/components/fiche-list/fiche-list.component').then(m => m.FicheListComponent),
    canActivate: [AuthGuard]
  },

  // Default redirect
  {
    path: '**',
    redirectTo: ''
  }
];