import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserHelper } from '../../shared/helpers/user.helper';
import { IUserProfile } from '../../shared/models/user.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    ToastModule
  ],
  providers: [
    MessageService
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  changePasswordForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private _messageService: MessageService
  ) {

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      bio: ['']
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPass === confirm ? null : { notMatching: true };
  }

  onSubmitProfile() {
    if (this.profileForm.valid) {

      this.isSubmitting = true;

      console.log('Dados salvos:', this.profileForm.value);

      const userId = UserHelper.getUserInfo()?.id!;
      const profile: IUserProfile = {
        id: userId,
        name: this.profileForm.value.name as string,
        email: this.profileForm.value.email as string,
        bio: this.profileForm.value.bio as string,
      };

      this._userService.updateUserProfileById({
        id: UserHelper.getUserInfo()?.id!,
        user: profile
      })
        .subscribe({
          next: (response) => {
            this._messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Perfil atualizado com sucesso!' });
            this._patchProfileForm(response);
          },
          error: (err) => {
            this._messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar perfil.' });
            console.error('Erro ao atualizar perfil:', err);
          }
        })
        .add(() => {
          this.isSubmitting = false
        });
    }
  }

  onSubmitChangePassword() {
    if (this.changePasswordForm.valid) {

      this.isSubmitting = true;

      const { currentPassword, newPassword } = this.changePasswordForm.value;
      const userId = UserHelper.getUserInfo()?.id!;

      this._userService.updatePassword({
        id: userId,
        oldPassword: currentPassword as string,
        newPassword: newPassword as string
      })
        .subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Senha alterada com sucesso!' });
            this.changePasswordForm.reset();
          },
          error: (err) => {
            console.error('Erro ao alterar senha:', err);
            if (err.error?.error) {
              this._messageService.add({ severity: 'error', summary: 'Erro', detail: err.error.error });
              return;
            }

            this._messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao alterar senha.' });
          }
        }).add(() => {
          this.isSubmitting = false;
        });
    }
  }

  ngOnInit(): void {
    this._getUserProfile();
  }

  private _patchProfileForm(userData: IUserProfile) {
    this.profileForm.patchValue({
      name: userData.name,
      email: userData.email,
      bio: userData.bio || ''
    });
  }

  private _patchChangePasswordForm() {
    this.changePasswordForm.patchValue({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }

  private _getUserProfile() {
    const { id: userId } = UserHelper.getUserInfo()!;

    this._userService.getUserById(userId).subscribe({
      next: (userData) => {
        if (userData) {
          this._patchProfileForm(userData);
        } else {
          console.warn('Usuário não encontrado');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar usuário:', err);
      }
    });
  }
}
