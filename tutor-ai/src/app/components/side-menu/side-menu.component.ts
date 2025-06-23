import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IUserResponse } from '../../shared/models/user.model';
import { UserHelper } from '../../shared/helpers/user.helper';
import { UserRoles } from '../../shared/enums/UserRoles';
import { UserRoleLabel } from '../../shared/enums/UserRoleLabel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [
    ConfirmationService, MessageService
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent {

  @Output() onToggle: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  constructor(
    private _router: Router,
    private _confirmationService: ConfirmationService,
    private _authService: AuthService,
    private _messageService: MessageService
  ) { }

  userRoleLabels = UserRoleLabel;
  userLogged: IUserResponse | null = UserHelper.getUserInfo();

  currentYear = new Date().getFullYear();

  canAccess = {
    [UserRoles.ADMIN]: [
      '/chat',
      '/users',
      '/settings'
    ],
    [UserRoles.COMMON]: [
      '/chat',
      '/settings'
    ]
  }

  links = [
    {
      label: 'Chat',
      icon: 'pi pi-comment',
      emoji: '💬',
      route: '/chat',
      description: 'Correção de textos'
    },
    {
      label: 'Usários',
      icon: 'pi pi-users',
      emoji: '👥',
      route: '/users',
      description: 'Gerenciar usuários'
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      emoji: '⚙️',
      route: '/settings',
      description: 'Perfil e segurança'
    }
  ];

  confirmLogout(event: Event) {
    this._confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Tem certeza que deseja sair?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this._authService.logout();
      },
      reject: () => { }
    });
  }
}
