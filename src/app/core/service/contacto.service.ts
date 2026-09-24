import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private http = inject(HttpClient);

  enviarMensaje(datos: { asunto: string; descripcion: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/contacto/enviar`, datos);
  }
}