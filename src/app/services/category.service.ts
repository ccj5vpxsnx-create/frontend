import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';


export interface CategoriesResponse {
    items: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://localhost:3000/categories';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    getCategories(page: number = 1, limit: number = 10, search: string = ''): Observable<CategoriesResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (search) {
            queryParams.append('search', search);
        }

        return this.http.get<CategoriesResponse>(
            `${this.apiUrl}?${queryParams.toString()}`,
            { headers: this.getHeaders() }
        );
    }

    getCategoryById(id: string): Observable<Category> {
        return this.http.get<Category>(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    createCategory(category: Category): Observable<Category> {
        return this.http.post<Category>(
            this.apiUrl,
            category,
            { headers: this.getHeaders() }
        );
    }

    updateCategory(id: string, updates: Partial<Category>): Observable<Category> {
        return this.http.patch<Category>(
            `${this.apiUrl}/${id}`,
            updates,
            { headers: this.getHeaders() }
        );
    }
    deleteCategory(id: string): Observable<any> {
        return this.http.delete(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }
}
