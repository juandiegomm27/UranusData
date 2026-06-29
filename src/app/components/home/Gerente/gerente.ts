import { Component } from '@angular/core';
import {RouterLink } from '@angular/router';

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gerente.html',
  styleUrl: '../home.css'
})
export class Gerente {}