import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationPageRoutingModule } from './location-routing.module';

import { LocationPage } from './location.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AutocompleteComponent } from '../google-places/google-places.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationPageRoutingModule
  ],
  declarations: [
    LocationPage,
    AutocompleteComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LocationPageModule {}
