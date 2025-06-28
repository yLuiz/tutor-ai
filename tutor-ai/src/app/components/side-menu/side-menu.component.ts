import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { ConversationService } from '../../services/conversation.service';
import { IConversation } from '../../shared/models/conversation.model';
import { SideMenuService } from './side-menu.service';

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
export class SideMenuComponent implements OnInit {

  @Output() onToggle: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  constructor(
    private _router: Router,
    private _confirmationService: ConfirmationService,
    private _authService: AuthService,
    private _conversationService: ConversationService,
    private _sideMenuService: SideMenuService,
    private _route: ActivatedRoute,
    private _messageService: MessageService
  ) { }

  userRoleLabels = UserRoleLabel;
  userLogged: IUserResponse | null = UserHelper.getUserInfo();

  currentYear = new Date().getFullYear();

  conversationsSection = {
    conversations: [] as IConversation[],
    isLoading: false,
    page: 0,
    hasMore: true,
    limit: 10,
  }

  selectedConversationId: string = '';


  canAccess = {
    links: {
      [UserRoles.ADMIN]: [
        '/users',
        '/settings'
      ],
      [UserRoles.COMMON]: [
        '/settings'
      ]
    },
    conversationActions: {
      [UserRoles.ADMIN]: [
        '/chat',
        '/chat/?conversationId=new',
      ],
      [UserRoles.COMMON]: [
        '/chat',
        '/chat/?conversationId=new',
      ]
    }
  }

  conversationActions = [
    {
      label: 'Nova conversa',
      icon: 'pi pi-comment',
      emoji: '💬',
      route: '/chat/?conversationId=new',
      action: () => {
        this._router.navigate(['/chat'], { queryParams: { conversationId: 'new' } });
      },
      description: 'Iniciar uma nova conversa'
    },
  ];

  links = [
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

  shareConversation(conversationId: string) {
    this._conversationService.shareConversation(conversationId).subscribe({
      next: ({ sharedId }) => {
        const url = `${window.location.origin}/shared/${sharedId}`;
        navigator.clipboard.writeText(url).then(() => {
          this._messageService.add({
            severity: 'success',
            summary: 'Compartilhado!',
            detail: 'Link copiado para a área de transferência',
            life: 3000
          });
        });
      },
      error: () => {
        this._messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao compartilhar a conversa',
          life: 3000
        });
      }
    });
  }

  loadConversations() {
    if (this.conversationsSection.isLoading || !this.conversationsSection.hasMore) {
      this._router.navigate(['/chat']);
      return;
    };

    this.conversationsSection.isLoading = true;

    this._conversationService.getConversationsPaginated(this.conversationsSection.page, this.conversationsSection.limit).subscribe({
      next: (data) => {
        this.conversationsSection.conversations.push(...data);
        if (data.length < this.conversationsSection.limit) this.conversationsSection.hasMore = false;
        this.conversationsSection.page++;
      },
      error: (err) => {
        console.error('Erro ao buscar conversas paginadas:', err);
      },
      complete: () => {
        this.conversationsSection.isLoading = false;
      }
    });
  }


  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10;

    if (nearBottom) {
      this.loadConversations();
    }
  }

  navigateToConversation(conversationId: string) {
    this._router.navigate(['/chat'], { queryParams: { conversationId } });

    this.selectedConversationId = conversationId;
  }

  deleteConversation(conversationId: string) {
    this._confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta conversa?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this._conversationService.deleteConversation(conversationId).subscribe({
          next: () => {
            this.conversationsSection.conversations = this.conversationsSection.conversations.filter(c => c.id !== conversationId);
            this.loadConversations();
          },
          error: (err) => {
            console.error('Erro ao excluir conversa:', err);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.watchForConversationUpdates();
    this.watchConversationIdInQueryParams();
    this.loadConversations();
  }

  watchForConversationUpdates() {
    this._sideMenuService.updateConversations.subscribe({
      next: (update) => {
        if (update) {
          this.conversationsSection.conversations = [];
          this.conversationsSection.page = 0;
          this.conversationsSection.hasMore = true;
          this.loadConversations();
        }
      },
      error: (err) => {
        console.error('Erro ao receber atualizações de conversas:', err);
      }
    });
  }

  watchConversationIdInQueryParams() {
    this._route.queryParams.subscribe(params => {
      const conversationId = params['conversationId'];
      if (conversationId && conversationId !== 'new') {
        this.selectedConversationId = conversationId;
      }
    });
  }

}
