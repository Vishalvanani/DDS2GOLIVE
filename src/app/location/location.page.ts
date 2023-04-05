import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { Geolocation, Position } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../src/environments/environment';
import cscfile from '../../assets/csclist.json';
import locationfile from '../../assets/locationlist.json';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'location.page.html',
  styleUrls: ['location.page.scss'],
  })
export class LocationPage implements AfterViewInit, OnInit{
 @ViewChild('map') mapRef: ElementRef<HTMLElement>;
 public map: GoogleMap;
 public data = [];
 public results= [];
 public mapviewresults= [];
 public maplistview: string;
 public markers = [];
 public locationlist = [];
 MapSegment='MapView';
constructor(private modalCtrl: ModalController,public auth: ApiService) {}
 ngOnInit(): void {
  console.log('into oninit maplistview value='+this.maplistview);
  this.data=cscfile;
  this.markers = [];
  this.locationlist = locationfile;
  this.mapRef = {} as ElementRef<HTMLElement>;
  console.log('end of oninit maplistview value='+this.maplistview);
  }
ngAfterViewInit(): void {
  console.log(this.mapRef);
}
ionViewDidEnter(){
  setTimeout(() => {
  this.createMap();
  }, 200);
  }
  /*Check which segment is selected*/
  async mapViewChangeAction(event){
    switch(event.target.value){
      case 'MapView':
        await this.createMap();
        break;
      case 'ListView':
        await this.createMapList();
        break;
    }
  }
/*Create Map functionality*/
  async createMap(){
  console.log('into createmap maplistview value='+this.maplistview);
  setTimeout(async () => {
    const mapelement = this.mapRef.nativeElement;
    console.log(this.mapRef.nativeElement);
    this.map = await GoogleMap.create({
      forceCreate:true,
      id:'my-map',
      element: mapelement,
      apiKey: environment.mapsKey,
      config: {
        center:{
          lat: 33.66750,
          lng:-83.97555,
        },
        zoom:8,
      },
    });
     await this.addMarkers();
  },1000);
  }

  async addMarkers(){
/*Loop through the csc file and add marker to the maps*/
  this.locationlist = locationfile;
  //this.results = this.data;
  const currCoordinates = await Geolocation.getCurrentPosition();
  //currCoordinates
  //Calculate distance of cscs based on current location
  for(const c of this.locationlist)
  {
    const dmarkers = this.calculateDistanceBetweentwomarkers(currCoordinates, c.Latitude, c.Longitude);
    c.location_distance = dmarkers;
  }
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  this.mapviewresults = this.locationlist.sort(function(a, b) {
    return parseFloat(a.location_distance) - parseFloat(b.location_distance);});
    //Show only top 3 cscs
  for(let cscCount = 0;cscCount<3;cscCount++){
    const m: Marker = {
      coordinate:{
        lat: 0,
        lng:0,
      },
      title: '',
      snippet: '',
    };
  m.coordinate.lat = this.mapviewresults[cscCount].Latitude;
  m.coordinate.lng = this.mapviewresults[cscCount].Longitude;
  m.title = this.mapviewresults[cscCount].Building_Name;
  m.snippet = this.mapviewresults[cscCount].hours;
  this.markers.push(m);
    }
/*for(const r of this.results)
    {
      const m: Marker = {
          coordinate:{
            lat: 0,
            lng:0,
          },
          title: '',
          snippet: '',
        };
      m.coordinate.lat = r.Latitude;
      m.coordinate.lng = r.Longitude;
      m.title = r.Building_Name;
      m.snippet = r.hours;
      this.markers.push(m);
    }*/

    this.map.addMarkers(this.markers);
      /*this.map.setOnMarkerClickListener(async (marker) =>{
      const modal = await this.modalCtrl.create({
        component: ModalPage,
        componentProps:{
          marker,
        },
        breakpoints:[0, 0.3],
        initialBreakpoint:0.3,
      });
      modal.present();
      this.openmap(marker.latitude,marker.longitude);
    });*/
}
/*End Create Map Functionality*/
/*Create Map List Functionality*/
async createMapList()
{
  /*Get csc list from the file and then set it to the array list*/
  this.maplistview = 't';
  this.mapviewresults = [];
  this.locationlist = locationfile;
  //this.results = this.data;
  const currCoordinates = await Geolocation.getCurrentPosition();
  //currCoordinates
  //Calculate distance of cscs based on current location
  for(const c of this.locationlist)
  {
    const dmarkers = this.calculateDistanceBetweentwomarkers(currCoordinates, c.Latitude, c.Longitude);
    c.location_distance = dmarkers;
  }
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  this.results = this.locationlist.sort(function(a, b) {
    return parseFloat(a.location_distance) - parseFloat(b.location_distance);});
  }
 /*calculateDistanceBetweentwomarkers(currC: Position, cscLat: number, cscLng: number ): number{
  const R = 6378.1370; // Earth’s mean radius in miles
  const eradius = (Math.PI / 180.0);
  const dLat = (cscLat - currC.coords.latitude) * eradius;
  const dLong = (cscLng - currC.coords.longitude) * eradius ;
  const a = Math.pow(Math.sin(dLat / 2.0), 2.0) + Math.cos(currC.coords.latitude * eradius) *
  Math.cos(cscLat * eradius) * Math.pow(Math.sin(dLong / 2.0), 2.0);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  const d = Math.round(R * c);
  return (d); // returns the distance in miles
  }*/
  rad(x: number): number{
    return x * Math.PI / 180;
  };
  calculateDistanceBetweentwomarkers(currC: Position, cscLat: number, cscLng: number): number {
    const R = 3961; // Earth’s mean radius in meter
    const dLat = this.rad(cscLat - currC.coords.latitude);
    const dLong = this.rad(cscLng - currC.coords.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(currC.coords.latitude)) * Math.cos(this.rad(cscLat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = Math.round(R * c);
    return d; // returns the distance in meter
  };
  async locateMe(){
    const coordinates = await Geolocation.getCurrentPosition();
    if (coordinates){
      this.map.setCamera({
        coordinate:{
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude,
        },
        zoom: 12,
      });
    }
  }
  searchhandleChange(event) {
    if (event.target.value !=='')
    {
      const query = event.target.value.toLowerCase();
      this.results = this.data.filter(d=>d.Building_Name.toLowerCase().indexOf(query) > -1);
      this.mapResultMarkers(this.results);
      console.log(this.results);
    }
    else
    {
      this.results=[];
    }
  }
  searchcancel(event){
    //This will clear the markers and then add markers to the map again.
    this.map.removeMarkers(this.markers);
    this.markers = [];
    this.createMap();
  }
  //This function opens google maps
  async openmap(destlat: number, destlng: number){
    //Open google maps native app using url
    const coordinates = await Geolocation.getCurrentPosition();
    const originlatlng = coordinates.coords.latitude + ',' + coordinates.coords.longitude;
    const destinationlatlng = destlat + ',' + destlng;
    const myURL = 'https://www.google.com/maps/dir/?api=1&origin=' + originlatlng + '&destination='
    + destinationlatlng + '&travelmode=driving';
    window.open(myURL, '_system','location=yes');
    }
  async mapResultMarkers(searchresults){
    //This will clear the markers and then add markers to the map again.
    this.map.removeMarkers(this.markers);
    this.markers = [];
    //Need to recreate the map
    this.map = await GoogleMap.create({
      forceCreate:true,
      id:'my-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsKey,
      config: {
        center:{
          lat: 33.66750,
          lng:-83.97555,
        },
        zoom:8,
      },
    });
    for(const r of searchresults)
    {
      const m: Marker = {
          coordinate:{
            lat: 0,
            lng:0,
          },
          title: '',
          snippet: '',
        };
      m.coordinate.lat = r.Latitude;
      m.coordinate.lng = r.Longitude;
      m.title = r.Building_Name;
      m.snippet = r.hours;
      this.markers.push(m);
    }
    await this.map.addMarkers(this.markers);
  }
  }
