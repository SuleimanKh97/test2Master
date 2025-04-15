import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './Shared/header/header.component';
import { FooterComponent } from './Shared/footer/footer.component';
import { ProductListComponent } from './Product/product-list/product-list.component';
import { ProductDetailsComponent } from './Product/product-details/product-details.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './user/profile/profile.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { BuyerDashboardComponent } from './buyer/buyer-dashboard/buyer-dashboard.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './user/change-password/change-password.component';
import { OrderHistoryComponent } from './user/order-history/order-history.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { AdminBlogListComponent } from './admin/admin-blog-list/admin-blog-list.component';
import { AdminBlogPostFormComponent } from './admin/admin-blog-post-form/admin-blog-post-form.component';


@NgModule({
  declarations: [
    HomeComponent,
    ProductListComponent,
    ProductDetailsComponent,
    ContactComponent,
    LoginComponent,
    ProfileComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
    }),
    AppRoutingModule, FormsModule,
    AppComponent,
    HeaderComponent,
    FooterComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
