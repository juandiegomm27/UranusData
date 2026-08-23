import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tecnico.html',
  styleUrl: '../home.css'
})
export class Tecnico {}