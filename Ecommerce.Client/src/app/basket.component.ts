import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BasketService } from './basket-service';
import { IBasketItem } from './shared/modules/basket';
import { Environment } from './environment';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.css',
})
export class BasketComponent {
  private basketService = inject(BasketService);

  basket = this.basketService.basket;
  total = this.basketService.total;
  itemCount = this.basketService.itemCount;
  hasItems = computed(() => (this.basket()?.items?.length ?? 0) > 0);

  increment(item: IBasketItem) {
    this.basketService.incrementItem(item.id).subscribe();
  }

  decrement(item: IBasketItem) {
    this.basketService.decrementItem(item.id).subscribe();
  }

  clearBasket() {
    this.basketService.deleteBasket().subscribe();
  }

  toAbsoluteUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleaned = path.startsWith('/') ? path : `/${path}`;
    return `${Environment.baseUrl}${cleaned}`;
  }
}
