import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderhistoryPage } from './orderhistory.page';

const routes: Routes = [
  {
    path: '',
    component: OrderhistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderhistoryPageRoutingModule {}
