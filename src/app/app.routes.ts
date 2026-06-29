import { Routes } from '@angular/router';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { 
    path: 'login', 
    loadComponent: () => import('./components/section/section').then(m => m.Section) 
  },
  
  // CORREGIDO: Apunta hacia adentro de la carpeta section
  { 
    path: 'activar-usuario', 
    loadComponent: () => import('./components/section/activar-usuario/activar-usuario').then(m => m.ActivarUsuario) 
  },

  // CORREGIDO: Apunta hacia adentro de la carpeta section
  { 
    path: 'recuperar-contrasena', 
    loadComponent: () => import('./components/section/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena) 
  },
  
  { 
    path: 'home/:rol', 
    loadComponent: () => import('./components/home/home').then(m => m.Home) 
  },

  { path: '**', redirectTo: 'login' }
];

