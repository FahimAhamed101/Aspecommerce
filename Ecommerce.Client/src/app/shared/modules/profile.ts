export interface IProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  profilePictureUrl?: string | null;
}

export interface IUserSpecParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  sort?: string;
}

export interface IProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
}

export interface IJsonPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

export interface IAddressDto {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface ISetPassword {
  password: string;
}

export interface IDeleteProfile {
  password: string;
}

export interface IEnable2FA {
  enable: boolean;
}
