
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Platform, IonItem, IonLabel, IonNote, IonIcon } from '@ionic/angular/standalone';
import { chevronForward } from 'ionicons/icons';
import { Message } from '../services/data.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IonItem, IonLabel, IonNote, IonIcon],
})
export class MessageComponent {
  private platform = inject(Platform);
  @Input() message?: Message;
  public chevronForward = chevronForward;
  isIos() {
    return this.platform.is('ios')
  }
  constructor() {
  }
}
