import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [

  
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home-component/home-component.component')
      .then(s => s.HomeComponentComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile-component.component')
      .then(s => s.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard/users',
    loadComponent: () =>
      import('./admin-users.component')
      .then(s => s.AdminUsersComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'dashboard/roles',
    loadComponent: () =>
      import('./admin-roles.component')
      .then(s => s.AdminRolesComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'dashboard/products',
    loadComponent: () =>
      import('./admin-products.component')
      .then(s => s.AdminProductsComponent),
    canActivate: [adminGuard]
  },

      {
    path: 'register',
    
    loadComponent: () =>
      import('./register-component/register-component.component')
      .then(s => s.RegisterComponent)
  },

  {
    path: 'login',
    
    loadComponent: () =>
      import('./login-component/login-component.component')
      .then(s => s.LoginComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./product-details.component')
      .then(s => s.ProductDetailsComponent)
  },
  {
    path: 'basket',
    loadComponent: () =>
      import('./basket.component')
      .then(s => s.BasketComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./wishlist.component')
      .then(s => s.WishListComponent)
  },
];
