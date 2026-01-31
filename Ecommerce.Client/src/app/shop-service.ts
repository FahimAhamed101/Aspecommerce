import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';
import { Environment } from './environment';
import { IPagination } from './shared/modules/pagination';
import { IProduct } from './shared/modules/product';
import { ShopParams } from './shared/modules/ShopParams';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private baseUrl = `${Environment.baseUrl}/api/products`;
  private shopParams = new ShopParams();
  private productsCache = new Map<string, IPagination<IProduct>>();

  constructor(private http: HttpClient) {}

  getShopParams(): ShopParams {
    return this.shopParams;
  }

  setShopParams(params: ShopParams): void {
    this.shopParams = params;
  }

  getAllProducts(useCache = false): Observable<IPagination<IProduct>> {
    const key = JSON.stringify(this.shopParams);
    if (useCache && this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    let params = new HttpParams()
      .set('pageIndex', this.shopParams.pageIndex)
      .set('pageSize', this.shopParams.pageSize);

    if (this.shopParams.brandId) params = params.set('brandId', this.shopParams.brandId);
    if (this.shopParams.typeId) params = params.set('typeId', this.shopParams.typeId);
    if (this.shopParams.sort) params = params.set('sort', this.shopParams.sort);
    if (this.shopParams.search) params = params.set('search', this.shopParams.search);

    return this.http.get<IPagination<IProduct>>(this.baseUrl, { params }).pipe(
      map(res => res),
      tap(res => this.productsCache.set(key, res))
    );
  }
}
