'use strict';
const el=id=>document.getElementById(id), num=id=>+el(id).value;
const fmt=(v,n=2)=>v.toLocaleString('id-ID',{minimumFractionDigits:n,maximumFractionDigits:n});
const controls=[['a','Amplitudo','m',.05,.4,.01,.2],['f','Frekuensi','Hz',.5,3,.1,1],['w','Panjang gelombang','m',1.5,5,.1,3],['x','Posisi pelacak x₀','m',0,10,.1,4]];
el('sliders').innerHTML=controls.map(([id,title,unit,min,max,step,value])=>'<label class="control">'+title+' <output id="v'+id+'"></output><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"></label>').join('');
let time=0,playing=false,recording=false,previous=null,frame=0,nextSample=0;
const samples=[];
function position(x,t){
 const d=num('a')*Math.sin(2*Math.PI*(num('f')*t-x/num('w'))), trans=el('mode').value==='t';
 const xNow=x+(trans?0:d);
 return {px:60+60*xNow,py:150-(trans?175*d:0),d,xNow};
}
const line=(x,y,X,Y,color,extra='')=>'<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+color+'" '+extra+'/>';
const dot=(x,y,r,color,extra='')=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'" '+extra+'/>';
const label=(x,y,s,anchor='middle')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="#30565a" font-family="monospace" font-size="13">'+s+'</text>';
el('ruler').innerHTML=Array.from({length:11},(_,i)=>line(60+i*60,225,60+i*60,231,'#d9f2df')+label(60+i*60,270,i+(i===10?' m':''))).join('');
function draw(){
 const x=num('x'), p=position(x,time), trans=el('mode').value==='t';
 let marks='',path='';
 for(let i=0;i<=200;i++){
  const q=position(i/20,time);
  path+=(i?' L':'M')+q.px.toFixed(2)+' '+q.py.toFixed(2);
  if(i%(trans?10:4)===0)marks+=dot(q.px,q.py,trans?3.5:5,'#148578');
 }
 let svg=(trans?'<path d="'+path+'" fill="none" stroke="#17857d" stroke-width="4"/>':'')+marks;
 const base=60+x*60;
 svg+=line(base,60,base,218,'#6c9391','stroke-dasharray="4 5"')+dot(base,150,5,'white','stroke="#315957"');
 if(el('trail').checked)for(let i=12;i>0;i--){
  const t=time-i/(40*num('f'));if(t<0)continue;
  const q=position(x,t);svg+=dot(q.px,q.py,3.8,'#ef7736','opacity="'+(1-i/16)+'"');
 }
 el('motion').innerHTML=svg+dot(p.px,p.py,13,'none','stroke="#da6125" stroke-width="1.8"')+dot(p.px,p.py,7,'#f1833f','stroke="white" stroke-width="2"');
 el('time').textContent=fmt(time)+' s';el('disp').textContent=fmt(p.d,3)+' m';el('pos').textContent=fmt(p.xNow)+' m';
}
function update(){
 const locked=!!samples.length;
 for(const [id,,unit] of controls){el(id).disabled=locked;el('v'+id).textContent=fmt(num(id))+' '+unit}
 el('mode').disabled=locked;el('theory').textContent='T = '+fmt(1/num('f'))+' s';
 el('play').textContent=playing?'Ⅱ  Jeda':'▶  Mulai gerak';el('record').disabled=locked&&!recording;
 el('record').textContent=recording?'■  Akhiri rekaman':'●  Rekam';el('step').disabled=playing;
 el('status').textContent=playing?(recording?'● Merekam':'Bergerak'):(time?'Dijeda':'Siap diamati');
 el('csv').disabled=!locked;draw();
}
function graph(){
 const len=samples.length,end=Math.max(0,len-1),gx=i=>52+526*i/Math.max(1,end),gy=d=>71-49*d/num('a');
 let svg=line(52,71,578,71,'#b4c5b5','stroke-dasharray="4 5"')+line(52,16,52,126,'#98b4ab')+line(52,126,578,126,'#98b4ab')+label(54,14,'Simpangan (m)','start')+label(45,28,fmt(num('a')),'end')+label(45,122,fmt(-num('a')),'end');
 for(const id of ['ca','cb']){el(id).max=end;el(id).disabled=len<2}
 if(len){
  const path=samples.map((r,i)=>(i?'L':'M')+gx(i).toFixed(1)+' '+gy(r.d).toFixed(1)).join(' ');
  svg+='<path d="'+path+'" stroke="#13796e" stroke-width="2" fill="none"/>'+label(52,145,fmt(samples[0].t)+' s','start')+label(578,145,fmt(samples[end].t)+' s','end');
  for(const [id,color,name] of [['ca','#bd541d','A'],['cb','#674390','B']]){
   const i=num(id);svg+=line(gx(i),20,gx(i),126,color,'stroke-dasharray="3 4"')+dot(gx(i),gy(samples[i].d),4,color)+label(gx(i),15,name);
  }
 }
 el('plot').innerHTML=svg;
 el('delta').textContent=len?'A = '+fmt(samples[num('ca')].t)+' s  ·  B = '+fmt(samples[num('cb')].t)+' s  ·  Δt = '+fmt(Math.abs(samples[num('cb')].t-samples[num('ca')].t))+' s':'Δt = 0,00 s';
}
function recordUntil(t){
 const before=samples.length;
 while(nextSample<=t+1e-8&&samples.length<1501){
  const p=position(num('x'),nextSample);
  samples.push({t:nextSample,x:num('x'),xNow:p.xNow,d:p.d});nextSample+=.02;
 }
 if(samples.length===before)return;
 el('cb').max=samples.length-1;el('cb').value=samples.length-1;
 el('rows').innerHTML=samples.slice(-15).reverse().map(r=>'<tr>'+[r.t,r.x,r.xNow,r.d].map(v=>'<td>'+fmt(v,3)+'</td>').join('')+'</tr>').join('');
 el('message').textContent=samples.length+' sampel · Tabel menampilkan 15 sampel terakhir. CSV memuat seluruh rekaman.';
 graph();
 if(samples.length===1501){recording=false;playing=false;time=samples.at(-1).t;el('message').textContent+=' Batas 30 detik tercapai.';update()}
}
function advance(dt){time+=dt;if(recording)recordUntil(time);draw()}
function tick(now){if(!playing)return;if(previous!==null)advance(Math.min((now-previous)/1000,.1));previous=now;if(playing)frame=requestAnimationFrame(tick)}
function toggle(on){cancelAnimationFrame(frame);playing=on;previous=null;if(on)frame=requestAnimationFrame(tick);update()}
el('play').onclick=()=>toggle(!playing);
el('record').onclick=()=>{if(recording){recording=false;toggle(false);return}stopCamera('Kamera dimatikan saat perekaman dimulai. Data rekaman tetap berasal dari model matematis virtual.');recording=true;nextSample=time;recordUntil(time);toggle(true)};
el('step').onclick=()=>{advance(.05);update()};
el('reset').onclick=()=>{
 if(samples.length&&!confirm('Hapus rekaman dan kembali ke waktu nol? Ekspor CSV dahulu jika masih diperlukan.'))return;
 samples.length=0;time=0;recording=false;toggle(false);el('rows').innerHTML='';
 el('ca').value=el('cb').value=0;el('message').textContent='Tekan Rekam untuk mengambil 50 sampel per detik simulasi.';graph();
};
for(const id of ['mode','a','f','w','x','trail'])el(id).oninput=()=>{update();graph()};
for(const id of ['ca','cb'])el(id).oninput=graph;
function pick(e){
 if(samples.length)return;
 const field=el('field'),point=field.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
 const x=point.matrixTransform(field.getScreenCTM().inverse()).x;
 let best=0,distance=Infinity;
 for(let i=0;i<=100;i++){const dx=Math.abs(position(i/10,time).px-x);if(dx<distance){distance=dx;best=i/10}}
 el('x').value=best;update();
}
el('field').onpointerdown=e=>{el('field').setPointerCapture(e.pointerId);pick(e)};
el('field').onpointermove=e=>{if(el('field').hasPointerCapture(e.pointerId))pick(e)};
el('csv').onclick=()=>{
 const head='mode,A_m,f_Hz,lambda_m,t_s,x0_m,x_m,simpangan_m';
 const body=samples.map(r=>[el('mode').selectedOptions[0].text,num('a'),num('f'),num('w'),r.t.toFixed(4),r.x,r.xNow.toFixed(6),r.d.toFixed(6)].join(','));
 const url=URL.createObjectURL(new Blob(['\uFEFF'+[head,...body].join('\r\n')],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='wavetrack-rekaman.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
let cameraStream=null,cameraFrame=0,lastPixels=null,lastCameraFrame=0,lastCameraX=null;
const video=el('cameraPreview'),canvas=el('motionCanvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
function cameraUi(active,status,message){
 el('cameraStatus').textContent=status;el('cameraStatus').classList.toggle('active',active);
 el('cameraMessage').textContent=message;el('cameraStart').disabled=active||!!samples.length;el('cameraStop').disabled=!active;
}
function stopCamera(message='Kamera dimatikan. Praktikum virtual tetap dapat dijalankan dengan kontrol biasa.'){
 cancelAnimationFrame(cameraFrame);cameraFrame=0;
 if(cameraStream){cameraStream.getTracks().forEach(track=>track.stop());cameraStream=null}
 video.srcObject=null;lastPixels=null;lastCameraX=null;
 cameraUi(false,'Nonaktif',message);
}
function trackMotion(now){
 if(!cameraStream)return;
 if(now-lastCameraFrame>75&&video.readyState>=2){
  lastCameraFrame=now;ctx.drawImage(video,0,0,canvas.width,canvas.height);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  if(lastPixels){
   let weight=0,xWeight=0,count=0;
   for(let y=3;y<canvas.height-3;y+=2)for(let x=3;x<canvas.width-3;x+=2){
    const i=(y*canvas.width+x)*4;
    const current=(pixels[i]*3+pixels[i+1]*6+pixels[i+2])/10;
    const previous=(lastPixels[i]*3+lastPixels[i+1]*6+lastPixels[i+2])/10;
    const difference=Math.abs(current-previous);
    if(difference>32){weight+=difference;xWeight+=x*difference;count++}
   }
   if(count>=7&&weight>0&&!samples.length){
    const center=xWeight/weight;
    const target=Math.max(0,Math.min(10,(1-center/(canvas.width-1))*10));
    const current=num('x'),smoothed=current+(target-current)*.22;
    if(lastCameraX===null||Math.abs(smoothed-lastCameraX)>.035){el('x').value=smoothed.toFixed(2);lastCameraX=smoothed;update()}
   }
  }
  lastPixels=new Uint8ClampedArray(pixels);
 }
 cameraFrame=requestAnimationFrame(trackMotion);
}
el('cameraStart').onclick=async()=>{
 if(!navigator.mediaDevices?.getUserMedia){cameraUi(false,'Tidak tersedia','Kamera memerlukan koneksi aman (HTTPS atau localhost) dan browser yang mendukung akses kamera.');return}
 el('cameraStart').disabled=true;el('cameraMessage').textContent='Menunggu izin kamera dari browser…';
 try{
  cameraStream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480}}});
  video.srcObject=cameraStream;await video.play();lastCameraFrame=0;
  cameraUi(true,'Aktif · lokal','Gerakkan tangan perlahan ke kiri atau kanan untuk menggeser pelacak.');
  cameraFrame=requestAnimationFrame(trackMotion);
 }catch(error){
  stopCamera(error?.name==='NotAllowedError'?'Izin kamera ditolak. Izinkan kamera di pengaturan browser untuk memakai kontrol gerak.':'Kamera tidak dapat dibuka. Periksa sambungan kamera dan izin browser, lalu coba lagi.');
 }
};
el('cameraStop').onclick=()=>stopCamera();
window.addEventListener('pagehide',()=>stopCamera('Kamera berhenti saat halaman ditutup.'));
update();graph();


// Keep the standalone studio theme in sync with the WAVETRACK portal preference.
const themeToggle=el('themeToggle');
function applyTheme(theme){const next=theme==='dark'?'dark':'light';document.documentElement.dataset.theme=next;localStorage.setItem('wavetrack-theme',next);themeToggle.setAttribute('aria-pressed',String(next==='dark'));themeToggle.setAttribute('aria-label',next==='dark'?'Aktifkan mode terang':'Aktifkan mode gelap');themeToggle.innerHTML=(next==='dark'?'☀ <span>Mode terang</span>':'☾ <span>Mode gelap</span>')}
applyTheme(localStorage.getItem('wavetrack-theme')||'light');
themeToggle.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
