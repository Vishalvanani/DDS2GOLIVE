import { Component } from '@angular/core';
import { Device } from '@capacitor/device';
import { SharedService } from './services/shared.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private shared:SharedService) {
    const logDeviceInfo = async () => {
      //const info = await Device.getInfo();
    const deviceid = await Device.getId();
    this.shared.CLIENT_IP = deviceid.uuid
    console.log(deviceid.uuid);
    };

    logDeviceInfo();
  }
}
