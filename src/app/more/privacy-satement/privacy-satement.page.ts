import { Component, Input, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-privacy-satement',
  templateUrl: './privacy-satement.page.html',
  styleUrls: ['./privacy-satement.page.scss'],
})
export class PrivacySatementPage implements OnInit {
  isFromLogin: boolean;
  @Input() isFrom: any;
  constructor(
    private _location: Location,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.isFromLogin = this.isFrom == 'login' ? true : false; 
    console.log(this.isFromLogin)
  }


  goBack(){
    if(!this.isFromLogin){
      this._location.back();
    } else {
      this.modalCtrl.dismiss();
    }
  }

}
