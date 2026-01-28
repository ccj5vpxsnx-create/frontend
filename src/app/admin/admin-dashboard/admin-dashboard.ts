import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { TicketService, Ticket } from '../../services/ticket.service';
import { UserService, User } from '../../services/user.service';
import { CategoryService, Category } from '../../services/category.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgClass, NgFor, NgIf, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  // Vues
  currentView: 'tickets' | 'technicians' | 'categories' = 'tickets';

  // Données
  tickets: Ticket[] = [];
  technicians: User[] = [];
  categories: Category[] = [];

  // Pagination
  page = 1;
  limit = 10;
  total = 0;

  // Loading
  loading = false;
  error = '';

  // User info
  currentUser: any = null;

  // Modals
  showAssignModal = false;
  selectedTicket: Ticket | null = null;
  selectedTechnicianId = '';

  // Ticket Modal (Create/Edit)
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

  showCategoryModal = false;
  editingCategory: Category | null = null;
  categoryForm = {
    name: '',
    description: ''
  };

  showTechnicianModal = false;
  technicianForm = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private ticketService: TicketService,
    private userService: UserService,
    private categoryService: CategoryService,
    private authService: Authservice,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser || this.currentUser.type !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadTickets();
    this.loadTechnicians();
    this.loadCategories();
  }

  // Changer de vue
  changeView(view: 'tickets' | 'technicians' | 'categories') {
    this.currentView = view;
  }

  // ========== TICKETS ==========
  loadTickets() {
    this.loading = true;
    this.ticketService.getTickets({ page: this.page, limit: this.limit }).subscribe({
      next: (response) => {
        this.tickets = response.items;
        this.total = response.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des tickets';
        this.loading = false;
      }
    });
  }

  // Ouvrir modal Création
  openCreateTicketModal() {
    this.isEditingTicket = false;
    this.selectedTicket = null;
    this.ticketForm = {
      title: '',
      description: '',
      type: 'incident',
      category: '',
      urgency: 'medium',
      impact: 'medium',
      location: '',
      status: 'new'
    };
    this.showTicketModal = true;
  }

  // Ouvrir modal Edition
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
          this.loadTickets();
          alert('Ticket modifié avec succès');
        },
        error: () => alert('Erreur lors de la modification')
      });
    } else {
      // CREATE
      this.ticketService.createTicket(ticketData).subscribe({
        next: () => {
          this.showTicketModal = false;
          this.loadTickets();
          alert('Ticket créé avec succès');
        },
        error: () => alert('Erreur lors de la création')
      });
    }
  }

  calculatePriority(urgency: string, impact: string): string {
    if (urgency === 'high' || impact === 'high') return 'high';
    if (urgency === 'low' && impact === 'low') return 'low';
    return 'medium';
  }

  openAssignModal(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.selectedTechnicianId = ticket.technicianId?._id || '';
    this.showAssignModal = true;
  }

  assignTicket() {
    if (!this.selectedTicket || !this.selectedTechnicianId) return;

    this.ticketService.updateTicket(this.selectedTicket._id!, {
      technicianId: this.selectedTechnicianId
    }).subscribe({
      next: () => {
        this.showAssignModal = false;
        this.loadTickets();
        alert('Ticket assigné avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de l\'assignation');
      }
    });
  }

  deleteTicket(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket?')) return;

    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        this.loadTickets();
        alert('Ticket supprimé avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
      }
    });
  }

  // ========== TECHNICIENS ==========
  loadTechnicians() {
    this.userService.getUsers({ type: 'technician' }).subscribe({
      next: (response) => {
        this.technicians = response.items;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des techniciens';
      }
    });
  }

  openTechnicianModal() {
    this.technicianForm = { username: '', email: '', password: '' };
    this.showTechnicianModal = true;
  }

  addTechnician() {
    if (!this.technicianForm.username || !this.technicianForm.email || !this.technicianForm.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.userService.createUser({
      username: this.technicianForm.username,
      email: this.technicianForm.email,
      type: 'technician'
    } as User).subscribe({
      next: () => {
        this.showTechnicianModal = false;
        this.loadTechnicians();
        alert('Technicien ajouté avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de l\'ajout du technicien');
      }
    });
  }

  deleteTechnician(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce technicien?')) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadTechnicians();
        alert('Technicien supprimé avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
      }
    });
  }

  // ========== CATEGORIES ==========
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.items;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des catégories';
      }
    });
  }

  openCategoryModal(category?: Category) {
    if (category) {
      this.editingCategory = category;
      this.categoryForm = {
        name: category.name,
        description: category.description
      };
    } else {
      this.editingCategory = null;
      this.categoryForm = { name: '', description: '' };
    }
    this.showCategoryModal = true;
  }

  saveCategory() {
    if (!this.categoryForm.name || !this.categoryForm.description) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (this.editingCategory) {
      // Modifier
      this.categoryService.updateCategory(this.editingCategory._id!, this.categoryForm).subscribe({
        next: () => {
          this.showCategoryModal = false;
          this.loadCategories();
          alert('Catégorie modifiée avec succès!');
        },
        error: (err) => {
          alert('Erreur lors de la modification');
        }
      });
    } else {
      // Ajouter
      this.categoryService.createCategory(this.categoryForm as Category).subscribe({
        next: () => {
          this.showCategoryModal = false;
          this.loadCategories();
          alert('Catégorie ajoutée avec succès!');
        },
        error: (err) => {
          alert('Erreur lors de l\'ajout');
        }
      });
    }
  }

  deleteCategory(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) return;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
        alert('Catégorie supprimée avec succès!');
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
      }
    });
  }

  // ========== UTILS ==========
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
