/* ===== 온라인 대전 중계 (공용 MQTT 브로커 · 웹소켓) =====
   휴대폰 데이터·와이파이 어디서든 연결되도록 P2P 대신 중계 서버로 메시지를 주고받아요.
   여러 브로커에 동시에 붙고, 같은 메시지는 한 번만 처리해요. */
(function(){
function MQ(urls,opts){const self={on:{},ok:false};let ws=null,buf=new Uint8Array(0),pid=1,ping=null,ui=0;const te=new TextEncoder(),td=new TextDecoder();
 const vl=n=>{const o=[];do{let d=n%128;n=Math.floor(n/128);if(n>0)d|=128;o.push(d)}while(n>0);return o};
 const str=s=>{const b=te.encode(s);return [b.length>>8,b.length&255,...b]};
 const pkt=(h,body)=>new Uint8Array([h,...vl(body.length),...body]);
 function conn(){if(ui>=urls.length){self.on.fail&&self.on.fail();return}const u=urls[ui];let w;try{w=new WebSocket(u.url,'mqtt')}catch(e){ui++;return conn()}ws=w;w.binaryType='arraybuffer';const to=setTimeout(()=>{if(!self.ok){try{w.close()}catch(e){}}},5000);
  w.onopen=()=>{let fl=2,pl=str(opts.id);if(u.user){fl|=0xC0;pl=pl.concat(str(u.user),str(u.pass))}w.send(pkt(0x10,[...str('MQTT'),4,fl,0,30,...pl]))};
  w.onmessage=e=>{const a=new Uint8Array(e.data),n=new Uint8Array(buf.length+a.length);n.set(buf);n.set(a,buf.length);buf=n;parse()};
  w.onclose=()=>{clearTimeout(to);clearInterval(ping);if(!self.ok){ui++;conn()}else{self.ok=false;self.on.close&&self.on.close()}};w.onerror=()=>{}}
 function parse(){while(buf.length>=2){let m=1,len=0,i=1,b;do{b=buf[i++];len+=(b&127)*m;m*=128}while(b&128&&i<buf.length);if(buf.length<i+len)return;const h0=buf[0],t=h0>>4,body=buf.slice(i,i+len);buf=buf.slice(i+len);
  if(t===2){if(body[1]===0){self.ok=true;ping=setInterval(()=>{try{ws.send(new Uint8Array([0xC0,0]))}catch(e){}},20000);self.on.open&&self.on.open()}}
  else if(t===3){const tl=(body[0]<<8)|body[1],topic=td.decode(body.slice(2,2+tl));let p=2+tl;if((h0>>1&3)>0)p+=2;try{self.on.msg&&self.on.msg(topic,JSON.parse(td.decode(body.slice(p))))}catch(e){}}}}
 self.sub=topic=>{const id=pid++;ws.send(pkt(0x82,[id>>8,id&255,...str(topic),0]))};
 self.pub=(topic,obj)=>{if(!self.ok)return;ws.send(pkt(0x30,[...str(topic),...te.encode(JSON.stringify(obj))]))};
 self.close=()=>{self.on={};try{ws&&ws.close()}catch(e){}};
 conn();return self}
const BROKERS=[[{url:'wss://broker.emqx.io:8084/mqtt'}],[{url:'wss://broker.hivemq.com:8884/mqtt'}],[{url:'wss://public.cloud.shiftr.io',user:'public',pass:'public'},{url:'wss://test.mosquitto.org:8081/mqtt'}]];
const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
function room(game,code,isHost,cb){
  const me=rid(),topic='iamhyona-ph/'+game+'/'+code;let peerId=null,dead=false,seq=0,seen=new Set(),seenQ=[],lastIn=0,hb=null,knockT=null,failN=0,anyOpen=false;
  const cs=BROKERS.map(urls=>{const c=MQ(urls,{id:'ph'+rid()});c.on.open=()=>{c.sub(topic);if(!anyOpen){anyOpen=true;start()}};c.on.fail=()=>{if(++failN===cs.length&&!anyOpen)err('network')};return c});
  const out=o=>{o.from=me;cs.forEach(c=>c.pub(topic,o))};
  const conn={open:false,_on:{},on(t,f){this._on[t]=f},send(d){if(conn.open)out({k:'d',to:peerId,s:++seq,d})},close(){bye()}};
  const emit=(t,a)=>{try{conn._on[t]&&conn._on[t](a)}catch(e){console.error(e)}};
  function err(t){if(dead)return;destroy();cb.onError&&cb.onError(t)}
  function opened(){conn.open=true;lastIn=Date.now();cb.onConn&&cb.onConn(conn);setTimeout(()=>emit('open'),0);
    hb=setInterval(()=>{out({k:'hb',to:peerId});if(Date.now()-lastIn>15000){const was=conn.open;conn.open=false;clearInterval(hb);if(was)emit('close')}},3000)}
  function start(){if(isHost){cb.onReady&&cb.onReady()}else{let n=0;const knock=()=>{if(peerId||dead)return;if(++n>10)return err('nofound');out({k:'knock'})};knock();knockT=setInterval(knock,1000)}}
  cs.forEach(c=>c.on.msg=(tp,m)=>{if(dead||!m||m.from===me)return;
    if(isHost&&m.k==='knock'){if(!peerId){peerId=m.from;out({k:'welcome',to:peerId});opened()}else if(m.from===peerId)out({k:'welcome',to:peerId});return}
    if(m.to!==me)return;
    if(!isHost&&m.k==='welcome'){if(!peerId){peerId=m.from;clearInterval(knockT);opened()}return}
    if(m.from!==peerId)return;lastIn=Date.now();
    if(m.k==='d'){if(seen.has(m.s))return;seen.add(m.s);seenQ.push(m.s);if(seenQ.length>400)seen.delete(seenQ.shift());emit('data',m.d)}
    else if(m.k==='bye'){if(conn.open){conn.open=false;emit('close')}}});
  function bye(){if(peerId)out({k:'bye',to:peerId});setTimeout(destroy,300)}
  function destroy(){if(dead)return;dead=true;conn.open=false;clearInterval(hb);clearInterval(knockT);setTimeout(()=>cs.forEach(c=>c.close()),50)}
  return {destroy(){if(conn.open)bye();else destroy()}};
}
window.PHRelay={host:(g,c,cb)=>room(g,c,true,cb),join:(g,c,cb)=>room(g,c,false,cb)};
})();
