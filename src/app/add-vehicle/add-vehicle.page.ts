import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonSelect, IonSelectOption, IonItemDivider, IonDatetime, IonItem, IonLabel, IonButton, IonButtons } from '@ionic/angular/standalone';
import { DataService, Vehicle, VehicleDocument } from '../services/data.service';

@Component({
  selector: 'app-add-vehicle',
  templateUrl: 'add-vehicle.page.html',
  styleUrls: ['add-vehicle.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonSelect, IonSelectOption, IonItemDivider, IonDatetime, IonItem, IonLabel, IonButton, IonButtons]
})
export class AddVehiclePage {
  private data = inject(DataService);
  private modalCtrl = inject(ModalController);

  public newVehicle: Partial<Vehicle> = { type: 'Car', plate: '', make: '', model: '', year: new Date().getFullYear() };
  public soatIssued: string | null = null;
  public soatExpires: string | null = null;
  public tecIssued: string | null = null;
  public tecExpires: string | null = null;

  constructor() {}

  save() {
    if (!this.newVehicle.plate || !this.newVehicle.type) return;

    const v: Vehicle = {
      id: -1,
      type: String(this.newVehicle.type),
      plate: String(this.newVehicle.plate),
      make: this.newVehicle.make,
      model: this.newVehicle.model,
      year: this.newVehicle.year ? Number(this.newVehicle.year) : undefined
    };

    this.data.addVehicle(v);

    if (this.soatIssued || this.soatExpires) {
      const doc: VehicleDocument = {
        id: -1,
        vehicleId: v.id,
        type: 'SOAT',
        issuedAt: this.soatIssued || '',
        expiresAt: this.soatExpires || ''
      };
      this.data.addVehicleDocument(doc);
    }

    if (this.tecIssued || this.tecExpires) {
      const doc: VehicleDocument = {
        id: -1,
        vehicleId: v.id,
        type: 'TECNOMECANICA',
        issuedAt: this.tecIssued || '',
        expiresAt: this.tecExpires || ''
      };
      this.data.addVehicleDocument(doc);
    }

    this.modalCtrl.dismiss({ saved: true });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
