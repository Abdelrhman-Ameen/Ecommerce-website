import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, SupportSettings, SupportTicket } from './models';

export interface SupportTicketPayload {
  name: string;
  email: string;
  phone?: string;
  category: SupportTicket['category'];
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly api = '/api/v1/support';
  constructor(private http: HttpClient) {}
  contact(): Observable<SupportSettings> { return this.http.get<ApiResponse<{ settings: SupportSettings }>>(`${this.api}/contact`).pipe(map((response) => response.data.settings)); }
  createTicket(payload: SupportTicketPayload): Observable<SupportTicket> { return this.http.post<ApiResponse<{ ticket: SupportTicket }>>(`${this.api}/tickets`, payload).pipe(map((response) => response.data.ticket)); }
  myTickets(): Observable<SupportTicket[]> { return this.http.get<ApiResponse<{ tickets: SupportTicket[] }>>(`${this.api}/my-tickets`).pipe(map((response) => response.data.tickets)); }
}
