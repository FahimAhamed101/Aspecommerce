import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ShopService } from './shop-service';
import { IType } from './shared/modules/type';

@Injectable({
  providedIn: 'root',
})
export class TypeService {
  constructor(private shopService: ShopService) {}

  getAllTypes() {
    return this.shopService.getAllProducts(true).pipe(
      map(res => {
        const mapTypes = new Map<number, string>();
        res.data.forEach(p => {
          if (!mapTypes.has(p.productTypeId)) {
            mapTypes.set(p.productTypeId, p.productTypeName);
          }
        });
        const types: IType[] = [];
        mapTypes.forEach((name, id) => types.push({ id, name }));
        return types;
      })
    );
  }
}
