import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from './roles-service';
import {
  IRoleDto,
  IRolePermissionsDto,
  IUserRolesDto,
  IPermissionCheckboxDto,
  IRoleToCreateDto
} from './shared/modules/role';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.css',
})
export class AdminRolesComponent implements OnInit {
  private rolesService = inject(RolesService);

  roles: IRoleDto[] = [];
  newRoleName = '';
  isLoadingRoles = false;
  actionMessage = '';

  selectedRoleId = '';
  rolePermissions: IRolePermissionsDto | null = null;
  isLoadingPermissions = false;
  isSavingPermissions = false;

  manageUserId = '';
  userRoles: IUserRolesDto | null = null;
  isLoadingUserRoles = false;
  isSavingUserRoles = false;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.rolesService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoadingRoles = false;
      },
      error: (err) => {
        console.error('Failed to load roles', err);
        this.isLoadingRoles = false;
      },
    });
  }

  createRole(): void {
    const name = this.newRoleName.trim();
    if (!name) return;

    const dto: IRoleToCreateDto = { name };
    this.rolesService.createRole(dto).subscribe({
      next: () => {
        this.newRoleName = '';
        this.actionMessage = 'Role created.';
        this.loadRoles();
      },
      error: (err) => {
        console.error('Failed to create role', err);
      },
    });
  }

  deleteRole(roleId: string): void {
    this.rolesService.deleteRole(roleId).subscribe({
      next: () => {
        this.actionMessage = 'Role deleted.';
        this.loadRoles();
      },
      error: (err) => {
        console.error('Failed to delete role', err);
      },
    });
  }

  loadPermissions(): void {
    if (!this.selectedRoleId) return;
    this.isLoadingPermissions = true;
    this.rolesService.getManagePermissions(this.selectedRoleId).subscribe({
      next: (result) => {
        this.rolePermissions = result;
        this.isLoadingPermissions = false;
      },
      error: (err) => {
        console.error('Failed to load permissions', err);
        this.isLoadingPermissions = false;
      },
    });
  }

  togglePermission(permission: IPermissionCheckboxDto): void {
    permission.isSelected = !permission.isSelected;
  }

  savePermissions(): void {
    if (!this.selectedRoleId || !this.rolePermissions) return;
    this.isSavingPermissions = true;
    this.rolesService.updatePermissions(
      this.selectedRoleId,
      this.rolePermissions.permissions
    ).subscribe({
      next: (updated) => {
        this.rolePermissions = updated;
        this.actionMessage = 'Permissions updated.';
        this.isSavingPermissions = false;
      },
      error: (err) => {
        console.error('Failed to update permissions', err);
        this.isSavingPermissions = false;
      },
    });
  }

  loadUserRoles(): void {
    if (!this.manageUserId.trim()) return;
    this.isLoadingUserRoles = true;
    this.rolesService.getManageUserRoles(this.manageUserId.trim()).subscribe({
      next: (result) => {
        this.userRoles = result;
        this.isLoadingUserRoles = false;
      },
      error: (err) => {
        console.error('Failed to load user roles', err);
        this.isLoadingUserRoles = false;
      },
    });
  }

  toggleUserRole(roleIndex: number): void {
    if (!this.userRoles) return;
    const role = this.userRoles.roles[roleIndex];
    role.isSelected = !role.isSelected;
  }

  saveUserRoles(): void {
    if (!this.userRoles) return;
    this.isSavingUserRoles = true;
    this.rolesService.updateRoles(this.userRoles).subscribe({
      next: (updated) => {
        this.userRoles = updated;
        this.actionMessage = 'User roles updated.';
        this.isSavingUserRoles = false;
      },
      error: (err) => {
        console.error('Failed to update user roles', err);
        this.isSavingUserRoles = false;
      },
    });
  }
}
