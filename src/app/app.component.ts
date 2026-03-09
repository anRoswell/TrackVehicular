import { Component, OnInit } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

import { CapacitorPushService } from './services/capacitor-push.service';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, SidebarMenuComponent],
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
