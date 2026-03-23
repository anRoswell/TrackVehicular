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
  documentTextOutline
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
    IonNote
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
      <div class="summary-card">
        <ion-text color="dark">
            <h3 class="ion-no-margin">Resumen del Kit</h3>
        </ion-text>
        <ion-progress-bar [value]="kitProgress" [color]="kitStatus.color" class="kit-progress-bar"></ion-progress-bar>
        <div class="status-line">
            <ion-text [color]="kitStatus.color">
                <p class="ion-no-margin"><strong>{{ kitStatus.text }}</strong></p>
            </ion-text>
            <ion-text color="medium">
                <p class="ion-no-margin">{{ checkedItemsCount }} / {{ checklist.length }} items</p>
            </ion-text>
        </div>
      </div>
      
      <ion-list inset="true">
        <ion-list-header>
          <ion-label>
            Elementos del Kit
            <ion-text color="medium">
              <p class="ion-no-margin" style="font-size: 0.75rem; font-weight: normal; margin-top: 4px;">Ley 769 de 2002 (Colombia)</p>
            </ion-text>
          </ion-label>
        </ion-list-header>

        <!-- Checklist estándar -->
        @for (item of checklist; track item.name) {
          <ion-item lines="full">
            <ion-icon [name]="item.icon" slot="start" [color]="item.checked ? 'success' : 'danger'"></ion-icon>
            <ion-label>{{ item.name }}</ion-label>
            <ion-checkbox slot="end" [(ngModel)]="item.checked" color="success"></ion-checkbox>
          </ion-item>
        }

        <!-- Extintor -->
        <ion-item>
          <div slot="start" class="item-icon-wrapper red">
            <ion-icon name="flame-outline"></ion-icon>
          </div>
          <ion-label>
            <h2>Extintor</h2>
            <p>
              <ion-text [color]="isValid(items.extinguisher) ? 'success' : 'danger'">
                {{ isValid(items.extinguisher) ? 'Vigente' : 'Vencido' }}
              </ion-text>
            </p>
          </ion-label>
          <ion-datetime-button datetime="extinguisherDate"></ion-datetime-button>
          
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime 
                id="extinguisherDate" 
                presentation="date" 
                [(ngModel)]="items.extinguisher"
                [showDefaultButtons]="true"
                doneText="Confirmar"
                cancelText="Cancelar"
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <!-- Botiquín -->
        <ion-item>
          <div slot="start" class="item-icon-wrapper blue">
            <ion-icon name="medkit-outline"></ion-icon>
          </div>
          <ion-label>
            <h2>Botiquín</h2>
            <p>
              <ion-text [color]="isValid(items.firstAid) ? 'success' : 'danger'">
                {{ isValid(items.firstAid) ? 'Vigente' : 'Vencido' }}
              </ion-text>
            </p>
          </ion-label>
          <ion-datetime-button datetime="kitDate"></ion-datetime-button>
          
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime 
                id="kitDate" 
                presentation="date" 
                [(ngModel)]="items.firstAid"
                [showDefaultButtons]="true"
                doneText="Confirmar"
                cancelText="Cancelar"
              ></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>
      </ion-list>

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
                    <p *ngIf="record.notes"><strong>Notas:</strong> {{ record.notes }}</p>
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

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" class="ion-margin" (click)="save()" [disabled]="isSaving">
          <ion-icon slot="start" [name]="isSaving ? 'time-outline' : 'save-outline'"></ion-icon>
          {{ isSaving ? 'Guardando...' : 'Guardar Revisión' }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .summary-card {
      background: var(--ion-color-light, #f4f5f8);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .kit-progress-bar {
      height: 8px;
      border-radius: 4px;
      margin: 12px 0;
    }
    .status-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .item-icon-wrapper { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px; }
    .item-icon-wrapper.red { background-color: rgba(var(--ion-color-danger-rgb), 0.1); color: var(--ion-color-danger); }
    .item-icon-wrapper.blue { background-color: rgba(var(--ion-color-primary-rgb), 0.1); color: var(--ion-color-primary); }
    .item-icon-wrapper ion-icon { font-size: 20px; }
    
    .history-section {
      margin-top: 24px;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-left: 8px;
      margin-bottom: 12px;
      color: var(--ion-color-dark);
    }
    .history-snapshot {
      font-size: 0.9rem;
    }
    .snapshot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .snapshot-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--ion-color-medium-shade);
    }
    .snapshot-item ion-icon {
      font-size: 14px;
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

  checklist: { name: string, checked: boolean, icon: string }[] = [];
  items = {
    extinguisher: '',
    firstAid: ''
  };
  history: any[] = [];
  isSaving = false;

  constructor() {
    addIcons({ closeOutline, saveOutline, alertCircleOutline, checkmarkCircleOutline, medkitOutline, flameOutline, constructOutline, buildOutline, gitCompareOutline, warningOutline, squareOutline, briefcaseOutline, discOutline, flashlightOutline, helpCircleOutline, calendarOutline, timeOutline, documentTextOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    if (!this.vehicleId) return;

    // Load standard options/checklist first
    this.dataService.getRoadKitOptions().subscribe(options => {
      // Create initial checklist from options
      this.checklist = options
        .filter(opt => opt.name !== 'Extintor' && opt.name !== 'Botiquín')
        .map(opt => ({
          name: opt.name,
          checked: false,
          icon: opt.icon
        }));

      // Try to load current vehicle kit status
      this.dataService.getVehicleRoadKit(this.vehicleId).subscribe({
        next: (kit) => {
          if (kit) {
            this.checklist = kit.checklist;
            this.items.extinguisher = kit.extinguisherExpiry;
            this.items.firstAid = kit.firstAidExpiry;
          } else {
            this.initDefaultDates();
          }
        },
        error: () => this.initDefaultDates()
      });
    });

    // Load history
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
      createdBy: '00000000-0000-0000-0000-000000000000', // Should be current user ID
      notes: 'Revisión manual desde la App'
    };

    this.dataService.upsertRoadKit(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.showToast('Revisión guardada con éxito');
        this.loadData(); // Refresh history
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast('Error al guardar la revisión', 'danger');
        console.error(err);
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  async showHelp() {
    const alert = await this.alertCtrl.create({
      header: 'Normativa Legal',
      subHeader: 'Código Nacional de Tránsito (Art. 30)',
      message: 'Ningún vehículo podrá transitar por las vías del territorio nacional sin portar el equipo de carretera.\n\nEl incumplimiento genera una multa de 15 SMLDV (Infracción C.02) y posible inmovilización del vehículo.',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  get checkedItemsCount(): number {
    return this.checklist.filter(item => item.checked).length;
  }

  get kitProgress(): number {
    if (this.checklist.length === 0) return 1;
    return this.checkedItemsCount / this.checklist.length;
  }

  get kitStatus(): { text: string, color: string } {
    const progress = this.kitProgress;
    if (progress === 1) {
      return { text: '¡Kit Completo!', color: 'success' };
    }
    if (progress >= 0.7) {
      return { text: 'Casi listo', color: 'warning' };
    }
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
