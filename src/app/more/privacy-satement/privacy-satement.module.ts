import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivacySatementPageRoutingModule } from './privacy-satement-routing.module';

import { PrivacySatementPage } from './privacy-satement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivacySatementPageRoutingModule
  ],
  declarations: [PrivacySatementPage]
})
export class PrivacySatementPageModule {}
