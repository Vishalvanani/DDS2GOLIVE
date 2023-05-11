import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage implements OnInit {
  INFO: any;
  segment: string = 'info';
  DriverHistory: any;
  LicenseRealId: any;

  licDocs: any = [
    { name: 'Commercial License', isCheck: false, icon: 'bus-outline' },  //0
    { name: 'Regular License', isCheck: false, icon: 'car-outline' },  //1
    { name: 'Motorcycle', isCheck: false, icon: 'bicycle-outline' }, //2
    { name: 'Identification Card', isCheck: false, icon: 'card-outline' },//3
  ];
  constructor(
    //private router:Router,
    public shared: SharedService,
    public auth: ApiService,
    private router: Router
  ) {
    this.INFO = shared.GLOBALINFO;
    console.log('this.INFO: ', this.INFO);
    this.DriverHistory = shared.GBDRIVERHISTORY;
    this.LicenseRealId = shared.GBLicenseRealID;
    this.isLicenseCode();

    // For citation
    this.DriverHistory['citation'] = this.DriverHistory['citation'].filter(ele => {
      return ele.rsp_mvr_cita_legl_descField.trim();
    })

    // For withdrawls
    this.DriverHistory['withdrawls'] = this.DriverHistory['withdrawls'].filter(ele => {
      return ele.rsp_mvr_susp_descField.trim();
    })

  }

  ngOnInit() {}

  segmentChanged(ev) {
    this.segment = ev.detail.value;
  }

  wantMore() {
    this.router.navigate(['/mvrhistory']);
  }

  isLicenseCode() {
    let licenseClassCode = this.INFO.licenseEndors['rsp_lic_class_cdField'];
    if (
      licenseClassCode == 'C' ||
      licenseClassCode == 'E' ||
      licenseClassCode == 'F'
    ) {
      this.licDocs[1].isCheck = true; //Regular License
    }
    if (
      licenseClassCode == 'CM' ||
      licenseClassCode == 'EM' ||
      licenseClassCode == 'FM'
    ) {
      this.licDocs[1].isCheck = true; //Regular License
    }
    if (licenseClassCode == 'D') {
      this.licDocs[1].isCheck = true; //Regular License
    }
    if (licenseClassCode == 'DM') {
      this.licDocs[1].isCheck = true; //Regular License
    }
    if (
      licenseClassCode == 'CP' ||
      licenseClassCode == 'EP' ||
      licenseClassCode == 'FP'
    ) {
      this.licDocs[1].isCheck = true; //Regular License
    }
    if (licenseClassCode == 'A' || licenseClassCode == 'B') {
      this.licDocs[0].isCheck = true; //Commercial License
    }
    if (licenseClassCode == 'AM' || licenseClassCode == 'BM') {
      this.licDocs[0].isCheck = true; //Commercial License
    }
    if (licenseClassCode == 'AP' || licenseClassCode == 'BP') {
      this.licDocs[0].isCheck = true; //Commercial License
      this.licDocs[1].isCheck = true; //Regular License
    }

    if (licenseClassCode == 'M' || licenseClassCode == 'MP') {
      this.licDocs[2].isCheck = true; //Motorcycle
    }
    if (licenseClassCode == 'MP') {
      this.licDocs[2].isCheck = true; //Motorcycle
    }
    if (licenseClassCode == 'ID') {
      this.licDocs[3].isCheck = true; //Identification Card
    }
  }
}
