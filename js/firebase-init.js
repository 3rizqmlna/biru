
window._db=null;
(function tryFB(n){
  try{
    if(typeof firebase==='undefined'){if(n<20)setTimeout(()=>tryFB(n+1),150);return;}
    if(!firebase.apps||!firebase.apps.length){
      firebase.initializeApp({apiKey:"AIzaSyBHeicloB3jNsx0iiHyhaAZGkrEV0p2GZ8",authDomain:"adalahpokoknya-6cabf.firebaseapp.com",projectId:"adalahpokoknya-6cabf",storageBucket:"adalahpokoknya-6cabf.firebasestorage.app",messagingSenderId:"40678745638",appId:"1:40678745638:web:8a5c0b3d4711e548c4e8e7"});
    }
    window._db=firebase.firestore();
  }catch(e){window._db=null;}
})(0);
