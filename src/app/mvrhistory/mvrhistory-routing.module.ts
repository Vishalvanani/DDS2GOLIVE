import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MvrhistoryPage } from './mvrhistory.page';

const routes: Routes = [
  {
    path: '',
    component: MvrhistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MvrhistoryPageRoutingModule {}
