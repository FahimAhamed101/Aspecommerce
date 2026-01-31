import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProduct } from './shared/modules/product';
import { Environment } from './environment';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css',
})
export class ProductItemComponent {
  @Input() product!: IProduct;

  imageUrl = '';

  ngOnChanges(): void {
    if (!this.product) return;
    this.imageUrl = this.toAbsoluteUrl(this.product.pictureUrl);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://picsum.photos/400/300?random=1';
  }

  private toAbsoluteUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleaned = path.startsWith('/') ? path : `/${path}`;
    return `${Environment.baseUrl}${cleaned}`;
  }
}
