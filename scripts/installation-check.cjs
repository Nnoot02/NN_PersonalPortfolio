// Run after pnpm build: pnpm test:installation. Requires Playwright Chromium.
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const shots=path.join(root,'test-results','installation');
fs.mkdirSync(shots,{recursive:true});
(async()=>{
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const base=path.join(root,'out',name);
  const file=[base,base+'.html',path.join(base,'index.html')].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile());
  if(!file){res.writeHead(404).end();return;}
  const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {}),args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
 try{
  for(const spec of [{name:'desktop',width:1440},{name:'mobile',width:390,touch:true},{name:'boundary-760',width:760},{name:'boundary-761',width:761},{name:'tablet',width:820},{name:'small-desktop',width:1024},{name:'no-js',width:1440,js:false},{name:'no-js-mobile',width:390,js:false,touch:true},{name:'print',width:1440,print:true}]){
   const ctx=await browser.newContext({viewport:{width:spec.width,height:1000},javaScriptEnabled:spec.js!==false,hasTouch:!!spec.touch,isMobile:!!spec.touch});
   await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
   const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/projects/lv-cabling-design-commercial-complex',{waitUntil:'networkidle'});
   const installation=page.locator('.lv-view-panel[data-view="installation"]');
   assert.equal(await installation.isVisible(),false);
   await page.locator('label.lv-view-tab').filter({hasText:'Installation'}).click();
   assert.equal(await installation.isVisible(),true);
   assert.equal(await page.locator('.lv-view-panel[data-view="one-line"]').isVisible(),false);
   if(spec.print) {
    await page.emulateMedia({media:'print'});
    assert.equal(await installation.locator('.lv-install-detail').isVisible(),false,'print must not duplicate the drawing');
   }
   const labels=installation.locator('svg text');
   assert.equal(await labels.count(),41);
   for(const label of await labels.all()) assert.equal(await label.isVisible(),true);
   assert.equal(await installation.locator('.reveal,.legend-detail').count(),0,'spatial information must not depend on hover');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.deepEqual(errors,[]);
   await page.locator('.lv-views').screenshot({path:shots+'/installation-'+spec.name+'.png'});
   if(spec.name==='desktop'){
    await installation.locator('svg').screenshot({path:shots+'/installation-final.png'});
    const findings=await installation.locator('svg').evaluate(svg=>{
     const texts=[...svg.querySelectorAll('text')].map(e=>({t:e.textContent,b:e.getBBox()}));
     const clipped=texts.filter(({b})=>b.x<0||b.y<0||b.x+b.width>1200||b.y+b.height>800).map(x=>x.t);
     const overlaps=[];
     for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
      const a=texts[i].b,b=texts[j].b;
      if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)overlaps.push([texts[i].t,texts[j].t]);
     }
     return {clipped,overlaps};
    });
    assert.deepEqual(findings,{clipped:[],overlaps:[]});
    console.log('Label geometry:',JSON.stringify(findings));
    const routes=await installation.locator('svg').evaluate(svg=>{
     const pointList=e=>e.getAttribute('points').trim().split(/\s+/).map(p=>p.split(',').map(Number));
     const equal=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<.15;
     return [...svg.querySelectorAll('[data-route]')].map(g=>{
      const lines=[...g.querySelectorAll('polyline')],points=lines.map(pointList);
      const faces=[g.nextElementSibling,g.nextElementSibling.nextElementSibling,g.nextElementSibling.nextElementSibling.nextElementSibling];
      const front=pointList(faces[2]);const terminal=[(front[0][0]+front[1][0])/2,(front[0][1]+front[1][1])/2];
      const name=g.getAttribute('data-route');
      const label=[...svg.querySelectorAll('text')].find(t=>t.textContent===name+'-DB').getBBox();
      const clear=faces.every(f=>{const b=f.getBBox();return label.x>=b.x+b.width||label.x+label.width<=b.x||label.y>=b.y+b.height||label.y+label.height<=b.y});
      return {name,continuous:points.length===3&&equal(points[0].at(-1),points[1][0])&&equal(points[1].at(-1),points[2][0]),terminatesAtBoard:equal(points[2].at(-1),terminal),hiddenMiddle:lines[1].getAttribute('stroke-dasharray')==='6 5',labelClear:clear};
     });
    });
    assert.equal(routes.length,3);
    for(const r of routes)assert.ok(r.continuous&&r.terminatesAtBoard&&r.hiddenMiddle&&r.labelClear,JSON.stringify(r));
    console.log('Physical routes and label containment:',JSON.stringify(routes));
   }
   if(!spec.print){
    const detail=installation.locator('.lv-install-detail');
    assert.equal(await detail.isVisible(),true,spec.name+': full-size detail must be available');
    await detail.locator('summary').click();
    const pan=detail.locator('.lv-install-pan');
    await pan.focus();
    assert.equal(await pan.evaluate(e=>document.activeElement===e),true);
    const geometry=await pan.evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,img:e.querySelector('img').getBoundingClientRect().width}));
    assert.equal(geometry.img,1440);assert.ok(geometry.scroll>geometry.client);
    const minimum=await labels.evaluateAll(nodes=>Math.min(...nodes.map(e=>Number(e.getAttribute('font-size')))));
    assert.ok(minimum*geometry.img/1200>=12,'detail labels must render at least 12px');
    await pan.press('ArrowRight');
    let moved=false;
    for(let attempt=0;attempt<30;attempt++){
     if(await pan.evaluate(e=>e.scrollLeft>0)){moved=true;break;}
     await new Promise(resolve=>setTimeout(resolve,100));
    }
    assert.ok(moved,'ArrowRight must pan the focused detail region');
    await pan.evaluate(e=>{e.scrollLeft=650;e.scrollTop=340;});
    if(spec.js===false){
     await pan.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
     await page.screenshot({path:shots+'/audit-fix-detail-'+spec.name+'.png'});
    }else await pan.screenshot({path:shots+'/audit-fix-detail-'+spec.name+'.png'});
    console.log(spec.name+': full-size detail, minimum 12px labels, focus and keyboard pan PASS');
   }
   console.log(spec.name+': view switch, labels, overflow, console PASS');
   await ctx.close();
  }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
