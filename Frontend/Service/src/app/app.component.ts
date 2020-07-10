import { Component, ViewChild, OnInit, AfterViewChecked, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';
import { AnalysisService } from './services/analysis.service';
import { HistoryService } from './services/history.service';
import { IAnalysisResult } from './interfaces/analysisResult';
import IHistoryItem from './interfaces/historyItem';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  title = 'VirusUnTotal';
  showTable = false;
  alreadyScrolled = false;
  maxFiles = 5;
  isLoadingAnalysis = false;
  isLoadingHistory = false;
  historyItems: IHistoryItem[] = [];
  displayedColumns: string[] = ['filename', 'result', 'date'];
  dataSource = new MatTableDataSource(this.historyItems);
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('scrollTarget', { static: false }) scrollTarget: ElementRef;
  files: File[] = [];

  constructor(private analysisService: AnalysisService, private dialog: MatDialog, private historyService: HistoryService) {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (item, filter) => {
      return item.filename.includes(filter);
    };
  }

  ngAfterViewChecked() {
    if (this.showTable && !this.alreadyScrolled) {
      this.alreadyScrolled = true;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.scrollTarget.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSelect(event: any) {
    if (this.files.length + event.addedFiles.length > this.maxFiles) {
      alert('Limite di ' + this.maxFiles + ' File.');
      return;
    }
    this.files.push(...event.addedFiles);
  }

  onRemove(file: File) {
    this.files.splice(this.files.indexOf(file), 1);
  }

  toggleTable() {
    if (!this.showTable) {
      this.isLoadingHistory = true;
      this.historyService.getHistory()
        .pipe(finalize(() => this.isLoadingHistory = false))
        .subscribe(items => {
          this.dataSource.data = [...items].sort((a, b) => a.date > b.date ? -1 : 1);
          this.dataSource.sort = this.sort;
          this.showTable = true;
          this.alreadyScrolled = false;
        }, () => alert('Si è verificato un problema.'));
    }
    else {
      this.showTable = false;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  analyzeFiles() {
    if (this.files.length > 0) {
      this.showTable = false;
      this.isLoadingAnalysis = true;
      this.analysisService.analyzeFiles(this.files)
        .pipe(finalize(() => this.isLoadingAnalysis = false))
        .subscribe(results => this.openDialog(results), () => alert('Si è verificato un problema.'));
    }
    else {
      alert('Nessun File da Analizzare.');
    }
  }

  openDialog(data: IAnalysisResult[]) {
    this.dialog.open(ResultDialogComponent, { data });
  }

  formatDate(date: Date): string {
    return moment(date).format('DD/MM/YYYY');
  }

}