
(function(){
  var UNLOCK_AT = new Date('2027-01-23T00:00:00').getTime();
  function isLocked(){ return Date.now() < UNLOCK_AT; }
  if(isLocked()){
    document.documentElement.classList.add('nm-locked');
  }
  window._nmIsLocked = isLocked;
  window._nmUnlockAt = UNLOCK_AT;

  // Deteksi dini "kunjungan ulang": kalau gerbang sudah kebuka (lewat hari-H) DAN
  // pengunjung sebelumnya sudah pernah menyelesaikan seluruh perjalanan (ditandai
  // localStorage 'nbu' yang di-set begitu sampai ke stage Sertifikat), tampilkan
  // layar "Selamat Datang Kembali" alih-alih mengulang seluruh perjalanan dari nol.
  // Dicek sesinkron mungkin (sebelum body dirender) supaya tidak ada kedipan layar s1.
  var isRevisit = false;
  if(!isLocked()){
    try{ isRevisit = !!localStorage.getItem('nbu'); }catch(e){}
  }
  window._nmIsRevisit = isRevisit;
  if(isRevisit) document.documentElement.classList.add('nm-revisit');
})();
