import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const router = inject(Router);

  let requestToForward = req;

  if (token) {
    requestToForward = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(requestToForward).pipe(
    catchError((error: HttpErrorResponse) => {
      // If token naturally expires, Spring throws 401 Unauthorized or 403 Forbidden
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
