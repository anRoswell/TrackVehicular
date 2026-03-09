
import { Component, inject, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonItem, IonIcon, IonLabel, IonNote, ModalController, IonButton, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { DataService, Message, Vehicle, VehicleDocument, VehicleMaintenance } from '../services/data.service';

@Component({
  selector: 'app-view-message',
  templateUrl: './view-message.page.html',
  styleUrls: ['./view-message.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonItem, IonIcon, IonLabel, IonNote, IonButton],
})
export class ViewMessagePage implements OnInit {
  @Input() vehicleId?: number;
  public vehicle?: Vehicle;
  public soat?: VehicleDocument;
  public tecnomecanica?: VehicleDocument;
  public lastOilChange?: VehicleMaintenance;
  public inPicoPlaca = false;
  public showHistory = false;
  public allMaintenances: VehicleMaintenance[] = [];
  public allDocuments: VehicleDocument[] = [];
  public message!: Message;
  private data = inject(DataService);
  private activatedRoute = inject(ActivatedRoute);
  private platform = inject(Platform);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ personCircle });
  }

  ngOnInit() {
    // If opened as modal with vehicleId, show vehicle info
    if (this.vehicleId !== undefined && this.vehicleId !== null) {
      this.vehicle = this.data.getVehicleById(this.vehicleId as number);
      if (this.vehicle) {
        this.soat = this.data.getLatestDocumentByType(this.vehicle.id, 'SOAT');
        this.tecnomecanica = this.data.getLatestDocumentByType(this.vehicle.id, 'TECNOMECANICA');
        this.lastOilChange = this.data.getLatestMaintenanceByType(this.vehicle.id, 'OIL_CHANGE');
        this.allMaintenances = this.data.getVehicleMaintenances(this.vehicle.id);
        this.allDocuments = this.data.getVehicleDocuments(this.vehicle.id);
        this.inPicoPlaca = this.checkPicoPlaca(this.vehicle.plate);
      }
      return;
    }

    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.message = this.data.getMessageById(parseInt(id, 10));
  }

  close() {
    this.modalCtrl.dismiss();
  }

  addOilChange() {
    if (!this.vehicle) return;
    const date = prompt('Ingrese la fecha del cambio de aceite (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;
    const mileage = prompt('Ingrese el kilometraje:');
    if (mileage && !isNaN(parseInt(mileage, 10))) {
      const provider = prompt('¿Quién realizó el cambio de aceite? (Opcional)');
      const newMaintenance: VehicleMaintenance = {
        id: 0, // will be set in service
        vehicleId: this.vehicle.id,
        type: 'OIL_CHANGE',
        date: date,
        description: 'Cambio de aceite',
        mileage: parseInt(mileage, 10),
        provider: provider ? provider : undefined
      };
      this.data.addVehicleMaintenance(newMaintenance);
      // Refresh the last oil change
      this.lastOilChange = this.data.getLatestMaintenanceByType(this.vehicle.id, 'OIL_CHANGE');
      this.allMaintenances = this.data.getVehicleMaintenances(this.vehicle.id);
    }
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  getDisplayType(type: string): string {
    const map: { [key: string]: string } = {
      'SOAT': 'SOAT',
      'TECNOMECANICA': 'Tecno-mecánica',
      'OIL_CHANGE': 'Cambio de aceite',
      'TIRE_CHANGE': 'Cambio de llantas',
      'BRAKE_CHECK': 'Revisión de frenos',
      'OTHER': 'Otro'
    };
    return map[type] || type;
  }

  addSOAT() {
    if (!this.vehicle) return;
    const expiresAt = prompt('Ingrese la fecha de vencimiento del SOAT (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    const provider = prompt('Ingrese el emisor del SOAT:');
    if (expiresAt && provider) {
      const newDoc: VehicleDocument = {
        id: 0,
        vehicleId: this.vehicle.id,
        type: 'SOAT',
        issuedAt: new Date().toISOString().split('T')[0],
        expiresAt,
        provider
      };
      this.data.addVehicleDocument(newDoc);
      this.soat = this.data.getLatestDocumentByType(this.vehicle.id, 'SOAT');
      this.allDocuments = this.data.getVehicleDocuments(this.vehicle.id);
    }
  }

  addTecnomecanica() {
    if (!this.vehicle) return;
    const expiresAt = prompt('Ingrese la fecha de vencimiento de la Tecno-mecánica (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    const provider = prompt('Ingrese el emisor de la Tecno-mecánica:');
    if (expiresAt && provider) {
      const newDoc: VehicleDocument = {
        id: 0,
        vehicleId: this.vehicle.id,
        type: 'TECNOMECANICA',
        issuedAt: new Date().toISOString().split('T')[0],
        expiresAt,
        provider
      };
      this.data.addVehicleDocument(newDoc);
      this.tecnomecanica = this.data.getLatestDocumentByType(this.vehicle.id, 'TECNOMECANICA');
      this.allDocuments = this.data.getVehicleDocuments(this.vehicle.id);
    }
  }

  private checkPicoPlaca(plate: string): boolean {
    // Demo rule: pico y placa true if last digit parity matches weekday parity
    const last = plate.replace(/[^0-9]/g, '').slice(-1);
    if (!last) return false;
    const digit = parseInt(last, 10);
    const day = new Date().getDay(); // 0 Sun .. 6 Sat
    return (digit % 2) === (day % 2);
  }

  getBackButtonText() {
    const isIos = this.platform.is('ios')
    return isIos ? 'Inbox' : '';
  }
}
