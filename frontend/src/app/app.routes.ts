import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./components/products/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/categories/category-list.component').then(m => m.CategoryListComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
