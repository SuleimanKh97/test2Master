import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
// ... other imports

export const routes: Routes = [
    { path: '', component: LandingPageComponent, pathMatch: 'full' },
    // ... other routes (login, signup, shop, cart, etc.)

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


    // ... admin routes
    // ... user routes (profile, orders)
    // ... seller routes

    { path: '**', redirectTo: '' } // Wildcard route for 404 (redirect to landing)
]; 