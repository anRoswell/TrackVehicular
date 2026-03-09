import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonCardContent
  ]
})
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  submitted = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        this.auth.login(email, password, 'user');
        this.router.navigate(['/home']);
      } catch (e) {
        this.error = 'Error en login. Intenta nuevamente.';
      }
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  getErrorEmail(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) return 'Email requerido';
    if (control?.hasError('email')) return 'Email inválido';
    return '';
  }

  getErrorPassword(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Contraseña requerida';
    if (control?.hasError('minlength')) return 'Mínimo 6 caracteres';
    return '';
  }
}
