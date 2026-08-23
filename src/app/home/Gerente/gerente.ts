import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gerente.html',
  styleUrl: '../home.css'
})
export class Gerente {}