import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';
import { StoreLayoutComponent } from './shared/store-layout.component';
import { AdminLayoutComponent } from './shared/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', title: 'LuxeStudio — Curated modern essentials', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
      { path: 'products', title: 'Products — LuxeStudio', loadComponent: () => import('./pages/catalog.component').then((m) => m.CatalogComponent) },
      { path: 'products/:id', title: 'Product details — LuxeStudio', loadComponent: () => import('./pages/product-detail.component').then((m) => m.ProductDetailComponent) },
      { path: 'account', canActivate: [authGuard], title: 'My account — LuxeStudio', loadComponent: () => import('./pages/account.component').then((m) => m.AccountComponent) },
      { path: 'wishlist', canActivate: [authGuard], title: 'Favorites — LuxeStudio', loadComponent: () => import('./pages/wishlist.component').then((m) => m.WishlistComponent) },
      { path: 'info/:page', title: 'Help — LuxeStudio', loadComponent: () => import('./pages/info.component').then((m) => m.InfoComponent) },
    ],
  },
  { path: 'login', canActivate: [guestGuard], title: 'Sign in — LuxeStudio', loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], title: 'Create account — LuxeStudio', loadComponent: () => import('./pages/register.component').then((m) => m.RegisterComponent) },
  { path: 'checkout', canActivate: [authGuard], title: 'Secure checkout — LuxeStudio', loadComponent: () => import('./pages/checkout.component').then((m) => m.CheckoutComponent) },
  { path: 'order-confirmation/:id', canActivate: [authGuard], title: 'Order status — LuxeStudio', loadComponent: () => import('./pages/order-confirmation.component').then((m) => m.OrderConfirmationComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', title: 'Admin dashboard — LuxeStudio', loadComponent: () => import('./pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'products', title: 'Manage products — LuxeStudio', loadComponent: () => import('./pages/admin-products.component').then((m) => m.AdminProductsComponent) },
      { path: 'orders', title: 'Manage orders — LuxeStudio', loadComponent: () => import('./pages/admin-orders.component').then((m) => m.AdminOrdersComponent) },
      { path: 'customers', title: 'Customers — LuxeStudio', loadComponent: () => import('./pages/admin-customers.component').then((m) => m.AdminCustomersComponent) },
    ],
  },
  { path: '404', title: 'Page not found — LuxeStudio', loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent) },
  { path: '**', title: 'Page not found — LuxeStudio', loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent) },
];
