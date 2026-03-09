import { Component, inject } from '@angular/core';
import { RefresherCustomEvent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonButton, IonButtons, IonIcon, IonFab, IonFabButton, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, carOutline, bicycleOutline, busOutline, add } from 'ionicons/icons';

import { DataService, Vehicle } from '../services/data.service';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonButton, IonButtons, IonIcon, IonFab, IonFabButton],
})
export class HomePage {
  private data = inject(DataService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);
  
  constructor() {
    addIcons({add,createOutline,trashOutline,carOutline,bicycleOutline,busOutline});
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  getVehicles(): Vehicle[] {
    return this.data.getVehicles();
  }

  async editVehicle(v: Vehicle) {
    const { ViewMessagePage } = await import('../view-message/view-message.page');
    const modal = await this.modal.create({
      component: ViewMessagePage,
      componentProps: { vehicleId: v.id },
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.5
    });
    await modal.present();
  }

  async deleteVehicle(v: Vehicle) {
    const alert = await this.alert.create({
      header: 'Confirmar eliminación',
      message: `¿Seguro que deseas eliminar el vehículo con placa <strong>${v.plate}</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.data.deleteVehicle(v.id);
          }
        }
      ]
    });
    await alert.present();
  }

  async openAddVehicleModal() {
    const { AddVehiclePage } = await import('../add-vehicle/add-vehicle.page');
    const modal = await this.modal.create({
      component: AddVehiclePage,
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    // optional: handle refresh if saved
  }

  getVehicleIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Car': 'car-outline',
      'Motorcycle': 'bicycle-outline',
      'Truck': 'bus-outline',
      'Van': 'bus-outline',
    };
    return iconMap[type] || 'car-outline';
  }
}
