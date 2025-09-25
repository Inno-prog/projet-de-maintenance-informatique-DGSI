import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check role-based access for protected routes
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = this.authService.getCurrentUser();
      if (!user || user.role !== requiredRole) {
        // Redirect to user's own dashboard
        this.redirectToUserDashboard(user?.role);
        return false;
      }
    }

    return true;
  }

  private redirectToUserDashboard(userRole?: string): void {
    switch (userRole) {
      case 'ADMINISTRATEUR':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'PRESTATAIRE':
        this.router.navigate(['/dashboard/prestataire']);
        break;
      case 'CORRESPONDANT_INFORMATIQUE':
        this.router.navigate(['/dashboard/ci']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}