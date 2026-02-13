import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { DataService, Vehicle } from './data.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private data = inject(DataService);
  private toastCtrl = inject(ToastController);

  // Default pico y placa mapping (example - adjust to local rules if needed)
  // Monday=1 -> digits [1,2], Tuesday=2 -> [3,4], Wed=3 -> [5,6], Thu=4 -> [7,8], Fri=5 -> [9,0]
  private picoPlacaMap: Record<number, number[]> = {
    1: [1, 2],
    2: [3, 4],
    3: [5, 6],
    4: [7, 8],
    5: [9, 0]
  };

  constructor() {}

  isPlateRestricted(plate: string, date: Date = new Date()): boolean {
    if (!plate) return false;
    const day = date.getDay(); // 0 Sun, 1 Mon, ...
    if (day === 0 || day === 6) return false; // no restrictions on weekend (common rule)
    const restrictedDigits = this.picoPlacaMap[day] || [];
    const lastChar = plate.trim().slice(-1);
    const lastDigit = parseInt(lastChar.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(lastDigit)) return false;
    return restrictedDigits.includes(lastDigit);
  }

  async notifyPicoPlacaForVehicle(v: Vehicle, date: Date = new Date()) {
    const restricted = this.isPlateRestricted(v.plate, date);
    const msg = restricted
      ? `Placa ${v.plate}: hoy tiene pico y placa.`
      : `Placa ${v.plate}: hoy NO tiene pico y placa.`;
    await this.presentToast(msg, restricted ? 'warning' : 'success');
  }

  getExpiringDocuments(days = 7) {
    const now = new Date();
    const cutoff = new Date(now.getTime());
    cutoff.setDate(now.getDate() + days);

    const alerts: Array<{ vehicleId: number; plate: string; type: string; expiresAt: string; daysLeft: number }> = [];

    const vehicles = this.data.getVehicles();
    for (const v of vehicles) {
      const docs = this.data.getVehicleDocuments(v.id);
      for (const d of docs) {
        if (!d.expiresAt) continue;
        const exp = new Date(d.expiresAt);
        const diffMs = exp.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysLeft <= days && daysLeft >= 0) {
          alerts.push({ vehicleId: v.id, plate: v.plate, type: d.type, expiresAt: d.expiresAt, daysLeft });
        }
      }
    }

    return alerts;
  }

  async notifyExpirations(days = 7) {
    const alerts = this.getExpiringDocuments(days);
    if (!alerts.length) return;

    // Group by vehicle to avoid too many toasts
    const byVehicle = new Map<number, Array<typeof alerts[number]>>();
    for (const a of alerts) {
      const arr = byVehicle.get(a.vehicleId) || [];
      arr.push(a);
      byVehicle.set(a.vehicleId, arr);
    }

    for (const [vehicleId, items] of byVehicle.entries()) {
      const plate = items[0].plate;
      const parts = items.map(i => `${i.type} (vence en ${i.daysLeft} días)`).join(', ');
      const msg = `Placa ${plate}: ${parts}`;
      await this.presentToast(msg, 'warning');
    }
  }

  async notifyAll(days = 7) {
    // Pico y placa for all vehicles
    const vehicles = this.data.getVehicles();
    for (const v of vehicles) {
      await this.notifyPicoPlacaForVehicle(v);
    }

    // Expirations
    await this.notifyExpirations(days);
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'primary') {
    const t = await this.toastCtrl.create({ message, duration: 5000, color, position: 'top' });
    await t.present();
  }
}
