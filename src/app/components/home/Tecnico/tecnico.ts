import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tecnico.html',
  styleUrl: '../home.css'
})
export class Tecnico {}