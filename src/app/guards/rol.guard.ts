import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

// Verifica que el rol en la URL (:rol) coincida con el rol real del usuario autenticado
export const rolGuard: CanActivateFn = (route, state) => {
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

  // Está logueado pero pidió un rol que no es el suyo: lo mandamos a su propio home
  router.navigate(['/home', rolActual || 'Docente']);
  return false;
};