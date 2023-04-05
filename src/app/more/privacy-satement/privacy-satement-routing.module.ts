import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivacySatementPage } from './privacy-satement.page';

const routes: Routes = [
  {
    path: '',
    component: PrivacySatementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivacySatementPageRoutingModule {}
