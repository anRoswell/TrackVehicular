import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonDatetime, 
  IonDatetimeButton, 
  IonModal,
  IonFooter,
  IonText,
  IonListHeader,
  IonCheckbox,
  IonProgressBar,
  IonAccordion,
  IonAccordionGroup,
  IonNote,
  IonTextarea,
  IonToggle,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  saveOutline, 
  alertCircleOutline, 
  checkmarkCircleOutline,
  medkitOutline,
  flameOutline,
  constructOutline,
  buildOutline,
  gitCompareOutline,
  warningOutline,
  squareOutline,
  briefcaseOutline,
  discOutline,
  flashlightOutline,
  helpCircleOutline,
  calendarOutline,
  timeOutline,
  documentTextOutline,
  informationCircleOutline,
  addOutline,
  refreshOutline,
  trashOutline,
  cartOutline
} from 'ionicons/icons';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-road-kit-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonDatetime, 
    IonDatetimeButton, 
    IonModal,
    IonFooter,
    IonText,
    IonListHeader,
    IonCheckbox,
    IonProgressBar,
    IonAccordion,
    IonAccordionGroup,
    IonNote,
    IonTextarea,
    IonToggle
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Kit de Carretera</ion-title>
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

    <ion-content [fullscreen]="true" class="ion-padding">
      
      <!-- Resumen y Acciones Rápidas -->
      <div class="summary-card">
        <div class="header-row">
          <ion-text color="dark">
              <h3 class="ion-no-margin">Estado Actual</h3>
          </ion-text>
          <div class="actions">
            <ion-button fill="clear" size="small" (click)="confirmNewInspection()">
              <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
            </ion-button>
            <ion-button fill="solid" color="secondary" size="small" (click)="showStores()">
              <ion-icon slot="start" name="cart-outline"></ion-icon>
              Comprar
            </ion-button>
          </div>
        </div>
        
        <ion-progress-bar [value]="kitProgress" [color]="kitStatus.color" class="kit-progress-bar"></ion-progress-bar>
        
        <div class="status-line">
            <ion-text [color]="kitStatus.color">
                <p class="ion-no-margin"><strong>{{ kitStatus.text }}</strong></p>
            </ion-text>
            <ion-text color="medium">
                <p class="ion-no-margin">{{ checkedItemsCount }} / {{ totalItems }} elementos</p>
            </ion-text>
        </div>
      </div>
      
      <ion-list inset="true">
        <ion-list-header>
          <ion-label>
            Elementos del Kit
            <ion-text color="medium">
              <p class="ion-no-margin" style="font-size: 0.75rem; font-weight: normal; margin-top: 4px;">Selecciona los elementos que posees actualmente</p>
            </ion-text>
          </ion-label>
        </ion-list-header>

        <!-- Checklist Dinámico -->
        @for (item of checklist; track item.name) {
          <ion-item lines="full">
            <ion-icon [name]="item.icon" slot="start" [color]="item.checked ? 'success' : 'medium'"></ion-icon>
            <ion-label>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </ion-label>
            <ion-checkbox slot="end" [(ngModel)]="item.checked" color="success"></ion-checkbox>
          </ion-item>
        }

        <!-- Extintor -->
        @if (extinguisherItem) {
          <ion-item>
            <div slot="start" class="item-icon-wrapper" [style.background-color]="'rgba(var(--ion-color-danger-rgb), 0.1)'">
              <ion-icon [name]="extinguisherItem.icon" color="danger"></ion-icon>
            </div>
            <ion-label>
              <h2>{{ extinguisherItem.name }}</h2>
              <p>
                <ion-text [color]="isValid(items.extinguisher) ? 'success' : 'danger'">
                  {{ isValid(items.extinguisher) ? 'Vigente' : 'Vencido' }}
                </ion-text>
              </p>
            </ion-label>
            <ion-datetime-button datetime="extinguisherDate"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime id="extinguisherDate" presentation="date" [(ngModel)]="items.extinguisher" [showDefaultButtons]="true"></ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>
        }

        <!-- Botiquín -->
        @if (firstAidItem) {
          <ion-item>
            <div slot="start" class="item-icon-wrapper" [style.background-color]="'rgba(var(--ion-color-success-rgb), 0.1)'">
              <ion-icon [name]="firstAidItem.icon" color="success"></ion-icon>
            </div>
            <ion-label>
              <h2>{{ firstAidItem.name }}</h2>
              <p>
                <ion-text [color]="isValid(items.firstAid) ? 'success' : 'danger'">
                  {{ isValid(items.firstAid) ? 'Vigente' : 'Vencido' }}
                </ion-text>
              </p>
            </ion-label>
            <ion-datetime-button datetime="kitDate"></ion-datetime-button>
            <ion-modal [keepContentsMounted]="true">
              <ng-template>
                <ion-datetime id="kitDate" presentation="date" [(ngModel)]="items.firstAid" [showDefaultButtons]="true"></ion-datetime>
              </ng-template>
            </ion-modal>
          </ion-item>
        }
      </ion-list>

      <!-- Notas de la revisión -->
      <div class="notes-section">
        <ion-item lines="none" class="notes-item">
          <ion-label position="stacked">Notas de la revisión</ion-label>
          <ion-textarea 
            [(ngModel)]="notes" 
            placeholder="Ej: Se renovó el extintor, botiquín completo..."
            [autoGrow]="true"
            rows="2">
          </ion-textarea>
        </ion-item>
      </div>

      <!-- Historial -->
      @if (history && history.length > 0) {
        <div class="history-section">
          <h3 class="section-title">Historial de Revisiones</h3>
          <ion-accordion-group>
            @for (record of history; track record.id) {
              <ion-accordion [value]="record.id">
                <ion-item slot="header" color="light">
                  <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
                  <ion-label>
                    {{ record.checkedAt | date:'mediumDate' }}
                    <p>{{ record.checkedAt | date:'shortTime' }}</p>
                  </ion-label>
                  <ion-note slot="end" [color]="getSnapshotStatus(record.snapshot).color">
                    {{ getSnapshotStatus(record.snapshot).text }}
                  </ion-note>
                </ion-item>
                <div class="ion-padding" slot="content">
                  <div class="history-snapshot">
                    <p *ngIf="record.notes"><strong>Comentarios:</strong> {{ record.notes }}</p>
                    <div class="snapshot-grid">
                      @for (item of record.snapshot.checklist; track item.name) {
                        <div class="snapshot-item">
                          <ion-icon [name]="item.icon" [color]="item.checked ? 'success' : 'danger'"></ion-icon>
                          <span>{{ item.name }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </ion-accordion>
            }
          </ion-accordion-group>
        </div>
      }

    </ion-content>

    <ion-footer class="ion-no-border">
      <ion-toolbar class="ion-padding-horizontal ion-padding-bottom">
        <ion-button expand="block" (click)="save()" [disabled]="isSaving" class="save-btn">
          <ion-icon slot="start" [name]="isSaving ? 'time-outline' : 'save-outline'"></ion-icon>
          {{ isSaving ? 'Guardando...' : 'Guardar Revisión' }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .summary-card {
      background: var(--ion-color-light, #f4f5f8);
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .header-row h3 { font-weight: 700; font-size: 1.2rem; }
    .header-row .actions { display: flex; align-items: center; gap: 4px; }
    
    .kit-progress-bar {
      height: 10px;
      border-radius: 5px;
      margin: 12px 0;
    }
    .status-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }
    .item-icon-wrapper { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
    
    .notes-section {
      margin: 20px 8px;
    }
    .notes-item {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      padding: 4px 8px;
    }

    .history-section {
      margin-top: 30px;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-left: 8px;
      margin-bottom: 15px;
      color: var(--ion-color-dark);
    }
    .history-snapshot { font-size: 0.9rem; }
    .snapshot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 12px;
      background: #f9f9f9;
      padding: 12px;
      border-radius: 8px;
    }
    .snapshot-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--ion-color-dark);
    }
    .save-btn {
      --border-radius: 12px;
      --padding-top: 18px;
      --padding-bottom: 18px;
      font-weight: 700;
      height: 50px;
    }
  `]
})
export class RoadKitModalComponent implements OnInit {
  @Input() vehicleId: string = '';
  @Input() vehiclePlate: string = '';
  
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private dataService = inject(DataService);

  checklist: any[] = [];
  extinguisherItem: any = null;
  firstAidItem: any = null;
  notes: string = '';
  
  currentCity: string = 'Cartagena';

  items = {
    extinguisher: '',
    firstAid: ''
  };
  history: any[] = [];
  isSaving = false;

  constructor() {
    addIcons({ closeOutline, saveOutline, alertCircleOutline, checkmarkCircleOutline, medkitOutline, flameOutline, constructOutline, buildOutline, gitCompareOutline, warningOutline, squareOutline, briefcaseOutline, discOutline, flashlightOutline, helpCircleOutline, calendarOutline, timeOutline, documentTextOutline, informationCircleOutline, addOutline, refreshOutline, trashOutline, cartOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  get totalItems(): number {
    return this.checklist.length + (this.extinguisherItem ? 1 : 0) + (this.firstAidItem ? 1 : 0);
  }

  async loadData() {
    if (!this.vehicleId) return;

    this.dataService.getRoadKitOptions().subscribe(options => {
      this.extinguisherItem = options.find(o => o.name === 'Extintor');
      this.firstAidItem = options.find(o => o.name === 'Botiquín');
      const standardItems = options.filter(o => o.name !== 'Extintor' && o.name !== 'Botiquín');

      this.dataService.getVehicleRoadKit(this.vehicleId).subscribe({
        next: (kit) => {
          if (kit && kit.checklist) {
            this.checklist = kit.checklist;
            this.items.extinguisher = kit.extinguisherExpiry;
            this.items.firstAid = kit.firstAidExpiry;
          } else {
            this.checklist = standardItems.map(o => ({ ...o, checked: false }));
            this.initDefaultDates();
          }
        },
        error: () => {
          this.checklist = standardItems.map(o => ({ ...o, checked: false }));
          this.initDefaultDates();
        }
      });
    });

    this.dataService.getRoadKitHistory(this.vehicleId).subscribe(history => {
      this.history = history;
    });
  }

  initDefaultDates() {
    const today = new Date();
    const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1));
    this.items.extinguisher = nextYear.toISOString();
    this.items.firstAid = nextYear.toISOString();
  }

  async showStores() {
    const { StoreListModalComponent } = await import('../store-list/store-list-modal.component');
    const modal = await this.modalCtrl.create({
      component: StoreListModalComponent,
      componentProps: {
        city: this.currentCity,
        storeType: 'ROAD_KIT'
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });
    await modal.present();
  }

  async confirmNewInspection() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Inspección',
      message: '¿Deseas limpiar la selección actual para iniciar una revisión desde cero?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Sí, iniciar', 
          handler: () => {
            this.checklist.forEach(i => i.checked = false);
            this.notes = '';
            this.showToast('Lista preparada para nueva revisión', 'primary');
          }
        }
      ]
    });
    await alert.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (!this.vehicleId) return;

    this.isSaving = true;
    const payload = {
      vehicleId: this.vehicleId,
      checklist: this.checklist,
      extinguisherExpiry: this.items.extinguisher,
      firstAidExpiry: this.items.firstAid,
      createdBy: '00000000-0000-0000-0000-000000000000',
      notes: this.notes || 'Revisión técnica periódica'
    };

    this.dataService.upsertRoadKit(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.notes = '';
        this.showToast('Revisión registrada y guardada en el historial');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('Error al guardar', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }

  async showHelp() {
    const alert = await this.alertCtrl.create({
      header: 'Normativa Legal',
      subHeader: 'Código Nacional de Tránsito (Art. 30)',
      message: 'Todo vehículo debe portar el equipo de carretera. Contar con los elementos vigentes garantiza tu seguridad y evita sanciones.',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  get checkedItemsCount(): number {
    const checklistChecked = this.checklist.filter(item => item.checked).length;
    const extinguisherValid = this.isValid(this.items.extinguisher) ? 1 : 0;
    const firstAidValid = this.isValid(this.items.firstAid) ? 1 : 0;
    return checklistChecked + extinguisherValid + firstAidValid;
  }

  get kitProgress(): number {
    const total = this.totalItems;
    if (total === 0) return 1;
    return this.checkedItemsCount / total;
  }

  get kitStatus(): { text: string, color: string } {
    const progress = this.kitProgress;
    if (progress === 1) return { text: '¡Kit Completo!', color: 'success' };
    if (progress >= 0.7) return { text: 'Casi listo', color: 'warning' };
    return { text: 'Kit Incompleto', color: 'danger' };
  }

  getSnapshotStatus(snapshot: any): { text: string, color: string } {
    const checked = snapshot.checklist.filter((i: any) => i.checked).length;
    const total = snapshot.checklist.length;
    if (checked === total) return { text: 'Completo', color: 'success' };
    return { text: 'Incompleto', color: 'warning' };
  }

  isValid(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    return date >= now;
  }
}
