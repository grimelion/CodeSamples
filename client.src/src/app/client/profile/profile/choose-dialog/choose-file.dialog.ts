/* tslint:disable:component-class-suffix */
import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MdDialogRef, MdDialogConfig, MdDialog, MD_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ProfileService } from '../profile.service';
import { DragAndDropComponent } from '../../../../core/drag-n-drop/drag-n-drop.component';

@Component({
  selector: 'app-fileshoose-dialog',
  templateUrl: 'choose-file.dialog.html',
  styleUrls: ['./choose-file.dialog.scss']
})
export class ChooseFileDialog implements OnInit, OnDestroy {

  private key: string;
  private action: string;

  public uploadForm: FormGroup;
  public file: File | null;
  public isLoading = false;
  public extension;

  constructor(public dialogRef: MdDialogRef<ChooseFileDialog>,
              private formBuilder: FormBuilder,
              private profileService: ProfileService,
              @Inject(MD_DIALOG_DATA) private data: any) {  }

  ngOnInit() {
    this.action = this.data.action;
    this.extension = this.data.extension;
    this.key = this.profileService.generateKey(this.action);

    this.uploadForm = this.formBuilder.group({
      name: ['', [<any>Validators.required]],
      description: ['', [<any>Validators.required]]
    });
  }

  onFilesChanged(event) {
    const files = event.target.files;
    console.log(files);
    if (!files.length) {
      return;
    }
    this.uploadForm.get('name').patchValue(files[0].name);
    this.file = files[0];
  }

  addFile({name, description}) {
    this.isLoading = true;
    this.profileService.simplePutFileToStorage(this.action, this.file, this.key, name, description).then(success => {
      this.dialogRef.close();
    }).catch(err => {
      console.error(err);
      this.isLoading = false;
    });
  }

  openUpload() {
    (<HTMLInputElement>document.getElementById('file-upload')).click();
  }

  closeForm(form) {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.dialogRef.close();
    if (this.file) {
      this.file = null;
    }
  }
}
