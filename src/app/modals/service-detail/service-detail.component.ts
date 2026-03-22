import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, 
  IonLabel, IonNote, IonProgressBar, IonFooter,
  ModalController, AlertController, IonFab, IonFabButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, helpCircleOutline, downloadOutline, addOutline, timeOutline, imageOutline, informationCircleOutline, locationOutline, checkmarkCircle, listOutline, chevronDownOutline, chevronUpOutline, calendarOutline, checkmarkCircleOutline, sparklesOutline, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel, IonNote, IonProgressBar, IonFooter, IonFab, IonFabButton],
  template: `
    <ion-header class="ion-no-border">
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
      
      <!-- Plate & Policy -->
      <div class="header-section">
        <h1 class="plate-title">{{ plate }}</h1>
        @if (policyNumber !== 'N/A' && policyNumber) {
          <p class="policy-subtitle">Ref: {{ policyNumber }}</p>
        }
      </div>

      <!-- Status Row -->
      <div class="status-container">
        <div class="status-icon" [class]="statusColor">
          <ion-icon [name]="icon"></ion-icon>
        </div>
        <div class="status-details">
          <h2 [class]="statusColor">{{ status }}</h2>
          <p class="days-remaining">{{ daysRemaining }}</p>
        </div>
      </div>

      <!-- Progress -->
      @if (progress >= 0) {
        <div class="progress-section">
          <ion-progress-bar [value]="progress" [color]="computedProgressBarColor"></ion-progress-bar>
          <div class="progress-labels">
            <div class="progress-label-group start">
              <span class="label-caption">Inicia</span>
              <span class="label-value">{{ progressStartLabel }}</span>
            </div>
            <div class="progress-label-group end">
              <span class="label-caption">Finaliza</span>
              <span class="label-value">{{ progressEndLabel }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Dates Row -->
      <div class="dates-container">
        <div class="date-item">
          <ion-icon name="calendar-outline" color="primary" class="date-icon"></ion-icon>
          <ion-label>Próxima</ion-label>
          <p>{{ nextDate === 'N/A' ? 'No disponible' : (nextDate | date:'mediumDate') }}</p>
        </div>
        <div class="separator"></div>
        <div class="date-item">
          <ion-icon name="checkmark-circle-outline" color="medium" class="date-icon"></ion-icon>
          <ion-label>Última</ion-label>
          <p>{{ lastDate === 'N/A' ? 'No disponible' : (lastDate | date:'mediumDate') }}</p>
        </div>
      </div>

      <!-- History Header -->
      @if (history && history.length > 0) {
        <div class="history-header" (click)="toggleHistory()">
          <ion-icon name="list-outline" color="medium"></ion-icon>
          <h3>Historial</h3>
          <ion-icon [name]="showHistory ? 'chevron-up-outline' : 'chevron-down-outline'" color="medium"></ion-icon>
        </div>
      }

      <!-- History List -->
      @if (showHistory) {
        <div class="history-list">
          @for (record of history; track record.id) {
            <div class="history-item animate__animated animate__fadeIn">
              <div class="record-info">
                <span class="record-date">{{ record.date | date:'mediumDate' }}</span>
                <span class="record-provider">{{ record.provider }}</span>
              </div>
              <div class="record-status">
                <ion-icon name="checkmark-circle" color="success"></ion-icon>
              </div>
            </div>
          }
        </div>
      }
      
      <!-- Detail Image (if any) -->
      @if (detailImageUrl) {
        <div class="detail-image-container">
          @if (!imageError) {
            <img [src]="detailImageUrl" alt="Ilustración" (error)="imageError = true" (click)="zoomImage(detailImageUrl)" class="zoomable" />
          } @else {
            <div class="image-placeholder">
              <ion-icon name="image-outline" color="medium"></ion-icon>
              <p>No se pudo cargar la ilustración</p>
            </div>
          }
        </div>
      }

      <!-- Recommendations -->
      @if (adText) {
        <div class="recommendations-section animate__animated animate__fadeIn">
          <div class="recommendations-header">
            <ion-icon name="sparkles-outline" color="primary"></ion-icon>
            <ion-note color="medium">Recomendaciones para ti</ion-note>
          </div>
          <div class="ad-card">
             <div class="ad-content">
               <p>{{ adText }}</p>
               
               <!-- Quick Actions inside Recommendation -->
               @if (showAdButtons) {
                 <div class="ad-quick-actions">
                   <div class="action-btn" (click)="downloadSoat()">
                     <div class="action-icon-circle">
                       <ion-icon name="download-outline"></ion-icon>
                     </div>
                     <span>Descargar</span>
                   </div>
                   <div class="action-btn" (click)="openMap()">
                     <div class="action-icon-circle renew">
                       <ion-icon name="refresh-outline"></ion-icon>
                     </div>
                     <span>Renovar</span>
                   </div>
                 </div>
               }
             </div>
          </div>
        </div>
      }

      <!-- FAB for adding new record -->
      @if (showFab) {
        <ion-fab vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button (click)="performAction()">
            <ion-icon name="add-outline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      }
    </ion-content>

    <ion-footer class="ion-no-border custom-fixed-footer">
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (showDownload) {
            <ion-button color="medium" (click)="downloadSoat()">
              <ion-icon slot="start" name="download-outline"></ion-icon>
              {{ downloadLabel }}
            </ion-button>
          }
          @if (showMapButton) {
            <ion-button (click)="openMap()" color="secondary">
              <ion-icon slot="start" name="location-outline"></ion-icon>
              {{ mapButtonLabel }}
            </ion-button>
          }
        </ion-buttons>
        <ion-buttons slot="end">
          @if (!showFab) {
            <ion-button color="primary" fill="solid" (click)="performAction()" class="main-action-btn">
              {{ actionLabel }}
              @if (!showDownload) {
                <ion-icon slot="end" name="add-outline"></ion-icon>
              }
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .header-section { text-align: center; margin-top: 10px; margin-bottom: 25px; }
    .plate-title { font-size: 2.2rem; font-weight: 800; margin: 0; color: var(--ion-color-dark); letter-spacing: 1px; }
    .policy-subtitle { font-size: 0.9rem; color: var(--ion-color-medium); margin: 5px 0 0; }

    .status-container { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px; }
    .status-icon { 
      width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
      font-size: 26px;
    }
    .status-icon.success { background: rgba(var(--ion-color-success-rgb), 0.15); color: var(--ion-color-success); }
    .status-icon.warning { background: rgba(var(--ion-color-warning-rgb), 0.15); color: var(--ion-color-warning); }
    .status-icon.danger { background: rgba(var(--ion-color-danger-rgb), 0.15); color: var(--ion-color-danger); }
    
    .status-details { text-align: left; }
    .status-details h2 { margin: 0; font-size: 1.4rem; font-weight: 700; line-height: 1.2; }
    .status-details h2.success { color: var(--ion-color-success); }
    .status-details h2.warning { color: var(--ion-color-warning); }
    .status-details h2.danger { color: var(--ion-color-danger); }
    .days-remaining { margin: 2px 0 0; font-size: 0.9rem; color: var(--ion-color-medium); }
    
    .progress-section { margin-bottom: 30px; }
    ion-progress-bar { height: 8px; border-radius: 4px; }
    .progress-labels { display: flex; justify-content: space-between; margin-top: 8px; }
    .progress-label-group { display: flex; flex-direction: column; }
    .progress-label-group.end { text-align: right; }
    .label-caption { font-size: 0.75rem; color: var(--ion-color-medium); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .label-value { font-size: 0.9rem; font-weight: 600; color: var(--ion-color-dark); }

    .dates-container { 
      display: flex; justify-content: space-between; align-items: center; 
      background: var(--ion-color-light); border-radius: 16px; padding: 15px 20px; margin-bottom: 30px; 
    }
    .date-item { text-align: center; flex: 1; }
    .date-icon { font-size: 24px; margin-bottom: 4px; display: block; margin-left: auto; margin-right: auto; }
    .date-item ion-label { display: block; font-size: 0.8rem; color: var(--ion-color-medium); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .date-item p { margin: 0; font-weight: 600; font-size: 1rem; color: var(--ion-color-dark); }
    .separator { width: 1px; height: 30px; background: var(--ion-color-medium); opacity: 0.2; }

    .history-header { 
      display: flex; 
      align-items: center; 
      padding: 10px;
      background: var(--ion-color-light);
      border-radius: 12px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }
    .history-header:active {
      background-color: var(--ion-color-light-shade);
    }
    .history-header h3 { flex: 1; margin: 0 0 0 12px; font-size: 1.1rem; font-weight: 600; color: var(--ion-color-dark); }
    .history-header ion-icon { font-size: 22px; }

    .history-list { margin-bottom: 30px; }
    .history-item { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 12px 5px; border-bottom: 1px solid var(--ion-color-light); 
    }
    .record-info { display: flex; flex-direction: column; }
    .record-date { font-weight: 500; font-size: 0.95rem; }
    .record-provider { font-size: 0.85rem; color: var(--ion-color-medium); }

    .recommendations-section { margin-top: 35px; margin-bottom: 40px; }
    .recommendations-header { 
      display: flex; 
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-left: 4px;
    }
    .recommendations-header ion-icon {
      font-size: 18px;
    }
    .recommendations-header ion-note { 
      font-size: 0.85rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      letter-spacing: 0.8px; 
    }
    .ad-card {
      background: linear-gradient(135deg, rgba(var(--ion-color-primary-rgb), 0.08) 0%, rgba(var(--ion-color-primary-rgb), 0.03) 100%);
      padding: 18px 20px;
      border-radius: 18px;
      border: 1px solid rgba(var(--ion-color-primary-rgb), 0.12);
      box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.05);
    }
    .ad-content p { 
      margin: 0 0 16px 0; 
      font-size: 0.95rem; 
      line-height: 1.5; 
      color: var(--ion-color-dark); 
      font-weight: 500;
    }

    .ad-quick-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .action-btn:active {
      opacity: 0.7;
    }
    .action-icon-circle {
      width: 44px;
      height: 44px;
      background: var(--ion-color-primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 10px rgba(var(--ion-color-primary-rgb), 0.3);
    }
    .action-icon-circle.renew {
      background: var(--ion-color-secondary);
      box-shadow: 0 4px 10px rgba(var(--ion-color-secondary-rgb), 0.3);
    }
    .action-btn span {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--ion-color-dark);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .detail-image-container {
      margin: 20px 0;
      text-align: center;
    }
    .detail-image-container img {
      max-width: 100%;
      border-radius: 16px;
      background: var(--ion-color-light, #f4f5f8);
      box-shadow: 0 8px 16px rgba(0,0,0,0.12);
      animation: fadeIn 0.5s ease-in-out;
    }
    .detail-image-container img.zoomable {
      cursor: pointer;
    }

    .image-placeholder {
      border: 2px dashed var(--ion-color-medium-tint);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      color: var(--ion-color-medium-shade);
      animation: fadeIn 0.5s ease-in-out;
    }
    .image-placeholder ion-icon {
      font-size: 48px;
    }
    .image-placeholder p {
      margin-top: 8px;
      font-size: 0.9rem;
    }

    .custom-fixed-footer {
      background: var(--ion-background-color, #fff);
      box-shadow: 0 -8px 20px rgba(0,0,0,0.08);
      padding-bottom: env(safe-area-inset-bottom);
    }
    .custom-fixed-footer ion-toolbar {
      --background: transparent;
      --padding-top: 8px;
      --padding-bottom: 8px;
    }
    .main-action-btn {
      --border-radius: 12px;
      font-weight: 700;
      height: 44px;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
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
  @Input() detailImageUrl: string = '';
  @Input() showMapButton: boolean = false;
  @Input() mapButtonLabel: string = 'Ver talleres';
  @Input() showFab: boolean = false;
  @Input() showAdButtons: boolean = true;
  public imageError = false;
  public showHistory = false;

  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  constructor() { 
    addIcons({ closeOutline, helpCircleOutline, downloadOutline, addOutline, timeOutline, imageOutline, informationCircleOutline, locationOutline, checkmarkCircle, listOutline, chevronDownOutline, chevronUpOutline, calendarOutline, checkmarkCircleOutline, sparklesOutline, refreshOutline });
  }

  close() { this.modalCtrl.dismiss(); }
  performAction() { this.modalCtrl.dismiss({ action: true }); }
  
  async showHelp() {
    const alert = await this.alertCtrl.create({ header: 'Información', message: this.helpText, buttons: ['Entendido'] });
    await alert.present();
  }

  openMap() {
    this.modalCtrl.dismiss({ action: 'open_map' });
  }

  downloadSoat() {
    // In a real app, this would trigger a download. For now, we show an alert or handle via dismissal
    this.alertCtrl.create({
      header: 'Descarga',
      message: 'Tu documento SOAT se está descargando...',
      buttons: ['OK']
    }).then(a => a.present());
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  async zoomImage(url: string) {
    const { ImageZoomComponent } = await import('./image-zoom.component');
    const modal = await this.modalCtrl.create({
      component: ImageZoomComponent,
      componentProps: {
        imageUrl: url
      },
      cssClass: 'image-zoom-modal'
    });
    await modal.present();
  }

  get computedProgressBarColor(): string {
    if (this.progress >= 0.9) return 'danger';
    if (this.progress >= 0.7) return 'warning';
    return 'success';
  }
}
