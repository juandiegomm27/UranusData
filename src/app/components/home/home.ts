import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

// === SUBCOMPONENTES INDEPENDIENTES PARA CADA ROL ===

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './docente.html',
  styleUrl: './home.css' // <-- Comparten el mismo archivo CSS
})
export class Docente {}

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tecnico.html',
  styleUrl: './home.css'
})
export class Tecnico {}

@Component({
  selector: 'app-gerente',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gerente.html',
  styleUrl: './home.css'
})
export class Gerente {}


// === COMPONENTE PRINCIPAL ORQUESTADOR ===

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Docente, Tecnico, Gerente], // <-- Importamos los subcomponentes aquí
  templateUrl: './home.html', 
  styleUrl: './home.css'      
})
export class Home implements OnInit {
  private route = inject(ActivatedRoute);
  public rolUsuario = signal<string>('');

  ngOnInit(): void {
    const rolUrl = this.route.snapshot.paramMap.get('rol');
    if (rolUrl) {
      this.rolUsuario.set(rolUrl);
    }
  }
}
