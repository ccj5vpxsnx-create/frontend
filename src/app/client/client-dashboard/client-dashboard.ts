import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { CategoryService } from '../../services/category.service';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, NgClass],
  templateUrl: './client-dashboard.html'
})
export class ClientDashboard implements OnInit {

  currentUser: any;
  tickets: any[] = [];
  categories: any[] = [];
  loading = false;

  showTicketModal = false;

  ticketForm = {
    title: '',
    description: '',
    type: 'incident',
    category: '',
    urgency: 'medium',
    impact: 'medium',
    location: ''
  };

  constructor(
    private ticketService: TicketService,
    private categoryService: CategoryService,
    private authService: Authservice,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.loadTickets();
    this.loadCategories();
  }

  loadTickets() {
    this.loading = true;
    this.ticketService.getTickets({ clientId: this.currentUser.id }).subscribe({
      next: res => {
        this.tickets = res.items;
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: res => this.categories = res.items
    });
  }

  openCreateTicket() {
    this.ticketForm = {
      title: '',
      description: '',
      type: 'incident',
      category: '',
      urgency: 'medium',
      impact: 'medium',
      location: ''
    };
    this.showTicketModal = true;
  }

  createTicket() {
    if (!this.ticketForm.title || !this.ticketForm.description || !this.ticketForm.category) {
      alert('Champs obligatoires manquants');
      return;
    }

    const ticket = {
      ...this.ticketForm,
      status: 'new',
      priority: this.calculatePriority(this.ticketForm.urgency, this.ticketForm.impact),
      clientId: this.currentUser.id,
      requester: this.currentUser.id
    };

    this.ticketService.createTicket(ticket).subscribe({
      next: () => {
        this.showTicketModal = false;
        this.loadTickets();
      }
    });
  }

  deleteTicket(ticketId: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      return;
    }

    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.loadTickets();
      }
    });
  }

  calculatePriority(u: string, i: string): string {
    if (u === 'high' || i === 'high') return 'high';
    if (u === 'low' && i === 'low') return 'low';
    return 'medium';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      new: 'Nouveau',
      assigned: 'Assigné',
      in_progress: 'En cours',
      waiting: 'En attente',
      resolved: 'Résolu',
      closed: 'Fermé'
    };
    return map[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const map: any = {
      new: 'bg-primary',
      assigned: 'bg-info',
      in_progress: 'bg-warning text-dark',
      waiting: 'bg-secondary',
      resolved: 'bg-success',
      closed: 'bg-dark'
    };
    return map[status] || 'bg-secondary';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
