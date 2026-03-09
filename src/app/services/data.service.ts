import { Injectable } from '@angular/core';

export interface Message {
  fromName: string;
  subject: string;
  date: string;
  id: number;
  read: boolean;
}

export interface Vehicle {
  id: number;
  type: string; // e.g. 'Car', 'Motorcycle', 'Truck'
  plate: string;
  make?: string;
  model?: string;
  year?: number;
}

export type DocumentType = 'SOAT' | 'TECNOMECANICA' | 'OTHER';

export interface VehicleDocument {
  id: number;
  vehicleId: number;
  type: DocumentType;
  issuedAt: string; // ISO date
  expiresAt: string; // ISO date
  provider?: string;
  fileUrl?: string;
}

export type MaintenanceType = 'OIL_CHANGE' | 'TIRE_CHANGE' | 'BRAKE_CHECK' | 'OTHER';

export interface VehicleMaintenance {
  id: number;
  vehicleId: number;
  type: MaintenanceType;
  date: string; // ISO date
  description?: string;
  mileage?: number;
  provider?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public messages: Message[] = [
    {
      fromName: 'Matt Chorsey',
      subject: 'New event: Trip to Vegas',
      date: '9:32 AM',
      id: 0,
      read: false
    },
    {
      fromName: 'Lauren Ruthford',
      subject: 'Long time no chat',
      date: '6:12 AM',
      id: 1,
      read: false
    },
    {
      fromName: 'Jordan Firth',
      subject: 'Report Results',
      date: '4:55 AM',
      id: 2,
      read: false
    },
    {
      fromName: 'Bill Thomas',
      subject: 'The situation',
      date: 'Yesterday',
      id: 3,
      read: false
    },
    {
      fromName: 'Joanne Pollan',
      subject: 'Updated invitation: Swim lessons',
      date: 'Yesterday',
      id: 4,
      read: false
    },
    {
      fromName: 'Andrea Cornerston',
      subject: 'Last minute ask',
      date: 'Yesterday',
      id: 5,
      read: false
    },
    {
      fromName: 'Moe Chamont',
      subject: 'Family Calendar - Version 1',
      date: 'Last Week',
      id: 6,
      read: false
    },
    {
      fromName: 'Kelly Richardson',
      subject: 'Placeholder Headhots',
      date: 'Last Week',
      id: 7,
      read: false
    }
  ];

  public vehicles: Vehicle[] = [
    { id: 0, type: 'Car', plate: 'ABC123', make: 'Toyota', model: 'Corolla', year: 2015 },
    { id: 1, type: 'Motorcycle', plate: 'MOTO99', make: 'Honda', model: 'CBR', year: 2018 }
  ];

  public vehicleDocuments: VehicleDocument[] = [
    { id: 0, vehicleId: 0, type: 'SOAT', issuedAt: '2025-03-01', expiresAt: '2026-03-01', provider: 'Aseguradora X' },
    { id: 1, vehicleId: 0, type: 'TECNOMECANICA', issuedAt: '2024-08-15', expiresAt: '2026-08-15', provider: 'Centro Tecno' },
    { id: 2, vehicleId: 1, type: 'SOAT', issuedAt: '2025-06-01', expiresAt: '2026-06-01', provider: 'Aseguradora Y' }
  ];

  public vehicleMaintenances: VehicleMaintenance[] = [
    { id: 0, vehicleId: 0, type: 'OIL_CHANGE', date: '2025-12-01', description: 'Cambio de aceite', mileage: 50000, provider: 'Taller ABC' },
    { id: 1, vehicleId: 1, type: 'OIL_CHANGE', date: '2025-10-15', description: 'Cambio de aceite', mileage: 30000, provider: 'Mecánica Express' }
  ];

  constructor() { }

  public getMessages(): Message[] {
    return this.messages;
  }

  public getMessageById(id: number): Message {
    return this.messages[id];
  }

  // Vehicles
  public getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  public getVehicleById(id: number): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  public addVehicle(v: Vehicle) {
    const next = this.vehicles.length ? Math.max(...this.vehicles.map(x => x.id)) + 1 : 0;
    v.id = next;
    this.vehicles.push(v);
  }

  public updateVehicle(v: Vehicle) {
    const idx = this.vehicles.findIndex(x => x.id === v.id);
    if (idx > -1) this.vehicles[idx] = v;
  }

  public deleteVehicle(id: number) {
    const idx = this.vehicles.findIndex(x => x.id === id);
    if (idx > -1) this.vehicles.splice(idx, 1);
  }

  public getVehicleDocuments(vehicleId: number): VehicleDocument[] {
    return this.vehicleDocuments.filter(d => d.vehicleId === vehicleId);
  }

  public getVehicleMaintenances(vehicleId: number): VehicleMaintenance[] {
    return this.vehicleMaintenances.filter(m => m.vehicleId === vehicleId);
  }

  public getLatestDocumentByType(vehicleId: number, type: DocumentType): VehicleDocument | undefined {
    const docs = this.vehicleDocuments
      .filter(d => d.vehicleId === vehicleId && d.type === type)
      .sort((a, b) => b.expiresAt.localeCompare(a.expiresAt));
    return docs.length ? docs[0] : undefined;
  }

  public getLatestMaintenanceByType(vehicleId: number, type: MaintenanceType): VehicleMaintenance | undefined {
    const maintenances = this.vehicleMaintenances
      .filter(m => m.vehicleId === vehicleId && m.type === type)
      .sort((a, b) => b.date.localeCompare(a.date));
    return maintenances.length ? maintenances[0] : undefined;
  }

  public addVehicleMaintenance(m: VehicleMaintenance) {
    const next = this.vehicleMaintenances.length ? Math.max(...this.vehicleMaintenances.map(x => x.id)) + 1 : 0;
    m.id = next;
    this.vehicleMaintenances.push(m);
  }

  public addVehicleDocument(d: VehicleDocument) {
    const next = this.vehicleDocuments.length ? Math.max(...this.vehicleDocuments.map(x => x.id)) + 1 : 0;
    d.id = next;
    this.vehicleDocuments.push(d);
  }
}
