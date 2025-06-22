import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../../services/user.service';
import { IUserForm, IUserResponse } from '../../shared/models/user.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserFormComponent } from '../../components/forms/user-form/user-form.component';
import { UserHelper } from '../../shared/helpers/user.helper';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    UserFormComponent
  ],
  providers: [
    ConfirmationService, MessageService
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class UsersComponent implements OnInit {

  @ViewChild('createUserForm') userFormComponent?: UserFormComponent;

  createFormVisible = false;

  editFormVisible = false;
  editUser?: IUserForm;
  isSubmittingForm = false;

  constructor(
    private _userService: UserService,
    private _authService: AuthService,
    private _router: Router,
    private _confirmationService: ConfirmationService,
    private _messageService: MessageService,
  ) { }
  // Métodos para o modal de criação de usuário
  openCreateModal() {
    this.createFormVisible = true;
  }

  handleCreateUser(event: IUserForm) {
    this.isSubmittingForm = true;

    this._userService.createUser(event as IUserForm).subscribe({
      next: () => {
        this._messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado com sucesso.' });
        this.closeCreateModal();
        this._loadUsers();
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        this._messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar o usuário.' });
      }
    })
      .add(() => {
        this.isSubmittingForm = false;
      })
  }

  closeCreateModal() {
    if (this.userFormComponent) {
      this.userFormComponent.handleCancel();
    };

    this.createFormVisible = false;
  }


  // Métodos para o modal de edição de usuário
  openEditModal(user: IUserForm): void {
    this.editUser = user;
    this.editFormVisible = true;

    this._userService.getUserByEmail(user.email).subscribe({
      next: (userData) => {
        if (userData) {
        } else {
          console.warn('Usuário não encontrado');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar usuário:', err);
      }
    });
  }

  handleEditUser(event: IUserForm) {
    this.isSubmittingForm = true;

    this._userService.updateUserById({
      id: event.id as number,
      user: event as IUserForm
    }).subscribe({
      next: (response) => {
        this._messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado com sucesso.' });
        this.closeEditModal();
        this._loadUsers();

        const isCurrentUser = UserHelper.getUserInfo()?.id === response.id;
        if (isCurrentUser) {
          UserHelper.setUserInfo(response);
          window.location.reload();
        }
      },
      error: (err) => {
        console.error('Erro ao atualizar usuário:', err);
        this._messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o usuário.' });
      }
    })
      .add(() => {
        this.isSubmittingForm = false;
      })
  }

  closeEditModal() {
    this.editFormVisible = false;
    this.editUser = undefined;
  }


  confirmDelete(id: number, event: Event) {

    const isCurrentUser = UserHelper.getUserInfo()?.id === id;

    this._confirmationService.confirm({
      target: event.target as EventTarget,
      message: isCurrentUser ? 'Tem certeza que deseja deletar seu próprio usuário?' : 'Tem certeza que deseja deletar este usuário?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this._messageService.add({ severity: 'info', summary: 'Processando', detail: 'Sua ação está em processamento.' });

        this._userService.deleteUserById(id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário deletado com sucesso.' });
            this._loadUsers();

            if (isCurrentUser) {
              this._authService.logout();
            }

          },
          error: (err) => {
            console.error('Erro ao deletar usuário:', err);
            this._messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o usuário.' });
          }
        })
      },
      reject: () => { }
    });
  }

  ngOnInit(): void {
    this._loadUsers();
  }

  users = signal<IUserResponse[]>([]);


  private _loadUsers() {
    this._userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });
  }
}
