import { Component, HostListener } from '@angular/core';
import { Device } from '@capacitor/device';
import { SharedService } from './services/shared.service';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  idleLogoutTimer: any;
  constructor(
    private shared:SharedService,
    private alertController:AlertController,
    private modalCtrl:ModalController,
    private router: Router
    ) {
    const logDeviceInfo = async () => {
      //const info = await Device.getInfo();
    const deviceid = await Device.getId();
    this.shared.CLIENT_IP = deviceid.uuid
    console.log(deviceid.uuid);
    };

    logDeviceInfo();
  }


  ngOnInit() {
    this.isUserExist();
  }

  restartIdleLogoutTimer() {
    clearTimeout(this.idleLogoutTimer);
    this.idleLogoutTimer = setTimeout(() => {
      this.logoutUser();
    }, 60000);
  }
  
  async logoutUser() {
    // your logout logic here
    let idealTimeoutAlert = await this.alertController.create({
      header: 'Attention!',
      message: 'Your session is expired',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Login',
          role: 'cancel',
          handler: () => {
            // Handle Logout Code
            this.modalCtrl.dismiss();
            this.router.navigate(['login']);
          },
        },
        {
          text: 'Exit',
          handler: () => {
            // Handle Exit Code
            (navigator as any).app.exitApp();
          },
        },
      ],
    });
    idealTimeoutAlert.present();
  }

  @HostListener('touchstart')
  onTouchStart() {
    this.isUserExist();
  }

  isUserExist(){
    let isUserExists: any = localStorage.getItem('user') ? localStorage.getItem('user') : '';
    if (isUserExists) {
      this.restartIdleLogoutTimer();
    }

  }
}
