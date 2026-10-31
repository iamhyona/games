/* ===== 공통 UI: 상단 크레딧 픽셀 줄 · 도트 로고 · 튜토리얼 ===== */
(function(){
/* 듣던 음악(유튜브·유튜브 뮤직·스포티파이 등)이 끊기지 않게: 다른 앱 소리와 섞어 재생 + 무음 반복 재생 막기 */
function phAmb(){try{const as=navigator.audioSession;if(as&&as.type!=='ambient')as.type='ambient'}catch(e){}}
try{const as=navigator.audioSession;if(as){const pr=Object.getPrototypeOf(as),d=Object.getOwnPropertyDescriptor(pr,'type');
  if(d&&d.set&&d.get){Object.defineProperty(pr,'type',{configurable:true,enumerable:d.enumerable,get(){return d.get.call(this)},set(){d.set.call(this,'ambient')}})} /* 게임이 'playback'으로 바꿔도 항상 ambient */
  else{as.type='ambient';Object.defineProperty(as,'type',{configurable:true,get:()=>'ambient',set:()=>{}})}
  as.type='ambient'}}catch(e){}
/* 소리 끊김 방지 (2026-10-30): 영상·음악·전화·백그라운드 뒤 iOS가 소리 엔진을 멈추면(suspended/interrupted) 다음 터치·화면 복귀 때 자동으로 다시 켬 */
const PHAC=window.__phAC=[];
/* 2026-10-30 v2: 게임이 직접 만든 소리 엔진도 모두 찾아서 관리 (연결될 때 자동 등록) */
try{const cn=AudioNode.prototype.connect;AudioNode.prototype.connect=function(){try{const c=this.context;if(c&&PHAC.indexOf(c)<0&&!(typeof OfflineAudioContext!=='undefined'&&c instanceof OfflineAudioContext))PHAC.push(c)}catch(e){}return cn.apply(this,arguments)}}catch(e){}
/* 아이폰: 무음 스위치를 켰다 끄거나 다른 앱 소리가 끼어든 뒤 '켜져 있는데 소리만 안 나는' 상태 → 다음 터치 때 소리 엔진을 한 번 껐다 켜서 다시 연결 */
let phKick=false,phKickT=0;
try{const as=navigator.audioSession;if(as&&as.addEventListener)as.addEventListener('statechange',()=>{if(as.state!=='active')phKick=true})}catch(e){}
document.addEventListener('visibilitychange',()=>{if(document.hidden)phKick=true});
addEventListener('pagehide',()=>{phKick=true});
function phKickNow(){const now=Date.now();if(now-phKickT<1500)return;phKickT=now;phKick=false;for(const c of PHAC){if(c.state==='closed')continue;try{const p=c.suspend();(p&&p.then?p:Promise.resolve()).then(()=>{phAmb();return c.resume()}).catch(()=>{try{c.resume()}catch(e){}})}catch(e){}}}
function phWake(e){try{if(document.hidden)return;if(e&&e.isTrusted&&phKick&&PHAC.length){phKickNow();return}for(const c of PHAC){if(c.state!=='running'&&c.state!=='closed'){phAmb();try{const r=c.resume();r&&r.catch&&r.catch(()=>{})}catch(e){}}}}catch(e){}}
['pointerdown','touchstart','touchend','mousedown','keydown','click'].forEach(t=>addEventListener(t,phWake,{capture:true,passive:true}));
['pageshow','focus'].forEach(t=>addEventListener(t,()=>setTimeout(phWake,60)));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(phWake,60)});
try{for(const n of ['AudioContext','webkitAudioContext']){const C=window[n];if(!C||C._ph)continue;const W=function(...a){phAmb();const c=new C(...a);try{PHAC.push(c);c.addEventListener('statechange',()=>{if(c.state!=='running'&&c.state!=='closed'&&!document.hidden)setTimeout(phWake,300)})}catch(e){}return c};W.prototype=C.prototype;W._ph=1;window[n]=W;
  const rs=C.prototype.resume;if(rs)C.prototype.resume=function(){phAmb();return rs.apply(this,arguments)}}}catch(e){} /* 소리 엔진 켤 때마다 섞어 재생 다시 확인 */
try{if(window.speechSynthesis){const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){if(u&&(u.volume===0||!String(u.text||'').trim()))return;phAmb();return sp(u)}}}catch(e){} /* 소리 없는 음성 깨우기는 막음 (듣던 음악이 멈춤) */
try{const SIL=new Set(),cou=URL.createObjectURL.bind(URL);URL.createObjectURL=function(o){const u=cou(o);try{if(o instanceof Blob&&o.size<=9000&&/wav|^$/.test(o.type||''))SIL.add(u)}catch(e){}return u};
 const pl=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.loop&&(SIL.has(this.src)||SIL.has(this.currentSrc)))return Promise.resolve();return pl.apply(this,arguments)}}catch(e){}
/* 이름 기억: 한 번 입력하면 같은 기기의 모든 게임 랭킹 이름 칸에 자동으로 */
const NK=['petris-name','pang-name','fruit-name','bricks-name','mcb-name','mines-name'],NSEL='input[placeholder^="이름"],#rank-name,#vs-name';
function nmGet(){try{let n=localStorage.getItem('ph-name');if(!n)for(const k of NK){n=localStorage.getItem(k);if(n)break}return n||''}catch(e){return ''}}
function nmSet(n){n=(n||'').trim();if(!n)return;try{localStorage.setItem('ph-name',n);for(const k of NK)localStorage.setItem(k,n)}catch(e){}}
(function(){const n=nmGet();if(n)nmSet(n)})();
/* 랭킹 보기 제한: 이 기기의 랭킹 이름이 soooooo면, 정한 시각 이후 등록된 뚠캣·밍지 기록은 랭킹에서 뺌 (시트 기록은 그대로 · 다른 사람 화면은 그대로) */
const RK_HIDE=[{viewer:/^so{3,}$/i,who:'뚠캣',after:'2026-10-29 03:10'},{viewer:/^so{3,}$/i,who:'밍지',after:'2026-10-29 03:18'}];
function rkViewerNames(){const a=[];try{for(const k of ['ph-name','twinstar-name',...NK]){const v=localStorage.getItem(k);if(v)a.push(v.trim())}}catch(e){}return a}
(function(){const of=window.fetch;if(!of||of._phHide)return;
  const W=function(input){const p=of.apply(this,arguments);try{const u=String(input&&input.url||input);
    if(!/script\.google\.com\/macros\//.test(u)||/[?&]a=add\b/.test(u))return p;
    const names=rkViewerNames(),rules=RK_HIDE.filter(r=>names.some(n=>r.viewer.test(n)));if(!rules.length)return p;
    return p.then(res=>res.clone().json().then(j=>{if(j&&Array.isArray(j.top))j.top=j.top.filter(r=>!rules.some(x=>String(r.n).trim()===x.who&&String(r.d)>x.after));
      return new Response(JSON.stringify(j),{status:res.status,statusText:res.statusText,headers:{'Content-Type':'application/json'}})}).catch(()=>res))}catch(e){return p}};
  W._phHide=1;window.fetch=W})();
function nmFill(){const n=nmGet();if(!n)return;document.querySelectorAll(NSEL).forEach(i=>{if(!i.value)i.value=n.slice(0,+i.maxLength>0?+i.maxLength:20)})}
document.addEventListener('input',e=>{if(e.target.matches&&e.target.matches(NSEL))nmSet(e.target.value)},true);
document.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches(NSEL)&&!e.target.value)nmFill()},true);
setInterval(nmFill,700);
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
  return `<svg viewBox="0 0 ${W} ${(lines.length-1)*LH+7*cell}" style="--lw:${Math.round(W*4.4/12)}px" xmlns="http://www.w3.org/2000/svg">${o}</svg>`}; /* 2026-10-31: 모든 게임 타이틀 글자 크기 같게 (점 간격 4.4px) */
/* 게임 설명: 게임 시작할 때 자동으로 뜨지 않음. 보고 싶은 사람만 시작 화면 아래 '게임 설명' 버튼으로 */
window.phTut=function(key,cfg,go){try{localStorage.setItem('phTutCfg:'+location.pathname,JSON.stringify(cfg))}catch(e){}howBtn();
  go()}; // 자동으로 띄우지 않음 (설명은 시작 화면 '게임 설명' 버튼으로만)
function phTutShow(cfg,go){const touch=matchMedia('(pointer:coarse)').matches,rows=(touch?cfg.touch:cfg.pc)||cfg.touch||[];
  const d=document.createElement('div');d.className='phT';
  d.innerHTML=`<div class="phT-c"><div class="phT-h">HOW TO PLAY</div><div class="phT-g">${cfg.goal}</div><div class="phT-r">${rows.map(r=>`<kbd>${r[0]}</kbd><span>${r[1]}</span>`).join('')}</div>${go?'<label class="phT-k"><input type="checkbox" id="phTchk">다시 보지 않기</label>':''}<button class="phS-b" id="phTgo">${go?'START':'CLOSE'}</button></div>`;
  document.body.appendChild(d);
  const close=e=>{if(e)e.stopPropagation();removeEventListener('keydown',blk,true);d.remove();if(go)go()};
  const blk=e=>{e.stopPropagation();if(e.key==='Enter'||e.key===' '||e.key==='Escape'){e.preventDefault();close()}};addEventListener('keydown',blk,true);
  d.querySelector('#phTgo').onclick=close;const ck=d.querySelector('#phTchk');if(ck)ck.onchange=()=>{if(ck.checked)close()}; // 체크하면 바로 닫고 시작
  ['pointerdown','touchstart','keydown'].forEach(t=>d.addEventListener(t,e=>e.stopPropagation()))}
/* ===== 난이도 공통 (2026-10-29 개편): 색 EASY 노랑 · NORMAL 하늘 · HARD 빨강 · MASTER 보라 (벽돌깨기 버튼 색) ===== */
const LVK={e:'e',easy:'e','이지':'e',n:'n',normal:'n','노멀':'n',solo:'n',h:'h',hard:'h','하드':'h',m:'m',master:'m','마스터':'m',god:'m'};
const LVC={e:{b:'#f2b000',t:'#ffd84d',L:'E'},n:{b:'#00a8e0',t:'#7fd9ff',L:'N'},h:{b:'#e8284f',t:'#ff8aa0',L:'H'},m:{b:'#8a3cf0',t:'#c9a6ff',L:'M'}};
const lvKey=v=>LVK[String(v==null?'':v).trim().toLowerCase()]||null;
function phUiCss(){if(document.getElementById('phUiCss'))return;
  if(!document.getElementById('phNeoF')){const f=document.createElement('style');f.id='phNeoF';f.textContent='@font-face{font-family:"NeoDunggeunmo";src:url(https://cdn.jsdelivr.net/npm/@kfonts/neodgm@0.5.0/neodgm.woff2) format("woff2");font-display:swap}';document.head.appendChild(f)}if(!document.getElementById('phKoF')){const k=document.createElement('style');k.id='phKoF';k.textContent='/* 게임 속 한글은 모두 갈무리11 */@font-face{font-family:"NeoDunggeunmo";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-display:swap}@font-face{font-family:"DotGothic16";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-display:swap}@font-face{font-family:"Press Start 2P";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-display:swap}@font-face{font-family:"Jersey 15";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-display:swap}@font-face{font-family:"Silkscreen";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:400;font-display:swap}@font-face{font-family:"Silkscreen";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:700;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:100;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:200;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:300;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:400;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:500;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:600;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:700;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:800;font-display:swap}@font-face{font-family:"Pretendard";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-weight:900;font-display:swap}@font-face{font-family:"LED";src:url(https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/Galmuri11.woff2) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;font-display:swap}';document.head.appendChild(k)}
  if(!document.getElementById('phJerseyF')){const l=document.createElement('link');l.id='phJerseyF';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Jersey+15&display=swap';document.head.appendChild(l)} /* 숫자 글꼴 */
  const s=document.createElement('style');s.id='phUiCss';
  s.textContent=
  /* 슬라이드 토글 (모드 고르기) */
  '.phSeg{position:relative!important;display:flex!important;gap:0!important;width:min(300px,100%)!important;height:44px!important;box-sizing:border-box!important;border-radius:22px!important;background:#151729!important;border:2px solid #34375a!important;padding:3px!important;margin-left:auto!important;margin-right:auto!important;flex-shrink:0}'+
  '.phSeg>.phSegK{position:absolute;top:3px;bottom:3px;left:3px;width:0;border-radius:18px;background:#f2b000;transition:left .22s cubic-bezier(.3,.7,.2,1),width .22s;pointer-events:none;z-index:0}'+
  '.phSeg.phSeg>button{position:relative;z-index:1;flex:1 1 0!important;min-width:0!important;width:auto!important;height:auto!important;min-height:0!important;margin:0!important;background:none!important;border:0!important;box-shadow:none!important;border-radius:18px!important;padding:0 2px!important;font:400 10px "Silkscreen",monospace!important;letter-spacing:.06em!important;white-space:nowrap;color:#9aa0c4!important;cursor:pointer;display:flex!important;align-items:center;justify-content:center;transform:none!important;opacity:1!important}'+
  '.phSeg.phSeg>button.on{color:#111!important}.phSeg.phSeg>button small{display:none!important}'+
  /* 난이도 버튼 (세로) */
  '.phDiff.phDiff.phDiff{width:232px!important;max-width:100%!important;height:52px!important;min-height:0!important;box-sizing:border-box!important;border:3px solid var(--lvb)!important;box-shadow:inset 0 0 0 3px #08090f,inset 0 0 0 5px var(--lvs)!important;background:#08090f!important;color:var(--lvt)!important;font:400 15px "Silkscreen",monospace!important;letter-spacing:.2em!important;border-radius:0!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;padding:0!important;cursor:pointer}'+
  '.phDiff.phDiff.phDiff:active{transform:translateY(2px)}.phDiff.phDiff small,.phDiff.phDiff .mul{display:none!important}.phDiff.phDiff::before,.phDiff.phDiff::after{content:none!important;display:none!important}'+
  '.phDiff.lv-e{--lvb:#f2b000;--lvt:#ffd84d;--lvs:rgba(242,176,0,.33)}.phDiff.lv-n{--lvb:#00a8e0;--lvt:#7fd9ff;--lvs:rgba(0,168,224,.33)}.phDiff.lv-h{--lvb:#e8284f;--lvt:#ff8aa0;--lvs:rgba(232,40,79,.33)}.phDiff.lv-m{--lvb:#8a3cf0;--lvt:#c9a6ff;--lvs:rgba(138,60,240,.33)}'+
  /* 랭킹 난이도 작은 탭 (E N H) */
  '.phLvTabs{display:flex!important;gap:8px!important;justify-content:center;width:auto!important;margin:0 auto 8px!important}'+
  '.phLvTabs>button{width:44px!important;height:32px!important;flex:0 0 auto!important;box-sizing:border-box;border-radius:8px!important;padding:0!important;font:700 13px "Silkscreen",monospace!important;letter-spacing:0!important;background:transparent!important;border:2px solid var(--lvb)!important;color:var(--lvt)!important;cursor:pointer}'+
  '.phLvTabs>button.on{background:var(--lvb)!important;color:#111!important}'+
  '.phLvTabs>.lv-e{--lvb:#f2b000;--lvt:#ffd84d}.phLvTabs>.lv-n{--lvb:#00a8e0;--lvt:#7fd9ff}.phLvTabs>.lv-h{--lvb:#e8284f;--lvt:#ff8aa0}.phLvTabs>.lv-m{--lvb:#8a3cf0;--lvt:#c9a6ff}'+
  /* 게임 중 난이도 표시: 게임판 테두리·빛 + 왼쪽 위 글자 */
  '.phLvChip{position:absolute;top:4px;left:4px;z-index:5;min-width:18px;height:18px;box-sizing:border-box;border-radius:5px;border:2px solid var(--lvb);background:rgba(8,9,15,.8);color:var(--lvt);font:700 10px "Silkscreen",monospace;opacity:.92;display:flex;align-items:center;justify-content:center;pointer-events:none}'+
  /* 랭킹 숫자: 읽기 쉬운 둥근모 픽셀 글꼴 · 이름 한 줄 */
  '.list .s,.list .t,.rk li b,.rank li em,#rList .s{font-family:"Jersey 15",sans-serif!important;font-weight:400!important;font-size:16px!important;letter-spacing:.02em!important}'+
  '.list>div>span:nth-child(2){display:flex!important;align-items:center;min-width:0;white-space:nowrap}.list .nm,.rank .nm,.rk .nm{display:inline-block;flex:0 1 auto;font-style:normal!important;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lvb{flex:0 0 auto}.rank li span{display:flex;align-items:center;min-width:0;white-space:nowrap}.rk li{white-space:nowrap}';
  document.head.appendChild(s)}
/* 슬라이드 토글: .phSeg 안에서 class "on" 붙은 버튼으로 노란 손잡이가 미끄러짐 (게임 원래 클릭 동작은 그대로) */
function segPos(seg){let k=seg.querySelector(':scope>.phSegK');if(!k){k=document.createElement('i');k.className='phSegK';seg.insertBefore(k,seg.firstChild)}
  const on=seg.querySelector(':scope>button.on');if(!on||!on.offsetWidth){k.style.opacity=on?'1':'0';if(!on)return}k.style.opacity='1';k.style.left=on.offsetLeft+'px';k.style.width=on.offsetWidth+'px'}
window.phSeg=function(root){phUiCss();(root||document).querySelectorAll('.phSeg').forEach(seg=>{segPos(seg);if(seg._phSeg)return;seg._phSeg=1;
  try{new MutationObserver(()=>segPos(seg)).observe(seg,{subtree:true,attributes:true,attributeFilter:['class']})}catch(e){}
  try{new ResizeObserver(()=>segPos(seg)).observe(seg)}catch(e){}})};
/* 게임 중 난이도 색: phLvTheme(난이도, 게임판 요소) — 테두리·빛을 난이도 색으로, 왼쪽 위에 E/N/H/M */
window.phLvTheme=function(lv,el){phUiCss();const k=lvKey(lv),c=k&&LVC[k],NM={e:'EASY',n:'NORMAL',h:'HARD',m:'MASTER'},bd=document.body;
  if(c){bd.dataset.phlv=k;bd.style.setProperty('--phlvb',c.b);bd.style.setProperty('--phlvt',c.t)}else{delete bd.dataset.phlv}
  document.querySelectorAll('.phLvName').forEach(n=>{n.textContent=c?NM[k]:''});
  if(!el)return;const cv=el.tagName==='CANVAS',ch=el._phChip||(cv?null:el.querySelector(':scope>.phLvChip'));if(ch){ch.remove();el._phChip=null} /* 2026-10-29: 왼쪽 위 E/N/H 칩 없앰 */
  if(!c){el.style.removeProperty('border-color');el.style.removeProperty('box-shadow');return}
  if(cv)el.style.setProperty('box-shadow','0 0 0 2px '+c.b+'4d, 0 0 14px '+c.b+'1c','important'); /* 캔버스: 크기 안 바뀌게 테두리 대신 고리 */
  else{el.style.setProperty('border-color',c.b+'4d','important');el.style.setProperty('box-shadow','0 0 14px '+c.b+'1c, inset 0 0 22px '+c.b+'0a','important')}}; /* 난이도 색은 연하게 (테두리 30% · 빛 11%) */
window.phLvKey=lvKey;
/* 랭킹 난이도 뱃지: 한 글자 (E N H M) · 그 밖(TIME·ITEM·VS·CO-OP·환산 등)은 회색 글자 */
window.phLv=function(label){label=String(label||'').trim();if(!label)return'';phUiCss();if(!document.getElementById('phLvCss')){const s=document.createElement('style');s.id='phLvCss';s.textContent='.lvb{display:inline-flex;align-items:center;justify-content:center;font:700 8px Silkscreen,monospace!important;font-style:normal!important;letter-spacing:.04em!important;padding:2px 4px 1px;min-width:16px;height:15px;box-sizing:border-box;border-radius:3px;vertical-align:1px;margin-left:5px;color:#0a0c1d!important;background:#9aa3c7;line-height:1;white-space:nowrap;text-transform:uppercase}.lvb.e{background:#f2b000}.lvb.n{background:#00a8e0}.lvb.h{background:#e8284f}.lvb.m{background:#8a3cf0;color:#fff!important}';document.head.appendChild(s)}
 const W={EASY:'e',NORMAL:'n',HARD:'h',MASTER:'m'};return label.split(/\s+/).map(w=>{const k=W[w.toUpperCase()];return k?`<i class="lvb ${k}">${LVC[k].L}</i>`:`<i class="lvb">${w.replace(/[<>&"]/g,'')}</i>`}).join('')};
/* ===== 랭킹 나누기: 게임 + 모드 + 난이도 + 버전 =====
   버전은 기록 날짜로 정함. CUT 이전 기록 = 이전 버전 (지우지 않고 그대로 보관). 새 버전을 낼 땐 VER 맨 앞에 한 줄 추가 */
const RK_CUT=Date.parse('2026-10-26T17:30:00+09:00');
const RK_VER={_:[{id:'v1',label:'',from:0}], /* 버전 나누기 없음 (모든 게임 한 가지) */
  }; /* PETRIS도 시즌 1·2 통합 (2026-10-27) — 버전 나누기 없음 */
function rkTs(d){if(d==null||d==='')return NaN;if(typeof d==='number')return d;const s=String(d).trim();if(/^\d{12,}$/.test(s))return +s;
  let m=s.match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d))?/);if(m&&!/(Z|[+-]\d\d:?\d\d)$/.test(s))return Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]||'00'}:${m[5]||'00'}:00+09:00`); /* 시간대 없는 날짜 = 한국 시간 */
  m=s.match(/([A-Z][a-z]{2}) (\d{1,2}) (\d{4}) (\d\d):(\d\d)(?::(\d\d))? GMT([+-]\d{4})/); /* 시트가 돌려주는 'Sat Oct 24 2026 15:04:00 GMT+0900' */
  if(m){const mo=('JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(m[1])/3+1);if(mo>0)return Date.parse(`${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}T${m[4]}:${m[5]}:${m[6]||'00'}${m[7].slice(0,3)}:${m[7].slice(3)}`)}
  return Date.parse(s)}
function rkVers(g){return RK_VER[g]||RK_VER._}
function rkVer(g,r){if(r&&r._v)return r._v;const L=rkVers(g).filter(v=>v.from>=0),t=rkTs(r&&(r.ts!=null?r.ts:r.d));
  if(!isFinite(t))return L[L.length-1].id;for(const v of L)if(t>=v.from)return v.id;return L[L.length-1].id}
function rkLoadSel(g){try{return JSON.parse(localStorage.getItem('phRk:'+g)||'{}')||{}}catch(e){return{}}}
function rkSaveSel(g,s){try{localStorage.setItem('phRk:'+g,JSON.stringify(s))}catch(e){}}
function rkCss(){if(document.getElementById('phRkCss'))return;const s=document.createElement('style');s.id='phRkCss';
  s.textContent='.phRk{display:flex;flex-direction:column;gap:6px;width:min(300px,100%);margin:0 auto 10px;box-sizing:border-box}.phRk-t{display:flex;gap:5px;width:100%}.phRk-t button{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:400 10px "Silkscreen",Galmuri11,monospace!important;letter-spacing:.06em;padding:7px 2px!important;min-height:0!important;height:auto!important;border-radius:7px;border:2px solid rgba(200,205,225,.28)!important;background:rgba(12,13,22,.6)!important;color:#aeb3c8!important;cursor:pointer;box-shadow:none!important;line-height:1.2}.phRk-t button.on{background:#f2b000!important;border-color:#f2b000!important;color:#111!important}.phRk-t button.on.easy{background:#5fe08a!important;border-color:#5fe08a!important}.phRk-t button.on.normal{background:#ffd23f!important;border-color:#ffd23f!important}.phRk-t button.on.hard{background:#ff5a6e!important;border-color:#ff5a6e!important}.phRk-t button.on.master{background:#b48cff!important;border-color:#b48cff!important}.phRk-v{display:flex;justify-content:flex-end}.phRk-v select{appearance:none;-webkit-appearance:none;font:400 12px Galmuri11,"NeoDunggeunmo",monospace;color:#dfe2ea;background:rgba(10,12,22,.6) url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 8 5%27%3E%3Cpath fill=%27%23aeb3c8%27 d=%27M0 0h8L4 5z%27/%3E%3C/svg%3E") no-repeat right 9px center/8px 5px;border:2px solid rgba(200,205,225,.28);border-radius:7px;padding:6px 26px 5px 10px;cursor:pointer;max-width:100%}.phRk-v select:focus{outline:none;border-color:#f2b000}';
  document.head.appendChild(s)}
/* phRk.bar(el,{game,modes:[[id,라벨]],diffs:[[id,라벨]],sel:{mode,diff,ver},onChange}) → 탭(모드·난이도) + 드롭다운(버전) */
function rkBar(el,o){if(!el)return{};rkCss();phFont();const g=o.game,V=rkVers(g),S=Object.assign({ver:V[0].id},rkLoadSel(g)),pick=(L,v)=>L&&L.length?(L.some(x=>x[0]===v)?v:L[0][0]):undefined;
  if(o.sel)for(const k in o.sel)if(o.sel[k]!=null)S[k]=o.sel[k];
  if(o.modes&&o.modes.length)S.mode=pick(o.modes,S.mode);if(o.diffs&&o.diffs.length)S.diff=pick(o.diffs,S.diff);if(!V.some(v=>v.id===S.ver))S.ver=V[0].id;rkSaveSel(g,S);
  const LVC={EASY:'easy',NORMAL:'normal',HARD:'hard',MASTER:'master'};
  const row=(L,k)=>L&&L.length>1?`<div class="${k==='mode'?'phRk-t phSeg':'phRk-t'}" data-k="${k}">${L.map(([id,lb])=>`<button type="button" data-v="${id}" class="${S[k]===id?'on ':''}${k==='diff'?(LVC[String(lb).toUpperCase()]||''):''}">${lb}</button>`).join('')}</div>`:'';
  el.classList.add('phRk');el.innerHTML=row(o.modes,'mode')+row(o.diffs,'diff')+(V.length>1?`<div class="phRk-v"><select aria-label="버전">${V.map(v=>`<option value="${v.id}"${v.id===S.ver?' selected':''}>${v.label}</option>`).join('')}</select></div>`:'');
  window.phSeg&&window.phSeg(el);
  const fire=()=>{rkSaveSel(g,S);if(o.onChange)o.onChange(Object.assign({},S))};
  el.querySelectorAll('.phRk-t button').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const k=b.parentNode.dataset.k;S[k]=b.dataset.v;b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));fire()}));
  const sl=el.querySelector('select');if(sl)sl.addEventListener('change',()=>{S.ver=sl.value;fire()});if(sl)['click','pointerdown','touchstart','keydown'].forEach(t=>sl.addEventListener(t,e=>e.stopPropagation()));
  return Object.assign({},S)}
window.phRk={CUT:RK_CUT,ts:rkTs,vers:rkVers,ver:rkVer,bar:rkBar,sel:g=>Object.assign({ver:rkVers(g)[0].id},rkLoadSel(g)),
  key:(g,m,d,v)=>[g,m||'-',d||'-',v||rkVers(g)[0].id].join(':'), /* 랭킹 키 = 게임:모드:난이도:버전 */
  now:()=>{const k=new Date(Date.now()+9*36e5).toISOString();return k.slice(0,10)+' '+k.slice(11,16)}}; /* 한국 시간 'YYYY-MM-DD HH:mm' */
/* 시작 화면 맨 아래 작은 '게임 설명' 버튼 (모든 게임에 항상) */
/* 게임 설명 버튼·설명 창: 회색 테두리 + 한글 8비트 글꼴(갈무리) */
function phFont(){if(document.getElementById('phFontCss'))return;
  if(!document.querySelector('link[href*="galmuri"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';document.head.appendChild(l)}
  const st=document.createElement('style');st.id='phFontCss';
  st.textContent='.phS-btns .phS-b.phS-how{width:150px!important;height:36px!important;font:400 12px Galmuri11,"NeoDunggeunmo",monospace!important;letter-spacing:.08em!important;flex-direction:row!important;margin-top:2px!important;border-color:#9a9fa6!important;color:#dfe2e6!important;background:transparent!important;box-shadow:none!important;opacity:1!important}.phT-g,.phT-r,.phT-r kbd,.phT-r span,.phT-k{font-family:Galmuri11,"NeoDunggeunmo",monospace!important}input[placeholder^="이름"],#rank-name,#vs-name,input[placeholder^="이름"]::placeholder{font-family:Galmuri11,"NeoDunggeunmo",monospace!important}#bSound,#bgmB,#sfxB{position:relative}#bSound:not(.on)::after,#bSound.off::after,#bgmB.off::after,#sfxB.off::after{content:"";position:absolute;left:50%;top:50%;width:64%;max-width:26px;height:3px;background:#ff5a6e;border-radius:2px;transform:translate(-50%,-50%) rotate(-45deg);box-shadow:0 0 0 1.5px rgba(10,10,20,.85);pointer-events:none}#bSound:not(.on) .pix,#bSound.off .pix{opacity:.4}.phTip{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 64px);transform:translateX(-50%);z-index:99998;display:flex;align-items:center;gap:8px;background:rgba(12,13,20,.95);border:2px solid #5d5f70;border-radius:8px;padding:9px 14px 8px;color:#e9e9f0;font:13px Galmuri11,"NeoDunggeunmo",monospace;white-space:nowrap;pointer-events:none;animation:phTip 3.6s steps(8) forwards}.phTip svg{width:16px;height:16px;flex:0 0 16px}@keyframes phTip{0%{opacity:0;transform:translate(-50%,-6px)}10%,85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-6px)}}';
  document.head.appendChild(st)}
/* 게임 설명 내용 찾기: 저장된 것 → 페이지의 TUT → 소스 속 phTut( )·TUT= 설명 */
function findCfg(){let c=null;try{c=JSON.parse(localStorage.getItem('phTutCfg:'+location.pathname)||'null')}catch(e){}if(c)return c;
  try{if(typeof TUT!=='undefined'&&TUT&&TUT.goal)return TUT}catch(e){}
  for(const sc of document.querySelectorAll('script:not([src])')){const t=sc.textContent;for(const key of ['phTut(','TUT=']){let i=t.indexOf(key);while(i>-1){const j=t.indexOf('{',i);if(j>-1&&j-i<60){let d=0,q=null;for(let k=j;k<t.length;k++){const ch=t[k];if(q){if(ch==='\\'){k++;continue}if(ch===q)q=null;continue}if(ch==='"'||ch==="'")q=ch;else if(ch==='{')d++;else if(ch==='}'&&--d===0){try{const o=JSON.parse(t.slice(j,k+1));if(o&&o.goal)return o}catch(e){}break}}}i=t.indexOf(key,i+key.length)}}}
  return null}
function howBtn(){phFont();const cfg=findCfg();if(!cfg)return;
  document.querySelectorAll('.phS-btns').forEach(w=>{if(w.querySelector('.phS-how'))return;const b=document.createElement('button');b.className='phS-b phS-how';b.textContent='게임 설명';
    b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();phTutShow(cfg,null)});w.appendChild(b)})}
function fill(){document.querySelectorAll('.phS-logo[data-word]').forEach(el=>{el.innerHTML=window.phLogo(el.dataset.word)});document.querySelectorAll('.phS [data-click]').forEach(b=>{if(b._ph)return;b._ph=1;b.addEventListener('click',e=>{e.stopPropagation();const t=document.getElementById(b.dataset.click);if(t)t.click()})})}
/* 홈 화면 앱(게임 모음)에서 열었을 때: 위쪽 크레딧 줄을 'PARK HYONA\'S 게임이름' 버튼으로 (게임 목록으로 돌아가기) */
function back(){let sa=false;try{sa=navigator.standalone||matchMedia('(display-mode: standalone)').matches}catch(e){}if(/^\/games\/?$/.test(location.pathname))return;
  if(!sa){const GN0={petris:'PETRIS',switchpang:'SWITCH PANG',fruitpang:'MARBLE PANG',mines:'MINESWEEPER',pang:'PANGYA PANGYA',bricks:'BRICKS',hangulbi:'HANGULBI',twinstar:'TWIN STAR'},g0=location.pathname.split('/')[1]||'';
    if(GN0[g0])document.querySelectorAll('.lcd-label .copy').forEach(el=>{el.textContent="PARK HYONA'S "+GN0[g0]});return} /* 2026-10-29: 상단 헤더는 늘 'PARK HYONA'S 게임이름' */
  const GN={petris:'PETRIS',switchpang:'SWITCH PANG',fruitpang:'MARBLE PANG',mines:'MINESWEEPER',pang:'PANGYA PANGYA',bricks:'BRICKS',hangulbi:'HANGULBI',twinstar:'TWIN STAR',peekaboo:'PEEKABOO'},gid=location.pathname.split('/')[1]||'',nm=GN[gid]||gid.toUpperCase(),lab='PARK HYONA\'S '+nm; // 이름이 길면 HYONA'S 로 짧게 // 게임 이름까지 표시
  const go=e=>{e.preventDefault();e.stopPropagation();location.href='/games/'};const els=document.querySelectorAll('.lcd-label .copy');
  if(els.length){els.forEach(el=>{if(el._bk)return;el._bk=1;el.textContent=lab;el.style.cssText+=';cursor:pointer;pointer-events:auto;position:relative;z-index:50';el.addEventListener('click',go)})}
  else if(!document.getElementById('phBack')){const b=document.createElement('a');b.id='phBack';b.href='/games/';b.textContent=lab;b.style.cssText='position:fixed;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 6px);z-index:9999;font:700 10px Silkscreen,monospace;letter-spacing:1px;color:#fff;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:5px 8px;text-decoration:none';b.addEventListener('click',go);document.body.appendChild(b)}}
/* 버튼 글꼴 통일: 시작·모드·결과 화면의 영문 픽셀 버튼은 모두 Silkscreen 보통 굵기 (한글 버튼·게임 설명 버튼은 그대로) */
function btnFont(){document.querySelectorAll('button').forEach(b=>{if(b._pf||b.classList.contains('phS-how')||/[가-힣]/.test([...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('')))return;const f=getComputedStyle(b).fontFamily;if(/Silkscreen|Press Start/i.test(f)){b._pf=1;b.style.setProperty('font-family','"Silkscreen",monospace','important');b.style.setProperty('font-weight','400','important')}})}
/* 게임 들어오면 잠깐: 무음을 해제해야 소리가 들립니다 (휴대폰에서만, 게임 목록 화면 제외) */
function silentTip(){try{if(!matchMedia('(pointer:coarse)').matches||/^\/games\/?$/.test(location.pathname))return}catch(e){return}
  const d=document.createElement('div');d.className='phTip';d.innerHTML='<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="#e9e9f0" d="M2 6h3l4-3h1v10H9L5 10H2z"/><path fill="#e9e9f0" d="M12 6h1v4h-1z"/><line x1="2" y1="14" x2="14" y2="2" stroke="#ff5a6e" stroke-width="2" stroke-linecap="round"/></svg><span>무음을 해제해야 소리가 들립니다</span>';
  document.body.appendChild(d);setTimeout(()=>d.remove(),3800);
  /* 2026-10-30: 시작 화면 하단 크레딧 글과 겹치지 않게 → 크레딧 바로 위에 띄움 */
  try{const cr=[...document.querySelectorAll('.phS-credit,#msStart .msCr,.credit')].find(x=>{const r=x.getBoundingClientRect();return r.height>0&&r.top>innerHeight*.5&&r.bottom<=innerHeight+2});
   if(cr){const t=cr.getBoundingClientRect().top;d.style.bottom=Math.max(0,innerHeight-t+14)+'px';
    /* 2026-10-30: HOW TO PLAY(위 버튼)과 하단 글 사이 한가운데에 */
    const up=[...document.querySelectorAll('.phS-howL,.phS-how,#msStart .msHow')].filter(x=>{const r=x.getBoundingClientRect();return r.height>0&&r.bottom<t}).map(x=>x.getBoundingClientRect().bottom).sort((p,q)=>q-p)[0];
    const h=d.getBoundingClientRect().height||36;if(up&&t-up>=h+12){const m=(up+t)/2;d.style.bottom='auto';d.style.top=(m-h/2)+'px'}
    else{ /* 2026-10-31: 자리가 좁으면 하단 글을 가리지 않게 화면 위쪽(게임 이름 아래)에 */const hd=[...document.querySelectorAll('.lcd-label,.msHd')].map(x=>x.getBoundingClientRect()).filter(r=>r.height>0&&r.bottom<innerHeight*.3).map(r=>r.bottom).sort((p,q)=>q-p)[0];d.style.bottom='auto';d.style.top=((hd||40)+10)+'px'}}}catch(e){}}
/* ===== v2 공통 기능 (2026-10-29) ===== */
/* 설정 저장: phPref.get(키, 기본값) / phPref.set(키, 값) — 이 기기에 게임별로 저장 */
const PFX='phPref:'+(location.pathname.split('/')[1]||'hub')+':';
window.phPref={get(k,d){try{const v=localStorage.getItem(PFX+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(PFX+k,JSON.stringify(v))}catch(e){}}};
/* 소리: 배경음(BGM)·효과음(SFX) 따로 — 켜기/끄기 + 볼륨 0~100, 이 기기에 저장 (모든 게임 공통)
   phAudio.bgm() / phAudio.sfx() = 실제로 쓸 볼륨 0~1 (꺼져 있으면 0) · phAudio.on(fn) = 바뀔 때마다 fn(상태) */
const AK='ph-audio';
function aLoad(){let a={};try{a=JSON.parse(localStorage.getItem(AK)||'{}')||{}}catch(e){}return Object.assign({bgmV:70,sfxV:80,bgmOn:true,sfxOn:true},a)}
let AU=aLoad();const AL=[];
function aSave(){try{localStorage.setItem(AK,JSON.stringify(AU))}catch(e){}AL.forEach(f=>{try{f(Object.assign({},AU))}catch(e){}});syncIb();document.querySelectorAll('.phVol').forEach(volSync)}
addEventListener('storage',e=>{if(e.key===AK){AU=aLoad();aSave()}});
window.phAudio={state:()=>Object.assign({},AU),bgm:()=>AU.bgmOn?AU.bgmV/100:0,sfx:()=>AU.sfxOn?AU.sfxV/100:0,bgmOn:()=>AU.bgmOn&&AU.bgmV>0,sfxOn:()=>AU.sfxOn&&AU.sfxV>0,
  setBgm(v){AU.bgmV=Math.max(0,Math.min(100,Math.round(v)));if(AU.bgmV>0)AU.bgmOn=true;aSave()},setSfx(v){AU.sfxV=Math.max(0,Math.min(100,Math.round(v)));if(AU.sfxV>0)AU.sfxOn=true;aSave()},
  toggleBgm(on){AU.bgmOn=on==null?!(AU.bgmOn&&AU.bgmV>0):!!on;if(AU.bgmOn&&AU.bgmV===0)AU.bgmV=50;aSave()},toggleSfx(on){AU.sfxOn=on==null?!(AU.sfxOn&&AU.sfxV>0):!!on;if(AU.sfxOn&&AU.sfxV===0)AU.sfxV=50;aSave()},
  on(f){AL.push(f);return f}};
/* 상단 음표(배경음)·스피커(효과음) 버튼: data-ph="bgm" / data-ph="sfx" 붙이면 켜기/끄기 + 꺼지면 대각선 */
function syncIb(){document.querySelectorAll('[data-ph=bgm]').forEach(b=>{const on=phAudio.bgmOn();b.classList.toggle('off',!on);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  document.querySelectorAll('[data-ph=sfx]').forEach(b=>{const on=phAudio.sfxOn();b.classList.toggle('off',!on);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
window.phSyncSound=syncIb;
/* 볼륨 슬라이더: phVolPanel(넣을 곳) — 일시정지 화면 등에 */
function volSync(p){const a=AU;const q=(s,v)=>{const e=p.querySelector(s);if(e)e.textContent=v};const ib=p.querySelector('.bgm input'),is=p.querySelector('.sfx input');
  if(ib&&document.activeElement!==ib)ib.value=a.bgmV;if(is&&document.activeElement!==is)is.value=a.sfxV;q('.bgm b',phAudio.bgmOn()?a.bgmV:'OFF');q('.sfx b',phAudio.sfxOn()?a.sfxV:'OFF');
  p.classList.toggle('off-bgm',!phAudio.bgmOn());p.classList.toggle('off-sfx',!phAudio.sfxOn())}
window.phVolPanel=function(host){if(!host)return null;let p=host.querySelector(':scope>.phVol');if(!p){p=document.createElement('div');p.className='phVol';
  p.innerHTML='<label class="bgm"><i>BGM</i><input type="range" min="0" max="100" step="5" aria-label="배경음 볼륨"><b></b></label><label class="sfx"><i>SFX</i><input type="range" min="0" max="100" step="5" aria-label="효과음 볼륨"><b></b></label>';
  p.querySelector('.bgm input').addEventListener('input',e=>{AU.bgmV=+e.target.value;AU.bgmOn=AU.bgmV>0;aSave()});
  p.querySelector('.sfx input').addEventListener('input',e=>{AU.sfxV=+e.target.value;AU.sfxOn=AU.sfxV>0;aSave()});
  ['pointerdown','touchstart','keydown','click'].forEach(t=>p.addEventListener(t,e=>e.stopPropagation()));host.appendChild(p)}volSync(p);return p};
/* 좌우 고속 이동 (PETRIS와 같은 값): 처음 140ms 기다린 뒤 33ms마다 반복
   phDAS({key:e=>'left'|'right'|null, left:fn, right:fn, active:()=>bool}) */
window.phDAS=function(o){const das=o.das||140,arr=o.arr||33;let dir=null,t1=0,t2=0;const stop=()=>{clearTimeout(t1);clearInterval(t2);dir=null};
  addEventListener('keydown',e=>{const d=o.key(e);if(!d)return;if(o.active&&!o.active())return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;stop();dir=d;o[d]();
    t1=setTimeout(()=>{t2=setInterval(()=>{if(o.active&&!o.active()){stop();return}o[d]()},arr)},das)},true);
  addEventListener('keyup',e=>{const d=o.key(e);if(d){e.stopImmediatePropagation();if(d===dir)stop()}},true);addEventListener('blur',stop);return stop};
/* 게임 중 팝업 문구 (DOM): phPop(넣을 곳, '큰 글자', '작은 글자', '색', '크기')
   색: gold(득점·콤보·칭찬) item(아이템) stage(스테이지·레벨·클리어) atk(대전 공격) warn(위험·실수) white · 크기: d1(28) d2(20) d3(14) */
window.phPop=function(host,big,sub,kind,tier,subType){if(!host)return;if(getComputedStyle(host).position==='static')host.style.position='relative';
  const d=document.createElement('div');d.className='phPop go '+(kind||'gold')+' '+(tier||'d2');
  d.innerHTML=(big?`<b>${big}</b>`:'')+(sub?`<span class="${subType||''}">${sub}</span>`:'');host.appendChild(d);setTimeout(()=>d.remove(),1300);return d};
/* 캔버스 팝업도 같은 모양: phPopDraw(ctx, 글자, x, y, 크기px, 색이름 또는 #색, 투명도) */
const PC2={gold:'#ffd84d',item:'#ff6ec7',stage:'#7fd9ff',atk:'#c9a6ff',warn:'#ff8aa0',white:'#ffffff'};
window.phPopColor=k=>PC2[k]||k||PC2.gold;
window.phPopDraw=function(c,t,x,y,px,col,al){col=PC2[col]||col||PC2.gold;c.save();if(al!=null)c.globalAlpha=al;c.font=`700 ${px}px Silkscreen,monospace`;c.textAlign='center';c.textBaseline='middle';
  try{c.letterSpacing=Math.round(px*.1)+'px'}catch(e){}t=String(t).toUpperCase();c.lineJoin='round';c.lineWidth=Math.max(3,px*.2);c.strokeStyle='#08090f';c.shadowColor=col;c.shadowBlur=px*.6;c.strokeText(t,x,y);c.shadowBlur=0;c.fillStyle=col;c.fillText(t,x,y);c.restore()};
/* 시작 화면 타이틀 아래 상징 모션 */
function phMotion(){const sh=document.getElementById('show')||document.querySelector('.phS .phS-show');if(!sh||sh._mv)return;const g=location.pathname.split('/')[1]||'';
  const kids=()=>[...sh.children];if(!kids().length){setTimeout(phMotion,300);return}sh._mv=1;
  if(g==='pang'){sh.classList.add('mv-swap');let i=0;setInterval(()=>{if(!sh.offsetParent)return;const k=kids().filter(e=>e.tagName==='IMG');if(k.length<2)return;i=(i+1)%(k.length-1);
      const a=k[i],b=k[i+1],dx=b.offsetLeft-a.offsetLeft;a.style.transform=`translate(${dx}px,-10px)`;b.style.transform=`translate(${-dx}px,10px)`;
      setTimeout(()=>{a.style.transform=`translate(${dx}px,0)`;b.style.transform=`translate(${-dx}px,0)`},250);
      setTimeout(()=>{a.style.transition=b.style.transition='none';a.style.transform=b.style.transform='';sh.insertBefore(b,a);void a.offsetWidth;a.style.transition=b.style.transition=''},560)},1300)}
  else if(g==='switchpang'){const src=kids().filter(e=>e.tagName==='IMG').map(e=>e.src);if(!src.length)return;sh.innerHTML=[0,1,2,3,4,5,0,2,4].map(i=>`<img alt="" src="${src[i%src.length]}">`).join('');sh.classList.add('mv-ring');
    const im=[...sh.children],P=[[0,0],[1,0],[2,0],[2,1],[2,2],[1,2],[0,2],[0,1]],Q=29;let o=0;im[8].style.transform=`translate(${Q}px,${Q}px)`; /* 가운데는 그대로, 가장자리 8개가 한 칸씩 시계 방향 */
    const put=()=>im.slice(0,8).forEach((e,i)=>{const [x,y]=P[(i+o)%8];e.style.transform=`translate(${x*Q}px,${y*Q}px)`});put();setInterval(()=>{if(!sh.offsetParent)return;o=(o+1)%8;put()},1100)}
  else if(g==='petris'){sh.classList.add('mv-bob')}
  else if(g==='fruitpang'){sh.classList.add('mv-marble');kids().forEach(e=>{e.style.removeProperty('width');e.style.removeProperty('margin')})}
  else if(g==='twinstar'){sh.classList.add('mv-twin');kids().slice(-2).forEach(e=>e.classList.add('ship'))}
  else if(g==='bricks'){sh.classList.add('mv-bricks');const bs=kids().filter(e=>e.tagName==='svg'||e.tagName==='SVG'||e.tagName==='IMG');if(!bs.length)return;const ball=document.createElement('i');ball.className='ball';sh.appendChild(ball);
    let i=0,dir=1,t0=performance.now(),last=-1;const P=320;
    (function loop(t){if(sh.offsetParent){const n=bs.length,k=Math.floor((t-t0)/P),f=((t-t0)%P)/P;if(k!==last){last=k;i+=dir;if(i>=n-1){i=n-1;dir=-1}else if(i<=0){i=0;dir=1}const hb=bs[i];hb.classList.remove('hit');void hb.getBoundingClientRect();hb.classList.add('hit')}
      const a=bs[i],b=bs[Math.max(0,Math.min(n-1,i+dir))],R=sh.getBoundingClientRect(),ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),xa=ra.left-R.left+ra.width/2,xb=rb.left-R.left+rb.width/2,x=xa+(xb-xa)*f,y=ra.top-R.top+ra.height*.28-8-Math.sin(Math.PI*f)*14,bw=ball.offsetWidth/2; /* svg는 offsetLeft가 없어 공이 멈춰 있던 문제 (2026-10-31) */ball.style.transform=`translate(${x-bw}px,${y}px)`}
      requestAnimationFrame(loop)})(t0)}
}
window.phMotion=phMotion;
/* ===== 설정 창 (모든 게임 공통 · 2026-10-29) =====
   게임에서: phSettings.config({ guide:{label:'고스트 블록',get,set}, speed:{get,set}, fx:{get,set}, hap:{get,set}, vox:{get,set}, rot:{get,set}, onSound:fn })
   열기: phSettings.open({ inGame:true, restart:fn, home:fn, onClose:fn }) — 시작 화면 SETTINGS 버튼은 자동으로 붙음 */
const SC={};
function setOpen(o){o=o||{};if(window.__phSnd){window.__phSnd=0;o._snd=1}phUiCss();const c=SC,touch=(()=>{try{return matchMedia('(pointer:coarse)').matches}catch(e){return false}})();
  const old=document.querySelector('.phSet');if(old){if(old._kb)removeEventListener('keydown',old._kb,true);old.remove()}
  const d=document.createElement('div');d.className='phSet';
  const tg=(k,on)=>`<div class="phSet-o"><button class="tg${on?'':' on'}" data-k="${k}" data-v="0">끄기</button><button class="tg${on?' on':''}" data-k="${k}" data-v="1">켜기</button></div>`;
  const opt=(k,cur,L)=>`<div class="phSet-o">${L.map((t,i)=>`<button class="${cur===i?'on':''}" data-k="${k}" data-v="${i}">${t}</button>`).join('')}</div>`;
  const vol=(k,v,on)=>`<label class="phSet-v${on?'':' dim'}"><input type="range" min="0" max="100" step="5" value="${v}" data-vol="${k}" aria-label="${({bgm:'배경음',sfx:'효과음',vox:'안내음'})[k]} 볼륨"><b>${v}</b></label>`;
  const A=phAudio.state();let h='';
  h+=`<div class="phSet-r phSet-one"><span class="phSet-n">배경음</span>${vol('bgm',A.bgmV,phAudio.bgmOn())}${tg('bgm',phAudio.bgmOn())}</div>`;
  h+=`<div class="phSet-r phSet-one"><span class="phSet-n">효과음</span>${vol('sfx',A.sfxV,phAudio.sfxOn())}${tg('sfx',phAudio.sfxOn())}</div>`;
  if(c.vox){const vo=!!c.vox.get();h+=c.vox.vol?`<div class="phSet-r phSet-one"><span class="phSet-n">안내음</span>${vol('vox',c.vox.vol.get(),vo)}${tg('vox',vo)}</div>`:`<div class="phSet-r"><div class="phSet-l"><span>안내음</span>${tg('vox',vo)}</div></div>`}
  /* 2026-10-30: 소리는 사운드 아이콘 창으로, 설정 창에는 플레이 설정만 */
  const snd=!!o._snd;if(!snd)h='';
  const play=[];
  if(c.guide)play.push(`<div class="phSet-r"><div class="phSet-l"><span>가이드 표시</span>${opt('guide',c.guide.get()?1:0,['끄기','켜기'])}</div></div>`);
  if(c.speed)play.push(`<div class="phSet-r"><div class="phSet-l"><span>게임 속도</span>${opt('speed',+c.speed.get(),['느리게','보통','빠르게'])}</div></div>`);
  if(c.fx)play.push(`<div class="phSet-r"><div class="phSet-l"><span>화면 효과</span>${opt('fx',c.fx.get()?1:0,['끄기','켜기'])}</div></div>`);
  if(c.hap&&touch)play.push(`<div class="phSet-r"><div class="phSet-l"><span>진동</span>${opt('hap',c.hap.get()?1:0,['끄기','켜기'])}</div></div>`);
  if(c.rot)play.push(`<div class="phSet-r"><div class="phSet-l"><span>회전 방향</span>${opt('rot',c.rot.get()==='ccw'?1:0,['시계','반시계'])}</div></div>`);
  (c.extra||[]).forEach(x=>play.push(`<div class="phSet-r"><div class="phSet-l"><span>${x.label}</span>${opt('x_'+x.k,+x.get(),x.opts)}</div></div>`)); /* 게임별 추가 설정 (2026-10-31): extra:[{k,label,opts,get,set}] */
  if(!snd)h+=play.join('');
  const hb='<div class="phSet-btns"><button type="button" class="phSetX" data-a="close" aria-label="닫기">✕</button></div>';
  d.innerHTML=`<div class="phSet-w" role="dialog" aria-label="${snd?'소리':'설정'}"><div class="phSet-c">${h}</div>${hb}</div>`;document.body.appendChild(d);
  const close=a=>{removeEventListener('keydown',kb,true);d.remove();if(a==='all'){location.href='../games/';return}if(a==='restart'&&o.restart)o.restart();else if(a==='home'&&o.home)o.home();else if(o.onClose)o.onClose()};
  const kb=e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}};addEventListener('keydown',kb,true);d._kb=kb;
  d.addEventListener('click',e=>{e.stopPropagation();if(e.target===d){close();return}const b=e.target.closest('button');if(!b)return;
    if(b.dataset.a){close(b.dataset.a);return}const k=b.dataset.k,v=+b.dataset.v;if(!k)return;
    if(k.slice(0,2)==='x_'){const x=(c.extra||[]).find(e=>'x_'+e.k===k);if(x)x.set(v);setOpen(o);return}if(k==='bgm')phAudio.toggleBgm(!!v);else if(k==='sfx')phAudio.toggleSfx(!!v);else if(k==='rot')c.rot.set(v?'ccw':'cw');else if(c[k])c[k].set(k==='speed'?v:!!v);
    if(c.onSound&&(k==='bgm'||k==='sfx'))c.onSound();if(k==='hap'&&v&&navigator.vibrate)try{navigator.vibrate(20)}catch(_){}
    setOpen(o)});
  d.querySelectorAll('[data-vol]').forEach(i=>i.addEventListener('input',()=>{const v=+i.value;i.nextElementSibling.textContent=v;if(i.dataset.vol==='bgm')phAudio.setBgm(v);else if(i.dataset.vol==='vox'){if(c.vox&&c.vox.vol)c.vox.vol.set(v);if(c.vox&&!!c.vox.get()!==(v>0))c.vox.set(v>0)}else phAudio.setSfx(v);
    i.parentNode.classList.toggle('dim',v===0);if(c.onSound)c.onSound();
    const r=i.closest('.phSet-r');r.querySelectorAll('.tg').forEach(t=>t.classList.toggle('on',(t.dataset.v==='1')===(v>0)))}));
  ['pointerdown','touchstart','keydown','keyup'].forEach(t=>d.addEventListener(t,e=>e.stopPropagation()));return d}
window.phSettings={config(o){Object.assign(SC,o||{});return SC},open:setOpen,cfg:SC};
/* 시작 화면: RANKING 옆에 SETTINGS (반반) — 이미 있는 게임(PETRIS)은 그대로 */
function setBtn(){document.querySelectorAll('.phS-btns').forEach(w=>{if(w.querySelector('.phS-row2')||w.querySelector('.phS-set'))return;
  const rk=[...w.querySelectorAll('.phS-b')].find(b=>/RANKING/i.test(b.textContent));if(!rk)return;
  const row=document.createElement('div');row.className='phS-row2';rk.parentNode.insertBefore(row,rk);row.appendChild(rk);
  const b=document.createElement('button');b.type='button';b.className='phS-b gold phS-set';b.textContent='SETTINGS';
  b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();setOpen({inGame:false})});row.appendChild(b)})}
/* 모드 선택 · 랭킹 화면 위계 통일 (2026-10-29): 게임 이름/RANKING 제목 → (간격) → 박스 묶음 → (간격) → ✕ */
function phOv(){try{
  const nm=((document.querySelector('.lcd-label .copy')||{}).textContent||'').replace(/^PARK HYONA'?S\s*/i,'').trim();
  const head=(P,txt,rk)=>{let h=[...P.children].find(e=>e.classList.contains('phOvH'));if(!h){h=document.createElement('div');h.className='phOvH';P.insertBefore(h,P.firstChild)}if(h.textContent!==txt)h.textContent=txt;if(h.classList.contains('phOvRk')!==!!rk)h.classList.toggle('phOvRk',!!rk);if(!P.classList.contains('phOvP'))P.classList.add('phOvP')};
  const xbtn=P=>{const x=[...P.children].reverse().find(b=>b.tagName==='BUTTON'&&(/^(CLOSE|BACK|✕|×)$/i.test(b.textContent.trim())||b.classList.contains('vs-x')));if(!x)return;if(!x.classList.contains('phOvX'))x.classList.add('phOvX');
    if(/^(CLOSE|BACK)$/i.test(x.textContent.trim())){x.textContent='✕';x.setAttribute('aria-label','닫기');x.classList.remove('phBtn','sub')}};
  const hide=e=>{if(!e.classList.contains('phOvHid'))e.classList.add('phOvHid')};
  const M=new Set(),R=new Set();
  document.querySelectorAll('#modeOv,#ovMode').forEach(e=>M.add(e));
  document.querySelectorAll('.mBtns').forEach(e=>{const P=e.closest('.phS');if(P)M.add(P)});
  document.querySelectorAll('.mode-pick').forEach(e=>{const P=e.closest('.vs-card');if(P)M.add(P)});
  document.querySelectorAll('#rankOv,#ovRank').forEach(e=>R.add(e));
  document.querySelectorAll('#rk-list').forEach(e=>{const P=e.closest('.vs-card');if(P)R.add(P)});
  document.querySelectorAll('.vs-card .vs-title.phOvHid').forEach(e=>{if(!R.has(e.closest('.vs-card')))e.classList.remove('phOvHid')});
  M.forEach(P=>{if(!nm)return;head(P,nm);xbtn(P);[...P.children].forEach(e=>{if(e.classList.contains('paused')&&/^MODE$/i.test(e.textContent.trim()))hide(e)})});
  R.forEach(P=>{head(P,'RANKING',1);xbtn(P);P.querySelectorAll('.sub,.vs-title,.rk>h4').forEach(e=>{if(/^RANKING$/i.test(e.textContent.trim()))hide(e)})});
  document.querySelectorAll('.phOvP').forEach(P=>{if(M.has(P)||R.has(P))return;P.classList.remove('phOvP');[...P.children].forEach(e=>{if(e.classList.contains('phOvH'))e.remove()})});
}catch(e){}}
/* 시작 화면 버튼 줄 (2026-10-29 검수안): RANKING 한 줄 → HOW TO PLAY | SETTINGS 반반 */
function phStartRow(){document.querySelectorAll('.phS-btns').forEach(w=>{if(w._phRow)return;const row=w.querySelector('.phS-row2'),how=w.querySelector('.phS-how');if(!row||!how)return;
  const rk=[...row.children].find(b=>/RANKING/i.test(b.textContent));if(!rk)return;w._phRow=1;
  /* 시작 화면 (2026-10-30): RANKING | ALL GAMES 나란히, HOW TO PLAY는 아래 밑줄 글자 링크, SETTINGS는 게임 중 톱니바퀴로 */
  [...row.children].forEach(b=>{if(/SETTINGS/i.test(b.textContent))b.classList.add('phS-noSet')});
  const al=document.createElement('button');al.type='button';al.className='phS-b gold phS-all';al.textContent='ALL GAMES';al.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();location.href='../games/'});
  rk.after(al);how.textContent='HOW TO PLAY';how.className='phS-howL';w.after(how)})}
/* 잠시 멈춤 화면 (2026-10-29 검수안): PAUSE → RESTART → RANKING → MAIN MENU → ALL GAMES → ✕(계속하기) */
function phPause(){[['pauseOv','resumeB'],['ovPause','bResume'],['overlay','overlay-btn']].forEach(([oid,rid])=>{const ov=document.getElementById(oid),rs=document.getElementById(rid);if(!ov||!rs||ov._phP)return;
  const bs=[...ov.children].filter(b=>b.tagName==='BUTTON'&&/^(RESTART|MAIN MENU)$/i.test(b.textContent.trim()));bs.forEach(b=>b.classList.add(/RESTART/i.test(b.textContent)?'phPRst':'phPMenu'));if(bs.length<2)return;ov._phP=1;
  const row=document.createElement('div');row.className='phPRow';bs[0].parentNode.insertBefore(row,bs[0]);bs.forEach(b=>row.appendChild(b));
  const rkS=[...document.querySelectorAll('.phS-btns button')].find(x=>/RANKING/i.test(x.textContent));
  if(rkS){const rb=document.createElement('button');rb.type='button';rb.className='phBtn sub phPRank';rb.textContent='RANKING';rb.addEventListener('click',e=>{e.stopPropagation();document.body.classList.add('phRkTop');rkS.click()});bs[0].after(rb)}
  const re=document.createElement('button');re.type='button';re.className='phBtn sub phPRes';re.textContent='RESUME';re.addEventListener('click',e=>{e.stopPropagation();rs.click()});row.insertBefore(re,row.firstChild); /* 2026-10-31: RESUME → RESTART → RANKING → MAIN MENU | ALL GAMES */
  const al=document.createElement('button');al.type='button';al.className='phBtn sub phPAll';al.textContent='ALL GAMES';al.addEventListener('click',e=>{e.stopPropagation();location.href='../games/'});row.appendChild(al);const x=document.createElement('button');x.type='button';x.className='phPX phOvX';x.textContent='✕';x.setAttribute('aria-label','계속하기');x.addEventListener('click',e=>{e.stopPropagation();rs.click()});ov.appendChild(x)})}
/* 게임 오버 화면 통일 (2026-10-29 검수안): GAME OVER 한 줄 → 큰 점수 → 한줄 평 → (정보 2개 이상이면 상자) → 이름 → RANKING → RETRY → MAIN MENU | ALL GAMES · 랭킹 1위면 축하 화면 */
const GOF={
    A: ['01110','10001','10001','11111','10001','10001','10001'],
    B: ['11110','10001','10001','11110','10001','10001','11110'],
    C: ['01111','10000','10000','10000','10000','10000','01111'],
    D: ['11110','10001','10001','10001','10001','10001','11110'],
    E: ['11111','10000','10000','11110','10000','10000','11111'],
    G: ['01110','10001','10000','10111','10001','10001','01111'],
    I: ['111','010','010','010','010','010','111'],
    L: ['10000','10000','10000','10000','10000','10000','11111'],
    M: ['10001','11011','10101','10101','10001','10001','10001'],
    N: ['10001','11001','10101','10011','10001','10001','10001'],
    O: ['01110','10001','10001','10001','10001','10001','01110'],
    P: ['11110','10001','10001','11110','10000','10000','10000'],
    R: ['11110','10001','10001','11110','10100','10010','10001'],
    S: ['01111','10000','10000','01110','00001','00001','11110'],
    T: ['11111','00100','00100','00100','00100','00100','00100'],
    U: ['10001','10001','10001','10001','10001','10001','01110'],
    V: ['10001','10001','10001','10001','10001','01010','00100'],
    W: ['10001','10001','10001','10101','10101','10101','01010'],
    Y: ['10001','10001','01010','00100','00100','00100','00100'],
    '!': ['1','1','1','1','1','0','1'],
    ' ': ['00','00','00','00','00','00','00'],
  '1':['00100','01100','10100','00100','00100','00100','11111'],' ':['00','00','00','00','00','00','00']};
function phDots(text,color,cls){const C=10,D=8.4,R=2.2;let x=0,on='',off='';[...text].forEach(ch=>{const g=GOF[ch]||GOF[' '];g.forEach((row,y)=>[...row].forEach((b,cx)=>{const r=`<rect x="${(x+cx)*C}" y="${y*C}" width="${D}" height="${D}" rx="${R}"`;if(b==='1')on+=r+'/>';else off+=r+'/>'}));x+=g[0].length+1});
  return `<svg class="${cls||''}" viewBox="0 0 ${(x-1)*C-(C-D)} ${7*C-(C-D)}" aria-label="${text}"><g fill="rgba(255,255,255,.07)">${off}</g><g fill="${color||'#f4fff0'}">${on}</g></svg>`}
/* 랭킹 목록을 받아 올 때 1위 점수를 기억 (축하 화면 판단용) */
(function(){if(window.__phFetchWrap||!window.fetch)return;window.__phFetchWrap=1;const f0=window.fetch.bind(window);
  window.fetch=function(u,o){const p=f0(u,o);try{const s=String(u&&u.url||u);if(/script\.google/.test(s)&&!/[?&]a=add/.test(s)){window.__phRankUrl=s;p.then(r=>r.clone().json()).then(d=>{const L=Array.isArray(d)?d:(d&&(d.top||d.rows||d.list))||[];const v=L.map(e=>+(e&&(e.s!=null?e.s:e.score))).filter(n=>isFinite(n));window.__phTopMax=v.length?Math.max(...v):0;window.__phTopN=v.length}).catch(()=>{})}}catch(e){}return p}})();
function phGoData(ov){const T=e=>e?e.textContent.trim():'';const P=[];
  const st=ov.querySelector(':scope>.st');
  if(st){[...st.children].forEach(d=>{const b=d.querySelector('b');if(!b)return;const v=T(b);P.push([T(d).replace(v,'').trim(),v])});return P}
  const hs=ov.querySelector('#oStats');if(hs){P.push(['SCORE',T(ov.querySelector('#oBig'))]);[...hs.children].forEach(d=>P.push([T(d.querySelector('small')),T(d.querySelector('b'))]));return P}
  const bs=ov.querySelector('#overScore');if(bs){P.push(['SCORE',T(bs)]);const m=/STAGE\s*(\d+)/i.exec(T(ov.querySelector('#overInfo')));if(m)P.push(['STAGE',m[1]]);return P}
  const gs=ov.querySelector('.go-score b');if(gs){P.push(['SCORE',T(gs)]);const lv=document.getElementById('level'),ln=document.getElementById('lines');if(lv)P.push(['LEVEL',T(lv)]);if(ln)P.push(['LINES',T(ln)]);return P}
  return P}
const goNum=(v,time)=>{v=String(v).replace(/,/g,'');if(time||/:/.test(v)){const p=v.split(':').map(Number);return p.length>1?p[0]*60+p[1]:+p[0]}return parseFloat(v)||0};
/* 게임 끝 한줄 평: 기록에 따라 재치 있는 문구를 무작위로 */
const GOQ={zero:['손가락이 미끄러지셨습니까?','혹시 화면 꺼진 채로 하셨어요?','0점도 기록은 기록이죠… 아마도','이렇게 못해서 어쩔~~','튜토리얼부터 다시 갈까요?'],
  first:['첫 판 치곤 좀 치네?','오, 신입 치고 손이 빠른데?','간 보기 끝! 이제 진짜 시작이죠?','첫 기록 등록 완료! 이제 이걸 깨 보세요'],
  best:['좀 치네? 최고 기록 갈아치움!','왕년에 손가락 좀 굴렸나 봐?','한때 한게임 좀 했었나?','오늘 손가락에 기름칠했어요?','이 실력 실화? 최고 기록 경신!'],
  near:['절헌~ 절헌~ 절헌~ 아까비~','최고 기록 코앞에서 미끄러짐!','아깝다! 딱 한 끗!','거의 다 왔는데… 한 판만 더?'],
  mid:['오락실에서 동전 많이 잃었겠군','나쁘지 않아요, 손 좀 풀렸네?','무난무난~ 근데 더 할 수 있잖아요','평타는 쳤다!'],
  low:['이렇게 못해서 어쩔~~','손가락이 미끄러지셨습니까?','오늘은 손가락이 출근을 안 했나 봐요','컨디션 탓으로 해 둘게요','오락실 주인이 좋아하겠어요']};
/* 게임별 상황 멘트 (없으면 위 공통 문구) */
const GOQG={
 pang:{zero:['팡팡이들이 그냥 쌓이기만 했어요…','팡! 소리 한 번 못 들어 봤네요','손가락이 미끄러지셨습니까?'],first:['첫 판 치곤 연쇄 맛 좀 봤네?','팡팡이들과 첫인사 완료!'],best:['연쇄 장인 등장! 최고 기록 경신','왕년에 뿌요뿌요 좀 굴렸나 봐?','팡팡이들이 박수 치는 중!'],near:['절헌~ 절헌~ 아까비~ 한 줄만 더 버텼으면!','최고 기록 코앞에서 팡팡이가 넘쳤어요'],mid:['연쇄 좀 하시네? 근데 더 할 수 있잖아요','팡팡이 탑 쌓기 장인… 아니 그게 아니라'],low:['팡팡이들 숨 막혀요! 좀 터뜨려 주세요','이렇게 쌓기만 해서 어쩔~~']},
 switchpang:{zero:['자리만 바꾸다 끝났네요…','헛스왑 장인 인정'],first:['첫 판부터 자리 좀 바꿀 줄 아네?','스왑 입문 완료!'],best:['애니팡 좀 하셨나 봐요? 최고 기록!','손가락이 번개처럼 바꿨다!'],near:['절헌~ 아까비~ 한 번만 더 바꿨으면!','최고 기록까지 스왑 한 번 차이!'],mid:['한때 애니팡 하트 좀 보냈나?','나쁘지 않은 스왑 감각!'],low:['팡팡이들이 자리만 옮기다 지쳤대요','이렇게 못 바꿔서 어쩔~~']},
 petris:{zero:['블록이 그냥 쌓이기만 했어요…','한 줄도 못 지우다니, 손가락이 미끄러지셨습니까?'],first:['첫 판 치곤 줄 좀 지우네?','블록 쌓기 입문 완료!'],best:['왕년에 오락실 테트리스 좀 했나 봐?','4줄 장인 등장! 최고 기록 경신','블록이 알아서 들어가는 줄!'],near:['절헌~ 절헌~ 긴 막대만 왔어도!','최고 기록 한 줄 차이! 아까비~'],mid:['오락실에서 동전 꽤 넣었겠군','줄 지우는 손맛은 아시네'],low:['긴 막대 기다리다 끝났죠?','이렇게 쌓아서 어쩔~~']},
 fruitpang:{zero:['구슬이 합쳐지지도 않았어요…','손가락이 미끄러지셨습니까?'],first:['첫 판부터 구슬 좀 키우네?','구슬 키우기 입문 완료!'],best:['구슬 키우기 고수 등장! 최고 기록','구슬 굴리는 손맛 제대로네!'],near:['절헌~ 아까비~ 딱 한 알만 더!','최고 기록 코앞에서 구슬이 넘쳤어요'],mid:['구슬 좀 굴려 본 솜씨인데?','무난무난~ 오로라 볼까지 가 봐요'],low:['구슬들이 꽉 끼어 숨 막혀요','이렇게 쌓기만 해서 어쩔~~']},
 bricks:{zero:['공이 그냥 지나갔어요…','패들이 퇴근했나 봐요'],first:['첫 판 치곤 벽돌 좀 깨네?','벽돌 깨기 입문 완료!'],best:['왕년에 오락실 벽돌 좀 깼나 봐?','패들 장인 등장! 최고 기록'],near:['절헌~ 아까비~ 벽돌 하나만 더!','최고 기록 코앞에서 공을 놓쳤어요'],mid:['오락실에서 동전 많이 잃었겠군','공 받는 감은 있으시네'],low:['공을 너무 사랑해서 보내 줬나요?','이렇게 놓쳐서 어쩔~~']},
 twinstar:{zero:['우주 벌레한테 인사만 하고 왔네요','손가락이 미끄러지셨습니까?'],first:['첫 출격 치곤 좀 쏘네?','파일럿 입문 완료!'],best:['왕년에 갤러그 좀 했나 봐?','에이스 파일럿 등장! 최고 기록'],near:['절헌~ 아까비~ 한 마리만 더!','최고 기록 코앞에서 격추당했어요'],mid:['오락실에서 동전 많이 잃었겠군','전투기 좀 몰아 본 솜씨인데?'],low:['우주 벌레들이 신났대요','이렇게 쏴서 어쩔~~']},
 hangulbi:{zero:['한 글자도 못 쳤어요… 자판 어디 갔죠?','손가락이 미끄러지셨습니까?'],first:['첫 판 치곤 타자 좀 치네?','한글비 입문 완료!'],best:['왕년에 한메타자 좀 쳤나 봐?','독수리 타법 졸업! 최고 기록'],near:['절헌~ 아까비~ 한 단어만 더!','최고 기록 코앞에서 오타!'],mid:['산성비 좀 맞아 본 솜씨인데?','타자 연습 좀 하셨네'],low:['독수리가 자판 위를 맴돌아요','이렇게 쳐서 어쩔~~']}};
const goPick=k=>{const g=GOQG[location.pathname.split('/')[1]];const a=(g&&g[k])||GOQ[k];return a[Math.random()*a.length|0]};
function phGoLine(ov,m){const own=ov.querySelector('#oMsg');if(own&&own.textContent.trim())return own.textContent.trim();
  const time=/TIME/i.test(m[0]),v=goNum(m[1],time);if(!v)return goPick('zero');
  const key='phGoBest:'+location.pathname+':'+(document.body.dataset.phlv||'')+':'+m[0];let b=null;try{b=JSON.parse(localStorage.getItem(key))}catch(e){}
  const better=b==null||(time?v<b:v>b);try{if(better)localStorage.setItem(key,JSON.stringify(v))}catch(e){}
  if(b==null)return goPick('first');if(better)return goPick('best');
  const r=time?b/v:v/b;return goPick(r>=.9?'near':r>=.5?'mid':'low')}
/* 1위 트로피 점 그림 */
const TROPHY=['11111111111','10111111101','10111111101','01111111110','00111111100','00011111000','00001110000','00000100000','00001110000','00111111100','00111111100'];
function phTrophy(color){const C=10,D=8.4,R=2.2;let on='',off='';TROPHY.forEach((row,y)=>[...row].forEach((b,x)=>{const r=`<rect x="${x*C}" y="${y*C}" width="${D}" height="${D}" rx="${R}"`;if(b==='1')on+=r+'/>';else off+=r+'/>'}));
  return `<svg class="phWinT" viewBox="0 0 ${11*C-(C-D)} ${11*C-(C-D)}" aria-label="TROPHY"><g fill="rgba(255,255,255,.07)">${off}</g><g fill="${color}">${on}</g></svg>`}
/* 2026-10-31: 1위 화면을 어느 게임에서나 (지뢰찾기처럼 ph.css를 안 쓰는 곳도) — phWinShow(오버레이, 라벨, 기록) */
window.phWinShow=function(ov,label,val){if(!document.getElementById('phWinCss')){const s=document.createElement('style');s.id='phWinCss';s.textContent='.phWin{position:absolute;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%,rgba(58,44,4,.97),rgba(8,9,15,.995) 70%)}.phWin canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.phWin-c{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:20px;animation:phWinIn .5s steps(6) both}.phWinT{width:150px;height:auto;filter:drop-shadow(0 0 6px rgba(255,216,77,.8)) drop-shadow(0 0 20px rgba(242,176,0,.5));animation:phWinP 1.6s ease-in-out infinite}.phWin-n{display:flex;flex-direction:column;align-items:center;gap:6px;margin:6px 0}.phWin-n i{font:400 9px/1 Silkscreen,monospace;letter-spacing:.16em;color:#c9b77a;font-style:normal}.phWin-n b{font:400 52px/1 "Jersey 15",sans-serif;color:#fff;text-shadow:0 0 10px rgba(255,216,77,.8),0 0 26px rgba(242,176,0,.5)}.phWin-s{font:400 12px/1.6 Galmuri11,sans-serif;color:#d8d2b8}html body .phWin .phWin-b{all:unset;box-sizing:border-box!important;width:300px!important;max-width:100%!important;height:52px!important;display:grid!important;place-items:center!important;border:2px solid #f2b000!important;border-radius:12px!important;background:#12142a!important;color:#ffd84d!important;font:400 14px Galmuri11,sans-serif!important;margin-top:10px!important;cursor:pointer;box-shadow:none!important}@keyframes phWinIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}@keyframes phWinP{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}';document.head.appendChild(s)}
  phWin(ov,[label||'TIME',val])};
function phWin(ov,m){if(ov.querySelector('.phWin'))return;const w=document.createElement('div');w.className='phWin';
  w.innerHTML=`<canvas></canvas><div class="phWin-c">${phTrophy('#ffd84d')}<div class="phWin-n"><i>NEW RECORD</i><b>${m[1]}</b></div><div class="phWin-s">이름을 남기면 랭킹 맨 위에 올라가요</div><button type="button" class="phBtn phWin-b">기록 남기기</button></div>`;
  ov.appendChild(w);const cv=w.querySelector('canvas'),cx=cv.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1);let P=[],t0=performance.now();
  const rs=()=>{cv.width=w.clientWidth*dpr;cv.height=w.clientHeight*dpr};rs();const COL=['#ffd84d','#f2b000','#ff8aa0','#7fd9ff','#9ff0c6','#c9a6ff','#fff'];
  for(let i=0;i<90;i++)P.push({x:Math.random(),y:-Math.random()*.6,v:.12+Math.random()*.22,s:3+Math.random()*4|0,c:COL[i%COL.length],r:Math.random()*6});
  const fx=!(window.phSettings&&phSettings.cfg.fx&&!phSettings.cfg.fx.get());
  const loop=t=>{if(!w.isConnected)return;const W=cv.width,H=cv.height,dt=1/60;cx.clearRect(0,0,W,H);if(fx){P.forEach(p=>{p.y+=p.v*dt;p.r+=dt*3;if(p.y>1.05){p.y=-.05;p.x=Math.random()}cx.fillStyle=p.c;const s=p.s*dpr;cx.fillRect(p.x*W+Math.sin(p.r)*8*dpr,p.y*H,s,s)})}requestAnimationFrame(loop)};requestAnimationFrame(loop);
  w.querySelector('.phWin-b').addEventListener('click',e=>{e.stopPropagation();w.remove();const i=ov.querySelector('input');if(i)try{i.focus()}catch(_){}});
  try{navigator.vibrate&&navigator.vibrate([30,40,30])}catch(e){}}
function phGoOne(ov){if(!ov._phGo){ov._phGo=1;ov.classList.add('phGoOv');
    const top=document.createElement('div');top.className='phGo';top.innerHTML=phDots('GAME OVER','#f4fff0','phGoT')+'<div class="phGoN"><i></i><b></b></div><div class="phGoQ"></div><div class="phGoSt"></div>';ov.insertBefore(top,ov.firstChild);
    [...ov.querySelectorAll('button')].forEach(b=>{const t=b.textContent.trim();
      if(/^(PLAY AGAIN|RETRY)$/i.test(t)){if(t!=='RETRY')b.textContent='RETRY';b.classList.add('phGoRetry')}
      else if(/^MAIN MENU$/i.test(t))b.classList.add('phGoMenu');
      else if(/RANKING$/i.test(t)){b.classList.add('phGoRank');b.classList.remove('gold');b.innerHTML='RANKING'}
      else if(b.id==='bOverHome'){b.textContent='MAIN MENU';b.className='phBtn sub phGoMenu'}});
    if(!ov.querySelector('.phGoRank')&&document.getElementById('rankB')){const r=document.createElement('button');r.type='button';r.className='phBtn sub phGoRank';r.textContent='RANKING';r.addEventListener('click',e=>{e.stopPropagation();ov.hidden=true;document.getElementById('rankB').click()});ov.appendChild(r)}
    const a=document.createElement('button');a.type='button';a.className='phBtn sub phGoAll';a.textContent='ALL GAMES';a.addEventListener('click',e=>{e.stopPropagation();location.href='../games/'});ov.appendChild(a);
    ov.querySelectorAll('.phGoMenu,.phGoRank,.phGoRetry').forEach(b=>{let p=b.parentElement;while(p&&p!==ov){if(!p.querySelector('input'))p.classList.add('phGoC');p=p.parentElement}});
    const inp=ov.querySelector('input');if(inp){let f=inp.closest('form')||inp.parentElement;f.classList.add('phGoF');f.querySelectorAll('button').forEach(x=>{if(/랭킹|등록/.test(x.textContent))x.textContent='OK'})}}
  ov.querySelectorAll('input').forEach(inp=>{const f=inp.closest('form')||inp.parentElement;if(!f.classList.contains('phGoF')){f.classList.add('phGoF');f.querySelectorAll('button').forEach(x=>{if(/랭킹|등록/.test(x.textContent))x.textContent='OK'})}}); /* 이름 칸은 게임이 새로 만들어도 매번 맞춤 (0점이어도 숨기지 않음) */
  const d=phGoData(ov),k=JSON.stringify(d),top=ov.querySelector('.phGo');
  if(top._k!==k){top._k=k;const m=d[0]||['SCORE','0'],rest=d.slice(1);top.querySelector('.phGoN i').textContent=m[0]||'SCORE';top.querySelector('.phGoN b').textContent=m[1];
    const box=top.querySelector('.phGoSt');box.innerHTML=rest.map(([l,v])=>`<div><i>${l}</i><b>${v}</b></div>`).join('');box.hidden=rest.length<2}
  const m=d[0]||['SCORE','0'];
  if(!ov._phSeen){ov._phTick=(ov._phTick||0)+1;if(ov._phTick>=2){ov._phSeen=1;top.querySelector('.phGoQ').textContent=phGoLine(ov,m);
    const time=/TIME/i.test(m[0]),v=goNum(m[1],time);ov.classList.remove('phGo1');
    const t0=top.querySelector('.phGoT');if(window.__phWinTest||window.__phWin1||(!time&&v>0&&window.__phTopN!=null&&v>window.__phTopMax)){ /* __phWin1: 시간 기록 게임이 직접 알려 주는 1위 (2026-10-31) */ov.classList.add('phGo1');t0.outerHTML=phDots('LEGEND','#ffd84d','phGoT');top.querySelector('.phGoQ').textContent='전설이 탄생했어요! 지금 랭킹 1위예요';phWin(ov,m)}else if(t0.getAttribute('aria-label')!=='GAME OVER')t0.outerHTML=phDots('GAME OVER','#f4fff0','phGoT')}}}
function phGo(){['overOv','ovOver','overlay'].forEach(id=>{const ov=document.getElementById(id);if(!ov)return;const on=id==='overOv'?!ov.hidden:id==='ovOver'?ov.classList.contains('show'):ov.classList.contains('over');
  if(on)phGoOne(ov);else if(ov._phSeen||ov._phTick){ov._phSeen=0;ov._phTick=0;const w=ov.querySelector('.phWin');if(w)w.remove()}})}
setInterval(()=>{try{phGo()}catch(e){}},250);
/* 사운드 아이콘 하나로 (2026-10-30): 배경음·효과음 버튼 대신 스피커 하나 → 소리 창. 순서: 설정 · 사운드 · 잠시 멈춤 */
const SPK='<svg viewBox="0 0 22 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true"><path d="M2 7 H6 L11 3 V17 L6 13 H2 Z M14 7 Q16 10 14 13 M17 4 Q21 10 17 16"/></svg>';
function phSnd(){const gear=[...document.querySelectorAll('button[aria-label="설정"]')].find(b=>b.classList.contains('phIb'));if(!gear||gear._phSnd)return;
  const pause=[...document.querySelectorAll('button.phIb')].find(b=>/일시정지|잠시 멈춤/.test(b.getAttribute('aria-label')||''));gear._phSnd=1;
  document.querySelectorAll('button[data-ph="bgm"],button[data-ph="sfx"]').forEach(b=>b.classList.add('phSndOld'));
  const sb=document.createElement('button');sb.type='button';sb.className=(pause?pause.className:gear.className).replace(/\bis-play\b/,'')+' phSndB';sb.setAttribute('aria-label','소리');sb.innerHTML=SPK;
  sb.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();window.__phSnd=1;gear.click();setTimeout(()=>{if(window.__phSnd){window.__phSnd=0;setOpen({_snd:1})}},60)});
  const sock=b=>b.parentElement&&b.parentElement.classList.contains('sock')?b.parentElement:b;
  const G=sock(gear);if(pause){const P=sock(pause);G.parentNode.insertBefore(P,G)}
  let S=sb;if(G!==gear){S=document.createElement('span');S.className=G.className;S.appendChild(sb)}
  const P=pause?sock(pause):G;P.parentNode.insertBefore(S,P);S.parentNode.insertBefore(G,S); /* 2026-10-30: 설정 · 소리 · 잠시 멈춤(맨 끝) */
  const upd=()=>{const off=!(phAudio.bgmOn()||phAudio.sfxOn());sb.classList.toggle('off',off)};upd();phAudio.on(upd)}
function fill2(){fill();back();try{phMotion();setBtn();syncIb();document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ph=bgm],[data-ph=sfx]');if(!b||b._phOwn)return;e.preventDefault();e.stopPropagation();b.dataset.ph==='bgm'?phAudio.toggleBgm():phAudio.toggleSfx()},true)}catch(e){}phFont();howBtn();btnFont();nmFill();phUiCss();window.phSeg();phStartRow();phOv();phPause();phSnd();document.querySelectorAll(NSEL).forEach(i=>{if(!(i.maxLength>0)||i.maxLength>8)i.maxLength=8});setTimeout(silentTip,700);let t=0;try{new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>{btnFont();window.phSeg();setBtn();phStartRow();phOv();phPause()},30)}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fill2);else fill2();
})();

/* ===== 버튼 누를 때 작은 소리 + 진동 (2026-10-30, 모든 게임 공통) =====
   소리: 각 게임 효과음 설정(끄기·볼륨)을 따름 · 진동: 게임 설정의 진동 끄기를 따름
   안드로이드 = 진동 · 아이폰(iOS 18 이상) = 스위치 햅틱 */
(function(){
  let tc=null,hl=null;
  function vol(){let v=1;try{if(window.phAudio&&phAudio.sfx)v=phAudio.sfx()}catch(e){}try{if(typeof sndOn!=='undefined'&&!sndOn)v=0}catch(e){}return v}
  function tick(v){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!tc||tc.state==='closed')tc=new C();if(tc.state!=='running')tc.resume();
    const t=tc.currentTime,o=tc.createOscillator(),g=tc.createGain();o.type='sine';o.frequency.setValueAtTime(1500,t);o.frequency.exponentialRampToValueAtTime(900,t+.035);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05*v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(g).connect(tc.destination);o.start(t);o.stop(t+.06)}catch(e){}}
  function hapOn(){try{return !window.phPref||phPref.get('hap',true)!==false}catch(e){return true}}
  function haptic(){try{if(navigator.vibrate){navigator.vibrate(8);return}
    const ae=document.activeElement;if(ae&&(ae.tagName==='TEXTAREA'||(ae.tagName==='INPUT'&&!/^(checkbox|radio|button|range)$/i.test(ae.type))))return; /* 아이폰: 글자 입력 중엔 키보드가 닫히지 않게 건너뜀 */
    if(!hl){hl=document.createElement('label');hl.setAttribute('aria-hidden','true');hl.style.cssText='position:fixed;left:-40px;top:0;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none';
      const i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.tabIndex=-1;hl.appendChild(i);document.body.appendChild(hl)}
    hl.click()}catch(e){}}
  /* 게임 중 진동: phHaptic(ms 또는 [진동,쉼,진동…]) — 안드로이드 vibrate, 아이폰은 스위치 햅틱 · 진동 설정 따름 */
  window.phHaptic=function(p){if(!hapOn())return;try{if(navigator.vibrate){navigator.vibrate(p);return}const a=Array.isArray(p)?p:[p];let t=0;for(let k=0;k<a.length;k+=2){if(t)setTimeout(haptic,t);else haptic();t+=(+a[k]||0)+(+a[k+1]||0)}}catch(e){}};
  document.addEventListener('click',e=>{if(!e.isTrusted)return;const b=e.target.closest&&e.target.closest('button,[role="button"],a.it,.phS-howL,.msHow');if(!b||b.disabled||b===hl)return;
    const v=vol();if(v>0)tick(v);if(hapOn())haptic()},true);
})();

/* ===== 시작 화면 맨 아래 문구 통일 + 버전 표시 (2026-10-31) ===== */
(function(){const D={pang:'같은 색 팡팡이 4개를 이어 붙여 연쇄로 터뜨리는 퍼즐',switchpang:'팡팡이 자리를 바꿔 3개 이상 맞춰 터뜨리는 퍼즐',petris:'블록을 쌓아 가로줄을 지우는 게임보이 감성 테트리스',fruitpang:'같은 구슬을 합쳐 더 큰 구슬을 만드는 물리 퍼즐',hangulbi:'헷갈리는 맞춤법 낱말을 빗물이 닿기 전에 바르게 쳐서 터뜨리는 타자 게임',bricks:'공을 튕겨 벽돌을 깨는 우주 벽돌깨기',twinstar:'친구와 함께 적을 물리치고 동료를 구하는 협동 우주 슈팅',mines:'숫자를 단서로 지뢰를 피해 모든 칸을 여는 퍼즐'};
  const g=location.pathname.split('/')[1]||'';
  window.phVer=function(){let v=0;try{v=+(window.V||0);if(!v)for(const sc of document.scripts){const m=/var V="(\d{9,})"/.exec(sc.textContent||'');if(m){v=+m[1];break}}}catch(e){}if(!v)return '';const d=new Date(v*1000+9*36e5),z=n=>String(n).padStart(2,'0');return 'Update '+z(d.getUTCFullYear()%100)+'.'+z(d.getUTCMonth()+1)+'.'+z(d.getUTCDate())+' '+z(d.getUTCHours())+':'+z(d.getUTCMinutes())};
  function css(){if(document.getElementById('phCrCss'))return;const s=document.createElement('style');s.id='phCrCss';s.textContent='html body .phS-credit.phCr,html body .msCr.phCr{font:400 9px/1.65 Galmuri11,"NeoDunggeunmo",sans-serif!important;color:rgba(200,204,220,.42)!important;text-align:center!important;word-break:keep-all;max-width:300px;margin-left:auto!important;margin-right:auto!important}html body .phS>.phS-credit.phCr{margin-bottom:22px!important}.phCr .phCrM{display:block;margin-top:5px;font:400 9px/1.4 Galmuri11,sans-serif;color:rgba(200,204,220,.5)}.phCr .phCrV,.phVerTag{display:block;margin-top:3px;font:400 9px/1.4 Galmuri11,"NeoDunggeunmo",sans-serif;letter-spacing:0;color:rgba(200,204,220,.38)}';document.head.appendChild(s)}
  function run(){if(!D[g]){if(g==='games'||g===''){const m=document.querySelector('.ml');if(m&&!document.querySelector('.phVerTag')){css();const t=document.createElement('span');t.className='phVerTag';t.textContent=phVer();m.after(t)}}return}
    css();document.querySelectorAll('.phS-credit,.msCr').forEach(e=>{if(e.classList.contains('phCr'))return;e.classList.add('phCr');const t=D[g],c=t.charCodeAt(t.length-1)-0xAC00,jo=(c>=0&&c%28)?'이에요':'예요';e.innerHTML='이 게임은 '+t+jo+'. 박현아의 재능흥청망청 게임프로젝트, 즐겁게 즐겨주세요.<span class="phCrM">iamhyona@gmail.com</span><span class="phCrV">'+phVer()+'</span>'})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,50));else setTimeout(run,50)})();

/* ===== 방문자 TODAY (2026-10-31): 한 기기에서 게임별 하루 한 번만 셈 · 시작 화면에 TODAY NNN ===== */
(function(){if(!window.PH_TODAY)return; /* 2026-10-31: TODAY·통계는 나중에 배포 (켜려면 PH_TODAY=1) */const U='https://script.google.com/macros/s/AKfycbzkdjVleobj98oyxlC77cUf5txCRiSB6D1zgRWU56pX22ElXAx9R8xFRGnV0nKAUbwC/exec';
  let g=location.pathname.split('/')[1]||'hub';if(g==='games')g='hub';if(g==='farm'||g==='kart')return;
  const day=new Date(Date.now()+9*36e5).toISOString().slice(0,10);
  function nm(){try{let n=localStorage.getItem('ph-name');if(n)return n;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/-name$/.test(k)){n=localStorage.getItem(k);if(n)return n}}}catch(e){}return ''}
  function css(){if(document.getElementById('phTodayCss'))return;const s=document.createElement('style');s.id='phTodayCss';s.textContent='.phToday{display:inline-flex;align-items:center;gap:6px;margin:0 auto;padding:4px 10px;border:1.5px solid rgba(200,205,225,.22);border-radius:999px;font:400 8px/1 "Silkscreen",monospace;letter-spacing:.16em;color:rgba(200,204,220,.6);white-space:nowrap}.phToday b{font:400 13px/1 "Jersey 15","Silkscreen",monospace;letter-spacing:.04em;color:#fff}.phTodayW{display:flex;justify-content:center;margin:0 0 10px}.phTodayW[hidden]{display:none}';document.head.appendChild(s)}
  function put(n){css();window.__phToday=n;document.querySelectorAll('.phTodayW b').forEach(b=>b.textContent=n);
    const host=[...document.querySelectorAll('.phS .phS-logo,#msStart .phS-logo,.top .lgw')].filter(e=>!e.parentNode.querySelector(':scope>.phTodayW'));
    host.forEach(h=>{const w=document.createElement('div');w.className='phTodayW';w.innerHTML='<span class="phToday" aria-label="오늘 방문자">TODAY <b>'+n+'</b></span>';h.parentNode.insertBefore(w,h)})}
  function go(){let a='today';try{if(localStorage.getItem('phV:'+g)!==day){a='hit';localStorage.setItem('phV:'+g,day)}}catch(e){}
    fetch(U+'?g=visit&k='+g+'&a='+a+(a==='hit'?'&n='+encodeURIComponent(nm()):'')+'&_='+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(j=>{const n=g==='hub'?j.all:j.today;if(n!=null)put(Number(n).toLocaleString())}).catch(()=>{})}
  window.phTodayPut=put;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(go,300));else setTimeout(go,300)})();

/* ===== 2026-10-31: Galmuri11 글꼴을 게임 저장소에서도 받기 (외부 CDN이 막혀도 같은 글꼴) ===== */
(function(){try{const sc=[...document.scripts].find(x=>/\/games\/ph\.js/.test(x.src));if(!sc)return;const base=sc.src.replace(/ph\.js.*$/,'');const s=document.createElement('style');s.id='phGalmuri';
  s.textContent="@font-face{font-family:'Galmuri11';font-weight:400;font-display:swap;src:url('"+base+"fonts/Galmuri11.woff2') format('woff2')}@font-face{font-family:'Galmuri11';font-weight:700;font-display:swap;src:url('"+base+"fonts/Galmuri11-Bold.woff2') format('woff2')}";document.head.appendChild(s)}catch(e){}})();
/* (2026-10-31 시작 화면 자동 줄이기는 화면이 위로 밀리는 문제로 뺌) */

/* ===== 2026-10-31: 랭킹 목록 열 맞춤 — 순위 | 이름 | 난도·모드 배지 칸 | 보조 정보 | 점수 (모든 게임 같은 구조) ===== */
(function(){function css(){if(document.getElementById('phRkCol'))return;const s=document.createElement('style');s.id='phRkCol';
  s.textContent='.phRkRow{display:flex!important;align-items:center!important;gap:8px!important}.phRkRow>.phRkN{flex:1 1 auto!important;min-width:0!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '.phRkRow>.phRkB{flex:0 0 auto!important;width:var(--phRkBw,24px);display:flex!important;justify-content:flex-start;align-items:center;gap:4px;margin:0!important}.phRkRow>.phRkB>*{margin:0!important;flex:0 0 auto}'+
  '.phRkRow>.phRkI{flex:0 0 auto!important;min-width:var(--phRkIw,0px);text-align:right!important;display:flex;justify-content:flex-end;align-items:center;margin:0!important;white-space:nowrap}'+
  '.phRkRow>.phRkS{flex:0 0 auto!important;min-width:var(--phRkSw,80px);text-align:right!important;margin:0!important;white-space:nowrap}';document.head.appendChild(s)}
 function fix(row){if(row._rk)return;const B=row.querySelectorAll('.lvb,.phDvB');if(!B.length&&!row.querySelector('.rbg'))return;row._rk=1;css();
  const kids=[...row.children];let name=kids.find(k=>k.classList.contains('nm')||k.querySelector('.nm'));if(!name)return;
  let score=row.querySelector(':scope>.s')||(row.tagName==='LI'?kids[kids.length-1]:null);if(!score||score===name)return;
  let info=row.querySelector(':scope>small,:scope>.m');
  let box=row.querySelector(':scope>.rbg');if(!box){box=document.createElement('span');[...B].forEach(b=>box.appendChild(b))}
  box.classList.add('phRkB');row.classList.add('phRkRow');name.classList.add('phRkN');score.classList.add('phRkS');
  if(info){info.classList.add('phRkI');row.insertBefore(box,info);row.insertBefore(score,null);row.insertBefore(info,score)}else row.insertBefore(box,score)}
 function scan(root){(root||document).querySelectorAll('li,div').forEach(r=>{if(r._rk||!r.children.length||r.children.length>8)return;if(r.querySelector(':scope>.nm,:scope>span>.nm,:scope>span .nm'))fix(r)});
  document.querySelectorAll('.phRkRow').forEach(r=>{const l=r.parentElement;if(!l||l._rkw)return;l._rkw=1;let bw=0,iw=0,sw=0;l.querySelectorAll(':scope>.phRkRow').forEach(x=>{const b=x.querySelector('.phRkB'),i=x.querySelector('.phRkI'),s=x.querySelector('.phRkS');if(b)bw=Math.max(bw,b.scrollWidth);if(i)iw=Math.max(iw,i.scrollWidth);if(s)sw=Math.max(sw,s.scrollWidth)});
   l.style.setProperty('--phRkBw',Math.max(18,bw)+'px');l.style.setProperty('--phRkIw',iw+'px');l.style.setProperty('--phRkSw',Math.max(40,sw)+'px');setTimeout(()=>{l._rkw=0},50)})}
 let t=0;const go=M=>{if(M&&!M.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.classList.contains('nm')||n.querySelector&&n.querySelector('.nm')))))return;clearTimeout(t);t=setTimeout(()=>{try{scan()}catch(e){}},30)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{new MutationObserver(go).observe(document.body,{childList:true,subtree:true})});else new MutationObserver(go).observe(document.body,{childList:true,subtree:true})})();

/* ===== 2026-10-31: 시작 화면 간격 통일 — 타이틀 · 그림 · (모드 토글) · 버튼 사이를 모두 같은 간격(26px)으로, 눈에 보이는 그림 기준 ===== */
(function(){const GAP=26,GG=40; /* 그림 위아래는 40px로 넉넉하게, 토글→버튼은 26px */
 const vis=el=>{if(el.classList.contains('phS-show')||el.id==='msShow'){let t=1e9,b=-1e9;[...el.children].forEach(k=>{if(k.classList.contains('ball'))return;let q=k.getBoundingClientRect();if(k.tagName.toLowerCase()==='svg'){const r=k.querySelector('rect');if(r&&!k.querySelector('image'))q=r.getBoundingClientRect()}if(q.height){t=Math.min(t,q.top);b=Math.max(b,q.bottom)}});if(t<1e8){const im=el.querySelectorAll('svg,img,canvas');return {t,b}}}const r=el.getBoundingClientRect();return {t:r.top,b:r.bottom}};
 const setM=(el,d)=>{const cur=parseFloat(getComputedStyle(el).marginTop)||0;if(Math.abs(d)>.5)el.style.setProperty('margin-top',(cur-d)+'px','important')};
 function fit(){document.querySelectorAll('.phS,#msStart .msSc').forEach(P=>{if(!P.offsetParent)return;
  let seq=[...P.children].filter(e=>!/phS-sp|msSp/.test(e.className)&&e.offsetHeight);const lg=seq.findIndex(e=>e.classList.contains('phS-logo'));if(lg<0)return;
  seq=seq.slice(lg);const out=[];for(const e of seq){if(e.classList.contains('msBtns')){const m=e.querySelector('#msMode');if(m){out.push(m);out.push(e.querySelector('#msGoPlay')||e.children[1]);break}}out.push(e);if(e.classList.contains('phS-btns')||e.classList.contains('msBtns'))break}
  for(let i=1;i<out.length;i++){const a=out[i-1],b=out[i];const lgv=a.classList.contains('phS-logo')?a.querySelector('svg').getBoundingClientRect():null;const ab=lgv?lgv.bottom:vis(a).b;const bt=vis(b).t;const isG=x=>x.classList.contains('phS-show')||x.id==='msShow';setM(b,(bt-ab)-((isG(a)||isG(b))?GG:GAP))}})}
 window.phLogoGap=fit;[400,1200,2500].forEach(t=>setTimeout(fit,t));addEventListener('resize',()=>setTimeout(fit,100));
 try{new MutationObserver(()=>{clearTimeout(fit.t);fit.t=setTimeout(fit,150)}).observe(document.documentElement,{attributes:true,attributeFilter:['class']})}catch(e){}})();
