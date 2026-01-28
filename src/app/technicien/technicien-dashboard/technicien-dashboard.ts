import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf, DatePipe, SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { TicketService, Ticket } from '../../services/ticket.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConversationService, Conversation, Message } from '../../services/conversation.service';

@Component({
  selector: 'app-technicien-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, NgFor, NgIf, DatePipe, SlicePipe],
  templateUrl: './technicien-dashboard.html',
  styleUrl: './technicien-dashboard.css'
})
export class TechnicienDashboard implements OnInit {
  currentUser: any = null;
  myTickets: Ticket[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  // Détails du ticket
  selectedTicket: Ticket | null = null;
  showTicketDetail = false;

  // Create/Edit Modal
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

  // Conversation
  conversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  showConversation = false;

  constructor(
    private ticketService: TicketService,
    private categoryService: CategoryService,
    private conversationService: ConversationService,
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
          this.loadMyTickets();
          alert('Ticket modifié avec succès');
        },
        error: () => alert('Erreur lors de la modification')
      });
    } else {
      // CREATE
      this.ticketService.createTicket(ticketData).subscribe({
        next: () => {
          this.showTicketModal = false;
          this.loadMyTickets();
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

  openConversation() {
    if (!this.selectedTicket) return;

    // Vérifier si une conversation existe déjà
    this.conversationService.getConversationByTicket(this.selectedTicket._id!).subscribe({
      next: (conv) => {
        this.conversation = conv;
        this.loadMessages();
        this.showConversation = true;
      },
      error: (err) => {
        // Pas de conversation, en créer une
        this.createConversation();
      }
    });
  }

  createConversation() {
    if (!this.selectedTicket) return;

    const clientId = this.selectedTicket.clientId?._id || this.selectedTicket.requester;

    this.conversationService.createConversation({
      type: 'private',
      name: `Support - ${this.selectedTicket.title}`,
      participants: [this.currentUser.id, clientId],
      createdBy: this.currentUser.id,
      ticketId: this.selectedTicket._id
    } as Conversation).subscribe({
      next: (conv) => {
        this.conversation = conv;
        this.messages = [];
        this.showConversation = true;
      },
      error: (err) => {
        alert('Erreur lors de la création de la conversation');
      }
    });
  }

  loadMessages() {
    if (!this.conversation) return;

    this.conversationService.getMessages(this.conversation._id!).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des messages');
      }
    });
  }

  sendMessage() {
    if (!this.conversation || !this.newMessage.trim()) return;

    this.conversationService.sendMessage({
      conversationId: this.conversation._id!,
      sender: this.currentUser.id,
      content: this.newMessage
    } as Message).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.newMessage = '';
      },
      error: (err) => {
        alert('Erreur lors de l\'envoi du message');
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

  isMyMessage(senderId: string): boolean {
    return senderId === this.currentUser.id;
  }
}