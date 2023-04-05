import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () =>
          import('../location/location.module').then((m) => m.LocationPageModule),
      },
      {
        path: 'tab2',
        loadChildren: () =>
        import('../Appservices/services/services.module').then((m) => m.ServicesPageModule),
      },
      {
        path: 'tab3',
        loadChildren: () =>
        import('../information/information.module').then((m) => m.InformationPageModule),
      },
      {
        path: 'tab4',
        loadChildren: () =>
        import('../messages/messages/messages.module').then((m) => m.MessagesPageModule),
      },
      {
        path: 'tab5',
        loadChildren: () =>
        import('../more/more/more.module').then((m) => m.MorePageModule),
      },
      {
        path: '',
        redirectTo: 'tabs/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/tabs/tab1',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
