import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../services/authservice';

@Component({
  selector: 'app-technicien-dashboard',
  imports: [],
  templateUrl: './technicien-dashboard.html',
  styleUrl: './technicien-dashboard.css',
})
export class TechnicienDashboard implements OnInit {
  username = '';

  constructor(private authService: Authservice) {}
  
  ngOnInit() {
    const user = this.authService.getUser();
    this.username = user || 'Technicien';
  }
  
  logout() {
    this.authService.logout();
  }
}