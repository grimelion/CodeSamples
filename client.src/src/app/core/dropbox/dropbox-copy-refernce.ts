export class DropboxCopyReference {

  copy_reference: string;
  isFile = 0;
  name: string;

  constructor(copy_reference, isFile, name) {
    this.copy_reference = copy_reference;
    this.isFile = isFile;
    this.name = name;
  }
}
