import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, 
  IonList, IonItem, IonLabel, IonNote, IonBadge, ModalController, AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, helpCircleOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-fines-modal',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonBadge],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="danger">
        <ion-title>Multas y Comparendos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="showHelp()">
            <ion-icon name="help-circle-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="summary-card ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <h2>{{ fines.length }} Pendientes</h2>
        <p *ngIf="summary">Total deuda aprox: <strong>{{ summary.totalAmount | currency }}</strong></p>
      </div>

      <ion-list>
        <ion-item *ngFor="let fine of fines">
          <ion-label>
            <h2>{{ fine.code }} - {{ fine.description }}</h2>
            <p>{{ fine.date | date:'mediumDate' }}</p>
            <p><small>{{ fine.location }}</small></p>
          </ion-label>
          <div slot="end" class="ion-text-end">
            <ion-badge color="danger">{{ fine.amount | currency }}</ion-badge>
            <br>
            <ion-note color="medium" style="font-size: 0.7rem">{{ fine.status }}</ion-note>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    .summary-card { padding: 20px; background: #ffebee; border-radius: 12px; margin-bottom: 20px; color: var(--ion-color-danger-shade); }
    .summary-card h2 { margin: 10px 0 5px; font-weight: bold; }
  `]
})
export class FinesModalComponent {
  @Input() fines: any[] = [];
  @Input() summary: any = null;
  @Input() helpText: string = '';

  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ closeOutline, helpCircleOutline, alertCircleOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async showHelp() {
    const alert = await this.alertCtrl.create({ header: 'Acerca de las multas', message: this.helpText, buttons: ['Entendido'] });
    await alert.present();
  }
}