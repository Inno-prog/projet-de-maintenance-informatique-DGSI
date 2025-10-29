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
    data: { role: 'AGENT_DGSI' }
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
    path: 'ordres-commande-prestataire',
    loadComponent: () => import('./features/ordres-commande/components/ordre-commande-prestataire/ordre-commande-prestataire.component').then(m => m.OrdreCommandePrestataireComponent),
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
    path: 'fiches-prestation',
    loadComponent: () => import('./features/fiches-prestation/components/fiche-list/fiche-list.component').then(m => m.FicheListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'items',
    loadComponent: () => import('./features/items/components/item-list/item-list.component').then(m => m.ItemListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'lots',
    loadComponent: () => import('./features/lots/components/lot-list/lot-list.component').then(m => m.LotListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'statistiques',
    loadComponent: () => import('./features/statistiques/components/statistiques-dashboard/statistiques-dashboard.component').then(m => m.StatistiquesDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'prestations',
    loadComponent: () => import('./features/prestations/components/prestation-list/prestation-list.component').then(m => m.PrestationListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'équipements',
    loadComponent: () => import('./features/equipements/components/equipement-dashboard/equipement-dashboard.component').then(m => m.EquipementDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'equipements/list',
    loadComponent: () => import('./features/equipements/components/equipement-list/equipement-list.component').then(m => m.EquipementListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'equipements/new',
    loadComponent: () => import('./features/equipements/components/equipement-form/equipement-form.component').then(m => m.EquipementFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'equipements/:id',
    loadComponent: () => import('./features/equipements/components/equipement-form/equipement-form.component').then(m => m.EquipementFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'equipements/:id/edit',
    loadComponent: () => import('./features/equipements/components/equipement-form/equipement-form.component').then(m => m.EquipementFormComponent),
    canActivate: [AuthGuard]
  },

  // Default redirect
  {
    path: '**',
    redirectTo: ''
  }
];