import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ApiService } from '../../../services/api.service';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-orderhistory',
  templateUrl: './orderhistory.page.html',
  styleUrls: ['./orderhistory.page.scss'],
})
export class OrderhistoryPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  orders = [];
  isModalOpen: boolean = false;
  lstLicense: any;
  selectedInd: any = 0;
  isLoadFinish: boolean = false;

  constructor(
    public Apiauth: ApiService,
    private shared: SharedService,
    private router: Router
  ) {
    this.getOrderDetails();
  }

  ngOnInit() {}
  onWillDismiss(ev) {
    this.isModalOpen = false;
  }

  getOrderDetails() {
    let params = {
      ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
      DriverIdentifier: this.shared.GBLogoutObj.DriverIdentifier,
      LicIDNbr: this.shared.GBLogoutObj.LicIDNbr,
      SourceCD: 'C',
      TransactionID: this.shared.GBLogoutObj.TransactionID,
    };

    let request = {
      params: params,
      action_url: '/Order/getOrders',
      method: 'post',
      serviceType: 'getorders',
      //content-Type: 'application/json',
    };

    this.shared.showLoading();
    this.Apiauth.doHttp(request).subscribe(
      async (resp: any) => {
        this.shared.HideLoading();
        this.isLoadFinish = true;
        if (resp.previousOrderInfoResp) {
          this.orders = resp.previousOrderInfoResp;
          console.log("this.orders", this.orders)
        } else {
          this.shared.presentToast('No Orders History Available.');
        }
      },
      (error) => {
        console.log(error);
        this.shared.HideLoading();
        this.isLoadFinish = true;
        // this.shared.presentToast('Invalid Security Code, Please try again......')
      }
    );
  }

  viewReport(item, i) {
    //this.lstLicense = item;
    this.selectedInd = i;
    //console.log(this.orders['previousMVRData'][this.selectedInd]['_lstLicenseInfo'][0].m_LicIDClassCD)
    this.isModalOpen = true;
    //this.router.navigate(['/tabs/tabs/tab2/view-report'])
  }

  cancel() {
    this.isModalOpen = false;
    // this.modal.dismiss(null, 'cancel');
  }
}
