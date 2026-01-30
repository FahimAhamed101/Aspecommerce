import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Environment } from './environment';
import { IPagination } from './shared/modules/pagination';
import {
  IProductCreate,
  IProductQueryParams,
  IProductResponse,
  IProductUpdate
} from './shared/modules/product';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private baseUrl = `${Environment.baseUrl}/api/products`;

  constructor(private http: HttpClient) {}

  getAll(params: IProductQueryParams = {}) {
    return this.http.get<IPagination<IProductResponse>>(
      this.baseUrl,
      { params: this.buildParams(params) }
    );
  }

  getById(id: number) {
    return this.http.get<IProductResponse>(`${this.baseUrl}/${id}`);
  }

  create(dto: IProductCreate) {
    const formData = new FormData();
    formData.append('Name', dto.name);
    formData.append('Description', dto.description);
    formData.append('Price', String(dto.price));
    formData.append('StockQuantity', String(dto.stockQuantity));
    formData.append('ProductTypeId', String(dto.productTypeId));
    formData.append('ProductBrandId', String(dto.productBrandId));
    formData.append('ImageFile', dto.imageFile);

    return this.http.post<IProductResponse>(this.baseUrl, formData);
  }

  update(dto: IProductUpdate) {
    const formData = new FormData();
    formData.append('ProductId', String(dto.productId));
    formData.append('Name', dto.name);
    formData.append('Description', dto.description);
    formData.append('Price', String(dto.price));
    formData.append('StockQuantity', String(dto.stockQuantity));
    formData.append('ProductTypeId', String(dto.productTypeId));
    formData.append('ProductBrandId', String(dto.productBrandId));
    formData.append('RemoveImage', String(dto.removeImage ?? false));

    if (dto.image) {
      formData.append('Image', dto.image);
    }

    return this.http.put<IProductResponse>(this.baseUrl, formData);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private buildParams(params: IProductQueryParams) {
    let httpParams = new HttpParams();

    if (params.pageIndex !== undefined) httpParams = httpParams.set('pageIndex', params.pageIndex);
    if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.brandId !== undefined) httpParams = httpParams.set('brandId', params.brandId);
    if (params.typeId !== undefined) httpParams = httpParams.set('typeId', params.typeId);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.minAverageRating !== undefined) {
      httpParams = httpParams.set('minAverageRating', params.minAverageRating);
    }

    return httpParams;
  }
}
