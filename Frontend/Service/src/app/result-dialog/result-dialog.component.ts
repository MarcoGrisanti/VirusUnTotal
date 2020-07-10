import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IAnalysisResult } from '../interfaces/analysisResult';

@Component({
  selector: 'app-result-dialog',
  templateUrl: './result-dialog.component.html',
  styleUrls: ['./result-dialog.component.css']
})
export class ResultDialogComponent {

  constructor(public dialogRef: MatDialogRef<ResultDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: IAnalysisResult[]) {
    dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}