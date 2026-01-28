import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Ticket {
    _id?: string;
    title: string;
    description: string;
    type: string;
    status: string;
    category: any;
    source?: string;
    urgency: string;
    impact: string;
    priority: string;
    location?: string;
    clientId?: any;
    technicianId?: any;
    requester?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TicketsResponse {
    items: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class TicketService {
    private apiUrl = 'http://localhost:3000/tickets';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Récupérer tous les tickets avec filtres
    getTickets(params: any = {}): Observable<TicketsResponse> {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key, params[key]);
            }
        });
        return this.http.get<TicketsResponse>(
            `${this.apiUrl}?${queryParams.toString()}`,
            { headers: this.getHeaders() }
        );
    }

    // Récupérer un ticket par ID
    getTicketById(id: string): Observable<Ticket> {
        return this.http.get<Ticket>(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    // Créer un nouveau ticket
    createTicket(ticket: Ticket): Observable<Ticket> {
        return this.http.post<Ticket>(
            this.apiUrl,
            ticket,
            { headers: this.getHeaders() }
        );
    }

    // Mettre à jour un ticket
    updateTicket(id: string, updates: Partial<Ticket>): Observable<Ticket> {
        return this.http.put<Ticket>(
            `${this.apiUrl}/${id}`,
            updates,
            { headers: this.getHeaders() }
        );
    }

    // Supprimer un ticket
    deleteTicket(id: string): Observable<any> {
        return this.http.delete(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }
}
