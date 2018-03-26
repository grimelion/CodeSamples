import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ClientOrder } from '../../../client-order';
import { Subscription } from 'rxjs/Subscription';
import { OrdersService } from '../../../orders.service';
import {
  ToDo, TurnaroundTime, OrderOptions,
  transformCurrency
} from '../../../../../core/enums';
import * as _ from 'lodash';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit, OnDestroy {

  private previousOffers: any;
  private previousToDo = -1;
  private previousTrial = false;
  private numberOfImages: FormControl;

  isWeddingOrder = false;
  isRetouchingOrder = false;
  orderOptions: OrderOptions;
  specialOffers: {name: string, value: number, price: number, photos: number}[] = [];
  order: FormGroup;
  trial = false;
  disableTodo = false;
  disableNumberOfImages = false;
  disableTurnaroundTime = false;
  cullingLeave = false;
  disableSpecialOffers = false;
  disableApprove = false;
  showApprove = false;
  showCullingLeave = false;
  showCullingColor = false;
  isLoading = false;
  priceTotal = 0;
  canTrialSubscription: Subscription;
  clientOrderSubscription: Subscription;
  minNumberOfImages = 1;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private ordersService: OrdersService,
              private formBuilder: FormBuilder,
              private ref: ChangeDetectorRef) {  }

  ngOnInit() {
    this.isLoading = true;
    this.numberOfImages = new FormControl(1, [CustomValidators.min(1), CustomValidators.min(200)]);
    this.order = this.formBuilder.group({
      name: ['', [<any>Validators.required]],
      type: ['', [<any>Validators.required]],
      comment: [''],
      numberOfImages: this.numberOfImages,
      wantToApprove: [false],
      trial: [false],
      turnaroundTime: [0, [Validators.required, CustomValidators.number]],
      todo: [0, [<any>Validators.required, CustomValidators.number]],
      cullingLeave: [0, [CustomValidators.min(0), CustomValidators.max(100)]],
      specialOffer: [0, [Validators.required, CustomValidators.number]]
    });

    this.clientOrderSubscription = this.ordersService.clientOrder$.take(1).subscribe(clientOrder => {
      this.isWeddingOrder = clientOrder.type === 'wedding';
      this.isRetouchingOrder = !this.isWeddingOrder;
      this.order.patchValue(clientOrder);
      this.isLoading = false;
      this.ordersService.getOrderOptions(clientOrder.type).take(1).subscribe((res) => {
        this.orderOptions = res;
        this.updateForm(this.order.value);
      });
    });

    this.canTrialSubscription = this.ordersService.isTrialAvailable().subscribe((isAvailable) => {
      this.trial = isAvailable;
    });

    this.order.valueChanges.subscribe(order => {
      this.updateForm(order);
    });
  }

  createOrder(formGroup: FormGroup) {
    if (!formGroup.valid) {
      Object.keys(formGroup.controls).forEach(function(key) {
        formGroup.controls[key].markAsTouched();
      });
      return;
    }
    const clientOrder = formGroup.value;
    this.isLoading = true;
    clientOrder.price = this.ordersService.getOrderPrice(clientOrder, this.orderOptions.pricing);
    this.ordersService.setClientOrder(clientOrder, this.orderOptions);
    this.router.navigate(['files'], { relativeTo: this.route });
  }
  fixNumberOfImages(e) {
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode === 8)) {
      return false;
    }
  }

  updateForm(order: ClientOrder) {
    this.ref.detach();
    const _order = Object.assign({}, order);
    this.showCullingLeave = false;
    this.showCullingColor = false;
    this.showApprove = true;
    if (order.trial) {
      this.minNumberOfImages = 0;
      this.numberOfImages.clearValidators();
      this.disableTodo = true;
      this.disableNumberOfImages = true;
      this.disableTurnaroundTime = true;
      this.disableSpecialOffers = true;
      this.disableApprove = true;
      _order.wantToApprove = false;
      _order.cullingLeave = 0;
      _order.turnaroundTime  = TurnaroundTime.Standard;
      if (order.type === 'wedding') {
        _order.todo  = ToDo.ColorCorrection;
        _order.numberOfImages  = 5;
      }
      if (order.type === 'retouching') {
        _order.todo  = ToDo.Retouching;
        _order.numberOfImages  = 1;
      }
      _order.specialOffer = 0;
    } else {
      this.disableTodo = false;
      this.disableNumberOfImages = false;
      this.disableTurnaroundTime = false;
      this.disableSpecialOffers = false;
      this.disableApprove = false;

      if (this.orderOptions) {
        this.specialOffers = this.orderOptions.pricing.SpecialOffers[_order.todo] || [];
      }

      if (_order.specialOffer >= this.specialOffers.length) {
        _order.specialOffer = this.specialOffers.length > 0 ? 1 : 0;
      }
      switch (order.todo) {
        case ToDo.Culling:
          this.showCullingLeave = true;
          this.showApprove = false;
          _order.wantToApprove = false;
          break;
        case ToDo.CullingAndColorCorrection:
          this.showCullingColor = true;
          _order.cullingLeave = _order.cullingLeave || 20;
          break;
      }
      if (this.previousOffers !== this.specialOffers) {
        this.previousOffers = this.specialOffers;
        _order.specialOffer = this.specialOffers.length > 0 ? 1 : 0;
      }
      if (this.previousToDo !== order.todo || this.previousTrial !== order.trial) {
        this.previousToDo = order.todo;
        if (order.todo === ToDo.ColorCorrection || order.todo === ToDo.CullingAndColorCorrection) {
          _order.wantToApprove = true;
          _order.numberOfImages = null;
          this.minNumberOfImages = 200;
        } else {
          this.minNumberOfImages = 1;
        }
        this.numberOfImages.setValidators(CustomValidators.min(this.minNumberOfImages));
      }
    }
    if (this.orderOptions) {
      this.priceTotal = transformCurrency(this.ordersService.getOrderPrice(_order, this.orderOptions.pricing));
    }
    if (!_.isEqual(this.order.value, _order)) {
      this.order.setValue(_order, { onlySelf: true, emitEvent: true });
    }
    this.previousTrial = order.trial;
    this.ref.reattach();
    this.ref.detectChanges();
  }

  onCullToggle($event) {
    this.cullingLeave = $event;
  }

  ngOnDestroy() {
    this.clientOrderSubscription.unsubscribe();
    this.canTrialSubscription.unsubscribe();
  }
}
