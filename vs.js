/* ===== 공통 온라인 대전 (방 코드 4자리 · 1:1) — 스위치팡 · 팡팡 · 벽돌깨기 ===== */
(function(){
const Q=new URLSearchParams(location.search);
const LOCAL=Q.has('vslocal'); // 테스트용: 같은 브라우저 탭끼리 연결
const OPTS={debug:0,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}]}};
let cfg=null,peer=null,conn=null,isHost=false,code='',oppName='',myEnd=null,oppEnd=null,done=false,meAgain=false,oppAgain=false,lastSc=0,scT=null,scPend=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function el(id){return document.getElementById(id)}
function modal(title,html,closable){let m=el('phV');if(!m){m=document.createElement('div');m.id='phV';m.className='phV';document.body.appendChild(m);['pointerdown','touchstart'].forEach(t=>m.addEventListener(t,e=>e.stopPropagation()))}
  m.innerHTML=`<div class="phV-c">${title?`<div class="phV-h">${title}</div>`:''}${html}${closable!==false?'<button class="phV-x" id="phVx" aria-label="닫기">✕</button>':''}</div>`;m.hidden=false;
  const x=el('phVx');if(x)x.onclick=()=>{close();cleanup()}}
function close(){const m=el('phV');if(m)m.hidden=true}
function chip(txt){let c=el('phVc');if(!c){c=document.createElement('div');c.id='phVc';c.className='phVc';document.body.appendChild(c)}
  if(txt==null){c.hidden=true;return}c.hidden=false;c.innerHTML=`<b>VS</b> ${esc(oppName||'상대')} <span>${esc(txt)}</span>`}
function code4(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<4;i++)c+=a[Math.floor(Math.random()*a.length)];return c}
function cleanup(){try{conn&&conn.close()}catch(e){}try{peer&&peer.destroy()}catch(e){}peer=null;conn=null;API.active=false;chip(null);clearTimeout(scT)}
function send(d){try{if(conn&&conn.open)conn.send(d)}catch(e){}}
function loadPeer(cb){if(LOCAL||window.PHRelay)return cb(true);const s=document.createElement('script');s.src='../games/relay.js?v=1';s.onload=()=>cb(true);s.onerror=()=>cb(false);document.head.appendChild(s)} /* 중계 서버 방식 (휴대폰 데이터에서도 연결) */
/* 테스트용 가짜 연결 (BroadcastChannel) */
function localConn(room,host){const bc=new BroadcastChannel('phvs-'+room),h={open:false,_on:{},on(t,f){this._on[t]=f},send(d){bc.postMessage({from:host?'h':'g',d})},close(){bc.close()}};
  bc.onmessage=e=>{const m=e.data;if(m.from===(host?'h':'g'))return;if(m.d&&m.d.__hello&&!h.open){h.open=true;bc.postMessage({from:host?'h':'g',d:{__hello:1}});h._on.open&&h._on.open();return}if(!m.d.__hello)h._on.data&&h._on.data(m.d)};
  setTimeout(()=>bc.postMessage({from:host?'h':'g',d:{__hello:1}}),50);return h}
function gfont(){if(el('phVg'))return;const l=document.createElement('link');l.id='phVg';l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';document.head.appendChild(l);const st=document.createElement('style');st.textContent='.phV-in:not(.code){font-family:"Galmuri11",-apple-system,"Apple SD Gothic Neo",sans-serif!important}';document.head.appendChild(st)} /* 이름 입력도 게임 글꼴(갈무리)로 */
function menu(){gfont();
  const nm=cfg.name()||'';
  modal('ONLINE PLAY',`<label class="phV-l">NAME</label><input class="phV-in" id="phVn" maxlength="8" placeholder="닉네임" value="${esc(nm)}">
   <button class="phV-b" id="phVh">CREATE ROOM</button><div class="phV-or">OR JOIN WITH CODE</div>
   <div class="phV-row"><input class="phV-in code" id="phVc" maxlength="4" placeholder="ABCD" autocapitalize="characters" autocomplete="off"><button class="phV-b" id="phVj">JOIN</button></div>`);
  const nameOk=()=>{const v=el('phVn').value.trim().slice(0,8);if(!v){el('phVn').classList.add('warn');el('phVn').focus();return false}cfg.setName(v);return true};
  el('phVc').oninput=e=>{const v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(v!==e.target.value)e.target.value=v}; /* 코드: 대소문자 상관없이 자동 대문자 */
  el('phVh').onclick=()=>{if(nameOk())host()};
  el('phVj').onclick=()=>{if(!nameOk())return;const c=el('phVc').value.trim().toUpperCase();if(c.length!==4){el('phVc').focus();return}join(c)};
}
function host(){cleanup();isHost=true;code=code4();modal('CREATING','<p class="phV-m">잠시만요…</p>');
  if(LOCAL){showCode();setup(localConn(code,true));return}
  loadPeer(ok=>{if(!ok)return fail('load');peer=PHRelay.host(cfg.id,code,{onReady:showCode,onConn:c=>setup(c),onError:t=>fail(t)})})}
function showCode(){modal('ROOM CODE',`<div class="phV-code">${code}</div><p class="phV-m">친구에게 이 코드를 알려 주세요.<br>친구가 들어오면 바로 시작해요.</p><div class="phV-dots"><i></i><i></i><i></i></div>`)}
function join(c){cleanup();isHost=false;code=c;modal('CONNECTING',`<div class="phV-code">${esc(c)}</div><p class="phV-m">방에 들어가는 중…</p>`);
  if(LOCAL){setup(localConn(c,false));return}
  loadPeer(ok=>{if(!ok)return fail('load');peer=PHRelay.join(cfg.id,c,{onConn:cc=>setup(cc),onError:t=>fail(t)})})}
function fail(t){const msg=t==='nofound'?'그 코드의 방을 찾을 수 없어요.<br>코드를 다시 확인해 주세요.':t==='load'||t==='network'||t==='server-error'?'연결 서버에 접속하지 못했어요.<br>잠시 후 다시 해 주세요.':'연결에 실패했어요.<br>와이파이나 데이터를 바꿔서 다시 해 보세요.';
  cleanup();modal('WOOPS!',`<p class="phV-m">${msg}</p><button class="phV-b" id="phVr">RETRY</button>`);el('phVr').onclick=menu}
function setup(c){conn=c;c.on('open',()=>{send({t:'hi',name:cfg.name()||'익명'});if(isHost)setTimeout(go,500)});c.on('data',onData);c.on('close',onClose);c.on('error',onClose)}
function go(){const d={t:'go',seed:Math.floor(Math.random()*2**31)};send(d);begin(d)}
function begin(d){myEnd=null;oppEnd=null;done=false;meAgain=false;oppAgain=false;lastSc=0;let n=3;
  const tick=()=>{if(n>0){modal(oppName?'VS '+esc(oppName):'VS',`<div class="phV-count">${n}</div>`,false);n--;setTimeout(tick,800)}else{close();API.active=true;chip('READY');cfg.start(d)}};tick()}
function onData(d){if(!d||typeof d!=='object')return;
  if(d.t==='hi'){oppName=String(d.name||'상대').slice(0,8);return}
  if(d.t==='go'){begin(d);return}
  if(d.t==='sc'){chip(d.x);return}
  if(d.t==='lose'){oppEnd={s:d.s,lose:true};if(!myEnd){stopMe();result('win','상대가 먼저 쓰러졌어요')}return}
  if(d.t==='won'){oppEnd={s:d.s,won:true};if(!done){stopMe();result('lose','상대가 먼저 목표를 달성했어요')}return}
  if(d.t==='end'){oppEnd={s:d.s};if(myEnd)compare();return}
  if(d.t==='again'){oppAgain=true;if(meAgain&&isHost)go();else if(done)result(lastRes,lastWhy);return}
  if(d.t==='bye'){onClose();return}
  if(API.active)cfg.data(d)}
function stopMe(){if(API.active){API.active=false;try{cfg.stop()}catch(e){}}}
function onClose(){if(!conn)return;const wasPlaying=API.active;conn=null;
  if(wasPlaying){stopMe();result('win','상대가 나갔어요',true)}
  else if(done){lastWhy='상대가 나갔어요';result(lastRes,lastWhy,true)}
  else{cleanup();modal('BYE',`<p class="phV-m">상대와 연결이 끊겼어요.</p><button class="phV-b" id="phVo">OK</button>`);el('phVo').onclick=()=>{close();cfg.leave()}}}
function compare(){const a=myEnd.s||0,b=oppEnd.s||0;result(a>b?'win':a<b?'lose':'draw','')}
let lastRes='',lastWhy='';
function result(r,why,gone){done=true;API.active=false;lastRes=r;lastWhy=why;
  const t=r==='win'?'YOU WIN!':r==='lose'?'YOU LOSE':'DRAW';
  const my=myEnd&&myEnd.s!=null?myEnd.s:(cfg.score?cfg.score():0),op=oppEnd&&oppEnd.s!=null?oppEnd.s:null;
  chip(null);
  modal(`<span class="phV-${r}">${t}</span>`,`${why?`<p class="phV-m">${why}</p>`:''}<div class="phV-sc"><div><small>ME</small><b>${Number(my||0).toLocaleString()}</b></div><div><small>${esc(oppName||'상대')}</small><b>${op==null?'-':Number(op).toLocaleString()}</b></div></div>
   ${gone||!conn?'':`<button class="phV-b" id="phVa">${meAgain?(oppAgain?'STARTING…':'WAITING…'):oppAgain?'AGAIN! (상대 준비됨)':'AGAIN'}</button>`}<button class="phV-b sub" id="phVe">EXIT</button>`,false);
  const a=el('phVa');if(a)a.onclick=()=>{if(meAgain)return;meAgain=true;send({t:'again'});if(oppAgain&&isHost)go();else result(lastRes,lastWhy)};
  el('phVe').onclick=()=>{send({t:'bye'});cleanup();close();cfg.leave()}}
const API={active:false,
  init(c){cfg=c},
  menu(){if(!cfg)return;menu()},
  send,
  score(txt){const now=Date.now();scPend=txt;if(now-lastSc>300){lastSc=now;send({t:'sc',x:txt})}else{clearTimeout(scT);scT=setTimeout(()=>{lastSc=Date.now();send({t:'sc',x:scPend})},320)}},
  over(s,lost){ // 내 게임이 끝남 (lost: 쓰러져서 짐)
    if(!API.active&&!myEnd&&done)return;API.active=false;myEnd={s,lose:!!lost};
    if(lost){send({t:'lose',s});result('lose','')}
    else{send({t:'end',s});if(oppEnd)compare();else modal('TIME UP',`<p class="phV-m">상대 기록을 기다리는 중…</p><div class="phV-dots"><i></i><i></i><i></i></div>`,false)}},
  claimWin(s){API.active=false;myEnd={s,won:true};send({t:'won',s});result('win','')}
};
window.PHVS=API;
})();
