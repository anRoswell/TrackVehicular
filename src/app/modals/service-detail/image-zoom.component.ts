import { Component, Input, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-image-zoom',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon slot="icon-only" name="close" color="light"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-text-center" [fullscreen]="true" (click)="close()">
      <div class="image-container" (click)="$event.stopPropagation()">
        <swiper-container [zoom]="true">
          <swiper-slide>
            <div class="swiper-zoom-container">
              <img [src]="imageUrl" />
            </div>
          </swiper-slide>
        </swiper-container>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      --ion-background-color: rgba(0, 0, 0, 0.8);
    }
    ion-toolbar {
      --background: transparent;
    }
    .image-container {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    swiper-container {
      width: 100%;
      height: 100%;
    }
    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  `],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageZoomComponent {
  @Input() imageUrl: string = '';
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ close });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}