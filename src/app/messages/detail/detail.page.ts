import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  message:any;
  constructor(private shared:SharedService,private Apiauth:ApiService,private _Activatedroute:ActivatedRoute,private router:Router,private location:Location) {
   console.log( this._Activatedroute.snapshot.paramMap.get('item'))
   this.message = JSON.parse(this._Activatedroute.snapshot.paramMap.get('item'))
   this.updateReadStatus()
   }

  ngOnInit() {

  }

  prevPage(){
    this.location.back();
  }

  updateReadStatus() {
 
    let params = {
      ClientIP: this.shared.CLIENT_IP+'_'+this.shared.DDS_V,
      DriverIdentifier: this.shared.GBLogoutObj.DriverIdentifier,
      TransactionID: this.shared.GBLogoutObj.TransactionID,
      LicenseNbr: this.message._LicenseNumber,
      EventID:this.message._EventID,
      MessageReadTS: false
    };

    let request = {
      params: params,
      action_url: '/Message/SetMessageStatus',
      method: 'post',
      serviceType: 'updatemessages',
    };

    this.shared.showLoading();
    this.Apiauth.doHttp(request).subscribe(
      async (resp:any) => {
        console.log(resp)
        this.shared.HideLoading();
      },
      (error) => {
        this.shared.HideLoading()
      }
    );

  }

}
