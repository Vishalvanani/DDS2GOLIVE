import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage implements OnInit {

  
  constructor(private shared:SharedService,private router:Router,public auth: ApiService) { }

  ngOnInit() {
  }

  openinAppBrowser(url){
    this.shared.openInappbrowser(url)
  }

  contactUs(){
    this.router.navigate(['contactus'])
  }
  
  privacy(){
    this.router.navigate(['privacy-satement'])
  }
  appInfo(){
    this.router.navigate(['about-app'])
  }
  manageBiomatric(){
    this.router.navigate(['manage-biometric'])
  }

  async howdo(){
    await Browser.open({ url: 'https://dds.georgia.gov/georgia-licenseid' });
  }

}
