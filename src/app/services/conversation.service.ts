import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Message {
    _id?: string;
    conversationId: string;
    sender: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Conversation {
    _id?: string;
    type: 'private' | 'group';
    name?: string;
    participants: string[];
    createdBy: string;
    ticketId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ConversationService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Créer une conversation
    createConversation(conversation: Conversation): Observable<Conversation> {
        return this.http.post<Conversation>(
            `${this.apiUrl}/conversations`,
            conversation,
            { headers: this.getHeaders() }
        );
    }

    // Récupérer mes conversations
    getMyConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(
            `${this.apiUrl}/conversations/my`,
            { headers: this.getHeaders() }
        );
    }

    // Récupérer une conversation par ticket ID
    getConversationByTicket(ticketId: string): Observable<Conversation> {
        return this.http.get<Conversation>(
            `${this.apiUrl}/conversations/ticket/${ticketId}`,
            { headers: this.getHeaders() }
        );
    }

    // Envoyer un message
    sendMessage(message: Message): Observable<Message> {
        return this.http.post<Message>(
            `${this.apiUrl}/messages`,
            message,
            { headers: this.getHeaders() }
        );
    }

    // Récupérer les messages d'une conversation
    getMessages(conversationId: string): Observable<Message[]> {
        return this.http.get<Message[]>(
            `${this.apiUrl}/messages/${conversationId}`,
            { headers: this.getHeaders() }
        );
    }
}
