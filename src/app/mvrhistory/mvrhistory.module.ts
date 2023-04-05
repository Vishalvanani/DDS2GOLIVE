import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MvrhistoryPageRoutingModule } from './mvrhistory-routing.module';

import { MvrhistoryPage } from './mvrhistory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MvrhistoryPageRoutingModule
  ],
  declarations: [MvrhistoryPage]
})
export class MvrhistoryPageModule {}
