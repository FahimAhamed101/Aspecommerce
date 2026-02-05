import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Environment } from './environment';
import { IProduct } from './shared/modules/product';
import { JwtPayload } from './shared/modules/accountUser';
import { ICustomerWishList, IWishListItem } from './shared/modules/wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishListService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private baseUrl = `${Environment.baseUrl}/api/wishlists`;
  private wishListIdKey = 'wishlist_id';

  private wishListSignal = signal<ICustomerWishList | null>(null);

  wishList = computed(() => this.wishListSignal());
  itemCount = computed(() =>
    this.wishListSignal()?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0
  );

  constructor() {
    if (this.isBrowser()) {
      this.loadWishList();
    }
  }

  loadWishList(): void {
    const id = this.resolveWishListId();
    this.getWishList(id)
      .pipe(
        tap(list => this.wishListSignal.set(list)),
        catchError(() => {
          this.wishListSignal.set({ id, items: [] });
          return of(null);
        })
      )
      .subscribe();
  }

  getWishList(id: string): Observable<ICustomerWishList> {
    return this.http.get<ICustomerWishList>(`${this.baseUrl}/${id}`);
  }

  updateOrCreate(wishList: ICustomerWishList): Observable<ICustomerWishList> {
    return this.http.post<ICustomerWishList>(this.baseUrl, wishList).pipe(
      tap(updated => this.wishListSignal.set(updated))
    );
  }

  addItem(product: IProduct, quantity = 1): Observable<ICustomerWishList> {
    const id = this.resolveWishListId();
    const dto = this.mapProductToItem(product, quantity);

    return this.http.post<ICustomerWishList>(`${this.baseUrl}/${id}/items`, dto).pipe(
      tap(updated => this.wishListSignal.set(updated))
    );
  }

  incrementItem(productId: number): Observable<ICustomerWishList> {
    const id = this.resolveWishListId();
    return this.http.post<ICustomerWishList>(`${this.baseUrl}/${id}/items/${productId}/increment`, {}).pipe(
      tap(updated => this.wishListSignal.set(updated))
    );
  }

  decrementItem(productId: number): Observable<ICustomerWishList> {
    const id = this.resolveWishListId();
    return this.http.post<ICustomerWishList>(`${this.baseUrl}/${id}/items/${productId}/decrement`, {}).pipe(
      tap(updated => this.wishListSignal.set(updated))
    );
  }

  deleteWishList(): Observable<void> {
    const id = this.resolveWishListId();
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.wishListSignal.set({ id, items: [] }))
    );
  }

  private mapProductToItem(product: IProduct, quantity: number): IWishListItem {
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

  private resolveWishListId(): string {
    if (!this.isBrowser()) return 'server';

    const userId = this.getUserIdFromToken();
    if (userId) {
      localStorage.setItem(this.wishListIdKey, userId);
      return userId;
    }

    let id = localStorage.getItem(this.wishListIdKey);
    if (!id) {
      id = this.generateId();
      localStorage.setItem(this.wishListIdKey, id);
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
    return `wishlist_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
