import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './Product/product-list/product-list.component';
import { ProductDetailsComponent } from './Product/product-details/product-details.component';
import { ContactComponent } from './contact/contact.component';
import { CartComponent } from './cart/cart.component';
import { AuthGuard } from './guard/auth.guard';
import { SellerDashboardComponent } from './seller/seller-dashboard/seller-dashboard.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BuyerDashboardComponent } from './buyer/buyer-dashboard/buyer-dashboard.component';
import { ProfileComponent } from './user/profile/profile.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './user/change-password/change-password.component';
import { OrderHistoryComponent } from './user/order-history/order-history.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SellerProductListComponent } from './seller/seller-products/seller-product-list.component';
import { SellerProductFormComponent } from './seller/seller-products/seller-product-form.component';
import { SellerOrderListComponent } from './seller/seller-orders/seller-order-list.component';
import { AdminUserListComponent } from './admin/admin-users/admin-user-list.component';
import { AdminProductListComponent } from './admin/admin-products/admin-product-list.component';
import { AdminOrderListComponent } from './admin/admin-orders/admin-order-list.component';
import { AdminCategoryListComponent } from './admin/admin-categories/admin-category-list.component';
import { ShopComponent } from './shop/shop.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SimulatePaymentComponent } from './simulate-payment/simulate-payment.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogPostDetailComponent } from './blog/blog-post-detail/blog-post-detail.component';
import { AdminBlogListComponent } from './admin/admin-blog-list/admin-blog-list.component';
import { AdminBlogPostFormComponent } from './admin/admin-blog-post-form/admin-blog-post-form.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'home', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/edit', component: EditProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  {
    path: 'simulate-payment',
    component: SimulatePaymentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'order-confirmation',
    component: OrderHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'blog',
    component: BlogListComponent
  },
  {
    path: 'blog/:id',
    component: BlogPostDetailComponent
  },
  { path: 'buyer-dashboard', component: BuyerDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Buyer'] } },
  { path: 'seller-dashboard', component: SellerDashboardComponent, canActivate: [AuthGuard], data: { roles: ['Seller'] } },
  {
    path: 'seller/products',
    component: SellerProductListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Seller'] }
  },
  {
    path: 'seller/products/add',
    component: SellerProductFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Seller'] }
  },
  {
    path: 'seller/products/edit/:id',
    component: SellerProductFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Seller'] }
  },
  {
    path: 'seller/orders',
    component: SellerOrderListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Seller'] }
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/users',
    component: AdminUserListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/products',
    component: AdminProductListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/orders',
    component: AdminOrderListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/categories',
    component: AdminCategoryListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/blog',
    component: AdminBlogListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/blog/new',
    component: AdminBlogPostFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'admin/blog/edit/:id',
    component: AdminBlogPostFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
