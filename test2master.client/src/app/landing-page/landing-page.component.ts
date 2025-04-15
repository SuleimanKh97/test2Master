import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service'; // Fixed casing
import { BlogService } from '../services/blog/blog.service'; // Fixed casing 
import { BlogPostSummaryDTO } from '../interfaces/blog.interface'; // Fixed casing
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, RouterModule], // Add RouterModule
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class LandingPageComponent implements OnInit, OnDestroy, AfterViewInit {

    // --- Properties --- //
    private observer: IntersectionObserver | undefined;
    private authSubscription: Subscription | null = null;
    private blogSubscription: Subscription | null = null;

    // ** Make properties public to be accessible in the template **
    public currentUserRole: string | null = null;
    public latestPosts: BlogPostSummaryDTO[] = [];
    public currentYear = new Date().getFullYear(); // For footer copyright

    // --- Constructor --- //
    constructor(
        private elementRef: ElementRef,
        private authService: AuthService, // Inject AuthService
        private blogService: BlogService, // Inject BlogService
        private cdr: ChangeDetectorRef,
        // Keep Renderer2 if needed by observer logic, otherwise remove
        private renderer: Renderer2
    ) { }

    // --- Lifecycle Hooks --- //
    ngOnInit(): void {
        // Subscribe to user changes
        this.authSubscription = this.authService.currentUser$.subscribe(user => {
            this.currentUserRole = user ? user.role : null;
            console.log('Landing Page: User role updated:', this.currentUserRole);
            this.cdr.markForCheck(); // Trigger change detection
        });

        // Fetch latest blog posts
        this.fetchLatestPosts();
    }

    ngAfterViewInit(): void {
        this.initializeObserver();
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.blogSubscription) {
            this.blogSubscription.unsubscribe();
        }
    }

    // --- Methods --- //
    private fetchLatestPosts(): void {
        this.blogSubscription = this.blogService.getLatestBlogPosts(3).subscribe({
            next: (posts: BlogPostSummaryDTO[]) => {
                this.latestPosts = posts;
                console.log('Landing Page: Fetched posts:', posts);
                this.cdr.markForCheck(); // Trigger change detection
            },
            error: (err: any) => {
                console.error('Landing Page: Error fetching blog posts:', err);
            }
        });
    }

    // Keep existing Intersection Observer setup logic
    private initializeObserver(): void {
        const options = {
            root: null,
            threshold: 0.1,
            rootMargin: "0px"
        };

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add class using Renderer2 for better abstraction (optional)
                    this.renderer.addClass(entry.target, 'is-visible');
                    // entry.target.classList.add('is-visible');
                    this.cdr.markForCheck();
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, options);

        const elementsToObserve = this.elementRef.nativeElement.querySelectorAll(
            '.features-section .feature-card, .how-it-works-section .step-card, .cta-section h2, .cta-section p, .cta-section .btn, .blog-card' // Observe blog cards too
        );
        elementsToObserve.forEach((el: Element) => {
            if (this.observer) {
                this.observer.observe(el);
            }
        });
    }
} 