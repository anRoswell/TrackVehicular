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

      // Marcador de ubicación del usuario
      await this.newMap.addMarker({
        coordinate: { lat: this.userLat, lng: this.userLng },
        title: 'Tu ubicación',
        tintColor: { r: 66, g: 133, b: 244, a: 1 }
      });

      await this.loadRelevantPoints();
      
      if (this.targetLat && this.targetLng) {
        this.calculateAndDrawRoute(this.targetLat, this.targetLng);
      }

      this.newMap.setOnMarkerClickListener(async (marker) => {
        this.calculateAndDrawRoute(marker.latitude, marker.longitude);
      });

    } catch (e) {
      console.error('Error al inicializar el mapa:', e);
    }
  }

  async loadRelevantPoints() {
    if (this.storeType === 'CDA') {
      const cdas = this.data.getCDAs();
      const markers: Marker[] = cdas.map((cda: CDA) => ({
        coordinate: { lat: cda.lat, lng: cda.lng },
        title: cda.name,
        snippet: cda.address
      }));
      await this.newMap.addMarkers(markers);
    } else {
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

  private async calculateAndDrawRoute(destLat: number, destLng: number) {
    if (typeof google === 'undefined') return;

    const directionsService = new google.maps.DirectionsService();
    
    const request = {
      origin: { lat: this.userLat, lng: this.userLng },
      destination: { lat: destLat, lng: destLng },
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, async (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const points = result.routes[0].overview_path.map((p: any) => ({
          lat: p.lat(),
          lng: p.lng()
        }));

        // Bypassing strict type check for Polyline path property
        const polyline: any = {
          path: points,
          strokeColor: '#3880ff',
          strokeWeight: 5,
          strokeOpacity: 0.8
        };

        await (this.newMap as any).addPolylines([polyline]);

        await this.newMap.setCamera({
          coordinate: { lat: destLat, lng: destLng },
          zoom: 15,
          animate: true
        });
      } else {
        console.error('Error al calcular la ruta:', status);
      }
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
