import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { TicketService } from '../../services/ticket.service';
import { UserService } from '../../services/user.service';
import { CategoryService, Category } from '../../services/category.service';
import { Ticket } from '../../interfaces/tiket';

import { TicketStats } from '../../interfaces/TicketStats';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgClass, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  currentView: 'tickets' | 'technicians' | 'categories' | 'stats' | 'clients' = 'stats';
  tickets: Ticket[] = [];
  technicians: User[] = [];
  categories: Category[] = [];
  stats: TicketStats | null = null;
  clients: User[] = [];



  page = 1;
  limit = 10;
  total = 0;
  loading = false;
  error = '';

  currentUser: any = null;

  showAssignModal = false;
  selectedTicket: Ticket | null = null;
  selectedTechnicianId = '';

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

  showClientModal = false;
  clientForm = {
    username: '',
    email: '',
    password: ''
  };
  rechercheCategorie = '';

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
    this.loadAllData();
  }

  loadAllData() {
    this.loadStats();
    this.loadTickets();
    this.loadTechnicians();
    this.loadCategories();
    this.loadclient();
  }

  changeView(view: 'tickets' | 'technicians' | 'categories' | 'stats' | 'clients') {
    this.currentView = view;
  }
  loadStats() {
    this.ticketService.getStats().subscribe((stats) => {
      this.stats = stats;
    },);
  }

  loadTickets() {
    this.loading = true;
    this.ticketService.getTickets({ page: this.page, limit: this.limit }).subscribe((response) => {
      this.tickets = response.items;
      this.total = response.total;
      this.loading = false;
    },
    );
  }
  CreateTicket() {
    this.isEditingTicket = false;
    this.selectedTicket = null;
    this.ticketForm = {
      title: '',
      description: '',
      type: '',
      category: '',
      urgency: 'medium',
      impact: '',
      location: '',
      status: 'new'
    };
    this.showTicketModal = true;
  }

  openEditTicketModal(ticket: Ticket) {
    this.isEditingTicket = true;
    this.selectedTicket = ticket;
    this.ticketForm = {
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      category: ticket.category?._id || ticket.category,
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
    const ticketData: any = {
      ...this.ticketForm,
      requester: this.isEditingTicket && this.selectedTicket ? this.selectedTicket.requester : this.currentUser.id
    };

    if (this.isEditingTicket && this.selectedTicket) {
      this.ticketService.updateTicket(this.selectedTicket._id!, ticketData).subscribe(
        () => {
          this.showTicketModal = false;
          this.loadTickets();
          this.loadStats();
          alert('Ticket modifié avec succès');
        },
        () => alert('Erreur lors de la modification')
      );
    } else {
      this.ticketService.createTicket(ticketData).subscribe(
        () => {
          this.showTicketModal = false;
          this.loadTickets();
          this.loadStats();
          alert('Ticket créé avec succès');
        },
        () => alert('Erreur lors de la création')
      );
    }
  }

  deleteTicket(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket?')) return;

    this.ticketService.deleteTicket(id).subscribe(
      () => {
        this.loadTickets();
        this.loadStats();
      },
      (err) => console.error('Erreur lors de la suppression', err)
    );
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
    }).subscribe(
      () => {
        this.showAssignModal = false;
        this.loadTickets();
        this.loadStats();
      },
      (err) => {
        alert('Erreur lors de l\'assignation');
        console.error(err);
      }
    );
  }

  loadTechnicians() {
    this.userService.getUsers({ type: 'technician' }).subscribe(
      (response) => {
        this.technicians = response.items;
      },
      (err) => console.error('Erreur lors du chargement des techniciens', err)
    );
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
      password: this.technicianForm.password,
      type: 'technician'
    } as User).subscribe(
      () => {
        this.showTechnicianModal = false;
        this.loadTechnicians();
      },
      (err) => console.error('Erreur lors de l\'ajout', err)
    );
  }

  deleteTechnician(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce technicien?')) return;

    this.userService.deleteUser(id).subscribe(
      () => {
        this.loadTechnicians();
      },
      (err) => {
        alert('Erreur lors de la suppression');
        console.error(err);
      }
    );
  }

  loadclient() {
    this.userService.getUsers({ type: 'client' }).subscribe(
      (response) => {
        this.clients = response.items;
      },
      (err) => console.error('Erreur lors du chargement des clients', err)
    );
  }

  addclient() {
    if (!this.clientForm.username || !this.clientForm.email || !this.clientForm.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.userService.createUser({
      username: this.clientForm.username,
      email: this.clientForm.email,
      password: this.clientForm.password,
      type: 'client'
    } as User).subscribe(
      () => {
        this.showClientModal = false;
        this.loadclient();
      },
      (err) => console.error('Erreur lors de l\'ajout', err)
    );
  }

  deleteclient(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client?')) return;

    this.userService.deleteUser(id).subscribe(
      () => {
        this.loadclient();
      },
      (err) => {
        alert('Erreur lors de la suppression');
        console.error(err);
      }
    );
  }

  loadCategories() {
    this.categoryService.getCategories(this.page, this.limit, this.rechercheCategorie).subscribe(
      (response) => {
        this.categories = response.items;
        this.total = response.total;
      },
      (err) => console.error('Erreur lors du chargement des catégories', err)
    );
  }
  onCategorySearch() {
    this.page = 1;
    this.loadCategories();
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
      this.categoryService.updateCategory(this.editingCategory._id!, this.categoryForm).subscribe(
        () => {
          this.showCategoryModal = false;
          this.loadCategories();
          alert('Catégorie modifiée avec succès!');
        },
        (err) => console.error('Erreur lors de la modification', err)
      );
    } else {
      this.categoryService.createCategory(this.categoryForm as Category).subscribe(() => {
        this.showCategoryModal = false;
        this.loadCategories();
        alert('Catégorie ajoutée avec succès!');
      },
        (err) => console.error('Erreur lors de l\'ajout', err)
      );
    }
  }
  deleteCategory(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) return;
    this.categoryService.deleteCategory(id).subscribe(() => {
      this.loadCategories();
      alert('Catégorie supprimée avec succès!');
    },
      (err) => console.error('Erreur lors de la suppression', err)
    );
  }



  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'new': 'bg-primary',
      'assigned': 'bg-info',
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'new': 'Nouveau',
      'assigned': 'Assigné',
      'in_progress': 'En cours',
      'waiting': 'En attente',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'new': 'primary',
      'assigned': 'info',
      'in_progress': 'warning',
      'waiting': 'secondary',
      'resolved': 'success',
      'closed': 'dark'
    };
    return colors[status] || 'info';
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'new': 'bi-plus-circle',
      'assigned': 'bi-person-check',
      'in_progress': 'bi-arrow-repeat',
      'waiting': 'bi-clock',
      'resolved': 'bi-check-circle',
      'closed': 'bi-x-circle'
    };
    return icons[status] || 'bi-circle';
  }
}