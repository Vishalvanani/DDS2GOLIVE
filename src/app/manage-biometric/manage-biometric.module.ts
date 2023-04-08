import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageBiometricPageRoutingModule } from './manage-biometric-routing.module';

import { ManageBiometricPage } from './manage-biometric.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageBiometricPageRoutingModule
  ],
  declarations: [ManageBiometricPage]
})
export class ManageBiometricPageModule {}
