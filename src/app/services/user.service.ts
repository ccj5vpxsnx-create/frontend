import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
    _id?: string;
    username: string;
    type: 'admin' | 'technician' | 'user' | 'superadmin';
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UsersResponse {
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/users';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Récupérer tous les utilisateurs
    getUsers(params: any = {}): Observable<UsersResponse> {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key, params[key]);
            }
        });
        return this.http.get<UsersResponse>(
            `${this.apiUrl}?${queryParams.toString()}`,
            { headers: this.getHeaders() }
        );
    }

    // Récupérer un utilisateur par ID
    getUserById(id: string): Observable<User> {
        return this.http.get<User>(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    // Créer un nouvel utilisateur
    createUser(user: User): Observable<User> {
        return this.http.post<User>(
            this.apiUrl,
            user,
            { headers: this.getHeaders() }
        );
    }

    // Mettre à jour un utilisateur
    updateUser(id: string, updates: Partial<User>): Observable<User> {
        return this.http.patch<User>(
            `${this.apiUrl}/${id}`,
            updates,
            { headers: this.getHeaders() }
        );
    }

    // Supprimer un utilisateur
    deleteUser(id: string): Observable<any> {
        return this.http.delete(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }
}
