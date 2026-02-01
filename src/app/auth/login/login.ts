import { Component, OnInit } from '@angular/core';
import { Authservice } from '../../services/authservice';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  username = '';
  password = '';
  error = '';
  loading = false;
  passwordInvalid = false;
  showPassword = false;
  rememberMe = false;

  constructor(
    private authService: Authservice,
    private router: Router
  ) { }

  ngOnInit() {
    const remembered = localStorage.getItem('rememberedUsername');
    if (remembered) {
      this.username = remembered;
      this.rememberMe = true;
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.error = 'Remplissez tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.access_token);
        this.authService.saveAuth(response.access_token, response.user);
        const type = response.user.type;
        if (type === 'admin') this.router.navigate(['/admin']);
        else if (type === 'client') this.router.navigate(['/client']);
        else if (type === 'user') this.router.navigate(['/client']);
        else if (type === 'technician') this.router.navigate(['/technicien']);
        else this.router.navigate(['/login']);

        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        this.loading = false;
      },
      error: (err) => {
        const msg = err?.error?.message?.toLowerCase() || '';
        if (err?.status === 401 || msg.includes('password') || msg.includes('mot de passe')) {
          this.passwordInvalid = true;
          this.error = '';
        }
        this.loading = false;
      }
    });
  }


}
