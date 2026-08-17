import { Component } from '@angular/core';
import { ListaUsuarios } from '../components/lista-usuarios/lista-usuarios';

@Component({
  selector: 'app-gestion-usuarios-page',
  standalone: true,
  imports: [ListaUsuarios],
  template: `<app-lista-usuarios></app-lista-usuarios>`
})
export class GestionUsuariosPage {}