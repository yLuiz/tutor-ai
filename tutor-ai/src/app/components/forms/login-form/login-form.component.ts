import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserHelper } from '../../../shared/helpers/user.helper';
import { UserRoles } from '../../../shared/enums/UserRoles';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    ToastModule
  ],
  providers: [
    ConfirmationService, MessageService
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  form: FormGroup;
  isPasswordVisible = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _userSerivce: UserService,
    private _authService: AuthService,
    private _confirmationService: ConfirmationService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {

    this.isLoading = true;


    if (this.form.valid) {
      this._authService.login(this.form.value.email, this.form.value.password).subscribe({
        next: _ => {
          setTimeout(() => {
            this._router.navigate(['/chat']);
            this.isLoading = false;
          }, 1000);
        },
        error: (err) => {
          console.error('Erro ao fazer login:', err);


          if (err.status === 401) {
            this._messageService.add({
              severity: 'error',
              summary: 'Erro ao fazer login',
              detail: 'Credenciais inválidas. Tente novamente.'
            });
            return;
          }

          if (err.status === 403) {
            this._messageService.add({
              severity: 'error',
              summary: 'Acesso negado',
              detail: 'Você não tem permissão para acessar esta área.'
            });
            return;
          }

          if (err.status >= 500) {
            this._messageService.add({
              severity: 'error',
              summary: 'Erro interno do servidor',
              detail: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
            });
            return;
          }

          if (err.status === 0) {
            this._messageService.add({
              severity: 'error',
              summary: 'Erro de conexão',
              detail: 'Não foi possível conectar ao servidor.'
            });
            return;
          }
        }
      })
        .add(() => {
          this.isLoading = false;
        })
    }
  }

  goToRegister() {
    this._router.navigate(['/login/register']);
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
    const input = document.getElementById('password') as HTMLInputElement;
    input.type = this.isPasswordVisible ? 'text' : 'password';
  }
}
