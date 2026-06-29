import { Routes } from '@angular/router';

export const routes: Routes = [
  // Al entrar, manda directo al login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Tu formulario de inicio de sesión
  { 
    path: 'login', 
    loadComponent: () => import('./components/section/section').then(m => m.Section) 
  },
  
  // RUTA ÚNICA DINÁMICA: Envía a la carpeta home pasando el rol por la URL
  { 
    path: 'home/:rol', 
    loadComponent: () => import('./components/home/home').then(m => m.Home) 
  },

  // Si escriben cualquier otra cosa, los regresa al login
  { path: '**', redirectTo: 'login' }
];

