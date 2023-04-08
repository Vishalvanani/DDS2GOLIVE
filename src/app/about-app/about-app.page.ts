import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-about-app',
  templateUrl: './about-app.page.html',
  styleUrls: ['./about-app.page.scss'],
})
export class AboutAppPage implements OnInit {
  appVersion: any;

  constructor() { }

  ngOnInit() {
    App.getInfo().then((res:any) => {
      this.appVersion = res.version;
    });
  }

}
