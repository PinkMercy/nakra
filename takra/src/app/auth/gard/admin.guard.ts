import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Allow access if the user exists and has the ADMIN role.
  if (user && user.token && user.role === 'ADMIN') {
    return true;
  } else {
    // Optionally redirect to a 'Not Authorized' page or login.
    return router.createUrlTree(['/login']);
  }
};
