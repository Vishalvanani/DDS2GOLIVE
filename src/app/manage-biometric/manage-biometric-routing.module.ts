import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageBiometricPage } from './manage-biometric.page';

const routes: Routes = [
  {
    path: '',
    component: ManageBiometricPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageBiometricPageRoutingModule {}
