import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  sendResetCode(email: string) {
  return this.http.post('/api/auth/reset-password', { email });
}


  private apiUrl = 'http://localhost:3000/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      username,
      password
    });
  }

  saveAuth(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); 
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null; 
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
  localStorage.removeItem('token');       // supprime le token
  localStorage.removeItem('user');        // supprime les infos utilisateur
}

requestResetPassword(email: string) {
  return this.http.post(`${this.apiUrl}/forget-password`, { email });
}
verifyResetCode(email: string, code: string) {
  return this.http.post(`${this.apiUrl}/verify-code`, { email, code });
}
resetPassword(email: string, code: string, newPassword: string) {
  return this.http.post(`${this.apiUrl}/reset-password`, { 
    email, 
    code,
    newpassword: newPassword  
  });
}
}
