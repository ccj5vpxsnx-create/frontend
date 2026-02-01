import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, DatePipe, SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { TicketService, Ticket } from '../../services/ticket.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../interfaces/category';
import { Message } from '../../interfaces/message';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css'
})
export class ClientDashboard implements OnInit {
  currentUser: any = null;
  myTickets: Ticket[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  showCreateModal = false;
  ticketForm = {
    title: '',
    description: '',
    type: 'incident',
    category: '',
    urgency: 'medium',
    impact: 'medium',
    location: ''
  };
  selectedTicket: Ticket | null = null;

  constructor(
    private ticketService: TicketService,
    private categoryService: CategoryService,
    private authService: Authservice,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser || (this.currentUser.type !== 'client' && this.currentUser.type !== 'user')) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMyTickets();
    this.loadCategories();
  }

  loadMyTickets() {
    this.loading = true;
    this.ticketService.getTickets({ clientId: this.currentUser.id }).subscribe({
      next: (response) => {
        this.myTickets = response.items;
        this.loading = false;
      },
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.items;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories');
      }
    });
  }
  openCreateModal() {
    this.ticketForm = {
      title: '',
      description: '',
      type: 'incident',
      category: '',
      urgency: 'medium',
      impact: 'medium',
      location: ''
    };
    this.showCreateModal = true;
  }

  createTicket() {
    if (!this.ticketForm.title || !this.ticketForm.description || !this.ticketForm.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newTicket: Ticket = {
      title: this.ticketForm.title,
      description: this.ticketForm.description,
      type: this.ticketForm.type,
      category: this.ticketForm.category,
      urgency: this.ticketForm.urgency,
      impact: this.ticketForm.impact,
      priority: this.calculatePriority(this.ticketForm.urgency, this.ticketForm.impact),
      location: this.ticketForm.location,
      status: 'new',
      source: 'helpdesk',
      requester: this.currentUser.id,
      clientId: this.currentUser.id
    };

    this.ticketService.createTicket(newTicket).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadMyTickets();
        alert('Ticket créé avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de la création du ticket');
      }
    });
  }

  calculatePriority(urgency: string, impact: string): string {
    if (urgency === 'high' || impact === 'high') return 'high';
    if (urgency === 'low' && impact === 'low') return 'low';
    return 'medium';
  }



  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'new': 'bg-primary',
      'in_progress': 'bg-warning',
      'resolved': 'bg-success',
      'closed': 'bg-secondary'
    };
    return classes[status] || 'bg-info';
  }

  getPriorityBadgeClass(priority: string): string {
    const classes: any = {
      'low': 'bg-success',
      'medium': 'bg-warning',
      'high': 'bg-danger'
    };
    return classes[priority] || 'bg-info';
  }

  isMyMessage(senderId: string): boolean {
    return senderId === this.currentUser.id;
  }

}
