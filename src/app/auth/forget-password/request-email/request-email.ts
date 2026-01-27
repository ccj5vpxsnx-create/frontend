import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-request-email',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './request-email.html',
  styleUrl: './request-email.css',
})
export class RequestEmail {
  // Variables
  email = '';
  error = '';
  loading = false;

  constructor(
    private authService: Authservice,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email) {
      this.error = 'Veuillez entrer votre email';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.requestResetPassword(this.email).subscribe(
      (response) => {
        this.loading = false;
        this.router.navigate(['/auth/verify-code'], { 
          state: { email: this.email }
        });
      },
      (err) => {
        this.loading = false;
        this.error = 'Email introuvable';
      }
    );
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}