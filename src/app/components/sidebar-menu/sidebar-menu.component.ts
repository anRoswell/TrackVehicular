import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonMenuButton,
  IonButtons,
  IonRouterOutlet
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  home,
  documentTextOutline,
  settingsOutline,
  informationCircleOutline,
  logInOutline,
  personOutline,
  buildOutline
} from 'ionicons/icons';
import { AuthService, AuthUser } from 'src/app/services/auth.service';


@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonMenuButton,
    IonButtons,
    IonRouterOutlet
  ]
})
export class SidebarMenuComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  user: AuthUser | null = null;

  constructor() {
    addIcons({ home, personOutline, settingsOutline, buildOutline, documentTextOutline, informationCircleOutline, logOutOutline, logInOutline });
  }

  ngOnInit(): void {
    this.auth.getUser().subscribe(user => {
      this.user = user;
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  isCompanyStaff(): boolean {
    return this.user?.role === 'company_staff';
  }

  isAuthenticated(): boolean {
    return this.user?.isAuthenticated ?? false;
  }
}
