/* ===== 공통 UI: 상단 크레딧 픽셀 줄 · 도트 로고 · 튜토리얼 ===== */
(function(){
const PAL=['#e8284f','#f26a0d','#f2b000','#10b870','#00a8e0','#2a5ef0','#8a3cf0'];
function spectrum(){document.querySelectorAll('.lcd-label .ln').forEach(el=>{let cv=el.querySelector('canvas');if(!cv){cv=document.createElement('canvas');el.appendChild(cv)}cv.style.width='0px';const avail=el.clientWidth;if(!avail)return;
  const dpr=window.devicePixelRatio||1,P=3,G=1,rows=2,cols=Math.max(0,Math.floor((avail+G)/(P+G))),w=Math.max(1,cols*(P+G)-G);
  cv.width=Math.round(w*dpr);cv.height=Math.round((rows*(P+G)-G)*dpr);cv.style.width=w+'px';cv.style.height=(rows*(P+G)-G)+'px';
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,10);const per=Math.max(1,Math.round(cols/PAL.length));
  for(let i=0;i<cols;i++){c.fillStyle=PAL[Math.min(PAL.length-1,Math.floor(i/per))];for(let r=0;r<rows;r++)c.fillRect(i*(P+G),r*(P+G),P,P)}})}
window.phSpectrum=spectrum;
addEventListener('resize',spectrum);setTimeout(spectrum,50);setTimeout(spectrum,1500);try{document.fonts.ready.then(spectrum)}catch(e){}
const F={Y:'10001100010101000100001000010000100',A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',C:'01111100001000010000100001000001111',E:'11111100001000011110100001000011111',G:'01111100001000010111100011000101111',H:'10001100011000111111100011000110001',I:'11111001000010000100001000010011111',K:'10001100101010011000101001001010001',N:'10001110011010110011100011000110001',P:'11110100011000111110100001000010000',R:'11110100011000111110101001001010001',S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',W:'10001100011000110101101011010101010',M:'10001110111010110101100011000110001',D:'11110100011000110001100011000111110',U:'10001100011000110001100011000101110',O:'01110100011000110001100011000101110',L:'10000100001000010000100001000011111',F:'11111100001000011110100001000010000',X:'10001100010101000100010101000110001'};
window.phLogo=function(word){const cell=12,lines=word.split('|'),W=Math.max(...lines.map(l=>l.length))*6*cell-cell,LH=8*cell+cell/2;let o='',k=0; /* '|'로 줄바꿈 (가운데 정렬) */
  lines.forEach((ln,r)=>{const ox=(W-(ln.length*6*cell-cell))/2,oy=r*LH;[...ln].forEach((ch,i)=>{const g=F[ch],c=PAL[k++%7];for(let y=0;y<7;y++)for(let x=0;x<5;x++){const on=g[y*5+x]==='1';o+=`<circle cx="${ox+i*6*cell+x*cell+cell/2}" cy="${oy+y*cell+cell/2}" r="${cell*.38}" fill="${on?c:'rgba(255,255,255,.06)'}"/>`}})});
  return `<svg viewBox="0 0 ${W} ${(lines.length-1)*LH+7*cell}" xmlns="http://www.w3.org/2000/svg">${o}</svg>`};
window.phTut=function(key,cfg,go){let seen=false;try{seen=localStorage.getItem(key)==='1'}catch(e){}
  if(seen||window.phTutDone){go();return}
  const touch=matchMedia('(pointer:coarse)').matches,rows=(touch?cfg.touch:cfg.pc)||cfg.touch;
  const d=document.createElement('div');d.className='phT';
  d.innerHTML=`<div class="phT-c"><div class="phT-h">HOW TO PLAY</div><div class="phT-g">${cfg.goal}</div><div class="phT-r">${rows.map(r=>`<kbd>${r[0]}</kbd><span>${r[1]}</span>`).join('')}</div><label class="phT-k"><input type="checkbox" id="phTchk">다시 보지 않기</label><button class="phS-b" id="phTgo">START</button></div>`;
  document.body.appendChild(d);
  const blk=e=>{e.stopPropagation();if(e.key==='Enter'||e.key===' '){e.preventDefault();d.querySelector('#phTgo').click()}};addEventListener('keydown',blk,true);
  d.querySelector('#phTgo').onclick=e=>{e.stopPropagation();removeEventListener('keydown',blk,true);if(d.querySelector('#phTchk').checked){try{localStorage.setItem(key,'1')}catch(_){}}window.phTutDone=true;d.remove();go()};
  ['pointerdown','touchstart','keydown'].forEach(t=>d.addEventListener(t,e=>e.stopPropagation()))};
function fill(){document.querySelectorAll('.phS-logo[data-word]').forEach(el=>{el.innerHTML=window.phLogo(el.dataset.word)});document.querySelectorAll('.phS [data-click]').forEach(b=>{if(b._ph)return;b._ph=1;b.addEventListener('click',e=>{e.stopPropagation();const t=document.getElementById(b.dataset.click);if(t)t.click()})})}
/* 홈 화면 앱(게임 모음)에서 열었을 때: 위쪽 크레딧 줄을 '◀ GAMES' 버튼으로 (게임 목록으로 돌아가기) */
function back(){let sa=false;try{sa=navigator.standalone||matchMedia('(display-mode: standalone)').matches}catch(e){}if(!sa||/^\/games\/?$/.test(location.pathname))return;
  const GN={petris:'PETRIS',switchpang:'SWITCH PANG',fruitpang:'MARBLE PANG',mines:'MINESWEEPER',pang:'PANGYA PANGYA',bricks:'BRICKS',hangulbi:'HANGULBI',twinstar:'TWIN STAR',peekaboo:'PEEKABOO'},gid=location.pathname.split('/')[1]||'',lab='◀ PARK HYONA\'S '+(GN[gid]||gid.toUpperCase()); // 게임 이름까지 표시
  const go=e=>{e.preventDefault();e.stopPropagation();location.href='/games/'};const els=document.querySelectorAll('.lcd-label .copy');
  if(els.length){els.forEach(el=>{if(el._bk)return;el._bk=1;el.textContent=lab;el.style.cssText+=';cursor:pointer;pointer-events:auto;position:relative;z-index:50';el.addEventListener('click',go)})}
  else if(!document.getElementById('phBack')){const b=document.createElement('a');b.id='phBack';b.href='/games/';b.textContent=lab;b.style.cssText='position:fixed;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 6px);z-index:9999;font:700 10px Silkscreen,monospace;letter-spacing:1px;color:#fff;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:5px 8px;text-decoration:none';b.addEventListener('click',go);document.body.appendChild(b)}}
function fill2(){fill();back()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fill2);else fill2();
})();
