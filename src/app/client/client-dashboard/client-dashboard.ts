import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { CategoryService } from '../../services/category.service';
import { ConversationService } from '../../services/conversation.service';
import { Authservice } from '../../services/authservice';
import { Conversation } from '../../interfaces/conversation';
import { Message } from '../../interfaces/message';

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

  // Conversations & Chat
  currentView: 'tickets' | 'conversations' = 'tickets';
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessageContent = '';

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
    private conversationService: ConversationService,
    private authService: Authservice,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.loadTickets();
    this.loadCategories();
    this.loadConversations();
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

  // ========== CONVERSATIONS & MESSAGES ==========

  changeView(view: 'tickets' | 'conversations') {
    this.currentView = view;
    if (view === 'conversations') {
      this.loadConversations();
    }
  }

  loadConversations() {
    this.conversationService.getMyConversations().subscribe({
      next: (convs: any) => {
        this.conversations = Array.isArray(convs) ? convs : (convs?.items || []);
      },
      error: (err) => {
        console.error('Erreur chargement conversations', err);
        this.conversations = [];
      }
    });
  }

  openConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    if (conversation._id) {
      this.loadMessages(conversation._id);
    } else {
      this.messages = [];
    }
  }

  openConversationByTicket(ticketId: string) {
    this.conversationService.getConversationByTicket(ticketId).subscribe({
      next: (conv) => {
        if (conv && conv._id) {
          this.currentView = 'conversations';
          this.loadConversations();
          this.openConversation(conv);
        } else {
          alert('Aucune conversation trouvée pour ce ticket. L\'admin doit d\'abord ouvrir une conversation.');
        }
      },
      error: () => {
        alert('Aucune conversation pour ce ticket. L\'admin doit d\'abord ouvrir une conversation.');
      }
    });
  }

  loadMessages(conversationId: string) {
    if (!conversationId) {
      this.messages = [];
      return;
    }
    this.conversationService.getMessages(conversationId).subscribe({
      next: (msgs: any) => {
        this.messages = Array.isArray(msgs) ? msgs : (msgs?.items || []);
      },
      error: (err) => {
        console.error('Erreur chargement messages', err);
        this.messages = [];
      }
    });
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

    this.conversationService.sendMessage(message).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessageContent = '';
      },
      error: (err) => {
        console.error('Erreur envoi message', err);
        alert('Erreur lors de l\'envoi du message');
      }
    });
  }

  closeConversation() {
    this.selectedConversation = null;
    this.messages = [];
    this.newMessageContent = '';
  }

  isMyMessage(msg: Message): boolean {
    const senderId = (msg.sender as any)?._id || msg.sender;
    return senderId === this.currentUser.id;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
