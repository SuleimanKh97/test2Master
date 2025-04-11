import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, RouterModule], // Add RouterModule
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush // Optimize change detection
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {

    private observer: IntersectionObserver | undefined;

    // Inject ElementRef to get access to the component's host element
    // Inject ChangeDetectorRef if using OnPush
    constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        // Initialization logic if needed
    }

    ngAfterViewInit(): void {
        this.initializeObserver();
    }

    ngOnDestroy(): void {
        // Disconnect the observer when the component is destroyed
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private initializeObserver(): void {
        const options = {
            root: null, // Use the viewport as the root
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add the 'is-visible' class to the element
                    entry.target.classList.add('is-visible');
                    // Optional: Unobserve the element after it has become visible
                    // observer.unobserve(entry.target);
                    this.cdr.markForCheck(); // Trigger change detection if needed with OnPush
                }
                // Optional: Remove class if element scrolls out of view
                // else { 
                //   entry.target.classList.remove('is-visible');
                // } 
            });
        }, options);

        // Select all elements you want to animate on scroll
        const elementsToObserve = this.elementRef.nativeElement.querySelectorAll(
            '.features-section .feature-card, .how-it-works-section .step-card, .cta-section h2, .cta-section p, .cta-section .btn'
        );
        elementsToObserve.forEach((el: Element) => {
            if (this.observer) {
                this.observer.observe(el);
            }
        });
    }
} 