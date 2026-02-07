import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { TicketService } from '../../services/ticket.service';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { ConversationService } from '../../services/conversation.service';
import { Ticket } from '../../interfaces/tiket';
import { Conversation } from '../../interfaces/conversation';
import { Message } from '../../interfaces/message';
import { TicketStats } from '../../interfaces/TicketStats';
import { User } from '../../interfaces/user';
import { Category } from '../../interfaces/category';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgClass, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  currentView: 'tickets' | 'technicians' | 'categories' | 'stats' | 'clients' | 'conversations' = 'stats';
  tickets: Ticket[] = [];
  technicians: User[] = [];
  categories: Category[] = [];
  stats: TicketStats | null = null;
  clients: User[] = [];

  // Conversation & Chat
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessageContent = '';
  showCreateConversationModal = false;
  conversationTicketId = '';
  conversationClientId = '';



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
    private conversationService: ConversationService,
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

  changeView(view: 'tickets' | 'technicians' | 'categories' | 'stats' | 'clients' | 'conversations') {
    this.currentView = view;
    if (view === 'conversations') {
      this.loadConversations();
    }
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
      adminId: this.currentUser.id,
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
      technicianId: this.selectedTechnicianId,
      adminId: this.currentUser.id
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
      (response: any) => {
        this.clients = Array.isArray(response) ? response : (response?.items || []);
      },
      (err) => {
        console.error('Erreur lors du chargement des clients', err);
        this.clients = [];
      }
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



  // ========== CONVERSATIONS & MESSAGES ==========

  loadConversations() {
    this.conversationService.getMyConversations().subscribe(
      (convs: any) => {
        this.conversations = Array.isArray(convs) ? convs : (convs?.items || []);
      },
      (err) => {
        console.error('Erreur chargement conversations', err);
        this.conversations = [];
      }
    );
  }

  openCreateConversationModal() {
    this.conversationTicketId = '';
    this.conversationClientId = '';
    this.loadTickets();
    this.loadclient();
    this.showCreateConversationModal = true;
  }

  onTicketSelectForConversation() {
    console.log('Ticket sélectionné:', this.conversationTicketId);
    console.log('Tickets disponibles:', this.tickets);
    if (this.conversationTicketId) {
      const ticket = this.tickets.find(t => t._id === this.conversationTicketId);
      console.log('Ticket trouvé:', ticket);
      if (ticket?.clientId) {
        this.conversationClientId = ticket.clientId?._id || ticket.clientId;
        console.log('Client auto-sélectionné:', this.conversationClientId);
      }
    }
  }

  createConversation() {
    console.log('Création conversation - TicketId:', this.conversationTicketId, 'ClientId:', this.conversationClientId);
    if (!this.conversationTicketId) {
      alert('Veuillez sélectionner un ticket');
      return;
    }

    // Participants: admin + client (si disponible)
    const participants = [this.currentUser.id];
    if (this.conversationClientId) {
      participants.push(this.conversationClientId);
    }

    const conversation: Conversation = {
      type: 'private',
      participants: participants,
      createdBy: this.currentUser.id,
      ticketId: this.conversationTicketId
    };

    this.conversationService.createConversation(conversation).subscribe(
      (conv) => {
        this.showCreateConversationModal = false;
        this.loadConversations();
        this.openConversation(conv);
        alert('Conversation créée avec succès');
      },
      (err) => {
        alert('Erreur lors de la création de la conversation');
        console.error(err);
      }
    );
  }

  openConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    if (conversation._id) {
      this.loadMessages(conversation._id);
    } else {
      this.messages = [];
    }
  }

  loadMessages(conversationId: string) {
    if (!conversationId) {
      this.messages = [];
      return;
    }
    this.conversationService.getMessages(conversationId).subscribe(
      (msgs: any) => {
        this.messages = Array.isArray(msgs) ? msgs : (msgs?.items || []);
      },
      (err) => {
        console.error('Erreur chargement messages', err);
        this.messages = [];
      }
    );
  }

  sendMessage() {
    if (!this.newMessageContent.trim() || !this.selectedConversation) return;
    if (!this.selectedConversation._id) {
      alert('Erreur: conversation invalide. Veuillez rouvrir la conversation.');
      return;
    }

    const message: Message = {
      conversationId: this.selectedConversation._id,
      sender: this.currentUser.id,
      senderName: this.currentUser.username,
      content: this.newMessageContent.trim()
    };

    this.conversationService.sendMessage(message).subscribe(
      (msg) => {
        this.messages.push(msg);
        this.newMessageContent = '';
      },
      (err) => {
        console.error('Erreur envoi message', err);
        alert('Erreur lors de l\'envoi du message');
      }
    );
  }

  isMyMessage(msg: Message): boolean {
    const senderId = (msg.sender as any)?._id || msg.sender;
    return senderId === this.currentUser.id;
  }

  closeConversation() {
    this.selectedConversation = null;
    this.messages = [];
    this.newMessageContent = '';
  }

  openConversationByTicket(ticketId: string) {
    const ticket = this.tickets.find(t => t._id === ticketId);
    this.conversationService.getConversationByTicket(ticketId).subscribe(
      (conv) => {
        this.currentView = 'conversations';
        this.loadConversations();
        this.openConversation(conv);
      },
      (err) => {
        // Aucune conversation existante → en créer une automatiquement
        const clientId = ticket?.clientId?._id || ticket?.clientId;
        if (!clientId) {
          alert('Ce ticket n\'a pas de client associé. Impossible de créer une conversation.');
          return;
        }
        const conversation: Conversation = {
          type: 'private',
          participants: [this.currentUser.id, clientId],
          createdBy: this.currentUser.id,
          ticketId: ticketId
        };
        this.conversationService.createConversation(conversation).subscribe(
          (newConv) => {
            this.currentView = 'conversations';
            this.loadConversations();
            this.openConversation(newConv);
          },
          (createErr) => {
            alert('Erreur lors de la création de la conversation');
            console.error(createErr);
          }
        );
      }
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