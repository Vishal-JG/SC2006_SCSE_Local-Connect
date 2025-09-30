import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyARvVhhXLsXwwE988MmlmeN3LvEsFjtEi0",
  authDomain: "local-connect-sc2006-scse.firebaseapp.com",
  projectId: "local-connect-sc2006-scse",
  storageBucket: "local-connect-sc2006-scse.firebasestorage.app",
  messagingSenderId: "809255835897",
  appId: "1:809255835897:web:ed4ae6c845f4878b646a28",
  measurementId: "G-7ERY2SWXDM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
  if (user != null){
    console.log('Logged in !')
  } else {
    console.log('No user')
  }
})

export {app, auth};
