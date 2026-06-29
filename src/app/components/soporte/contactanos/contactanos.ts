import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-contactanos',
  standalone: true,
  imports: [], 
  templateUrl: './contactanos.html',
  styleUrl: '../../section/section.css' 
})
export class Contactanos {
  private router = inject(Router);
  private authService = inject(AuthService);

 irAlInicio(): void {
    this.authService.irAlInicio(this.router);
  }
}