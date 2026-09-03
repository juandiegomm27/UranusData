import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard genérico de rol
 * Uso: canActivate: [rolesGuard], data: { rolPermitidos: ['Gerente', 'Tecnico'] }
 */
export const rolesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  const rolActual = authService.getRol();
  const rolPermitidos = route.data['rolPermitidos'] as string[];

  if (rolActual && rolPermitidos?.includes(rolActual)) {
    return true;
  }

  // Si no tiene permisos, redirigir al home del rol
  const rolUsuario = authService.getRol() || 'Docente';
  router.navigate(['/home', rolUsuario]);
  return false;
};
