import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-partner-details',
  templateUrl: './partner-details.component.html',
  styleUrls: ['./partner-details.component.scss'],
})
export class PartnerDetailsComponent {
  options: any = [];
  data: any;
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.matIconRegistry.addSvgIcon(
      `check-circle-broken`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/check-circle-broken.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `check-circle`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/Icon.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `back`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/back.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `edit`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/edit.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `share`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/share.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `trash-red`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/trash-red.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `trash`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/trash.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `copy`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/copy.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `clock-circle`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/clock.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `file`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/file.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `expand-all`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/expand-all.svg',
      ),
    );
    this.matIconRegistry.addSvgIcon(
      `Vector`,
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/icons/Vector.svg',
      ),
    );
  }

  ngOnInit() {
    this.data = history.state;
  }
}
