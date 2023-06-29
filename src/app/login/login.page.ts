import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { SharedService } from '../services/shared.service';
import { Router } from '@angular/router';
import { IonModal, ModalController, Platform } from '@ionic/angular';
import { NativeBiometric } from 'capacitor-native-biometric';
import { AES, enc } from 'crypto-js';
import { App, AppState } from '@capacitor/app';
import { PrivacySatementPage } from '../more/privacy-satement/privacy-satement.page';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { TermsConditionPage } from '../terms-condition/terms-condition.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  @ViewChild(IonModal) modal: IonModal;
  securityCode: any = '';
  isModalOpen: boolean = false;
  isFingerprintModalOpen: boolean = false;
  isValidFingerPrint: boolean = false;

  secretKey = 'test123';
  showPassword: boolean = false;
  resumeCalledCount: number = 0;
  isTermsConditionAccepted: boolean;
  isPrivacyAccepted: boolean;
  selectedSegment: string = null;
  constructor(
    public formBuilder: FormBuilder,
    private Apiauth: ApiService,
    private shared: SharedService,
    private modalCtrl: ModalController,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    public platform: Platform,
    private iab: InAppBrowser,

  ) {
    this.loginForm = this.formBuilder.group({
      userEmail: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.pattern(
            /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,3})$/
          ),
        ],
      ],
      userPassword: ['', [Validators.required, Validators.minLength(1)]],
      saveId: [],
    });
    this.makeBiometricLogin();
  }

  // good@gmail.com - Password@1

  ionViewDidEnter() {
    let saveId = localStorage.getItem('saveid')
    this.loginForm?.get('userEmail')?.reset();
    this.loginForm?.get('userPassword')?.reset()
    if (saveId) {
      this.loginForm?.get('saveId')?.setValue(true);
      let user: any = localStorage.getItem('user');
      let dec = this.decrypt(user);
      let userId = JSON.parse(dec);
      this.loginForm?.get('userEmail')?.setValue(userId.UserID);
    } else {
    }
  }

  isBrowserOpen: boolean = false;
  openinAppBrowser(url) {
    this.isBrowserOpen = true;
    let options: InAppBrowserOptions = {
      zoom: 'no',
      clearcache: 'yes',
      clearsessioncache: 'yes',
      toolbarcolor: '#ffffff',
      hideurlbar: 'yes', // hide the url toolbar
      hidenavigationbuttons: 'no', // hide navigation buttons back/forward,
      location: 'no'
    };

    const browser = this.iab.create(url, '_blank', options);
    browser.on('exit').subscribe((res) => {
      this.isBrowserOpen = false;
    });
  }

  ngOnInit() {

  }

  isCalledRunning: boolean = false;
  isFingerprintCancelled: boolean = false;
  ionViewWillEnter() {
    App.addListener('appStateChange', (state: AppState) => {
      if (!state.isActive) this.isFingerprintCancelled = false;
      if (this.isFingerprintCancelled) return;
      if (state.isActive && !this.isBrowserOpen && !this.isCalledRunning && !this.router.url.includes("location")) {
        this.isCalledRunning = true;
        this.resumeCalledCount++;
        this.makeBiometricLogin();
      } else {
        this.isCalledRunning = false;
      }
    });
  }

  ngOnDestroy() {
    App.removeAllListeners();
  }


  // openinAppBrowser(url){
  //   this.shared.openInappbrowser(url);
  // }

  toggleEye() {
    this.showPassword = !this.showPassword;
  }

  autoLogin() {
    let isUserExists: any = localStorage.getItem('user')
      ? localStorage.getItem('user')
      : '';
    if (isUserExists) {
      let localUser = JSON.parse(this.decrypt(isUserExists));
      let params = {
        ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
        Password: localUser.Password,
        SourceCD: 'C',
        UserID: localUser.UserID,
      };
      this.submitForm(params);
    }
  }

  generateToken() {
    return new Promise((resolve, reject) => {
      let request = {
        params: {
          UserID: 'U+GOT0/rWxE=',
          Password: '1eNupvvYVwy55DhkyztkQQ==',
          GUID: '8WjrxkxUaeJGptHfGZxnNmiauN8paFIq3y7kIPWdtGhXtD+MBKHnBg==',
          ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
        },
        action_url: '/TokenAPI/GenerateToken',
        method: 'post',
        serviceType: 'gettoken',
      };

      this.Apiauth.doHttp(request).subscribe(
        (resp: any) => {
          this.shared.GBAPI_TOKEN = resp.token;

          return resolve(resp.token);
        },
        () => {
          return reject('error');
        }
      );
    });
  }

  navToPayzee() {
    this.router.navigate(['payeezy-payment']);
  }

  more() {
    this.router.navigate(['more', { isFrom: 'login' }]);
  }

  location() {
    this.router.navigate(['location', { isFrom: 'login' }]);
  }

  async clickSubmit() {
    let ionform = this.loginForm.value;
    let params = {
      ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
      Password: ionform.userPassword,
      SourceCD: 'C',
      UserID: ionform.userEmail,
    };


    this.submitForm(params);
  }

  async submitForm(params) {
    let request = {
      params: params,
      action_url: '/Account/FullServiceLogin',
      method: 'post',
      serviceType: 'login',
    };
    console.log('login loader')
    this.shared.showLoading();
    await this.generateToken();

    this.Apiauth.doHttp(request).subscribe(
      async (resp: any) => {
        this.shared.HideLoading();
        if (resp) {
          let respDriver = resp.driverInformation;

          if (respDriver.accountActive) {
            let obj: any = {};
            obj.UserID = params.UserID;
            obj.Password = params.Password;

            localStorage.setItem('user', this.encrypt(JSON.stringify(obj)));
            let saveIDValue = this.loginForm.get('saveId')?.value;

            if (saveIDValue) {
              localStorage.setItem('saveid', 'true');
            } else {
              localStorage.removeItem('saveid');
            }
            await this.filterResp(resp);
            this.setOpen(true);
          } else {
            this.shared.presentAlert(respDriver.message);
          }
        } else {
          this.shared.presentToast(
            'Something went wrong, Please try again later.'
          );
        }
      },
      (error) => {

        this.shared.HideLoading();
        this.shared.presentToast('Invalid Credentials, Please try again.');
      }
    );
  }

  filterResp(resp) {
    let respDriver = resp.driverInformation['returnFromMainframe'];

    let ARR: any = [];
    let History_Arr: any = [];
    let LicenseRealID: any = [];

    let existfee = 0;
    respDriver['rsp_curr_fines_arrayField']?.forEach((element) => {
      existfee += parseInt(element.rsp_fee_amountField);
    });

    ARR.driverInfo = {
      first_name: respDriver['rsp_frst_nameField'],
      last_name: respDriver['rsp_last_nameField'],
      dob: respDriver['rsp_dobField'],
      realID: respDriver['rsp_realid_flField'],
      points: respDriver['rsp_pointsField'],
      existfee: existfee,
      blood_type: respDriver['rsp_blood_typeField'],
      donor: respDriver['rsp_organ_donor_flField'] 
     // == 'Y' ? 'YES' : 'NO',
    };
    ARR.addressInfo = {
      addr_type:
        respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_primary_lnField'],
      city: respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_cityField'],
      state: respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_state_cdField'],
      zipcode:
      respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_postal_cdField'],
        //respDriver.rsp_curr_addrsField.substr(0,5) + '-' + respDriver.rsp_curr_addrsField.substr(5,10)
        
    };
    ARR.licenseInfo = {
      lic_number: respDriver['rsp_lic_idField'],
      lic_type:
        respDriver.rsp_curr_docm_arrayField[0]['rsp_lic_type_descField'],
      lic_state: respDriver['rsp_lic_st_cdField'],
      lic_status: respDriver['rsp_lic_statusField'],
      lic_expiry:
        respDriver.rsp_curr_docm_arrayField[0]['rsp_lic_expr_dtField'],
    };
    ARR.licenseEndors = respDriver['rsp_curr_docm_arrayField'][0];
    ARR.licenseEndorsAll = respDriver['rsp_curr_docm_arrayField'];
    History_Arr.citation = respDriver['rsp_mvr_cita_arrayField'];
    History_Arr.withdrawls = respDriver['rsp_mvr_susp_arrayField'];

    LicenseRealID.rsp_trk_privilege_cdField =
      respDriver['rsp_trk_privilege_cdField'];
    LicenseRealID.rsp_veteran_flField = respDriver['rsp_veteran_flField'];
    LicenseRealID.rsp_vision_waiver_flField =
      respDriver['rsp_vision_waiver_flField'];
    LicenseRealID.rsp_visn_corr_flField = respDriver['rsp_visn_corr_flField'];

    this.shared.GLOBALINFO = ARR;
    this.shared.GBDRIVERHISTORY = History_Arr;
    this.shared.GBLicenseRealID = LicenseRealID;

    this.shared.GBLogoutObj.ClientIP =
      this.shared.CLIENT_IP + '_' + this.shared.DDS_V;
    this.shared.GBLogoutObj.DriverIdentifier =
      respDriver['rsp_driver_identifierField'];
    this.shared.GBLogoutObj.LicIDNbr = respDriver['rsp_lic_idField'];
    this.shared.GBLogoutObj.TransactionID =
      resp.driverInformation['transactionID'];
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    App.removeAllListeners();
    this.changeDetectorRef.detectChanges();
  }

  modalwilldiscmiss() {
    this.isModalOpen = false;
  }

  fingerPrintModalDismiss() {
    this.isFingerprintModalOpen = false;
  }

  closeModal() {
    this.securityCode = '';
    this.modal.dismiss();
  }

  subscribeToNotification() {
    let request = {
      params: {
        DeviceToken: localStorage.getItem('firebasePushToken'),
        ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
        DriverIdentifier: this.shared.GBLogoutObj.DriverIdentifier,
        licenseNbr: this.shared.GBLogoutObj.LicIDNbr
      },
      action_url: '/Notify/Subscribe',
      method: 'post',
      serviceType: 'notify',
    };

    this.Apiauth.doHttp(request).subscribe(
    //this.Apiauth.registerNotificationSub(request).subscribe(
      (resp: any) => {
        console.log('registerNotification resp', resp)
      },
      (error) => {
        console.log('error', error)
      })
  }

  validateSecurityCode() {
    let params = {
      ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
      DriverIdentifier: this.shared.GBLogoutObj.DriverIdentifier,
      TwoFactorCode: this.securityCode,
    };

    let request = {
      params: params,
      action_url: '/Account/TwoFactorAuthentication',
      method: 'post',
      serviceType: 'twofactor',
    };
console.log('login2 loader')
    this.shared.showLoading();
    this.Apiauth.doHttp(request).subscribe(
      async (resp: any) => {
        this.shared.HideLoading();

        let respObj = resp.twoFactorAuthResponse;
        if (respObj.valid) {
          // --- check if fingerprint is enabled or not ---
          let isFingerprintEnabled = localStorage.getItem('isFingerprintEnabled');
          if (this.isTermsConditionAccepted && !isFingerprintEnabled) {
            localStorage.setItem('isFingerprintEnabled', 'true');
          }
          this.securityCode = '';
          // ---
          if (!localStorage.getItem('firebasePushToken')) {
            this.subscribeToNotification();
          }
          this.modal.dismiss();
          this.router.navigate(['/tabs/tabs/tab3']);
        } else {
          this.shared.presentToast(respObj.validationMessage);
        }
      },
          (error) => {
            this.shared.HideLoading();
            this.shared.presentToast('Invalid Security Code, Please try again.');
          }
    );
  }

  saveIdChange(e) {

  }

  async fingerPrintLogin() {
    const result = await NativeBiometric.isAvailable();
    if (result.isAvailable) {
      let isUserLoggedIn = localStorage.getItem('user');
      let isFingerprintEnabled = localStorage.getItem('isFingerprintEnabled');
      if (isUserLoggedIn && isFingerprintEnabled) {
        this.makeBiometricLogin()
      } else {
        this.isFingerprintModalOpen = true;
      }
    } else {
      localStorage.removeItem('isFingerprintEnabled');
      alert(
        "Please register your fingerprints or face ID through your mobile device's settings before using this feature"
      );
    }
  }

  closeFingerprintModal() {
    this.isFingerprintModalOpen = false;
  }

  acceptPrivacy() {
    this.isPrivacyAccepted = true;
    this.closeFingerprintModal();
  }

  declinePrivacy() {
    this.isPrivacyAccepted = false;
    this.closeFingerprintModal();
  }
  acceptTerms() {
    this.isTermsConditionAccepted = true;
    this.closeFingerprintModal();
  }

  declineTerms() {
    this.isTermsConditionAccepted = false;
    this.closeFingerprintModal();
  }

  makeBiometricLogin() {
    this.resumeCalledCount = 0;
    let isFingerPrintSetupSuccess = localStorage.getItem('isFingerprintEnabled')
      ? localStorage.getItem('isFingerprintEnabled')
      : '';

    let isUserExists: any = localStorage.getItem('user')
      ? localStorage.getItem('user')
      : '';
    if (isUserExists && isFingerPrintSetupSuccess == 'true') {
      this.performBiometricVerificatin();
    } else {
      this.isCalledRunning = false;
    }
  }


  async privacy() {
    const modal = await this.modalCtrl.create({
      component: PrivacySatementPage,
      componentProps: { isFrom: 'login' }
    });
    modal.present();
  }
  async terms() {
    const modal = await this.modalCtrl.create({
      component: TermsConditionPage,
      componentProps: { isFrom: 'login' }
    });
    modal.present();
  }

  async performBiometricVerificatin() {
    const result = await NativeBiometric.isAvailable();

    if (result.isAvailable) {
      await NativeBiometric.verifyIdentity({
        reason: 'For easy log in',
        title: 'Log in',
        maxAttempts: 10,
      })

        .then(() => {
          this.isValidFingerPrint = true;
          this.isCalledRunning = false;
          let isUserExists: any = localStorage.getItem('user')
            ? localStorage.getItem('user')
            : '';
          if (isUserExists) {
            this.autoLogin();
          }
        })
        .catch(() => {
          this.isFingerprintCancelled = true;
          this.isCalledRunning = false;
          this.isValidFingerPrint = false;
        });
    } else {
      this.isCalledRunning = false;
      localStorage.removeItem('isFingerprintEnabled');
      alert(
        "There are no finger prints or face ID  added in your device. Please register your fingerprints or face ID through your mobile device's settings to Enable Auto login."
      );
    }
  }

  encrypt(value: string): string {
    return AES.encrypt(value, this.secretKey.trim()).toString();
  }

  decrypt(textToDecrypt: string) {
    return AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(enc.Utf8);
  }

  forgotpwd() {
    this.shared.openInappbrowser('https://dds.drives.ga.gov/_/');
  }

  createAcc() {
    this.shared.openInappbrowser('https://dds.drives.ga.gov/?link=UserRegistration');
  }
}
