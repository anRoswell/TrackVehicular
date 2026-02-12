
import { Component, inject, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonItem, IonIcon, IonLabel, IonNote, ModalController, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { DataService, Message, Vehicle, VehicleDocument } from '../services/data.service';

@Component({
  selector: 'app-view-message',
  templateUrl: './view-message.page.html',
  styleUrls: ['./view-message.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonItem, IonIcon, IonLabel, IonNote, IonButton],
})
export class ViewMessagePage implements OnInit {
  @Input() vehicleId?: number;
  public vehicle?: Vehicle;
  public soat?: VehicleDocument;
  public tecnomecanica?: VehicleDocument;
  public inPicoPlaca = false;
  public message!: Message;
  private data = inject(DataService);
  private activatedRoute = inject(ActivatedRoute);
  private platform = inject(Platform);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ personCircle });
  }

  ngOnInit() {
    // If opened as modal with vehicleId, show vehicle info
    if (this.vehicleId !== undefined && this.vehicleId !== null) {
      this.vehicle = this.data.getVehicleById(this.vehicleId as number);
      if (this.vehicle) {
        this.soat = this.data.getLatestDocumentByType(this.vehicle.id, 'SOAT');
        this.tecnomecanica = this.data.getLatestDocumentByType(this.vehicle.id, 'TECNOMECANICA');
        this.inPicoPlaca = this.checkPicoPlaca(this.vehicle.plate);
      }
      return;
    }

    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.message = this.data.getMessageById(parseInt(id, 10));
  }

  close() {
    this.modalCtrl.dismiss();
  }

  private checkPicoPlaca(plate: string): boolean {
    // Demo rule: pico y placa true if last digit parity matches weekday parity
    const last = plate.replace(/[^0-9]/g, '').slice(-1);
    if (!last) return false;
    const digit = parseInt(last, 10);
    const day = new Date().getDay(); // 0 Sun .. 6 Sat
    return (digit % 2) === (day % 2);
  }

  getBackButtonText() {
    const isIos = this.platform.is('ios')
    return isIos ? 'Inbox' : '';
  }
}
