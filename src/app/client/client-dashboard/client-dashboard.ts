import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf, DatePipe, SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { TicketService, Ticket } from '../../services/ticket.service';
import { CategoryService, Category } from '../../services/category.service';
import { ConversationService, Conversation, Message } from '../../services/conversation.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, NgFor, NgIf, DatePipe, SlicePipe],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css'
})
export class ClientDashboard implements OnInit {
  currentUser: any = null;
  myTickets: Ticket[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  // Créer un ticket
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

  // Conversation
  selectedTicket: Ticket | null = null;
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
      error: (err) => {
        this.error = 'Erreur lors du chargement des tickets';
        this.loading = false;
      }
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

  openConversation(ticket: Ticket) {
    this.selectedTicket = ticket;

    // Vérifier si une conversation existe
    this.conversationService.getConversationByTicket(ticket._id!).subscribe({
      next: (conv) => {
        this.conversation = conv;
        this.loadMessages();
        this.showConversation = true;
      },
      error: (err) => {
        // Pas de conversation encore
        alert('Aucune conversation n\'a été ouverte par le support pour ce ticket');
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
