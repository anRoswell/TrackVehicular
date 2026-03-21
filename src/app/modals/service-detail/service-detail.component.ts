import { Component, Input, inject, OnInit } from '@angular/core';
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
  IonCard, 
  IonCardContent, 
  IonText,
  IonProgressBar,
  IonNote,
  ModalController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { calendarOutline, shieldCheckmarkOutline, constructOutline, locationOutline, star, downloadOutline, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-service-detail',
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
    IonCard,
    IonCardContent,
    IonText,
    IonProgressBar,
    IonNote
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- PLACA Y POLIZA -->
      <div class="ion-text-center ion-margin-bottom">
        <h1 class="plate-header">{{ plate }}</h1>
        @if (policyNumber) {
          <p class="ion-no-margin policy-text">
            Póliza/Ref: <strong class="ion-text-uppercase">{{ policyNumber }}</strong>
          </p>
        }
      </div>

      <!-- ESTADO ACTUAL -->
      <div class="status-header ion-margin-bottom">
        <div class="icon-container" [ngClass]="statusColor">
          <ion-icon [name]="icon"></ion-icon>
        </div>
        <h2 class="ion-no-margin"><ion-text [color]="statusColor">{{ status }}</ion-text></h2>
      </div>

      <!-- BARRA DE TIEMPO -->
      @if (progress >= 0) {
        <div class="progress-container ion-margin-bottom">
          <ion-progress-bar [value]="progress" [color]="progressBarColor || statusColor"></ion-progress-bar>
          
          <!-- LINEA DE TIEMPO CON FECHAS -->
          @if (lastDate !== 'N/A' && nextDate !== 'N/A') {
            <div class="timeline-labels">
              <!-- Inicio -->
              <div class="timeline-point start">
                <div class="point-date">{{ lastDate | date:'dd/MM/yy' }}</div>
                <div class="point-label">Inicio</div>
              </div>

              <!-- 1 Mes antes -->
              @if (oneMonthBefore) {
                <div class="timeline-point warning" [style.left.%]="warningPos">
                  <div class="point-tick"></div>
                  <div class="point-date">{{ oneMonthBefore | date:'dd/MM/yy' }}</div>
                  <div class="point-label">1 mes antes</div>
                </div>
              }

              <!-- Fin -->
              <div class="timeline-point end">
                <div class="point-date">{{ nextDate | date:'dd/MM/yy' }}</div>
                <div class="point-label">Vence</div>
              </div>
            </div>
          }

          <div class="ion-text-center ion-margin-top">
            <small class="time-left-label">{{ daysRemaining || 'Tiempo restante de vigencia' }}</small>
          </div>
        </div>
      }

      <!-- FECHAS Y DETALLES -->
      <div class="dates-container ion-margin-bottom">
        <div class="date-box">
          <ion-icon name="calendar-outline" color="primary"></ion-icon>
          <p class="label">Próxima</p>
          <h3 class="value">{{ nextDate === 'N/A' ? 'N/A' : (nextDate | date:'dd MMM yyyy') }}</h3>
        </div>
        <div class="date-divider"></div>
        <div class="date-box">
          <ion-icon name="construct-outline" color="medium"></ion-icon>
          <p class="label">Última</p>
          <h3 class="value">{{ lastDate === 'N/A' ? 'N/A' : (lastDate | date:'dd MMM yyyy') }}</h3>
          <small class="provider">{{ lastProvider }}</small>
        </div>
      </div>

      <!-- BOTÓN HISTORIAL -->
      <ion-button expand="block" fill="clear" (click)="toggleHistory()" class="ion-margin-top">
        <ion-icon slot="start" name="time-outline"></ion-icon>
        {{ showHistory ? 'Ocultar Historial' : 'Ver Historial' }}
      </ion-button>

      <!-- LISTA DE HISTORIAL -->
      @if (showHistory) {
        <div class="history-container ion-margin-bottom">
          <ion-list lines="full">
            @for (item of sortedHistory; track item.issuedAt) {
              <ion-item>
                <ion-label>
                  <h3 class="ion-text-wrap">{{ item.provider || 'Proveedor desconocido' }}</h3>
                  <p>Exp: {{ item.issuedAt | date:'dd/MM/yyyy' }} - Vence: {{ item.expiresAt | date:'dd/MM/yyyy' }}</p>
                </ion-label>
                <ion-note slot="end" [color]="item.status === 'VIGENTE' ? 'success' : 'medium'" style="font-size: 0.75rem;">
                  {{ item.status }}
                </ion-note>
              </ion-item>
            } @empty {
              <ion-item>
                <ion-label class="ion-text-center">No hay historial disponible</ion-label>
              </ion-item>
            }
          </ion-list>
        </div>
      }

      <!-- CAJA DE PUBLICIDAD -->
      <ion-card class="ads-card ion-margin-top" color="light">
        <ion-card-content>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <ion-icon name="star" color="warning" style="margin-right: 8px;"></ion-icon>
            <strong>Recomendación para ti</strong>
          </div>
          <p class="ion-no-margin" style="color: #444; font-size: 0.95em;">
            {{ adText }}
          </p>
          <div style="display: flex; align-items: center; margin-top: 10px; font-size: 0.85em; color: var(--ion-color-primary);">
            <ion-icon name="location-outline" style="margin-right: 4px;"></ion-icon>
            <span>Cartagena, Sector El Bosque</span>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- BOTONES DE ACCIÓN -->
      <div class="ion-padding-top action-buttons">
        @if (showDownload) {
          <ion-button expand="block" fill="outline" (click)="download()">
            <ion-icon slot="start" name="download-outline"></ion-icon>
            {{ downloadLabel }}
          </ion-button>
        }
        <ion-button expand="block" shape="round" (click)="performAction()">
          {{ actionLabel }}
        </ion-button>
      </div>
    </ion-content>

    <style>
      .plate-header {
        font-size: 2.5rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: 2px;
        color: var(--ion-color-dark);
      }
      .policy-text {
        color: var(--ion-color-medium);
        font-size: 0.9em;
      }
      .status-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      .status-header .icon-container {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        font-size: 24px;
      }
      .success { background: rgba(var(--ion-color-success-rgb), 0.1); color: var(--ion-color-success); }
      .danger { background: rgba(var(--ion-color-danger-rgb), 0.1); color: var(--ion-color-danger); }
      .warning { background: rgba(var(--ion-color-warning-rgb), 0.1); color: var(--ion-color-warning); }
      
      .dates-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f9f9f9;
        border-radius: 15px;
        padding: 15px;
      }
      .date-box {
        flex: 1;
        text-align: center;
      }
      .date-box ion-icon { font-size: 24px; margin-bottom: 4px; }
      .date-box .label { margin: 0; font-size: 0.8rem; color: var(--ion-color-medium); }
      .date-box .value { margin: 2px 0 0; font-size: 1rem; font-weight: bold; }
      .date-box .provider { display: block; font-size: 0.7rem; color: #888; margin-top: 2px; }
      .date-divider {
        width: 1px;
        height: 40px;
        background: #e0e0e0;
        margin: 0 10px;
      }
      .ads-card {
        border: 1px dashed var(--ion-color-primary);
        box-shadow: none;
        border-radius: 15px;
      }
      .timeline-labels {
        position: relative;
        height: 35px;
        margin-top: 8px;
        font-size: 0.7rem;
        color: var(--ion-color-medium);
      }
      .timeline-point { position: absolute; top: 0; line-height: 1.2; }
      .timeline-point.start { left: 0; text-align: left; }
      .timeline-point.end { right: 0; text-align: right; }
      .timeline-point.warning { transform: translateX(-50%); text-align: center; color: var(--ion-color-warning); }
      .point-date { font-weight: bold; color: var(--ion-color-dark); }
      .point-tick { 
        width: 2px; 
        height: 6px; 
        background: var(--ion-color-warning); 
        margin: -8px auto 2px; /* Pull up to touch progress bar area */
        position: relative;
      }
      .point-label {
        font-size: 0.65rem;
      }
      .time-left-label { color: var(--ion-color-medium); font-style: italic; }
      .history-container {
        background: #fff;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #eee;
      }
      .action-buttons {
        display: flex;
        gap: 10px;
      }
      .action-buttons ion-button {
        flex: 1;
        margin: 0;
      }
    </style>
  `
})
export class ServiceDetailComponent implements OnInit {
  @Input() title = 'Detalle de Servicio';
  @Input() icon = 'construct-outline';
  @Input() plate = '';
  @Input() policyNumber = '';
  @Input() status = 'VIGENTE';
  @Input() statusColor = 'success';
  @Input() progressBarColor = '';
  @Input() daysRemaining = '';
  @Input() history: any[] = [];
  @Input() nextDate = 'N/A';
  @Input() lastDate = 'N/A';
  @Input() lastProvider = 'N/A';
  @Input() progress = 0; // 0 to 1 based on time remaining
  @Input() adText = '¡Realiza tu revisión hoy mismo!';
  @Input() actionLabel = 'Agendar Cita';
  @Input() showDownload = false;
  @Input() downloadLabel = 'Descargar PDF';

  public oneMonthBefore = '';
  public warningPos = 0;
  public showHistory = false;

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ calendarOutline, shieldCheckmarkOutline, constructOutline, locationOutline, star, downloadOutline, timeOutline });
  }

  ngOnInit() {
    this.calculateTimeline();
  }

  calculateTimeline() {
    if (!this.lastDate || !this.nextDate || this.lastDate === 'N/A' || this.nextDate === 'N/A') return;
    
    const start = new Date(this.lastDate).getTime();
    const end = new Date(this.nextDate).getTime();
    
    if (isNaN(start) || isNaN(end) || start >= end) return;

    // Calcular fecha de aviso (30 días antes)
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const targetTime = end - oneMonthMs;
    this.oneMonthBefore = new Date(targetTime).toISOString();
    
    // Calcular posición porcentual
    // Posicionar el indicador visualmente en el medio (50%) para evitar solapamiento con la fecha final
    this.warningPos = 50;
  }

  get sortedHistory() {
    return [...this.history].sort((a, b) => {
      const dateA = new Date(a.issuedAt || 0).getTime();
      const dateB = new Date(b.issuedAt || 0).getTime();
      return dateB - dateA; // Orden descendente (Mayor a menor)
    });
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  performAction() {
    this.modalCtrl.dismiss({ action: true });
  }

  download() {
    this.modalCtrl.dismiss({ action: 'download' });
  }
}
