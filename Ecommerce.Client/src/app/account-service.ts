import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { Environment } from './environment';
import { IAccountUser, IEmailVerification, IForgetPassword, IResetPassword, JwtPayload } from './shared/modules/accountUser';
import { ILogin } from './shared/modules/login';
import { IRegister } from './shared/modules/register';
import { tap, finalize, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private platformId = inject(PLATFORM_ID);

  private baseUrl = `${Environment.baseUrl}/api/account`;

  private userSignal = signal<IAccountUser | null>(null);
  user = computed(() => this.userSignal());
  isLoggedIn = computed(() => !!this.userSignal()?.token);
  constructor(
    private http: HttpClient,
    private router: Router,
   
  ) {
    this.loadCurrentUser();
  }

  // 🔐 LOGIN
  login(loginData: ILogin) {
    return this.http
      .post<IAccountUser>(
        `${this.baseUrl}/login`,
        loginData,
        { withCredentials: true }
      )
      .pipe(
        tap(user => this.setUser(user))
      );
  }

  // 🔄 REFRESH TOKEN
  refreshToken(): Observable<IAccountUser> {
    return this.http
      .get<IAccountUser>(
        `${this.baseUrl}/refresh-token`,
        { withCredentials: true }
      )
      .pipe(
        tap(user => this.setUser(user))
      );
  }

  // 🚪 LOGOUT
  logout() {
    this.clearUserData();
    this.http
      .post(
        `${this.baseUrl}/logout`,
        {},
        { withCredentials: true }
      )
      .subscribe();
  }

  // 🔴 REVOKE TOKEN (Admin / Manual)
  revokeRefreshToken(token?: string) {
    return this.http.post(
      `${this.baseUrl}/revoke-token`,
      token ? { token } : {},
      { withCredentials: true }
    );
  }

  

 

  // ==========================
  // EMAIL & PASSWORD
  // ==========================

  register(registerData: IRegister) {
    return this.http.post(
      `${this.baseUrl}/register`,
      registerData,
      {
        withCredentials: true,
        responseType: 'text',
      }
    );
  }

  verifyEmail(dto: IEmailVerification) {
    return this.http
      .post<IAccountUser>(
        `${this.baseUrl}/email-verification`,
        dto,
        { withCredentials: true }
      )
      .pipe(tap(user => this.setUser(user)));
  }

  resendVerificationEmail(email: string) {
    return this.http.post(
      `${this.baseUrl}/resend-verification`,
      { email }
    );
  }

  forgetPassword(dto: IForgetPassword) {
    return this.http.post(
      `${this.baseUrl}/forgetpassword`,
      dto
    );
  }

  resendResetEmail(email: string) {
    const formData = new FormData();
    formData.append('email', email);

    return this.http.post(
      `${this.baseUrl}/resend-resetpassword`,
      formData
    );
  }

  resetPassword(dto: IResetPassword) {
    return this.http.post(
      `${this.baseUrl}/resetpassword`,
      dto,
      { responseType: 'text' }
    );
  }

  emailExists(email: string) {
    return this.http.get<boolean>(`${this.baseUrl}/emailexists/${email}`);
  }

  usernameExists(username: string) {
    return this.http.get<boolean>(`${this.baseUrl}/usernameexists/${username}`);
  }

  updateLocalUserProfilePicture(newUrl: string | null): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const userData = JSON.parse(userStr);
      userData.profilePicture = newUrl;
      localStorage.setItem('user', JSON.stringify(userData));

      const current = this.userSignal();
      if (current) {
        this.userSignal.set({
          ...current,
          profilePicture: newUrl,
        });
      }
    } catch (error) {
      console.error('Failed to update local user profile picture', error);
    }
  }

  clearLocalUserProfilePicture(): void {
    this.updateLocalUserProfilePicture(null);
  }

  hasPermission(permission: string): boolean {
    const currentUser = this.userSignal();
    return currentUser?.permissions?.includes(permission) ?? false;
  }

  hasRole(role: string): boolean {
    const currentUser = this.userSignal();
    return currentUser?.roles?.includes(role) ?? false;
  }

  // HELPERS
  private normalizeUser(user: IAccountUser): IAccountUser {
    let permissions: string[] = user.permissions ?? [];
    let roles: string[] = user.roles ?? [];

    if (user.token) {
      try {
        const payload = jwtDecode<JwtPayload & { role?: string; roles?: string | string[] }>(user.token);
        permissions = permissions.length ? permissions : (payload.Permission || []);

        if (!roles.length) {
          const tokenRoles = payload.roles ?? payload.role;
          if (Array.isArray(tokenRoles)) {
            roles = tokenRoles;
          } else if (typeof tokenRoles === 'string' && tokenRoles.length > 0) {
            roles = [tokenRoles];
          }
        }
      } catch (err) {
        console.error('Failed to decode JWT', err);
      }
    }

    return { ...user, permissions, roles };
  }

  private setUser(user: IAccountUser) {
    const normalized = this.normalizeUser(user);
    this.userSignal.set(normalized);

    if (this.isBrowser()) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          firstName: normalized.firstName,
          lastName: normalized.lastName,
          userName: normalized.userName,
          email: normalized.email,
          roles: normalized.roles,
          permissions: normalized.permissions, // store permissions
          profilePicture: normalized.profilePicture,
          refreshTokenExpiration: normalized.refreshTokenExpiration,
          token: normalized.token
        })
      );
    }
  }

  loadCurrentUser() {
    if (!this.isBrowser()) return;
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr) as IAccountUser;
      const normalized = this.normalizeUser(user);
      if (!normalized.token) {
        this.clearUserData();
        return;
      }
      this.userSignal.set(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
    } catch {
      this.clearUserData();
    }
  }

  private clearUserData() {
    if (this.isBrowser()) {
      localStorage.removeItem('user');
    }
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
