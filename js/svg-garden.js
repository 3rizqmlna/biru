
(function(){
  var STAGES_VG=[
    {name:'TUNAS',   drops:5,  msg:'Tunas baru saja muncul...'},
    {name:'KECAMBAH',drops:7,  msg:'Akarnya mulai mencengkeram tanah'},
    {name:'BATANG',  drops:8,  msg:'Ia tumbuh menuju cahaya...'},
    {name:'DAUN',    drops:8,  msg:'Daun-daun merentang menyambut embun'},
    {name:'KUNCUP',  drops:7,  msg:'Sebuah kuncup kecil menyimpan janji...'},
    {name:'MEKAR',   drops:0,  msg:'Bunga itu mekar -- seperti dirimu.'}
  ];
  var C=document.getElementById('vg-canvas');
  if(!C)return;
  var ctx=C.getContext('2d');
  var W=280,H=280;
  var stageIdx=0,drops=0,animF=null,tt=0,bloomed=false;
  var droplets=[],particles=[];

  function lerp(a,b,v){return a+(b-a)*v;}
  function clamp(v,mn,mx){return Math.max(mn,Math.min(mx,v));}

  function growP(){
    if(stageIdx>=STAGES_VG.length-1)return 1;
    var need=STAGES_VG[stageIdx].drops;
    return need>0?clamp(drops/need,0,1):0;
  }
  function totalP(){
    var total=STAGES_VG.reduce(function(s,v){return s+v.drops;},0);
    var done=STAGES_VG.slice(0,stageIdx).reduce(function(s,v){return s+v.drops;},0)+drops;
    return clamp(done/total,0,1);
  }
  function stemHeight(){return lerp(0,150,clamp(totalP()*1.6,0,1));}

  function drawSoil(){
    ctx.fillStyle='#2a1e14';
    ctx.beginPath();ctx.ellipse(W/2,H-28,130,28,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3d2a18';
    ctx.beginPath();ctx.ellipse(W/2,H-32,80,10,0,0,Math.PI*2);ctx.fill();
    [[100,H-22,3],[170,H-20,2],[210,H-26,2.5],[80,H-26,2]].forEach(function(arr){
      ctx.fillStyle='rgba(60,45,30,.6)';ctx.beginPath();ctx.arc(arr[0],arr[1],arr[2],0,Math.PI*2);ctx.fill();
    });
    ctx.strokeStyle='rgba(127,174,106,.3)';ctx.lineWidth=1.5;
    for(var i=0;i<5;i++){
      var gx=W/2-80+i*40,gy=H-38;
      ctx.beginPath();ctx.moveTo(gx,gy);ctx.quadraticCurveTo(gx-4,gy-8,gx-2,gy-14);ctx.stroke();
      ctx.beginPath();ctx.moveTo(gx+4,gy);ctx.quadraticCurveTo(gx+7,gy-7,gx+5,gy-12);ctx.stroke();
    }
  }

  function drawStars(){
    var stars=[[30,30],[250,50],[20,150],[260,100],[40,220],[240,210],[130,20]];
    stars.forEach(function(s,i){
      var a=0.2+0.25*Math.abs(Math.sin(tt*0.02+i));
      ctx.fillStyle='rgba(143,203,234,'+a+')';ctx.beginPath();ctx.arc(s[0],s[1],1.2,0,Math.PI*2);ctx.fill();
    });
  }

  function drawStem(){
    var sh=stemHeight();if(sh<2)return;
    var bx=W/2,by=H-56;
    var tp=totalP();
    ctx.strokeStyle='#7FAE6A';ctx.lineWidth=3+tp*2;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(bx,by);
    ctx.bezierCurveTo(bx-6,by-sh*0.3,bx+8,by-sh*0.65,bx,by-sh);ctx.stroke();
    if(sh>60){
      ctx.strokeStyle='rgba(178,206,166,.4)';ctx.lineWidth=1;
      var mid=sh*0.5;
      ctx.beginPath();ctx.moveTo(bx,by-mid);ctx.lineTo(bx-16,by-mid-18);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bx,by-mid);ctx.lineTo(bx+14,by-mid-12);ctx.stroke();
    }
  }

  function drawLeaves(){
    var lsc=clamp((totalP()-0.3)/0.35,0,1);if(lsc<0.05)return;
    var sh=stemHeight(),bx=W/2,by=H-56;
    ctx.save();ctx.translate(bx-4,by-sh*0.35);ctx.scale(lsc,lsc);ctx.rotate(-0.5);
    ctx.fillStyle='#7FAE6A';ctx.beginPath();
    ctx.moveTo(0,0);ctx.bezierCurveTo(-22,-8,-34,-22,-28,-36);
    ctx.bezierCurveTo(-14,-24,-4,-12,0,0);ctx.fill();
    ctx.strokeStyle='rgba(178,206,166,.5)';ctx.lineWidth=0.8;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-20,-28);ctx.stroke();
    ctx.restore();
    ctx.save();ctx.translate(bx+4,by-sh*0.5);ctx.scale(lsc,lsc);ctx.rotate(0.6);
    ctx.fillStyle='#B2CEA6';ctx.beginPath();
    ctx.moveTo(0,0);ctx.bezierCurveTo(20,-6,32,-18,26,-32);
    ctx.bezierCurveTo(12,-20,4,-10,0,0);ctx.fill();
    ctx.restore();
  }

  function drawFlower(){
    var bs=clamp((totalP()-0.65)/0.2,0,1);if(bs<0.05)return;
    var ps=clamp((totalP()-0.85)/0.15,0,1);
    var sh=stemHeight(),bx=W/2,by=H-56;
    var fx=bx,fy=by-sh-2;
    if(ps>0.05){
      var colors=['#E8604C','#F1A094','#d4879e','#F2B441','#F1A094','#d4879e'];
      for(var i=0;i<6;i++){
        var a=(i/6)*Math.PI*2-Math.PI/2;
        var pr=22*ps;
        var px=fx+Math.cos(a)*pr*1.1,py=fy+Math.sin(a)*pr*1.1;
        ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI/2);
        ctx.fillStyle=colors[i];ctx.globalAlpha=0.88*ps;
        ctx.beginPath();ctx.ellipse(0,0,pr*0.55,pr*0.9,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha=1;
    }
    var br=bs*(ps>0.5?14:10+bs*8);
    var bg=ctx.createRadialGradient(fx-2,fy-2,1,fx,fy,br);
    bg.addColorStop(0,'#F6CB7A');bg.addColorStop(0.6,'#F2B441');bg.addColorStop(1,'rgba(242,180,65,.3)');
    ctx.fillStyle=bg;ctx.beginPath();ctx.arc(fx,fy,br,0,Math.PI*2);ctx.fill();
    if(ps>0.3){ctx.fillStyle='rgba(255,253,247,.9)';ctx.beginPath();ctx.arc(fx,fy,4*ps,0,Math.PI*2);ctx.fill();}
    if(ps>0.7){
      ctx.save();ctx.globalAlpha=(ps-0.7)/0.3*0.25;
      var gl=ctx.createRadialGradient(fx,fy,0,fx,fy,50);
      gl.addColorStop(0,'rgba(246,203,122,.6)');gl.addColorStop(1,'transparent');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(fx,fy,50,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
  }

  function drawDroplets(){
    droplets=droplets.filter(function(d){
      d.y+=d.vy;d.x+=d.vx;d.vy+=0.25;d.life-=1;d.r=Math.max(0,d.r-0.04);
      if(d.life<=0||d.r<=0)return false;
      ctx.save();ctx.globalAlpha=d.life/d.maxLife*0.8;
      ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
      ctx.restore();return true;
    });
  }

  function drawParticles(){
    particles=particles.filter(function(p){
      p.x+=p.vx;p.y+=p.vy;p.vy+=0.08;p.life-=1;
      if(p.life<=0)return false;
      ctx.save();ctx.globalAlpha=p.life/p.maxLife;
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
      ctx.restore();return true;
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    drawStars();drawSoil();drawStem();drawLeaves();drawFlower();drawDroplets();drawParticles();
    tt++;animF=requestAnimationFrame(draw);
  }

  function spawnDrop(cx,cy){
    for(var i=0;i<7;i++){
      droplets.push({x:cx+Math.random()*20-10,y:cy,vx:(Math.random()-0.5)*2.5,vy:-2-Math.random()*3,r:2+Math.random()*2.5,life:28+Math.random()*14,maxLife:42,color:'rgba('+(143+Math.random()*30|0)+','+(168+Math.random()*20|0)+',200,0.85)'});
    }
  }

  function spawnBloom(){
    var sh=stemHeight(),bx=W/2,fy=H-56-sh;
    var cols=['#E8604C','#F1A094','#F2B441','#F6CB7A','#B2CEA6','#FFFDF7'];
    for(var i=0;i<35;i++){
      var a=Math.random()*Math.PI*2,sp=1+Math.random()*4;
      particles.push({x:bx,y:fy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,r:2+Math.random()*3,life:50+Math.random()*30,maxLife:80,color:cols[i%cols.length]});
    }
  }

  function updateUI(){
    var si=Math.min(stageIdx,STAGES_VG.length-1);
    var s=STAGES_VG[si];
    document.getElementById('vgStageLbl').textContent=s.name;
    var need=s.drops;
    var pct=need>0?Math.round(drops/need*100):100;
    document.getElementById('vgBarFill').style.width=pct+'%';
    document.getElementById('vgDropLbl').textContent=drops+(need>0?' / '+need+' tetes':' tetes');
    var msg=STAGES_VG[Math.min(stageIdx,STAGES_VG.length-1)].msg;
    var el=document.getElementById('vgMsg');
    el.style.opacity='0';
    setTimeout(function(){el.textContent=msg;el.style.opacity='1';},300);
  }

  var tapping=false;
  function onTap(e){
    if(bloomed)return;
    e.preventDefault();
    if(tapping)return;tapping=true;setTimeout(function(){tapping=false;},80);
    var rect=C.getBoundingClientRect();
    var src=e.touches?e.touches[0]:e;
    var cx=(src.clientX-rect.left)*(W/rect.width);
    var cy=(src.clientY-rect.top)*(H/rect.height);
    var rip=document.createElement('div');
    rip.className='vg-ripple';
    rip.style.left=((src.clientX-rect.left)/rect.width*100)+'%';
    rip.style.top=((src.clientY-rect.top)/rect.height*100)+'%';
    document.getElementById('vgWrap').appendChild(rip);
    setTimeout(function(){rip.remove();},800);
    spawnDrop(cx,cy);
    if(typeof sfx==='function')sfx('tr');
    drops++;
    var need=STAGES_VG[stageIdx].drops;
    if(drops>=need&&stageIdx<STAGES_VG.length-1){
      drops=0;stageIdx++;
      if(typeof sfx==='function')sfx('ok');
      if(stageIdx===STAGES_VG.length-1){
        bloomed=true;
        setTimeout(function(){
          spawnBloom();
          if(typeof sfx==='function')sfx('win');
          document.getElementById('vgHint').style.display='none';
          document.getElementById('vgBarWrap').style.display='none';
          document.getElementById('vgMsg').style.display='none';
          var vgHW=document.getElementById('vgHintWrap');if(vgHW)vgHW.style.display='none';
          document.getElementById('vgSuccess').style.display='flex';
        },600);
      }
    }
    updateUI();
  }

  function vgInit(){
    stageIdx=0;drops=0;bloomed=false;droplets=[];particles=[];tt=0;
    if(animF){cancelAnimationFrame(animF);animF=null;}
    document.getElementById('vgHint').style.display='';
    document.getElementById('vgBarWrap').style.display='';
    document.getElementById('vgMsg').style.display='';
    document.getElementById('vgSuccess').style.display='none';
    var vgHW=document.getElementById('vgHintWrap');if(vgHW)vgHW.style.display='';
    var vgHB=document.getElementById('vgHintBox');if(vgHB)vgHB.style.display='none';
    updateUI();draw();
  }

  window.vgShowHint=function(){
    var hints=[
      'Sentuh gambar taman berkali-kali untuk menyiram!',
      'Setiap tahap butuh beberapa sentuhan — lihat progress bar di atas.',
      'Tunas → Kecambah → Batang → Daun → Kuncup → Mekar. Terus siram!',
      'Kamu hampir sampai! Lihat nama tahap berubah di progress bar.',
    ];
    var STAGES_HINT=['Sentuh gambar taman untuk menyiram tunas ✦','Terus sentuh — akarnya mulai tumbuh di bawah tanah!','Batang tumbuh ke atas! Siram terus menuju cahaya.','Daun mulai merentang. Siram hingga kuncup muncul!','Hampir mekar! Siram beberapa kali lagi...',''];
    var si=Math.min(stageIdx,STAGES_HINT.length-1);
    var msg=STAGES_HINT[si]||hints[Math.floor(Math.random()*hints.length)];
    var hb=document.getElementById('vgHintBox');
    if(hb){hb.textContent=msg;hb.style.display='block';}
    setTimeout(function(){if(hb)hb.style.display='none';},3000);
  };

  C.addEventListener('pointerdown',onTap);
  C.addEventListener('touchstart',onTap,{passive:false});

  var vgObs=new MutationObserver(function(){
    var sc=document.getElementById('svg-screen');
    if(sc&&sc.classList.contains('active')&&!animF){vgInit();}
    else if(sc&&!sc.classList.contains('active')&&animF){cancelAnimationFrame(animF);animF=null;}
  });
  function startObs(){var sc=document.getElementById('svg-screen');if(sc)vgObs.observe(sc,{attributes:true,attributeFilter:['class']});}
  document.addEventListener('DOMContentLoaded',startObs);
  window.addEventListener('load',startObs);
})();
