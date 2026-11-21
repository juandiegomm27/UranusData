import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificasion de token
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
        console.warn('✗ Token inválido o expirado');
        authService.cerrarSesionLocal();
        router.navigate(['/login']);
      }
    });
  }, 1000);
}