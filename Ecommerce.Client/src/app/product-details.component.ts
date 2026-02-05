import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from './products-service';
import { IProductResponse } from './shared/modules/product';
import { Environment } from './environment';
import { BasketService } from './basket-service';
import { WishListService } from './wishlist-service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private basketService = inject(BasketService);
  private wishListService = inject(WishListService);

  product: IProductResponse | null = null;
  imageUrl = '';
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Invalid product id.';
      return;
    }

    this.isLoading = true;
    this.productsService.getById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.imageUrl = this.toAbsoluteUrl(product.pictureUrl);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load product', err);
        this.errorMessage = 'Failed to load product details.';
        this.isLoading = false;
      },
    });
  }

  addToCart(): void {
    if (!this.product) return;
    this.basketService.addItem(this.product).subscribe();
  }

  addToWishList(): void {
    if (!this.product) return;
    this.wishListService.addItem(this.product).subscribe();
  }

  private toAbsoluteUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleaned = path.startsWith('/') ? path : `/${path}`;
    return `${Environment.baseUrl}${cleaned}`;
  }
}
