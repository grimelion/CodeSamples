// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  googleApi: 'AIzaSyBDlfj5NTyzDwY_w1JjtB21wIwvKqumMi0',
  firebaseConfig: {
    apiKey: 'AIzaSyB8c6cE8UcIcyEMf32vls_M9k50hrGlfAM',
    authDomain: 'retouchingapp.firebaseapp.com',
    databaseURL: 'https://retouchingapp.firebaseio.com',
    storageBucket: 'retouchingapp.appspot.com',
    messagingSenderId: '27215609356'
  },
  filterStoragePrefix: 'sortable-table-',
  dropboxEmail: 'studio@simpleProject.com',
  dropboxClientId: 'd7paa06ejit0e6j',
  toCheckoutUrl: 'https://www.2checkout.com/checkout/purchase',
  toCheckoutId: 202856840
};
