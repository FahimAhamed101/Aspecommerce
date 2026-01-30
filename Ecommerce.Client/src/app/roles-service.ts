import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Environment } from './environment';
import {
  IPermissionCheckboxDto,
  IRoleDto,
  IRolePermissionsDto,
  IRoleToCreateDto,
  IUserRolesDto
} from './shared/modules/role';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private baseUrl = `${Environment.baseUrl}/api/roles`;

  constructor(private http: HttpClient) {}

  getAllRoles() {
    return this.http.get<IRoleDto[]>(this.baseUrl);
  }

  getRoleById(id: string) {
    return this.http.get<IRoleDto>(`${this.baseUrl}/${id}`);
  }

  createRole(dto: IRoleToCreateDto) {
    return this.http.post<IRoleDto>(this.baseUrl, dto);
  }

  deleteRole(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getManageUserRoles(userId: string) {
    return this.http.get<IUserRolesDto>(`${this.baseUrl}/manage-user-roles/${userId}`);
  }

  updateRoles(dto: IUserRolesDto) {
    return this.http.put<IUserRolesDto>(`${this.baseUrl}/update-role`, dto);
  }

  getManagePermissions(roleId: string) {
    return this.http.get<IRolePermissionsDto>(`${this.baseUrl}/manage-permissions/${roleId}`);
  }

  updatePermissions(roleId: string, permissions: IPermissionCheckboxDto[]) {
    return this.http.put<IRolePermissionsDto>(
      `${this.baseUrl}/update-permissions/${roleId}`,
      permissions
    );
  }
}
