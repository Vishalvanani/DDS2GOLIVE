import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicesPage } from './services.page';

const routes: Routes = [
  {
    path: '',
    component: ServicesPage
  },  {
    path: 'orderhistory',
    loadChildren: () => import('../../Appservices/services/orderhistory/orderhistory.module').then( m => m.OrderhistoryPageModule)
  },
  {
    path: 'view-report',
    loadChildren: () => import('../../Appservices/services/view-report/view-report.module').then( m => m.ViewReportPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesPageRoutingModule {}
