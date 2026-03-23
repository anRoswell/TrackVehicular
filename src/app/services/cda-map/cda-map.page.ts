import { Component, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ModalController, Platform, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { DataService, CDA } from '../data.service';

declare var google: any;

@Component({
  selector: 'app-cda-map',
  templateUrl: './cda-map.page.html',
  styleUrls: ['./cda-map.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdaMapPage implements AfterViewInit, OnDestroy {
  @Input() title: string = 'Mapa de Puntos';
  @Input() targetLat?: number;
  @Input() targetLng?: number;
  @Input() storeType: string = 'CDA';

  @ViewChild('map') mapElement!: ElementRef;
  newMap!: GoogleMap;
  
  private data = inject(DataService);
  private modalCtrl = inject(ModalController);
  private platform = inject(Platform);
  private apiKey = 'AIzaSyBib1gfDIYayj4NUzp765wv2oALRXw9WJU';

  userLat: number = 10.3910;
  userLng: number = -75.4794;

  constructor() {}

  async ngAfterViewInit() {
    await this.checkGoogleReady();
    setTimeout(async () => {
      await this.createMap();
    }, 500);
  }

  async ngOnDestroy() {
    if (this.newMap) {
      await this.newMap.destroy();
    }
  }

  private async checkGoogleReady() {
    return new Promise<void>((resolve) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }
      const check = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => { clearInterval(check); resolve(); }, 10000);
    });
  }

  async createMap() {
    try {
      if (this.platform.is('hybrid')) {
        const coordinates = await Geolocation.getCurrentPosition();
        this.userLat = coordinates.coords.latitude;
        this.userLng = coordinates.coords.longitude;
      }

      const mapElement = document.getElementById('map-canvas');
      if (!mapElement) return;

      this.newMap = await GoogleMap.create({
        id: 'cda-map-instance',
        element: mapElement,
        apiKey: this.apiKey,
        config: {
          center: { lat: this.targetLat || this.userLat, lng: this.targetLng || this.userLng },
          zoom: 14,
        },
      });

      // User Location Marker
      await this.newMap.addMarker({
        coordinate: { lat: this.userLat, lng: this.userLng },
        title: 'Tu ubicación',
        tintColor: { r: 66, g: 133, b: 244, a: 1 }
      });

      await this.loadRelevantPoints();
      
      if (this.targetLat && this.targetLng) {
        this.drawRoute(this.targetLat, this.targetLng);
      }
    } catch (e) {
      console.error('Error creating map:', e);
    }
  }

  async loadRelevantPoints() {
    // Si viene de un servicio específico (SOAT, CDA, etc), cargamos esos puntos
    if (this.storeType === 'CDA') {
      const cdas = this.data.getCDAs();
      const markers: Marker[] = cdas.map((cda: CDA) => ({
        coordinate: { lat: cda.lat, lng: cda.lng },
        title: cda.name,
        snippet: cda.address
      }));
      await this.newMap.addMarkers(markers);
    } else {
      // Consultar stores por tipo desde el backend
      this.data.getStoresByCity('Cartagena', this.storeType).subscribe(async (stores) => {
        const markers: Marker[] = stores.map(s => ({
          coordinate: { lat: Number(s.lat), lng: Number(s.lng) },
          title: s.name,
          snippet: s.address
        }));
        await this.newMap.addMarkers(markers);
      });
    }
  }

  // Draw route using JS SDK (Directly on the canvas element overlay)
  private drawRoute(destLat: number, destLng: number) {
    // Note: Capacitor Google Maps doesn't support Direction API directly yet.
    // We use the Native Intent/Universal Links as a fallback for high-quality routing
    // or we could implement a polyline if the user stays in the app.
    console.log(`Calculating route from ${this.userLat},${this.userLng} to ${destLat},${destLng}`);
    
    // For now, let's enable an external navigation option which is better for UX
    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.userLat},${this.userLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_system');
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
