import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { SharedService } from '../services/shared.service';
import { Router } from '@angular/router';
import { IonModal, Platform } from '@ionic/angular';
import { NativeBiometric } from 'capacitor-native-biometric';
import { AES, enc } from 'crypto-js';
import { App, AppState } from '@capacitor/app';
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
  touchIdValue: boolean = false;
  isValidFingerPrint: boolean = false;

  secretKey = 'test123';
  showPassword: boolean = false;
  cardList: any = [
    {
      logo: "assets/imgs/dollar.png",
      name: "Pay a super speeder fee, reinstatement fee or pending suspensions.",
      url: "https://dds.georgia.gov/georgia-licenseid"
    },
    {
      logo: "assets/imgs/edit.png",
      name: "Forms to complete before visiting a customer service center.",
      url: "https://dds.georgia.gov/georgia-licenseid"
    },
    {
      logo: "assets/imgs/date.png",
      name: "Make a road test a reservation",
      url: "https://dds.georgia.gov/georgia-licenseid"
    },
    {
      logo: "assets/imgs/cert.png",
      name: "Verify or print a certificate for a defensive driving or risk reduction course.",
      url: "https://dds.georgia.gov/georgia-licenseid"
    },
  ];
  resumeCalledCount: number = 0;
  constructor(
    public formBuilder: FormBuilder,
    private Apiauth: ApiService,
    private shared: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
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

  ionViewDidEnter(){ 
    let saveId = localStorage.getItem('saveid')
    let bioterms = localStorage.getItem('bioterms')
    if(bioterms) this.touchIdValue = true;
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

  ngOnInit() {

  }
  
  ionViewWillEnter(){
    App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive) {
        this.resumeCalledCount++;
        if(this.resumeCalledCount > 1){
          this.makeBiometricLogin();
        }
      } else {
        console.log('App has become inactive');
      }
    });
  }

  ngOnDestroy() {
    App.removeAllListeners();
}


  openinAppBrowser(url){
    this.shared.openInappbrowser(url)
  }

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
    this.router.navigate(['more', { isFrom: 'login'}]);
  }

  location() {
    this.router.navigate(['location', { isFrom: 'login'}]);
  }

  async clickSubmit() {
    let ionform = this.loginForm.value;
    let params = {
      ClientIP: this.shared.CLIENT_IP + '_' + this.shared.DDS_V,
      Password: ionform.userPassword,
      SourceCD: 'C',
      UserID: ionform.userEmail,
    };

    console.log(this.loginForm.value);
    this.submitForm(params);
  }

  async submitForm(params) {
    let request = {
      params: params,
      action_url: '/Account/FullServiceLogin',
      method: 'post',
      serviceType: 'login',
    };

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

            if (this.touchIdValue) {
              localStorage.setItem('fingerPrint', 'true');
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
        console.log(error);
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
      donor: respDriver['rsp_organ_donor_flField'] == 'Y' ? 'YES' : 'NO',
    };
    ARR.addressInfo = {
      addr_type:
        respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_primary_lnField'],
      city: respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_cityField'],
      state: respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_state_cdField'],
      zipcode:
        respDriver.rsp_curr_addrsField[0]['rsp_curr_addr_postal_cdField'],
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

    this.shared.showLoading();
    this.Apiauth.doHttp(request).subscribe(
      async (resp: any) => {
        this.shared.HideLoading();

        let respObj = resp.twoFactorAuthResponse;
        if (respObj.valid) {
          this.securityCode = '';
          this.modal.dismiss();
          this.router.navigate(['/tabs/tabs/tab3']);
        } else {
          this.shared.presentToast(respObj.validationMessage);
        }
      },
      (error) => {
        console.log(error);
        this.shared.HideLoading();
        this.shared.presentToast('Invalid Security Code, Please try again.');
      }
    );
  }

  saveIdChange(e) {
    console.log(e.detail.checked);
  }

  async fingerPrintLogin() {
    const result = await NativeBiometric.isAvailable();
    if (result.isAvailable) {
      let isTermsAccepted = localStorage.getItem('bioterms');
      let isUserLoggedIn = localStorage.getItem('user');
      if (!isUserLoggedIn || (isUserLoggedIn && (!isTermsAccepted || isTermsAccepted == 'false'))) {
        this.isFingerprintModalOpen = true;
      } else {
        this.makeBiometricLogin();
      }
    } else {
      this.touchIdValue = false;
      localStorage.setItem('fingerPrint', 'false');
      alert(
        "Please register your fingerprints or face ID through your mobile device's settings before using this feature"
      );
    }
  }

  closeFingerprintModal() {
    this.isFingerprintModalOpen = false;
  }

  acceptTerms() {
    localStorage.setItem('bioterms', 'true');
    this.touchIdValue = true;
    this.closeFingerprintModal();
  }

  declineTerms() {
    this.touchIdValue = false;
    this.closeFingerprintModal();
    localStorage.setItem('bioterms', 'false');
    localStorage.setItem('fingerPrint', 'false');
  }

  makeBiometricLogin() {
    this.resumeCalledCount = 0;
    let isFingerPrintSetupSuccess = localStorage.getItem('fingerPrint')
      ? localStorage.getItem('fingerPrint')
      : '';

    let isUserExists: any = localStorage.getItem('user')
      ? localStorage.getItem('user')
      : '';
    if (isUserExists && isFingerPrintSetupSuccess == 'true') {
      this.performBiometricVerificatin();
    }
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

          let isUserExists: any = localStorage.getItem('user')
            ? localStorage.getItem('user')
            : '';
          if (isUserExists) {
            this.autoLogin();
          }
        })
        .catch(() => {
          this.isValidFingerPrint = false;
        });
    } else {
      this.touchIdValue = false;
      localStorage.setItem('fingerPrint', 'false');
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
    this.shared.openInappbrowser('https://dds.drives.ga.gov/_/')
  }

  createAcc() {
    this.shared.openInappbrowser('https://dds.drives.ga.gov/_/')
  } 
}
