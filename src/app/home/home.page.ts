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
  public showMoreServices = false;
  
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
      'chevron-down-outline': icons.chevronDownOutline,
      'medkit-outline': icons.medkitOutline,
      'water-outline': icons.waterOutline,
      'sync-outline': icons.syncOutline,
      'options-outline': icons.optionsOutline,
      'chevron-up-outline': icons.chevronUpOutline
    });
  }

  toggleMoreServices() {
    this.showMoreServices = !this.showMoreServices;
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
    if (this.selectedVehicleId === vehicleId && this.mockFCMData && this.mockFCMData.soatHistory && this.mockFCMData.soatHistory.length > 0) {
      return this.mockFCMData.soatHistory[0];
    }
    return this.data.getLatestDocumentByType(vehicleId, 'SOAT') || {};
  }

  getLatestTecno(vehicleId: string): any {
    if (this.selectedVehicleId === vehicleId && this.mockFCMData && this.mockFCMData.tecnoHistory && this.mockFCMData.tecnoHistory.length > 0) {
      return this.mockFCMData.tecnoHistory[0];
    }
    return this.data.getLatestDocumentByType(vehicleId, 'TECNOMECANICA') || {};
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

  getStatusInfo(dateStr: string | undefined): { label: string, color: string } {
    if (!dateStr) return { label: 'NO DISPONIBLE', color: 'medium' };
    
    const expiryDate = new Date(dateStr);
    const today = new Date();
    // Normalizar a inicio del día para comparación de días
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'VENCIDO', color: 'danger' };
    if (diffDays <= 30) return { label: 'PRÓXIMO A VENCER', color: 'warning' };
    return { label: 'VIGENTE', color: 'success' };
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

  get activeFinesCount(): number {
    let fines: any[] = this.data.getFines() || [];
    if (this.mockFCMData && this.mockFCMData.fines) {
      fines = this.mockFCMData.fines;
    }
    return Array.isArray(fines) ? fines.length : 0;
  }

  get cdaDaysLeft(): string {
    const latest = this.selectedVehicleId ? this.getLatestTecno(this.selectedVehicleId) : null;
    return this.getDaysLeft(latest?.expiresAt);
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

  calculateProgress(startDate: string, endDate: string): number {
    if (!endDate) return -1; // -1 oculta la barra
    
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    let start = startDate ? new Date(startDate).getTime() : NaN;

    // Si no hay fecha de inicio válida, asumimos 1 año antes del vencimiento (común en SOAT/Tecno)
    if (isNaN(start)) {
      start = end - (365 * 24 * 60 * 60 * 1000);
    }

    if (isNaN(end)) return -1;
    
    if (now >= end) return 1;
    if (now <= start) return 0;
    
    const total = end - start;
    if (total <= 0) return 0;

    const elapsed = now - start;
    return Math.max(0, Math.min(1, elapsed / total));
  }

  async openFinesModal() {
    let fines: any[] = this.data.getFines() || [];
    let summary: any = null;
    
    // USAR DATOS SIMULADOS SI ESTÁN DISPONIBLES
    if (this.mockFCMData) {
      if (this.mockFCMData.fines) {
        fines = this.mockFCMData.fines;
      }
      if (this.mockFCMData.summary) {
        summary = this.mockFCMData.summary;
      }
    }

    if (!Array.isArray(fines)) {
      fines = [];
    }

    if (fines.length === 0) {
      const alert = await this.alert.create({
        header: 'Sin multas',
        message: 'No se encontraron multas pendientes en el sistema.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

        const { FinesModalComponent } = await import('../modals/service-detail/fines-modal.component');
        const modal = await this.modal.create({
            component: FinesModalComponent,
            componentProps: {
                fines: fines,
                summary: summary
            },
            breakpoints: [0, 0.75, 0.9],
            initialBreakpoint: 0.9
        });

        await modal.present();
    }

  async openSoatModal() {
    if (!this.selectedVehicleId) return;
    const vehicle = this.selectedVehicle;
    const { ServiceDetailComponent } = await import('../modals/service-detail/service-detail.component');

    let latest: any = this.getLatestSOAT(this.selectedVehicleId);
    let history: any[] = [];
    
    // USAR DATOS SIMULADOS SI ESTÁN DISPONIBLES
    if (this.mockFCMData && this.mockFCMData.soatHistory) {
      latest = this.mockFCMData.soatHistory[0];
      history = this.mockFCMData.soatHistory;
    }
    
    const statusInfo = this.getStatusInfo(latest?.expiresAt);
    const progress = this.calculateProgress(latest?.issuedAt, latest?.expiresAt);
    const daysLeft = this.getDaysLeft(latest?.expiresAt);
    // Generate fake policy number for demo if not present
    const policyNum = latest?.policyNumber || 'POL-' + Math.floor(Math.random() * 1000000);

    const modal = await this.modal.create({
      component: ServiceDetailComponent,
      componentProps: {
        title: 'Seguro SOAT',
        icon: 'shield-checkmark-outline',
        plate: vehicle?.plate || '',
        policyNumber: policyNum,
        history: history,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        progressBarColor: statusInfo.color,
        daysRemaining: daysLeft === 'Vencido' ? 'Servicio Vencido' : `Vence en ${daysLeft}`,
        nextDate: latest?.expiresAt || 'N/A',
        lastDate: latest?.issuedAt || 'N/A',
        lastProvider: latest?.provider || 'Aseguradora no registrada',
        progress: progress,
        showDownload: true,
        downloadLabel: 'Descargar SOAT',
        adText: '¡Evita multas y protege tu vida! Renueva tu SOAT con 5% de descuento exclusivo en nuestra red aliada.',
        actionLabel: statusInfo.color === 'success' ? 'Comprar Nuevo' : 'Renovar Ahora'
      },
      breakpoints: [0, 0.75, 0.9],
      initialBreakpoint: 0.9
    });

    await modal.present();
  }

  async openTecnoModal() {
    if (!this.selectedVehicleId) return;
    const vehicle = this.selectedVehicle;
    const { ServiceDetailComponent } = await import('../modals/service-detail/service-detail.component');

    let latest: any = this.getLatestTecno(this.selectedVehicleId);
    let history: any[] = [];
    
    // USAR DATOS SIMULADOS SI ESTÁN DISPONIBLES
    if (this.mockFCMData && this.mockFCMData.tecnoHistory) {
      latest = this.mockFCMData.tecnoHistory[0];
      history = this.mockFCMData.tecnoHistory;
    }

    const statusInfo = this.getStatusInfo(latest?.expiresAt);
    const progress = this.calculateProgress(latest?.issuedAt, latest?.expiresAt);
    const daysLeft = this.getDaysLeft(latest?.expiresAt);
    const refNum = latest?.reference_num || 'CDA-' + Math.floor(Math.random() * 1000000);

    const modal = await this.modal.create({
      component: ServiceDetailComponent,
      componentProps: {
        title: 'Revisión Tecnomecánica',
        icon: 'construct-outline',
        plate: vehicle?.plate || '',
        policyNumber: refNum, // Reusing input for reference number
        history: history,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        progressBarColor: statusInfo.color,
        daysRemaining: daysLeft === 'Vencido' ? 'Servicio Vencido' : `Vence en ${daysLeft}`,
        nextDate: latest?.expiresAt || 'N/A',
        lastDate: latest?.issuedAt || 'N/A',
        lastProvider: latest?.provider || 'CDA no registrado',
        progress: progress,
        showDownload: false, // Usually tecno is a certificate, could be true if needed
        adText: '¿Ya realizaste tu revisión? Agenda en CDA La Heroica y recibe un lavado de motor GRATIS por tu inspección.',
        actionLabel: 'Agendar en CDA'
      },
      breakpoints: [0, 0.75, 0.9],
      initialBreakpoint: 0.75
    });

    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.action) {
      this.openCdaMapModal();
    }
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

  async openRoadKitModal() {
    const { RoadKitModalComponent } = await import('../modals/road-kit/road-kit-modal.component');
    const modal = await this.modal.create({
      component: RoadKitModalComponent,
      breakpoints: [0, 1], // Full screen o custom sheet
      initialBreakpoint: 1,
      componentProps: { 
        vehiclePlate: this.selectedVehicle?.plate || ''
      }
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
