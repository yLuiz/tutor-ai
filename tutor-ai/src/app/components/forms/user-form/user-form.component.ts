import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUserForm, IUserResponse } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnDestroy, OnInit {
  @Input() userData?: IUserForm;

  @Output() onSave = new EventEmitter<IUserForm>();
  @Output() onCancel = new EventEmitter<void>();

  @Input() isSubmitting = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['admin', Validators.required],
    isActive: [1, Validators.required]

  });

  constructor(private fb: FormBuilder) {
    effect(() => {
      if (this.userData) {
        this.form.patchValue({
          name: this.userData.name,
          email: this.userData.email,
          role: this.userData.role,
          isActive: Number(this.userData.isActive)
        });
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
      }
    });
  }

  handleCancel() {
    this._resetForm();
    this.onCancel.emit();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void { }

  save() {
    if (this.form.valid) {
      this.onSave.emit({
        id: this.userData?.id || 0,
        name: this.form.value.name ?? '',
        email: this.form.value.email ?? '',
        password: this.form.value.password ?? '',
        role: this.form.value.role ?? 'admin',
        isActive: Boolean(Number(this.form.value.isActive))
      });

    } else {
      this.form.markAllAsTouched();
    }
  }

  private _resetForm() {
    this.form.reset({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      isActive: 1
    });
  }
}
