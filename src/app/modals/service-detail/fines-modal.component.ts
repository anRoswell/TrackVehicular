import { Component, Input, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonNote,
  ModalController,
  IonFooter
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { receiptOutline, cashOutline } from 'ionicons/icons';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-fines-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    IonNote,
    IonFooter
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Multas Pendientes</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-title size="small">{{ subHeader }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (fines.length > 0) {
        <ion-list lines="full">
          @for (fine of fines; track fine.reference_num || $index) {
            <ion-item button (click)="openFineDetail(fine)">
              <ion-icon name="receipt-outline" slot="start" color="danger"></ion-icon>
              <ion-label>
                <h2 class="fine-ref">{{ fine.infraction_type || 'Multa de Tránsito' }}</h2>
                <p class="fine-details">{{ fine.infraction_date | date:'dd/MM/yyyy' }} • Ref: {{ fine.reference_num || 'N/A' }}</p>
              </ion-label>
              <div slot="end" class="ion-text-right">
                <ion-text color="danger">
                  <h3 class="fine-amount">{{ fine.amount | currency:'COP':'symbol':'1.0-0' }}</h3>
                </ion-text>
                <ion-note>{{ fine.status }}</ion-note>
              </div>
            </ion-item>
          }
        </ion-list>
      } @else {
        <div class="ion-text-center ion-padding">
          <p>No se encontraron multas pendientes.</p>
        </div>
      }
    </ion-content>

    <ion-footer class="ion-no-border ion-padding-horizontal">
      <ion-toolbar>
        <ion-button expand="block" (click)="paySIMIT()" [disabled]="fines.length === 0">
          <ion-icon slot="start" name="cash-outline"></ion-icon>
          Pagar en SIMIT
        </ion-button>
      </ion-toolbar>
    </ion-footer>

    <style>
      .fine-ref { font-weight: bold; }
      .fine-desc { font-size: 0.9em; white-space: normal; }
      .fine-details { font-size: 0.8em; color: var(--ion-color-medium); }
      .fine-amount { font-weight: bold; margin: 0; }
      .fine-discount { font-size: 0.8em; color: var(--ion-color-success); }
    </style>
  `
})
export class FinesModalComponent {
  @Input() fines: any[] = [];
  @Input() summary: any = null;

  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  constructor() {
    addIcons({ receiptOutline, cashOutline });
  }

  get subHeader(): string {
    if (this.summary) {
      const total = this.summary.totalAmount || 0;
      return `Total: ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })} (${this.summary.totalFines} multas)`;
    }
    return `Se encontraron ${this.fines.length} registros`;
  }

  async openFineDetail(fine: any) {
    const message = `
      <div style="text-align: left;">
        <p><strong>Referencia:</strong> ${fine.reference_num || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${fine.infraction_type || 'N/A'}</p>
        <p><strong>Descripción:</strong> ${fine.description || 'N/A'}</p>
        <p><strong>Fecha:</strong> ${fine.infraction_date ? new Date(fine.infraction_date).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Lugar:</strong> ${fine.location || 'N/A'}</p>
        <p><strong>Entidad:</strong> ${fine.issuing_entity || 'N/A'}</p>
        ${fine.discount_amount ? `<p><strong>Descuento:</strong> ${fine.discount_amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>` : ''}
        <p><strong>Estado:</strong> ${fine.status || 'N/A'}</p>
        <p><strong>Monto:</strong> ${fine.amount ? fine.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : 'N/A'}</p>
      </div>
    `;

    const alert = await this.alertCtrl.create({
      header: 'Detalle de la Multa',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  paySIMIT() {
    window.open('https://www.fcm.org.co/simit/', '_blank');
    this.modalCtrl.dismiss({ action: 'pay' });
  }
}