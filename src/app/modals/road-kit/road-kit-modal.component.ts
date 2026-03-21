import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonNote,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  calendarOutline, 
  checkmarkCircle, 
  alertCircle, 
  timeOutline,
  medkitOutline,
  constructOutline,
  warningOutline,
  flashlightOutline,
  carOutline,
  helpCircleOutline
} from 'ionicons/icons';

interface KitItem {
  name: string;
  required: boolean;
  hasExpiry: boolean;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'missing' | 'warning';
  icon: string;
}

interface KitHistory {
  date: string;
  notes: string;
  status: string;
}

@Component({
  selector: 'app-road-kit-modal',
  templateUrl: './road-kit-modal.component.html',
  styleUrls: ['./road-kit-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
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
    IonNote,
    IonAccordion,
    IonAccordionGroup,
    IonBadge
  ]
})
export class RoadKitModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);

  @Input() vehiclePlate: string = '';

  items: KitItem[] = [];
  history: KitHistory[] = [];

  constructor() {
    addIcons({ 
      closeOutline, 
      calendarOutline, 
      checkmarkCircle, 
      alertCircle, 
      timeOutline,
      medkitOutline,
      constructOutline,
      warningOutline,
      flashlightOutline,
      carOutline,
      helpCircleOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Datos simulados para el kit de carretera
    this.items = [
      { name: 'Extintor (10 lbs)', required: true, hasExpiry: true, expiryDate: '2024-12-31', status: 'valid', icon: 'alert-circle' },
      { name: 'Botiquín Primeros Auxilios', required: true, hasExpiry: true, expiryDate: '2024-06-15', status: 'warning', icon: 'medkit-outline' },
      { name: 'Herramienta Básica', required: true, hasExpiry: false, status: 'valid', icon: 'construct-outline' },
      { name: 'Señales de Carretera (Conos/Triángulos)', required: true, hasExpiry: false, status: 'valid', icon: 'warning-outline' },
      { name: 'Llanta de Repuesto', required: true, hasExpiry: false, status: 'valid', icon: 'car-outline' },
      { name: 'Linterna', required: true, hasExpiry: false, status: 'missing', icon: 'flashlight-outline' },
      { name: 'Gato y Cruceta', required: true, hasExpiry: false, status: 'valid', icon: 'construct-outline' },
    ];

    this.history = [
      { date: '2023-01-10', notes: 'Recarga de extintor anual', status: 'Completado' },
      { date: '2023-06-20', notes: 'Revisión general pre-viaje', status: 'Completado' },
      { date: '2022-12-05', notes: 'Compra de nuevo botiquín', status: 'Completado' },
    ];
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'valid': return 'success';
      case 'expired': return 'danger';
      case 'warning': return 'warning';
      case 'missing': return 'medium';
      default: return 'medium';
    }
  }
}