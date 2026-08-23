// ===== PLAYLIST — satu sumber kebenaran untuk semua lagu & metadatanya =====
// Urutan array = urutan playlist. Tambah/hapus lagu cukup edit array ini saja,
// tidak perlu sentuh elemen <audio> atau logika pemutaran di bawah.
const TRACKS=[
  {title:'ABOUT YOU',            artist:'THE 1975',            color:'#E8604C', main:true,
   url:"assets/audio/The 1975 - About You Official.mp3"},
  {title:'HER',                  artist:'JVKE',                 color:'#5FAEDB',
   url:"assets/audio/JVKE - her.mp3"},
  {title:'SOLDIER, POET, KING',  artist:'THE OH HELLOS',         color:'#F2B441',
   url:"assets/audio/The Oh Hellos - Soldier, Poet, King.mp3"},
  {title:'KINGDOM DANCE',        artist:'TANGLED SOUNDTRACK',    color:'#7FAE6A',
   url:"assets/audio/TANGLED - Kingdom Dance.mp3"}
];
const am=document.getElementById('am');
let cti=0,_au=false,_pp=null,bonusUnlocked=true; // semua lagu terbuka sejak awal — dipilih di stage SMUSIC sebelum taman dimulai
let aCtx,anl,aData,micStr,micAnl,micData,micOn=false;
let openedG=0,cdInt,ptmr=null,panim=null,figAnim=null,uAnim=null,figDone=false;
let selF='',selA='',selD='The Wildflower Sovereign',selTarot='';
const BIRTH=new Date("2007-01-23T00:00:00");

(function bviz(){const w=document.getElementById('vzwrap');for(let i=0;i<8;i++){const b=document.createElement('div');b.className='vbar';b.id='vb'+i;w.appendChild(b);}})();

// BG CANVAS
(function bgc(){
  const c=document.getElementById('bg-canvas'),ctx=c.getContext('2d');
  let W,H;
  function rsz(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;initLayer();}
  window.addEventListener('resize',rsz);

  // ---- LAYERS ----
  let petals=[], spores=[], stems=[], moonDust=[];

  function randC(cols){return cols[Math.floor(Math.random()*cols.length)];}

  function initLayer(){
    petals=[];spores=[];stems=[];moonDust=[];
    const PCOLS=['rgba(232,96,76,','rgba(241,160,148,','rgba(242,180,65,','rgba(246,203,122,','rgba(178,206,166,'];
    // Petals — 45 pieces
    for(let i=0;i<45;i++){
      const layer=Math.floor(Math.random()*3); // 0=far,1=mid,2=near
      petals.push({
        x:Math.random()*W, y:Math.random()*H+H,
        r:Math.random()*4+2+layer*3,
        vy:-(Math.random()*.4+.08+layer*.1),
        vx:(Math.random()-.5)*.3,
        rot:Math.random()*Math.PI*2,
        rs:(Math.random()-.5)*.025,
        ph:Math.random()*Math.PI*2,
        col:randC(PCOLS),
        al:Math.random()*.35+.35+layer*.12,
        layer, sw:Math.random()*.3+.1,  // sway width
        spd:Math.random()*.015+.006,    // sway speed
      });
    }
    // Firefly spores — 30 glowing dots
    for(let i=0;i<30;i++){
      spores.push({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*2+.8,
        vy:-(Math.random()*.12+.02),
        vx:(Math.random()-.5)*.08,
        al:0, pal:Math.random()*Math.PI*2,
        pspd:Math.random()*.02+.008,
        col:['rgba(246,203,122,','rgba(178,206,166,','rgba(143,203,234,'][Math.floor(Math.random()*3)],
        glR:Math.random()*10+5,
      });
    }
    // Background stems — 18 swaying plant silhouettes
    for(let i=0;i<18;i++){
      const bx=Math.random()*W;
      const bh=Math.random()*H*.45+H*.3;
      const segs=Math.floor(Math.random()*4)+4;
      const col=`rgba(${Math.random()>.5?'40,60,40':'60,40,50'},.${Math.floor(Math.random()*3)+2})`;
      const nd=Math.ceil(segs/2);const ld=[];for(let k=0;k<nd;k++)ld.push(Math.random()>.5?1:-1);stems.push({bx,by:H,bh,segs,col,ph:Math.random()*Math.PI*2,sw:Math.random()*18+8,spd:Math.random()*.008+.003,w:Math.random()*1.2+.5,hasBud:Math.random()>.4,budCol:['rgba(232,96,76,.5)','rgba(242,180,65,.4)','rgba(178,206,166,.5)'][Math.floor(Math.random()*3)],leafDirs:ld});
    }
    // Moon dust — tiny sparkles 80pcs
    for(let i=0;i<80;i++){
      moonDust.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*.8+.2,al:Math.random(),ph:Math.random()*Math.PI*2,pspd:Math.random()*.03+.01,vy:-(Math.random()*.05+.005)});
    }
  }

  function drawPetal(ctx,p,fr){
    ctx.save();
    ctx.globalAlpha=p.al;
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot);
    // teardrop / petal shape
    ctx.shadowColor=p.col+Math.min(p.al+.3,.85)+')';
    ctx.shadowBlur=p.r*2.2;
    ctx.beginPath();
    ctx.moveTo(0,-p.r*2);
    ctx.bezierCurveTo(p.r*1.2,-p.r,p.r*.8,p.r*.5,0,p.r*1.5);
    ctx.bezierCurveTo(-p.r*.8,p.r*.5,-p.r*1.2,-p.r,0,-p.r*2);
    ctx.fillStyle=p.col+p.al+')';
    ctx.fill();
    ctx.shadowBlur=0;
    // highlight
    ctx.beginPath();
    ctx.moveTo(0,-p.r*1.8);
    ctx.bezierCurveTo(p.r*.4,-p.r*.8,p.r*.3,p.r*.2,0,p.r);
    ctx.strokeStyle='rgba(255,253,247,0.45)';
    ctx.lineWidth=.7;
    ctx.stroke();
    ctx.restore();
  }

  function drawStem(ctx,s,fr){
    const sway=Math.sin(fr*s.spd+s.ph)*s.sw;
    ctx.save();
    ctx.strokeStyle=s.col;
    ctx.lineWidth=s.w;
    ctx.lineJoin='round';
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(s.bx,s.by);
    for(let j=1;j<=s.segs;j++){
      const t=j/s.segs;
      const nx=s.bx+sway*t*t;
      const ny=s.by-s.bh*t;
      ctx.lineTo(nx,ny);
      if(j>0&&j<s.segs&&j%2===1&&s.leafDirs){
        const dir=s.leafDirs[Math.floor(j/2)%s.leafDirs.length];
        const lx=nx+Math.cos(Math.PI/3)*18*t*dir;
        const ly=ny-8;
        ctx.moveTo(nx,ny);
        ctx.quadraticCurveTo(lx+6,ly-4,lx,ly);
        ctx.moveTo(nx,ny);
      }
    }
    ctx.stroke();
    if(s.hasBud){
      const tx=s.bx+sway;
      const ty=s.by-s.bh;
      ctx.beginPath();
      ctx.arc(tx,ty,3.5,0,Math.PI*2);
      ctx.fillStyle=s.budCol;
      ctx.fill();
    }
    ctx.restore();
  }

  let fr=0;
  function draw(){
    fr++;
    ctx.clearRect(0,0,W,H);

    // --- STEMS (bottom layer) ---
    stems.forEach(s=>drawStem(ctx,s,fr));

    // --- MOON DUST ---
    moonDust.forEach(d=>{
      d.y+=d.vy; if(d.y<0)d.y=H;
      const a=.15+Math.sin(fr*d.pspd+d.ph)*.12;
      ctx.save();ctx.globalAlpha=Math.max(0,a);
      ctx.fillStyle='rgba(200,220,240,1)';
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });

    // --- PETALS (sorted by layer) ---
    petals.forEach((p,i)=>{
      p.y+=p.vy; p.x+=p.vx+Math.sin(fr*p.spd+p.ph)*p.sw;
      p.rot+=p.rs;
      if(p.y<-30){p.y=H+20;p.x=Math.random()*W;}
      drawPetal(ctx,p,fr);
    });

    // --- SPORES / FIREFLIES ---
    spores.forEach(s=>{
      s.y+=s.vy; s.x+=s.vx; if(s.y<-10)s.y=H+10;
      const a=.3+Math.sin(fr*s.pspd+s.pal)*.28;
      // glow
      const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.glR);
      g.addColorStop(0,s.col+'0.18)'); g.addColorStop(1,s.col+'0)');
      ctx.save();ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,s.glR,0,Math.PI*2);ctx.fill();
      // core
      ctx.globalAlpha=Math.max(0,a);ctx.fillStyle=s.col+'0.9)';
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  rsz();draw();
})();

// BG MODE
// ===== BACKGROUND CROSSFADE =====
const BG_MOODS = {
  forest: 'radial-gradient(ellipse at 20% 30%,rgba(127,174,106,.22) 0%,transparent 60%),radial-gradient(ellipse at 75% 70%,rgba(90,130,90,.14) 0%,transparent 60%),linear-gradient(160deg,#0A1830 0%,#123152 55%,#1C4A73 100%)',
  rose:   'radial-gradient(ellipse at 50% 30%,rgba(232,96,76,.26) 0%,transparent 65%),radial-gradient(ellipse at 20% 80%,rgba(246,203,122,.14) 0%,transparent 60%),linear-gradient(160deg,#0A1830 0%,#123152 55%,#1C4A73 100%)',
  moon:   'radial-gradient(ellipse at 60% 20%,rgba(95,174,219,.30) 0%,transparent 65%),radial-gradient(ellipse at 30% 85%,rgba(242,180,65,.15) 0%,transparent 55%),linear-gradient(160deg,#0A1830 0%,#123152 55%,#1C4A73 100%)',
  gold:   'radial-gradient(ellipse at 50% 35%,rgba(242,180,65,.30) 0%,transparent 65%),radial-gradient(ellipse at 80% 75%,rgba(246,203,122,.18) 0%,transparent 55%),linear-gradient(160deg,#0A1830 0%,#123152 55%,#1C4A73 100%)',
};
BG_MOODS.sage   = BG_MOODS.forest;
BG_MOODS.letter = BG_MOODS.rose;
BG_MOODS.cake   = BG_MOODS.moon;
BG_MOODS.cert   = BG_MOODS.gold;
BG_MOODS.rain   = BG_MOODS.moon;

let _bgActive = 'a'; // 'a' = bg-layer is front, 'b' = bg-layer-b is front
let _bgCurrent = 'forest';
let _bgXfTimer = null;

function setBG(mood) {
  const target = BG_MOODS[mood] || BG_MOODS.forest;
  if (mood === _bgCurrent) return;
  _bgCurrent = mood;

  const la = document.getElementById('bg-layer');
  const lb = document.getElementById('bg-layer-b');
  if (!la || !lb) return;

  if (_bgXfTimer) clearTimeout(_bgXfTimer);

  if (_bgActive === 'a') {
    // la is currently visible — prep lb with new bg, fade lb in, fade la out
    lb.style.background = target;
    lb.style.transition = 'none';
    lb.style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lb.style.transition = 'opacity 1.4s cubic-bezier(.4,0,.2,1)';
        lb.style.opacity = '1';
        la.style.transition = 'opacity 1.4s cubic-bezier(.4,0,.2,1)';
        la.style.opacity = '0';
      });
    });
    _bgActive = 'b';
  } else {
    // lb is currently visible — prep la with new bg, fade la in, fade lb out
    la.style.background = target;
    la.style.transition = 'none';
    la.style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        la.style.transition = 'opacity 1.4s cubic-bezier(.4,0,.2,1)';
        la.style.opacity = '1';
        lb.style.transition = 'opacity 1.4s cubic-bezier(.4,0,.2,1)';
        lb.style.opacity = '0';
      });
    });
    _bgActive = 'a';
  }
}
let _cm='forest';

// AUDIO
let _audGen=0; // penanda generasi — mencegah audio lama "menyusul" play() setelah dibatalkan oleh panggilan baru
function unlkA(){if(_au)return;_au=true;if(_pp){_pp();_pp=null;}}

// CUSTOM ALERT (pengganti alert() bawaan browser)
function showAlert(msg,icon){
  const m=document.getElementById('ca-modal');
  if(!m){window.alert(msg);return;}
  const im=document.getElementById('ca-icon');if(im)im.textContent=icon||'🌸';
  const tx=document.getElementById('ca-msg');if(tx)tx.textContent=msg;
  m.style.display='flex';
  try{sfx('err');}catch(e){}
}
function closeAlert(){const m=document.getElementById('ca-modal');if(m)m.style.display='none';}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){const m=document.getElementById('ca-modal');if(m&&m.style.display==='flex')closeAlert();}});
['touchstart','touchend','mousedown','keydown','click'].forEach(e=>document.addEventListener(e,unlkA,{once:true,passive:true}));
// ===== AUDIO PLAYER — satu elemen <audio>, satu playlist, auto-lanjut =====
// CATATAN PERUBAHAN: dulu tiap lagu di-fetch() penuh jadi blob sebelum bisa diputar —
// artinya browser menunggu SELURUH file mp3 selesai diunduh dulu (lambat, apalagi di
// koneksi mobile), dan lagu-lagu berikutnya di-download penuh juga di latar belakang
// sehingga rebutan bandwidth dengan lagu yang sedang main. Sekarang diganti streaming
// murni: elemen <audio> diarahkan langsung ke URL asli dan browser mengunduh &
// memutar secara bertahap lewat HTTP range request (progressive streaming) — main
// bisa mulai begitu buffer awal cukup, tanpa menunggu file selesai diunduh.
let repeatOne=false; // mode "ulangi 1 lagu" (toggle manual lewat panel musik)

function trackCount(){ return bonusUnlocked ? TRACKS.length : 1; } // semua lagu sudah terbuka sejak dipilih di stage SMUSIC

// ===== PREFETCH RINGAN LAGU BERIKUTNYA =====
// Bukan lagi fetch()+blob (unduh penuh), melainkan elemen <audio> tersembunyi dengan
// preload="auto" per track — browser sendiri yang mengatur seberapa banyak & seberapa
// cepat buffer diisi di latar belakang (biasanya prioritas rendah, tidak memblokir lagu
// yang sedang streaming). Begitu track itu benar-benar diputar, browser bisa memakai
// ulang data yang sudah di-buffer/cache-nya sehingga terasa instan.
let _prefetchEls={};
let _preloadIdx=1;
function preloadNextTrack(){
  if(_preloadIdx>=TRACKS.length) return;
  const idx=_preloadIdx;
  if(!_prefetchEls[idx]){
    const a=new Audio();
    a.preload='auto';
    a.crossOrigin='anonymous';
    a.src=TRACKS[idx].url;
    a.muted=true; // jaga-jaga, elemen ini tidak pernah dimainkan, hanya untuk buffering
    _prefetchEls[idx]=a;
  }
  _preloadIdx=idx+1;
}

function syncTrackButtons(){
  document.querySelectorAll('.trk-btn').forEach(function(b){
    b.classList.toggle('active', parseInt(b.dataset.idx)===cti);
  });
}

function updNP(i){const t=TRACKS[i],e=document.getElementById('ntitle');if(e){e.style.opacity='0';setTimeout(()=>{e.textContent=t.title+' — '+t.artist;e.style.color=t.color||'var(--gold-lt)';e.style.opacity='1';},280);}const p=document.getElementById('mpp');if(p)p.textContent='⏸';renderPlaylistMenu();}

// ===== DROPDOWN PLAYLIST — muncul di sebelah HUD musik, gantikan stage pemilihan lagu =====
function renderPlaylistMenu(){
  const wrap=document.getElementById('playlist-menu');
  if(!wrap) return;
  wrap.innerHTML='';
  const s13el=document.getElementById('s13');
  const onCert=!!(s13el && s13el.classList.contains('active'));
  if(onCert){
    const hint=document.createElement('div');
    hint.style.cssText="font-family:'Space Mono',monospace;font-size:.56rem;letter-spacing:1px;color:rgba(242,180,65,.65);padding:6px 10px 8px;text-align:center;border-bottom:1px solid rgba(242,180,65,.15);margin-bottom:4px;";
    hint.textContent='✦ pilih lagu pembuka favoritmu ✦';
    wrap.appendChild(hint);
  }
  TRACKS.forEach(function(t,i){
    const b=document.createElement('button');
    b.className='playlist-item'+(i===cti?' playing':'');
    b.innerHTML='<span class="pl-title">'+t.title+'</span><span class="pl-artist">'+t.artist+'</span>';
    b.onclick=function(){
      swT(i);
      if(onCert){
        try{localStorage.setItem('nOpeningTrack', String(i));}catch(e){}
        try{sfx('tr');}catch(e){}
      }
      hidePlaylistMenu();
    };
    wrap.appendChild(b);
  });
}

function togglePlaylistMenu(evt){
  if(evt) evt.stopPropagation();
  const wrap=document.getElementById('playlist-menu');
  const btn=document.getElementById('playlist-btn');
  if(!wrap) return;
  const willShow=!wrap.classList.contains('show');
  if(willShow) renderPlaylistMenu();
  wrap.classList.toggle('show', willShow);
  if(btn) btn.classList.toggle('active', willShow);
  try{sfx('tr');}catch(e){}
}

function hidePlaylistMenu(){
  const wrap=document.getElementById('playlist-menu');
  const btn=document.getElementById('playlist-btn');
  if(wrap) wrap.classList.remove('show');
  if(btn) btn.classList.remove('active');
}

document.addEventListener('click', function(e){
  const wrap=document.getElementById('playlist-menu');
  const btn=document.getElementById('playlist-btn');
  if(!wrap||!wrap.classList.contains('show')) return;
  if(wrap.contains(e.target)||e.target===btn) return;
  hidePlaylistMenu();
});

// swT = "switch track" — satu-satunya jalur untuk mengganti/memulai lagu apa pun di playlist.
// Dipakai baik untuk lagu pertama (swT(0)) maupun perpindahan manual/otomatis berikutnya.
async function swT(i){
  if(i>0 && !bonusUnlocked) return; // track bonus masih terkunci
  const myGen=++_audGen; // batalkan proses play sebelumnya yang mungkin masih berjalan
  am.pause();
  cti=(i+TRACKS.length)%TRACKS.length;
  updNP(cti);
  try{
    if(typeof window._showAudioLoading==='function') window._showAudioLoading();
    if(myGen!==_audGen) return; // sudah dibatalkan oleh panggilan swT yang lebih baru
    // Streaming langsung dari URL asli — browser mengunduh & memutar secara bertahap
    // (HTTP range request), tidak menunggu seluruh file selesai diunduh.
    am.crossOrigin='anonymous';
    am.preload='auto';
    am.src=TRACKS[cti].url; am.currentTime=0; am.volume=1; await am.play();
    if(typeof window._hideAudioLoading==='function') window._hideAudioLoading();
    if(myGen!==_audGen){ am.pause(); am.currentTime=0; return; }
    if(micOn){ am._muteForMic=true; am.volume=0; }
    document.getElementById('mpp').textContent='⏸';
    syncTrackButtons();
  }catch(e){
    if(typeof window._hideAudioLoading==='function') window._hideAudioLoading();
  }
}

function playMain(){ return swT(0); }
function playA(){const g=()=>playMain();if(_au)g();else _pp=g;}
function initViz(){if(aCtx)return;try{aCtx=new(window.AudioContext||window.webkitAudioContext)();anl=aCtx.createAnalyser();const s=aCtx.createMediaElementSource(am);s.connect(anl);anl.connect(aCtx.destination);anl.fftSize=32;aData=new Uint8Array(anl.frequencyBinCount);const b=document.querySelectorAll('.vbar');function u(){if(!anl)return;anl.getByteFrequencyData(aData);b.forEach((v,i)=>{v.style.height=Math.max(3,(aData[i]||0)/255*30)+'px';});requestAnimationFrame(u);}u();}catch(e){}}
function mToggle(){if(!am)return;const p=document.getElementById('mpp');if(am.paused){am.play().catch(()=>{});if(p)p.textContent='⏸';}else{am.pause();if(p)p.textContent='▶';}}
function mNext(){swT((cti+1)%trackCount());}
function mPrev(){swT((cti-1+trackCount())%trackCount());}
function toggleRepeat(){repeatOne=!repeatOne;return repeatOne;}
function toggleRepeatUI(){
  const on=toggleRepeat();
  const b=document.getElementById('repeat-toggle');
  if(b){
    b.textContent='ulangi 1 lagu: '+(on?'ON':'OFF');
    b.style.color=on?'var(--gold-lt)':'rgba(242,180,65,.6)';
    b.style.borderColor=on?'var(--gold)':'rgba(242,180,65,.25)';
  }
}

// AUTO-LANJUT: begitu satu lagu selesai, otomatis lanjut ke lagu berikutnya di playlist.
// Kalau "ulangi 1 lagu" aktif, lagu yang sama diputar ulang dari awal.
// Kalau sudah di lagu terakhir, playlist berputar kembali ke lagu pertama (About You).
am.addEventListener('ended', function(){
  if(repeatOne){ am.currentTime=0; am.play().catch(()=>{}); return; }
  swT((cti+1)%trackCount());
});

// SFX
function sfx(t){try{const c=new(window.AudioContext||window.webkitAudioContext)();c.resume().then(()=>{if(t==='ok'){[523.25,659.25,783.99,1046.5].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,c.currentTime+i*.06);g.gain.setValueAtTime(.06,c.currentTime+i*.06);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.06+.25);o.connect(g);g.connect(c.destination);o.start(c.currentTime+i*.06);o.stop(c.currentTime+i*.06+.25);});}else if(t==='err'){const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(220,c.currentTime);o.frequency.linearRampToValueAtTime(110,c.currentTime+.15);o.frequency.linearRampToValueAtTime(165,c.currentTime+.3);g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.35);o.connect(g);g.connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+.35);}else if(t==='win'){[523.25,659.25,783.99,880,1046.5].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,c.currentTime+i*.08);g.gain.setValueAtTime(.07,c.currentTime+i*.08);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.08+.4);o.connect(g);g.connect(c.destination);o.start(c.currentTime+i*.08);o.stop(c.currentTime+i*.08+.4);});}else{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(300,c.currentTime);o.frequency.exponentialRampToValueAtTime(600,c.currentTime+.5);g.gain.setValueAtTime(.04,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start(c.currentTime);o.stop(c.currentTime+.5);}});}catch(e){}}

// STAGES
const STAGES=['s1','s2','s2b','scd','str','sph','s3','s3b','sci','spz','svg-screen','srh','s8','sfl','s9','s9b','s10','s11','sphoto','s13'];
function go(f,t){
  const fe=document.getElementById(f);
  fe.style.transform='scale(1.02) translateY(-10px)';
  fe.style.opacity='0';
  sfx('tr');
  preloadNextTrack();
  setTimeout(()=>{
    fe.classList.remove('active');
    fe.style.transform='';
    fe.style.opacity='';
    const te=document.getElementById(t);
    te.style.opacity='0';
    te.classList.add('active');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ te.style.opacity=''; }));
  },600);
  const i=STAGES.indexOf(t);
  if(i>=0)setTimeout(()=>updProg(i),800);
  if(navigator.vibrate)navigator.vibrate(50);
}

// ===== PHOTOBOOTH — kamera dengan pilihan mode, filter, dan bingkai =====
let pbStream=null, pbBusy=false, pbFrames=[], pbFinalBase=null, pbCaptionMeta=null;
let pbOptions={mode:'strip', filter:'natural', frame:'creativeLab'};
let pbMirror=true, pbFacingMode='user', pbFlashOn=false, pbIsoTimer=null;
let pbOptionsCollapsed=true;

const PB_MODE_LABELS={single:'📷 Satu Foto', strip:'🎞 Strip 3 Foto'};
const PB_FILTER_LABELS={natural:'Natural', vangogh:'Van Gogh Lembut', bw:'Hitam Putih', sepia:'Sephia', dreamy:'Dreamy Glow', cool:'Cool Blue'};

let PB_TEMPLATE_KEYS=[];
let pbTemplateIndex=0;

function pbFrameLabel(val){
  const tpl=PB_CUSTOM_TEMPLATES[val];
  return tpl ? tpl.label : val;
}

function pbUpdateOptionsSummary(){
  const el=document.getElementById('pb-options-summary');
  if(!el) return;
  el.textContent=pbFrameLabel(pbOptions.frame)+' · '+(PB_FILTER_LABELS[pbOptions.filter]||pbOptions.filter);
}

function pbToggleOptionsPanel(forceState){
  pbOptionsCollapsed = (typeof forceState==='boolean') ? forceState : !pbOptionsCollapsed;
  document.getElementById('pb-options').classList.toggle('collapsed', pbOptionsCollapsed);
  document.getElementById('pb-options-caret').textContent = pbOptionsCollapsed ? '▼ tampilkan' : '▲ sembunyikan';
  pbUpdateOptionsSummary();
}

// ===== CAROUSEL TEMPLATE — geser satu-satu pakai panah/dots, bukan grid+scroll lagi.
// Lebih simpel & pasti berfungsi di semua device karena cuma menampilkan 1 kartu
// dalam satu waktu, tidak ada elemen yang bisa "tersembunyi" atau butuh scroll.
function pbRenderTemplateCarousel(){
  PB_TEMPLATE_KEYS=Object.keys(PB_CUSTOM_TEMPLATES);
  if(!PB_TEMPLATE_KEYS.length) return;
  const idx=PB_TEMPLATE_KEYS.indexOf(pbOptions.frame);
  pbTemplateIndex = idx>=0 ? idx : 0;
  pbOptions.frame = PB_TEMPLATE_KEYS[pbTemplateIndex];
  pbRenderTemplateDots();
  pbUpdateTemplateCarouselUI();
}

function pbRenderTemplateDots(){
  const wrap=document.getElementById('pb-template-dots');
  if(!wrap) return;
  wrap.innerHTML='';
  PB_TEMPLATE_KEYS.forEach(function(key,i){
    const dot=document.createElement('button');
    dot.className='pb-template-dot'+(i===pbTemplateIndex?' active':'');
    dot.title=PB_CUSTOM_TEMPLATES[key].label||key;
    dot.onclick=function(){ pbSelectTemplateIndex(i); };
    wrap.appendChild(dot);
  });
}

function pbUpdateTemplateCarouselUI(){
  const btn=document.getElementById('pb-template-current-btn');
  const key=PB_TEMPLATE_KEYS[pbTemplateIndex];
  if(btn && key){
    btn.innerHTML=PB_CUSTOM_TEMPLATES[key].label||key;
    btn.setAttribute('data-val', key);
  }
  document.querySelectorAll('.pb-template-dot').forEach(function(d,i){
    d.classList.toggle('active', i===pbTemplateIndex);
  });
}

function pbSelectTemplateIndex(i){
  if(pbBusy||!PB_TEMPLATE_KEYS.length) return;
  pbTemplateIndex = ((i%PB_TEMPLATE_KEYS.length)+PB_TEMPLATE_KEYS.length)%PB_TEMPLATE_KEYS.length;
  pbOptions.frame = PB_TEMPLATE_KEYS[pbTemplateIndex];
  pbUpdateTemplateCarouselUI();
  try{sfx('tr');}catch(e){}
  pbUpdateShotCounter(0);
  pbUpdateLivePreview();
  pbUpdateOptionsSummary();
  if(typeof pbPrefetchNeighbors==='function') pbPrefetchNeighbors();
}

function pbCycleTemplate(dir){
  pbSelectTemplateIndex(pbTemplateIndex+dir);
}

function pbSetOption(group,val,btn){
  if(pbBusy) return;
  pbOptions[group]=val;
  document.querySelectorAll('.pb-opt[data-group="'+group+'"]').forEach(function(b){
    b.classList.toggle('active', b===btn);
  });
  try{sfx('tr');}catch(e){}
  if(group==='mode'){ pbUpdateShotCounter(0); pbUpdateLivePreview(); }
  pbUpdateOptionsSummary();
}

function initPhotobooth(){
  if(typeof pbPrefetchAllTemplates==='function') pbPrefetchAllTemplates();
  const wrap=document.getElementById('pb-camwrap'), video=document.getElementById('pb-video'),
        err=document.getElementById('pb-camerr'), shotBtn=document.getElementById('pb-shot-btn'),
        skipBtn=document.getElementById('pb-skip-btn'), upBtn=document.getElementById('pb-upload-btn'),
        result=document.getElementById('pb-result'), opts=document.getElementById('pb-options'),
        grid=document.getElementById('pb-stage-grid');
  if(result) result.style.display='none';
  if(wrap) wrap.style.display='block';
  if(grid) grid.style.display='flex';
  if(opts) opts.style.display='flex';
  document.getElementById('pb-camctrl').style.display='flex';
  err.style.display='none';
  // Selalu nyalakan ulang tombol-tombol ini setiap kali stage dibuka/di-retake —
  // sebelumnya tombol ini bisa "kekunci" (disabled) dari sesi jepret sebelumnya
  // kalau kamera masih aktif, karena baris di bawah langsung return duluan.
  if(shotBtn) shotBtn.disabled=false;
  if(skipBtn) skipBtn.disabled=false;
  if(upBtn) upBtn.disabled=false;
  pbBusy=false;
  const filterBtn=document.getElementById('pb-filter-btn');
  if(filterBtn) filterBtn.innerHTML='🎨 '+(PB_FILTER_LABELS[pbOptions.filter]||pbOptions.filter).toUpperCase();
  pbUpdateShotCounter(0);
  pbUpdateLivePreview();
  pbUpdateOptionsSummary();
  pbToggleOptionsPanel(true); // mulai terlipat — kamera & preview langsung muat 1 layar
  pbStartIsoJitter();
  if(pbStream) return; // kamera sudah aktif, tidak perlu diminta ulang
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    err.style.display='flex'; if(shotBtn) shotBtn.disabled=true; return;
  }
  navigator.mediaDevices.getUserMedia({video:{facingMode:pbFacingMode},audio:false}).then(function(stream){
    pbStream=stream; video.srcObject=stream;
    video.classList.toggle('pb-mirrored', pbMirror);
    if(shotBtn) shotBtn.disabled=false;
  }).catch(function(){
    err.style.display='flex'; if(shotBtn) shotBtn.disabled=true;
  });
}

function pbStopCamera(){
  if(pbStream){ pbStream.getTracks().forEach(function(t){t.stop();}); pbStream=null; }
  if(pbIsoTimer){ clearInterval(pbIsoTimer); pbIsoTimer=null; }
}

// HUD kosmetik: label ISO acak yang bergeser tiap beberapa detik, mengesankan kamera
// digital sungguhan sedang menyesuaikan exposure — murni dekoratif.
function pbStartIsoJitter(){
  if(pbIsoTimer) return;
  const isoVals=[100,200,400,800,1600];
  pbIsoTimer=setInterval(function(){
    const el=document.getElementById('pb-iso-label');
    if(el) el.textContent='ISO '+isoVals[Math.floor(Math.random()*isoVals.length)];
  },1800);
}

function pbToggleMirror(){
  pbMirror=!pbMirror;
  document.getElementById('pb-video').classList.toggle('pb-mirrored', pbMirror);
  document.getElementById('pb-mirror-btn').classList.toggle('active', pbMirror);
  try{sfx('tr');}catch(e){}
}

function pbToggleFlip(){
  if(pbBusy) return;
  pbFacingMode = (pbFacingMode==='user') ? 'environment' : 'user';
  pbMirror = (pbFacingMode==='user'); // default: kamera depan dicerminkan, belakang tidak
  pbStopCamera();
  initPhotobooth();
  try{sfx('tr');}catch(e){}
}

function pbToggleFlash(){
  pbFlashOn=!pbFlashOn;
  document.getElementById('pb-flash-btn').classList.toggle('active', pbFlashOn);
  // Coba nyalakan torch fisik kalau device mendukung (kebanyakan kamera depan tidak punya)
  if(pbStream){
    const track=pbStream.getVideoTracks()[0];
    if(track && track.getCapabilities && track.getCapabilities().torch){
      track.applyConstraints({advanced:[{torch:pbFlashOn}]}).catch(function(){});
    }
  }
  try{sfx('tr');}catch(e){}
}

// Filter dulu ada di panel opsi terpisah, sekarang digabung ke HUD kamera sebagai
// tombol geser (klik berulang buat pindah gaya) — sama pola-nya kayak MIRROR/FLASH.
const PB_FILTER_ORDER=['natural','vangogh','bw','sepia','dreamy','cool'];
function pbCycleFilter(){
  const cur=PB_FILTER_ORDER.indexOf(pbOptions.filter);
  const next=PB_FILTER_ORDER[(cur+1)%PB_FILTER_ORDER.length];
  pbOptions.filter=next;
  const btn=document.getElementById('pb-filter-btn');
  if(btn) btn.innerHTML='🎨 '+(PB_FILTER_LABELS[next]||next).toUpperCase();
  pbUpdateOptionsSummary();
  try{sfx('tr');}catch(e){}
}

function pbFireFlash(){
  if(!pbFlashOn) return;
  const el=document.getElementById('pb-flash-overlay');
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}

// Lewati bilik foto sepenuhnya (kalau kamera bermasalah / pengunjung tidak mau difoto)
function pbSkip(){
  pbStopCamera();
  go('sphoto','s13'); setTimeout(goS13,800);
}

function pbContinue(){
  pbStopCamera();
  go('sphoto','s13'); setTimeout(goS13,800);
}

function pbRetake(){
  document.getElementById('pb-result').style.display='none';
  document.getElementById('pb-stage-grid').style.display='flex';
  document.getElementById('pb-camwrap').style.display='block';
  document.getElementById('pb-camctrl').style.display='flex';
  document.getElementById('pb-options').style.display='flex';
  document.getElementById('pb-caption').value='';
  document.getElementById('pb-sub').textContent='Pilih gaya fotomu, lalu jepret — semua bisa diganti kapan saja sebelum ambil foto.';
  pbFrames=[]; pbFinalBase=null; pbCaptionMeta=null;
  initPhotobooth();
}

function pbSetOptionsLocked(locked){
  document.querySelectorAll('.pb-opt, .pb-carousel-arrow, .pb-template-dot').forEach(function(b){ b.disabled=locked; });
}

function pbTotalShots(){
  const tpl=PB_CUSTOM_TEMPLATES[pbOptions.frame];
  if(tpl){
    const slots=(pbOptions.mode==='strip'&&tpl.slotsStrip&&tpl.slotsStrip.length)?tpl.slotsStrip:tpl.slotsSingle;
    if(slots&&slots.length) return slots.length;
  }
  return pbOptions.mode==='strip' ? 3 : 1;
}

function pbUpdateShotCounter(current){
  const total=pbTotalShots();
  const c1=document.getElementById('pb-shot-counter'), c2=document.getElementById('pb-preview-counter'),
        bar=document.getElementById('pb-hud-progress-bar');
  if(c1) c1.textContent='[ '+current+'/'+total+' ]';
  if(c2) c2.textContent=current+'/'+total;
  if(bar) bar.style.width=Math.round((current/total)*100)+'%';
}

function pbCapture(){
  if(pbBusy||!pbStream) return;
  pbBusy=true;
  pbFrames=[];
  pbUpdateShotCounter(0);
  pbSetOptionsLocked(true);
  const shotBtn=document.getElementById('pb-shot-btn'), skipBtn=document.getElementById('pb-skip-btn'), upBtn=document.getElementById('pb-upload-btn');
  if(shotBtn) shotBtn.disabled=true;
  if(skipBtn) skipBtn.disabled=true;
  if(upBtn) upBtn.disabled=true;
  pbCaptureSequence(0,pbTotalShots());
}

function pbCaptureSequence(index,total){
  const cd=document.getElementById('pb-countdown'), sub=document.getElementById('pb-sub');
  if(sub){
    sub.textContent = total>1
      ? 'Bersiap untuk foto '+(index+1)+' dari '+total+'...'
      : 'Bersiap...';
  }
  let n=3;
  cd.textContent=n; cd.classList.add('show');
  try{sfx('tr');}catch(e){}
  const iv=setInterval(function(){
    n--;
    if(n>0){ cd.textContent=n; try{sfx('tr');}catch(e){} }
    else{
      clearInterval(iv);
      cd.textContent='✦'; try{sfx('win');}catch(e){}
      pbFireFlash();
      setTimeout(function(){
        cd.classList.remove('show');
        pbFrames.push(pbGrabFrame());
        pbUpdateShotCounter(pbFrames.length);
        pbUpdateLivePreview();
        if(index+1<total){
          setTimeout(function(){ pbCaptureSequence(index+1,total); },600);
        } else {
          pbFinishCapture();
        }
      },220);
    }
  },700);
}

function pbGrabFrame(){
  const video=document.getElementById('pb-video');
  const vw=video.videoWidth||480, vh=video.videoHeight||360;
  const outW=440, outH=Math.round(outW*(vh/vw));
  const src=document.createElement('canvas');
  src.width=outW; src.height=outH;
  const sctx=src.getContext('2d');
  if(pbMirror){ sctx.translate(outW,0); sctx.scale(-1,1); }
  sctx.drawImage(video,0,0,outW,outH);
  return src;
}

// Alternatif kamera: pengunjung upload foto dari galeri untuk mengisi slot berikutnya.
// Foto di-crop "cover" ke rasio yang sama dengan hasil jepretan kamera (440 lebar).
function pbUploadPhoto(evt){
  const file=evt.target.files&&evt.target.files[0];
  evt.target.value='';
  if(!file||pbBusy) return;
  const img=new Image();
  const reader=new FileReader();
  reader.onload=function(e){
    img.onload=function(){
      const outW=440, outH=330;
      const canvas=document.createElement('canvas');
      canvas.width=outW; canvas.height=outH;
      pbDrawCoverImage(canvas.getContext('2d'), img, 0, 0, outW, outH);
      pbFrames.push(canvas);
      pbUpdateShotCounter(pbFrames.length);
      pbUpdateLivePreview();
      try{sfx('win');}catch(e){}
      if(pbFrames.length>=pbTotalShots()){
        pbBusy=true; pbSetOptionsLocked(true);
        pbFinishCapture();
      }
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

// ===== PREVIEW LIVE — menyusun ulang template tiap kali ada foto baru masuk,  =====
// ===== slot yang belum terisi ditampilkan sebagai kotak placeholder abu-abu   =====
let _pbPreviewBusy=false, _pbPreviewQueued=false;
function pbCreatePlaceholder(w,h){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const ctx=c.getContext('2d');
  ctx.fillStyle='rgba(255,255,255,.06)';
  ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=2; ctx.setLineDash([6,6]);
  ctx.strokeRect(6,6,w-12,h-12);
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,.28)';
  ctx.font=(Math.round(h*0.28))+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('📷',w/2,h/2);
  return c;
}

async function pbUpdateLivePreview(){
  if(_pbPreviewBusy){ _pbPreviewQueued=true; return; }
  _pbPreviewBusy=true;
  const loadingEl=document.getElementById('pb-preview-loading');
  const tpl=PB_CUSTOM_TEMPLATES[pbOptions.frame];
  // Cuma tampilkan spinner kalau template ini BENAR-BENAR baru pertama kali dimuat
  // (belum ada di cache) — supaya tidak berkedip tiap kali preview di-refresh biasa.
  const needsFetch = !!(tpl && !_pbImgCache[tpl.url]);
  if(needsFetch && loadingEl) loadingEl.classList.add('show');
  try{
    const total=pbTotalShots();
    const pw=440, ph=330;
    const arr=[];
    for(let i=0;i<total;i++){
      arr.push(pbFrames[i] ? pbFrames[i] : pbCreatePlaceholder(pw,ph));
    }
    let built;
    try{
      built=await pbComposeFinal(arr, pbOptions.frame, pbOptions.mode);
    }catch(e){
      built=await pbComposeFinal(arr, 'polaroid', pbOptions.mode);
    }
    const canvas=document.getElementById('pb-live-canvas');
    if(canvas){
      canvas.width=built.canvas.width; canvas.height=built.canvas.height;
      canvas.getContext('2d').drawImage(built.canvas,0,0);
    }
  }catch(e){ /* preview gagal disusun, biarkan — tidak fatal */ }
  if(loadingEl) loadingEl.classList.remove('show');
  _pbPreviewBusy=false;
  if(_pbPreviewQueued){ _pbPreviewQueued=false; pbUpdateLivePreview(); }
}

async function pbFinishCapture(){
  const filtered=pbFrames.map(function(f){ return pbApplyStyle(f,pbOptions.filter); });
  document.getElementById('pb-sub').textContent='Menyusun template...';
  let built;
  try{
    built=await pbComposeFinal(filtered,pbOptions.frame,pbOptions.mode);
  }catch(e){
    console.error('Gagal memuat template, pakai bingkai Polaroid Putih sebagai cadangan.',e);
    built=await pbComposeFinal(filtered,'polaroid',pbOptions.mode);
  }
  pbFinalBase=built.canvas; pbCaptionMeta=built.meta;

  const canvas=document.getElementById('pb-canvas');
  canvas.width=pbFinalBase.width; canvas.height=pbFinalBase.height;
  canvas.getContext('2d').drawImage(pbFinalBase,0,0);

  // Simpan versi terkompresi (JPEG kualitas sedang) ke localStorage supaya foto ini
  // tetap bisa dipakai Buku Kenangan meski dibuka lagi di sesi/hari lain.
  try{
    const jpegUrl=pbFinalBase.toDataURL('image/jpeg',0.72);
    localStorage.setItem('nphotobooth', jpegUrl);
  }catch(e){ /* localStorage penuh/gagal — bukan fatal, cuma tidak tersimpan lintas sesi */ }

  document.getElementById('pb-stage-grid').style.display='none';
  document.getElementById('pb-camctrl').style.display='none';
  document.getElementById('pb-options').style.display='none';
  document.getElementById('pb-result').style.display='flex';
  pbSetOptionsLocked(false);
  pbBusy=false;
  if(navigator.vibrate) navigator.vibrate([40,20,60]);
}

// ===== FILTER — diterapkan per foto, foto tetap utuh & jelas =====
// Semua filter menggambar foto ASLI dulu secara penuh (memakai ctx.filter bawaan
// canvas: saturasi/kontras/grayscale/sepia), baru kalau perlu dikasih tekstur
// tambahan DI ATASNYA dengan transparansi rendah. Ini sengaja dibuat begini —
// versi sebelumnya menggambar sapuan-sapuan kecil di atas kanvas kosong sehingga
// ada celah warna gelap yang bikin foto terlihat rusak/aneh. Sekarang foto dasar
// selalu utuh, sapuan kuas cuma nuansa tipis di permukaannya.
function pbApplyStyle(srcCanvas, filterName){
  const w=srcCanvas.width, h=srcCanvas.height;
  const out=document.createElement('canvas'); out.width=w; out.height=h;
  const ctx=out.getContext('2d');

  if(filterName==='bw'){
    ctx.filter='grayscale(1) contrast(1.12) brightness(1.03)';
  } else if(filterName==='sepia'){
    ctx.filter='sepia(.6) saturate(1.25) contrast(1.05) brightness(1.02)';
  } else if(filterName==='vangogh'){
    ctx.filter='saturate(1.3) contrast(1.15) brightness(1.04)';
  } else if(filterName==='dreamy'){
    ctx.filter='saturate(1.1) contrast(.94) brightness(1.1)';
  } else if(filterName==='cool'){
    ctx.filter='saturate(1.05) contrast(1.08) hue-rotate(-8deg) brightness(1.02)';
  } else {
    ctx.filter='saturate(1.06) contrast(1.03)';
  }
  ctx.drawImage(srcCanvas,0,0,w,h);
  ctx.filter='none';

  if(filterName==='dreamy'){
    // Glow lembut: highlight di tengah menyebar halus ke tepi, plus sedikit noise cahaya
    const g=ctx.createRadialGradient(w/2,h*0.4,0,w/2,h*0.4,Math.max(w,h)*0.7);
    g.addColorStop(0,'rgba(255,248,235,.22)');
    g.addColorStop(1,'rgba(255,248,235,0)');
    ctx.fillStyle=g;
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(30,20,10,.10)';
    ctx.fillRect(0,0,w,h);
  } else if(filterName==='cool'){
    ctx.fillStyle='rgba(70,110,190,.08)';
    ctx.fillRect(0,0,w,h);
  }

  if(filterName==='vangogh'){
    // Posterize ringan: warna dikelompokkan jadi beberapa level supaya terlihat
    // lebih "flat" seperti cat, bukan foto digital biasa.
    const imgData=ctx.getImageData(0,0,w,h);
    const d=imgData.data, levels=6, lstep=255/(levels-1);
    for(let i=0;i<d.length;i+=4){
      d[i]  =Math.round(Math.round(d[i]/lstep)*lstep);
      d[i+1]=Math.round(Math.round(d[i+1]/lstep)*lstep);
      d[i+2]=Math.round(Math.round(d[i+2]/lstep)*lstep);
    }
    ctx.putImageData(imgData,0,0);

    // Tekstur sapuan kuas TIPIS di atas foto yang sudah utuh — warnanya diambil
    // dari foto itu sendiri di titik yang sama, jadi menyatu, tidak bikin bercak.
    const sample=ctx.getImageData(0,0,w,h).data;
    ctx.globalAlpha=.32;
    const step=7;
    for(let y=0;y<h;y+=step){
      for(let x=0;x<w;x+=step){
        const idx=(y*w+x)*4;
        const r=sample[idx],g=sample[idx+1],b=sample[idx+2];
        const angle=Math.sin(x*0.02+y*0.015)*Math.PI*0.5+Math.cos(y*0.018)*0.4;
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(angle);
        ctx.fillStyle='rgb('+r+','+g+','+b+')';
        ctx.beginPath();
        ctx.ellipse(0,0,step*0.95,step*0.34,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha=1;
  }
  return out;
}

// Satu kelopak bunga digambar sebagai bezier daun — dipakai berulang untuk membentuk
// karangan bunga generatif, unik tiap kali difoto.
function pbDrawFlower(ctx,cx,cy,scale,hue){
  const petals=5+Math.floor(Math.random()*2);
  const petalLen=13*scale;
  for(let i=0;i<petals;i++){
    const a=(i/petals)*Math.PI*2+Math.random()*.2;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(petalLen*.5,-petalLen*.4,petalLen*.5,petalLen*.4,0,petalLen);
    ctx.bezierCurveTo(-petalLen*.5,petalLen*.4,-petalLen*.5,-petalLen*.4,0,0);
    ctx.fillStyle=hue;
    ctx.globalAlpha=.85;
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx,cy,3.4*scale,0,Math.PI*2);
  ctx.fillStyle='rgba(246,203,122,.95)';
  ctx.globalAlpha=1;
  ctx.fill();
}

function pbDrawFlowerCluster(ctx,cx,cy){
  const palette=['rgba(232,96,76,.9)','rgba(241,160,148,.85)','rgba(127,174,106,.85)','rgba(242,180,65,.85)'];
  const n=2+Math.floor(Math.random()*2);
  for(let i=0;i<n;i++){
    const ox=(Math.random()-0.5)*22, oy=(Math.random()-0.5)*22;
    const scale=.5+Math.random()*.45;
    pbDrawFlower(ctx,cx+ox,cy+oy,scale,palette[Math.floor(Math.random()*palette.length)]);
  }
}

// Ornamen sudut sederhana untuk bingkai "Emas Klasik" & "Royal Maroon"
function pbDrawGoldCorner(ctx,x,y,dirX,dirY){
  ctx.save();
  ctx.translate(x,y);
  ctx.strokeStyle='rgba(246,203,122,.75)';
  ctx.lineWidth=1.4;
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(18*dirX,0);
  ctx.moveTo(0,0); ctx.lineTo(0,18*dirY);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(9*dirX,9*dirY,3,0,Math.PI*2);
  ctx.fillStyle='rgba(246,203,122,.6)';
  ctx.fill();
  ctx.restore();
}

function pbDrawDiamond(ctx,cx,cy){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(Math.PI/4);
  ctx.fillStyle='rgba(246,203,122,.85)';
  ctx.fillRect(-4,-4,8,8);
  ctx.restore();
}

// Bintang & percikan cahaya kecil, dipakai bingkai "Malam Berbintang" & "Cahaya Bulan"
function pbDrawStars(ctx,w,h,count){
  for(let i=0;i<count;i++){
    const x=Math.random()*w, y=Math.random()*h;
    const r=Math.random()*1.6+0.5;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,250,230,'+(0.4+Math.random()*0.5)+')';
    ctx.fill();
    if(Math.random()>.78){
      ctx.strokeStyle='rgba(255,250,230,.35)'; ctx.lineWidth=.6;
      ctx.beginPath();
      ctx.moveTo(x-4,y); ctx.lineTo(x+4,y);
      ctx.moveTo(x,y-4); ctx.lineTo(x,y+4);
      ctx.stroke();
    }
  }
}

// Pusaran kecil ala Starry Night — dipakai bingkai "Malam Berbintang"
function pbDrawSwirl(ctx,cx,cy,r){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.strokeStyle='rgba(246,203,122,.4)';
  ctx.lineWidth=1.2;
  ctx.beginPath();
  for(let a=0;a<Math.PI*3.2;a+=0.15){
    const rad=(a/(Math.PI*3.2))*r;
    const x=Math.cos(a)*rad, y=Math.sin(a)*rad;
    if(a===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.restore();
}

// Ranting kecil bergaya spesimen herbarium — dipakai bingkai "Herbarium"
function pbDrawHerbariumSprig(ctx,cx,topY){
  ctx.save();
  ctx.translate(cx,topY);
  ctx.strokeStyle='rgba(90,67,38,.6)'; ctx.lineWidth=1.2;
  ctx.beginPath();
  ctx.moveTo(0,0); ctx.lineTo(0,24);
  ctx.stroke();
  for(let i=0;i<3;i++){
    const y=5+i*7, dir=i%2===0?1:-1;
    ctx.beginPath();
    ctx.moveTo(0,y);
    ctx.quadraticCurveTo(9*dir,y-3,15*dir,y+2);
    ctx.strokeStyle='rgba(90,67,38,.5)';
    ctx.stroke();
  }
  ctx.restore();
}

function pbRoundRectPath(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

// Lubang sprocket film di kiri-kanan — dipakai bingkai "Film Klasik"
function pbDrawFilmSprockets(ctx,padSide,outW,outH){
  const holeW=8, holeH=6, gapY=14;
  const leftX=padSide*0.32, rightX=outW-padSide*0.32-holeW;
  let y=10;
  ctx.fillStyle='rgba(255,255,255,.85)';
  while(y<outH-10){
    pbRoundRectPath(ctx,leftX,y,holeW,holeH,2); ctx.fill();
    pbRoundRectPath(ctx,rightX,y,holeW,holeH,2); ctx.fill();
    y+=holeH+gapY;
  }
}

// Percikan cat air lembut berlapis — dipakai bingkai "Cat Air"
function pbDrawWatercolorBlob(ctx,cx,cy,r,color){
  ctx.save();
  for(let i=3;i>=1;i--){
    ctx.beginPath();
    ctx.arc(cx+(Math.random()-.5)*6, cy+(Math.random()-.5)*6, r*(i/3), 0, Math.PI*2);
    ctx.fillStyle=color;
    ctx.globalAlpha=0.35/i;
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha=1;
}

// Cahaya bulan lembut — dipakai bingkai "Cahaya Bulan"
function pbDrawMoonGlow(ctx,cx,cy,r){
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r*2.2);
  g.addColorStop(0,'rgba(255,250,235,.9)');
  g.addColorStop(0.4,'rgba(255,250,235,.25)');
  g.addColorStop(1,'rgba(255,250,235,0)');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.arc(cx,cy,r*2.2,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx,cy,r*0.55,0,Math.PI*2);
  ctx.fillStyle='rgba(255,252,240,.95)';
  ctx.fill();
}

// Selotip washi miring — dipakai bingkai "Scrapbook"
function pbDrawWashiTape(ctx,x,y,color,rotateDeg){
  ctx.save();
  ctx.translate(x+20,y+8);
  ctx.rotate(rotateDeg*Math.PI/180);
  ctx.fillStyle=color;
  ctx.fillRect(-20,-8,40,16);
  ctx.globalAlpha=.5;
  ctx.fillStyle='rgba(255,255,255,.4)';
  for(let i=-18;i<18;i+=6){ ctx.fillRect(i,-8,1.5,16); }
  ctx.globalAlpha=1;
  ctx.restore();
}

// Konfeti kecil bertaburan di area margin (tidak menutupi foto) — dipakai bingkai "Konfeti"
function pbDrawConfetti(ctx,outW,outH,padSide,padTop,stackH){
  const colors=['#E8604C','#F2B441','#7FAE6A','#5FAEDB','#F1A094'];
  for(let i=0;i<28;i++){
    let x,y,tries=0;
    do{ x=Math.random()*outW; y=Math.random()*outH; tries++; }
    while(tries<12 && x>padSide-4 && x<outW-padSide+4 && y>padTop-4 && y<padTop+stackH+4);
    const col=colors[Math.floor(Math.random()*colors.length)];
    const shape=Math.floor(Math.random()*3);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(Math.random()*Math.PI*2);
    ctx.fillStyle=col;
    ctx.globalAlpha=.8;
    if(shape===0){ ctx.fillRect(-3,-3,6,6); }
    else if(shape===1){ ctx.beginPath(); ctx.arc(0,0,3,0,Math.PI*2); ctx.fill(); }
    else{ ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(4,3); ctx.lineTo(-4,3); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  ctx.globalAlpha=1;
}

// ===== Template terinspirasi gaya "photo strip" populer — semua elemen digambar =====
// ===== sendiri lewat kode (bukan reproduksi karakter/logo/lirik berhak cipta) =====

// Kop majalah retro — dipakai bingkai "Majalah Retro"
function pbDrawNewsprintHeader(ctx,outW,padTop){
  ctx.save();
  ctx.textAlign='center';
  ctx.fillStyle='#1a1a1a';
  ctx.font='italic 900 30px Georgia, serif';
  ctx.fillText('Taman Bulan',outW/2,padTop*0.52);
  ctx.font='9px monospace';
  ctx.fillStyle='#6b6b6b';
  ctx.fillText('EDISI SPESIAL · KENANGAN HARI INI',outW/2,padTop*0.72);
  ctx.strokeStyle='rgba(26,26,26,.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(18,padTop*0.82); ctx.lineTo(outW-18,padTop*0.82); ctx.stroke();
  pbDrawFlower(ctx,26,padTop*0.3,.55,'rgba(90,90,90,.55)');
  ctx.restore();
}

// Piringan hitam sederhana di margin kiri — dipakai bingkai "Vinyl Klasik"
function pbDrawVinyl(ctx,cx,cy,r){
  ctx.save();
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='#161616'; ctx.fill();
  for(let i=r*0.3;i<r*0.94;i+=4){
    ctx.beginPath(); ctx.arc(cx,cy,i,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(cx,cy,r*0.32,0,Math.PI*2);
  ctx.fillStyle='#e9dcc0'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,r*0.045,0,Math.PI*2);
  ctx.fillStyle='#161616'; ctx.fill();
  ctx.font='7px monospace'; ctx.fillStyle='#8a7550'; ctx.textAlign='center';
  ctx.fillText('STEREO',cx,cy+r*0.14);
  ctx.restore();
}

// Tempelan bintang bertekstur jahitan — dipakai bingkai "Denim Patch"
function pbDrawStarPatch(ctx,cx,cy,size,fill){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate((Math.random()-0.5)*0.5);
  ctx.beginPath();
  for(let i=0;i<10;i++){
    const a=(i/10)*Math.PI*2-Math.PI/2;
    const rad=(i%2===0)?size:size*0.42;
    const x=Math.cos(a)*rad, y=Math.sin(a)*rad;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle=fill; ctx.fill();
  ctx.setLineDash([2,2]);
  ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function pbDrawDenimTexture(ctx,outW,outH){
  ctx.save();
  ctx.strokeStyle='rgba(255,255,255,.035)'; ctx.lineWidth=2;
  for(let x=-outH;x<outW;x+=6){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+outH,outH); ctx.stroke();
  }
  ctx.restore();
}

// Kartu label bergaya "photo pass" biru tegas — dipakai bingkai "Kartu Momen"
function pbDrawBluepassHeader(ctx,outW,padTop){
  ctx.save();
  ctx.textAlign='left';
  ctx.fillStyle='#ffffff';
  ctx.font='900 22px "Josefin Sans", sans-serif';
  ctx.fillText('SETIAP DETIK',20,padTop*0.42);
  ctx.fillText('BERARTI',20,padTop*0.72);
  ctx.textAlign='right';
  ctx.font='9px monospace';
  ctx.fillStyle='rgba(255,255,255,.6)';
  ctx.fillText('TAMAN BULAN · 1.0',outW-20,padTop*0.42);
  ctx.restore();
}

function pbDrawBarcode(ctx,x,y,w,h){
  ctx.save();
  let cx=x;
  while(cx<x+w){
    const bw=1+Math.random()*2.5;
    ctx.fillStyle='rgba(255,255,255,.8)';
    ctx.fillRect(cx,y,bw,h);
    cx+=bw+1+Math.random()*2;
  }
  ctx.restore();
}

// ===== DISPATCHER — memanggil dekorasi yang sesuai untuk tiap bingkai =====
// phase 'under' digambar SEBELUM foto ditempel (jadi latar/elemen di balik foto),
// phase 'over' digambar SESUDAH foto ditempel (border, ornamen sudut, taburan).
function pbDecorateFrame(ctx, frameName, geo, phase){
  const padSide=geo.padSide, padTop=geo.padTop, pw=geo.pw, stackH=geo.stackH, outW=geo.outW, outH=geo.outH;
  if(frameName==='flower'){
    if(phase==='over'){
      pbDrawFlowerCluster(ctx,padSide+16,padTop+14);
      pbDrawFlowerCluster(ctx,padSide+pw-16,padTop+14);
      pbDrawFlowerCluster(ctx,padSide+16,padTop+stackH-14);
      pbDrawFlowerCluster(ctx,padSide+pw-16,padTop+stackH-14);
    }
  } else if(frameName==='gold'){
    if(phase==='over'){
      ctx.strokeStyle='rgba(246,203,122,.65)'; ctx.lineWidth=1.5;
      ctx.strokeRect(padSide-8,padTop-8,pw+16,stackH+16);
      ctx.strokeStyle='rgba(246,203,122,.35)';
      ctx.strokeRect(padSide-13,padTop-13,pw+26,stackH+26);
      pbDrawGoldCorner(ctx,padSide-16,padTop-16,1,1);
      pbDrawGoldCorner(ctx,outW-padSide+16,padTop-16,-1,1);
      pbDrawGoldCorner(ctx,padSide-16,padTop+stackH+16,1,-1);
      pbDrawGoldCorner(ctx,outW-padSide+16,padTop+stackH+16,-1,-1);
    }
  } else if(frameName==='minimal'){
    if(phase==='over'){
      ctx.strokeStyle='rgba(242,180,65,.5)'; ctx.lineWidth=1;
      ctx.strokeRect(padSide-6,padTop-6,pw+12,stackH+12);
    }
  } else if(frameName==='starrynight'){
    if(phase==='under'){
      pbDrawStars(ctx,outW,outH,26);
      pbDrawSwirl(ctx,padSide*0.55,padTop*0.55,13);
      pbDrawSwirl(ctx,outW-padSide*0.55,outH-16,11);
    } else {
      ctx.strokeStyle='rgba(232,217,168,.55)'; ctx.lineWidth=1.2;
      ctx.strokeRect(padSide-6,padTop-6,pw+12,stackH+12);
    }
  } else if(frameName==='herbarium'){
    if(phase==='under'){
      ctx.strokeStyle='rgba(90,67,38,.4)'; ctx.lineWidth=1;
      ctx.strokeRect(10,10,outW-20,outH-20);
    } else {
      pbDrawHerbariumSprig(ctx, outW/2, padTop+stackH+16);
      ctx.strokeStyle='rgba(90,67,38,.55)'; ctx.lineWidth=1;
      ctx.strokeRect(padSide-8,padTop-8,pw+16,stackH+16);
    }
  } else if(frameName==='filmstrip'){
    if(phase==='over') pbDrawFilmSprockets(ctx,padSide,outW,outH);
  } else if(frameName==='watercolor'){
    if(phase==='under'){
      pbDrawWatercolorBlob(ctx,30,26,58,'rgba(232,96,76,.35)');
      pbDrawWatercolorBlob(ctx,outW-34,30,54,'rgba(127,174,106,.3)');
      pbDrawWatercolorBlob(ctx,26,outH-30,50,'rgba(242,180,65,.3)');
      pbDrawWatercolorBlob(ctx,outW-30,outH-42,56,'rgba(241,160,148,.3)');
    }
  } else if(frameName==='moonlight'){
    if(phase==='under'){
      pbDrawMoonGlow(ctx, outW-padSide*1.3, padTop*1.1, 24);
      pbDrawStars(ctx,outW,outH,18);
    } else {
      ctx.strokeStyle='rgba(232,220,255,.4)'; ctx.lineWidth=1;
      ctx.strokeRect(padSide-6,padTop-6,pw+12,stackH+12);
    }
  } else if(frameName==='scrapbook'){
    if(phase==='over'){
      pbDrawWashiTape(ctx,padSide-8,padTop-6,'rgba(232,96,76,.55)',-8);
      pbDrawWashiTape(ctx,outW-padSide-32,padTop-8,'rgba(127,174,106,.55)',10);
      pbDrawWashiTape(ctx,padSide-6,padTop+stackH-14,'rgba(242,180,65,.55)',6);
    }
  } else if(frameName==='royal'){
    if(phase==='over'){
      ctx.strokeStyle='rgba(246,203,122,.7)'; ctx.lineWidth=2;
      ctx.strokeRect(padSide-10,padTop-10,pw+20,stackH+20);
      ctx.strokeStyle='rgba(246,203,122,.35)';
      ctx.strokeRect(padSide-16,padTop-16,pw+32,stackH+32);
      pbDrawGoldCorner(ctx,padSide-20,padTop-20,1,1);
      pbDrawGoldCorner(ctx,outW-padSide+20,padTop-20,-1,1);
      pbDrawGoldCorner(ctx,padSide-20,padTop+stackH+20,1,-1);
      pbDrawGoldCorner(ctx,outW-padSide+20,padTop+stackH+20,-1,-1);
      pbDrawDiamond(ctx,outW/2,padTop-16);
    }
  } else if(frameName==='confetti'){
    if(phase==='over') pbDrawConfetti(ctx,outW,outH,padSide,padTop,stackH);
  } else if(frameName==='newsprint'){
    if(phase==='over'){
      pbDrawNewsprintHeader(ctx,outW,padTop);
      ctx.strokeStyle='rgba(26,26,26,.4)'; ctx.lineWidth=1;
      ctx.strokeRect(padSide-8,padTop-8,pw+16,stackH+16);
      ctx.strokeStyle='rgba(26,26,26,.6)';
      ctx.strokeRect(8,8,outW-16,outH-16);
    }
  } else if(frameName==='vinylside'){
    const padLeft=geo.padLeft;
    if(phase==='under'){
      pbDrawVinyl(ctx, padLeft*0.52, outH*0.5, Math.min(padLeft*0.46, outH*0.46));
    } else {
      ctx.strokeStyle='rgba(74,58,40,.35)'; ctx.lineWidth=1;
      ctx.strokeRect(padLeft-6,padTop-6,pw+12,stackH+12);
    }
  } else if(frameName==='denimpatch'){
    if(phase==='under'){
      pbDrawDenimTexture(ctx,outW,outH);
    } else {
      const patchCols=['rgba(90,120,160,.9)','rgba(180,150,80,.9)','rgba(120,150,140,.9)'];
      pbDrawStarPatch(ctx,padSide*0.55,padTop*0.55,13,patchCols[0]);
      pbDrawStarPatch(ctx,outW-padSide*0.55,padTop*0.6,11,patchCols[1]);
      pbDrawStarPatch(ctx,padSide*0.5,padTop+stackH*0.4,10,patchCols[2]);
      pbDrawStarPatch(ctx,outW-padSide*0.55,padTop+stackH*0.7,12,patchCols[0]);
      pbDrawStarPatch(ctx,padSide*0.55,padTop+stackH+30,9,patchCols[1]);
      ctx.strokeStyle='rgba(251,243,222,.4)'; ctx.lineWidth=1;
      ctx.strokeRect(padSide-8,padTop-8,pw+16,stackH+16);
    }
  } else if(frameName==='bluepass'){
    if(phase==='under'){
      ctx.fillStyle='#ffffff';
      ctx.fillRect(padSide-8,padTop-8,pw+16,stackH+16);
    } else {
      pbDrawBluepassHeader(ctx,outW,padTop);
      pbDrawBarcode(ctx,padSide,padTop+stackH+16,pw*0.55,14);
    }
  }
  // 'polaroid' sengaja tanpa dekorasi tambahan — gaya paling bersih/klasik
}

// ===== KOMPOSISI BINGKAI — mendukung 1 foto atau strip 3 foto sekaligus =====
// Mengembalikan {canvas, meta}. meta menyimpan koordinat & warna area caption
// supaya caption bisa "ditulis" belakangan tanpa perlu menggambar ulang semuanya.
// ================================================================================
// ===== TEMPLATE CUSTOM MILIK SENDIRI — upload PNG-mu ke GitHub, isi di sini =====
// ================================================================================
// CARA PAKAI:
// 1. Desain template di Canva/Figma/Photoshop dengan LUBANG TRANSPARAN persis di
//    tempat foto seharusnya muncul (sisanya — bingkai, stiker, teks — biarkan buram/solid).
// 2. Export sebagai PNG (transparent background), lalu upload ke repo GitHub kamu
//    (folder yang sama seperti tempat kamu host musik, misal "naffa-templates").
// 3. Catat UKURAN ASLI file PNG-nya (misal 1080x1920), dan posisi tiap lubang foto
//    dalam PERSENTASE dari ukuran itu (0 = paling kiri/atas, 1 = paling kanan/bawah).
//    Contoh: kalau lubang foto dimulai di piksel (108,190) dengan ukuran 864x648
//    pada gambar 1080x1920 → xPct=108/1080=.10, yPct=190/1920≈.099, wPct=864/1080=.8, hPct=648/1920=.3375
// 4. Isi satu entri baru di bawah ini, lalu tambahkan tombolnya di HTML (cari
//    komentar "TEMPLATE CUSTOM" di bagian <!-- SPHOTO PHOTOBOOTH -->).
//
// slotsSingle  = array 1 objek {xPct,yPct,wPct,hPct} → dipakai kalau mode "Satu Foto"
// slotsStrip   = array 3 objek {xPct,yPct,wPct,hPct} → dipakai kalau mode "Strip 3 Foto"
//                (boleh dikosongkan [] kalau template ini cuma untuk 1 foto)
// captionPct   = {xPct,yPct} posisi teks caption (opsional, default ke bawah tengah)
// textColor/subColor = warna teks caption & label supaya kebaca di atas desainmu
//
const PB_CUSTOM_TEMPLATES = {
  // Label, url, dan koordinat slot di bawah sudah dicocokkan ULANG satu-satu
  // dengan isi asli tiap file (bukan cuma tebak dari nomor filenya) supaya
  // tidak ada lagi yang ketuker seperti kejadian sebelumnya.

  creativeLab: {
    label: '🐱 Creative Lab',
    url: 'assets/photobooth/1.png',
    slotsSingle: [{xPct:0.115, yPct:0.0828, wPct:0.755, hPct:0.2411}],
    slotsStrip: [
      {xPct:0.115, yPct:0.0828, wPct:0.755, hPct:0.2411},
      {xPct:0.115, yPct:0.4306, wPct:0.755, hPct:0.2406}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#7a1414',
    subColor: 'rgba(0,0,0,0)'
  },

  hbdPurple: {
    label: '🍦 HBD Naffa Ungu',
    url: 'assets/photobooth/2.png',
    slotsSingle: [{xPct:0.1386, yPct:0.2445, wPct:0.7214, hPct:0.151}],
    slotsStrip: [
      {xPct:0.1386, yPct:0.2445, wPct:0.7214, hPct:0.151},
      {xPct:0.1386, yPct:0.407, wPct:0.7214, hPct:0.1505},
      {xPct:0.1386, yPct:0.57, wPct:0.7214, hPct:0.1505},
      {xPct:0.1386, yPct:0.732, wPct:0.7214, hPct:0.151}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#3d2554',
    subColor: 'rgba(0,0,0,0)'
  },

  thanksTodayStrip: {
    label: '💙 Thanks for Today (Strip)',
    url: 'assets/photobooth/3.png',
    slotsSingle: [{xPct:0.1231, yPct:0.078, wPct:0.7553, hPct:0.2035}],
    slotsStrip: [
      {xPct:0.1231, yPct:0.078, wPct:0.7553, hPct:0.2035},
      {xPct:0.1231, yPct:0.325, wPct:0.7553, hPct:0.2025},
      {xPct:0.1231, yPct:0.571, wPct:0.7553, hPct:0.2025}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#f5d94e',
    subColor: 'rgba(0,0,0,0)'
  },

  pinkKawaii: {
    label: '🩷 Pink Kawaii',
    url: 'assets/photobooth/4.png',
    slotsSingle: [{xPct:0.1895, yPct:0.0755, wPct:0.6223, hPct:0.2725}],
    slotsStrip: [
      {xPct:0.1895, yPct:0.0755, wPct:0.6223, hPct:0.2725},
      {xPct:0.1895, yPct:0.364, wPct:0.6223, hPct:0.2725},
      {xPct:0.1895, yPct:0.6515, wPct:0.6195, hPct:0.2725}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#5a2a52',
    subColor: 'rgba(0,0,0,0)'
  },

  waxSealStripe: {
    label: '📜 Wax Seal Stripe',
    url: 'assets/photobooth/5.png',
    slotsSingle: [{xPct:0.0917, yPct:0.0361, wPct:0.8167, hPct:0.1961}],
    slotsStrip: [
      {xPct:0.0917, yPct:0.0361, wPct:0.8167, hPct:0.1961},
      {xPct:0.0917, yPct:0.2511, wPct:0.8167, hPct:0.1967},
      {xPct:0.0917, yPct:0.4667, wPct:0.8167, hPct:0.1967},
      {xPct:0.0917, yPct:0.6828, wPct:0.8167, hPct:0.1961}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#f5f0e0',
    subColor: 'rgba(0,0,0,0)'
  },

  denimFilm: {
    label: '🎞️ Caught on Film',
    url: 'assets/photobooth/6.png',
    slotsSingle: [{xPct:0.1183, yPct:0.0617, wPct:0.7633, hPct:0.1828}],
    slotsStrip: [
      {xPct:0.1183, yPct:0.0617, wPct:0.7633, hPct:0.1828},
      {xPct:0.1183, yPct:0.2728, wPct:0.7633, hPct:0.1828},
      {xPct:0.1183, yPct:0.4839, wPct:0.7633, hPct:0.1828},
      {xPct:0.1183, yPct:0.695, wPct:0.7633, hPct:0.1828}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#2b3a52',
    subColor: 'rgba(0,0,0,0)'
  },

  scrapNotebook: {
    label: '📎 Scrapbook Notebook',
    url: 'assets/photobooth/7.png',
    slotsSingle: [{xPct:0.245, yPct:0.0244, wPct:0.7383, hPct:0.2456}],
    slotsStrip: [
      {xPct:0.245, yPct:0.0244, wPct:0.7383, hPct:0.2456},
      {xPct:0.245, yPct:0.2878, wPct:0.7383, hPct:0.2456},
      {xPct:0.245, yPct:0.5511, wPct:0.7383, hPct:0.2456}
    ],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#2a2a2a',
    subColor: 'rgba(0,0,0,0)'
  },

  polaroidBday: {
    label: '🖤 Polaroid Birthday',
    url: 'assets/photobooth/8.png',
    slotsSingle: [{xPct:0.1306, yPct:0.0156, wPct:0.737, hPct:0.2854}],
    slotsStrip: [
      {xPct:0.1306, yPct:0.0156, wPct:0.737, hPct:0.2854},
      {xPct:0.1296, yPct:0.3531, wPct:0.7398, hPct:0.2901},
      {xPct:0.1315, yPct:0.6943, wPct:0.7361, hPct:0.2859}
    ],
    captionPct: {xPct:0.5, yPct:0.335},
    textColor: '#8a1a1a',
    subColor: 'rgba(0,0,0,0)'
  },

  blankBday: {
    label: '🤍 Simple Happy Birthday',
    url: 'assets/photobooth/9.png',
    slotsSingle: [{xPct:0.0417, yPct:0.0859, wPct:0.9167, hPct:0.7444}],
    slotsStrip: [],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#1a1a1a',
    subColor: 'rgba(0,0,0,0)'
  },

  igPost: {
    label: '📱 Instagram Naffa',
    url: 'assets/photobooth/10.png',
    slotsSingle: [{xPct:0.2509, yPct:0.2778, wPct:0.4991, hPct:0.462}],
    slotsStrip: [],
    captionPct: {xPct:0.5, yPct:0.965},
    textColor: '#ffffff',
    subColor: 'rgba(0,0,0,0)'
  },

  cuteMeme: {
    label: '😸 Cute Meme Collage',
    url: 'assets/photobooth/11.png',
    slotsSingle: [{xPct:0.0783, yPct:0.0322, wPct:0.3433, hPct:0.2167}],
    slotsStrip: [
      {xPct:0.0783, yPct:0.0322, wPct:0.3433, hPct:0.2167},
      {xPct:0.0783, yPct:0.2706, wPct:0.3433, hPct:0.2167},
      {xPct:0.0783, yPct:0.5083, wPct:0.3433, hPct:0.2167},
      {xPct:0.0783, yPct:0.7456, wPct:0.3433, hPct:0.2167}
    ],
    captionPct: {xPct:0.72, yPct:0.5},
    textColor: '#5a3a10',
    subColor: 'rgba(0,0,0,0)'
  },
};



// Otomatis menambahkan tombol pilihan untuk tiap entri di PB_CUSTOM_TEMPLATES —
// tidak perlu sentuh HTML sama sekali, cukup isi objek di atas.
document.addEventListener('DOMContentLoaded', pbRenderTemplateCarousel);
const _pbImgCache={};
function pbLoadImage(url){
  if(_pbImgCache[url]) return _pbImgCache[url];
  const p=new Promise(function(resolve,reject){
    const img=new Image();
    img.crossOrigin='anonymous'; // perlu supaya canvas tidak "tainted" saat diekspor ke PNG
    img.onload=function(){ resolve(img); };
    img.onerror=function(){ reject(new Error('Gagal memuat template: '+url)); };
    img.src=url;
  });
  _pbImgCache[url]=p;
  return p;
}

// ===== PREFETCH TEMPLATE DI LATAR BELAKANG =====
// Dipanggil begitu pengunjung masuk stage Celebration (s11), beberapa detik sebelum
// dia sampai ke bilik foto. Memuat template satu-satu (bukan sekaligus) lewat
// requestIdleCallback supaya tidak berebut bandwidth/CPU dengan hal lain yang lagi
// jalan (musik, animasi) — begitu pengunjung benar-benar pilih sebuah template,
// kemungkinan besar sudah ada di cache dan langsung muncul instan.
let _pbPrefetchStarted=false;
function pbPrefetchAllTemplates(){
  if(_pbPrefetchStarted) return;
  _pbPrefetchStarted=true;
  const keys=Object.keys(PB_CUSTOM_TEMPLATES);
  let i=0;
  function loadNext(){
    if(i>=keys.length) return;
    const url=PB_CUSTOM_TEMPLATES[keys[i]].url;
    i++;
    pbLoadImage(url).catch(function(){}).then(function(){
      if(window.requestIdleCallback) requestIdleCallback(loadNext,{timeout:2000});
      else setTimeout(loadNext,250);
    });
  }
  if(window.requestIdleCallback) requestIdleCallback(loadNext,{timeout:2000});
  else setTimeout(loadNext,250);
}

// Begitu pengunjung geser carousel, template tetangga kiri/kanan langsung
// dipancing dimuat juga — biasanya itu tujuan geseran berikutnya.
function pbPrefetchNeighbors(){
  if(!PB_TEMPLATE_KEYS.length) return;
  [pbTemplateIndex-1, pbTemplateIndex+1].forEach(function(i){
    const key=PB_TEMPLATE_KEYS[((i%PB_TEMPLATE_KEYS.length)+PB_TEMPLATE_KEYS.length)%PB_TEMPLATE_KEYS.length];
    const tpl=PB_CUSTOM_TEMPLATES[key];
    if(tpl) pbLoadImage(tpl.url).catch(function(){});
  });
}

// Sebagian template dibuat dengan slot foto berupa KOTAK PUTIH SOLID (bukan lubang
// transparan asli) — misalnya diekspor dari Canva tanpa background dihapus. Fungsi ini
// mengubah semua piksel yang mendekati putih murni jadi transparan, supaya bisa dipakai
// dengan cara compose yang sama (foto ditaruh dulu, template ditimpa di atas).
const _pbWhiteKeyCache={};
async function pbWhiteKeyImage(img, threshold){
  threshold = threshold || 245;
  if(_pbWhiteKeyCache[img.src]) return _pbWhiteKeyCache[img.src];
  const c=document.createElement('canvas');
  c.width=img.naturalWidth; c.height=img.naturalHeight;
  const cctx=c.getContext('2d');
  cctx.drawImage(img,0,0);
  const id=cctx.getImageData(0,0,c.width,c.height);
  const d=id.data;
  for(let i=0;i<d.length;i+=4){
    if(d[i]>threshold && d[i+1]>threshold && d[i+2]>threshold && d[i+3]>200){
      d[i+3]=0;
    }
  }
  cctx.putImageData(id,0,0);
  _pbWhiteKeyCache[img.src]=c;
  return c;
}

// Menempatkan foto (object-fit: cover, dipotong rapi biar tidak gepeng) ke dalam
// satu slot rectangle, lalu template PNG ditimpa di atasnya.
function pbDrawCoverImage(ctx, img, x, y, w, h){
  const ir=img.width/img.height, tr=w/h;
  let sx,sy,sw,sh;
  if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; }
  else{ sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)/2; }
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
}

async function pbComposeCustomTemplate(photos, tpl, mode){
  const rawImg=await pbLoadImage(tpl.url);
  const img = tpl.whiteKey ? await pbWhiteKeyImage(rawImg) : rawImg;
  const W=img.naturalWidth||img.width, H=img.naturalHeight||img.height;
  const out=document.createElement('canvas');
  out.width=W; out.height=H;
  const ctx=out.getContext('2d');

  let slots = (mode==='strip' && tpl.slotsStrip && tpl.slotsStrip.length) ? tpl.slotsStrip : tpl.slotsSingle;
  // Kalau strip diminta tapi templatenya cuma mendukung 1 slot, foto pertama saja yang dipakai.
  const usable = photos.slice(0, slots.length);
  usable.forEach(function(photoCanvas,i){
    const s=slots[i];
    pbDrawCoverImage(ctx, photoCanvas, s.xPct*W, s.yPct*H, s.wPct*W, s.hPct*H);
  });

  ctx.drawImage(img,0,0,W,H); // PNG template ditimpa di atas — bagian transparannya menampilkan foto

  const capPct = tpl.captionPct || {xPct:0.5, yPct:0.95};
  return {
    canvas: out,
    meta: {
      captionY: capPct.yPct*H,
      labelY: H-14,
      textColor: tpl.textColor||'#2a2a2a',
      subColor: tpl.subColor||'rgba(42,42,42,.6)',
      centerX: capPct.xPct*W
    }
  };
}

const PB_FRAME_CONFIG={
  polaroid:   {padSide:22, padTop:22, padBottom:70, bg:'#FFFDF7', textColor:'#4a3a28', subColor:'#9a8060'},
  flower:     {padSide:26, padTop:26, padBottom:78, bg:'#FFFDF7', textColor:'#4a3a28', subColor:'#9a8060'},
  gold:       {padSide:32, padTop:32, padBottom:84, bg:'#1c140c', textColor:'#F6CB7A', subColor:'rgba(246,203,122,.55)'},
  minimal:    {padSide:14, padTop:14, padBottom:50, bg:'#FFFDF7', textColor:'#4a3a28', subColor:'#9a8060'},
  starrynight:{padSide:30, padTop:30, padBottom:80, bg:'#141b30', textColor:'#e8d9a8', subColor:'rgba(232,217,168,.5)'},
  herbarium:  {padSide:28, padTop:28, padBottom:90, bg:'#e9dcc0', textColor:'#5a4326', subColor:'#8a7550'},
  filmstrip:  {padSide:36, padTop:20, padBottom:56, bg:'#0c0c0c', textColor:'#FBF3DE', subColor:'rgba(251,243,222,.5)'},
  watercolor: {padSide:26, padTop:26, padBottom:76, bg:'#fbf7ef', textColor:'#4a3a28', subColor:'#9a8060'},
  moonlight:  {padSide:28, padTop:28, padBottom:80, bg:'#171226', textColor:'#e8dcff', subColor:'rgba(232,220,255,.5)'},
  scrapbook:  {padSide:24, padTop:24, padBottom:76, bg:'#fdf9f0', textColor:'#4a3a28', subColor:'#9a8060'},
  royal:      {padSide:34, padTop:34, padBottom:88, bg:'#3a1220', textColor:'#F6CB7A', subColor:'rgba(246,203,122,.55)'},
  confetti:   {padSide:24, padTop:24, padBottom:78, bg:'#fdf9f0', textColor:'#4a3a28', subColor:'#9a8060'},
  newsprint:  {padSide:24, padTop:78, padBottom:72, bg:'#f2ede0', textColor:'#1a1a1a', subColor:'#6b6b6b'},
  vinylside:  {padSide:22, padTop:22, padBottom:66, padLeft:118, bg:'#FFFDF7', textColor:'#4a3a28', subColor:'#9a8060'},
  denimpatch: {padSide:30, padTop:30, padBottom:82, bg:'#2b3a52', textColor:'#FBF3DE', subColor:'rgba(251,243,222,.55)'},
  bluepass:   {padSide:22, padTop:64, padBottom:74, bg:'#123166', textColor:'#ffffff', subColor:'rgba(255,255,255,.6)'}
};

async function pbComposeFinal(photos, frameName, mode){
  // Kalau frameName cocok dengan salah satu template custom yang didaftarkan di
  // PB_CUSTOM_TEMPLATES (lihat definisinya di bawah), pakai jalur PNG custom.
  if(PB_CUSTOM_TEMPLATES[frameName]){
    return pbComposeCustomTemplate(photos, PB_CUSTOM_TEMPLATES[frameName], mode);
  }

  const pw=photos[0].width, ph=photos[0].height;
  const gap=mode==='strip'?10:0;
  const stackH = photos.length*ph + (photos.length-1)*gap;
  const cfg=PB_FRAME_CONFIG[frameName]||PB_FRAME_CONFIG.polaroid;
  const padSide=cfg.padSide, padTop=cfg.padTop, padBottom=cfg.padBottom;
  const padLeft = (cfg.padLeft!==undefined) ? cfg.padLeft : padSide;
  const padRight = (cfg.padRight!==undefined) ? cfg.padRight : padSide;

  const out=document.createElement('canvas');
  out.width=pw+padLeft+padRight;
  out.height=padTop+stackH+padBottom;
  const ctx=out.getContext('2d');
  ctx.fillStyle=cfg.bg;
  ctx.fillRect(0,0,out.width,out.height);

  const geo={padSide:padSide,padLeft:padLeft,padRight:padRight,padTop:padTop,pw:pw,ph:ph,stackH:stackH,outW:out.width,outH:out.height,gap:gap,shots:photos.length};

  // Dekorasi latar (di BAWAH foto) untuk bingkai bertema gelap/bertekstur
  pbDecorateFrame(ctx, frameName, geo, 'under');

  photos.forEach(function(p,i){
    const y=padTop+i*(ph+gap);
    ctx.drawImage(p,padLeft,y,pw,ph);
    if(mode==='strip'&&i<photos.length-1){
      ctx.fillStyle=cfg.bg;
      ctx.fillRect(padLeft,y+ph,pw,gap);
    }
  });

  // Dekorasi di ATAS foto (border, ornamen sudut, taburan elemen dekoratif)
  pbDecorateFrame(ctx, frameName, geo, 'over');

  return {
    canvas: out,
    meta: {
      captionY: padTop+stackH+38,
      labelY: out.height-16,
      textColor: cfg.textColor,
      subColor: cfg.subColor,
      centerX: out.width/2
    }
  };
}

// Menulis caption + label ke atas SALINAN pbFinalBase (bukan canvas aslinya),
// supaya bisa diunduh berkali-kali dengan caption berbeda tanpa numpuk teks lama.
function pbDownload(){
  if(!pbFinalBase||!pbCaptionMeta) return;
  const caption=(document.getElementById('pb-caption').value||'').trim();
  const out=document.createElement('canvas');
  out.width=pbFinalBase.width; out.height=pbFinalBase.height;
  const ctx=out.getContext('2d');
  ctx.drawImage(pbFinalBase,0,0);
  ctx.textAlign='center';
  if(caption){
    ctx.font='italic 21px Georgia, serif';
    ctx.fillStyle=pbCaptionMeta.textColor;
    ctx.fillText(caption,pbCaptionMeta.centerX,pbCaptionMeta.captionY);
  }
  ctx.font='10px monospace';
  ctx.fillStyle=pbCaptionMeta.subColor;
  ctx.fillText('TAMAN BULAN NAFFA · 23 JANUARI',pbCaptionMeta.centerX,pbCaptionMeta.labelY);

  out.toBlob(function(blob){
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='taman-bulan-naffa-'+Date.now()+'.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},4000);
  },'image/png');
}

// BLOOM
function bloom(x,y,col){for(let i=0;i<14;i++){const d=document.createElement('div');d.className='bdot';const a=(i/14)*Math.PI*2,dist=35+Math.random()*55,sz=Math.random()*6+3;d.style.cssText=`left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${col};--dx:${Math.cos(a)*dist}px;--dy:${Math.sin(a)*dist}px;--dur:${.5+Math.random()*.4}s;margin-left:-${sz/2}px;margin-top:-${sz/2}px;border-radius:${Math.random()>.5?'50%':'30%'};`;document.body.appendChild(d);setTimeout(()=>d.remove(),1000);}}

// PROGRESS
function initProg(){const d=document.getElementById('pdots');d.innerHTML='';STAGES.forEach((_,i)=>{const p=document.createElement('div');p.className='pdot'+(i===0?' active':'');p.id='pd'+i;d.appendChild(p);});updProg(0);document.getElementById('phud').style.opacity='1';if(window._nmIsRevisit){initWelcomeBack();}else{runTerm();}}
function updProg(i){STAGES.forEach((_,j)=>{const p=document.getElementById('pd'+j);if(!p)return;p.className='pdot'+(j<i?' done':j===i?' active':'');});document.getElementById('plbl').textContent=(i+1)+'/'+STAGES.length;sendPresence(STAGES[i],i);}

// ===== LIVE PRESENCE — dipakai tab "Live" di chat.html untuk lihat posisi stage Naffa =====
// (bukan isi tulisan/pilihan privat — cuma stage mana yang sedang dibuka & kapan terakhir aktif)
let _curStageId=null,_curStageIdx=0;
function sendPresence(stageId,idx){
  _curStageId=stageId;_curStageIdx=idx;
  if(!window._db)return;
  try{
    window._db.collection('live_presence').doc('naffa').set({
      stageId:stageId,stageIdx:idx,total:STAGES.length,ts:new Date().toISOString()
    },{merge:true}).catch(function(){});
  }catch(e){}
}
setInterval(function(){if(_curStageId)sendPresence(_curStageId,_curStageIdx);},5000);

// PARALLAX
let mx=0,my=0,tx=0,ty=0;
const trkM=e=>{const cx=e.clientX||(e.touches&&e.touches[0].clientX)||0,cy=e.clientY||(e.touches&&e.touches[0].clientY)||0;tx=(window.innerWidth/2-cx)*.012;ty=(window.innerHeight/2-cy)*.012;};
window.addEventListener('mousemove',trkM);window.addEventListener('touchmove',trkM,{passive:true});
(function ploop(){mx+=(tx-mx)*.05;my+=(ty-my)*.05;document.querySelectorAll('.screen.active .gc,.screen.active .lscroll,.screen.active .rbg,.screen.active .ccard,.screen.active .capform,.screen.active .dgrid,.screen.active .tgrid2,.screen.active .phwrap,.screen.active .cstage,.screen.active .grow').forEach(el=>{el.style.transform=`translate3d(${mx}px,${my}px,0)`;});requestAnimationFrame(ploop);})();

// TERMINAL
let _termRan=false;
function runTerm(){if(_termRan)return;_termRan=true;
  const logs=[">> PINTU TAMAN DIGITAL SEDANG DIBUKA...",">> MENANAM KENANGAN UNTUK NAFFA FEBRY CORNELIA...",">> MENGHITUNG MUSIM — 20 TAHUN TELAH BERLALU...",">> MERANGKAI SIMFONI BUNGA DAN CAHAYA REMBULAN...",">> TAMAN SIAP. MENUNGGU LANGKAHMU YANG PERTAMA..."];
  const box=document.getElementById('tbox');box.innerHTML='';let li=0;
  function pl(){if(li<logs.length){let t=logs[li],ci=0;const d=document.createElement('div');box.appendChild(d);function tc(){if(ci<t.length){d.innerHTML+=t[ci++];box.scrollTop=box.scrollHeight;setTimeout(tc,9);}else{li++;setTimeout(pl,100);}}tc();}else document.getElementById('entbtn').style.display='inline-flex';}
  pl();
}

// S1→S2 — pintu taman terbuka, lagu langsung diputar & taman terbuka (stage pemilihan
// lagu terpisah sudah dihapus; lagu sekarang dipilih lewat dropdown playlist di HUD).
function goS2(){
  // Fullscreen HARUS dipicu sinkron di awal handler klik (bukan setelah await),
  // kalau tidak beberapa browser akan menolak permintaannya.
  try{
    var de=document.documentElement;
    if(!document.fullscreenElement){
      if(de.requestFullscreen) de.requestFullscreen().catch(function(){});
      else if(de.webkitRequestFullscreen) de.webkitRequestFullscreen();
    }
  }catch(e){}

  unlkA();

  const targetTrack=(function(){
    // Lagu pembuka default = About You, kecuali sudah pernah pilih lagu favorit
    // di stage Sertifikat sebelumnya (disimpan lewat localStorage 'nOpeningTrack').
    try{
      const saved=localStorage.getItem('nOpeningTrack');
      if(saved!==null){
        const idx=parseInt(saved,10);
        if(!isNaN(idx)&&idx>=0&&idx<TRACKS.length) return idx;
      }
    }catch(e){}
    return 0;
  })();
  go('s1','s2');
  const ready=Promise.race([
    swT(targetTrack),
    new Promise(function(resolve){ setTimeout(resolve,4000); })
  ]);
  ready.then(finish).catch(finish);
  function finish(){
    setTimeout(function(){
      initViz();
      document.getElementById('ahud').style.opacity='1';
      updNP(targetTrack);
      renderPlaylistMenu();
    },200);
  }
}

// HINTS
function showHint(s){sfx('tr');if(s===1){document.getElementById('h1').textContent="Petunjuk: 2⁵ = 32, dikurangi 12 = usia sakral Naffa hari ini.";document.getElementById('h1').style.color='var(--sage-lt)';}else{document.getElementById('h2').textContent="Petunjuk: Tahun kelahiran Naffa adalah 2007 (23 Januari 2007).";document.getElementById('h2').style.color='var(--rose-lt)';}}

// VERIFY
function verify1(){const a=document.getElementById('ca').value.trim();if(a==='20'){sfx('ok');miniConfetti();go('s2','s2b');}else{sfx('err');document.getElementById('ca').value='';showAlert('Coba hitung lagi ya! 🌸');}}
function verify2(){const a=document.getElementById('cb').value.trim();if(a==='2007'){sfx('ok');miniConfetti();startCD();go('s2b','scd');}else{sfx('err');document.getElementById('cb').value='';showAlert('Ingat-ingat lagi, kapan akar waktu itu ditanam? 🌿');}}

// COUNTDOWN
function startCD(){setBG('moon');if(cdInt)clearInterval(cdInt);cdInt=setInterval(()=>{const n=new Date(),yr=n.getFullYear()-BIRTH.getFullYear();let ann=new Date(BIRTH);ann.setFullYear(n.getFullYear());if(n<ann)ann.setFullYear(n.getFullYear()-1);const d=Math.floor((n-ann)/864e5);document.getElementById('cdy').textContent=String(yr).padStart(2,'0');document.getElementById('cdd').textContent=String(d).padStart(2,'0');document.getElementById('cdh').textContent=String(n.getHours()).padStart(2,'0');document.getElementById('cdm').textContent=String(n.getMinutes()).padStart(2,'0');document.getElementById('cds').textContent=String(n.getSeconds()).padStart(2,'0');document.getElementById('livems').textContent='TOTAL: '+(n-BIRTH).toLocaleString()+' MILIDETIK MEKAR';},1000);}

// TAROT — animasi "kocok & bagikan kartu" saat masuk stage, menggantikan grid statis
// yang langsung tampil diam. Cara kerja: tiap kartu digeser secara visual (transform,
// tanpa mengubah alur layout flex) ke titik tengah grid dengan rotasi acak & opacity 0,
// lalu dianimasikan mundur ke posisi aslinya satu per satu (efek kartu "dibagikan").
let _tarotDealing=false;
function tarotDealAnimation(){
  const grid=document.querySelector('#str .tgrid2');
  if(!grid||_tarotDealing)return;
  const cards=Array.from(grid.querySelectorAll('.tcard'));
  if(!cards.length)return;
  _tarotDealing=true;
  const gridRect=grid.getBoundingClientRect();
  const cx=gridRect.width/2, cy=gridRect.height/2;
  grid.style.pointerEvents='none';
  cards.forEach(function(c){
    const r=c.getBoundingClientRect();
    const left=r.left-gridRect.left, top=r.top-gridRect.top;
    const dx=(cx-r.width/2)-left, dy=(cy-r.height/2)-top;
    const rot=(Math.random()*56-28).toFixed(1);
    c.style.transition='none';
    c.style.transform='translate('+dx+'px,'+dy+'px) rotate('+rot+'deg) scale(.82)';
    c.style.opacity='0';
  });
  void grid.offsetWidth; // paksa reflow supaya transisi berikutnya benar-benar terpicu
  try{sfx('tr');}catch(e){}
  cards.forEach(function(c,i){
    setTimeout(function(){
      c.style.transition='transform .68s cubic-bezier(.16,.84,.28,1.05), opacity .45s ease';
      c.style.transform='translate(0,0) rotate(0deg) scale(1)';
      c.style.opacity='1';
      if(navigator.vibrate)navigator.vibrate(12);
    },240+i*95);
  });
  const total=240+cards.length*95+750;
  setTimeout(function(){
    cards.forEach(function(c){ c.style.transition=''; c.style.transform=''; c.style.opacity=''; });
    grid.style.pointerEvents='';
    _tarotDealing=false;
  },total);
}
function flipTarot(el){if(el.classList.contains('flipped'))return;if(document.querySelector('.tcard.flipped'))return;sfx('ok');el.classList.add('flipped');const r=el.getBoundingClientRect();bloom(r.left+r.width/2,r.top+r.height/2,'#F2B441');document.getElementById('ntarot').style.display='inline-flex';const shb=document.getElementById('strHintBtn');if(shb)shb.style.display='none';const shx=document.getElementById('strHintBox');if(shx)shx.style.display='none';const tfn=el.querySelector('.tfname'),th4=el.querySelector('h4');if(tfn&&th4)selTarot=tfn.textContent.trim()+' — '+th4.textContent.trim();document.querySelectorAll('.tcard').forEach(c=>{if(c!==el){c.style.opacity='.35';c.style.filter='grayscale(.6)';c.style.pointerEvents='none';c.style.transition='opacity .5s ease, filter .5s ease';}});}
function strShowHint(){const msgs=['Sentuh salah satu dari 6 kartu di atas untuk membaliknya!','Pilih kartu manapun — ikuti intuisimu. Tidak ada jawaban yang salah.','Sentuh kartu yang paling menarik perhatianmu saat ini.'];const hb=document.getElementById('strHintBox');if(hb){hb.textContent=msgs[Math.floor(Math.random()*msgs.length)];hb.style.display='block';}setTimeout(function(){if(hb)hb.style.display='none';},3000);}

// STAGE 6 — RACIK RAMUAN JIWA: drag & drop esensi bunga/hewan ke dalam toples.
// Ketuk cepat = "quick pick" (item terbang otomatis masuk toples), seret manual = drag
// & drop fisik. Keduanya berakhir di fungsi yang sama (phSelectItem).
let _phDrag=null;
function phInitDragDrop(){
  document.querySelectorAll('#sph .phopt').forEach(function(opt){
    if(opt._phBound) return; // hindari bind ganda tiap kali stage dibuka ulang
    opt._phBound=true;
    opt.addEventListener('pointerdown', phOnPointerDown);
  });
}
function phOnPointerDown(e){
  if(_phDrag) return;
  const opt=e.currentTarget;
  e.preventDefault();
  const rect=opt.getBoundingClientRect();
  const iconEl=opt.querySelector('.phico');
  const nameEl=opt.querySelector('.phtxt h4');
  const ghost=document.createElement('div');
  ghost.className='ph-drag-ghost';
  ghost.innerHTML='<div class="phico">'+(iconEl?iconEl.innerHTML:'')+'</div><div class="ph-drag-name">'+(nameEl?nameEl.textContent:'')+'</div>';
  ghost.style.left=rect.left+'px';
  ghost.style.top=rect.top+'px';
  ghost.style.width=rect.width+'px';
  document.body.appendChild(ghost);
  requestAnimationFrame(function(){ ghost.classList.add('active'); });
  opt.style.opacity='.32';
  opt.style.pointerEvents='none';
  _phDrag={ghost:ghost, opt:opt, startLeft:rect.left, startTop:rect.top, offX:e.clientX-rect.left, offY:e.clientY-rect.top, moved:false};
  window.addEventListener('pointermove', phOnPointerMove);
  window.addEventListener('pointerup', phOnPointerUp);
  window.addEventListener('pointercancel', phOnPointerUp);
}
function phOnPointerMove(e){
  if(!_phDrag) return;
  e.preventDefault();
  const d=_phDrag;
  const nx=e.clientX-d.offX, ny=e.clientY-d.offY;
  if(Math.abs(nx-d.startLeft)>4||Math.abs(ny-d.startTop)>4) d.moved=true;
  d.ghost.style.transform='translate('+(nx-d.startLeft)+'px,'+(ny-d.startTop)+'px) scale(1.05) rotate(-3deg)';
  const jar=document.getElementById('phJar');
  if(jar){
    const jr=jar.getBoundingClientRect();
    const over=e.clientX>jr.left-24&&e.clientX<jr.right+24&&e.clientY>jr.top-24&&e.clientY<jr.bottom+24;
    jar.classList.toggle('ph-jar-hover', over);
  }
}
function phOnPointerUp(e){
  if(!_phDrag) return;
  window.removeEventListener('pointermove', phOnPointerMove);
  window.removeEventListener('pointerup', phOnPointerUp);
  window.removeEventListener('pointercancel', phOnPointerUp);
  const d=_phDrag; _phDrag=null;
  const jar=document.getElementById('phJar');
  if(jar) jar.classList.remove('ph-jar-hover');
  const jr=jar?jar.getBoundingClientRect():null;
  const droppedOnJar = jr && e.clientX>jr.left-30&&e.clientX<jr.right+30&&e.clientY>jr.top-30&&e.clientY<jr.bottom+30;
  const opt=d.opt;
  const type=opt.id.indexOf('fl')===0 ? 'f' : 'a';
  const value=opt.getAttribute('data-value')||'';
  if(!d.moved || droppedOnJar){
    // tap ringan tanpa gerak (quick pick) ATAU berhasil dilepas tepat di atas toples
    phFlyIntoJar(d.ghost, jr, function(){ d.ghost.remove(); opt.style.opacity=''; opt.style.pointerEvents=''; });
    phSelectItem(type, value, opt.id, opt);
  } else {
    d.ghost.style.transition='transform .45s cubic-bezier(.34,1.4,.4,1)';
    d.ghost.style.transform='translate(0,0) scale(1) rotate(0deg)';
    setTimeout(function(){ d.ghost.remove(); opt.style.opacity=''; opt.style.pointerEvents=''; },460);
  }
}
function phFlyIntoJar(ghost, jarRect, cb){
  if(!jarRect){ cb&&cb(); return; }
  const gr=ghost.getBoundingClientRect();
  const targetX=(jarRect.left+jarRect.width/2)-gr.width/2;
  const targetY=(jarRect.top+jarRect.height/2)-gr.height/2;
  const curLeft=parseFloat(ghost.style.left)||gr.left, curTop=parseFloat(ghost.style.top)||gr.top;
  ghost.style.transition='transform .4s cubic-bezier(.3,.6,.2,1), opacity .4s ease .15s';
  ghost.style.transform='translate('+(targetX-curLeft)+'px,'+(targetY-curTop)+'px) scale(.25) rotate(12deg)';
  ghost.style.opacity='0';
  setTimeout(cb, 420);
}
function phSelectItem(t, v, id, srcEl){
  sfx('tr');
  const icon=srcEl?srcEl.querySelector('.phico'):null;
  if(t==='f'){
    selF=v;
    ['fl1','fl2','fl3','fl4'].forEach(function(i){ const e=document.getElementById(i); if(e) e.classList.remove('selected'); });
    document.getElementById(id).classList.add('selected');
    const slot=document.getElementById('phSlotF');
    if(slot){ slot.innerHTML=icon?icon.innerHTML:''; slot.classList.add('filled'); }
  } else {
    selA=v;
    ['an1','an2','an3','an4'].forEach(function(i){ const e=document.getElementById(i); if(e) e.classList.remove('selected'); });
    document.getElementById(id).classList.add('selected');
    const slot=document.getElementById('phSlotA');
    if(slot){ slot.innerHTML=icon?icon.innerHTML:''; slot.classList.add('filled'); }
  }
  const jar=document.getElementById('phJar');
  if(selF&&selA){
    document.getElementById('nphilo').style.display='inline-flex';
    if(jar){
      jar.classList.add('ph-jar-ready');
      const r=jar.getBoundingClientRect();
      bloom(r.left+r.width/2, r.top+r.height/2, '#F2B441');
    }
  }
}
document.addEventListener('DOMContentLoaded', phInitDragDrop);
function confirmPhilo(){sfx('ok');document.getElementById('cflval').textContent='Esensi Bunga: '+selF;document.getElementById('canval').textContent='Esensi Hewan: '+selA;go('sph','s3');}

// STAGE 7 — SAPU KARTU JATI DIRI: swipe ala Tinder menggantikan tombol pilihan.
// Geser kiri = lepaskan, geser kanan = terima. Menolak keyakinan salah / menerima
// jati diri sejati = aksi benar (kartu terbang pergi/lanjut); sebaliknya = shake+error.
const SWIPE_CARDS_TEMPLATE = ''
  +'<div class="swipe-card" data-correct="0"><div class="swipe-card-txt">Aku memilih berjalan dalam keraguan dan ketakutan yang terus menghantui</div><div class="swipe-tag swipe-tag-l">LEPASKAN</div><div class="swipe-tag swipe-tag-r">TERIMA</div></div>'
  +'<div class="swipe-card" data-correct="0"><div class="swipe-card-txt">Aku memilih menetap di tempat yang nyaman dan tidak pernah bertumbuh</div><div class="swipe-tag swipe-tag-l">LEPASKAN</div><div class="swipe-tag swipe-tag-r">TERIMA</div></div>'
  +'<div class="swipe-card" data-correct="1"><div class="swipe-card-txt">Aku adalah perempuan luar biasa, tangguh, mandiri, dan layak atas segala kebahagiaan yang paling indah</div><div class="swipe-tag swipe-tag-l">LEPASKAN</div><div class="swipe-tag swipe-tag-r">TERIMA</div></div>';
let _swipeDrag=null;
function s3ResetSwipeStack(){
  const stack=document.getElementById('swipeStack');
  if(!stack) return;
  stack.innerHTML=SWIPE_CARDS_TEMPLATE;
  const cards=Array.from(stack.children);
  for(let i=cards.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=cards[i]; cards[i]=cards[j]; cards[j]=t; }
  cards.forEach(function(c){ stack.appendChild(c); });
  s3InitSwipe();
}
function s3InitSwipe(){
  const stack=document.getElementById('swipeStack');
  if(!stack) return;
  stack.querySelectorAll('.swipe-card').forEach(function(card){
    if(card._swBound) return;
    card._swBound=true;
    card.addEventListener('pointerdown', s3OnPointerDown);
  });
}
function s3ActiveCard(){
  const stack=document.getElementById('swipeStack');
  if(!stack) return null;
  return stack.querySelector('.swipe-card');
}
function s3OnPointerDown(e){
  if(_swipeDrag) return;
  const card=e.currentTarget;
  if(card!==s3ActiveCard()) return;
  card.setPointerCapture(e.pointerId);
  card.classList.add('dragging');
  _swipeDrag={card:card, startX:e.clientX, startY:e.clientY, dx:0};
  card.addEventListener('pointermove', s3OnPointerMove);
  card.addEventListener('pointerup', s3OnPointerUp);
  card.addEventListener('pointercancel', s3OnPointerUp);
}
function s3OnPointerMove(e){
  if(!_swipeDrag) return;
  const d=_swipeDrag;
  d.dx=e.clientX-d.startX;
  const dy=(e.clientY-d.startY)*0.4;
  const rot=d.dx*0.06;
  d.card.style.transform='translate('+d.dx+'px,'+dy+'px) rotate('+rot+'deg)';
  const tagL=d.card.querySelector('.swipe-tag-l'), tagR=d.card.querySelector('.swipe-tag-r');
  const t=Math.min(1, Math.abs(d.dx)/90);
  if(tagL) tagL.style.opacity = d.dx<0 ? t : 0;
  if(tagR) tagR.style.opacity = d.dx>0 ? t : 0;
}
function s3OnPointerUp(){
  if(!_swipeDrag) return;
  const d=_swipeDrag; _swipeDrag=null;
  d.card.classList.remove('dragging');
  d.card.removeEventListener('pointermove', s3OnPointerMove);
  d.card.removeEventListener('pointerup', s3OnPointerUp);
  d.card.removeEventListener('pointercancel', s3OnPointerUp);
  const THRESH=85;
  if(d.dx>THRESH) s3ResolveSwipe(d.card,'right');
  else if(d.dx<-THRESH) s3ResolveSwipe(d.card,'left');
  else {
    d.card.style.transition='transform .35s cubic-bezier(.3,.7,.3,1.1)';
    d.card.style.transform='translate(0,0) rotate(0deg)';
    const tagL=d.card.querySelector('.swipe-tag-l'), tagR=d.card.querySelector('.swipe-tag-r');
    if(tagL) tagL.style.opacity=0;
    if(tagR) tagR.style.opacity=0;
    setTimeout(function(){ d.card.style.transition=''; },360);
  }
}
function swipeActiveCard(dir){
  const card=s3ActiveCard();
  if(card) s3ResolveSwipe(card, dir);
}
function s3ResolveSwipe(card, dir){
  const isCorrectStatement = card.getAttribute('data-correct')==='1';
  const rightAction = (dir==='left' && !isCorrectStatement) || (dir==='right' && isCorrectStatement);
  const tagL=card.querySelector('.swipe-tag-l'), tagR=card.querySelector('.swipe-tag-r');
  if(rightAction){
    sfx('ok');
    if(navigator.vibrate) navigator.vibrate(dir==='right'?[40,30,90]:30);
    card.style.transition='transform .55s cubic-bezier(.2,.7,.3,1), opacity .5s ease';
    const flyX = dir==='right' ? window.innerWidth : -window.innerWidth;
    card.style.transform='translate('+flyX+'px,-40px) rotate('+(dir==='right'?28:-28)+'deg)';
    card.style.opacity='0';
    if(tagL) tagL.style.opacity = dir==='left'?1:0;
    if(tagR) tagR.style.opacity = dir==='right'?1:0;
    if(isCorrectStatement){
      const r=card.getBoundingClientRect();
      bloom(r.left+r.width/2, r.top+r.height/2, '#7FAE6A');
      gateOpenFX();
      setTimeout(function(){ card.remove(); },560);
      setTimeout(()=>go('s3','s3b'),1450);
    } else {
      setTimeout(function(){ card.remove(); },560);
    }
  } else {
    sfx('err');
    if(navigator.vibrate) navigator.vibrate([30,20,30]);
    card.style.transition='transform .4s cubic-bezier(.36,.07,.19,.97)';
    card.style.transform='translate(0,0) rotate(0deg)';
    card.classList.add('snap-error');
    setTimeout(function(){ card.classList.remove('snap-error'); card.style.transition=''; },520);
    if(tagL) tagL.style.opacity=0;
    if(tagR) tagR.style.opacity=0;
    const msg = isCorrectStatement
      ? 'Jangan lepaskan dirimu yang sesungguhnya — sapu ke KANAN untuk menerimanya 🌸'
      : 'Taman ini mendeteksi kekuatanmu jauh melampaui ini — sapu ke KIRI untuk melepaskannya 🌸';
    showAlert(msg);
  }
}
document.addEventListener('DOMContentLoaded', s3ResetSwipeStack);

// Kilau cahaya penuh layar — dipakai saat identitas sejati diterima (stage 7)
// maupun saat gelar takdir terkunci (stage 8)
function gateOpenFX(){
  const ov=document.createElement('div');
  ov.className='gate-open-fx';
  ov.innerHTML='<div class="gate-open-txt">✦ GERBANG TERBUKA ✦</div>';
  document.body.appendChild(ov);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('show'); }); });
  setTimeout(function(){ ov.classList.remove('show'); },1050);
  setTimeout(function(){ ov.remove(); },1650);
}

// RANGKUMAN PERJALANAN — merangkai pilihan tarot + esensi bunga/hewan jadi satu
// kalimat begitu gelar takdir dipilih, supaya pilihan-pilihan sebelumnya (str/sph)
// terasa berbuah, bukan sekadar checklist yang lewat begitu saja.
function _synthExtractName(str){ if(!str) return ''; const i=str.indexOf(' ('); return i>-1 ? str.substring(0,i).trim() : str.trim(); }
function _synthExtractTrait(str){ if(!str) return ''; const m=str.match(/\(([^)]+)\)/); return m ? m[1].trim() : ''; }
function buildJourneySynthesis(){
  const flowerName=_synthExtractName(selF)||'bunga jiwa';
  const flowerTrait=_synthExtractTrait(selF);
  const animalName=_synthExtractName(selA)||'hewan jiwa';
  const animalTrait=_synthExtractTrait(selA);
  let tarotName='rembulan';
  if(selTarot){ const parts=selTarot.split('—'); tarotName=(parts[1]||parts[0]||tarotName).trim(); }
  const destinyName=selD||'The Wildflower Sovereign';
  return 'Di bawah naungan <em>'+tarotName+'</em>, jiwamu bersemayam dalam '
    +(flowerTrait?'kelembutan '+flowerTrait.toLowerCase()+' seperti ':'kelembutan ')+'<em>'+flowerName+'</em>'
    +' dan '+(animalTrait?animalTrait.toLowerCase()+' seorang ':'semangat ')+'<em>'+animalName+'</em>'
    +'. Maka resmi kau menyandang gelar <strong>'+destinyName+'</strong> — perjalanan menuju dekade keduamu dimulai dari sini ✦';
}
function pickDest(t,id){
  sfx('ok');selD=t;
  document.querySelectorAll('.dcard').forEach(c=>c.classList.remove('selected'));
  document.getElementById(id).classList.add('selected');
  document.getElementById('npath').style.display='inline-flex';
  document.getElementById('cdyntitle').textContent='[ '+t+' ]';
  document.getElementById('dynbadge').textContent=t;
  const syn=document.getElementById('destinySynthesis');
  if(syn){
    syn.classList.remove('show');
    syn.innerHTML=buildJourneySynthesis();
    void syn.offsetWidth;
    setTimeout(function(){ syn.classList.add('show'); },260);
  }
}

// STAGE 8 — SOROT CAHAYA BERPUTAR: roulette sorotan menggantikan klik kartu langsung.
// "Putar" mulai siklus cepat berpindah antar 3 kartu; "Hentikan" memicu deselerasi
// menuju hasil acak lalu mengunci pilihan (memanggil pickDest yang sama seperti klik
// langsung, jadi klik kartu manapun tetap berfungsi sebagai pilihan cepat/manual).
let _spotlightInt=null, _spotlightIdx=0, _spotlightBusy=false;
function spotlightSetActive(idx){
  document.querySelectorAll('#destinyGrid .dcard').forEach(function(c,i){ c.classList.toggle('spotlight-active', i===idx); });
}
function spotlightStart(){
  if(_spotlightBusy) return;
  _spotlightBusy=true;
  sfx('tr');
  const grid=document.getElementById('destinyGrid');
  if(grid) grid.style.pointerEvents='none';
  const spinBtn=document.getElementById('spotlightSpinBtn'), stopBtn=document.getElementById('spotlightStopBtn');
  if(spinBtn) spinBtn.style.display='none';
  if(stopBtn) stopBtn.style.display='inline-flex';
  _spotlightIdx=0;
  spotlightSetActive(_spotlightIdx);
  if(_spotlightInt) clearInterval(_spotlightInt);
  _spotlightInt=setInterval(function(){
    _spotlightIdx=(_spotlightIdx+1)%3;
    spotlightSetActive(_spotlightIdx);
    if(navigator.vibrate) navigator.vibrate(8);
  },110);
}
function spotlightStop(){
  if(!_spotlightInt) return;
  clearInterval(_spotlightInt);
  _spotlightInt=null;
  const stopBtn=document.getElementById('spotlightStopBtn');
  if(stopBtn) stopBtn.style.display='none';
  const target=Math.floor(Math.random()*3);
  const delays=[90,120,150,190,240,300,380];
  let cur=_spotlightIdx;
  const steps=[];
  for(let i=0;i<delays.length;i++){ cur=(cur+1)%3; steps.push(cur); }
  while(steps[steps.length-1]!==target){ cur=(cur+1)%3; steps.push(cur); delays.push(420); }
  let acc=0;
  steps.forEach(function(idx,i){
    acc+=delays[i]||420;
    setTimeout(function(){
      spotlightSetActive(idx);
      try{sfx('tr');}catch(e){}
      if(navigator.vibrate) navigator.vibrate(10);
      if(i===steps.length-1) setTimeout(function(){ spotlightLockIn(idx); },260);
    },acc);
  });
}
function spotlightLockIn(idx){
  const cards=document.querySelectorAll('#destinyGrid .dcard');
  cards.forEach(function(c){ c.classList.remove('spotlight-active'); });
  const card=cards[idx];
  if(!card){ _spotlightBusy=false; return; }
  card.classList.add('spotlight-locked');
  setTimeout(function(){ card.classList.remove('spotlight-locked'); },900);
  sfx('win');
  if(navigator.vibrate) navigator.vibrate([50,30,90]);
  const r=card.getBoundingClientRect();
  bloom(r.left+r.width/2, r.top+r.height/2, '#F2B441');
  pickDest(card.dataset.title, card.id);
  const grid=document.getElementById('destinyGrid');
  if(grid) grid.style.pointerEvents='';
  const spinBtn=document.getElementById('spotlightSpinBtn');
  if(spinBtn){ spinBtn.style.display='inline-flex'; spinBtn.textContent='✦ Putar Ulang Sorotan'; }
  _spotlightBusy=false;
}

// CINEMATIC
const PTXTS=["Dua puluh tahun bukanlah sekadar angka —\nitu adalah ribuan pagi yang kamu pilih untuk bangkit.","Setiap versi dirimu yang pernah ada\ntelah membawa kamu ke titik yang tepat ini.","Dan kamu, Naffa,\nadalah karya paling nyata yang pernah semesta ciptakan."];
// startCin defined below with grass init
function showPT(i){const m=document.getElementById('pmain'),n=document.getElementById('pname');if(!m)return;m.style.opacity='0';if(n)n.style.opacity='0';setTimeout(()=>{if(i>=PTXTS.length)return;m.innerHTML=PTXTS[i].replace(/\n/g,'<br>');m.style.opacity='1';if(i===PTXTS.length-1&&n){setTimeout(()=>{n.textContent='— N A F F A   F E B R Y   C O R N E L I A';n.style.opacity='1';},600);}if(i<PTXTS.length-1)ptmr=setTimeout(()=>showPT(i+1),4200);},400);}
function endCin(){if(ptmr){clearTimeout(ptmr);ptmr=null;}if(panim){clearTimeout(panim);panim=null;}['cskip','pmain','pname'].forEach(id=>{const e=document.getElementById(id);if(e){e.style.opacity='0';if(e.tagName==='BUTTON')e.style.pointerEvents='none';}});setBG('rose');go('sci','spz');}

// S7, S8
function goS8(){setBG('letter');go('srh','s8');trigLetter();}
function trigLetter(){
  const lyrEl=document.getElementById('lyrline'),lyrs=[{t:600,tx:'"I know you\'re somewhere in the world..."'},{t:5000,tx:'"There\'s something about you..."'},{t:9200,tx:'"That I will never forget."'}];
  lyrs.forEach(l=>setTimeout(()=>{lyrEl.style.opacity='0';setTimeout(()=>{lyrEl.textContent=l.tx;lyrEl.style.opacity='1';},300);},l.t));
  const paras=["Naffa, hari ini aku cuma mau merayakan dirimu. Merayakan setiap langkah yang sudah kamu ambil sampai di titik ini, setiap usaha yang kadang capek tapi tetap kamu jalani, dan dirimu yang terus bertumbuh jadi lebih baik dari waktu ke waktu. Rasanya masih ingat betul dulu kita main bareng dari kecil, dan sekarang melihat kamu tumbuh sejauh ini, ada rasa bangga yang susah dijelasin. Kamu pantas dirayakan, hari ini dan seterusnya.","Aku memang tidak tahu detail kesibukanmu sehari-hari, tapi dari jauh aku selalu berharap kamu baik-baik saja, bahkan lebih dari sekadar baik-baik saja. Semoga setiap harimu selalu ada hal kecil yang bikin kamu senyum tanpa alasan jelas, entah itu secangkir minuman favoritmu yang pas banget rasanya, obrolan hangat sama orang yang kamu sayang sampai lupa waktu, atau sekadar langit sore yang kebetulan bagus dan bikin hati tenang. Semoga kamu selalu dikelilingi orang-orang yang benar-benar ada buat kamu, yang mendengarkan tanpa menghakimi, dan yang tetap tinggal di saat-saat yang tidak mudah.","Kalau ada hari yang terasa berat dan segalanya kayak numpuk jadi satu, semoga kamu ingat kamu sudah melewati banyak hal sebelumnya, dan setiap kali kamu selalu berhasil melewatinya, meskipun waktu itu kamu mungkin merasa tidak akan sanggup. Kamu jauh lebih kuat dari yang kamu kira, dan lebih dari cukup dari yang pernah kamu ragukan tentang dirimu sendiri. Semoga kamu tidak pernah terlalu keras sama diri sendiri. Semoga kamu bisa istirahat tanpa rasa bersalah, bisa menangis tanpa merasa harus terlihat kuat terus, dan bisa bangkit lagi dengan ritme dan caramu sendiri, tidak perlu terburu-buru.","Untuk kuliahmu, semoga setiap ilmu yang kamu pelajari terasa bermakna, bukan sekadar tugas yang harus diselesaikan. Semoga usaha-usahamu, sekecil apa pun, selalu berujung pada hasil yang sepadan. Semoga kamu dikelilingi teman-teman yang baik dan suportif, yang ikut senang atas pencapaianmu tanpa iri, dan semoga cita-citamu pelan-pelan menemukan jalannya satu per satu, meskipun mungkin tidak selalu sesuai rencana awal. Jangan menyerah di tengah jalan, karena kamu punya lebih dari cukup untuk sampai ke tujuan yang kamu inginkan.","Semoga ke depannya kamu selalu diberi kesehatan yang cukup untuk menjalani semua rencana dan mimpimu, ketenangan yang tidak goyah oleh hal-hal kecil, dan kebahagiaan yang bukan cuma kelihatan bahagia dari luar, tapi benar-benar kamu rasakan sampai ke dalam hati. Semoga setiap doa yang pernah kamu panjatkan diam-diam, yang mungkin cuma kamu dan Tuhan yang tahu, dijawab dengan cara yang paling indah dan pas waktu. Dan di mana pun kamu berada nanti, apa pun yang sedang kamu jalani, semoga kamu selalu menemukan alasan untuk tetap bersyukur dan terus melangkah maju, sekecil apa pun langkah itu.","Oh iya, Sedikit doa kecil dariku semoga kamu nggak pernah kehujanan pas keluar rumah tanpa bawa payung. Semoga lampu merah selalu berubah hijau tepat saat kamu lewat, jadi nggak perlu buru-buru. Semoga kelingkingmu nggak pernah kejedot meja lagi seumur hidup. Semoga makanan yang kamu pesan selalu enak dan porsinya pas, nggak kurang nggak lebih. Semoga kamu nggak pernah lupa naruh kunci di mana, dan baterai hp-mu nggak pernah habis di saat yang paling nggak tepat. Semoga kamu selalu dapat tempat duduk waktu naik kendaraan umum, meskipun lagi rame-ramenya. Dan semoga hal-hal kecil yang biasanya bikin hari kamu jadi kesel itu jarang-jarang menghampirimu, karena kamu memang sudah layak dapat hari yang tenang dan menyenangkan setiap harinya.","Hadiah ini mungkin sederhana, dan mungkin bukan sesuatu yang mewah. Tapi ini hadiah pertama yang pernah aku buat sendiri untukmu, dibuat pelan-pelan dan sepenuh hati, dari sahabat kecilmu."];
  window._letterParas = paras;
  window._letterSkipped = false;
  // Tampilkan tombol skip setelah 3 detik
  setTimeout(function(){ var sb=document.getElementById('skip-letter-btn'); if(sb&&!window._letterSkipped) sb.style.display='block'; }, 3000);
  const cont=document.getElementById('lparas');cont.innerHTML='';let pi=0,ci=0;
  setTimeout(()=>{
    let cp=document.createElement('div');cp.className='lpara';cont.appendChild(cp);
    function ty(){if(pi<paras.length){if(ci<paras[pi].length){cp.innerHTML+=paras[pi][ci++];const lb=document.getElementById('lbox');lb.scrollTop=lb.scrollHeight;if(!window._letterSkipped)setTimeout(ty,22);}else{pi++;ci=0;if(pi<paras.length){cp=document.createElement('div');cp.className='lpara';cont.appendChild(cp);const lb=document.getElementById('lbox');lb.scrollTop=lb.scrollHeight;if(!window._letterSkipped)setTimeout(ty,350);}else{document.getElementById('lsig').style.opacity='1';const sh=document.getElementById('scroll-hint');if(sh)sh.style.opacity='0';setTimeout(()=>{const lb=document.getElementById('lbox');lb.scrollTop=lb.scrollHeight;document.getElementById('nfl').style.display='inline-flex';const sb=document.getElementById('skip-letter-btn');if(sb)sb.style.display='none';},800);}}}
    }ty();
  },11500);
}

// FUTURE LETTER
// ===== SURAT KE 2030 — UNDUH SEBAGAI PDF =====
// Menggantikan fitur "Buku Kenangan" (dihapus). Ambil isi surat dari
// localStorage ('nfl', diisi saat Naffa menyegel surat di sealFL()) lalu
// susun jadi PDF satu halaman yang bisa disimpan.
function downloadSuratPDF(){
  let raw=null;
  try{raw=localStorage.getItem('nfl');}catch(e){}
  if(!raw){showAlert('Surat ke 2030 belum pernah diisi di perangkat ini 🌿');return;}
  let data=null;
  try{data=JSON.parse(raw);}catch(e){}
  if(!data||!data.syukur){showAlert('Isi surat tidak ditemukan / rusak 🌿');return;}
  if(typeof window.jspdf==='undefined'){showAlert('Gagal memuat pembuat PDF, coba lagi ✦');return;}
  sfx('ok');
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth();
  const marginX=56;
  let y=90;

  doc.setFont('times','italic');
  doc.setFontSize(11);
  doc.setTextColor(150,120,60);
  doc.text('✦ TAMAN BULAN', W/2, y, {align:'center'});
  y+=28;

  doc.setFont('times','normal');
  doc.setFontSize(24);
  doc.setTextColor(40,30,20);
  doc.text('Surat ke 2030', W/2, y, {align:'center'});
  y+=22;

  doc.setFont('times','italic');
  doc.setFontSize(11);
  doc.setTextColor(120,110,100);
  const writtenDate=data.writtenAt?new Date(data.writtenAt).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'-';
  doc.text('Ditulis '+writtenDate+'  ·  dibuka '+(data.openAt||'2030-01-01'), W/2, y, {align:'center'});
  y+=14;
  doc.setDrawColor(200,170,110);
  doc.line(marginX, y, W-marginX, y);
  y+=36;

  const section=(label,text)=>{
    doc.setFont('helvetica','bold');
    doc.setFontSize(10);
    doc.setTextColor(160,90,90);
    doc.text(label.toUpperCase(), marginX, y);
    y+=18;
    doc.setFont('times','normal');
    doc.setFontSize(13);
    doc.setTextColor(35,30,25);
    const lines=doc.splitTextToSize(text||'-', W-marginX*2);
    doc.text(lines, marginX, y);
    y+=lines.length*18+26;
  };

  section('Aku bersyukur karena...', data.syukur);
  section('Sebelum aku berusia 23, aku ingin...', data.tujuan);
  section('Pesan untuk Naffa 2030...', data.pesan);

  doc.setFont('times','italic');
  doc.setFontSize(10);
  doc.setTextColor(150,150,150);
  doc.text('Taman Bulan · Naffa Birthday Experience', W/2, 800, {align:'center'});

  doc.save('surat-ke-2030-naffa.pdf');
}

async function sealFL(){
  const clean=v=>v.replace(/<[^>]*>/g,'').substring(0,200);
  const s=clean((document.getElementById('fls').value||'').trim()),t=clean((document.getElementById('flt').value||'').trim()),p=clean((document.getElementById('flp').value||'').trim());
  if(!s||!t||!p){showAlert('Isi ketiga bagian surat dulu ya! 🌿');return;}
  const btn=document.querySelector('#flform button');if(btn){btn.disabled=true;btn.textContent='Menyegel...';}
  sfx('ok');if(navigator.vibrate)navigator.vibrate([40,20,40,20,80]);
  const data={syukur:s,tujuan:t,pesan:p,recipient:'Naffa Febry Cornelia',writtenAt:new Date().toISOString(),openAt:'2030-01-01'};
  localStorage.setItem('nfl',JSON.stringify(data));
  try{if(window._db)await window._db.collection('future_letters').add({...data,device:navigator.userAgent.substring(0,80)});}catch(e){}
  if(typeof pbNotify==='function') pbNotify('Naffa menyegel Surat ke 2030 ✦', '', false);
  // Isi lengkap (syukur/tujuan/pesan) SENGAJA tidak lagi diteruskan ke
  // Telegram — baca isinya lewat tab "Surat ke 2030" di chat.html.
  const frm=document.getElementById('flform');frm.style.transition='opacity .5s,transform .5s';frm.style.opacity='0';frm.style.transform='scale(.95)';
  setTimeout(()=>{frm.style.display='none';const su=document.getElementById('flsuc');su.style.display='flex';su.style.opacity='0';su.style.transition='opacity .6s';setTimeout(()=>su.style.opacity='1',50);bloom(window.innerWidth/2,window.innerHeight/2,'#E8604C');},500);
}

// GIFTS
function openG(id,label,ico){const b=document.getElementById(id);if(b.classList.contains('opened'))return;sfx('ok');b.classList.add('opened');b.innerHTML=`<div class="gico"><svg viewBox="0 0 32 32" width="28" height="28" fill="none"><circle cx="16" cy="16" r="13" fill="rgba(127,174,106,.2)" stroke="#7FAE6A" stroke-width="1.5"/><path d="M10 16 L14 20 L22 12" stroke="#B2CEA6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="glbl" style="color:var(--sage-lt);">${label}</div>`;const r=b.getBoundingClientRect();bloom(r.left+r.width/2,r.top+r.height/2,'#7FAE6A');openedG++;if(openedG===3)setTimeout(()=>document.getElementById('n9b').style.display='inline-flex',400);}
function go9b(){
  setBG('moon');
  go('s9','s9b');
  setTimeout(initWebGLFlowers,900);
}

// FIGURE PARTICLE — hujan kelopak & cahaya keemasan turun perlahan, murni suasana (tanpa membentuk objek)
let figDone2=false, figClickCount=0, wglAnimId=null, wglInited=false, wglCleanupFns=[];

// TAMAN BUNGA WEBGL — klik/ketuk layar untuk menumbuhkan bunga di titik yang disentuh.
// Sumber shader: "Draw With WebGL Flowers" oleh Ksenia Kondrashova (MIT License),
// diintegrasikan sebagai stage interaktif pengganti animasi sulur sebelumnya.
function initWebGLFlowers(){
  const canvasEl=document.getElementById('wglflowers');
  if(!canvasEl)return;
  figDone2=false; figClickCount=0;
  const bar=document.getElementById('asmbar'),lbl=document.getElementById('asmpct'),hint=document.getElementById('wgl-hint');
  if(bar)bar.style.width='0%'; if(lbl)lbl.textContent='🌸 0/20 BUNGA';
  const aw=document.getElementById('asmwrap'); if(aw)aw.style.display='';
  const nb=document.getElementById('n9c'); if(nb)nb.style.display='none';
  if(hint)hint.style.opacity='1';
  cleanWGL(); // jaga-jaga kalau stage ini dimasuki ulang

  import('https://esm.sh/three@0.133.1/build/three.module.js').then(function(THREE){
    const pointer={x:.5,y:.5,clicked:false};
    let basicMaterial,shaderMaterial;
    const renderer=new THREE.WebGLRenderer({canvas:canvasEl,alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);
    const sceneShader=new THREE.Scene(),sceneBasic=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,10);
    const clock=new THREE.Clock();
    let renderTargets=[
      new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight),
      new THREE.WebGLRenderTarget(window.innerWidth,window.innerHeight)
    ];

    function createPlane(){
      shaderMaterial=new THREE.ShaderMaterial({
        uniforms:{
          u_stop_time:{type:'f',value:0.},
          u_stop_randomizer:{type:'v2',value:new THREE.Vector2(Math.random(),Math.random())},
          u_cursor:{type:'v2',value:new THREE.Vector2(pointer.x,pointer.y)},
          u_ratio:{type:'f',value:window.innerWidth/window.innerHeight},
          u_texture:{type:'t',value:null},
          u_clean:{type:'f',value:1.}
        },
        vertexShader:document.getElementById('wgl-vertex-shader').textContent,
        fragmentShader:document.getElementById('wgl-fragment-shader').textContent
      });
      // basicMaterial ini hanya dipakai di tahap TERAKHIR — menampilkan hasil render
      // (renderTargets) ke layar/canvas asli. Isi tekstur dari shaderMaterial di atas
      // bersifat "premultiplied" (warna sudah dikalikan cakupan/alpha-nya, karena teksturnya
      // juga dipakai ulang sebagai buffer akumulasi jejak bunga tiap frame — lihat komentar
      // di wgl-fragment-shader). Makanya di sini dipasang CustomBlending dengan faktor sumber
      // ONE (bukan SRC_ALPHA bawaan) supaya tidak "digandakan" peredupannya saat dicampur ke
      // latar belakang — ini yang memperbaiki tepian bunga yang tadinya terlihat kehitaman,
      // tanpa mengubah/mengganggu perhitungan warna di dalam shader (yang sensitif kalau
      // diubah karena teksturnya dipakai berulang sebagai umpan balik antar frame).
      basicMaterial=new THREE.MeshBasicMaterial({
        transparent:true,
        blending:THREE.CustomBlending,
        blendEquation:THREE.AddEquation,
        blendSrc:THREE.OneFactor,
        blendDst:THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha:THREE.OneFactor,
        blendDstAlpha:THREE.OneMinusSrcAlphaFactor
      });
      const geo=new THREE.PlaneGeometry(2,2);
      sceneBasic.add(new THREE.Mesh(geo,basicMaterial));
      sceneShader.add(new THREE.Mesh(geo,shaderMaterial));
    }
    function updateSize(){
      shaderMaterial.uniforms.u_ratio.value=window.innerWidth/window.innerHeight;
      renderer.setSize(window.innerWidth,window.innerHeight);
    }
    function render(){
      shaderMaterial.uniforms.u_clean.value=1.;
      shaderMaterial.uniforms.u_texture.value=renderTargets[0].texture;
      if(pointer.clicked){
        shaderMaterial.uniforms.u_cursor.value=new THREE.Vector2(pointer.x,1-pointer.y);
        shaderMaterial.uniforms.u_stop_randomizer.value=new THREE.Vector2(Math.random(),Math.random());
        shaderMaterial.uniforms.u_stop_time.value=0.;
        pointer.clicked=false;
      }
      shaderMaterial.uniforms.u_stop_time.value+=clock.getDelta();
      renderer.setRenderTarget(renderTargets[1]);
      renderer.render(sceneShader,camera);
      basicMaterial.map=renderTargets[1].texture;
      renderer.setRenderTarget(null);
      renderer.render(sceneBasic,camera);
      const tmp=renderTargets[0];renderTargets[0]=renderTargets[1];renderTargets[1]=tmp;
      wglAnimId=requestAnimationFrame(render);
    }

    createPlane();
    updateSize();
    render();

    function onResize(){updateSize();}
    window.addEventListener('resize',onResize);

    function growAt(nx,ny){
      pointer.x=nx; pointer.y=ny; pointer.clicked=true;
      if(figDone2)return;
      figClickCount++;
      const pct=Math.min(100,Math.round((figClickCount/20)*100));
      if(bar)bar.style.width=pct+'%';
      if(lbl)lbl.textContent='🌸 '+Math.min(figClickCount,20)+'/20 BUNGA';
      if(hint&&figClickCount===1)hint.style.opacity='0';
      if(figClickCount>=20&&!figDone2){
        figDone2=true;
        if(aw)aw.style.display='none';
        setTimeout(function(){const nb2=document.getElementById('n9c');if(nb2)nb2.style.display='inline-flex';},700);
      }
    }
    function onClick(e){growAt(e.clientX/window.innerWidth,e.clientY/window.innerHeight);}
    function onTouch(e){if(!e.targetTouches||!e.targetTouches[0])return;growAt(e.targetTouches[0].clientX/window.innerWidth,e.targetTouches[0].clientY/window.innerHeight);}
    canvasEl.addEventListener('click',onClick);
    canvasEl.addEventListener('touchstart',onTouch,{passive:true});

    wglCleanupFns.push(function(){
      window.removeEventListener('resize',onResize);
      canvasEl.removeEventListener('click',onClick);
      canvasEl.removeEventListener('touchstart',onTouch);
      if(wglAnimId){cancelAnimationFrame(wglAnimId);wglAnimId=null;}
      try{renderTargets[0].dispose();renderTargets[1].dispose();}catch(e){}
      try{renderer.dispose();}catch(e){}
    });
    wglInited=true;
  }).catch(function(err){
    console.error('Gagal memuat taman bunga WebGL:',err);
    // fallback: langsung tampilkan tombol lanjut supaya alur tidak buntu
    figDone2=true;
    const aw2=document.getElementById('asmwrap');if(aw2)aw2.style.display='none';
    const nb3=document.getElementById('n9c');if(nb3)nb3.style.display='inline-flex';
  });
}

function cleanWGL(){
  wglCleanupFns.forEach(function(fn){try{fn();}catch(e){}});
  wglCleanupFns=[];
  wglInited=false;
  if(wglAnimId){cancelAnimationFrame(wglAnimId);wglAnimId=null;}
}

// UNIVERSE STARS
function initUStar(){const uc=document.getElementById('usc');if(!uc)return;uc.width=window.innerWidth;uc.height=window.innerHeight;const ctx=uc.getContext('2d'),stars=[];for(let i=0;i<150;i++)stars.push({x:Math.random()*uc.width,y:Math.random()*uc.height,r:Math.random()*1.2+.3,sp:Math.random()*.003+.001,ph:Math.random()*Math.PI*2});function ul(){ctx.clearRect(0,0,uc.width,uc.height);const now=Date.now()*.001;stars.forEach(s=>{const a=.3+Math.sin(now*s.sp*10+s.ph)*.25;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(250,240,220,${Math.max(0,a)})`;ctx.fill();s.y-=s.sp*.5;if(s.y<0)s.y=uc.height;});uAnim=requestAnimationFrame(ul);}ul();}

// WISH


// CANDLE
// goS10 defined below with cake canvas init
function resetFlames(){['fb2','fg2','fb0','fg0'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('blown');});}
function execBlow(){
  sfx('ok');
  if(navigator.vibrate)navigator.vibrate([80,40,80,40,200]);
  // Tandai blown di elemen CSS (untuk overlay lilin di luar canvas)
  ['fb2','fg2','fb0','fg0'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('blown');});

  // Padamkan api di canvas satu per satu dengan jeda
  const fl = window._cakeFlames;
  if(fl && fl.length){
    fl.forEach((f, i) => {
      setTimeout(() => {
        f.blown = true;
        f.blowProg = 0;
        // Percikan terakhir sebelum padam
        f._lastSpark = true;
        setTimeout(() => { f._lastSpark = false; }, 300);
      }, i * 180);
    });
  }

  // Overlay gelap masuk setelah api mulai padam
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(16,30,51,0);z-index:999;pointer-events:none;transition:background 2.2s ease;';
  document.body.appendChild(ov);
  setTimeout(()=>{ ov.style.background='rgba(16,30,51,.72)'; }, 350);

  if(micStr){micStr.getTracks().forEach(t=>t.stop());micStr=null;}
  micOn=false;
  if(window._micMuteWatch){clearInterval(window._micMuteWatch);window._micMuteWatch=null;}
  if(typeof resumeAfterMic==='function')resumeAfterMic();
  document.getElementById('micst').style.display='none';
  setTimeout(()=>{ov.remove();setBG('gold');go('s10','s11');if(typeof pbPrefetchAllTemplates==='function')pbPrefetchAllTemplates();},2800);
}

// MIC
function requestMicThenStart(){
  var gate=document.getElementById('mic-gate');
  var btn=gate?gate.querySelector('button'):null;

  // Cek protokol — getUserMedia tidak bisa di file://
  if(window.location.protocol==='file:'){
    if(gate)gate.innerHTML=`
      <div style="background:rgba(242,180,65,.08);border:1px solid rgba(242,180,65,.25);border-radius:14px;padding:14px 20px;max-width:320px;text-align:center;">
        <p style="font-family:'Space Mono',monospace;font-size:.6rem;color:var(--gold);letter-spacing:1px;margin-bottom:8px;">⚠ MIKROFON TIDAK TERSEDIA</p>
        <p style="font-family:'Josefin Sans',sans-serif;font-size:.75rem;color:rgba(255,253,247,.6);line-height:1.6;margin-bottom:10px;">File ini dibuka langsung (file://).<br>Chrome memblokir mikrofon di luar server.<br><br>Gunakan tombol di bawah untuk meniup lilin.</p>
        <button onclick="blowManual()" style="font-family:'Space Mono',monospace;font-size:.65rem;letter-spacing:2px;padding:10px 24px;background:linear-gradient(135deg,rgba(242,180,65,.3),rgba(232,96,76,.3));border:1px solid rgba(242,180,65,.5);border-radius:30px;color:var(--gold-lt);cursor:pointer;">✦ Tiup Lilin Sekarang!</button>
      </div>`;
    return;
  }

  // Protokol OK — coba getUserMedia
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    if(gate)gate.innerHTML=`<p style="font-family:'Space Mono',monospace;font-size:.58rem;color:rgba(232,96,76,.6);letter-spacing:1px;text-align:center;">browser tidak mendukung mikrofon.<br>ketuk kue untuk meniup.</p>`;
    return;
  }

  if(btn){btn.textContent='⏳ meminta izin...';btn.disabled=true;btn.style.opacity='0.6';}

  navigator.mediaDevices.getUserMedia({audio:true,video:false})
    .then(function(stream){
      if(gate)gate.style.display='none';
      if(micStr)micStr.getTracks().forEach(function(t){t.stop();});
      micStr=stream;
      var mc=new(window.AudioContext||window.webkitAudioContext)();
      mc.resume().then(function(){
        var ms=mc.createMediaStreamSource(stream);
        micAnl=mc.createAnalyser();micAnl.fftSize=1024;
        var hp=mc.createBiquadFilter();hp.type='highpass';hp.frequency.setValueAtTime(100,mc.currentTime);
        var lp=mc.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(800,mc.currentTime);
        ms.connect(hp);hp.connect(lp);lp.connect(micAnl);
        micData=new Uint8Array(micAnl.frequencyBinCount);
        micOn=true;
        document.getElementById('micst').style.display='flex';
        var bl=30,cs=[],cal=true;
        function gv(){micAnl.getByteFrequencyData(micData);var s=0;for(var i=3;i<=30;i++)s+=micData[i];return s/28;}
        setTimeout(function(){bl=cs.length?cs.reduce(function(a,b){return a+b;})/cs.length:20;cal=false;},1000);
        var bc=0,act=true;
        function cb(){
          if(!act)return;
          var v=gv();
          if(cal){cs.push(v);}
          else if(micOn){
            // Threshold dinaikkan & butuh tiupan yang lebih konsisten agar tidak ke-trigger suara latar/napas tipis
            var th=Math.max(95,bl*3.2);
            if(v>th){bc++;if(bc>14){act=false;execBlow();}}
            else{bc=Math.max(0,bc-2);}
          }
          requestAnimationFrame(cb);
        }
        cb();
      });
    })
    .catch(function(err){
      var msg='';
      if(err.name==='NotAllowedError'||err.name==='PermissionDeniedError'){
        msg='Izin ditolak. Ketuk gambar kue untuk meniup.';
      } else if(err.name==='NotFoundError'){
        msg='Mikrofon tidak ditemukan. Ketuk gambar kue untuk meniup.';
      } else {
        msg='Mikrofon tidak bisa diakses. Ketuk gambar kue untuk meniup.';
      }
      if(gate)gate.innerHTML=`
        <p style="font-family:'Space Mono',monospace;font-size:.58rem;color:rgba(232,96,76,.6);letter-spacing:1px;text-align:center;line-height:1.8;">${msg}</p>
        <button onclick="blowManual()" style="font-family:'Space Mono',monospace;font-size:.62rem;letter-spacing:2px;padding:10px 24px;background:transparent;border:1px solid rgba(242,180,65,.4);border-radius:30px;color:var(--gold-lt);cursor:pointer;margin-top:4px;">✦ Tiup Lilin Sekarang!</button>`;
    });
}
function initMic(){if(micOn||!navigator.mediaDevices)return;setBG('cake');navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false}).then(str=>{if(micStr)micStr.getTracks().forEach(t=>t.stop());micStr=str;const mc=new(window.AudioContext||window.webkitAudioContext)(),ms=mc.createMediaStreamSource(str);micAnl=mc.createAnalyser();micAnl.fftSize=1024;const hp=mc.createBiquadFilter();hp.type='highpass';hp.frequency.setValueAtTime(100,mc.currentTime);const lp=mc.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(800,mc.currentTime);const gn=mc.createGain();gn.gain.setValueAtTime(3.5,mc.currentTime);ms.connect(hp);hp.connect(lp);lp.connect(gn);gn.connect(micAnl);micData=new Uint8Array(micAnl.frequencyBinCount);micOn=true;if(typeof pauseForMic==='function')pauseForMic();
    if(window._micMuteWatch)clearInterval(window._micMuteWatch);
    window._micMuteWatch=setInterval(function(){
      if(!micOn){clearInterval(window._micMuteWatch);return;}
      if(am&&!am.paused&&am.volume>0.001){am._muteForMic=true;am.volume=0;}
    },250);
    var gate2=document.getElementById('mic-gate');if(gate2)gate2.style.display='none';document.getElementById('micst').style.display='flex';let bl=30,cs=[],cal=true;function gv(){micAnl.getByteFrequencyData(micData);let s=0;for(let i=3;i<=30;i++)s+=micData[i];return s/28;}setTimeout(()=>{bl=cs.length?cs.reduce((a,b)=>a+b)/cs.length:20;cal=false;},1000);let bc=0,act=true;function cb(){if(!act)return;const v=gv();if(cal){cs.push(v);}else if(micOn){const th=Math.max(38,bl*1.5);
    // Visual: api lilin merespons volume tiupan — perbesar flicker dan miringkan
    const norm=Math.min(1,Math.max(0,(v-Math.max(10,bl))/(th)));
    if(window._cakeFlames&&norm>0.1){window._cakeFlames.forEach(function(f){if(!f.blown){
      // Tambah distorsi ke phase agar api terlihat tertiup
      f.phase+=norm*(Math.random()-0.5)*0.8;
    }});}
    if(v>th){bc++;if(bc>=5){act=false;execBlow();return;}}else bc=Math.max(0,bc-1);}requestAnimationFrame(cb);}cb();}).catch(()=>{});}

// CELEBRATE
function showBloom(col){sfx('ok');for(let i=0;i<20;i++)setTimeout(()=>bloom(Math.random()*window.innerWidth,Math.random()*window.innerHeight*.7,col),i*45);}

// S13 CERT
function goS13(){
  setBG('cert');sfx('tr');
  if(navigator.vibrate)navigator.vibrate([60,30,60,30,120]);
  const t=document.getElementById('s13');
  if(t){t.classList.add('active');setTimeout(()=>confetti(),600);}
  bonusUnlocked=true;
  try{
    const firstTime=!localStorage.getItem('nbu');
    localStorage.setItem('nbu','1');
    if(firstTime){
      localStorage.setItem('nfirstcert', new Date().toISOString());
      if(typeof pbNotify==='function') pbNotify('Naffa menyelesaikan seluruh perjalanan! 🎉', '', false);
    }
    // Snapshot pilihan-pilihan sepanjang perjalanan — dipakai buku kenangan &
    // ditampilkan lagi kalau pengunjung balik lagi di lain waktu.
    localStorage.setItem('njourney', JSON.stringify({
      selF:selF, selA:selA, selD:selD, selTarot:selTarot,
      savedAt:new Date().toISOString()
    }));
  }catch(e){}
  const i=STAGES.indexOf('s13');if(i>=0)setTimeout(()=>updProg(i),800);
}

// ===== KUNJUNGAN ULANG (setelah hari-H) =====
function initWelcomeBack(){
  let visits=1;
  try{
    visits=parseInt(localStorage.getItem('nvisits')||'0',10)+1;
    localStorage.setItem('nvisits', String(visits));
  }catch(e){}
  const meta=document.getElementById('wb-meta');
  if(meta){
    let daysText='';
    try{
      const first=localStorage.getItem('nfirstcert');
      if(first){
        const days=Math.max(0, Math.floor((Date.now()-new Date(first).getTime())/86400000));
        daysText = days<=0 ? 'hari ini juga kamu menyelesaikan taman ini ✦' : ('sudah '+days+' hari sejak kamu menyelesaikan taman ini ✦');
      }
    }catch(e){}
    meta.textContent='Kunjungan ke-'+visits+(daysText?(' · '+daysText):'');
  }
  if(typeof pbNotify==='function') pbNotify('Naffa membuka taman lagi','kunjungan ke-'+visits);
}

// Memutar musik pembuka & menyalakan HUD tanpa melalui stage s1 — dipakai tombol-tombol
// pintasan di layar welcomeback supaya taman tetap terasa "hidup", bukan sunyi.
function pbWakeAmbience(){
  try{ swT(0); initViz(); document.getElementById('ahud').style.opacity='1'; }catch(e){}
}

function _wbRequestFullscreen(){
  try{
    var de=document.documentElement;
    if(!document.fullscreenElement){
      if(de.requestFullscreen) de.requestFullscreen().catch(function(){});
      else if(de.webkitRequestFullscreen) de.webkitRequestFullscreen();
    }
  }catch(e){}
}

function startFreshJourney(){
  _wbRequestFullscreen();
  document.documentElement.classList.remove('nm-revisit');
  document.getElementById('welcomeback').classList.remove('active');
  document.getElementById('s1').classList.add('active');
  runTerm();
  try{sfx('tr');}catch(e){}
}

function jumpToPhotobooth(){
  _wbRequestFullscreen();
  document.documentElement.classList.remove('nm-revisit');
  pbWakeAmbience();
  go('welcomeback','sphoto');
  setTimeout(initPhotobooth,600);
}

function jumpToCertificate(){
  _wbRequestFullscreen();
  document.documentElement.classList.remove('nm-revisit');
  pbWakeAmbience();
  go('welcomeback','s13');
  setTimeout(goS13,600);
}

// ===== BUKU KENANGAN OTOMATIS =====
// Menyusun satu gambar panjang berisi ringkasan perjalanan: esensi bunga & hewan,
// jalur takdir, kartu ramalan yang terbuka, dan foto photobooth (kalau ada) — lalu
// diunduh sebagai PNG. Sengaja TIDAK menyertakan isi Ruang Hujan (surat pelepasan),
// karena maksud bagian itu memang untuk dilepas, bukan diarsipkan.
async function generateMemoryBook(){
  let data={selF:selF, selA:selA, selD:selD, selTarot:selTarot};
  if(!data.selF && !data.selA && !data.selTarot){
    try{
      const saved=JSON.parse(localStorage.getItem('njourney')||'null');
      if(saved) data=saved;
    }catch(e){}
  }

  let photoImg=null;
  try{
    if(typeof pbFinalBase!=='undefined' && pbFinalBase){
      photoImg=pbFinalBase;
    } else {
      const savedPhoto=localStorage.getItem('nphotobooth');
      if(savedPhoto) photoImg=await pbLoadImage(savedPhoto);
    }
  }catch(e){}

  const W=800;
  let photoDrawW=0, photoDrawH=0, photoBlockH=0;
  if(photoImg){
    const iw=photoImg.naturalWidth||photoImg.width, ih=photoImg.naturalHeight||photoImg.height;
    photoDrawW=W-160;
    photoDrawH=photoDrawW*(ih/iw);
    photoBlockH=photoDrawH+60;
  }

  // Ukur dulu tinggi tiap seksi teks (biar kanvas final tidak kepotong/kelebihan blank)
  const measureCanvas=document.createElement('canvas');
  const mctx=measureCanvas.getContext('2d');
  function wrapLines(ctx,text,maxW){
    const words=String(text).split(' ');
    let line='',lines=[];
    words.forEach(function(w){
      const test=line+w+' ';
      if(ctx.measureText(test).width>maxW && line){ lines.push(line.trim()); line=w+' '; }
      else line=test;
    });
    if(line.trim()) lines.push(line.trim());
    return lines;
  }
  const sections=[
    {label:'ESENSI BUNGAMU', value:data.selF, color:'#E8604C'},
    {label:'ESENSI HEWANMU', value:data.selA, color:'#7FAE6A'},
    {label:'JALUR TAKDIRMU', value:data.selD, color:'#F2B441'},
    {label:'KARTU RAMALAN BULAN', value:data.selTarot, color:'#8a6ab0'}
  ].filter(function(s){ return !!s.value; });
  mctx.font="italic 22px Georgia, serif";
  let sectionsH=0;
  const sectionLines=sections.map(function(s){
    const lines=wrapLines(mctx,s.value,W-160);
    const h=34+lines.length*30+34;
    sectionsH+=h;
    return lines;
  });

  const headerH=210, footerH=70;
  const H=headerH+sectionsH+photoBlockH+footerH;
  const canvas=document.createElement('canvas');
  canvas.width=W; canvas.height=Math.max(H,420);
  const ctx=canvas.getContext('2d');

  const g=ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'#FFFDF7'); g.addColorStop(1,'#FBF3DE');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,canvas.height);
  ctx.strokeStyle='rgba(242,180,65,.4)'; ctx.lineWidth=2;
  ctx.strokeRect(20,20,W-40,canvas.height-40);

  ctx.textAlign='center';
  ctx.fillStyle='#4a3a28';
  ctx.font="italic 34px Georgia, serif";
  ctx.fillText('Taman Bulan Naffa', W/2, 90);
  ctx.font="12px monospace";
  ctx.fillStyle='#9a8060';
  ctx.fillText('BUKU KENANGAN PERJALANAN', W/2, 118);
  const dateStr=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
  ctx.font="11px monospace";
  ctx.fillText(dateStr, W/2, 140);
  ctx.strokeStyle='rgba(242,180,65,.3)';
  ctx.beginPath(); ctx.moveTo(80,168); ctx.lineTo(W-80,168); ctx.stroke();

  let y=headerH;
  sections.forEach(function(s,idx){
    const lines=sectionLines[idx];
    ctx.textAlign='center';
    ctx.font="11px monospace";
    ctx.fillStyle=s.color;
    ctx.fillText(s.label, W/2, y);
    ctx.font="italic 22px Georgia, serif";
    ctx.fillStyle='#3a2c1c';
    lines.forEach(function(l,i){ ctx.fillText(l, W/2, y+34+i*30); });
    y += 34+lines.length*30+34;
  });

  if(photoImg){
    const px=(W-photoDrawW)/2, py=y+10;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.25)'; ctx.shadowBlur=20; ctx.shadowOffsetY=8;
    ctx.fillStyle='#fff';
    ctx.fillRect(px-8,py-8,photoDrawW+16,photoDrawH+16);
    ctx.restore();
    ctx.drawImage(photoImg, px, py, photoDrawW, photoDrawH);
    y = py+photoDrawH+40;
  }

  ctx.textAlign='center';
  ctx.font="italic 15px Georgia, serif";
  ctx.fillStyle='#9a8060';
  ctx.fillText('Dengan cinta, dari taman yang selalu menunggumu mekar ✦', W/2, canvas.height-40);

  canvas.toBlob(function(blob){
    if(!blob) return;
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='buku-kenangan-taman-bulan-'+Date.now()+'.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},4000);
  },'image/png');
}

function jumpToMemoryBook(){
  try{sfx('win');}catch(e){}
  generateMemoryBook();
}

// CONFETTI
function confetti(){const c=document.getElementById('cconf');if(!c)return;c.style.display='block';c.width=window.innerWidth;c.height=window.innerHeight;const ctx=c.getContext('2d'),cols=['#E8604C','#F1A094','#F2B441','#F6CB7A','#7FAE6A','#B2CEA6','#5FAEDB','#FFFDF7'],ps=[];for(let i=0;i<160;i++)ps.push({x:Math.random()*c.width,y:-20-Math.random()*200,w:Math.random()*8+4,h:Math.random()*5+2.5,col:cols[Math.floor(Math.random()*cols.length)],vy:Math.random()*3.5+1.5,vx:Math.random()*2.5-1.25,rot:Math.random()*Math.PI*2,rs:(Math.random()-.5)*.12,al:1});let fr=0;function cl(){ctx.clearRect(0,0,c.width,c.height);fr++;ps.forEach(p=>{p.y+=p.vy;p.x+=p.vx+Math.sin(fr*.01+p.rot)*.4;p.rot+=p.rs;if(fr>100)p.al-=.007;if(p.y>c.height){p.y=-20;p.al=1;}ctx.save();ctx.globalAlpha=Math.max(0,p.al);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.col;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});if(fr<200)requestAnimationFrame(cl);else{ctx.clearRect(0,0,c.width,c.height);c.style.display='none';}}cl();}

// SAVE PNG
function claimVoucher(type){
  sfx('ok');
  const data = {
    makan: {title:'VOUCHER MAKAN', icon:'🍽️', desc:'Berlaku untuk satu kali traktiran makan bersama, kapan pun kamu mau menagihnya.', code:'MAKAN-NAFFA20', file:'Voucher_Makan_Naffa.png'},
    nonton:{title:'VOUCHER NONTON', icon:'🎬', desc:'Berlaku untuk satu kali nonton film pilihanmu, aku yang traktir tiketnya.', code:'NONTON-NAFFA20', file:'Voucher_Nonton_Naffa.png'},
    main:  {title:'VOUCHER MAIN',   icon:'🎮', desc:'Berlaku untuk satu kali sesi main apapun itu — aku temenin sekaligus bayarin.', code:'MAIN-NAFFA20', file:'Voucher_Main_Naffa.png'}
  }[type];
  if(!data) return;
  document.getElementById('vt-title').textContent = data.title;
  document.getElementById('vt-icon').textContent = data.icon;
  document.getElementById('vt-desc').textContent = data.desc;
  document.getElementById('vt-code').textContent = data.code;
  const ticket = document.getElementById('voucher-ticket');
  if(typeof html2canvas!=='undefined'){
    html2canvas(ticket,{backgroundColor:'#0C1626',scale:2,useCORS:false,logging:false}).then(cv=>{
      const a=document.createElement('a');
      a.download=data.file;
      a.href=cv.toDataURL('image/png');
      a.click();
      showAlert('Voucher berhasil diunduh! Simpan baik-baik ya ✦','🎁');
    }).catch(()=>showAlert('Gagal membuat voucher, coba lagi ya.','⚠️'));
  } else {
    showAlert('Gagal membuat voucher, coba lagi ya.','⚠️');
  }
  document.getElementById('voucher-modal').style.display='none';
}
function savePNG(){sfx('ok');const z=document.getElementById('pzone');if(!z){showAlert('Sertifikat belum siap.');return;}if(typeof html2canvas!=='undefined'){html2canvas(z,{backgroundColor:'#0C1626',scale:2,useCORS:false,logging:false}).then(cv=>{const a=document.createElement('a');a.download='Sertifikat_Naffa_20th.png';a.href=cv.toDataURL('image/png');a.click();}).catch(()=>window.print());}else window.print();}

// RESET
function resetAll(){
  try{
  if(nbInt){clearInterval(nbInt);nbInt=null;}
  // Reset Ruang Hujan
  const rhInput=document.getElementById('rh-input');if(rhInput)rhInput.value='';
  const rhForm=document.getElementById('rh-form-wrap');if(rhForm){rhForm.style.opacity='1';rhForm.style.transform='';rhForm.style.display='';}
  const rhDone=document.getElementById('rh-done');if(rhDone)rhDone.style.display='none';
  const rhCanvas=document.getElementById('rain-canvas');if(rhCanvas){rhCanvas.style.opacity='0';const ctx=rhCanvas.getContext('2d');ctx.clearRect(0,0,rhCanvas.width,rhCanvas.height);}
  const rhDissolve=document.querySelector('#srh [id="rh-dissolve-text"]');if(rhDissolve&&rhDissolve.parentElement)rhDissolve.parentElement.remove();
  // Reset Virtual Garden
  try{const vgSuc=document.getElementById('vgSuccess');if(vgSuc)vgSuc.style.display='none';}catch(e){}
  try{const vgHint=document.getElementById('vgHint');if(vgHint)vgHint.style.display='';}catch(e){}
  try{const vgBar=document.getElementById('vgBarWrap');if(vgBar)vgBar.style.display='';}catch(e){}
  try{const vgMsg=document.getElementById('vgMsg');if(vgMsg)vgMsg.style.display='';}catch(e){}
  try{const vgHW=document.getElementById('vgHintWrap');if(vgHW)vgHW.style.display='';}catch(e){}
  try{const vgHB=document.getElementById('vgHintBox');if(vgHB)vgHB.style.display='none';}catch(e){}
  // Reset kotak kejutan
  const sbw=document.getElementById('secret-box-wrap');if(sbw){sbw.style.opacity='0';sbw.style.pointerEvents='none';}
  const sm=document.getElementById('secret-modal');if(sm)sm.style.display='none';
  // Stop all audio
  try{ _audGen++; }catch(e){} // batalkan proses play/fetch audio yang masih berjalan di background
  try{if(micStr){micStr.getTracks().forEach(t=>t.stop());micStr=null;}micOn=false;}catch(e){}
  try{const mst=document.getElementById('micst');if(mst)mst.style.display='none';}catch(e){}
  cti=0;repeatOne=false;
  try{am.pause();am.currentTime=0;}catch(e){}
  updNP(0);syncTrackButtons();openedG=0;selF='';selA='';selD='The Wildflower Sovereign';
  try{document.getElementById('lparas').innerHTML='';}catch(e){}
  try{document.getElementById('lsig').style.opacity='0';}catch(e){}
  try{document.getElementById('nfl').style.display='none';}catch(e){}
  try{const shReset=document.getElementById('scroll-hint');if(shReset)shReset.style.opacity='1';}catch(e){}
  ['n9b','n9c','ntarot','nphilo','npath'].forEach(id=>{try{const el=document.getElementById(id);if(el)el.style.display='none';}catch(e){}});
  ['a1','a2','a3'].forEach(id=>{try{const e=document.getElementById(id);if(e)e.value='';}catch(e){}});
  [{id:'gr',svg:`<svg viewBox="0 0 32 32" width="30" height="30" fill="none"><path d="M16 4 L28 8 L28 18 C28 24 22 28 16 30 C10 28 4 24 4 18 L4 8 Z" fill="#7FAE6A" opacity=".7" stroke="#B2CEA6" stroke-width="1"/><path d="M11 16 L15 20 L21 12" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,lbl:'Raga'},{id:'gj',svg:`<svg viewBox="0 0 32 32" width="28" height="28" fill="none"><ellipse cx="16" cy="8" rx="4" ry="7" fill="#F1A094" opacity=".8"/><ellipse cx="16" cy="8" rx="4" ry="7" fill="#F1A094" opacity=".8" transform="rotate(60 16 16)"/><ellipse cx="16" cy="8" rx="4" ry="7" fill="#F1A094" opacity=".8" transform="rotate(120 16 16)"/><ellipse cx="16" cy="8" rx="4" ry="7" fill="#F1A094" opacity=".8" transform="rotate(180 16 16)"/><ellipse cx="16" cy="8" rx="4" ry="7" fill="#F1A094" opacity=".8" transform="rotate(240 16 16)"/><ellipse cx="16" cy="8" rx="4" ry="7" fill="#F1A094" opacity=".8" transform="rotate(300 16 16)"/><circle cx="16" cy="16" r="5" fill="#FFFDF7"/></svg>`,lbl:'Jiwa'},{id:'gb2',svg:`<svg viewBox="0 0 32 32" width="28" height="28" fill="none"><path d="M16 28 C16 28 6 22 6 14 C6 9 11 5 16 8 C21 5 26 9 26 14 C26 22 16 28 16 28Z" fill="#7FAE6A" opacity=".8"/><line x1="16" y1="28" x2="16" y2="12" stroke="#B2CEA6" stroke-width="1.5" stroke-linecap="round"/></svg>`,lbl:'Batin'}].forEach(g=>{try{const e=document.getElementById(g.id);if(e){e.classList.remove('opened');e.innerHTML=`<div class="gico">${g.svg}</div><div class="glbl">${g.lbl}</div>`;}}catch(e){}});
  try{const ff=document.getElementById('flform'),fs=document.getElementById('flsuc');if(ff){ff.style.display='block';ff.style.opacity='1';ff.style.transform='';const b=ff.querySelector('button');if(b){b.disabled=false;b.textContent='Segel & Kirim ke Masa Depan 🌙';}}if(fs)fs.style.display='none';}catch(e){}
  ['fls','flt','flp'].forEach(id=>{try{const e=document.getElementById(id);if(e)e.value='';}catch(e){}});
  try{resetFlames();}catch(e){}
  try{if(typeof candlesBlown!=='undefined')candlesBlown=false;}catch(e){}
  try{if(s11AnimId){cancelAnimationFrame(s11AnimId);s11AnimId=null;}const s11c=document.getElementById('s11-canvas');if(s11c){const cx=s11c.getContext('2d');cx.clearRect(0,0,s11c.width,s11c.height);}}catch(e){}
  try{cleanWGL();}catch(e){}
  figDone2=false; figClickCount=0;
  try{const cwrap=document.getElementById('cake-wrap');if(cwrap){cwrap.style.opacity='0';cwrap.style.transform='translateY(40px) scale(.95)';}}catch(e){}
  try{if(cakeAnimId){cancelAnimationFrame(cakeAnimId);cakeAnimId=null;}}catch(e){}
  try{const aw=document.getElementById('asmwrap');if(aw)aw.style.display='';}catch(e){}
  try{const ab=document.getElementById('asmbar');if(ab)ab.style.width='0%';}catch(e){}
  try{const ap=document.getElementById('asmpct');if(ap)ap.textContent='🌸 0/20 BUNGA';}catch(e){}
  try{const wh=document.getElementById('wgl-hint');if(wh)wh.style.opacity='1';}catch(e){}
  try{document.querySelectorAll('.tcard').forEach(c=>{c.classList.remove('flipped');c.style.opacity='';c.style.filter='';c.style.pointerEvents='';c.style.transform='';c.style.transition='';});}catch(e){}
  try{_tarotDealing=false;}catch(e){}
  try{document.querySelectorAll('.phopt').forEach(c=>{c.classList.remove('selected');c.style.opacity='';c.style.pointerEvents='';});}catch(e){}
  try{document.querySelectorAll('.ph-drag-ghost').forEach(function(g){g.remove();});}catch(e){}
  try{_phDrag=null;}catch(e){}
  try{['phSlotF','phSlotA'].forEach(function(id){const s=document.getElementById(id);if(s){s.innerHTML='';s.classList.remove('filled');}});}catch(e){}
  try{const jar=document.getElementById('phJar');if(jar)jar.classList.remove('ph-jar-ready','ph-jar-hover');}catch(e){}
  try{document.querySelectorAll('.dcard').forEach(c=>c.classList.remove('selected','spotlight-active','spotlight-locked'));}catch(e){}
  try{document.getElementById('cflval').textContent='Esensi Bunga: —';}catch(e){}
  try{document.getElementById('canval').textContent='Esensi Hewan: —';}catch(e){}
  try{selTarot='';}catch(e){}
  try{const ds=document.getElementById('destinySynthesis');if(ds){ds.innerHTML='';ds.classList.remove('show');}}catch(e){}
  try{s3ResetSwipeStack();}catch(e){}
  try{_swipeDrag=null;}catch(e){}
  try{ if(_spotlightInt){clearInterval(_spotlightInt);_spotlightInt=null;} _spotlightBusy=false; }catch(e){}
  try{const sb=document.getElementById('spotlightSpinBtn');if(sb){sb.style.display='inline-flex';sb.textContent='✦ Putar Sorotan Takdir';}}catch(e){}
  try{const stb=document.getElementById('spotlightStopBtn');if(stb)stb.style.display='none';}catch(e){}
  try{const dg=document.getElementById('destinyGrid');if(dg)dg.style.pointerEvents='';}catch(e){}
  try{const gf=document.querySelector('.gate-open-fx');if(gf)gf.remove();}catch(e){}
  try{const eb=document.getElementById('entbtn');if(eb){eb.style.display='none';eb.disabled=false;eb.innerHTML='<span aria-hidden="true">✦</span> Masuki Taman';}}catch(e){}
  try{const micgate=document.getElementById('mic-gate');if(micgate){micgate.style.display='flex';const mb=micgate.querySelector('button');if(mb){mb.textContent='✦ izinkan mikrofon untuk tiup lilin';mb.disabled=false;}}}catch(e){}
  // Reset stage history & UI tambahan
  try{if(typeof _stageHistory!=='undefined')_stageHistory=[];}catch(e){}
  try{var bb=document.getElementById('back-btn');if(bb)bb.style.display='none';}catch(e){}
  try{var sb=document.getElementById('skip-letter-btn');if(sb)sb.style.display='none';}catch(e){}
  // Reset all screens cleanly — lakukan SEBELUM pzReinit agar observer tidak race
  document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.style.opacity='';s.style.transform='';s.style.filter='';s.style.pointerEvents='';});
  document.getElementById('s1').classList.add('active');
  updProg(0);
  setBG('forest');
  _termRan=false;
  runTerm();
  // Reset puzzle SETELAH DOM bersih — pzReinit disconnect observer sementara untuk hindari double-trigger
  try{if(typeof pzReinit==='function')pzReinit();}catch(e){}
  }catch(err){console.error('resetAll error:',err);}
}

// DEV SKIP
let ck=0,ct=null;
document.addEventListener('click',e=>{if(e.clientX<60&&e.clientY<60){ck++;clearTimeout(ct);ct=setTimeout(()=>ck=0,1500);if(ck>=5){ck=0;const m=document.getElementById('skipmenu');m.style.display=m.style.display==='block'?'none':'block';sfx('tr');}}});
// devSkip defined below with full features

// KEYBOARD
(function shuffleTarot(){
  const grid=document.querySelector('.tgrid2');
  if(!grid) return;
  const cards=Array.from(grid.children);
  for(let i=cards.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
  cards.forEach(c=>grid.appendChild(c));
})();
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;if(document.documentElement.classList.contains('nm-locked'))return;if(e.target&&e.target.tagName==='TEXTAREA')return;const a=document.querySelector('.screen.active');if(!a)return;const id=a.id;if(id==='s1'){const b=document.getElementById('entbtn');if(b&&b.style.display!=='none'){e.preventDefault();b.click();}}else if(id==='s2'){e.preventDefault();verify1();}else if(id==='s2b'){e.preventDefault();verify2();}});

// SPLASH — preload audio utama di background
(function(){
  const bar=document.getElementById('spbar'),st=document.getElementById('spst'),sp=document.getElementById('splash'),msgs=['menanam kenangan...','merangkai cahaya bulan...','mempersiapkan taman...','siap! ✦'];
  let p=0;
  // Mulai preload audio utama diam-diam saat splash
  try{am.crossOrigin='anonymous';am.preload='auto';am.src=TRACKS[0].url;}catch(e){}
  function runSplash(){
    // Reset splash ke kondisi awal dulu (kalau sempat jalan di balik lock gate)
    bar.style.width='0%';
    st.textContent=msgs[0];
    sp.style.opacity='1';
    sp.style.display='flex';
    p=0;
    // Pastikan semua screen kembali ke posisi awal
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    var targetId = (window._nmIsRevisit ? 'welcomeback' : 's1');
    var target=document.getElementById(targetId); if(target) target.classList.add('active');
    // Reset terminal s1 agar bisa berjalan lagi
    if(typeof _termRan !== 'undefined') _termRan=false;
    var tbox=document.getElementById('tbox'); if(tbox) tbox.innerHTML='';
    var entbtn=document.getElementById('entbtn'); if(entbtn) entbtn.style.display='none';
    const iv=setInterval(()=>{p+=Math.random()*16+7;if(p>100)p=100;bar.style.width=p+'%';st.textContent=msgs[Math.min(3,Math.floor(p/25))];if(p>=100){clearInterval(iv);setTimeout(()=>{sp.style.opacity='0';setTimeout(()=>{sp.style.display='none';initProg();window.dispatchEvent(new Event('nm:splashDone'));},800);},400);}},85);
  }
  // Jika gerbang kunci masih aktif, tunda splash sampai gerbang benar-benar terbuka
  if(typeof window._nmIsLocked === 'function' && window._nmIsLocked()){
    window.addEventListener('nm:unlocked', runSplash, {once:true});
  } else {
    runSplash();
  }
})();

// INIT
window.onload=function(){
  if(!window._nmIsLocked()){
    try{
      if(!localStorage.getItem('nfirstopen')){
        localStorage.setItem('nfirstopen', new Date().toISOString());
        if(typeof pbNotify==='function') pbNotify('Naffa pertama kali membuka taman! 🌙');
      }
    }catch(e){}
  }
  if(!window._nmIsRevisit) runTerm();
};

// patch: intercept transitions to set BG & catat history
const _origGo = go;
window.go = function(f, t) {
  if(f==='s3b'&&t==='sci') setBG('moon');
  if(f==='sfl'&&t==='s9') setBG('forest');
  if(f==='s9'&&t==='s9b') { /* handled in go9b */ }
  if(f==='s11'&&t==='s12') setBG('forest');
  if(f==='s11'&&t==='sphoto') setBG('gold');
  // Catat history untuk tombol kembali
  if(typeof _stageHistory!=='undefined'){
    _stageHistory.push(f);
    if(_stageHistory.length>10) _stageHistory.shift();
  }
  _origGo(f, t);
  if(t==='str') setTimeout(function(){ if(typeof tarotDealAnimation==='function') tarotDealAnimation(); }, 700);
  setTimeout(function(){ if(typeof _updateBackBtn==='function') _updateBackBtn(); }, 700);
};



// ===== GRASS GENERATOR (flower blooming scene) =====
function initGrass() {
  const wrap = document.getElementById('fl-grass-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const W = window.innerWidth;
  const count = Math.floor(W / 6);
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'fl-g-line';
    const h = Math.random() * 12 + 4;
    const rot = (Math.random() - 0.5) * 12;
    const spd = Math.random() * 0.6 + 0.5;
    d.style.cssText = `
      left:${(i / count) * 100 + (Math.random() - 0.5) * 2}%;
      height:${h}vmin;
      --g-speed:${spd}s;
      --gr:${rot}deg;
      opacity:${Math.random() * 0.5 + 0.4};
      width:${Math.random() * 0.5 + 0.3}vmin;
    `;
    wrap.appendChild(d);
  }
}

// ===== CAKE CANVAS ANIMATION =====
let cakeAnimId = null;
let candlesBlown = false;

function initCakeCanvas() {
  const canvas = document.getElementById('cake-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  // Use parent width or fallback — force layout calc
  const parent = canvas.parentElement;
  const W = (parent && parent.offsetWidth > 0) ? parent.offsetWidth : Math.min(320, window.innerWidth * 0.85);
  const H = Math.round(W * (180 / 200)); // samakan rasio dengan crop viewBox SVG (0 330 200 180)
  canvas.style.height = H + 'px';
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  candlesBlown = false;

  // Ulangi animasi SMIL SVG dari awal setiap kali stage ini dibuka
  const svgEl = document.getElementById('cake-svg');
  if (svgEl && typeof svgEl.setCurrentTime === 'function') {
    try { svgEl.setCurrentTime(0); } catch (e) {}
  }

  // Posisi lilin dihitung dari bounding box asli path "crema" (swirl frosting) pada SVG
  // referensi, dikonversi ke koordinat viewBox hasil crop (0 330 200 180), lalu ke fraksi W/H.
  // Disesuaikan berdasarkan hasil render nyata: bentuk drip frosting di tengah ternyata
  // adalah LEMBAH (celah antar tetesan), bukan puncak — jadi lilin tengah perlu turun
  // lebih jauh, bukan lebih pendek, supaya dasarnya ikut tertanam di frosting.
  const CANDLES = [
    { x: W * 0.325, baseY: H * 0.33 },
    { x: W * 0.50,  baseY: H * 0.315 },
    { x: W * 0.675, baseY: H * 0.33 },
  ];
  const flames = CANDLES.map(c => ({
    ...c,
    phase: Math.random() * Math.PI * 2,
    blown: false,
    blowProg: 0,
  }));

  window._cakeFlames = flames;
  let frame = 0;

  // --- JADWAL LILIN & API — disamakan PERSIS dengan waktu animasi SMIL pada SVG:
  // crema (frosting) selesai tumbuh di bizcocho_3.end + 2s ≈ 6.6s, lilin "in" pada referensi
  // asli mulai 6s selama 500ms, api mulai menyala di 6.5s. Kita pakai jadwal yang sama persis.
  const buildT0 = performance.now();
  const BUILD = {
    candle: [6000, 6500],   // lilin turun dari atas, tepat setelah swirl frosting selesai tumbuh
    ignite: [6500, 7100],   // api menyala
  };
  function bp2(key, elapsed) {
    const r = BUILD[key];
    if (elapsed <= r[0]) return 0;
    if (elapsed >= r[1]) return 1;
    return (elapsed - r[0]) / (r[1] - r[0]);
  }
  function easeSoft(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
  // Sinyal pantulan yang cepat meredam — HANYA aktif dekat momen "mendarat", bukan sepanjang
  // gerak jatuh. Posisi turun halus (easeSoft), kesan "kenyal"-nya datang dari squash-stretch
  // singkat di titik pendaratan saja.
  function impactWobble(prog, startAt) {
    if (prog <= startAt) return 0;
    const t = (prog - startAt) / (1 - startAt);
    return Math.exp(-5.5 * t) * Math.cos(t * Math.PI * 2.4);
  }

  function drawCandles(ctx, W, H) {
    const candleLProg = bp2('candle', performance.now() - buildT0);
    const candleProg = easeSoft(candleLProg);
    const candleDrop = (1 - candleProg) * -H * 0.32;
    const candleWobble = impactWobble(candleLProg, 0.68) * 0.8;
    const candleSqY = 1 - candleWobble * 0.45;
    const candleSqX = 1 + candleWobble * 0.3;
    const candleColors = ['#F1A094', '#F6CB7A', '#B2CEA6'];
    CANDLES.forEach((cd, i) => {
      if (candleProg <= 0.01) return;
      const cw = W * 0.026, ch = H * 0.11;
      const cx = cd.x - cw / 2, cy = cd.baseY;
      const cg = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
      cg.addColorStop(0, candleColors[i]);
      cg.addColorStop(1, 'rgba(200,180,180,.6)');
      ctx.save();
      ctx.globalAlpha = candleProg;
      ctx.translate(0, candleDrop);
      const cPivotX = cd.x, cPivotY = cy + ch; // dasar lilin (tertanam di swirl) jadi jangkar
      ctx.translate(cPivotX, cPivotY);
      ctx.scale(candleSqX, candleSqY);
      ctx.translate(-cPivotX, -cPivotY);
      ctx.beginPath();
      ctx.roundRect(cx, cy, cw, ch, 2);
      ctx.fillStyle = cg;
      ctx.fill();
      // Stripe
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy + ch * 0.4);
      ctx.lineTo(cx + cw - 1, cy + ch * 0.4);
      ctx.strokeStyle = 'rgba(255,255,255,.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Sumbu
      ctx.beginPath();
      ctx.moveTo(cd.x, cy);
      ctx.lineTo(cd.x, cy - H * 0.03);
      ctx.strokeStyle = '#5E3B21';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawFlames(ctx, flames, frame) {
    const igniteElapsed = performance.now() - buildT0;
    const igniteProg = easeSoft(bp2('ignite', igniteElapsed));
    flames.forEach((fl, fi) => {
      if (fl.blown && fl.blowProg >= 1) return;
      if (!fl.blown && igniteProg <= 0.01) return; // belum waktunya menyala

      // Progres padam lebih lambat agar dramatis, mengecil dan meliuk dulu
      if (fl.blown) fl.blowProg = Math.min(1, fl.blowProg + 0.022);

      const bp = fl.blown ? fl.blowProg : 0;
      const ignite = fl.blown ? 1 : igniteProg;
      // Alpha: mulai fade di 40% progres agar ada waktu untuk efek mengecil, tumbuh saat menyala
      const alpha = (fl.blown ? Math.max(0, 1 - Math.max(0, bp - 0.4) * 2.5) : 1) * ignite;
      // Scale mengecil seiring padam (dari 1 ke 0), membesar seiring menyala
      const dyingScale = (fl.blown ? Math.max(0, 1 - bp * 1.1) : 1) * ignite;
      // Meliuk ke samping saat padam (tiupan dari sisi)
      const dyingLean = fl.blown ? bp * 18 : 0;

      const flick1 = Math.sin(frame * 0.11 + fl.phase) * 0.5 + Math.sin(frame * 0.07 + fi * 1.3) * 0.3;
      const flick2 = Math.cos(frame * 0.13 + fl.phase * 1.7) * 0.4;
      const flickX = flick1 * 2.5 + dyingLean;
      const flickScale = (1 + flick2 * 0.12) * dyingScale;

      const fx = fl.x + flickX;
      const baseY = fl.baseY;
      const flameH = H * 0.085 * flickScale;
      const flameW = W * 0.022 * (1 + Math.abs(flick1) * 0.15) * dyingScale;
      const tipY = baseY - flameH;

      if (flameH < 0.5 || flameW < 0.5) return;

      // --- Candlelight ambient glow ---
      ctx.save();
      ctx.globalAlpha = (0.18 + Math.abs(flick2) * 0.06) * alpha;
      const ambR = W * 0.28;
      const amb = ctx.createRadialGradient(fx, baseY, 0, fx, baseY, ambR);
      amb.addColorStop(0, 'rgba(255,200,80,.5)');
      amb.addColorStop(0.4, 'rgba(255,150,40,.12)');
      amb.addColorStop(1, 'rgba(255,100,0,0)');
      ctx.fillStyle = amb;
      ctx.beginPath();
      ctx.ellipse(fx, baseY - flameH * 0.3, ambR, ambR * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Outer glow ---
      ctx.save();
      ctx.globalAlpha = (0.22 + flick2 * 0.08) * alpha;
      const og = ctx.createRadialGradient(fx, tipY + flameH * 0.5, 0, fx, tipY + flameH * 0.4, flameW * 3.5);
      og.addColorStop(0, 'rgba(255,180,40,.7)');
      og.addColorStop(0.5, 'rgba(255,120,10,.2)');
      og.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.ellipse(fx, tipY + flameH * 0.5, flameW * 3.5, flameH * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Api utama: teardrop ---
      function drawTeardrop(cx, by, tw, th, globalA, fillStyle) {
        ctx.save();
        ctx.globalAlpha = globalA * alpha;
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.moveTo(cx, by - th);
        ctx.bezierCurveTo(cx + tw * 1.1, by - th * 0.55, cx + tw, by, cx, by + th * 0.08);
        ctx.bezierCurveTo(cx - tw, by, cx - tw * 1.1, by - th * 0.55, cx, by - th);
        ctx.fill();
        ctx.restore();
      }

      const g1 = ctx.createLinearGradient(fx, tipY, fx, baseY);
      g1.addColorStop(0, 'rgba(255,80,0,0)');
      g1.addColorStop(0.3, 'rgba(255,120,10,0.9)');
      g1.addColorStop(0.7, 'rgba(255,160,30,0.95)');
      g1.addColorStop(1, 'rgba(200,80,0,0.6)');
      drawTeardrop(fx, baseY, flameW, flameH, 0.9, g1);

      const fw2 = flameW * 0.68, fh2 = flameH * 0.82;
      const g2 = ctx.createLinearGradient(fx, baseY - fh2, fx, baseY);
      g2.addColorStop(0, 'rgba(255,200,40,0)');
      g2.addColorStop(0.4, 'rgba(255,200,40,0.92)');
      g2.addColorStop(1, 'rgba(255,160,20,0.7)');
      drawTeardrop(fx, baseY, fw2, fh2, 0.92, g2);

      const fw3 = flameW * 0.38, fh3 = flameH * 0.58;
      const g3 = ctx.createLinearGradient(fx, baseY - fh3, fx, baseY);
      g3.addColorStop(0, 'rgba(255,255,240,0)');
      g3.addColorStop(0.35, 'rgba(255,255,200,1)');
      g3.addColorStop(1, 'rgba(255,240,100,0.85)');
      drawTeardrop(fx, baseY, fw3, fh3, 0.97, g3);

      ctx.save();
      ctx.globalAlpha = (0.85 + flick2 * 0.1) * alpha;
      const core = ctx.createRadialGradient(fx, baseY - fh3 * 0.3, 0, fx, baseY - fh3 * 0.3, flameW * 0.22);
      core.addColorStop(0, 'rgba(255,255,255,1)');
      core.addColorStop(0.5, 'rgba(255,255,220,0.8)');
      core.addColorStop(1, 'rgba(255,240,100,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.ellipse(fx, baseY - fh3 * 0.28, flameW * 0.22, fh3 * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Percikan api ---
      // Saat normal: percikan kecil sesekali
      // Saat padam (blown, progres 0-0.35): percikan banyak meledak ke atas
      const isDying = fl.blown && bp < 0.4;
      const sparkChance = isDying ? 0.85 : 0.18;
      const sparkCount = isDying ? 6 : 1;
      if (Math.random() < sparkChance) {
        for (let s = 0; s < sparkCount; s++) {
          ctx.save();
          ctx.globalAlpha = (Math.random() * 0.7 + 0.3) * alpha;
          const spreadX = isDying ? flameW * 5 : flameW * 2.5;
          const spreadY = isDying ? flameH * 2.2 : flameH * 1.1;
          const sx = fx + (Math.random() - 0.5) * spreadX;
          const sy = baseY - flameH * (0.3 + Math.random() * 0.8) - (isDying ? Math.random() * H * 0.04 : 0);
          const sr = isDying ? Math.random() * 2 + 0.5 : Math.random() * 1.2 + 0.3;
          ctx.fillStyle = isDying ? 'rgba(255,180,60,0.95)' : 'rgba(255,230,100,0.9)';
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    });
  }

  function drawSmoke(ctx, flames, frame) {
    flames.forEach(fl => {
      if (!fl.blown || fl.blowProg < 0.08) return;
      // Asap makin tebal saat awal padam, lalu perlahan memudar
      const smokeAlpha = Math.min(1, fl.blowProg * 2.2) * Math.max(0, 1 - (fl.blowProg - 0.5) * 1.4) * 0.65;
      if (smokeAlpha <= 0) return;
      const pCount = 8;
      for (let i = 0; i < pCount; i++) {
        const t = (frame * 0.012 + i / pCount) % 1;
        const wobble = Math.sin(frame * 0.025 + i * 1.8 + fl.phase) * 10;
        const sx = fl.x + wobble;
        const sy = fl.baseY - H * 0.03 - t * H * 0.22;
        const sr = t * 14 + 2;
        ctx.save();
        ctx.globalAlpha = (1 - t) * smokeAlpha;
        const smokeG = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        smokeG.addColorStop(0, 'rgba(200,190,180,.7)');
        smokeG.addColorStop(1, 'rgba(180,170,160,0)');
        ctx.fillStyle = smokeG;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // Floating petals
  const petals = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 4 + 2,
    vy: -(Math.random() * 0.4 + 0.1),
    vx: (Math.random() - 0.5) * 0.3,
    rot: Math.random() * Math.PI * 2,
    rs: (Math.random() - 0.5) * 0.04,
    ph: Math.random() * Math.PI * 2,
    col: ['rgba(232,96,76,','rgba(242,180,65,','rgba(178,206,166,'][i % 3],
  }));

  function loop() {
    frame++;
    ctx.clearRect(0, 0, W, H); // transparan — SVG kue di lapisan bawah tetap terlihat

    drawCandles(ctx, W, H);
    drawSmoke(ctx, flames, frame);
    drawFlames(ctx, flames, frame);

    // Floating petals
    petals.forEach(p => {
      p.y += p.vy; p.x += p.vx + Math.sin(frame * 0.02 + p.ph) * 0.3; p.rot += p.rs;
      if (p.y < -10) { p.y = H + 5; p.x = Math.random() * W; }
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r, p.r * 1.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = p.col + '0.5)';
      ctx.fill();
      ctx.restore();
    });

    cakeAnimId = requestAnimationFrame(loop);
  }

  if (cakeAnimId) cancelAnimationFrame(cakeAnimId);

  // Entrance animation for cake wrapper
  const cw = document.getElementById('cake-wrap');
  if (cw) {
    setTimeout(function() {
      cw.style.opacity = '1';
      cw.style.transform = 'translateY(0) scale(1)';
    }, 150);
  }

  loop();
}

// Override blowManual to animate flame extinction
function blowManual() {
  if (window._cakeFlames) {
    window._cakeFlames.forEach(function(f){ f.blown = true; });
  }
  setTimeout(execBlow, 1600);
}

// goS10 is redefined to init cake canvas
function goS10() {
  cleanWGL();
  if(uAnim){cancelAnimationFrame(uAnim);uAnim=null;}
  setBG('moon');
  go('s9b','s10');
  setTimeout(function(){
    initCakeCanvas();
    var gate=document.getElementById('mic-gate');
    if(gate){gate.style.display='flex';var mb=gate.querySelector('button');if(mb){mb.textContent='✦ izinkan mikrofon untuk tiup lilin';mb.disabled=false;}}
  },1400);
}

// startCin redefined to init grass
function startCin() {
  setBG('moon');
  go('s3b','sci');
  setTimeout(function(){
    // restart CSS animations by re-cloning flower elements
    restartFlowerAnim();
    showPT(0);
    const b=document.getElementById('cskip');
    ptmr=setTimeout(function(){if(b){b.style.opacity='1';b.style.pointerEvents='auto';}},12000);
    /* Auto-advance dihapus: user yang menentukan kapan lanjut */
    setTimeout(initGrass, 200);
  }, 700);
}

function restartFlowerAnim() {
  // Force restart CSS keyframe animations by removing & re-adding elements
  const wrap = document.querySelector('#sci .fl-flowers');
  if (!wrap) return;
  // Clone to force animation restart
  const clone = wrap.cloneNode(true);
  wrap.parentNode.replaceChild(clone, wrap);
  // Also restart moon
  const moon = document.querySelector('#sci .fl-moon');
  if (moon) {
    moon.style.animation = 'none';
    moon.offsetHeight; // reflow
    moon.style.animation = '';
  }
}

// devSkip enhanced for cake + grass
function devSkip(id){
  document.getElementById('skipmenu').style.display='none';
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const t=document.getElementById(id); if(!t)return;
  t.classList.add('active');
  const i=STAGES.indexOf(id); if(i>=0)updProg(i);
  if(am&&am.paused){am.volume=1;am.play().then(()=>{initViz();document.getElementById('ahud').style.opacity='1';}).catch(()=>{});}
  if(id==='sci'){startCin();return;}
  if(id==='s8')trigLetter();
  if(id==='s9b')setTimeout(initWebGLFlowers,900);
  if(id==='s13')setTimeout(confetti,700);
  if(id==='scd')startCD();
  if(id==='str'){setTimeout(function(){ if(typeof tarotDealAnimation==='function') tarotDealAnimation(); },250);}
  if(id==='s10'){setTimeout(function(){initCakeCanvas();var gate=document.getElementById('mic-gate');if(gate)gate.style.display='flex';},900);}
  if(id==='sphoto'){setTimeout(initPhotobooth,300);}
}


// ===== S11 LIVE CANVAS CONFETTI =====
let s11AnimId = null;
let s11Particles = [];

function initS11Canvas() {
  const cv = document.getElementById('s11-canvas');
  if (!cv) return;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');
  s11Particles = [];

  // Spawn continuous particles
  function spawn(color) {
    const side = Math.random() > 0.5;
    s11Particles.push({
      x: Math.random() * cv.width,
      y: -10,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 1.5 + 0.8,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.08,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 2,
      color: color || ['#E8604C','#F1A094','#F2B441','#F6CB7A','#7FAE6A','#B2CEA6','#5FAEDB','#FFFDF7'][Math.floor(Math.random()*8)],
      life: 1,
      shape: Math.random() > 0.6 ? 'circle' : 'rect',
    });
  }

  let spawnTimer = 0;
  function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    spawnTimer++;
    if (spawnTimer % 3 === 0) spawn();

    s11Particles = s11Particles.filter(p => p.life > 0);
    s11Particles.forEach(p => {
      p.x += p.vx + Math.sin(p.rot * 0.5) * 0.4;
      p.y += p.vy;
      p.rot += p.rs;
      p.vy += 0.02; // gentle gravity
      p.life -= 0.004;
      if (p.y > cv.height) p.life = 0;

      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2.5);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });
    s11AnimId = requestAnimationFrame(loop);
  }

  if (s11AnimId) cancelAnimationFrame(s11AnimId);
  loop();
}

function s11Burst(color) {
  for (let i = 0; i < 40; i++) {
    const cv = document.getElementById('s11-canvas');
    if (!cv) return;
    s11Particles.push({
      x: cv.width / 2 + (Math.random() - 0.5) * cv.width * 0.6,
      y: cv.height / 2 + (Math.random() - 0.5) * cv.height * 0.4,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6 - 1,
      rot: Math.random() * Math.PI * 2,
      rs: (Math.random() - 0.5) * 0.15,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 2.5,
      color: color,
      life: 1,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    });
  }
}

// ===== RUANG HUJAN =====
function startRain() {
  const txt = (document.getElementById('rh-input').value || '').trim();
  if (!txt) { showAlert('Tuliskan dulu apa yang ingin kamu lepaskan 🌧️'); return; }

  try{
    if(window._db){
      window._db.collection('releases').add({
        text: txt,
        recipient: 'Naffa Febry Cornelia',
        createdAt: new Date().toISOString(),
        device: navigator.userAgent.substring(0,80)
      }).catch(()=>{});
    }
  }catch(e){}
  if(typeof pbNotify==='function') pbNotify('Naffa menulis di Ruang Hujan ✦', '', false);
  // Isi lengkap SENGAJA tidak lagi diteruskan ke Telegram — baca isinya
  // lewat tab "Ruang Hujan" di chat.html.

  // Setup rain canvas
  const canvas = document.getElementById('rain-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.opacity = '1';
  setBG('moon');

  // Fade out form
  const form = document.getElementById('rh-form-wrap');
  form.style.transition = 'opacity .8s ease, transform .8s ease';
  form.style.opacity = '0';
  form.style.transform = 'translateY(10px) scale(.97)';

  // Show dissolving text
  const dissolveEl = document.createElement('div');
  dissolveEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:3;text-align:center;max-width:min(360px,86vw);width:85%;pointer-events:none;overflow-wrap:break-word;word-break:break-word;overflow:hidden;';
  dissolveEl.innerHTML = `<div id="rh-dissolve-text" style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:rgba(220,238,255,.95);line-height:1.85;text-shadow:0 0 18px rgba(95,174,219,.5),0 0 4px rgba(0,0,0,.6);letter-spacing:.5px;overflow-wrap:break-word;word-break:break-word;transition:opacity 4.5s ease, filter 4.5s ease, transform 4.5s ease, letter-spacing 4.5s ease;">"${txt}"</div>`;
  document.getElementById('srh').appendChild(dissolveEl);

  // Rain drops
  const drops = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    len: Math.random() * 18 + 8,
    spd: Math.random() * 5 + 4,
    op: Math.random() * 0.4 + 0.15,
    w: Math.random() * 0.8 + 0.3,
  }));

  let frame = 0;
  let animId;
  function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach(d => {
      ctx.save();
      ctx.globalAlpha = d.op;
      ctx.strokeStyle = `rgba(170,210,240,1)`;
      ctx.lineWidth = d.w;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y + d.len);
      ctx.stroke();
      ctx.restore();
      d.y += d.spd;
      if (d.y > canvas.height) {
        d.y = -d.len;
        d.x = Math.random() * canvas.width;
      }
    });
    frame++;
    // Ripple splashes at bottom
    if (frame % 18 === 0) {
      const rx = Math.random() * canvas.width;
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = 'rgba(170,210,240,.7)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(rx, canvas.height - 5, 6, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    animId = requestAnimationFrame(drawRain);
  }
  drawRain();

  // Dissolve the text after 2.8s — biar sempat terbaca jelas dulu
  setTimeout(() => {
    const dt = document.getElementById('rh-dissolve-text');
    if (dt) { dt.style.opacity = '0'; dt.style.filter = 'blur(10px)'; dt.style.transform = 'translateY(-14px)'; dt.style.letterSpacing = '3px'; }
  }, 2800);

  // After 7.3s: stop rain, fade canvas, show done message
  setTimeout(() => {
    cancelAnimationFrame(animId);
    canvas.style.opacity = '0';
    form.style.display = 'none';
    if (dissolveEl) dissolveEl.remove();
    const done = document.getElementById('rh-done');
    done.style.display = 'flex';
    sfx('ok');
    if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
  }, 7300);
}

// ===== KOTAK KEJUTAN TERSEMBUNYI =====
function closeSecretModal() {
  const modal = document.getElementById('secret-modal');
  if (!modal) return;
  modal.style.opacity = '0';
  modal.style.transition = 'opacity .3s ease';
  setTimeout(() => { modal.style.display = 'none'; modal.style.opacity = ''; modal.style.transition = ''; }, 320);
}

function openSecretBox() {
  sfx('ok');
  if (navigator.vibrate) navigator.vibrate([60, 30, 60, 30, 80]);
  const modal = document.getElementById('secret-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.style.opacity = '0';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    modal.style.transition = 'opacity .4s ease';
    modal.style.opacity = '1';
  }));
  // Petal burst inside modal
  const container = document.getElementById('sm-petals');
  if (container) {
    container.innerHTML = '';
    const colors = ['rgba(232,96,76,.6)','rgba(242,180,65,.5)','rgba(127,174,106,.55)','rgba(95,174,219,.5)'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('div');
      const ang = (i / 22) * 360;
      const dist = 80 + Math.random() * 80;
      const sz = Math.random() * 7 + 3;
      p.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${colors[i%4]};left:50%;top:50%;transform:translate(-50%,-50%);animation:smPetal ${.6+Math.random()*.5}s ease-out forwards;--ang:${ang}deg;--dist:${dist}px;`;
      container.appendChild(p);
    }
    if (!document.getElementById('sm-petal-style')) {
      const s = document.createElement('style');
      s.id = 'sm-petal-style';
      s.textContent = '@keyframes smPetal{from{opacity:.9;transform:translate(-50%,-50%) rotate(var(--ang)) translateY(0)}to{opacity:0;transform:translate(-50%,-50%) rotate(var(--ang)) translateY(calc(-1 * var(--dist)))}}';
      document.head.appendChild(s);
    }
  }
}

// ===== CHAT DIAM-DIAM (livechat 2 arah) =====
// Pakai koleksi Firestore 'live_chat' yang sama dengan halaman chat.html milik Rizqi —
// keduanya "dengerin" koleksi ini secara realtime (onSnapshot), jadi pesan yang salah
// satu kirim langsung muncul di layar yang lain tanpa refresh.
let _nmChatUnsub=null;

function openReplyModal(){
  const modal=document.getElementById('reply-modal');
  if(!modal) return;
  modal.style.display='flex';
  try{sfx('tr');}catch(e){}
  // Notifikasi ke Rizqi SETIAP KALI Naffa membuka sesi chat (buka-tutup
  // berkali-kali = notif berkali-kali) — isi pesannya sendiri tetap tidak
  // diteruskan ke Telegram, cuma event "membuka chat"-nya saja.
  if(typeof pbNotify==='function') pbNotify('Naffa membuka Chat Diam-diam ✦');
  if(!window._db) return;
  if(_nmChatUnsub) return; // listener sudah aktif dari sebelumnya
  const body=document.getElementById('chat-body-nm');
  _nmChatUnsub=window._db.collection('live_chat').orderBy('ts','asc').onSnapshot(function(snap){
    if(!body) return;
    if(snap.empty){
      body.innerHTML='<div style="margin:auto;text-align:center;font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:.85rem;color:rgba(255,253,247,.4);padding:20px;">Tulis sesuatu — Rizqi bisa balas kapan pun dia buka chatnya ✦</div>';
      return;
    }
    body.innerHTML='';
    snap.forEach(function(doc){
      const m=doc.data();
      const isNaffa=(m.sender!=='rizqi');
      const row=document.createElement('div');
      row.style.cssText='max-width:80%;padding:9px 14px;border-radius:15px;font-family:\'Cormorant Garamond\',serif;font-size:.9rem;line-height:1.5;word-wrap:break-word;white-space:pre-wrap;align-self:'+(isNaffa?'flex-end':'flex-start')+';background:'+(isNaffa?'rgba(242,180,65,.18)':'rgba(127,174,106,.16)')+';border:1px solid '+(isNaffa?'rgba(242,180,65,.3)':'rgba(127,174,106,.28)')+';color:var(--cream);';
      row.textContent=m.text||'';
      body.appendChild(row);
    });
    body.scrollTop=body.scrollHeight;
  },function(){ /* offline/gagal — biarkan, tidak fatal */ });
}

function closeReplyModal(){
  const modal=document.getElementById('reply-modal');
  if(modal) modal.style.display='none';
  // Listener dibiarkan tetap jalan sebentar di background kalau modal dibuka lagi
  // nanti dalam sesi yang sama — cuma benar-benar dilepas kalau meninggalkan halaman.
}

async function sendSecretReply(){
  const ta=document.getElementById('reply-text');
  const btn=document.getElementById('reply-submit-btn');
  const text=(ta.value||'').trim().replace(/<[^>]*>/g,'').substring(0,500);
  if(!text) return;
  btn.disabled=true;
  try{
    if(window._db){
      await window._db.collection('live_chat').add({
        sender:'naffa', text:text, ts:new Date().toISOString(),
        device:navigator.userAgent.substring(0,80)
      });
    }
  }catch(e){}
  ta.value='';
  btn.disabled=false;
  try{sfx('ok');}catch(e){}
  // Isi pesan sengaja TIDAK diteruskan ke Telegram lagi — notifikasi cukup
  // sekali saat sesi chat dibuka (lihat openReplyModal). Pesan tetap tersimpan
  // aman di Firestore ('live_chat') dan bisa dibaca lewat chat.html.
}
document.addEventListener('DOMContentLoaded', function(){
  const ta=document.getElementById('reply-text');
  if(ta) ta.addEventListener('keydown', function(e){
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendSecretReply(); }
  });
});

// ===== NOTIFIKASI DIAM-DIAM & TERUSKAN ISI TULISAN =====
// Setiap tulisan/event penting tetap dicatat ke Firestore sebagai penyimpanan utama
// (koleksi 'silent_notify', 'live_chat', 'releases', 'future_letters' — bisa
// dicek kapan saja lewat Firebase console). Kalau TELEGRAM_BOT_TOKEN & CHAT_ID diisi,
// SEMUANYA juga diteruskan langsung ke Telegram kamu secara instan, tapi
// SEKARANG SEMUANYA cuma berupa notifikasi EVENT (bukan isi lengkap tulisan
// Naffa) — isi lengkapnya cukup dibaca lewat chat.html:
//   • Event: pertama buka taman, selesai perjalanan, buka lagi di lain hari
//   • Event: Naffa membuka sesi Chat Diam-diam (terkirim setiap kali dibuka)
//   • Event: Naffa menulis di Ruang Hujan
//   • Event: Naffa menyegel Surat ke 2030
// Kalau dikosongkan, semuanya tetap tersimpan aman di Firestore seperti biasa, cuma
// tidak ada notifikasi instan ke HP.
//
// Ada 2 opsi notifikasi INSTAN ke HP (boleh isi salah satu, boleh dua-duanya):
//
// OPSI A — ntfy.sh (tanpa app tambahan kalau mau, tapi lebih reliable pakai app):
// 1. Buka https://ntfy.sh, pilih nama topic unik (misal "taman-bulan-rz8x2q9k")
// 2. Install app ntfy (Android/iOS) lalu subscribe ke topic itu
// 3. Isi NOTIFY_WEBHOOK di bawah jadi 'https://ntfy.sh/nama-topic-kamu'
// (Catatan: ntfy.sh cuma dipakai untuk notifikasi event di atas, BUKAN untuk
// meneruskan isi tulisan — kalau mau isi lengkap tulisan ikut terkirim, pakai OPSI B.)
//
// OPSI B — Telegram (kemungkinan lebih gampang karena kamu pasti udah punya app-nya):
// 1. Di Telegram, chat @BotFather → kirim /newbot → ikuti instruksinya (kasih nama
//    bebas) → nanti dikasih TOKEN (bentuknya kayak "123456789:AAExxxxxxxxxxxxxxxxx")
// 2. Cari bot yang baru kamu buat (nama sesuai yang kamu kasih tadi), klik Start/kirim
//    pesan apa saja ke bot itu dulu (WAJIB, supaya bot "kenal" chat kamu)
// 3. Buka https://api.telegram.org/bot<TOKEN>/getUpdates (ganti <TOKEN> dengan token
//    dari langkah 1) di browser — cari angka di "chat":{"id": ...} itu CHAT_ID kamu
// 4. Isi TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID di bawah dengan nilai dari langkah 1 & 3
//
// PENTING: token/URL di sini kelihatan siapa saja yang buka source code halaman ini
// (situs statis, tidak ada backend yang menyembunyikannya). Risikonya kecil untuk
// project pribadi begini (paling buruk orang lain bisa kirim pesan sampah ke bot/topic
// kamu), tapi jangan pakai token bot yang juga dipakai untuk hal lain yang sensitif.
const NOTIFY_WEBHOOK = '';
const TELEGRAM_BOT_TOKEN = '8829301675:AAFGt42wGmhXkWHn-8-aWJxxBqQrwT9b_ro';
const TELEGRAM_CHAT_ID = '8257800846';
// Fungsi bersama — dipakai pbNotify() dan juga fitur-fitur lain (Ruang Hujan,
// Surat ke 2030, Chat Diam-diam) yang juga meneruskan isi tulisannya ke Telegram.
function sendTelegram(text){
  if(!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try{
    fetch('https://api.telegram.org/bot'+TELEGRAM_BOT_TOKEN+'/sendMessage',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:TELEGRAM_CHAT_ID, text:String(text).substring(0,4000)})
    }).catch(function(){});
  }catch(e){}
}

// toTelegram=false untuk event yang tetap dicatat di Firestore (bisa dicek lewat
// chat.html kapan saja) tapi TIDAK lagi push instan ke Telegram — supaya notifnya
// tidak kebanyakan. Yang tetap push: buka taman (pertama kali & kunjungan ulang)
// dan buka Chat Diam-diam.
function pbNotify(event, detail, toTelegram){
  try{
    if(window._db){
      window._db.collection('silent_notify').add({
        event:event, detail:detail||'', ts:new Date().toISOString(),
        device:navigator.userAgent.substring(0,80)
      }).catch(function(){});
    }
  }catch(e){}
  if(toTelegram===false) return;
  const msg='Taman Bulan — '+event+(detail?(' · '+detail):'');
  if(NOTIFY_WEBHOOK){
    try{ fetch(NOTIFY_WEBHOOK,{method:'POST',body:msg}).catch(function(){}); }catch(e){}
  }
  sendTelegram(msg);
}

// Trigger kotak kejutan muncul saat S13 aktif
document.addEventListener('DOMContentLoaded', function() {
  const s13obs = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.target.id === 's13') {
        const wrap = document.getElementById('secret-box-wrap');
        if (!wrap) return;
        if (m.target.classList.contains('active')) {
          setTimeout(() => {
            wrap.style.opacity = '1';
            wrap.style.pointerEvents = 'auto';
          }, 3500);
        } else {
          wrap.style.opacity = '0';
          wrap.style.pointerEvents = 'none';
          document.getElementById('secret-modal').style.display = 'none';
        }
      }
    });
  });
  const s13el = document.getElementById('s13');
  if (s13el) s13obs.observe(s13el, { attributes: true, attributeFilter: ['class'] });
});

// ===== NEXT BIRTHDAY COUNTDOWN =====
let nbInt = null;
function startNextBdayCountdown() {
  if (nbInt) clearInterval(nbInt);
  function tick() {
    const now = new Date();
    let next = new Date(BIRTH);
    next.setFullYear(now.getFullYear());
    if (now >= next) next.setFullYear(now.getFullYear() + 1);
    const diff = next - now;
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1000);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set('nb-d', d); set('nb-h', h); set('nb-m', m); set('nb-s', s);
  }
  tick();
  nbInt = setInterval(tick, 1000);
}
document.addEventListener('DOMContentLoaded', function() {
  const obs13 = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.target.id === 's13' && m.target.classList.contains('active')) {
        setTimeout(startNextBdayCountdown, 800);
        // Buka otomatis panel pilihan lagu, supaya bisa dipilih sebagai lagu pembuka favorit
        setTimeout(function(){
          const wrap=document.getElementById('playlist-menu');
          const btn=document.getElementById('playlist-btn');
          if(wrap && !wrap.classList.contains('show')){
            renderPlaylistMenu();
            wrap.classList.add('show');
            if(btn) btn.classList.add('active');
          }
        }, 1200);
      }
      if (m.target.id === 's13' && !m.target.classList.contains('active')) {
        if (nbInt) { clearInterval(nbInt); nbInt = null; }
      }
    });
  });
  const s13el = document.getElementById('s13');
  if (s13el) obs13.observe(s13el, { attributes: true, attributeFilter: ['class'] });
});

// Init s11 canvas when stage becomes active
const _origGoS11 = go;
// Intercept transitions TO s11
document.addEventListener('DOMContentLoaded', function() {
  const obs = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.target.id === 's11' && m.target.classList.contains('active')) {
        setTimeout(initS11Canvas, 100);
      }
      // Stop when leaving s11
      if (m.target.id === 's11' && !m.target.classList.contains('active')) {
        if (s11AnimId) { cancelAnimationFrame(s11AnimId); s11AnimId = null; }
      }
    });
  });
  const s11el = document.getElementById('s11');
  if (s11el) obs.observe(s11el, { attributes: true, attributeFilter: ['class'] });
});


// ===== TETAP BERJALAN DI LATAR BELAKANG SAAT PINDAH TAB =====
// Sengaja TIDAK menghentikan audio/animasi saat tab disembunyikan — browser akan
// otomatis menahan requestAnimationFrame untuk hemat resource, tapi audio (<audio>)
// tetap diputar terus selama tab/halaman belum benar-benar ditutup.
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    var active = document.querySelector('.screen.active');
    if (active) {
      var id = active.id;
      // Animasi canvas yang sempat ditahan browser (rAF) dipastikan jalan lagi mulus saat kembali ke tab
      if (id === 's11' && !s11AnimId) initS11Canvas();
      if (id === 's9b' && !figDone2 && !wglInited) initWebGLFlowers();
      if (id === 's10' && !cakeAnimId) initCakeCanvas();
      if (id === 'spz') { setTimeout(function(){ if (typeof pzReinit === 'function') pzReinit(); }, 400); }
    }
  }
});

// ===== AUDIO ERROR FALLBACK NOTICE =====
(function() {
  var el = document.getElementById('am');
  if (!el) return;
  el.addEventListener('error', function() {
    var hud = document.getElementById('ahud');
    var ntitle = document.getElementById('ntitle');
    if (ntitle) {
      ntitle.style.color = 'rgba(232,96,76,.7)';
      ntitle.textContent = 'Musik tidak tersedia';
    }
    if (hud) hud.style.opacity = '0.5';
  });
})();

// ===== ULANGI TAMAN =====
// Pemilihan lagu tidak lagi dilakukan di sini — begitu taman direset, alurnya kembali
// ke s1 lalu otomatis singgah lagi di stage SMUSIC agar pengunjung memilih lagu baru.
function resetAllWithTrack() {
  /* Konfirmasi sebelum reset agar tidak kepencet tidak sengaja */
  var modal = document.getElementById('reset-confirm-modal');
  if (modal) { modal.style.display = 'flex'; return; }
  resetAll();
}

// ===== TOMBOL SKIP SURAT =====
function skipLetter(){
  // Hentikan typewriter, langsung tampilkan surat lengkap dan tombol lanjut
  var lp=document.getElementById('lparas');
  var lb=document.getElementById('lbox');
  var sig=document.getElementById('lsig');
  var sh=document.getElementById('scroll-hint');
  var nfl=document.getElementById('nfl');
  var sb=document.getElementById('skip-letter-btn');
  if(lp) lp.innerHTML=''; // bersihkan dulu
  // Isi ulang semua paragraf sekaligus tanpa animasi
  var paras=window._letterParas||[];
  paras.forEach(function(p){ var d=document.createElement('div'); d.className='lpara'; d.innerHTML=p; if(lp) lp.appendChild(d); });
  if(sig){ sig.style.opacity='1'; sig.style.transition='none'; }
  if(sh) sh.style.opacity='0';
  if(nfl) nfl.style.display='inline-flex';
  if(sb) sb.style.display='none';
  if(lb) setTimeout(function(){ lb.scrollTop=lb.scrollHeight; },50);
  window._letterSkipped=true;
}

// ===== PAUSE AUDIO SAAT MIC AKTIF =====
function pauseForMic(){
  if(am&&!am.paused){ am._muteForMic=true; am.volume=0; }
}
function resumeAfterMic(){
  if(am&&am._muteForMic){ am._muteForMic=false; var iv2=setInterval(function(){ am.volume=Math.min(1,am.volume+.05); if(am.volume>=1)clearInterval(iv2); },50); }
}

// ===== TRANSISI LOCK GATE SINEMATIK =====
function lockGateOpen(){
  var lg=document.getElementById('lockgate');
  if(!lg) return;
  lg.style.transition='opacity .9s ease, transform .9s ease, filter .9s ease';
  lg.style.opacity='0';
  lg.style.transform='scale(1.04)';
  lg.style.filter='blur(8px)';
  setTimeout(function(){
    document.documentElement.classList.remove('nm-locked');
    lg.style.display='none';
    lg.style.transform='';
    lg.style.filter='';
    lg.style.opacity='';
    lg.style.transition='';
    window.dispatchEvent(new Event('nm:unlocked'));
  },900);
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown',function(e){
  // Enter pada tombol yang difokus
  if(e.key==='Enter'){
    var el=document.activeElement;
    if(el&&(el.tagName==='BUTTON')&&el.onclick) return; // biarkan default
  }
  // Hindari konflik Enter dengan input teks
  if(e.key==='Enter'&&document.activeElement&&['INPUT','TEXTAREA'].indexOf(document.activeElement.tagName)>=0) return;
  // Escape: tutup modal/fullscreen
  if(e.key==='Escape'){
    var modal=document.getElementById('reset-confirm-modal');
    if(modal&&modal.style.display==='flex'){ modal.style.display='none'; return; }
  }
  // Tab: pastikan fokus tidak keluar dari elemen interaktif yang terlihat saja
});
// Sembunyikan focus ring kecuali pakai keyboard
document.addEventListener('mousedown',function(){ document.body.classList.add('no-focus-ring'); });
document.addEventListener('keydown',function(e){ if(e.key==='Tab') document.body.classList.remove('no-focus-ring'); });
(function(){
  function tryFullscreen(){
    if(document.fullscreenElement) return;
    var el=document.documentElement;
    if(el.requestFullscreen) el.requestFullscreen().catch(function(){});
    else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
  ['click','touchstart','keydown'].forEach(function(ev){
    document.addEventListener(ev,function handler(){
      tryFullscreen();
      document.removeEventListener(ev,handler);
    },{once:true,passive:true});
  });
})();

// ===== SAPAAN WAKTU di stage s1 =====
(function(){
  function getGreeting(){
    var h=new Date().getHours();
    if(h>=4&&h<11) return 'Selamat pagi, Naffa ✦';
    if(h>=11&&h<15) return 'Selamat siang, Naffa ✦';
    if(h>=15&&h<18) return 'Selamat sore, Naffa ✦';
    if(h>=18&&h<21) return 'Selamat malam, Naffa ✦';
    return 'Malam sudah larut, Naffa ✦';
  }
  var grSet=false;
  function setGreet(){
    if(grSet) return; grSet=true;
    var gr=document.getElementById('s1-greet');
    if(gr) gr.textContent=getGreeting();
  }
  setGreet();
})();

// ===== TOMBOL KEMBALI antar stage =====
var _stageHistory=[];
var _backAllowed=['s2','s2b','scd','str','sph','s3','s3b','sci','spz','svg-screen','srh','s8','sfl','s9','s9b'];
function _updateBackBtn(){
  var b=document.getElementById('back-btn'); if(!b) return;
  var cur=document.querySelector('.screen.active');
  var show=_stageHistory.length>0 && _backAllowed.indexOf(cur?cur.id:'')>=0;
  b.style.display=show?'block':'none';
}
function goBack(){
  if(!_stageHistory.length) return;
  var prev=_stageHistory.pop();
  var cur=document.querySelector('.screen.active');
  if(cur&&cur.id!==prev){
    cur.classList.remove('active');
    var pe=document.getElementById(prev);
    if(pe){pe.style.opacity='0';pe.classList.add('active');requestAnimationFrame(function(){requestAnimationFrame(function(){pe.style.opacity='';});});}
  }
  _updateBackBtn();
}

// ===== CONFETTI RINGAN saat puzzle benar =====
function miniConfetti(){
  var c=document.getElementById('cconf'); if(!c) return;
  c.style.display='block'; c.width=window.innerWidth; c.height=window.innerHeight;
  var ctx=c.getContext('2d');
  var cols=['#E8604C','#F6CB7A','#7FAE6A','#5FAEDB','#FFFDF7'];
  var ps=[];
  for(var i=0;i<55;i++) ps.push({x:Math.random()*c.width,y:-10-Math.random()*60,w:Math.random()*6+3,h:Math.random()*4+2,col:cols[i%cols.length],vy:Math.random()*2.5+1,vx:Math.random()*2-1,rot:Math.random()*Math.PI*2,rs:(Math.random()-.5)*.1,al:1});
  var fr=0;
  (function cl(){
    ctx.clearRect(0,0,c.width,c.height); fr++;
    ps.forEach(function(p){p.y+=p.vy;p.x+=p.vx;p.rot+=p.rs;if(fr>60)p.al-=.018;if(p.y>c.height){p.y=-10;p.al=1;}ctx.save();ctx.globalAlpha=Math.max(0,p.al);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.col;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});
    if(fr<120) requestAnimationFrame(cl);
    else{ctx.clearRect(0,0,c.width,c.height);c.style.display='none';}
  })();
}

// ===== FIREBASE OFFLINE FALLBACK =====
(function(){
  var ready=setInterval(function(){
    if(!window._db){return;}
    clearInterval(ready);
    var origCol=window._db.collection.bind(window._db);
    window._db.collection=function(name){
      var col=origCol(name);
      var origAdd=col.add.bind(col);
      col.add=function(data){
        return origAdd(data).catch(function(){
          try{localStorage.setItem('nm_fb_'+name+'_'+Date.now(),JSON.stringify(data));}catch(e){}
          return {id:'lokal-'+Date.now()};
        });
      };
      return col;
    };
  },200);
})();

// ===== LOADING INDICATOR audio non-utama =====
(function(){
  var el=document.getElementById('audio-loading'),t=null;
  window._showAudioLoading=function(){if(el){el.style.display='block';clearTimeout(t);}};
  window._hideAudioLoading=function(){if(el){t=setTimeout(function(){el.style.display='none';},300);}};
})();

// ===== FULLSCREEN TOGGLE manual =====
function toggleFS(){
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();
    var b=document.getElementById('fs-btn');if(b){b.textContent='✕';b.title='Keluar layar penuh';}
  }else{
    document.exitFullscreen&&document.exitFullscreen();
    var b=document.getElementById('fs-btn');if(b){b.textContent='⛶';b.title='Layar penuh';}
  }
}
document.addEventListener('fullscreenchange',function(){
  if(!document.fullscreenElement){var b=document.getElementById('fs-btn');if(b){b.textContent='⛶';b.title='Layar penuh';}}
});

// ===== AUDIO TAP HINT untuk mobile =====
(function(){
  // Tampilkan hint hanya di perangkat touch dan kalau audio belum unlock
  var isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if(!isMobile) return;
  var hint = document.getElementById('audio-tap-hint');
  var shown = false;
  function showHint(){
    if(shown || _au) return;
    shown = true;
    hint.classList.add('show');
    // Sembunyikan otomatis setelah audio unlock atau 6 detik
    var hideTimer = setTimeout(function(){ hint.classList.remove('show'); }, 6000);
    document.addEventListener('click', function hide(){
      clearTimeout(hideTimer);
      hint.classList.remove('show');
      document.removeEventListener('click', hide);
    }, { once: true });
  }
  // Tampilkan hint 1.5 detik setelah halaman siap (setelah splash)
  document.addEventListener('nm:splashDone', function(){ setTimeout(showHint, 1500); }, { once: true });
})();

// ===== AUDIO ERROR HANDLER =====
(function(){
  var errShown = false;
  var el = document.getElementById('am');
  if(!el) return;
  el.addEventListener('error', function(){
    if(errShown) return;
    errShown = true;
    var err = document.getElementById('audio-err');
    if(err){ err.style.display='block'; setTimeout(function(){ err.style.display='none'; errShown=false; }, 5000); }
  });
})();

// ===== LOCK GATE COUNTDOWN & AUTO-UNLOCK =====
(function(){
  if(typeof window._nmUnlockAt === 'undefined') return;
  var UNLOCK_AT = window._nmUnlockAt;
  var START_AT = (function(){ var d = new Date(UNLOCK_AT); d.setFullYear(d.getFullYear()-1); return d.getTime(); })();
  var TOTAL_SPAN = UNLOCK_AT - START_AT;
  var MILESTONES = [100,30,14,7,3,1];
  var shownMilestone = false;
  function showMilestone(days){
    var el = document.getElementById('lk-milestone');
    if(!el || shownMilestone) return;
    var key = 'lk_ms_' + days;
    try{ if(localStorage.getItem(key)) return; }catch(e){}
    shownMilestone = true;
    el.textContent = days === 1 ? '✦ Besok akhirnya tiba ✦' : '✦ Tinggal ' + days + ' hari lagi ✦';
    el.classList.add('lk-show');
    try{ localStorage.setItem(key,'1'); }catch(e){}
    setTimeout(function(){ el.classList.remove('lk-show'); shownMilestone=false; }, 5000);
  }
  function paint(){
    var diff = window._nmUnlockAt - Date.now();
    if(diff <= 0){
      clearInterval(lkIv);
      if(typeof lockGateOpen==='function') lockGateOpen();
      else { document.documentElement.classList.remove('nm-locked'); window.dispatchEvent(new Event('nm:unlocked')); }
      return;
    }
    var d = Math.floor(diff/864e5);
    var h = Math.floor((diff%864e5)/36e5);
    var m = Math.floor((diff%36e5)/6e4);
    var s = Math.floor((diff%6e4)/1000);
    var set=function(id,v){var el=document.getElementById(id);if(el)el.textContent=String(v).padStart(2,'0');};
    set('lk-d', d); set('lk-h', h); set('lk-m', m); set('lk-s', s);

    // Progres bulan menuju dekade kedua
    var pct = Math.max(0, Math.min(1, (Date.now()-START_AT)/TOTAL_SPAN)) * 100;
    var fill = document.getElementById('lk-progress-fill');
    var moon = document.getElementById('lk-progress-moon');
    var lbl = document.getElementById('lk-progress-label');
    if(fill) fill.style.width = pct + '%';
    if(moon) moon.style.left = pct + '%';
    if(lbl) lbl.textContent = 'Menuju Dekade Kedua · ' + Math.round(pct) + '%';

    // Ambient makin hidup mendekati hari-H
    var gate = document.getElementById('lockgate');
    if(gate){
      gate.classList.toggle('lk-phase-near', d <= 30 && d > 7);
      gate.classList.toggle('lk-phase-close', d <= 7);
    }

    // Toast perayaan milestone (sekali per ambang, tersimpan agar tak berulang)
    if(MILESTONES.indexOf(d) !== -1 && h===0 && m<2){ showMilestone(d); }
  }
  paint();
  var lkIv = setInterval(paint, 1000);

  // ===== BANTUAN TESTING (aman, tidak memengaruhi pengunjung asli) =====
  // Buka console browser (F12), lalu panggil salah satu dari:
  //   __lkTest.milestone(7)         → preview toast "Tinggal 7 hari lagi"
  //   __lkTest.phase('lk-phase-close') → preview ambient mode dekat hari-H
  //   __lkTest.phase(null)          → kembalikan ambient ke normal
  //   __lkTest.resetMilestones()    → hapus tanda "sudah pernah tampil" biar toast asli bisa muncul lagi nanti
  window.__lkTest = {
    milestone: function(d){
      var el = document.getElementById('lk-milestone');
      if(!el){ console.warn('Elemen lockgate belum ada di halaman ini.'); return; }
      el.textContent = d === 1 ? '✦ Besok akhirnya tiba ✦' : '✦ Tinggal ' + d + ' hari lagi ✦';
      el.classList.add('lk-show');
      setTimeout(function(){ el.classList.remove('lk-show'); }, 5000);
      console.log('Preview toast milestone ' + d + ' hari ditampilkan 5 detik.');
    },
    phase: function(name){
      var g = document.getElementById('lockgate');
      if(!g){ console.warn('Elemen lockgate belum ada di halaman ini.'); return; }
      g.classList.remove('lk-phase-near','lk-phase-close');
      if(name) g.classList.add(name);
      console.log('Ambient phase sekarang: ' + (name || 'normal (jauh dari hari-H)'));
    },
    resetMilestones: function(){
      var n = 0;
      Object.keys(localStorage).forEach(function(k){ if(k.indexOf('lk_ms_')===0){ localStorage.removeItem(k); n++; } });
      console.log('Reset ' + n + ' tanda milestone. Toast asli akan muncul lagi saat ambang tercapai.');
    }
  };

  // Partikel melayang lembut di latar gerbang
  function startParticles(){
    var cv = document.getElementById('lk-canvas');
    if(!cv) return;
    var ctx = cv.getContext('2d');
    function resize(){ cv.width = window.innerWidth; cv.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    var colors = ['rgba(246,203,122,', 'rgba(178,206,166,', 'rgba(241,160,148,'];
    var N = window.innerWidth < 600 ? 36 : 64;
    var pts = [];
    for(var i=0;i<N;i++){
      pts.push({
        x: Math.random()*cv.width,
        y: Math.random()*cv.height,
        r: Math.random()*1.6+.5,
        sp: Math.random()*.35+.08,
        ph: Math.random()*Math.PI*2,
        c: colors[i % colors.length]
      });
    }
    var raf;
    function loop(){
      if(!document.documentElement.classList.contains('nm-locked')){ raf=null; return; }
      ctx.clearRect(0,0,cv.width,cv.height);
      var now = Date.now()*.001;
      for(var i=0;i<pts.length;i++){
        var p = pts[i];
        var a = .25 + Math.sin(now + p.ph)*.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.c + Math.max(0,a) + ')';
        ctx.fill();
        p.y -= p.sp;
        p.x += Math.sin(now*.5 + p.ph)*.15;
        if(p.y < -5){ p.y = cv.height+5; p.x = Math.random()*cv.width; }
      }
      raf = requestAnimationFrame(loop);
    }
    loop();
  }
  if(document.documentElement.classList.contains('nm-locked')) startParticles();

  // Akses dini lewat kata sandi rahasia (klik huruf N)
  var SECRET_PW = '20052007';
  var letter = document.getElementById('lk-emletter');
  var pwwrap = document.getElementById('lk-pwwrap');
  var pwinput = document.getElementById('lk-pwinput');
  var pwerr = document.getElementById('lk-pwerr');
  function togglePw(){
    if(!pwwrap) return;
    var opening = !pwwrap.classList.contains('lk-pwopen');
    pwwrap.classList.toggle('lk-pwopen');
    if(opening && pwinput){ setTimeout(function(){ pwinput.focus(); }, 350); }
  }
  function tryUnlock(){
    if(!pwinput) return;
    if(pwinput.value === SECRET_PW){
      clearInterval(lkIv);
      if(typeof lockGateOpen==='function') lockGateOpen();
      else { document.documentElement.classList.remove('nm-locked'); window.dispatchEvent(new Event('nm:unlocked')); }
    } else {
      pwerr.classList.add('lk-show');
      pwinput.classList.add('lk-shake');
      setTimeout(function(){ pwinput.classList.remove('lk-shake'); }, 400);
      pwinput.value = '';
    }
  }
  if(letter){
    letter.addEventListener('click', togglePw);
    letter.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); togglePw(); } });
  }
  if(pwinput){
    pwinput.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); e.stopPropagation(); tryUnlock(); } });
    pwinput.addEventListener('input', function(){ pwerr.classList.remove('lk-show'); });
  }
})();
