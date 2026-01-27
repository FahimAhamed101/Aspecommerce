import { Routes } from '@angular/router';

export const routes: Routes = [
      {
    path: 'register',
    
    loadComponent: () =>
      import('./register-component/register-component.component')
      .then(s => s.RegisterComponent)
  },
];
