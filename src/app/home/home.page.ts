
import { Component, inject } from '@angular/core';
import { RefresherCustomEvent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, carOutline, bicycleOutline, busOutline } from 'ionicons/icons';

import { DataService, Vehicle } from '../services/data.service';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonButton, IonButtons, IonIcon],
})
export class HomePage {
  private data = inject(DataService);
  private modal = inject(ModalController);
  constructor() {
    /**
     * Any icons you want to use in your application
     * can be registered in app.component.ts and then
     * referenced by name anywhere in your application.
     */
    addIcons({ createOutline, trashOutline, carOutline, bicycleOutline, busOutline });
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

  deleteVehicle(v: Vehicle) {
    this.data.deleteVehicle(v.id);
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
