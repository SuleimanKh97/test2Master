import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
// ... other imports
import { AuthGuard } from './Guards/auth.guard'; // Assuming AuthGuard exists and protects routes
import { RoleGuard } from './Guards/role.guard'; // Assuming RoleGuard exists

export const routes: Routes = [
    { path: '', component: LandingPageComponent, pathMatch: 'full' },
    // ... other routes (login, signup, shop, cart, etc.)
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'signup', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
    { path: 'shop', loadComponent: () => import('./Product/product-list/product-list.component').then(m => m.ProductListComponent) },
    { path: 'product/:id', loadComponent: () => import('./Product/product-details/product-details.component').then(m => m.ProductDetailsComponent) },
    { path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent) },
    { path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [AuthGuard] }, // Example protection
    { path: 'contact', loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent) },

    // Blog Routes
    {
        path: 'blog/:id',
        loadComponent: () => import('./blog/blog-post-detail/blog-post-detail.component').then(m => m.BlogPostDetailComponent),
    },
    {
        path: 'blog',
        loadComponent: () => import('./blog/blog-list/blog-list.component').then(m => m.BlogListComponent),
        pathMatch: 'full'
    },

    // --- User/Profile Routes ---
    { path: 'profile', loadComponent: () => import('./user/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
    { path: 'edit-profile', loadComponent: () => import('./user/edit-profile/edit-profile.component').then(m => m.EditProfileComponent), canActivate: [AuthGuard] },
    { path: 'change-password', loadComponent: () => import('./user/change-password/change-password.component').then(m => m.ChangePasswordComponent), canActivate: [AuthGuard] },
    { path: 'order-history', loadComponent: () => import('./user/order-history/order-history.component').then(m => m.OrderHistoryComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Buyer' } },
    { path: 'buyer-dashboard', loadComponent: () => import('./buyer/buyer-dashboard/buyer-dashboard.component').then(m => m.BuyerDashboardComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Buyer' } },

    // --- Seller Routes ---
    { path: 'seller-dashboard', loadComponent: () => import('./seller/seller-dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Seller' } },
    { path: 'seller/products', loadComponent: () => import('./seller/seller-products/seller-product-list/seller-product-list.component').then(m => m.SellerProductListComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Seller' } },
    { path: 'seller/products/new', loadComponent: () => import('./seller/seller-products/seller-product-form/seller-product-form.component').then(m => m.SellerProductFormComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Seller' } },
    { path: 'seller/products/edit/:id', loadComponent: () => import('./seller/seller-products/seller-product-form/seller-product-form.component').then(m => m.SellerProductFormComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Seller' } },
    { path: 'seller/orders', loadComponent: () => import('./seller/seller-orders/seller-order-list/seller-order-list.component').then(m => m.SellerOrderListComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Seller' } },

    // --- Admin Routes ---
    { path: 'admin-dashboard', loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' } },
    // ... other specific admin routes (users, categories, orders etc.)
    { path: 'admin/users', loadComponent: () => import('./admin/admin-users/admin-user-list/admin-user-list.component').then(m => m.AdminUserListComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' } },
    { path: 'admin/categories', loadComponent: () => import('./admin/admin-categories/admin-category-list/admin-category-list.component').then(m => m.AdminCategoryListComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' } },
    { path: 'admin/products', loadComponent: () => import('./admin/admin-products/admin-product-list/admin-product-list.component').then(m => m.AdminProductListComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' } },
    { path: 'admin/orders', loadComponent: () => import('./admin/admin-orders/admin-order-list/admin-order-list.component').then(m => m.AdminOrderListComponent), canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' } },

    // Admin Blog Management Routes
    {
        path: 'admin/blog',
        loadComponent: () => import('./admin/admin-blog-list/admin-blog-list.component').then(m => m.AdminBlogListComponent),
        canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' }
    },
    {
        path: 'admin/blog/new',
        loadComponent: () => import('./admin/admin-blog-post-form/admin-blog-post-form.component').then(m => m.AdminBlogPostFormComponent),
        canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' }
    },
    {
        path: 'admin/blog/edit/:id',
        loadComponent: () => import('./admin/admin-blog-post-form/admin-blog-post-form.component').then(m => m.AdminBlogPostFormComponent),
        canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'Admin' }
    },


    { path: '**', redirectTo: '' } // Wildcard route for 404 (redirect to landing)
]; 