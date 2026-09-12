import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolUrlGuard } from './core/guards/rol.guard';
import { rolesGuard } from './core/guards/roles.guard';
import { EnConstruccion } from './modulos/en-construccion/en-construccion';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./layout/inicio/inicio').then(m => m.Inicio) 
  },
  
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) 
  },

  { 
    path: 'activar-usuario', 
    loadComponent: () => import('./auth/activar-usuario/activar-usuario').then(m => m.ActivarUsuarioComponent)
  },

  { 
    path: 'recuperar-contrasena', 
    loadComponent: () => import('./auth/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasenaComponent) 
  },

  { 
    path: 'home/:rol', 
    loadComponent: () => import('./home/home').then(m => m.Home),
    canActivate: [authGuard, rolUrlGuard]
  },

  { 
    path: 'contactanos', 
    loadComponent: () => import('./soporte/contactanos/contactanos').then(m => m.Contactanos) 
  },

{ 
  path: 'usuario/contacto',
  loadComponent: () => import('./soporte/contacto-interno/contacto-interno').then(m => m.ContactoInternoComponent),
  canActivate: [authGuard] 
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
    path: 'perfil/editar/:documento', 
    loadComponent: () => import('./usuario/perfil/editar-perfil').then(m => m.EditarPerfil),
    canActivate: [authGuard]
  },

 { 
    path: 'modulos/gestion-usuarios', 
    loadComponent: () => import('./modulos/gestion-usuarios/pages/gestion-usuarios-page').then(m => m.GestionUsuariosPage),
    canActivate: [authGuard, rolesGuard],
    data: { rolPermitidos: ['Gerente'] }
  },

  {
    path: 'modulos/inventario',
    loadComponent: () => import('./modulos/Inventario/pages/inventario-page').then(m => m.InventarioPageComponent),
    canActivate: [authGuard, rolesGuard],
    data: { rolPermitidos: ['Gerente', 'Tecnico'] } 
  },

  {
    path: 'modulos/mantenimiento',
    loadComponent: () => import('./modulos/mantenimiento/pages/mantenimiento-page').then(m => m.MantenimientoPageComponent),
    canActivate: [authGuard, rolesGuard],
    data: { rolPermitidos: ['Gerente', 'Tecnico'] }
  },

  { 
    path: 'prestamos/activos', 
    loadComponent: () => import('./modulos/gestion-usuarios/components/lista-prestamos-activos/lista-prestamos-activos').then(m => m.ListaPrestamosActivosComponent),
    canActivate: [authGuard, rolesGuard],
    data: { rolPermitidos: ['Gerente', 'Tecnico'] }
  },

  {
  path: 'modulos/crear-usuario',
  loadComponent: () => import('./modulos/gestion-usuarios/components/crear-usuario/crear-usuario').then(m => m.CrearUsuario),
  canActivate: [authGuard, rolesGuard],
  data: { rolPermitidos: ['Gerente'] }
  },

  { 
    path: 'info', 
    loadComponent: () => import('./layout/inicio/inicio').then(m => m.Inicio) 
  },

  { 
  path: 'recuperar-contrasena/:token', 
  loadComponent: () => import('./auth/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasenaComponent) 
  },
  
  //    MÓDULOS PENDIENTES DE CONEXIÓN A MYSQL (pantalla "En construcción")   
  { 
    path: 'usuario/gestion', 
    component: EnConstruccion,
    data: { nombreModulo: 'Gestión de usuario' },
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
    data: { nombreModulo: 'mantenimiento' },
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
    data: { nombreModulo: 'reserva' },
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
    data: { nombreModulo: 'reserva' },
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: '' }
];
