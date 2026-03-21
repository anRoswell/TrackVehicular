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
  ModalController,
  AlertController
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
  helpCircleOutline
} from 'ionicons/icons';

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
    IonProgressBar
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
        <ion-item *ngFor="let item of checklist" lines="full">
          <ion-icon [name]="item.icon" slot="start" [color]="item.checked ? 'success' : 'danger'"></ion-icon>
          <ion-label>{{ item.name }}</ion-label>
          <ion-checkbox slot="end" [(ngModel)]="item.checked" color="success"></ion-checkbox>
        </ion-item>

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

    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" class="ion-margin" (click)="save()">
          <ion-icon slot="start" name="save-outline"></ion-icon>
          Guardar
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
    ion-item ion-icon[slot="start"] {
      transition: color 0.3s ease-in-out;
    }
  `]
})
export class RoadKitModalComponent implements OnInit {
  @Input() vehiclePlate: string = '';
  @Input() kitData: any = null;
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  checklist: { name: string, checked: boolean, icon: string }[] = [
    { name: 'Gato hidráulico', checked: true, icon: 'build-outline' },
    { name: 'Cruceta', checked: true, icon: 'git-compare-outline' },
    { name: '2 Señales de carretera', checked: true, icon: 'warning-outline' },
    { name: '2 Tacos para bloquear', checked: true, icon: 'square-outline' },
    { name: 'Caja de herramientas', checked: true, icon: 'briefcase-outline' },
    { name: 'Llanta de repuesto', checked: true, icon: 'disc-outline' },
    { name: 'Linterna', checked: true, icon: 'flashlight-outline' },
  ];

  items = {
    extinguisher: '',
    firstAid: ''
  };

  constructor() {
    addIcons({ closeOutline, saveOutline, alertCircleOutline, checkmarkCircleOutline, medkitOutline, flameOutline, constructOutline, buildOutline, gitCompareOutline, warningOutline, squareOutline, briefcaseOutline, discOutline, flashlightOutline, helpCircleOutline });
  }

  ngOnInit() {
    if (this.kitData) {
      // Cargar datos existentes si se pasaron al modal
      this.checklist = this.kitData.checklist;
      this.items = this.kitData.items;
    } else {
      // Si no hay datos, inicializar con valores por defecto
      const today = new Date();
      const nextYear = new Date(new Date().setFullYear(today.getFullYear() + 1));
      
      this.items = {
        extinguisher: nextYear.toISOString(),
        firstAid: nextYear.toISOString()
      };
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss({ 
      action: 'save', 
      kitData: { items: this.items, checklist: this.checklist }
    });
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

  isValid(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0,0,0,0); // Ignorar hora para la comparación
    date.setHours(0,0,0,0);
    return date >= now;
  }
}