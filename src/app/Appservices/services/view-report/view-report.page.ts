import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { SharedService } from '../../../services/shared.service';
@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.page.html',
  styleUrls: ['./view-report.page.scss'],
})
export class ViewReportPage implements OnInit {

  constructor(public Apiauth: ApiService,private shared:SharedService,private router:Router) { 
    this.getOrderDetails();
  }

  ngOnInit() {
  }


  getOrderDetails(){
    let params = {
      "ClientIP": this.shared.CLIENT_IP+'_'+this.shared.DDS_V,
      "DriverIdentifier": this.shared.GBLogoutObj.DriverIdentifier,
      "LicIDNbr":this.shared.GBLogoutObj.LicIDNbr,
      "SourceCD": "C",
      "TransactionID": this.shared.GBLogoutObj.TransactionID
    };

    let request = {
      params: params,
      action_url: '/Order/getOrders',
      method: 'post',
      serviceType: 'getorders',
   //   content-Type: 'application/json',
    };

    this.shared.showLoading();
    this.Apiauth.doHttp(request).subscribe(
      async (resp:any) => {
        console.log(resp)
        this.shared.HideLoading();
        
        if(resp.previousOrderInfoResp){
          //this.orders = resp.previousOrderInfoResp;
        }
        else{
          this.shared.presentToast("No Orders History Available.")
        }
      
        
      },
      (error) => {
        console.log(error)
        this.shared.HideLoading();
       // this.shared.presentToast('Invalid Security Code, Please try again.')
      }
    );
  }
}
