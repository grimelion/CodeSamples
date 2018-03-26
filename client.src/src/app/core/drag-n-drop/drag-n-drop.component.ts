import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProfileService } from '../../client/profile/profile/profile.service';
import { arrayUnion } from '../utils';

@Component({
  selector: 'app-dragndrop',
  templateUrl: './drag-n-drop.component.html',
  styleUrls: ['./drag-n-drop.component.scss']
})
export class DragAndDropComponent implements OnInit {

  public uploadedFiles = [];
  public dragThrough = '';

  @Input()
  public accept: string;

  @Input()
  public disabled = false;

  @Input()
  public multiple = false;

  @Output()
  public outputData: EventEmitter<File[]> = new EventEmitter<File[]>();

  constructor(private profileService: ProfileService) {
  };

  onFilesChange(fileList: FileList) {
    const files = fileList.length ? Array.from(fileList) : [];
    this.uploadedFiles = arrayUnion(this.uploadedFiles, files, (a, b) => {
      return a.name === b.name && a.size === b.size && a.type === b.type;
    });
    if (!this.multiple && this.uploadedFiles.length > 1) {
      this.uploadedFiles = [this.uploadedFiles[0]];
    }
    this.outputDataTrigger(this.uploadedFiles);
  }

  removeFile(file) {
    const index = this.uploadedFiles.indexOf(file);
    this.uploadedFiles.splice(index, 1);
    this.outputDataTrigger(this.uploadedFiles);
  }

  outputDataTrigger(fileList: File[]) {
    this.outputData.emit(fileList);
  }

  onDrop($event, dropData) {
    this.dragThrough = '';
  }

  allowDrop($event) {
    this.dragThrough = 'drag-through';
  }

  ngOnInit() {
  }
}
