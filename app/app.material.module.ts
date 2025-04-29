import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';

// import { MatButtonModule } from '@angular/material/button';
@NgModule({
  exports: [
    MatSliderModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    // MatButtonModule
  ],
  providers: [
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: { disabled: true } },
  ],
})
export class MaterialModule {}
