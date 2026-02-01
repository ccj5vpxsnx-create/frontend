import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';


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
        return new HttpHeaders({ 'Content-Type': 'application/json',  'Authorization': `Bearer ${token}` });
    }

    getUsers(params: any = {}): Observable<UsersResponse> {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key, params[key]); }
        });
        return this.http.get<UsersResponse>( `${this.apiUrl}?${queryParams.toString()}`,{ headers: this.getHeaders() });
    }
    getUserById(id: string): Observable<User> {
        return this.http.get<User>( `${this.apiUrl}/${id}`, { headers: this.getHeaders() } );
    }
    createUser(user: User): Observable<User> {
        return this.http.post<User>( this.apiUrl,user, { headers: this.getHeaders() } );
    }
    updateUser(id: string, updates: Partial<User>): Observable<User> {
        return this.http.patch<User>( `${this.apiUrl}/${id}`,  updates,  { headers: this.getHeaders() });
    }
    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`,{ headers: this.getHeaders() });
    }
}
