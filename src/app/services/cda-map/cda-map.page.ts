import { Component, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController, Platform, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { GoogleMap, MapType, Marker } from '@capacitor/google-maps';
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
  @ViewChild('map') mapElement!: ElementRef;
  newMap!: GoogleMap;
  private data = inject(DataService);
  private modalCtrl = inject(ModalController);
  private platform = inject(Platform);
  private apiKey = 'AIzaSyBib1gfDIYayj4NUzp765wv2oALRXw9WJU';

  constructor() {}

  async ngAfterViewInit() {
    await this.checkGoogleReady();
    // Delay to ensure modal animation is finished and element has size
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
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 10000);
    });
  }

  async createMap() {
    let lat = 10.3910; // Default Cartagena
    let lng = -75.4794;

    try {
      if (this.platform.is('hybrid')) {
        const coordinates = await Geolocation.getCurrentPosition();
        lat = coordinates.coords.latitude;
        lng = coordinates.coords.longitude;
      } else {
        console.log('Plataforma Web detectada - Usando ubicación simulada');
      }

      const mapElement = document.getElementById('map-canvas');
      if (!mapElement) {
        throw new Error('Elemento map-canvas no encontrado en el DOM');
      }

      this.newMap = await GoogleMap.create({
        id: 'cda-map',
        element: mapElement,
        apiKey: this.apiKey,
        config: {
          center: {
            lat: lat,
            lng: lng,
          },
          zoom: 14,
        },
      });

      // Add user location marker
      await this.newMap.addMarker({
        coordinate: {
          lat: lat,
          lng: lng,
        },
        title: 'Tu ubicación',
        tintColor: { r: 66, g: 133, b: 244, a: 1 }
      });

      await this.addCdaMarkers();
    } catch (e) {
      console.error('Error creando el mapa con el plugin:', e);
    }
  }

  async addCdaMarkers() {
    const cdas = this.data.getCDAs();
    const markers: Marker[] = cdas.map((cda: CDA) => ({
      coordinate: {
        lat: cda.lat,
        lng: cda.lng,
      },
      title: cda.name,
      snippet: cda.address
    }));

    await this.newMap.addMarkers(markers);
    
    // Set up marker click listener
    this.newMap.setOnMarkerClickListener(async (result) => {
      console.log('Marker clicked:', result);
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
