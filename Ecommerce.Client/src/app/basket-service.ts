import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Environment } from './environment';
import { IProduct } from './shared/modules/product';
import { JwtPayload } from './shared/modules/accountUser';
import { IBasketItem, ICustomerBasket } from './shared/modules/basket';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private baseUrl = `${Environment.baseUrl}/api/baskets`;
  private basketIdKey = 'basket_id';

  private basketSignal = signal<ICustomerBasket | null>(null);

  basket = computed(() => this.basketSignal());
  itemCount = computed(() =>
    this.basketSignal()?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0
  );
  total = computed(() =>
    this.basketSignal()?.items?.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0) ?? 0
  );

  constructor() {
    if (this.isBrowser()) {
      this.loadBasket();
    }
  }

  loadBasket(): void {
    const id = this.resolveBasketId();
    this.getBasket(id)
      .pipe(
        tap(basket => this.basketSignal.set(basket)),
        catchError(() => {
          this.basketSignal.set({ id, items: [] });
          return of(null);
        })
      )
      .subscribe();
  }

  getBasket(id: string): Observable<ICustomerBasket> {
    return this.http.get<ICustomerBasket>(`${this.baseUrl}/${id}`);
  }

  updateOrCreate(basket: ICustomerBasket): Observable<ICustomerBasket> {
    return this.http.post<ICustomerBasket>(this.baseUrl, basket).pipe(
      tap(updated => this.basketSignal.set(updated))
    );
  }

  addItem(product: IProduct, quantity = 1): Observable<ICustomerBasket> {
    const id = this.resolveBasketId();
    const dto = this.mapProductToItem(product, quantity);

    return this.http.post<ICustomerBasket>(`${this.baseUrl}/${id}/items`, dto).pipe(
      tap(updated => this.basketSignal.set(updated))
    );
  }

  addItemDto(item: IBasketItem): Observable<ICustomerBasket> {
    const id = this.resolveBasketId();
    return this.http.post<ICustomerBasket>(`${this.baseUrl}/${id}/items`, item).pipe(
      tap(updated => this.basketSignal.set(updated))
    );
  }

  incrementItem(productId: number): Observable<ICustomerBasket> {
    const id = this.resolveBasketId();
    return this.http.post<ICustomerBasket>(`${this.baseUrl}/${id}/items/${productId}/increment`, {}).pipe(
      tap(updated => this.basketSignal.set(updated))
    );
  }

  decrementItem(productId: number): Observable<ICustomerBasket> {
    const id = this.resolveBasketId();
    return this.http.post<ICustomerBasket>(`${this.baseUrl}/${id}/items/${productId}/decrement`, {}).pipe(
      tap(updated => this.basketSignal.set(updated))
    );
  }

  deleteBasket(): Observable<void> {
    const id = this.resolveBasketId();
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.basketSignal.set({ id, items: [] }))
    );
  }

  private mapProductToItem(product: IProduct, quantity: number): IBasketItem {
    return {
      id: product.id,
      productName: product.name,
      brand: product.productBrandName,
      type: product.productTypeName,
      pictureUrl: product.pictureUrl,
      price: product.price,
      quantity,
    };
  }

  private resolveBasketId(): string {
    if (!this.isBrowser()) return 'server';

    const userId = this.getUserIdFromToken();
    if (userId) {
      localStorage.setItem(this.basketIdKey, userId);
      return userId;
    }

    let id = localStorage.getItem(this.basketIdKey);
    if (!id) {
      id = this.generateId();
      localStorage.setItem(this.basketIdKey, id);
    }

    return id;
  }

  private getUserIdFromToken(): string | null {
    if (!this.isBrowser()) return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const token = JSON.parse(userStr)?.token;
      if (!token) return null;
      const payload = jwtDecode<JwtPayload>(token);
      return payload?.nameid ?? null;
    } catch {
      return null;
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `basket_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
