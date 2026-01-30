import { Component, HostListener, OnInit, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AsyncPipe, CommonModule } from '@angular/common';
import { AccountService } from '../../app/account-service';
import { IAccountUser } from '../../app/shared/modules/accountUser';


interface RoleInfo {
  displayName: string;
  icon: string;
  badgeClass: string;
  priority: number;
}

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBar implements OnInit {

  private accountService = inject(AccountService);



  isLoggedIn = computed(() => this.accountService.isLoggedIn());
  currentUser = computed(() => this.accountService.user());
  sections = ['home', 'shop', 'reviews', 'contact'];
  activeSection: string = '';

  // Role configuration
  private roleConfig: Record<string, RoleInfo> = {
    'superadmin': {
      displayName: 'Super Admin',
      icon: 'fa-crown',
      badgeClass: 'badge-superadmin',
      priority: 100
    },
    'admin': {
      displayName: 'Admin',
      icon: 'fa-user-shield',
      badgeClass: 'badge-admin',
      priority: 90
    },
    'moderator': {
      displayName: 'Moderator',
      icon: 'fa-user-check',
      badgeClass: 'badge-moderator',
      priority: 80
    },
    'editor': {
      displayName: 'Editor',
      icon: 'fa-edit',
      badgeClass: 'badge-editor',
      priority: 70
    },
    'customer': {
      displayName: 'Customer',
      icon: 'fa-user',
      badgeClass: 'badge-customer',
      priority: 10
    },
    'vip': {
      displayName: 'VIP',
      icon: 'fa-star',
      badgeClass: 'badge-vip',
      priority: 60
    },
    'premium': {
      displayName: 'Premium',
      icon: 'fa-gem',
      badgeClass: 'badge-premium',
      priority: 50
    }
  };

  constructor() {
  }

  ngOnInit(): void {
    this.accountService.loadCurrentUser();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      const link = document.getElementById(`${sectionId}Link`);

      if (section && link) {
        const rect = section.getBoundingClientRect();
        const inView = rect.top < window.innerHeight / 2 && rect.bottom > 100;

        if (inView) {
          link.classList.add('active');
          this.activeSection = sectionId;
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  getAvatarUrl(user: IAccountUser | null): string {
    if (!user) return 'default-avatar.png';
    if (user.profilePicture) return user.profilePicture;

    return user.gender === 'Male' ? 'default-male.png' : 'default-female.png';
  }

  setDefaultAvatar(event: Event, gender?: 'Male' | 'Female') {
    const img = event.target as HTMLImageElement;
    img.src = gender === 'Male' ? 'https://picsum.photos/60/60?random=1' : 'https://picsum.photos/60/60?random=1';
  }

  // Role check methods
  hasRole(roleName: string): boolean {
    const user = this.currentUser();
    if (!user?.roles) return false;

    const roleLower = roleName.toLowerCase();
    return user.roles.some(role =>
      role.toLowerCase() === roleLower
    );
  }

  hasAdminRole(): boolean {
    const user = this.currentUser();
    if (!user?.roles) return false;

    return user.roles.some(role => {
      const roleLower = role.toLowerCase();
      return roleLower === 'admin' ||
             roleLower === 'superadmin' ||
             roleLower === 'moderator' ||
             roleLower.includes('admin');
    });
  }

  hasSuperAdminRole(): boolean {
    return this.hasRole('superadmin');
  }

  hasCustomerRole(): boolean {
    return this.hasRole('customer');
  }

  hasEditorRole(): boolean {
    return this.hasRole('editor');
  }

  hasModeratorRole(): boolean {
    return this.hasRole('moderator');
  }

  // Get primary role (highest priority)
  getPrimaryRole(): string | null {
    const user = this.currentUser();
    if (!user?.roles || user.roles.length === 0) return null;

    let highestPriority = -1;
    let primaryRole: string | null = null;

    user.roles.forEach(role => {
      const roleLower = role.toLowerCase();
      const roleConfig = this.roleConfig[roleLower];

      if (roleConfig && roleConfig.priority > highestPriority) {
        highestPriority = roleConfig.priority;
        primaryRole = role;
      }
    });

    return primaryRole || user.roles[0];
  }

  // Get all roles sorted by priority
  getSortedRoles(): string[] {
    const user = this.currentUser();
    if (!user?.roles) return [];

    return [...user.roles].sort((a, b) => {
      const aConfig = this.roleConfig[a.toLowerCase()];
      const bConfig = this.roleConfig[b.toLowerCase()];

      const aPriority = aConfig?.priority || 0;
      const bPriority = bConfig?.priority || 0;

      return bPriority - aPriority; // Descending order
    });
  }

  // Role display helpers
  getRoleDisplayName(role: string): string {
    const roleConfig = this.roleConfig[role.toLowerCase()];
    return roleConfig?.displayName || role;
  }

  getRoleIcon(role: string): string {
    const roleConfig = this.roleConfig[role.toLowerCase()];
    return roleConfig?.icon || 'fa-user';
  }

  getRoleBadgeClass(role: string): string {
    const roleConfig = this.roleConfig[role.toLowerCase()];
    return roleConfig?.badgeClass || 'badge-default';
  }

  // Check if user has any admin role (for showing/hiding cart/wishlist)
  hasAnyAdminRole(): boolean {
    const adminRoles = ['superadmin', 'admin', 'moderator'];
    const user = this.currentUser();

    if (!user?.roles) return false;

    return user.roles.some(role =>
      adminRoles.includes(role.toLowerCase())
    );
  }

  logout() {
    console.log('Logout called');
    this.accountService.logout();
  }
}
