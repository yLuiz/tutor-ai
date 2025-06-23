import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRoles } from '../shared/enums/UserRoles';
import { UserHelper } from '../shared/helpers/user.helper';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getValidToken();
  if (token) {

    const canAccess = {
      [UserRoles.ADMIN]: [
        '/chat',
        '/users',
        '/settings'
      ],
      [UserRoles.COMMON]: [
        '/chat',
        '/settings'
      ]
    }

    const UserRole = UserHelper.getUserInfo()?.role;
    const currentPath = getFullRoutePath(route);
    const canAccessRoute = UserRole && canAccess[UserRole].includes(currentPath);
    
    if (!canAccessRoute) {
      console.warn(`Access denied for user role: ${UserRole} on route: ${currentPath}`);
      router.navigate(['/']);
      return false;
    }

    return true;
  }

  // Verificação adicional para saber se o token está expirado ou o usuário está tentando acessar uma rota protegida sem estar autenticado.
  // Evitando assim o Toast de "Token expirado" quando não for o caso.
  const storageToken = localStorage.getItem('token');
  if (storageToken) {
    authService.logout({
      hasTokenExpired: true
    });
    return false;
  }

  authService.logout();
  return false;
};

function getFullRoutePath(snapshot: ActivatedRouteSnapshot): string {
  let path = '';
  let current: ActivatedRouteSnapshot | null = snapshot;

  while (current) {
    if (current.routeConfig?.path) {
      path = `/${current.routeConfig.path}${path}`;
    }
    current = current.parent;
  }

  return path;
}
