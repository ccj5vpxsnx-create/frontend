import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Category {
    _id?: string;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

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

    // Récupérer toutes les catégories
    getCategories(params: any = {}): Observable<CategoriesResponse> {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key]) {
                queryParams.append(key, params[key]);
            }
        });
        return this.http.get<CategoriesResponse>(
            `${this.apiUrl}?${queryParams.toString()}`,
            { headers: this.getHeaders() }
        );
    }

    // Récupérer une catégorie par ID
    getCategoryById(id: string): Observable<Category> {
        return this.http.get<Category>(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }

    // Créer une nouvelle catégorie
    createCategory(category: Category): Observable<Category> {
        return this.http.post<Category>(
            this.apiUrl,
            category,
            { headers: this.getHeaders() }
        );
    }

    // Mettre à jour une catégorie
    updateCategory(id: string, updates: Partial<Category>): Observable<Category> {
        return this.http.patch<Category>(
            `${this.apiUrl}/${id}`,
            updates,
            { headers: this.getHeaders() }
        );
    }

    // Supprimer une catégorie
    deleteCategory(id: string): Observable<any> {
        return this.http.delete(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders() }
        );
    }
}
