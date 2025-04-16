import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Check if a user object exists and contains a token.
  if (user && user.token) {
    return true;
  } else {
    // Redirect to login if no valid user is found.
    return router.createUrlTree(['/login']);
  }
};
