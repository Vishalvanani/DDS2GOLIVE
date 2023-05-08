import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-biometric',
  templateUrl: './manage-biometric.page.html',
  styleUrls: ['./manage-biometric.page.scss'],
})
export class ManageBiometricPage implements OnInit {
  isBioTermsEnabled: boolean = false;

  constructor() { }

  ngOnInit() {
    this.isBioTermsEnabled = localStorage.getItem('isFingerprintEnabled') && (localStorage.getItem('isFingerprintEnabled') == 'true') ? true : false;
  }

  changeToggle() {
    this.isBioTermsEnabled = !this.isBioTermsEnabled;
    localStorage.setItem('isFingerprintEnabled', this.isBioTermsEnabled ? 'true' : 'false');
    if(this.isBioTermsEnabled){ 
      localStorage.setItem('isTermsConditionAccepted', 'true');
    }
  }

}
