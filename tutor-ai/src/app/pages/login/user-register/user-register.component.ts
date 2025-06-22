import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent {
  form: FormGroup;
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  isSubmittingForm = false;

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private _router: Router
  ) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password && confirm && password !== confirm
      ? { passwordMismatch: true }
      : null;
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPassword() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  onSubmit() {
    this.isSubmittingForm = true;

    if (this.form.valid) {
      const { name, email, password } = this.form.value;

      this._userService.createUser({
        name, email, password
      }).subscribe({
        next: () => {
          // Handle successful registration
          console.log('User registered successfully');
          this.form.reset();
          this._router.navigate(['/login']);
        },
        error: (error) => {
          // Handle registration error
          console.error('Registration failed', error);
        }
      })
      .add(() => {
        this.isSubmittingForm = false;
      });
    }
  }
}
