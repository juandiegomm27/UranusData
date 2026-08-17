import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(documento: string): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/perfil/${documento}`)
    );
  }

  updateProfile(documento: string, datos: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${environment.apiUrl}/perfil/${documento}`, datos)
    );
  }
}