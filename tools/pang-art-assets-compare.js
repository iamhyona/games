// 팡팡이 그림 자산 비교: 수정 전/후 두 폴더를 각각 서버로 띄우고 7개 게임의 실제 사용 SVG를 비교
// 사용: (구버전 폴더) python3 -m http.server 8101 / (신버전 폴더) python3 -m http.server 8102
//       두 폴더 모두 게임 저장소들과 games 를 형제 폴더로 둠 (예: work/pang, work/games ...)
//       node tools/pang-art-assets-compare.js   (playwright 필요)
// 결과: 게임별 SAME / DIFF(달라진 항목). 디자인 수정 시엔 DIFF 가 '의도한 캐릭터'에만 나와야 정상
const {chromium}=require('playwright');const crypto=require('crypto');
const H=s=>crypto.createHash('md5').update(String(s)).digest('hex').slice(0,10);
const PROBE={
 pang:`(()=>{const o={};for(const k in IMG)o['IMG.'+k]=IMG[k].src;o.COL=JSON.stringify(COL);return o})()`,
 switchpang:`(()=>{const o={};for(const k in IMG)o['IMG.'+k]=IMG[k].src;o.COL=JSON.stringify(COL);o.map9=pieceSVG(9,'')===window.PangArt.pieceSVG(8,'');o.rainbow=rainbowSVG('');return o})()`,
 shootingpang:`(()=>{const o={};for(const c of [1,2,3,4,5,6,7,8,9,10])for(const m of ['','b','o','x'])o[c+m]=PangArt.pieceSVG(c,m);o.COL=JSON.stringify(PangArt.COL);return o})()`,
 bricks:`(()=>{const o={};for(const k in PPBALLSVG)o['ball.'+k]=PPBALLSVG[k];for(const k in window.PPSV)o['PPSV.'+k]=PPSV[k];for(const k in (window.PPI||{}))o['PPI.'+k]=PPI[k].src;return o})()`,
 twinstar:`(()=>{const o={};for(const k in window.PPSV)o['PPSV.'+k]=PPSV[k];for(const k in (window.PPI||{}))o['PPI.'+k]=PPI[k].src;return o})()`,
 hangulbi:`(()=>{const o={};for(const k in window.PPSV)o['PPSV.'+k]=PPSV[k];for(const k in (window.PPI||{}))o['PPI.'+k]=PPI[k].src;return o})()`,
 mines:`(()=>{const o={};document.documentElement.classList.add('pp');for(let L=0;L<5;L++){lv=L;for(const f of ['smile','oh','dead','cool']){setFace(f);o['face.lv'+L+'.'+f]=document.getElementById('face').innerHTML}}document.documentElement.classList.remove('pp');for(const f of ['smile','oh','dead','cool']){setFace(f);o['classic.'+f]=document.getElementById('face').innerHTML}return o})()`,
};
(async()=>{const b=await chromium.launch();let allok=true;
for(const g of Object.keys(PROBE)){
 const res={};
 for(const port of [+(process.env.OLD||8101),+(process.env.NEW||8102)]){
  const ctx=await b.newContext({viewport:{width:430,height:860}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{window.__srcs=new Set();const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{set(v){if(String(v).startsWith('data:image/svg'))window.__srcs.add(v);d.set.call(this,v)},get(){return d.get.call(this)}})});
  await p.goto(`http://localhost:${port}/${g}/`);await p.waitForTimeout(1500);
  for(const skin of ['pp','cl']){await p.evaluate(s=>{for(const k of Object.keys(localStorage))if(k.endsWith('-skin'))localStorage.setItem(k,s)},skin)}
  const o=await p.evaluate(PROBE[g]);
  const dom=await p.evaluate(()=>[...document.querySelectorAll('img,svg')].map(e=>e.outerHTML.length+':'+(e.getAttribute('src')||'').slice(0,0)).length);
  o.__allSvgSrcSet=[...await p.evaluate(()=>[...window.__srcs].sort())].join('\n');
  o.__errors=errs.join('|');o.__domImgSvgCount=dom;
  res[port]=o;await ctx.close();
 }
 const keys=new Set([...Object.keys(res[+(process.env.OLD||8101)]),...Object.keys(res[+(process.env.NEW||8102)])]);let bad=[];
 for(const k of keys)if(JSON.stringify(res[+(process.env.OLD||8101)][k])!==JSON.stringify(res[+(process.env.NEW||8102)][k]))bad.push(k);
 console.log(g.padEnd(13),bad.length?'DIFF: '+bad.join(','):'SAME', `(${keys.size} 항목, svg소스 ${res[+(process.env.NEW||8102)].__allSvgSrcSet.split('\n').length}개, 오류: ${res[+(process.env.NEW||8102)].__errors||'없음'})`);
 if(bad.length)allok=false;
}
await b.close();console.log(allok?'ALL SAME':'HAS DIFF')})();
