import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaUsuarios } from '../components/lista-usuarios/lista-usuarios';

@Component({
  selector: 'app-gestion-usuarios-page',
  standalone: true,
  imports: [CommonModule, ListaUsuarios],
  templateUrl: './gestion-usuarios-page.html',
  styleUrls: ['./gestion-usuarios-page.css']
})
export class GestionUsuariosPage {}