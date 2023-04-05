import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
 
  constructor(public auth: ApiService,private shared:SharedService,private router :Router) { }

  ngOnInit() {
  }
  openinAppBrowser(url){
    this.shared.openInappbrowser(url)
  }

  orderHistory(){
    this.router.navigate(['/tabs/tabs/tab2/orderhistory'])
  }





}
