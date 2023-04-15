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
    this.isBioTermsEnabled = localStorage.getItem('fingerPrint') && (localStorage.getItem('fingerPrint') == 'true') ? true : false;
  }

  changeToggle() {
    this.isBioTermsEnabled = !this.isBioTermsEnabled;
    localStorage.setItem('fingerPrint', this.isBioTermsEnabled ? 'true' : 'false');
  }

}
