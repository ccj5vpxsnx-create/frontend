import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket, Ticketservice } from '../../services/ticketservice';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.html',
  standalone: true,
  imports: [CommonModule],
})
export class TicketList implements OnInit {
  tickets: Ticket[] = [];   
  loading = false;
  error = '';

  constructor(private ticketService: Ticketservice) {}

  ngOnInit(): void {
    this.fetchTickets();
  }

  fetchTickets() {
    this.loading = true;
    this.error = '';
    this.tickets = []; 

    this.ticketService.getTickets().subscribe({
      next: (res) => {
        this.tickets = res?.items || []; 
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur fetch tickets:', err);
        this.error = 'Erreur lors du chargement des tickets';
        this.tickets = []; 
        this.loading = false;
      },
    });
  }
}
