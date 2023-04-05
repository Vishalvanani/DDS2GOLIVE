import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
})
export class ContactusPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openmap(){
    window.open('https://www.google.co.in/maps/place/Georgia+Department+of+Driver+Services/@33.6666751,-83.9777148,17z/data=!3m1!4b1!4m5!3m4!1s0x88f5b4df4d70d961:0xfdfa2dc823871aa9!8m2!3d33.6666707!4d-83.9755261?hl=en', '_system', 'location=yes,hardwareback=yes');
  }

}
