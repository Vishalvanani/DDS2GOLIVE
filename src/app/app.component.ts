import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Device } from '@capacitor/device';
import { SharedService } from './services/shared.service';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  ActionPerformed,
 PushNotificationSchema,
 PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { ApiService } from './services/api.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  idleLogoutTimer: any;
  PushPermission = '';
  PushToken = '';
  constructor(
    private shared:SharedService,
    private alertController:AlertController,
    private modalCtrl:ModalController,
    private router: Router,
    private platform: Platform,
    private apiService: ApiService,
    private changeRef: ChangeDetectorRef,
    ) {

    platform.ready().then(async () => {
      // this.getPushNotification(); 
    })
    const logDeviceInfo = async () => {
      // const info = await Device.getInfo();
    const deviceid = await Device.getId();
    this.shared.CLIENT_IP = deviceid.uuid
    console.log(deviceid.uuid);
    };

    logDeviceInfo();
  }


  ngOnInit() {
    this.isUserExist();
  }

  getPushNotification() {
    //  // Request permission to use push notifications
    //     // iOS will prompt user and return if they granted permission or not
    //     // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        //         // Register with Apple / Google to receive push via APNS/FCM
        console.log('Push Permission Granted');
        this.PushPermission = 'Push Permission Granted';
        PushNotifications.register();
      } else {
        //         // Show some error
        console.log('requestPermissions Error');
        this.PushPermission = 'requestPermissions Error';
      }
    });

    if (!localStorage.getItem('firebasePushToken')) {
      this.registerPushToken();
    }

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        // alert('Push received: ' + JSON.stringify(notification));
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        //  alert('Push action performed: ' + JSON.stringify(notification));
      },
    );
  }

  registerPushToken() {
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      //  alert('Push registration success, token: ' + token.value);
      this.PushToken = token.value;
      localStorage.setItem('firebasePushToken', this.PushToken)
      this.registerPublicToken(this.PushToken)
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
      // alert('Error on registration: ' + JSON.stringify(error));
      this.PushToken = 'Error on registration: ' + JSON.stringify(error);
    });
  }

  restartIdleLogoutTimer() {
    clearTimeout(this.idleLogoutTimer);
    this.idleLogoutTimer = setTimeout(async () => {
      const popover = await this.modalCtrl.getTop();
      if (popover){ this.modalCtrl.dismiss(); }
      this.router.navigate(['login']);
      this.changeRef.detectChanges();
    }, 30000);
  }

  registerPublicToken(token){
      let request = {
        params: { DeviceToken : token  },
        action_url: 'PublicSubscribe',
        method: 'post',
        serviceType: 'notify',
      };
      this.apiService.registerNotification(request).subscribe(
        async (resp: any) => {
          console.log('registerNotification resp', resp)
        },
        (error) => {
          console.log('error', error)
        }
      );
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
