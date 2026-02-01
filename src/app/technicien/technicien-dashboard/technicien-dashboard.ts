import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { TicketService } from '../../services/ticket.service';
import { CategoryService, Category } from '../../services/category.service';
import { Ticket } from '../../interfaces/tiket';
@Component({
  selector: 'app-technicien-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technicien-dashboard.html',
  styleUrl: './technicien-dashboard.css'
})
export class TechnicienDashboard implements OnInit {
  currentUser: any = null;
  myTickets: Ticket[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  selectedTicket: Ticket | null = null;
  showTicketDetail = false;

  showTicketModal = false;
  isEditingTicket = false;
  ticketForm: any = {
    title: '',
    description: '',
    type: 'incident',
    category: '',
    urgency: 'medium',
    impact: 'medium',
    location: '',
    status: 'new'
  };
  constructor(
    private ticketService: TicketService,
    private categoryService: CategoryService,
    private authService: Authservice,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser || this.currentUser.type !== 'technician') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadMyTickets();
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.items;
      },
      error: (err) => console.error('Erreur chargement catégories')
    });
  }

  loadMyTickets() {
    this.loading = true;
    this.ticketService.getTickets({ technicianId: this.currentUser.id }).subscribe({
      next: (response) => {
        this.myTickets = response.items;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des tickets';
        this.loading = false;
      }
    });
  }

 
    openEditTicketModal(ticket: Ticket) {
    this.isEditingTicket = true;
    this.selectedTicket = ticket;
    this.ticketForm = {
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      category: ticket.category._id || ticket.category,
      urgency: ticket.urgency,
      impact: ticket.impact,
      location: ticket.location,
      status: ticket.status
    };
    this.showTicketModal = true;
  }

  saveTicket() {
    if (!this.ticketForm.title || !this.ticketForm.description || !this.ticketForm.category) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    const ticketData: Ticket = {
      ...this.ticketForm,
      priority: this.calculatePriority(this.ticketForm.urgency, this.ticketForm.impact),
      requester: this.isEditingTicket && this.selectedTicket ? this.selectedTicket.requester : this.currentUser.id
    };

    if (this.isEditingTicket && this.selectedTicket) {
      // UPDATE
      this.ticketService.updateTicket(this.selectedTicket._id!, ticketData).subscribe({
        next: () => {
          this.showTicketModal = false;
          this.loadMyTickets();
          alert('Ticket modifié avec succès');
        },
        error: () => alert('Erreur lors de la modification')
      });
    } 
  }

  calculatePriority(urgency: string, impact: string): string {
    if (urgency === 'high' || impact === 'high') return 'high';
    if (urgency === 'low' && impact === 'low') return 'low';
    return 'medium';
  }
  viewTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.showTicketDetail = true;
  }
  updateStatus(status: string) {
    if (!this.selectedTicket) return;

    this.ticketService.updateTicket(this.selectedTicket._id!, { status }).subscribe({
      next: () => {
        alert('Statut mis à jour avec succès!');
        this.loadMyTickets();
        if (this.selectedTicket) {
          this.selectedTicket.status = status;
        }
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteTicket(id?: string) {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) return;
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.loadMyTickets();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        alert('Erreur lors de la suppression du ticket');
      }
    });
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

}