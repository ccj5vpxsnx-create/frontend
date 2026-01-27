import { Component, OnInit } from '@angular/core';
import { TicketList } from '../ticket-list/ticket-list';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  standalone: true,
  imports: [TicketList],
})
export class AdminDashboard implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
