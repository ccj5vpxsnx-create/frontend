import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './verify-code.html',
  styleUrl: './verify-code.css',
})
export class VerifyCode implements OnInit {
  email = '';
  code = '';
  error = '';
  success = '';
  loading = false;

  constructor(
    private authService: Authservice,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.email = navigation.extras.state['email'];
    }
  }

  ngOnInit() {
    if (!this.email) {
      this.router.navigate(['/auth/request-email']);
    }
  }

  onSubmit() {
    if (!this.code) {
      this.error = 'Veuillez entrer le code';
      return;
    }

    if (this.code.length !== 6) {
      this.error = 'Le code doit contenir 6 chiffres';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyResetCode(this.email, this.code).subscribe(
      (response) => {
        this.loading = false;
        this.router.navigate(['/auth/reset-password'], { 
          state: { 
            email: this.email,
            code: this.code 
          }
        });
      },
      
    );
  }

  resendCode() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.requestResetPassword(this.email).subscribe(
      (response) => {
        this.loading = false;
        this.success = 'Code renvoyé avec succès !';
        setTimeout(() => {
          this.success = '';
        }, 3000);
},
      
    );
  }

  goBack() {
    this.router.navigate(['/auth/request-email']);
  }
}