export interface IRoleDto {
  id: string;
  name: string;
  userCount?: number;
}

export interface IRoleToCreateDto {
  name: string;
}

export interface ICheckBoxRoleManageDto {
  roleId: string;
  roleName: string;
  isSelected: boolean;
}

export interface IUserRolesDto {
  userId: string;
  userName: string;
  email: string;
  roles: ICheckBoxRoleManageDto[];
}

export interface IPermissionCheckboxDto {
  permissionName: string;
  module: string;
  action: string;
  isSelected: boolean;
}

export interface IRolePermissionsDto {
  roleId: string;
  roleName: string;
  permissions: IPermissionCheckboxDto[];
}
