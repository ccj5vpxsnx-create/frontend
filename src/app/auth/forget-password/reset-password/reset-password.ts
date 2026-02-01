import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authservice } from '../../../services/authservice';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(
    private authService: Authservice,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.email = navigation.extras.state['email'];
      this.code = navigation.extras.state['code'];
    }
  }

  ngOnInit() {
    if (!this.email || !this.code) {
      this.router.navigate(['/auth/request-email']);
    }
  }
 onSubmit() {
  if (!this.newPassword || !this.confirmPassword) {
    this.error = 'Veuillez remplir tous les champs';
    return;
  }

  if (this.newPassword.length < 6) {
    this.error = 'Le mot de passe doit contenir au moins 6 caractères';
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    this.error = 'Les mots de passe ne correspondent pas';
    return;
  }

  this.loading = true;
  this.error = '';

  console.log('Sending reset password:', { // AJOUT POUR DEBUG
    email: this.email,
    code: this.code,
    newPassword: this.newPassword
  });

  this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe(
    (response) => {
      console.log('Reset success:', response); // AJOUT POUR DEBUG
      this.loading = false;
      alert('Mot de passe changé avec succès !');
      this.router.navigate(['/login']);
    },
    (error) => {  // AJOUT ICI - GESTION D'ERREUR
      console.error('Reset error:', error); // AJOUT POUR DEBUG
      this.loading = false;
      this.error = error.error?.message || 'Erreur lors de la réinitialisation';
    }
  );
}

  goBack() {
    this.router.navigate(['/auth/verify-code'], {
      state: { email: this.email }
    });
  }
}