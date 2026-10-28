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
/* 랭킹 보기 제한: 이 기기의 랭킹 이름이 soooooo면, 정한 시각 이후 등록된 뚠캣 기록은 랭킹에서 뺌 (시트 기록은 그대로 · 다른 사람 화면은 그대로) */
const RK_HIDE=[{viewer:/^so{3,}$/i,who:'뚠캣',after:'2026-10-29 03:10'}];
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
  return `<svg viewBox="0 0 ${W} ${(lines.length-1)*LH+7*cell}" xmlns="http://www.w3.org/2000/svg">${o}</svg>`};
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
/* 랭킹 난이도 뱃지 — 모든 게임 같은 색: EASY 초록 · NORMAL 노랑 · HARD 빨강 · MASTER 보라 · 그 밖(TIME·ITEM·VS 등) 회색 */
window.phLv=function(label){label=String(label||'').trim();if(!label)return'';if(!document.getElementById('phLvCss')){const s=document.createElement('style');s.id='phLvCss';s.textContent='.lvb{display:inline-block;font:700 7px Silkscreen,monospace!important;font-style:normal!important;letter-spacing:.06em!important;padding:2px 4px 1px;border-radius:3px;vertical-align:2px;margin-left:4px;color:#0a0c1d!important;background:#9aa3c7;line-height:1.25;white-space:nowrap;text-transform:uppercase}.lvb.easy{background:#5fe08a}.lvb.normal{background:#ffd23f}.lvb.hard{background:#ff5a6e}.lvb.master{background:#b48cff}';document.head.appendChild(s)}
 const C={EASY:'easy',NORMAL:'normal',HARD:'hard',MASTER:'master'};return label.split(/\s+/).map(w=>`<i class="lvb ${C[w.toUpperCase()]||''}">${w.replace(/[<>&"]/g,'')}</i>`).join('')};
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
  const row=(L,k)=>L&&L.length>1?`<div class="phRk-t" data-k="${k}">${L.map(([id,lb])=>`<button type="button" data-v="${id}" class="${S[k]===id?'on ':''}${k==='diff'?(LVC[String(lb).toUpperCase()]||''):''}">${lb}</button>`).join('')}</div>`:'';
  el.classList.add('phRk');el.innerHTML=row(o.modes,'mode')+row(o.diffs,'diff')+(V.length>1?`<div class="phRk-v"><select aria-label="버전">${V.map(v=>`<option value="${v.id}"${v.id===S.ver?' selected':''}>${v.label}</option>`).join('')}</select></div>`:'');
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
function back(){let sa=false;try{sa=navigator.standalone||matchMedia('(display-mode: standalone)').matches}catch(e){}if(!sa||/^\/games\/?$/.test(location.pathname))return;
  const GN={petris:'PETRIS',switchpang:'SWITCH PANG',fruitpang:'MARBLE PANG',mines:'MINESWEEPER',pang:'PANGYA PANGYA',bricks:'BRICKS',hangulbi:'HANGULBI',twinstar:'TWIN STAR',peekaboo:'PEEKABOO'},gid=location.pathname.split('/')[1]||'',nm=GN[gid]||gid.toUpperCase(),lab=(nm.length>8?'HYONA\'S ':'PARK HYONA\'S ')+nm; // 이름이 길면 HYONA'S 로 짧게 // 게임 이름까지 표시
  const go=e=>{e.preventDefault();e.stopPropagation();location.href='/games/'};const els=document.querySelectorAll('.lcd-label .copy');
  if(els.length){els.forEach(el=>{if(el._bk)return;el._bk=1;el.textContent=lab;el.style.cssText+=';cursor:pointer;pointer-events:auto;position:relative;z-index:50';el.addEventListener('click',go)})}
  else if(!document.getElementById('phBack')){const b=document.createElement('a');b.id='phBack';b.href='/games/';b.textContent=lab;b.style.cssText='position:fixed;left:calc(env(safe-area-inset-left,0px) + 8px);top:calc(env(safe-area-inset-top,0px) + 6px);z-index:9999;font:700 10px Silkscreen,monospace;letter-spacing:1px;color:#fff;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:5px 8px;text-decoration:none';b.addEventListener('click',go);document.body.appendChild(b)}}
/* 버튼 글꼴 통일: 시작·모드·결과 화면의 영문 픽셀 버튼은 모두 Silkscreen 보통 굵기 (한글 버튼·게임 설명 버튼은 그대로) */
function btnFont(){document.querySelectorAll('button').forEach(b=>{if(b._pf||b.classList.contains('phS-how')||/[가-힣]/.test([...b.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('')))return;const f=getComputedStyle(b).fontFamily;if(/Silkscreen|Press Start/i.test(f)){b._pf=1;b.style.setProperty('font-family','"Silkscreen",monospace','important');b.style.setProperty('font-weight','400','important')}})}
/* 게임 들어오면 잠깐: 무음을 해제해야 소리가 들립니다 (휴대폰에서만, 게임 목록 화면 제외) */
function silentTip(){try{if(!matchMedia('(pointer:coarse)').matches||/^\/games\/?$/.test(location.pathname))return}catch(e){return}
  const d=document.createElement('div');d.className='phTip';d.innerHTML='<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="#e9e9f0" d="M2 6h3l4-3h1v10H9L5 10H2z"/><path fill="#e9e9f0" d="M12 6h1v4h-1z"/><line x1="2" y1="14" x2="14" y2="2" stroke="#ff5a6e" stroke-width="2" stroke-linecap="round"/></svg><span>무음을 해제해야 소리가 들립니다</span>';
  document.body.appendChild(d);setTimeout(()=>d.remove(),3800)}
function fill2(){fill();back();phFont();howBtn();btnFont();nmFill();setTimeout(silentTip,700);let t=0;try{new MutationObserver(()=>{clearTimeout(t);t=setTimeout(btnFont,30)}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fill2);else fill2();
})();
