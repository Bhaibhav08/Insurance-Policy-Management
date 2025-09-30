import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles && expectedRoles.length > 0) {
      if (expectedRoles.includes(user.role)) {
        return true;
      } else {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // If no roles are specified, deny access
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
