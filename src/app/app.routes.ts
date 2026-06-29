import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { rolGuard } from './guards/rol.guard';
import { EnConstruccion } from './components/modulos/en-construccion/en-construccion';

export const routes: Routes = [
  // Al entrar a la web, carga de inmediato tu interfaz de presentación
  { 
    path: '', 
    loadComponent: () => import('./inicio/inicio').then(m => m.Inicio) 
  },
  
  { 
    path: 'login', 
    loadComponent: () => import('./components/section/section').then(m => m.Section) 
  },

  { 
    path: 'activar-usuario', 
    loadComponent: () => import('./components/section/activar-usuario/activar-usuario').then(m => m.ActivarUsuario) 
  },

  { 
    path: 'recuperar-contrasena', 
    loadComponent: () => import('./components/section/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena) 
  },

  { 
    path: 'home/:rol', 
    loadComponent: () => import('./components/home/home').then(m => m.Home),
    canActivate: [authGuard, rolGuard]
  },

  { 
    path: 'contactanos', 
    loadComponent: () => import('./components/soporte/contactanos/contactanos').then(m => m.Contactanos) 
  },

  { 
    path: 'usuario/ajustes', 
    loadComponent: () => import('./components/usuario/ajustes/ajustes').then(m => m.Ajustes),
    canActivate: [authGuard]
  },
  
  { 
    path: 'usuario/notificaciones', 
    loadComponent: () => import('./components/usuario/notificaciones/notificaciones').then(m => m.Notificaciones),
    canActivate: [authGuard]
  },

  { 
    path: 'info', 
    loadComponent: () => import('./inicio/inicio').then(m => m.Inicio) 
  },

  { 
  path: 'recuperar-contrasena/:token', 
  loadComponent: () => import('./components/section/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena) 
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
