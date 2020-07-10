import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import IHistoryItem from '../interfaces/historyItem';

@Injectable({ providedIn: 'root' })
export class HistoryService {

  constructor(private httpClient: HttpClient) {}

  getHistory(): Observable<IHistoryItem[]> {
    return this.httpClient.get<IHistoryItem[]>(environment.historyEndpoint).pipe(take(1));
  }
}