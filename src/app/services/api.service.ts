import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  APIURL: string = 'https://onlinemvrdev.dds.ga.gov/MobileMbassGSS';
  //APIURL:string='https://onlinemvrdev.dds.ga.gov/MobileMbassGST_V2';

  constructor(
    public httpclient: HttpClient,
    private shared: SharedService,
    private router: Router
  ) {}
  public doHttp(request) {
    //console.log(request);
    var headers;

    let api_url = this.APIURL;

    let method = request.method.toLowerCase();
    headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('pragma', 'no-cache')
      .set('Access-Control-Allow-Origin', '*')
      .set(
        'cache-control',
        'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
      );

    //console.log("http : "+this.shared.GBAPI_TOKEN)
    if (this.shared.GBAPI_TOKEN) {
      headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('pragma', 'no-cache')
        .set('Access-Control-Allow-Origin', '*')
        .set(
          'cache-control',
          'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
        )
        .set('Authorization', 'Bearer ' + this.shared.GBAPI_TOKEN);
    } else {
      //.set('Authorization', 'Basic ' + btoa('test:test@123'))
    }
    

    // console.log(headers)
    if (!this.checkInternet()) {
      const simpleObservable = new Observable((observer) => {
        // observable execution
        observer.next('nonet');
        observer.complete();
      });
      return simpleObservable;
    } else if (method === 'get') {
      let params = request.params;
      return this.httpclient.get(api_url + request.action_url, {
        headers: headers,
        params: params,
      });
    } else if (method === 'post') {
      let params = request.params;
      if (request.params != null) params = request.params;
      return this.httpclient.post(api_url + request.action_url, params, {
        headers: headers,
      });
    }
  }

  registerNotification(request){
    let api_url = 'https://onlinemvrdev.dds.ga.gov/MobileMbassGST/Notify/';
    const username = 'DDSPSUSERSFB';
    const password = 'CY!GD06AG';
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(username + ':' + password)
    });
    let params = request.params;
    headers.append('Content-Type', 'application/json');
    return this.httpclient.post(api_url + request.action_url, params, {
      headers: headers,
    })
  }

 /*  registerNotificationSub(request) {
    let api_url = 'https://onlinemvrdev.dds.ga.gov/MobileMbassGST/Notify/';
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', 'Bearer ' + this.shared.GBAPI_TOKEN)
    .set('pragma', 'no-cache')
    .set('Access-Control-Allow-Origin', '*')
    .set(
      'cache-control',
      'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    )
    let params = request.params;
    headers.append('Content-Type', 'application/json');
    return this.httpclient.post(api_url + request.action_url, params, {
      headers: headers,
    })
  } */

  checkInternet() {
    return navigator.onLine;
  }

  closeSession(params) {
    let request = {
      params: params,
      action_url: '/Account/LogOutUser',
      method: 'post',
      serviceType: 'logout',
    };
    return new Promise((resolve, reject) => {
      this.doHttp(request).subscribe(
        (resp: any) => {
          return resolve('');
        },
        () => {
          return reject();
        }
      );
    });
  }

  logoutApp() {
    let obj = this.shared.GBLogoutObj;
    console.log('logout loader')
    this.shared.showLoading();
    this.closeSession(obj).then(
      () => {
        this.shared.HideLoading();
        this.router.navigate(['/login']);
      },
      () => {
        this.shared.HideLoading();
      }
    );
  }
}
