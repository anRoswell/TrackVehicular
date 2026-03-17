import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  IonMenuButton,
  AlertController 
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';

import { DataService, Vehicle, VehicleDocument, CityRule } from '../services/data.service';
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
    IonMenuButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {
  public data = inject(DataService);
  private auth = inject(AuthService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);

  public selectedVehicleId: string | undefined;
  public user: AuthUser | undefined;
  public mockFCMData: any = null;
  public isConsultingSIMIT = false;
  
  constructor() {
    addIcons({
      'add': icons.add,
      'search-outline': icons.searchOutline,
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
      'construct-outline': icons.constructOutline,
      'chevron-down-outline': icons.chevronDownOutline
    });
  }

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    
    // Subscribe to vehicles list and select the first one if not set
    this.data.vehicles$.subscribe(vehicles => {
      if (vehicles.length > 0 && !this.selectedVehicleId) {
        this.selectedVehicleId = vehicles[0].id;
        this.data.fetchFinesByPlate(vehicles[0].plate).subscribe();
      }
    });
  }

  consultSIMIT() {
    const vehicle = this.selectedVehicle;
    if (!vehicle) return;

    this.isConsultingSIMIT = true;
    this.mockFCMData = null;

    this.data.fetchMockFCMData(vehicle.plate).subscribe({
      next: (data) => {
        this.mockFCMData = data;
        this.isConsultingSIMIT = false;
      },
      error: (err) => {
        this.isConsultingSIMIT = false;
        console.error('Error consulting SIMIT mock:', err);
      }
    });
  }

  onVehicleChange(ev: any) {
    this.selectedVehicleId = ev.detail.value;
    const vehicle = this.selectedVehicle;
    if (vehicle) {
      this.data.fetchFinesByPlate(vehicle.plate).subscribe();
      this.mockFCMData = null; // Reset mock data when vehicle changes
    }
  }

  refresh(ev: any) {
    this.data.fetchVehicles().subscribe(() => {
      const vehicle = this.selectedVehicle;
      if (vehicle) {
        this.data.fetchFinesByPlate(vehicle.plate).subscribe();
      }
      this.data.fetchCityRules('Cartagena').subscribe(() => {
        (ev as RefresherCustomEvent).detail.complete();
      });
    });
  }

  getVehicles(): Vehicle[] {
    return this.data.getVehicles();
  }

  get selectedVehicle(): Vehicle | undefined {
    return this.selectedVehicleId !== undefined ? this.data.getVehicleById(this.selectedVehicleId) : undefined;
  }

  getLatestSOAT(vehicleId: string): any {
    return this.data.getLatestDocumentByType(vehicleId, 'SOAT');
  }

  getLatestTecno(vehicleId: string): any {
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

  // LÓGICA DE PICO Y PLACA DINÁMICA
  getPicoYPlacaInfo(plate: string | undefined): { status: string, color: string, label: string } {
    if (!plate) return { status: 'Sin placa', color: 'medium', label: 'N/A' };
    
    const lastDigitMatch = plate.match(/\d/g);
    if (!lastDigitMatch) return { status: 'Placa Inv.', color: 'medium', label: 'Error' };
    const lastDigit = parseInt(lastDigitMatch[lastDigitMatch.length - 1]);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Dom, 6=Sab
    
    // Fines de semana no hay Pico y Placa
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { status: 'Libre', color: 'success', label: 'Sin restricción' };
    }

    // Buscamos la regla para el día de hoy en los datos del backend
    const cityRules = this.data.getCityRules();
    const currentRule = cityRules.find(r => r.dayOfWeek === dayOfWeek);

    if (!currentRule) {
      return { status: 'Libre', color: 'success', label: 'Sin restricción' };
    }

    const restrictedDigits = currentRule.restrictedDigits || [];

    if (restrictedDigits.includes(lastDigit)) {
      return { status: 'Restringido', color: 'danger', label: 'Tiene Pico y Placa' };
    } else {
      return { status: 'Puedes circular', color: 'success', label: 'No tiene restricción' };
    }
  }

  async openFinesModal() {
    const fines = this.data.getFines();
    if (fines.length === 0) {
      const alert = await this.alert.create({
        header: 'Sin multas',
        message: 'No se encontraron multas pendientes para este vehículo en el sistema del DATT.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const messageHTML = fines.map(f => `
        <div style="text-align: left; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
          <strong>Ref: ${f.reference_num}</strong><br>
          <small>${f.description}</small><br>
          <span style="color: red;">$${f.amount.toLocaleString()}</span>
        </div>
      `).join('');

    const alert = await this.alert.create({
      header: 'Multas Pendientes',
      subHeader: `Se encontraron ${fines.length} comparendos`,
      message: `<div style="max-height: 400px; overflow-y: auto;">${messageHTML}</div>`,
      buttons: [
        { text: 'Cerrar', role: 'cancel' },
        { text: 'Pagar SIMIT', handler: () => { window.open('https://www.fcm.org.co/simit/', '_blank'); } }
      ]
    });
    await alert.present();
  }

  async openSoatModal() {
    if (!this.selectedVehicleId) return;

    // Obtener documentos de tipo SOAT del servicio
    let docs = this.data.getVehicleDocuments(this.selectedVehicleId)
      .filter(d => d.type === 'SOAT');

    // Fallback: si el servicio devuelve vacío (aún no implementado full), intentamos usar el 'latest' conocido
    if (docs.length === 0) {
      const latest = this.getLatestSOAT(this.selectedVehicleId);
      if (latest) docs = [latest];
    }

    if (docs.length === 0) {
      const alert = await this.alert.create({
        header: 'Historial SOAT',
        message: 'No se encontraron registros de SOAT para este vehículo.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Ordenar de mayor (más reciente) a menor fecha de vencimiento
    docs.sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    const messageHTML = docs.map(doc => {
      const expireDate = new Date(doc.expiresAt);
      const isVigente = expireDate >= today;
      const colorStyle = isVigente ? 'color: var(--ion-color-success); font-weight: bold;' : 'color: var(--ion-color-medium);';
      const statusText = isVigente ? 'VIGENTE' : 'VENCIDO';

      return `
        <div style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 1.1em;">${doc.provider || 'Aseguradora'}</strong>
            <span style="${colorStyle}">${statusText}</span>
          </div>
          <div style="color: #666; font-size: 0.9em;">
            Vence: ${doc.expiresAt}
            ${doc.issuedAt ? `<br>Emitido: ${doc.issuedAt}` : ''}
          </div>
        </div>
      `;
    }).join('');

    const alert = await this.alert.create({
      header: 'Historial de SOAT',
      message: `<div style="max-height: 400px; overflow-y: auto;">${messageHTML}</div>`,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async openTecnoModal() {
    if (!this.selectedVehicleId) return;

    // Obtener documentos de tipo TECNOMECANICA del servicio
    let docs = this.data.getVehicleDocuments(this.selectedVehicleId)
      .filter(d => d.type === 'TECNOMECANICA');

    // Fallback: si el servicio devuelve vacío, intentamos usar el 'latest' conocido
    if (docs.length === 0) {
      const latest = this.getLatestTecno(this.selectedVehicleId);
      if (latest) docs = [latest];
    }

    if (docs.length === 0) {
      const alert = await this.alert.create({
        header: 'Historial Tecnomecánica',
        message: 'No se encontraron registros de Tecnomecánica para este vehículo.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Ordenar de mayor (más reciente) a menor fecha de vencimiento
    docs.sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    const messageHTML = docs.map(doc => {
      const expireDate = new Date(doc.expiresAt);
      const isVigente = expireDate >= today;
      const colorStyle = isVigente ? 'color: var(--ion-color-success); font-weight: bold;' : 'color: var(--ion-color-medium);';
      const statusText = isVigente ? 'VIGENTE' : 'VENCIDO';

      return `
        <div style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 1.1em;">${doc.provider || 'CDA'}</strong>
            <span style="${colorStyle}">${statusText}</span>
          </div>
          <div style="color: #666; font-size: 0.9em;">
            Vence: ${doc.expiresAt}
            ${doc.issuedAt ? `<br>Emitido: ${doc.issuedAt}` : ''}
          </div>
        </div>
      `;
    }).join('');

    const alert = await this.alert.create({
      header: 'Historial de Tecnomecánica',
      message: `<div style="max-height: 400px; overflow-y: auto;">${messageHTML}</div>`,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async openPicoYPlacaModal() {
    if (!this.selectedVehicle) return;

    const info = this.getPicoYPlacaInfo(this.selectedVehicle.plate);
    const cityRules = this.data.getCityRules();
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentRule = cityRules.find(r => r.dayOfWeek === dayOfWeek);

    let message = `
      <div style="text-align: left;">
        <p><strong>Placa:</strong> ${this.selectedVehicle.plate}</p>
        <p><strong>Día:</strong> ${dayNames[dayOfWeek]}</p>
        <p><strong>Estado:</strong> <span style="color: var(--ion-color-${info.color}); font-weight: bold;">${info.label}</span></p>
        <hr>
    `;

    if (currentRule) {
      message += `<p><strong>Dígitos con restricción hoy:</strong> ${currentRule.restrictedDigits.join(', ')}</p>`;
    } else {
      message += `<p>No hay reglas de Pico y Placa definidas para hoy en Cartagena.</p>`;
    }

    message += `</div>`;

    const alert = await this.alert.create({
      header: 'Pico y Placa - Cartagena',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async openTaxesModal() {
    const alert = await this.alert.create({
      header: 'Impuestos Vehiculares',
      message: 'Esta función estará disponible próximamente. Podrás consultar y pagar tus impuestos desde aquí.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async openAddVehicleModal() {
    const { AddVehiclePage } = await import('../add-vehicle/add-vehicle.page');
    const modal = await this.modal.create({
      component: AddVehiclePage,
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9,
      // Add ion-page class to fix content sizing issues inside the modal
      cssClass: 'ion-page'
    });
    await modal.present();
  }

  async openCdaMapModal() {
    const { CdaMapPage } = await import('../services/cda-map/cda-map.page');
    const modal = await this.modal.create({
      component: CdaMapPage,
      cssClass: 'ion-page' // Asegura el estilo correcto del contenido del modal
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
