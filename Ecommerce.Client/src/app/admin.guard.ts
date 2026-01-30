import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from './account-service';

export const adminGuard = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  const user = accountService.user();
  const roles = user?.roles ?? [];
  const isAdmin = roles.some(role => {
    const value = role.toLowerCase();
    return value === 'admin' || value === 'superadmin' || value === 'moderator' || value.includes('admin');
  });

  if (accountService.isLoggedIn() && isAdmin) {
    return true;
  }

  return router.createUrlTree(['/'], {
    queryParams: { returnUrl: '/dashboard/users' },
  });
};
