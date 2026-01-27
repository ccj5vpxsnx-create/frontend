import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  category?: any;
  clientId?: any;
  technicianId?: any;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Ticketservice {
  private apiUrl = 'http://localhost:3000/tickets';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<{ items: Ticket[] }> {
    const token = localStorage.getItem('token'); // récupère ton JWT depuis le stockage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<{ items: Ticket[] }>(this.apiUrl, { headers });
  }
}
