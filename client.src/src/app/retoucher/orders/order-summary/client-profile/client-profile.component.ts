import { Component, OnInit, OnDestroy } from '@angular/core';
import { fadeInAnimation } from '../../../../route.animation';
import { PageComponent } from '../../../../core/page/page.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientProfileService } from '../client-profile/client.service';
import { AppImageToolComponent } from '../../../../core/image-tool/image-tool.component';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { OrdersService } from '../../orders.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { DefaultConfigService } from '../../../../core/default-config.service';
import * as _ from 'lodash';
import { ClientsService } from '../../../clients/clients.service';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'],
  animations: [fadeInAnimation]
})
export class ClientProfileComponent implements OnInit, OnDestroy {

  private multiSub$: Subscription;

  orderId: string;
  clientId: string;
  isLoading = false;
  isModerator: boolean;
  isAdmin: boolean;
  isSuper: boolean;
  isRetoucher: boolean;
  photos$: any;
  presets$: any;
  actions$: any;
  userInfo: any = null;
  retouchers = [];
  moderators = [];
  admins = [];
  userDataSubscription: Subscription;
  retouchersSubscription: Subscription;
  moderatorsSubscription: Subscription;
  adminsSubscription: Subscription;
  formGroup: FormGroup;
  superFormGroup: FormGroup;
  retoucherId: string;
  retoucherComment: string;
  note: string;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private clientProfileService: ClientProfileService,
              private ordersService: OrdersService,
              private formBuilder: FormBuilder,
              private snackBar: MdSnackBar,
              private defaultConfigService: DefaultConfigService,
              private clientsService: ClientsService) {
  }

  ngOnInit() {
    this.route.data.subscribe(routeData => {
      this.isAdmin = routeData['isAdmin'];
      this.isSuper = routeData['isSuper'];
      this.isModerator = routeData['isModerator'];
      this.isRetoucher = !(this.isAdmin || this.isSuper || this.isModerator);
      this.isLoading = true;
      this.setFormSettings();
      this.route.params.subscribe((params) => {
        this.orderId = params['orderId'];
        this.clientId = params['clientId'];
      });
      this.photos$ = this.clientProfileService.getUserFilesData(this.clientId, 'Examples');
      this.presets$ = this.clientProfileService.getUserFilesData(this.clientId, 'Presets');
      this.actions$ = this.clientProfileService.getUserFilesData(this.clientId, 'Actions');
      if (this.isAdmin || this.isModerator) {
        this.userDataSubscription = this.clientProfileService.getUserData(this.clientId).first().subscribe(data => {
          this.userInfo = data;
          this.note = (data.note || '').toString();
        });
        this.retouchersSubscription = this.ordersService.getRetouchers().subscribe(retouchers => {
          this.retouchers = retouchers;
        });
        const privateSub = this.clientProfileService.getPrivateData(this.clientId).map(res => { return res; }).take(1).subscribe(data => {
          this.retoucherComment = data.retoucherComment;
          this.formGroup.patchValue(data);
          if (data.assignedRetoucher) {
            this.formGroup.controls['assignedRetoucherId'].patchValue(data.assignedRetoucher.id);
          }
        });
      }
      if (this.isSuper) {
        this.moderatorsSubscription = this.ordersService.getModerators().subscribe(moderators => {
          this.moderators = moderators;
        });
        this.adminsSubscription = this.ordersService.getAdmins().subscribe(admins => {
          this.admins = admins;
        });
        this.clientProfileService.getSuperData(this.clientId).map(res => { return res; }).take(1).subscribe(data => {
          this.superFormGroup.patchValue(data);
        });
      }
      const publicSub = this.clientProfileService.getPublicData(this.clientId).map(res => { return res; }).take(1).subscribe(data => {
        this.retoucherComment = data.retoucherComment;
        this.formGroup.patchValue(data);
      });
    });
  }

  private setFormSettings() {
    this.superFormGroup = this.formBuilder.group({
      adminComment: [''],
      assignedAdminId: [''],
      assignedModeratorId: ['']
    });
    this.formGroup = this.formBuilder.group({
      internalInfo: [''],
      retoucherComment: [''],
      assignedRetoucherId: ['']
    });
  }

  public setInformation(formValue) {
    this.clientProfileService.setInfoForRetoucher(formValue, this.orderId, this.clientId).then(result => {
      this.snackBar.open('Information saved', 'Close', this.defaultConfigService.mdSnackBarConfig);
    });
  }

  public updateAdminInformation(formValue) {
    this.clientProfileService.setSuperData(formValue, this.clientId).then(result => {
      this.snackBar.open('Information saved', 'Close', this.defaultConfigService.mdSnackBarConfig);
    });
  }

  ngOnDestroy() {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
    if (this.retouchersSubscription) {
      this.retouchersSubscription.unsubscribe();
    }
    if (this.moderatorsSubscription) {
      this.moderatorsSubscription.unsubscribe();
    }
    if (this.adminsSubscription) {
      this.adminsSubscription.unsubscribe();
    }
  }

}
