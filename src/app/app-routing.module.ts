import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'information',
    loadChildren: () => import('./information/information.module').then( m => m.InformationPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'location',
    loadChildren: () => import('./location/location.module').then( m => m.LocationPageModule)
  },
  {
    path: 'services',
    loadChildren: () => import('./Appservices/services/services.module').then( m => m.ServicesPageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./messages/messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'more',
    loadChildren: () => import('./more/more/more.module').then( m => m.MorePageModule)
  },
  {
    path: 'contactus',
    loadChildren: () => import('./more/contactus/contactus.module').then( m => m.ContactusPageModule)
  },
  {
    path: 'privacy-satement',
    loadChildren: () => import('./more/privacy-satement/privacy-satement.module').then( m => m.PrivacySatementPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
