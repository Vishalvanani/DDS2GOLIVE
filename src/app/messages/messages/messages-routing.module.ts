import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessagesPage } from './messages.page';

import { DetailPage } from '../detail/detail.page';
const routes: Routes = [
  {
    path: '',
    component: MessagesPage
  },
  {
    path: 'detail/:item',
    component: DetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagesPageRoutingModule {}
