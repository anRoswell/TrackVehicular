import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonCard,
    IonCardContent,
    IonSelect,
    IonSelectOption
  ]
})
export class RegisterPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm!: FormGroup;
  submitted = false;
  error: string | null = null;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['user', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.registerForm.valid) {
      const { name, email, password, role } = this.registerForm.value;
      try {
        // Crear usuario con rol seleccionado
        this.auth.register(name, email, password, role);
        this.router.navigate(['/home']);
      } catch (e) {
        this.error = 'Error en registro. Intenta nuevamente.';
      }
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  getErrorName(): string {
    const control = this.registerForm.get('name');
    if (control?.hasError('required')) return 'Nombre requerido';
    if (control?.hasError('minlength')) return 'Mínimo 3 caracteres';
    return '';
  }

  getErrorEmail(): string {
    const control = this.registerForm.get('email');
    if (control?.hasError('required')) return 'Email requerido';
    if (control?.hasError('email')) return 'Email inválido';
    return '';
  }

  getErrorPassword(): string {
    const control = this.registerForm.get('password');
    if (control?.hasError('required')) return 'Contraseña requerida';
    if (control?.hasError('minlength')) return 'Mínimo 6 caracteres';
    return '';
  }

  getErrorConfirmPassword(): string {
    const control = this.registerForm.get('confirmPassword');
    if (control?.hasError('required')) return 'Confirmación requerida';
    if (this.registerForm.hasError('passwordMismatch')) return 'Las contraseñas no coinciden';
    return '';
  }
}
