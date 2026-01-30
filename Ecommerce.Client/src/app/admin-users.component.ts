import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilesService } from './profiles-service';
import { IProfileResponse, IUserSpecParams } from './shared/modules/profile';
import { IPagination } from './shared/modules/pagination';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  private profilesService = inject(ProfilesService);

  users: IProfileResponse[] = [];
  totalItems = 0;
  pageIndex = 1;
  pageSize = 10;
  search = '';
  role = '';
  sort = '';

  isLoading = false;
  lastActionMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: IUserSpecParams = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      search: this.search || undefined,
      role: this.role || undefined,
      sort: this.sort || undefined,
    };

    this.isLoading = true;
    this.profilesService.getAllUsers(params).subscribe({
      next: (result: IPagination<IProfileResponse>) => {
        this.users = result.data;
        this.totalItems = result.count;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.pageIndex * this.pageSize >= this.totalItems) return;
    this.pageIndex += 1;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.pageIndex === 1) return;
    this.pageIndex -= 1;
    this.loadUsers();
  }

  lockUser(userId: string): void {
    this.profilesService.lockUser(userId).subscribe({
      next: () => {
        this.lastActionMessage = 'User locked for 1 month.';
      },
      error: (err) => {
        console.error('Failed to lock user', err);
      },
    });
  }

  unlockUser(userId: string): void {
    this.profilesService.unlockUser(userId).subscribe({
      next: () => {
        this.lastActionMessage = 'User unlocked.';
      },
      error: (err) => {
        console.error('Failed to unlock user', err);
      },
    });
  }
}
