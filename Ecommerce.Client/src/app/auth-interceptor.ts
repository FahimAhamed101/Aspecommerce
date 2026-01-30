import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof localStorage === 'undefined') {
    return next(req);
  }

  const userStr = localStorage.getItem('user');
  let token: string | undefined;

  if (userStr) {
    try {
      token = JSON.parse(userStr)?.token;
    } catch {
      token = undefined;
    }
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
