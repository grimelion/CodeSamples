import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
declare const pica: any;

export interface ResizeCanvasOptions {
  quality?: number;
  alpha?: boolean;
  unsharpAmount?: number;
  unsharpRadius?: number;
  unsharpThreshold?: number;
}

export interface ResizeBufferOptions {
  src: Uint8Array;
  width: number;
  height: number;
  toWidth: number;
  toHeight: number;
  quality?: number;
  alpha?: boolean;
  unsharpAmount?: number;
  unsharpRadius?: number;
  unsharpThreshold?: number;
}

@Injectable()
export class Ng2PicaService {
  public resize(files: File[], width: number, height?: number): Observable<any> {
    const resizedFile: Subject<File> = new Subject<File>();
    Array.from(files).forEach((file) => {
      this._resizeFile(file, width, height).then((returnedFile) => {
        resizedFile.next(returnedFile);
      }).catch((error) => {
        resizedFile.next(error);
      });
    });
    return resizedFile.asObservable();
  }

  public resizeCanvas(from: HTMLCanvasElement, to: HTMLCanvasElement, options: ResizeCanvasOptions): Promise<HTMLCanvasElement> {
    const result: Promise<HTMLCanvasElement> = new Promise((resolve, reject) => {
      pica.resizeCanvas(from, to, options, (error) => {
        // resize complete
        if (error) {
          reject(error);
        } else {
          // success
          resolve(to);
        }
      });
    });
    return result;
  }

  public resizeBuffer(options: ResizeBufferOptions): Promise<Uint8Array> {
    const result: Promise<Uint8Array> = new Promise((resolve, reject) => {
      pica.resizeBuffer(options, (error, output) => {
        // resize complete
        if (error) {
          reject(error);
        } else {
          // success
          resolve(output);
        }
      });
    });
    return result;
  }

  private _resizeFile(file: File, width: number, height?: number): Promise<File> {
    const result: Promise<File> = new Promise((resolve, reject) => {
      const fromCanvas: HTMLCanvasElement = document.createElement('canvas');
      const ctx = fromCanvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth === width && img.naturalHeight === height) {
          resolve(file);
        }
        fromCanvas.width = img.naturalWidth;
        if (!height) {
          height = parseInt(img.naturalHeight * width / img.naturalWidth + '', 10);
        }
        fromCanvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const toCanvas: HTMLCanvasElement = document.createElement('canvas');
        toCanvas.width = width;
        toCanvas.height = height;
        this.resizeCanvas(fromCanvas, toCanvas, {})
          .then((resizedCanvas: any) => {
            resizedCanvas.toBlob((blob) => {
              const newFile = new File([blob], file.name, {type: file.type, lastModified: new Date().getTime()});
              resolve(newFile);
            });
            window.URL.revokeObjectURL(img.src);
          })
          .catch((error) => {
            reject(error);
            window.URL.revokeObjectURL(img.src);
          });
      };
      img.src = window.URL.createObjectURL(file);
    });
    return result;
  }
}
