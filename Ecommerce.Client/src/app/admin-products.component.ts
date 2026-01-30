import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from './products-service';
import { IPagination } from './shared/modules/pagination';
import {
  IProductQueryParams,
  IProductResponse
} from './shared/modules/product';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  private productsService = inject(ProductsService);

  products: IProductResponse[] = [];
  totalItems = 0;
  pageIndex = 1;
  pageSize = 10;
  search = '';
  sort = '';
  brandId?: number;
  typeId?: number;

  isLoading = false;
  actionMessage = '';

  formMode: 'create' | 'edit' = 'create';
  editingId: number | null = null;

  name = '';
  description = '';
  price = 0;
  stockQuantity = 0;
  productTypeId = 0;
  productBrandId = 0;
  removeImage = false;
  imageFile: File | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const params: IProductQueryParams = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.search || undefined,
      sort: this.sort || undefined,
      brandId: this.brandId,
      typeId: this.typeId,
    };

    this.isLoading = true;
    this.productsService.getAll(params).subscribe({
      next: (result: IPagination<IProductResponse>) => {
        this.products = result.data;
        this.totalItems = result.count;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.pageIndex * this.pageSize >= this.totalItems) return;
    this.pageIndex += 1;
    this.loadProducts();
  }

  previousPage(): void {
    if (this.pageIndex === 1) return;
    this.pageIndex -= 1;
    this.loadProducts();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFile = input.files?.[0] ?? null;
  }

  startCreate(): void {
    this.formMode = 'create';
    this.editingId = null;
    this.name = '';
    this.description = '';
    this.price = 0;
    this.stockQuantity = 0;
    this.productTypeId = 0;
    this.productBrandId = 0;
    this.removeImage = false;
    this.imageFile = null;
  }

  startEdit(product: IProductResponse): void {
    this.formMode = 'edit';
    this.editingId = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.stockQuantity = product.quantity;
    this.productTypeId = product.productTypeId;
    this.productBrandId = product.productBrandId;
    this.removeImage = false;
    this.imageFile = null;
  }

  saveProduct(): void {
    if (!this.name || !this.description || !this.productTypeId || !this.productBrandId) return;

    if (this.formMode === 'create') {
      if (!this.imageFile) return;
      this.productsService.create({
        name: this.name,
        description: this.description,
        price: this.price,
        stockQuantity: this.stockQuantity,
        productTypeId: this.productTypeId,
        productBrandId: this.productBrandId,
        imageFile: this.imageFile
      }).subscribe({
        next: () => {
          this.actionMessage = 'Product created.';
          this.startCreate();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Failed to create product', err);
        },
      });
    } else if (this.editingId) {
      this.productsService.update({
        productId: this.editingId,
        name: this.name,
        description: this.description,
        price: this.price,
        stockQuantity: this.stockQuantity,
        productTypeId: this.productTypeId,
        productBrandId: this.productBrandId,
        image: this.imageFile,
        removeImage: this.removeImage
      }).subscribe({
        next: () => {
          this.actionMessage = 'Product updated.';
          this.startCreate();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Failed to update product', err);
        },
      });
    }
  }

  deleteProduct(productId: number): void {
    this.productsService.delete(productId).subscribe({
      next: () => {
        this.actionMessage = 'Product deleted.';
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to delete product', err);
      },
    });
  }
}
