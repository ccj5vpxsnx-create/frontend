import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { ClientDashboard } from './client/client-dashboard/client-dashboard';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { TechnicienDashboard } from './technicien/technicien-dashboard/technicien-dashboard';
import { RequestEmail } from './auth/forget-password/request-email/request-email';
import { VerifyCode } from './auth/forget-password/verify-code/verify-code';
import { ResetPassword } from './auth/forget-password/reset-password/reset-password';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
  path: 'auth',
  children: [
    { path: 'request-email', component: RequestEmail },
    { path: 'verify-code', component: VerifyCode },
    { path: 'reset-password', component: ResetPassword }
  ]
},
  { path: 'login', component: Login },
  { path: 'admin', component: AdminDashboard },
  { path: 'client', component: ClientDashboard },
  { path: 'technicien', component: TechnicienDashboard },
];