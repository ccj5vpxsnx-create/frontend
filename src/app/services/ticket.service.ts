import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticket } from '../interfaces/tiket';
import { TicketsResponse } from '../interfaces/tiket-response';
import { TicketStats } from '../interfaces/TicketStats';
@Injectable({
    providedIn: 'root'
})
export class TicketService {
    private apiUrl = 'http://localhost:3000/tickets';
    constructor(private http: HttpClient) { }
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({ 'Content-Type': 'application/json',  'Authorization': `Bearer ${token}`});
    }

    getTickets(params: any = {}): Observable<TicketsResponse> {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key, params[key]);
            }
        });
        return this.http.get<TicketsResponse>(`${this.apiUrl}?${queryParams.toString()}`,{ headers: this.getHeaders() });
    }

    getTicketById(id: string): Observable<Ticket> {
        return this.http.get<Ticket>( `${this.apiUrl}/${id}`,{ headers: this.getHeaders() } );
    }
    createTicket(ticket: Ticket): Observable<Ticket> {
        return this.http.post<Ticket>(this.apiUrl, ticket,{ headers: this.getHeaders() }); }
    updateTicket(id: string, updates: Partial<Ticket>): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`, updates,{ headers: this.getHeaders() } );
    }

    deleteTicket(id: string): Observable<any> {
        return this.http.delete( `${this.apiUrl}/${id}`,{ headers: this.getHeaders() } );
    }

    getStats(): Observable<TicketStats> {
        return this.http.get<TicketStats>( `${this.apiUrl}/stats`, { headers: this.getHeaders() } );
    }
}

export type { Ticket };