import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

import { CapacitorPushService } from './services/capacitor-push.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private pushService: CapacitorPushService) {}

  ngOnInit(): void {
    // Initialize push notifications only on mobile platforms (android / ios)
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      this.pushService.init();
    } else {
      console.log('Push init skipped on platform:', platform);
    }
  }
}
