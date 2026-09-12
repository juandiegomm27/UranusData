import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

/**
 * Guard de coincidencia de rol en la URL
 * Uso exclusivo para rutas con parámetro :rol, ej. 'home/:rol'
 * Verifica que el rol en la URL coincida con el rol real del usuario autenticado
 */
export const rolUrlGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  const rolActual = authService.getRol();
  const rolSolicitado = route.paramMap.get('rol');

  if (rolActual === rolSolicitado) {
    return true;
  }

  router.navigate(['/home', rolActual || 'Docente']);
  return false;
};