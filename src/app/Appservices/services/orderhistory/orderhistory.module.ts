import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderhistoryPageRoutingModule } from './orderhistory-routing.module';

import { OrderhistoryPage } from './orderhistory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderhistoryPageRoutingModule
  ],
  declarations: [OrderhistoryPage]
})
export class OrderhistoryPageModule {}
