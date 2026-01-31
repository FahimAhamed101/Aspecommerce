import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ShopService } from './shop-service';
import { IBrand } from './shared/modules/brand';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  constructor(private shopService: ShopService) {}

  getAllBrands() {
    return this.shopService.getAllProducts(true).pipe(
      map(res => {
        const mapBrands = new Map<number, string>();
        res.data.forEach(p => {
          if (!mapBrands.has(p.productBrandId)) {
            mapBrands.set(p.productBrandId, p.productBrandName);
          }
        });
        const brands: IBrand[] = [];
        mapBrands.forEach((name, id) => brands.push({ id, name }));
        return brands;
      })
    );
  }
}
