'use strict';
// 2026 race-driver lineup, checked against F1DB season entrants.
// Merge order is a game progression, not championship standings.
const drivers = [
 ['Arvid Lindblad','lindblad','#8eabdf'],['Gabriel Bortoleto','bortoleto','#ed343c'],
 ['Franco Colapinto','colapinto','#ed8ac0'],['Oliver Bearman','bearman','#dce0e3'],
 ['Liam Lawson','lawson','#8eabdf'],['Isack Hadjar','hadjar','#6583ed'],
 ['Lance Stroll','stroll','#46b6a3'],['Esteban Ocon','ocon','#dce0e3'],
 ['Nico Hülkenberg','hulkenberg','#ed343c'],['Valtteri Bottas','bottas','#c2b8a5'],
 ['Sergio Pérez','perez','#c2b8a5'],['Alex Albon','albon','#5aa6ed'],
 ['Pierre Gasly','gasly','#ed8ac0'],['Carlos Sainz','sainz','#5aa6ed'],
 ['Fernando Alonso','alonso','#46b6a3'],['Kimi Antonelli','antonelli','#64ded0'],
 ['George Russell','russell','#64ded0'],['Oscar Piastri','piastri','#ffa540'],
 ['Charles Leclerc','leclerc','#ff6662'],['Lando Norris','norris','#ffa540'],
 ['Lewis Hamilton','hamilton','#ee4a43'],['Max Verstappen','verstappen','#6583ed']
].map(([name,slug,color],i)=>({name,slug,color,r:36.1+i*(106.4/21),points:2**(i+1),image:new Image()}));
// Prefer the newest available portrait, with older official photos as fallbacks.
function photoSources(d){if(d.slug==='lindblad')return ['assets/arvid-lindblad.webp'];return [2026,2025,2024].flatMap(year=>['png','jpg'].map(ext=>`https://media.formula1.com/content/dam/fom-website/drivers/${year}Drivers/${d.slug}.${ext}`));}
function loadPortrait(img,d,onMissing=()=>{}){const sources=photoSources(d);let index=0;img.onerror=()=>{if(index<sources.length)img.src=sources[index++];else{img.onerror=null;onMissing();}};img.onerror();}
for(const d of drivers)loadPortrait(d.image,d);
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
let W=440;
let balls=[],score=0,best=0,next=0,aim=220,lastDrop=-Infinity,over=false,clock=0,accumulator=0,lastTime=0;
try{best=Number(localStorage.getItem('grid-merge-best'))||0;}catch{}
$('best').textContent=best;
function portrait(d){const el=document.createElement('div');el.className='portrait';el.style.setProperty('--c',d.color);const img=document.createElement('img');img.className='face';img.alt=d.name;loadPortrait(img,d,()=>{img.remove();el.textContent=d.name.split(' ').map(w=>w[0]).join('');el.style.color=d.color;});el.append(img);return el;}
document.querySelector('.ladder-heading>span:last-child').textContent=`01—${drivers.length}`;
for(const [i,d] of drivers.entries()){const row=document.createElement('div');row.className='driver-row';const num=document.createElement('span');num.className='num';num.textContent=String(i+1).padStart(2,'0');row.append(num,portrait(d));const name=document.createElement('span');name.className='name';name.textContent=d.name;const pts=document.createElement('span');pts.className='pts';pts.textContent=d.points;row.append(name,pts);$('drivers').append(row);}
function choose(){next=Math.floor(Math.random()*4);$('next-face').replaceChildren(portrait(drivers[next]));$('next-face').firstChild.style.cssText+=';width:100%;height:100%';$('next-name').textContent=drivers[next].name;}
function updateScore(){ $('score').textContent=String(score).padStart(4,'0');if(score>best){best=score;$('best').textContent=best;try{localStorage.setItem('grid-merge-best',best);}catch{}}}
function reset(){balls=[];score=0;over=false;clock=0;lastDrop=-Infinity;$('overlay').hidden=true;$('status').textContent='DROP TO START';updateScore();choose();}
function drop(){if(over||clock-lastDrop<.5)return;const r=drivers[next].r;balls.push({x:Math.max(r,Math.min(W-r,aim)),y:78,r,vx:0,vy:0,level:next,born:clock,danger:0});lastDrop=clock;choose();$('status').textContent='RACE IN PROGRESS';}
function step(dt){clock+=dt;for(const b of balls){b.vy+=700*dt;b.vx*=.998;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*.3;}if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx)*.3;}if(b.y>560-b.r){b.y=560-b.r;b.vy=b.vy>25?-b.vy*.15:0;b.vx*=.95;}}
 for(let pass=0;pass<5;pass++)for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j];let dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),min=a.r+b.r;if(dist>=min)continue;if(a.level===b.level&&a.level<drivers.length-1){const level=a.level+1;const merged={x:(a.x+b.x)/2,y:(a.y+b.y)/2,r:drivers[level].r,vx:(a.vx+b.vx)/2,vy:Math.min(0,(a.vy+b.vy)/2),level,born:clock,danger:0};balls.splice(j,1);balls.splice(i,1,merged);score+=drivers[level].points;updateScore();break;}if(dist<.001){dx=.01;dy=1;dist=Math.hypot(dx,dy);}const nx=dx/dist,ny=dy/dist,overlap=min-dist;const wa=b.r*b.r/(a.r*a.r+b.r*b.r),wb=1-wa;a.x-=nx*overlap*wa;a.y-=ny*overlap*wa;b.x+=nx*overlap*wb;b.y+=ny*overlap*wb;const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){a.vx+=rel*nx*wa*1.1;a.vy+=rel*ny*wa*1.1;b.vx-=rel*nx*wb*1.1;b.vy-=rel*ny*wb*1.1;}}
 for(const b of balls){b.x=Math.max(b.r,Math.min(W-b.r,b.x));b.y=Math.min(560-b.r,b.y);if(clock-b.born>1.4&&b.y-b.r<156)b.danger+=dt;else b.danger=0;if(b.danger>1.8){over=true;$('overlay').hidden=false;$('final-score').textContent=`You scored ${score} points. One more race?`;$('status').textContent='SESSION FINISHED';}}
}
function face(d,x,y,r,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor='#0006';ctx.shadowBlur=10;ctx.fillStyle=d.color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(x,y,r-3,0,Math.PI*2);ctx.clip();ctx.fillStyle='#303941';ctx.fillRect(x-r,y-r,r*2,r*2);if(d.image.complete&&d.image.naturalWidth){const im=d.image;const side=Math.min(im.naturalWidth,im.naturalHeight);ctx.drawImage(im,(im.naturalWidth-side)/2,0,side,side,x-r,y-r,r*2,r*2);}else{ctx.fillStyle=d.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${r*.6}px sans-serif`;ctx.fillText(d.name.split(' ').map(w=>w[0]).join(''),x,y);}ctx.restore();}
function render(t){const delta=Math.min((t-lastTime)/1000,.05);lastTime=t;if(!over){accumulator+=delta;while(accumulator>=1/120){step(1/120);accumulator-=1/120;}}ctx.clearRect(0,0,W,560);ctx.strokeStyle=balls.some(b=>b.danger>0)?'#ff493b':'#66707755';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(12,156);ctx.lineTo(W-12,156);ctx.stroke();ctx.setLineDash([]);if(!over){const x=Math.max(drivers[next].r,Math.min(W-drivers[next].r,aim));ctx.strokeStyle='#ffffff15';ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(x,48);ctx.lineTo(x,550);ctx.stroke();ctx.setLineDash([]);face(drivers[next],x,76,drivers[next].r,.55);ctx.fillStyle='#9aa2a8';ctx.font='14px sans-serif';ctx.textAlign='right';ctx.fillText('KEEP BELOW THE LINE',W-15,146);}for(const b of balls)face(drivers[b.level],b.x,b.y,b.r);if(!balls.length&&!over){ctx.textAlign='center';ctx.fillStyle='#717c83';ctx.font='20px sans-serif';ctx.fillText('Your grid starts here.',W/2,325);ctx.font='14px sans-serif';ctx.fillText('MOVE TO AIM · CLICK TO DROP',W/2,355);}requestAnimationFrame(render);}
canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();aim=(e.clientX-rect.left)*W/rect.width;});canvas.addEventListener('pointerdown',e=>{e.preventDefault();const rect=canvas.getBoundingClientRect();aim=(e.clientX-rect.left)*W/rect.width;canvas.focus();drop();});canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')aim=Math.max(drivers[next].r,aim-18);else if(e.key==='ArrowRight')aim=Math.min(W-drivers[next].r,aim+18);else if(!e.repeat)drop();}});
$('restart').onclick=reset;$('again').onclick=reset;reset();requestAnimationFrame(render);

// Match the physics width to the visible board so faces stay round in wide mode.
function resizeBoard(){
 const rect=canvas.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const oldWidth=W;
 W=Math.max(160,Math.round(rect.width/rect.height*560));
 canvas.width=W;
 aim=aim/oldWidth*W;
 for(const b of balls){b.x=Math.max(b.r,Math.min(W-b.r,b.x/oldWidth*W));}
}
new ResizeObserver(resizeBoard).observe(canvas);
resizeBoard();
