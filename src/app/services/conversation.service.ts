import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation } from '../interfaces/conversation';
import { Message } from '../interfaces/message';


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

    createConversation(conversation: Conversation): Observable<Conversation> {
        return this.http.post<Conversation>(
            `${this.apiUrl}/conversations`,
            conversation,
            { headers: this.getHeaders() }
        );
    }

    getMyConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(
            `${this.apiUrl}/conversations/my`,
            { headers: this.getHeaders() }
        );
    }

    getConversationByTicket(ticketId: string): Observable<Conversation> {
        return this.http.get<Conversation>(
            `${this.apiUrl}/conversations/ticket/${ticketId}`,
            { headers: this.getHeaders() }
        );
    }
    sendMessage(message: Message): Observable<Message> {
        return this.http.post<Message>(
            `${this.apiUrl}/messages`,
            message,
            { headers: this.getHeaders() }
        );
    }
    getMessages(conversationId: string): Observable<Message[]> {
        return this.http.get<Message[]>(
            `${this.apiUrl}/messages/${conversationId}`,
            { headers: this.getHeaders() }
        );
    }
    
}
export type { Conversation };

