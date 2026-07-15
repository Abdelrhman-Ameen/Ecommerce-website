import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';
import { StoreLayoutComponent } from './shared/store-layout.component';
import { AdminLayoutComponent } from './shared/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', title: 'Wear Your Confidence — Vellora', loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent) },
      { path: 'products', title: 'Products — Vellora', loadComponent: () => import('./pages/catalog.component').then((m) => m.CatalogComponent) },
      { path: 'products/:id', title: 'Product details — Vellora', loadComponent: () => import('./pages/product-detail.component').then((m) => m.ProductDetailComponent) },
      { path: 'account', canActivate: [authGuard], title: 'My account — Vellora', loadComponent: () => import('./pages/account.component').then((m) => m.AccountComponent) },
      { path: 'wishlist', canActivate: [authGuard], title: 'Favorites — Vellora', loadComponent: () => import('./pages/wishlist.component').then((m) => m.WishlistComponent) },
      { path: 'info/:page', title: 'Help — Vellora', loadComponent: () => import('./pages/info.component').then((m) => m.InfoComponent) },
      { path: 'checkout', canActivate: [authGuard], title: 'Secure checkout — Vellora', loadComponent: () => import('./pages/checkout.component').then((m) => m.CheckoutComponent) },
      { path: 'order-confirmation/:id', canActivate: [authGuard], title: 'Order status — Vellora', loadComponent: () => import('./pages/order-confirmation.component').then((m) => m.OrderConfirmationComponent) },
    ],
  },
  { path: 'login', canActivate: [guestGuard], title: 'Sign in — Vellora', loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], title: 'Create account — Vellora', loadComponent: () => import('./pages/register.component').then((m) => m.RegisterComponent) },
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', title: 'Admin dashboard — Vellora', loadComponent: () => import('./pages/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'homepage', title: 'Homepage editor — Vellora', loadComponent: () => import('./pages/admin-homepage.component').then((m) => m.AdminHomepageComponent) },
      { path: 'products', title: 'Manage products — Vellora', loadComponent: () => import('./pages/admin-products.component').then((m) => m.AdminProductsComponent) },
      { path: 'orders', title: 'Manage orders — Vellora', loadComponent: () => import('./pages/admin-orders.component').then((m) => m.AdminOrdersComponent) },
      { path: 'offline-sales', title: 'Store sales & debts — Vellora', loadComponent: () => import('./pages/admin-offline-sales.component').then((m) => m.AdminOfflineSalesComponent) },
      { path: 'customers', title: 'Customers — Vellora', loadComponent: () => import('./pages/admin-customers.component').then((m) => m.AdminCustomersComponent) },
    ],
  },
  { path: '404', title: 'Page not found — Vellora', loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent) },
  { path: '**', title: 'Page not found — Vellora', loadComponent: () => import('./pages/not-found.component').then((m) => m.NotFoundComponent) },
];
