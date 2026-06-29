import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
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
    loadComponent: () => import('./components/home/home').then(m => m.Home) 
  },

  { 
    path: 'contactanos', 
    loadComponent: () => import('./components/soporte/contactanos/contactanos').then(m => m.Contactanos) 
  },

  { 
    path: 'usuario/ajustes', 
    loadComponent: () => import('./components/usuario/ajustes/ajustes').then(m => m.Ajustes) 
  },
  
  { 
    path: 'usuario/notificaciones', 
    loadComponent: () => import('./components/usuario/notificaciones/notificaciones').then(m => m.Notificaciones) 
  },

  { path: '**', redirectTo: 'login' }
];
