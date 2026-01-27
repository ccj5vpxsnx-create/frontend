import { Component } from '@angular/core';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-client-dashboard',
  imports: [],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})
export class ClientDashboard {
username = '';
  constructor(private authService: Authservice) {}
  ngOnInit() {
    const user = this.authService.getUser();
    this.username = user || 'Client';
  }
  logout() {
    this.authService.logout();
  }
}
