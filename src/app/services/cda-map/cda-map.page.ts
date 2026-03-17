import { Component, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import { DataService, CDA } from '../data.service';

declare var google: any; // Para evitar errores de TypeScript con la API de Google Maps

@Component({
  selector: 'app-cda-map',
  templateUrl: './cda-map.page.html',
  styleUrls: ['./cda-map.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton],
})
export class CdaMapPage implements AfterViewInit {
  @ViewChild('map') mapElement!: ElementRef;
  map: any;
  private data = inject(DataService);
  private modalCtrl = inject(ModalController);

  constructor() {}

  async ngAfterViewInit() {
    await this.loadMap();
  }

  async loadMap() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const latLng = new google.maps.LatLng(coordinates.coords.latitude, coordinates.coords.longitude);

      const mapOptions = {
        center: latLng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Añadir marcador para la ubicación del usuario
      new google.maps.Marker({
        map: this.map,
        position: latLng,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: 'white'
        },
        title: 'Tu ubicación'
      });

      this.addCdaMarkers();
    } catch (error) {
      console.error('Error al obtener la ubicación o cargar el mapa', error);
      // Ubicación de respaldo si la geolocalización falla (ej. Cartagena)
      const cartagenaLatLng = new google.maps.LatLng(10.3910, -75.4794);
      const mapOptions = {
        center: cartagenaLatLng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.addCdaMarkers();
    }
  }

  addCdaMarkers() {
    const cdas = this.data.getCDAs();
    cdas.forEach((cda: CDA) => {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(cda.lat, cda.lng),
        map: this.map,
        title: cda.name
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<h5>${cda.name}</h5><p>${cda.address}</p>`
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}