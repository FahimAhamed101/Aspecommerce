import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IProduct } from './shared/modules/product';
import { IPagination } from './shared/modules/pagination';
import { ShopService } from './shop-service';
import { ProductItemComponent } from './product-item.component';
import { IBrand } from './shared/modules/brand';
import { IType } from './shared/modules/type';
import { BrandService } from './brand-service';
import { TypeService } from './type-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShopParams } from './shared/modules/ShopParams';
import { PaginationComponent } from './pagination-component';

declare var bootstrap: any;

@Component({
  selector: 'app-shop-component',
  standalone: true,
  imports: [CommonModule, ProductItemComponent, FormsModule, PaginationComponent],
  templateUrl: './shop-component.html',
  styleUrl: './shop-component.scss',
})
export class ShopComponent implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  products: IProduct[] = [];
  brands: IBrand[] = [];
  types: IType[] = [];
  totalCount = 0;
  showFilters = false;
  isLoading = true;
  shopParams!: ShopParams;

  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low to High', value: 'PriceAsc' },
    { name: 'Price: High to Low', value: 'PriceDesc' }
  ];

  constructor(
    private _shopService: ShopService,
    private _brandService: BrandService,
    private _typeService: TypeService
  ) {
    this.shopParams = this._shopService.getShopParams();
  }

  ngOnInit(): void {
    this.getAllBrands();
    this.getAllTypes();
    this.getAllProducts(true);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map((el: any) => new bootstrap.Dropdown(el));
    this.observeProductItems();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  getAllProducts(useCache = false) {
    this.isLoading = true;

    this._shopService.getAllProducts(useCache).subscribe({
      next: (res: IPagination<IProduct>) => {
        this.products = res.data;
        this.totalCount = res.count;
        this.isLoading = false;

        setTimeout(() => this.observeProductItems(), 100);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  getAllBrands() {
    this._brandService.getAllBrands().subscribe({
      next: res => this.brands = res
    });
  }

  getAllTypes() {
    this._typeService.getAllTypes().subscribe({
      next: res => this.types = res
    });
  }

  onBrandSelected(brandId: number) {
    const params = this._shopService.getShopParams();

    params.brandId = (params.brandId === brandId) ? undefined : brandId;
    params.pageIndex = 1;

    this._shopService.setShopParams(params);
    this.getAllProducts();
  }

  onTypeSelected(typeId: number) {
    const params = this._shopService.getShopParams();

    params.typeId = (params.typeId === typeId) ? undefined : typeId;
    params.pageIndex = 1;

    this._shopService.setShopParams(params);
    this.getAllProducts();
  }

  onSortSelected(sort: string) {
    const params = this._shopService.getShopParams();

    params.sort = sort;
    params.pageIndex = 1;

    this._shopService.setShopParams(params);
    this.getAllProducts();
  }

  onSearch() {
    const params = this._shopService.getShopParams();
    params.pageIndex = 1;

    this._shopService.setShopParams(params);
    this.getAllProducts();
  }

  resetSearch() {
    const params = this._shopService.getShopParams();
    params.search = '';
    params.pageIndex = 1;

    this._shopService.setShopParams(params);
    this.getAllProducts();
  }

  resetFilters() {
    this.shopParams = new ShopParams();
    this._shopService.setShopParams(this.shopParams);
    this.getAllProducts();
  }

  onPageChanged(page: number) {
    const params = this._shopService.getShopParams();
    params.pageIndex = page;

    this._shopService.setShopParams(params);
    this.getAllProducts(true);
  }

  private observeProductItems() {
    if (!isPlatformBrowser(this.platformId)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const existingItems = document.querySelectorAll('.fade-item');
    existingItems.forEach(item => item.classList.remove('fade-in'));

    setTimeout(() => {
      const productItems = document.querySelectorAll('.fade-item');
      productItems.forEach(item => observer.observe(item));
    }, 50);
  }
}
