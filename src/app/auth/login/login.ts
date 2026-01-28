import { Component } from '@angular/core';
import { Authservice } from '../../services/authservice';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: Authservice,
    private router: Router
  ) { }

  onLogin() {
    if (!this.username || !this.password) {
      this.error = 'Remplissez tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        // ✅ Stocke correctement le JWT
        localStorage.setItem('token', response.access_token);

        // Sauvegarde le user si nécessaire
        this.authService.saveAuth(response.access_token, response.user);

        // Redirection selon le type
        const type = response.user.type;
        if (type === 'admin') this.router.navigate(['/admin']);
        else if (type === 'user') this.router.navigate(['/client']);
        else if (type === 'technician') this.router.navigate(['/technicien']);
        else this.router.navigate(['/login']); // fallback

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Nom d\'utilisateur ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }


}
