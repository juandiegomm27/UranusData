import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { EnConstruccion } from './modulos/en-construccion/en-construccion';

export const routes: Routes = [
  // Al entrar a la web, carga de inmediato tu interfaz de presentación
  { 
    path: '', 
    loadComponent: () => import('./layout/inicio/inicio').then(m => m.Inicio) 
  },
  
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.Login) 
  },

  { 
    path: 'activar-usuario', 
    loadComponent: () => import('./auth/activar-usuario/activar-usuario').then(m => m.ActivarUsuario) 
  },

  { 
    path: 'recuperar-contrasena', 
    loadComponent: () => import('./auth/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena) 
  },

  { 
    path: 'home/:rol', 
    loadComponent: () => import('./home/home').then(m => m.Home),
    canActivate: [authGuard, rolGuard]
  },

  { 
    path: 'contactanos', 
    loadComponent: () => import('./soporte/contactanos/contactanos').then(m => m.Contactanos) 
  },

  { 
    path: 'usuario/ajustes', 
    loadComponent: () => import('./usuario/ajustes/ajustes').then(m => m.Ajustes),
    canActivate: [authGuard]
  },
  
  { 
    path: 'usuario/notificaciones', 
    loadComponent: () => import('./usuario/notificaciones/notificaciones').then(m => m.Notificaciones),
    canActivate: [authGuard]
  },

  { 
    path: 'info', 
    loadComponent: () => import('./layout/inicio/inicio').then(m => m.Inicio) 
  },

  { 
  path: 'recuperar-contrasena/:token', 
  loadComponent: () => import('./auth/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena) 
  },
  
  // --- MÓDULOS PENDIENTES DE CONEXIÓN A MYSQL (pantalla "En construcción") ---
  { 
    path: 'usuarios/gestion', 
    component: EnConstruccion,
    data: { nombreModulo: 'Gestión de Usuarios' },
    canActivate: [authGuard]
  },
  { 
    path: 'inventario/reportes', 
    component: EnConstruccion,
    data: { nombreModulo: 'Inventario' },
    canActivate: [authGuard]
  },
  { 
    path: 'inventario/ver', 
    component: EnConstruccion,
    data: { nombreModulo: 'Inventario' },
    canActivate: [authGuard]
  },
  { 
    path: 'mantenimiento/reportes', 
    component: EnConstruccion,
    data: { nombreModulo: 'Mantenimientos' },
    canActivate: [authGuard]
  },
  { 
    path: 'mantenimiento/gestion', 
    component: EnConstruccion,
    data: { nombreModulo: 'Mantenimiento' },
    canActivate: [authGuard]
  },
  { 
    path: 'reserva/crear', 
    component: EnConstruccion,
    data: { nombreModulo: 'Reservas' },
    canActivate: [authGuard]
  },
  { 
    path: 'reserva/consultar', 
    component: EnConstruccion,
    data: { nombreModulo: 'Consultar Reserva' },
    canActivate: [authGuard]
  },
  { 
    path: 'reserva/editar', 
    component: EnConstruccion,
    data: { nombreModulo: 'Editar Reserva' },
    canActivate: [authGuard]
  },
  { 
    path: 'reserva/ver', 
    component: EnConstruccion,
    data: { nombreModulo: 'Reservas' },
    canActivate: [authGuard]
  },

  // Ruta comodín segura (Cualquier URL rota te regresa a la presentación)
  { path: '**', redirectTo: '' }
];