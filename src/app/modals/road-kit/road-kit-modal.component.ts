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
  ModalController
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
  flashlightOutline
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
    IonCheckbox
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Kit de Carretera</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      
      <ion-list inset="true">
        <ion-list-header>
          <ion-label>Elementos del Kit</ion-label>
        </ion-list-header>

        <!-- Checklist estándar -->
        <ion-item *ngFor="let item of checklist">
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
    .item-icon-wrapper { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px; }
    .item-icon-wrapper.red { background-color: rgba(var(--ion-color-danger-rgb), 0.1); color: var(--ion-color-danger); }
    .item-icon-wrapper.blue { background-color: rgba(var(--ion-color-primary-rgb), 0.1); color: var(--ion-color-primary); }
    .item-icon-wrapper ion-icon { font-size: 20px; }
  `]
})
export class RoadKitModalComponent implements OnInit {
  @Input() vehiclePlate: string = '';
  private modalCtrl = inject(ModalController);

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
    addIcons({ closeOutline, saveOutline, alertCircleOutline, checkmarkCircleOutline, medkitOutline, flameOutline, constructOutline, buildOutline, gitCompareOutline, warningOutline, squareOutline, briefcaseOutline, discOutline, flashlightOutline });
  }

  ngOnInit() {
    // Simulamos cargar datos existentes (vigencia de 1 año desde hoy)
    const today = new Date();
    const nextYear = new Date(today.setFullYear(today.getFullYear() + 1));
    
    this.items = {
      extinguisher: nextYear.toISOString(),
      firstAid: nextYear.toISOString()
    };
  }

  close() {
    this.modalCtrl.dismiss();
  }

  save() {
    this.modalCtrl.dismiss({ action: 'save', items: this.items });
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