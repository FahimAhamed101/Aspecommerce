import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishListService } from './wishlist-service';
import { BasketService } from './basket-service';
import { IWishListItem } from './shared/modules/wishlist';
import { Environment } from './environment';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishListComponent {
  private wishListService = inject(WishListService);
  private basketService = inject(BasketService);

  wishList = this.wishListService.wishList;
  itemCount = this.wishListService.itemCount;
  hasItems = computed(() => (this.wishList()?.items?.length ?? 0) > 0);

  increment(item: IWishListItem) {
    this.wishListService.incrementItem(item.id).subscribe();
  }

  decrement(item: IWishListItem) {
    this.wishListService.decrementItem(item.id).subscribe();
  }

  moveToCart(item: IWishListItem) {
    this.basketService.addItemDto({
      id: item.id,
      productName: item.productName,
      brand: item.brand,
      type: item.type,
      pictureUrl: item.pictureUrl,
      price: item.price,
      quantity: 1,
    }).subscribe();
  }

  clearWishList() {
    this.wishListService.deleteWishList().subscribe();
  }

  toAbsoluteUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleaned = path.startsWith('/') ? path : `/${path}`;
    return `${Environment.baseUrl}${cleaned}`;
  }
}
