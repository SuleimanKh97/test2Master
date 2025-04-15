import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ProductService, ShopProductDTO, CategoryDTO } from '../services/product/product.service';
import { CartService } from '../services/cart/cart.service';
import { Router } from '@angular/router';
import { Observable, EMPTY, Subject, Subscription, timer } from 'rxjs';
import { catchError, tap, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Product } from '../Models/product.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Declare the webkitSpeechRecognition interface if it doesn't exist
declare var webkitSpeechRecognition: any;

@Component({
    selector: 'app-shop',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, OnDestroy {

    products: ShopProductDTO[] = [];
    categories$: Observable<CategoryDTO[]> | undefined;
    errorMessage: string | null = null;
    isProductsLoading = true;
    isCategoriesLoading = true;

    // --- Filter Properties --- 
    selectedCategoryId: number | null = null;
    minPrice: number | null = null;
    maxPrice: number | null = null;
    searchQuery: string = '';

    // --- Voice Search Properties --- 
    isVoiceSearchSupported: boolean = true;
    isListening: boolean = false;
    private recognition: any = null;

    // --- RxJS Subjects --- 
    private searchTrigger = new Subject<string>();
    private searchSubscription: Subscription | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) {
        this.checkVoiceSearchSupport();
    }

    ngOnInit(): void {
        console.log('ShopComponent: Initializing...');
        this.loadCategories();
        this.setupSearchDebounce();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.searchSubscription?.unsubscribe();
        if (this.recognition) {
            this.recognition.abort();
        }
    }

    checkVoiceSearchSupport(): void {
        // Check for standard SpeechRecognition or prefixed version
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            this.isVoiceSearchSupported = false;
            console.warn('ShopComponent: Voice search not supported by this browser.');
        } else {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false; // Process single utterance
            this.recognition.lang = 'ar-SA'; // Set language (adjust as needed)
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voice Recognition Result:', transcript);
                // Run state updates within NgZone to ensure change detection
                this.ngZone.run(() => {
                    this.searchQuery = transcript;
                    this.isListening = false;
                    this.onSearchChange(); // Trigger search based on voice input
                    this.cdr.detectChanges(); // Manually trigger change detection
                });
            };

            this.recognition.onerror = (event: any) => {
                console.error('Voice Recognition Error:', event.error);
                this.ngZone.run(() => {
                    this.isListening = false;
                    this.errorMessage = `خطأ في التعرف على الصوت: ${event.error}`;
                    this.cdr.detectChanges();
                });
            };

            this.recognition.onend = () => {
                this.ngZone.run(() => {
                    this.isListening = false;
                    console.log('Voice Recognition Ended.');
                    this.cdr.detectChanges();
                });
            };
        }
    }

    loadCategories(): void {
        this.isCategoriesLoading = true;
        this.categories$ = this.productService.getCategories().pipe(
            tap(categories => {
                console.log('ShopComponent: Categories loaded', categories);
                this.isCategoriesLoading = false;
                this.loadProducts();
            }),
            catchError(err => {
                console.error('ShopComponent: Error loading categories', err);
                this.errorMessage = 'Failed to load filter categories.';
                this.isCategoriesLoading = false;
                this.isProductsLoading = false;
                return EMPTY;
            }),
            takeUntil(this.destroy$)
        );
    }

    loadProducts(): void {
        this.isProductsLoading = true;
        this.errorMessage = null;
        const currentFilters = {
            categoryId: this.selectedCategoryId,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            searchQuery: this.searchQuery
        };
        console.log('ShopComponent: Loading products with filters:', currentFilters);

        this.productService.getShopProducts(
            this.selectedCategoryId ?? undefined,
            this.minPrice ?? undefined,
            this.maxPrice ?? undefined,
            this.searchQuery
        ).pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (fetchedProducts) => {
                    console.log('ShopComponent: Products received:', fetchedProducts);
                    this.products = fetchedProducts;
                    this.isProductsLoading = false;
                },
                error: (err) => {
                    console.error('ShopComponent: Error loading products', err);
                    this.errorMessage = `Failed to load products: ${err.message || 'Unknown error'}`;
                    this.isProductsLoading = false;
                }
            });
    }

    setupSearchDebounce(): void {
        this.searchSubscription = this.searchTrigger.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            tap(query => console.log('ShopComponent: Search Trigger AFTER debounce/distinct:', query)),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.loadProducts();
        });
    }

    applyFilters(): void {
        this.loadProducts();
    }

    onSearchChange(): void {
        this.searchTrigger.next(this.searchQuery);
    }

    startVoiceSearch(): void {
        if (!this.isVoiceSearchSupported || !this.recognition) {
            console.error("Voice search is not supported or not initialized.");
            return;
        }
        if (this.isListening) {
            this.recognition.stop(); // Stop if already listening
            return;
        }
        try {
            this.isListening = true;
            this.errorMessage = null; // Clear previous errors
            console.log("Starting voice recognition...");
            this.recognition.start();
            this.cdr.detectChanges(); // Update UI state
        } catch (error) {
            console.error("Error starting voice recognition:", error);
            this.isListening = false;
            this.errorMessage = "لم يتمكن المتصفح من بدء التعرف على الصوت.";
            this.cdr.detectChanges();
        }
    }

    resetFilters(): void {
        this.selectedCategoryId = null;
        this.minPrice = null;
        this.maxPrice = null;
        this.searchQuery = '';
        this.loadProducts();
    }

    addToCart(productDto: ShopProductDTO): void {
        console.log('Adding to cart DTO:', productDto);
        this.errorMessage = null;

        const productToAdd: Product = {
            id: productDto.id,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            imageUrl: productDto.img,
            originalPrice: productDto.price,
            category: 'Unknown'
        };

        this.cartService.addToCart(productToAdd).subscribe({
            next: (updatedCart) => {
                console.log('Successfully added to cart via service');
                alert(`تمت إضافة '${productDto.name}' إلى السلة بنجاح!`);
            },
            error: (err) => {
                console.error('Error adding item via service:', err);
                this.errorMessage = err.message || 'فشل في إضافة المنتج للسلة.';
                alert(`خطأ: ${this.errorMessage}`);
            }
        });
    }

    buyNow(productDto: ShopProductDTO): void {
        console.log('Buying now DTO:', productDto);
        this.errorMessage = null;

        const productToAdd: Product = {
            id: productDto.id,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            imageUrl: productDto.img,
            originalPrice: productDto.price,
            category: 'Unknown'
        };

        this.cartService.addToCart(productToAdd).subscribe({
            next: () => {
                console.log('Added to cart for Buy Now, navigating to checkout...');
                this.router.navigate(['/checkout']);
            },
            error: (err) => {
                console.error('Error adding item for Buy Now:', err);
                this.errorMessage = err.message || 'فشل في إضافة المنتج للسلة قبل الانتقال للدفع.';
                alert(`خطأ: ${this.errorMessage}`);
            }
        });
    }

    viewDetails(productId: number): void {
        console.log('Viewing details for product ID:', productId);
        this.router.navigate(['/product', productId]); // Adjust route if needed
    }
} 