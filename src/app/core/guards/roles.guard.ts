import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard genérico de roles
 * Uso: canActivate: [rolesGuard], data: { rolesPermitidos: [2, 3] }
 */
export const rolesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  const rolActual = Number(authService.getRol());
  const rolesPermitidos = route.data['rolesPermitidos'] as number[];

  if (rolesPermitidos && rolesPermitidos.includes(rolActual)) {
    return true;
  }

  // Si no tiene permisos, redirigir al home del rol
  const rolUsuario = authService.getRol() || 'Docente';
  router.navigate(['/home', rolUsuario]);
  return false;
};