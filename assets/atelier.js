/* Immersive Canvas study — sculptural light, not a line network.
   Pure offline Canvas 2D. Decoupled from actual agent runtime. */
(() => {
  const canvas = document.querySelector('#signalCanvas');
  const frame = document.querySelector('#fieldFrame');
  if (!canvas || !frame) return;
  const ctx = canvas.getContext('2d', {alpha:true, desynchronized:true});
  if (!ctx) return;
  document.documentElement.classList.add('has-energy-scene');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, raf = 0, visible = true, last = 0, elapsed = 0;
  const pointer = { x: 0, y: 0, aimX: 0, aimY: 0 };
  const palettes = {
    idle: [180,247,128], think: [255,193,113],
    listen: [128,235,210], act: [246,210,113]
  };
  let state = frame.dataset.state || 'idle';
  const rand = (seed) => {
    let n = seed >>> 0;
    return () => ((n = (Math.imul(n, 1664525) + 1013904223) >>> 0) / 4294967296);
  };
  const random = rand(12049);
  const dust = Array.from({length:100}, () => ({
    a:random() * Math.PI * 2, radius:.12 + random() * .92,
    phase:random()*6.28, size:.65+random()*1.35, speed:.2+random()*.8
  }));
  const rgba = (c,a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const pause = () => reduced.matches || document.documentElement.classList.contains('motion-paused');

  function resize() {
    const box = frame.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;
    width = box.width; height = box.height;
    const pixelRatio = Math.min(devicePixelRatio || 1,1.5, 1600/Math.max(width,height));
    canvas.width = Math.max(1,Math.round(width * pixelRatio));
    canvas.height = Math.max(1,Math.round(height * pixelRatio));
    ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    draw(elapsed);
  }

  function strand(cx,cy,size,time,band,c,power) {
    const off = band * .96 + time * power;
    const wave = (p) => {
      const spin = off + p*3.1 + Math.sin(p*2.6+off)*.30;
      const shell = (.55 + .38*Math.cos(p*2.2)) * size;
      return [
        cx + Math.cos(spin)*shell*.72 + Math.sin(time*.6+band)*size*.018,
        cy + p*size*.66 + Math.sin(spin)*size*.105
      ];
    };
    // Layered translucent fibres make a single luminous ribbon with real depth.
    for (const layer of [20,8,2.1]) {
      ctx.beginPath();
      for(let j=0;j<=64;j++) {
        const p=-1+j/32;
        const pt=wave(p);
        if(j===0) ctx.moveTo(pt[0],pt[1]); else ctx.lineTo(pt[0],pt[1]);
      }
      ctx.lineCap='round';ctx.lineJoin='round';
      ctx.lineWidth=layer*(size/270);
      ctx.strokeStyle=rgba(c,layer===20?.026:layer===8?.14:.69);
      ctx.shadowColor=rgba(c,layer===2.1?.7:.18);
      ctx.shadowBlur=layer===20?22:layer===8?14:5;
      ctx.stroke();
    }
    ctx.shadowBlur=0;
  }

  function draw(time) {
    if(!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const c=palettes[state]||palettes.idle;
    const size=Math.min(width*.49,height*.52,355);
    const onPhone=width<650;
    const cx=width*(onPhone?.66:.73)+pointer.x*size*.055;
    const cy=height*(onPhone?.68:.52)+pointer.y*size*.045;
    const rate={idle:.17,think:.47,listen:.29,act:.58}[state]||.17;
    const t=time*.001;

    // Broad fog volumes and a suspended core. This is deliberately not a wireframe.
    ctx.save();
    ctx.globalCompositeOperation='screen';
    const aura=ctx.createRadialGradient(cx,cy,0,cx,cy,size*1.28);
    aura.addColorStop(0,rgba(c,.15));
    aura.addColorStop(.38,rgba(c,.095));
    aura.addColorStop(.70,rgba(c,.018));
    aura.addColorStop(1,rgba(c,0));
    ctx.fillStyle=aura;ctx.fillRect(cx-size*1.3,cy-size*1.3,size*2.6,size*2.6);

    // Floating concentric rings, tilted in perspective.
    const breathe=1+.024*Math.sin(t*1.1);
    for(let j=0;j<5;j++){
      ctx.beginPath();
      ctx.ellipse(cx,cy,size*(.36+j*.14)*breathe,size*(.13+j*.045),-.24+t*.016,0,Math.PI*2);
      ctx.strokeStyle=rgba(c,.105-j*.014);
      ctx.lineWidth=j===0?1.6:1;
      ctx.stroke();
    }

    // Six intertwined ribbons of diffused neon glass, not random connecting lines.
    for(let band=0;band<6;band++)
      strand(cx,cy,size,t,band,c,rate*(band%2?1:-1));

    // The central light column has a soft sculpted shape and tapered edges.
    const shaft=ctx.createLinearGradient(cx-size*.18,0,cx+size*.18,0);
    shaft.addColorStop(0,rgba(c,0));
    shaft.addColorStop(.38,rgba(c,.012));
    shaft.addColorStop(.5,rgba(c,.115));
    shaft.addColorStop(.62,rgba(c,.012));
    shaft.addColorStop(1,rgba(c,0));
    ctx.fillStyle=shaft;
    ctx.beginPath();
    ctx.moveTo(cx-size*.025,cy-size*.7);
    ctx.bezierCurveTo(cx-size*.22,cy-size*.14,cx-size*.16,cy+size*.45,cx,cy+size*.8);
    ctx.bezierCurveTo(cx+size*.16,cy+size*.45,cx+size*.22,cy-size*.14,cx+size*.025,cy-size*.7);
    ctx.fill();

    // A luminous focal lens with differentiated behaviour for each state.
    const focus=ctx.createRadialGradient(cx,cy,1,cx,cy,size*.24);
    focus.addColorStop(0,'rgba(255,255,235,.94)');
    focus.addColorStop(.035,rgba(c,.8));
    focus.addColorStop(.2,rgba(c,.22));
    focus.addColorStop(1,rgba(c,0));
    ctx.fillStyle=focus;ctx.beginPath();ctx.arc(cx,cy,size*.24,0,Math.PI*2);ctx.fill();

    // State changes actually alter the entire scene, not merely its label.
    if(state==='listen') {
      for(let j=0;j<4;j++){
        const r=size*(.14+j*.15)+(Math.sin(t*1.7-j)*size*.02);
        ctx.beginPath();ctx.ellipse(cx,cy,r,r*.5,0,0,Math.PI*2);
        ctx.strokeStyle=rgba(c,.21-j*.038);ctx.lineWidth=2;ctx.stroke();
      }
    } else if(state==='think') {
      for(let j=0;j<4;j++){
        ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.16+j*.75);
        ctx.beginPath();ctx.ellipse(0,0,size*(.45+j*.11),size*.18,0,-1.2,1.55);
        ctx.strokeStyle=rgba(c,.42-j*.06);ctx.lineWidth=1.6;ctx.shadowColor=rgba(c,.4);ctx.shadowBlur=12;ctx.stroke();ctx.restore();
      }
      ctx.shadowBlur=0;
    } else if(state==='act') {
      for(let i=0;i<12;i++){
        const a=t*.9+i*Math.PI/6;
        const x=cx+Math.cos(a)*size*.54,y=cy+Math.sin(a)*size*.32;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*size*.075,y+Math.sin(a)*size*.065);
        ctx.strokeStyle=rgba(c,.41);ctx.lineWidth=1.7;ctx.stroke();
      }
    }

    // Micro particles with orbit trails. Capped for mobile performance.
    const max=onPhone?46:dust.length;
    for(let i=0;i<max;i++){
      const p=dust[i],a=p.a+t*p.speed*.12;
      const rr=size*(.25+p.radius*.88);
      const x=cx+Math.cos(a)*rr*.92,y=cy+Math.sin(a)*rr*.56+p.radius*size*.04*Math.sin(t*.7+p.phase);
      const opacity=clamp(.09+(.5+.5*Math.sin(t*1.1+p.phase))*.43,.08,.62);
      ctx.fillStyle=rgba(c,opacity);
      ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fill();
      if(i%9===0){
        ctx.strokeStyle=rgba(c,opacity*.25);
        ctx.beginPath();ctx.arc(x,y,4+p.size*2,0,Math.PI*2);ctx.stroke();
      }
    }

    // Base projector: diffused ellipse and concentric landing glow.
    const gy=cy+size*.82;
    const ground=ctx.createRadialGradient(cx,gy,0,cx,gy,size*.9);
    ground.addColorStop(0,rgba(c,.17));ground.addColorStop(.45,rgba(c,.045));ground.addColorStop(1,rgba(c,0));
    ctx.save();ctx.translate(cx,gy);ctx.scale(1,.28);
    ctx.fillStyle=ground;ctx.beginPath();ctx.arc(0,0,size*.9,0,Math.PI*2);ctx.fill();ctx.restore();
    for(let j=0;j<4;j++){
      ctx.beginPath();ctx.ellipse(cx,gy,size*(.17+j*.19),size*(.027+j*.029),0,0,Math.PI*2);
      ctx.strokeStyle=rgba(c,.18-j*.035);ctx.lineWidth=1;ctx.stroke();
    }
    ctx.restore();
  }

  function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}}
  function step(now){
    raf=0;
    if(document.hidden||!visible||pause())return;
    if(now-last>32){
      const delta=last?Math.min(now-last,80):0;
      elapsed+=delta;
      pointer.x+=(pointer.aimX-pointer.x)*.07;
      pointer.y+=(pointer.aimY-pointer.y)*.07;
      draw(elapsed);last=now;
    }
    raf=requestAnimationFrame(step);
  }
  function sync(){
    stop();
    if(pause()||document.hidden||!visible){draw(elapsed);return;}
    last=0;raf=requestAnimationFrame(step);
  }
  frame.addEventListener('pointermove', e => {
    if(e.pointerType==='touch'||pause())return;
    const box=frame.getBoundingClientRect();
    pointer.aimX=clamp((e.clientX-box.left)/box.width-.5,-.5,.5);
    pointer.aimY=clamp((e.clientY-box.top)/box.height-.5,-.5,.5);
  },{passive:true});
  frame.addEventListener('pointerleave',()=>{pointer.aimX=0;pointer.aimY=0});
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('localagent:motion-change',sync);
  reduced.addEventListener('change',sync);
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{
      visible=!!entry?.isIntersecting;sync();
    },{threshold:0}).observe(frame);
  }
  new MutationObserver(()=>{
    const next=frame.dataset.state||'idle';
    if(next!==state){state=next;draw(elapsed);sync();}
  }).observe(frame,{attributes:true,attributeFilter:['data-state']});
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(frame);
  else window.addEventListener('resize',resize);
  resize();sync();
})();
