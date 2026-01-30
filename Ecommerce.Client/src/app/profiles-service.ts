import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Environment } from './environment';
import { IPagination } from './shared/modules/pagination';
import {
  IAddressDto,
  IChangePassword,
  IDeleteProfile,
  IEnable2FA,
  IJsonPatchOperation,
  IProfileResponse,
  ISetPassword,
  IUserSpecParams
} from './shared/modules/profile';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private baseUrl = `${Environment.baseUrl}/api/profiles`;

  constructor(private http: HttpClient) {}

  getAllUsers(params: IUserSpecParams = {}) {
    return this.http.get<IPagination<IProfileResponse>>(
      `${this.baseUrl}/users`,
      { params: this.buildParams(params) }
    );
  }

  getProfile() {
    return this.http.get<IProfileResponse>(`${this.baseUrl}/profile`);
  }

  updateProfileJsonPatch(patchDoc: IJsonPatchOperation[]) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json-patch+json' });
    return this.http.patch<IProfileResponse>(
      `${this.baseUrl}/profile/json`,
      patchDoc,
      { headers }
    );
  }

  updateProfileImage(file: File) {
    const formData = new FormData();
    formData.append('ProfileImageFile', file);
    return this.http.patch<IProfileResponse>(`${this.baseUrl}/profile/image`, formData);
  }

  deleteProfileImage() {
    return this.http.delete<IProfileResponse>(`${this.baseUrl}/profile/image`);
  }

  getAddress() {
    return this.http.get<IAddressDto>(`${this.baseUrl}/address`);
  }

  updateAddress(dto: IAddressDto) {
    return this.http.put<IAddressDto>(`${this.baseUrl}/address`, dto);
  }

  lockUser(userId: string) {
    return this.http.post<IProfileResponse>(`${this.baseUrl}/lock/${userId}`, {});
  }

  unlockUser(userId: string) {
    return this.http.post<IProfileResponse>(`${this.baseUrl}/unlock/${userId}`, {});
  }

  changePassword(dto: IChangePassword) {
    return this.http.post<boolean>(`${this.baseUrl}/changePassword`, dto);
  }

  setPassword(dto: ISetPassword) {
    return this.http.post<boolean>(`${this.baseUrl}/setPassword`, dto);
  }

  deleteProfile(dto: IDeleteProfile) {
    return this.http.delete<boolean>(`${this.baseUrl}/deleteProfile`, { body: dto });
  }

  enable2FA(dto: IEnable2FA) {
    return this.http.post<string>(`${this.baseUrl}/enable-2fa`, dto);
  }

  get2FAStatus() {
    return this.http.get<boolean>(`${this.baseUrl}/2fa-status`);
  }

  private buildParams(params: IUserSpecParams) {
    let httpParams = new HttpParams();

    if (params.pageIndex !== undefined) httpParams = httpParams.set('pageIndex', params.pageIndex);
    if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return httpParams;
  }
}
