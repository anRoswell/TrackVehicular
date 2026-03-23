import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, 
  IonList, IonItem, IonLabel, ModalController, IonSearchbar,
  IonCard, IonCardContent, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, locationOutline, callOutline, mapOutline, cartOutline, shieldCheckmarkOutline, constructOutline, chevronForwardOutline } from 'ionicons/icons';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-store-list-modal',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonSearchbar, IonCard, IonCardContent, IonText],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>{{ getTitle() }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar color="primary">
        <ion-searchbar 
          placeholder="Buscar..." 
          (ionInput)="handleSearch($event)"
          color="light"
          class="custom-search">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="city-indicator">
        <ion-icon name="location-outline"></ion-icon>
        <ion-text>Puntos en <strong>{{ city }}</strong></ion-text>
      </div>

      @if (loading) {
        <div class="ion-text-center ion-padding">
          <p>Cargando establecimientos...</p>
        </div>
      } @else if (filteredStores.length > 0) {
        <ion-list lines="full" class="modern-list">
          @for (store of filteredStores; track store.id) {
            <ion-item class="animate__animated animate__fadeIn">
              <div class="store-row">
                <!-- Info a la izquierda -->
                <div class="store-info">
                  <ion-label>
                    <h2 class="store-name">{{ store.name }}</h2>
                    <p class="store-address">{{ store.address }}</p>
                  </ion-label>
                </div>

                <!-- Acciones a la derecha -->
                <div class="action-icons">
                  @if (store.phone) {
                    <ion-button fill="clear" color="primary" [href]="'tel:' + store.phone" class="icon-only-btn">
                      <ion-icon name="call-outline"></ion-icon>
                    </ion-button>
                  }
                  <ion-button fill="clear" color="secondary" (click)="locateOnMap(store)" class="icon-only-btn">
                    <ion-icon name="location-outline"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </ion-item>
          }
        </ion-list>
      } @else {
        <div class="empty-state ion-text-center ion-padding">
          <ion-icon name="alert-circle-outline" color="medium"></ion-icon>
          <h3>Sin resultados</h3>
          <p>No hay puntos registrados en esta ciudad.</p>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .city-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: var(--ion-color-medium); font-size: 0.9rem; }
    .custom-search { --border-radius: 12px; padding-bottom: 5px; }
    
    .modern-list { background: transparent; border-radius: 16px; overflow: hidden; }
    
    .store-row {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .store-info {
      flex: 1;
      padding-right: 10px;
    }

    .store-name {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--ion-color-dark);
      margin-bottom: 4px;
    }

    .store-address {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }

    .action-icons {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .icon-only-btn {
      --padding-start: 8px;
      --padding-end: 8px;
      margin: 0;
      font-size: 1.4rem;
    }

    .empty-state { margin-top: 50px; }
    .empty-state ion-icon { font-size: 48px; }
  `]
})
export class StoreListModalComponent implements OnInit {
  @Input() city: string = 'Cartagena';
  @Input() storeType: string = 'ROAD_KIT';

  private dataService = inject(DataService);
  private modalCtrl = inject(ModalController);

  stores: any[] = [];
  filteredStores: any[] = [];
  loading = true;

  constructor() {
    addIcons({ closeOutline, locationOutline, callOutline, mapOutline, cartOutline, shieldCheckmarkOutline, constructOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    this.loading = true;
    this.dataService.getStoresByCity(this.city, this.storeType).subscribe({
      next: (data) => {
        this.stores = data;
        this.filteredStores = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getTitle(): string {
    switch (this.storeType) {
      case 'SOAT': return 'Venta SOAT';
      case 'CDA': return 'Centros CDA';
      case 'ROAD_KIT': return 'Kits de Carretera';
      case 'MAINTENANCE': return 'Talleres';
      default: return 'Establecimientos';
    }
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (!query) {
      this.filteredStores = this.stores;
      return;
    }
    this.filteredStores = this.stores.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.address.toLowerCase().includes(query)
    );
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async locateOnMap(store: any) {
    const { CdaMapPage } = await import('../../services/cda-map/cda-map.page');
    const mapModal = await this.modalCtrl.create({
      component: CdaMapPage,
      componentProps: {
        title: `Ubicación: ${store.name}`,
        targetLat: Number(store.lat),
        targetLng: Number(store.lng),
        storeType: this.storeType
      }
    });
    await mapModal.present();
  }
}
