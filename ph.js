/* ===== 공통 UI: 상단 크레딧 픽셀 줄 · 도트 로고 · 튜토리얼 ===== */
(function(){
/* 듣던 음악(유튜브·유튜브 뮤직·스포티파이 등)이 끊기지 않게: 다른 앱 소리와 섞어 재생 + 무음 반복 재생 막기 */
function phAmb(){try{const as=navigator.audioSession;if(as&&as.type!=='ambient')as.type='ambient'}catch(e){}}
try{const as=navigator.audioSession;if(as){const pr=Object.getPrototypeOf(as),d=Object.getOwnPropertyDescriptor(pr,'type');
  if(d&&d.set&&d.get){Object.defineProperty(pr,'type',{configurable:true,enumerable:d.enumerable,get(){return d.get.call(this)},set(){d.set.call(this,'ambient')}})} /* 게임이 'playback'으로 바꿔도 항상 ambient */
  else{as.type='ambient';Object.defineProperty(as,'type',{configurable:true,get:()=>'ambient',set:()=>{}})}
  as.type='ambient'}}catch(e){}
try{for(const n of ['AudioContext','webkitAudioContext']){const C=window[n];if(!C||C._ph)continue;const W=function(...a){phAmb();return new C(...a)};W.prototype=C.prototype;W._ph=1;window[n]=W;
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
  return `<svg viewBox="0 0 ${W} ${(lines.length-1)*LH+7*cell}" style="--lw:${Math.round(W*5.5/12)}px" xmlns="http://www.w3.org/2000/svg">${o}</svg>`}; /* 점 크기 5.5px 고정 → 모든 게임 타이틀 글자 크기 같음 */
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
  if(!document.getElementById('phNeoF')){const f=document.createElement('style');f.id='phNeoF';f.textContent='@font-face{font-family:"NeoDunggeunmo";src:url(https://cdn.jsdelivr.net/npm/@kfonts/neodgm@0.5.0/neodgm.woff2) format("woff2");font-display:swap}';document.head.appendChild(f)}
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
  '.list .s,.list .t,.rk li b,.rank li em,#rList .s{font-family:"Jersey 15",sans-serif!important;font-weight:400!important;font-size:19px!important;letter-spacing:.02em!important}'+
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
  document.body.appendChild(d);setTimeout(()=>d.remove(),3800)}
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
      const a=bs[i],b=bs[Math.max(0,Math.min(n-1,i+dir))],xa=a.offsetLeft+a.offsetWidth/2,xb=b.offsetLeft+b.offsetWidth/2,x=xa+(xb-xa)*f,y=a.offsetTop-8-Math.sin(Math.PI*f)*14;ball.style.transform=`translate(${x-3.5}px,${y}px)`}
      requestAnimationFrame(loop)})(t0)}
}
window.phMotion=phMotion;
/* ===== 설정 창 (모든 게임 공통 · 2026-10-29) =====
   게임에서: phSettings.config({ guide:{label:'고스트 블록',get,set}, speed:{get,set}, fx:{get,set}, hap:{get,set}, vox:{get,set}, rot:{get,set}, onSound:fn })
   열기: phSettings.open({ inGame:true, restart:fn, home:fn, onClose:fn }) — 시작 화면 SETTINGS 버튼은 자동으로 붙음 */
const SC={};
function setOpen(o){o=o||{};phUiCss();const c=SC,touch=(()=>{try{return matchMedia('(pointer:coarse)').matches}catch(e){return false}})();
  const old=document.querySelector('.phSet');if(old){if(old._kb)removeEventListener('keydown',old._kb,true);old.remove()}
  const d=document.createElement('div');d.className='phSet';
  const tg=(k,on)=>`<div class="phSet-o"><button class="tg${on?' on':''}" data-k="${k}" data-v="1">ON</button><button class="tg${on?'':' on'}" data-k="${k}" data-v="0">OFF</button></div>`;
  const opt=(k,cur,L)=>`<div class="phSet-o">${L.map((t,i)=>`<button class="${cur===i?'on':''}" data-k="${k}" data-v="${i}">${t}</button>`).join('')}</div>`;
  const vol=(k,v,on)=>`<label class="phSet-v${on?'':' dim'}"><input type="range" min="0" max="100" step="5" value="${v}" data-vol="${k}" aria-label="${k==='bgm'?'배경음악':'효과음'} 볼륨"><b>${v}</b></label>`;
  const A=phAudio.state();let h='<div class="phSet-sec">SOUND</div>';
  h+=`<div class="phSet-r"><div class="phSet-l"><span>배경음악</span>${tg('bgm',phAudio.bgmOn())}</div>${vol('bgm',A.bgmV,phAudio.bgmOn())}</div>`;
  h+=`<div class="phSet-r"><div class="phSet-l"><span>효과음</span>${tg('sfx',phAudio.sfxOn())}</div>${vol('sfx',A.sfxV,phAudio.sfxOn())}</div>`;
  if(c.vox)h+=`<div class="phSet-r"><div class="phSet-l"><span>음성 안내</span>${tg('vox',!!c.vox.get())}</div></div>`;
  const play=[];
  if(c.guide)play.push(`<div class="phSet-r"><div class="phSet-l"><span>가이드 표시${c.guide.label?` <small>${c.guide.label}</small>`:''}</span>${opt('guide',c.guide.get()?1:0,['끄기','켜기'])}</div></div>`);
  if(c.speed)play.push(`<div class="phSet-r"><div class="phSet-l"><span>게임 속도</span>${opt('speed',+c.speed.get(),['느리게','보통','빠르게'])}</div></div>`);
  if(c.fx)play.push(`<div class="phSet-r"><div class="phSet-l"><span>화면 효과</span>${opt('fx',c.fx.get()?1:0,['끄기','켜기'])}</div></div>`);
  if(c.hap&&touch)play.push(`<div class="phSet-r"><div class="phSet-l"><span>진동</span>${opt('hap',c.hap.get()?1:0,['끄기','켜기'])}</div></div>`);
  if(c.rot)play.push(`<div class="phSet-r"><div class="phSet-l"><span>회전 방향</span>${opt('rot',c.rot.get()==='ccw'?1:0,['시계','반시계'])}</div></div>`);
  if(play.length)h+='<div class="phSet-sec">PLAY</div>'+play.join('');
  h+='<div class="phSet-btns">'+(o.inGame&&(o.restart||o.home)?`<div class="phSet-row">${o.restart?'<button class="phBtn sub" data-a="restart">RESTART</button>':''}${o.home?'<button class="phBtn sub" data-a="home">MAIN MENU</button>':''}</div>`:'')+'<button class="phBtn" data-a="close">CLOSE</button></div>';
  d.innerHTML=`<div class="phSet-c" role="dialog" aria-label="설정">${h}</div>`;document.body.appendChild(d);
  const close=a=>{removeEventListener('keydown',kb,true);d.remove();if(a==='restart'&&o.restart)o.restart();else if(a==='home'&&o.home)o.home();else if(o.onClose)o.onClose()};
  const kb=e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close()}};addEventListener('keydown',kb,true);d._kb=kb;
  d.addEventListener('click',e=>{e.stopPropagation();if(e.target===d){close();return}const b=e.target.closest('button');if(!b)return;
    if(b.dataset.a){close(b.dataset.a);return}const k=b.dataset.k,v=+b.dataset.v;if(!k)return;
    if(k==='bgm')phAudio.toggleBgm(!!v);else if(k==='sfx')phAudio.toggleSfx(!!v);else if(k==='rot')c.rot.set(v?'ccw':'cw');else if(c[k])c[k].set(k==='speed'?v:!!v);
    if(c.onSound&&(k==='bgm'||k==='sfx'))c.onSound();if(k==='hap'&&v&&navigator.vibrate)try{navigator.vibrate(20)}catch(_){}
    setOpen(o)});
  d.querySelectorAll('[data-vol]').forEach(i=>i.addEventListener('input',()=>{const v=+i.value;i.nextElementSibling.textContent=v;if(i.dataset.vol==='bgm')phAudio.setBgm(v);else phAudio.setSfx(v);
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
function fill2(){fill();back();try{phMotion();setBtn();syncIb();document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ph=bgm],[data-ph=sfx]');if(!b||b._phOwn)return;e.preventDefault();e.stopPropagation();b.dataset.ph==='bgm'?phAudio.toggleBgm():phAudio.toggleSfx()},true)}catch(e){}phFont();howBtn();btnFont();nmFill();phUiCss();window.phSeg();document.querySelectorAll(NSEL).forEach(i=>{if(!(i.maxLength>0)||i.maxLength>8)i.maxLength=8});setTimeout(silentTip,700);let t=0;try{new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>{btnFont();window.phSeg();setBtn()},30)}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fill2);else fill2();
})();
