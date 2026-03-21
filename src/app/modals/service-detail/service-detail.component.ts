import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, 
  IonList, IonItem, IonLabel, IonNote, IonProgressBar, IonText, IonFooter, 
  ModalController, AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, helpCircleOutline, downloadOutline, addOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonNote, IonProgressBar, IonText, IonFooter],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
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
      <!-- Status Card -->
      <div class="status-card" [class]="statusColor">
        <div class="icon-wrapper">
          <ion-icon [name]="icon" size="large"></ion-icon>
        </div>
        <h2>{{ status }}</h2>
        <p>{{ daysRemaining }}</p>
        
        <div class="progress-container" *ngIf="progress >= 0">
          <ion-progress-bar [value]="progress"></ion-progress-bar>
          <div class="progress-labels">
            <span>{{ progressStartLabel }}</span>
            <span>{{ progressEndLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Info Details -->
      <ion-list lines="none" class="details-list">
        <ion-item>
          <ion-label>
            <h3>Próximo Vencimiento</h3>
            <p>{{ nextDate === 'N/A' ? 'No disponible' : (nextDate | date:'mediumDate') }}</p>
          </ion-label>
          <ion-icon name="time-outline" slot="end" color="medium"></ion-icon>
        </ion-item>
        <ion-item *ngIf="lastDate">
          <ion-label>
            <h3>Última Emisión/Servicio</h3>
            <p>{{ lastDate === 'N/A' ? 'No disponible' : (lastDate | date:'mediumDate') }}</p>
          </ion-label>
        </ion-item>
        <ion-item *ngIf="policyNumber !== 'N/A'">
          <ion-label>
            <h3>Referencia / Póliza</h3>
            <p>{{ policyNumber }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Ad / Promo -->
      <div class="ad-card" *ngIf="adText">
        <p>{{ adText }}</p>
      </div>

      <!-- History -->
      <div class="history-section" *ngIf="history && history.length > 0">
        <h3>Historial</h3>
        <ion-list>
          <ion-item *ngFor="let record of history">
            <ion-label>
              <h2>{{ record.date | date:'shortDate' }}</h2>
              <p>{{ record.provider }}</p>
            </ion-label>
            <ion-note slot="end">{{ record.status || 'Completado' }}</ion-note>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start" *ngIf="showDownload">
          <ion-button color="medium">
            <ion-icon slot="start" name="download-outline"></ion-icon>
            {{ downloadLabel }}
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button color="primary" fill="solid" (click)="performAction()">
            {{ actionLabel }}
            <ion-icon slot="end" name="add-outline" *ngIf="!showDownload"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .status-card { 
      text-align: center; 
      padding: 30px 20px; 
      border-radius: 24px; 
      margin-bottom: 24px; 
      background: #f4f5f8; 
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);
    }
    .status-card.success { background: linear-gradient(135deg, #2dd36f 0%, #10dc60 100%); }
    .status-card.warning { background: linear-gradient(135deg, #ffc409 0%, #fb8c00 100%); }
    .status-card.danger { background: linear-gradient(135deg, #eb445a 0%, #f04141 100%); }
    
    .icon-wrapper { 
      background: rgba(255,255,255,0.25); 
      width: 72px; height: 72px; 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; 
      margin: 0 auto 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .status-card h2 { margin: 8px 0; font-weight: 800; font-size: 1.6rem; letter-spacing: 0.5px; }
    .progress-container { margin-top: 24px; background: rgba(0,0,0,0.15); border-radius: 12px; padding: 6px; }
    ion-progress-bar { --background: transparent; --progress-background: #fff; height: 8px; border-radius: 4px; }
    .progress-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.8rem; font-weight: 600; opacity: 0.9; }
    
    .ad-card { background: var(--ion-color-tertiary-tint); color: var(--ion-color-tertiary-shade); padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 0.95rem; text-align: center; font-weight: 500; border: 1px solid rgba(var(--ion-color-tertiary-rgb), 0.2); }
    .history-section h3 { padding-left: 16px; margin-bottom: 12px; font-size: 1.1rem; font-weight: 700; color: var(--ion-color-dark); }
  `]
})
export class ServiceDetailComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() plate: string = '';
  @Input() policyNumber: string = '';
  @Input() history: any[] = [];
  @Input() status: string = '';
  @Input() statusColor: string = '';
  @Input() progressBarColor: string = '';
  @Input() daysRemaining: string = '';
  @Input() nextDate: string = '';
  @Input() lastDate: string = '';
  @Input() progress: number = 0;
  @Input() showDownload: boolean = false;
  @Input() downloadLabel: string = 'Descargar';
  @Input() adText: string = '';
  @Input() actionLabel: string = 'Acción';
  @Input() helpText: string = '';
  @Input() progressStartLabel: string = '';
  @Input() progressEndLabel: string = '';

  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  constructor() { addIcons({ closeOutline, helpCircleOutline, downloadOutline, addOutline, timeOutline }); }

  close() { this.modalCtrl.dismiss(); }
  performAction() { this.modalCtrl.dismiss({ action: true }); }
  
  async showHelp() {
    const alert = await this.alertCtrl.create({ header: 'Información', message: this.helpText, buttons: ['Entendido'] });
    await alert.present();
  }
}