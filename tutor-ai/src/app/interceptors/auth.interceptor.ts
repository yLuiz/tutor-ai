import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error) => {

            const isLoginRequest = req.url.includes('api/login');

            console.error('[Interceptor] Erro na requisição:', req.url);

            if (error instanceof HttpErrorResponse && error.status === 401 && !isLoginRequest) {
                console.warn('[Interceptor] Token expirado ou inválido. Redirecionando...');
                authService.logout({ hasTokenExpired: true });
            }

            return throwError(() => error);
        })
    );
};
