import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { Geolocation, Position } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';
import cscfile from '../../assets/csclist.json';
import locationfile from '../../assets/locationlist.json';
import { ApiService } from '../services/api.service';
import { ActivatedRoute } from '@angular/router';

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
 address!: Object;
 public currentLocation!: any;
 public currentLocationLat!: any;
 public currentLocationLng!: any;
 public currentLocationUrl:string = 'assets/icon/map-marker-current.png';
 public isFromLogin: Boolean;

constructor(private _Activatedroute:ActivatedRoute,public auth: ApiService,public zone:NgZone) {}
 ngOnInit(): void {
  this.isFromLogin = this._Activatedroute.snapshot.paramMap.get('isFrom') == 'login' ? true : false; 
  this.data=cscfile;
  this.markers = [];
  this.locationlist = locationfile;
  this.mapRef = {} as ElementRef<HTMLElement>;
  this.currentLocation = '';
  this.currentLocationLat=0;
  this.currentLocationLng=0;
  this.currentLocationUrl = 'assets/icon/map-marker-current.png';
  }
ngAfterViewInit(): void {
}

ionViewWillEnter(){
  this.MapSegment =  'MapView';
}
ionViewDidEnter(){
  setTimeout(() => {
  this.address='';
  this.markers=[];
  this.createMap();
  }, 1000);
  }
  /*Check which segment is selected*/
  async mapViewChangeAction(event){
    switch(event.target.value){
      case 'MapView':
        //clear the search address
        this.address='';
        //clear markers
        this.markers=[];
        setTimeout(() => {
          this.createMap();
        }, 1000);
        break;
      case 'ListView':
        this.createMapList();
        break;
    }
  }
/*Create Map functionality*/
  async createMap(){
  //setTimeout(async () => {
    //check if current location is the one in the search box
    if (this.address == undefined || this.address == ''){
      this.currentLocation = await Geolocation.getCurrentPosition();
      this.currentLocationLat = this.currentLocation.coords.latitude;
      this.currentLocationLng = this.currentLocation.coords.longitude;
    }
    else{
      this.currentLocationLat = this.currentLocation.lat();
      this.currentLocationLng = this.currentLocation.lng();
    }
    const mapelement = this.mapRef.nativeElement;
    this.map = await GoogleMap.create({
      forceCreate:true,
      id:'my-map',
      element: mapelement,
      apiKey: environment.mapsKey,
      config: {
        center:{
          lat: this.currentLocationLat,
          lng: this.currentLocationLng,
        },
        zoom:9,
      },
    });
    console.log('after gmapcreate');
    //setTimeout(() => {
      this.addMarkers();
      console.log('after addmarkers');
    //}, 20); 
  //},10);
  }

  async addMarkers(){
/*Loop through the csc file and add marker to the maps*/
  this.locationlist = locationfile;
  let currLat:number = 0;
  let currLng:number = 0;
 //Set the latitude and longitude of current location
  if (this.currentLocation.lat == undefined)
  {
    currLat = this.currentLocation.coords.latitude;
    currLng = this.currentLocation.coords.longitude;
  }
  else{
    currLat = this.currentLocation.lat();
    currLng = this.currentLocation.lng();
  }
  //const currCoordinates = await Geolocation.getCurrentPosition();
  //Add currentPosition to the map use different color
  const currPosM: Marker = {
    coordinate:{
      lat: 0,
      lng:0,
    },
    title: '',
    snippet: '',
  };
  currPosM.coordinate.lat = currLat;
  currPosM.coordinate.lng = currLng;
  currPosM.title = 'Current Location';
  currPosM.iconSize = {width:30,height:42};
  currPosM.iconUrl = this.currentLocationUrl;
  this.markers.push(currPosM);
  //currCoordinates
  //Calculate distance of cscs based on current location
 for(const c of this.locationlist)
  {
    const dmarkers = this.calculateDistanceBetweentwomarkers(currLat, currLng, c.Latitude, c.Longitude);
    c.location_distance = dmarkers;
  }
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  this.mapviewresults = [];
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
  m.iconSize = {width:30,height:42};
  m.iconUrl = 'assets/icon/map-marker-red.png';
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
    const dmarkers = this.calculateDistanceBetweentwomarkers(currCoordinates.coords.latitude,currCoordinates.coords.longitude, c.Latitude, c.Longitude);
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
  calculateDistanceBetweentwomarkers(currLocLat: number, currLocLng: number, cscLat: number, cscLng: number): number {
    const R = 3961; // Earth’s mean radius in meter
    const dLat = this.rad(cscLat - currLocLat);
    const dLong = this.rad(cscLng - currLocLng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(currLocLat)) * Math.cos(this.rad(cscLat)) *
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
  getAddress(place: any){
    if(place !== ''){
    //call add markers closer to this location
     //this.formattedAddress = place['formatted_address'];
    this.zone.run(() => {
      this.address = place['formatted_address'];
      //Set the current location
      this.currentLocation = place.geometry.location;
      this.markers = [];
      this.createMap();
    });
    /*this.displayAddrComponents(place); */
    }
    else{ /*'If address if empty'*/
      this.address = '';
      this.markers = [];
      this.createMap();
    }
  }
  }
