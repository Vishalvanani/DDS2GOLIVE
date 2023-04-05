import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
@Component({
  selector: 'app-mvrhistory',
  templateUrl: './mvrhistory.page.html',
  styleUrls: ['./mvrhistory.page.scss'],
})
export class MvrhistoryPage implements OnInit {

  radioVal:any=[
    {"label":"3 Year","amount":"6","currency":"$"},
    {"label":"3 Year Certified","amount":"6","currency":"$"},
    {"label":"7 Year","amount":"8","currency":"$"},
    {"label":"7 Year Certified","amount":"10","currency":"$"}
  ]
  constructor(
    private router:Router,private shared:SharedService) { }

  ngOnInit() {
  }

  continue(){
    if(this.shared.GBPaymentInfo){
    this.router.navigate(['/checkout'])
    }
    else{
      this.shared.presentToast("Please select the amount")
    }
  }

  amountChange(ev){
    console.log(ev)
    this.shared.GBPaymentInfo = ev.detail.value;
  }

}
