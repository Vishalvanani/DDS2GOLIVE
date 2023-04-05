import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  list: any;
  isNoMsg: boolean = false;
  nomessages: string = 'No Messages available.';
  constructor(
    private shared: SharedService,
    public Apiauth: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getMessages();
  }

  getMessages() {
    let params = {
      ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
      DriverIdentifier: this.shared.GBLogoutObj.DriverIdentifier,
      TransactionID: this.shared.GBLogoutObj.TransactionID,
    };

    let request = {
      params: params,
      action_url: '/Message/GetMessages',
      method: 'post',
      serviceType: 'messages',
    };

    this.shared.showLoading();
    this.isNoMsg = false;
    this.Apiauth.doHttp(request).subscribe(
      async (resp: any) => {
        console.log(resp);
        this.shared.HideLoading();

        let respObj = resp.driverMessageResponse?.lstDriverMessages;
        if (respObj) {
          this.isNoMsg = false;
          this.list = respObj;
        } else {
          this.isNoMsg = true;
          //this.shared.presentToast(this.nomessages);
        }
      },
      (error) => {
        console.log(error);
        this.shared.HideLoading();
        this.shared.presentToast('Something went wrong, Please try again.');
      }
    );
  }

  getHeaderText(code) {
    if (code == 'DM') {
      return 'DOCUMENT MAILED';
    } else if (code == 'DR') {
      return 'DOCUMENT RETURNED';
    } else {
      return '';
    }
  }

  detail(obj) {
    obj._UnreadMessage = false;
    this.router.navigate(['/tabs/tabs/tab4/detail', JSON.stringify(obj)]);
  }
}
