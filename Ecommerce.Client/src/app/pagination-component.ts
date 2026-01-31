import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-component.html',
  styleUrl: './pagination-component.css',
})
export class PaginationComponent {
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  prev(): void {
    if (this.pageIndex <= 1) return;
    this.pageChange.emit(this.pageIndex - 1);
  }

  next(): void {
    if (this.pageIndex >= this.totalPages) return;
    this.pageChange.emit(this.pageIndex + 1);
  }
}
