import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Ng2PicaService } from './ng2-pica.service';

export class ImageFileInputChooseEvent {
  imageFile: File;
  imageUrl: string;
}

@Component({
  selector: 'app-image-picker',
  templateUrl: 'image-picker.component.html',
  styleUrls: ['image-picker.component.scss']
})
export class AppImagePickerComponent {

  public newImageUrl = '';

  @Input()
  private width: number;

  @Input()
  private height: number;

  private rounded: boolean;

  @Input()
  public imageUrl = '';

  @Output()
  choose: EventEmitter<ImageFileInputChooseEvent> = new EventEmitter<ImageFileInputChooseEvent>();

  constructor(private ng2PicaService: Ng2PicaService, private element: ElementRef) {
    this.rounded = (element.nativeElement as Element).hasAttribute('rounded');
  }

  public onFileChange(event) {
    const self = this;
    const files = event.srcElement.files;
    if (files && files[0]) {
      if (this.width || this.height) {
        this.ng2PicaService.resize(files, this.width, this.height).subscribe((result) => {
          this.showSelectedImage(result);
        });
      } else {
        this.showSelectedImage(files[0]);
      }
    }
  }

  private showSelectedImage(imageFile) {
    if (typeof imageFile.name !== 'undefined' && typeof imageFile.size !== 'undefined' && typeof imageFile.type !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.choose.emit({imageFile: imageFile, imageUrl: e.target.result});
      };
      reader.readAsDataURL(imageFile);
    }
  }

}
