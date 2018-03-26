import { fadeInAnimation } from '../../../route.animation';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MdSnackBar } from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'codemirror/mode/htmlmixed/htmlmixed';
import { MailTemplatesService } from '../mail-templates.service';
import { ActivatedRoute } from '@angular/router';
import { PageComponent } from '../../../core/page/page.component';
import { Subscription } from 'rxjs/Subscription';
import { DefaultConfigService } from '../../../core/default-config.service';

@Component({
  selector: 'app-mail-template',
  templateUrl: 'mail-template.component.html',
  styleUrls: ['mail-template.component.scss'],
  animations: [fadeInAnimation]
})
export class MailTemplateComponent extends PageComponent implements OnInit, OnDestroy {
  private mailTemplateSubscription: Subscription;
  public form: FormGroup;
  public id: string;
  public isLoading = false;
  public template = '';

  public codemirrorConfig: Object = {
    mode: 'htmlmixed',
    showCursorWhenSelecting: true,
    lineNumbers: true,
    lineSeparator: '&#13;&#10;',
    lineWrapping: true,
    readOnly: false,
    extraKeys: {Tab: function(cm) { cm.replaceSelection('    ', 'end'); }}
  };

  constructor(
    private formBuilder: FormBuilder,
    private mailTemplatesService: MailTemplatesService,
    private route: ActivatedRoute,
    private snackBar: MdSnackBar,
    private defaultConfigService: DefaultConfigService) {
    super();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      from: [''],
      enabled: [false],
      subject: ['', [<any>Validators.required]],
      template: ['', [<any>Validators.required]]
    });
    this.isLoading = true;
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.mailTemplateSubscription = this.mailTemplatesService.getMailTemplate(this.id).subscribe(data => {
      this.form.patchValue(data);
      this.template = data.template;
      this.isLoading = false;
    });
  }

  save(form: FormGroup) {
    if (!form.valid) {
      return;
    }
    this.mailTemplatesService.saveMailTemplate(this.id, form.value);
    this.snackBar.open('Saved', 'Close', this.defaultConfigService.mdSnackBarConfig);
  }

  ngOnDestroy() {
    this.mailTemplateSubscription.unsubscribe();
  }
}
