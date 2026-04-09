import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { PropertyService } from '../../../core/services/property-service';
import { Property } from '../../../models/property';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-property-detail-component',
  imports: [
  CommonModule,
  MatDialogModule,
  MatCardModule,
  MatListModule,
  MatDividerModule,
  MatProgressSpinnerModule,
  MatTableModule
  ],
  templateUrl: './property-detail-component.html',
  styleUrl: './property-detail-component.css',
})
export class PropertyDetailComponent implements OnInit {

  property?: Property;
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { folio: string },
    private propertyService: PropertyService, private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.propertyService.getPropertyDetails(this.data.folio as any)
      .subscribe({
        next: (res) => {
          this.property = res;
          this.loading = false;
          console.log(this.property);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }
}