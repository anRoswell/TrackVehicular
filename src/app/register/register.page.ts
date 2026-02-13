import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonDatetime, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItemDivider } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonDatetime, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItemDivider, FormsModule]
})
export class RegisterPage {
  public user = {
    nombre: '',
    apellido: '',
    nacimiento: '' as string | null,
    sexo: '' as 'M' | 'F' | 'O' | '',
    correo: ''
  };

  constructor(private toastCtrl: ToastController) {}

  async save() {
    if (!this.user.nombre || !this.user.apellido || !this.user.correo) {
      const t = await this.toastCtrl.create({ message: 'Completa los campos requeridos', duration: 2000, color: 'warning' });
      await t.present();
      return;
    }
    // Aquí se integraría el registro real (backend / auth)
    console.log('Register user', this.user);
    const t = await this.toastCtrl.create({ message: 'Registro completado', duration: 2000, color: 'success' });
    await t.present();
  }

  async socialSignIn(provider: 'google' | 'facebook') {
    // Placeholder: implementar OAuth real con Capacitor plugins o SDKs
    const t = await this.toastCtrl.create({ message: `Iniciando sesión con ${provider}`, duration: 1500 });
    await t.present();
    console.log('social sign in:', provider);
  }
}
