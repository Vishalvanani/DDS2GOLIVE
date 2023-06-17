import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
//import { Device } from '@awesome-cordova-plugins/device/ngx';
import { environment } from '../../../src/environments/environment';

//import { ApiService } from './api.service';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@awesome-cordova-plugins/in-app-browser/ngx';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  CLIENT_IP: string = '';
  DDS_V = environment.dds_ver;

  GLOBALINFO: any = []; //store driver, address, license info globally
  GBDRIVERHISTORY: any = []; //Driver History
  GBLicenseRealID: any = []; //LicenseRealId card
  GBLogoutObj: any = {
    ClientIP: '',
    DriverIdentifier: '',
    LicIDNbr: '',
    SourceCD: 'C',
    TransactionID: '',
  };

  GBAPI_TOKEN: string = ''; //Global JWT Token
  GBPaymentInfo: any = '';
  constructor(
    public loadingCtrl: LoadingController,
    public toastController: ToastController,
    private alertController: AlertController,
    private iab: InAppBrowser //private Apiauth: ApiService,
  ) {}

  //Spinner Loader
  async showLoading() {
    console.log('#########')
    await this.loadingCtrl
      .create({
        message: 'Loading...',
      })
      .then((response) => {
        response.present();
      });
  }

  async HideLoading() {
    this.loadingCtrl
      .dismiss()
      .then((response) => {})
      .catch((err) => {});
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2500,
      position: 'middle',
    });
    toast.present();
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: msg,
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'OK',
          cssClass: 'alert-button-cancel',
        },
      ],
    });

    await alert.present();
  }

  openInappbrowser(url) {
    let options: InAppBrowserOptions = {
      zoom: 'no',
      clearcache: 'yes',
      clearsessioncache: 'yes',
      toolbarcolor: '#ffffff',
      hideurlbar: 'yes', // hide the url toolbar
      hidenavigationbuttons: 'no', // hide navigation buttons back/forward
      location: 'no'
    };

    this.iab.create(url, '_blank', options);
  }
}
