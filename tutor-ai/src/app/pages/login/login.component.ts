import { Component } from '@angular/core';
import { LoginFormComponent } from '../../components/forms/login-form/login-form.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _messageService: MessageService
  ) { }

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      const reason = params['reason'];
      if (reason && reason === 'expired') {

        console.warn('LoginComponent - Sessão expirada, redirecionando para login.');
        setTimeout(() => {
          this._messageService.add({ severity: 'error', summary: 'Erro', detail: 'Sua sessão expirou. Faça login novamente.' });

          this._cleanQueryParams();
        }, 200);
      }
    });
  }

  private _cleanQueryParams() {
    this._router.navigate([], {
      queryParams: {},
      replaceUrl: true,
      relativeTo: this._route
    });
  }
}
