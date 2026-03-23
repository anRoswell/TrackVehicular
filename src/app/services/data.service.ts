import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Vehicle {
  id: string;
  type: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  currentKm: number;
  make: string;
}

export interface CityRule {
  id: string;
  cityName: string;
  dayOfWeek: number;
  restrictedDigits: number[];
}

export interface CDA {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  docTypeId?: number;
  type?: string;
  status?: string;
  issuedAt?: string;
  expiresAt: string;
  expiryDate?: string;
  provider?: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  description?: string;
  mileage?: number;
  provider?: string;
}

export interface TrafficFine {
  reference_num: string;
  infraction_date: string;
  infraction_type: string;
  description: string;
  location: string;
  amount: number;
  discount_amount?: number;
  discount_expiry?: string;
  status: string;
  issuing_entity: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  public vehicles$ = this.vehiclesSubject.asObservable();

  private cityRulesSubject = new BehaviorSubject<CityRule[]>([]);
  public cityRules$ = this.cityRulesSubject.asObservable();

  private finesSubject = new BehaviorSubject<TrafficFine[]>([]);
  public fines$ = this.finesSubject.asObservable();

  private cdasSubject = new BehaviorSubject<CDA[]>([]);
  public cdas$ = this.cdasSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.fetchVehicles().subscribe();
    this.fetchCityRules('Cartagena').subscribe();
    this.fetchCDAs('Cartagena').subscribe();
  }

  fetchVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`).pipe(
      tap(vehicles => this.vehiclesSubject.next(vehicles)),
      catchError(err => {
        console.error('Error fetching vehicles', err);
        return of([]);
      })
    );
  }

  fetchFinesByPlate(plate: string): Observable<TrafficFine[]> {
    return this.http.get<TrafficFine[]>(`${this.apiUrl}/fines/plate/${plate}`).pipe(
      tap(fines => this.finesSubject.next(fines)),
      catchError(err => {
        console.error('Error fetching fines', err);
        return of([]);
      })
    );
  }

  fetchCityRules(cityName: string): Observable<CityRule[]> {
    return this.http.get<CityRule[]>(`${this.apiUrl}/city-rules/${cityName}`).pipe(
      tap(rules => this.cityRulesSubject.next(rules)),
      catchError(err => {
        console.error('Error fetching city rules', err);
        return of([]);
      })
    );
  }

  fetchMockFCMData(plate: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/fines/mock/${plate}`).pipe(
      catchError(err => {
        console.error('Error fetching mock FCM data', err);
        return of(null);
      })
    );
  }

  fetchCDAs(cityName: string): Observable<CDA[]> {
    return this.http.get<CDA[]>(`${this.apiUrl}/cdas/city/${cityName}`).pipe(
      tap(cdas => this.cdasSubject.next(cdas)),
      catchError(err => {
        console.error('Error fetching CDAs', err);
        return of([]);
      })
    );
  }

  // Road Kit Methods
  getRoadKitOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/road-kit/options`);
  }

  getVehicleRoadKit(vehicleId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/road-kit/vehicle/${vehicleId}`);
  }

  getRoadKitHistory(vehicleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/road-kit/vehicle/${vehicleId}/history`);
  }

  upsertRoadKit(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/road-kit`, data);
  }

  getVehicles(): Vehicle[] {
    return this.vehiclesSubject.value;
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehiclesSubject.value.find(v => v.id === id);
  }

  getCityRules(): CityRule[] {
    return this.cityRulesSubject.value;
  }

  getFines(): TrafficFine[] {
    return this.finesSubject.value;
  }

  getCDAs(): CDA[] {
    return this.cdasSubject.value;
  }

  getVehicleDocuments(vehicleId: string): VehicleDocument[] {
    return [];
  }

  getVehicleMaintenances(vehicleId: string): VehicleMaintenance[] {
    return [];
  }

  addVehicle(vehicle: Vehicle): void {
    const current = this.vehiclesSubject.value;
    this.vehiclesSubject.next([...current, vehicle]);
  }

  addVehicleDocument(doc: VehicleDocument): void {}
  addVehicleMaintenance(maint: VehicleMaintenance): void {}

  getLatestDocumentByType(vehicleId: string, type: string): VehicleDocument | undefined {
    return undefined;
  }

  getLatestMaintenanceByType(vehicleId: string, type: string): VehicleMaintenance | undefined {
    return undefined;
  }
}
