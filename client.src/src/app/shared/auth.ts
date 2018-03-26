export class Auth {
  uid = '';
  email = '';
  emailVerified = false;
  displayName = 'User';
  photoURL = 'assets/img/avatars/noavatar.png';

  constructor(auth?) {
    this.uid = auth && auth.uid || this.uid;
    this.email = auth && auth.email || this.email;
    this.emailVerified = auth && auth.emailVerified || this.emailVerified;
    this.displayName = auth && auth.displayName || auth && auth.email || this.displayName;
    this.photoURL = auth && auth.photoURL || this.photoURL;
  }
}
