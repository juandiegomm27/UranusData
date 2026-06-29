import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

// -- ROLES ---

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './docente.html',
  styleUrl: '../home.css'
})
export class Docente {}