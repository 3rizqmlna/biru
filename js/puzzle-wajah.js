
window.pzState={locked:0,dragging:null,dragOffX:0,dragOffY:0};
(function(){
  var COLS=3,ROWS=3,TOTAL=9;
  var BW=270,BH=270;
  var PW=90,PH=90;

  /* Draw the master flower SVG onto an offscreen canvas */
  function drawMasterFlower(size){
    var oc=document.createElement('canvas');
    oc.width=size;oc.height=size;
    var ctx=oc.getContext('2d');
    var cx=size/2,cy=size/2;
    var R=size*0.42; // petal reach

    /* Background subtle glow */
    var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,size*.5);
    bg.addColorStop(0,'rgba(242,180,65,0.08)');bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg;ctx.fillRect(0,0,size,size);

    /* 6 petals */
    var petalColors=['#E8604C','#F1A094','#d4879e','#F2B441','#F6CB7A','#d4a062'];
    for(var i=0;i<6;i++){
      var a=(i/6)*Math.PI*2-Math.PI/2;
      var px=cx+Math.cos(a)*R*0.52,py=cy+Math.sin(a)*R*0.52;
      ctx.save();
      ctx.translate(px,py);ctx.rotate(a+Math.PI/2);
      var pg=ctx.createRadialGradient(0,-R*.2,2,0,0,R*.45);
      pg.addColorStop(0,petalColors[i]);
      pg.addColorStop(1,petalColors[(i+3)%6]+'88');
      ctx.fillStyle=pg;
      ctx.beginPath();
      ctx.ellipse(0,0,R*.38,R*.72,0,0,Math.PI*2);
      ctx.fill();
      /* petal vein */
      ctx.strokeStyle='rgba(255,253,247,0.25)';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,R*.55);ctx.lineTo(0,-R*.35);ctx.stroke();
      ctx.restore();
    }

    /* 2 leaves */
    ctx.save();ctx.translate(cx,cy);ctx.rotate(0.4);
    ctx.fillStyle='#7FAE6A';
    ctx.beginPath();ctx.moveTo(0,R*.2);
    ctx.bezierCurveTo(-R*.5,R*.1,-R*.85,-R*.1,-R*.7,-R*.5);
    ctx.bezierCurveTo(-R*.35,-R*.2,-R*.1,-R*.05,0,R*.2);
    ctx.fill();
    ctx.strokeStyle='rgba(178,206,166,.45)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,R*.2);ctx.lineTo(-R*.5,-R*.25);ctx.stroke();
    ctx.restore();

    ctx.save();ctx.translate(cx,cy);ctx.rotate(-0.5);
    ctx.fillStyle='#B2CEA6';
    ctx.beginPath();ctx.moveTo(0,R*.2);
    ctx.bezierCurveTo(R*.5,R*.1,R*.85,-R*.1,R*.7,-R*.5);
    ctx.bezierCurveTo(R*.35,-R*.2,R*.1,-R*.05,0,R*.2);
    ctx.fill();
    ctx.restore();

    /* Stem */
    ctx.strokeStyle='#7FAE6A';ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx,cy+R*.15);ctx.lineTo(cx,size*.92);ctx.stroke();

    /* Center disc */
    var cg=ctx.createRadialGradient(cx-3,cy-3,2,cx,cy,R*.22);
    cg.addColorStop(0,'#FFFDF7');cg.addColorStop(.5,'#F6CB7A');cg.addColorStop(1,'#F2B441');
    ctx.fillStyle=cg;
    ctx.beginPath();ctx.arc(cx,cy,R*.2,0,Math.PI*2);ctx.fill();

    /* Center dot */
    ctx.fillStyle='rgba(255,253,247,.95)';
    ctx.beginPath();ctx.arc(cx,cy,R*.07,0,Math.PI*2);ctx.fill();

    return oc;
  }

  function pzInit(){
    // Cancel any active drag from previous session
    if(window.pzState.dragging){
      try{window.pzState.dragging.releasePointerCapture(0);}catch(e){}
      window.pzState.dragging=null;
    }
    window.pzState.locked=0;
    var board=document.getElementById('pz-board');
    var tray=document.getElementById('pz-tray');
    if(!board||!tray)return;
    board.innerHTML='';tray.innerHTML='';
    // Reset board style from completed state
    board.style.boxShadow='';board.style.border='';
    var suc=document.getElementById('pzSuccess');if(suc)suc.style.display='none';
    var fill=document.getElementById('pzFill');if(fill)fill.style.width='0%';
    var txt=document.getElementById('pzTxt');if(txt)txt.textContent='0/'+TOTAL;
    var hb=document.getElementById('pzHintBox');if(hb)hb.style.display='none';
    var pzA=document.getElementById('pzArea');if(pzA)pzA.style.display='';
    var pzH=document.getElementById('pzHeader');if(pzH)pzH.style.display='';
    var pzP=document.getElementById('pzProg');if(pzP)pzP.style.display='';
    // Always restore btn-hint and tray visibility
    var pzTray=document.getElementById('pz-tray');if(pzTray)pzTray.style.display='';
    var btnHint=document.querySelector('#spz .pz-wrap .btn-hint');if(btnHint)btnHint.style.display='';

    /* Draw master flower */
    var master=drawMasterFlower(BW);

    /* Ghost slots */
    for(var i=0;i<TOTAL;i++){
      var gc=i%COLS,gr=Math.floor(i/COLS);
      var ghost=document.createElement('canvas');
      ghost.className='pz-ghost';
      ghost.width=PW;ghost.height=PH;
      ghost.style.cssText='position:absolute;left:'+(gc*PW)+'px;top:'+(gr*PH)+'px;width:'+PW+'px;height:'+PH+'px;opacity:0.12;pointer-events:none;border:1px dashed rgba(127,174,106,0.25);';
      /* draw portion of flower dimmed */
      var gctx=ghost.getContext('2d');
      gctx.drawImage(master,gc*PW,gr*PH,PW,PH,0,0,PW,PH);
      board.appendChild(ghost);
    }

    /* Shuffle */
    var order=[];for(var k=0;k<TOTAL;k++)order.push(k);
    for(var k=order.length-1;k>0;k--){var j2=Math.floor(Math.random()*(k+1));var tmp=order[k];order[k]=order[j2];order[j2]=tmp;}

    /* Create piece canvases in tray */
    order.forEach(function(idx){
      var piece=document.createElement('canvas');
      piece.className='pz-piece';
      piece.width=PW;piece.height=PH;
      piece.dataset.target=String(idx);
      piece.dataset.inTray='1';
      var pc=idx%COLS,pr=Math.floor(idx/COLS);
      /* draw the corresponding slice */
      var pctx=piece.getContext('2d');
      pctx.drawImage(master,pc*PW,pr*PH,PW,PH,0,0,PW,PH);
      /* border highlight */
      pctx.strokeStyle='rgba(242,180,65,.3)';pctx.lineWidth=1;
      pctx.strokeRect(.5,.5,PW-1,PH-1);

      piece.style.cssText='display:inline-block;width:'+PW+'px;height:'+PH+'px;cursor:grab;flex-shrink:0;touch-action:none;box-shadow:0 2px 8px rgba(0,0,0,.5);border-radius:3px;';
      tray.appendChild(piece);
      piece.addEventListener('pointerdown',onPD);
    });
  }

  function onPD(e){
    if(e.target.closest('.pz-piece.locked'))return;
    var piece=e.target.closest('.pz-piece')||e.target;
    if(!piece||!piece.dataset||window.pzState.dragging)return;
    e.preventDefault();
    piece.setPointerCapture(e.pointerId);
    var board=document.getElementById('pz-board');
    var boardR=board.getBoundingClientRect();

    if(piece.dataset.inTray==='1'){
      var r=piece.getBoundingClientRect();
      var initL=r.left-boardR.left,initT=r.top-boardR.top;
      piece.dataset.inTray='0';
      var tray=document.getElementById('pz-tray');
      tray.removeChild(piece);
      piece.style.cssText='position:absolute;width:'+PW+'px;height:'+PH+'px;left:'+initL+'px;top:'+initT+'px;cursor:grabbing;touch-action:none;z-index:999;box-shadow:0 10px 28px rgba(0,0,0,.6);border-radius:3px;';
      board.appendChild(piece);
      window.pzState.dragOffX=e.clientX-r.left;
      window.pzState.dragOffY=e.clientY-r.top;
    } else {
      piece.style.zIndex='999';piece.style.cursor='grabbing';
      window.pzState.dragOffX=e.clientX-(boardR.left+parseFloat(piece.style.left||0));
      window.pzState.dragOffY=e.clientY-(boardR.top+parseFloat(piece.style.top||0));
    }
    window.pzState.dragging=piece;
    piece.addEventListener('pointermove',onPM);
    piece.addEventListener('pointerup',onPU);
    piece.addEventListener('pointercancel',onPU);
  }

  function onPM(e){
    var piece=window.pzState.dragging;if(!piece)return;
    e.preventDefault();
    var board=document.getElementById('pz-board');
    var boardR=board.getBoundingClientRect();
    piece.style.left=(e.clientX-boardR.left-window.pzState.dragOffX)+'px';
    piece.style.top=(e.clientY-boardR.top-window.pzState.dragOffY)+'px';
  }

  function onPU(e){
    var piece=window.pzState.dragging;if(!piece)return;
    piece.removeEventListener('pointermove',onPM);
    piece.removeEventListener('pointerup',onPU);
    piece.removeEventListener('pointercancel',onPU);
    window.pzState.dragging=null;
    piece.style.cursor='grab';piece.style.zIndex='';

    var board=document.getElementById('pz-board');
    var boardR=board.getBoundingClientRect();
    var cx=e.clientX-boardR.left,cy=e.clientY-boardR.top;
    var tgt=parseInt(piece.dataset.target);
    var tCol=tgt%COLS,tRow=Math.floor(tgt/COLS);
    var tx=tCol*PW,ty=tRow*PH;
    var dist=Math.sqrt(Math.pow(cx-(tx+PW/2),2)+Math.pow(cy-(ty+PH/2),2));

    if(dist<PW*0.6){
      piece.style.left=tx+'px';piece.style.top=ty+'px';
      piece.style.boxShadow='0 0 12px rgba(242,180,65,.5)';
      piece.classList.add('locked');piece.style.cursor='default';
      piece.removeEventListener('pointerdown',onPD);
      window.pzState.locked++;
      var pct=Math.round(window.pzState.locked/TOTAL*100);
      var fill=document.getElementById('pzFill');if(fill)fill.style.width=pct+'%';
      var txt=document.getElementById('pzTxt');if(txt)txt.textContent=window.pzState.locked+'/'+TOTAL;
      if(typeof sfx==='function')sfx('ok');
      if(window.pzState.locked===TOTAL){
        setTimeout(function(){
          if(typeof sfx==='function')sfx('win');
          board.style.boxShadow='0 0 40px rgba(242,180,65,.5)';
          board.style.border='1px solid rgba(242,180,65,.4)';
          document.getElementById('pz-tray').style.display='none';
          var pzA=document.getElementById('pzArea');if(pzA)pzA.style.display='none';
          var pzH=document.getElementById('pzHeader');if(pzH)pzH.style.display='none';
          var pzP=document.getElementById('pzProg');if(pzP)pzP.style.display='none';
          var hb=document.getElementById('pzHintBox');if(hb)hb.style.display='none';
          document.querySelector('#spz .pz-wrap .btn-hint').style.display='none';
          var suc=document.getElementById('pzSuccess');if(suc)suc.style.display='flex';
          pzBurst();
        },400);
      }
    } else {
      if(cx<-20||cy<-20||cx>BW+20||cy>BH+20){
        var tray=document.getElementById('pz-tray');
        piece.dataset.inTray='1';
        piece.style.cssText='display:inline-block;width:'+PW+'px;height:'+PH+'px;cursor:grab;flex-shrink:0;touch-action:none;box-shadow:0 2px 8px rgba(0,0,0,.5);border-radius:3px;';
        tray.appendChild(piece);
      }
    }
  }

  function pzBurst(){
    var screen=document.getElementById('spz');
    var cols=['#E8604C','#F6CB7A','#7FAE6A','#8FCBEA','#F1A094'];
    for(var i=0;i<30;i++){
      var p=document.createElement('div');
      var sz=5+Math.random()*10;
      p.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;background:'+cols[i%cols.length]+';border-radius:50%;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;opacity:0;pointer-events:none;z-index:1;animation:pzPop '+(0.5+Math.random()*0.9)+'s ease-out '+(Math.random()*0.5)+'s forwards;';
      screen.appendChild(p);
      setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},2500);
    }
  }

  window.pzShowHint=function(){
    var tray=document.getElementById('pz-tray');
    var trayCvs=tray?tray.querySelectorAll('.pz-piece:not(.locked)'):[];
    var first=trayCvs.length?trayCvs[0]:null;
    if(first){
      first.style.outline='3px solid rgba(242,180,65,.9)';
      first.style.outlineOffset='2px';
      var tgt=parseInt(first.dataset.target);
      var tc=tgt%COLS,tr=Math.floor(tgt/COLS);
      var board=document.getElementById('pz-board');
      var ghosts=board?board.querySelectorAll('.pz-ghost'):[];
      var gi=tc+tr*COLS;
      if(ghosts[gi]){ghosts[gi].style.opacity='0.5';ghosts[gi].style.outline='2px solid rgba(242,180,65,.6)';}
      setTimeout(function(){
        first.style.outline='';first.style.outlineOffset='';
        if(ghosts[gi]){ghosts[gi].style.opacity='0.12';ghosts[gi].style.outline='';}
      },2000);
    }
    var hb=document.getElementById('pzHintBox');
    if(hb){hb.textContent='Kepingan yang bersinar — seret ke slot yang menyala di papan!';hb.style.display='block';}
    setTimeout(function(){if(hb)hb.style.display='none';},2500);
  };

  var styleEl=document.createElement('style');
  styleEl.textContent='@keyframes pzPop{0%{opacity:0;transform:scale(0) translateY(0)}60%{opacity:1;transform:scale(1.3) translateY(-30px)}100%{opacity:0;transform:scale(.5) translateY(-70px)}}';
  document.head.appendChild(styleEl);

  var pzRunning=false;
  function safePzInit(){
    if(pzRunning)return;
    pzRunning=true;
    setTimeout(function(){
      pzInit();
      pzRunning=false;
    },350);
  }
  // Expose globally so resetAll and devSkip can call it
  window.pzReinit=function(){
    // Disconnect observer sementara agar resetAll tidak memicu double-init
    pzObs.disconnect();
    pzRunning=false;
    window.pzState.locked=0;
    window.pzState.dragging=null;
    // Langsung init tanpa delay — dipanggil setelah DOM sudah bersih oleh resetAll
    pzInit();
    // Reconnect observer setelah init selesai
    setTimeout(function(){
      var spz=document.getElementById('spz');
      if(spz)pzObs.observe(spz,{attributes:true,attributeFilter:['class']});
    },100);
  };
  var pzObs=new MutationObserver(function(){
    var spz=document.getElementById('spz');
    if(spz&&spz.classList.contains('active')){safePzInit();}
    else{pzRunning=false;} // reset guard when leaving stage
  });
  function startPzObs(){var spz=document.getElementById('spz');if(spz)pzObs.observe(spz,{attributes:true,attributeFilter:['class']});}
  document.addEventListener('DOMContentLoaded',startPzObs);
  window.addEventListener('load',startPzObs);
})();
