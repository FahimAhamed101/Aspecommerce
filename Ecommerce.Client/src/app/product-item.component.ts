import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProduct } from './shared/modules/product';
import { Environment } from './environment';
import { BasketService } from './basket-service';
import { WishListService } from './wishlist-service';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css',
})
export class ProductItemComponent {
  @Input() product!: IProduct;

  imageUrl = '';
  private basketService = inject(BasketService);
  private wishListService = inject(WishListService);

  ngOnChanges(): void {
    if (!this.product) return;
    this.imageUrl = this.toAbsoluteUrl(this.product.pictureUrl);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://picsum.photos/400/300?random=1';
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.product) return;
    this.basketService.addItem(this.product).subscribe();
  }

  addToWishList(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
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
