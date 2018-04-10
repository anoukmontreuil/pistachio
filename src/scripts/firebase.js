import * as firebase from 'firebase'

var config = {
    apiKey: "AIzaSyA6JVBxq3mzdsc0gufTHxScydjHSO66TpY",
    authDomain: "pistachio-decodemtl.firebaseapp.com",
    databaseURL: "https://pistachio-decodemtl.firebaseio.com",
    projectId: "pistachio-decodemtl",
    storageBucket: "pistachio-decodemtl.appspot.com",
    messagingSenderId: "433017313030"
};
firebase.initializeApp(config);

export default firebase;