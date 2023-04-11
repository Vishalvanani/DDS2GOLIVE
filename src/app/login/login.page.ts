import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { SharedService } from '../services/shared.service';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { NativeBiometric } from 'capacitor-native-biometric';
import { AES, enc, mode, pad } from 'crypto-js';
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
  isfingerprintModalOpen: boolean = false;
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
  constructor(
    public formBuilder: FormBuilder,
    private Apiauth: ApiService,
    private shared: SharedService,
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
      //biometric: [],
    });
  }

  // good@gmail.com - Password@1

  ngOnInit() {
    if (localStorage.getItem('saveid')) {
      this.loginForm?.get('saveId')?.setValue(true);
      let user: any = localStorage.getItem('user');
      let dec = this.decrypt(user);
      let userId = JSON.parse(dec);
      this.loginForm?.get('userEmail')?.setValue(userId.UserID);
    }
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

      //this.shared.showLoading();
      this.Apiauth.doHttp(request).subscribe(
        (resp: any) => {
          this.shared.GBAPI_TOKEN = resp.token;

          return resolve(resp.token);
          // localStorage.setItem("token",resp.token)
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

            if (saveIDValue == true) {
              localStorage.setItem('saveid', 'true');
            } else if (!saveIDValue) {
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
    //console.log(ARR)
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
  }

  modalwilldiscmiss() {
    this.isModalOpen = false;
  }

  fingerPrintModalDismiss() {
    this.isfingerprintModalOpen = false;
  }

  closeModal() {
    this.modal.dismiss();
    //this.router.navigate(['/login']);
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
        //console.log(resp)
        this.shared.HideLoading();

        let respObj = resp.twoFactorAuthResponse;
        if (respObj.valid) {
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

  // async touchIdChange(e) {
  //   console.log(e);
  //   if (e.detail.checked) {
  //     const result = await NativeBiometric.isAvailable();
  //     console.log(JSON.stringify(result));
  //     console.log(result);
  //     if (result.isAvailable) {
  //       this.touchIdValue = true;
  //       //localStorage.setItem('fingerPrint', 'true');
  //       //this.performBiometricVerificatin()
  //     } else {
  //       this.touchIdValue = false;
  //       localStorage.setItem('fingerPrint', 'false');
  //       alert(
  //         "Please register your fingerprints or face ID through your mobile device's settings before using this feature"
  //       );
  //     }
  //   }
  // }

  async fingerPrintLogin() {
    const result = await NativeBiometric.isAvailable();

    if (result.isAvailable) {
      let isTermsAccepted = localStorage.getItem('bioterms');

      if (!isTermsAccepted || isTermsAccepted == 'false') {
        this.isfingerprintModalOpen = true;
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
    this.isfingerprintModalOpen = false;
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
    let isFingerPrintSetupSuccess = localStorage.getItem('fingerPrint')
      ? localStorage.getItem('fingerPrint')
      : '';

    /*  if (isFingerPrintSetupSuccess == 'true') {
      this.touchIdValue = true;
      //this.loginForm.get('biometric')?.setValue(true);
    } */

    let isUserExists: any = localStorage.getItem('user')
      ? localStorage.getItem('user')
      : '';
    if (isUserExists && isFingerPrintSetupSuccess == 'true') {
      this.performBiometricVerificatin();
    }
  }

  async performBiometricVerificatin() {
    const result = await NativeBiometric.isAvailable();

    console.log(result);
    //if (!result.isAvailable) return;

    //const isFaceID = result.biometryType == BiometryType.FACE_ID;

    if (result.isAvailable) {
      await NativeBiometric.verifyIdentity({
        reason: 'For easy log in',
        title: 'Log in',
        maxAttempts: 10,
      })

        .then(() => {
          // alert("Authentication Successfull.")
          this.isValidFingerPrint = true;

          let isUserExists: any = localStorage.getItem('user')
            ? localStorage.getItem('user')
            : '';
          //alert(isUserExists)
          if (isUserExists) {
            //alert("AUTO LOGIN")
            this.autoLogin();
          }
        })
        .catch(() => {
          alert('Invalid Authentication');
          // localStorage.setItem('fingerPrint','false')
          this.isValidFingerPrint = false;
          //return;
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
    //this.shared.openInappbrowser('https://dds.drives.ga.gov/_/')
  }
}
