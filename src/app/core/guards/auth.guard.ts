import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificar si tiene token
  if (!authService.isAutenticado()) {
    router.navigate(['/login']);
    return false;
  }

  validarTokenEnBackground(authService, router);

  return true;
};

function validarTokenEnBackground(authService: AuthService, router: Router): void {

  setTimeout(() => {
    const documento = authService.getDocumento();
    
    if (!documento) {
      authService.logoutRemoto();
      return;
    }

    // Intentar obtener perfil para validar token
    authService.obtenerPerfil(documento).subscribe({
      next: () => {
        console.log('✓ Token validado exitosamente');
      },
      error: () => {
        // Token inválido, forzar logout
        console.warn('✗ Token inválido o expirado');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        router.navigate(['/login']);
      }
    });
  }, 1000);
}