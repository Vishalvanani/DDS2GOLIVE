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
      this.router.navigate(['login']);
    }, 60000);
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
