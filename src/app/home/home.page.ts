import { Component, inject, OnInit } from '@angular/core';
import { 
  RefresherCustomEvent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonRefresher, 
  IonRefresherContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonButtons, 
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent, 
  IonBadge, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonSelect, 
  IonSelectOption,
  IonAvatar,
  IonText,
  AlertController 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';

import { DataService, Vehicle, VehicleDocument, VehicleMaintenance } from '../services/data.service';
import { AuthService, AuthUser } from '../services/auth.service';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonRefresher, 
    IonRefresherContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonButton, 
    IonButtons, 
    IonIcon, 
    IonFab, 
    IonFabButton, 
    IonCard, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle, 
    IonCardContent, 
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonAvatar,
    IonText
  ],
})
export class HomePage implements OnInit {
  private data = inject(DataService);
  private auth = inject(AuthService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);

  public selectedVehicleId: number | undefined;
  public user: AuthUser | undefined;
  
  // Expose icons for [icon] syntax
  public icons = icons;
  
  constructor() {
    addIcons({
      'add': icons.add,
      'create-outline': icons.createOutline,
      'trash-outline': icons.trashOutline,
      'car-outline': icons.carOutline,
      'bicycle-outline': icons.bicycleOutline,
      'bus-outline': icons.busOutline,
      'shield-checkmark-outline': icons.shieldCheckmarkOutline,
      'build-outline': icons.buildOutline,
      'speedometer-outline': icons.speedometerOutline,
      'alert-circle-outline': icons.alertCircleOutline,
      'ellipsis-vertical-outline': icons.ellipsisVerticalOutline,
      'person-circle-outline': icons.personCircleOutline,
      'receipt-outline': icons.receiptOutline,
      'calendar-outline': icons.calendarOutline,
      'location-outline': icons.locationOutline,
      'cart-outline': icons.cartOutline,
      'notifications-outline': icons.notificationsOutline,
      'warning-outline': icons.warningOutline,
      'construct-outline': icons.constructOutline
    });
  }

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    const vehicles = this.getVehicles();
    if (vehicles.length > 0) {
      this.selectedVehicleId = vehicles[0].id;
    }
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 2000);
  }

  getVehicles(): Vehicle[] {
    return this.data.getVehicles();
  }

  get selectedVehicle(): Vehicle | undefined {
    return this.selectedVehicleId !== undefined ? this.data.getVehicleById(this.selectedVehicleId) : undefined;
  }

  getLatestSOAT(vehicleId: number): VehicleDocument | undefined {
    return this.data.getLatestDocumentByType(vehicleId, 'SOAT');
  }

  getLatestTecno(vehicleId: number): VehicleDocument | undefined {
    return this.data.getLatestDocumentByType(vehicleId, 'TECNOMECANICA');
  }

  getStatusColor(dateStr: string | undefined): string {
    if (!dateStr) return 'medium';
    const expiryDate = new Date(dateStr);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'danger';
    if (diffDays <= 30) return 'warning';
    return 'success';
  }

  getDaysLeft(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    const expiryDate = new Date(dateStr);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Vencido';
    return `${diffDays} días`;
  }

  async openAddVehicleModal() {
    const { AddVehiclePage } = await import('../add-vehicle/add-vehicle.page');
    const modal = await this.modal.create({
      component: AddVehiclePage,
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9
    });
    await modal.present();
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
