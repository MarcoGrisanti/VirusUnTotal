import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IAnalysisResult } from '../interfaces/analysisResult';

@Injectable({ providedIn: 'root' })
export class AnalysisService {

  constructor(private httpClient: HttpClient) {}

  analyzeFiles(files: File[]): Observable<IAnalysisResult[]> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('item_' + (i + 1), files[i]);
    }
    return this.httpClient.post<IAnalysisResult[]>(environment.analysisEndpoint, formData).pipe(take(1));
  }
}